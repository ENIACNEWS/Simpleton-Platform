import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Shield, Brain, MessageSquare, Users, Globe, TrendingUp,
  Newspaper, Settings, Plus, Trash2, Send, Loader2,
  Eye, Monitor, MapPin, Clock, Activity, ExternalLink,
  ChevronLeft, ChevronRight, Search, Key, Lock
} from 'lucide-react';

interface Conversation {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: number;
  conversationId: number;
  role: string;
  content: string;
  createdAt: string;
}

interface NewsArticle {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
  category: string;
}

interface UserData {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  provider: string;
  subscriptionStatus: string;
  createdAt: string;
}

interface VisitorData {
  id: number;
  ipAddress: string;
  city: string;
  region: string;
  country: string;
  browser: string;
  os: string;
  device: string;
  email: string | null;
  visitCount: number;
  lastVisitAt: string;
  createdAt: string;
}

export default function GhostAdminDashboard() {
  const [accessGranted, setAccessGranted] = useState(false);
  const [ownerKey, setOwnerKey] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem('ghost_admin_token');
    if (!token) return;
    fetch('/api/ghost-admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(r => r.json())
      .then(d => {
        if (d.valid) {
          setAccessGranted(true);
          setSessionToken(token);
        }
      })
      .catch(() => localStorage.removeItem('ghost_admin_token'));
  }, []);

  const authenticateOwner = async () => {
    try {
      const response = await fetch('/api/ghost-admin/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerKey })
      });
      const data = await response.json();
      if (data.success) {
        setAccessGranted(true);
        setSessionToken(data.accessToken);
        localStorage.setItem('ghost_admin_token', data.accessToken);
        setOwnerKey('');
        toast({ title: "Access Granted", description: "Welcome to your Command Center, Demiris" });
      } else {
        toast({ title: "Access Denied", description: "Invalid credentials", variant: "destructive" });
      }
    } catch (_) {
      toast({ title: "Error", description: "Authentication failed", variant: "destructive" });
    }
  };

  if (!accessGranted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-950 border-gray-800">
          <CardHeader className="text-center">
            <Lock className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <CardTitle className="text-emerald-400 text-lg">COMMAND CENTER</CardTitle>
            <p className="text-gray-500 text-sm">Owner-Only Access</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              value={ownerKey}
              onChange={(e) => setOwnerKey(e.target.value)}
              placeholder="Enter access code..."
              className="bg-gray-900 border-gray-700 text-white"
              onKeyDown={(e) => e.key === 'Enter' && authenticateOwner()}
            />
            <Button onClick={authenticateOwner} className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={!ownerKey}>
              Authenticate
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white" style={{ background: '#050a12' }}>
      <div className="border-b border-gray-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-emerald-400" />
            <span className="text-lg font-bold text-emerald-400">Simpleton Command Center</span>
          </div>
          <Badge className="bg-emerald-900/50 text-emerald-400 border-emerald-700">OWNER ACCESS</Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <Tabs defaultValue="ai" className="space-y-4">
          <TabsList className="bg-gray-900/80 border border-gray-800 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="ai" className="data-[state=active]:bg-emerald-900/50 data-[state=active]:text-emerald-400 gap-1">
              <Brain className="w-4 h-4" /> Simplicity AI
            </TabsTrigger>
            <TabsTrigger value="markets" className="data-[state=active]:bg-blue-900/50 data-[state=active]:text-blue-400 gap-1">
              <TrendingUp className="w-4 h-4" /> Markets
            </TabsTrigger>
            <TabsTrigger value="news" className="data-[state=active]:bg-amber-900/50 data-[state=active]:text-amber-400 gap-1">
              <Newspaper className="w-4 h-4" /> News
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-purple-900/50 data-[state=active]:text-purple-400 gap-1">
              <Users className="w-4 h-4" /> Users
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-rose-900/50 data-[state=active]:text-rose-400 gap-1">
              <Settings className="w-4 h-4" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai">
            <AIChat sessionToken={sessionToken} />
          </TabsContent>

          <TabsContent value="markets">
            <MarketsPanel sessionToken={sessionToken} />
          </TabsContent>

          <TabsContent value="news">
            <NewsPanel sessionToken={sessionToken} />
          </TabsContent>

          <TabsContent value="users">
            <UsersPanel sessionToken={sessionToken} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsPanel sessionToken={sessionToken} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AIChat({ sessionToken }: { sessionToken: string }) {
  const [activeConvo, setActiveConvo] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const headers = { 'X-Admin-Session': sessionToken };

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ['/api/ghost-admin/conversations'],
    queryFn: async () => {
      const r = await fetch('/api/ghost-admin/conversations', { headers });
      return r.json();
    },
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: ['/api/ghost-admin/conversations', activeConvo, 'messages'],
    queryFn: async () => {
      if (!activeConvo) return [];
      const r = await fetch(`/api/ghost-admin/conversations/${activeConvo}/messages`, { headers });
      return r.json();
    },
    enabled: !!activeConvo,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createConvo = async () => {
    try {
      const r = await fetch('/api/ghost-admin/conversations', {
        method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Conversation' })
      });
      const convo = await r.json();
      queryClient.invalidateQueries({ queryKey: ['/api/ghost-admin/conversations'] });
      setActiveConvo(convo.id);
    } catch (_) {
      toast({ title: "Error", description: "Failed to create conversation", variant: "destructive" });
    }
  };

  const deleteConvo = async (id: number, e: any) => {
    e.stopPropagation();
    try {
      await fetch(`/api/ghost-admin/conversations/${id}`, { method: 'DELETE', headers });
      queryClient.invalidateQueries({ queryKey: ['/api/ghost-admin/conversations'] });
      if (activeConvo === id) setActiveConvo(null);
    } catch (_) {}
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeConvo || sending) return;
    const msg = input.trim();
    setInput('');
    setSending(true);
    try {
      await fetch('/api/ghost-admin/chat', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: activeConvo, message: msg })
      });
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ['/api/ghost-admin/conversations'] });
    } catch (_) {
      toast({ title: "Error", description: "Failed to get AI response", variant: "destructive" });
    }
    setSending(false);
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-180px)]">
      <div className="w-64 shrink-0 flex flex-col bg-gray-900/50 rounded-lg border border-gray-800">
        <div className="p-3 border-b border-gray-800">
          <Button onClick={createConvo} className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2" size="sm">
            <Plus className="w-4 h-4" /> New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map(c => (
            <div
              key={c.id}
              onClick={() => setActiveConvo(c.id)}
              className={`flex items-center justify-between p-2 rounded cursor-pointer group text-sm ${
                activeConvo === c.id ? 'bg-emerald-900/30 text-emerald-400' : 'hover:bg-gray-800 text-gray-400'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{c.title}</span>
              </div>
              <button
                onClick={(e) => deleteConvo(c.id, e)}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {conversations.length === 0 && (
            <p className="text-gray-600 text-xs text-center p-4">No conversations yet. Start a new chat.</p>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-900/30 rounded-lg border border-gray-800">
        {!activeConvo ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Brain className="w-12 h-12 text-emerald-500/30 mx-auto mb-3" />
              <p className="text-gray-500">Select a conversation or start a new one</p>
              <p className="text-gray-600 text-sm mt-1">Simplicity is ready to help with anything</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 text-sm whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-emerald-900/40 text-emerald-100 border border-emerald-800/50'
                      : 'bg-gray-800/60 text-gray-200 border border-gray-700/50'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-700/50">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t border-gray-800">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Simplicity anything..."
                  className="bg-gray-900 border-gray-700 text-white resize-none min-h-[44px] max-h-[120px]"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                  }}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MarketsPanel({ sessionToken }: { sessionToken: string }) {
  const headers = { 'X-Admin-Session': sessionToken };

  const { data: marketData, isLoading } = useQuery({
    queryKey: ['/api/ghost-admin/market-overview'],
    queryFn: async () => {
      const r = await fetch('/api/ghost-admin/market-overview', { headers });
      return r.json();
    },
    refetchInterval: 60000,
  });

  const { data: tickerData } = useQuery({
    queryKey: ['/api/ticker/metals'],
  });

  const { data: newsTickerData } = useQuery({
    queryKey: ['/api/news/ticker'],
  });

  const metals = marketData?.metals;
  const ticker = (tickerData as any)?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-blue-400 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" /> Live Market Intelligence
        </h2>
        <Badge className="bg-blue-900/50 text-blue-400 border-blue-700">
          {marketData?.timestamp ? new Date(marketData.timestamp).toLocaleTimeString() : 'Loading...'}
        </Badge>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {metals && (
              <>
                <MetalCard name="Gold" price={metals.gold} color="text-yellow-400" />
                <MetalCard name="Silver" price={metals.silver} color="text-gray-300" />
                <MetalCard name="Platinum" price={metals.platinum} color="text-blue-300" />
                <MetalCard name="Palladium" price={metals.palladium} color="text-rose-300" />
              </>
            )}
          </div>

          {ticker.length > 0 && (
            <Card className="bg-gray-900/80 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Quantum Ticker Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left p-2 text-gray-400">Symbol</th>
                        <th className="text-right p-2 text-gray-400">Price</th>
                        <th className="text-right p-2 text-gray-400">Change</th>
                        <th className="text-right p-2 text-gray-400">% Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ticker.map((t: any, i: number) => (
                        <tr key={i} className="border-b border-gray-800/50">
                          <td className="p-2 text-white font-medium">{t.metal || t.symbol}</td>
                          <td className="p-2 text-right text-white">${Number(t.price || t.current).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className={`p-2 text-right ${Number(t.change) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {Number(t.change) >= 0 ? '+' : ''}{Number(t.change || 0).toFixed(2)}
                          </td>
                          <td className={`p-2 text-right ${Number(t.changePercent) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {Number(t.changePercent) >= 0 ? '+' : ''}{Number(t.changePercent || 0).toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {marketData?.diamonds?.length > 0 && (
            <Card className="bg-gray-900/80 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Diamond Market Prices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {marketData.diamonds.slice(0, 8).map((d: any, i: number) => (
                    <div key={i} className="bg-gray-800/50 rounded p-3">
                      <div className="text-xs text-gray-500">{d.shape} {d.caratWeight}ct {d.color}/{d.clarity}</div>
                      <div className="text-white font-bold">${Number(d.pricePerCarat || d.price || 0).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function MetalCard({ name, price, color }: { name: string; price: number; color: string }) {
  return (
    <Card className="bg-gray-900/80 border-gray-800">
      <CardContent className="p-4">
        <div className="text-xs text-gray-500 mb-1">{name}</div>
        <div className={`text-xl font-bold ${color}`}>
          ${Number(price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-gray-600">per troy oz</div>
      </CardContent>
    </Card>
  );
}

function NewsPanel({ sessionToken }: { sessionToken: string }) {
  const [filter, setFilter] = useState('all');
  const headers = { 'X-Admin-Session': sessionToken };

  const { data: news = [], isLoading } = useQuery<NewsArticle[]>({
    queryKey: ['/api/ghost-admin/all-news'],
    queryFn: async () => {
      const r = await fetch('/api/ghost-admin/all-news', { headers });
      return r.json();
    },
    refetchInterval: 300000,
  });

  const filtered = filter === 'all' ? news : news.filter(n => n.category === filter);
  const categories = [
    { key: 'all', label: 'All News' },
    { key: 'world', label: 'World' },
    { key: 'local', label: 'US' },
    { key: 'financial', label: 'Financial' },
    { key: 'market', label: 'Markets' },
    { key: 'tech', label: 'Tech' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
          <Newspaper className="w-5 h-5" /> Live News Feed
        </h2>
        <span className="text-gray-500 text-sm">{news.length} articles</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map(c => (
          <Button
            key={c.key}
            size="sm"
            variant={filter === c.key ? 'default' : 'ghost'}
            className={filter === c.key ? 'bg-amber-600' : 'text-gray-400 hover:text-white'}
            onClick={() => setFilter(c.key)}
          >
            {c.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-amber-400" /></div>
      ) : (
        <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
          {filtered.map((article, i) => (
            <a
              key={i}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gray-900/60 hover:bg-gray-800/60 border border-gray-800 rounded-lg p-3 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white text-sm font-medium leading-snug">{article.title}</h3>
                  {article.description && (
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{article.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <Badge className="bg-gray-800 text-gray-400 text-[10px]">{article.source}</Badge>
                    <span className="text-gray-600 text-[10px]">
                      {article.pubDate ? new Date(article.pubDate).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                      }) : ''}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-600 shrink-0 mt-0.5" />
              </div>
            </a>
          ))}
          {filtered.length === 0 && (
            <p className="text-gray-600 text-center p-8">No articles found</p>
          )}
        </div>
      )}
    </div>
  );
}

function UsersPanel({ sessionToken }: { sessionToken: string }) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'users' | 'visitors'>('users');
  const headers = { 'X-Admin-Session': sessionToken };

  const { data, isLoading } = useQuery<{
    users: UserData[];
    totalUsers: number;
    totalVisitors: number;
    todayVisitors: number;
    recentVisitors: VisitorData[];
  }>({
    queryKey: ['/api/ghost-admin/users-intel'],
    queryFn: async () => {
      const r = await fetch('/api/ghost-admin/users-intel', { headers });
      return r.json();
    },
  });

  const filteredUsers = data?.users?.filter(u =>
    !search ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const filteredVisitors = data?.recentVisitors?.filter(v =>
    !search ||
    v.email?.toLowerCase().includes(search.toLowerCase()) ||
    v.ipAddress?.includes(search) ||
    v.city?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2">
          <Users className="w-5 h-5" /> User Intelligence
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-gray-900/80 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Registered Users</span>
            </div>
            <div className="text-2xl font-bold text-white">{data?.totalUsers || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/80 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Total Visitors</span>
            </div>
            <div className="text-2xl font-bold text-white">{data?.totalVisitors || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/80 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-gray-400">Today</span>
            </div>
            <div className="text-2xl font-bold text-white">{data?.todayVisitors || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          placeholder="Search users or visitors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-gray-900 border-gray-700 text-white"
        />
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant={tab === 'users' ? 'default' : 'ghost'}
          className={tab === 'users' ? 'bg-purple-600' : 'text-gray-400'}
          onClick={() => setTab('users')}
        >
          Registered ({data?.users?.length || 0})
        </Button>
        <Button
          size="sm"
          variant={tab === 'visitors' ? 'default' : 'ghost'}
          className={tab === 'visitors' ? 'bg-blue-600' : 'text-gray-400'}
          onClick={() => setTab('visitors')}
        >
          Visitors ({data?.recentVisitors?.length || 0})
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-purple-400" /></div>
      ) : tab === 'users' ? (
        <Card className="bg-gray-900/80 border-gray-800">
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[calc(100vh-400px)]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-900">
                  <tr className="border-b border-gray-800">
                    <th className="text-left p-3 text-gray-400">ID</th>
                    <th className="text-left p-3 text-gray-400">Email</th>
                    <th className="text-left p-3 text-gray-400">Name</th>
                    <th className="text-left p-3 text-gray-400">Role</th>
                    <th className="text-left p-3 text-gray-400">Provider</th>
                    <th className="text-left p-3 text-gray-400">Plan</th>
                    <th className="text-left p-3 text-gray-400">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="p-3 text-gray-500">#{u.id}</td>
                      <td className="p-3 text-white font-mono text-xs">{u.email}</td>
                      <td className="p-3 text-gray-300">
                        {u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : '-'}
                      </td>
                      <td className="p-3">
                        <Badge className={u.role === 'admin' ? 'bg-amber-900/50 text-amber-400' : 'bg-gray-800 text-gray-400'}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="p-3 text-gray-400">{u.provider}</td>
                      <td className="p-3">
                        <Badge className={u.subscriptionStatus === 'premium' ? 'bg-purple-900/50 text-purple-400' : 'bg-gray-800 text-gray-500'}>
                          {u.subscriptionStatus}
                        </Badge>
                      </td>
                      <td className="p-3 text-gray-500 text-xs">
                        {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gray-900/80 border-gray-800">
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[calc(100vh-400px)]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-900">
                  <tr className="border-b border-gray-800">
                    <th className="text-left p-3 text-gray-400">IP</th>
                    <th className="text-left p-3 text-gray-400">Location</th>
                    <th className="text-left p-3 text-gray-400">Browser / OS</th>
                    <th className="text-left p-3 text-gray-400">Device</th>
                    <th className="text-left p-3 text-gray-400">Email</th>
                    <th className="text-left p-3 text-gray-400">Visits</th>
                    <th className="text-left p-3 text-gray-400">Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVisitors.map(v => (
                    <tr key={v.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="p-3 font-mono text-xs text-gray-400">{v.ipAddress || '-'}</td>
                      <td className="p-3 text-gray-300 text-xs">
                        {v.city || v.region || v.country
                          ? `${v.city || ''}${v.region ? `, ${v.region}` : ''}${v.country ? ` (${v.country})` : ''}`
                          : '-'}
                      </td>
                      <td className="p-3 text-gray-400 text-xs">{v.browser || '-'} / {v.os || '-'}</td>
                      <td className="p-3">
                        <Badge className={
                          v.device === 'Mobile' ? 'bg-blue-900/50 text-blue-400' :
                          v.device === 'Tablet' ? 'bg-purple-900/50 text-purple-400' :
                          'bg-gray-800 text-gray-400'
                        }>
                          {v.device || '-'}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs text-gray-300">{v.email || '-'}</td>
                      <td className="p-3 text-emerald-400 font-bold">{v.visitCount}</td>
                      <td className="p-3 text-gray-500 text-xs">
                        {new Date(v.lastVisitAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SettingsPanel({ sessionToken }: { sessionToken: string }) {
  const [newKey, setNewKey] = useState('');
  const [changing, setChanging] = useState(false);
  const { toast } = useToast();
  const headers = { 'X-Admin-Session': sessionToken };

  const changeKey = async () => {
    if (!newKey || newKey.length < 8) {
      toast({ title: "Error", description: "Key must be at least 8 characters", variant: "destructive" });
      return;
    }
    setChanging(true);
    try {
      const r = await fetch('/api/ghost-admin/change-key', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ newKey })
      });
      const data = await r.json();
      if (data.success) {
        toast({ title: "Updated", description: "Your access code has been changed. Use the new code next time you log in." });
        setNewKey('');
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch (_) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
    setChanging(false);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <h2 className="text-xl font-bold text-rose-400 flex items-center gap-2">
        <Settings className="w-5 h-5" /> Settings
      </h2>

      <Card className="bg-gray-900/80 border-gray-800">
        <CardHeader>
          <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
            <Key className="w-4 h-4 text-rose-400" /> Change Access Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-gray-500 text-xs">
            This changes the secret code required to enter Ghost Admin. Minimum 8 characters.
            The change takes effect immediately but only lasts until the next server restart
            unless you also update the GHOST_ADMIN_KEY environment variable.
          </p>
          <Input
            type="password"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Enter new access code..."
            className="bg-gray-900 border-gray-700 text-white"
          />
          <Button
            onClick={changeKey}
            disabled={changing || !newKey}
            className="bg-rose-600 hover:bg-rose-700"
          >
            {changing ? 'Updating...' : 'Update Access Code'}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/80 border-gray-800">
        <CardHeader>
          <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" /> System Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Platform</span>
            <span className="text-white">Simpleton™</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Owner</span>
            <span className="text-white">Demiris Brown</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <Badge className="bg-emerald-900/50 text-emerald-400">Operational</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Session</span>
            <span className="text-gray-400 font-mono text-xs">{sessionToken.slice(0, 12)}...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
