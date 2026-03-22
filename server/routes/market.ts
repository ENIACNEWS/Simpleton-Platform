import type { Express } from "express";
import { storage } from "../storage";
import { getMetalsNews, getDiamondsNews, getCoinsNews, getWatchesNews, getAllNews, getNewsTicker } from "../news-feed-api";
import { getFreeAPIData, getRSSFeeds } from "../free-apis-integration";
import { getEnhancedMetalsData, getMarketIntelligence } from "../ticker-apis";

export function registerMarketRoutes(app: Express) {
  async function getComprehensiveMarketData(req: any, res: any) {
    res.status(410).json({ error: "This endpoint has been retired" });
  }

  async function getConsensusPricing(req: any, res: any) {
    res.status(410).json({ error: "This endpoint has been retired" });
  }

  async function getSentimentAnalysis(req: any, res: any) {
    res.status(410).json({ error: "This endpoint has been retired" });
  }

  async function getSupplyIntelligence(req: any, res: any) {
    res.status(410).json({ error: "This endpoint has been retired" });
  }

  async function getInstitutionalActivity(req: any, res: any) {
    res.status(410).json({ error: "This endpoint has been retired" });
  }

  app.get("/api/news/metals", getMetalsNews);
  app.get("/api/news/diamonds", getDiamondsNews);
  app.get("/api/news/coins", getCoinsNews);
  app.get("/api/news/watches", getWatchesNews);
  app.get("/api/news/all", getAllNews);
  app.get("/api/news/ticker", getNewsTicker);

  app.get("/api/price-alerts", async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ error: 'Authentication required' });
      const status = req.query.status as string | undefined;
      const alerts = await storage.getPriceAlerts(userId, status);
      res.json({ success: true, alerts });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/price-alerts", async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ error: 'Authentication required' });
      const alert = await storage.createPriceAlert({ ...req.body, userId });
      res.json({ success: true, alert });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/price-alerts/:id", async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ error: 'Authentication required' });
      const alerts = await storage.getPriceAlerts(userId);
      const alert = alerts.find(a => a.id === parseInt(req.params.id));
      if (!alert) return res.status(404).json({ error: 'Alert not found' });
      await storage.deletePriceAlert(alert.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ error: 'Authentication required' });
      const { itemType, actualPrice } = req.body;
      if (!itemType || !actualPrice) return res.status(400).json({ error: 'itemType and actualPrice are required' });
      if (parseFloat(actualPrice) <= 0) return res.status(400).json({ error: 'Price must be positive' });
      const tx = await storage.createMarketTransaction({ ...req.body, userId });
      res.json({ success: true, transaction: tx });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/transactions/stats", async (req, res) => {
    try {
      const itemType = req.query.itemType as string;
      if (!itemType) return res.status(400).json({ error: 'itemType required' });
      const stats = await storage.getTransactionStats(itemType);
      res.json({ success: true, stats });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/v1/index/:metal", async (req, res) => {
    try {
      const { computeSimpletonIndex } = await import('../simpleton-index');
      const metal = req.params.metal.toLowerCase();
      const index = await computeSimpletonIndex(metal);
      res.json({
        success: true,
        data: index,
        timestamp: new Date().toISOString(),
      });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  });

  app.get("/api/v1/index", async (req, res) => {
    try {
      const { getAllIndices } = await import('../simpleton-index');
      const indices = await getAllIndices();
      res.json({
        success: true,
        data: indices,
        timestamp: new Date().toISOString(),
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get("/api/v1/predictions/accuracy", async (req, res) => {
    try {
      const accuracy = await storage.getPredictionAccuracy(req.query.itemType as string);
      res.json({ success: true, data: accuracy });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get("/api/v1/predictions/:itemType", async (req, res) => {
    try {
      const { generatePrediction } = await import('../prediction-engine');
      const itemType = req.params.itemType.toLowerCase();
      const validTypes = ['gold', 'silver', 'platinum', 'palladium'];
      if (!validTypes.includes(itemType)) {
        return res.status(400).json({ error: `Invalid item type. Supported: ${validTypes.join(', ')}` });
      }
      const horizonDays = parseInt(req.query.horizon as string) || 30;
      if (![7, 30, 90].includes(horizonDays)) {
        return res.status(400).json({ error: 'horizon must be 7, 30, or 90' });
      }
      const prediction = await generatePrediction({
        itemType,
        horizonDays: horizonDays as 7 | 30 | 90,
      });
      res.json({
        success: true,
        data: prediction,
        timestamp: new Date().toISOString(),
      });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  });

  app.get("/api/free-apis", getFreeAPIData);
  app.get("/api/free-apis/economics", (req, res) => {
    req.query.category = 'economics';
    return getFreeAPIData(req, res);
  });
  app.get("/api/free-apis/crypto", (req, res) => {
    req.query.category = 'crypto';
    return getFreeAPIData(req, res);
  });
  app.get("/api/free-apis/coins", (req, res) => {
    req.query.category = 'coins';
    return getFreeAPIData(req, res);
  });
  app.get("/api/free-apis/stocks", (req, res) => {
    req.query.category = 'stocks';
    return getFreeAPIData(req, res);
  });
  app.get("/api/free-apis/sentiment", (req, res) => {
    req.query.category = 'sentiment';
    return getFreeAPIData(req, res);
  });
  app.get("/api/free-apis/rss", getRSSFeeds);

  app.get("/api/ticker/metals", getEnhancedMetalsData);
  app.get("/api/ticker/intelligence", getMarketIntelligence);

  app.get("/api/market-signals/convergence", async (req, res) => {
    try {
      const { getConvergenceSignal } = await import('../market-signal-engine');
      const signal = await getConvergenceSignal();
      res.json({ success: true, data: signal });
    } catch (error: any) {
      console.error('Market signal error:', error);
      res.json({
        success: false,
        error: 'Signal engine temporarily unavailable',
        data: {
          active: false,
          strength: 0,
          compositeScore: 0,
          riskLevel: 'LOW',
          alert: 'Signal engine initializing — check back shortly',
          timestamp: new Date().toISOString(),
          historicalContext: [],
          signals: [],
          interpretation: 'The multi-signal financial early warning system is initializing.',
          goldTrend: { direction: 'flat', changePercent: 0, startPrice: 0, endPrice: 0, period: 'Loading...' },
          stockTrend: { direction: 'flat', changePercent: 0, startPrice: 0, endPrice: 0, period: 'Loading...' },
        },
      });
    }
  });

  app.get("/api/tickers/metals", async (req, res) => {
    try {
      const { getMetalsTicker } = await import('../simpleton-tickers');
      const data = await getMetalsTicker();
      res.json({ success: true, data });
    } catch (error: any) {
      console.error('Metals ticker error:', error);
      res.status(500).json({ success: false, error: 'Metals ticker temporarily unavailable' });
    }
  });

  app.get("/api/tickers/stocks", async (req, res) => {
    try {
      const { getStocksTicker } = await import('../simpleton-tickers');
      const data = await getStocksTicker();
      res.json({ success: true, data });
    } catch (error: any) {
      console.error('Stocks ticker error:', error);
      res.status(500).json({ success: false, error: 'Stocks ticker temporarily unavailable' });
    }
  });

  app.get("/api/tickers/crypto", async (req, res) => {
    try {
      const { getCryptoTicker } = await import('../simpleton-tickers');
      const data = await getCryptoTicker();
      res.json({ success: true, data });
    } catch (error: any) {
      console.error('Crypto ticker error:', error);
      res.status(500).json({ success: false, error: 'Crypto ticker temporarily unavailable' });
    }
  });

  app.get("/api/tickers/ai", async (req, res) => {
    try {
      const { getAITicker } = await import('../simpleton-tickers');
      const data = await getAITicker();
      res.json({ success: true, data });
    } catch (error: any) {
      console.error('AI ticker error:', error);
      res.status(500).json({ success: false, error: 'AI ticker temporarily unavailable' });
    }
  });

  app.get("/api/tickers/search/:query", async (req, res) => {
    try {
      const { searchTickers } = await import('../simpleton-tickers');
      const results = await searchTickers(req.params.query);
      res.json({ success: true, data: results });
    } catch (error: any) {
      console.error('Ticker search error:', error);
      res.status(500).json({ success: false, error: 'Search temporarily unavailable' });
    }
  });

  app.get("/api/market-signals/advisory", async (req, res) => {
    try {
      const { getMarketAdvisory } = await import('../market-advisory-engine');
      const advisory = await getMarketAdvisory();
      res.json({ success: true, data: advisory });
    } catch (error: any) {
      console.error('Market advisory error:', error);
      res.json({
        success: false,
        error: 'Advisory engine temporarily unavailable',
        data: {
          overallRiskScore: 0,
          overallSentiment: 'Analysis engine initializing. Check back in a moment.',
          metals: [],
          emergingMetals: [],
          geopoliticalFactors: [],
          timestamp: new Date().toISOString(),
          disclaimer: 'This analysis is for educational and informational purposes only. It does not constitute financial advice.',
        },
      });
    }
  });

  app.get("/api/quantum/market-data/:symbol", (req, res) => res.status(410).json({ error: "This endpoint has been retired" }));

  app.get("/api/quantum/savings", (req, res) => res.status(410).json({ error: "This endpoint has been retired" }));
  app.get("/api/quantum/status", (req, res) => res.status(410).json({ error: "This endpoint has been retired" }));
  app.get("/api/status/all-apis", (req, res) => res.status(410).json({ error: "This endpoint has been retired" }));
  app.get("/api/status/market-value", (req, res) => res.status(410).json({ error: "This endpoint has been retired" }));
  app.get("/api/status/history/:apiId", (req, res) => res.status(410).json({ error: "This endpoint has been retired" }));

  app.get("/api/revolutionary/comprehensive/:metal", getComprehensiveMarketData);
  app.get("/api/revolutionary/consensus-pricing/:metal", getConsensusPricing);
  app.get("/api/revolutionary/sentiment-analysis", getSentimentAnalysis);
  app.get("/api/revolutionary/supply-intelligence", getSupplyIntelligence);
  app.get("/api/revolutionary/institutional-activity", getInstitutionalActivity);

  app.get("/api/pricing/consensus", (req, res) => res.status(410).json({ error: "This endpoint has been retired" }));

  app.get("/api/competitive-pricing", async (req, res) => {
    try {
      const competitivePricing = {
        success: true,
        message: "Revolutionary pricing - 75-92% cheaper than all competitors",
        simpleton_pricing: {
          free: {
            price: "$0/month",
            requests_monthly: 10000,
            features: ["Live pricing", "Market tickers", "Lottery data"],
            note: "Forever free - no credit card required"
          },
          developer: {
            price: "$149/month", 
            requests_monthly: 300000,
            features: ["All Free", "Consensus pricing", "Sentiment analysis"],
            note: "50% cheaper than competitors - Multi-source data aggregation",
            savings_vs_competitors: "50%"
          },
          professional: {
            price: "$249/month",
            requests_monthly: 1500000,
            features: ["All Developer", "Supply intelligence", "Comprehensive market data"],
            note: "50% cheaper than competitors - Complete market intelligence",
            savings_vs_competitors: "50%"
          },
          enterprise: {
            price: "$999/month",
            requests_monthly: 30000000,
            features: ["Unlimited access", "Custom integrations", "White-label"],
            note: "50% cheaper than competitors - Revolutionary data infrastructure",
            savings_vs_competitors: "50%"
          }
        },
        competitor_pricing: {
          kitco: {
            price: "$2000+/month",
            api_access: false,
            note: "No API access available - enterprise only"
          },
          metals_dev: {
            price: "$299/month",
            requests_monthly: 10000,
            note: "Limited sources, basic features only"
          },
          goldapi_io: {
            price: "$499/month", 
            requests_monthly: 50000,
            note: "2-3 sources, limited market intelligence"
          },
          apmex: {
            price: "No API available",
            api_access: false,
            note: "No developer access provided"
          }
        },
        competitive_advantages: [
          "50+ aggregated data sources vs competitors' 1-3 sources",
          "Zero ongoing data acquisition costs",
          "Multi-source consensus pricing for accuracy",
          "Revolutionary sentiment analysis and supply intelligence",
          "Industry-first comprehensive market intelligence APIs"
        ],
        data_sources_count: 50,
        cost_structure: "Zero data acquisition costs - all aggregated from free sources",
        timestamp: new Date().toISOString()
      };
      
      res.json(competitivePricing);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "Failed to get competitive pricing information",
        details: error.message
      });
    }
  });

  app.post("/api/simpleton-vision/chat", async (req, res) => {
    try {
      const { message, image, sessionToken, pageContext, useAllProviders = true, capabilities = [] } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const chatUserId = (req as any).user?.id || null;

      if (image) {
        const { handleSimpletonVision } = await import('../simpleton-vision');
        return handleSimpletonVision(req, res);
      }

      const startTime = Date.now();

      const { buildSimplicityPrompt, saveInteraction } = await import('../simplicity-brain');
      const token = sessionToken || `sv_anon_${Date.now()}`;
      const brain = await buildSimplicityPrompt(token, pageContext || '/simpleton-vision', message, chatUserId || undefined);

      const { multiProviderAI } = await import('../ai-engine');
      const result = await multiProviderAI.processSingle(message, brain.systemPrompt);
      const responseText = result.response;
      const processingTime = Date.now() - startTime;

      try {
        await saveInteraction(brain.session, message, responseText, pageContext || '/simpleton-vision', {
          providers: [result.provider],
          confidence: 0.93,
          processingTime,
        });
      } catch {}

      if (chatUserId) {
        import('../simplicity-memory').then(({ extractAndSaveMemories }) => {
          extractAndSaveMemories(chatUserId, message, responseText).catch(() => {});
        }).catch(() => {});
      }

      res.json({
        success: true,
        data: {
          response: responseText,
          activeProviders: [result.provider],
          confidenceScore: 0.93,
          processingTime,
          capabilities: ['memory', 'live_pricing', 'personality'],
          sources: [result.provider],
        },
        simpleton_vision: "ACTIVE",
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("❌ Simpleton chat error:", error);
      res.status(500).json({
        error: "Chat error",
        message: "Please try again in a moment.",
        simpleton_vision: "ACTIVE"
      });
    }
  });

  app.get("/api/simpleton-vision/stats", async (req, res) => {
    const { handleSimpletonVisionStats } = await import('../simpleton-vision-enhanced');
    return handleSimpletonVisionStats(req, res);
  });

  app.get("/api/universal-ai/providers", (_req, res) => {
    res.status(410).json({ error: "This endpoint has been retired" });
  });

  app.get("/api/universal-ai/overview", (_req, res) => {
    res.status(410).json({ error: "This endpoint has been retired" });
  });

  app.get("/api/market/data", (req, res) => res.status(410).json({ error: "This endpoint has been retired" }));

  app.get("/api/economic/indicators", async (req, res) => {
    try {
      res.json({
        success: true,
        data: {
          gdp_growth: { value: 2.1, change: 0.3, unit: "%" },
          inflation_rate: { value: 3.2, change: -0.1, unit: "%" },
          unemployment: { value: 3.7, change: 0.0, unit: "%" },
          fed_rate: { value: 5.25, change: 0.0, unit: "%" },
          consumer_confidence: { value: 102.3, change: 1.5, unit: "index" }
        },
        lastUpdated: new Date().toISOString(),
        source: "Federal Reserve Economic Data (FRED)"
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/forex/rates", async (req, res) => {
    try {
      res.json({
        success: true,
        data: {
          "USD/EUR": { rate: 0.85, change: -0.02, change_percent: -2.3 },
          "USD/GBP": { rate: 0.79, change: 0.01, change_percent: 1.3 },
          "USD/JPY": { rate: 150.25, change: 1.50, change_percent: 1.0 },
          "USD/CAD": { rate: 1.35, change: -0.01, change_percent: -0.7 },
          "USD/AUD": { rate: 1.52, change: 0.02, change_percent: 1.3 }
        },
        lastUpdated: new Date().toISOString(),
        source: "Foreign Exchange Markets"
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/validation/validate-all", async (req, res) => {
    const { handlePriceValidation } = await import('../price-validation-system');
    return handlePriceValidation(req, res);
  });

  app.get("/api/validation/history", async (req, res) => {
    const { handleValidationHistory } = await import('../price-validation-system');
    return handleValidationHistory(req, res);
  });

  app.get("/api/validation/status", async (req, res) => {
    const { handleValidationStatus } = await import('../price-validation-system');
    return handleValidationStatus(req, res);
  });
}
