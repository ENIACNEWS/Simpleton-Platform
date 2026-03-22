import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/layout/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Shield,
  Eye,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Gauge,
  Gem,
  Globe,
  AlertTriangle,
  Clock,
  Target,
  Sparkles,
} from "lucide-react";

interface MetalAdvisory {
  metal: string;
  symbol: string;
  currentPrice: number | null;
  outlook: "STRONG BUY" | "BUY" | "HOLD" | "CAUTIOUS" | "SELL";
  confidence: number;
  riskScore: number;
  headline: string;
  reasoning: string;
  keyFactors: string[];
  timeHorizon: string;
}

interface EmergingMetal {
  metal: string;
  why: string;
  demandDriver: string;
  outlook: string;
  riskLevel: "LOW" | "MODERATE" | "HIGH";
  timeframe: string;
}

interface AdvisoryData {
  overallRiskScore: number;
  overallSentiment: string;
  metals: MetalAdvisory[];
  emergingMetals: EmergingMetal[];
  geopoliticalFactors: string[];
  timestamp: string;
  disclaimer: string;
}

function getOutlookStyle(outlook: string) {
  switch (outlook) {
    case "STRONG BUY": return { bg: "bg-emerald-900/30", border: "border-emerald-500/50", text: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" };
    case "BUY": return { bg: "bg-green-900/20", border: "border-green-500/40", text: "text-green-400", badge: "bg-green-500/15 text-green-300 border-green-500/30" };
    case "HOLD": return { bg: "bg-blue-900/20", border: "border-blue-500/30", text: "text-blue-400", badge: "bg-blue-500/15 text-blue-300 border-blue-500/30" };
    case "CAUTIOUS": return { bg: "bg-orange-900/20", border: "border-orange-500/40", text: "text-orange-400", badge: "bg-orange-500/15 text-orange-300 border-orange-500/30" };
    case "SELL": return { bg: "bg-red-900/20", border: "border-red-500/40", text: "text-red-400", badge: "bg-red-500/15 text-red-300 border-red-500/30" };
    default: return { bg: "bg-gray-900/20", border: "border-gray-500/30", text: "text-gray-400", badge: "bg-gray-500/15 text-gray-300 border-gray-500/30" };
  }
}

function getMetalIcon(metal: string) {
  const colors: Record<string, string> = {
    Gold: "text-amber-400",
    Silver: "text-gray-300",
    Platinum: "text-blue-300",
    Palladium: "text-violet-300",
  };
  return <Gem className={`w-5 h-5 ${colors[metal] || "text-gray-400"}`} />;
}

function RiskGauge({ score }: { score: number }) {
  const getColor = () => {
    if (score < 25) return "from-green-500 to-green-600";
    if (score < 45) return "from-yellow-500 to-yellow-600";
    if (score < 65) return "from-orange-500 to-orange-600";
    if (score < 80) return "from-red-500 to-red-600";
    return "from-red-600 to-red-800";
  };

  const getLabel = () => {
    if (score < 25) return "Low Risk";
    if (score < 45) return "Moderate";
    if (score < 65) return "Elevated";
    if (score < 80) return "High";
    return "Very High";
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 relative h-3 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getColor()} transition-all duration-1000`}
          style={{ width: `${Math.max(3, score)}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-400 w-20 text-right">{getLabel()}</span>
    </div>
  );
}

