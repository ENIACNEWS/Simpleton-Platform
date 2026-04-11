import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import {
  Bot,
  Play,
  Pause,
  Send,
  Clock,
  Activity,
  Zap,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Mail,
  Eye,
  Cpu,
  TrendingUp,
  Shield,
  FileText,
  Megaphone,
  Search,
  MessageSquare,
  Car,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

// ── Design tokens (matching site editorial language) ─────────
const T = {
  bg: "#06060b",
  card: "#0c0c14",
  cardBorder: "#1a1a2e",
  gold: "#c9a54e",
  goldDim: "#8a7a3a",
  ink: "#e8e4dc",
  muted: "#8a8578",
  green: "#22c55e",
  red: "#ef4444",
  amber: "#f59e0b",
  blue: "#3b82f6",
  purple: "#a855f7",
  display: "'Playfair Display', Georgia, serif",
  body: "'Inter', -apple-system, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
};

const AGENT_ICONS: Record<string, any> = {
  maven: Car,
  simplicity: Sparkles,
  scout: Search,
  dispatch: MessageSquare,
  pulse: Activity,
  ledger: TrendingUp,
  draft: FileText,
  market: Megaphone,
  sentinel: Shield,
};

const AGENT_COLORS: Record<string, string> = {
  maven: "#3b82f6",
  simplicity: "#c9a54e",
  scout: "#22c55e",
  dispatch: "#f59e0b",
  pulse: "#ef4444",
  ledger: "#8b5cf6",
  draft: "#ec4899",
  market: "#06b6d4",
  sentinel: "#dc2626",
};

const MODEL_BADGE: Record<string, { label: string; color: string }> = {
  "claude-opus-4-6": { label: "Opus", color: "#a855f7" },
  "claude-sonnet-4-6": { label: "Sonnet", color: "#3b82f6" },
};

function timeAgo(date: string | null): string {
  if (!date) return "Never";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Never";
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ── Agent Card Component ─────────────────────────────────────
function AgentCard({
  agent,
  onToggle,
  onRun,
  onViewTasks,
}: {
  agent: any;
  onToggle: (id: string, active: boolean) => void;
  onRun: (id: string) => void;
  onViewTasks: (id: string) => void;
}) {
  const Icon = AGENT_ICONS[agent.agentId] || Bot;
  const color = AGENT_COLORS[agent.agentId] || T.gold;
  const model = MODEL_BADGE[agent.model || "claude-sonnet-4-6"];

  return (
    <div
      style={{
        background: T.card,
        border: `1px solid ${agent.isActive ? color + "40" : T.cardBorder}`,
        borderRadius: 12,
        padding: 20,
        position: "relative",
        transition: "all 0.2s ease",
      }}
    >
      {/* Status indicator */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: agent.isActive ? T.green : T.muted,
          boxShadow: agent.isActive ? `0 0 8px ${T.green}80` : "none",
        }}
      />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: `${color}15`,
            border: `1px solid ${color}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={22} color={color} />
        </div>
        <div>
          <div style={{ fontFamily: T.display, fontSize: 18, color: T.ink, fontWeight: 600 }}>
            {agent.name}
          </div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2, display: "flex", gap: 8, alignItems: "center" }}>
            <span
              style={{
                background: model?.color + "20",
                color: model?.color,
                padding: "1px 6px",
                borderRadius: 4,
                fontSize: 10,
                fontFamily: T.mono,
                fontWeight: 600,
              }}
            >
              {model?.label}
            </span>
            {agent.schedule && (
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Clock size={10} />
                {describeCron(agent.schedule)}
              </span>
            )}
            {!agent.schedule && <span>Trigger-only</span>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.ink, fontFamily: T.mono }}>
            {agent.totalRuns ?? 0}
          </div>
          <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: 1 }}>
            Runs
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.ink, fontFamily: T.mono }}>
            {formatTokens(agent.totalTokens ?? 0)}
          </div>
          <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: 1 }}>
            Tokens
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>
            {timeAgo(agent.lastRunAt)}
          </div>
          <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: 1 }}>
            Last Run
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => onToggle(agent.agentId, !agent.isActive)}
          style={{
            flex: 1,
            padding: "8px 0",
            borderRadius: 6,
            border: `1px solid ${agent.isActive ? T.amber + "40" : T.green + "40"}`,
            background: "transparent",
            color: agent.isActive ? T.amber : T.green,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          {agent.isActive ? <Pause size={12} /> : <Play size={12} />}
          {agent.isActive ? "Pause" : "Activate"}
        </button>
        <button
          onClick={() => onRun(agent.agentId)}
          style={{
            flex: 1,
            padding: "8px 0",
            borderRadius: 6,
            border: `1px solid ${color}40`,
            background: `${color}10`,
            color,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <Zap size={12} />
          Run Now
        </button>
        <button
          onClick={() => onViewTasks(agent.agentId)}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: `1px solid ${T.cardBorder}`,
            background: "transparent",
            color: T.muted,
            fontSize: 12,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Eye size={12} />
        </button>
      </div>
    </div>
  );
}

// ── Task Row Component ───────────────────────────────────────
function TaskRow({ task }: { task: any }) {
  const [expanded, setExpanded] = useState(false);
  const color = AGENT_COLORS[task.agentId] || T.gold;
  const Icon = AGENT_ICONS[task.agentId] || Bot;

  const statusColors: Record<string, string> = {
    completed: T.green,
    failed: T.red,
    running: T.blue,
    pending: T.muted,
  };

  const statusIcons: Record<string, any> = {
    completed: CheckCircle,
    failed: XCircle,
    running: Loader2,
    pending: Clock,
  };

  const StatusIcon = statusIcons[task.status] || Clock;

  return (
    <div
      style={{
        background: T.card,
        border: `1px solid ${T.cardBorder}`,
        borderRadius: 8,
        marginBottom: 8,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 16px",
          cursor: "pointer",
          gap: 12,
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Icon size={16} color={color} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>
              {task.agentId.charAt(0).toUpperCase() + task.agentId.slice(1)}
            </span>
            <span
              style={{
                fontSize: 10,
                padding: "1px 6px",
                borderRadius: 4,
                background: `${statusColors[task.status]}15`,
                color: statusColors[task.status],
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              <StatusIcon
                size={10}
                style={{
                  display: "inline",
                  verticalAlign: "middle",
                  marginRight: 3,
                  ...(task.status === "running" ? { animation: "spin 1s linear infinite" } : {}),
                }}
              />
              {task.status}
            </span>
            <span
              style={{
                fontSize: 10,
                padding: "1px 6px",
                borderRadius: 4,
                background: T.cardBorder,
                color: T.muted,
              }}
            >
              {task.trigger}
            </span>
          </div>
          <div
            style={{
              fontSize: 11,
              color: T.muted,
              marginTop: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {task.input?.substring(0, 80)}
            {(task.input?.length || 0) > 80 ? "..." : ""}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: T.muted }}>{timeAgo(task.createdAt)}</div>
          {task.durationMs && (
            <div style={{ fontSize: 10, color: T.muted, fontFamily: T.mono }}>
              {(task.durationMs / 1000).toFixed(1)}s
            </div>
          )}
        </div>
        {expanded ? <ChevronUp size={14} color={T.muted} /> : <ChevronDown size={14} color={T.muted} />}
      </div>

      {expanded && (
        <div style={{ borderTop: `1px solid ${T.cardBorder}`, padding: 16 }}>
          {task.input && (
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 10,
                  color: T.muted,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 6,
                }}
              >
                Input
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: T.ink,
                  background: "#0a0a12",
                  borderRadius: 6,
                  padding: 12,
                  whiteSpace: "pre-wrap",
                  fontFamily: T.mono,
                  lineHeight: 1.5,
                  maxHeight: 200,
                  overflow: "auto",
                }}
              >
                {task.input}
              </div>
            </div>
          )}
          {task.output && (
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 10,
                  color: T.gold,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 6,
                }}
              >
                Output
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: T.ink,
                  background: "#0a0a12",
                  borderRadius: 6,
                  padding: 12,
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.6,
                  maxHeight: 400,
                  overflow: "auto",
                }}
              >
                {task.output}
              </div>
            </div>
          )}
          {task.error && (
            <div
              style={{
                fontSize: 12,
                color: T.red,
                background: `${T.red}10`,
                borderRadius: 6,
                padding: 12,
                fontFamily: T.mono,
              }}
            >
              {task.error}
            </div>
          )}
          <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 11, color: T.muted }}>
            {task.inputTokens > 0 && <span>In: {formatTokens(task.inputTokens)} tokens</span>}
            {task.outputTokens > 0 && <span>Out: {formatTokens(task.outputTokens)} tokens</span>}
            {task.deliveryMethod === "email" && (
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Mail size={10} />
                {task.deliveredAt ? "Delivered" : "Pending delivery"}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function describeCron(expr: string): string {
  if (!expr) return "";
  const parts = expr.split(" ");
  if (parts.length !== 5) return expr;
  const [min, hour, , , dow] = parts;

  if (dow !== "*") {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return `${days[Number(dow)] || dow} ${hour}:${min.padStart(2, "0")}`;
  }
  if (hour.includes(",")) {
    return `${hour.split(",").length}x daily`;
  }
  if (hour === "*" && min === "0") return "Hourly";
  if (hour !== "*") return `Daily ${hour}:${min.padStart(2, "0")}`;
  return expr;
}

// ── Manual Run Modal ─────────────────────────────────────────
function RunModal({
  agentId,
  onClose,
  onSubmit,
}: {
  agentId: string;
  onClose: () => void;
  onSubmit: (input: string, method: string) => void;
}) {
  const [input, setInput] = useState("");
  const [method, setMethod] = useState("dashboard");
  const color = AGENT_COLORS[agentId] || T.gold;
  const name = agentId.charAt(0).toUpperCase() + agentId.slice(1);

  const QUICK_PROMPTS: Record<string, string[]> = {
    scout: ["Research 5 pawn shops in Michigan", "Find used auto dealers in Detroit metro", "Profile National Pawnbrokers Association"],
    dispatch: ["Draft response to demo request from pawn shop owner", "Draft partnership inquiry response"],
    pulse: ["Run full system health check", "Check API endpoint status for all services"],
    ledger: ["Generate daily cost summary", "Estimate this month's API spend"],
    draft: ["Create investor one-pager for SimpliFaxs", "Write 3 social media posts for today", "Draft weekly content calendar"],
    market: ["Build a launch campaign for SimpliFaxs", "Generate this week's social content", "Suggest 5 TikTok video concepts"],
    maven: ["Analyze VIN: 1HGCM82633A004352", "What are red flags for a 2019 Ford F-150 title?"],
    simplicity: ["Explain GIA diamond grading scale", "Current gold spot price context and forecast"],
    sentinel: ["Run full security audit now", "Check for suspicious login attempts in the last hour", "Audit all API endpoints for exposed data", "Review OWASP Top 10 compliance status", "Scan for XSS and injection vulnerabilities"],
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: T.card,
          border: `1px solid ${color}30`,
          borderRadius: 16,
          padding: 24,
          width: "100%",
          maxWidth: 560,
          maxHeight: "80vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontFamily: T.display, fontSize: 22, color: T.ink, margin: "0 0 4px" }}>
          Run {name}
        </h2>
        <p style={{ fontSize: 12, color: T.muted, margin: "0 0 20px" }}>
          Send a task to the {name} agent for immediate execution
        </p>

        {/* Quick prompts */}
        {QUICK_PROMPTS[agentId] && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Quick prompts
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {QUICK_PROMPTS[agentId].map((p, i) => (
                <button
                  key={i}
                  onClick={() => setInput(p)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 20,
                    border: `1px solid ${T.cardBorder}`,
                    background: input === p ? `${color}15` : "transparent",
                    color: input === p ? color : T.muted,
                    fontSize: 11,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Tell ${name} what to do...`}
          rows={5}
          style={{
            width: "100%",
            background: "#0a0a12",
            border: `1px solid ${T.cardBorder}`,
            borderRadius: 8,
            padding: 12,
            color: T.ink,
            fontSize: 13,
            fontFamily: T.body,
            resize: "vertical",
            outline: "none",
            marginBottom: 12,
            boxSizing: "border-box",
          }}
        />

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {["dashboard", "email"].map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                border: `1px solid ${method === m ? color + "40" : T.cardBorder}`,
                background: method === m ? `${color}10` : "transparent",
                color: method === m ? color : T.muted,
                fontSize: 12,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {m === "email" ? <Mail size={12} /> : <Eye size={12} />}
              {m === "email" ? "Email results" : "Dashboard only"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: `1px solid ${T.cardBorder}`,
              background: "transparent",
              color: T.muted,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (input.trim()) onSubmit(input.trim(), method);
            }}
            disabled={!input.trim()}
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              border: "none",
              background: input.trim() ? color : T.cardBorder,
              color: input.trim() ? "#000" : T.muted,
              fontSize: 13,
              fontWeight: 600,
              cursor: input.trim() ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Send size={14} />
            Dispatch
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function AgentCommandCenter() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [runModalAgent, setRunModalAgent] = useState<string | null>(null);
  const [filterAgent, setFilterAgent] = useState<string | null>(null);

  // Auth check — admin only
  if (!user || user.role !== "admin") {
    return (
      <div style={{ background: T.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <Shield size={48} color={T.muted} />
          <h2 style={{ fontFamily: T.display, color: T.ink, marginTop: 16 }}>Access Restricted</h2>
          <p style={{ color: T.muted, fontSize: 14 }}>Agent Command Center requires admin access.</p>
        </div>
      </div>
    );
  }

  // Fetch agent status
  const { data: status, refetch: refetchStatus } = useQuery({
    queryKey: ["/api/agents/status"],
    queryFn: async () => {
      const res = await fetch("/api/agents/status");
      if (!res.ok) throw new Error("Failed to fetch agent status");
      return res.json();
    },
    refetchInterval: 30_000,
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["/api/agents/stats"],
    queryFn: async () => {
      const res = await fetch("/api/agents/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    refetchInterval: 60_000,
  });

  // Fetch tasks
  const { data: tasks, refetch: refetchTasks } = useQuery({
    queryKey: ["/api/agents/tasks", filterAgent],
    queryFn: async () => {
      const url = filterAgent
        ? `/api/agents/tasks?agent=${filterAgent}&limit=50`
        : "/api/agents/tasks?limit=50";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
    refetchInterval: 15_000,
  });

  // Fetch configs
  const { data: configs } = useQuery({
    queryKey: ["/api/agents/configs"],
    queryFn: async () => {
      const res = await fetch("/api/agents/configs");
      if (!res.ok) throw new Error("Failed to fetch configs");
      return res.json();
    },
  });

  // Toggle agent
  const toggleMutation = useMutation({
    mutationFn: async ({ agentId, isActive }: { agentId: string; isActive: boolean }) => {
      const res = await fetch("/api/agents/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, isActive }),
      });
      if (!res.ok) throw new Error("Toggle failed");
      return res.json();
    },
    onSuccess: () => {
      refetchStatus();
    },
  });

  // Run agent
  const runMutation = useMutation({
    mutationFn: async ({ agentId, input, deliveryMethod }: { agentId: string; input: string; deliveryMethod: string }) => {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, input, deliveryMethod }),
      });
      if (!res.ok) throw new Error("Run failed");
      return res.json();
    },
    onSuccess: () => {
      setRunModalAgent(null);
      setTimeout(() => {
        refetchTasks();
        refetchStatus();
      }, 2000);
    },
  });

  // Merge config info into agent status data
  const agents = (status?.agents || []).map((a: any) => {
    const cfg = (configs || []).find((c: any) => c.agentId === a.agentId);
    return { ...a, ...cfg, isActive: a.isActive, totalRuns: a.totalRuns, totalTokens: a.totalTokens, lastRunAt: a.lastRunAt };
  });

  const overview = stats?.overview || {};

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.ink }}>
      {/* Header */}
      <div
        style={{
          borderBottom: `1px solid ${T.cardBorder}`,
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          background: T.bg,
          zIndex: 100,
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "transparent",
              border: `1px solid ${T.cardBorder}`,
              borderRadius: 8,
              padding: 8,
              cursor: "pointer",
              color: T.muted,
              display: "flex",
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1
              style={{
                fontFamily: T.display,
                fontSize: 24,
                margin: 0,
                color: T.gold,
                letterSpacing: -0.5,
              }}
            >
              Agent Command Center
            </h1>
            <p style={{ fontSize: 12, color: T.muted, margin: "2px 0 0" }}>
              Simpleton Technologies — Autonomous Operations
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 20,
              background: status?.running ? `${T.green}15` : `${T.red}15`,
              border: `1px solid ${status?.running ? T.green : T.red}30`,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: status?.running ? T.green : T.red,
                boxShadow: `0 0 6px ${status?.running ? T.green : T.red}80`,
              }}
            />
            <span style={{ fontSize: 11, fontWeight: 600, color: status?.running ? T.green : T.red }}>
              {status?.running ? "SYSTEM ONLINE" : "OFFLINE"}
            </span>
          </div>
          <button
            onClick={() => {
              refetchStatus();
              refetchTasks();
            }}
            style={{
              background: "transparent",
              border: `1px solid ${T.cardBorder}`,
              borderRadius: 8,
              padding: 8,
              cursor: "pointer",
              color: T.muted,
              display: "flex",
            }}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }}>
        {/* Stats Bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 12,
            marginBottom: 32,
          }}
        >
          {[
            { label: "Total Tasks", value: overview.total_tasks || "0", color: T.ink },
            { label: "Completed", value: overview.completed_tasks || "0", color: T.green },
            { label: "Failed", value: overview.failed_tasks || "0", color: overview.failed_tasks > 0 ? T.red : T.muted },
            { label: "Running", value: overview.running_tasks || "0", color: overview.running_tasks > 0 ? T.blue : T.muted },
            { label: "Last 24h", value: overview.tasks_24h || "0", color: T.gold },
            { label: "Last 7d", value: overview.tasks_7d || "0", color: T.purple },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: T.card,
                border: `1px solid ${T.cardBorder}`,
                borderRadius: 10,
                padding: "14px 16px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: T.mono, color: stat.color }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Section: Agents */}
        <div style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontFamily: T.display,
              fontSize: 20,
              color: T.ink,
              margin: "0 0 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Cpu size={20} color={T.gold} />
            Agent Fleet
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {agents.map((agent: any) => (
              <AgentCard
                key={agent.agentId}
                agent={agent}
                onToggle={(id, active) => toggleMutation.mutate({ agentId: id, isActive: active })}
                onRun={(id) => setRunModalAgent(id)}
                onViewTasks={(id) => setFilterAgent(id === filterAgent ? null : id)}
              />
            ))}
          </div>
        </div>

        {/* Section: Task Feed */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <h2
              style={{
                fontFamily: T.display,
                fontSize: 20,
                color: T.ink,
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Activity size={20} color={T.gold} />
              Task Feed
              {filterAgent && (
                <span
                  style={{
                    fontSize: 12,
                    padding: "2px 10px",
                    borderRadius: 12,
                    background: (AGENT_COLORS[filterAgent] || T.gold) + "15",
                    color: AGENT_COLORS[filterAgent] || T.gold,
                    fontFamily: T.body,
                    fontWeight: 600,
                  }}
                >
                  {filterAgent}
                </span>
              )}
            </h2>
            {filterAgent && (
              <button
                onClick={() => setFilterAgent(null)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: `1px solid ${T.cardBorder}`,
                  background: "transparent",
                  color: T.muted,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Show all
              </button>
            )}
          </div>

          {(!tasks || tasks.length === 0) && (
            <div
              style={{
                textAlign: "center",
                padding: 48,
                color: T.muted,
                background: T.card,
                borderRadius: 12,
                border: `1px solid ${T.cardBorder}`,
              }}
            >
              <Bot size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
              <div style={{ fontSize: 14, fontWeight: 500 }}>No tasks yet</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                Run an agent manually or wait for the scheduler to dispatch a task
              </div>
            </div>
          )}

          {(tasks || []).map((task: any) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </div>
      </div>

      {/* Run Modal */}
      {runModalAgent && (
        <RunModal
          agentId={runModalAgent}
          onClose={() => setRunModalAgent(null)}
          onSubmit={(input, method) => {
            runMutation.mutate({
              agentId: runModalAgent,
              input,
              deliveryMethod: method,
            });
          }}
        />
      )}
    </div>
  );
}
