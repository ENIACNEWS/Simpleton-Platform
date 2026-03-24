import { useState, useRef, useEffect, useCallback } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { ProseRenderer } from "@/components/ui/prose-renderer";
import { ProfessionalDocument } from "@/components/ui/professional-document";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  User,
  Brain,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  Zap,
  MessageSquare,
  Lightbulb,
  Shield,
  Activity,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Loader2,
  Printer,
  Camera,
  Upload,
  X,
  Image as ImageIcon,
  PanelLeftOpen,
  PanelLeftClose,
  Plus,
  MessageSquarePlus,
  Clock,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  image?: string;
  metadata?: {
    provider?: string;
    model?: string;
    confidence?: number;
    processingTime?: number;
    type?: string;
    activeProviders?: number;
    totalProviders?: number;
    confidenceLevel?: string;
    toolsUsed?: string[];
    liveData?: boolean;
    method?: string;
    hadThinking?: boolean;
  };
}

interface ConversationSession {
  id: number;
  sessionToken: string;
  title: string | null;
  summary: string | null;
  messageCount: number;
  lastActiveAt: string;
  createdAt: string;
}

interface ProviderInfo {
  name: string;
  active: boolean;
  models: string[];
  type: string;
}

function formatDateLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor(
    (today.getTime() - msgDay.getTime()) / 86400000
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)
    return date.toLocaleDateString("en-US", { weekday: "long" });
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year:
      now.getFullYear() !== date.getFullYear() ? "numeric" : undefined,
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatConversationDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const suggestedQuestions = [
  { text: "What factors affect gold prices?", icon: Sparkles },
  { text: "Explain diamond clarity grades", icon: Lightbulb },
  { text: "What is simpletonapp.com?", icon: Zap },
  { text: "Explain quantum computing simply", icon: Brain },
  { text: "What is a GIA certification?", icon: MessageSquare },
  { text: "What are the best investment strategies?", icon: Sparkles },
];

function getSessionToken(): string {
  let token = localStorage.getItem("simplicity-session-token");
  if (!token) {
    token =
      "chat-" +
      Date.now() +
      "-" +
      Math.random().toString(36).substring(2, 10);
    localStorage.setItem("simplicity-session-token", token);
  }
  return token;
}

