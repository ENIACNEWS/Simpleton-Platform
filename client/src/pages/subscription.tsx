import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Crown,
  Diamond,
  Shield,
  Star,
  TrendingUp,
  Watch,
  Bot,
  Users,
  Lock,
  RefreshCw,
  Zap,
  ArrowRight,
  Gem,
  ChevronRight,
} from "lucide-react";
import { Navigation } from "@/components/layout/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  tierId: string;
  name: string;
  subtitle: string;
  monthlyPrice: number;
  annualPrice: number;
  priceIdMonthly: string;
  priceIdAnnual: string;
  features: PlanFeature[];
  cta: string;
  highlighted: boolean;
  theme: "silver" | "gold" | "diamond";
}

const plans: Plan[] = [
  {
    id: "free",
    tierId: "free",
    name: "Free",
    subtitle: "Try Simpleton Vision™ — no credit card required",
    monthlyPrice: 0,
    annualPrice: 0,
    priceIdMonthly: "price_free_monthly",
    priceIdAnnual: "price_free_annual",
    features: [
      { text: "Basic precious metals calculator", included: true },
      { text: "Live gold, silver, platinum spot prices", included: true },
      { text: "5 AI lookups per day", included: true },
      { text: "Limited coin and jewelry database", included: true },
      { text: "3 documents for $0.99", included: true },
    ],
    cta: "Start Free",
    highlighted: false,
    theme: "silver",
  },
  {
    id: "pro",
    tierId: "pro",
    name: "Simpleton Pro",
    subtitle: "For collectors, enthusiasts, and smart buyers",
    monthlyPrice: 9.99,
    annualPrice: 96,
    priceIdMonthly: "price_pro_monthly",
    priceIdAnnual: "price_pro_annual",
    features: [
      { text: "Everything in Free, plus:", included: true },
      { text: "Unlimited AI assistant (Simplicity)", included: true },
      { text: "Rolex authentication and reference database", included: true },
      { text: "Full coin database with melt values", included: true },
      { text: "AI diamond pricing engine", included: true },
      { text: "Market intelligence and buy/hold/sell signals", included: true },
      { text: "Portfolio tracking with performance charts", included: true },
      { text: "Professional appraisals: $4.99 each", included: true },
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
    theme: "gold",
  },
];

const trustSignals = [
  { icon: Users, text: "Trusted by 12,000+ collectors" },
  { icon: RefreshCw, text: "Cancel anytime" },
  { icon: Shield, text: "30-day money-back guarantee" },
  { icon: Lock, text: "Secure payments" },
  { icon: Zap, text: "AI valuations powered by real-time market data" },
];

const whyUpgrade = [
  {
    icon: TrendingUp,
    title: "See live portfolio gains",
    description: "Track your precious metals portfolio performance in real time with advanced charts and analytics.",
  },
  {
    icon: Diamond,
    title: "Get accurate diamond pricing",
    description: "Simplicity-powered diamond pricing engine with real-time market data for precise valuations.",
  },
  {
    icon: Watch,
    title: "Authenticate luxury watches",
    description: "Rolex authentication insights and market data for confident trading decisions.",
  },
  {
    icon: Bot,
    title: "Ask unlimited AI valuation questions",
    description: "No daily limits on Simplicity-powered appraisals for gold, silver, diamonds, and luxury watches.",
  },
];

export default function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: subscriptionStatus } = useQuery<{ tier?: string; status?: string }>({
    queryKey: ["/api/subscription/status"],
  });

  const subscribeMutation = useMutation({
    mutationFn: async ({ tierId, billingPeriod }: { tierId: string; billingPeriod: string }) => {
      const res = await apiRequest("POST", "/api/subscription/checkout", { tierId, billingPeriod });
      return res.json();
    },
    onSuccess: (data: any) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = (plan: Plan) => {
    if (plan.id === "free") return;
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }
    subscribeMutation.mutate({ tierId: plan.tierId, billingPeriod: billingCycle });
  };

  const getPrice = (plan: Plan) => {
    if (plan.monthlyPrice === 0) return "Free";
    if (billingCycle === "monthly") return `$${plan.monthlyPrice}`;
    return `$${plan.annualPrice}`;
  };

  const getPriceSuffix = (plan: Plan) => {
    if (plan.monthlyPrice === 0) return "";
    return billingCycle === "monthly" ? "/mo" : "/yr";
  };

  const getMonthlySavings = (plan: Plan) => {
    if (plan.monthlyPrice === 0 || billingCycle === "monthly") return null;
    const monthlyTotal = plan.monthlyPrice * 12;
    const savings = monthlyTotal - plan.annualPrice;
    return savings;
  };

  const getCardClasses = (plan: Plan) => {
    const base = "relative overflow-hidden border-2 transition-all duration-300";

    if (plan.theme === "silver") {
      return `${base} bg-gradient-to-br from-slate-800/90 via-slate-700/80 to-slate-800/90 border-slate-500/40 backdrop-blur-xl hover:border-slate-400/60 hover:shadow-lg hover:shadow-slate-500/10`;
    }
    if (plan.theme === "gold") {
      return `${base} bg-gradient-to-br from-amber-950/40 via-yellow-900/30 to-amber-950/40 border-amber-400/60 backdrop-blur-xl shadow-xl shadow-amber-500/20 hover:shadow-2xl hover:shadow-amber-400/30 hover:border-amber-300/80 md:scale-105 md:-my-4`;
    }
    return `${base} bg-gradient-to-br from-gray-950/95 via-slate-900/90 to-gray-950/95 border-purple-500/30 backdrop-blur-xl hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/10`;
  };

  const getIconForPlan = (plan: Plan) => {
    if (plan.theme === "silver") return <Shield className="w-8 h-8 text-slate-300" />;
    if (plan.theme === "gold") return <Crown className="w-8 h-8 text-amber-400" />;
    return <Gem className="w-8 h-8 text-purple-300" />;
  };

  const getButtonClasses = (plan: Plan) => {
    if (plan.theme === "silver") {
      return "w-full bg-slate-600 hover:bg-slate-500 text-white font-semibold py-3 text-base transition-all duration-200";
    }
    if (plan.theme === "gold") {
      return "w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold py-3 text-base transition-all duration-200 shadow-lg shadow-amber-500/30";
    }
    return "w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3 text-base transition-all duration-200";
  };

  const getCheckColor = (plan: Plan) => {
    if (plan.theme === "silver") return "text-slate-400";
    if (plan.theme === "gold") return "text-amber-400";
    return "text-purple-400";
  };

  const isCurrentPlan = (plan: Plan) => {
    if (!subscriptionStatus?.tier && plan.id === "free") return true;
    return subscriptionStatus?.tier === plan.tierId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950">
      <Navigation />

      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
              Choose Your <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent">Plan</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Know what your valuables are worth. Powered by AI, certified by experts.
            </p>
          </div>

          <div className="flex items-center justify-center mb-12">
            <div className="inline-flex items-center bg-slate-800/60 backdrop-blur-md rounded-full p-1 border border-slate-700/50">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  billingCycle === "monthly"
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  billingCycle === "annual"
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Annual
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs px-2 py-0">
                  Save 20%
                </Badge>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto mb-20 items-start">
            {plans.map((plan) => (
              <Card key={plan.id} className={getCardClasses(plan)}>
                {plan.highlighted && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-center py-1.5 text-xs font-bold uppercase tracking-wider">
                    <Star className="w-3 h-3 inline mr-1" />
                    Most Popular
                  </div>
                )}

                {plan.theme === "gold" && (
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-yellow-500/5 pointer-events-none" />
                )}

                {plan.theme === "diamond" && (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
                )}

                <CardHeader className={`text-center relative z-10 ${plan.highlighted ? "pt-12" : "pt-8"} pb-4`}>
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-2xl ${
                      plan.theme === "silver" ? "bg-slate-700/50" :
                      plan.theme === "gold" ? "bg-amber-500/10 ring-1 ring-amber-500/20" :
                      "bg-purple-500/10 ring-1 ring-purple-500/20"
                    }`}>
                      {getIconForPlan(plan)}
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 mb-1">
                    <CardTitle className="text-2xl font-bold text-white">{plan.name}</CardTitle>
                    {isCurrentPlan(plan) && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                        Current Plan
                      </Badge>
                    )}
                  </div>

                  <p className="text-slate-400 text-sm mb-6">{plan.subtitle}</p>

                  <div className="flex items-baseline justify-center gap-1">
                    <span className={`text-5xl font-bold ${
                      plan.theme === "silver" ? "text-slate-200" :
                      plan.theme === "gold" ? "text-amber-300" :
                      "text-purple-200"
                    }`}>
                      {getPrice(plan)}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span className="text-slate-500 text-lg">{getPriceSuffix(plan)}</span>
                    )}
                  </div>

                  {getMonthlySavings(plan) && (
                    <p className="text-green-400 text-sm mt-2 font-medium">
                      Save ${getMonthlySavings(plan)}/year
                    </p>
                  )}
                </CardHeader>

                <CardContent className="relative z-10 space-y-6 pb-8">
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${getCheckColor(plan)}`} />
                        <span className="text-slate-300 text-sm leading-relaxed">{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleSubscribe(plan)}
                    disabled={subscribeMutation.isPending || isCurrentPlan(plan)}
                    className={getButtonClasses(plan)}
                  >
                    {subscribeMutation.isPending ? (
                      "Processing..."
                    ) : isCurrentPlan(plan) ? (
                      "Current Plan"
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        {plan.cta}
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mb-20">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 py-8 px-6 rounded-2xl bg-slate-800/30 border border-slate-700/30 backdrop-blur-sm">
              {trustSignals.map((signal, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-400">
                  <signal.icon className="w-4 h-4 text-amber-500/70" />
                  <span className="text-sm font-medium">{signal.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Why Upgrade to <span className="bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">Pro</span>?
              </h2>
              <p className="text-slate-400 text-lg max-w-xl mx-auto">
                Unlock the full power of <span className="simpleton-brand">Simpleton</span> Vision™ with professional-grade tools.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyUpgrade.map((item, idx) => (
                <div
                  key={idx}
                  className="group relative p-6 rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/40 backdrop-blur-sm hover:border-amber-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5"
                >
                  <div className="mb-4 p-3 w-fit rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors duration-300">
                    <item.icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
                  <ChevronRight className="w-5 h-5 text-amber-500/0 group-hover:text-amber-500/60 absolute top-6 right-6 transition-all duration-300" />
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Button
                onClick={() => {
                  if (!isAuthenticated) {
                    setLocation("/login");
                    return;
                  }
                  subscribeMutation.mutate({ tierId: "pro", billingPeriod: billingCycle });
                }}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold px-8 py-3 text-base shadow-lg shadow-amber-500/20"
              >
                Upgrade to Pro Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          <div className="mb-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Per-Document <span className="bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">Pricing</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-xl mx-auto">
                Pay only for what you need. No subscription required.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full max-w-3xl mx-auto">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold text-sm uppercase tracking-wider">Document Type</th>
                    <th className="text-center py-4 px-6 text-slate-400 font-semibold text-sm uppercase tracking-wider">Free</th>
                    <th className="text-center py-4 px-6 text-amber-400 font-semibold text-sm uppercase tracking-wider">Pro</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Professional Appraisal", free: "3 for $0.99", pro: "$4.99 each" },
                    { name: "Market Intelligence Report", free: "3 for $0.99", pro: "$4.99 each" },
                    { name: "Rolex Authentication Certificate", free: "3 for $0.99", pro: "$4.99 each" },
                    { name: "Diamond Grading Report", free: "3 for $0.99", pro: "$4.99 each" },
                  ].map((doc, idx) => (
                    <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-6 text-white font-medium">{doc.name}</td>
                      <td className="py-4 px-6 text-center text-slate-300">{doc.free}</td>
                      <td className="py-4 px-6 text-center text-amber-300 font-medium">{doc.pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
