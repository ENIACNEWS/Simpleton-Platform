import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Link } from 'wouter';
import {
  Send, X, Loader2, Camera, ImagePlus, ChevronDown, ChevronUp, Printer,
  Volume2, VolumeX, Square, ThumbsUp, ThumbsDown, Sparkles,
  Brain, TrendingUp, Calculator, Gem, Watch, Clock, ArrowLeft,
  MessageSquarePlus, Search, Settings, Home, Plus, Trash2
} from 'lucide-react';
import { TypingIndicator } from '@/components/ui/loading-animations';
import { useVoicePreference } from '@/hooks/use-voice-preference';
import { playSimplicityVoice, stopSimplicityVoice } from '@/lib/simplicity-voice';
import { playSimplicityDing } from '@/lib/simplicity-ding';
import { useBrain, buildBrainSystemContext } from '@/lib/brain-context';
import { ProseRenderer } from '@/components/ui/prose-renderer';

// ───────────────────────────────────────────────────────────────────────
//  Design tokens
// ───────────────────────────────────────────────────────────────────────
const T = {
  bg: '#0b0b12',
  sidebar: '#08080e',
  panel: '#0e0e18',
  ink: '#f4efe2',
  inkMuted: '#9a937f',
  gold: '#c9a84c',
  goldDeep: '#a8873a',
  goldGlow: 'rgba(201,168,76,0.25)',
  goldBubble: 'rgba(201,168,76,0.10)',
  assistBubble: 'rgba(244,239,226,0.04)',
  hairline: 'rgba(244,239,226,0.10)',
  rose: '#f43f5e',
  display: '"Playfair Display", Georgia, serif',
  body: '"Inter", -apple-system, system-ui, sans-serif',
  serif: '"EB Garamond", "Playfair Display", Georgia, serif',
};

// ───────────────────────────────────────────────────────────────────────
//  Specialist modes — each changes the system prompt context
// ───────────────────────────────────────────────────────────────────────
const MODES = [
  {
    id: 'general',
    label: 'General',
    icon: Brain,
    color: T.gold,
    description: 'Full Simplicity — precious metals, diamonds, watches, coins, and beyond',
    contextHint: '',
    prompts: [
      "What's the difference between 14K and 18K gold?",
      "How are diamonds graded and priced?",
      "What Rolex models hold value best?",
      "Tell me about Morgan Silver Dollars",
      "Is now a good time to buy gold?",
      "How do I read hallmarks on jewelry?",
    ],
  },
  {
    id: 'rolex',
    label: 'Rolex',
    icon: Watch,
    color: '#a78bfa',
    description: 'Rolex specialist — reference numbers, market values, authentication, model history',
    contextHint: 'You are in ROLEX EXPERT MODE. Focus on Rolex watches: reference numbers, serial dating, movement calibers (3135, 3235, 3285), case materials, market values, authentication tips, investment analysis, and model history. Be the most knowledgeable Rolex expert in the world.',
    prompts: [
      "How do I identify a Rolex by reference number?",
      "What's the market value of a Submariner 126610LN?",
      "How to date a Rolex by serial number",
      "Which Rolex models have appreciated the most?",
      "How to spot a fake Rolex",
      "Explain the difference between Oyster and Jubilee bracelets",
    ],
  },
  {
    id: 'gold',
    label: 'Gold & Metals',
    icon: TrendingUp,
    color: '#fbbf24',
    description: 'Live pricing, melt calculations, market analysis, buy/sell signals',
    contextHint: 'You are in GOLD & METALS MODE. Focus on precious metals: gold, silver, platinum, palladium, rhodium, iridium. Provide live pricing analysis, melt value calculations, market signals, supply/demand dynamics, central bank activity, and buy/hold/sell recommendations. Be the most authoritative precious metals analyst in the industry.',
    prompts: [
      "What's gold trading at right now?",
      "Calculate melt value: 50 grams of 14K gold",
      "Should I buy or sell silver this week?",
      "Why is platinum cheaper than gold?",
      "What drives the gold-to-silver ratio?",
      "Tell me about rhodium — is it worth investing in?",
    ],
  },
  {
    id: 'appraisal',
    label: 'Appraisals',
    icon: Sparkles,
    color: '#c9a84c',
    description: 'Photo-based appraisals, catalog descriptions, valuation methodology',
    contextHint: 'You are in APPRAISAL MODE. Focus on professional jewelry appraisal: item identification from photos, hallmark reading, construction analysis (solid vs hollow, cast vs fabricated), condition grading (Poor through Mint), melt value calculations with shown math, retail replacement values, and insurance documentation. Write in catalog-style language: "One (1) ladies\' 14K (585) white gold..." format.',
    prompts: [
      "How do I determine if a chain is solid or hollow?",
      "What does a professional appraisal include?",
      "How to read gold hallmarks and stamps",
      "What's the difference between melt value and retail value?",
      "How much does condition affect jewelry value?",
      "Upload a photo of your item for an instant appraisal",
    ],
  },
  {
    id: 'diamonds',
    label: 'Diamonds',
    icon: Gem,
    color: '#60a5fa',
    description: '4C grading, Rapaport pricing, lab vs natural, certification guidance',
    contextHint: 'You are in DIAMOND EXPERT MODE. Focus on diamond grading and pricing: the 4Cs (Cut, Color, Clarity, Carat), Rapaport price list mechanics, per-carat pricing jumps at thresholds, lab-grown vs natural market dynamics, GIA/AGS/IGI certification differences, fluorescence impact, and wholesale vs retail pricing. Be the most knowledgeable diamond expert in the industry.',
    prompts: [
      "Explain the 4Cs — which matters most?",
      "What's VS2 clarity and is it good enough?",
      "Lab-grown vs natural — what's the market doing?",
      "Why do diamond prices jump at 1 carat?",
      "How to read a GIA certificate",
      "What diamond color grade is the best value?",
    ],
  },
];