// Compress image for upload
function compressImage(
  file: File,
  maxSizeKB: number = 4000
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      const maxDimension = 2048;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
      }
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      let quality = 0.9;
      let result = canvas.toDataURL("image/jpeg", quality);
      while (result.length > maxSizeKB * 1024 * 1.37 && quality > 0.1) {
        quality -= 0.1;
        result = canvas.toDataURL("image/jpeg", quality);
      }
      resolve(result);
    };
    const reader = new FileReader();
    reader.onload = () => (img.src = reader.result as string);
    reader.readAsDataURL(file);
  });
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mode, setMode] = useState<"single" | "consensus">("consensus");
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const [sessionToken, setSessionToken] = useState(getSessionToken);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationSession[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);

  // Image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isVisionMode, setIsVisionMode] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: providerData } = useQuery<{
    success: boolean;
    totalProviders: number;
    activeProviders: number;
    providers: ProviderInfo[];
  }>({
    queryKey: ["/api/ai/providers"],
    refetchInterval: 30000,
  });

  // Load conversation history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch(
          `/api/chat/history?sessionToken=${encodeURIComponent(sessionToken)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.messages?.length > 0) {
            setMessages(
              data.messages.map((m: any) => ({
                id: m.id?.toString() || Date.now().toString(),
                role: m.role,
                content: m.content,
                timestamp: new Date(m.createdAt || Date.now()),
                metadata: m.metadata,
              }))
            );
          }
        }
      } catch {}
    };
    loadHistory();
  }, [sessionToken]);

  // Load conversations for sidebar
  const loadConversations = useCallback(async () => {
    setLoadingConversations(true);
    try {
      const res = await fetch(
        `/api/chat/conversations?sessionToken=${encodeURIComponent(sessionToken)}`
      );
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch {}
    setLoadingConversations(false);
  }, [sessionToken]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Auto-fire a lesson request if the page was opened with ?lesson=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lesson = params.get("lesson");
    if (lesson && messages.length === 0) {
      const prompt = `Please give me a complete step-by-step lesson on: ${lesson}. Start from the beginning and walk me through everything I need to know, section by section.`;
      setTimeout(() => handleSend(prompt), 800);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Pick up any pending question from other pages
  useEffect(() => {
    const pending = localStorage.getItem("simplicity-pending-question");
    if (pending && messages.length === 0) {
      localStorage.removeItem("simplicity-pending-question");
      setTimeout(() => handleSend(pending), 900);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle image selection
  const handleImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const imageData = await compressImage(file);
      setImagePreview(imageData);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Start a new conversation
  const handleNewConversation = async () => {
    try {
      const res = await apiRequest("POST", "/api/chat/new-conversation", {
        sessionToken,
      });
      const data = await res.json();
      if (data.sessionToken) {
        localStorage.setItem("simplicity-session-token", data.sessionToken);
        setSessionToken(data.sessionToken);
        setMessages([]);
        clearImage();
        loadConversations();
      }
    } catch {
      // Fallback: generate client-side token
      const newToken =
        "chat-" +
        Date.now() +
        "-" +
        Math.random().toString(36).substring(2, 10);
      localStorage.setItem("simplicity-session-token", newToken);
      setSessionToken(newToken);
      setMessages([]);
      clearImage();
    }
  };

  // Switch to a different conversation
  const switchConversation = async (conv: ConversationSession) => {
    localStorage.setItem("simplicity-session-token", conv.sessionToken);
    setSessionToken(conv.sessionToken);
    setMessages([]);
    clearImage();
    // Load that conversation's history
    try {
      const res = await fetch(
        `/api/chat/history?sessionToken=${encodeURIComponent(conv.sessionToken)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.messages?.length > 0) {
          setMessages(
            data.messages.map((m: any) => ({
              id: m.id?.toString() || Date.now().toString(),
              role: m.role,
              content: m.content,
              timestamp: new Date(m.createdAt || Date.now()),
              metadata: m.metadata,
            }))
          );
        }
      }
    } catch {}
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText && !imagePreview) return;
    if (isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText || (imagePreview ? "Analyze this image" : ""),
      timestamp: new Date(),
      image: imagePreview || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Prepare image data for API
    let imageBase64: string | undefined;
    if (imagePreview) {
      imageBase64 = imagePreview.split(",")[1]; // Remove data URL prefix
    }
    clearImage();

    try {
      const response = await apiRequest("POST", "/api/ai/revolutionary", {
        message:
          messageText ||
          "What can you tell me about this image? Analyze it thoroughly.",
        useSimplicityBrain: true,
        consensus: mode === "consensus",
        sessionToken,
        image: imageBase64,
      });

      const data = await response.json();

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          data.response || "I couldn't generate a response. Please try again.",
        timestamp: new Date(),
        metadata: {
          provider: data.metadata?.provider,
          model: data.metadata?.model,
          confidence: data.metadata?.confidence,
          processingTime: data.metadata?.processingTime,
          type: data.type,
          activeProviders: data.metadata?.activeProviders,
          totalProviders: data.metadata?.totalProviders,
          confidenceLevel: data.metadata?.confidenceLevel,
          toolsUsed: data.metadata?.toolsUsed,
          liveData: data.metadata?.liveData,
          method: data.metadata?.method,
          hadThinking: data.metadata?.hadThinking,
        },
      };

      setMessages((prev) => [...prev, assistantMsg]);

      try {
        await apiRequest("POST", "/api/chat/save", {
          sessionToken,
          userMessage: messageText || "Image analysis request",
          assistantMessage: data.response,
          metadata: data.metadata,
        });
        // Generate title for new conversations
        if (messages.length === 0) {
          apiRequest("POST", "/api/chat/generate-title", {
            sessionToken,
            firstMessage: messageText || "Image analysis",
          }).catch(() => {});
        }
        // Refresh conversation list
        loadConversations();
      } catch {}
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrint = (text: string) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Simplicity Response</title>
          <style>
            body { font-family: 'Georgia', serif; max-width: 700px; margin: 40px auto; padding: 20px; color: #1a1a2e; line-height: 1.7; }
            h1, h2, h3 { font-family: 'Helvetica Neue', sans-serif; }
            .header { border-bottom: 2px solid #DAA520; padding-bottom: 12px; margin-bottom: 24px; }
            .header h1 { font-size: 18px; color: #DAA520; margin: 0; }
            .header p { font-size: 12px; color: #666; margin: 4px 0 0; }
            .content { white-space: pre-wrap; font-size: 14px; }
            .footer { border-top: 1px solid #ddd; padding-top: 12px; margin-top: 24px; font-size: 11px; color: #999; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Simplicity - Simpleton Technologies</h1>
            <p>${new Date().toLocaleString()}</p>
          </div>
          <div class="content">${text
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")}</div>
          <div class="footer">Generated by Simplicity AI at simpletonapp.com</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const speakWithBrowser = (text: string) => {
    const cleanText = text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`[^`]*`/g, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/#{1,6}\s+/g, "")
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/\n{2,}/g, ". ")
      .replace(/\n/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      cleanText.substring(0, 4000)
    );
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.volume = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) =>
        v.name.includes("Samantha") ||
        v.name.includes("Karen") ||
        v.name.includes("Victoria") ||
        (v.lang.startsWith("en") && v.name.toLowerCase().includes("female"))
    );
    if (preferred) utterance.voice = preferred;
    else {
      const englishVoice = voices.find((v) => v.lang.startsWith("en"));
      if (englishVoice) utterance.voice = englishVoice;
    }
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(utterance);
  };

  const handleSpeak = async (text: string, id: string) => {
    if (speakingId === id) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();
    setSpeakingId(id);
    try {
      const response = await fetch("/api/assistant/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error("TTS failed");
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("audio")) throw new Error("No audio returned");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setSpeakingId(null);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };
      audio.onerror = () => {
        speakWithBrowser(text);
      };
      await audio.play();
    } catch {
      speakWithBrowser(text);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setSpeakingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <Navigation />

      <div className="flex-1 flex pt-16">
        {/* Conversation Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-[calc(100vh-4rem)] border-r flex flex-col overflow-hidden flex-shrink-0"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
              }}
            >
              {/* Sidebar Header */}
              <div
                className="p-3 border-b flex items-center justify-between"
                style={{ borderColor: "var(--border)" }}
              >
                <span className="text-sm font-semibold">Conversations</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleNewConversation}
                    className="p-1.5 rounded-lg hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--primary) 15%, transparent)",
                    }}
                    title="New conversation"
                  >
                    <Plus
                      className="w-4 h-4"
                      style={{ color: "var(--primary)" }}
                    />
                  </button>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1.5 rounded-lg hover:opacity-80 transition-opacity"
                    title="Close sidebar"
                  >
                    <PanelLeftClose className="w-4 h-4 opacity-50" />
                  </button>
                </div>
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto">
                {loadingConversations ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin opacity-40" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-xs opacity-40">No conversations yet</p>
                    <p className="text-xs opacity-30 mt-1">
                      Start chatting to see your history here
                    </p>
                  </div>
                ) : (
                  <div className="py-1">
                    {conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => switchConversation(conv)}
                        className={`w-full text-left px-3 py-2.5 hover:opacity-90 transition-all border-l-2 ${
                          conv.sessionToken === sessionToken
                            ? "border-l-[var(--primary)]"
                            : "border-l-transparent"
                        }`}
                        style={{
                          backgroundColor:
                            conv.sessionToken === sessionToken
                              ? "color-mix(in srgb, var(--primary) 10%, transparent)"
                              : "transparent",
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <MessageSquare
                            className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 opacity-40"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {conv.title || "New conversation"}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] opacity-40">
                                {formatConversationDate(conv.lastActiveAt)}
                              </span>
                              {conv.messageCount > 0 && (
                                <span className="text-[10px] opacity-30">
                                  {conv.messageCount} msgs
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 pb-24">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pt-4">
            <div className="flex items-center gap-3">
              {!sidebarOpen && (
                <button
                  onClick={() => {
                    setSidebarOpen(true);
                    loadConversations();
                  }}
                  className="p-2 rounded-lg hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--primary) 10%, transparent)",
                  }}
                  title="Open conversations"
                >
                  <PanelLeftOpen
                    className="w-5 h-5"
                    style={{ color: "var(--primary)" }}
                  />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles
                    className="w-7 h-7"
                    style={{ color: "var(--primary)" }}
                  />
                  Simplicity
                </h1>
                <p className="text-sm opacity-50 mt-1">
                  Multi-provider AI consensus for superior accuracy
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={mode === "single" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("single")}
                style={
                  mode === "single"
                    ? {
                        backgroundColor:
                          "color-mix(in srgb, var(--primary) 20%, var(--card))",
                        color: "var(--primary)",
                        border:
                          "1px solid color-mix(in srgb, var(--primary) 40%, transparent)",
                      }
                    : { borderColor: "var(--border)" }
                }
              >
                <Zap className="w-3 h-3 mr-1" />
                Fast
              </Button>
              <Button
                variant={mode === "consensus" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("consensus")}
                style={
                  mode === "consensus"
                    ? {
                        backgroundColor:
                          "color-mix(in srgb, var(--primary) 20%, var(--card))",
                        color: "var(--primary)",
                        border:
                          "1px solid color-mix(in srgb, var(--primary) 40%, transparent)",
                      }
                    : { borderColor: "var(--border)" }
                }
              >
                <Brain className="w-3 h-3 mr-1" />
                Consensus
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMute}
                style={{ borderColor: "var(--border)" }}
                title={isMuted ? "Unmute Simplicity" : "Mute Simplicity"}
              >
                {isMuted ? (
                  <VolumeX className="w-3 h-3" />
                ) : (
                  <Volume2 className="w-3 h-3" />
                )}
              </Button>
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPrintView(true)}
                  style={{ borderColor: "var(--border)" }}
                  title="Print conversation"
                >
                  <Printer className="w-3 h-3" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewConversation}
                style={{ borderColor: "var(--border)" }}
                title="New conversation"
              >
                <MessageSquarePlus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            className="flex-1 overflow-y-auto rounded-xl border p-4 mb-4"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
              minHeight: "400px",
            }}
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--primary) 15%, transparent)",
                  }}
                >
                  <MessageSquare
                    className="w-8 h-8"
                    style={{ color: "var(--primary)" }}
                  />
                </div>
                <h2 className="text-lg font-semibold mb-2">
                  Ask Simplicity Anything
                </h2>
                <p className="text-sm opacity-50 mb-6 max-w-md">
                  Simplicity can answer any question. From precious metals and
                  diamonds to science, history, cooking, or anything else you can
                  think of. Upload photos for visual analysis!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q.text)}
                      className="flex items-center gap-2 text-left px-4 py-3 rounded-xl text-sm border transition-all hover:scale-[1.02]"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--background)",
                      }}
                    >
                      <q.icon
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: "var(--primary)" }}
                      />
                      {q.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((msg, idx) => {
                    const prevMsg = messages[idx - 1];
                    const showDateSep =
                      !prevMsg ||
                      getDateKey(msg.timestamp) !==
                        getDateKey(prevMsg.timestamp);
                    return (
                      <div key={msg.id}>
                        {showDateSep && (
                          <div className="flex items-center gap-3 py-2 my-2">
                            <div
                              className="flex-1 h-px"
                              style={{
                                backgroundColor: "var(--border)",
                              }}
                            />
                            <span
                              className="text-xs font-medium uppercase tracking-wider"
                              style={{
                                color: "var(--muted-foreground)",
                              }}
                            >
                              {formatDateLabel(msg.timestamp)}
                            </span>
                            <div
                              className="flex-1 h-px"
                              style={{
                                backgroundColor: "var(--border)",
                              }}
                            />
                          </div>
                        )}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex gap-3 ${
                            msg.role === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          {msg.role === "assistant" && (
                            <div className="w-8 h-8 rounded-lg flex-shrink-0 mt-1 overflow-hidden">
                              <img
                                src="/simpleton-logo.jpeg"
                                alt="Simplicity"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div
                            className={`max-w-[80%] ${
                              msg.role === "user" ? "order-first" : ""
                            }`}
                          >
                            <div
                              className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                              style={
                                msg.role === "user"
                                  ? {
                                      backgroundColor:
                                        "color-mix(in srgb, var(--primary) 25%, var(--card))",
                                      color: "var(--foreground)",
                                      border:
                                        "1px solid color-mix(in srgb, var(--primary) 40%, transparent)",
                                    }
                                  : {
                                      backgroundColor: "var(--background)",
                                      border: "1px solid var(--border)",
                                    }
                              }
                            >
                              {/* Show uploaded image */}
                              {msg.image && (
                                <img
                                  src={msg.image}
                                  alt="Uploaded"
                                  className="mb-3 rounded-lg max-w-full"
                                  style={{ maxHeight: "250px" }}
                                />
                              )}
                              {msg.role === "assistant" ? (
                                <ProseRenderer content={msg.content} />
                              ) : (
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                  {msg.content}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 ml-1 flex-wrap">
                              <span
                                className="text-[10px]"
                                style={{
                                  color: "var(--muted-foreground)",
                                  opacity: 0.6,
                                }}
                              >
                                {formatTime(msg.timestamp)}
                              </span>
                              {msg.role === "assistant" && (
                                <>
                                  {msg.metadata?.type === "thinking" && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] px-1.5 py-0 h-4"
                                      style={{
                                        borderColor: "#f59e0b",
                                        color: "#f59e0b",
                                      }}
                                    >
                                      <Brain className="w-2.5 h-2.5 mr-0.5" />
                                      Deep Thinking
                                    </Badge>
                                  )}
                                  {(msg.metadata?.type === "tools" ||
                                    msg.metadata?.liveData) && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] px-1.5 py-0 h-4"
                                      style={{
                                        borderColor: "#22c55e",
                                        color: "#22c55e",
                                      }}
                                    >
                                      <Shield className="w-2.5 h-2.5 mr-0.5" />
                                      Live Tools
                                    </Badge>
                                  )}
                                  {msg.metadata?.type === "beta" && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] px-1.5 py-0 h-4"
                                      style={{
                                        borderColor: "#a855f7",
                                        color: "#a855f7",
                                      }}
                                    >
                                      DeepSeek Beta
                                    </Badge>
                                  )}
                                  {msg.metadata?.type === "consensus" && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] px-1.5 py-0 h-4"
                                      style={{
                                        borderColor: "#3b82f6",
                                        color: "#3b82f6",
                                      }}
                                    >
                                      <Shield className="w-2.5 h-2.5 mr-0.5" />
                                      Consensus
                                    </Badge>
                                  )}
                                  {msg.metadata?.toolsUsed &&
                                    msg.metadata.toolsUsed.length > 0 && (
                                      <span className="text-[10px] opacity-40">
                                        {msg.metadata.toolsUsed.length} tool
                                        {msg.metadata.toolsUsed.length > 1
                                          ? "s"
                                          : ""}
                                      </span>
                                    )}
                                  {msg.metadata?.activeProviders &&
                                    !msg.metadata?.liveData && (
                                      <span className="text-[10px] opacity-40">
                                        {msg.metadata.activeProviders} providers
                                      </span>
                                    )}
                                  {msg.metadata?.processingTime ? (
                                    <span className="text-[10px] opacity-40">
                                      {msg.metadata.processingTime}ms
                                    </span>
                                  ) : null}
                                  {msg.metadata?.confidenceLevel && (
                                    <span className="text-[10px] opacity-40">
                                      {msg.metadata.confidenceLevel}
                                    </span>
                                  )}
                                  {!isMuted && (
                                    <button
                                      onClick={() =>
                                        handleSpeak(msg.content, msg.id)
                                      }
                                      className="opacity-30 hover:opacity-70 transition-opacity"
                                      title={
                                        speakingId === msg.id
                                          ? "Stop speaking"
                                          : "Listen to Simplicity"
                                      }
                                    >
                                      {speakingId === msg.id ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <Volume2 className="w-3 h-3" />
                                      )}
                                    </button>
                                  )}
                                  <button
                                    onClick={() =>
                                      handleCopy(msg.content, msg.id)
                                    }
                                    className="opacity-30 hover:opacity-70 transition-opacity"
                                    title="Copy response"
                                  >
                                    {copiedId === msg.id ? (
                                      <Check className="w-3 h-3" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handlePrint(msg.content)}
                                    className="opacity-30 hover:opacity-70 transition-opacity"
                                    title="Print response"
                                  >
                                    <Printer className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          {msg.role === "user" && (
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                              style={{
                                backgroundColor:
                                  "color-mix(in srgb, var(--primary) 25%, var(--card))",
                                border:
                                  "1px solid color-mix(in srgb, var(--primary) 40%, transparent)",
                              }}
                            >
                              <User
                                className="w-4 h-4"
                                style={{ color: "var(--primary)" }}
                              />
                            </div>
                          )}
                        </motion.div>
                      </div>
                    );
                  })}
                </AnimatePresence>

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg flex-shrink-0 overflow-hidden">
                      <img
                        src="/simpleton-logo.jpeg"
                        alt="Simplicity"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div
                      className="rounded-2xl px-4 py-3 border"
                      style={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full animate-bounce"
                            style={{
                              backgroundColor: "var(--primary)",
                              animationDelay: "0ms",
                            }}
                          />
                          <span
                            className="w-2 h-2 rounded-full animate-bounce"
                            style={{
                              backgroundColor: "var(--primary)",
                              animationDelay: "150ms",
                            }}
                          />
                          <span
                            className="w-2 h-2 rounded-full animate-bounce"
                            style={{
                              backgroundColor: "var(--primary)",
                              animationDelay: "300ms",
                            }}
                          />
                        </div>
                        <span className="text-xs opacity-40 ml-1">
                          Thinking...
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Image Preview Bar */}
          {imagePreview && (
            <div
              className="flex items-center gap-3 mb-2 p-2 rounded-xl border"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--primary) 8%, var(--card))",
                borderColor:
                  "color-mix(in srgb, var(--primary) 30%, transparent)",
              }}
            >
              <img
                src={imagePreview}
                alt="Preview"
                className="h-14 w-14 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="text-xs font-medium" style={{ color: "var(--primary)" }}>
                  <Camera className="w-3 h-3 inline mr-1" />
                  Image ready for analysis
                </p>
                <p className="text-[10px] opacity-50">
                  {selectedImage?.name}
                </p>
              </div>
              <button
                onClick={clearImage}
                className="p-1.5 rounded-lg hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--destructive, #ef4444) 15%, transparent)",
                }}
              >
                <X className="w-4 h-4 opacity-60" />
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="flex gap-2 items-end">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Image upload button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="h-11 w-11 rounded-xl flex-shrink-0"
              style={{
                borderColor: imagePreview
                  ? "var(--primary)"
                  : "var(--border)",
                backgroundColor: imagePreview
                  ? "color-mix(in srgb, var(--primary) 15%, var(--card))"
                  : undefined,
              }}
              title="Upload image for analysis"
            >
              <Camera
                className="w-4 h-4"
                style={{
                  color: imagePreview
                    ? "var(--primary)"
                    : "var(--muted-foreground)",
                }}
              />
            </Button>

            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onInput={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder={
                  imagePreview
                    ? "Describe what you want to know about this image..."
                    : "Type your question..."
                }
                rows={1}
                className="w-full resize-none rounded-xl px-4 py-3 pr-12 text-sm border focus:outline-none focus:ring-2"
                style={
                  {
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                    focusRingColor: "var(--primary)",
                  } as any
                }
                disabled={isTyping}
              />
            </div>
            <Button
              onClick={() => handleSend()}
              disabled={(!input.trim() && !imagePreview) || isTyping}
              className="h-11 w-11 rounded-xl flex-shrink-0"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <Send className="w-4 h-4 text-white" />
            </Button>
          </div>

          <div className="text-center mt-2 mb-2">
            <p className="text-xs opacity-30">
              Simplicity · Responses may not be 100% accurate
            </p>
          </div>
        </div>
      </div>

      {/* Print View Overlay */}
      {showPrintView && messages.length > 0 && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto simpleton-print-overlay"
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
        >
          <div className="max-w-4xl mx-auto p-6">
            <ProfessionalDocument
              title="Simplicity Conversation"
              subtitle="Generated by Simplicity Intelligence"
              onClose={() => setShowPrintView(false)}
            >
              <div className="space-y-4">
                {messages.map((msg, idx) => {
                  const prevMsg = messages[idx - 1];
                  const showDateSep =
                    !prevMsg ||
                    getDateKey(msg.timestamp) !==
                      getDateKey(prevMsg.timestamp);
                  return (
                    <div key={msg.id}>
                      {showDateSep && (
                        <div className="text-center py-2 my-1">
                          <span
                            className="text-xs font-semibold uppercase tracking-wider"
                            style={{
                              color: "var(--muted-foreground)",
                            }}
                          >
                            {formatDateLabel(msg.timestamp)} -{" "}
                            {msg.timestamp.toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                      <div
                        className="pb-3"
                        style={{
                          borderBottom:
                            "1px solid rgba(201,169,110,0.1)",
                        }}
                      >
                        <p
                          className="text-xs font-semibold mb-1"
                          style={{
                            color:
                              msg.role === "user"
                                ? "var(--primary)"
                                : "var(--muted-foreground)",
                          }}
                        >
                          {msg.role === "user" ? "You" : "Simplicity"}
                          <span className="ml-2 font-normal opacity-50">
                            {formatTime(msg.timestamp)}
                          </span>
                        </p>
                        {msg.image && (
                          <img
                            src={msg.image}
                            alt="Uploaded"
                            className="mb-2 rounded-lg max-w-xs"
                          />
                        )}
                        {msg.role === "assistant" ? (
                          <ProseRenderer content={msg.content} />
                        ) : (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ProfessionalDocument>
          </div>
        </div>
      )}
    </div>
  );
}
