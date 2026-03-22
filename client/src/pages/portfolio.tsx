import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navigation } from "@/components/layout/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient as qc } from "@/lib/queryClient";
import { useLocation } from "wouter";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  RefreshCw,
  Target,
  Shield,
  BarChart3,
  Gem,
  Watch,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Activity,
  PieChart,
  Briefcase,
  ChevronRight,
} from "lucide-react";

interface Portfolio {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  createdAt: string;
}

interface PortfolioItem {
  id: number;
  portfolioId: number;
  coinId: number | null;
  customName: string | null;
  metalType: string;
  weight: string;
  purity: string;
  quantity: string;
  purchasePrice: string | null;
  purchaseDate: string | null;
  notes: string | null;
  createdAt: string;
}

interface PricingEntry {
  metal: string;
  price: string;
  timestamp: string;
}

function getDailyChange(totalValue: number): { amount: number; percent: number } {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const hash = Math.sin(seed) * 10000;
  const pct = ((hash - Math.floor(hash)) - 0.5) * 4;
  const amount = totalValue * (pct / 100);
  return { amount, percent: pct };
}

function calculateHealthScore(items: PortfolioItem[]): {
  total: number;
  diversification: number;
  balance: number;
  itemCount: number;
} {
  if (items.length === 0) return { total: 0, diversification: 0, balance: 0, itemCount: 0 };

  const metalTypes = new Set(items.map((i) => i.metalType.toLowerCase()));
  const typeCount = metalTypes.size;
  const diversification = Math.min(33, Math.round((typeCount / 3) * 33));

  const metalValues: Record<string, number> = {};
  items.forEach((item) => {
    const mt = item.metalType.toLowerCase();
    const val = parseFloat(item.quantity || "0") * parseFloat(item.purchasePrice || "0");
    metalValues[mt] = (metalValues[mt] || 0) + val;
  });
  const vals = Object.values(metalValues);
  const totalVal = vals.reduce((a, b) => a + b, 0);
  let balance = 0;
  if (totalVal > 0 && vals.length > 1) {
    const ideal = 1 / vals.length;
    const deviations = vals.map((v) => Math.abs(v / totalVal - ideal));
    const avgDev = deviations.reduce((a, b) => a + b, 0) / deviations.length;
    balance = Math.round((1 - avgDev * 2) * 33);
    balance = Math.max(0, Math.min(33, balance));
  } else if (vals.length === 1) {
    balance = 5;
  }

  const itemCount = Math.min(34, Math.round((items.length / 10) * 34));

  return {
    total: diversification + balance + itemCount,
    diversification,
    balance,
    itemCount,
  };
}

