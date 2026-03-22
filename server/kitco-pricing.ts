import { Request, Response } from 'express';
import { revolutionaryMetalsAggregator } from './metals-aggregator';
import { toolCache, withRetry, withTimeout } from './tool-cache';

interface KitcoPricing {
  gold: number;
  silver: number;
  platinum: number;
  palladium: number;
}

const PRICING_CACHE_KEY = 'kitco:pricing';
const PRICING_TTL = 60;

export async function getKitcoPricing(): Promise<KitcoPricing | null> {
  const cached = toolCache.get<KitcoPricing>(PRICING_CACHE_KEY);
  if (cached) return cached;

  try {
    const pricing = await withRetry(
      () => withTimeout(fetchPricingFromAggregator(), 15000, 'Metal pricing fetch'),
      3,
      1000
    );
    if (pricing) {
      toolCache.set(PRICING_CACHE_KEY, pricing, PRICING_TTL);
    }
    return pricing;
  } catch (error: any) {
    console.error('Metal pricing failed after retries:', error.message);
    throw error;
  }
}

async function fetchPricingFromAggregator(): Promise<KitcoPricing> {
  const revolutionaryData = await revolutionaryMetalsAggregator.getRevolutionaryPricing();
  return {
    gold: revolutionaryData.gold,
    silver: revolutionaryData.silver,
    platinum: revolutionaryData.platinum,
    palladium: revolutionaryData.palladium
  };
}

export async function handleKitcoPricing(req: Request, res: Response) {
  try {
    const pricing = await getKitcoPricing();
    
    if (pricing) {
      // Return format expected by calculator: { success: true, prices: {...} }
      res.json({
        success: true,
        prices: pricing
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to fetch metal pricing',
        message: 'Revolutionary aggregation temporarily unavailable'
      });
    }
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to fetch metal pricing',
      message: error.message
    });
  }
}