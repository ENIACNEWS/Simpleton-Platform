import { Request, Response } from 'express';
import axios from 'axios';

// Enhanced Metals Data with Real Sources
interface EnhancedMetalData {
  metal: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high24h: number;
  low24h: number;
  marketCap: number;
  dataSource: string; // Real data source attribution
  prediction: {
    nextHour: number;
    next24h: number;
    nextWeek: number;
    confidence: number;
  };
  technicalIndicators: {
    rsi: number;
    macd: number;
    bollinger: {
      upper: number;
      middle: number;
      lower: number;
    };
  };
  sentiment: {
    score: number;
    sources: number;
    positive: number;
    negative: number;
    neutral: number;
  };
}

// Real market data functions
async function fetchRealMarketData(): Promise<any> {
  try {
    // Try Yahoo Finance for ETF data (GLD, SLV, PPLT, PALL)
    const responses = await Promise.allSettled([
      axios.get('https://query1.finance.yahoo.com/v8/finance/chart/GLD'), // Gold ETF
      axios.get('https://query1.finance.yahoo.com/v8/finance/chart/SLV'), // Silver ETF
      axios.get('https://query1.finance.yahoo.com/v8/finance/chart/PPLT'), // Platinum ETF
      axios.get('https://query1.finance.yahoo.com/v8/finance/chart/PALL') // Palladium ETF
    ]);

    const data: any = {};
    
    if (responses[0].status === 'fulfilled' && responses[0].value.data?.chart?.result?.[0]) {
      const result = responses[0].value.data.chart.result[0];
      const meta = result.meta;
      data.gold = {
        change: meta.regularMarketChange || 0,
        changePercent: meta.regularMarketChangePercent || 0,
        volume: meta.regularMarketVolume || 0,
        high24h: meta.regularMarketDayHigh || 0,
        low24h: meta.regularMarketDayLow || 0,
        source: 'Yahoo Finance (GLD ETF)'
      };
    }

    if (responses[1].status === 'fulfilled' && responses[1].value.data?.chart?.result?.[0]) {
      const result = responses[1].value.data.chart.result[0];
      const meta = result.meta;
      data.silver = {
        change: meta.regularMarketChange || 0,
        changePercent: meta.regularMarketChangePercent || 0,
        volume: meta.regularMarketVolume || 0,
        high24h: meta.regularMarketDayHigh || 0,
        low24h: meta.regularMarketDayLow || 0,
        source: 'Yahoo Finance (SLV ETF)'
      };
    }

    if (responses[2].status === 'fulfilled' && responses[2].value.data?.chart?.result?.[0]) {
      const result = responses[2].value.data.chart.result[0];
      const meta = result.meta;
      data.platinum = {
        change: meta.regularMarketChange || 0,
        changePercent: meta.regularMarketChangePercent || 0,
        volume: meta.regularMarketVolume || 0,
        high24h: meta.regularMarketDayHigh || 0,
        low24h: meta.regularMarketDayLow || 0,
        source: 'Yahoo Finance (PPLT ETF)'
      };
    }

    if (responses[3].status === 'fulfilled' && responses[3].value.data?.chart?.result?.[0]) {
      const result = responses[3].value.data.chart.result[0];
      const meta = result.meta;
      data.palladium = {
        change: meta.regularMarketChange || 0,
        changePercent: meta.regularMarketChangePercent || 0,
        volume: meta.regularMarketVolume || 0,
        high24h: meta.regularMarketDayHigh || 0,
        low24h: meta.regularMarketDayLow || 0,
        source: 'Yahoo Finance (PALL ETF)'
      };
    }

    return data;
  } catch (error) {
    console.error('Real market data fetch failed:', error);
    return {};
  }
}

