import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import {
  Send, X, Loader2, Camera, ImagePlus, ChevronDown, ChevronUp, Printer,
  Volume2, VolumeX, Square, ThumbsUp, ThumbsDown, Sparkles,
  Brain, TrendingUp, Calculator, Gem, Watch, Clock, ArrowLeft, MessageSquarePlus
} from "lucide-react";
import { BrainProcessing, TypingIndicator } from "@/components/ui/loading-animations";
import { useVoicePreference } from "@/hooks/use-voice-preference";
import { playSimplicityVoice, stopSimplicityVoice } from "@/lib/simplicity-voice";
import { playSimplicityDing } from "@/lib/simplicity-ding";
import { useBrain, buildBrainSystemContext } from "@/lib/brain-context";
import { ProseRenderer } from "@/components/ui/prose-renderer";

// ───────────────────────────────────────────────────────────────────────
//  Design tokens — shared editorial luxury language
// ───────────────────────────────────────────────────────────────────────
const T = {
  bg: '#0b0b12',
  bgGlass: 'rgba(11,11,18,0.92)',
  ink: '#f4efe2',
  inkMuted: '#9a937f',
  gold: '#c9a84c',
  goldDeep: '#a8873a',
  goldGlow: 'rgba(201,168,76,0.25)',
  goldBubble: 'rgba(201,168,76,0.10)',
  assistBubble: 'rgba(244,239,226,0.05)',
  hairline: 'rgba(244,239,226,0.12)',
  danger: '#d96d5e',
  success: '#6ec29a',
  display: '"Playfair Display", Georgia, serif',
  body: '"Inter", -apple-system, system-ui, sans-serif',
  serif: '"EB Garamond", "Playfair Display", Georgia, serif',
};

// ───────────────────────────────────────────────────────────────────────
//  Types & helpers (unchanged logic)
// ───────────────────────────────────────────────────────────────────────
interface BrainMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  imageUrl?: string;
  streaming?: boolean;
  metadata?: {
    providers?: string[];
    confidence?: number;
    processingTime?: number;
    appraisalType?: string;
    toolsUsed?: string[];
  };
}

interface ItemDetails {
  weight: string; karat: string; clarity: string; color: string;
  cut: string; caratWeight: string; condition: string; brand: string;
  model: string; year: string; certification: string; other: string;
}

const emptyDetails: ItemDetails = {
  weight: "", karat: "", clarity: "", color: "", cut: "",
  caratWeight: "", condition: "", brand: "", model: "",
  year: "", certification: "", other: ""
};

const PAGE_QUICK_ACTIONS: Record<string, { text: string; icon: any }[]> = {
  "/diamonds": [
    { text: "Explain the 4Cs of diamond grading", icon: Gem },
    { text: "How do lab-grown diamonds compare to natural?", icon: Gem },
  ],
  "/diamond-calculator": [
    { text: "How do I calculate diamond value?", icon: Calculator },
    { text: "Why do prices jump at 1 carat?", icon: TrendingUp },
  ],
  "/watches": [
    { text: "How do I identify a Rolex model?", icon: Watch },
    { text: "Which Rolex models appreciate most?", icon: TrendingUp },
  ],
  "/calculator": [
    { text: "How to convert troy ounces to grams?", icon: Calculator },
    { text: "What's the melt value of 14K gold?", icon: Calculator },
  ],
  "/database": [
    { text: "What makes a Morgan Dollar valuable?", icon: Sparkles },
    { text: "Explain the Sheldon grading scale", icon: Sparkles },
  ],
  "/simpletons-list": [
    { text: "How do I know if a dealer is trustworthy?", icon: Sparkles },
    { text: "What should I look for in a pawn shop?", icon: Sparkles },
  ],
};

const DEFAULT_QUICK_ACTIONS = [
  { text: "What's the difference between 14K and 18K gold?", icon: Sparkles },
  { text: "How are diamonds graded?", icon: Gem },
  { text: "Tell me about Morgan Silver Dollars", icon: Sparkles },
];

function formatDateLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - msgDay.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString("en-US", { weekday: "long" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: now.getFullYear() !== date.getFullYear() ? "numeric" : undefined });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function getSessionToken(): string {
  const key = "simplicity_session_token";
  let token = localStorage.getItem(key);
  if (!token) {
    token = "sv_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 10);
    localStorage.setItem(key, token);
  }
  return token;
}

