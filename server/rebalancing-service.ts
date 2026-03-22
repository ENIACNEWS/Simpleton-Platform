/**
 * Automated Portfolio Rebalancing Service
 * Provides sophisticated rebalancing algorithms for precious metals portfolios
 */

import { db } from "./db";
import { portfolios, portfolioItems, rebalanceHistory } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

export interface PortfolioAllocation {
  goldValue: number;
  silverValue: number;
  platinumValue: number;
  totalValue: number;
  goldPercentage: number;
  silverPercentage: number;
  platinumPercentage: number;
}

export interface RebalanceRecommendation {
  action: "buy" | "sell";
  metalType: "gold" | "silver" | "platinum";
  amount: number; // in grams
  value: number; // in USD
  reason: string;
}

export interface RebalanceAnalysis {
  currentAllocation: PortfolioAllocation;
  targetAllocation: PortfolioAllocation;
  needsRebalancing: boolean;
  triggerReason?: string;
  recommendations: RebalanceRecommendation[];
  estimatedCosts: number;
}

export class RebalancingService {
  
  /**
   * Calculate current portfolio allocation
   */
  async calculateCurrentAllocation(
    portfolioId: number, 
    prices: { gold: number; silver: number; platinum: number }
  ): Promise<PortfolioAllocation> {
    
    const items = await db
      .select()
      .from(portfolioItems)
      .where(eq(portfolioItems.portfolioId, portfolioId));

    let goldValue = 0;
    let silverValue = 0;
    let platinumValue = 0;

    items.forEach(item => {
      const weight = parseFloat(item.weight?.toString() || "0");
      const purity = parseFloat(item.purity?.toString() || "1");
      const quantity = parseFloat(item.quantity?.toString() || "1");
      const pureMetalWeight = weight * purity * quantity;

      switch (item.metalType) {
        case "gold":
          goldValue += pureMetalWeight * (prices.gold / 31.1035); // Convert oz to gram price
          break;
        case "silver":
          silverValue += pureMetalWeight * (prices.silver / 31.1035);
          break;
        case "platinum":
          platinumValue += pureMetalWeight * (prices.platinum / 31.1035);
          break;
      }
    });

    const totalValue = goldValue + silverValue + platinumValue;

    return {
      goldValue,
      silverValue,
      platinumValue,
      totalValue,
      goldPercentage: totalValue > 0 ? (goldValue / totalValue) * 100 : 0,
      silverPercentage: totalValue > 0 ? (silverValue / totalValue) * 100 : 0,
      platinumPercentage: totalValue > 0 ? (platinumValue / totalValue) * 100 : 0,
    };
  }

