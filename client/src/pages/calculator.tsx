import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { AuthenticSimpletonCalculator } from "@/components/calculator/authentic-simpleton-calculator";
import { LivePricingStatus } from "@/components/pricing/live-pricing-status";
import { CalculatorTrainingGuide } from "@/components/calculator/calculator-training-guide";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLivePricing } from "@/hooks/use-live-pricing";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useRef, useState, useCallback } from "react";
import { BookOpen, Smartphone, X, Maximize2, History, Trash2, Lock } from "lucide-react";

function PhoneMode({ onExit }: { onExit: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const calcRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const autoScale = useCallback(() => {
    if (!calcRef.current) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const headerH = 48;
    const availH = vh - headerH - 16;
    const availW = vw - 16;
    const calcW = calcRef.current.scrollWidth;
    const calcH = calcRef.current.scrollHeight;
    if (calcW > 0 && calcH > 0) {
      const s = Math.min(availW / calcW, availH / calcH, 1.35);
      setScale(Math.max(s, 0.5));
    }
  }, []);

  useEffect(() => {
    const savedScrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.width = '100%';

    const timer = setTimeout(autoScale, 100);
    const timer2 = setTimeout(autoScale, 400);
    const handleOrientation = () => setTimeout(autoScale, 200);
    window.addEventListener('resize', autoScale);
    window.addEventListener('orientationchange', handleOrientation);

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, savedScrollY);
      clearTimeout(timer);
      clearTimeout(timer2);
      window.removeEventListener('resize', autoScale);
      window.removeEventListener('orientationchange', handleOrientation);
    };
  }, [autoScale]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #080810 0%, #0a0a14 50%, #0c0c18 100%)',
        touchAction: 'manipulation',
      }}
    >
      <div
        className="flex items-center justify-between px-3 flex-shrink-0"
        style={{
          height: '48px',
          background: 'linear-gradient(180deg, rgba(255,215,0,0.06), rgba(255,215,0,0.02))',
          borderBottom: '1px solid rgba(255,215,0,0.1)',
        }}
      >
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4" style={{ color: '#FFD700' }} />
          <span className="text-xs font-medium tracking-wider" style={{ color: 'rgba(255,215,0,0.8)' }}>
            PHONE MODE
          </span>
          <span className="text-xs" style={{ color: 'rgba(255,215,0,0.3)' }}>|</span>
          <Maximize2 className="w-3 h-3" style={{ color: 'rgba(255,215,0,0.4)' }} />
          <span className="text-xs" style={{ color: 'rgba(255,215,0,0.4)' }}>
            Auto-Scaled
          </span>
        </div>
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, rgba(255,60,60,0.15), rgba(255,60,60,0.06))',
            border: '1px solid rgba(255,60,60,0.2)',
            color: 'rgba(255,100,100,0.9)',
          }}
        >
          <X className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">EXIT</span>
        </button>
      </div>

      <div
        className="flex-1 flex items-center justify-center overflow-hidden"
        style={{ padding: '8px' }}
      >
        <div
          ref={calcRef}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.3s ease-out',
            width: 'max-content',
          }}
        >
          <AuthenticSimpletonCalculator />
        </div>
      </div>
    </div>
  );
}

type HistoryEntry = {
  id: number;
  metal: string;
  karat: string | null;
  purity: string | null;
  weight: string;
  unit: string;
  spotPrice: string;
  meltValue: string;
  priceType: string | null;
  calculatedAt: string;
};

function CalculationHistoryPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch('/api/calculator/history?limit=100', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (data.success) setHistory(data.history); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen]);

  const clearHistory = async () => {
    if (!confirm('Clear all calculation history?')) return;
    await fetch('/api/calculator/history', { method: 'DELETE', credentials: 'include' });
    setHistory([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-2xl mx-4 mt-8 mb-8 rounded-2xl overflow-hidden" style={{
        background: 'linear-gradient(180deg, #0c0c18 0%, #080810 100%)',
        border: '1px solid rgba(255,215,0,0.15)',
        maxHeight: '85vh',
      }}>
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(255,215,0,0.1)' }}>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" style={{ color: '#FFD700' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>Calculation History</h2>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,215,0,0.1)', color: 'rgba(255,215,0,0.7)' }}>
              {history.length} entries
            </span>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button onClick={clearHistory} className="p-2 rounded-lg transition-colors" style={{ color: 'rgba(255,100,100,0.6)' }}>
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ color: 'rgba(255,215,0,0.6)' }}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-4 space-y-2" style={{ maxHeight: 'calc(85vh - 70px)' }}>
          {loading ? (
            <p className="text-center py-8" style={{ color: 'rgba(255,215,0,0.4)' }}>Loading history...</p>
          ) : history.length === 0 ? (
            <p className="text-center py-8" style={{ color: 'rgba(255,215,0,0.4)' }}>No calculations yet. Your history will appear here as you use the calculator.</p>
          ) : (
            history.map((entry) => (
              <div key={entry.id} className="rounded-xl p-3" style={{
                background: 'rgba(255,215,0,0.03)',
                border: '1px solid rgba(255,215,0,0.06)',
              }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{
                      background: entry.metal === 'gold' ? 'rgba(255,215,0,0.15)' : entry.metal === 'silver' ? 'rgba(192,192,192,0.15)' : 'rgba(229,228,226,0.15)',
                      color: entry.metal === 'gold' ? '#FFD700' : entry.metal === 'silver' ? '#C0C0C0' : '#E5E4E2',
                    }}>
                      {entry.metal.charAt(0).toUpperCase() + entry.metal.slice(1)} {entry.karat || ''}
                    </span>
                    {entry.priceType && entry.priceType !== 'live' && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(100,200,150,0.1)', color: 'rgba(100,200,150,0.7)' }}>
                        {entry.priceType}
                      </span>
                    )}
                  </div>
                  <span className="text-xs" style={{ color: 'rgba(255,215,0,0.3)' }}>
                    {new Date(entry.calculatedAt).toLocaleDateString()} {new Date(entry.calculatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {parseFloat(entry.weight).toFixed(2)} {entry.unit} @ ${parseFloat(entry.spotPrice).toFixed(2)}/oz
                  </span>
                  <span className="text-sm font-semibold" style={{ color: '#FFD700' }}>
                    ${parseFloat(entry.meltValue).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function Calculator() {
  const { prices, isLoading } = useLivePricing();
  const { isAuthenticated, user } = useAuth();
  const isPaidSubscriber = isAuthenticated && !!user?.subscriptionStatus && user.subscriptionStatus !== 'free';
  const widgetRef = useRef<HTMLDivElement>(null);
  const [showTraining, setShowTraining] = useState(false);
  const [phoneMode, setPhoneMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!isPaidSubscriber) return;
    const script = document.createElement('script');
    script.src = '/widget/secure-widget.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      const existingScript = document.querySelector('script[src="/widget/secure-widget.js"]');
      if (existingScript) document.body.removeChild(existingScript);
    };
  }, [isPaidSubscriber]);

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(180deg, #080810 0%, #0a0a14 40%, #0c0c18 100%)' }}>
      <Navigation />
      
      {/* Header Section */}
      <section className="pt-20 pb-12" style={{ background: 'linear-gradient(180deg, rgba(8,8,16,1) 0%, rgba(12,12,20,0.95) 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="sv-heading text-5xl mb-6">
              <span style={{ color: 'rgba(255,255,255,0.9)' }}>Professional Precious Metals</span>{' '}
              <span style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 40%, #FFD700 70%, #DAA520 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Calculator</span>
            </h1>
            <p className="text-xl max-w-3xl mx-auto mb-6" style={{ color: 'rgba(255,215,0,0.9)', letterSpacing: '0.01em' }}>
              Advanced calculations for gold, silver, platinum, and palladium with real-time market pricing. 
              Professional-grade accuracy for dealers, collectors, and investors.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
              <button
                onClick={() => setPhoneMode(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.03] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,215,0,0.08))',
                  border: '1px solid rgba(255,215,0,0.25)',
                  color: '#FFD700',
                  boxShadow: '0 4px 15px rgba(255,215,0,0.12)',
                }}
              >
                <Smartphone className="w-4 h-4" />
                Phone Mode
              </button>
              
              {isAuthenticated && (
                <button
                  onClick={() => setShowHistory(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.03] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.06))',
                    border: '1px solid rgba(255,215,0,0.2)',
                    color: '#FFD700',
                    boxShadow: '0 4px 15px rgba(255,215,0,0.08)',
                  }}
                >
                  <History className="w-4 h-4" />
                  History
                </button>
              )}
              
              <button
                onClick={() => setShowTraining(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.03] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.06))',
                  border: '1px solid rgba(255,215,0,0.2)',
                  color: '#FFD700',
                  boxShadow: '0 4px 15px rgba(255,215,0,0.08)',
                }}
              >
                <BookOpen className="w-4 h-4" />
                Training Guide
              </button>
            </div>
            
            {/* Live Pricing Strip */}
            {!isLoading && prices && (
              <div className="flex justify-center items-center space-x-8 text-sm" style={{
                padding: '12px 24px',
                borderRadius: '12px',
                background: 'rgba(255,215,0,0.03)',
                border: '1px solid rgba(255,215,0,0.08)'
              }}>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: 'linear-gradient(135deg, #FFD700, #DAA520)', color: '#1a1a2e' }}>Au</div>
                  <span style={{ color: 'rgba(255,215,0,0.6)' }}>Gold:</span>
                  <span className="sv-price font-semibold" style={{ color: '#FFD700' }}>${prices.gold.toFixed(2)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)', color: '#1a1a2e' }}>Ag</div>
                  <span style={{ color: 'rgba(192,192,192,0.6)' }}>Silver:</span>
                  <span className="sv-price font-semibold" style={{ color: '#C0C0C0' }}>${prices.silver.toFixed(2)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: 'linear-gradient(135deg, #E5E4E2, #B4B4B4)', color: '#1a1a2e' }}>Pt</div>
                  <span style={{ color: 'rgba(229,228,226,0.6)' }}>Platinum:</span>
                  <span className="sv-price font-semibold" style={{ color: '#E5E4E2' }}>${prices.platinum.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Live Pricing Status */}
      <section className="py-6" style={{ background: 'rgba(10,10,18,0.5)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LivePricingStatus />
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Calculator Widget */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="simpleton" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8" style={{ background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.1)' }}>
                  <TabsTrigger value="simpleton" className="text-white data-[state=active]:text-yellow-900" style={{ }} data-state-active-style="background: linear-gradient(135deg, #FFD700, #DAA520)">
                    <span className="simpleton-brand">Simpleton</span> Calculator
                  </TabsTrigger>
                  <TabsTrigger value="secure-widget" className="text-white data-[state=active]:text-yellow-900">
                    <span className="flex items-center gap-1.5">
                      {!isPaidSubscriber && <Lock className="w-3 h-3 opacity-60" />}
                      Secure Widget v3.2
                    </span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="simpleton" className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.9)' }}>Authentic <span style={{
                      background: 'linear-gradient(135deg, #FFD700, #FFA500, #FFD700)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}><span className="simpleton-brand">Simpleton</span></span> Calculator</h3>
                    <p style={{ color: 'rgba(255,215,0,0.5)' }}>The exact button layout and functions from your specification</p>
                  </div>
                  <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl mx-auto">
                    <AuthenticSimpletonCalculator />
                  </div>
                </TabsContent>

                <TabsContent value="secure-widget" className="space-y-6">
                  {isPaidSubscriber ? (
                    <>
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-semibold text-white mb-2">Secure Widget v3.2</h3>
                        <p className="text-yellow-300">Production-ready secure precious metals calculator widget</p>
                      </div>
                      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl mx-auto">
                        <div ref={widgetRef} data-simpleton-secure-widget></div>
                      </div>

                      {/* Integration Instructions */}
                      <Card className="mt-8" style={{ background: 'rgba(12,12,20,0.8)', border: '1px solid rgba(255,215,0,0.08)' }}>
                        <CardContent className="p-6">
                          <h4 className="text-lg font-semibold mb-4" style={{ color: 'rgba(255,255,255,0.9)' }}>Widget Integration</h4>
                          <div className="rounded-lg p-4 mb-4" style={{ background: 'rgba(255,215,0,0.03)', border: '1px solid rgba(255,215,0,0.08)' }}>
                            <h5 className="text-white font-semibold mb-2">Quick Integration:</h5>
                            <pre className="text-green-400 text-sm overflow-x-auto whitespace-pre-wrap">
{`<!-- Add this where you want the calculator -->
<div data-simpleton-secure-widget></div>

<!-- Add this before closing </body> tag -->
<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget/secure-widget.js"></script>`}
                            </pre>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <p className="text-green-400">✅ Security hardened with rate limiting</p>
                              <p className="text-green-400">✅ Real-time precious metals pricing</p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-green-400">✅ Mobile responsive design</p>
                              <p className="text-green-400">✅ CSP compliant for enterprise</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    /* Paywall for free / unauthenticated users */
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                      <div className="mb-6 flex items-center justify-center w-20 h-20 rounded-full" style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.15)' }}>
                        <Lock className="w-8 h-8" style={{ color: '#FFD700' }} />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">Subscribers Only</h3>
                      <p className="mb-2 max-w-md" style={{ color: 'rgba(255,255,255,0.55)' }}>
                        The Secure Widget v3.2 is available to Pro subscribers. Embed a live precious metals calculator on your own website.
                      </p>
                      <p className="text-sm mb-8" style={{ color: 'rgba(255,215,0,0.45)' }}>
                        Pro plan: $9.99 / month
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <a
                          href="/subscription"
                          className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.03]"
                          style={{ background: 'linear-gradient(135deg, #FFD700, #DAA520)', color: '#0a0a14' }}
                        >
                          View Plans
                        </a>
                        {!isAuthenticated && (
                          <a
                            href="/login"
                            className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.03]"
                            style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.2)', color: '#FFD700' }}
                          >
                            Sign In
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Calculator Information */}
            <div className="space-y-6">
              
              {/* Features Card */}
              <Card style={{ background: 'rgba(12,12,20,0.8)', border: '1px solid rgba(255,215,0,0.08)' }}>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    <i className="fas fa-star mr-2" style={{ color: '#FFD700' }}></i>
                    Calculator Features
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: '#FFD700' }}></div>
                      <div>
                        <h4 className="font-medium text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>Real-Time Market Pricing</h4>
                        <p className="text-xs" style={{ color: 'rgba(255,215,0,0.45)' }}>Live precious metals prices updated every minute</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: '#C0C0C0' }}></div>
                      <div>
                        <h4 className="font-medium text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>Multiple Weight Units</h4>
                        <p className="text-xs" style={{ color: 'rgba(255,215,0,0.45)' }}>Grams, troy ounces, pennyweight, grains support</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'rgba(100,149,237,0.7)' }}></div>
                      <div>
                        <h4 className="font-medium text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>Purity Analysis</h4>
                        <p className="text-xs" style={{ color: 'rgba(255,215,0,0.45)' }}>6K-24K gold, .800-.999 silver calculations</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'rgba(100,200,150,0.7)' }}></div>
                      <div>
                        <h4 className="font-medium text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>Professional Accuracy</h4>
                        <p className="text-xs" style={{ color: 'rgba(255,215,0,0.45)' }}>Bank-grade precision for dealers and investors</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Supported Metals */}
              <Card style={{ background: 'rgba(12,12,20,0.8)', border: '1px solid rgba(255,215,0,0.08)' }}>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4" style={{ color: 'rgba(255,255,255,0.9)' }}>Supported Metals</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(255,215,0,0.03)' }}>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: 'linear-gradient(135deg, #FFD700, #DAA520)', color: '#1a1a2e' }}>Au</div>
                        <span className="font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>Gold</span>
                      </div>
                      <Badge className="text-xs" style={{ background: '#FFD700', color: '#1a1a2e' }}>24K-6K</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(192,192,192,0.03)' }}>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)', color: '#1a1a2e' }}>Ag</div>
                        <span className="font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>Silver</span>
                      </div>
                      <Badge className="text-xs" style={{ background: '#C0C0C0', color: '#1a1a2e' }}>.999-.800</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(229,228,226,0.03)' }}>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: 'linear-gradient(135deg, #E5E4E2, #B4B4B4)', color: '#1a1a2e' }}>Pt</div>
                        <span className="font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>Platinum</span>
                      </div>
                      <Badge className="text-xs" style={{ background: '#E5E4E2', color: '#1a1a2e' }}>Pure</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(100,200,150,0.03)' }}>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: 'linear-gradient(135deg, #34d399, #059669)', color: '#fff' }}>Oz</div>
                        <span className="font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>Fractional Ounces</span>
                      </div>
                      <Badge className="text-xs" style={{ background: 'rgba(52,211,153,0.2)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}>1/2, 1/4, 1/10, 1/100</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card style={{ background: 'rgba(12,12,20,0.8)', border: '1px solid rgba(255,215,0,0.08)' }}>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    <i className="fas fa-lightbulb mr-2" style={{ color: 'rgba(255,215,0,0.6)' }}></i>
                    Quick Tips
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <i className="fas fa-check mt-1 text-xs" style={{ color: 'rgba(100,200,150,0.7)' }}></i>
                      <p style={{ color: 'rgba(255,255,255,0.7)' }}>Enter weight first, then select karat/purity level</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <i className="fas fa-check mt-1 text-xs" style={{ color: 'rgba(100,200,150,0.7)' }}></i>
                      <p style={{ color: 'rgba(255,255,255,0.7)' }}>Use memory functions (MC, MR, M+) for batch calculations</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <i className="fas fa-check mt-1 text-xs" style={{ color: 'rgba(100,200,150,0.7)' }}></i>
                      <p style={{ color: 'rgba(255,255,255,0.7)' }}>Press = to calculate melt value with live pricing</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <i className="fas fa-check mt-1 text-xs" style={{ color: 'rgba(100,200,150,0.7)' }}></i>
                      <p style={{ color: 'rgba(255,255,255,0.7)' }}>Switch between Gold and Silver using karat buttons</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </section>

      {/* Calculator Instructions */}
      <section className="py-16" style={{ background: 'rgba(10,10,18,0.8)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card style={{ background: 'rgba(12,12,20,0.8)', border: '1px solid rgba(255,215,0,0.08)' }}>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6 text-center" style={{ color: 'rgba(255,255,255,0.9)' }}>How to Use the Calculator</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#FFD700' }}>Basic Operations</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-2 rounded" style={{ background: 'rgba(255,215,0,0.03)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.8)' }}>Numbers (0-9)</span>
                      <span style={{ color: 'rgba(255,215,0,0.5)' }}>Enter weight values</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded" style={{ background: 'rgba(255,215,0,0.03)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.8)' }}>Decimal (.)</span>
                      <span style={{ color: 'rgba(255,215,0,0.5)' }}>Add decimal points</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded" style={{ background: 'rgba(255,215,0,0.03)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.8)' }}>Clear (C)</span>
                      <span style={{ color: 'rgba(255,215,0,0.5)' }}>Reset calculator</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded" style={{ background: 'rgba(255,215,0,0.03)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.8)' }}>Calculate (=)</span>
                      <span style={{ color: 'rgba(255,215,0,0.5)' }}>Get melt value</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#C0C0C0' }}>Advanced Functions</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-2 rounded" style={{ background: 'rgba(192,192,192,0.03)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.8)' }}>Karat Buttons</span>
                      <span style={{ color: 'rgba(255,215,0,0.5)' }}>Select purity level</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded" style={{ background: 'rgba(192,192,192,0.03)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.8)' }}>Memory (MC/MR/M+)</span>
                      <span style={{ color: 'rgba(255,215,0,0.5)' }}>Store calculations</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded" style={{ background: 'rgba(192,192,192,0.03)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.8)' }}>PURITY</span>
                      <span style={{ color: 'rgba(255,215,0,0.5)' }}>Custom purity input</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded" style={{ background: 'rgba(192,192,192,0.03)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.8)' }}>REVERSE</span>
                      <span style={{ color: 'rgba(255,215,0,0.5)' }}>Swap calculation direction</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
      
      <CalculatorTrainingGuide
        isOpen={showTraining}
        onClose={() => setShowTraining(false)}
        type="metals"
      />
      
      {phoneMode && <PhoneMode onExit={() => setPhoneMode(false)} />}
      
      {isAuthenticated && (
        <CalculationHistoryPanel
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}