function MetalCard({ metal }: { metal: MetalAdvisory }) {
  const [expanded, setExpanded] = useState(false);
  const style = getOutlookStyle(metal.outlook);

  return (
    <div
      className={`rounded-xl border ${style.border} ${style.bg} p-5 cursor-pointer hover:brightness-110 transition-all`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {getMetalIcon(metal.metal)}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-white text-lg">{metal.metal}</h3>
              <Badge variant="outline" className={`text-xs font-bold px-2.5 py-0.5 ${style.badge}`}>
                {metal.outlook}
              </Badge>
            </div>
            {metal.currentPrice && (
              <p className="text-sm text-gray-400 mt-0.5">
                ${metal.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/oz
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <p className="text-xs text-gray-500">Risk</p>
            <p className={`text-sm font-bold ${metal.riskScore > 60 ? "text-red-400" : metal.riskScore > 40 ? "text-yellow-400" : "text-green-400"}`}>
              {metal.riskScore}/100
            </p>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </div>
      </div>

      <p className={`text-sm mt-3 ${style.text} font-medium`}>{metal.headline}</p>

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-gray-700/30 pt-4">
          <div>
            <p className="text-sm text-gray-300 leading-relaxed">{metal.reasoning}</p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Time Horizon: {metal.timeHorizon}</span>
            <span className="mx-2">|</span>
            <Target className="w-3.5 h-3.5" />
            <span>Confidence: {metal.confidence}%</span>
          </div>

          {metal.keyFactors.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">What We're Watching</p>
              <div className="space-y-1.5">
                {metal.keyFactors.map((factor, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <p className="text-xs text-gray-400 leading-relaxed">{factor}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmergingMetalCard({ metal }: { metal: EmergingMetal }) {
  const [expanded, setExpanded] = useState(false);

  const riskColor = metal.riskLevel === "LOW" ? "text-green-400 border-green-500/30" :
    metal.riskLevel === "MODERATE" ? "text-yellow-400 border-yellow-500/30" :
    "text-red-400 border-red-500/30";

  return (
    <div
      className="rounded-xl border border-purple-500/20 bg-purple-900/10 p-4 cursor-pointer hover:border-purple-500/40 transition-all"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h4 className="font-semibold text-white text-sm">{metal.metal}</h4>
          <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0 ${riskColor}`}>
            {metal.riskLevel} RISK
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{metal.timeframe}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
        </div>
      </div>

      {expanded && (
        <div className="mt-3 space-y-2 border-t border-gray-700/20 pt-3">
          <p className="text-xs text-gray-300 leading-relaxed">{metal.why}</p>
          <div className="bg-gray-800/40 rounded-lg p-2.5">
            <p className="text-[10px] text-purple-400 font-medium uppercase tracking-wider mb-1">Demand Driver</p>
            <p className="text-xs text-gray-400 leading-relaxed">{metal.demandDriver}</p>
          </div>
          <p className="text-xs text-gray-500 italic">{metal.outlook}</p>
        </div>
      )}
    </div>
  );
}

export function MarketIntelligenceContent() {
  const { data, isLoading, refetch, isFetching } = useQuery<{ success: boolean; data: AdvisoryData }>({
    queryKey: ["/api/market-signals/advisory"],
    refetchInterval: 5 * 60 * 1000,
  });

  const advisory = data?.data;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Activity className="w-12 h-12 text-amber-400 animate-pulse" />
        <p className="text-gray-400 mt-4">Running deep market analysis...</p>
      </div>
    );
  }

  if (!advisory) {
    return (
      <div className="text-center py-20">
        <Activity className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">Analysis engine initializing. Check back in a moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Card className={`border ${advisory.overallRiskScore > 60 ? "border-red-500/30 bg-red-950/10" : advisory.overallRiskScore > 35 ? "border-yellow-500/20 bg-yellow-950/5" : "border-green-500/20 bg-green-950/5"}`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${advisory.overallRiskScore > 60 ? "bg-red-900/30" : advisory.overallRiskScore > 35 ? "bg-yellow-900/20" : "bg-green-900/20"}`}>
              {advisory.overallRiskScore > 60 ? (
                <AlertTriangle className="w-7 h-7 text-red-400" />
              ) : advisory.overallRiskScore > 35 ? (
                <Gauge className="w-7 h-7 text-yellow-400" />
              ) : (
                <Shield className="w-7 h-7 text-green-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-gray-300 leading-relaxed">{advisory.overallSentiment}</p>
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Overall Market Risk</span>
                  <span className="text-sm font-bold text-white">{advisory.overallRiskScore}/100</span>
                </div>
                <RiskGauge score={advisory.overallRiskScore} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Gem className="w-5 h-5 text-amber-400" />
          Precious Metals Outlook
        </h2>
        <div className="space-y-3">
          {advisory.metals.map((metal) => (
            <MetalCard key={metal.symbol} metal={metal} />
          ))}
        </div>
      </div>

      {advisory.emergingMetals && advisory.emergingMetals.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Emerging Metals to Watch
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            Metals and materials gaining attention due to technological shifts, supply constraints, or emerging industrial demand.
          </p>
          <div className="space-y-2">
            {advisory.emergingMetals.map((metal) => (
              <EmergingMetalCard key={metal.metal} metal={metal} />
            ))}
          </div>
        </div>
      )}

      {advisory.geopoliticalFactors && advisory.geopoliticalFactors.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            Global Factors Influencing Markets
          </h2>
          <div className="space-y-2">
            {advisory.geopoliticalFactors.map((factor, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-900/40 border border-gray-700/20 rounded-lg p-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <p className="text-xs text-gray-400 leading-relaxed">{factor}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-900/40 border border-gray-700/20 rounded-xl p-5">
        <p className="text-[11px] text-gray-500 leading-relaxed">
          {advisory.disclaimer}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Last updated: {new Date(advisory.timestamp).toLocaleString()}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-xs border-gray-600 text-gray-300 hover:border-amber-500 hover:text-amber-400"
        >
          <RefreshCw className={`w-3 h-3 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh Analysis
        </Button>
      </div>
    </div>
  );
}

export default function MarketSignals() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 pt-20 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Eye className="w-8 h-8 text-amber-400" />
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Market Intelligence</h1>
            </div>
            <p className="text-lg text-amber-400/90 italic font-medium">
              "Pay attention to the signs, not the headlines."
            </p>
            <p className="text-sm text-gray-400 mt-2 max-w-2xl mx-auto">
              Proprietary analysis across precious metals, global markets, and emerging opportunities. Updated in real time.
            </p>
          </div>
          <MarketIntelligenceContent />
        </div>
      </div>
    </>
  );
}
