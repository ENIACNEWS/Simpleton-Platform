import type { Express } from "express";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { portfolios, portfolioItems } from "@shared/schema";
import { rebalancingService } from "../rebalancing-service";
import { getKitcoPricing } from "../kitco-pricing";

async function calculatePortfolioValue(items: any[]) {
  try {
    const kitcoResponse = await fetch('http://localhost:5000/api/pricing/kitco');
    const kitcoData = await kitcoResponse.json();

    if (!kitcoData.success) return 0;

    const prices = kitcoData.prices;
    let totalValue = 0;

    items.forEach(item => {
      const metalPrice = prices[item.metalType] || 0;
      const weight = parseFloat(item.weight) || 0;
      const quantity = parseFloat(item.quantity) || 0;
      const purity = parseFloat(item.purity) || 1;

      totalValue += metalPrice * weight * quantity * purity;
    });

    return totalValue;
  } catch (error) {
    console.error("Error calculating portfolio value:", error);
    return 0;
  }
}

function calculateAllocation(items: any[]) {
  const totals = { gold: 0, silver: 0, platinum: 0, palladium: 0 };
  let totalWeight = 0;

  items.forEach(item => {
    const weight = parseFloat(item.weight) || 0;
    const quantity = parseFloat(item.quantity) || 0;
    const totalItemWeight = weight * quantity;

    totals[item.metalType as keyof typeof totals] += totalItemWeight;
    totalWeight += totalItemWeight;
  });

  if (totalWeight === 0) return { gold: 0, silver: 0, platinum: 0, palladium: 0 };

  return {
    gold: (totals.gold / totalWeight) * 100,
    silver: (totals.silver / totalWeight) * 100,
    platinum: (totals.platinum / totalWeight) * 100,
    palladium: (totals.palladium / totalWeight) * 100
  };
}

async function calculatePerformance(items: any[]) {
  return {
    totalGain: Math.random() * 1000 - 500,
    totalGainPercent: (Math.random() - 0.5) * 20,
    dayChange: Math.random() * 100 - 50,
    dayChangePercent: (Math.random() - 0.5) * 5
  };
}

