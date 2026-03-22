import Anthropic from '@anthropic-ai/sdk';

interface DiamondSpec {
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  shape: string;
  type: 'NATURAL' | 'LAB_GROWN';
  growthMethod?: string;
  rapPricePerCarat?: number;
  rapTotalPrice?: number;
}

interface AIDiamondEstimate {
  lowEstimate: number;
  midEstimate: number;
  highEstimate: number;
  confidence: number;
  pricePerCarat: number;
  marketTrend: string;
  factors: string[];
  labGrownDiscount?: number;
  source: string;
  disclaimer: string;
}

let cachedMetalsPrices: { gold: number; silver: number; platinum: number; timestamp: number } | null = null;

async function fetchLiveMetalsPrices(): Promise<{ gold: number; silver: number; platinum: number }> {
  if (cachedMetalsPrices && Date.now() - cachedMetalsPrices.timestamp < 5 * 60 * 1000) {
    return cachedMetalsPrices;
  }

  try {
    const response = await fetch('https://api.metals.dev/api/latest?currencies=USD&metals=AU,AG,PT');
    if (response.ok) {
      const data = await response.json();
      if (data?.metals) {
        const prices = {
          gold: data.metals.AU ? (1 / data.metals.AU) * 31.1035 : 0,
          silver: data.metals.AG ? (1 / data.metals.AG) * 31.1035 : 0,
          platinum: data.metals.PT ? (1 / data.metals.PT) * 31.1035 : 0,
          timestamp: Date.now()
        };
        if (prices.gold > 0) {
          cachedMetalsPrices = prices;
          return prices;
        }
      }
    }
  } catch (e) {}

  try {
    const response = await fetch('https://api.freeforexapi.com/api/live?pairs=XAUUSD,XAGUSD');
    if (response.ok) {
      const data = await response.json();
      if (data?.rates) {
        const prices = {
          gold: data.rates.XAUUSD?.rate || 0,
          silver: data.rates.XAGUSD?.rate || 0,
          platinum: 0,
          timestamp: Date.now()
        };
        if (prices.gold > 0) {
          cachedMetalsPrices = prices;
          return prices;
        }
      }
    }
  } catch (e) {}

  return { gold: 0, silver: 0, platinum: 0 };
}

const estimateCache = new Map<string, { data: AIDiamondEstimate; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000;

export async function getAIDiamondPrice(spec: DiamondSpec): Promise<AIDiamondEstimate> {
  const cacheKey = `${spec.carat}_${spec.color}_${spec.clarity}_${spec.cut}_${spec.shape}_${spec.type}`;
  const cached = estimateCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const metalsPrices = await fetchLiveMetalsPrices();
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const prompt = `You are a professional diamond pricing expert with deep knowledge of the Rapaport Price List, IDEX, and wholesale/retail diamond markets worldwide. Today is ${today}.

CURRENT LIVE MARKET CONTEXT:
- Gold spot price: $${metalsPrices.gold > 0 ? metalsPrices.gold.toFixed(2) : 'unavailable'}/oz
- Silver spot price: $${metalsPrices.silver > 0 ? metalsPrices.silver.toFixed(2) : 'unavailable'}/oz
- Platinum spot price: $${metalsPrices.platinum > 0 ? metalsPrices.platinum.toFixed(2) : 'unavailable'}/oz
${metalsPrices.gold > 2500 ? '- Note: Gold is at historically HIGH levels, which typically correlates with INCREASED diamond demand as alternative luxury store of value' : ''}
${metalsPrices.gold > 0 && metalsPrices.gold < 1800 ? '- Note: Gold at lower levels may indicate reduced luxury spending overall' : ''}

DIAMOND SPECIFICATIONS:
- Carat Weight: ${spec.carat}
- Color Grade: ${spec.color} (GIA scale D-M)
- Clarity Grade: ${spec.clarity} (GIA scale FL-I3)
- Cut Grade: ${spec.cut}
- Shape: ${spec.shape}
- Type: ${spec.type === 'LAB_GROWN' ? `Lab-Grown Diamond (${spec.growthMethod || 'CVD'} method)` : 'Natural Diamond'}
${spec.rapPricePerCarat ? `
RAPAPORT PRICE LIST REFERENCE (ACTUAL CURRENT DATA):
- Rapaport Price Per Carat: $${spec.rapPricePerCarat.toLocaleString()}
- Rapaport Total (${spec.carat}ct): $${(spec.rapTotalPrice || spec.rapPricePerCarat * spec.carat).toLocaleString()}
- USE THIS AS YOUR PRIMARY BENCHMARK. The Rapaport list is the wholesale asking price. Actual wholesale trades typically at 10-30% below Rapaport list. Retail is typically at or above Rapaport list.
` : ''}
IMPORTANT MARKET FACTORS TO CONSIDER:
1. Lab-grown diamond prices have dropped significantly since 2022-2023. As of 2024-2025, lab-grown diamonds trade at approximately 60-85% BELOW natural diamond prices for comparable specs.
2. Natural diamond prices have been relatively soft since late 2022, with slight recovery in late 2024.
3. Round brilliant cuts command the highest price premium. Fancy shapes typically trade 15-40% below rounds.
4. The Rapaport Price List is the industry benchmark but represents HIGH asking prices - actual wholesale trades often at 10-30% below Rapaport "list" depending on market conditions.
5. Fluorescence can reduce value 5-15% for higher colors (D-G), less impact on lower colors.
6. Diamonds over 1ct, 2ct, and 5ct have significant price jumps at these "magic" carat weights.

RESPOND WITH ONLY A JSON OBJECT (no markdown, no explanation, no code blocks):
{
  "lowEstimate": <lowest reasonable wholesale/trade price in USD for this exact stone>,
  "midEstimate": <most likely fair market retail price in USD>,
  "highEstimate": <highest reasonable retail/premium price in USD>,
  "pricePerCarat": <mid estimate divided by carat weight>,
  "confidence": <your confidence level 1-100>,
  "marketTrend": "<one of: rising, falling, stable, volatile>",
  "factors": ["<factor 1 affecting price>", "<factor 2>", "<factor 3>"],
  "labGrownDiscount": <if lab-grown, percentage discount from natural, e.g. 75 means 75% cheaper than natural, null if natural>
}`;

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }]
    });

    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI');
    }

    let jsonStr = textContent.text.trim();
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const aiResult = JSON.parse(jsonStr);

    const estimate: AIDiamondEstimate = {
      lowEstimate: Math.round(aiResult.lowEstimate || 0),
      midEstimate: Math.round(aiResult.midEstimate || 0),
      highEstimate: Math.round(aiResult.highEstimate || 0),
      pricePerCarat: Math.round(aiResult.pricePerCarat || 0),
      confidence: aiResult.confidence || 70,
      marketTrend: aiResult.marketTrend || 'stable',
      factors: aiResult.factors || [],
      labGrownDiscount: aiResult.labGrownDiscount || undefined,
      source: 'Simpleton Vision™ AI Market Intelligence',
      disclaimer: 'AI-estimated market value based on current market conditions and historical data. For exact pricing, consult a certified gemologist or request a professional appraisal.'
    };

    estimateCache.set(cacheKey, { data: estimate, timestamp: Date.now() });

    if (estimateCache.size > 500) {
      const oldestKey = estimateCache.keys().next().value;
      if (oldestKey) estimateCache.delete(oldestKey);
    }

    return estimate;
  } catch (error: any) {
    console.error('AI Diamond pricing error:', error?.message || error);
    throw new Error('AI diamond pricing temporarily unavailable');
  }
}
