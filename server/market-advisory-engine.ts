import { getKitcoPricing } from './kitco-pricing';
import { getConvergenceSignal } from './market-signal-engine';

interface PricePoint {
  date: string;
  price: number;
}

type Outlook = 'STRONG BUY' | 'BUY' | 'HOLD' | 'CAUTIOUS' | 'SELL';

interface MetalAdvisory {
  metal: string;
  symbol: string;
  currentPrice: number | null;
  outlook: Outlook;
  confidence: number;
  riskScore: number;
  headline: string;
  reasoning: string;
  keyFactors: string[];
  timeHorizon: string;
}

interface EmergingMetalAdvisory {
  metal: string;
  why: string;
  demandDriver: string;
  outlook: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  timeframe: string;
}

interface MarketAdvisoryResult {
  overallRiskScore: number;
  overallSentiment: string;
  metals: MetalAdvisory[];
  emergingMetals: EmergingMetalAdvisory[];
  geopoliticalFactors: string[];
  timestamp: string;
  disclaimer: string;
}

const GEOPOLITICAL_INTELLIGENCE: Record<string, { factor: string; impact: string; affectedMetals: string[] }> = {
  usd_dominance: {
    factor: 'US Dollar & Reserve Currency Dynamics',
    impact: 'BRICS nations actively pursuing alternatives to USD. De-dollarization efforts push central banks to accumulate gold. Every 1% decline in Dollar Index historically correlates with ~0.8% gold price increase.',
    affectedMetals: ['gold', 'silver'],
  },
  central_bank_buying: {
    factor: 'Central Bank Gold Accumulation',
    impact: 'Central banks globally purchased 1,037 tonnes of gold in 2023 — the second-highest year on record. China, Poland, Turkey, India are the largest buyers. This sustained institutional demand creates a price floor.',
    affectedMetals: ['gold'],
  },
  green_energy_transition: {
    factor: 'Global Clean Energy Transition',
    impact: 'Solar panel manufacturing consumed 161M oz of silver in 2023, up 64% since 2020. Each GW of solar capacity requires ~1M oz of silver. Global solar installations projected to triple by 2030. Silver has no substitute in photovoltaic cells.',
    affectedMetals: ['silver', 'platinum', 'palladium'],
  },
  ev_revolution: {
    factor: 'Electric Vehicle & Battery Technology',
    impact: 'Hydrogen fuel cell vehicles use 30-60g of platinum per vehicle. EV battery contacts use palladium and silver. The shift from ICE to EVs is reshaping platinum group metal demand curves. Catalytic converter palladium demand will decline, but hydrogen fuel cell demand rises.',
    affectedMetals: ['platinum', 'palladium', 'silver'],
  },
  supply_constraints: {
    factor: 'Mining Supply Constraints',
    impact: 'Primary silver mines produce only 26% of global silver supply — the rest is byproduct mining. No new major gold discoveries in 20+ years. Platinum mining concentrated 70% in South Africa (Eskom power instability). Supply inelastic to price increases.',
    affectedMetals: ['gold', 'silver', 'platinum'],
  },
  geopolitical_tension: {
    factor: 'Global Conflict & Uncertainty',
    impact: 'Active conflicts in Ukraine-Russia, Middle East tensions, Taiwan Strait concerns. Military spending at Cold War levels globally. Defense electronics require silver, palladium, and rare metals. Geopolitical uncertainty drives safe-haven demand for gold.',
    affectedMetals: ['gold', 'silver', 'palladium'],
  },
  inflation_persistence: {
    factor: 'Persistent Inflation & Monetary Policy',
    impact: 'Inflation above 3% historically correlates with precious metals outperformance. Real interest rates (adjusted for inflation) determine opportunity cost of holding metals. When rates are cut, metals typically surge.',
    affectedMetals: ['gold', 'silver'],
  },
  tech_demand: {
    factor: 'Technology & AI Hardware Demand',
    impact: 'AI data centers require massive amounts of silver for electrical contacts and thermal management. 5G infrastructure uses silver-palladium paste. Semiconductor manufacturing uses gold bonding wire. The AI boom is creating unprecedented industrial demand for precious metals.',
    affectedMetals: ['silver', 'gold', 'palladium'],
  },
};

