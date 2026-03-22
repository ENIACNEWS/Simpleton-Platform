import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/layout/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import {
  Mail, Inbox, Send, MessageSquare, ArrowLeft,
  RefreshCw, Shield, Search, Clock, User, Bot,
  CheckCircle, AlertTriangle, Archive, Flag, Zap,
  ChevronRight
} from "lucide-react";

interface EmailStats {
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  autoRepliesSent: number;
  recentConversations: EmailConversation[];
}

interface EmailConversation {
  id: number;
  senderEmail: string;
  senderName: string | null;
  subject: string;
  status: string;
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
}

interface EmailMessage {
  id: number;
  conversationId: number;
  direction: string;
  fromEmail: string;
  toEmail: string;
  subject: string | null;
  bodyText: string | null;
  bodyHtml: string | null;
  aiModel: string | null;
  metadata: any;
  createdAt: string;
}

interface ConversationDetail extends EmailConversation {
  messages: EmailMessage[];
}

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  active: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: MessageSquare, label: "Active" },
  resolved: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: CheckCircle, label: "Resolved" },
  flagged: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: Flag, label: "Flagged" },
  archived: { color: "bg-slate-500/20 text-slate-400 border-slate-500/30", icon: Archive, label: "Archived" },
};

export default function EmailCommandCenter() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  const isAdmin = user?.id === 1 || (user as any)?.role === 'admin';
  const [activeStatPanel, setActiveStatPanel] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery<EmailStats>({
    queryKey: ["/api/email/stats"],
    enabled: isAuthenticated && isAdmin,
  });

  const { data: conversations, isLoading: convsLoading } = useQuery<EmailConversation[]>({
    queryKey: ["/api/email/conversations"],
    enabled: isAuthenticated && isAdmin,
  });

  const { data: conversationDetail, isLoading: detailLoading } = useQuery<ConversationDetail>({
    queryKey: ["/api/email/conversations", selectedConversation],
    enabled: isAuthenticated && isAdmin && selectedConversation !== null,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/email/conversations/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/email/stats"] });
      if (selectedConversation) {
        queryClient.invalidateQueries({ queryKey: ["/api/email/conversations", selectedConversation] });
      }
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/email/test", {
        from: "demo@example.com",
        fromName: "Demo User",
        subject: "What are current gold market trends?",
        text: "Hi Simpleton, I'm interested in investing in gold. Can you tell me about current market trends and whether now is a good time to buy? Also, what forms of gold investment do you recommend for a beginner? Thanks!",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/email/stats"] });
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Navigation />
        <div className="flex items-center justify-center pt-32">
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-red-500/30 max-w-md w-full">
            <CardContent className="p-8 text-center">
              <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
              <p className="text-slate-400">This area is restricted to administrators.</p>
              <Button onClick={() => setLocation("/")} className="mt-6 bg-slate-700 hover:bg-slate-600 text-white">
                Return Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const filteredConversations = (conversations || []).filter(conv => {
    const matchesSearch = !searchFilter ||
      conv.senderEmail.toLowerCase().includes(searchFilter.toLowerCase()) ||
      conv.subject.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (conv.senderName && conv.senderName.toLowerCase().includes(searchFilter.toLowerCase()));
    const matchesStatus = statusFilter === "all" || conv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/email/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/email/conversations"] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Simpleton Email Center</h1>
                <p className="text-slate-400 text-sm">Simplicity-Powered Auto-Responder | INTEL@simpletonapp.com</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => testEmailMutation.mutate()}
              disabled={testEmailMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {testEmailMutation.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              Test AI Response
            </Button>
            <Button onClick={handleRefresh} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { key: "total", label: "Total Conversations", value: stats?.totalConversations || 0, color: "text-white", icon: Inbox, iconColor: "text-blue-400", filter: "all" },
            { key: "active", label: "Active Threads", value: stats?.activeConversations || 0, color: "text-emerald-400", icon: MessageSquare, iconColor: "text-emerald-400", filter: "active" },
            { key: "messages", label: "Total Messages", value: stats?.totalMessages || 0, color: "text-white", icon: Mail, iconColor: "text-slate-400", filter: "all" },
            { key: "autoreplies", label: "AI Auto-Replies", value: stats?.autoRepliesSent || 0, color: "text-amber-400", icon: Send, iconColor: "text-amber-400", filter: "all" },
          ].map((card) => (
            <Card
              key={card.key}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 cursor-pointer hover:border-amber-500/40 hover:bg-slate-800 transition-all"
              onClick={() => {
                setActiveStatPanel(activeStatPanel === card.key ? null : card.key);
                if (card.filter !== statusFilter) setStatusFilter(card.filter);
              }}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider">{card.label}</p>
                    <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
                  </div>
                  <card.icon className={`w-8 h-8 opacity-60 ${card.iconColor}`} />
                </div>
                {activeStatPanel === card.key && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <p className="text-slate-400 text-xs">
                      {card.key === "total" && `${stats?.totalConversations || 0} total threads — ${stats?.activeConversations || 0} active, ${(stats?.totalConversations || 0) - (stats?.activeConversations || 0)} closed`}
                      {card.key === "active" && `${stats?.activeConversations || 0} threads awaiting response or ongoing`}
                      {card.key === "messages" && `${stats?.totalMessages || 0} messages across all conversations`}
                      {card.key === "autoreplies" && `${stats?.autoRepliesSent || 0} automated AI responses sent to date`}
                    </p>
                    <p className="text-amber-400 text-xs mt-1">Scroll down to view conversations</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversation List */}
          <div className={selectedConversation ? "hidden lg:block lg:col-span-1" : "col-span-1 lg:col-span-3"}>
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">Conversations</CardTitle>
                  <span className="text-slate-400 text-sm">{filteredConversations.length} threads</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      placeholder="Search emails..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="pl-9 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {["all", "active", "resolved", "flagged", "archived"].map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        statusFilter === s
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                          : "bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:bg-slate-700"
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="p-0 max-h-[600px] overflow-y-auto">
                {convsLoading ? (
                  <div className="p-8 text-center">
                    <RefreshCw className="w-6 h-6 text-amber-400 animate-spin mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">Loading conversations...</p>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <Mail className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No conversations yet</p>
                    <p className="text-slate-500 text-sm mt-1">Send a test email or configure Inbound Parse</p>
                  </div>
                ) : (
                  filteredConversations.map(conv => {
                    const sc = statusConfig[conv.status] || statusConfig.active;
                    const StatusIcon = sc.icon;
                    return (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv.id)}
                        className={`w-full text-left p-4 border-b border-slate-700/50 hover:bg-slate-700/30 transition-all ${
                          selectedConversation === conv.id ? "bg-slate-700/50 border-l-2 border-l-amber-400" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-medium text-sm truncate">
                                {conv.senderName || conv.senderEmail}
                              </span>
                              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${sc.color}`}>
                                <StatusIcon className="w-2.5 h-2.5 mr-1" />
                                {sc.label}
                              </Badge>
                            </div>
                            <p className="text-slate-300 text-sm truncate">{conv.subject}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-slate-500 text-xs flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(conv.lastMessageAt).toLocaleDateString()}
                              </span>
                              <span className="text-slate-500 text-xs flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {conv.messageCount} msgs
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
                        </div>
                      </button>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Conversation Detail */}
          {selectedConversation && (
            <div className="col-span-1 lg:col-span-2">
              <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
                <CardHeader className="pb-3 border-b border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedConversation(null)}
                        className="text-slate-400 hover:text-white lg:hidden"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <div>
                        <h3 className="text-white font-semibold">
                          {conversationDetail?.subject || "Loading..."}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          {conversationDetail?.senderName || conversationDetail?.senderEmail}
                        </p>
                      </div>
                    </div>
                    {conversationDetail && (
                      <div className="flex gap-2">
                        {["active", "resolved", "flagged", "archived"].map(s => {
                          const sc = statusConfig[s];
                          return (
                            <button
                              key={s}
                              onClick={() => updateStatusMutation.mutate({ id: selectedConversation, status: s })}
                              className={`p-1.5 rounded-lg transition-all ${
                                conversationDetail.status === s
                                  ? sc.color + " border"
                                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-700/50"
                              }`}
                              title={sc.label}
                            >
                              <sc.icon className="w-4 h-4" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0 max-h-[600px] overflow-y-auto">
                  {detailLoading ? (
                    <div className="p-8 text-center">
                      <RefreshCw className="w-6 h-6 text-amber-400 animate-spin mx-auto" />
                    </div>
                  ) : conversationDetail?.messages ? (
                    <div className="divide-y divide-slate-700/30">
                      {conversationDetail.messages.map(msg => (
                        <div key={msg.id} className={`p-5 ${msg.direction === 'outbound' ? 'bg-slate-900/30' : ''}`}>
                          <div className="flex items-center gap-2 mb-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              msg.direction === 'inbound'
                                ? 'bg-blue-500/20'
                                : 'bg-amber-500/20'
                            }`}>
                              {msg.direction === 'inbound' ? (
                                <User className="w-4 h-4 text-blue-400" />
                              ) : (
                                <Bot className="w-4 h-4 text-amber-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${
                                  msg.direction === 'inbound' ? 'text-blue-400' : 'text-amber-400'
                                }`}>
                                  {msg.direction === 'inbound' ? msg.fromEmail : 'Simpleton Auto-Reply'}
                                </span>
                                {msg.aiModel && (
                                  <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/30">
                                    {msg.aiModel}
                                  </Badge>
                                )}
                              </div>
                              <span className="text-slate-500 text-xs">
                                {new Date(msg.createdAt).toLocaleString()}
                                {msg.metadata?.processingTimeMs && (
                                  <span className="ml-2">({msg.metadata.processingTimeMs}ms)</span>
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed ml-10">
                            {msg.bodyText}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400">No messages found</div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
