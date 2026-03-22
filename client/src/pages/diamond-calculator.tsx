import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Diamond, Calculator, Info, Settings, RotateCcw, Percent, TrendingUp, BarChart3, Zap, Coins, MessageCircle, X, Move, Plus, Minus, BookOpen, History, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { AIAssistant } from "@/components/ai-assistant";
import { DiamondCalculator } from "@/components/calculator/diamond-calculator";
import { CalculatorTrainingGuide } from "@/components/calculator/calculator-training-guide";
import {
  DiamondComparisonPanel,
  DiamondPriceHistoryPanel,
  FluorescencePanel,
  CertificationPremiumPanel,
  InvestmentCalculatorPanel,
  RingSettingEstimatorPanel
} from "@/components/diamonds/diamond-enhancement-panels";

function DiamondGem({ size = 24, color = "rgba(255,255,255,0.9)" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <polygon points="12,2 22,9 12,22 2,9" fill={color} opacity="0.15" />
      <polygon points="12,2 17,9 12,22" fill={color} opacity="0.25" />
      <polygon points="12,2 7,9 12,14" fill={color} opacity="0.4" />
      <polygon points="2,9 7,9 12,22" fill={color} opacity="0.1" />
      <polygon points="12,2 22,9 12,9" fill={color} opacity="0.35" />
      <line x1="2" y1="9" x2="22" y2="9" stroke={color} strokeWidth="0.5" opacity="0.5" />
      <line x1="7" y1="9" x2="12" y2="2" stroke={color} strokeWidth="0.3" opacity="0.4" />
      <line x1="17" y1="9" x2="12" y2="2" stroke={color} strokeWidth="0.3" opacity="0.4" />
      <line x1="7" y1="9" x2="12" y2="22" stroke={color} strokeWidth="0.3" opacity="0.3" />
      <line x1="17" y1="9" x2="12" y2="22" stroke={color} strokeWidth="0.3" opacity="0.3" />
    </svg>
  );
}

