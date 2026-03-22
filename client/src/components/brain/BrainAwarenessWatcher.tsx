import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useBrain } from "@/lib/brain-context";

interface MetalAdvisory {
  metal: string;
  outlook: string;
  confidence: number;
  riskScore: number;
  currentPrice: number;
}

export function BrainAwarenessWatcher() {
  const { updateAwareness, setSuggestion } = useBrain();
  const [location] = useLocation();
  const lastGoldRef = useRef<number | null>(null);
  const lastOutlookRef = useRef<string | null>(null);
  const lastConvergenceRef = useRef<string | null>(null);
  const intelligenceFiredRef = useRef<Set<string>>(new Set());
  const lastCalcRef = useRef<number | null>(null);
  const intelCacheRef = useRef<any>(null);

  useEffect(() => {
    updateAwareness({ currentPage: location });
    intelligenceFiredRef.current.clear();
  }, [location, updateAwareness]);

  const { data: prices } = useQuery<any>({
    queryKey: ["/api/pricing/kitco"],
    refetchInterval: 60000,
  });

  const { data: advisory } = useQuery<any>({
    queryKey: ["/api/market-signals/advisory"],
    refetchInterval: 15 * 60 * 1000,
  });

  const { data: convergence } = useQuery<any>({
    queryKey: ["/api/market-signals/convergence"],
    refetchInterval: 15 * 60 * 1000,
  });

  useEffect(() => {
    if (prices?.success && prices.prices) {
      const newMarket = {
        goldPrice: prices.prices.gold || 0,
        silverPrice: prices.prices.silver || 0,
        platinumPrice: prices.prices.platinum || 0,
        lastUpdated: new Date().toISOString(),
      };
      updateAwareness({ market: newMarket });

      if (lastGoldRef.current !== null && newMarket.goldPrice > 0) {
        const diff = newMarket.goldPrice - lastGoldRef.current;
        const pctChange = Math.abs(diff / lastGoldRef.current) * 100;

        if (pctChange >= 0.5 && (location === "/calculator" || location === "/simpleton-mode")) {
          const direction = diff > 0 ? "up" : "down";
          setSuggestion({
            message: `Gold just moved ${direction} $${Math.abs(diff).toFixed(2)} to $${newMarket.goldPrice.toFixed(2)}/oz. Your calculations may need updating.`,
            context: "price_movement",
          });
        }
      }
      lastGoldRef.current = newMarket.goldPrice;
    }
  }, [prices, updateAwareness, setSuggestion, location]);

  useEffect(() => {
    if (advisory?.success && advisory.data) {
      const data = advisory.data;
      const metals: MetalAdvisory[] = data.metals || [];
      const gold = metals.find((m: MetalAdvisory) => m.metal === "Gold");
      const silver = metals.find((m: MetalAdvisory) => m.metal === "Silver");
      const platinum = metals.find((m: MetalAdvisory) => m.metal === "Platinum");

      const intel = {
        goldOutlook: gold?.outlook,
        goldConfidence: gold?.confidence,
        silverOutlook: silver?.outlook,
        silverConfidence: silver?.confidence,
        platinumOutlook: platinum?.outlook,
        platinumConfidence: platinum?.confidence,
        overallRiskScore: data.overallRiskScore,
        overallSentiment: data.overallSentiment,
        lastFetched: new Date().toISOString(),
      };

      intelCacheRef.current = intel;
      updateAwareness({ intelligence: intel });

      if (gold?.outlook && gold.outlook !== lastOutlookRef.current) {
        const prevOutlook = lastOutlookRef.current;
        lastOutlookRef.current = gold.outlook;

        if (prevOutlook !== null) {
          fireOutlookSuggestion(gold, silver, platinum, location);
        }
      }
    }
  }, [advisory, updateAwareness, setSuggestion, location]);

  useEffect(() => {
    if (convergence?.success && convergence.data) {
      const data = convergence.data;
      const alert = data.alert || "";
      const riskLevel = data.riskLevel || "";

      const merged = {
        ...(intelCacheRef.current || {}),
        convergenceAlert: alert,
        convergenceRiskLevel: riskLevel,
      };
      intelCacheRef.current = merged;
      updateAwareness({ intelligence: merged });

      if (alert && alert !== lastConvergenceRef.current) {
        lastConvergenceRef.current = alert;

        if (riskLevel === "HIGH" || riskLevel === "CRITICAL") {
          const key = `convergence_${riskLevel}`;
          if (!intelligenceFiredRef.current.has(key)) {
            intelligenceFiredRef.current.add(key);
            setSuggestion({
              message: `Market convergence alert: ${alert}. Risk level is ${riskLevel}. Consider reviewing your portfolio exposure.`,
              context: "convergence_warning",
            });
          }
        }
      }
    }
  }, [convergence, updateAwareness, setSuggestion]);

  useEffect(() => {
    if (!intelCacheRef.current) return;
    const intel = intelCacheRef.current;

    const pageSignals = getPageRelevantSignal(location, intel);
    if (pageSignals) {
      const key = `page_signal_${location}_${pageSignals.context}`;
      if (!intelligenceFiredRef.current.has(key)) {
        intelligenceFiredRef.current.add(key);
        setSuggestion(pageSignals);
      }
    }
  }, [location, advisory, convergence, setSuggestion]);

  function fireOutlookSuggestion(
    gold: MetalAdvisory | undefined,
    silver: MetalAdvisory | undefined,
    platinum: MetalAdvisory | undefined,
    page: string
  ) {
    if (!gold) return;

    const isBuySignal = gold.outlook === "STRONG BUY" || gold.outlook === "BUY";
    const isSellSignal = gold.outlook === "STRONG SELL" || gold.outlook === "SELL";

    if (page === "/calculator" || page === "/simpleton-mode") {
      if (isBuySignal && gold.confidence >= 70) {
        const key = "outlook_calc_buy";
        if (!intelligenceFiredRef.current.has(key)) {
          intelligenceFiredRef.current.add(key);
          setSuggestion({
            message: `Market intelligence shows Gold at ${gold.outlook} with ${gold.confidence}% confidence at $${gold.currentPrice?.toFixed(2)}/oz. Favorable conditions for buyers.`,
            context: "intelligence_outlook",
          });
        }
      } else if (isSellSignal) {
        const key = "outlook_calc_sell";
        if (!intelligenceFiredRef.current.has(key)) {
          intelligenceFiredRef.current.add(key);
          setSuggestion({
            message: `Gold outlook has shifted to ${gold.outlook}. If you're holding, this may be a good time to review your position.`,
            context: "intelligence_outlook",
          });
        }
      }
    }

    if (page === "/portfolio" && gold.confidence >= 60) {
      const key = "outlook_portfolio";
      if (!intelligenceFiredRef.current.has(key)) {
        intelligenceFiredRef.current.add(key);
        const metals = [gold, silver, platinum].filter(Boolean) as MetalAdvisory[];
        const buyMetals = metals.filter(m => m.outlook === "STRONG BUY" || m.outlook === "BUY");
        if (buyMetals.length >= 2) {
          setSuggestion({
            message: `${buyMetals.length} metals showing buy signals: ${buyMetals.map(m => m.metal).join(", ")}. Good conditions for portfolio rebalancing.`,
            context: "intelligence_portfolio",
          });
        }
      }
    }
  }

  function getPageRelevantSignal(
    page: string,
    intel: any
  ): { message: string; context: string } | null {
    if (page === "/watches" || page.startsWith("/watches")) {
      if (intel.goldOutlook === "STRONG BUY" || intel.goldOutlook === "BUY") {
        return {
          message: `Gold is at ${intel.goldOutlook} — Rolex watches in precious metals (Day-Date, Daytona) tend to appreciate faster when gold prices are climbing.`,
          context: "watches_gold_correlation",
        };
      }
    }

    if (page === "/diamonds" || page === "/diamond-calculator") {
      if (intel.overallRiskScore !== undefined && intel.overallRiskScore >= 60) {
        return {
          message: `Market risk score is elevated at ${intel.overallRiskScore}/100. Diamonds often hold value as a hedge — consider current market conditions in your valuation.`,
          context: "diamonds_risk_hedge",
        };
      }
    }

    if (page === "/coins" || page === "/database") {
      const silverBuy = intel.silverOutlook === "STRONG BUY" || intel.silverOutlook === "BUY";
      const goldBuy = intel.goldOutlook === "STRONG BUY" || intel.goldOutlook === "BUY";
      if (silverBuy && goldBuy) {
        return {
          message: `Both gold and silver showing buy signals. Bullion coins and junk silver bags tend to track spot price movements closely — good time to review melt values.`,
          context: "coins_bullion_signal",
        };
      }
    }

    if (page === "/market-signals") {
      if (intel.convergenceAlert && intel.convergenceRiskLevel !== "LOW") {
        return {
          message: `Active convergence signal: ${intel.convergenceAlert}. The system is tracking ${intel.convergenceRiskLevel}-level risk patterns across markets.`,
          context: "signals_convergence",
        };
      }
    }

    return null;
  }

  return null;
}