  /**
   * Get portfolio target allocation
   */
  async getTargetAllocation(portfolioId: number): Promise<PortfolioAllocation> {
    const [portfolio] = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.id, portfolioId));

    if (!portfolio) {
      throw new Error("Portfolio not found");
    }

    const targetGold = parseFloat(portfolio.targetGoldPercentage?.toString() || "60");
    const targetSilver = parseFloat(portfolio.targetSilverPercentage?.toString() || "30");
    const targetPlatinum = parseFloat(portfolio.targetPlatinumPercentage?.toString() || "10");

    return {
      goldValue: 0, // Will be calculated based on current total value
      silverValue: 0,
      platinumValue: 0,
      totalValue: 0,
      goldPercentage: targetGold,
      silverPercentage: targetSilver,
      platinumPercentage: targetPlatinum,
    };
  }

  /**
   * Determine if rebalancing is needed
   */
  async needsRebalancing(portfolioId: number, prices: any): Promise<{ needed: boolean; reason?: string }> {
    const [portfolio] = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.id, portfolioId));

    if (!portfolio || !portfolio.autoRebalanceEnabled) {
      return { needed: false };
    }

    const current = await this.calculateCurrentAllocation(portfolioId, prices);
    const target = await this.getTargetAllocation(portfolioId);
    const threshold = parseFloat(portfolio.thresholdPercentage?.toString() || "5");

    // Check if any allocation is beyond threshold
    const goldDrift = Math.abs(current.goldPercentage - target.goldPercentage);
    const silverDrift = Math.abs(current.silverPercentage - target.silverPercentage);
    const platinumDrift = Math.abs(current.platinumPercentage - target.platinumPercentage);

    if (goldDrift > threshold || silverDrift > threshold || platinumDrift > threshold) {
      return { 
        needed: true, 
        reason: `Allocation drift exceeded ${threshold}% threshold` 
      };
    }

    // Check if scheduled rebalancing is due
    const frequency = portfolio.rebalanceFrequency || "monthly";
    const lastRebalance = portfolio.lastRebalanceDate;
    const now = new Date();

    if (lastRebalance) {
      const daysSinceLastRebalance = (now.getTime() - lastRebalance.getTime()) / (1000 * 60 * 60 * 24);
      
      let scheduledRebalance = false;
      switch (frequency) {
        case "daily":
          scheduledRebalance = daysSinceLastRebalance >= 1;
          break;
        case "weekly":
          scheduledRebalance = daysSinceLastRebalance >= 7;
          break;
        case "monthly":
          scheduledRebalance = daysSinceLastRebalance >= 30;
          break;
        case "quarterly":
          scheduledRebalance = daysSinceLastRebalance >= 90;
          break;
      }

      if (scheduledRebalance) {
        return { 
          needed: true, 
          reason: `Scheduled ${frequency} rebalancing due` 
        };
      }
    }

    return { needed: false };
  }

  /**
   * Generate rebalancing recommendations
   */
  async generateRebalanceRecommendations(
    portfolioId: number,
    prices: { gold: number; silver: number; platinum: number }
  ): Promise<RebalanceAnalysis> {
    
    const current = await this.calculateCurrentAllocation(portfolioId, prices);
    const target = await this.getTargetAllocation(portfolioId);
    const { needed, reason } = await this.needsRebalancing(portfolioId, prices);

    // Update target values based on current total value
    target.totalValue = current.totalValue;
    target.goldValue = (target.goldPercentage / 100) * current.totalValue;
    target.silverValue = (target.silverPercentage / 100) * current.totalValue;
    target.platinumValue = (target.platinumPercentage / 100) * current.totalValue;

    const recommendations: RebalanceRecommendation[] = [];

    if (needed) {
      // Calculate required changes
      const goldDifference = target.goldValue - current.goldValue;
      const silverDifference = target.silverValue - current.silverValue;
      const platinumDifference = target.platinumValue - current.platinumValue;

      const goldPricePerGram = prices.gold / 31.1035;
      const silverPricePerGram = prices.silver / 31.1035;
      const platinumPricePerGram = prices.platinum / 31.1035;

      // Generate recommendations for each metal
      if (Math.abs(goldDifference) > 10) { // Only recommend if difference > $10
        recommendations.push({
          action: goldDifference > 0 ? "buy" : "sell",
          metalType: "gold",
          amount: Math.abs(goldDifference) / goldPricePerGram,
          value: Math.abs(goldDifference),
          reason: `Adjust gold allocation from ${current.goldPercentage.toFixed(1)}% to ${target.goldPercentage.toFixed(1)}%`
        });
      }

      if (Math.abs(silverDifference) > 10) {
        recommendations.push({
          action: silverDifference > 0 ? "buy" : "sell",
          metalType: "silver",
          amount: Math.abs(silverDifference) / silverPricePerGram,
          value: Math.abs(silverDifference),
          reason: `Adjust silver allocation from ${current.silverPercentage.toFixed(1)}% to ${target.silverPercentage.toFixed(1)}%`
        });
      }

      if (Math.abs(platinumDifference) > 10) {
        recommendations.push({
          action: platinumDifference > 0 ? "buy" : "sell",
          metalType: "platinum",
          amount: Math.abs(platinumDifference) / platinumPricePerGram,
          value: Math.abs(platinumDifference),
          reason: `Adjust platinum allocation from ${current.platinumPercentage.toFixed(1)}% to ${target.platinumPercentage.toFixed(1)}%`
        });
      }
    }

    // Calculate estimated transaction costs (simplified)
    const estimatedCosts = recommendations.reduce((total, rec) => total + (rec.value * 0.02), 0); // 2% transaction cost

    return {
      currentAllocation: current,
      targetAllocation: target,
      needsRebalancing: needed,
      triggerReason: reason,
      recommendations,
      estimatedCosts
    };
  }

  /**
   * Execute rebalancing (create history record)
   */
  async executeRebalancing(
    portfolioId: number,
    analysis: RebalanceAnalysis,
    triggerReason: string
  ): Promise<void> {
    
    // Create rebalance history record
    await db.insert(rebalanceHistory).values({
      portfolioId,
      triggerReason,
      beforeGoldPercentage: analysis.currentAllocation.goldPercentage.toString(),
      beforeSilverPercentage: analysis.currentAllocation.silverPercentage.toString(),
      beforePlatinumPercentage: analysis.currentAllocation.platinumPercentage.toString(),
      beforeTotalValue: analysis.currentAllocation.totalValue.toString(),
      afterGoldPercentage: analysis.targetAllocation.goldPercentage.toString(),
      afterSilverPercentage: analysis.targetAllocation.silverPercentage.toString(),
      afterPlatinumPercentage: analysis.targetAllocation.platinumPercentage.toString(),
      afterTotalValue: analysis.targetAllocation.totalValue.toString(),
      transactions: JSON.stringify(analysis.recommendations),
      status: "pending"
    });

    // Update portfolio last rebalance date
    const nextRebalanceDate = await this.calculateNextRebalanceDate(portfolioId);
    
    await db
      .update(portfolios)
      .set({ 
        lastRebalanceDate: new Date(),
        nextRebalanceDate: nextRebalanceDate
      })
      .where(eq(portfolios.id, portfolioId));
  }

  /**
   * Calculate next rebalance date based on frequency
   */
  private async calculateNextRebalanceDate(portfolioId: number): Promise<Date> {
    const [portfolio] = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.id, portfolioId));

    const frequency = portfolio?.rebalanceFrequency || "monthly";
    const now = new Date();

    switch (frequency) {
      case "daily":
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case "weekly":
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case "monthly":
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth;
      case "quarterly":
        const nextQuarter = new Date(now);
        nextQuarter.setMonth(nextQuarter.getMonth() + 3);
        return nextQuarter;
      default:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Get rebalancing history for a portfolio
   */
  async getRebalanceHistory(portfolioId: number): Promise<any[]> {
    return db
      .select()
      .from(rebalanceHistory)
      .where(eq(rebalanceHistory.portfolioId, portfolioId))
      .orderBy(sql`${rebalanceHistory.rebalanceDate} DESC`)
      .limit(10);
  }
}

export const rebalancingService = new RebalancingService();