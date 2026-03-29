import { useState, useRef, useEffect, useCallback } from "react";
import { Navigation } from "@/components/layout/navigation";
import { AIAssistant } from "@/components/ai-assistant";

import { Footer } from "@/components/layout/footer";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { Calculator, Gem, Database, Watch, Brain, BarChart3, Store, ArrowRight, Sparkles, ScrollText } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { NewsTicker } from "@/components/news/news-ticker";


export default function Home() {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const [activeCard, setActiveCard] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUserScrolling = useRef(false);

  const features = [
    {
      icon: Calculator,
      title: "Precious Metals Calculator",
      description: "Live spot pricing, batch valuations, custom markup & purity presets across gold, silver, and platinum.",
      href: "/calculator",
      accent: "from-amber-500/20 to-yellow-600/5",
      iconColor: "text-amber-400",
      iconBg: "rgba(245,158,11,0.1)",
      borderColor: "rgba(245,158,11,0.15)",
    },
    {
      icon: Gem,
      title: "Diamond Calculator",
      description: "Real-time Rapaport pricing, industry-first % off Rap presets, and integrated grading education.",
      href: "/diamond-calculator",
      accent: "from-blue-500/20 to-cyan-500/5",
      iconColor: "text-blue-400",
      iconBg: "rgba(59,130,246,0.1)",
      borderColor: "rgba(59,130,246,0.15)",
    },
    {
      icon: Database,
      title: "Coin Database",
      description: "Complete numismatic library with melt values, collector premiums, and live market pricing.",
      href: "/database",
      accent: "from-emerald-500/20 to-green-600/5",
      iconColor: "text-emerald-400",
      iconBg: "rgba(16,185,129,0.1)",
      borderColor: "rgba(16,185,129,0.15)",
    },
    {
      icon: Watch,
      title: "Rolex Archive",
      description: "Deep reference database with identification details, movement data, and market valuations.",
      href: "/watches",
      accent: "from-violet-500/20 to-purple-600/5",
      iconColor: "text-violet-400",
      iconBg: "rgba(139,92,246,0.1)",
      borderColor: "rgba(139,92,246,0.15)",
    },
    {
      icon: Brain,
      title: "Simplicity AI",
      description: "Your personal market analyst — conversational intelligence, appraisals, and email command center.",
      href: "/ai-chat",
      accent: "from-rose-500/20 to-pink-600/5",
      iconColor: "text-rose-400",
      iconBg: "rgba(244,63,94,0.1)",
      borderColor: "rgba(244,63,94,0.15)",
    },
    {
      icon: BarChart3,
      title: "Simpleton Markets",
      description: "Live tickers, global market signals, institutional activity tracking, and real-time analysis.",
      href: "/markets",
      accent: "from-cyan-500/20 to-teal-600/5",
      iconColor: "text-cyan-400",
      iconBg: "rgba(6,182,212,0.1)",
      borderColor: "rgba(6,182,212,0.15)",
    },
    {
      icon: Store,
      title: "Simpleton\u2019s List",
      description: "Verified dealer directory — find trusted businesses in precious metals, diamonds, and luxury watches.",
      href: "/simpletons-list",
      accent: "from-orange-500/20 to-amber-600/5",
      iconColor: "text-orange-400",
      iconBg: "rgba(249,115,22,0.1)",
      borderColor: "rgba(249,115,22,0.15)",
    },
  ];

  const scrollToCard = useCallback((index: number) => {
    const el = carouselRef.current;
    if (!el) return;
    const child = el.children[index] as HTMLElement | undefined;
    if (!child) return;
    const containerRect = el.getBoundingClientRect();
    const childRect = child.getBoundingClientRect();
    const scrollTarget = el.scrollLeft + (childRect.left - containerRect.left) - (containerRect.width - childRect.width) / 2;
    el.scrollTo({ left: scrollTarget, behavior: 'smooth' });
  }, []);

  const startAutoScroll = useCallback(() => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    autoScrollRef.current = setInterval(() => {
      setActiveCard(prev => {
        const next = (prev + 1) % features.length;
        scrollToCard(next);
        return next;
      });
    }, 4000);
  }, [features.length, scrollToCard]);

  const pauseAutoScroll = useCallback(() => {
    if (autoScrollRef.current) { clearInterval(autoScrollRef.current); autoScrollRef.current = null; }
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
      autoScrollRef.current = setInterval(() => {
        setActiveCard(prev => {
          const next = (prev + 1) % features.length;
          scrollToCard(next);
          return next;
        });
      }, 4000);
    }, 6000);
  }, [features.length, scrollToCard]);

  useEffect(() => {
    startAutoScroll();
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, [startAutoScroll]);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const onWheel = () => pauseAutoScroll();
    el.addEventListener('wheel', onWheel, { passive: true });
    return () => el.removeEventListener('wheel', onWheel);
  }, [pauseAutoScroll]);

  const handleScroll = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    const containerCenter = el.scrollLeft + el.clientWidth / 2;
    let closest = 0;
    let minDist = Infinity;
    for (let i = 0; i < el.children.length; i++) {
      const child = el.children[i] as HTMLElement;
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const dist = Math.abs(containerCenter - childCenter);
      if (dist < minDist) { minDist = dist; closest = i; }
    }
    if (closest !== activeCard) setActiveCard(closest);
  }, [activeCard]);

  const handleUserInteraction = useCallback(() => {
    pauseAutoScroll();
  }, [pauseAutoScroll]);

  const renderTitle = (title: string) => {
    if (title === "Simpleton\u2019s List") return <><span className="simpleton-brand">Simpleton</span>{"\u2019s List"}</>;
    if (title === "Simpleton Markets") return <><span className="simpleton-brand">Simpleton</span>{" Markets"}</>;
    return title;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation onAIToggle={() => setIsAIOpen(true)} />

      {/* ═══════════════════════ HERO SECTION ═══════════════════════ */}
      <section className="maven-hero-bg flex-1 text-center pt-20 sm:pt-28 md:pt-36 pb-8 sm:pb-12 px-4 sm:px-6 relative overflow-hidden">

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-maven-blue/[0.05] rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-maven-navy/[0.08] rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <h1 className="sv-heading font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-3 sm:mb-4 tracking-tight">
            <span className="simpleton-brand">Simpleton</span>™
          </h1>

          <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
            <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent to-amber-500/40"></div>
            <h2 className="sv-subheading text-lg sm:text-xl md:text-2xl font-light tracking-[0.15em] uppercase" style={{ color: 'var(--muted-foreground)' }}>
              Precision, Pricing, Simplified
            </h2>
            <div className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent to-amber-500/40"></div>
          </div>

          <div className="mb-8 sm:mb-10 max-w-xl mx-auto">
            <div className="bg-gradient-to-r from-amber-900/30 via-yellow-900/20 to-amber-900/30 border border-amber-500/20 rounded-xl px-5 py-3.5 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Beta</span>
                <span className="text-amber-300 font-medium text-sm">All Features Free During Beta</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                We are in beta testing. All features are free. Send feedback to <span className="text-amber-300 font-medium">intel@simpletonapp.com</span>
              </p>
            </div>
          </div>

          <p className="text-base sm:text-lg max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2" style={{ color: 'var(--muted-foreground)' }}>
            Institutional-grade market intelligence for precious metals, diamonds, Rolex watches, and coins — powered by <span className="font-semibold" style={{ color: 'var(--foreground)' }}>Simplicity</span>, your AI market analyst.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center px-2 sm:px-4 mb-10 sm:mb-14 max-w-lg sm:max-w-none mx-auto">
            <Link href="/calculator" className="group flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-medium text-sm sm:text-base transition-all duration-300 active:scale-[0.98] bg-gradient-to-r from-amber-500/20 to-yellow-600/10 border border-amber-500/30 hover:border-amber-400/50 text-amber-300 hover:text-amber-200">
              <Calculator className="w-5 h-5" />
              <span>Precious Metals Calculator</span>
              <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
            </Link>
            <Link href="/diamond-calculator" className="group flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-medium text-sm sm:text-base transition-all duration-300 active:scale-[0.98] bg-gradient-to-r from-blue-500/20 to-cyan-500/10 border border-blue-500/30 hover:border-blue-400/50 text-blue-300 hover:text-blue-200">
              <Gem className="w-5 h-5" />
              <span>Diamond Calculator</span>
              <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
            </Link>
            <Link
              href="/ai-chat"
              className="group flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-medium text-sm sm:text-base transition-all duration-300 active:scale-[0.98] bg-gradient-to-r from-rose-500/20 to-pink-600/10 border border-rose-500/30 hover:border-rose-400/50 text-rose-300 hover:text-rose-200"
            >
              <Sparkles className="w-5 h-5" />
              <span>Talk to Simplicity</span>
              <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
            </Link>
          </div>

          {/* ═══════════════ FEATURE CAROUSEL ═══════════════ */}
          <div className="max-w-2xl mx-auto">
            <div
              ref={carouselRef}
              onScroll={handleScroll}
              onTouchStart={handleUserInteraction}
              onMouseDown={handleUserInteraction}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3 px-4 pb-3"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Link
                    key={feature.title}
                    href={feature.href}
                    className="group snap-center flex-shrink-0 w-[82%] sm:w-[55%] md:w-[45%]"
                  >
                    <div
                      className={`relative p-4 sm:p-5 rounded-xl border maven-card-hover maven-accent-bar maven-blur transition-all duration-500 ${index === activeCard ? 'scale-100 opacity-100' : 'scale-[0.97] opacity-60'}`}
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        borderColor: index === activeCard ? feature.borderColor : 'rgba(255,255,255,0.04)',
                      }}
                    >
                      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                      <div className="relative z-10 text-center">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2.5 ${feature.iconColor}`}
                          style={{ background: feature.iconBg, border: `1px solid ${feature.borderColor}` }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="font-display font-semibold text-sm mb-1.5" style={{ color: 'var(--foreground)' }}>
                          {renderTitle(feature.title)}
                        </h3>
                        <p className="text-xs leading-relaxed mb-2.5" style={{ color: 'var(--muted-foreground)' }}>
                          {feature.description}
                        </p>
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <span className={`text-[11px] font-medium ${feature.iconColor}`}>Explore</span>
                          <ArrowRight className={`w-3 h-3 ${feature.iconColor}`} />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-2 mt-3">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveCard(index);
                    scrollToCard(index);
                    pauseAutoScroll();
                  }}
                  className="transition-all duration-300"
                >
                  <div
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: index === activeCard ? 20 : 5,
                      height: 5,
                      background: index === activeCard ? 'rgba(201,169,110,0.7)' : 'rgba(255,255,255,0.15)',
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ MEET SIMPLICITY ═══════════════════ */}
      <section className="pt-6 sm:pt-8 pb-16 sm:pb-20 px-4 sm:px-6 relative">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.01) 50%, transparent 100%)' }}></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase mb-6 border" style={{ backgroundColor: 'rgba(244,63,94,0.08)', borderColor: 'rgba(244,63,94,0.2)', color: 'rgb(251,113,133)' }}>
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Intelligence
          </div>

          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-4 tracking-tight" style={{ color: 'var(--foreground)' }}>
            Meet <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">Simplicity</span>
          </h2>
          <p className="text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            Your personal AI market analyst — delivering real-time precious metals pricing, professional diamond appraisals, Rolex valuations, and coin market intelligence with institutional-grade accuracy and full source transparency.
          </p>

          <button
            onClick={() => setIsAIOpen(true)}
            className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-medium transition-all duration-300 active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, rgba(244,63,94,0.15), rgba(219,39,119,0.1))',
              border: '1px solid rgba(244,63,94,0.3)',
              color: 'rgb(251,113,133)',
            }}
          >
            <Brain className="w-5 h-5" />
            <span>Start a Conversation</span>
            <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
          </button>
        </div>
      </section>

      <NewsTicker category="metals" isEnabled={true} />

      <Footer />
      <InstallPrompt />

      <Link href="/jewelry-appraisal" className="fixed top-[136px] left-6 z-50 group hidden sm:flex" aria-label="Get a professional appraisal">
        <div className="relative">
          <div
            className="w-16 h-16 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-active:scale-95"
          >
            <ScrollText className="w-9 h-9" style={{ color: '#050534' }} />
          </div>
          <div
            className="absolute left-14 top-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none px-2.5 py-1 rounded-md text-[10px] font-medium tracking-wide"
            style={{
              background: 'rgba(10,10,10,0.95)',
              border: '1px solid rgba(201,169,110,0.2)',
              color: '#c9a96e',
            }}
          >
            Get Appraisal
          </div>
        </div>
      </Link>
    </div>
  );
}
