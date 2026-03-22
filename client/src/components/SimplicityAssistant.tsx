import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, X, Loader2, Calculator, Navigation, Brain, Sparkles, Zap, Camera, ImagePlus, ChevronDown, ChevronUp, Printer, History, Gem, Watch, TrendingUp, Volume2, VolumeX, Square, ThumbsUp, ThumbsDown } from 'lucide-react';
import { BrainProcessing, TypingIndicator } from '@/components/ui/loading-animations';
import { useVoicePreference } from '@/hooks/use-voice-preference';
import { playSimplicityVoice, stopSimplicityVoice } from '@/lib/simplicity-voice';
import { playSimplicityDing, prewarmDing } from '@/lib/simplicity-ding';

interface SimplicityChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  metadata?: {
    providers?: string[];
    confidence?: number;
    processingTime?: number;
    appraisalType?: string;
    fim?: boolean;
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
  weight: '', karat: '', clarity: '', color: '', cut: '',
  caratWeight: '', condition: '', brand: '', model: '',
  year: '', certification: '', other: ''
};

interface QuickAction {
  text: string;
  icon: any;
}

const PAGE_QUICK_ACTIONS: Record<string, QuickAction[]> = {
  '/diamonds': [
    { text: "Explain the 4Cs of diamond grading", icon: Gem },
    { text: "What's the difference between GIA and IGI certification?", icon: Gem },
    { text: "How do lab-grown diamonds compare to natural?", icon: Gem },
    { text: "What diamond shape holds the most value?", icon: TrendingUp },
  ],
  '/diamond-calculator': [
    { text: "How do I calculate diamond value from the 4Cs?", icon: Calculator },
    { text: "Why do prices jump at 1 carat?", icon: TrendingUp },
    { text: "What's a good diamond for an engagement ring under $5,000?", icon: Gem },
  ],
  '/watches': [
    { text: "How do I identify a Rolex model?", icon: Watch },
    { text: "Which Rolex models appreciate the most?", icon: TrendingUp },
    { text: "What's the difference between Caliber 3135 and 3235?", icon: Watch },
    { text: "Tell me about the Rolex Daytona history", icon: Watch },
  ],
  '/rolex-market-data': [
    { text: "Which Rolex is the best investment right now?", icon: TrendingUp },
    { text: "Why are discontinued Rolex models so expensive?", icon: Watch },
    { text: "How has the Submariner price changed over 15 years?", icon: TrendingUp },
  ],
  '/calculator': [
    { text: "How do I convert troy ounces to grams?", icon: Calculator },
    { text: "What's the melt value of a 14K gold chain?", icon: Calculator },
    { text: "Explain the difference between spot price and premium", icon: TrendingUp },
    { text: "How to calculate the silver content in pre-1965 coins", icon: Calculator },
  ],
  '/database': [
    { text: "What makes a Morgan Silver Dollar valuable?", icon: MessageCircle },
    { text: "Explain the Sheldon grading scale", icon: MessageCircle },
    { text: "What are the most valuable US gold coins?", icon: TrendingUp },
    { text: "How do PCGS and NGC grading differ?", icon: MessageCircle },
  ],
  '/education': [
    { text: "Where should a beginner start with precious metals?", icon: Navigation },
    { text: "What's the safest way to store gold and silver?", icon: Navigation },
    { text: "How do precious metals IRAs work?", icon: TrendingUp },
  ],
};

const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  { text: "What's the difference between 14K and 18K gold?", icon: MessageCircle },
  { text: "Tell me about Morgan Silver Dollars", icon: Calculator },
  { text: "How are diamonds graded? Explain the 4Cs", icon: Gem },
  { text: "What makes a Rolex Submariner valuable?", icon: Watch },
];

function getSessionToken(): string {
  const key = 'simplicity_session_token';
  let token = localStorage.getItem(key);
  if (!token) {
    token = 'sv_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem(key, token);
  }
  return token;
}

