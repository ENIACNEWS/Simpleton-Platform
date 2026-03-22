import { useState, useEffect, useCallback } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { AIAssistant } from "@/components/ai-assistant";
import {
  Bitcoin,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  Star,
  StarOff,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  DollarSign,
  Activity,
  Clock,
  Globe,
  Zap,
  Filter,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  price_change_percentage_30d_in_currency: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  sparkline_in_7d: { price: number[] };
  last_updated: string;
}

interface GlobalData {
  total_market_cap: { usd: number };
  total_volume: { usd: number };
  market_cap_percentage: { btc: number; eth: number };
  market_cap_change_percentage_24h_usd: number;
  active_cryptocurrencies: number;
}

type SortKey = 'market_cap_rank' | 'current_price' | 'price_change_percentage_24h' | 'market_cap' | 'total_volume';
type TimeFrame = '24h' | '7d' | '30d';

const FAVORITES_KEY = 'simpleton-crypto-favorites';

function formatCurrency(value: number, compact = false): string {
  if (compact) {
    if (value >= 1e12) return '$' + (value / 1e12).toFixed(2) + 'T';
    if (value >= 1e9) return '$' + (value / 1e9).toFixed(2) + 'B';
    if (value >= 1e6) return '$' + (value / 1e6).toFixed(2) + 'M';
    if (value >= 1e3) return '$' + (value / 1e3).toFixed(2) + 'K';
  }
  if (value >= 1) return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (value >= 0.01) return '$' + value.toFixed(4);
  return '$' + value.toFixed(8);
}

function formatSupply(value: number, symbol: string): string {
  if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B ' + symbol.toUpperCase();
  if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M ' + symbol.toUpperCase();
  return value.toLocaleString() + ' ' + symbol.toUpperCase();
}

function MiniSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 120;
  const h = 40;
  const step = w / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(' ');
  const color = positive ? '#10b981' : '#ef4444';
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-80">
      <defs>
        <linearGradient id={`grad-${positive ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${points} ${w},${h}`}
        fill={`url(#grad-${positive ? 'up' : 'down'})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlobalStats({ data }: { data: GlobalData | null }) {
  if (!data) return null;
  const stats = [
    { label: 'Total Market Cap', value: formatCurrency(data.total_market_cap.usd, true), icon: Globe, change: data.market_cap_change_percentage_24h_usd },
    { label: '24h Volume', value: formatCurrency(data.total_volume.usd, true), icon: Activity },
    { label: 'BTC Dominance', value: data.market_cap_percentage.btc.toFixed(1) + '%', icon: Bitcoin },
    { label: 'Active Coins', value: data.active_cryptocurrencies.toLocaleString(), icon: Zap },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="rounded-xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              <span className="text-xs opacity-50">{s.label}</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-lg font-bold">{s.value}</span>
              {s.change !== undefined && (
                <span className={`text-xs font-medium ${s.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {s.change >= 0 ? '+' : ''}{s.change.toFixed(2)}%
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Cryptocurrency() {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [globalData, setGlobalData] = useState<GlobalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('market_cap_rank');
  const [sortAsc, setSortAsc] = useState(true);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('24h');
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch { return new Set<string>(); }
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCoin, setExpandedCoin] = useState<string | null>(null);

  const fetchData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const [coinsRes, globalRes] = await Promise.all([
        fetch('/api/crypto/prices'),
        fetch('/api/crypto/global'),
      ]);
      if (!coinsRes.ok || !globalRes.ok) throw new Error('Failed to fetch crypto data');
      const coinsData = await coinsRes.json();
      const globalJson = await globalRes.json();
      setCoins(coinsData);
      setGlobalData(globalJson.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load cryptocurrency data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const interval = setInterval(() => fetchData(false), 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const getChangeForTimeframe = (coin: CoinData) => {
    switch (timeFrame) {
      case '7d': return coin.price_change_percentage_7d_in_currency;
      case '30d': return coin.price_change_percentage_30d_in_currency;
      default: return coin.price_change_percentage_24h;
    }
  };

  const filtered = coins
    .filter(c => {
      if (showFavoritesOnly && !favorites.has(c.id)) return false;
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      let av: number, bv: number;
      if (sortKey === 'price_change_percentage_24h') {
        av = getChangeForTimeframe(a) ?? 0;
        bv = getChangeForTimeframe(b) ?? 0;
      } else {
        av = (a as any)[sortKey] ?? 0;
        bv = (b as any)[sortKey] ?? 0;
      }
      return sortAsc ? av - bv : bv - av;
    });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(key === 'market_cap_rank'); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortAsc ? <ChevronUp className="w-3 h-3 inline ml-1" /> : <ChevronDown className="w-3 h-3 inline ml-1" />;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <Navigation onAIToggle={() => setIsAIOpen(true)} />
      <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />

      <main className="flex-1 pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(247, 147, 26, 0.15)' }}>
                <Bitcoin className="w-6 h-6" style={{ color: '#f7931a' }} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                <span style={{ color: 'var(--primary)' }}>Simpleton</span> Crypto
              </h1>
            </div>
            <p className="text-sm opacity-50 italic">"Real data. Real markets. Real time."</p>
            {lastUpdated && (
              <div className="flex items-center justify-center gap-2 mt-2 text-xs opacity-40">
                <Clock className="w-3 h-3" />
                <span>Updated {lastUpdated.toLocaleTimeString()} • Auto-refreshes every 60s</span>
              </div>
            )}
          </div>

          {/* Global Stats */}
          <GlobalStats data={globalData} />

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
              <input
                type="text"
                placeholder="Search coins..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--foreground)' }}
              />
            </div>
            <div className="flex items-center gap-2">
              {(['24h', '7d', '30d'] as TimeFrame[]).map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeFrame(tf)}
                  className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={timeFrame === tf
                    ? { backgroundColor: 'var(--primary)', color: 'white' }
                    : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--muted-foreground)' }
                  }
                >{tf}</button>
              ))}
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className="px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
                style={showFavoritesOnly
                  ? { backgroundColor: 'rgba(250, 204, 21, 0.2)', color: '#facc15' }
                  : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--muted-foreground)' }
                }
              >
                <Star className="w-3 h-3" /> Watchlist
              </button>
              <button
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--muted-foreground)' }}
              >
                <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>
          </div>

          {/* Loading / Error */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 animate-spin mb-4" style={{ color: 'var(--primary)' }} />
              <p className="text-sm opacity-50">Loading live crypto data...</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-20">
              <p className="text-red-400 mb-4">{error}</p>
              <button onClick={() => { setLoading(true); fetchData(); }} className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                Retry
              </button>
            </div>
          )}

          {/* Coin Table */}
          {!loading && !error && (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Desktop Header */}
              <div className="hidden lg:grid grid-cols-12 gap-2 px-4 py-3 text-xs font-medium opacity-50" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <div className="col-span-1 cursor-pointer" onClick={() => handleSort('market_cap_rank')}>#<SortIcon col="market_cap_rank" /></div>
                <div className="col-span-3">Coin</div>
                <div className="col-span-2 text-right cursor-pointer" onClick={() => handleSort('current_price')}>Price<SortIcon col="current_price" /></div>
                <div className="col-span-1 text-right cursor-pointer" onClick={() => handleSort('price_change_percentage_24h')}>{timeFrame}<SortIcon col="price_change_percentage_24h" /></div>
                <div className="col-span-2 text-right cursor-pointer" onClick={() => handleSort('market_cap')}>Market Cap<SortIcon col="market_cap" /></div>
                <div className="col-span-1 text-right cursor-pointer" onClick={() => handleSort('total_volume')}>Volume<SortIcon col="total_volume" /></div>
                <div className="col-span-2 text-right">7d Chart</div>
              </div>

              {/* Coin Rows */}
              {filtered.map(coin => {
                const change = getChangeForTimeframe(coin);
                const positive = (change ?? 0) >= 0;
                const expanded = expandedCoin === coin.id;
                return (
                  <div key={coin.id}>
                    {/* Desktop Row */}
                    <div
                      className="hidden lg:grid grid-cols-12 gap-2 px-4 py-3 items-center cursor-pointer transition-colors hover:bg-white/[0.02]"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                      onClick={() => setExpandedCoin(expanded ? null : coin.id)}
                    >
                      <div className="col-span-1 flex items-center gap-2">
                        <button onClick={e => { e.stopPropagation(); toggleFavorite(coin.id); }} className="opacity-40 hover:opacity-100 transition-opacity">
                          {favorites.has(coin.id) ? <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> : <StarOff className="w-3.5 h-3.5" />}
                        </button>
                        <span className="text-xs opacity-50">{coin.market_cap_rank}</span>
                      </div>
                      <div className="col-span-3 flex items-center gap-3">
                        <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <div className="font-semibold text-sm">{coin.name}</div>
                          <div className="text-xs opacity-40 uppercase">{coin.symbol}</div>
                        </div>
                      </div>
                      <div className="col-span-2 text-right font-mono text-sm font-semibold">{formatCurrency(coin.current_price)}</div>
                      <div className={`col-span-1 text-right text-sm font-medium flex items-center justify-end gap-1 ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {change !== null && change !== undefined ? Math.abs(change).toFixed(2) + '%' : 'N/A'}
                      </div>
                      <div className="col-span-2 text-right text-sm opacity-70">{formatCurrency(coin.market_cap, true)}</div>
                      <div className="col-span-1 text-right text-sm opacity-70">{formatCurrency(coin.total_volume, true)}</div>
                      <div className="col-span-2 flex justify-end">
                        <MiniSparkline data={coin.sparkline_in_7d?.price} positive={positive} />
                      </div>
                    </div>

                    {/* Mobile Row */}
                    <div
                      className="lg:hidden flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                      onClick={() => setExpandedCoin(expanded ? null : coin.id)}
                    >
                      <button onClick={e => { e.stopPropagation(); toggleFavorite(coin.id); }} className="opacity-40 hover:opacity-100">
                        {favorites.has(coin.id) ? <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> : <StarOff className="w-3.5 h-3.5" />}
                      </button>
                      <span className="text-xs opacity-40 w-5">{coin.market_cap_rank}</span>
                      <img src={coin.image} alt={coin.name} className="w-7 h-7 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{coin.name}</div>
                        <div className="text-xs opacity-40 uppercase">{coin.symbol}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm font-semibold">{formatCurrency(coin.current_price)}</div>
                        <div className={`text-xs font-medium flex items-center justify-end gap-0.5 ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
                          {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {change !== null && change !== undefined ? Math.abs(change).toFixed(2) + '%' : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expanded && (
                      <div className="px-4 py-4" style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                          <div>
                            <div className="text-xs opacity-40 mb-1">Market Cap</div>
                            <div className="text-sm font-semibold">{formatCurrency(coin.market_cap, true)}</div>
                          </div>
                          <div>
                            <div className="text-xs opacity-40 mb-1">24h Volume</div>
                            <div className="text-sm font-semibold">{formatCurrency(coin.total_volume, true)}</div>
                          </div>
                          <div>
                            <div className="text-xs opacity-40 mb-1">Circulating Supply</div>
                            <div className="text-sm font-semibold">{formatSupply(coin.circulating_supply, coin.symbol)}</div>
                          </div>
                          <div>
                            <div className="text-xs opacity-40 mb-1">Max Supply</div>
                            <div className="text-sm font-semibold">{coin.max_supply ? formatSupply(coin.max_supply, coin.symbol) : 'Unlimited'}</div>
                          </div>
                          <div>
                            <div className="text-xs opacity-40 mb-1">All-Time High</div>
                            <div className="text-sm font-semibold">{formatCurrency(coin.ath)}</div>
                            <div className="text-xs text-red-400">{coin.ath_change_percentage.toFixed(1)}%</div>
                          </div>
                          <div>
                            <div className="text-xs opacity-40 mb-1">24h / 7d / 30d</div>
                            <div className="flex gap-2 text-xs font-medium">
                              <span className={coin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}>{coin.price_change_percentage_24h?.toFixed(1)}%</span>
                              <span className={(coin.price_change_percentage_7d_in_currency ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}>{coin.price_change_percentage_7d_in_currency?.toFixed(1)}%</span>
                              <span className={(coin.price_change_percentage_30d_in_currency ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}>{coin.price_change_percentage_30d_in_currency?.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <a
                            href={`https://www.coingecko.com/en/coins/${coin.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs flex items-center gap-1 opacity-40 hover:opacity-80 transition-opacity"
                          >
                            View on CoinGecko <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="text-center py-12 opacity-40">
                  <p className="text-sm">{showFavoritesOnly ? 'No coins in your watchlist yet.' : 'No coins match your search.'}</p>
                </div>
              )}
            </div>
          )}

          {/* Attribution */}
          <div className="text-center mt-6 text-xs opacity-30">
            Powered by CoinGecko API • Data refreshes every 60 seconds • Not financial advice
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
