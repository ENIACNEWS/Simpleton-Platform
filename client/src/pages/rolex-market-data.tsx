import { useState } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, MessageSquare, ChevronDown, ChevronUp, Trophy, BarChart3, Clock, DollarSign } from "lucide-react";
import { ROLEX_INTELLIGENCE, REF_PRODUCTION, MARKET_VALUE } from "@/data/rolex-reference-data";

const TIER_COLORS: Record<string, string> = {
  'S-Tier': 'bg-yellow-500 text-black',
  'A-Tier': 'bg-green-600 text-white',
  'B-Tier': 'bg-blue-600 text-white',
  'C-Tier': 'bg-gray-600 text-white',
};
const TIER_BORDER: Record<string, string> = {
  'S-Tier': 'border-yellow-500/50',
  'A-Tier': 'border-green-500/40',
  'B-Tier': 'border-blue-500/30',
  'C-Tier': 'border-gray-500/20',
};
const TIER_GLOW: Record<string, string> = {
  'S-Tier': 'shadow-yellow-500/10',
  'A-Tier': 'shadow-green-500/10',
  'B-Tier': 'shadow-blue-500/10',
  'C-Tier': '',
};
const TREND_COLOR: Record<string, string> = {
  'Rising': 'text-green-400',
  'Stable': 'text-gray-300',
  'Cooling': 'text-orange-400',
  'Correcting': 'text-red-400',
};
const DEMAND_COLOR: Record<string, string> = {
  'Extreme': 'text-red-400',
  'Very High': 'text-orange-400',
  'High': 'text-yellow-400',
  'Moderate': 'text-gray-300',
};