export function SimplicityAssistant() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [itemDetails, setItemDetails] = useState<ItemDetails>(emptyDetails);
  const [isReturning, setIsReturning] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionTokenRef = useRef<string>(getSessionToken());

  const defaultGreeting: SimplicityChatMessage = {
    id: '1',
    type: 'assistant',
    content: "Hi! I'm Simplicity, your expert AI assistant for all things precious metals, coins, diamonds, gemstones, and luxury watches.\n\nTake a photo or upload an image of any item and I'll give you a professional appraisal with real market-based pricing! Add details like weight, karat, or clarity for an even more accurate valuation.\n\nHow can I help you today?",
    timestamp: new Date(),
  };

  const [messages, setMessages] = useState<SimplicityChatMessage[]>([defaultGreeting]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [speakingLoading, setSpeakingLoading] = useState<string | null>(null);
  const { voiceEnabled, setVoiceEnabled } = useVoicePreference();
  const isMuted = !voiceEnabled;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const lastSpokenIdRef = useRef<string | null>(null);
  const hasSpokenGreetingRef = useRef(false);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'up' | 'down'>>({});

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    cleanupAudio();
    stopSimplicityVoice();
    setSpeakingMessageId(null);
    setSpeakingLoading(null);
  }, [cleanupAudio]);

  const isMutedRef = useRef(isMuted);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  const audioUnlockedRef = useRef(false);
  const unlockAudio = useCallback(() => {
    if (audioUnlockedRef.current) return;
    audioUnlockedRef.current = true;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(0);
        osc.stop(ctx.currentTime + 0.01);
        setTimeout(() => ctx.close().catch(() => {}), 200);
      }
      const silent = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7kGQAAANUMEoFPeACNQV40KEABEJ0ov5HhOR2QjR3GHBGLAAAAEb/e3eFZuYCSEloIAABMADAAUABAAtMPe+D7LnNjmQGhqPwAAB1TUHBocBE44QCAoYIoLGIQSjEYBDggKkfB8DwPD5BkEAQ8DUBc5QDdAIGA0IfBkCQ');
      silent.volume = 0.01;
      silent.play().then(() => silent.pause()).catch(() => {});
      prewarmDing();
    } catch {}
  }, []);

  const handleSpeak = useCallback(async (message: SimplicityChatMessage) => {
    if (speakingMessageId === message.id) {
      stopSpeaking();
      return;
    }
    stopSpeaking();
    setSpeakingLoading(message.id);
    try {
      if (isMutedRef.current) { setSpeakingLoading(null); return; }

      const response = await fetch('/api/assistant/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message.content }),
      });

      if (isMutedRef.current) { setSpeakingLoading(null); return; }

      const contentType = response.headers.get('content-type') || '';

      if (response.ok && contentType.includes('audio')) {
        // Real audio stream (future-proof for when a real TTS API is available)
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        cleanupAudio();
        audioUrlRef.current = url;
        const audio = new Audio(url);
        audio.preload = 'auto';
        audioRef.current = audio;

        await new Promise<void>((resolve) => {
          audio.oncanplaythrough = () => resolve();
          audio.onerror = () => resolve();
          setTimeout(() => resolve(), 3000);
        });

        if (isMutedRef.current) { cleanupAudio(); setSpeakingLoading(null); return; }

        setSpeakingMessageId(message.id);
        setSpeakingLoading(null);
        audio.onended = () => { setSpeakingMessageId(null); cleanupAudio(); };
        audio.onerror = () => { setSpeakingMessageId(null); setSpeakingLoading(null); cleanupAudio(); };
        await audio.play().catch(() => { setSpeakingMessageId(null); setSpeakingLoading(null); cleanupAudio(); });
      } else {
        // Browser TTS — use Simplicity Voice utility
        setSpeakingMessageId(message.id);
        setSpeakingLoading(null);
        playSimplicityVoice(message.content, {
          volume: 0.85,
          rate: 0.95,
          pitch: 1.10,
          onEnd: () => setSpeakingMessageId(null),
          onError: () => setSpeakingMessageId(null),
        });
      }
    } catch {
      setSpeakingLoading(null);
      setSpeakingMessageId(null);
    }
  }, [speakingMessageId, stopSpeaking, cleanupAudio]);

  useEffect(() => {
    return () => { stopSpeaking(); };
  }, [stopSpeaking]);

  useEffect(() => {
    if (!isOpen || isMuted || isLoading) return;
    if (!hasSpokenGreetingRef.current && messages.length === 1 && messages[0].id === '1') {
      hasSpokenGreetingRef.current = true;
      lastSpokenIdRef.current = '1';
      const timer = setTimeout(() => {
        if (!isMutedRef.current) handleSpeak(messages[0]);
      }, 600);
      return () => clearTimeout(timer);
    }
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.type !== 'assistant' || lastMessage.content.length < 10) return;
    if (lastMessage.id === lastSpokenIdRef.current) return;
    lastSpokenIdRef.current = lastMessage.id;
    const timer = setTimeout(() => {
      if (!isMutedRef.current) handleSpeak(lastMessage);
    }, 300);
    return () => clearTimeout(timer);
  }, [messages, isMuted, isOpen, isLoading, handleSpeak]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadSession = useCallback(async () => {
    if (historyLoaded) return;
    setIsLoadingHistory(true);
    try {
      const response = await fetch('/api/assistant/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken: sessionTokenRef.current,
          page: location,
        })
      });
      if (!response.ok) return;
      const data = await response.json();

      if (data.isReturning && data.history && data.history.length > 0) {
        setIsReturning(true);
        const loadedMessages: SimplicityChatMessage[] = data.history.map((m: any) => ({
          id: m.id,
          type: m.type,
          content: m.content,
          timestamp: new Date(m.timestamp),
          metadata: m.metadata || undefined,
        }));

        const welcomeBack: SimplicityChatMessage = {
          id: 'wb_' + Date.now(),
          type: 'assistant',
          content: `Welcome back! I remember our previous conversations. I'm ready to pick up where we left off or help with something new.\n\nYou can ask me anything, or snap a photo for an instant appraisal.`,
          timestamp: new Date(),
        };

        setMessages([...loadedMessages, welcomeBack]);
        lastSpokenIdRef.current = welcomeBack.id;
      }
    } catch (err) {
      console.log('Session load skipped');
    } finally {
      setHistoryLoaded(true);
      setIsLoadingHistory(false);
    }
  }, [historyLoaded, location]);

  useEffect(() => {
    if (isOpen && !historyLoaded) {
      loadSession();
    }
  }, [isOpen, historyLoaded, loadSession]);

  const hasDetails = Object.values(itemDetails).some(v => v.trim() !== '');

  const handleImageSelect = (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      alert('Image must be under 20MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
    e.target.value = '';
  };

  const clearImage = () => {
    setImagePreview(null);
    setShowDetails(false);
    setItemDetails(emptyDetails);
  };

  const sendAppraisal = async () => {
    if (!imagePreview || isLoading) return;
    setIsLoading(true);

    const detailsSummary = hasDetails 
      ? '\n\nItem Details: ' + Object.entries(itemDetails).filter(([,v]) => v.trim()).map(([k,v]) => `${k}: ${v}`).join(', ')
      : '';

    const userMessage: SimplicityChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: (input.trim() || 'Please appraise this item') + detailsSummary,
      timestamp: new Date(),
      imageUrl: imagePreview,
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/assistant/appraise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imagePreview,
          message: input.trim() || '',
          itemDetails: hasDetails ? itemDetails : undefined,
          sessionToken: sessionTokenRef.current,
          pageContext: location,
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      const assistantMessage: SimplicityChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response || "I couldn't generate an appraisal. Please try with a clearer image.",
        timestamp: new Date(),
        metadata: {
          providers: data.activeProviders || [],
          confidence: data.confidenceScore || 0,
          processingTime: data.processingTime || 0,
          appraisalType: 'Professional AI Appraisal'
        }
      };
      setMessages(prev => [...prev, assistantMessage]);
      playSimplicityDing();
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm having trouble analyzing your image right now. Please ensure the image is clear and well-lit, then try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
      clearImage();
      setInput('');
    }
  };

  const sendTextMessage = async (userMessage: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/assistant/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: 'full_expert',
          sessionToken: sessionTokenRef.current,
          pageContext: location,
        })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'assistant',
        content: data.response || "I received your message but couldn't generate a proper response.",
        timestamp: new Date(),
        metadata: {
          providers: data.activeProviders || [],
          confidence: data.confidenceScore || 0,
          processingTime: data.processingTime || 0,
          fim: data.fim || false,
          toolsUsed: data.toolsUsed || [],
        }
      }]);
      playSimplicityDing();
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    unlockAudio();
    if (isLoading) return;
    if (imagePreview) {
      sendAppraisal();
      return;
    }
    if (!input.trim()) return;
    const userMessage: SimplicityChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    sendTextMessage(input.trim());
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = PAGE_QUICK_ACTIONS[location] || DEFAULT_QUICK_ACTIONS;

  const updateDetail = (key: keyof ItemDetails, value: string) => {
    setItemDetails(prev => ({ ...prev, [key]: value }));
  };

  const sendFeedback = async (messageId: string, rating: 1 | -1) => {
    const type = rating === 1 ? 'up' : 'down';
    setFeedbackGiven(prev => ({ ...prev, [messageId]: type }));
    try {
      await fetch('/api/simplicity/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: parseInt(messageId) || null,
          sessionId: null,
          rating,
          feedbackType: 'thumbs',
        }),
      });
    } catch (e) {}
  };

  const handlePrintAppraisal = (message: SimplicityChatMessage) => {
    const userImg = messages.find(
      (m) => m.type === 'user' && m.imageUrl && messages.indexOf(m) < messages.indexOf(message)
    );
    const imageHtml = userImg?.imageUrl
      ? `<div style="text-align:center;margin-bottom:20px;"><img src="${userImg.imageUrl}" style="max-width:300px;max-height:300px;border-radius:8px;border:2px solid #7c3aed;" /></div>`
      : '';

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Simpleton - Professional Appraisal Report</title>
  <style>
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .no-print { display: none !important; } }
    body { font-family: Georgia, 'Times New Roman', serif; max-width: 700px; margin: 0 auto; padding: 40px 30px; color: #1a1a1a; line-height: 1.6; }
    .header { text-align: center; border-bottom: 3px double #7c3aed; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { font-size: 24px; color: #7c3aed; margin: 0 0 4px 0; letter-spacing: 1px; }
    .header .subtitle { font-size: 13px; color: #6b7280; margin: 0; }
    .header .date { font-size: 12px; color: #9ca3af; margin-top: 8px; }
    .report-body { white-space: pre-wrap; font-size: 14px; line-height: 1.8; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 2px solid #e5e7eb; text-align: center; font-size: 11px; color: #9ca3af; }
    .footer .brand { color: #7c3aed; font-weight: bold; }
    .print-btn { display: block; margin: 0 auto 30px; padding: 10px 32px; background: #7c3aed; color: white; border: none; border-radius: 8px; font-size: 15px; cursor: pointer; }
    .print-btn:hover { background: #6d28d9; }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">Print Report</button>
  <div class="header">
    <h1>SIMPLETON&trade;</h1>
    <p class="subtitle">Professional AI Appraisal Report</p>
    <p class="date">${new Date(message.timestamp).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} &bull; ${new Date(message.timestamp).toLocaleTimeString()}</p>
  </div>
  ${imageHtml}
  <div class="report-body">${message.content}</div>
  <div class="footer">
    <p><span class="brand">Simpleton&trade;</span> &mdash; Precision Pricing, Simplified</p>
    <p>This appraisal is generated using AI analysis with live market pricing data and is for informational purposes only. It does not constitute a certified or legally binding appraisal.</p>
  </div>
</body>
</html>`);
    printWindow.document.close();
  };

  const showQuickActions = messages.length <= 2 && !isReturning && !imagePreview;

  return (
    <>
      {!isOpen && (
        <div className="fixed z-50" style={{ bottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))', right: '1rem' }}>
          <div
            onClick={() => { unlockAudio(); setIsOpen(true); }}
            className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center cursor-pointer bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-transform duration-300 relative"
            data-testid="button-simplicity-assistant"
          >
            <Brain className="w-7 h-7 sm:w-8 sm:h-8 text-white animate-pulse" style={{animationDuration: '4s'}} />
            {/* Voice state indicator */}
            <button
              onClick={(e) => { e.stopPropagation(); setVoiceEnabled(!voiceEnabled); }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                background: voiceEnabled ? 'rgba(134,239,172,0.95)' : 'rgba(239,68,68,0.95)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
              }}
              title={voiceEnabled ? "Voice on — click to mute" : "Voice off — click to unmute"}
            >
              {voiceEnabled
                ? <Volume2 className="w-2.5 h-2.5 text-green-900" />
                : <VolumeX className="w-2.5 h-2.5 text-white" />
              }
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <Card className="fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-4 w-full sm:w-[400px] sm:max-w-[calc(100vw-2rem)] h-full sm:h-[650px] sm:max-h-[calc(100vh-2rem)] shadow-2xl border-0 z-[110] flex flex-col sm:rounded-2xl overflow-hidden simplicity-assistant"
             style={{ backgroundColor: '#ffffff', color: '#1a1a1a' }}>
          <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 text-white p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 relative">
                <Brain className="w-6 h-6 text-white relative z-10" />
                <Sparkles className="w-3 h-3 text-cyan-200 absolute -top-0.5 -right-0.5 animate-bounce" />
                <Zap className="w-2 h-2 text-purple-200 absolute -bottom-0.5 -left-0.5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold text-lg" style={{ color: '#ffffff' }}>Simplicity</h3>
                <p className="text-sm opacity-90" style={{ color: '#e9d5ff' }}>
                  {isReturning ? 'Remembers you' : 'AI Expert & Appraiser'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                onClick={() => {
                  if (!isMuted) {
                    stopSpeaking();
                    setVoiceEnabled(false);
                  } else {
                    setVoiceEnabled(true);
                    const lastAssistant = [...messages].reverse().find(m => m.type === 'assistant');
                    if (lastAssistant) {
                      lastSpokenIdRef.current = null;
                      setTimeout(() => handleSpeak(lastAssistant), 200);
                    }
                  }
                }}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 hover:scale-110 transition-all duration-200 h-9 w-9 p-0 rounded-full"
                title={isMuted ? 'Turn voice on' : 'Turn voice off'}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <Button 
                onClick={() => setIsOpen(false)}
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-white/20 hover:scale-110 transition-all duration-200 h-9 w-9 p-0 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ backgroundColor: '#f8f9fa' }}>
            {isLoadingHistory && (
              <div className="flex justify-center py-4">
                <div className="flex items-center space-x-2 px-4 py-2 rounded-full" style={{ backgroundColor: '#f3f0ff' }}>
                  <History className="w-4 h-4 animate-spin" style={{ color: '#7c3aed' }} />
                  <span className="text-xs font-medium" style={{ color: '#7c3aed' }}>Loading your conversation history...</span>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[88%] p-3 rounded-2xl shadow-sm ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                      : 'border border-gray-100'
                  }`}
                  style={{ 
                    backgroundColor: message.type === 'user' ? undefined : '#ffffff',
                    color: message.type === 'user' ? '#ffffff' : '#1a1a1a'
                  }}
                >
                  {message.imageUrl && (
                    <div className="mb-2 rounded-lg overflow-hidden">
                      <img src={message.imageUrl} alt="Uploaded item" className="w-full max-h-48 object-cover rounded-lg" />
                    </div>
                  )}
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                  
                  {message.metadata && message.type === 'assistant' && (
                    <div className="mt-2 pt-2 border-t text-xs" style={{ borderColor: '#e5e7eb', color: '#6b7280' }}>
                      <div className="flex flex-wrap gap-2 items-center">
                        {message.metadata.appraisalType && (
                          <span className="flex items-center gap-1 font-medium" style={{ color: '#7c3aed' }}>
                            <Camera className="w-3 h-3" />
                            {message.metadata.appraisalType}
                          </span>
                        )}
                        {message.metadata.providers && message.metadata.providers.length > 0 && (
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            {message.metadata.providers.join(', ')}
                          </span>
                        )}
                        {message.metadata.confidence ? (
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            {message.metadata.confidence}% confidence
                          </span>
                        ) : null}
                        {message.metadata.fim && message.metadata.toolsUsed && message.metadata.toolsUsed.length > 0 && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide" style={{ background: 'linear-gradient(90deg,#059669,#0d9488)', color: '#fff' }}>
                            <Zap className="w-2.5 h-2.5" />
                            Live Tools
                          </span>
                        )}
                        {message.metadata.fim && (!message.metadata.toolsUsed || message.metadata.toolsUsed.length === 0) && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide" style={{ background: 'linear-gradient(90deg,#4f46e5,#7c3aed)', color: '#fff' }}>
                            <Zap className="w-2.5 h-2.5" />
                            DeepSeek Beta
                          </span>
                        )}
                        {message.metadata.appraisalType && (
                          <button
                            onClick={() => handlePrintAppraisal(message)}
                            className="flex items-center gap-1 ml-auto px-2 py-1 rounded-md transition-all duration-200 hover:scale-105"
                            style={{ backgroundColor: '#f3f0ff', color: '#7c3aed', border: '1px solid #ddd6fe' }}
                            title="Print Appraisal Report"
                          >
                            <Printer className="w-3 h-3" />
                            <span className="font-medium">Print</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs" style={{ color: message.type === 'user' ? '#e9d5ff' : '#9ca3af' }}>
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    <div className="flex items-center gap-1">
                      {message.type === 'assistant' && message.id !== '1' && (
                        feedbackGiven[message.id] ? (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ 
                            backgroundColor: feedbackGiven[message.id] === 'up' ? '#dcfce7' : '#fee2e2',
                            color: feedbackGiven[message.id] === 'up' ? '#16a34a' : '#dc2626'
                          }}>
                            {feedbackGiven[message.id] === 'up' ? '👍' : '👎'}
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => sendFeedback(message.id, 1)}
                              className="p-1 rounded-full transition-all duration-200 hover:scale-110"
                              style={{ color: '#9ca3af' }}
                              title="Helpful response"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => sendFeedback(message.id, -1)}
                              className="p-1 rounded-full transition-all duration-200 hover:scale-110"
                              style={{ color: '#9ca3af' }}
                              title="Not helpful"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )
                      )}
                      {message.type === 'assistant' && (speakingMessageId === message.id || speakingLoading === message.id) && (
                        <button
                          onClick={() => stopSpeaking()}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all duration-200 hover:scale-105"
                          style={{
                            backgroundColor: '#ede9fe',
                            color: '#7c3aed',
                            border: '1px solid #c4b5fd',
                          }}
                          title="Stop speaking"
                        >
                          {speakingLoading === message.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Volume2 className="w-3 h-3 animate-pulse" />
                          )}
                          <span className="font-medium">
                            {speakingLoading === message.id ? 'Loading...' : 'Speaking...'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-3" style={{ backgroundColor: '#ffffff' }}>
                  <BrainProcessing className="w-5 h-5" />
                  <span className="text-sm" style={{ color: '#4b5563' }}>
                    {imagePreview ? 'Analyzing & appraising...' : 'Simplicity is thinking...'}
                  </span>
                  <TypingIndicator className="ml-2" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {showQuickActions && (
            <div className="p-4 border-t flex-shrink-0" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
              <p className="text-xs font-medium mb-2" style={{ color: '#374151' }}>Quick questions or snap a photo for appraisal:</p>
              <div className="grid grid-cols-1 gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        type: 'user',
                        content: action.text,
                        timestamp: new Date(),
                      }]);
                      sendTextMessage(action.text);
                    }}
                    className="text-xs h-9 justify-start hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
                    style={{ color: '#1a1a1a', borderColor: '#d1d5db', backgroundColor: '#ffffff' }}
                    disabled={isLoading}
                  >
                    <action.icon className="w-3 h-3 mr-2 text-purple-600 flex-shrink-0" />
                    <span className="text-left truncate">{action.text}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {imagePreview && (
            <div className="p-3 border-t flex-shrink-0" style={{ backgroundColor: '#f3f0ff', borderColor: '#e5e7eb' }}>
              <div className="flex items-start gap-2 mb-2">
                <div className="relative flex-shrink-0">
                  <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border-2 border-purple-400" />
                  <button 
                    onClick={clearImage}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ backgroundColor: '#ef4444' }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium" style={{ color: '#7c3aed' }}>Image ready for appraisal</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>Add details below for a more accurate valuation</p>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-1 mt-1 text-xs font-medium"
                    style={{ color: '#7c3aed' }}
                  >
                    {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {showDetails ? 'Hide details' : 'Add item details (optional)'}
                  </button>
                </div>
              </div>

              {showDetails && (
                <div className="grid grid-cols-2 gap-1.5 mt-2 max-h-[180px] overflow-y-auto pr-1">
                  {[
                    { key: 'weight', placeholder: 'Weight (e.g., 14.5g, 1oz)' },
                    { key: 'karat', placeholder: 'Karat (e.g., 14K, 18K, .999)' },
                    { key: 'caratWeight', placeholder: 'Carat (diamond, e.g., 1.5ct)' },
                    { key: 'clarity', placeholder: 'Clarity (e.g., VS1, SI2)' },
                    { key: 'color', placeholder: 'Color (e.g., G, H, D)' },
                    { key: 'cut', placeholder: 'Cut (e.g., Excellent, Good)' },
                    { key: 'brand', placeholder: 'Brand (e.g., Rolex, Tiffany)' },
                    { key: 'model', placeholder: 'Model (e.g., Submariner)' },
                    { key: 'condition', placeholder: 'Condition (e.g., Excellent)' },
                    { key: 'year', placeholder: 'Year (e.g., 1965, 2020)' },
                    { key: 'certification', placeholder: 'Cert (e.g., GIA, PCGS)' },
                    { key: 'other', placeholder: 'Other info...' },
                  ].map(({ key, placeholder }) => (
                    <input
                      key={key}
                      type="text"
                      placeholder={placeholder}
                      value={itemDetails[key as keyof ItemDetails]}
                      onChange={(e) => updateDetail(key as keyof ItemDetails, e.target.value)}
                      className="w-full px-2 py-1.5 text-xs rounded-md border outline-none focus:ring-1 focus:ring-purple-300"
                      style={{ color: '#1a1a1a', backgroundColor: '#ffffff', borderColor: '#d1d5db' }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="p-3 border-t flex-shrink-0" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
            <div className="flex items-center space-x-2">
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                onClick={() => cameraInputRef.current?.click()}
                disabled={isLoading}
                className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: '#f3f0ff', color: '#7c3aed' }}
                title="Take a photo"
              >
                <Camera className="w-4 h-4" />
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: '#f3f0ff', color: '#7c3aed' }}
                title="Upload an image"
              >
                <ImagePlus className="w-4 h-4" />
              </button>

              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={imagePreview ? "Add a note about this item..." : "Ask about metals, coins, diamonds..."}
                className="flex-1 text-sm focus:border-purple-300 focus:ring-purple-200 rounded-xl h-9"
                style={{ color: '#1a1a1a', backgroundColor: '#ffffff', borderColor: '#d1d5db' }}
                disabled={isLoading}
              />
              <Button 
                onClick={handleSend}
                disabled={(!input.trim() && !imagePreview) || isLoading}
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-9 w-9 rounded-xl transition-all duration-200 hover:scale-105 flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
