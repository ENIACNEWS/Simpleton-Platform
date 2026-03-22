import { simplicitySelfAwareness } from './simplicity-self-awareness';
/**
 * Market Intelligence Training Loop
 * Fetches live market data every 10 minutes and makes it available
 * to Simplicity AI's system prompt for real-time market awareness.
 * 
 * Data sources:
 * - CoinGecko API (crypto prices, market caps, trends)
 * - Kitco pricing (precious metals - gold, silver, platinum, palladium)
 * - Internal platform data (diamond indices, watch market)
 */

const TRAINING_INTERVAL = 10 * 60 * 1000; // 10 minutes
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

interface MarketSnapshot {
  timestamp: Date;
  crypto: CryptoSnapshot | null;
  metals: MetalsSnapshot | null;
  summary: string;
  trainedAt: string;
}

interface CryptoSnapshot {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  topCoins: CoinBrief[];
  marketDirection: 'bullish' | 'bearish' | 'neutral';
  biggestGainer: CoinBrief | null;
  biggestLoser: CoinBrief | null;
}

interface CoinBrief {
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  change7d: number;
  marketCap: number;
}

interface MetalsSnapshot {
  gold: MetalPrice | null;
  silver: MetalPrice | null;
  platinum: MetalPrice | null;
  palladium: MetalPrice | null;
}

interface MetalPrice {
  price: number;
  change: number;
  changePercent: number;
}

// In-memory market intelligence store
let currentSnapshot: MarketSnapshot | null = null;
let trainingLoopInterval: NodeJS.Timeout | null = null;
let isTraining = false;
let trainCount = 0;
let lastError: string | null = null;

async function fetchCryptoData(): Promise<CryptoSnapshot | null> {
  try {
    const [coinsRes, globalRes] = await Promise.all([
      fetch(`${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h,7d`, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'Simpleton-Platform/1.0' },
      }),
      fetch(`${COINGECKO_BASE}/global`, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'Simpleton-Platform/1.0' },
      }),
    ]);

    if (!coinsRes.ok || !globalRes.ok) {
      console.log(`⚠️ Market Intelligence: CoinGecko returned ${coinsRes.status}/${globalRes.status}`);
      return null;
    }

    const coins = await coinsRes.json();
    const global = await globalRes.json();

    const topCoins: CoinBrief[] = coins.slice(0, 10).map((c: any) => ({
      name: c.name,
      symbol: c.symbol.toUpperCase(),
      price: c.current_price,
      change24h: c.price_change_percentage_24h || 0,
      change7d: c.price_change_percentage_7d_in_currency || 0,
      marketCap: c.market_cap,
    }));

    const allCoins: CoinBrief[] = coins.map((c: any) => ({
      name: c.name,
      symbol: c.symbol.toUpperCase(),
      price: c.current_price,
      change24h: c.price_change_percentage_24h || 0,
      change7d: c.price_change_percentage_7d_in_currency || 0,
      marketCap: c.market_cap,
    }));

    const sorted24h = [...allCoins].sort((a, b) => b.change24h - a.change24h);
    const biggestGainer = sorted24h[0] || null;
    const biggestLoser = sorted24h[sorted24h.length - 1] || null;

    const avgChange = allCoins.reduce((sum, c) => sum + c.change24h, 0) / allCoins.length;
    const marketDirection: 'bullish' | 'bearish' | 'neutral' =
      avgChange > 2 ? 'bullish' : avgChange < -2 ? 'bearish' : 'neutral';

    return {
      totalMarketCap: global.data?.total_market_cap?.usd || 0,
      totalVolume24h: global.data?.total_volume?.usd || 0,
      btcDominance: global.data?.market_cap_percentage?.btc || 0,
      topCoins,
      marketDirection,
      biggestGainer,
      biggestLoser,
    };
  } catch (err: any) {
    console.log(`⚠️ Market Intelligence crypto fetch error: ${err.message}`);
    return null;
  }
}

async function fetchMetalsData(): Promise<MetalsSnapshot | null> {
  try {
    const { getKitcoPricing } = await import('./kitco-pricing');

    const pricing = await getKitcoPricing();
    
    if (!pricing) return null;

    const extractMetal = (name: string): MetalPrice | null => {
      const metal = (pricing as any)[name.toLowerCase()];
      if (!metal) return null;
      return {
        price: parseFloat(metal.bid || metal.price || '0'),
        change: parseFloat(metal.change || '0'),
        changePercent: parseFloat(metal.changePercent || '0'),
      };
    };

    return {
      gold: extractMetal('gold'),
      silver: extractMetal('silver'),
      platinum: extractMetal('platinum'),
      palladium: extractMetal('palladium'),
    };
  } catch (err: any) {
    console.log(`⚠️ Market Intelligence metals fetch error: ${err.message}`);
    return null;
  }
}