export default function RolexMarketData() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterTier, setFilterTier] = useState<string>('All');
  const [filterTrend, setFilterTrend] = useState<string>('All');

  const allRefs = Object.entries(ROLEX_INTELLIGENCE);
  const tierOrder: Record<string, number> = { 'S-Tier': 0, 'A-Tier': 1, 'B-Tier': 2, 'C-Tier': 3 };

  const refName = (ref: string) => REF_PRODUCTION[ref]?.name ?? ref;

  const filtered = allRefs
    .filter(([, v]) => filterTier === 'All' || v.investmentGrade === filterTier)
    .filter(([, v]) => filterTrend === 'All' || v.currentTrend === filterTrend)
    .sort(([, a], [, b]) => (tierOrder[a.investmentGrade] ?? 9) - (tierOrder[b.investmentGrade] ?? 9));

  const sTierRefs = allRefs.filter(([, v]) => v.investmentGrade === 'S-Tier');
  const risingRefs = allRefs.filter(([, v]) => v.currentTrend === 'Rising');
  const extremeDemand = allRefs.filter(([, v]) => v.demandLevel === 'Extreme');
  const avgApprec = Math.round(
    allRefs.reduce((s, [, v]) => s + parseFloat(v.appreciationRate5yr.replace(/[^0-9.]/g, '') || '0'), 0) / allRefs.length
  );

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(160deg, #0a0a08 0%, #0f0f0c 50%, #0a0a08 100%)' }}>
      <Navigation />

      <main className="container mx-auto px-4 py-24 max-w-7xl">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <div className="text-center mb-14 relative">
          {/* Decorative top rule */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px flex-1 max-w-[120px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(202,163,79,0.7))' }} />
            <div className="w-2 h-2 rounded-full bg-amber-400/70" />
            <div className="h-px flex-1 max-w-[120px]" style={{ background: 'linear-gradient(90deg, rgba(202,163,79,0.7), transparent)' }} />
          </div>

          <div className="text-xs tracking-[0.4em] text-amber-400/50 mb-3 uppercase"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            <span className="simpleton-brand">Simpleton</span>™ · Investment Intelligence
          </div>

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 'clamp(2.4rem, 6vw, 5rem)', letterSpacing: '0.1em', color: '#f5e6c0', lineHeight: 1.1 }}>
            ROLEX
          </h1>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(1.2rem, 3.5vw, 2.4rem)', letterSpacing: '0.2em', color: '#c9a44f' }}>
            Market Intelligence
          </h2>

          <p className="mt-4 text-stone-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem' }}>
            Comprehensive investment rankings, demand analysis, auction intelligence,
            and buying &amp; selling guidance for every tracked reference — all powered by static market research.
          </p>

          {/* Bottom rule */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="h-px flex-1 max-w-[120px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(202,163,79,0.5))' }} />
            <div className="text-[10px] text-amber-600/40 tracking-widest uppercase" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Est. 2024
            </div>
            <div className="h-px flex-1 max-w-[120px]" style={{ background: 'linear-gradient(90deg, rgba(202,163,79,0.5), transparent)' }} />
          </div>
        </div>

        {/* ── OVERVIEW STATS ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: <BarChart3 className="w-8 h-8 text-amber-500/40" />, label: 'References Tracked', value: allRefs.length, color: 'text-amber-400', border: 'border-amber-500/20' },
            { icon: <Trophy className="w-8 h-8 text-yellow-500/40" />, label: 'S-Tier Blue Chips', value: sTierRefs.length, color: 'text-yellow-300', border: 'border-yellow-500/20' },
            { icon: <TrendingUp className="w-8 h-8 text-green-500/40" />, label: 'Currently Rising', value: risingRefs.length, color: 'text-green-400', border: 'border-green-500/20' },
            { icon: <DollarSign className="w-8 h-8 text-blue-500/40" />, label: 'Avg 5-Yr Return', value: `+${avgApprec}%`, color: 'text-blue-300', border: 'border-blue-500/20' },
          ].map(s => (
            <Card key={s.label} className={`p-5 bg-white/[0.03] ${s.border} text-center`}>
              <div className="flex justify-center mb-2">{s.icon}</div>
              <p className={`text-2xl sm:text-3xl font-bold mb-1 ${s.color}`}
                style={{ fontFamily: "'Playfair Display', serif" }}>{s.value}</p>
              <p className="text-xs text-stone-500">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* ── TOP S-TIER SPOTLIGHT ─────────────────────────────────────────── */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-amber-200 mb-4 flex items-center gap-2"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            <Trophy className="w-5 h-5 text-yellow-400" />
            S-Tier Blue Chip References
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {sTierRefs.map(([ref, intel]) => (
              <button
                key={ref}
                onClick={() => { setFilterTier('S-Tier'); setExpanded(ref); document.getElementById('ref-grid')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="text-left p-4 rounded-lg border border-yellow-500/30 bg-yellow-900/10 hover:bg-yellow-900/20 hover:border-yellow-500/60 transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-amber-400/70">{ref}</span>
                  <span className="text-xs font-bold text-green-400">{intel.appreciationRate5yr}</span>
                </div>
                <p className="text-sm font-semibold text-white group-hover:text-yellow-200 transition-colors leading-snug"
                  style={{ fontFamily: "'Playfair Display', serif" }}>{refName(ref)}</p>
                <p className="text-xs text-amber-300/70 mt-1">{intel.retailPrice} retail · {intel.premiumOverRetail}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── TOP APPRECIATING ─────────────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="p-5 bg-white/[0.03] border-green-500/20">
            <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              <TrendingUp className="w-5 h-5" />
              Top Appreciating
            </h3>
            <div className="space-y-2">
              {allRefs
                .sort(([, a], [, b]) => parseFloat(b.appreciationRate5yr.replace(/[^0-9.]/g, '') || '0') - parseFloat(a.appreciationRate5yr.replace(/[^0-9.]/g, '') || '0'))
                .slice(0, 6)
                .map(([ref, intel]) => (
                  <button
                    key={ref}
                    onClick={() => { setFilterTier('All'); setExpanded(ref); document.getElementById('ref-grid')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="w-full flex items-center justify-between p-3 rounded bg-white/5 hover:bg-green-900/20 transition-all group"
                  >
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white group-hover:text-green-300">{refName(ref)}</p>
                      <p className="text-[11px] text-stone-500 font-mono">{ref}</p>
                    </div>
                    <p className="text-lg font-bold text-green-400">{intel.appreciationRate5yr}</p>
                  </button>
                ))}
            </div>
          </Card>

          <Card className="p-5 bg-white/[0.03] border-red-500/20">
            <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              <Clock className="w-5 h-5" />
              Extreme Demand References
            </h3>
            <div className="space-y-2">
              {extremeDemand.slice(0, 6).map(([ref, intel]) => (
                <button
                  key={ref}
                  onClick={() => { setFilterTier('All'); setExpanded(ref); document.getElementById('ref-grid')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="w-full flex items-center justify-between p-3 rounded bg-white/5 hover:bg-red-900/20 transition-all group"
                >
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white group-hover:text-red-300">{refName(ref)}</p>
                    <p className="text-[11px] text-stone-500 font-mono">{ref} · Waitlist: {intel.waitlistYears}</p>
                  </div>
                  <span className="text-xs font-bold text-red-400 bg-red-900/30 px-2 py-1 rounded border border-red-500/20">
                    {intel.demandLevel}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* ── FULL REFERENCE GRID ──────────────────────────────────────────── */}
        <div id="ref-grid">
          <div className="flex flex-wrap gap-2 items-center mb-6">
            <h3 className="text-lg font-bold text-amber-200 mr-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              All References
            </h3>
            <span className="text-xs text-stone-500 mr-2">Grade:</span>
            {['All', 'S-Tier', 'A-Tier', 'B-Tier', 'C-Tier'].map(t => (
              <button key={t} onClick={() => setFilterTier(t)}
                className={`px-3 py-1 rounded text-xs font-medium border transition-all ${filterTier === t ? 'bg-amber-500 text-black border-amber-400' : 'bg-white/5 text-stone-300 border-white/10 hover:border-amber-500/40'}`}>
                {t}
              </button>
            ))}
            <span className="text-xs text-stone-500 mx-1">Trend:</span>
            {['All', 'Rising', 'Stable', 'Cooling', 'Correcting'].map(t => (
              <button key={t} onClick={() => setFilterTrend(t)}
                className={`px-3 py-1 rounded text-xs font-medium border transition-all ${filterTrend === t ? 'bg-amber-500 text-black border-amber-400' : 'bg-white/5 text-stone-300 border-white/10 hover:border-amber-500/40'}`}>
                {t}
              </button>
            ))}
            <span className="text-xs text-stone-500 ml-auto">{filtered.length} references</span>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(([ref, intel]) => {
              const isOpen = expanded === ref;
              return (
                <div key={ref}
                  className={`rounded-lg border bg-white/[0.03] transition-all duration-200 shadow-lg ${TIER_BORDER[intel.investmentGrade]} ${TIER_GLOW[intel.investmentGrade]} ${isOpen ? 'sm:col-span-2 xl:col-span-3' : ''}`}>

                  {/* ── Card top (always visible, fully clickable) ── */}
                  <button
                    className="w-full text-left p-4 focus:outline-none"
                    onClick={() => setExpanded(isOpen ? null : ref)}
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${TIER_COLORS[intel.investmentGrade]}`}>
                            {intel.investmentGrade}
                          </span>
                          <span className="text-[10px] text-stone-500 font-mono">{ref}</span>
                        </div>
                        <h3 className="font-semibold text-white text-sm leading-snug"
                          style={{ fontFamily: "'Playfair Display', serif" }}>
                          {refName(ref)}
                        </h3>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-xs font-semibold mb-0.5 flex items-center justify-end gap-1 ${TREND_COLOR[intel.currentTrend]}`}>
                          {intel.currentTrend === 'Rising' && <TrendingUp className="w-3 h-3" />}
                          {intel.currentTrend}
                        </div>
                        <div className="text-lg font-bold text-green-400"
                          style={{ fontFamily: "'Playfair Display', serif" }}>
                          {intel.appreciationRate5yr}
                        </div>
                        <div className="text-[10px] text-stone-500">5-yr return</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                      <div className="bg-white/5 rounded p-2">
                        <p className="text-[10px] text-stone-500 mb-0.5">Retail</p>
                        <p className="text-xs text-amber-300 font-semibold">{intel.retailPrice}</p>
                      </div>
                      <div className="bg-white/5 rounded p-2">
                        <p className="text-[10px] text-stone-500 mb-0.5">Premium</p>
                        <p className="text-xs text-white font-semibold">{intel.premiumOverRetail}</p>
                      </div>
                      <div className="bg-white/5 rounded p-2">
                        <p className="text-[10px] text-stone-500 mb-0.5">Waitlist</p>
                        <p className="text-xs text-orange-300 font-semibold">{intel.waitlistYears}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-stone-500">
                        Demand: <span className={`font-semibold ${DEMAND_COLOR[intel.demandLevel]}`}>{intel.demandLevel}</span>
                      </span>
                      <span className="text-[11px] text-stone-500">
                        ATH: <span className="text-white">{intel.peakPrice}</span> <span className="text-stone-600">({intel.peakYear})</span>
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-amber-400/60">
                        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {isOpen ? 'Collapse' : 'Details'}
                      </span>
                    </div>
                  </button>

                  {/* ── Expanded detail panel ── */}
                  {isOpen && (
                    <div className="px-4 pb-5 border-t border-white/10 pt-4 space-y-4">

                      {/* Why It Matters */}
                      <div className="bg-amber-900/10 border border-amber-500/20 rounded p-3">
                        <p className="text-[11px] text-amber-400 font-semibold mb-1 uppercase tracking-wider">Why It Matters</p>
                        <p className="text-sm text-stone-300 leading-relaxed">{intel.whyItMatters}</p>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        {/* Key Facts */}
                        <div className="bg-white/5 border border-white/10 rounded p-3">
                          <p className="text-[11px] text-amber-400 font-semibold mb-2 uppercase tracking-wider">Key Facts</p>
                          <ul className="space-y-1.5">
                            {intel.keyFacts.map((f, i) => (
                              <li key={i} className="flex gap-2 text-xs text-stone-300">
                                <span className="text-amber-400 shrink-0 mt-0.5">›</span>{f}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Notable Variants */}
                        {intel.notableVariants.length > 0 && (
                          <div className="bg-white/5 border border-white/10 rounded p-3">
                            <p className="text-[11px] text-amber-400 font-semibold mb-2 uppercase tracking-wider">Notable Variants</p>
                            <ul className="space-y-1.5">
                              {intel.notableVariants.map((v, i) => (
                                <li key={i} className="flex gap-2 text-xs text-stone-300">
                                  <span className="text-cyan-400 shrink-0 mt-0.5">›</span>{v}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Auction Records */}
                      {intel.auctionRecords.length > 0 && (
                        <div className="bg-white/5 border border-white/10 rounded p-3">
                          <p className="text-[11px] text-amber-400 font-semibold mb-2 uppercase tracking-wider">Auction Records</p>
                          <div className="grid sm:grid-cols-2 gap-1.5">
                            {intel.auctionRecords.map((r, i) => (
                              <div key={i} className="flex gap-2 text-xs text-stone-300">
                                <span className="text-green-400 shrink-0 mt-0.5">›</span>{r}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Buying + Selling */}
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="bg-green-900/15 border border-green-500/25 rounded p-3">
                          <p className="text-[11px] text-green-400 font-semibold mb-1.5 uppercase tracking-wider">Buying Intelligence</p>
                          <p className="text-xs text-stone-300 leading-relaxed">{intel.buyingTips}</p>
                        </div>
                        <div className="bg-orange-900/15 border border-orange-500/25 rounded p-3">
                          <p className="text-[11px] text-orange-400 font-semibold mb-1.5 uppercase tracking-wider">Selling Intelligence</p>
                          <p className="text-xs text-stone-300 leading-relaxed">{intel.sellingTips}</p>
                        </div>
                      </div>

                      {/* Market Value */}
                      {MARKET_VALUE[ref] && (
                        <div className="flex items-center gap-2 p-3 rounded bg-amber-900/10 border border-amber-500/15">
                          <DollarSign className="w-4 h-4 text-amber-400 shrink-0" />
                          <div>
                            <span className="text-[11px] text-stone-500">Current Secondary Market: </span>
                            <span className="text-sm font-bold text-amber-300">{MARKET_VALUE[ref]}</span>
                          </div>
                        </div>
                      )}

                      {/* Ask Simplicity */}
                      <Button
                        size="sm"
                        onClick={() => {
                          const q = `Tell me about the Rolex ${refName(ref)} (ref ${ref}) as an investment — current market conditions, what to watch for, and whether now is a good time to buy or sell.`;
                          localStorage.setItem('simplicity-pending-question', q);
                          window.location.href = '/ai-chat';
                        }}
                        className="w-full bg-purple-700/50 hover:bg-purple-700/70 border border-purple-500/30 text-white text-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5 mr-2" />
                        Ask Simplicity about {ref}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-stone-500">
              <p className="text-lg">No references match the selected filters.</p>
              <button onClick={() => { setFilterTier('All'); setFilterTrend('All'); }}
                className="mt-3 text-sm text-amber-400 underline">
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* ── FOOTER DISCLAIMER ────────────────────────────────────────────── */}
        <div className="mt-16 border-t border-white/10 pt-8 text-center">
          <p className="text-[11px] text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Market intelligence data is updated periodically and reflects secondary market conditions. Values represent typical ranges; actual sale prices may vary. Not financial advice. Always consult a certified watch specialist before making investment decisions.
          </p>
          <div className="mt-3 text-[10px] text-amber-600/30 tracking-widest uppercase"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            <span className="simpleton-brand">Simpleton</span>™ · The Archive · Market Intelligence Division
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
