import { useState } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProseRenderer } from "@/components/ui/prose-renderer";
import { ProfessionalDocument } from "@/components/ui/professional-document";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Brain,
  Zap,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Shield,
  DollarSign,
  Gem,
  Clock,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface AnalysisResult {
  content: string;
  provider?: string;
  type?: string;
  toolsUsed?: string[];
  liveData?: boolean;
  hadThinking?: boolean;
  timestamp: Date;
}

const analysisTopics = [
  {
    id: "gold-outlook",
    title: "Gold Price Outlook",
    prompt: "Provide a concise market analysis of gold prices. Include current price trends, key factors affecting gold (inflation, USD strength, geopolitical tensions, central bank buying), short-term and long-term outlook, and actionable insights for investors. Format with clear sections.",
    icon: DollarSign,
    gradient: "from-yellow-500 to-amber-600",
  },
  {
    id: "silver-analysis",
    title: "Silver Market Analysis",
    prompt: "Provide a concise market analysis of silver prices. Cover the gold-silver ratio, industrial demand (solar panels, electronics), investment demand, supply constraints, and price outlook. Include comparison to gold as an investment.",
    icon: TrendingUp,
    gradient: "from-gray-400 to-slate-600",
  },
  {
    id: "platinum-palladium",
    title: "Platinum & Palladium",
    prompt: "Analyze the platinum and palladium markets. Cover automotive demand, hydrogen economy potential for platinum, supply from South Africa and Russia, investment potential, and price forecasts. Compare both metals.",
    icon: Sparkles,
    gradient: "from-blue-400 to-indigo-600",
  },
  {
    id: "diamond-market",
    title: "Diamond Market Trends",
    prompt: "Analyze the current diamond market. Cover natural vs lab-grown diamond dynamics, price trends by carat/clarity/color, consumer preferences, De Beers market strategy, and investment potential. Include practical buying advice.",
    icon: Gem,
    gradient: "from-cyan-400 to-blue-600",
  },
  {
    id: "macro-impact",
    title: "Macro Economic Impact",
    prompt: "Analyze how current macroeconomic conditions affect precious metals. Cover Federal Reserve policy, inflation expectations, USD trends, bond yields, recession indicators, and how each factor impacts gold, silver, and platinum prices.",
    icon: BarChart3,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "investment-strategy",
    title: "Investment Strategy",
    prompt: "Provide a balanced precious metals investment strategy for 2025-2026. Cover portfolio allocation recommendations, physical vs paper metals, ETFs vs coins, timing strategies, risk management, and beginner vs advanced approaches.",
    icon: Shield,
    gradient: "from-violet-500 to-purple-600",
  },
];

