interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  change7d?: number;
  high52w: number;
  low52w: number;
  volume: number;
  marketCap?: number;
  sector?: string;
  type: 'metal' | 'stock' | 'crypto' | 'ai';
  advisory: 'FAVORABLE' | 'NEUTRAL' | 'CAUTIOUS';
  advisoryNote: string;
  lastUpdated: string;
}

interface TickerCategory {
  items: TickerItem[];
  timestamp: string;
  source: string;
}

const SECTOR_MAP: Record<string, string> = {
  'AAPL': 'Technology', 'MSFT': 'Technology', 'GOOGL': 'Technology', 'AMZN': 'Consumer Cyclical',
  'META': 'Technology', 'TSLA': 'Consumer Cyclical', 'BRK-B': 'Financial Services', 'JPM': 'Financial Services',
  'V': 'Financial Services', 'JNJ': 'Healthcare', 'WMT': 'Consumer Defensive', 'PG': 'Consumer Defensive',
  'UNH': 'Healthcare', 'MA': 'Financial Services', 'HD': 'Consumer Cyclical', 'DIS': 'Communication Services',
  'NFLX': 'Communication Services', 'PYPL': 'Financial Services', 'AMD': 'Technology', 'INTC': 'Technology',
  'BA': 'Industrials', 'GS': 'Financial Services', 'C': 'Financial Services', 'BAC': 'Financial Services',
  'XOM': 'Energy', 'CVX': 'Energy', 'PFE': 'Healthcare', 'COST': 'Consumer Defensive',
  'SBUX': 'Consumer Cyclical', 'NKE': 'Consumer Cyclical', 'CRM': 'Technology', 'ORCL': 'Technology',
  'ABBV': 'Healthcare', 'LLY': 'Healthcare', 'MRK': 'Healthcare', 'KO': 'Consumer Defensive',
  'PEP': 'Consumer Defensive', 'TMO': 'Healthcare', 'AVGO': 'Technology', 'TXN': 'Technology',
  'ADBE': 'Technology', 'NVDA': 'Technology', 'PLTR': 'Technology', 'AI': 'Technology',
  'SNOW': 'Technology', 'PATH': 'Technology', 'SMCI': 'Technology', 'MRVL': 'Technology',
  'TSM': 'Technology', 'IBM': 'Technology', 'DELL': 'Technology', 'HPE': 'Technology',
  'IONQ': 'Technology', 'BBAI': 'Technology', 'SOUN': 'Technology', 'UPST': 'Financial Services',
  'S': 'Technology', 'CRWD': 'Technology', 'PANW': 'Technology', 'MU': 'Technology',
  'QCOM': 'Technology', 'ARM': 'Technology',
  'GC=F': 'Precious Metals', 'SI=F': 'Precious Metals', 'PL=F': 'Precious Metals', 'PA=F': 'Precious Metals',
  'GLD': 'Precious Metals ETF', 'SLV': 'Precious Metals ETF', 'PPLT': 'Precious Metals ETF', 'PALL': 'Precious Metals ETF',
  'GOLD': 'Mining', 'NEM': 'Mining', 'FNV': 'Mining', 'WPM': 'Mining', 'AEM': 'Mining',
  'RGLD': 'Mining', 'AG': 'Mining', 'HL': 'Mining', 'PAAS': 'Mining',
};

const METALS_SYMBOLS: Record<string, string> = {
  'GC=F': 'Gold Futures',
  'SI=F': 'Silver Futures',
  'PL=F': 'Platinum Futures',
  'PA=F': 'Palladium Futures',
  'GLD': 'SPDR Gold Trust ETF',
  'SLV': 'iShares Silver Trust ETF',
  'PPLT': 'abrdn Platinum ETF',
  'PALL': 'abrdn Palladium ETF',
  'GOLD': 'Barrick Gold Corp',
  'NEM': 'Newmont Mining',
  'FNV': 'Franco-Nevada',
  'WPM': 'Wheaton Precious Metals',
  'AEM': 'Agnico Eagle Mines',
  'RGLD': 'Royal Gold',
  'AG': 'First Majestic Silver',
  'HL': 'Hecla Mining',
  'PAAS': 'Pan American Silver',
};

