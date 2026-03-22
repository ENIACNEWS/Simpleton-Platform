import { Request, Response } from 'express';
import fetch from 'node-fetch';

// Free API integrations for precious metals, diamonds, and watches platform
export class FreeAPIsIntegration {
  private static instance: FreeAPIsIntegration;
  
  public static getInstance(): FreeAPIsIntegration {
    if (!FreeAPIsIntegration.instance) {
      FreeAPIsIntegration.instance = new FreeAPIsIntegration();
    }
    return FreeAPIsIntegration.instance;
  }

  // 1. Federal Reserve Economic Data (FRED) - FREE
  // Perfect for precious metals context - inflation, interest rates, economic indicators
  async getFREDData(series: string = 'GOLDAMGBD228NLBM') {
    try {
      if (!process.env.FRED_API_KEY) {
        console.error('FRED API key not found');
        return null;
      }
      
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series}&api_key=${process.env.FRED_API_KEY}&file_type=json&limit=10&sort_order=desc`;
      console.log('🏛️ FRED API: Fetching economic data from Federal Reserve...');
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.observations && data.observations.length > 0) {
        console.log('✅ FRED API: Successfully fetched economic data');
        return data.observations
          .filter((obs: any) => obs.value !== '.')
          .map((obs: any) => ({
            date: obs.date,
            value: parseFloat(obs.value),
            series: series,
            source: 'Federal Reserve Economic Data (FRED)'
          }));
      }
      
      console.log('❌ FRED API: No valid observations found');
      return null;
    } catch (error) {
      console.error('FRED API error:', error);
      return null;
    }
  }

  // 2. CoinGecko API - FREE (no key required)
  // Crypto data that correlates with precious metals
  async getCryptoData() {
    try {
      const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin&vs_currencies=usd&include_24hr_change=true';
      const response = await fetch(url);
      const data = await response.json();
      
      return Object.entries(data).map(([coin, info]: [string, any]) => ({
        name: coin,
        price: info.usd,
        change24h: info.usd_24h_change,
        symbol: coin === 'bitcoin' ? 'BTC' : coin === 'ethereum' ? 'ETH' : 'LTC'
      }));
    } catch (error) {
      console.error('CoinGecko API error:', error);
      return null;
    }
  }

  // 3. World Bank API - FREE
  // Global economic indicators affecting precious metals
  async getWorldBankData() {
    try {
      const url = 'https://api.worldbank.org/v2/country/USA/indicator/NY.GDP.MKTP.CD?format=json&date=2020:2024';
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data[1]) {
        return data[1].slice(0, 5).map((item: any) => ({
          year: item.date,
          gdp: item.value,
          country: item.country.value
        }));
      }
      return null;
    } catch (error) {
      console.error('World Bank API error:', error);
      return null;
    }
  }

  // 4. Alpha Vantage - FREE (500 calls/day)
  // Stock market data and commodities
  async getAlphaVantageData(symbol: string = 'AAPL') {
    try {
      if (!process.env.ALPHA_VANTAGE_API_KEY) {
        console.error('Alpha Vantage API key not found');
        return null;
      }
      
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
      console.log('📊 ALPHA VANTAGE: Fetching stock data for', symbol);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data['Global Quote'] && data['Global Quote']['01. symbol']) {
        const quote = data['Global Quote'];
        console.log('✅ ALPHA VANTAGE: Successfully fetched stock data for', symbol);
        return {
          symbol: quote['01. symbol'],
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: quote['10. change percent'],
          lastUpdated: quote['07. latest trading day'],
          source: 'Alpha Vantage'
        };
      }
      
      if (data['Note']) {
        console.log('⚠️ ALPHA VANTAGE: Rate limit reached -', data['Note']);
      }
      
      console.log('❌ ALPHA VANTAGE: No valid quote found for', symbol);
      return null;
    } catch (error) {
      console.error('Alpha Vantage API error:', error);
      return null;
    }
  }



  // 6. Reddit API - FREE
  // Sentiment analysis for precious metals discussions
  async getRedditSentiment(subreddit: string = 'Gold') {
    try {
      const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=10`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Simpleton-Calculator/1.0' }
      });
      const data = await response.json();
      
      if (data.data && data.data.children) {
        return data.data.children.map((post: any) => ({
          title: post.data.title,
          score: post.data.score,
          comments: post.data.num_comments,
          created: new Date(post.data.created_utc * 1000),
          url: `https://reddit.com${post.data.permalink}`
        }));
      }
      return null;
    } catch (error) {
      console.error('Reddit API error:', error);
      return null;
    }
  }

  // 7. Yahoo Finance API (Unofficial but free)
  // Stock and commodity data
  async getYahooFinanceData(symbol: string = 'GC=F') {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.chart && data.chart.result && data.chart.result[0]) {
        const result = data.chart.result[0];
        const meta = result.meta;
        
        return {
          symbol: meta.symbol,
          price: meta.regularMarketPrice,
          previousClose: meta.previousClose,
          change: meta.regularMarketPrice - meta.previousClose,
          currency: meta.currency,
          exchangeName: meta.exchangeName,
          lastUpdated: new Date(meta.regularMarketTime * 1000)
        };
      }
      return null;
    } catch (error) {
      console.error('Yahoo Finance API error:', error);
      return null;
    }
  }

  // 8. US Treasury API - FREE
  // Treasury yields affecting precious metals
  async getTreasuryData() {
    try {
      const url = 'https://api.fiscaldata.treasury.gov/services/api/v1/accounting/od/rates_of_exchange?limit=10&sort=-record_date';
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.data) {
        return data.data.slice(0, 5).map((item: any) => ({
          date: item.record_date,
          country: item.country,
          currency: item.currency,
          rate: parseFloat(item.exchange_rate)
        }));
      }
      return null;
    } catch (error) {
      console.error('Treasury API error:', error);
      return null;
    }
  }

  // 9. US Mint API - FREE
  // Real-time precious metals coin pricing from Yahoo Finance
  async getUSMintData() {
    try {
      const symbols = ['GC=F', 'SI=F', 'PL=F', 'PA=F']; // Gold, Silver, Platinum, Palladium futures
      const results = [];
      
      for (const symbol of symbols) {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.chart && data.chart.result && data.chart.result[0]) {
          const result = data.chart.result[0];
          const meta = result.meta;
          
          results.push({
            symbol: meta.symbol,
            metal: symbol.includes('GC') ? 'Gold' : 
                   symbol.includes('SI') ? 'Silver' : 
                   symbol.includes('PL') ? 'Platinum' : 'Palladium',
            price: meta.regularMarketPrice,
            change: meta.regularMarketPrice - meta.previousClose,
            changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100).toFixed(2),
            currency: meta.currency,
            lastUpdated: new Date(meta.regularMarketTime * 1000).toISOString()
          });
        }
      }
      
      return results.length > 0 ? results : null;
    } catch (error) {
      console.error('US Mint API error:', error);
      return null;
    }
  }

  // 10. USGS Minerals API - FREE
  // Real geological data from USGS API
  async getUSGSMineralsData() {
    try {
      const url = 'https://mrdata.usgs.gov/services/sgmc?format=json&bbox=-180,-90,180,90';
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data.features) {
        return data.features.slice(0, 10).map((feature: any) => ({
          type: feature.properties.UNIT_NAME,
          rockType: feature.properties.ROCKTYPE1,
          age: feature.properties.MAX_AGE,
          country: feature.properties.COUNTRY,
          coordinates: feature.geometry.coordinates,
          source: 'USGS Geological Survey',
          lastUpdated: new Date().toISOString()
        }));
      }
      return null;
    } catch (error) {
      console.error('USGS API error:', error);
      return null;
    }
  }

  // 11. Coin Collector Forums API - FREE
  // Reddit coin collecting communities
  async getCoinCollectorSentiment() {
    try {
      const subreddits = ['coins', 'Silverbugs', 'Gold', 'numismatics'];
      const results = [];
      
      for (const subreddit of subreddits) {
        const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=5`;
        const response = await fetch(url, {
          headers: { 'User-Agent': 'Simpleton-Calculator/1.0' }
        });
        const data = await response.json();
        
        if (data.data && data.data.children) {
          const posts = data.data.children.slice(0, 3).map((post: any) => ({
            title: post.data.title,
            score: post.data.score,
            comments: post.data.num_comments,
            subreddit: subreddit,
            created: new Date(post.data.created_utc * 1000),
            url: `https://reddit.com${post.data.permalink}`
          }));
          results.push(...posts);
        }
      }
      
      return results;
    } catch (error) {
      console.error('Coin collector sentiment error:', error);
      return null;
    }
  }

  // 12. Historical Coin Prices API - FREE
  // Yahoo Finance for historical coin/precious metal data
  async getHistoricalCoinPrices() {
    try {
      const symbols = ['GC=F', 'SI=F', 'PL=F', 'PA=F']; // Gold, Silver, Platinum, Palladium futures
      const results = [];
      
      for (const symbol of symbols) {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1mo&interval=1d`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.chart && data.chart.result && data.chart.result[0]) {
          const result = data.chart.result[0];
          const meta = result.meta;
          const timestamps = result.timestamp;
          const prices = result.indicators.quote[0].close;
          
          results.push({
            symbol: meta.symbol,
            metal: symbol.includes('GC') ? 'Gold' : 
                   symbol.includes('SI') ? 'Silver' : 
                   symbol.includes('PL') ? 'Platinum' : 'Palladium',
            currentPrice: meta.regularMarketPrice,
            currency: meta.currency,
            historicalData: timestamps.slice(-7).map((time: number, index: number) => ({
              date: new Date(time * 1000).toISOString().split('T')[0],
              price: prices[prices.length - 7 + index]
            }))
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Historical coin prices error:', error);
      return null;
    }
  }

  // 13. Numismatic Market Data - FREE
  // Real coin auction data from Heritage Auctions RSS
  async getNumismaticMarketData() {
    try {
      const url = 'https://www.ha.com/rss/auctions.xml';
      const response = await fetch(url);
      const text = await response.text();
      
      // Parse basic XML for auction data
      const items = text.match(/<item[^>]*>[\s\S]*?<\/item>/g) || [];
      
      return items.slice(0, 5).map((item: string, index: number) => {
        const title = item.match(/<title[^>]*>(.*?)<\/title>/)?.[1] || '';
        const link = item.match(/<link[^>]*>(.*?)<\/link>/)?.[1] || '';
        const description = item.match(/<description[^>]*>(.*?)<\/description>/)?.[1] || '';
        const pubDate = item.match(/<pubDate[^>]*>(.*?)<\/pubDate>/)?.[1] || '';
        
        return {
          id: index + 1,
          title: title.replace(/<!\[CDATA\[|\]\]>/g, ''),
          description: description.replace(/<!\[CDATA\[|\]\]>/g, ''),
          link: link,
          date: pubDate,
          source: 'Heritage Auctions',
          lastUpdated: new Date().toISOString()
        };
      });
    } catch (error) {
      console.error('Numismatic market data error:', error);
      return null;
    }
  }
}

// API Routes
export const getFreeAPIData = async (req: Request, res: Response) => {
  try {
    const api = FreeAPIsIntegration.getInstance();
    const category = req.query.category as string || 'all';
    
    let data: any = {};
    
    switch (category) {
      case 'economics':
        data.fred = await api.getFREDData();
        data.worldBank = await api.getWorldBankData();
        data.treasury = await api.getTreasuryData();
        break;
        
      case 'crypto':
        data.crypto = await api.getCryptoData();
        break;
        
      case 'stocks':
        data.apple = await api.getAlphaVantageData('AAPL');
        data.gold = await api.getYahooFinanceData('GC=F');
        data.silver = await api.getYahooFinanceData('SI=F');
        break;
        
      case 'coins':
        data.usMint = await api.getUSMintData();
        data.historical = await api.getHistoricalCoinPrices();
        data.auctions = await api.getNumismaticMarketData();
        data.sentiment = await api.getCoinCollectorSentiment();
        break;
        
      case 'sentiment':
        data.reddit = await api.getRedditSentiment('Gold');
        data.silverReddit = await api.getRedditSentiment('Silverbugs');
        data.coinCollectors = await api.getCoinCollectorSentiment();
        break;
        
      case 'all':
      default:
        data = {
          economics: {
            fred: await api.getFREDData(),
            worldBank: await api.getWorldBankData(),
            treasury: await api.getTreasuryData()
          },
          crypto: await api.getCryptoData(),
          stocks: {
            gold: await api.getYahooFinanceData('GC=F'),
            silver: await api.getYahooFinanceData('SI=F'),
            platinum: await api.getYahooFinanceData('PL=F'),
            palladium: await api.getYahooFinanceData('PA=F')
          },
          coins: {
            usMint: await api.getUSMintData(),
            historical: await api.getHistoricalCoinPrices(),
            auctions: await api.getNumismaticMarketData(),
            sentiment: await api.getCoinCollectorSentiment(),
            usgs: await api.getUSGSMineralsData()
          },
          sentiment: {
            reddit: await api.getRedditSentiment('Gold'),
            silverReddit: await api.getRedditSentiment('Silverbugs'),
            coinCollectors: await api.getCoinCollectorSentiment()
          }
        };
    }
    
    res.json({
      success: true,
      data,
      category,
      sources: [
        'Federal Reserve Economic Data (FRED)',
        'CoinGecko API',
        'World Bank API',
        'Alpha Vantage',
        'Reddit API',
        'Yahoo Finance',
        'US Treasury API',
        'USGS Geological Survey',
        'Heritage Auctions',
        'Reddit Coin Communities'
      ],
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Free APIs error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch free API data' });
  }
};

// RSS Feed Integration (No API key needed)
export const getRSSFeeds = async (req: Request, res: Response) => {
  try {
    const feeds = {
      kitco: 'https://www.kitco.com/rss/KitcoNews.xml',
      marketwatch: 'https://feeds.marketwatch.com/marketwatch/commodities',
      yahoo: 'https://finance.yahoo.com/rss/commodities',
      reuters: 'https://feeds.reuters.com/reuters/businessNews',
      bloomberg: 'https://www.bloomberg.com/markets/commodities.rss'
    };
    
    res.json({
      success: true,
      feeds,
      note: 'RSS feeds for precious metals, commodities, and financial news',
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('RSS feeds error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch RSS feeds' });
  }
};