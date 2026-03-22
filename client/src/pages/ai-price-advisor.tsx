import { useState } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProseRenderer } from "@/components/ui/prose-renderer";
import { ProfessionalDocument } from "@/components/ui/professional-document";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Gem,
  DollarSign,
  Brain,
  Sparkles,
  Send,
  RotateCcw,
  Scale,
  Award,
  Target,
  Coins,
  Watch,
  Shield,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface AdvisorResult {
  content: string;
  type?: string;
  toolsUsed?: string[];
  liveData?: boolean;
  hadThinking?: boolean;
  timestamp: Date;
}

const quickCategories = [
  { id: "diamond", label: "Diamond", icon: Gem, gradient: "from-cyan-500 to-blue-600", examples: ["1 carat round brilliant VS1 E color", "2ct cushion cut SI1 H color", "0.5ct princess cut VVS2 D color"] },
  { id: "gold", label: "Gold", icon: Coins, gradient: "from-yellow-500 to-amber-600", examples: ["1oz American Gold Eagle", "10g 24K gold bar", "14K gold chain 20 inches 3mm"] },
  { id: "silver", label: "Silver", icon: DollarSign, gradient: "from-gray-400 to-slate-600", examples: ["1oz American Silver Eagle", "100oz silver bar", "Morgan Silver Dollar 1921"] },
  { id: "platinum", label: "Platinum", icon: Sparkles, gradient: "from-blue-300 to-indigo-500", examples: ["1oz platinum bar", "Platinum wedding band 6mm", "1oz Platinum Eagle coin"] },
  { id: "watch", label: "Watch", icon: Watch, gradient: "from-emerald-500 to-teal-600", examples: ["Rolex Submariner 126610LN", "Rolex Daytona 116500LN", "Rolex Datejust 41mm"] },
];

export default function AIPriceAdvisor() {
  const [selectedCategory, setSelectedCategory] = useState("diamond");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<AdvisorResult | null>(null);
  const [loading, setLoading] = useState(false);

  const currentCategory = quickCategories.find(c => c.id === selectedCategory)!;

  const getAdvice = async (text?: string) => {
    const query = text || description.trim();
    if (!query) return;

    setLoading(true);
    setDescription(text || description);

    const categoryLabel = currentCategory.label;

    try {
      const response = await apiRequest("POST", "/api/ai/revolutionary", {
        prompt: `I need a price estimate and quality analysis for: ${query}\n\nCategory: ${categoryLabel}\n\nPlease provide:\n1. Estimated price range (retail and wholesale if applicable)\n2. Quality assessment based on the description\n3. Key factors affecting the price\n4. Buying recommendations and tips\n5. What to look for / watch out for\n6. How this compares to similar items in the market\n\nBe specific with dollar amounts and percentages where possible.`,
        systemPrompt: `You are an expert appraiser and pricing specialist for ${categoryLabel.toLowerCase()}s, precious metals, and luxury goods at Simpleton™. Provide detailed, accurate pricing estimates with clear explanations. Always give specific price ranges in USD. Write in polished, professional prose — like a premium valuation report. NEVER use markdown symbols: no asterisks, no pound signs, no bullet dashes, no underscores, no backticks. Write flowing paragraphs with natural section labels when needed. Be helpful and educational while being honest about market conditions.`,
        consensus: false,
      });
      const data = await response.json();

      setResult({
        content: data.response || "Unable to generate pricing advice. Please try again.",
        type: data.type,
        toolsUsed: data.metadata?.toolsUsed,
        liveData: data.metadata?.liveData,
        hadThinking: data.metadata?.hadThinking,
        timestamp: new Date(),
      });
    } catch {
      setResult({
        content: "Sorry, I couldn't connect to the pricing service right now. Please try again in a moment.",
        timestamp: new Date(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <Navigation />

      <section className="relative pt-24 pb-8 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/3 w-72 h-72 rounded-full blur-[100px] opacity-15" style={{ background: 'var(--primary)' }} />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 border" style={{ borderColor: 'var(--primary)', color: 'var(--primary)', backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)' }}>
              <Target className="w-4 h-4" />
              Simplicity Pricing Intelligence
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Simplicity Price <span style={{ color: 'var(--primary)' }}>Advisor</span>
            </h1>
            <p className="text-lg max-w-2xl mx-auto opacity-60">
              Describe any diamond, precious metal, or luxury watch and get instant Simplicity-powered
              pricing estimates, quality analysis, and expert buying recommendations.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-6 flex-1">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {quickCategories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => { setSelectedCategory(cat.id); setResult(null); }}
                style={selectedCategory === cat.id ? { backgroundColor: 'color-mix(in srgb, var(--primary) 20%, var(--card))', color: 'var(--primary)', border: '1px solid color-mix(in srgb, var(--primary) 40%, transparent)' } : { borderColor: 'var(--border)' }}
              >
                <cat.icon className="w-4 h-4 mr-1" />
                {cat.label}
              </Button>
            ))}
          </div>

          <Card className="mb-6 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentCategory.gradient} flex items-center justify-center`}>
                  <currentCategory.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Describe Your {currentCategory.label}</h3>
                  <p className="text-xs opacity-50">Include as much detail as possible for the best estimate</p>
                </div>
              </div>

              <div className="flex gap-2 mb-3">
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") getAdvice(); }}
                  placeholder={`e.g. ${currentCategory.examples[0]}`}
                  className="flex-1"
                  style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                  disabled={loading}
                />
                <Button
                  onClick={() => getAdvice()}
                  disabled={!description.trim() || loading}
                  style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                >
                  {loading ? (
                    <Brain className="w-4 h-4 animate-pulse" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs opacity-40">Try:</span>
                {currentCategory.examples.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => { setDescription(ex); getAdvice(ex); }}
                    className="text-xs px-2.5 py-1 rounded-full border transition-all hover:scale-105"
                    style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}
                    disabled={loading}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 15%, transparent)' }}>
                    <Brain className="w-6 h-6 animate-pulse" style={{ color: 'var(--primary)' }} />
                  </div>
                  <p className="font-medium mb-1">Analyzing your {currentCategory.label.toLowerCase()}...</p>
                  <p className="text-sm opacity-50">Simplicity is evaluating pricing, quality factors, and market conditions</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {result && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--primary)' }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Scale className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                      Price Analysis
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {result.type === "thinking" ? (
                        <Badge variant="outline" style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>
                          <Brain className="w-3 h-3 mr-1" /> Deep Thinking
                        </Badge>
                      ) : (result.type === "tools" || result.liveData) ? (
                        <Badge variant="outline" style={{ borderColor: '#22c55e', color: '#22c55e' }}>
                          <Shield className="w-3 h-3 mr-1" /> Live Tools
                        </Badge>
                      ) : result.type === "beta" ? (
                        <Badge variant="outline" style={{ borderColor: '#a855f7', color: '#a855f7' }}>
                          DeepSeek Beta
                        </Badge>
                      ) : (
                        <Badge style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)' }}>
                          <Award className="w-3 h-3 mr-1" /> Simplicity Estimate
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => getAdvice()}
                        className="text-xs"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ProfessionalDocument title="Price Valuation Report" subtitle="Generated by Simplicity Intelligence">
                    <ProseRenderer content={result.content} className="opacity-90" />
                  </ProfessionalDocument>
                  <div className="mt-4 pt-4 text-xs opacity-40" style={{ borderTop: '1px solid var(--border)' }}>
                    Generated {result.timestamp.toLocaleString()} · Simplicity estimate — consult a certified appraiser for official valuations
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}