const STOCKS_SYMBOLS: Record<string, string> = {
  'AAPL': 'Apple',
  'MSFT': 'Microsoft',
  'GOOGL': 'Alphabet (Google)',
  'AMZN': 'Amazon',
  'META': 'Meta Platforms',
  'TSLA': 'Tesla',
  'BRK-B': 'Berkshire Hathaway',
  'JPM': 'JPMorgan Chase',
  'V': 'Visa',
  'JNJ': 'Johnson & Johnson',
  'WMT': 'Walmart',
  'PG': 'Procter & Gamble',
  'UNH': 'UnitedHealth Group',
  'MA': 'Mastercard',
  'HD': 'Home Depot',
  'DIS': 'Walt Disney',
  'NFLX': 'Netflix',
  'PYPL': 'PayPal',
  'AMD': 'AMD',
  'INTC': 'Intel',
  'BA': 'Boeing',
  'GS': 'Goldman Sachs',
  'C': 'Citigroup',
  'BAC': 'Bank of America',
  'XOM': 'ExxonMobil',
  'CVX': 'Chevron',
  'PFE': 'Pfizer',
  'COST': 'Costco',
  'SBUX': 'Starbucks',
  'NKE': 'Nike',
  'CRM': 'Salesforce',
  'ORCL': 'Oracle',
  'ABBV': 'AbbVie',
  'LLY': 'Eli Lilly',
  'MRK': 'Merck',
  'KO': 'Coca-Cola',
  'PEP': 'PepsiCo',
  'TMO': 'Thermo Fisher',
  'AVGO': 'Broadcom',
  'TXN': 'Texas Instruments',
  'ADBE': 'Adobe',
};

const CRYPTO_SYMBOLS: Record<string, string> = {
  'BTC-USD': 'Bitcoin',
  'ETH-USD': 'Ethereum',
  'BNB-USD': 'BNB',
  'SOL-USD': 'Solana',
  'XRP-USD': 'XRP',
  'ADA-USD': 'Cardano',
  'DOGE-USD': 'Dogecoin',
  'DOT-USD': 'Polkadot',
  'AVAX-USD': 'Avalanche',
  'LINK-USD': 'Chainlink',
  'MATIC-USD': 'Polygon',
  'SHIB-USD': 'Shiba Inu',
  'UNI-USD': 'Uniswap',
  'LTC-USD': 'Litecoin',
  'ATOM-USD': 'Cosmos',
  'NEAR-USD': 'NEAR Protocol',
  'FIL-USD': 'Filecoin',
  'APT-USD': 'Aptos',
  'ARB-USD': 'Arbitrum',
  'OP-USD': 'Optimism',
  'HBAR-USD': 'Hedera',
  'VET-USD': 'VeChain',
  'ALGO-USD': 'Algorand',
  'FTM-USD': 'Fantom',
  'SAND-USD': 'The Sandbox',
  'MANA-USD': 'Decentraland',
  'AAVE-USD': 'Aave',
  'MKR-USD': 'Maker',
  'CRO-USD': 'Cronos',
  'XLM-USD': 'Stellar',
};

const AI_SYMBOLS: Record<string, string> = {
  'NVDA': 'NVIDIA',
  'MSFT': 'Microsoft (AI)',
  'GOOGL': 'Alphabet / Google AI',
  'META': 'Meta AI',
  'AMZN': 'Amazon / AWS AI',
  'CRM': 'Salesforce / Einstein AI',
  'PLTR': 'Palantir Technologies',
  'AI': 'C3.ai',
  'SNOW': 'Snowflake',
  'PATH': 'UiPath',
  'SMCI': 'Super Micro Computer',
  'AMD': 'AMD (AI Chips)',
  'AVGO': 'Broadcom (AI Networking)',
  'MRVL': 'Marvell Technology',
  'TSM': 'Taiwan Semiconductor',
  'ORCL': 'Oracle (Cloud AI)',
  'IBM': 'IBM / Watson',
  'DELL': 'Dell Technologies',
  'HPE': 'Hewlett Packard Enterprise',
  'IONQ': 'IonQ (Quantum AI)',
  'BBAI': 'BigBear.ai',
  'SOUN': 'SoundHound AI',
  'UPST': 'Upstart Holdings',
  'S': 'SentinelOne (AI Security)',
  'CRWD': 'CrowdStrike (AI Security)',
  'PANW': 'Palo Alto Networks (AI)',
  'MU': 'Micron Technology',
  'QCOM': 'Qualcomm (AI Mobile)',
  'ARM': 'Arm Holdings',
  'ADBE': 'Adobe (AI Creative)',
};

