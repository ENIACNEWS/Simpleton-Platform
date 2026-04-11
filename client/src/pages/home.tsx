import { useEffect } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { NewsTicker } from "@/components/news/news-ticker";
import { useLivePricing } from "@/hooks/use-live-pricing";
import { useBrain } from "@/lib/brain-context";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import {
  Calculator, Gem, Database, Watch, Brain, BarChart3,
  ArrowRight, Sparkles, ScrollText, Shield, Radio,
  Cpu, Award, FileText, ChevronRight,
} from "lucide-react";

// ───────────────────────────────────────────────────────────────────────
//  Design tokens — shared language with the appraisal page
// ───────────────────────────────────────────────────────────────────────
const T = {
  bg: '#0b0b12',
  bgGradient: 'radial-gradient(ellipse at 30% 20%, #181827 0%, #0b0b12 60%)',
  ink: '#f4efe2',
  inkMuted: '#9a937f',
  gold: '#c9a84c',
  goldDeep: '#a8873a',
  goldGlow: 'rgba(201,168,76,0.25)',
  rose: '#f43f5e',
  roseGlow: 'rgba(244,63,94,0.15)',
  hairline: 'rgba(244,239,226,0.10)',
  display: '"Playfair Display", Georgia, serif',
  body: '"Inter", -apple-system, system-ui, sans-serif',
  serif: '"EB Garamond", "Playfair Display", Georgia, serif',
};

