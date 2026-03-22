import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
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
  weight: string;
  karat: string;
  clarity: string;
  color: string;
  cut: string;
  caratWeight: string;
  condition: string;
  brand: string;
  model: string;
  year: string;
  certification: string;
  other: string;
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
      if (w > maxWidth) {
        h = (maxWidth / w) * h;
        w = maxWidth;
      }
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
    content: "Hi! I'm Simplicity, your expert AI assistant for precious metals, coins, diamonds, and luxury watches.\n\nUpload a photo for an instant appraisal, or ask me anything. I can see what you're working on and help in real time.",
    timestamp: new Date(),
  };

  const [messages, setMessages] = useState<BrainMessage[]>([defaultGreeting]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (prefilledMessage && isOpen) {
      setInput(prefilledMessage);
      setPrefilledMessage("");
    }
  }, [prefilledMessage, isOpen, setPrefilledMessage]);

  const loadSession = useCallback(async () => {
    if (historyLoaded) return;
    setIsLoadingHistory(true);
    try {
      const response = await fetch("/api/assistant/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken: sessionTokenRef.current, page: location }),
      });
      if (!response.ok) return;
      const data = await response.json();
      if (data.isReturning && data.history && data.history.length > 0) {
        const loaded: BrainMessage[] = data.history.map((m: any) => ({
          id: m.id,
          type: m.type,
          content: m.content,
          timestamp: new Date(m.timestamp),
          metadata: m.metadata || undefined,
        }));
        setAllHistory(loaded);
        setMessages([defaultGreeting]);
      }
    } catch {
    } finally {
      setHistoryLoaded(true);
      setIsLoadingHistory(false);
    }
  }, [historyLoaded, location]);

  useEffect(() => {
    if (isOpen && !historyLoaded) loadSession();
  }, [isOpen, historyLoaded, loadSession]);

  const handleSpeak = useCallback((message: BrainMessage) => {
    if (speakingMessageId === message.id) {
      stopSimplicityVoice();
      setSpeakingMessageId(null);
      return;
    }
    stopSimplicityVoice();
    setSpeakingMessageId(message.id);
    playSimplicityVoice(message.content, {
      volume: 0.85,
      rate: 0.95,
      pitch: 1.1,
      onEnd: () => setSpeakingMessageId(null),
      onError: () => setSpeakingMessageId(null),
    });
  }, [speakingMessageId]);

  const handleImageSelect = (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      alert("Image must be under 20MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    setShowDetails(false);
    setItemDetails(emptyDetails);
  };

  const hasDetails = Object.values(itemDetails).some((v) => v.trim() !== "");

  const sendStreamingMessage = async (userText: string) => {
    setIsLoading(true);
    const assistantId = Date.now().toString() + "_a";

    setMessages((prev) => [
      ...prev,
      { id: assistantId, type: "assistant", content: "", timestamp: new Date(), streaming: true },
    ]);

    try {
      const appContext = buildBrainSystemContext(awareness);
      const controller = new AbortController();
      abortRef.current = controller;

      const response = await fetch("/api/assistant/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          context: "full_expert",
          sessionToken: sessionTokenRef.current,
          pageContext: location,
          appContext,
          stream: true,
        }),
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
                    setMessages((prev) =>
                      prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m))
                    );
                  }
                  if (parsed.metadata) {
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === assistantId
                          ? { ...m, streaming: false, metadata: parsed.metadata }
                          : m
                      )
                    );
                  }
                } catch {
                  accumulated += data;
                  setMessages((prev) =>
                    prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m))
                  );
                }
              }
            }
          }
        }

        if (accumulated) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: accumulated, streaming: false } : m
            )
          );
        }
      } else {
        const data = await response.json();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: data.response || "I received your message but couldn't generate a response.",
                  streaming: false,
                  metadata: {
                    providers: data.activeProviders || [],
                    confidence: data.confidenceScore || 0,
                    processingTime: data.processingTime || 0,
                    toolsUsed: data.toolsUsed || [],
                  },
                }
              : m
          )
        );
      }
      playSimplicityDing();
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: "I'm having trouble connecting right now. Please try again in a moment.",
                streaming: false,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const sendAppraisal = async () => {
    if (!imagePreview || isLoading) return;
    setIsLoading(true);
    const detailsSummary = hasDetails
      ? "\n\nItem Details: " +
        Object.entries(itemDetails)
          .filter(([, v]) => v.trim())
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")
      : "";

    const userMsg: BrainMessage = {
      id: Date.now().toString(),
      type: "user",
      content: (input.trim() || "Please appraise this item") + detailsSummary,
      timestamp: new Date(),
      imageUrl: imagePreview,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const compressed = await compressImage(imagePreview);
      const response = await fetch("/api/assistant/appraise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: compressed,
          message: input.trim() || "",
          itemDetails: hasDetails ? itemDetails : undefined,
          sessionToken: sessionTokenRef.current,
          pageContext: location,
          appContext: buildBrainSystemContext(awareness),
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: data.response || "I couldn't generate an appraisal. Please try with a clearer image.",
          timestamp: new Date(),
          metadata: {
            providers: data.activeProviders || [],
            confidence: data.confidenceScore || 0,
            processingTime: data.processingTime || 0,
            appraisalType: "Professional AI Appraisal",
          },
        },
      ]);
      playSimplicityDing();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: "I'm having trouble analyzing your image right now. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      clearImage();
      setInput("");
    }
  };

  const handleSend = () => {
    if (isLoading) return;
    if (imagePreview) {
      sendAppraisal();
      return;
    }
    if (!input.trim()) return;
    const userMsg: BrainMessage = {
      id: Date.now().toString(),
      type: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    sendStreamingMessage(input.trim());
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePrintAppraisal = (message: BrainMessage) => {
    const userImg = messages.find(
      (m) => m.type === "user" && m.imageUrl && messages.indexOf(m) < messages.indexOf(message)
    );
    const imageHtml = userImg?.imageUrl
      ? `<div style="text-align:center;margin-bottom:20px;"><img src="${userImg.imageUrl}" style="max-width:300px;border-radius:8px;border:2px solid #2E5090;" /></div>`
      : "";

    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Simpleton - Appraisal Report</title>
<style>
  body { font-family: Georgia, serif; max-width: 700px; margin: 0 auto; padding: 40px 30px; color: #1a1a1a; line-height: 1.6; }
  .header { text-align: center; border-bottom: 3px double #2E5090; padding-bottom: 20px; margin-bottom: 30px; }
  .header h1 { font-size: 24px; color: #2E5090; margin: 0 0 4px; letter-spacing: 1px; }
  .report-body { white-space: pre-wrap; font-size: 14px; line-height: 1.8; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 2px solid #e5e7eb; text-align: center; font-size: 11px; color: #9ca3af; }
  .print-btn { display: block; margin: 0 auto 30px; padding: 10px 32px; background: #2E5090; color: white; border: none; border-radius: 8px; font-size: 15px; cursor: pointer; }
  @media print { .print-btn { display: none; } }
</style></head><body>
<button class="print-btn" onclick="window.print()">Print Report</button>
<div class="header"><h1>SIMPLETON&trade;</h1><p style="font-size:13px;color:#6b7280;">Professional AI Appraisal Report</p>
<p style="font-size:12px;color:#9ca3af;">${new Date(message.timestamp).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p></div>
${imageHtml}
<div class="report-body">${message.content}</div>
<div class="footer"><p style="color:#2E5090;font-weight:bold;">Simpleton&trade; &mdash; Precision Pricing, Simplified</p>
<p>For informational purposes only. Professional authentication recommended for all transactions.</p></div></body></html>`);
    printWindow.document.close();
  };

  const sendFeedback = async (messageId: string, rating: 1 | -1) => {
    setFeedbackGiven((prev) => ({ ...prev, [messageId]: rating === 1 ? "up" : "down" }));
    try {
      await fetch("/api/simplicity/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: parseInt(messageId) || null, rating, feedbackType: "thumbs" }),
      });
    } catch {}
  };

  const handleOpenHistory = () => {
    setSavedChat(messages);
    const currentNonDefault = messages.filter(m => m.id !== "1");
    if (currentNonDefault.length > 0) {
      setAllHistory(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newMsgs = currentNonDefault.filter(m => !existingIds.has(m.id));
        return [...prev, ...newMsgs];
      });
    }
    setView("history");
  };

  const handleBackFromHistory = () => {
    setView("chat");
    setViewingDate(null);
    if (savedChat) {
      setMessages(savedChat);
      setSavedChat(null);
    }
  };

  const handleNewChat = () => {
    setView("chat");
    setViewingDate(null);
    setSavedChat(null);
    setMessages([defaultGreeting]);
  };

  const handleViewHistoryDate = (dateKey: string) => {
    const dateMessages = allHistory.filter((m) => getDateKey(m.timestamp) === dateKey);
    setViewingDate(dateKey);
    setView("chat");
    setMessages(dateMessages);
  };

  const groupedHistory = (() => {
    const groups: { dateKey: string; label: string; messages: BrainMessage[]; firstTime: Date; lastTime: Date; preview: string; count: number }[] = [];
    const dateMap = new Map<string, BrainMessage[]>();

    for (const msg of allHistory) {
      const key = getDateKey(msg.timestamp);
      if (!dateMap.has(key)) dateMap.set(key, []);
      dateMap.get(key)!.push(msg);
    }

    const sortedKeys = Array.from(dateMap.keys()).sort((a, b) => {
      const [ay, am, ad] = a.split("-").map(Number);
      const [by, bm, bd] = b.split("-").map(Number);
      return new Date(by, bm, bd).getTime() - new Date(ay, am, ad).getTime();
    });

    for (const key of sortedKeys) {
      const msgs = dateMap.get(key)!;
      const firstUserMsg = msgs.find((m) => m.type === "user");
      const preview = firstUserMsg
        ? firstUserMsg.content.slice(0, 80) + (firstUserMsg.content.length > 80 ? "..." : "")
        : msgs[0].content.slice(0, 80) + (msgs[0].content.length > 80 ? "..." : "");
      groups.push({
        dateKey: key,
        label: formatDateLabel(msgs[0].timestamp),
        messages: msgs,
        firstTime: msgs[0].timestamp,
        lastTime: msgs[msgs.length - 1].timestamp,
        preview,
        count: msgs.length,
      });
    }
    return groups;
  })();

  const quickActions = PAGE_QUICK_ACTIONS[location] || DEFAULT_QUICK_ACTIONS;

  const contextStripText = () => {
    const parts: string[] = [];
    if (awareness.calculator?.selectedMetal) {
      parts.push(`${awareness.calculator.selectedKarat || ""}K ${awareness.calculator.selectedMetal}`);
    }
    if (awareness.market?.goldPrice) {
      parts.push(`Gold $${awareness.market.goldPrice.toFixed(0)}/oz`);
    }
    if (awareness.directory?.viewingBusiness) {
      parts.push(`Viewing: ${awareness.directory.viewingBusiness.name}`);
    }
    if (awareness.database?.viewingCoin) {
      parts.push(`Coin: ${awareness.database.viewingCoin.name}`);
    }
    return parts.length > 0 ? parts.join(" · ") : null;
  };

  if (!isOpen) return null;

  const contextStrip = contextStripText();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-[380px] max-w-[calc(100vw-2rem)] flex flex-col bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden"
      style={{ maxHeight: "min(680px, calc(100vh - 6rem))" }}>
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#2E5090] to-[#1a3560] border-b border-gray-800">
        <div className="flex items-center gap-2">
          {(view === "history" || viewingDate) ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-300 hover:text-white hover:bg-white/10"
              onClick={() => {
                if (viewingDate) {
                  setView("history");
                  setViewingDate(null);
                } else {
                  handleBackFromHistory();
                }
              }}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          ) : (
            <Brain className="w-5 h-5 text-white" />
          )}
          <span className="text-white font-semibold text-sm">
            {view === "history" ? "Chat History" : viewingDate ? formatDateLabel(new Date(allHistory.find(m => getDateKey(m.timestamp) === viewingDate)?.timestamp || new Date())) : "Simplicity"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {view === "chat" && !viewingDate && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-300 hover:text-white hover:bg-white/10"
              title="Chat history"
              onClick={handleOpenHistory}
            >
              <Clock className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-300 hover:text-white hover:bg-white/10"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-300 hover:text-white hover:bg-white/10"
            onClick={closeBrain}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {contextStrip && (
        <div className="px-3 py-1.5 bg-gray-900/80 border-b border-gray-800 text-xs text-blue-300 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-blue-400 flex-shrink-0" />
          <span className="truncate">{contextStrip}</span>
        </div>
      )}

      {view === "history" && (
        <div className="flex-1 overflow-y-auto px-3 py-3 min-h-0"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#374151 transparent" }}>

          <button
            className="w-full flex items-center gap-2 px-3 py-2.5 mb-3 rounded-lg bg-[#2E5090]/20 border border-[#2E5090]/40 hover:bg-[#2E5090]/30 transition-colors text-sm text-blue-300 font-medium"
            onClick={handleNewChat}
          >
            <MessageSquarePlus className="w-4 h-4" />
            New conversation
          </button>

          {isLoadingHistory && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              <span className="ml-2 text-xs text-gray-400">Loading history...</span>
            </div>
          )}

          {groupedHistory.length === 0 && !isLoadingHistory && (
            <div className="text-center py-8">
              <Clock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No chat history yet</p>
              <p className="text-xs text-gray-600 mt-1">Your conversations with Simplicity will appear here</p>
            </div>
          )}

          {groupedHistory.map((group) => {
            const userMsgCount = group.messages.filter(m => m.type === "user").length;
            return (
              <button
                key={group.dateKey}
                className="w-full text-left px-3 py-3 mb-2 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 hover:bg-gray-800/80 transition-colors group"
                onClick={() => handleViewHistoryDate(group.dateKey)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-blue-400">{group.label}</span>
                  <span className="text-[10px] text-gray-500">
                    {formatTime(group.firstTime)} — {formatTime(group.lastTime)}
                  </span>
                </div>
                <p className="text-sm text-gray-300 line-clamp-2 leading-snug">{group.preview}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-gray-500">{userMsgCount} {userMsgCount === 1 ? "question" : "questions"}</span>
                  <span className="text-[10px] text-gray-600">·</span>
                  <span className="text-[10px] text-gray-500">{group.count} messages</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {view === "chat" && (
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#374151 transparent" }}>

        {isLoadingHistory && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
            <span className="ml-2 text-xs text-gray-400">Loading history...</span>
          </div>
        )}

        {messages.map((msg, idx) => {
          const prevMsg = messages[idx - 1];
          const showDateSep = !prevMsg || getDateKey(msg.timestamp) !== getDateKey(prevMsg.timestamp);
          return (
            <div key={msg.id}>
              {showDateSep && (
                <div className="flex items-center gap-2 py-1.5">
                  <div className="flex-1 h-px bg-gray-700/50" />
                  <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{formatDateLabel(msg.timestamp)}</span>
                  <div className="flex-1 h-px bg-gray-700/50" />
                </div>
              )}
              <div className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                <div className="flex flex-col max-w-[88%]">
                  <div
                    className={`rounded-xl px-3 py-2 text-sm ${
                      msg.type === "user"
                        ? "bg-[#2E5090] text-white rounded-br-sm"
                        : "bg-gray-800 text-gray-100 rounded-bl-sm"
                    }`}
                  >
                    {msg.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        alt="Uploaded"
                        className="max-w-full max-h-48 rounded-lg mb-2"
                      />
                    )}
                    {msg.type === "assistant" && msg.streaming && !msg.content ? (
                      <TypingIndicator />
                    ) : msg.type === "assistant" ? (
                      <ProseRenderer content={msg.content} className="text-sm" />
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}

                    {msg.type === "assistant" && msg.id !== "1" && !msg.streaming && msg.content && (
                      <div className="flex items-center gap-1 mt-2 pt-1.5 border-t border-gray-700/50">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-6 w-6 ${feedbackGiven[msg.id] === "up" ? "text-green-400" : "text-gray-500 hover:text-green-400"}`}
                          onClick={() => sendFeedback(msg.id, 1)}
                          disabled={!!feedbackGiven[msg.id]}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-6 w-6 ${feedbackGiven[msg.id] === "down" ? "text-red-400" : "text-gray-500 hover:text-red-400"}`}
                          onClick={() => sendFeedback(msg.id, -1)}
                          disabled={!!feedbackGiven[msg.id]}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                        {voiceEnabled && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-6 w-6 ${speakingMessageId === msg.id ? "text-blue-400" : "text-gray-500 hover:text-blue-400"}`}
                            onClick={() => handleSpeak(msg)}
                          >
                            {speakingMessageId === msg.id ? <Square className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                          </Button>
                        )}
                        {msg.metadata?.appraisalType && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-gray-500 hover:text-blue-400 ml-auto"
                            onClick={() => handlePrintAppraisal(msg)}
                          >
                            <Printer className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  <span className={`text-[10px] text-gray-600 mt-0.5 ${msg.type === "user" ? "text-right" : "text-left"}`}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && !messages.some((m) => m.streaming) && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-xl px-3 py-2 rounded-bl-sm">
              <TypingIndicator />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
      )}

      {view === "chat" && messages.length <= 2 && !imagePreview && !isLoading && !viewingDate && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {quickActions.slice(0, 3).map((action, i) => (
            <button
              key={i}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-gray-700 transition-colors truncate max-w-full"
              onClick={() => {
                const userMsg: BrainMessage = {
                  id: Date.now().toString(),
                  type: "user",
                  content: action.text,
                  timestamp: new Date(),
                };
                setMessages((prev) => [...prev, userMsg]);
                sendStreamingMessage(action.text);
              }}
            >
              {action.text}
            </button>
          ))}
        </div>
      )}

      {view === "chat" && imagePreview && (
        <div className="px-3 pb-2">
          <div className="relative inline-block">
            <img src={imagePreview} alt="Preview" className="max-h-20 rounded-lg border border-gray-700" />
            <button
              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              onClick={clearImage}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <button
            className="text-xs text-blue-400 hover:text-blue-300 mt-1 flex items-center gap-1"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showDetails ? "Hide details" : "Add details for better appraisal"}
          </button>
          {showDetails && (
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {(["weight", "karat", "condition", "brand", "model", "year"] as (keyof ItemDetails)[]).map((key) => (
                <Input
                  key={key}
                  placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={itemDetails[key]}
                  onChange={(e) => setItemDetails((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="h-7 text-xs bg-gray-800 border-gray-700 text-gray-200"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {view === "chat" && (
      <div className="p-3 border-t border-gray-800 bg-gray-900/50">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageSelect(file);
              e.target.value = "";
            }}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageSelect(file);
              e.target.value = "";
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-blue-400 hover:bg-gray-800 flex-shrink-0"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-blue-400 hover:bg-gray-800 flex-shrink-0"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="w-4 h-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={imagePreview ? "Describe the item..." : "Ask Simplicity anything..."}
            className="flex-1 h-8 text-sm bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 focus:border-[#2E5090]"
            disabled={isLoading}
          />
          <Button
            size="icon"
            className="h-8 w-8 bg-[#2E5090] hover:bg-[#1a3560] text-white flex-shrink-0"
            onClick={handleSend}
            disabled={isLoading && !abortRef.current}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      )}
    </div>
  );
}
