import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Navigation } from "@/components/layout/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Users,
  TrendingUp,
  Briefcase,
  Key,
  Activity,
  Shield,
  Crown,
  Calendar,
  Mail,
  Clock,
  Database,
  BarChart3,
  Eye,
  RefreshCw,
  Gem,
  Pencil,
  Check,
  X,
  Store,
  AlertTriangle,
  ShieldAlert,
  MapPin,
  Star,
  Phone,
  Globe,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DashboardStats {
  totalUsers: number;
  usersBySubscription: { subscription_status: string; count: number }[];
  recentSignups: number;
  todayNewUsers: number;
  totalPortfolios: number;
  totalPortfolioItems: number;
  totalApiKeys: number;
  totalSessions: number;
  totalAssistantSessions: number;
  totalAssistantMessages: number;
  totalSavedCalculations: number;
}

interface AdminUser {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  subscriptionStatus: string;
  createdAt: string;
  provider: string | null;
}

interface ActivityLog {
  id: number;
  action: string;
  category: string;
  details: string | null;
  timestamp: string;
}

function LoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-700/50 rounded ${className}`} />
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  borderColor,
  isLoading,
}: {
  icon: any;
  label: string;
  value: string | number;
  subValue?: string;
  borderColor: string;
  isLoading: boolean;
}) {
  return (
    <Card className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 border-l-4 ${borderColor}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <Icon className="w-5 h-5 text-slate-400" />
          <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">{label}</span>
        </div>
        {isLoading ? (
          <LoadingSkeleton className="h-8 w-24" />
        ) : (
          <>
            <p className="text-3xl font-bold text-white">{value}</p>
            {subValue && (
              <p className="text-xs text-slate-400 mt-1">{subValue}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function getStatusBadge(status: string) {
  switch (status?.toLowerCase()) {
    case "premium":
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Premium</Badge>;
    case "admin":
      return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Admin</Badge>;
    default:
      return <Badge className="bg-slate-600/30 text-slate-400 border-slate-500/30">Free</Badge>;
  }
}

interface RapaportPrice {
  id: number;
  shape: string;
  caratRange: string;
  colorGrade: string;
  clarityGrade: string;
  price: number;
  updatedAt: string | null;
  updatedBy: string | null;
}

const SMALL_COLORS = ["D-F", "G-H", "I-J", "K-L", "M-N"];
const SMALL_CLARITIES = ["IF-VVS", "VS", "SI1", "SI2", "SI3", "I1", "I2", "I3"];
const LARGE_COLORS = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
const LARGE_CLARITIES = ["IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "SI3", "I1", "I2", "I3"];

const ROUND_RANGES = [
  { id: "0.01-0.03", label: ".01 - .03 CT.", type: "small" as const },
  { id: "0.04-0.07", label: ".04 - .07 CT.", type: "small" as const },
  { id: "0.08-0.14", label: ".08 - .14 CT.", type: "small" as const },
  { id: "0.15-0.17", label: ".15 - .17 CT.", type: "small" as const },
  { id: "0.18-0.22", label: ".18 - .22 CT.", type: "small" as const },
  { id: "0.23-0.29", label: ".23 - .29 CT.", type: "small" as const },
  { id: "0.30-0.39", label: ".30 - .39 CT.", type: "large" as const },
  { id: "0.40-0.49", label: ".40 - .49 CT.", type: "large" as const },
  { id: "0.50-0.69", label: ".50 - .69 CT.", type: "large" as const },
  { id: "0.70-0.89", label: ".70 - .89 CT.", type: "large" as const },
  { id: "0.90-0.99", label: ".90 - .99 CT.", type: "large" as const },
  { id: "1.00-1.49", label: "1.00 - 1.49 CT.", type: "large" as const },
  { id: "1.50-1.99", label: "1.50 - 1.99 CT.", type: "large" as const },
  { id: "2.00-2.99", label: "2.00 - 2.99 CT.", type: "large" as const },
  { id: "3.00-3.99", label: "3.00 - 3.99 CT.", type: "large" as const },
  { id: "4.00-4.99", label: "4.00 - 4.99 CT.", type: "large" as const },
  { id: "5.00-5.99", label: "5.00 - 5.99 CT.", type: "large" as const },
  { id: "10.00-10.99", label: "10.00 - 10.99 CT.", type: "large" as const },
];

const PEAR_RANGES = [
  { id: "0.18-0.22", label: ".18 - .22 CT.", type: "small" as const },
  { id: "0.23-0.29", label: ".23 - .29 CT.", type: "small" as const },
  { id: "0.30-0.39", label: ".30 - .39 CT.", type: "large" as const },
  { id: "0.40-0.49", label: ".40 - .49 CT.", type: "large" as const },
  { id: "0.50-0.69", label: ".50 - .69 CT.", type: "large" as const },
  { id: "0.70-0.89", label: ".70 - .89 CT.", type: "large" as const },
  { id: "0.90-0.99", label: ".90 - .99 CT.", type: "large" as const },
  { id: "1.00-1.49", label: "1.00 - 1.49 CT.", type: "large" as const },
  { id: "1.50-1.99", label: "1.50 - 1.99 CT.", type: "large" as const },
  { id: "2.00-2.99", label: "2.00 - 2.99 CT.", type: "large" as const },
  { id: "3.00-3.99", label: "3.00 - 3.99 CT.", type: "large" as const },
  { id: "4.00-4.99", label: "4.00 - 4.99 CT.", type: "large" as const },
  { id: "5.00-5.99", label: "5.00 - 5.99 CT.", type: "large" as const },
  { id: "10.00-10.99", label: "10.00 - 10.99 CT.", type: "large" as const },
];

function fmtRap(v: number) {
  if (v === 0) return null;
  const n = v / 100;
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

function RapaportTable({
  range,
  shape,
  priceMap,
  editingId,
  editValue,
  onStartEdit,
  onSave,
  onCancel,
  onEditValueChange,
}: {
  range: { id: string; label: string; type: "small" | "large" };
  shape: string;
  priceMap: Map<string, RapaportPrice>;
  editingId: number | null;
  editValue: string;
  onStartEdit: (p: RapaportPrice) => void;
  onSave: (id: number) => void;
  onCancel: () => void;
  onEditValueChange: (v: string) => void;
}) {
  const colors = range.type === "small" ? SMALL_COLORS : LARGE_COLORS;
  const clarities = range.type === "small" ? SMALL_CLARITIES : LARGE_CLARITIES;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th
              colSpan={clarities.length + 1}
              className="bg-slate-900 text-cyan-300 font-bold text-center py-1.5 px-2 border border-slate-600 tracking-wide uppercase text-[11px]"
            >
              RAPAPORT : ({range.label}) — {shape === "round" ? "ROUNDS" : "PEARS"}
            </th>
          </tr>
          <tr className="bg-slate-800">
            <th className="border border-slate-600 px-2 py-1 text-slate-400 font-medium text-center w-12"></th>
            {clarities.map(cl => (
              <th key={cl} className="border border-slate-600 px-1 py-1 text-slate-300 font-medium text-center whitespace-nowrap">
                {cl}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {colors.map((color, rowIdx) => (
            <tr key={color} className={rowIdx % 2 === 0 ? "bg-slate-900/60" : "bg-slate-800/40"}>
              <td className="border border-slate-700 px-2 py-1 font-bold text-cyan-400 text-center whitespace-nowrap">
                {color}
              </td>
              {clarities.map(cl => {
                const key = `${shape}|${range.id}|${color}|${cl}`;
                const entry = priceMap.get(key);
                const isEditing = entry && editingId === entry.id;
                return (
                  <td key={cl} className="border border-slate-700 px-0.5 py-0.5 text-center">
                    {entry ? (
                      isEditing ? (
                        <div className="flex items-center gap-0.5 justify-center">
                          <Input
                            value={editValue}
                            onChange={e => onEditValueChange(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === "Enter") onSave(entry.id);
                              if (e.key === "Escape") onCancel();
                            }}
                            className="w-14 h-6 text-xs text-center bg-slate-900 border-cyan-500/70 text-white px-1 py-0"
                            autoFocus
                          />
                          <button onClick={() => onSave(entry.id)} className="text-green-400 hover:text-green-300 ml-0.5">
                            <Check className="w-3 h-3" />
                          </button>
                          <button onClick={onCancel} className="text-red-400 hover:text-red-300">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onStartEdit(entry)}
                          className="w-full text-center font-mono text-white hover:text-cyan-300 hover:bg-slate-700/50 rounded px-1 py-0.5 transition-colors"
                        >
                          {fmtRap(entry.price) ?? <span className="text-slate-600">—</span>}
                        </button>
                      )
                    ) : (
                      <span className="text-slate-700">·</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RapaportPriceGrid({ isAdmin }: { isAdmin: boolean }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [activeShape, setActiveShape] = useState<"round" | "pear">("round");

  const { data, isLoading } = useQuery<{ success: boolean; prices: RapaportPrice[] }>({
    queryKey: ["/api/admin/rapaport-prices"],
    enabled: isAdmin,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, price }: { id: number; price: number }) =>
      apiRequest("PUT", `/api/admin/rapaport-prices/${id}`, { price }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rapaport-prices"] });
      setEditingId(null);
      toast({ title: "Price updated", description: "Rapaport price saved." });
    },
    onError: () => {
      toast({ title: "Update failed", description: "Could not save the price.", variant: "destructive" });
    },
  });

  const priceMap = new Map<string, RapaportPrice>();
  for (const p of data?.prices ?? []) {
    priceMap.set(`${p.shape}|${p.caratRange}|${p.colorGrade}|${p.clarityGrade}`, p);
  }

  const startEdit = (p: RapaportPrice) => {
    setEditingId(p.id);
    setEditValue(fmtRap(p.price) ?? "0");
  };
  const cancelEdit = () => { setEditingId(null); setEditValue(""); };
  const saveEdit = (id: number) => {
    const val = Math.round(parseFloat(editValue) * 100);
    if (isNaN(val) || val < 0) {
      toast({ title: "Invalid price", description: "Enter a number.", variant: "destructive" });
      return;
    }
    updateMutation.mutate({ id, price: val });
  };

  const activeRanges = activeShape === "round" ? ROUND_RANGES : PEAR_RANGES;
  const pairs: (typeof activeRanges)[] = [];
  for (let i = 0; i < activeRanges.length; i += 2) {
    pairs.push(activeRanges.slice(i, i + 2) as typeof activeRanges);
  }

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 mb-8">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Gem className="w-5 h-5 text-cyan-400" />
            <CardTitle className="text-xl text-cyan-400">Diamond Price Grid</CardTitle>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
            Live — click any price to edit
          </Badge>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Prices in hundreds of US$ per carat — matches Rapaport Report format. Click any cell to update.
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setActiveShape("round")}
            className={`px-4 py-1.5 rounded text-sm font-semibold transition-colors ${
              activeShape === "round"
                ? "bg-cyan-600 text-white"
                : "bg-slate-700 text-slate-400 hover:bg-slate-600"
            }`}
          >
            Round Brilliants
          </button>
          <button
            onClick={() => setActiveShape("pear")}
            className={`px-4 py-1.5 rounded text-sm font-semibold transition-colors ${
              activeShape === "pear"
                ? "bg-cyan-600 text-white"
                : "bg-slate-700 text-slate-400 hover:bg-slate-600"
            }`}
          >
            Pear Shapes
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <LoadingSkeleton key={i} className="h-40 w-full" />)}
          </div>
        ) : (
          <div className="space-y-6">
            {pairs.map((pair, pairIdx) => (
              <div key={pairIdx} className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {pair.map(range => (
                  <RapaportTable
                    key={range.id}
                    range={range}
                    shape={activeShape}
                    priceMap={priceMap}
                    editingId={editingId}
                    editValue={editValue}
                    onStartEdit={startEdit}
                    onSave={saveEdit}
                    onCancel={cancelEdit}
                    onEditValueChange={setEditValue}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [searchFilter, setSearchFilter] = useState("");
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/owner/dashboard"],
    enabled: isAuthenticated && (user?.id === 1 || (user as any)?.role === 'admin'),
  });

  const { data: users, isLoading: usersLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/owner/users"],
    enabled: isAuthenticated && (user?.id === 1 || (user as any)?.role === 'admin'),
  });

  const { data: activity, isLoading: activityLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/owner/activity"],
    enabled: isAuthenticated && (user?.id === 1 || (user as any)?.role === 'admin'),
  });

  const { data: revenueData } = useQuery<any>({
    queryKey: ["/api/admin/revenue-stats"],
    enabled: isAuthenticated && (user?.id === 1 || (user as any)?.role === 'admin'),
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (user?.id !== 1 && (user as any)?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Navigation />
        <div className="flex items-center justify-center pt-32">
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-red-500/30 max-w-md w-full">
            <CardContent className="p-8 text-center">
              <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
              <p className="text-slate-400">You do not have permission to access the Owner Command Center. This area is restricted to the site administrator.</p>
              <Button
                onClick={() => setLocation("/")}
                className="mt-6 bg-slate-700 hover:bg-slate-600 text-white"
              >
                Return Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/owner/dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["/api/owner/users"] });
    queryClient.invalidateQueries({ queryKey: ["/api/owner/activity"] });
    queryClient.invalidateQueries({ queryKey: ["/api/admin/revenue-stats"] });
  };

  const freeCount = stats?.usersBySubscription?.find(s => s.subscription_status === "free")?.count || 0;
  const premiumCount = stats?.usersBySubscription?.find(s => s.subscription_status === "premium")?.count || 0;

  const sortedUsers = users
    ? [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  const filteredUsers = sortedUsers.filter(u => {
    if (!searchFilter) return true;
    const term = searchFilter.toLowerCase();
    return (
      u.email?.toLowerCase().includes(term) ||
      u.firstName?.toLowerCase().includes(term) ||
      u.lastName?.toLowerCase().includes(term)
    );
  });

  const recentActivity = activity?.slice(0, 20) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navigation />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <Crown className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Owner Command Center</h1>
              <p className="text-slate-400 mt-1">Platform Analytics & User Management</p>
            </div>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats?.totalUsers ?? 0}
            subValue={`+${stats?.todayNewUsers ?? 0} today`}
            borderColor="border-l-blue-500"
            isLoading={statsLoading}
          />
          <StatCard
            icon={TrendingUp}
            label="Subscriptions"
            value={premiumCount + freeCount}
            subValue={`${premiumCount} premium · ${freeCount} free`}
            borderColor="border-l-green-500"
            isLoading={statsLoading}
          />
          <StatCard
            icon={Briefcase}
            label="Portfolios"
            value={stats?.totalPortfolios ?? 0}
            subValue={`${stats?.totalPortfolioItems ?? 0} items`}
            borderColor="border-l-amber-500"
            isLoading={statsLoading}
          />
          <StatCard
            icon={Key}
            label="API Keys"
            value={stats?.totalApiKeys ?? 0}
            borderColor="border-l-purple-500"
            isLoading={statsLoading}
          />
          <StatCard
            icon={Activity}
            label="AI Sessions"
            value={stats?.totalAssistantSessions ?? 0}
            borderColor="border-l-cyan-500"
            isLoading={statsLoading}
          />
          <StatCard
            icon={Mail}
            label="Messages"
            value={stats?.totalAssistantMessages ?? 0}
            borderColor="border-l-pink-500"
            isLoading={statsLoading}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5 text-amber-400" />
                <span className="text-sm text-slate-400 font-medium">Last 30 Days Signups</span>
              </div>
              {statsLoading ? (
                <LoadingSkeleton className="h-10 w-20" />
              ) : (
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-bold text-white">{stats?.recentSignups ?? 0}</span>
                  <span className="text-sm text-green-400 mb-1">new users</span>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-sm text-slate-400 font-medium">Today's New Users</span>
              </div>
              {statsLoading ? (
                <LoadingSkeleton className="h-10 w-20" />
              ) : (
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-bold text-white">{stats?.todayNewUsers ?? 0}</span>
                  <span className="text-sm text-amber-400 mb-1">joined today</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 mb-8">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-amber-400" />
                <CardTitle className="text-xl text-amber-400">
                  All Users {users && <span className="text-slate-500 text-sm font-normal">({filteredUsers.length})</span>}
                </CardTitle>
              </div>
              <input
                type="text"
                placeholder="Search by email or name..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full sm:w-72 px-4 py-2 rounded-lg bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <LoadingSkeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-800">
                    <tr className="border-b border-slate-700/50">
                      <th className="text-left py-3 px-3 text-slate-400 font-medium">#</th>
                      <th className="text-left py-3 px-3 text-slate-400 font-medium">Email</th>
                      <th className="text-left py-3 px-3 text-slate-400 font-medium">Name</th>
                      <th className="text-left py-3 px-3 text-slate-400 font-medium">Status</th>
                      <th className="text-left py-3 px-3 text-slate-400 font-medium">Provider</th>
                      <th className="text-left py-3 px-3 text-slate-400 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u, idx) => (
                      <tr
                        key={u.id}
                        className={`border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors ${
                          idx % 2 === 0 ? "bg-slate-800/20" : ""
                        }`}
                      >
                        <td className="py-3 px-3 text-slate-500">{idx + 1}</td>
                        <td className="py-3 px-3 text-white font-mono text-xs">{u.email}</td>
                        <td className="py-3 px-3 text-slate-300">
                          {u.firstName || u.lastName
                            ? `${u.firstName || ""} ${u.lastName || ""}`.trim()
                            : "—"}
                        </td>
                        <td className="py-3 px-3">{getStatusBadge(u.subscriptionStatus || u.role)}</td>
                        <td className="py-3 px-3 text-slate-400 text-xs">{u.provider || "email"}</td>
                        <td className="py-3 px-3 text-slate-400 text-xs">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          No users found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Database className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">24</p>
                <p className="text-xs text-slate-400">Active Tables</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/10">
                <Eye className="w-5 h-5 text-green-400" />
              </div>
              <div>
                {statsLoading ? (
                  <LoadingSkeleton className="h-7 w-16" />
                ) : (
                  <p className="text-2xl font-bold text-white">{stats?.totalSessions ?? 0}</p>
                )}
                <p className="text-xs text-slate-400">Total Sessions</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10">
                <BarChart3 className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                {statsLoading ? (
                  <LoadingSkeleton className="h-7 w-16" />
                ) : (
                  <p className="text-2xl font-bold text-white">{stats?.totalSavedCalculations ?? 0}</p>
                )}
                <p className="text-xs text-slate-400">Saved Calculations</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <Clock className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">Online</p>
                <p className="text-xs text-slate-400">System Status</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <RapaportPriceGrid isAdmin={user?.id === 1 || (user as any)?.role === 'admin'} />

        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-amber-400" />
              <CardTitle className="text-xl text-amber-400">Recent Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <LoadingSkeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500">No activity recorded yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {recentActivity.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/30 border border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium">{entry.action}</p>
                      {entry.details && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{entry.details}</p>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 flex-shrink-0">
                      {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {revenueData && (
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-amber-500/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <CardTitle className="text-xl text-amber-400">Revenue Roadmap — $5K/Month Goal</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/30">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Document Sales</p>
                  <p className="text-2xl font-bold text-white">${((revenueData.documentSales?.total || 0) / 100).toFixed(2)}</p>
                  <p className="text-xs text-slate-500">{revenueData.documentSales?.count || 0} purchases</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/30">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Pro Subscribers</p>
                  <p className="text-2xl font-bold text-white">{revenueData.userStats?.pro || 0}</p>
                  <p className="text-xs text-slate-500">{revenueData.userStats?.total || 0} total users</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-900/50 border border-amber-500/20">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Current Phase</p>
                  <p className="text-lg font-bold text-amber-300">{revenueData.currentPhase?.title || "Not started"}</p>
                  <p className="text-xs text-slate-500">Phase {revenueData.currentPhase?.phaseNumber || 0} of 6</p>
                </div>
              </div>

              <div className="space-y-3">
                {(revenueData.phases || []).map((phase: any) => {
                  const isActive = phase.status === "active";
                  const isCompleted = phase.status === "completed";
                  const pct = phase.revenueTarget > 0 ? Math.min(100, Math.round((phase.actualRevenue / phase.revenueTarget) * 100)) : 0;
                  return (
                    <div key={phase.id} className={`p-4 rounded-lg border transition-all ${isActive ? "bg-amber-950/30 border-amber-500/40" : isCompleted ? "bg-green-950/20 border-green-500/30" : "bg-slate-900/30 border-slate-700/20"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? "bg-amber-500 text-black" : isCompleted ? "bg-green-500 text-black" : "bg-slate-700 text-slate-300"}`}>
                            {phase.phaseNumber}
                          </span>
                          <div>
                            <p className="text-white font-medium text-sm">{phase.title}</p>
                            <p className="text-slate-400 text-xs">{new Date(phase.startDate).toLocaleDateString()} - {new Date(phase.endDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={isActive ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : isCompleted ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-slate-700/50 text-slate-400 border-slate-600/30"}>
                            {isActive ? "Active" : isCompleted ? "Complete" : "Upcoming"}
                          </Badge>
                          {phase.revenueTarget > 0 && (
                            <p className="text-xs text-slate-400 mt-1">Target: ${(phase.revenueTarget / 100).toLocaleString()}/mo</p>
                          )}
                        </div>
                      </div>
                      {phase.revenueTarget > 0 && (
                        <div className="w-full bg-slate-700/50 rounded-full h-2 mt-2">
                          <div className={`h-2 rounded-full transition-all ${isActive ? "bg-amber-500" : isCompleted ? "bg-green-500" : "bg-slate-600"}`} style={{ width: `${pct}%` }} />
                        </div>
                      )}
                      <p className="text-xs text-slate-500 mt-2">{phase.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <SimpletonsListAdmin />
      </div>
    </div>
  );
}

function SimpletonsListAdmin() {
  const [tab, setTab] = useState<"businesses" | "complaints">("businesses");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBiz, setNewBiz] = useState({ name: "", address: "", city: "", state: "", zip: "", phone: "", website: "", category: "pawn_shop", status: "approved" });
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: businesses = [] } = useQuery<any[]>({ queryKey: ["/api/admin/businesses"] });
  const { data: complaints = [] } = useQuery<any[]>({ queryKey: ["/api/admin/complaints"] });

  const addBusiness = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/businesses", newBiz);
    },
    onSuccess: () => {
      toast({ title: "Business added" });
      setShowAddForm(false);
      setNewBiz({ name: "", address: "", city: "", state: "", zip: "", phone: "", website: "", category: "pawn_shop", status: "approved" });
      qc.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateBusinessStatus = useMutation({
    mutationFn: async ({ id, status, simpletonVerified }: { id: number; status?: string; simpletonVerified?: boolean }) => {
      const body: any = {};
      if (status !== undefined) body.status = status;
      if (simpletonVerified !== undefined) body.simpletonVerified = simpletonVerified;
      await apiRequest("PATCH", `/api/admin/businesses/${id}`, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      toast({ title: "Business updated" });
    },
  });

  const deleteBusiness = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/businesses/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      toast({ title: "Business removed" });
    },
  });

  const updateComplaint = useMutation({
    mutationFn: async ({ id, investigationStatus, resolutionNotes }: { id: number; investigationStatus: string; resolutionNotes?: string }) => {
      await apiRequest("PATCH", `/api/admin/complaints/${id}`, { investigationStatus, resolutionNotes });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/complaints"] });
      toast({ title: "Complaint updated" });
    },
  });

  const pendingComplaints = complaints.filter((c: any) => c.investigationStatus === "pending" || c.investigationStatus === "investigating");
  const CATEGORIES = [
    { value: "pawn_shop", label: "Pawn Shop" },
    { value: "gold_buyer", label: "Gold Buyer" },
    { value: "jeweler", label: "Jeweler" },
    { value: "dealer", label: "Dealer" },
    { value: "coin_shop", label: "Coin Shop" },
    { value: "watch_dealer", label: "Watch Dealer" },
  ];

  return (
    <Card className="bg-slate-900/60 border-slate-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Store className="w-5 h-5 text-amber-400" />
            <CardTitle className="text-xl text-amber-400">Simpleton's List Management</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={tab === "businesses" ? "default" : "outline"}
              onClick={() => setTab("businesses")}
              className={tab === "businesses" ? "bg-amber-500 text-black" : "border-slate-600 text-slate-300"}
            >
              <Store className="w-3.5 h-3.5 mr-1" /> Businesses ({businesses.length})
            </Button>
            <Button
              size="sm"
              variant={tab === "complaints" ? "default" : "outline"}
              onClick={() => setTab("complaints")}
              className={tab === "complaints" ? "bg-red-500 text-white" : "border-slate-600 text-slate-300"}
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Complaints ({pendingComplaints.length} pending)
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {tab === "businesses" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-green-950/30 border border-green-500/20">
                  <p className="text-xs text-green-400 font-medium">Approved</p>
                  <p className="text-lg font-bold text-white">{businesses.filter((b: any) => b.status === "approved").length}</p>
                </div>
                <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/20">
                  <p className="text-xs text-red-400 font-medium">Blacklisted</p>
                  <p className="text-lg font-bold text-white">{businesses.filter((b: any) => b.status === "blacklisted").length}</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/20">
                  <p className="text-xs text-amber-400 font-medium">Pending/Flagged</p>
                  <p className="text-lg font-bold text-white">{businesses.filter((b: any) => b.status === "pending" || b.status === "flagged").length}</p>
                </div>
              </div>
              <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-amber-500 hover:bg-amber-600 text-black" size="sm">
                {showAddForm ? "Cancel" : "+ Add Business"}
              </Button>
            </div>

            {showAddForm && (
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Business Name" value={newBiz.name} onChange={(e) => setNewBiz({ ...newBiz, name: e.target.value })} className="bg-slate-900/50 border-slate-600 text-white" />
                  <Input placeholder="Address" value={newBiz.address} onChange={(e) => setNewBiz({ ...newBiz, address: e.target.value })} className="bg-slate-900/50 border-slate-600 text-white" />
                  <Input placeholder="City" value={newBiz.city} onChange={(e) => setNewBiz({ ...newBiz, city: e.target.value })} className="bg-slate-900/50 border-slate-600 text-white" />
                  <Input placeholder="State (e.g. TX)" value={newBiz.state} onChange={(e) => setNewBiz({ ...newBiz, state: e.target.value.toUpperCase() })} maxLength={2} className="bg-slate-900/50 border-slate-600 text-white" />
                  <Input placeholder="ZIP Code" value={newBiz.zip} onChange={(e) => setNewBiz({ ...newBiz, zip: e.target.value })} maxLength={5} className="bg-slate-900/50 border-slate-600 text-white" />
                  <Input placeholder="Phone" value={newBiz.phone} onChange={(e) => setNewBiz({ ...newBiz, phone: e.target.value })} className="bg-slate-900/50 border-slate-600 text-white" />
                  <Input placeholder="Website" value={newBiz.website} onChange={(e) => setNewBiz({ ...newBiz, website: e.target.value })} className="bg-slate-900/50 border-slate-600 text-white" />
                  <Select value={newBiz.category} onValueChange={(v) => setNewBiz({ ...newBiz, category: v })}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={newBiz.status} onValueChange={(v) => setNewBiz({ ...newBiz, status: v })}>
                    <SelectTrigger className="w-48 bg-slate-900/50 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="blacklisted">Blacklisted (Do Not Go)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => addBusiness.mutate()} disabled={!newBiz.name || !newBiz.address || !newBiz.city || !newBiz.state || !newBiz.zip || addBusiness.isPending} className="bg-green-500 hover:bg-green-600 text-black" size="sm">
                    {addBusiness.isPending ? "Adding..." : "Add Business"}
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {businesses.map((b: any) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-medium text-sm truncate">{b.name}</span>
                      <Badge className={
                        b.status === "approved" ? "bg-green-500/20 text-green-400 border-green-500/30 text-xs" :
                        b.status === "blacklisted" ? "bg-red-500/20 text-red-400 border-red-500/30 text-xs" :
                        b.status === "flagged" ? "bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs" :
                        "bg-slate-700/50 text-slate-400 border-slate-600/30 text-xs"
                      }>
                        {b.status}
                      </Badge>
                      {b.simpletonVerified && (
                        <Badge className="border-0 text-xs px-1.5 py-0 flex items-center gap-1" style={{ background: "#0a1d3f", color: "#60a5fa" }}>
                          <img src="/simpleton-logo.jpeg" alt="S" className="w-3 h-3 rounded-sm" /> Verified
                        </Badge>
                      )}
                      {b.pendingComplaints > 0 && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                          <AlertTriangle className="w-3 h-3 mr-1" />{b.pendingComplaints} complaint{b.pendingComplaints > 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs">{b.city}, {b.state} {b.zip} | {b.category} | {b.reviewCount} reviews (avg {Number(b.avgRating).toFixed(1)})</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0 ml-3 flex-wrap">
                    <Button size="sm" variant="outline" className="text-xs h-7 px-2 border-0" style={b.simpletonVerified ? { background: "#0a1d3f", color: "#60a5fa" } : { background: "transparent", border: "1px solid #334155", color: "#94a3b8" }} onClick={() => updateBusinessStatus.mutate({ id: b.id, simpletonVerified: !b.simpletonVerified })}>
                      {b.simpletonVerified ? "Unverify" : "Verify"}
                    </Button>
                    {b.status !== "approved" && (
                      <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs h-7 px-2" onClick={() => updateBusinessStatus.mutate({ id: b.id, status: "approved" })}>
                        Approve
                      </Button>
                    )}
                    {b.status !== "blacklisted" && (
                      <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs h-7 px-2" onClick={() => updateBusinessStatus.mutate({ id: b.id, status: "blacklisted" })}>
                        Blacklist
                      </Button>
                    )}
                    {b.status !== "flagged" && b.status !== "blacklisted" && (
                      <Button size="sm" variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 text-xs h-7 px-2" onClick={() => updateBusinessStatus.mutate({ id: b.id, status: "flagged" })}>
                        Flag
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="border-slate-600 text-slate-400 hover:bg-slate-700 text-xs h-7 px-2" onClick={() => { if (confirm("Delete this business and all its reviews/complaints?")) deleteBusiness.mutate(b.id); }}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
              {businesses.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-6">No businesses listed yet. Add one above.</p>
              )}
            </div>
          </div>
        )}

        {tab === "complaints" && (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {complaints.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-6">No complaints filed yet.</p>
            ) : (
              complaints.map((c: any) => (
                <ComplaintCard key={c.id} complaint={c} onUpdate={(data) => updateComplaint.mutate({ id: c.id, ...data })} />
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ComplaintCard({ complaint, onUpdate }: { complaint: any; onUpdate: (data: { investigationStatus: string; resolutionNotes?: string }) => void }) {
  const [notes, setNotes] = useState(complaint.resolutionNotes || "");
  const [showNotes, setShowNotes] = useState(false);

  return (
    <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30 space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-medium text-sm">{complaint.businessName || `Business #${complaint.businessId}`}</span>
            <Badge className={
              complaint.severity === "critical" ? "bg-red-500/20 text-red-400 border-red-500/30 text-xs" :
              complaint.severity === "high" ? "bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs" :
              complaint.severity === "medium" ? "bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs" :
              "bg-slate-700/50 text-slate-400 border-slate-600/30 text-xs"
            }>
              {complaint.severity}
            </Badge>
            <Badge className={
              complaint.investigationStatus === "pending" ? "bg-slate-700/50 text-slate-400 border-slate-600/30 text-xs" :
              complaint.investigationStatus === "investigating" ? "bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs" :
              complaint.investigationStatus === "resolved" ? "bg-green-500/20 text-green-400 border-green-500/30 text-xs" :
              "bg-red-500/20 text-red-400 border-red-500/30 text-xs"
            }>
              {complaint.investigationStatus}
            </Badge>
          </div>
          <p className="text-slate-300 text-sm">{complaint.complaintText}</p>
          <p className="text-slate-600 text-xs mt-1">Filed {new Date(complaint.createdAt).toLocaleDateString()} by user #{complaint.userId}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {complaint.investigationStatus === "pending" && (
          <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs h-7 px-2" onClick={() => onUpdate({ investigationStatus: "investigating" })}>
            Start Investigation
          </Button>
        )}
        {(complaint.investigationStatus === "pending" || complaint.investigationStatus === "investigating") && (
          <>
            <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs h-7 px-2" onClick={() => setShowNotes(!showNotes)}>
              Resolve
            </Button>
            <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs h-7 px-2" onClick={() => onUpdate({ investigationStatus: "confirmed" })}>
              Confirm (Flag Business)
            </Button>
          </>
        )}
      </div>
      {showNotes && (
        <div className="flex gap-2 mt-2">
          <Textarea
            placeholder="Resolution notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-slate-900/50 border-slate-600 text-white text-sm min-h-[60px] flex-1"
          />
          <Button size="sm" className="bg-green-500 text-black h-auto" onClick={() => { onUpdate({ investigationStatus: "resolved", resolutionNotes: notes }); setShowNotes(false); }}>
            Save
          </Button>
        </div>
      )}
    </div>
  );
}