async function fetchYahooQuotes(symbols: string[]): Promise<Map<string, any>> {
  const results = new Map<string, any>();
  const batchSize = 8;

  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize);
    const promises = batch.map(async (symbol) => {
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1mo&interval=1d&includePrePost=false`;
        const response = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) return;

        const data = await response.json();
        const result = data?.chart?.result?.[0];
        if (!result?.meta) return;

        results.set(symbol, result);
      } catch {
      }
    });

    await Promise.all(promises);

    if (i + batchSize < symbols.length) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  return results;
}

function buildTickerItem(symbol: string, name: string, data: any, assetType: 'metal' | 'stock' | 'crypto' | 'ai'): TickerItem | null {
  try {
    const meta = data.meta;
    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;

    if (!price || price <= 0) return null;

    const change = +(price - prevClose).toFixed(4);
    const changePercent = prevClose > 0 ? +((change / prevClose) * 100).toFixed(2) : 0;

    const closes = data.indicators?.quote?.[0]?.close;
    const timestamps = data.timestamp;
    let change7d: number | undefined;
    if (closes && timestamps && closes.length > 1) {
      const now = timestamps[timestamps.length - 1];
      const sevenDaysAgo = now - (7 * 24 * 60 * 60);
      let bestIdx = 0;
      let bestDiff = Infinity;
      for (let ci = 0; ci < timestamps.length; ci++) {
        const diff = Math.abs(timestamps[ci] - sevenDaysAgo);
        if (diff < bestDiff && closes[ci] != null && closes[ci] > 0) {
          bestDiff = diff;
          bestIdx = ci;
        }
      }
      const weekAgoPrice = closes[bestIdx];
      if (weekAgoPrice && weekAgoPrice > 0) {
        change7d = +((price - weekAgoPrice) / weekAgoPrice * 100).toFixed(2);
      }
    }

    const high52w = meta.fiftyTwoWeekHigh ?? 0;
    const low52w = meta.fiftyTwoWeekLow ?? 0;
    const volume = meta.regularMarketVolume ?? 0;
    const marketCap = meta.marketCap ?? undefined;

    let advisory: 'FAVORABLE' | 'NEUTRAL' | 'CAUTIOUS' = 'NEUTRAL';
    let advisoryNote = '';

    if (high52w > 0 && low52w > 0) {
      const range52w = high52w - low52w;
      const positionInRange = range52w > 0 ? (price - low52w) / range52w : 0.5;

      if (positionInRange < 0.25) {
        advisory = 'FAVORABLE';
        advisoryNote = 'Trading near 52-week lows — potential value opportunity';
      } else if (positionInRange < 0.45) {
        advisory = 'FAVORABLE';
        advisoryNote = 'Trading in the lower range — conditions look favorable';
      } else if (positionInRange > 0.92) {
        advisory = 'CAUTIOUS';
        advisoryNote = 'Near 52-week highs — may be extended, watch for pullbacks';
      } else if (positionInRange > 0.8) {
        advisory = 'NEUTRAL';
        advisoryNote = 'Trading near the upper range — momentum is strong but entry risk is higher';
      } else {
        advisory = 'NEUTRAL';
        advisoryNote = 'Trading in the mid-range — no strong signal either way';
      }

      if (changePercent < -3) {
        advisory = 'CAUTIOUS';
        advisoryNote = 'Significant daily decline — wait for stabilization before entering';
      } else if (changePercent > 3 && positionInRange > 0.7) {
        advisory = 'CAUTIOUS';
        advisoryNote = 'Sharp daily gain at elevated levels — potential overextension';
      }
    }

    const decimals = price < 0.001 ? 8 : price < 0.1 ? 6 : price < 10 ? 4 : 2;
    const sector = assetType === 'crypto' ? 'Cryptocurrency' : (SECTOR_MAP[symbol] ?? 'N/A');

    return {
      symbol,
      name,
      price: +price.toFixed(decimals),
      change: +change.toFixed(decimals),
      changePercent,
      change7d,
      high52w: +high52w.toFixed(2),
      low52w: +low52w.toFixed(2),
      volume,
      marketCap,
      sector,
      type: assetType,
      advisory,
      advisoryNote,
      lastUpdated: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

interface CacheEntry {
  data: TickerCategory;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 60 * 1000;

async function getTickerData(symbolMap: Record<string, string>, category: string, assetType: 'metal' | 'stock' | 'crypto' | 'ai'): Promise<TickerCategory> {
  const cached = cache.get(category);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  console.log(`📊 Simpleton Tickers [${category}]: Fetching live data...`);

  const symbols = Object.keys(symbolMap);
  const quotes = await fetchYahooQuotes(symbols);

  const items: TickerItem[] = [];
  for (const [symbol, name] of Object.entries(symbolMap)) {
    const data = quotes.get(symbol);
    if (!data) continue;

    const item = buildTickerItem(symbol, name, data, assetType);
    if (item) items.push(item);
  }

  items.sort((a, b) => {
    const order = { FAVORABLE: 0, NEUTRAL: 1, CAUTIOUS: 2 };
    return (order[a.advisory] ?? 1) - (order[b.advisory] ?? 1);
  });

  const result: TickerCategory = {
    items,
    timestamp: new Date().toISOString(),
    source: 'Yahoo Finance',
  };

  cache.set(category, { data: result, timestamp: Date.now() });

  console.log(`📊 Simpleton Tickers [${category}]: ${items.length}/${symbols.length} symbols loaded`);

  return result;
}

interface CoinGeckoItem {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  total_volume: number;
  market_cap: number;
  high_24h: number;
  low_24h: number;
  ath: number;
  atl: number;
}

let coinGeckoCache: { data: TickerCategory; timestamp: number } | null = null;
const COINGECKO_CACHE_DURATION = 3 * 60 * 1000;

async function fetchCoinGeckoCrypto(): Promise<TickerCategory> {
  if (coinGeckoCache && Date.now() - coinGeckoCache.timestamp < COINGECKO_CACHE_DURATION) {
    return coinGeckoCache.data;
  }

  console.log(`📊 Simpleton Tickers [crypto-coingecko]: Fetching from CoinGecko...`);

  try {
    const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&sparkline=false&price_change_percentage=24h,7d';
    const response = await fetch(url, {
      headers: { 'User-Agent': 'SimpletonVision/1.0' },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.log(`📊 CoinGecko returned ${response.status}, falling back to Yahoo Finance`);
      return getTickerData(CRYPTO_SYMBOLS, 'crypto', 'crypto');
    }

    const coins: CoinGeckoItem[] = await response.json();
    const items: TickerItem[] = [];

    for (const coin of coins) {
      if (!coin.current_price || coin.current_price <= 0) continue;

      const price = coin.current_price;
      const changePercent = coin.price_change_percentage_24h ?? 0;
      const change = price * (changePercent / 100);
      const change7d = coin.price_change_percentage_7d_in_currency;

      let advisory: 'FAVORABLE' | 'NEUTRAL' | 'CAUTIOUS' = 'NEUTRAL';
      let advisoryNote = '';

      if (changePercent < -5) {
        advisory = 'CAUTIOUS';
        advisoryNote = 'Significant daily decline — wait for stabilization before entering';
      } else if (changePercent < -2) {
        advisory = 'FAVORABLE';
        advisoryNote = 'Pulling back — potential buying opportunity if trend holds';
      } else if (changePercent > 10) {
        advisory = 'CAUTIOUS';
        advisoryNote = 'Sharp daily gain — potential overextension, consider waiting';
      } else if (changePercent > 5) {
        advisory = 'NEUTRAL';
        advisoryNote = 'Strong momentum — watch for continuation or pullback';
      } else {
        advisory = 'NEUTRAL';
        advisoryNote = 'Trading in a normal range — no strong signal either way';
      }

      const decimals = price < 0.001 ? 8 : price < 0.1 ? 6 : price < 10 ? 4 : 2;

      items.push({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: +price.toFixed(decimals),
        change: +change.toFixed(decimals),
        changePercent: +changePercent.toFixed(2),
        change7d: change7d != null ? +change7d.toFixed(2) : undefined,
        high52w: coin.ath ?? 0,
        low52w: coin.atl ?? 0,
        volume: coin.total_volume ?? 0,
        marketCap: coin.market_cap ?? 0,
        sector: 'Cryptocurrency',
        type: 'crypto',
        advisory,
        advisoryNote,
        lastUpdated: new Date().toISOString(),
      });
    }

    items.sort((a, b) => {
      const order = { FAVORABLE: 0, NEUTRAL: 1, CAUTIOUS: 2 };
      return (order[a.advisory] ?? 1) - (order[b.advisory] ?? 1);
    });

    const result: TickerCategory = {
      items,
      timestamp: new Date().toISOString(),
      source: 'CoinGecko',
    };

    coinGeckoCache = { data: result, timestamp: Date.now() };
    console.log(`📊 Simpleton Tickers [crypto-coingecko]: ${items.length} coins loaded from CoinGecko`);

    return result;
  } catch (err) {
    console.log(`📊 CoinGecko fetch failed, falling back to Yahoo Finance`);
    return getTickerData(CRYPTO_SYMBOLS, 'crypto', 'crypto');
  }
}

export async function getMetalsTicker(): Promise<TickerCategory> {
  return getTickerData(METALS_SYMBOLS, 'metals', 'metal');
}

export async function getStocksTicker(): Promise<TickerCategory> {
  return getTickerData(STOCKS_SYMBOLS, 'stocks', 'stock');
}

export async function getCryptoTicker(): Promise<TickerCategory> {
  return fetchCoinGeckoCrypto();
}

export async function getAITicker(): Promise<TickerCategory> {
  return getTickerData(AI_SYMBOLS, 'ai', 'ai');
}

export async function searchTickers(query: string): Promise<TickerItem[]> {
  const q = query.toUpperCase().trim();
  if (!q) return [];

  const results: TickerItem[] = [];
  const seen = new Set<string>();

  const allSymbolMaps = [
    { map: METALS_SYMBOLS, type: 'metal' as const },
    { map: STOCKS_SYMBOLS, type: 'stock' as const },
    { map: CRYPTO_SYMBOLS, type: 'crypto' as const },
    { map: AI_SYMBOLS, type: 'ai' as const },
  ];

  const matchingSymbols: { symbol: string; name: string; type: 'metal' | 'stock' | 'crypto' | 'ai' }[] = [];

  for (const { map, type } of allSymbolMaps) {
    for (const [symbol, name] of Object.entries(map)) {
      if (seen.has(symbol)) continue;
      if (symbol.toUpperCase().includes(q) || name.toUpperCase().includes(q)) {
        matchingSymbols.push({ symbol, name, type });
        seen.add(symbol);
      }
    }
  }

  if (matchingSymbols.length > 0) {
    const limitedMatches = matchingSymbols.slice(0, 20);
    const yahooSymbols = limitedMatches.map(m => m.symbol);
    const quotes = await fetchYahooQuotes(yahooSymbols);

    for (const match of limitedMatches) {
      const data = quotes.get(match.symbol);
      if (!data) continue;
      const item = buildTickerItem(match.symbol, match.name, data, match.type);
      if (item) {
        results.push(item);
        seen.add(item.symbol);
      }
    }
  }

  if (coinGeckoCache) {
    for (const item of coinGeckoCache.data.items) {
      if (seen.has(item.symbol)) continue;
      if (item.symbol.toUpperCase().includes(q) || item.name.toUpperCase().includes(q)) {
        results.push(item);
        seen.add(item.symbol);
      }
      if (results.length >= 20) break;
    }
  }

  return results.slice(0, 20);
}