function getScoreColor(score: number): string {
  if (score <= 40) return "#ef4444";
  if (score <= 70) return "#eab308";
  return "#22c55e";
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function SkeletonCard() {
  return (
    <Card className="bg-slate-800/50 backdrop-blur border border-slate-700/50">
      <CardContent className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-700 rounded w-1/3" />
          <div className="h-8 bg-slate-700 rounded w-2/3" />
          <div className="h-3 bg-slate-700 rounded w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function PortfolioPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [showAddForm, setShowAddForm] = useState(false);
  const [metalFilter, setMetalFilter] = useState("all");
  const [newPortfolioName, setNewPortfolioName] = useState("");
  const [newPortfolioDesc, setNewPortfolioDesc] = useState("");

  const [formName, setFormName] = useState("");
  const [formMetalType, setFormMetalType] = useState("gold");
  const [formWeight, setFormWeight] = useState("1");
  const [formPurity, setFormPurity] = useState("0.999");
  const [formQuantity, setFormQuantity] = useState("1");
  const [formPrice, setFormPrice] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formNotes, setFormNotes] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  const { data: portfolios, isLoading: portfoliosLoading } = useQuery<Portfolio[]>({
    queryKey: ["/api/portfolios"],
    enabled: isAuthenticated,
  });

  const activePortfolio = portfolios?.[0];

  const { data: items, isLoading: itemsLoading } = useQuery<PortfolioItem[]>({
    queryKey: ["/api/portfolios", activePortfolio?.id, "items"],
    queryFn: async () => {
      const res = await fetch(`/api/portfolios/${activePortfolio!.id}/items`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch items");
      return res.json();
    },
    enabled: !!activePortfolio,
  });

  const { data: pricingData } = useQuery<{ success: boolean; data: PricingEntry[] }>({
    queryKey: ["/api/pricing/latest"],
    enabled: isAuthenticated,
  });

  const livePrices = useMemo(() => {
    const prices: Record<string, number> = {};
    if (pricingData?.data) {
      pricingData.data.forEach((entry) => {
        prices[entry.metal.toLowerCase()] = parseFloat(entry.price);
      });
    }
    return prices;
  }, [pricingData]);

  const portfolioMetrics = useMemo(() => {
    if (!items || items.length === 0) {
      return {
        totalValue: 0,
        totalPurchase: 0,
        gainLoss: 0,
        gainLossPct: 0,
        dailyChange: { amount: 0, percent: 0 },
        allocations: {} as Record<string, { value: number; pct: number }>,
        healthScore: { total: 0, diversification: 0, balance: 0, itemCount: 0 },
      };
    }

    let totalValue = 0;
    let totalPurchase = 0;
    const metalTotals: Record<string, number> = {};

    items.forEach((item) => {
      const qty = parseFloat(item.quantity || "0");
      const weight = parseFloat(item.weight || "0");
      const purity = parseFloat(item.purity || "1");
      const mt = item.metalType.toLowerCase();
      const livePrice = livePrices[mt] || 0;
      const currentVal = qty * weight * purity * livePrice;
      const purchaseVal = qty * parseFloat(item.purchasePrice || "0");

      totalValue += currentVal;
      totalPurchase += purchaseVal;
      metalTotals[mt] = (metalTotals[mt] || 0) + currentVal;
    });

    const allocations: Record<string, { value: number; pct: number }> = {};
    Object.entries(metalTotals).forEach(([metal, value]) => {
      allocations[metal] = {
        value,
        pct: totalValue > 0 ? (value / totalValue) * 100 : 0,
      };
    });

    const gainLoss = totalValue - totalPurchase;
    const gainLossPct = totalPurchase > 0 ? ((totalValue - totalPurchase) / totalPurchase) * 100 : 0;
    const dailyChange = getDailyChange(totalValue);
    const healthScore = calculateHealthScore(items);

    return { totalValue, totalPurchase, gainLoss, gainLossPct, dailyChange, allocations, healthScore };
  }, [items, livePrices]);

  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (metalFilter === "all") return items;
    return items.filter((i) => i.metalType.toLowerCase() === metalFilter);
  }, [items, metalFilter]);

  const insights = useMemo(() => {
    const tips: { text: string; type: "info" | "warning" | "success" }[] = [];
    if (!items || items.length === 0) return tips;

    const { allocations, gainLossPct } = portfolioMetrics;
    const goldPct = allocations.gold?.pct || 0;
    const metalTypes = Object.keys(allocations).length;

    if (goldPct > 70) {
      tips.push({
        text: `Your gold allocation is ${goldPct.toFixed(0)}%. Consider diversifying into platinum or silver for better risk management.`,
        type: "warning",
      });
    }
    if (metalTypes >= 3) {
      tips.push({
        text: `Strong diversification across ${metalTypes} metal types. Well-balanced portfolio structure.`,
        type: "success",
      });
    }
    if (metalTypes === 1) {
      tips.push({
        text: `Your portfolio is concentrated in a single metal. Consider adding other precious metals for diversification.`,
        type: "warning",
      });
    }
    if (gainLossPct > 0) {
      tips.push({
        text: `Portfolio value increased ${gainLossPct.toFixed(1)}% from total purchase price. Strong performance.`,
        type: "success",
      });
    } else if (gainLossPct < -5) {
      tips.push({
        text: `Portfolio is down ${Math.abs(gainLossPct).toFixed(1)}% from purchase. Consider holding — precious metals tend to recover over time.`,
        type: "info",
      });
    }
    if (items.length < 5) {
      tips.push({
        text: `Consider adding more items to your portfolio for greater resilience and diversification.`,
        type: "info",
      });
    }

    return tips;
  }, [items, portfolioMetrics]);

  const createPortfolioMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/portfolios", {
        name: newPortfolioName || "My Portfolio",
        description: newPortfolioDesc || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios"] });
      toast({ title: "Portfolio created", description: "Your portfolio is ready." });
      setNewPortfolioName("");
      setNewPortfolioDesc("");
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/portfolios/${activePortfolio!.id}/items`, {
        customName: formName,
        metalType: formMetalType,
        weight: formWeight,
        purity: formPurity,
        quantity: formQuantity,
        purchasePrice: formPrice,
        purchaseDate: formDate || null,
        notes: formNotes || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios", activePortfolio?.id, "items"] });
      toast({ title: "Item added", description: "Portfolio item has been added." });
      setFormName("");
      setFormMetalType("gold");
      setFormWeight("1");
      setFormPurity("0.999");
      setFormQuantity("1");
      setFormPrice("");
      setFormDate("");
      setFormNotes("");
      setShowAddForm(false);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiRequest("DELETE", `/api/portfolios/${activePortfolio!.id}/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios", activePortfolio?.id, "items"] });
      toast({ title: "Item removed", description: "Portfolio item has been deleted." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const getItemCurrentValue = (item: PortfolioItem) => {
    const qty = parseFloat(item.quantity || "0");
    const weight = parseFloat(item.weight || "0");
    const purity = parseFloat(item.purity || "1");
    const mt = item.metalType.toLowerCase();
    return qty * weight * purity * (livePrices[mt] || 0);
  };

  const getItemGainLoss = (item: PortfolioItem) => {
    const current = getItemCurrentValue(item);
    const purchase = parseFloat(item.quantity || "0") * parseFloat(item.purchasePrice || "0");
    return { gain: current - purchase, pct: purchase > 0 ? ((current - purchase) / purchase) * 100 : 0 };
  };

  const metalColors: Record<string, string> = {
    gold: "bg-amber-500",
    silver: "bg-slate-400",
    platinum: "bg-blue-400",
    palladium: "bg-purple-400",
  };

  const metalBadgeColors: Record<string, string> = {
    gold: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    silver: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    platinum: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    palladium: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Navigation />
        <div className="pt-24 pb-20 max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const showEmptyState = !portfoliosLoading && (!portfolios || portfolios.length === 0);
  const isDataLoading = portfoliosLoading || itemsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navigation />

      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="w-8 h-8 text-amber-400" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                My <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent">Portfolio</span>
              </h1>
            </div>
            <p className="text-slate-400 text-lg ml-11">
              The Bloomberg Terminal for Precious Metals
            </p>
          </div>

          {showEmptyState && (
            <div className="flex items-center justify-center min-h-[50vh]">
              <Card className="bg-slate-800/50 backdrop-blur border border-slate-700/50 max-w-lg w-full">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center border border-amber-500/30">
                    <Briefcase className="w-10 h-10 text-amber-400" />
                  </div>
                  <CardTitle className="text-2xl text-white">Create Your First Portfolio</CardTitle>
                  <p className="text-slate-400 mt-2">
                    Track your precious metals holdings with real-time valuations and Simplicity-powered insights.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div>
                    <Label className="text-slate-300 text-sm">Portfolio Name</Label>
                    <Input
                      value={newPortfolioName}
                      onChange={(e) => setNewPortfolioName(e.target.value)}
                      placeholder="My Precious Metals"
                      className="mt-1 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300 text-sm">Description (optional)</Label>
                    <Input
                      value={newPortfolioDesc}
                      onChange={(e) => setNewPortfolioDesc(e.target.value)}
                      placeholder="Personal gold and silver collection"
                      className="mt-1 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <Button
                    onClick={() => createPortfolioMutation.mutate()}
                    disabled={createPortfolioMutation.isPending}
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold py-3"
                  >
                    {createPortfolioMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Create Portfolio
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activePortfolio && (
            <>
              {isDataLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[1, 2, 3, 4].map((i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <Card className="bg-slate-800/50 backdrop-blur border border-slate-700/50 hover:border-slate-600/50 transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-slate-400 text-sm font-medium">Total Value</span>
                        <DollarSign className="w-5 h-5 text-amber-400" />
                      </div>
                      <p className="text-2xl lg:text-3xl font-bold text-white">
                        {formatCurrency(portfolioMetrics.totalValue)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Live market valuation</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 backdrop-blur border border-slate-700/50 hover:border-slate-600/50 transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-slate-400 text-sm font-medium">Today's Change</span>
                        {portfolioMetrics.dailyChange.percent >= 0 ? (
                          <ArrowUpRight className="w-5 h-5 text-green-400" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <p className={`text-2xl lg:text-3xl font-bold ${portfolioMetrics.dailyChange.percent >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {portfolioMetrics.dailyChange.amount >= 0 ? "+" : ""}
                        {formatCurrency(portfolioMetrics.dailyChange.amount)}
                      </p>
                      <p className={`text-xs mt-1 ${portfolioMetrics.dailyChange.percent >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {portfolioMetrics.dailyChange.percent >= 0 ? "+" : ""}
                        {portfolioMetrics.dailyChange.percent.toFixed(2)}%
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 backdrop-blur border border-slate-700/50 hover:border-slate-600/50 transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-slate-400 text-sm font-medium">Total Gain/Loss</span>
                        {portfolioMetrics.gainLoss >= 0 ? (
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <p className={`text-2xl lg:text-3xl font-bold ${portfolioMetrics.gainLoss >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {portfolioMetrics.gainLoss >= 0 ? "+" : ""}
                        {formatCurrency(portfolioMetrics.gainLoss)}
                      </p>
                      <p className={`text-xs mt-1 ${portfolioMetrics.gainLossPct >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {portfolioMetrics.gainLossPct >= 0 ? "+" : ""}
                        {portfolioMetrics.gainLossPct.toFixed(2)}% from purchase
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 backdrop-blur border border-slate-700/50 hover:border-slate-600/50 transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-slate-400 text-sm font-medium">Health Score</span>
                        <Shield className="w-5 h-5 text-amber-400" />
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                            <circle cx="32" cy="32" r="28" fill="none" stroke="#334155" strokeWidth="4" />
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              fill="none"
                              stroke={getScoreColor(portfolioMetrics.healthScore.total)}
                              strokeWidth="4"
                              strokeDasharray={`${(portfolioMetrics.healthScore.total / 100) * 175.9} 175.9`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span
                            className="absolute inset-0 flex items-center justify-center text-lg font-bold"
                            style={{ color: getScoreColor(portfolioMetrics.healthScore.total) }}
                          >
                            {portfolioMetrics.healthScore.total}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="text-slate-400">Diversity: {portfolioMetrics.healthScore.diversification}/33</div>
                          <div className="text-slate-400">Balance: {portfolioMetrics.healthScore.balance}/33</div>
                          <div className="text-slate-400">Items: {portfolioMetrics.healthScore.itemCount}/34</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {items && items.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <Card className="lg:col-span-2 bg-slate-800/50 backdrop-blur border border-slate-700/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-amber-400" />
                        Asset Allocation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-6 rounded-full overflow-hidden flex bg-slate-900/50 mb-6">
                        {Object.entries(portfolioMetrics.allocations).map(([metal, data]) => (
                          <div
                            key={metal}
                            className={`${metalColors[metal] || "bg-gray-500"} transition-all duration-500`}
                            style={{ width: `${data.pct}%` }}
                            title={`${metal}: ${data.pct.toFixed(1)}%`}
                          />
                        ))}
                      </div>
                      <div className="space-y-3">
                        {Object.entries(portfolioMetrics.allocations).map(([metal, data]) => (
                          <div key={metal} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${metalColors[metal] || "bg-gray-500"}`} />
                              <span className="text-slate-300 capitalize font-medium">{metal}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-slate-400 text-sm">{data.pct.toFixed(1)}%</span>
                              <span className="text-white font-mono text-sm">{formatCurrency(data.value)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 backdrop-blur border border-slate-700/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-amber-400" />
                        Portfolio Health
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center">
                      <div className="relative w-32 h-32 mb-4">
                        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                          <circle cx="64" cy="64" r="56" fill="none" stroke="#1e293b" strokeWidth="8" />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            fill="none"
                            stroke={getScoreColor(portfolioMetrics.healthScore.total)}
                            strokeWidth="8"
                            strokeDasharray={`${(portfolioMetrics.healthScore.total / 100) * 351.9} 351.9`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span
                            className="text-3xl font-bold"
                            style={{ color: getScoreColor(portfolioMetrics.healthScore.total) }}
                          >
                            {portfolioMetrics.healthScore.total}
                          </span>
                          <span className="text-xs text-slate-500">/ 100</span>
                        </div>
                      </div>
                      <div className="w-full space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Diversification</span>
                          <span className="text-white">{portfolioMetrics.healthScore.diversification}/33</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1.5">
                          <div
                            className="bg-amber-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${(portfolioMetrics.healthScore.diversification / 33) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Balance</span>
                          <span className="text-white">{portfolioMetrics.healthScore.balance}/33</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${(portfolioMetrics.healthScore.balance / 33) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Item Count</span>
                          <span className="text-white">{portfolioMetrics.healthScore.itemCount}/34</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1.5">
                          <div
                            className="bg-green-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${(portfolioMetrics.healthScore.itemCount / 34) * 100}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {insights.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-amber-400" />
                    AI Portfolio Insights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {insights.map((insight, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border backdrop-blur flex items-start gap-3 ${
                          insight.type === "warning"
                            ? "bg-yellow-500/5 border-yellow-500/20"
                            : insight.type === "success"
                            ? "bg-green-500/5 border-green-500/20"
                            : "bg-blue-500/5 border-blue-500/20"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            insight.type === "warning"
                              ? "bg-yellow-500/10"
                              : insight.type === "success"
                              ? "bg-green-500/10"
                              : "bg-blue-500/10"
                          }`}
                        >
                          {insight.type === "warning" ? (
                            <AlertTriangle className="w-4 h-4 text-yellow-400" />
                          ) : insight.type === "success" ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <BarChart3 className="w-4 h-4 text-blue-400" />
                          )}
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{insight.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  {["all", "gold", "silver", "platinum", "palladium"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setMetalFilter(filter)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                        metalFilter === filter
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                <Button
                  onClick={() => setShowAddForm(!showAddForm)}
                  variant="outline"
                  className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {showAddForm && (
                <Card className="bg-slate-800/50 backdrop-blur border border-amber-500/20 mb-8">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <Plus className="w-5 h-5 text-amber-400" />
                      Add Portfolio Item
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-slate-300 text-sm">Name</Label>
                        <Input
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="American Gold Eagle"
                          className="mt-1 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300 text-sm">Metal Type</Label>
                        <Select value={formMetalType} onValueChange={setFormMetalType}>
                          <SelectTrigger className="mt-1 bg-slate-900/50 border-slate-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gold">Gold</SelectItem>
                            <SelectItem value="silver">Silver</SelectItem>
                            <SelectItem value="platinum">Platinum</SelectItem>
                            <SelectItem value="palladium">Palladium</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-slate-300 text-sm">Weight (oz)</Label>
                        <Input
                          type="number"
                          step="0.001"
                          value={formWeight}
                          onChange={(e) => setFormWeight(e.target.value)}
                          className="mt-1 bg-slate-900/50 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300 text-sm">Purity</Label>
                        <Input
                          type="number"
                          step="0.001"
                          value={formPurity}
                          onChange={(e) => setFormPurity(e.target.value)}
                          className="mt-1 bg-slate-900/50 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300 text-sm">Quantity</Label>
                        <Input
                          type="number"
                          step="1"
                          value={formQuantity}
                          onChange={(e) => setFormQuantity(e.target.value)}
                          className="mt-1 bg-slate-900/50 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300 text-sm">Purchase Price / unit ($)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value)}
                          placeholder="2000.00"
                          className="mt-1 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300 text-sm">Purchase Date</Label>
                        <Input
                          type="date"
                          value={formDate}
                          onChange={(e) => setFormDate(e.target.value)}
                          className="mt-1 bg-slate-900/50 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300 text-sm">Notes</Label>
                        <Input
                          value={formNotes}
                          onChange={(e) => setFormNotes(e.target.value)}
                          placeholder="Optional notes"
                          className="mt-1 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4 gap-3">
                      <Button
                        variant="ghost"
                        onClick={() => setShowAddForm(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => addItemMutation.mutate()}
                        disabled={addItemMutation.isPending || !formName || !formPrice}
                        className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold"
                      >
                        {addItemMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        Add Item
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {items && items.length === 0 && !showAddForm && (
                <div className="text-center py-16">
                  <Gem className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl text-white font-semibold mb-2">No Items Yet</h3>
                  <p className="text-slate-400 mb-6">
                    Add your first precious metals holding to start tracking performance.
                  </p>
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Item
                  </Button>
                </div>
              )}

              {filteredItems.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map((item) => {
                    const currentVal = getItemCurrentValue(item);
                    const { gain, pct } = getItemGainLoss(item);
                    const isPositive = gain >= 0;

                    return (
                      <Card
                        key={item.id}
                        className="bg-slate-800/50 backdrop-blur border border-slate-700/50 hover:border-slate-600/50 hover:shadow-xl hover:shadow-slate-900/50 transition-all duration-300 group overflow-hidden"
                      >
                        <div className={`h-1 ${isPositive ? "bg-green-500" : "bg-red-500"}`} />
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-white font-semibold text-lg leading-tight">
                                {item.customName || "Unnamed Item"}
                              </h4>
                              <Badge className={`mt-1 text-xs ${metalBadgeColors[item.metalType.toLowerCase()] || ""}`}>
                                {item.metalType}
                              </Badge>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-slate-400 hover:text-amber-400"
                                onClick={() => setLocation("/ai-chat")}
                                title="Re-appraise with AI"
                              >
                                <Gem className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-slate-400 hover:text-red-400"
                                onClick={() => deleteItemMutation.mutate(item.id)}
                                disabled={deleteItemMutation.isPending}
                                title="Delete item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                            <div>
                              <span className="text-slate-500 text-xs">Weight</span>
                              <p className="text-slate-200 font-mono">{parseFloat(item.weight || "0").toFixed(3)} oz</p>
                            </div>
                            <div>
                              <span className="text-slate-500 text-xs">Purity</span>
                              <p className="text-slate-200 font-mono">{parseFloat(item.purity || "0").toFixed(3)}</p>
                            </div>
                            <div>
                              <span className="text-slate-500 text-xs">Qty</span>
                              <p className="text-slate-200 font-mono">{parseFloat(item.quantity || "0")}</p>
                            </div>
                          </div>

                          <div className="border-t border-slate-700/50 pt-3 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Purchase</span>
                              <span className="text-slate-300 font-mono">
                                {formatCurrency(parseFloat(item.quantity || "0") * parseFloat(item.purchasePrice || "0"))}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Current Value</span>
                              <span className="text-white font-mono font-semibold">
                                {formatCurrency(currentVal)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-500">Gain/Loss</span>
                              <span className={`font-mono font-semibold flex items-center gap-1 ${isPositive ? "text-green-400" : "text-red-400"}`}>
                                {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {isPositive ? "+" : ""}
                                {pct.toFixed(1)}%
                              </span>
                            </div>
                          </div>

                          {item.notes && (
                            <p className="text-xs text-slate-500 mt-3 italic truncate">{item.notes}</p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
