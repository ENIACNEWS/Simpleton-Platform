import type { Express } from "express";

// In-memory cache to respect CoinGecko rate limits (free tier: ~30 req/min)
let pricesCache: { data: any; timestamp: number } | null = null;
let globalCache: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 60_000; // 60 seconds

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

async function fetchWithRetry(url: string, retries = 2): Promise<any> {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Simpleton-Platform/1.0',
        },
      });
      if (res.status === 429) {
        // Rate limited - wait and retry
        const wait = Math.min(2000 * (i + 1), 10000);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      if (!res.ok) throw new Error(`CoinGecko API error: ${res.status}`);
      return await res.json();
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

export function registerCryptoRoutes(app: Express) {
  // GET /api/crypto/prices - Top 50 coins with market data + sparklines
  app.get('/api/crypto/prices', async (_req, res) => {
    try {
      if (pricesCache && Date.now() - pricesCache.timestamp < CACHE_TTL) {
        return res.json(pricesCache.data);
      }

      const data = await fetchWithRetry(
        `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h,7d,30d&locale=en`
      );

      pricesCache = { data, timestamp: Date.now() };
      res.json(data);
    } catch (err: any) {
      console.error('[Crypto] Failed to fetch prices:', err.message);
      // Return stale cache if available
      if (pricesCache) {
        return res.json(pricesCache.data);
      }
      res.status(502).json({ error: 'Failed to fetch cryptocurrency data' });
    }
  });

  // GET /api/crypto/global - Global market stats
  app.get('/api/crypto/global', async (_req, res) => {
    try {
      if (globalCache && Date.now() - globalCache.timestamp < CACHE_TTL) {
        return res.json(globalCache.data);
      }

      const data = await fetchWithRetry(`${COINGECKO_BASE}/global`);

      globalCache = { data, timestamp: Date.now() };
      res.json(data);
    } catch (err: any) {
      console.error('[Crypto] Failed to fetch global data:', err.message);
      if (globalCache) {
        return res.json(globalCache.data);
      }
      res.status(502).json({ error: 'Failed to fetch global crypto data' });
    }
  });

  // GET /api/crypto/coin/:id - Individual coin detail
  app.get('/api/crypto/coin/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const data = await fetchWithRetry(
        `${COINGECKO_BASE}/coins/${encodeURIComponent(id)}?localization=false&tickers=false&community_data=false&developer_data=false`
      );
      res.json(data);
    } catch (err: any) {
      console.error('[Crypto] Failed to fetch coin detail:', err.message);
      res.status(502).json({ error: 'Failed to fetch coin data' });
    }
  });
}
