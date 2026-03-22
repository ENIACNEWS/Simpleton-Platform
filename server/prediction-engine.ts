import { storage } from './storage';

interface PredictionParams {
  itemType: string;
  specs?: Record<string, any>;
  horizonDays: 7 | 30 | 90;
}

interface PredictionResult {
  predictedPrice: number;
  confidence: number;
  range: { low: number; high: number };
  features: string[];
  reasoning: string;
  currentPrice: number;
  transactionCount: number;
  trend: string;
  horizonDays: number;
}

export async function generatePrediction(params: PredictionParams): Promise<PredictionResult> {
  const { getKitcoPricing } = await import('./kitco-pricing');
  const prices = await getKitcoPricing();

  const currentPrice = (prices as any)?.[params.itemType] ?? 0;
  if (!currentPrice) {
    throw new Error(`No live pricing available for ${params.itemType}`);
  }

  const transactions = await storage.getMarketTransactions(params.itemType, 365);
  const stats = await storage.getTransactionStats(params.itemType);

  const features: string[] = [];
  let predictedPrice = currentPrice;
  let confidence = 0.5;
  let reasoning = '';

  if (transactions.length >= 10) {
    const prices30d = transactions
      .filter(t => t.createdAt > new Date(Date.now() - 30 * 86400000))
      .map(t => parseFloat(t.actualPrice));
    const prices90d = transactions
      .filter(t => t.createdAt > new Date(Date.now() - 90 * 86400000))
      .map(t => parseFloat(t.actualPrice));

    const avg30 = prices30d.length > 0 ? prices30d.reduce((s, p) => s + p, 0) / prices30d.length : currentPrice;
    const avg90 = prices90d.length > 0 ? prices90d.reduce((s, p) => s + p, 0) / prices90d.length : currentPrice;

    const shortTermTrend = avg30 > 0 && avg90 > 0 ? ((avg30 - avg90) / avg90) : 0;

    const trendMultiplier = params.horizonDays === 7 ? 0.25 : params.horizonDays === 30 ? 1 : 3;
    predictedPrice = currentPrice * (1 + shortTermTrend * trendMultiplier);

    confidence = Math.min(0.95, 0.5 + (transactions.length / 200) + (prices30d.length > 5 ? 0.1 : 0));

    features.push(`${transactions.length} historical transactions`);
    features.push(`30-day trend: ${(shortTermTrend * 100).toFixed(2)}%`);
    features.push(`90-day avg: $${avg90.toFixed(2)}`);
    features.push(`Live spot: $${currentPrice}`);

    reasoning = `Based on ${transactions.length} transactions over the past year. ` +
      `30-day average ($${avg30.toFixed(2)}) ${shortTermTrend > 0 ? 'above' : 'below'} 90-day average ($${avg90.toFixed(2)}) ` +
      `suggests ${shortTermTrend > 0 ? 'upward' : 'downward'} pressure. ` +
      `Projected ${params.horizonDays}-day outlook: $${predictedPrice.toFixed(2)}.`;
  } else {
    confidence = 0.35;
    features.push('Limited transaction data');
    features.push(`Live spot: $${currentPrice}`);
    reasoning = `Only ${transactions.length} transactions available — prediction is primarily spot-based. ` +
      `More transaction data will improve accuracy significantly.`;
  }

  const volatility = stats.count > 5 && stats.maxPrice > 0
    ? (stats.maxPrice - stats.minPrice) / stats.avgPrice
    : 0.05;

  const range = {
    low: predictedPrice * (1 - volatility * 0.5),
    high: predictedPrice * (1 + volatility * 0.5),
  };

  const trend = predictedPrice > currentPrice ? `+${((predictedPrice / currentPrice - 1) * 100).toFixed(2)}%`
    : predictedPrice < currentPrice ? `${((predictedPrice / currentPrice - 1) * 100).toFixed(2)}%`
    : 'flat';

  const targetDate = new Date(Date.now() + params.horizonDays * 86400000);
  await storage.createPrediction({
    itemType: params.itemType,
    itemSpecs: params.specs || null,
    predictedPrice: predictedPrice.toFixed(2),
    confidenceScore: confidence.toFixed(2),
    predictionDate: new Date(),
    targetDate,
    modelVersion: 'memory-engine-v1',
    featuresUsed: features,
    reasoning,
  });

  return {
    predictedPrice: Math.round(predictedPrice * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    range: {
      low: Math.round(range.low * 100) / 100,
      high: Math.round(range.high * 100) / 100,
    },
    features,
    reasoning,
    currentPrice,
    transactionCount: transactions.length,
    trend,
    horizonDays: params.horizonDays,
  };
}

export async function validatePredictions(): Promise<{ validated: number; avgAccuracy: number }> {
  const pending = await storage.getPendingPredictions();
  let validated = 0;
  let totalAccuracy = 0;

  for (const pred of pending) {
    const transactions = await storage.getMarketTransactions(pred.itemType, 7);
    const recentPrices = transactions
      .filter(t => t.createdAt >= new Date(pred.targetDate!.getTime() - 7 * 86400000))
      .map(t => parseFloat(t.actualPrice));

    if (recentPrices.length > 0) {
      const avgActual = recentPrices.reduce((s, p) => s + p, 0) / recentPrices.length;
      const accuracy = 1 - Math.abs(avgActual - parseFloat(pred.predictedPrice)) / avgActual;
      const clampedAccuracy = Math.max(0, Math.min(1, accuracy));

      await storage.updatePrediction(pred.id, {
        actualPrice: avgActual.toFixed(2),
        accuracy: clampedAccuracy.toFixed(4),
      });

      validated++;
      totalAccuracy += clampedAccuracy;
    }
  }

  return {
    validated,
    avgAccuracy: validated > 0 ? totalAccuracy / validated : 0,
  };
}