const EMERGING_METALS: EmergingMetalAdvisory[] = [
  {
    metal: 'Rhodium',
    why: 'Rarest precious metal on Earth. 80% mined in South Africa. Used in catalytic converters, chemical processes, and specialty glass. Hit $29,000/oz in 2021. Only ~30 tonnes mined annually worldwide. Supply disruptions cause extreme price spikes.',
    demandDriver: 'Stricter global emissions standards (Euro 7, China 6b) require more rhodium per catalytic converter. No substitute exists. EV transition reduces long-term demand but tightening regulations accelerate near-term need.',
    outlook: 'Volatile but potentially explosive. Supply concentration risk is extreme.',
    riskLevel: 'HIGH',
    timeframe: '2-5 years',
  },
  {
    metal: 'Iridium',
    why: 'Used in hydrogen fuel cell membranes (PEM electrolyzers), satellite components, and spark plugs. Global production is only ~7 tonnes/year. The hydrogen economy cannot scale without iridium.',
    demandDriver: 'Green hydrogen production targets from EU, Japan, South Korea, and Australia require PEM electrolyzers that use iridium. Demand projected to increase 5-10x by 2030.',
    outlook: 'Strong long-term potential as hydrogen economy scales. Extremely limited supply creates asymmetric upside.',
    riskLevel: 'HIGH',
    timeframe: '3-7 years',
  },
  {
    metal: 'Osmium',
    why: 'Rarest stable element on Earth. Emerging as a collectible/investment metal with crystallized osmium gaining traction in Europe. Used in specialized medical implants and instrument tips.',
    demandDriver: 'Osmium Institute in Germany pioneered crystallized osmium as a store of value. Limited awareness creates early-mover opportunity. Only ~1 tonne exists above ground.',
    outlook: 'Speculative but unique. First-mover advantage if adoption spreads.',
    riskLevel: 'HIGH',
    timeframe: '5-10 years',
  },
  {
    metal: 'Silver (Industrial Supercycle)',
    why: 'Silver is already tracked here, but its industrial supercycle deserves separate attention. Solar + EV + 5G + AI demand is consuming silver faster than it can be mined. 2023 was the 3rd consecutive year of supply deficit.',
    demandDriver: 'Solar panel silver usage growing 15-20% annually. Global silver supply deficit of 184M oz in 2023. Above-ground inventories declining. LBMA and COMEX vaults at multi-year lows.',
    outlook: 'Industrial demand could push silver to historic highs if deficit persists.',
    riskLevel: 'MODERATE',
    timeframe: '1-3 years',
  },
  {
    metal: 'Rhenium',
    why: 'Critical for jet engine superalloys (used by GE, Rolls-Royce, Pratt & Whitney). Only ~50 tonnes produced annually as a byproduct of molybdenum mining. No substitute in high-temperature applications.',
    demandDriver: 'Global aviation fleet projected to double by 2040. Each new jet engine uses 3-5kg of rhenium. Military jet programs (F-35, B-21 Raider) consume significant quantities.',
    outlook: 'Steady institutional demand with constrained supply. Less volatile than rhodium.',
    riskLevel: 'MODERATE',
    timeframe: '3-5 years',
  },
];

