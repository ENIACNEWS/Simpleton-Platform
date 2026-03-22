import { storage } from './storage';

interface IndexData {
  assetType: string;
  date: string;
  spot: number;
  simpletonIndex: number;
  premium: number;
  volume: number;
  participants: number;
  trend: string;
  confidence: string;
  dataPoints: number;
}

const SUPPORTED_ASSETS = ['gold', 'silver', 'platinum', 'palladium'];

export async function computeSimpletonIndex(assetType: string): Promise<IndexData> {
  if (!SUPPORTED_ASSETS.includes(assetType)) {
    throw new Error(`Unsupported asset: ${assetType}. Supported: ${SUPPORTED_ASSETS.join(', ')}`);
  }

  const { getKitcoPricing } = await import('./kitco-pricing');
  const prices = await getKitcoPricing();
  const spotPrice = (prices as any)?.[assetType] ?? 0;

  if (!spotPrice) {
    throw new Error(`No live spot price available for ${assetType}`);
  }

  const transactions7d = await storage.getMarketTransactions(assetType, 7);
  const transactions30d = await storage.getMarketTransactions(assetType, 30);

  const txPrices7d = transactions7d.map(t => parseFloat(t.actualPrice));
  const txPrices30d = transactions30d.map(t => parseFloat(t.actualPrice));

  let simpletonPrice: number;
  let confidence: string;

  if (txPrices7d.length >= 5) {
    const txAvg = txPrices7d.reduce((s, p) => s + p, 0) / txPrices7d.length;
    const weight = Math.min(0.5, txPrices7d.length / 20);
    simpletonPrice = spotPrice * (1 - weight) + txAvg * weight;
    confidence = txPrices7d.length >= 20 ? 'high' : 'medium';
  } else if (txPrices30d.length >= 3) {
    const txAvg = txPrices30d.reduce((s, p) => s + p, 0) / txPrices30d.length;
    const weight = Math.min(0.3, txPrices30d.length / 30);
    simpletonPrice = spotPrice * (1 - weight) + txAvg * weight;
    confidence = 'low';
  } else {
    simpletonPrice = spotPrice;
    confidence = 'spot-only';
  }

  const premium = simpletonPrice - spotPrice;

  const uniqueUsers = new Set(transactions7d.map(t => t.userId || t.dealerId).filter(Boolean));

  let trend = '0.00%';
  if (txPrices30d.length >= 5) {
    const recentHalf = txPrices30d.slice(0, Math.ceil(txPrices30d.length / 2));
    const olderHalf = txPrices30d.slice(Math.ceil(txPrices30d.length / 2));
    const recentAvg = recentHalf.reduce((s, p) => s + p, 0) / recentHalf.length;
    const olderAvg = olderHalf.reduce((s, p) => s + p, 0) / olderHalf.length;
    const pctChange = ((recentAvg - olderAvg) / olderAvg) * 100;
    trend = `${pctChange >= 0 ? '+' : ''}${pctChange.toFixed(2)}%`;
  }

  await storage.createIndexEntry({
    assetType,
    indexDate: new Date(),
    spotPrice: spotPrice.toFixed(2),
    simpletonPrice: simpletonPrice.toFixed(2),
    premium: premium.toFixed(2),
    transactionCount: transactions7d.length,
    participantCount: uniqueUsers.size,
    trend,
  });

  return {
    assetType,
    date: new Date().toISOString().split('T')[0],
    spot: Math.round(spotPrice * 100) / 100,
    simpletonIndex: Math.round(simpletonPrice * 100) / 100,
    premium: Math.round(premium * 100) / 100,
    volume: transactions7d.length,
    participants: uniqueUsers.size,
    trend,
    confidence,
    dataPoints: txPrices30d.length,
  };
}

export async function getAllIndices(): Promise<IndexData[]> {
  const results: IndexData[] = [];
  for (const asset of SUPPORTED_ASSETS) {
    try {
      results.push(await computeSimpletonIndex(asset));
    } catch (e) {
      console.warn(`Index computation failed for ${asset}:`, (e as Error).message);
    }
  }
  return results;
}

export function startIndexUpdater() {
  console.log('📊 Simpleton Index: Computing every 15 minutes');

  setTimeout(async () => {
    try {
      const indices = await getAllIndices();
      console.log(`📊 Simpleton Index: Computed ${indices.length} indices`);
    } catch (e) {
      console.warn('Simpleton Index initial computation failed:', (e as Error).message);
    }
  }, 60000);

  setInterval(async () => {
    try {
      await getAllIndices();
    } catch (e) {
      console.warn('Simpleton Index update failed:', (e as Error).message);
    }
  }, 15 * 60 * 1000);
}