function PremiumFallingDiamonds() {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 4,
    duration: 4 + Math.random() * 3,
    size: 12 + Math.random() * 20,
    opacity: 0.15 + Math.random() * 0.35,
    drift: (Math.random() - 0.5) * 60,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: `${p.left}%` }}
          initial={{ y: -60, opacity: 0, rotate: 0, x: 0 }}
          animate={{
            y: typeof window !== 'undefined' ? window.innerHeight + 60 : 1000,
            opacity: [0, p.opacity, p.opacity * 0.8, 0],
            rotate: [0, 180, 360],
            x: p.drift,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeIn",
          }}
        >
          <DiamondGem size={p.size} color="rgba(185,220,255,0.7)" />
        </motion.div>
      ))}
      {Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 3 + Math.random() * 4,
        size: 1 + Math.random() * 3,
      })).map((s) => (
        <motion.div
          key={`sparkle-${s.id}`}
          className="absolute rounded-full"
          style={{
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 70%)',
          }}
          initial={{ y: -20, opacity: 0 }}
          animate={{
            y: typeof window !== 'undefined' ? window.innerHeight + 20 : 1000,
            opacity: [0, 0.8, 0.4, 0],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

function BackgroundFallingDiamonds() {
  const diamonds = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 5,
    size: 14 + Math.random() * 12,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {diamonds.map((d) => (
        <motion.div
          key={d.id}
          className="absolute"
          style={{ left: `${d.left}%`, top: `${d.top}%` }}
          animate={{
            opacity: [0.08, 0.18, 0.08],
            scale: [0.9, 1.1, 0.9],
            rotate: [0, 15, -15, 0],
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            delay: d.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <DiamondGem size={d.size} color="rgba(147,197,253,0.5)" />
        </motion.div>
      ))}
    </div>
  );
}

function DiamondHistoryPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch('/api/diamond-calculator/history?limit=100', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (data.success) setHistory(data.history); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen]);

  const clearHistory = async () => {
    if (!confirm('Clear all diamond calculation history?')) return;
    await fetch('/api/diamond-calculator/history', { method: 'DELETE', credentials: 'include' });
    setHistory([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-2xl mx-4 mt-8 mb-8 rounded-2xl overflow-hidden" style={{
        background: 'linear-gradient(180deg, #0a0a14 0%, #060610 100%)',
        border: '1px solid rgba(185,220,255,0.15)',
        maxHeight: '85vh',
      }}>
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(185,220,255,0.1)' }}>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" style={{ color: 'rgba(185,220,255,0.8)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>Diamond Calculation History</h2>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(185,220,255,0.1)', color: 'rgba(185,220,255,0.7)' }}>
              {history.length} entries
            </span>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button onClick={clearHistory} className="p-2 rounded-lg" style={{ color: 'rgba(255,100,100,0.6)' }}>
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-lg" style={{ color: 'rgba(185,220,255,0.6)' }}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-4 space-y-2" style={{ maxHeight: 'calc(85vh - 70px)' }}>
          {loading ? (
            <p className="text-center py-8" style={{ color: 'rgba(185,220,255,0.4)' }}>Loading history...</p>
          ) : history.length === 0 ? (
            <p className="text-center py-8" style={{ color: 'rgba(185,220,255,0.4)' }}>No diamond calculations yet. Your history will appear here as you value diamonds.</p>
          ) : (
            history.map((entry) => {
              const specs = entry.karat || '';
              return (
                <div key={entry.id} className="rounded-xl p-3" style={{
                  background: 'rgba(185,220,255,0.03)',
                  border: '1px solid rgba(185,220,255,0.06)',
                }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Diamond className="w-3.5 h-3.5" style={{ color: 'rgba(185,220,255,0.7)' }} />
                      <span className="text-xs font-medium" style={{ color: 'rgba(185,220,255,0.8)' }}>
                        {specs}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{
                        background: entry.unit === 'LAB_GROWN' ? 'rgba(100,200,150,0.1)' : 'rgba(185,220,255,0.08)',
                        color: entry.unit === 'LAB_GROWN' ? 'rgba(100,200,150,0.7)' : 'rgba(185,220,255,0.5)',
                      }}>
                        {entry.unit === 'LAB_GROWN' ? 'Lab-Grown' : 'Natural'}
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: 'rgba(185,220,255,0.3)' }}>
                      {new Date(entry.calculatedAt).toLocaleDateString()} {new Date(entry.calculatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {parseFloat(entry.weight).toFixed(2)} ct
                    </span>
                    <span className="text-sm font-semibold" style={{ color: 'rgba(185,220,255,0.9)' }}>
                      ${parseFloat(entry.meltValue).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default function DiamondCalculatorPage() {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { isAuthenticated } = useAuth();
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [menuScale, setMenuScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showGoodbye, setShowGoodbye] = useState(false);

  // Scale menu up/down
  const scaleMenuUp = () => setMenuScale(prev => Math.min(prev + 0.1, 1.5));
  const scaleMenuDown = () => setMenuScale(prev => Math.max(prev - 0.1, 0.5));

  // Hide welcome message after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  const handleLeaveMode = () => {
    setShowGoodbye(true);
    // Show goodbye for 2 seconds then navigate
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  };

  return (
    <>
      <div className="min-h-screen text-white relative overflow-hidden" style={{
        background: 'radial-gradient(ellipse 120% 80% at 50% 20%, #0f1123 0%, #080810 40%, #000000 100%)',
      }}>
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 20% 30%, rgba(100,149,237,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(147,112,219,0.03) 0%, transparent 50%)',
        }} />
        <BackgroundFallingDiamonds />
        
        <div className="relative z-10">
          {/* Top Control Bar */}
          <div className="sticky top-0 z-50 flex items-center justify-between px-3 py-2 backdrop-blur-md" style={{
            background: 'linear-gradient(90deg, rgba(15,17,35,0.95), rgba(8,8,16,0.95))',
            borderBottom: '1px solid rgba(185,220,255,0.12)',
          }}>
            <div className="flex items-center gap-2">
              <Link href="/">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors" style={{ color: 'rgba(185,220,255,0.8)', background: 'rgba(185,220,255,0.08)', border: '1px solid rgba(185,220,255,0.15)' }}>
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Home
                </button>
              </Link>
              <Link href="/calculator">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors" style={{ color: 'rgba(255,215,0,0.8)', background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.15)' }}>
                  <Coins className="w-3.5 h-3.5" />
                  Metals Calc
                </button>
              </Link>
            </div>

            <div className="flex items-center gap-1.5">
              <Diamond className="w-4 h-4" style={{ color: 'rgba(185,220,255,0.6)' }} />
              <span className="text-xs font-semibold hidden sm:inline" style={{ color: 'rgba(185,220,255,0.7)' }}>Simpleton™ Diamond Calculator</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTraining(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ color: 'rgba(185,220,255,0.8)', background: 'rgba(185,220,255,0.08)', border: '1px solid rgba(185,220,255,0.15)' }}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Guide</span>
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => setShowHistory(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{ color: 'rgba(185,220,255,0.8)', background: 'rgba(185,220,255,0.08)', border: '1px solid rgba(185,220,255,0.15)' }}
                >
                  <History className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">History</span>
                </button>
              )}
              <button
                onClick={() => setIsAIOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ color: 'rgba(100,149,237,0.9)', background: 'rgba(100,149,237,0.12)', border: '1px solid rgba(100,149,237,0.2)' }}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI</span>
              </button>
            </div>
          </div>

          <section className="py-4 sm:py-8 px-2 sm:px-4">
            <div className="max-w-4xl mx-auto">
              <DiamondCalculator />
            </div>
          </section>

          <section className="pb-8 px-2 sm:px-4">
            <div className="max-w-4xl mx-auto space-y-4">
              <DiamondComparisonPanel />
              <FluorescencePanel />
              <CertificationPremiumPanel />
              <DiamondPriceHistoryPanel />
              <InvestmentCalculatorPanel />
              <RingSettingEstimatorPanel />
            </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 40%, #1a1a2e 0%, #0a0a14 50%, #000000 100%)',
            }}
          >
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(circle at 30% 20%, rgba(100,149,237,0.08) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(147,112,219,0.06) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 40%)',
            }} />

            <PremiumFallingDiamonds />

            <motion.div
              className="absolute"
              style={{ width: 200, height: 200 }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 0.06, 0.03], scale: [0.5, 1.8, 2.2] }}
              transition={{ duration: 2.5, ease: "easeOut" }}
            >
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(185,220,255,0.15) 0%, transparent 70%)',
                filter: 'blur(40px)',
              }} />
            </motion.div>

            <div className="text-center relative z-10 px-6 max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="mb-8 flex justify-center"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <DiamondGem size={80} color="rgba(185,220,255,0.85)" />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div style={{
                      width: 120, height: 120, borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(185,220,255,0.2) 0%, transparent 70%)',
                      filter: 'blur(20px)', transform: 'translate(-20px, -10px)',
                    }} />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.5, duration: 1.2, ease: "easeInOut" }}
                className="mx-auto mb-6 overflow-hidden"
                style={{ maxWidth: 120, height: 1 }}
              >
                <div style={{
                  width: '100%', height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(185,220,255,0.5), transparent)',
                }} />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-xs sm:text-sm tracking-[0.4em] uppercase mb-4"
                style={{ color: 'rgba(185,220,255,0.5)', fontWeight: 300, letterSpacing: '0.4em' }}
              >
                <span className="simpleton-brand">Simpleton</span> Vision&trade; Presents
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl sm:text-7xl md:text-8xl font-extralight mb-3 tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #b9dcff 30%, #e8e8e8 50%, #b9dcff 70%, #ffffff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  textShadow: 'none',
                }}
              >
                DIAMOND
              </motion.h1>

              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.7 }}
                className="text-2xl sm:text-3xl md:text-4xl font-extralight tracking-[0.3em] uppercase mb-8"
                style={{
                  color: 'rgba(185,220,255,0.7)',
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                }}
              >
                Mode
              </motion.h2>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 1.3, duration: 1, ease: "easeInOut" }}
                className="mx-auto mb-8 overflow-hidden"
                style={{ maxWidth: 200, height: 1 }}
              >
                <div style={{
                  width: '100%', height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(185,220,255,0.4), transparent)',
                }} />
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.8 }}
                className="text-sm sm:text-base tracking-[0.15em]"
                style={{ color: 'rgba(185,220,255,0.45)', fontWeight: 300 }}
              >
                Diamond Intelligence, Simplified
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.2, duration: 0.6 }}
                className="mt-10 flex justify-center"
              >
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-xs tracking-[0.3em] uppercase"
                  style={{ color: 'rgba(185,220,255,0.3)' }}
                >
                  Loading
                </motion.div>
              </motion.div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-32" style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
            }} />
            <div className="absolute top-0 left-0 right-0 h-20" style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)',
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGoodbye && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 40%, #1a1a2e 0%, #0a0a14 50%, #000000 100%)',
            }}
          >
            <PremiumFallingDiamonds />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center relative z-10 px-6"
            >
              <motion.div className="mb-6 flex justify-center">
                <DiamondGem size={50} color="rgba(185,220,255,0.7)" />
              </motion.div>
              <h2
                className="text-3xl sm:text-5xl md:text-6xl font-extralight mb-4 tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #b9dcff 40%, #ffffff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                }}
              >
                Until Next Time
              </h2>
              <div className="mx-auto mb-5" style={{ width: 80, height: 1, background: 'linear-gradient(90deg, transparent, rgba(185,220,255,0.4), transparent)' }} />
              <p className="text-sm sm:text-base tracking-[0.15em]" style={{ color: 'rgba(185,220,255,0.45)', fontWeight: 300 }}>
                Thank you for choosing Diamond Mode
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Footer />
      
      
      <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
      
      <CalculatorTrainingGuide
        isOpen={showTraining}
        onClose={() => setShowTraining(false)}
        type="diamonds"
      />
      
      {isAuthenticated && (
        <DiamondHistoryPanel
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  );
}