// Enhanced metals endpoint with real data sources
export async function getEnhancedMetalsData(req: Request, res: Response) {
  try {
    // Get base pricing from Revolutionary Metals Aggregator
    const kitcoResponse = await axios.get('http://localhost:5000/api/pricing/kitco');
    const kitcoData = kitcoResponse.data;

    if (!kitcoData.success || !kitcoData.prices) {
      return res.status(500).json({ 
        error: 'Base pricing data unavailable',
        message: 'Revolutionary Metals Aggregator offline'
      });
    }

    // Get real market data from financial APIs
    const realMarketData = await fetchRealMarketData();
    const enhancedMetals: EnhancedMetalData[] = [];

    // Gold with authentic data sources
    if (kitcoData.prices.gold) {
      const goldData = realMarketData.gold || {};
      enhancedMetals.push({
        metal: 'Gold',
        symbol: 'XAU',
        price: kitcoData.prices.gold,
        change: goldData.change || 0,
        changePercent: goldData.changePercent || 0,
        volume: goldData.volume || 0,
        high24h: goldData.high24h || 0,
        low24h: goldData.low24h || 0,
        marketCap: 0, // No reliable real-time market cap source available
        dataSource: goldData.source || 'Revolutionary Metals Aggregator',
        prediction: {
          nextHour: 0, // No prediction without ML model
          next24h: 0,
          nextWeek: 0,
          confidence: 0
        },
        technicalIndicators: {
          rsi: 0, // Would need Alpha Vantage API key
          macd: 0,
          bollinger: { upper: 0, middle: 0, lower: 0 }
        },
        sentiment: {
          score: 0, // Would need News API key  
          sources: 0,
          positive: 0,
          negative: 0,
          neutral: 0
        }
      });
    }

    // Silver with authentic data sources
    if (kitcoData.prices.silver) {
      const silverData = realMarketData.silver || {};
      enhancedMetals.push({
        metal: 'Silver',
        symbol: 'XAG',
        price: kitcoData.prices.silver,
        change: silverData.change || 0,
        changePercent: silverData.changePercent || 0,
        volume: silverData.volume || 0,
        high24h: silverData.high24h || 0,
        low24h: silverData.low24h || 0,
        marketCap: 0,
        dataSource: silverData.source || 'Revolutionary Metals Aggregator',
        prediction: {
          nextHour: 0,
          next24h: 0,
          nextWeek: 0,
          confidence: 0
        },
        technicalIndicators: {
          rsi: 0,
          macd: 0,
          bollinger: { upper: 0, middle: 0, lower: 0 }
        },
        sentiment: {
          score: 0,
          sources: 0,
          positive: 0,
          negative: 0,
          neutral: 0
        }
      });
    }

    // Platinum with authentic data sources
    if (kitcoData.prices.platinum) {
      const platinumData = realMarketData.platinum || {};
      enhancedMetals.push({
        metal: 'Platinum',
        symbol: 'XPT',
        price: kitcoData.prices.platinum,
        change: platinumData.change || 0,
        changePercent: platinumData.changePercent || 0,
        volume: platinumData.volume || 0,
        high24h: platinumData.high24h || 0,
        low24h: platinumData.low24h || 0,
        marketCap: 0,
        dataSource: platinumData.source || 'Revolutionary Metals Aggregator',
        prediction: {
          nextHour: 0,
          next24h: 0,
          nextWeek: 0,
          confidence: 0
        },
        technicalIndicators: {
          rsi: 0,
          macd: 0,
          bollinger: { upper: 0, middle: 0, lower: 0 }
        },
        sentiment: {
          score: 0,
          sources: 0,
          positive: 0,
          negative: 0,
          neutral: 0
        }
      });
    }

    // Palladium with authentic data sources
    if (kitcoData.prices.palladium) {
      const palladiumData = realMarketData.palladium || {};
      enhancedMetals.push({
        metal: 'Palladium',
        symbol: 'XPD',
        price: kitcoData.prices.palladium,
        change: palladiumData.change || 0,
        changePercent: palladiumData.changePercent || 0,
        volume: palladiumData.volume || 0,
        high24h: palladiumData.high24h || 0,
        low24h: palladiumData.low24h || 0,
        marketCap: 0,
        dataSource: palladiumData.source || 'Revolutionary Metals Aggregator',
        prediction: {
          nextHour: 0,
          next24h: 0,
          nextWeek: 0,
          confidence: 0
        },
        technicalIndicators: {
          rsi: 0,
          macd: 0,
          bollinger: { upper: 0, middle: 0, lower: 0 }
        },
        sentiment: {
          score: 0,
          sources: 0,
          positive: 0,
          negative: 0,
          neutral: 0
        }
      });
    }

    res.json({
      success: true,
      data: enhancedMetals,
      sources: [
        'Revolutionary Metals Aggregator (Base Pricing)',
        'Yahoo Finance ETFs (Market Data)',
        'Real-time Financial APIs'
      ]
    });

  } catch (error: any) {
    console.error('Enhanced metals data error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch enhanced metals data',
      message: error.message 
    });
  }
}

// Market intelligence placeholder (keeping for compatibility)
export async function getMarketIntelligence(req: Request, res: Response) {
  res.json({
    success: true,
    data: {
      message: 'Market intelligence endpoint - authentic data sources only',
      sources: ['Revolutionary Metals Aggregator', 'Yahoo Finance', 'Financial APIs']
    }
  });
}