export function MarketAnalysisContent() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Record<string, AnalysisResult>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const generateAnalysis = async (topicId: string) => {
    const topic = analysisTopics.find(t => t.id === topicId);
    if (!topic) return;

    setLoading(topicId);
    setSelectedTopic(topicId);

    try {
      let liveContext = "";
      try {
        const [pricingRes, metalsRes] = await Promise.all([
          fetch("/api/pricing/kitco").then(r => r.json()).catch(() => null),
          fetch("/api/tickers/metals").then(r => r.json()).catch(() => null),
        ]);

        const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        liveContext = `\n\nIMPORTANT LIVE DATA (use these real prices, today is ${today}):\n`;

        if (pricingRes?.success && pricingRes.prices) {
          const p = pricingRes.prices;
          if (p.gold) liveContext += `Gold spot price: $${p.gold.toFixed(2)}/oz. `;
          if (p.silver) liveContext += `Silver spot price: $${p.silver.toFixed(2)}/oz. `;
          if (p.platinum) liveContext += `Platinum spot price: $${p.platinum.toFixed(2)}/oz. `;
          if (p.palladium) liveContext += `Palladium spot price: $${p.palladium.toFixed(2)}/oz. `;
        }

        if (metalsRes?.success && metalsRes.data?.items) {
          const metalsItems = metalsRes.data.items;
          const goldFuture = metalsItems.find((i: any) => i.symbol === 'GC=F');
          const silverFuture = metalsItems.find((i: any) => i.symbol === 'SI=F');
          if (goldFuture) liveContext += `Gold futures (GC=F): $${goldFuture.price}, 24h change: ${goldFuture.changePercent}%. `;
          if (silverFuture) liveContext += `Silver futures (SI=F): $${silverFuture.price}, 24h change: ${silverFuture.changePercent}%. `;
        }

        liveContext += `\nUse these real-time prices in your analysis. Do NOT reference older prices or dates. Today's date is ${today}.`;
      } catch {
        liveContext = "";
      }

      const response = await apiRequest("POST", "/api/ai/revolutionary", {
        prompt: topic.prompt + liveContext,
        systemPrompt: "You are Simplicity, the market intelligence AI inside Simpleton™. Provide deep, data-driven analysis with actionable insights. Write the way a sharp analyst friend would talk — clear, confident, warm, and direct. Not a formal report. Not robotic. NEVER use markdown symbols: no asterisks, no pound signs, no bullet dashes, no underscores, no backticks. Write in flowing paragraphs. Include specific price levels, percentage moves, and concrete recommendations woven naturally into sentences. Use contractions. Vary sentence length. Start with the actual insight, not filler like 'Certainly' or 'Based on my analysis'. Sound like a real person who knows their stuff.",
        consensus: false,
        useThinking: true,
      });
      const data = await response.json();

      setAnalysis(prev => ({
        ...prev,
        [topicId]: {
          content: data.response || "Analysis unavailable. Please try again.",
          provider: data.metadata?.provider,
          type: data.type,
          toolsUsed: data.metadata?.toolsUsed,
          liveData: data.metadata?.liveData,
          hadThinking: data.metadata?.hadThinking,
          timestamp: new Date(),
        }
      }));
    } catch {
      setAnalysis(prev => ({
        ...prev,
        [topicId]: {
          content: "Unable to generate analysis right now. Please try again in a moment.",
          timestamp: new Date(),
        }
      }));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {analysisTopics.map((topic, index) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card
              className={`cursor-pointer transition-all duration-300 border ${selectedTopic === topic.id ? 'scale-[1.02] shadow-lg' : 'hover:scale-[1.01]'}`}
              style={{
                backgroundColor: 'var(--card)',
                borderColor: selectedTopic === topic.id ? 'var(--primary)' : 'var(--border)',
              }}
              onClick={() => {
                if (!analysis[topic.id]) {
                  generateAnalysis(topic.id);
                } else {
                  setSelectedTopic(selectedTopic === topic.id ? null : topic.id);
                }
              }}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${topic.gradient} flex items-center justify-center`}>
                    <topic.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{topic.title}</h3>
                    {analysis[topic.id] && (
                      <span className="text-xs opacity-40 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {analysis[topic.id].timestamp.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>

                {loading === topic.id ? (
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--primary)' }}>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Generating analysis...
                  </div>
                ) : analysis[topic.id] ? (
                  <div className="flex items-center justify-between">
                    <Badge className="text-xs" style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)' }}>
                      Ready
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); generateAnalysis(topic.id); }}
                      className="text-xs opacity-50 hover:opacity-100"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" /> Refresh
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--primary)' }}>
                    Click to generate <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {selectedTopic && analysis[selectedTopic] && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--primary)' }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {(() => {
                    const topic = analysisTopics.find(t => t.id === selectedTopic);
                    if (!topic) return null;
                    return (
                      <>
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${topic.gradient} flex items-center justify-center`}>
                          <topic.icon className="w-4 h-4 text-white" />
                        </div>
                        {topic.title}
                      </>
                    );
                  })()}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {analysis[selectedTopic].type === "thinking" && (
                    <Badge variant="outline" className="text-xs" style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>
                      <Brain className="w-3 h-3 mr-1" />
                      Deep Thinking
                    </Badge>
                  )}
                  {(analysis[selectedTopic].type === "tools" || analysis[selectedTopic].liveData) && (
                    <Badge variant="outline" className="text-xs" style={{ borderColor: '#22c55e', color: '#22c55e' }}>
                      <Shield className="w-3 h-3 mr-1" />
                      Live Tools
                    </Badge>
                  )}
                  {analysis[selectedTopic].type === "beta" && (
                    <Badge variant="outline" className="text-xs" style={{ borderColor: '#a855f7', color: '#a855f7' }}>
                      DeepSeek Beta
                    </Badge>
                  )}
                  {analysis[selectedTopic].provider && !["tools","beta","thinking"].includes(analysis[selectedTopic].type ?? '') && !analysis[selectedTopic].liveData && (
                    <Badge variant="outline" className="text-xs" style={{ borderColor: 'var(--border)' }}>
                      {analysis[selectedTopic].provider}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ProfessionalDocument title={analysisTopics.find(t => t.id === selectedTopic)?.title || "Market Analysis"} subtitle="Generated by Simplicity Intelligence">
                <div className="prose prose-sm max-w-none">
                  <ProseRenderer content={analysis[selectedTopic].content} className="opacity-90" />
                </div>
              </ProfessionalDocument>
              <div className="mt-4 pt-4 flex items-center justify-between text-xs opacity-40" style={{ borderTop: '1px solid var(--border)' }}>
                <span>Generated {analysis[selectedTopic].timestamp.toLocaleString()}</span>
                <span>Simplicity analysis — not financial advice</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

export default function AIMarketAnalysis() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <Navigation />
      <section className="relative pt-24 pb-8 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-1/3 w-72 h-72 rounded-full blur-[100px] opacity-15" style={{ background: 'var(--primary)' }} />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Simplicity Market <span style={{ color: 'var(--primary)' }}>Analysis</span>
            </h1>
            <p className="text-lg max-w-2xl mx-auto opacity-60 mb-8">
              Get Simplicity's instant market insights for precious metals and diamonds.
            </p>
          </motion.div>
        </div>
      </section>
      <section className="py-8 flex-1">
        <div className="container mx-auto px-4">
          <MarketAnalysisContent />
        </div>
      </section>
      <Footer />
    </div>
  );
}