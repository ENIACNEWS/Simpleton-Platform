import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navigation } from "@/components/layout/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import {
  Mail, Inbox, RefreshCw, ArrowLeft, Star, Archive,
  Tag, Sparkles, Clock, ChevronRight, AlertCircle,
  CheckCircle2, TrendingUp, ShoppingBag, Newspaper,
  Plane, Heart, Scale, HelpCircle, Briefcase, LogIn, Unlink, Copy, ExternalLink
} from "lucide-react";

interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  labelIds: string[];
  isUnread: boolean;
  from: string;
  to: string;
  subject: string;
  date: string;
  internalDate: string;
}

interface GmailFull extends GmailMessage {
  body: string;
}

interface AIAnalysis {
  summary: string;
  category: string;
  priority: string;
  suggestedAction: string;
  sentiment: string;
}

const categoryIcons: Record<string, any> = {
  Finance: TrendingUp,
  Work: Briefcase,
  Personal: Heart,
  Shopping: ShoppingBag,
  Newsletter: Newspaper,
  Spam: AlertCircle,
  Travel: Plane,
  Healthcare: Heart,
  Legal: Scale,
  Other: HelpCircle,
};

const priorityColors: Record<string, string> = {
  High: "bg-red-500/20 text-red-400 border-red-500/30",
  Medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Low: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const sentimentColors: Record<string, string> = {
  Positive: "text-emerald-400",
  Neutral: "text-slate-400",
  Negative: "text-red-400",
  Urgent: "text-amber-400",
};

function formatFrom(from: string) {
  const match = from.match(/^"?([^"<]+)"?\s*<?[^>]*>?$/);
  return match ? match[1].trim() : from;
}

