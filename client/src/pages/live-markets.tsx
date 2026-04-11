import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Radio, Newspaper, Brain, ChevronRight, RefreshCw, Loader2, Tv } from 'lucide-react';
import { useBrain } from '@/lib/brain-context';
import { useLivePricing } from '@/hooks/use-live-pricing';

const T = {
  bg: '#0b0b12',
  bgGradient: 'radial-gradient(ellipse at 30% 10%, #181827 0%, #0b0b12 50%)',
  panel: '#0e0e18',
  ink: '#f4efe2',
  inkMuted: '#9a937f',
  gold: '#c9a84c',
  goldGlow: 'rgba(201,168,76,0.25)',
  hairline: 'rgba(244,239,226,0.10)',
  rose: '#f43f5e',
  display: '"Playfair Display", Georgia, serif',
  body: '"Inter", -apple-system, system-ui, sans-serif',
  serif: '"EB Garamond", "Playfair Display", Georgia, serif',
  mono: '"JetBrains Mono", "SF Mono", Menlo, monospace',
};

const CHANNELS = [
  { id: 'cnbc', label: 'CNBC', ytChannel: 'UCvJJ_dzjViJCoLf5uKUTwoA', searchQuery: 'CNBC live market' },
  { id: 'yahoo', label: 'Yahoo Finance', ytChannel: 'UCEAZeUIeJs0IjQiqTCdVSIg', searchQuery: 'Yahoo Finance live' },
  { id: 'bloomberg', label: 'Bloomberg', ytChannel: 'UCIALMKvObZNtJ68-rmLjgSA', searchQuery: 'Bloomberg live market' },
  { id: 'fox', label: 'Fox Business', ytChannel: 'UCceHTOnQ2S3JdGaD5VN_2Dg', searchQuery: 'Fox Business live' },
];

interface Article { title: string; link: string; source: string; pubDate: string; }