function compressImage(dataUrl: string, maxWidth = 1200, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let w = img.width;
      let h = img.height;
      if (w > maxWidth) { h = (maxWidth / w) * h; w = maxWidth; }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// ───────────────────────────────────────────────────────────────────────
//  Small reusable UI atoms
// ───────────────────────────────────────────────────────────────────────
function IconBtn({ onClick, title, children, active, style: extraStyle }: {
  onClick: () => void; title?: string; children: React.ReactNode; active?: boolean; style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 28, height: 28, borderRadius: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: active ? T.gold : T.inkMuted,
        transition: 'color 0.2s',
        ...extraStyle,
      }}
      onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = T.gold; }}
      onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = active ? T.gold : T.inkMuted; }}
    >
      {children}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  BrainPanel — the main chat UI
// ═══════════════════════════════════════════════════════════════════════
export function BrainPanel() {
  const { isOpen, closeBrain, awareness, prefilledMessage, setPrefilledMessage } = useBrain();
  const [location] = useLocation();
  const [input, setInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [itemDetails, setItemDetails] = useState<ItemDetails>(emptyDetails);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [view, setView] = useState<"chat" | "history">("chat");
  const [allHistory, setAllHistory] = useState<BrainMessage[]>([]);
  const [viewingDate, setViewingDate] = useState<string | null>(null);
  const [savedChat, setSavedChat] = useState<BrainMessage[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionTokenRef = useRef<string>(getSessionToken());
  const abortRef = useRef<AbortController | null>(null);
  const { voiceEnabled, setVoiceEnabled } = useVoicePreference();
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, "up" | "down">>({});

  const defaultGreeting: BrainMessage = {
    id: "1",
    type: "assistant",
    content: "Good day. I'm Simplicity, your personal market analyst for precious metals, diamonds, luxury watches, and coins.\n\nUpload a photograph for an instant appraisal, or ask me anything — I can see what you're working on.",
    timestamp: new Date(),
  };

  const [messages, setMessages] = useState<BrainMessage[]>([defaultGreeting]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);
  useEffect(() => {
    if (prefilledMessage && isOpen) { setInput(prefilledMessage); setPrefilledMessage(""); }
  }, [prefilledMessage, isOpen, setPrefilledMessage]);

  const loadSession = useCallback(async () => {
    if (historyLoaded) return;
    setIsLoadingHistory(true);
    try {
      const response = await fetch("/api/assistant/session", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken: sessionTokenRef.current, page: location }),
      });
      if (!response.ok) return;
      const data = await response.json();
      if (data.isReturning && data.history && data.history.length > 0) {
        const loaded: BrainMessage[] = data.history.map((m: any) => ({
          id: m.id, type: m.type, content: m.content,
          timestamp: new Date(m.timestamp), metadata: m.metadata || undefined,
        }));
        setAllHistory(loaded);
        setMessages([defaultGreeting]);
      }
    } catch {} finally { setHistoryLoaded(true); setIsLoadingHistory(false); }
  }, [historyLoaded, location]);

  useEffect(() => { if (isOpen && !historyLoaded) loadSession(); }, [isOpen, historyLoaded, loadSession]);

  const handleSpeak = useCallback((message: BrainMessage) => {
    if (speakingMessageId === message.id) { stopSimplicityVoice(); setSpeakingMessageId(null); return; }
    stopSimplicityVoice();
    setSpeakingMessageId(message.id);
    playSimplicityVoice(message.content, {
      volume: 0.85, rate: 0.95, pitch: 1.1,
      onEnd: () => setSpeakingMessageId(null), onError: () => setSpeakingMessageId(null),
    });
  }, [speakingMessageId]);

  const handleImageSelect = (file: File) => {
    if (file.size > 20 * 1024 * 1024) { alert("Image must be under 20MB"); return; }
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => { setImagePreview(null); setShowDetails(false); setItemDetails(emptyDetails); };
  const hasDetails = Object.values(itemDetails).some((v) => v.trim() !== "");

  // ── Streaming text chat ──
  const sendStreamingMessage = async (userText: string) => {
    setIsLoading(true);
    const assistantId = Date.now().toString() + "_a";
    setMessages((prev) => [...prev, { id: assistantId, type: "assistant", content: "", timestamp: new Date(), streaming: true }]);

    try {
      const appContext = buildBrainSystemContext(awareness);
      const controller = new AbortController();
      abortRef.current = controller;
      const response = await fetch("/api/assistant/help", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, context: "full_expert", sessionToken: sessionTokenRef.current, pageContext: location, appContext, stream: true }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("text/event-stream") || contentType.includes("text/plain")) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.token) {
                    accumulated += parsed.token;
                    setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m)));
                  }
                  if (parsed.metadata) {
                    setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, streaming: false, metadata: parsed.metadata } : m));
                  }
                } catch {
                  accumulated += data;
                  setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m)));
                }
              }
            }
          }
        }
        if (accumulated) {
          setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: accumulated, streaming: false } : m));
        }
      } else {
        const data = await response.json();
        setMessages((prev) => prev.map((m) =>
          m.id === assistantId ? { ...m, content: data.response || "I received your message but couldn't generate a response.", streaming: false, metadata: { providers: data.activeProviders || [], confidence: data.confidenceScore || 0, processingTime: data.processingTime || 0, toolsUsed: data.toolsUsed || [] } } : m
        ));
      }
      playSimplicityDing();
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: "I'm having trouble connecting right now. Please try again in a moment.", streaming: false } : m));
    } finally { setIsLoading(false); abortRef.current = null; }
  };

  // ── Image appraisal ──
  const sendAppraisal = async () => {
    if (!imagePreview || isLoading) return;
    setIsLoading(true);
    const detailsSummary = hasDetails ? "\n\nItem Details: " + Object.entries(itemDetails).filter(([, v]) => v.trim()).map(([k, v]) => `${k}: ${v}`).join(", ") : "";
    const userMsg: BrainMessage = { id: Date.now().toString(), type: "user", content: (input.trim() || "Please appraise this item") + detailsSummary, timestamp: new Date(), imageUrl: imagePreview };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const compressed = await compressImage(imagePreview);
      const response = await fetch("/api/assistant/appraise", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: compressed, message: input.trim() || "", itemDetails: hasDetails ? itemDetails : undefined, sessionToken: sessionTokenRef.current, pageContext: location, appContext: buildBrainSystemContext(awareness) }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(), type: "assistant", content: data.response || "I couldn't generate an appraisal. Please try with a clearer image.", timestamp: new Date(),
        metadata: { providers: data.activeProviders || [], confidence: data.confidenceScore || 0, processingTime: data.processingTime || 0, appraisalType: "Professional AI Appraisal" },
      }]);
      playSimplicityDing();
    } catch {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), type: "assistant", content: "I'm having trouble analyzing your image right now. Please try again.", timestamp: new Date() }]);
    } finally { setIsLoading(false); clearImage(); setInput(""); }
  };

  const handleSend = () => {
    if (isLoading) return;
    if (imagePreview) { sendAppraisal(); return; }
    if (!input.trim()) return;
    const userMsg: BrainMessage = { id: Date.now().toString(), type: "user", content: input.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    sendStreamingMessage(input.trim());
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const handlePrintAppraisal = (message: BrainMessage) => {
    const userImg = messages.find((m) => m.type === "user" && m.imageUrl && messages.indexOf(m) < messages.indexOf(message));
    const imageHtml = userImg?.imageUrl ? `<div style="text-align:center;margin-bottom:20px;"><img src="${userImg.imageUrl}" style="max-width:300px;border-radius:8px;border:2px solid #c9a84c;" /></div>` : "";
    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Simpleton - Appraisal Report</title>
<style>body{font-family:Georgia,serif;max-width:700px;margin:0 auto;padding:40px 30px;color:#1a1a1a;line-height:1.6}.header{text-align:center;border-bottom:3px double #c9a84c;padding-bottom:20px;margin-bottom:30px}.header h1{font-size:24px;color:#c9a84c;margin:0 0 4px;letter-spacing:1px}.report-body{white-space:pre-wrap;font-size:14px;line-height:1.8}.footer{margin-top:40px;padding-top:16px;border-top:2px solid #e5e7eb;text-align:center;font-size:11px;color:#9ca3af}.print-btn{display:block;margin:0 auto 30px;padding:10px 32px;background:#c9a84c;color:#0b0b12;border:none;font-size:15px;cursor:pointer;font-family:"Playfair Display",Georgia,serif;letter-spacing:0.1em;text-transform:uppercase}@media print{.print-btn{display:none}}</style></head><body>
<button class="print-btn" onclick="window.print()">Print Report</button>
<div class="header"><h1>SIMPLETON&trade;</h1><p style="font-size:13px;color:#6b7280;font-style:italic">Professional AI Appraisal Report</p>
<p style="font-size:12px;color:#9ca3af;">${new Date(message.timestamp).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p></div>
${imageHtml}
<div class="report-body">${message.content}</div>
<div class="footer"><p style="color:#c9a84c;font-weight:bold;">Simpleton&trade; &mdash; Precision Pricing, Simplified</p>
<p>For informational purposes only. Professional authentication recommended for all transactions.</p></div></body></html>`);
    printWindow.document.close();
  };

  const sendFeedback = async (messageId: string, rating: 1 | -1) => {
    setFeedbackGiven((prev) => ({ ...prev, [messageId]: rating === 1 ? "up" : "down" }));
    try { await fetch("/api/simplicity/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messageId: parseInt(messageId) || null, rating, feedbackType: "thumbs" }) }); } catch {}
  };

  const handleOpenHistory = () => {
    setSavedChat(messages);
    const currentNonDefault = messages.filter(m => m.id !== "1");
    if (currentNonDefault.length > 0) {
      setAllHistory(prev => { const existingIds = new Set(prev.map(m => m.id)); const newMsgs = currentNonDefault.filter(m => !existingIds.has(m.id)); return [...prev, ...newMsgs]; });
    }
    setView("history");
  };

  const handleBackFromHistory = () => { setView("chat"); setViewingDate(null); if (savedChat) { setMessages(savedChat); setSavedChat(null); } };
  const handleNewChat = () => { setView("chat"); setViewingDate(null); setSavedChat(null); setMessages([defaultGreeting]); };
  const handleViewHistoryDate = (dateKey: string) => {
    const dateMessages = allHistory.filter((m) => getDateKey(m.timestamp) === dateKey);
    setViewingDate(dateKey);
    setView("chat");
    setMessages(dateMessages);
  };

  const groupedHistory = (() => {
    const groups: { dateKey: string; label: string; messages: BrainMessage[]; firstTime: Date; lastTime: Date; preview: string; count: number }[] = [];
    const dateMap = new Map<string, BrainMessage[]>();
    for (const msg of allHistory) { const key = getDateKey(msg.timestamp); if (!dateMap.has(key)) dateMap.set(key, []); dateMap.get(key)!.push(msg); }
    const sortedKeys = Array.from(dateMap.keys()).sort((a, b) => { const [ay, am, ad] = a.split("-").map(Number); const [by, bm, bd] = b.split("-").map(Number); return new Date(by, bm, bd).getTime() - new Date(ay, am, ad).getTime(); });
    for (const key of sortedKeys) {
      const msgs = dateMap.get(key)!;
      const firstUserMsg = msgs.find((m) => m.type === "user");
      const preview = firstUserMsg ? firstUserMsg.content.slice(0, 80) + (firstUserMsg.content.length > 80 ? "..." : "") : msgs[0].content.slice(0, 80) + (msgs[0].content.length > 80 ? "..." : "");
      groups.push({ dateKey: key, label: formatDateLabel(msgs[0].timestamp), messages: msgs, firstTime: msgs[0].timestamp, lastTime: msgs[msgs.length - 1].timestamp, preview, count: msgs.length });
    }
    return groups;
  })();

  const quickActions = PAGE_QUICK_ACTIONS[location] || DEFAULT_QUICK_ACTIONS;

  const contextStripText = () => {
    const parts: string[] = [];
    if (awareness.calculator?.selectedMetal) parts.push(`${awareness.calculator.selectedKarat || ""}K ${awareness.calculator.selectedMetal}`);
    if (awareness.market?.goldPrice) parts.push(`Gold $${awareness.market.goldPrice.toFixed(0)}/oz`);
    if (awareness.directory?.viewingBusiness) parts.push(`Viewing: ${awareness.directory.viewingBusiness.name}`);
    if (awareness.database?.viewingCoin) parts.push(`Coin: ${awareness.database.viewingCoin.name}`);
    return parts.length > 0 ? parts.join(" · ") : null;
  };

  if (!isOpen) return null;
  const contextStrip = contextStripText();

  // ═══════════════════════════════════════════════════════════════════
  //  RENDER — Premium editorial chat UI
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div style={{
      position: 'fixed', bottom: 16, right: 16, zIndex: 9999,
      width: 400, maxWidth: 'calc(100vw - 2rem)',
      maxHeight: 'min(700px, calc(100vh - 6rem))',
      display: 'flex', flexDirection: 'column',
      background: T.bg,
      border: `1px solid ${T.hairline}`,
      borderRadius: 4,
      boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 4px 20px rgba(0,0,0,0.3)',
      fontFamily: T.body,
      overflow: 'hidden',
    }}>

      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px',
        background: T.bgGlass,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${T.gold}33`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {(view === "history" || viewingDate) ? (
            <IconBtn onClick={() => { if (viewingDate) { setView("history"); setViewingDate(null); } else { handleBackFromHistory(); } }}>
              <ArrowLeft size={15} />
            </IconBtn>
          ) : (
            <span style={{ fontFamily: T.display, fontSize: 20, fontStyle: 'italic', color: T.gold, lineHeight: 1 }}>S</span>
          )}
          <span style={{ fontFamily: T.display, fontSize: 15, fontWeight: 500, color: T.ink, letterSpacing: '0.02em' }}>
            {view === "history" ? "History" : viewingDate ? formatDateLabel(new Date(allHistory.find(m => getDateKey(m.timestamp) === viewingDate)?.timestamp || new Date())) : (
              <><span style={{ fontStyle: 'italic', color: T.gold }}>Simplicity</span></>
            )}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {view === "chat" && !viewingDate && (
            <IconBtn onClick={handleOpenHistory} title="History"><Clock size={14} /></IconBtn>
          )}
          <IconBtn onClick={() => setVoiceEnabled(!voiceEnabled)} active={voiceEnabled}>
            {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </IconBtn>
          <IconBtn onClick={closeBrain}><X size={15} /></IconBtn>
        </div>
      </div>

      {/* ── CONTEXT STRIP ── */}
      {contextStrip && (
        <div style={{
          padding: '6px 18px',
          background: 'rgba(201,168,76,0.04)',
          borderBottom: `1px solid ${T.hairline}`,
          fontSize: 11, color: T.gold,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Sparkles size={11} color={T.gold} style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contextStrip}</span>
        </div>
      )}

      {/* ── HISTORY VIEW ── */}
      {view === "history" && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', minHeight: 0, scrollbarWidth: 'thin', scrollbarColor: `${T.hairline} transparent` }}>
          <button
            onClick={handleNewChat}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px', marginBottom: 14,
              background: 'rgba(201,168,76,0.06)', border: `1px solid ${T.gold}44`,
              borderRadius: 3, cursor: 'pointer',
              fontFamily: T.display, fontSize: 13, fontStyle: 'italic',
              color: T.gold, transition: 'all 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.12)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.06)'; }}
          >
            <MessageSquarePlus size={15} />
            New conversation
          </button>

          {isLoadingHistory && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 0' }}>
              <Loader2 size={18} color={T.gold} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ marginLeft: 10, fontSize: 12, color: T.inkMuted }}>Loading history...</span>
            </div>
          )}
          {groupedHistory.length === 0 && !isLoadingHistory && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <Clock size={28} color={T.hairline} style={{ margin: '0 auto 10px', display: 'block' }} />
              <div style={{ fontSize: 13, color: T.inkMuted }}>No conversations yet</div>
              <div style={{ fontSize: 11, color: T.hairline, marginTop: 4, fontStyle: 'italic', fontFamily: T.serif }}>
                Your dialogue with Simplicity will be remembered here
              </div>
            </div>
          )}
          {groupedHistory.map((group) => {
            const userMsgCount = group.messages.filter(m => m.type === "user").length;
            return (
              <button key={group.dateKey} onClick={() => handleViewHistoryDate(group.dateKey)}
                style={{
                  width: '100%', textAlign: 'left', padding: '14px 16px', marginBottom: 8,
                  background: 'rgba(244,239,226,0.02)', border: `1px solid ${T.hairline}`,
                  borderLeft: `2px solid ${T.gold}33`,
                  borderRadius: 3, cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.borderLeftColor = T.gold; e.currentTarget.style.background = 'rgba(244,239,226,0.04)'; }}
                onMouseOut={e => { e.currentTarget.style.borderLeftColor = `${T.gold}33`; e.currentTarget.style.background = 'rgba(244,239,226,0.02)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: T.display, fontSize: 12, fontStyle: 'italic', color: T.gold }}>{group.label}</span>
                  <span style={{ fontSize: 10, color: T.inkMuted }}>{formatTime(group.firstTime)} — {formatTime(group.lastTime)}</span>
                </div>
                <div style={{ fontSize: 12, color: T.ink, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{group.preview}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 6, fontSize: 10, color: T.inkMuted }}>
                  <span>{userMsgCount} {userMsgCount === 1 ? "question" : "questions"}</span>
                  <span style={{ color: T.hairline }}>·</span>
                  <span>{group.count} messages</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── CHAT MESSAGE AREA ── */}
      {view === "chat" && (
        <div style={{
          flex: 1, overflowY: 'auto', padding: '14px 16px',
          minHeight: 0, display: 'flex', flexDirection: 'column', gap: 12,
          scrollbarWidth: 'thin', scrollbarColor: `${T.hairline} transparent`,
        }}>
          {isLoadingHistory && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 0' }}>
              <Loader2 size={18} color={T.gold} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ marginLeft: 10, fontSize: 12, color: T.inkMuted }}>Loading...</span>
            </div>
          )}

          {messages.map((msg, idx) => {
            const prevMsg = messages[idx - 1];
            const showDateSep = !prevMsg || getDateKey(msg.timestamp) !== getDateKey(prevMsg.timestamp);
            const isUser = msg.type === "user";
            const isGreeting = msg.id === "1";

            return (
              <div key={msg.id}>
                {showDateSep && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                    <div style={{ flex: 1, height: 0.5, background: T.hairline }} />
                    <span style={{ fontSize: 9, color: T.gold, fontFamily: T.display, fontStyle: 'italic', letterSpacing: '0.08em' }}>
                      {formatDateLabel(msg.timestamp)}
                    </span>
                    <div style={{ flex: 1, height: 0.5, background: T.hairline }} />
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '88%' }}>
                    <div style={{
                      borderRadius: isUser ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                      padding: '12px 16px',
                      background: isUser ? T.goldBubble : T.assistBubble,
                      border: `1px solid ${isUser ? T.gold + '22' : T.hairline}`,
                      color: T.ink,
                      fontSize: 13,
                      lineHeight: 1.6,
                    }}>
                      {msg.imageUrl && (
                        <img src={msg.imageUrl} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 6, marginBottom: 10, border: `1px solid ${T.hairline}` }} />
                      )}

                      {msg.type === "assistant" && msg.streaming && !msg.content ? (
                        <TypingIndicator />
                      ) : msg.type === "assistant" ? (
                        <div style={isGreeting ? { fontFamily: T.serif, fontStyle: 'italic', fontSize: 13.5, lineHeight: 1.7 } : {}}>
                          <ProseRenderer content={msg.content} className="text-sm" />
                        </div>
                      ) : (
                        <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{msg.content}</p>
                      )}

                      {/* Feedback actions */}
                      {msg.type === "assistant" && msg.id !== "1" && !msg.streaming && msg.content && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 10, paddingTop: 8, borderTop: `1px solid ${T.hairline}` }}>
                          <IconBtn onClick={() => sendFeedback(msg.id, 1)} active={feedbackGiven[msg.id] === "up"}
                            style={{ color: feedbackGiven[msg.id] === "up" ? T.success : T.inkMuted, width: 24, height: 24 }}>
                            <ThumbsUp size={12} />
                          </IconBtn>
                          <IconBtn onClick={() => sendFeedback(msg.id, -1)} active={feedbackGiven[msg.id] === "down"}
                            style={{ color: feedbackGiven[msg.id] === "down" ? T.danger : T.inkMuted, width: 24, height: 24 }}>
                            <ThumbsDown size={12} />
                          </IconBtn>
                          {voiceEnabled && (
                            <IconBtn onClick={() => handleSpeak(msg)} active={speakingMessageId === msg.id}
                              style={{ width: 24, height: 24 }}>
                              {speakingMessageId === msg.id ? <Square size={12} /> : <Volume2 size={12} />}
                            </IconBtn>
                          )}
                          {msg.metadata?.appraisalType && (
                            <IconBtn onClick={() => handlePrintAppraisal(msg)} style={{ marginLeft: 'auto', width: 24, height: 24 }}>
                              <Printer size={12} />
                            </IconBtn>
                          )}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: 9, color: T.inkMuted, marginTop: 3, textAlign: isUser ? 'right' : 'left', fontFamily: T.body }}>
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && !messages.some((m) => m.streaming) && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ background: T.assistBubble, borderRadius: '12px 12px 12px 3px', padding: '12px 16px', border: `1px solid ${T.hairline}` }}>
                <TypingIndicator />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* ── QUICK ACTIONS ── */}
      {view === "chat" && messages.length <= 2 && !imagePreview && !isLoading && !viewingDate && (
        <div style={{ padding: '0 16px 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {quickActions.slice(0, 3).map((action, i) => (
            <button key={i}
              onClick={() => {
                const userMsg: BrainMessage = { id: Date.now().toString(), type: "user", content: action.text, timestamp: new Date() };
                setMessages((prev) => [...prev, userMsg]);
                sendStreamingMessage(action.text);
              }}
              style={{
                fontSize: 11, fontFamily: T.serif, fontStyle: 'italic',
                background: 'transparent', border: `1px solid ${T.hairline}`,
                color: T.inkMuted, padding: '6px 14px', borderRadius: 20,
                cursor: 'pointer', transition: 'all 0.2s',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%',
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.color = T.gold; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = T.hairline; e.currentTarget.style.color = T.inkMuted; }}
            >
              {action.text}
            </button>
          ))}
        </div>
      )}

      {/* ── IMAGE PREVIEW ── */}
      {view === "chat" && imagePreview && (
        <div style={{ padding: '0 16px 10px' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img src={imagePreview} alt="Preview" style={{ maxHeight: 72, borderRadius: 4, border: `1px solid ${T.hairline}` }} />
            <button onClick={clearImage} style={{
              position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%',
              background: T.danger, border: 'none', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 10,
            }}>
              <X size={11} />
            </button>
          </div>
          <button onClick={() => setShowDetails(!showDetails)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, marginTop: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 11, color: T.gold, fontFamily: T.serif, fontStyle: 'italic',
            }}>
            {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showDetails ? "Hide details" : "Add details for a better appraisal"}
          </button>
          {showDetails && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8 }}>
              {(["weight", "karat", "condition", "brand", "model", "year"] as (keyof ItemDetails)[]).map((key) => (
                <input key={key} placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={itemDetails[key]} onChange={(e) => setItemDetails((prev) => ({ ...prev, [key]: e.target.value }))}
                  style={{
                    height: 28, fontSize: 11, padding: '0 10px',
                    background: 'rgba(244,239,226,0.04)', border: `1px solid ${T.hairline}`,
                    borderRadius: 2, color: T.ink, fontFamily: T.body,
                    outline: 'none',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = T.gold; }}
                  onBlur={e => { e.currentTarget.style.borderColor = T.hairline; }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── INPUT BAR ── */}
      {view === "chat" && (
        <div style={{
          padding: '12px 16px',
          borderTop: `1px solid ${T.hairline}`,
          background: T.bgGlass,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageSelect(file); e.target.value = ""; }} />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
            onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageSelect(file); e.target.value = ""; }} />

          <IconBtn onClick={() => cameraInputRef.current?.click()} title="Take photo"><Camera size={16} /></IconBtn>
          <IconBtn onClick={() => fileInputRef.current?.click()} title="Upload image"><ImagePlus size={16} /></IconBtn>

          <input
            value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyPress}
            placeholder={imagePreview ? "Describe the item..." : "Ask Simplicity anything..."}
            disabled={isLoading}
            style={{
              flex: 1, height: 36, fontSize: 13,
              background: 'rgba(244,239,226,0.04)',
              border: `1px solid ${T.hairline}`,
              borderRadius: 2, color: T.ink,
              padding: '0 14px',
              fontFamily: T.body,
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = T.gold; }}
            onBlur={e => { e.currentTarget.style.borderColor = T.hairline; }}
          />

          <button onClick={handleSend} disabled={isLoading && !abortRef.current}
            style={{
              width: 36, height: 36, borderRadius: 2, flexShrink: 0,
              background: T.gold, border: `1px solid ${T.gold}`,
              color: '#0b0b12', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: isLoading ? 'default' : 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => { if (!isLoading) e.currentTarget.style.background = T.goldDeep; }}
            onMouseOut={e => { e.currentTarget.style.background = T.gold; }}
          >
            {isLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
          </button>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
