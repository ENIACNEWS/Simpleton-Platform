import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Globe, Monitor, MapPin, Search, ChevronLeft, ChevronRight, Shield, Activity, Eye, Clock } from 'lucide-react';

interface UserData {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  provider: string;
  subscriptionStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface VisitorData {
  id: number;
  fingerprint: string;
  ipAddress: string;
  city: string;
  region: string;
  country: string;
  userAgent: string;
  browser: string;
  os: string;
  device: string;
  referrer: string;
  landingPage: string;
  userId: number | null;
  email: string | null;
  visitCount: number;
  lastVisitAt: string;
  createdAt: string;
}

interface Stats {
  totalVisitors: number;
  uniqueIPs: number;
  registeredUsers: number;
  todayVisitors: number;
  weekVisitors: number;
  topLocations: { city: string; region: string; country: string; count: number }[];
  topBrowsers: { browser: string; count: number }[];
  topDevices: { device: string; count: number }[];
}

export default function S7Panel() {
  const { user } = useAuth();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) { setChecking(false); return; }
    fetch('/api/s7/v', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then(r => { if (r.ok) setAuthorized(true); })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [user]);

  const { data: stats } = useQuery<Stats>({
    queryKey: ['/api/s7/s'],
    enabled: authorized,
  });

  const { data: usersData } = useQuery<UserData[]>({
    queryKey: ['/api/s7/u'],
    enabled: authorized,
  });

  const { data: visitorsData } = useQuery<{ visitors: VisitorData[]; total: number; page: number; limit: number }>({
    queryKey: ['/api/s7/t', page],
    queryFn: async () => {
      const r = await fetch(`/api/s7/t?p=${page}&l=50`, { credentials: 'include' });
      return r.json();
    },
    enabled: authorized,
  });

  if (checking) return <div className="min-h-screen bg-black" />;

  if (!authorized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-800 text-sm">404 - Page Not Found</div>
      </div>
    );
  }

  const filteredUsers = usersData?.filter(u =>
    !search || 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const filteredVisitors = visitorsData?.visitors?.filter(v =>
    !search ||
    v.email?.toLowerCase().includes(search.toLowerCase()) ||
    v.ipAddress?.includes(search) ||
    v.city?.toLowerCase().includes(search.toLowerCase()) ||
    v.browser?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const totalPages = Math.ceil((visitorsData?.total || 0) / 50);

  return (
    <div className="min-h-screen text-white p-4 md:p-6" style={{ background: '#050a12' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-emerald-400" />
            <div>
              <h1 className="text-2xl font-bold text-emerald-400">Command Center</h1>
              <p className="text-gray-500 text-sm">Owner Intelligence</p>
            </div>
          </div>
          <Badge className="bg-emerald-900/50 text-emerald-400 border-emerald-700">LIVE</Badge>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <Card className="bg-gray-900/80 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-400">Total Visitors</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats.totalVisitors.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/80 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-gray-400">Unique IPs</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats.uniqueIPs.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/80 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-gray-400">Registered</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats.registeredUsers.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/80 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-gray-400">Today</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats.todayVisitors.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/80 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-rose-400" />
                  <span className="text-xs text-gray-400">This Week</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats.weekVisitors.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <Card className="bg-gray-900/80 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Top Locations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {stats.topLocations.map((loc, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-300">{loc.city}{loc.region ? `, ${loc.region}` : ''}</span>
                    <span className="text-gray-500">{loc.count}</span>
                  </div>
                ))}
                {stats.topLocations.length === 0 && <div className="text-gray-600 text-sm">No location data yet</div>}
              </CardContent>
            </Card>
            <Card className="bg-gray-900/80 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Top Browsers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {stats.topBrowsers.map((b, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-300">{b.browser}</span>
                    <span className="text-gray-500">{b.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="bg-gray-900/80 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                  <Monitor className="w-4 h-4" /> Devices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {stats.topDevices.map((d, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-300">{d.device}</span>
                    <span className="text-gray-500">{d.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search by email, name, IP, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-gray-900 border-gray-700 text-white"
            />
          </div>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="bg-gray-900 border-gray-700">
            <TabsTrigger value="users" className="data-[state=active]:bg-emerald-900/50 data-[state=active]:text-emerald-400">
              Registered Users ({usersData?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="visitors" className="data-[state=active]:bg-blue-900/50 data-[state=active]:text-blue-400">
              All Visitors ({visitorsData?.total || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="bg-gray-900/80 border-gray-800">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left p-3 text-gray-400 font-medium">ID</th>
                        <th className="text-left p-3 text-gray-400 font-medium">Email</th>
                        <th className="text-left p-3 text-gray-400 font-medium">Name</th>
                        <th className="text-left p-3 text-gray-400 font-medium">Role</th>
                        <th className="text-left p-3 text-gray-400 font-medium">Provider</th>
                        <th className="text-left p-3 text-gray-400 font-medium">Plan</th>
                        <th className="text-left p-3 text-gray-400 font-medium">Joined</th>
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
                      {filteredUsers.length === 0 && (
                        <tr><td colSpan={7} className="p-6 text-center text-gray-600">No users found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visitors">
            <Card className="bg-gray-900/80 border-gray-800">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left p-3 text-gray-400 font-medium">IP</th>
                        <th className="text-left p-3 text-gray-400 font-medium">Location</th>
                        <th className="text-left p-3 text-gray-400 font-medium">Browser / OS</th>
                        <th className="text-left p-3 text-gray-400 font-medium">Device</th>
                        <th className="text-left p-3 text-gray-400 font-medium">Email</th>
                        <th className="text-left p-3 text-gray-400 font-medium">Visits</th>
                        <th className="text-left p-3 text-gray-400 font-medium">Last Seen</th>
                        <th className="text-left p-3 text-gray-400 font-medium">First Visit</th>
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
                          <td className="p-3 text-gray-500 text-xs">
                            {new Date(v.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                      {filteredVisitors.length === 0 && (
                        <tr><td colSpan={8} className="p-6 text-center text-gray-600">No visitor data yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between p-3 border-t border-gray-800">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="text-gray-400"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <span className="text-gray-500 text-sm">Page {page} of {totalPages}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="text-gray-400"
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
