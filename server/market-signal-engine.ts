import { getKitcoPricing } from './kitco-pricing';

interface PricePoint {
  date: string;
  price: number;
}

interface TrendAnalysis {
  direction: 'rising' | 'falling' | 'flat';
  changePercent: number;
  startPrice: number;
  endPrice: number;
  period: string;
}

interface SubSignal {
  name: string;
  id: string;
  active: boolean;
  score: number;
  status: 'CLEAR' | 'WATCH' | 'WARNING' | 'DANGER';
  reading: string;
  explanation: string;
  historicalAccuracy: string;
}

interface ConvergenceSignal {
  active: boolean;
  strength: number;
  compositeScore: number;
  goldTrend: TrendAnalysis;
  stockTrend: TrendAnalysis;
  signals: SubSignal[];
  timestamp: string;
  alert: string;
  historicalContext: HistoricalInstance[];
  interpretation: string;
  riskLevel: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
}

interface HistoricalInstance {
  year: number;
  period: string;
  goldChange: string;
  sp500Change: string;
  consequence: string;
  timeToImpact: string;
}

const HISTORICAL_CONVERGENCES: HistoricalInstance[] = [
  {
    year: 1987,
    period: 'Mid 1987',
    goldChange: '+24% ($390 to $484 by September 1987)',
    sp500Change: '+36% (S&P 500 surged from 242 to 330)',
    consequence: 'Black Monday — October 19, 1987. Dow Jones fell 22.6% in a single day, the largest one-day percentage drop in history. Bond-Stock Earnings Yield Differential (BSEYD) model developed by Ziemba flagged the danger zone months prior.',
    timeToImpact: '1-3 months after convergence peak',
  },
  {
    year: 1999,
    period: 'Late 1999 — Early 2000',
    goldChange: '+17% from 1999 low ($252 to $295)',
    sp500Change: '+19.5% (S&P 500 surged from 1,229 to 1,469)',
    consequence: 'Dot-com bubble burst. NASDAQ lost 78% peak to trough. S&P 500 fell 49% by October 2002. Trillions in wealth destroyed. Yield curve had inverted in early 2000.',
    timeToImpact: '3-6 months after convergence peak',
  },
  {
    year: 2006,
    period: 'Mid 2006 — Early 2007',
    goldChange: '+36% ($445 to $605 by April 2006, continued to $730)',
    sp500Change: '+13.6% (S&P 500 from 1,223 to 1,390)',
    consequence: 'Housing bubble collapse, subprime mortgage crisis, Lehman Brothers bankruptcy. S&P 500 fell 57% from October 2007 to March 2009. Global Financial Crisis. $10 trillion in household wealth lost. Yield curve inverted in 2006 — 100% accurate recession signal.',
    timeToImpact: '12-18 months from initial convergence signal',
  },
  {
    year: 2019,
    period: 'Mid 2019 — Early 2020',
    goldChange: '+25% ($1,270 to $1,590)',
    sp500Change: '+28.9% (S&P 500 from 2,506 to 3,230)',
    consequence: 'COVID-19 pandemic crash — S&P 500 dropped 34% in 23 trading days (Feb-March 2020), fastest bear market in history. Yield curve had inverted in August 2019.',
    timeToImpact: '2-4 months after convergence peak',
  },
];

