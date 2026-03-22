import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { AIAssistant } from "@/components/ai-assistant";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  BarChart3,
  Coins,
  Cpu,
  ArrowUpDown,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Clock,
} from "lucide-react";

interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  change7d?: number;
  high52w: number;
  low52w: number;
  volume: number;
  marketCap?: number;
  sector?: string;
  type?: 'metal' | 'stock' | 'crypto' | 'ai';
  advisory: 'FAVORABLE' | 'NEUTRAL' | 'CAUTIOUS';
  advisoryNote: string;
  lastUpdated: string;
}

interface TickerCategory {
  items: TickerItem[];
  timestamp: string;
  source: string;
}

type Tab = 'metals' | 'stocks' | 'ai';
type SortField = 'name' | 'price' | 'changePercent' | 'change7d' | 'volume' | 'marketCap' | 'advisory';
type SortDir = 'asc' | 'desc';

function formatPrice(price: number, symbol: string): string {
  if (price < 0.00001) return '$' + price.toFixed(8);
  if (price < 0.001) return '$' + price.toFixed(6);
  if (price < 1) return '$' + price.toFixed(4);
  if (price >= 1000) {
    return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return '$' + price.toFixed(2);
}

function formatVolume(vol: number): string {
  if (vol >= 1e12) return '$' + (vol / 1e12).toFixed(1) + 'T';
  if (vol >= 1e9) return (vol / 1e9).toFixed(1) + 'B';
  if (vol >= 1e6) return (vol / 1e6).toFixed(1) + 'M';
  if (vol >= 1e3) return (vol / 1e3).toFixed(1) + 'K';
  return vol.toString();
}

function formatMarketCap(cap: number | undefined): string {
  if (!cap) return '—';
  if (cap >= 1e12) return '$' + (cap / 1e12).toFixed(2) + 'T';
  if (cap >= 1e9) return '$' + (cap / 1e9).toFixed(1) + 'B';
  if (cap >= 1e6) return '$' + (cap / 1e6).toFixed(1) + 'M';
  return '$' + cap.toLocaleString();
}

function AdvisoryBadge({ advisory, note }: { advisory: string; note: string }) {
  const config = {
    FAVORABLE: { label: 'Favorable', icon: ShieldCheck, bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    NEUTRAL: { label: 'Neutral', icon: Shield, bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    CAUTIOUS: { label: 'Cautious', icon: ShieldAlert, bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
  }[advisory] || { label: 'N/A', icon: Shield, bg: 'bg-gray-500/15', text: 'text-gray-400', border: 'border-gray-500/30' };

  const Icon = config.icon;
  return (
    <div className="group relative">
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
      {note && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 rounded-lg text-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
          {note}
        </div>
      )}
    </div>
  );
}

function TickerTable({ items, isLoading }: { items: TickerItem[]; isLoading: boolean }) {
  const [sortField, setSortField] = useState<SortField>('changePercent');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir(field === 'name' ? 'asc' : 'desc');
    }
  };

  const sorted = [...items].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case 'name': cmp = a.name.localeCompare(b.name); break;
      case 'price': cmp = a.price - b.price; break;
      case 'changePercent': cmp = a.changePercent - b.changePercent; break;
      case 'change7d': cmp = (a.change7d ?? 0) - (b.change7d ?? 0); break;
      case 'volume': cmp = a.volume - b.volume; break;
      case 'marketCap': cmp = (a.marketCap ?? 0) - (b.marketCap ?? 0); break;
      case 'advisory': {
        const order: Record<string, number> = { FAVORABLE: 0, NEUTRAL: 1, CAUTIOUS: 2 };
        cmp = (order[a.advisory] ?? 1) - (order[b.advisory] ?? 1);
        break;
      }
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 rounded-lg animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 opacity-60">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-40" />
        <p className="text-lg font-medium">No data available</p>
        <p className="text-sm mt-1">Data will appear when markets are open</p>
      </div>
    );
  }

  const SortHeader = ({ field, label, align = 'left' }: { field: SortField; label: string; align?: string }) => (
    <th
      className={`px-3 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none hover:opacity-80 transition-opacity ${align === 'right' ? 'text-right' : 'text-left'}`}
      style={{ color: 'var(--muted-foreground)' }}
      onClick={() => toggleSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortField === field && (
          <ArrowUpDown className="w-3 h-3" style={{ color: 'var(--primary)' }} />
        )}
      </span>
    </th>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <SortHeader field="name" label="Asset" />
            <SortHeader field="price" label="Price" align="right" />
            <SortHeader field="changePercent" label="24h" align="right" />
            <SortHeader field="change7d" label="7d" align="right" />
            <SortHeader field="marketCap" label="Mkt Cap" align="right" />
            <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-right hidden lg:table-cell" style={{ color: 'var(--muted-foreground)' }}>52W Range</th>
            <SortHeader field="volume" label="Volume" align="right" />
            <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-left hidden xl:table-cell" style={{ color: 'var(--muted-foreground)' }}>Sector</th>
            <SortHeader field="advisory" label="Signal" align="right" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((item) => {
            const isPositive = item.change > 0;
            const isNegative = item.change < 0;
            const changeColor = isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-gray-400';
            const ChangeIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

            const range52w = item.high52w - item.low52w;
            const position52w = range52w > 0 ? ((item.price - item.low52w) / range52w) * 100 : 50;

            return (
              <tr
                key={item.symbol}
                className="transition-colors hover:bg-white/[0.03]"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                <td className="px-3 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>{item.name}</span>
                    <span className="text-xs opacity-50">{item.symbol}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-right">
                  <span className="font-mono font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                    {formatPrice(item.price, item.symbol)}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  <div className={`flex items-center justify-end gap-1 ${changeColor}`}>
                    <ChangeIcon className="w-3.5 h-3.5" />
                    <div className="flex flex-col items-end">
                      <span className="font-mono text-sm font-medium">
                        {isPositive ? '+' : ''}{item.changePercent}%
                      </span>
                      <span className="font-mono text-xs opacity-70">
                        {isPositive ? '+' : ''}{item.change > 999 ? item.change.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : item.change.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-right">
                  {item.change7d != null ? (
                    <span className={`font-mono text-sm font-medium ${item.change7d > 0 ? 'text-emerald-400' : item.change7d < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {item.change7d > 0 ? '+' : ''}{item.change7d}%
                    </span>
                  ) : (
                    <span className="font-mono text-xs opacity-30">—</span>
                  )}
                </td>
                <td className="px-3 py-3 text-right">
                  <span className="font-mono text-xs opacity-60">{formatMarketCap(item.marketCap)}</span>
                </td>
                <td className="px-3 py-3 hidden lg:table-cell">
                  <div className="flex flex-col items-end gap-1">
                    <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, Math.max(0, position52w))}%`,
                          backgroundColor: position52w < 30 ? '#10b981' : position52w > 80 ? '#ef4444' : '#eab308',
                        }}
                      />
                    </div>
                    <div className="flex justify-between w-24 text-[10px] opacity-40 font-mono">
                      <span>{formatPrice(item.low52w, item.symbol)}</span>
                      <span>{formatPrice(item.high52w, item.symbol)}</span>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-right">
                  <span className="font-mono text-xs opacity-60">{formatVolume(item.volume)}</span>
                </td>
                <td className="px-3 py-3 hidden xl:table-cell">
                  {item.sector && item.sector !== 'N/A' ? (
                    <span className="text-xs px-2 py-0.5 rounded-full opacity-60" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {item.sector}
                    </span>
                  ) : (
                    <span className="text-xs opacity-30">—</span>
                  )}
                </td>
                <td className="px-3 py-3 text-right">
                  <AdvisoryBadge advisory={item.advisory} note={item.advisoryNote} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function TickersContent() {
  const [activeTab, setActiveTab] = useState<Tab>('metals');

  const metalsQuery = useQuery<{ success: boolean; data: TickerCategory }>({
    queryKey: ['/api/tickers/metals'],
    refetchInterval: 60000,
    enabled: activeTab === 'metals',
  });

  const stocksQuery = useQuery<{ success: boolean; data: TickerCategory }>({
    queryKey: ['/api/tickers/stocks'],
    refetchInterval: 60000,
    enabled: activeTab === 'stocks',
  });

  const cryptoQuery = useQuery<{ success: boolean; data: TickerCategory }>({
    queryKey: ['/api/tickers/crypto'],
    refetchInterval: 60000,
    enabled: activeTab === 'stocks',
  });

  const aiQuery = useQuery<{ success: boolean; data: TickerCategory }>({
    queryKey: ['/api/tickers/ai'],
    refetchInterval: 60000,
    enabled: activeTab === 'ai',
  });

  const stocksCombinedLoading = stocksQuery.isLoading || cryptoQuery.isLoading;
  const stocksCombinedFetching = stocksQuery.isFetching || cryptoQuery.isFetching;

  const tabs: { key: Tab; label: string; icon: typeof Coins }[] = [
    { key: 'metals', label: 'Metals', icon: Coins },
    { key: 'stocks', label: 'Stocks & Crypto', icon: BarChart3 },
    { key: 'ai', label: 'AI Companies', icon: Cpu },
  ];

  const getActiveData = (): { isLoading: boolean; isFetching: boolean; timestamp?: string; source?: string; items: TickerItem[] } => {
    switch (activeTab) {
      case 'metals': return {
        isLoading: metalsQuery.isLoading,
        isFetching: metalsQuery.isFetching,
        timestamp: metalsQuery.data?.data?.timestamp,
        source: metalsQuery.data?.data?.source,
        items: metalsQuery.data?.data?.items || [],
      };
      case 'stocks': return {
        isLoading: stocksCombinedLoading,
        isFetching: stocksCombinedFetching,
        timestamp: stocksQuery.data?.data?.timestamp || cryptoQuery.data?.data?.timestamp,
        source: stocksQuery.data?.data?.source || cryptoQuery.data?.data?.source,
        items: [
          ...(stocksQuery.data?.data?.items || []),
          ...(cryptoQuery.data?.data?.items || []),
        ],
      };
      case 'ai': return {
        isLoading: aiQuery.isLoading,
        isFetching: aiQuery.isFetching,
        timestamp: aiQuery.data?.data?.timestamp,
        source: aiQuery.data?.data?.source,
        items: aiQuery.data?.data?.items || [],
      };
    }
  };

  const { isLoading, isFetching, timestamp, source, items } = getActiveData();

  const favorable = items.filter(i => i.advisory === 'FAVORABLE').length;
  const cautious = items.filter(i => i.advisory === 'CAUTIOUS').length;
  const neutral = items.filter(i => i.advisory === 'NEUTRAL').length;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${isActive ? '' : 'hover:opacity-80'}`}
              style={isActive ? {
                backgroundColor: 'var(--primary)',
                color: 'white',
              } : {
                backgroundColor: 'rgba(255,255,255,0.04)',
                color: 'var(--muted-foreground)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
        <span className="text-[10px] opacity-30 ml-auto hidden sm:inline">Yahoo Finance + CoinGecko — real data only</span>
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-xs opacity-50 mb-1">Total Assets</div>
            <div className="text-xl font-bold">{items.length}</div>
          </div>
          <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <div className="text-xs text-emerald-400 mb-1">Favorable</div>
            <div className="text-xl font-bold text-emerald-400">{favorable}</div>
          </div>
          <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.15)' }}>
            <div className="text-xs text-yellow-400 mb-1">Neutral</div>
            <div className="text-xl font-bold text-yellow-400">{neutral}</div>
          </div>
          <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <div className="text-xs text-red-400 mb-1">Cautious</div>
            <div className="text-xl font-bold text-red-400">{cautious}</div>
          </div>
        </div>
      )}

      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <TickerTable items={items} isLoading={isLoading} />
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs opacity-40">
          {timestamp && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Updated: {new Date(timestamp).toLocaleTimeString()}
            </span>
          )}
          {source && <span>Source: {source}</span>}
          {isFetching && !isLoading && (
            <span className="flex items-center gap-1 text-blue-400">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Refreshing...
            </span>
          )}
        </div>
        <p className="text-[10px] opacity-30 max-w-lg text-right">
          Advisory signals are algorithmically generated and do not constitute financial advice.
        </p>
      </div>
    </div>
  );
}

export default function TickersPage() {
  const [isAIOpen, setIsAIOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <Navigation onAIToggle={() => setIsAIOpen(true)} />
      <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
      <main className="flex-1 pt-20 pb-8 px-4 max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">
            <span style={{ color: 'var(--primary)' }}>Simpleton</span> Tickers
          </h1>
          <p className="text-sm opacity-60">Live market data powered by Yahoo Finance — real prices, no synthetic data</p>
        </div>
        <TickersContent />
      </main>
      <Footer />
    </div>
  );
}
