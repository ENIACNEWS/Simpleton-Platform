import { useState, useRef, useEffect, useCallback } from 'react';
import { ProseRenderer } from "@/components/ui/prose-renderer";
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, X, Loader2, Volume2, VolumeX, Camera, ImagePlus } from 'lucide-react';

interface GuideMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

const PAGE_DESCRIPTIONS: Record<string, { title: string; greeting: string; suggestions: string[] }> = {
  '/': {
    title: 'Home',
    greeting: "Welcome! I'm Simplicity, your AI market analyst. I can help you navigate the platform, explain live pricing, run appraisals, or guide you to any feature.",
    suggestions: ["What can Simpleton do?", "How do I get an appraisal?", "Where do I start as a beginner?"],
  },
  '/calculator': {
    title: 'Precious Metals Calculator',
    greeting: "This is the Precious Metals Calculator. I can help you with weight conversions, melt values, batch processing, and understanding spot prices.",
    suggestions: ["How do I calculate melt value?", "What's the difference between troy oz and regular oz?", "Explain spot price vs premium"],
  },
  '/diamonds': {
    title: 'Diamond Excellence Center',
    greeting: "Welcome to the Diamond Excellence Center! I can explain grading scales, help you understand the 4Cs, and guide you through diamond evaluation.",
    suggestions: ["Explain the diamond color scale", "What's the most important C?", "How do I read the clarity grades?"],
  },
  '/diamond-calculator': {
    title: 'Diamond Calculator',
    greeting: "This calculator uses real-time Rapaport pricing with industry-first % off Rap presets. Let me show you how to use it.",
    suggestions: ["How does Rapaport pricing work?", "Why do prices jump at 1 carat?", "What does % off Rap mean?"],
  },
  '/watches': {
    title: 'Rolex Archive',
    greeting: "This is the Rolex Archive — deep reference data with identification details, movement specs, and market valuations.",
    suggestions: ["How do I identify a Rolex model?", "What's the most valuable Rolex model?", "Explain Rolex serial number dating"],
  },
  '/rolex-market-data': {
    title: 'Rolex Market Data',
    greeting: "Track Rolex price trends over time. I can help you analyze market data and make informed decisions.",
    suggestions: ["Which models are appreciating fastest?", "How has the Submariner trended?", "Best Rolex investment right now?"],
  },
  '/database': {
    title: 'Coin Database',
    greeting: "Browse the complete numismatic library with melt values, collector premiums, and live market pricing.",
    suggestions: ["What makes a coin valuable?", "Explain the Sheldon grading scale", "Most valuable Morgan Silver Dollars"],
  },
  '/education': {
    title: 'Simpleducation Center',
    greeting: "This is your learning hub for precious metals, diamonds, coins, and watches. Ask me anything!",
    suggestions: ["Where should a beginner start?", "How do precious metals IRAs work?", "Best way to store gold safely?"],
  },
  '/quantum-ticker': {
    title: 'Quantum Ticker 2055',
    greeting: "Real-time Metals & Diamonds ticker with live data feeds. I can help you understand the data.",
    suggestions: ["How do I read this ticker?", "What drives gold prices?", "What's the gold/silver ratio?"],
  },
  '/markets': {
    title: 'Simpleton Markets',
    greeting: "Your unified market intelligence hub. I can help you understand metals, stocks, crypto, and AI market data.",
    suggestions: ["What are the top movers?", "How does crypto affect metals?", "Give me a market overview"],
  },
  '/portfolio': {
    title: 'Portfolio Tracker',
    greeting: "Track your precious metals portfolio. I can help with asset allocation and portfolio strategy.",
    suggestions: ["How do I add assets?", "What's a good allocation?", "Explain portfolio diversification"],
  },
  '/markets': {
    title: 'Simpleton Markets',
    greeting: "Welcome to Simpleton Markets — live tickers, global market signals, institutional activity tracking, and real-time analysis.",
    suggestions: ["What's moving today?", "How do I read market signals?", "Explain buy/hold/sell indicators"],
  },
  '/jewelry-appraisal': {
    title: 'Jewelry Appraisal',
    greeting: "This is the professional appraisal generator. I can help you understand how appraisals work and guide you through the process.",
    suggestions: ["How do I start an appraisal?", "What information do I need?", "How accurate are these appraisals?"],
  },
  '/simpletons-list': {
    title: "Simpleton's List",
    greeting: "Browse the verified dealer directory. Find trusted businesses in precious metals, diamonds, and luxury watches.",
    suggestions: ["How do I find a dealer near me?", "What makes a dealer verified?", "Can I list my business?"],
  },
  '/ai-chat': {
    title: 'Simplicity AI Chat',
    greeting: "This is the full Simplicity AI chat experience. Ask me anything about precious metals, diamonds, watches, or coins.",
    suggestions: ["Give me a gold market overview", "What's a good diamond investment?", "Analyze the Rolex market"],
  },
  '/subscription': {
    title: 'Subscription',
    greeting: "Browse subscription tiers. I can help you understand what each plan offers.",
    suggestions: ["What's included in each tier?", "Which plan is best for me?", "What API access do I get?"],
  },
  '/about': {
    title: 'About',
    greeting: "Learn about the creator behind Simpleton. I can share more about the platform's history and mission.",
    suggestions: ["Who created this platform?", "What's the mission?", "How did it all start?"],
  },
  '/user-guide': {
    title: 'User Guide',
    greeting: "This is your guide to using every feature on Simpleton. Ask me anything!",
    suggestions: ["Walk me through the calculators", "How does vision analysis work?", "Explain the theme system"],
  },
};