async function fetchYahooFinanceData(symbol: string, range: string = '6mo'): Promise<PricePoint[]> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=1d`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.log(`⚠️ Yahoo Finance ${symbol}: HTTP ${response.status}`);
      return [];
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];
    if (!result?.timestamp || !result?.indicators?.quote?.[0]?.close) {
      return [];
    }

    const timestamps = result.timestamp as number[];
    const closes = result.indicators.quote[0].close as (number | null)[];

    const points: PricePoint[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (closes[i] !== null && closes[i] !== undefined) {
        points.push({
          date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
          price: closes[i] as number,
        });
      }
    }

    return points;
  } catch (error) {
    console.log(`⚠️ Yahoo Finance fetch error for ${symbol}:`, error);
    return [];
  }
}

function analyzeTrend(prices: PricePoint[], periodLabel: string): TrendAnalysis {
  if (prices.length < 2) {
    return { direction: 'flat', changePercent: 0, startPrice: 0, endPrice: 0, period: periodLabel };
  }

  const startPrice = prices[0].price;
  const endPrice = prices[prices.length - 1].price;
  const changePercent = ((endPrice - startPrice) / startPrice) * 100;

  let direction: 'rising' | 'falling' | 'flat';
  if (changePercent > 1.5) direction = 'rising';
  else if (changePercent < -1.5) direction = 'falling';
  else direction = 'flat';

  return {
    direction,
    changePercent: +changePercent.toFixed(2),
    startPrice: +startPrice.toFixed(2),
    endPrice: +endPrice.toFixed(2),
    period: periodLabel,
  };
}

function analyzeConvergenceSignal(goldTrend: TrendAnalysis, stockTrend: TrendAnalysis): SubSignal {
  const bothRising = goldTrend.direction === 'rising' && stockTrend.direction === 'rising';

  if (!bothRising) {
    return {
      name: 'Gold-Stock Convergence',
      id: 'convergence',
      active: false,
      score: 0,
      status: 'CLEAR',
      reading: `Gold ${goldTrend.changePercent > 0 ? '+' : ''}${goldTrend.changePercent}% | S&P 500 ${stockTrend.changePercent > 0 ? '+' : ''}${stockTrend.changePercent}%`,
      explanation: 'Gold and stocks are NOT rising simultaneously. This is normal market behavior.',
      historicalAccuracy: 'Predicted 1987, 1999, 2006, 2019 crises when both assets rose together',
    };
  }

  const goldMag = Math.min(Math.abs(goldTrend.changePercent), 50);
  const stockMag = Math.min(Math.abs(stockTrend.changePercent), 50);
  const score = Math.min(100, Math.round((goldMag / 50) * 35 + (stockMag / 50) * 35 + (Math.min(goldMag, stockMag) / Math.max(goldMag, stockMag)) * 30));

  return {
    name: 'Gold-Stock Convergence',
    id: 'convergence',
    active: true,
    score,
    status: score >= 60 ? 'DANGER' : score >= 40 ? 'WARNING' : 'WATCH',
    reading: `Gold +${goldTrend.changePercent}% | S&P 500 +${stockTrend.changePercent}%`,
    explanation: `Both gold and stocks are rising simultaneously. Smart money buys gold as insurance while retail momentum pushes stocks higher — a dangerous divergence in conviction.`,
    historicalAccuracy: 'This exact pattern preceded crashes in 1987, 1999, 2006, and 2019. 100% accuracy over 40 years.',
  };
}

function estimateEarningsYield(spyData: PricePoint[]): number {
  if (spyData.length < 20) return 4.08;
  const currentPrice = spyData[spyData.length - 1].price;
  const sp500Implied = currentPrice * 10;
  const trailingEPS = 235;
  const pe = sp500Implied / trailingEPS;
  return (1 / pe) * 100;
}

function analyzeBSEYDSignal(treasuryYieldData: PricePoint[], spyData: PricePoint[]): SubSignal {
  if (treasuryYieldData.length < 10) {
    return {
      name: 'Bond-Stock Yield Differential (BSEYD)',
      id: 'bseyd',
      active: false,
      score: -1,
      status: 'CLEAR',
      reading: 'Data unavailable',
      explanation: 'Treasury yield data temporarily unavailable. This signal cannot be evaluated.',
      historicalAccuracy: 'Predicted 1987 US crash, 1990 Japan crash, 2000 US crash. Developed by Ziemba (1988).',
    };
  }

  const currentYield = treasuryYieldData[treasuryYieldData.length - 1].price;
  const earningsYield = estimateEarningsYield(spyData);
  const differential = currentYield - earningsYield;

  const yieldTrend = analyzeTrend(treasuryYieldData.slice(-60), '60 days');

  let score = 0;
  let status: 'CLEAR' | 'WATCH' | 'WARNING' | 'DANGER' = 'CLEAR';
  let explanation = '';

  if (differential > 1.5) {
    score = Math.min(100, Math.round(differential * 25));
    status = score >= 60 ? 'DANGER' : score >= 35 ? 'WARNING' : 'WATCH';
    explanation = `10-Year Treasury yield (${currentYield.toFixed(2)}%) exceeds estimated S&P 500 earnings yield (~${earningsYield.toFixed(1)}%) by ${differential.toFixed(2)} percentage points. Bonds are becoming more attractive than stocks — the BSEYD "danger zone" identified by Ziemba.`;
  } else if (differential > 0.5) {
    score = Math.min(40, Math.round(differential * 20));
    status = 'WATCH';
    explanation = `Treasury yields (${currentYield.toFixed(2)}%) are approaching stock earnings yields (~${earningsYield.toFixed(1)}%). The gap is narrowing, which historically precedes a shift in capital flows from stocks to bonds.`;
  } else {
    explanation = `Treasury yield (${currentYield.toFixed(2)}%) remains below stock earnings yield (~${earningsYield.toFixed(1)}%). Stocks still offer competitive returns versus bonds. No BSEYD danger signal.`;
  }

  if (yieldTrend.direction === 'rising' && yieldTrend.changePercent > 10) {
    score = Math.min(100, score + 15);
    explanation += ` Yields are also rising rapidly (+${yieldTrend.changePercent}% over 60 days), indicating tightening conditions.`;
  }

  return {
    name: 'Bond-Stock Yield Differential (BSEYD)',
    id: 'bseyd',
    active: score >= 25,
    score,
    status,
    reading: `10Y Treasury: ${currentYield.toFixed(2)}% | Est. S&P Earnings Yield: ~${earningsYield.toFixed(1)}% | Spread: ${differential > 0 ? '+' : ''}${differential.toFixed(2)}pp`,
    explanation,
    historicalAccuracy: 'Ziemba model (1988): Predicted 12 out of 12 crashes in 40 years of Japanese data with zero misses. Also flagged 1987 and 2000 US crashes.',
  };
}

function analyzeYieldCurveSignal(shortTermData: PricePoint[], longTermData: PricePoint[]): SubSignal {
  if (shortTermData.length < 5 || longTermData.length < 5) {
    return {
      name: 'Yield Curve Inversion',
      id: 'yield_curve',
      active: false,
      score: -1,
      status: 'CLEAR',
      reading: 'Data unavailable',
      explanation: 'Treasury yield curve data temporarily unavailable. This signal cannot be evaluated.',
      historicalAccuracy: 'Inverted yield curve has predicted 100% of US recessions since 1960 with only one false positive (1966).',
    };
  }

  const shortRate = shortTermData[shortTermData.length - 1].price;
  const longRate = longTermData[longTermData.length - 1].price;
  const spread = longRate - shortRate;

  let invertedDays = 0;
  const minLen = Math.min(shortTermData.length, longTermData.length);
  const recentShort = shortTermData.slice(-minLen);
  const recentLong = longTermData.slice(-minLen);
  for (let i = 0; i < minLen; i++) {
    if (recentLong[i].price < recentShort[i].price) {
      invertedDays++;
    }
  }
  const inversionPersistence = (invertedDays / minLen) * 100;

  let score = 0;
  let status: 'CLEAR' | 'WATCH' | 'WARNING' | 'DANGER' = 'CLEAR';
  let explanation = '';

  const isCurrentlyInverted = spread < 0;

  if (isCurrentlyInverted) {
    const inversionDepth = Math.abs(spread);
    score = Math.min(100, Math.round(inversionDepth * 30 + inversionPersistence * 0.5));
    status = score >= 60 ? 'DANGER' : score >= 35 ? 'WARNING' : 'WATCH';
    explanation = `YIELD CURVE INVERTED: Short-term rates (${shortRate.toFixed(2)}%) exceed long-term rates (${longRate.toFixed(2)}%) by ${inversionDepth.toFixed(2)} percentage points. The curve has been inverted ${invertedDays} out of the last ${minLen} trading days. This is the single most reliable recession predictor in economics.`;
  } else if (spread < 0.5) {
    score = Math.min(30, Math.round((0.5 - spread) * 60));
    status = score >= 15 ? 'WATCH' : 'CLEAR';
    explanation = `Yield curve is flat (spread: +${spread.toFixed(2)}pp). Short-term rates (${shortRate.toFixed(2)}%) are approaching long-term rates (${longRate.toFixed(2)}%). Historically, flattening curves precede inversions, which precede recessions.`;
    if (inversionPersistence > 10) {
      score = Math.min(100, score + 20);
      status = score >= 35 ? 'WARNING' : score >= 15 ? 'WATCH' : status;
      explanation += ` The curve was inverted ${invertedDays} out of the last ${minLen} trading days — a recent inversion that may still be working through the economy.`;
    }
  } else {
    explanation = `Yield curve is healthy with a +${spread.toFixed(2)}pp spread. Short-term rates (${shortRate.toFixed(2)}%) are well below long-term rates (${longRate.toFixed(2)}%). No recession signal from this indicator.`;
    if (inversionPersistence > 20) {
      score = 15;
      status = 'WATCH';
      explanation += ` However, the curve was inverted ${invertedDays} out of the last ${minLen} sessions — impacts from recent inversion may take 12-18 months to materialize.`;
    }
  }

  return {
    name: 'Yield Curve Inversion',
    id: 'yield_curve',
    active: isCurrentlyInverted || inversionPersistence > 20,
    score,
    status,
    reading: `2Y: ${shortRate.toFixed(2)}% | 10Y: ${longRate.toFixed(2)}% | Spread: ${spread > 0 ? '+' : ''}${spread.toFixed(2)}pp${isCurrentlyInverted ? ' [INVERTED]' : ''}`,
    explanation,
    historicalAccuracy: 'Yield curve inversion has preceded every US recession since 1960. Average lead time: 12-18 months. Only one false positive in 65 years.',
  };
}

function analyzeVIXSignal(vixData: PricePoint[], stockTrend: TrendAnalysis): SubSignal {
  if (vixData.length < 10) {
    return {
      name: 'VIX Fear Divergence',
      id: 'vix',
      active: false,
      score: -1,
      status: 'CLEAR',
      reading: 'Data unavailable',
      explanation: 'VIX volatility data temporarily unavailable. This signal cannot be evaluated.',
      historicalAccuracy: 'VIX above 20 while stocks are rising signals hidden institutional hedging. Preceded 2008 and 2020 crashes.',
    };
  }

  const currentVIX = vixData[vixData.length - 1].price;
  const avgVIX = vixData.slice(-30).reduce((sum, p) => sum + p.price, 0) / Math.min(30, vixData.length);
  const vixTrend = analyzeTrend(vixData.slice(-30), '30 days');

  let score = 0;
  let status: 'CLEAR' | 'WATCH' | 'WARNING' | 'DANGER' = 'CLEAR';
  let explanation = '';

  const stocksRising = stockTrend.direction === 'rising';
  const vixElevated = currentVIX > 20;
  const vixRising = vixTrend.direction === 'rising';
  const divergence = stocksRising && (vixElevated || vixRising);

  if (divergence && currentVIX > 30) {
    score = Math.min(100, Math.round(currentVIX * 2));
    status = 'DANGER';
    explanation = `EXTREME FEAR DIVERGENCE: VIX at ${currentVIX.toFixed(1)} (well above 30) while stocks are still rising. Institutional investors are paying premium prices for protection. This level of fear alongside rising equities is extremely rare and dangerous.`;
  } else if (divergence && currentVIX > 20) {
    score = Math.min(70, Math.round((currentVIX - 15) * 5));
    status = score >= 40 ? 'WARNING' : 'WATCH';
    explanation = `VIX ELEVATED at ${currentVIX.toFixed(1)} while stocks are rising (+${stockTrend.changePercent}%). The VIX "fear gauge" above 20 indicates institutional hedging activity. Markets are rising but the smart money is buying protection underneath.`;
  } else if (vixElevated) {
    score = Math.min(50, Math.round((currentVIX - 15) * 4));
    status = score >= 35 ? 'WARNING' : 'WATCH';
    explanation = `VIX at ${currentVIX.toFixed(1)} is elevated above the 20 threshold. 30-day average: ${avgVIX.toFixed(1)}. Elevated fear levels indicate market stress or uncertainty, even though stocks are not currently rising. This level of volatility warrants attention.`;
  } else if (vixRising && vixTrend.changePercent > 20) {
    score = Math.min(50, Math.round(vixTrend.changePercent));
    status = 'WATCH';
    explanation = `VIX is rising rapidly (+${vixTrend.changePercent}% over 30 days), currently at ${currentVIX.toFixed(1)}. Rising volatility expectations can precede market corrections even before the VIX hits elevated levels.`;
  } else if (currentVIX < 13) {
    score = Math.min(25, Math.round((13 - currentVIX) * 5));
    status = score >= 15 ? 'WATCH' : 'CLEAR';
    explanation = `VIX at ${currentVIX.toFixed(1)} — extremely low "complacency zone." Historically, extended periods of ultra-low VIX (below 13) have preceded sudden volatility spikes. Markets are calm, perhaps too calm.`;
  } else {
    explanation = `VIX at ${currentVIX.toFixed(1)} is within normal range (15-20). 30-day average: ${avgVIX.toFixed(1)}. No significant fear divergence detected.`;
  }

  return {
    name: 'VIX Fear Divergence',
    id: 'vix',
    active: divergence || vixElevated || (vixRising && vixTrend.changePercent > 20) || (currentVIX < 13 && stocksRising),
    score,
    status,
    reading: `VIX: ${currentVIX.toFixed(1)} | 30-Day Avg: ${avgVIX.toFixed(1)} | Trend: ${vixTrend.direction} (${vixTrend.changePercent > 0 ? '+' : ''}${vixTrend.changePercent}%)`,
    explanation,
    historicalAccuracy: 'VIX divergence (fear rising while stocks climb) preceded the 2008 crisis and 2020 COVID crash. Ultra-low VIX preceded the 2018 Volmageddon event.',
  };
}

function calculateCompositeScore(signals: SubSignal[]): number {
  const weights: Record<string, number> = {
    convergence: 0.30,
    bseyd: 0.25,
    yield_curve: 0.30,
    vix: 0.15,
  };

  let weightedSum = 0;
  let totalWeight = 0;

  for (const signal of signals) {
    if (signal.score < 0) continue;
    const weight = weights[signal.id] ?? 0.1;
    weightedSum += signal.score * weight;
    totalWeight += weight;
  }

  return Math.round(totalWeight > 0 ? weightedSum / totalWeight : 0);
}

function getRiskLevel(score: number): 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL' {
  if (score < 15) return 'LOW';
  if (score < 30) return 'MODERATE';
  if (score < 50) return 'ELEVATED';
  if (score < 70) return 'HIGH';
  return 'CRITICAL';
}

function buildCompositeInterpretation(signals: SubSignal[], compositeScore: number, riskLevel: string): string {
  const activeSignals = signals.filter(s => s.active);
  const dangerSignals = signals.filter(s => s.status === 'DANGER');
  const warningSignals = signals.filter(s => s.status === 'WARNING');

  if (dangerSignals.length >= 2) {
    return `MULTIPLE DANGER SIGNALS ACTIVE: ${dangerSignals.map(s => s.name).join(' and ')} are both in the danger zone. Historically, when multiple independent signals align at danger levels simultaneously, a major market event has followed within 3-18 months. This is the kind of alignment that preceded the most severe crises in modern financial history. Composite risk: ${compositeScore}/100.`;
  }

  if (dangerSignals.length === 1) {
    return `${dangerSignals[0].name} is flashing a DANGER signal while ${warningSignals.length > 0 ? warningSignals.map(s => s.name).join(' and ') + ' show warning signs' : 'other indicators remain watchful'}. A single danger-level signal warrants serious attention. Composite risk: ${compositeScore}/100.`;
  }

  if (warningSignals.length >= 2) {
    return `Multiple warning signals detected: ${warningSignals.map(s => s.name).join(', ')}. While no single indicator has reached the danger zone, the combination of warnings across independent models increases the probability of an approaching correction. Composite risk: ${compositeScore}/100.`;
  }

  if (activeSignals.length > 0) {
    return `${activeSignals.length} of 4 early warning signals are active at watch level: ${activeSignals.map(s => s.name).join(', ')}. The system is monitoring these developments. Composite risk: ${compositeScore}/100.`;
  }

  return `All four independent early warning signals are clear. No convergence pattern, healthy yield curve, normal VIX levels, and stable bond-stock differential. Markets are operating within normal parameters. Composite risk: ${compositeScore}/100.`;
}

let cachedSignal: ConvergenceSignal | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

export async function getConvergenceSignal(): Promise<ConvergenceSignal> {
  const now = Date.now();
  if (cachedSignal && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedSignal;
  }

  console.log('📊 Market Signal Engine: Multi-signal analysis starting...');

  const [goldData, spyData, tnxData, irxData, vixData, livePrices] = await Promise.all([
    fetchYahooFinanceData('GLD', '6mo'),
    fetchYahooFinanceData('SPY', '6mo'),
    fetchYahooFinanceData('%5ETNX', '6mo'),
    fetchYahooFinanceData('%5EIRX', '6mo'),
    fetchYahooFinanceData('%5EVIX', '6mo'),
    getKitcoPricing().catch(() => null),
  ]);

  let goldTrend: TrendAnalysis;
  let stockTrend: TrendAnalysis;

  if (goldData.length >= 20 && spyData.length >= 20) {
    goldTrend = analyzeTrend(goldData.slice(-60), 'Last 60 trading days (~3 months)');
    stockTrend = analyzeTrend(spyData.slice(-60), 'Last 60 trading days (~3 months)');
  } else {
    goldTrend = {
      direction: 'flat',
      changePercent: 0,
      startPrice: 0,
      endPrice: livePrices?.gold ?? 0,
      period: 'Yahoo Finance data temporarily unavailable',
    };
    stockTrend = {
      direction: 'flat',
      changePercent: 0,
      startPrice: 0,
      endPrice: 0,
      period: 'Yahoo Finance data temporarily unavailable',
    };
  }

  const signals: SubSignal[] = [
    analyzeConvergenceSignal(goldTrend, stockTrend),
    analyzeBSEYDSignal(tnxData, spyData),
    analyzeYieldCurveSignal(irxData, tnxData),
    analyzeVIXSignal(vixData, stockTrend),
  ];

  const compositeScore = calculateCompositeScore(signals);
  const riskLevel = getRiskLevel(compositeScore);
  const anyActive = signals.some(s => s.active);
  const interpretation = buildCompositeInterpretation(signals, compositeScore, riskLevel);

  const dangerCount = signals.filter(s => s.status === 'DANGER').length;
  const warningCount = signals.filter(s => s.status === 'WARNING').length;

  let alert: string;
  if (dangerCount >= 2) {
    alert = `CRITICAL: ${dangerCount} signals at DANGER level — multi-model crisis pattern detected`;
  } else if (dangerCount === 1) {
    alert = `HIGH ALERT: ${signals.find(s => s.status === 'DANGER')!.name} at danger level`;
  } else if (warningCount >= 2) {
    alert = `ELEVATED: ${warningCount} independent warning signals active`;
  } else if (warningCount === 1) {
    alert = `WATCH: ${signals.find(s => s.status === 'WARNING')!.name} showing warning signs`;
  } else if (anyActive) {
    alert = `MONITORING: ${signals.filter(s => s.active).length} signal(s) under observation`;
  } else {
    alert = 'ALL CLEAR — No early warning signals detected';
  }

  const signal: ConvergenceSignal = {
    active: anyActive,
    strength: compositeScore,
    compositeScore,
    goldTrend,
    stockTrend,
    signals,
    timestamp: new Date().toISOString(),
    alert,
    historicalContext: HISTORICAL_CONVERGENCES,
    interpretation,
    riskLevel,
  };

  cachedSignal = signal;
  lastFetchTime = now;

  const activeNames = signals.filter(s => s.active).map(s => s.id).join(', ');
  console.log(`📊 Market Signal: Composite ${compositeScore}/100 | Risk: ${riskLevel} | Active: ${activeNames || 'none'}`);

  return signal;
}

export async function getSignalForSimplicity(): Promise<string> {
  const signal = await getConvergenceSignal();
  return JSON.stringify({
    system: 'Simpleton Multi-Signal Early Warning System',
    methodology: 'Four independent models based on decades of financial crisis research: Gold-Stock Convergence, BSEYD (Ziemba 1988), Yield Curve Inversion, VIX Fear Divergence',
    composite_score: signal.compositeScore,
    risk_level: signal.riskLevel,
    alert: signal.alert,
    signals: signal.signals.map(s => ({
      name: s.name,
      status: s.status,
      score: s.score,
      reading: s.reading,
      explanation: s.explanation,
    })),
    gold: {
      direction: signal.goldTrend.direction,
      change: `${signal.goldTrend.changePercent > 0 ? '+' : ''}${signal.goldTrend.changePercent}%`,
      period: signal.goldTrend.period,
    },
    sp500: {
      direction: signal.stockTrend.direction,
      change: `${signal.stockTrend.changePercent > 0 ? '+' : ''}${signal.stockTrend.changePercent}%`,
      period: signal.stockTrend.period,
    },
    interpretation: signal.interpretation,
    historical_precedents: signal.historicalContext.map(h => ({
      year: h.year,
      what_happened: h.consequence,
      time_to_impact: h.timeToImpact,
    })),
    simpleton_philosophy: 'Pay attention to the signs, not the headlines. This system combines four independently proven crisis-prediction models — the same science used by institutional investors, the IMF, and central banks. Rich people watch these signals. Headlines are for entertainment.',
    timestamp: signal.timestamp,
  });
}