export default function LiveMarkets() {
  const { openBrain } = useBrain();
  const { prices } = useLivePricing();
  const [activeChannel, setActiveChannel] = useState('cnbc');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [newsCategory, setNewsCategory] = useState('metals');

  const activeYt = CHANNELS.find(c => c.id === activeChannel)?.ytChannel || CHANNELS[0].ytChannel;

  useEffect(() => {
    setLoadingNews(true);
    fetch(`/api/news/ticker?category=${newsCategory}`)
      .then(r => r.json())
      .then(data => { if (data.success && data.data) setArticles(data.data.slice(0, 20)); })
      .catch(() => {})
      .finally(() => setLoadingNews(false));
  }, [newsCategory]);

  const loadBriefing = async () => {
    setLoadingBriefing(true);
    try {
      const token = localStorage.getItem('simplicity_session_token') || 'briefing-guest';
      const res = await fetch('/api/assistant/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Give me a concise market briefing for the past 24 hours. Cover gold, silver, platinum, and any major market moves. Include current prices, percentage changes, and your outlook. Keep it tight — 3-4 paragraphs max. No bullet points, write in your natural voice.',
          context: 'full_expert',
          sessionToken: token,
          pageContext: '/live',
          useSimplicityBrain: true,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('text/event-stream') || ct.includes('text/plain')) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let acc = '';
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            for (const line of decoder.decode(value, { stream: true }).split('\n')) {
              if (line.startsWith('data: ')) {
                const d = line.slice(6);
                if (d === '[DONE]') continue;
                try { const p = JSON.parse(d); if (p.token) { acc += p.token; setBriefing(acc); } }
                catch { acc += d; setBriefing(acc); }
              }
            }
          }
        }
        if (acc) setBriefing(acc);
      } else {
        const data = await res.json();
        setBriefing(data.response || 'Briefing unavailable.');
      }
    } catch { setBriefing('Market briefing temporarily unavailable.'); }
    finally { setLoadingBriefing(false); }
  };

  useEffect(() => { loadBriefing(); }, []);

  const timeAgo = (s: string) => {
    if (!s) return '';
    const d = new Date(s);
    if (isNaN(d.getTime())) return '';
    const mins = Math.floor((Date.now() - d.getTime()) / 60000);
    if (mins < 0) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div style={{ background: T.bgGradient, minHeight: '100vh', color: T.ink, fontFamily: T.body }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,700&family=Inter:wght@300;400;500;600;700&display=swap');
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .lm-fade { animation: fadeUp 0.5s ease-out both; }
        .lm-article { transition: all 0.2s; cursor: pointer; }
        .lm-article:hover { background: rgba(201,168,76,0.04) !important; border-color: rgba(201,168,76,0.3) !important; }
        @media (max-width: 960px) { .lm-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Top bar */}
      <div style={{
        padding: '14px 32px', borderBottom: `1px solid ${T.hairline}`,
        background: 'rgba(11,11,18,0.85)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${T.hairline}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={14} color={T.inkMuted} />
            </div>
          </Link>
          <div>
            <div style={{ fontFamily: T.display, fontSize: 15, color: T.ink }}>
              <span style={{ fontStyle: 'italic', color: T.gold }}>Simpleton</span> Live
            </div>
            <div style={{ fontSize: 9, color: T.inkMuted, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Markets · News · SI Briefing
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.rose, animation: 'pulse 2s ease infinite' }} />
          <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: T.rose }}>Live</span>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 24px 80px' }}>

        {/* Live pricing strip */}
        {prices && (
          <div className="lm-fade" style={{
            display: 'flex', alignItems: 'center', gap: 32, padding: '14px 24px', marginBottom: 24,
            border: `1px solid ${T.hairline}`, borderRadius: 3, background: 'rgba(244,239,226,0.02)', flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Radio size={14} color={T.gold} />
              <span style={{ fontSize: 10, letterSpacing: '0.2em', color: T.inkMuted, textTransform: 'uppercase' }}>Live Spot</span>
            </div>
            {[
              { l: 'AU', v: prices.gold, c: '#fbbf24' },
              { l: 'AG', v: prices.silver, c: '#94a3b8' },
              { l: 'PT', v: prices.platinum, c: '#a78bfa' },
            ].map(m => (
              <div key={m.l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: m.c, opacity: 0.7 }} />
                <span style={{ fontSize: 11, color: T.inkMuted, letterSpacing: '0.1em' }}>{m.l}</span>
                <span style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 600, color: T.ink }}>${m.v.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Main grid */}
        <div className="lm-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>

          {/* LEFT: TV + Briefing */}
          <div>
            {/* Channel tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {CHANNELS.map(ch => (
                <button key={ch.id} onClick={() => setActiveChannel(ch.id)} style={{
                  padding: '8px 18px', borderRadius: 3,
                  border: activeChannel === ch.id ? `1px solid ${T.gold}` : `1px solid ${T.hairline}`,
                  background: activeChannel === ch.id ? 'rgba(201,168,76,0.08)' : 'transparent',
                  color: activeChannel === ch.id ? T.gold : T.inkMuted,
                  fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <Tv size={13} /> {ch.label}
                </button>
              ))}
            </div>

            {/* Video embed — uses live_stream channel embed with fallback */}
            <div className="lm-fade" style={{
              aspectRatio: '16/9', background: '#000', borderRadius: 4,
              overflow: 'hidden', border: `1px solid ${T.hairline}`, marginBottom: 24,
              position: 'relative',
            }}>
              <iframe
                key={activeYt}
                src={`https://www.youtube.com/embed/live_stream?channel=${activeYt}&autoplay=1&mute=1`}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`Live: ${CHANNELS.find(c => c.id === activeChannel)?.label}`}
              />
              {/* Fallback overlay when stream is not live */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: '12px 16px',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.rose, animation: 'pulse 2s infinite' }} />
                  <span style={{ fontSize: 11, color: T.inkMuted, fontFamily: T.mono }}>
                    {CHANNELS.find(c => c.id === activeChannel)?.label} Live
                  </span>
                </div>
                <a
                  href={`https://www.youtube.com/@${activeChannel === 'cnbc' ? 'CNBC' : activeChannel === 'yahoo' ? 'YahooFinance' : activeChannel === 'bloomberg' ? 'Bloomberg' : 'FoxBusiness'}/live`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 10, color: T.gold, textDecoration: 'none',
                    padding: '4px 10px', borderRadius: 4,
                    border: `1px solid ${T.gold}40`, background: 'rgba(201,168,76,0.1)',
                  }}
                >
                  Open on YouTube ↗
                </a>
              </div>
            </div>

            {/* SI Briefing */}
            <div style={{ border: `1px solid ${T.gold}33`, borderRadius: 4, background: 'rgba(201,168,76,0.03)', overflow: 'hidden' }}>
              <div style={{
                padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: `1px solid ${T.gold}22`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: T.display, fontSize: 18, fontStyle: 'italic', color: T.gold }}>S</span>
                  <div>
                    <div style={{ fontFamily: T.display, fontSize: 14, color: T.ink }}>
                      Simplicity's <span style={{ fontStyle: 'italic', color: T.gold }}>Market Briefing</span>
                    </div>
                    <div style={{ fontSize: 9, color: T.inkMuted, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                      Past 24 hours — powered by SI
                    </div>
                  </div>
                </div>
                <button onClick={loadBriefing} disabled={loadingBriefing} style={{
                  background: 'none', border: `1px solid ${T.hairline}`, borderRadius: 2,
                  padding: '6px 14px', cursor: 'pointer', color: T.inkMuted,
                  fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {loadingBriefing ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={12} />}
                  Refresh
                </button>
              </div>
              <div style={{ padding: '20px 24px' }}>
                {loadingBriefing && !briefing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 0', justifyContent: 'center' }}>
                    <Loader2 size={18} color={T.gold} style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: 13, color: T.inkMuted, fontStyle: 'italic', fontFamily: T.serif }}>
                      Simplicity is analyzing the markets...
                    </span>
                  </div>
                ) : briefing ? (
                  <div style={{ fontSize: 14, lineHeight: 1.8, color: T.ink, fontFamily: T.serif, whiteSpace: 'pre-wrap' }}>
                    {briefing}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: T.inkMuted, fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
                    Briefing unavailable. Click refresh to try again.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: News Feed */}
          <div>
            {/* Category tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {['metals', 'diamonds', 'watches', 'coins'].map(cat => (
                <button key={cat} onClick={() => setNewsCategory(cat)} style={{
                  padding: '6px 14px', borderRadius: 2, fontSize: 11,
                  border: newsCategory === cat ? `1px solid ${T.gold}` : `1px solid ${T.hairline}`,
                  background: newsCategory === cat ? 'rgba(201,168,76,0.08)' : 'transparent',
                  color: newsCategory === cat ? T.gold : T.inkMuted,
                  cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', marginBottom: 8, borderBottom: `1px solid ${T.hairline}` }}>
              <Newspaper size={14} color={T.gold} />
              <span style={{ fontFamily: T.display, fontSize: 13, color: T.ink, fontStyle: 'italic' }}>Latest Headlines</span>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 9, color: T.inkMuted, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{articles.length} articles</span>
            </div>

            <div style={{ maxHeight: 'calc(100vh - 240px)', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: `${T.hairline} transparent` }}>
              {loadingNews ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                  <Loader2 size={18} color={T.gold} style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              ) : articles.length === 0 ? (
                <div style={{ fontSize: 13, color: T.inkMuted, fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>
                  No articles available.
                </div>
              ) : articles.map((a, i) => (
                <a key={i} href={a.link} target="_blank" rel="noopener noreferrer" className="lm-article" style={{
                  display: 'block', textDecoration: 'none', padding: '14px 16px', marginBottom: 6,
                  border: `1px solid ${T.hairline}`, borderRadius: 3, background: 'rgba(244,239,226,0.01)',
                }}>
                  <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.5, marginBottom: 6, fontWeight: 500 }}>{a.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: T.inkMuted }}>
                    <span style={{ color: T.gold }}>{a.source}</span>
                    <span style={{ color: T.hairline }}>|</span>
                    <span>{timeAgo(a.pubDate)}</span>
                  </div>
                </a>
              ))}
            </div>

            <button onClick={() => openBrain('What are the most important market developments today?')} style={{
              width: '100%', marginTop: 16, padding: '12px 16px', borderRadius: 3,
              border: `1px solid ${T.gold}33`, background: 'rgba(201,168,76,0.04)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontFamily: T.display, fontSize: 12, fontStyle: 'italic', color: T.gold,
            }}>
              <Brain size={14} />
              Ask Simplicity about today's market
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