async function fetchYahooData(symbol: string, range: string = '6mo'): Promise<PricePoint[]> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=1d`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    if (!response.ok) return [];
    const data = await response.json();
    const result = data?.chart?.result?.[0];
    if (!result?.timestamp || !result?.indicators?.quote?.[0]?.close) return [];
    const timestamps = result.timestamp as number[];
    const closes = result.indicators.quote[0].close as (number | null)[];
    const points: PricePoint[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (closes[i] !== null && closes[i] !== undefined) {
        points.push({ date: new Date(timestamps[i] * 1000).toISOString().split('T')[0], price: closes[i] as number });
      }
    }
    return points;
  } catch {
    return [];
  }
}

function calcTrend(data: PricePoint[], days: number): { pct: number; dir: 'up' | 'down' | 'flat' } {
  const slice = data.slice(-days);
  if (slice.length < 2) return { pct: 0, dir: 'flat' };
  const start = slice[0].price;
  const end = slice[slice.length - 1].price;
  const pct = ((end - start) / start) * 100;
  return { pct: +pct.toFixed(2), dir: pct > 1.5 ? 'up' : pct < -1.5 ? 'down' : 'flat' };
}

function calcVolatility(data: PricePoint[]): number {
  if (data.length < 10) return 0;
  const returns: number[] = [];
  for (let i = 1; i < data.length; i++) {
    returns.push((data[i].price - data[i - 1].price) / data[i - 1].price);
  }
  const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
  const variance = returns.reduce((s, r) => s + Math.pow(r - mean, 2), 0) / returns.length;
  return Math.sqrt(variance) * Math.sqrt(252) * 100;
}

function calcRSI(data: PricePoint[], period: number = 14): number {
  if (data.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = data.length - period; i < data.length; i++) {
    const diff = data[i].price - data[i - 1].price;
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return +(100 - 100 / (1 + rs)).toFixed(1);
}

function calcMA(data: PricePoint[], period: number): number {
  const slice = data.slice(-period);
  if (slice.length < period) return 0;
  return slice.reduce((s, p) => s + p.price, 0) / period;
}

function analyzeMetal(
  name: string,
  symbol: string,
  data: PricePoint[],
  livePrice: number | null,
  goldSilverRatio: number | null,
  crisisRisk: number,
  vixLevel: number,
  yieldCurveHealthy: boolean,
  treasuryYield: number,
): MetalAdvisory {
  const price = livePrice ?? (data.length > 0 ? data[data.length - 1].price : null);

  if (data.length < 30) {
    return {
      metal: name, symbol, currentPrice: price,
      outlook: 'HOLD', confidence: 30, riskScore: 50,
      headline: `Insufficient market data for ${name} analysis`,
      reasoning: 'Not enough historical data available to generate a confident opinion. Hold current positions and revisit.',
      keyFactors: ['Data temporarily limited'], timeHorizon: 'Short-term',
    };
  }

  const trend30 = calcTrend(data, 30);
  const trend90 = calcTrend(data, 90);
  const rsi = calcRSI(data);
  const volatility = calcVolatility(data.slice(-60));
  const ma50 = calcMA(data, 50);
  const ma200 = calcMA(data, 200);
  const currentP = data[data.length - 1].price;
  const aboveMA50 = currentP > ma50 && ma50 > 0;
  const aboveMA200 = currentP > ma200 && ma200 > 0;
  const goldenCross = ma50 > ma200 && ma50 > 0 && ma200 > 0;

  let bullScore = 0;
  let bearScore = 0;
  const factors: string[] = [];

  if (trend90.dir === 'up') { bullScore += 15; factors.push('Price has been climbing steadily over the past 3 months'); }
  else if (trend90.dir === 'down') { bearScore += 15; factors.push('Price has been declining over the past 3 months'); }

  if (trend30.dir === 'up') { bullScore += 10; factors.push('Recent price action shows continued strength'); }
  else if (trend30.dir === 'down') { bearScore += 10; factors.push('Recent pullback in the past month'); }

  if (rsi > 70) { bearScore += 15; factors.push('Price may have run up too fast — a cooldown could create a better entry'); }
  else if (rsi < 30) { bullScore += 15; factors.push('Price appears oversold — potential buying opportunity'); }

  if (goldenCross) { bullScore += 12; factors.push('Long-term price structure is constructive'); }
  if (aboveMA200) { bullScore += 8; } else if (ma200 > 0) { bearScore += 8; }
  if (aboveMA50) { bullScore += 5; } else if (ma50 > 0) { bearScore += 5; }

  if (crisisRisk >= 50) { bullScore += 10; factors.push('Global uncertainty is elevated — investors are seeking safe havens'); }
  if (vixLevel > 25) { bullScore += 8; factors.push('Wall Street fear is elevated — historically positive for precious metals'); }
  if (!yieldCurveHealthy) { bullScore += 8; factors.push('Economic warning signs suggest recession concerns — supports metals'); }
  if (treasuryYield > 4.5) { bearScore += 5; factors.push('Higher savings rates competing with metals for investor dollars'); }
  else if (treasuryYield < 3.5) { bullScore += 5; factors.push('Low savings rates make metals more attractive by comparison'); }

  if (name === 'Gold') {
    bullScore += 5;
    factors.push('Central banks worldwide are accumulating gold at a historic pace');
    factors.push('Countries moving away from the US dollar — increasing gold demand');
  }

  if (name === 'Silver') {
    if (goldSilverRatio && goldSilverRatio > 80) {
      bullScore += 12;
      factors.push(`Silver is historically cheap relative to gold right now — ratio at ${goldSilverRatio.toFixed(0)}:1`);
    } else if (goldSilverRatio && goldSilverRatio > 70) {
      bullScore += 6;
      factors.push(`Silver has room to catch up to gold's performance — ratio at ${goldSilverRatio.toFixed(0)}:1`);
    }
    bullScore += 8;
    factors.push('Solar panel demand is consuming silver at record rates — 3rd consecutive year of supply deficit');
  }

  if (name === 'Platinum') {
    if (livePrice && livePrice < 1100) {
      bullScore += 10;
      factors.push('Platinum is trading at a historic discount to gold — value opportunity');
    }
    factors.push('Hydrogen fuel cell demand is emerging as a major long-term catalyst');
    bullScore += 5;
  }

  if (name === 'Palladium') {
    if (trend90.dir === 'down') {
      bearScore += 5;
      factors.push('Electric vehicle transition is reducing industrial demand');
    }
    factors.push('Still essential for hybrid vehicles, electronics, and chemical manufacturing');
  }

  if (volatility > 25) { bearScore += 5; factors.push('Price swings have been larger than usual — expect continued volatility'); }

  const net = bullScore - bearScore;
  let riskScore = 50;

  if (volatility > 30) riskScore += 15;
  else if (volatility > 20) riskScore += 8;
  if (rsi > 75 || rsi < 25) riskScore += 10;
  if (crisisRisk > 40) riskScore += 10;
  riskScore = Math.min(100, Math.max(5, riskScore));

  let outlook: Outlook;
  let confidence: number;
  let headline: string;
  let timeHorizon: string;

  if (net >= 35) {
    outlook = 'STRONG BUY'; confidence = Math.min(85, 60 + net / 3);
    headline = `Our analysis strongly favors ${name} right now`;
    timeHorizon = '6-12 months';
  } else if (net >= 15) {
    outlook = 'BUY'; confidence = Math.min(75, 50 + net / 2);
    headline = `Conditions look favorable for buying ${name}`;
    timeHorizon = '3-6 months';
  } else if (net >= -10) {
    outlook = 'HOLD'; confidence = Math.min(70, 45 + Math.abs(net));
    headline = `${name} is in a wait-and-see zone — patience recommended`;
    timeHorizon = 'Monitor weekly';
  } else if (net >= -25) {
    outlook = 'CAUTIOUS'; confidence = Math.min(70, 45 + Math.abs(net) / 2);
    headline = `${name} is facing some headwinds — proceed with caution`;
    timeHorizon = '1-3 months';
  } else {
    outlook = 'SELL'; confidence = Math.min(80, 55 + Math.abs(net) / 2);
    headline = `${name} is under pressure — consider reducing your position`;
    timeHorizon = 'Near-term';
  }

  let reasoning = '';
  if (outlook === 'STRONG BUY' || outlook === 'BUY') {
    reasoning = `Our proprietary analysis indicates favorable conditions for ${name}. ${trend90.dir === 'up' ? 'The price trend over the past several months has been solidly positive' : 'Despite some mixed action recently'}, the overall picture — including supply and demand, global market conditions, and real-world demand drivers — supports buying at these levels.${rsi < 40 ? ' The recent dip could be a good entry point.' : ''}`;
  } else if (outlook === 'HOLD') {
    reasoning = `${name} is in a balanced zone right now. ${aboveMA200 ? 'The longer-term trend is still intact' : 'The broader direction is mixed'}, and we don't see a compelling reason to either add or reduce your position at this time. Patience is the play here.`;
  } else {
    reasoning = `${name} is showing some signs of weakness. ${trend30.dir === 'down' ? 'Prices have pulled back recently' : 'Market conditions have shifted'} and our analysis suggests caution is warranted. Consider taking some profits off the table or waiting for a clearer picture before adding.`;
  }

  return {
    metal: name, symbol, currentPrice: price ? +price.toFixed(2) : null,
    outlook, confidence: Math.round(confidence), riskScore,
    headline, reasoning, keyFactors: factors.slice(0, 6), timeHorizon,
  };
}