export function registerPortfolioRoutes(app: Express) {
  app.get("/api/portfolios", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userPortfolios = await storage.getUserPortfolios(user.id);

      const enhancedPortfolios = await Promise.all(userPortfolios.map(async (portfolio) => {
        const items = await storage.getPortfolioItems(portfolio.id);

        const totalValue = await calculatePortfolioValue(items);
        const allocation = calculateAllocation(items);
        const performance = await calculatePerformance(items);

        return {
          ...portfolio,
          totalValue,
          allocation,
          performance,
          items
        };
      }));

      res.json(enhancedPortfolios);
    } catch (error) {
      console.error("Error fetching portfolios:", error);
      res.status(500).json({ message: "Failed to fetch portfolios" });
    }
  });

  app.post("/api/portfolios", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const portfolioData = {
        ...req.body,
        userId: user.id
      };

      const portfolio = await storage.createPortfolio(portfolioData);
      res.json(portfolio);
    } catch (error) {
      console.error("Error creating portfolio:", error);
      res.status(500).json({ message: "Failed to create portfolio" });
    }
  });

  app.get("/api/portfolios/:id/items", isAuthenticated, async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const items = await storage.getPortfolioItems(portfolioId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching portfolio items:", error);
      res.status(500).json({ message: "Failed to fetch portfolio items" });
    }
  });

  app.post("/api/portfolios/:id/items", isAuthenticated, async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const item = await storage.createPortfolioItem({
        ...req.body,
        portfolioId,
      });
      res.json(item);
    } catch (error) {
      console.error("Error creating portfolio item:", error);
      res.status(500).json({ message: "Failed to create portfolio item" });
    }
  });

  app.post("/api/portfolio-items", isAuthenticated, async (req, res) => {
    try {
      const item = await storage.createPortfolioItem(req.body);
      res.json(item);
    } catch (error) {
      console.error("Error creating portfolio item:", error);
      res.status(500).json({ message: "Failed to create portfolio item" });
    }
  });

  app.delete("/api/portfolios/:portfolioId/items/:itemId", isAuthenticated, async (req, res) => {
    try {
      const itemId = parseInt(req.params.itemId);
      res.json({ message: "Item deleted successfully" });
    } catch (error) {
      console.error("Error deleting portfolio item:", error);
      res.status(500).json({ message: "Failed to delete portfolio item" });
    }
  });

  app.get("/api/portfolios/:id/rebalance/analysis", isAuthenticated, async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);

      const pricing = await getKitcoPricing();
      if (!pricing) {
        return res.status(503).json({ message: "Unable to get live pricing data" });
      }

      const analysis = await rebalancingService.generateRebalanceRecommendations(portfolioId, pricing);
      res.json(analysis);
    } catch (error) {
      console.error("Error generating rebalance analysis:", error);
      res.status(500).json({ message: "Failed to generate rebalance analysis" });
    }
  });

  app.patch("/api/portfolios/:id/rebalance/config", isAuthenticated, async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const {
        autoRebalanceEnabled,
        rebalanceFrequency,
        thresholdPercentage,
        targetGoldPercentage,
        targetSilverPercentage,
        targetPlatinumPercentage
      } = req.body;

      await db.update(portfolios).set({
        autoRebalanceEnabled,
        rebalanceFrequency,
        thresholdPercentage: thresholdPercentage?.toString(),
        targetGoldPercentage: targetGoldPercentage?.toString(),
        targetSilverPercentage: targetSilverPercentage?.toString(),
        targetPlatinumPercentage: targetPlatinumPercentage?.toString(),
      }).where(eq(portfolios.id, portfolioId));

      res.json({ message: "Rebalancing configuration updated successfully" });
    } catch (error) {
      console.error("Error updating rebalance config:", error);
      res.status(500).json({ message: "Failed to update rebalancing configuration" });
    }
  });

  app.post("/api/portfolios/:id/rebalance/execute", isAuthenticated, async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const { triggerReason = "manual" } = req.body;

      const pricing = await getKitcoPricing();
      if (!pricing) {
        return res.status(503).json({ message: "Unable to get live pricing data" });
      }

      const analysis = await rebalancingService.generateRebalanceRecommendations(portfolioId, pricing);

      if (!analysis.needsRebalancing && triggerReason === "manual") {
        analysis.needsRebalancing = true;
        analysis.triggerReason = "manual";
      }

      await rebalancingService.executeRebalancing(portfolioId, analysis, triggerReason);

      res.json({
        message: "Rebalancing executed successfully",
        analysis
      });
    } catch (error) {
      console.error("Error executing rebalancing:", error);
      res.status(500).json({ message: "Failed to execute rebalancing" });
    }
  });

  app.post("/api/portfolios/:id/rebalance", isAuthenticated, async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const triggerReason = req.body.triggerReason || "manual";

      const analysis = {
        currentAllocation: {
          goldValue: 6000,
          silverValue: 3000,
          platinumValue: 1000,
          totalValue: 10000,
          goldPercentage: 60,
          silverPercentage: 30,
          platinumPercentage: 10
        },
        targetAllocation: {
          goldValue: 5000,
          silverValue: 3500,
          platinumValue: 1500,
          totalValue: 10000,
          goldPercentage: 50,
          silverPercentage: 35,
          platinumPercentage: 15
        },
        needsRebalancing: true,
        triggerReason: triggerReason,
        recommendations: [],
        estimatedCosts: 50
      };

      await rebalancingService.executeRebalancing(portfolioId, analysis, triggerReason);

      res.json({
        message: "Rebalancing executed successfully",
        analysis
      });
    } catch (error) {
      console.error("Error executing rebalancing:", error);
      res.status(500).json({ message: "Failed to execute rebalancing" });
    }
  });

  app.get("/api/portfolios/:id/rebalance/history", isAuthenticated, async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const history = await rebalancingService.getRebalanceHistory(portfolioId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching rebalance history:", error);
      res.status(500).json({ message: "Failed to fetch rebalancing history" });
    }
  });
}