function formatDate(date: string) {
  try {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch { return date; }
}

export default function GmailOrganizer() {
  const queryClient = useQueryClient();
  const [location] = useLocation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Record<string, AIAnalysis>>({});
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [labelFilter, setLabelFilter] = useState("INBOX");
  const [copiedUri, setCopiedUri] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const oauthError = urlParams.get('error');

  // Check if just connected via OAuth callback
  useEffect(() => {
    if (location.includes('connected=1')) {
      queryClient.invalidateQueries({ queryKey: ['/api/gmail/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gmail/inbox'] });
    }
  }, [location]);

  const { data: redirectUriData } = useQuery<{ redirectUri: string }>({
    queryKey: ['/api/gmail/redirect-uri'],
    retry: false,
  });

  const { data: statusData, isLoading: statusLoading } = useQuery<{ connected: boolean }>({
    queryKey: ['/api/gmail/status'],
    retry: false,
  });

  const connected = statusData?.connected ?? false;

  const { data: inbox, isLoading, error, refetch } = useQuery<{ messages: GmailMessage[]; nextPageToken: string | null }>({
    queryKey: ['/api/gmail/inbox', labelFilter],
    queryFn: () => fetch(`/api/gmail/inbox?label=${labelFilter}&maxResults=25`).then(r => {
      if (!r.ok) throw new Error('Failed to load inbox');
      return r.json();
    }),
    retry: false,
    enabled: connected,
  });

  const { data: selected, isLoading: loadingMsg } = useQuery<GmailFull>({
    queryKey: ['/api/gmail/message', selectedId],
    queryFn: () => fetch(`/api/gmail/message/${selectedId}`).then(r => r.json()),
    enabled: !!selectedId && connected,
  });

  const disconnectMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/gmail/disconnect', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gmail/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gmail/inbox'] });
    },
  });

  const labelMutation = useMutation({
    mutationFn: ({ messageId, addLabelIds, removeLabelIds }: { messageId: string; addLabelIds?: string[]; removeLabelIds?: string[] }) =>
      apiRequest('POST', '/api/gmail/label', { messageId, addLabelIds: addLabelIds || [], removeLabelIds: removeLabelIds || [] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gmail/inbox'] });
    },
  });

  const analyzeEmail = async (msgId: string) => {
    if (analyses[msgId] || analyzingId) return;
    setAnalyzingId(msgId);
    try {
      const res = await apiRequest('POST', '/api/gmail/ai-organize', { messageId: msgId });
      const data = await res.json();
      if (data.analysis) setAnalyses(prev => ({ ...prev, [msgId]: data.analysis }));
    } catch { } finally {
      setAnalyzingId(null);
    }
  };

  const messages = inbox?.messages || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-display">Simplicity Mail Organizer</h1>
              <p className="text-slate-400 text-sm">Powered by Simplicity AI — manage and organize your inbox</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {connected && (
              <>
                <Button onClick={() => refetch()} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800" disabled={isLoading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-red-400"
                  onClick={() => disconnectMutation.mutate()}
                  disabled={disconnectMutation.isPending}
                >
                  <Unlink className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Not connected — show connect prompt */}
        {!statusLoading && !connected ? (
          <div className="max-w-xl mx-auto mt-16 space-y-4">
            {/* Error banner */}
            {oauthError && (
              <Card className="bg-red-900/20 border border-red-500/30">
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-300 font-medium text-sm">Connection failed</p>
                    {oauthError === 'no_refresh_token' ? (
                      <p className="text-slate-400 text-xs mt-1">
                        Google didn't return an authorization token. This happens when you previously authorized the app. To fix it: go to{' '}
                        <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Google Account Permissions</a>,
                        remove <span className="simpleton-brand">Simpleton</span> access, then try again.
                      </p>
                    ) : (
                      <p className="text-slate-400 text-xs mt-1">{decodeURIComponent(oauthError)}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
              <CardContent className="p-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-5">
                  <Mail className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-white font-bold text-xl mb-2">Connect Your Gmail</h2>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Link your Google account to read, organize, and analyze your emails with Simplicity. Your credentials are stored securely and never shared.
                </p>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                  onClick={() => { window.location.href = '/api/gmail/auth'; }}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Connect Gmail Account
                </Button>
                <p className="text-slate-600 text-xs mt-4">
                  You'll be redirected to Google to authorize access. Read and label permissions only.
                </p>

                {/* Setup help toggle */}
                <button
                  className="text-slate-500 hover:text-slate-300 text-xs mt-4 underline underline-offset-2 transition-colors"
                  onClick={() => setShowSetup(s => !s)}
                >
                  {showSetup ? 'Hide' : 'Having trouble? Show'} setup instructions
                </button>
              </CardContent>
            </Card>

            {/* Setup instructions panel */}
            {showSetup && redirectUriData && (
              <Card className="bg-slate-800/30 border border-slate-700/40">
                <CardContent className="p-6">
                  <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-blue-400" />
                    Google Cloud Console Setup
                  </h3>
                  <ol className="text-slate-400 text-xs space-y-3 list-none">
                    <li className="flex gap-2"><span className="text-blue-400 font-bold shrink-0">1.</span> Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">console.cloud.google.com → APIs → Credentials</a></li>
                    <li className="flex gap-2"><span className="text-blue-400 font-bold shrink-0">2.</span> Open your OAuth 2.0 Client ID and add this exact URI to <strong className="text-slate-300">Authorized redirect URIs</strong>:</li>
                  </ol>
                  <div className="mt-3 bg-slate-900/60 rounded-lg border border-slate-600/40 p-3 flex items-center gap-2">
                    <code className="text-emerald-400 text-xs flex-1 break-all">{redirectUriData.redirectUri}</code>
                    <button
                      className="shrink-0 text-slate-400 hover:text-white transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(redirectUriData.redirectUri);
                        setCopiedUri(true);
                        setTimeout(() => setCopiedUri(false), 2000);
                      }}
                    >
                      {copiedUri ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <ol className="text-slate-400 text-xs space-y-3 list-none mt-3">
                    <li className="flex gap-2"><span className="text-blue-400 font-bold shrink-0">3.</span> Make sure your Gmail account is listed under <strong className="text-slate-300">OAuth consent screen → Test users</strong> (while the app is in testing mode)</li>
                    <li className="flex gap-2"><span className="text-blue-400 font-bold shrink-0">4.</span> Save changes and try connecting again above</li>
                  </ol>
                </CardContent>
              </Card>
            )}
          </div>
        ) : !statusLoading && connected ? (
          <>
            {/* Label tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {['INBOX', 'UNREAD', 'STARRED', 'SENT', 'CATEGORY_SOCIAL', 'CATEGORY_PROMOTIONS'].map(label => (
                <button
                  key={label}
                  onClick={() => { setLabelFilter(label); setSelectedId(null); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    labelFilter === label
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      : 'bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50'
                  }`}
                >
                  {label.replace('CATEGORY_', '').charAt(0) + label.replace('CATEGORY_', '').slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {error ? (
              <Card className="bg-red-900/20 border border-red-500/30">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                  <p className="text-red-300 font-medium">Could not load Gmail</p>
                  <p className="text-slate-400 text-sm mt-1">Try refreshing or reconnecting your account.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Message list */}
                <div className={`${selectedId ? 'hidden lg:block lg:col-span-2' : 'col-span-1 lg:col-span-5'}`}>
                  <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
                    <CardHeader className="pb-3 border-b border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-base">
                          <Inbox className="w-4 h-4 inline mr-2 text-blue-400" />
                          {messages.length} messages
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 max-h-[700px] overflow-y-auto">
                      {isLoading ? (
                        <div className="p-12 text-center">
                          <RefreshCw className="w-6 h-6 text-blue-400 animate-spin mx-auto mb-2" />
                          <p className="text-slate-400 text-sm">Loading your inbox...</p>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="p-12 text-center">
                          <Mail className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                          <p className="text-slate-400">No messages found</p>
                        </div>
                      ) : (
                        messages.map(msg => {
                          const analysis = analyses[msg.id];
                          const CatIcon = analysis ? (categoryIcons[analysis.category] || HelpCircle) : null;
                          return (
                            <button
                              key={msg.id}
                              onClick={() => { setSelectedId(msg.id); analyzeEmail(msg.id); }}
                              className={`w-full text-left p-4 border-b border-slate-700/40 hover:bg-slate-700/30 transition-all ${
                                selectedId === msg.id ? 'bg-slate-700/50 border-l-2 border-l-blue-400' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${msg.isUnread ? 'bg-blue-400' : 'bg-transparent'}`} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <span className={`text-sm truncate ${msg.isUnread ? 'text-white font-semibold' : 'text-slate-300 font-medium'}`}>
                                      {formatFrom(msg.from)}
                                    </span>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      {analysis && (
                                        <Badge variant="outline" className={`text-[9px] px-1 py-0 ${priorityColors[analysis.priority]}`}>
                                          {analysis.priority}
                                        </Badge>
                                      )}
                                      {CatIcon && <CatIcon className="w-3 h-3 text-slate-400" />}
                                      <span className="text-slate-500 text-[11px]">{formatDate(msg.date)}</span>
                                    </div>
                                  </div>
                                  <p className={`text-sm truncate mt-0.5 ${msg.isUnread ? 'text-slate-200' : 'text-slate-400'}`}>
                                    {msg.subject || '(no subject)'}
                                  </p>
                                  <p className="text-slate-500 text-xs truncate mt-0.5">{msg.snippet}</p>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 mt-1" />
                              </div>
                            </button>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Message detail + AI analysis */}
                {selectedId && (
                  <div className="col-span-1 lg:col-span-3 space-y-4">
                    {/* Controls */}
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-white lg:hidden">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-800"
                        onClick={() => labelMutation.mutate({ messageId: selectedId, removeLabelIds: ['UNREAD'] })}
                        disabled={labelMutation.isPending}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Mark Read
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-800"
                        onClick={() => labelMutation.mutate({ messageId: selectedId, addLabelIds: ['STARRED'] })}
                        disabled={labelMutation.isPending}
                      >
                        <Star className="w-3.5 h-3.5 mr-1.5" /> Star
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-800"
                        onClick={() => labelMutation.mutate({ messageId: selectedId, removeLabelIds: ['INBOX'] })}
                        disabled={labelMutation.isPending}
                      >
                        <Archive className="w-3.5 h-3.5 mr-1.5" /> Archive
                      </Button>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white ml-auto"
                        onClick={() => analyzeEmail(selectedId)}
                        disabled={!!analyzingId || !!analyses[selectedId]}
                      >
                        {analyzingId === selectedId ? (
                          <><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Analyzing...</>
                        ) : analyses[selectedId] ? (
                          <><Sparkles className="w-3.5 h-3.5 mr-1.5" /> Analyzed</>
                        ) : (
                          <><Sparkles className="w-3.5 h-3.5 mr-1.5" /> AI Analyze</>
                        )}
                      </Button>
                    </div>

                    {/* AI Analysis card */}
                    {analyses[selectedId] && (
                      <Card className="bg-gradient-to-r from-blue-900/20 to-indigo-900/10 border border-blue-500/20">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-400 font-semibold text-sm">Simplicity AI Analysis</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                            <div className="bg-black/20 rounded-lg p-2 text-center">
                              <p className="text-slate-500 text-[10px] uppercase tracking-wider">Category</p>
                              <p className="text-white text-sm font-medium mt-0.5">{analyses[selectedId].category}</p>
                            </div>
                            <div className="bg-black/20 rounded-lg p-2 text-center">
                              <p className="text-slate-500 text-[10px] uppercase tracking-wider">Priority</p>
                              <p className={`text-sm font-medium mt-0.5 ${priorityColors[analyses[selectedId].priority]?.split(' ')[1]}`}>
                                {analyses[selectedId].priority}
                              </p>
                            </div>
                            <div className="bg-black/20 rounded-lg p-2 text-center">
                              <p className="text-slate-500 text-[10px] uppercase tracking-wider">Sentiment</p>
                              <p className={`text-sm font-medium mt-0.5 ${sentimentColors[analyses[selectedId].sentiment]}`}>
                                {analyses[selectedId].sentiment}
                              </p>
                            </div>
                            <div className="bg-black/20 rounded-lg p-2 text-center">
                              <p className="text-slate-500 text-[10px] uppercase tracking-wider">Action</p>
                              <p className="text-white text-sm font-medium mt-0.5 truncate">{analyses[selectedId].suggestedAction}</p>
                            </div>
                          </div>
                          <p className="text-slate-300 text-sm leading-relaxed">{analyses[selectedId].summary}</p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Email content */}
                    <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
                      <CardHeader className="pb-3 border-b border-slate-700/50">
                        {loadingMsg ? (
                          <div className="animate-pulse space-y-2">
                            <div className="h-4 bg-slate-700 rounded w-3/4" />
                            <div className="h-3 bg-slate-700 rounded w-1/2" />
                          </div>
                        ) : (
                          <>
                            <h2 className="text-white font-semibold text-base leading-tight">{selected?.subject || '(no subject)'}</h2>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-400 text-sm font-bold">{formatFrom(selected?.from || '?').charAt(0).toUpperCase()}</span>
                              </div>
                              <div>
                                <p className="text-slate-300 text-sm font-medium">{formatFrom(selected?.from || '')}</p>
                                <p className="text-slate-500 text-xs">{selected?.date}</p>
                              </div>
                            </div>
                          </>
                        )}
                      </CardHeader>
                      <CardContent className="p-5 max-h-[450px] overflow-y-auto">
                        {loadingMsg ? (
                          <div className="space-y-3 animate-pulse">
                            {[1,2,3,4,5].map(i => <div key={i} className="h-3 bg-slate-700 rounded" style={{width: `${70 + i*5}%`}} />)}
                          </div>
                        ) : (
                          <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                            {selected?.body || selected?.snippet || '(no content)'}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