// ───────────────────────────────────────────────────────────────────────
//  Types
// ───────────────────────────────────────────────────────────────────────
interface Msg {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  streaming?: boolean;
  metadata?: any;
}

interface Session {
  id: string;
  label: string;
  mode: string;
  messages: Msg[];
  createdAt: Date;
}

// ───────────────────────────────────────────────────────────────────────
//  Helpers
// ───────────────────────────────────────────────────────────────────────
function formatTime(d: Date) { return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }); }
function getSessionToken(): string {
  const key = 'simplicity_session_token';
  let token = localStorage.getItem(key);
  if (!token) { token = 'sv_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10); localStorage.setItem(key, token); }
  return token;
}
function compressImage(dataUrl: string, maxWidth = 1200, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      if (w > maxWidth) { h = (maxWidth / w) * h; w = maxWidth; }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// ═══════════════════════════════════════════════════════════════════════
//  Main Component
// ═══════════════════════════════════════════════════════════════════════
export default function SimplicityWorkspace() {
  const { awareness } = useBrain();
  const { voiceEnabled, setVoiceEnabled } = useVoicePreference();
  const sessionTokenRef = useRef(getSessionToken());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── State ──
  // Load saved sessions from localStorage on mount
  const [activeMode, setActiveMode] = useState('general');
  const [sessions, setSessions] = useState<Session[]>(() => {
    try {
      const saved = localStorage.getItem('simplicity_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          messages: s.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })),
        }));
      }
    } catch {}
    return [];
  });
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('simplicity_active_session') || null;
    } catch { return null; }
  });
  const [input, setInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Start sidebar collapsed on mobile (< 768px)
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);
  const [searchQuery, setSearchQuery] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'up' | 'down'>>({});

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;
  const messages = activeSession?.messages || [];

  // Persist sessions to localStorage (debounced via effect)
  useEffect(() => {
    try {
      // Strip image URLs to keep localStorage under quota
      const toSave = sessions.map(s => ({
        ...s,
        messages: s.messages.map(m => ({ ...m, imageUrl: undefined })),
      }));
      localStorage.setItem('simplicity_sessions', JSON.stringify(toSave));
    } catch {}
  }, [sessions]);

  useEffect(() => {
    try { if (activeSessionId) localStorage.setItem('simplicity_active_session', activeSessionId); }
    catch {}
  }, [activeSessionId]);

  // Auto-scroll
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

  // Focus input on mode change
  useEffect(() => { inputRef.current?.focus(); }, [activeMode, activeSessionId]);

  // ── Session management ──
  const createSession = useCallback((mode?: string) => {
    const m = mode || activeMode;
    const modeLabel = MODES.find(md => md.id === m)?.label || 'General';
    const newSession: Session = {
      id: Date.now().toString(),
      label: `${modeLabel} — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      mode: m,
      messages: [{
        id: '1',
        type: 'assistant',
        content: m === 'rolex'
          ? "Rolex expert mode. Reference numbers, market values, serial dating, authentication — ask me anything about the crown."
          : m === 'gold'
          ? "Gold & metals mode. Live spot, melt calculations, market signals, central bank activity. What do you need?"
          : m === 'appraisal'
          ? "Appraisal mode. Upload a photograph and I'll compose a professional catalog description with tiered valuations."
          : m === 'diamonds'
          ? "Diamond expert mode. 4Cs, Rapaport pricing, lab vs natural, certification — I'm ready."
          : "Good day. I'm Simplicity. Precious metals, diamonds, luxury watches, coins — or anything else on your mind.",
        timestamp: new Date(),
      }],
      createdAt: new Date(),
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setActiveMode(m);
  }, [activeMode]);

  // Create initial session on mount
  useEffect(() => { if (sessions.length === 0) createSession('general'); }, []);

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) {
      const remaining = sessions.filter(s => s.id !== id);
      setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // ── Messaging ──
  const sendMessage = async (userText: string) => {
    if (!activeSessionId) return;
    setIsLoading(true);
    const assistantId = Date.now().toString() + '_a';

    setSessions(prev => prev.map(s => s.id === activeSessionId ? {
      ...s, messages: [...s.messages, { id: assistantId, type: 'assistant', content: '', timestamp: new Date(), streaming: true }]
    } : s));

    try {
      const appContext = buildBrainSystemContext(awareness);
      const modeHint = MODES.find(m => m.id === activeMode)?.contextHint || '';
      const controller = new AbortController();
      abortRef.current = controller;

      const response = await fetch('/api/assistant/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: modeHint ? `[MODE: ${activeMode.toUpperCase()}]\n${modeHint}\n\nUser message: ${userText}` : userText,
          context: 'full_expert',
          sessionToken: sessionTokenRef.current,
          pageContext: `/simplicity/${activeMode}`,
          appContext,
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('text/event-stream') || contentType.includes('text/plain')) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            for (const line of chunk.split('\n')) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.token) {
                    accumulated += parsed.token;
                    setSessions(prev => prev.map(s => s.id === activeSessionId ? {
                      ...s, messages: s.messages.map(m => m.id === assistantId ? { ...m, content: accumulated } : m)
                    } : s));
                  }
                  if (parsed.metadata) {
                    setSessions(prev => prev.map(s => s.id === activeSessionId ? {
                      ...s, messages: s.messages.map(m => m.id === assistantId ? { ...m, streaming: false, metadata: parsed.metadata } : m)
                    } : s));
                  }
                } catch {
                  accumulated += data;
                  setSessions(prev => prev.map(s => s.id === activeSessionId ? {
                    ...s, messages: s.messages.map(m => m.id === assistantId ? { ...m, content: accumulated } : m)
                  } : s));
                }
              }
            }
          }
        }
        if (accumulated) {
          setSessions(prev => prev.map(s => s.id === activeSessionId ? {
            ...s, messages: s.messages.map(m => m.id === assistantId ? { ...m, content: accumulated, streaming: false } : m)
          } : s));
        }
      } else {
        const data = await response.json();
        setSessions(prev => prev.map(s => s.id === activeSessionId ? {
          ...s, messages: s.messages.map(m => m.id === assistantId ? {
            ...m, content: data.response || "I couldn't generate a response.", streaming: false,
            metadata: { providers: data.activeProviders || [], confidence: data.confidenceScore || 0, processingTime: data.processingTime || 0 },
          } : m)
        } : s));
      }
      playSimplicityDing();
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setSessions(prev => prev.map(s => s.id === activeSessionId ? {
        ...s, messages: s.messages.map(m => m.id === assistantId ? { ...m, content: "I'm having trouble connecting. Please try again.", streaming: false } : m)
      } : s));
    } finally { setIsLoading(false); abortRef.current = null; }
  };

  const handleSend = () => {
    if (isLoading || !input.trim()) return;
    if (!activeSessionId) createSession();

    const userMsg: Msg = { id: Date.now().toString(), type: 'user', content: input.trim(), timestamp: new Date() };
    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, userMsg] } : s));
    sendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleSpeak = useCallback((msg: Msg) => {
    if (speakingMessageId === msg.id) { stopSimplicityVoice(); setSpeakingMessageId(null); return; }
    stopSimplicityVoice(); setSpeakingMessageId(msg.id);
    playSimplicityVoice(msg.content, { volume: 0.85, rate: 0.95, pitch: 1.1, onEnd: () => setSpeakingMessageId(null), onError: () => setSpeakingMessageId(null) });
  }, [speakingMessageId]);

  const sendFeedback = async (messageId: string, rating: 1 | -1) => {
    setFeedbackGiven(prev => ({ ...prev, [messageId]: rating === 1 ? 'up' : 'down' }));
    try { await fetch('/api/simplicity/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId: parseInt(messageId) || null, rating, feedbackType: 'thumbs' }) }); } catch {}
  };

  const filteredSessions = searchQuery
    ? sessions.filter(s => s.label.toLowerCase().includes(searchQuery.toLowerCase()) || s.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase())))
    : sessions;

  const currentMode = MODES.find(m => m.id === activeMode) || MODES[0];

  // ═══════════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div style={{
      display: 'flex', height: '100vh', background: T.bg,
      fontFamily: T.body, color: T.ink, overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,700&family=Inter:wght@300;400;500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .ws-scroll::-webkit-scrollbar { width: 4px; }
        .ws-scroll::-webkit-scrollbar-track { background: transparent; }
        .ws-scroll::-webkit-scrollbar-thumb { background: ${T.hairline}; border-radius: 2px; }
      `}</style>

      {/* ═══════════════ LEFT SIDEBAR ═══════════════ */}
      {/* On mobile (< 768px) the sidebar overlays the main panel */}
      {sidebarOpen && (
        <div style={{
          width: 280, flexShrink: 0,
          background: T.sidebar,
          borderRight: `1px solid ${T.hairline}`,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          // Mobile overlay behavior
          ...(typeof window !== 'undefined' && window.innerWidth < 768 ? {
            position: 'absolute' as const,
            top: 0, left: 0, bottom: 0,
            zIndex: 50,
            boxShadow: '8px 0 32px rgba(0,0,0,0.5)',
          } : {}),
        }}>
          {/* Sidebar header */}
          <div style={{ padding: '16px 18px', borderBottom: `1px solid ${T.hairline}` }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Home size={14} color={T.inkMuted} />
              <span style={{ fontSize: 11, color: T.inkMuted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Back to Simpleton</span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: T.display, fontSize: 20, fontStyle: 'italic', color: T.gold }}>S</span>
              <div>
                <div style={{ fontFamily: T.display, fontSize: 15, color: T.ink }}>
                  <span style={{ fontStyle: 'italic', color: T.gold }}>Simplicity</span>
                </div>
                <div style={{ fontSize: 9, color: T.inkMuted, letterSpacing: '0.2em', textTransform: 'uppercase' }}>AI Workspace</div>
              </div>
            </div>
          </div>

          {/* New chat button */}
          <div style={{ padding: '12px 14px' }}>
            <button onClick={() => createSession()} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 3,
              background: 'rgba(201,168,76,0.06)', border: `1px solid ${T.gold}33`,
              cursor: 'pointer', fontFamily: T.display, fontSize: 12,
              fontStyle: 'italic', color: T.gold, transition: 'all 0.2s',
            }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.12)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.06)'; }}
            >
              <Plus size={14} />
              New conversation
            </button>
          </div>

          {/* Search */}
          <div style={{ padding: '0 14px 10px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} color={T.inkMuted} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                style={{
                  width: '100%', padding: '8px 10px 8px 32px', fontSize: 12,
                  background: 'rgba(244,239,226,0.03)', border: `1px solid ${T.hairline}`,
                  borderRadius: 2, color: T.ink, outline: 'none', fontFamily: T.body,
                }}
                onFocus={e => { e.currentTarget.style.borderColor = T.gold; }}
                onBlur={e => { e.currentTarget.style.borderColor = T.hairline; }}
              />
            </div>
          </div>

          {/* Session list */}
          <div className="ws-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 10px' }}>
            {filteredSessions.map(s => {
              const isActive = s.id === activeSessionId;
              const ModeIcon = MODES.find(m => m.id === s.mode)?.icon || Brain;
              const modeColor = MODES.find(m => m.id === s.mode)?.color || T.gold;
              return (
                <div key={s.id}
                  onClick={() => { setActiveSessionId(s.id); setActiveMode(s.mode); if (window.innerWidth < 768) setSidebarOpen(false); }}
                  style={{
                    padding: '10px 12px', marginBottom: 4, borderRadius: 3, cursor: 'pointer',
                    background: isActive ? 'rgba(201,168,76,0.08)' : 'transparent',
                    borderLeft: isActive ? `2px solid ${T.gold}` : '2px solid transparent',
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                  }}
                  onMouseOver={e => { if (!isActive) e.currentTarget.style.background = 'rgba(244,239,226,0.03)'; }}
                  onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <ModeIcon size={14} color={modeColor} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 12, color: isActive ? T.ink : T.inkMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: 10, color: T.inkMuted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.messages[s.messages.length - 1]?.content.slice(0, 50)}
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, opacity: 0.3, transition: 'opacity 0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.opacity = '1'; }}
                    onMouseOut={e => { e.currentTarget.style.opacity = '0.3'; }}
                  >
                    <Trash2 size={12} color={T.inkMuted} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════ MAIN PANEL ═══════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── Top mode tabs ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '0 20px',
          borderBottom: `1px solid ${T.hairline}`,
          background: T.panel,
          height: 48, flexShrink: 0,
        }}>
          {/* Sidebar toggle */}
          <button onClick={() => setSidebarOpen(o => !o)} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px',
            color: T.inkMuted, marginRight: 14, transition: 'color 0.2s',
          }}
            onMouseOver={e => { e.currentTarget.style.color = T.gold; }}
            onMouseOut={e => { e.currentTarget.style.color = T.inkMuted; }}
          >
            {sidebarOpen ? <ArrowLeft size={16} /> : <Brain size={16} />}
          </button>

          {/* Mode tabs — scrollable on mobile */}
          <div style={{ display: 'flex', gap: 2, flex: 1, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {MODES.map(mode => {
              const Icon = mode.icon;
              const isActive = activeMode === mode.id;
              return (
                <button key={mode.id}
                  onClick={() => { setActiveMode(mode.id); if (activeSession) { setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, mode: mode.id } : s)); } }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '8px 16px', borderRadius: '3px 3px 0 0',
                    background: isActive ? T.bg : 'transparent',
                    border: isActive ? `1px solid ${T.hairline}` : '1px solid transparent',
                    borderBottom: isActive ? `1px solid ${T.bg}` : '1px solid transparent',
                    cursor: 'pointer', fontSize: 12,
                    color: isActive ? mode.color : T.inkMuted,
                    fontWeight: isActive ? 600 : 400,
                    letterSpacing: '0.04em',
                    transition: 'all 0.15s',
                    marginBottom: -1,
                  }}
                  onMouseOver={e => { if (!isActive) e.currentTarget.style.color = mode.color; }}
                  onMouseOut={e => { if (!isActive) e.currentTarget.style.color = T.inkMuted; }}
                >
                  <Icon size={14} />
                  {mode.label}
                </button>
              );
            })}
          </div>

          {/* Voice toggle */}
          <button onClick={() => setVoiceEnabled(!voiceEnabled)} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 6,
            color: voiceEnabled ? T.gold : T.inkMuted, transition: 'color 0.2s',
          }}>
            {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
        </div>

        {/* ── Mode description bar ── */}
        <div style={{
          padding: '8px 24px',
          fontSize: 11, fontStyle: 'italic', fontFamily: T.serif,
          color: T.inkMuted, borderBottom: `1px solid ${T.hairline}`,
          background: 'rgba(244,239,226,0.01)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <currentMode.icon size={12} color={currentMode.color} />
          {currentMode.description}
        </div>

        {/* ── Messages / Welcome ── */}
        <div className="ws-scroll" style={{
          flex: 1, overflowY: 'auto', padding: '24px 0',
        }}>
          {/* ── WELCOME HERO (empty state) ── */}
          {messages.length <= 1 && !isLoading && (
            <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px 24px', textAlign: 'center' }}>
              {/* Monogram + Name */}
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                border: `1.5px solid ${currentMode.color}44`,
                background: `${currentMode.color}0a`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <span style={{
                  fontFamily: T.display, fontSize: 36, fontWeight: 400,
                  fontStyle: 'italic', color: currentMode.color, lineHeight: 1,
                }}>S</span>
              </div>
              <h1 style={{
                fontFamily: T.display, fontSize: 32, fontWeight: 400,
                color: T.ink, margin: '0 0 8px', letterSpacing: '-0.01em',
              }}>
                <span style={{ fontStyle: 'italic', color: currentMode.color }}>Simplicity</span>
                {activeMode !== 'general' && (
                  <span style={{ color: T.inkMuted }}> — {currentMode.label}</span>
                )}
              </h1>
              <p style={{
                fontFamily: T.serif, fontSize: 16, fontStyle: 'italic',
                color: T.inkMuted, lineHeight: 1.7, margin: '0 auto 40px',
                maxWidth: 480,
              }}>
                {currentMode.description}
              </p>

              {/* Suggested prompts grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 10, textAlign: 'left',
              }}>
                {currentMode.prompts.map((prompt, i) => (
                  <button key={i}
                    onClick={() => {
                      if (!activeSessionId) createSession();
                      const userMsg: Msg = { id: Date.now().toString(), type: 'user', content: prompt, timestamp: new Date() };
                      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, userMsg] } : s));
                      sendMessage(prompt);
                    }}
                    style={{
                      padding: '14px 16px',
                      background: 'rgba(244,239,226,0.02)',
                      border: `1px solid ${T.hairline}`,
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 13, fontFamily: T.body,
                      color: T.ink, lineHeight: 1.5,
                      transition: 'all 0.2s',
                      textAlign: 'left',
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.borderColor = `${currentMode.color}66`;
                      e.currentTarget.style.background = `${currentMode.color}08`;
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.borderColor = T.hairline;
                      e.currentTarget.style.background = 'rgba(244,239,226,0.02)';
                    }}
                  >
                    <div style={{ fontSize: 11, color: currentMode.color, marginBottom: 4, fontFamily: T.serif, fontStyle: 'italic' }}>
                      Try asking
                    </div>
                    {prompt}
                  </button>
                ))}
              </div>

              <div style={{
                marginTop: 32, fontSize: 11, color: T.inkMuted,
                fontFamily: T.serif, fontStyle: 'italic',
              }}>
                Or type anything below — Simplicity knows far more than markets.
              </div>
            </div>
          )}

          {/* ── CHAT MESSAGES (active conversation) ── */}
          {(messages.length > 1 || isLoading) && (
          <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>
            {messages.filter(m => m.id !== '1').map((msg) => {
              const isUser = msg.type === 'user';
              return (
                <div key={msg.id} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '80%' }}>
                      <div style={{
                        padding: '14px 20px',
                        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: isUser ? T.goldBubble : T.assistBubble,
                        border: `1px solid ${isUser ? T.gold + '22' : T.hairline}`,
                        fontSize: 14, lineHeight: 1.7,
                      }}>
                        {msg.imageUrl && (
                          <img src={msg.imageUrl} alt="" style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 8, marginBottom: 12, border: `1px solid ${T.hairline}` }} />
                        )}
                        {msg.type === 'assistant' && msg.streaming && !msg.content ? (
                          <TypingIndicator />
                        ) : msg.type === 'assistant' ? (
                          <div>
                            <ProseRenderer content={msg.content} className="text-sm" />
                          </div>
                        ) : (
                          <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{msg.content}</p>
                        )}

                        {msg.type === 'assistant' && !msg.streaming && msg.content && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${T.hairline}` }}>
                            <button onClick={() => sendFeedback(msg.id, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: feedbackGiven[msg.id] === 'up' ? '#6ec29a' : T.inkMuted }}>
                              <ThumbsUp size={13} />
                            </button>
                            <button onClick={() => sendFeedback(msg.id, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: feedbackGiven[msg.id] === 'down' ? '#d96d5e' : T.inkMuted }}>
                              <ThumbsDown size={13} />
                            </button>
                            {voiceEnabled && (
                              <button onClick={() => handleSpeak(msg)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: speakingMessageId === msg.id ? T.gold : T.inkMuted }}>
                                {speakingMessageId === msg.id ? <Square size={13} /> : <Volume2 size={13} />}
                              </button>
                            )}
                            <span style={{ marginLeft: 'auto', fontSize: 10, color: T.inkMuted }}>{formatTime(msg.timestamp)}</span>
                          </div>
                        )}
                      </div>
                      {isUser && <div style={{ fontSize: 9, color: T.inkMuted, marginTop: 4, textAlign: 'right' }}>{formatTime(msg.timestamp)}</div>}
                    </div>
                  </div>
                </div>
              );
            })}
            {isLoading && !messages.some(m => m.streaming) && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 20 }}>
                <div style={{ padding: '14px 20px', borderRadius: '16px 16px 16px 4px', background: T.assistBubble, border: `1px solid ${T.hairline}` }}>
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          )}
        </div>

        {/* ── Input bar ── */}
        <div style={{
          padding: '16px 24px 20px',
          borderTop: `1px solid ${T.hairline}`,
          background: T.panel,
        }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            {imagePreview && (
              <div style={{ marginBottom: 10, position: 'relative', display: 'inline-block' }}>
                <img src={imagePreview} alt="" style={{ maxHeight: 80, borderRadius: 4, border: `1px solid ${T.hairline}` }} />
                <button onClick={() => setImagePreview(null)} style={{
                  position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%',
                  background: '#d96d5e', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}>
                  <X size={11} />
                </button>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => setImagePreview(ev.target?.result as string); r.readAsDataURL(f); } e.target.value = ''; }} />
              <button onClick={() => fileInputRef.current?.click()} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: T.inkMuted, transition: 'color 0.2s', flexShrink: 0,
              }}
                onMouseOver={e => { e.currentTarget.style.color = T.gold; }}
                onMouseOut={e => { e.currentTarget.style.color = T.inkMuted; }}
              >
                <ImagePlus size={18} />
              </button>

              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask Simplicity (${currentMode.label} mode)...`}
                rows={1}
                style={{
                  flex: 1, resize: 'none',
                  padding: '12px 16px', fontSize: 14,
                  background: 'rgba(244,239,226,0.04)',
                  border: `1px solid ${T.hairline}`,
                  borderRadius: 3, color: T.ink,
                  fontFamily: T.body, outline: 'none',
                  lineHeight: 1.5,
                  minHeight: 44, maxHeight: 200,
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = T.gold; }}
                onBlur={e => { e.currentTarget.style.borderColor = T.hairline; }}
              />

              <button onClick={handleSend} disabled={isLoading && !abortRef.current}
                style={{
                  width: 44, height: 44, borderRadius: 3, flexShrink: 0,
                  background: T.gold, border: `1px solid ${T.gold}`,
                  color: '#0b0b12', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: isLoading ? 'default' : 'pointer', transition: 'all 0.2s',
                }}
                onMouseOver={e => { if (!isLoading) e.currentTarget.style.background = T.goldDeep; }}
                onMouseOut={e => { e.currentTarget.style.background = T.gold; }}
              >
                {isLoading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={18} />}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: T.inkMuted }}>
              <span style={{ fontFamily: T.serif, fontStyle: 'italic' }}>
                Powered by Simplicity
              </span>
              <span>
                Enter to send · Shift+Enter for new line
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