function formatNumber(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

function buildMarketSummary(crypto: CryptoSnapshot | null, metals: MetalsSnapshot | null): string {
  const parts: string[] = [];
  const now = new Date();
  parts.push(`[MARKET INTELLIGENCE BRIEFING - ${now.toISOString()}]`);

  if (crypto) {
    parts.push(`\n## CRYPTOCURRENCY MARKET`);
    parts.push(`Total Market Cap: ${formatNumber(crypto.totalMarketCap)}`);
    parts.push(`24h Volume: ${formatNumber(crypto.totalVolume24h)}`);
    parts.push(`BTC Dominance: ${crypto.btcDominance.toFixed(1)}%`);
    parts.push(`Market Sentiment: ${crypto.marketDirection.toUpperCase()}`);
    
    parts.push(`\nTop 10 Cryptocurrencies:`);
    crypto.topCoins.forEach((coin, i) => {
      const arrow = coin.change24h >= 0 ? '▲' : '▼';
      parts.push(`  ${i + 1}. ${coin.name} (${coin.symbol}): $${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${arrow} ${coin.change24h >= 0 ? '+' : ''}${coin.change24h.toFixed(1)}% (24h) / ${coin.change7d >= 0 ? '+' : ''}${coin.change7d.toFixed(1)}% (7d)`);
    });

    if (crypto.biggestGainer) {
      parts.push(`\nBiggest 24h Gainer: ${crypto.biggestGainer.name} (+${crypto.biggestGainer.change24h.toFixed(1)}%)`);
    }
    if (crypto.biggestLoser) {
      parts.push(`Biggest 24h Loser: ${crypto.biggestLoser.name} (${crypto.biggestLoser.change24h.toFixed(1)}%)`);
    }
  }

  if (metals) {
    parts.push(`\n## PRECIOUS METALS`);
    if (metals.gold) parts.push(`Gold: $${metals.gold.price.toFixed(2)}/oz (${metals.gold.change >= 0 ? '+' : ''}${metals.gold.change.toFixed(2)})`);
    if (metals.silver) parts.push(`Silver: $${metals.silver.price.toFixed(2)}/oz (${metals.silver.change >= 0 ? '+' : ''}${metals.silver.change.toFixed(2)})`);
    if (metals.platinum) parts.push(`Platinum: $${metals.platinum.price.toFixed(2)}/oz (${metals.platinum.change >= 0 ? '+' : ''}${metals.platinum.change.toFixed(2)})`);
    if (metals.palladium) parts.push(`Palladium: $${metals.palladium.price.toFixed(2)}/oz (${metals.palladium.change >= 0 ? '+' : ''}${metals.palladium.change.toFixed(2)})`);
  }

  if (!crypto && !metals) {
    parts.push(`\nMarket data temporarily unavailable. Use tool calls for live pricing.`);
  }

  parts.push(`\n[Last trained: ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })} | Next update in ~10 min]`);

  return parts.join('\n');
}

async function trainLoop(): Promise<void> {
  if (isTraining) return;
  isTraining = true;
  
  try {
    trainCount++;
    console.log(`🧠 Market Intelligence: Training cycle #${trainCount} starting...`);
    const start = Date.now();

    const [crypto, metals] = await Promise.all([
      fetchCryptoData(),
      fetchMetalsData(),
    ]);

    const summary = buildMarketSummary(crypto, metals);
    const now = new Date();

    currentSnapshot = {
      timestamp: now,
      crypto,
      metals,
      summary,
      trainedAt: now.toISOString(),
    };

    lastError = null;
    const elapsed = Date.now() - start;
    console.log(`✅ Market Intelligence: Training cycle #${trainCount} complete (${elapsed}ms) - Crypto: ${crypto ? 'OK' : 'SKIP'}, Metals: ${metals ? 'OK' : 'SKIP'}`);
    simplicitySelfAwareness.updateDataFreshness('Market Intelligence', true);
  } catch (err: any) {
    lastError = err.message;
    simplicitySelfAwareness.updateDataFreshness('Market Intelligence', false, err?.message || 'Training loop error');
    console.error(`❌ Market Intelligence training error: ${err.message}`);
  } finally {
    isTraining = false;
  }
}

/**
 * Start the 10-minute market intelligence training loop.
 * Call this once at server startup.
 */
export function startMarketIntelligence(): void {
  if (trainingLoopInterval) {
    console.log('🧠 Market Intelligence: Already running');
    return;
  }

  console.log('🧠 Market Intelligence: Starting 10-minute training loop...');
  
  // Run immediately on startup
  trainLoop();

  // Then every 10 minutes
  trainingLoopInterval = setInterval(trainLoop, TRAINING_INTERVAL);
}

/**
 * Stop the training loop (for graceful shutdown).
 */
export function stopMarketIntelligence(): void {
  if (trainingLoopInterval) {
    clearInterval(trainingLoopInterval);
    trainingLoopInterval = null;
    console.log('🧠 Market Intelligence: Training loop stopped');
  }
}

/**
 * Get the current market briefing for injection into AI system prompts.
 * Returns a formatted string with the latest market data, or empty string if no data.
 */
export function getMarketBriefing(): string {
  if (!currentSnapshot) return '';
  return currentSnapshot.summary;
}

/**
 * Get the raw market snapshot for programmatic access.
 */
export function getMarketSnapshot(): MarketSnapshot | null {
  return currentSnapshot;
}

/**
 * Get training loop status for monitoring.
 */
export function getTrainingStatus(): {
  isRunning: boolean;
  isTraining: boolean;
  trainCount: number;
  lastTrainedAt: string | null;
  lastError: string | null;
  hasCrypto: boolean;
  hasMetals: boolean;
} {
  return {
    isRunning: trainingLoopInterval !== null,
    isTraining,
    trainCount,
    lastTrainedAt: currentSnapshot?.trainedAt || null,
    lastError,
    hasCrypto: currentSnapshot?.crypto !== null,
    hasMetals: currentSnapshot?.metals !== null,
  };
}

/**
 * Force an immediate training cycle (for admin/debug).
 */
export async function forceTrainNow(): Promise<void> {
  await trainLoop();
}