let cachedAdvisory: MarketAdvisoryResult | null = null;
let lastAdvisoryFetch = 0;
const ADVISORY_CACHE = 5 * 60 * 1000;

export async function getMarketAdvisory(): Promise<MarketAdvisoryResult> {
  const now = Date.now();
  if (cachedAdvisory && (now - lastAdvisoryFetch) < ADVISORY_CACHE) {
    return cachedAdvisory;
  }

  console.log('📊 Market Advisory Engine: Deep analysis starting...');

  const [livePrices, convergenceSignal, goldETF, silverETF, platETF, palladETF, dxyData] = await Promise.all([
    getKitcoPricing().catch(() => null),
    getConvergenceSignal().catch(() => null),
    fetchYahooData('GLD', '1y'),
    fetchYahooData('SLV', '1y'),
    fetchYahooData('PPLT', '1y'),
    fetchYahooData('PALL', '1y'),
    fetchYahooData('DX-Y.NYB', '6mo'),
  ]);

  const crisisRisk = convergenceSignal?.compositeScore ?? 0;
  const vixSignal = convergenceSignal?.signals?.find(s => s.id === 'vix');
  const yieldSignal = convergenceSignal?.signals?.find(s => s.id === 'yield_curve');
  const bseydSignal = convergenceSignal?.signals?.find(s => s.id === 'bseyd');

  const vixLevel = vixSignal?.reading ? parseFloat(vixSignal.reading.split('VIX: ')[1]?.split(' ')[0] ?? '0') : 16;
  const yieldCurveHealthy = !yieldSignal?.active;
  const treasuryYield = bseydSignal?.reading ? parseFloat(bseydSignal.reading.split('10Y Treasury: ')[1]?.split('%')[0] ?? '4.0') : 4.0;

  const goldSilverRatio = (livePrices?.gold && livePrices?.silver) ? livePrices.gold / livePrices.silver : null;

  const metals: MetalAdvisory[] = [
    analyzeMetal('Gold', 'XAU', goldETF, livePrices?.gold ?? null, goldSilverRatio, crisisRisk, vixLevel, yieldCurveHealthy, treasuryYield),
    analyzeMetal('Silver', 'XAG', silverETF, livePrices?.silver ?? null, goldSilverRatio, crisisRisk, vixLevel, yieldCurveHealthy, treasuryYield),
    analyzeMetal('Platinum', 'XPT', platETF, livePrices?.platinum ?? null, goldSilverRatio, crisisRisk, vixLevel, yieldCurveHealthy, treasuryYield),
    analyzeMetal('Palladium', 'XPD', palladETF, livePrices?.palladium ?? null, goldSilverRatio, crisisRisk, vixLevel, yieldCurveHealthy, treasuryYield),
  ];

  const dxyTrend = dxyData.length > 20 ? calcTrend(dxyData, 60) : null;
  const activeGeoFactors: string[] = [];

  activeGeoFactors.push(GEOPOLITICAL_INTELLIGENCE.central_bank_buying.impact);
  activeGeoFactors.push(GEOPOLITICAL_INTELLIGENCE.green_energy_transition.impact);
  activeGeoFactors.push(GEOPOLITICAL_INTELLIGENCE.supply_constraints.impact);

  if (dxyTrend && dxyTrend.dir === 'down') {
    activeGeoFactors.push(`US Dollar weakening (${dxyTrend.pct}% over 60 days) — historically bullish for all precious metals.`);
  } else if (dxyTrend && dxyTrend.dir === 'up') {
    activeGeoFactors.push(`US Dollar strengthening (+${dxyTrend.pct}% over 60 days) — creates short-term headwind for metals priced in USD.`);
  }

  if (crisisRisk > 30) {
    activeGeoFactors.push(GEOPOLITICAL_INTELLIGENCE.geopolitical_tension.impact);
  }

  activeGeoFactors.push(GEOPOLITICAL_INTELLIGENCE.tech_demand.impact);

  const avgRisk = metals.reduce((s, m) => s + m.riskScore, 0) / metals.length;
  const overallRiskScore = Math.round((avgRisk * 0.6) + (crisisRisk * 0.4));

  let overallSentiment: string;
  const buyCount = metals.filter(m => m.outlook === 'STRONG BUY' || m.outlook === 'BUY').length;
  if (buyCount >= 3) overallSentiment = 'Precious metals market conditions are broadly favorable. Multiple metals showing positive signals.';
  else if (buyCount >= 2) overallSentiment = 'Mixed but leaning positive. Select opportunities exist in the precious metals space.';
  else if (buyCount >= 1) overallSentiment = 'Selective market. One or more metals showing opportunity while others warrant patience.';
  else overallSentiment = 'Cautious environment. Patience and selectivity recommended across precious metals.';

  const result: MarketAdvisoryResult = {
    overallRiskScore,
    overallSentiment,
    metals,
    emergingMetals: EMERGING_METALS,
    geopoliticalFactors: activeGeoFactors.slice(0, 5),
    timestamp: new Date().toISOString(),
    disclaimer: 'This analysis is generated by Simpleton Vision\'s proprietary algorithm for educational and informational purposes only. It does not constitute financial advice, investment recommendations, or solicitation to buy or sell any asset. Precious metals investing carries risk, including the potential loss of principal. Past performance does not guarantee future results. Always consult a licensed financial advisor before making investment decisions. Simpleton Vision™ and its creators assume no liability for actions taken based on this analysis.',
  };

  cachedAdvisory = result;
  lastAdvisoryFetch = now;

  console.log(`📊 Advisory: Risk ${overallRiskScore}/100 | ${metals.map(m => `${m.metal}: ${m.outlook}`).join(' | ')}`);

  return result;
}

export async function getAdvisoryForSimplicity(): Promise<string> {
  const advisory = await getMarketAdvisory();
  return JSON.stringify({
    overall_risk: advisory.overallRiskScore,
    market_sentiment: advisory.overallSentiment,
    metals: advisory.metals.map(m => ({
      metal: m.metal,
      price: m.currentPrice,
      outlook: m.outlook,
      confidence: m.confidence,
      risk: m.riskScore,
      headline: m.headline,
      reasoning: m.reasoning,
      key_factors: m.keyFactors,
      time_horizon: m.timeHorizon,
    })),
    emerging_metals: advisory.emergingMetals.map(e => ({
      metal: e.metal,
      why: e.why,
      demand_driver: e.demandDriver,
      outlook: e.outlook,
      risk: e.riskLevel,
      timeframe: e.timeframe,
    })),
    geopolitical_context: advisory.geopoliticalFactors,
    disclaimer: advisory.disclaimer,
    timestamp: advisory.timestamp,
  });
}