function getSessionToken(): string {
  const key = 'simplicity_session_token';
  let token = localStorage.getItem(key);
  if (!token) {
    token = 'sv_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem(key, token);
  }
  return token;
}

function getPageInfo(path: string) {
  return PAGE_DESCRIPTIONS[path] || {
    title: 'Simpleton',
    greeting: "I'm Simplicity, your personal AI guide. I can help you understand anything on this page or navigate the platform.",
    suggestions: ["What can you help me with?", "How does this page work?", "Take me on a tour"],
  };
}

export function GlobalSimplicityGuide() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<GuideMessage[]>([]);
  const [input, setInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    try { return localStorage.getItem('simplicity-muted') === 'true'; } catch { return false; }
  });
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const sessionTokenRef = useRef(getSessionToken());
  const isMutedRef = useRef(isMuted);
  const lastPageRef = useRef(location);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const excludedPaths = ['/simpleton-mode', '/standalone-precious-metals', '/standalone-diamond-calculator'];
  const isExcluded = excludedPaths.includes(location);

  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { try { localStorage.setItem('simplicity-muted', String(isMuted)); } catch {} }, [isMuted]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  useEffect(() => {
    if (location !== lastPageRef.current) {
      lastPageRef.current = location;
      if (isOpen && messages.length > 0) {
        const pageInfo = getPageInfo(location);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'assistant',
          content: `You've navigated to ${pageInfo.title}. ${pageInfo.greeting}`,
          timestamp: new Date(),
        }]);
      }
    }
  }, [location, isOpen, messages.length]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    utteranceRef.current = null;
    setSpeakingId(null);
  }, []);

  const speakText = useCallback((text: string, msgId: string) => {
    if (isMutedRef.current || !window.speechSynthesis) return;
    stopSpeaking();

    fetch('/api/assistant/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
      .then(r => r.json())
      .then(data => {
        if (isMutedRef.current) return;
        const speakableText = data.text || text;
        const utterance = new SpeechSynthesisUtterance(speakableText);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v => v.name.includes('Samantha') || v.name.includes('Google US English') || v.name.includes('Microsoft Zira'));
        if (preferred) utterance.voice = preferred;
        utterance.onend = () => setSpeakingId(null);
        utterance.onerror = () => setSpeakingId(null);
        utteranceRef.current = utterance;
        setSpeakingId(msgId);
        window.speechSynthesis.speak(utterance);
      })
      .catch(() => setSpeakingId(null));
  }, [stopSpeaking]);

  const handleSpeak = useCallback((msg: GuideMessage) => {
    if (speakingId === msg.id) { stopSpeaking(); return; }
    speakText(msg.content, msg.id);
  }, [speakingId, stopSpeaking, speakText]);

  const sendMessage = async (text?: string) => {
    const userText = text || input.trim();
    if (!userText && !imagePreview) return;

    const userMsg: GuideMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userText || 'Please analyze this image',
      timestamp: new Date(),
      imageUrl: imagePreview || undefined,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const currentImage = imagePreview;
    setImagePreview(null);
    setLoading(true);

    try {
      const hasImage = !!currentImage;
      const endpoint = hasImage ? '/api/assistant/appraise' : '/api/assistant/help';
      const body = hasImage
        ? { image: currentImage, message: userText || 'Please analyze this image', sessionToken: sessionTokenRef.current }
        : { message: userText, context: 'full_expert', sessionToken: sessionTokenRef.current, pageContext: location };

      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!response.ok) throw new Error();
      const data = await response.json();
      const rawContent = data.response || data.appraisal || "I'm here to help! Could you rephrase that?";
      const cleanContent = rawContent.replace(/\*[^*]+\*/g, '').replace(/\n{3,}/g, '\n\n').trim();
      const msgId = (Date.now() + 1).toString();
      speakText(cleanContent, msgId);
      setMessages(prev => [...prev, { id: msgId, type: 'assistant', content: cleanContent, timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'assistant', content: "I'm having a moment. Please try again shortly.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      const pageInfo = getPageInfo(location);
      setMessages([{
        id: '1',
        type: 'assistant',
        content: `Hi! I'm Simplicity, your personal AI guide.\n\n${pageInfo.greeting}`,
        timestamp: new Date(),
      }]);
    }
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (ev) => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const MAX = 1200;
          let { width, height } = img;
          if (width > MAX || height > MAX) {
            if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
            else { width = Math.round(width * MAX / height); height = MAX; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject(new Error('Canvas not supported')); return; }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const compressed = await compressImage(file);
      setImagePreview(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const pageInfo = getPageInfo(location);

  if (isExcluded) return null;

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={handleOpen}
            className="fixed top-20 left-6 z-50 group"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <div className="relative">
              <div
                className="w-16 h-16 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-active:scale-95"
              >
                <Brain className="w-9 h-9" style={{ color: '#050534' }} />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2" style={{ borderColor: 'rgba(10,10,10,0.85)' }}></div>
              <div
                className="absolute left-14 top-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none px-2.5 py-1 rounded-md text-[10px] font-medium tracking-wide"
                style={{
                  background: 'rgba(10,10,10,0.95)',
                  border: '1px solid rgba(201,169,110,0.2)',
                  color: '#c9a96e',
                }}
              >
                Simplicity
              </div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-16 left-4 sm:left-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[calc(100dvh-5rem)] sm:h-[580px] rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: 'var(--background, rgba(10,10,10,0.98))',
              border: '1px solid rgba(201,169,110,0.12)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,169,110,0.06)',
              backdropFilter: 'blur(40px)',
            }}
          >
            <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(201,169,110,0.08)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(201,169,110,0.12), rgba(201,169,110,0.04))', border: '1px solid rgba(201,169,110,0.15)' }}>
                  <Brain className="w-3.5 h-3.5" style={{ color: '#c9a96e' }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight" style={{ color: 'var(--foreground, white)' }}>Simplicity</h3>
                  <p className="text-[9px] tracking-[0.12em] uppercase" style={{ color: '#c9a96e' }}>{pageInfo.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => { setIsMuted(!isMuted); if (!isMuted) stopSpeaking(); }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                  title={isMuted ? 'Unmute voice' : 'Mute voice'}
                >
                  {isMuted
                    ? <VolumeX className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
                    : <Volume2 className="w-3.5 h-3.5" style={{ color: '#c9a96e' }} />
                  }
                </button>
                <button
                  onClick={() => { setIsOpen(false); stopSpeaking(); }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <X className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.4)' }} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(201,169,110,0.15) transparent' }}>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'items-start gap-2.5'}`}>
                  {msg.type === 'assistant' && (
                    <div className="w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center mt-1" style={{ background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.12)' }}>
                      <Brain className="w-2.5 h-2.5" style={{ color: '#c9a96e' }} />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.type === 'user' ? 'rounded-br-sm' : 'rounded-tl-sm'}`}
                    style={msg.type === 'user'
                      ? { background: 'linear-gradient(135deg, rgba(201,169,110,0.18), rgba(201,169,110,0.10))', color: 'rgba(255,255,255,0.92)', border: '1px solid rgba(201,169,110,0.15)' }
                      : { background: 'rgba(255,255,255,0.025)', color: 'rgba(255,255,255,0.88)', border: '1px solid rgba(255,255,255,0.05)' }
                    }
                  >
                    {msg.imageUrl && (
                      <img src={msg.imageUrl} alt="Uploaded" className="w-full max-h-40 object-cover rounded-xl mb-2.5" style={{ border: '1px solid rgba(255,255,255,0.06)' }} />
                    )}
                    <div className="text-[13px] leading-[1.7]">
                      {msg.type === 'user'
                        ? <span className="whitespace-pre-wrap">{msg.content}</span>
                        : <ProseRenderer content={msg.content} size="sm" />
                      }
                    </div>
                    {msg.type === 'assistant' && (
                      <button
                        onClick={() => handleSpeak(msg)}
                        className="flex items-center gap-1.5 mt-2.5 transition-opacity hover:opacity-70"
                      >
                        {speakingId === msg.id ? (
                          <div className="flex items-center gap-0.5">
                            {[0, 1, 2, 3].map(i => (
                              <motion.div key={i} animate={{ scaleY: [0.3, 1.2, 0.3] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08 }} className="w-[2px] h-2.5 rounded-full" style={{ background: '#c9a96e' }} />
                            ))}
                          </div>
                        ) : (
                          <>
                            <Volume2 className="w-2.5 h-2.5" style={{ color: 'rgba(201,169,110,0.5)' }} />
                            <span className="text-[9px] tracking-wider uppercase font-medium" style={{ color: 'rgba(201,169,110,0.5)' }}>Listen</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.12)' }}>
                    <Brain className="w-2.5 h-2.5" style={{ color: '#c9a96e' }} />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} animate={{ opacity: [0.2, 0.7, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} className="w-1.5 h-1.5 rounded-full" style={{ background: '#c9a96e' }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.length <= 1 && !loading && (
                <div className="space-y-2 pt-2">
                  <p className="text-[9px] tracking-[0.15em] uppercase px-1 mb-2.5 font-medium" style={{ color: 'rgba(201,169,110,0.4)' }}>Suggested</p>
                  {pageInfo.suggestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="w-full text-left px-4 py-3 rounded-xl text-[13px] transition-all duration-200 hover:scale-[1.005]"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)' }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {imagePreview && (
              <div className="flex items-center gap-3 px-4 py-2.5 flex-shrink-0" style={{ borderTop: '1px solid rgba(201,169,110,0.08)' }}>
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-12 h-12 rounded-xl object-cover" style={{ border: '1px solid rgba(255,255,255,0.08)' }} />
                  <button onClick={() => setImagePreview(null)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.9)', border: '1.5px solid rgba(10,10,10,0.8)' }}>
                    <X className="w-2.5 h-2.5 text-white" />
                  </button>
                </div>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Image ready to analyze</span>
              </div>
            )}

            <div className="flex-shrink-0 px-3 py-3" style={{ borderTop: '1px solid rgba(201,169,110,0.08)' }}>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              <input type="file" ref={cameraInputRef} onChange={handleImageUpload} accept="image/*" capture="environment" className="hidden" />
              <div className="flex items-center gap-1 rounded-xl px-1 py-1" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ color: 'rgba(201,169,110,0.5)' }}
                  title="Upload image"
                >
                  <ImagePlus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ color: 'rgba(201,169,110,0.5)' }}
                  title="Take a photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Ask Simplicity anything..."
                  className="flex-1 bg-transparent border-none outline-none text-sm min-w-0 px-2 py-2"
                  style={{ color: 'var(--foreground, rgba(255,255,255,0.9))', caretColor: '#c9a96e' }}
                  disabled={loading}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || (!input.trim() && !imagePreview)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 disabled:opacity-10 transition-all duration-200"
                  style={{
                    background: input.trim() || imagePreview
                      ? 'linear-gradient(135deg, rgba(201,169,110,0.9), rgba(201,169,110,0.7))'
                      : 'rgba(255,255,255,0.03)',
                  }}
                >
                  {loading
                    ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#c9a96e' }} />
                    : <Send className="w-4 h-4" style={{ color: input.trim() || imagePreview ? '#000' : 'rgba(255,255,255,0.2)' }} />
                  }
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