const features = [
  {
    icon: Calculator,
    title: "Precious Metals Calculator",
    desc: "Live spot pricing with batch valuations, custom markup presets, and purity calculations across gold, silver, platinum, and palladium.",
    href: "/simpleton-mode",
    accent: '#c9a84c',
  },
  {
    icon: Gem,
    title: "Diamond Calculator",
    desc: "Real-time Rapaport pricing integration, industry-first percentage-off-Rap presets, and integrated grading education for professionals.",
    href: "/diamond-calculator",
    accent: '#60a5fa',
  },
  {
    icon: FileText,
    title: "Professional Appraisal",
    desc: "AI-powered catalog descriptions reviewed by a GIA Graduate Gemologist. Five premium document templates with tiered valuations.",
    href: "/jewelry-appraisal",
    accent: '#c9a84c',
  },
  {
    icon: Database,
    title: "Coin Database",
    desc: "Complete numismatic library with US Mint specifications, melt values, collector premiums, and historical auction records.",
    href: "/database",
    accent: '#34d399',
  },
  {
    icon: Watch,
    title: "Rolex Archive",
    desc: "Deep reference database covering every production reference — movement data, case materials, market valuations, and identification details.",
    href: "/watches",
    accent: '#a78bfa',
  },
  {
    icon: BarChart3,
    title: "Simpleton Markets",
    desc: "Live tickers, global market signals, institutional activity tracking, convergence alerts, and multi-source intelligence analysis.",
    href: "/markets",
    accent: '#22d3ee',
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { openBrain } = useBrain();
  const { prices, isLoading } = useLivePricing();

  useEffect(() => {
    // Preload display fonts for instant render
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,700&family=Inter:wght@300;400;500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  return (
    <div style={{ background: T.bg, color: T.ink, fontFamily: T.body, minHeight: '100vh' }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .home-fade-up { animation: fadeUp 0.9s ease-out both; }
        .home-fade-up-2 { animation: fadeUp 0.9s ease-out 0.15s both; }
        .home-fade-up-3 { animation: fadeUp 0.9s ease-out 0.3s both; }
        .home-fade-up-4 { animation: fadeUp 0.9s ease-out 0.45s both; }
        .gold-shimmer {
          background: linear-gradient(90deg, ${T.gold} 0%, #e8d5a0 40%, ${T.gold} 80%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .feature-card { transition: all 0.35s cubic-bezier(0.4,0,0.2,1); }
        .feature-card:hover { transform: translateY(-4px); border-color: rgba(201,168,76,0.35) !important; }
        .feature-card:hover .feature-arrow { opacity: 1; transform: translateX(0); }
        .feature-arrow { opacity: 0; transform: translateX(-6px); transition: all 0.3s ease; }
        .cta-gold { transition: all 0.3s ease; }
        .cta-gold:hover { box-shadow: 0 6px 30px ${T.goldGlow}; transform: translateY(-1px); }
        .cta-outline { transition: all 0.3s ease; }
        .cta-outline:hover { background: rgba(201,168,76,0.08) !important; border-color: ${T.gold} !important; }
        .plan-card { transition: all 0.3s ease; }
        .plan-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
      `}</style>

      <Navigation />

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  1. CINEMATIC HERO                                              */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section style={{
        background: T.bgGradient,
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 80,
        paddingBottom: 40,
      }}>
        {/* Atmospheric glow */}
        <div style={{
          position: 'absolute', top: '10%', left: '20%',
          width: 600, height: 600,
          background: `radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '15%',
          width: 500, height: 500,
          background: `radial-gradient(circle, rgba(244,63,94,0.04) 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '0 32px', textAlign: 'center' }}>
          {/* Beta strip */}
          <div className="home-fade-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '6px 18px', borderRadius: 2,
            border: `1px solid ${T.hairline}`,
            marginBottom: 48, fontSize: 11,
            letterSpacing: '0.2em', textTransform: 'uppercase',
          }}>
            <span style={{ background: T.rose, color: '#fff', padding: '2px 8px', fontSize: 9, fontWeight: 700, letterSpacing: '0.15em' }}>Beta</span>
            <span style={{ color: T.inkMuted }}>All features free during beta</span>
          </div>

          {/* Headline */}
          <h1 className="home-fade-up" style={{
            fontFamily: T.display, fontSize: 'clamp(42px, 7vw, 86px)',
            fontWeight: 400, lineHeight: 1.05, margin: 0,
            letterSpacing: '-0.01em', color: T.ink,
          }}>
            The Standard in
          </h1>
          <h1 className="home-fade-up-2" style={{
            fontFamily: T.display, fontSize: 'clamp(42px, 7vw, 86px)',
            fontWeight: 400, fontStyle: 'italic', lineHeight: 1.05,
            margin: '4px 0 0 0', letterSpacing: '-0.01em',
          }}>
            <span className="gold-shimmer">Precious Intelligence</span>
          </h1>

          {/* Divider */}
          <div className="home-fade-up-3" style={{
            width: 80, height: 1, background: T.gold,
            margin: '40px auto', opacity: 0.5,
          }} />

          {/* Tagline */}
          <p className="home-fade-up-3" style={{
            fontFamily: T.serif, fontSize: 'clamp(16px, 2.2vw, 21px)',
            fontStyle: 'italic', color: T.inkMuted,
            maxWidth: 640, margin: '0 auto 48px',
            lineHeight: 1.7, fontWeight: 400,
          }}>
            Institutional-grade market data for precious metals, diamonds, luxury watches, and coins — powered by Simplicity, your AI market analyst.
          </p>

          {/* CTAs */}
          <div className="home-fade-up-4" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
            <Link href="/simpleton-mode">
              <button className="cta-gold" style={{
                background: `linear-gradient(135deg, ${T.gold} 0%, ${T.goldDeep} 100%)`,
                border: `1px solid ${T.gold}`,
                color: '#0b0b12',
                padding: '16px 36px',
                borderRadius: 2,
                fontFamily: T.display,
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                Explore the Platform
                <ArrowRight size={16} />
              </button>
            </Link>
            <Link href="/jewelry-appraisal">
              <button className="cta-outline" style={{
                background: 'transparent',
                border: `1px solid ${T.hairline}`,
                color: T.gold,
                padding: '16px 36px',
                borderRadius: 2,
                fontFamily: T.display,
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                Get an Appraisal
                <ArrowRight size={16} />
              </button>
            </Link>
          </div>

          {/* Live Pricing Strip */}
          {prices && !isLoading && (
            <div className="home-fade-up-4" style={{
              display: 'inline-flex', alignItems: 'center', gap: 32,
              padding: '14px 32px',
              border: `1px solid ${T.hairline}`,
              borderRadius: 2,
              background: 'rgba(244,239,226,0.02)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.gold, animation: 'shimmer 2s ease infinite' }} />
                <span style={{ fontSize: 10, letterSpacing: '0.2em', color: T.inkMuted, textTransform: 'uppercase' }}>Live</span>
              </div>
              {[
                { label: 'AU', value: prices.gold, color: '#fbbf24' },
                { label: 'AG', value: prices.silver, color: '#94a3b8' },
                { label: 'PT', value: prices.platinum, color: '#a78bfa' },
              ].map(m => (
                <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: m.color, opacity: 0.7 }} />
                  <span style={{ fontSize: 11, letterSpacing: '0.12em', color: T.inkMuted }}>{m.label}</span>
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 14, fontWeight: 600, color: T.ink }}>
                    ${m.value.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  2. PLATFORM FEATURES GRID                                      */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '80px 32px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            fontFamily: T.body, fontSize: 10, letterSpacing: '0.4em',
            color: T.gold, textTransform: 'uppercase', marginBottom: 20,
          }}>
            — The Platform —
          </div>
          <h2 style={{
            fontFamily: T.display, fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 400, color: T.ink, lineHeight: 1.15,
            margin: 0,
          }}>
            Everything You Need,{' '}
            <span style={{ fontStyle: 'italic', color: T.gold }}>Nothing You Don't</span>
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 20,
        }}>
          {features.map(f => {
            const Icon = f.icon;
            return (
              <Link key={f.title} href={f.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="feature-card" style={{
                  padding: '32px 28px',
                  border: `1px solid ${T.hairline}`,
                  borderRadius: 3,
                  background: 'rgba(244,239,226,0.015)',
                  cursor: 'pointer',
                  position: 'relative',
                  minHeight: 200,
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 2,
                    border: `1px solid ${f.accent}33`,
                    background: `${f.accent}11`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 20,
                  }}>
                    <Icon size={20} color={f.accent} />
                  </div>
                  <h3 style={{
                    fontFamily: T.display, fontSize: 20, fontWeight: 400,
                    color: T.ink, marginBottom: 10, letterSpacing: '0.01em',
                  }}>
                    {f.title}
                  </h3>
                  <p style={{
                    fontFamily: T.body, fontSize: 13, color: T.inkMuted,
                    lineHeight: 1.7, flex: 1, margin: 0,
                  }}>
                    {f.desc}
                  </p>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    marginTop: 20, fontSize: 12, color: T.gold,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>
                    <span>Explore</span>
                    <ArrowRight size={14} className="feature-arrow" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  3. SIMPLICITY AI SHOWCASE                                      */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: '80px 32px',
        background: 'linear-gradient(180deg, rgba(244,63,94,0.03) 0%, transparent 100%)',
        borderTop: `1px solid ${T.hairline}`,
        borderBottom: `1px solid ${T.hairline}`,
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 2,
            border: '1px solid rgba(244,63,94,0.2)',
            background: 'rgba(244,63,94,0.06)',
            fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase',
            color: T.rose, marginBottom: 28,
          }}>
            <Sparkles size={12} />
            AI-Powered Intelligence
          </div>

          <h2 style={{
            fontFamily: T.display, fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 400, lineHeight: 1.15, margin: '0 0 20px 0',
          }}>
            Meet{' '}
            <span style={{
              background: 'linear-gradient(135deg, #f43f5e, #ec4899)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Simplicity
            </span>
          </h2>

          <p style={{
            fontFamily: T.serif, fontSize: 18, fontStyle: 'italic',
            color: T.inkMuted, lineHeight: 1.8, marginBottom: 36,
            maxWidth: 560, margin: '0 auto 36px',
          }}>
            Your personal AI market analyst — delivering real-time precious metals pricing,
            professional diamond appraisals, Rolex valuations, and coin market intelligence
            with institutional-grade accuracy and full source transparency.
          </p>

          <button
            onClick={() => openBrain()}
            className="cta-outline"
            style={{
              background: 'rgba(244,63,94,0.08)',
              border: '1px solid rgba(244,63,94,0.25)',
              color: '#fb7185',
              padding: '16px 36px',
              borderRadius: 2,
              fontFamily: T.display,
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 12,
            }}
          >
            <Brain size={18} />
            Start a Conversation
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  4. PROFESSIONAL APPRAISAL CTA                                  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '80px 32px',
      }}>
        <div style={{
          border: `1px solid ${T.gold}`,
          borderRadius: 3,
          padding: '56px 48px',
          textAlign: 'center',
          background: `linear-gradient(135deg, rgba(201,168,76,0.04) 0%, rgba(201,168,76,0.01) 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Subtle gold corner accents */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: 60, height: 60, borderRight: `1px solid ${T.gold}`, borderBottom: `1px solid ${T.gold}`, opacity: 0.3 }} />
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: 60, height: 60, borderLeft: `1px solid ${T.gold}`, borderTop: `1px solid ${T.gold}`, opacity: 0.3 }} />

          <div style={{
            fontFamily: T.body, fontSize: 10, letterSpacing: '0.4em',
            color: T.gold, textTransform: 'uppercase', marginBottom: 20,
          }}>
            — Simpleton Atelier —
          </div>
          <h2 style={{
            fontFamily: T.display, fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 400, color: T.ink, lineHeight: 1.2,
            margin: '0 0 16px 0',
          }}>
            A Certified Record{' '}
            <span style={{ fontStyle: 'italic', color: T.gold }}>of Value</span>
          </h2>
          <p style={{
            fontFamily: T.serif, fontSize: 16, fontStyle: 'italic',
            color: T.inkMuted, maxWidth: 520, margin: '0 auto 32px',
            lineHeight: 1.7,
          }}>
            Upload photographs of your item and receive a professional AI-composed appraisal —
            reviewed and certified by Demiris Brown, GIA Graduate Gemologist.
            Five premium document templates. Tiered valuations. QR verification.
          </p>
          <Link href="/jewelry-appraisal">
            <button className="cta-gold" style={{
              background: `linear-gradient(135deg, ${T.gold} 0%, ${T.goldDeep} 100%)`,
              border: `1px solid ${T.gold}`,
              color: '#0b0b12',
              padding: '16px 40px',
              borderRadius: 2,
              fontFamily: T.display,
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 12,
            }}>
              <ScrollText size={16} />
              Begin an Appraisal
              <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  5. TRUST & CREDENTIALS                                         */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section style={{
        borderTop: `1px solid ${T.hairline}`,
        borderBottom: `1px solid ${T.hairline}`,
        padding: '40px 32px',
      }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          gap: 48, flexWrap: 'wrap',
        }}>
          {[
            { icon: Award, label: 'GIA Certified Appraiser' },
            { icon: Radio, label: 'Live Market Data' },
            { icon: Cpu, label: 'AI-Powered Analysis' },
            { icon: Shield, label: 'Secure & Encrypted' },
          ].map(t => (
            <div key={t.label} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: T.inkMuted,
            }}>
              <t.icon size={16} color={T.gold} />
              {t.label}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  6. SAAS PRICING TEASER                                         */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '80px 32px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            fontFamily: T.body, fontSize: 10, letterSpacing: '0.4em',
            color: T.gold, textTransform: 'uppercase', marginBottom: 20,
          }}>
            — For Professionals —
          </div>
          <h2 style={{
            fontFamily: T.display, fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 400, color: T.ink, lineHeight: 1.2,
            margin: '0 0 12px 0',
          }}>
            Built for Dealers, Jewelers,{' '}
            <span style={{ fontStyle: 'italic', color: T.gold }}>& Pawn Professionals</span>
          </h2>
          <p style={{
            fontFamily: T.serif, fontSize: 16, fontStyle: 'italic',
            color: T.inkMuted, maxWidth: 520, margin: '0 auto',
            lineHeight: 1.7,
          }}>
            Two plans, one standard of excellence. Choose the tools that match your operation.
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20, maxWidth: 960, margin: '0 auto',
        }}>
          {/* Free */}
          <div className="plan-card" style={{
            border: `1px solid ${T.hairline}`,
            borderRadius: 3,
            padding: '36px 28px',
            background: 'rgba(244,239,226,0.015)',
          }}>
            <div style={{ fontSize: 10, letterSpacing: '0.3em', color: T.inkMuted, textTransform: 'uppercase', marginBottom: 12 }}>
              Free
            </div>
            <div style={{ fontFamily: T.display, fontSize: 40, color: T.ink, fontWeight: 400, marginBottom: 4, lineHeight: 1 }}>
              $0<span style={{ fontSize: 16, color: T.inkMuted, fontStyle: 'italic' }}>/mo</span>
            </div>
            <div style={{ fontSize: 11, color: T.inkMuted, marginBottom: 28, fontStyle: 'italic', fontFamily: T.serif }}>
              Forever free — no credit card required
            </div>
            <div style={{ borderTop: `1px solid ${T.hairline}`, paddingTop: 20 }}>
              {[
                'Precious Metals Calculator',
                'Diamond Calculator',
                'Coin Database',
                'Rolex Archive',
                'Live Spot Pricing',
              ].map(f => (
                <div key={f} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0', fontSize: 13, color: T.ink,
                }}>
                  <ChevronRight size={12} color={T.gold} />
                  {f}
                </div>
              ))}
            </div>
            <button className="cta-outline" style={{
              width: '100%', marginTop: 28,
              background: 'transparent',
              border: `1px solid ${T.hairline}`,
              color: T.ink,
              padding: '14px 20px',
              borderRadius: 2,
              fontFamily: T.display,
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}>
              Get Started
            </button>
          </div>

          {/* Basic — $9.99 */}
          <div className="plan-card" style={{
            border: `1px solid ${T.hairline}`,
            borderRadius: 3,
            padding: '36px 28px',
            background: 'rgba(244,239,226,0.015)',
          }}>
            <div style={{ fontSize: 10, letterSpacing: '0.3em', color: T.inkMuted, textTransform: 'uppercase', marginBottom: 12 }}>
              Basic
            </div>
            <div style={{ fontFamily: T.display, fontSize: 40, color: T.ink, fontWeight: 400, marginBottom: 4, lineHeight: 1 }}>
              $9.99<span style={{ fontSize: 16, color: T.inkMuted, fontStyle: 'italic' }}>/mo</span>
            </div>
            <div style={{ fontSize: 11, color: T.inkMuted, marginBottom: 28, fontStyle: 'italic', fontFamily: T.serif }}>
              2 professional appraisals included
            </div>
            <div style={{ borderTop: `1px solid ${T.hairline}`, paddingTop: 20 }}>
              {[
                'Everything in Free',
                '2 AI Appraisals / month',
                'Simplicity AI Chat',
                'Simpleton Markets',
                'Appraisal Verification Portal',
              ].map(f => (
                <div key={f} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0', fontSize: 13, color: T.ink,
                }}>
                  <ChevronRight size={12} color={T.gold} />
                  {f}
                </div>
              ))}
            </div>
            <button className="cta-outline" style={{
              width: '100%', marginTop: 28,
              background: 'transparent',
              border: `1px solid ${T.hairline}`,
              color: T.ink,
              padding: '14px 20px',
              borderRadius: 2,
              fontFamily: T.display,
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}>
              Coming Soon
            </button>
          </div>

          {/* Premium — $19.99 */}
          <div className="plan-card" style={{
            border: `1px solid ${T.gold}`,
            borderRadius: 3,
            padding: '36px 28px',
            background: `linear-gradient(135deg, rgba(201,168,76,0.06) 0%, rgba(201,168,76,0.02) 100%)`,
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: -1, right: 20,
              background: T.gold, color: '#0b0b12',
              padding: '4px 14px', fontSize: 9,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              fontWeight: 700,
            }}>
              Most Popular
            </div>
            <div style={{ fontSize: 10, letterSpacing: '0.3em', color: T.gold, textTransform: 'uppercase', marginBottom: 12 }}>
              Premium
            </div>
            <div style={{ fontFamily: T.display, fontSize: 40, color: T.ink, fontWeight: 400, marginBottom: 4, lineHeight: 1 }}>
              $19.99<span style={{ fontSize: 16, color: T.inkMuted, fontStyle: 'italic' }}>/mo</span>
            </div>
            <div style={{ fontSize: 11, color: T.inkMuted, marginBottom: 28, fontStyle: 'italic', fontFamily: T.serif }}>
              5 professional appraisals included
            </div>
            <div style={{ borderTop: `1px solid rgba(201,168,76,0.2)`, paddingTop: 20 }}>
              {[
                'Everything in Basic',
                '5 AI Appraisals / month',
                'Market Signal Alerts',
                'Simplicity AI (Unlimited)',
                'Priority Support',
                'Custom Branding on Appraisals',
              ].map(f => (
                <div key={f} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0', fontSize: 13, color: T.ink,
                }}>
                  <ChevronRight size={12} color={T.gold} />
                  {f}
                </div>
              ))}
            </div>
            <button className="cta-gold" style={{
              width: '100%', marginTop: 28,
              background: `linear-gradient(135deg, ${T.gold} 0%, ${T.goldDeep} 100%)`,
              border: `1px solid ${T.gold}`,
              color: '#0b0b12',
              padding: '14px 20px',
              borderRadius: 2,
              fontFamily: T.display,
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}>
              Coming Soon
            </button>
          </div>
        </div>

        <div style={{
          textAlign: 'center', marginTop: 32,
          fontSize: 12, color: T.inkMuted, fontStyle: 'italic', fontFamily: T.serif,
        }}>
          All features are free during beta. Pricing takes effect when we launch.
          <br />
          Questions? <span style={{ color: T.gold }}>intel@simpletonapp.com</span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  7. NEWS TICKER                                                 */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <NewsTicker category="metals" isEnabled={true} />

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  8. FOOTER                                                      */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Footer />
      <InstallPrompt />

      {/* Appraisal FAB */}
      <Link href="/jewelry-appraisal" className="fixed top-[136px] left-6 z-50 group hidden sm:flex" aria-label="Get a professional appraisal">
        <div className="relative">
          <div className="w-16 h-16 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-active:scale-95">
            <ScrollText className="w-9 h-9" style={{ color: T.gold }} />
          </div>
          <div
            className="absolute left-14 top-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none px-2.5 py-1 rounded-md text-[10px] font-medium tracking-wide"
            style={{
              background: 'rgba(10,10,10,0.95)',
              border: `1px solid rgba(201,169,110,0.2)`,
              color: T.gold,
            }}
          >
            Get Appraisal
          </div>
        </div>
      </Link>
    </div>
  );
}
