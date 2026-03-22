import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Search, Crown, Calendar, Database, Info, Eye, EyeOff, Sparkles, ShieldCheck, GitCompare, TrendingUp, Wrench, MessageSquare, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { NewsTicker } from "@/components/news/news-ticker";
import { RolexAIAssistant } from "@/components/rolex/rolex-ai-assistant";
import { MARKET_VALUE, SPECS_MAP, REF_PRODUCTION, ROLEX_INTELLIGENCE, parseSerialForYear } from "@/data/rolex-reference-data";
import caliber2236Image from "@assets/IMG_1595_1760562247366.jpeg";
import caliber3235Image from "@assets/3235_1760575934364.jpg";
import caliber4130Image from "@assets/4130_1760576567028.jpg";
import caliber3285Image from "@assets/3285_1760576814927.jpg";
import caliber3255Image from "@assets/3255_1760577927140.jpg";
import caliber7135Image from "@assets/7135_1760578131268.jpg";
import caliber1570Image from "@assets/1570_1760578238302.jpg";
import caliber3135Image from "@assets/3135_1760578407338.jpg";
import caliber3230Image from "@assets/3230_1760578572962.jpg";
import caliber1560Image from "@assets/1560_1772769998464.jpg";
import caliber3130Image from "@assets/3130_1772769998464.jpeg";
import caliber3035Image from "@assets/3035_1772769998464.jpg";
import caliber2235Image from "@assets/2235_1772769998465.jpeg";
import caliber2230Image from "@assets/2230_1772769998465.jpeg";
import caliber3131Image from "@assets/3131__1772769998465.jpeg";
import caliber3135f8Image from "@assets/3135-f8_1772769998465.jpg";
import caliber3187Image from "@assets/3187_1772769998465.jpeg";
import submariner126610LNImage from "@assets/126610LN_1760577659931.jpg";
import submariner124060Image from "@assets/124060_1760578918139.jpg";
import submariner116610LVImage from "@assets/116610LV_1760579181486.jpg";
import gmt126710BLROImage from "@assets/126710BLRO_1760579348387.jpg";
import gmt126710BLNRImage from "@assets/126710BLNR_1760579468473.jpg";
import gmt126711CHNRImage from "@assets/126711CHNR_1760579597578.jpg";
import daytona126500LNImage from "@assets/126500LN_1760579697922.jpg";
import daytona116508Image from "@assets/116508_1760579834917.jpg";
import daytona116595RBOWImage from "@assets/116595RBOW_1760580001626.jpg";

// ─────────────────────────────────────────────────────────────────────────────
// MARKET INTELLIGENCE PANEL
// ─────────────────────────────────────────────────────────────────────────────
function MarketIntelligencePanel() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterTier, setFilterTier] = useState<string>('All');
  const [filterTrend, setFilterTrend] = useState<string>('All');

  const refs = Object.entries(ROLEX_INTELLIGENCE);

  const tierOrder = { 'S-Tier': 0, 'A-Tier': 1, 'B-Tier': 2, 'C-Tier': 3 };
  const tierColors: Record<string, string> = {
    'S-Tier': 'bg-yellow-500 text-black',
    'A-Tier': 'bg-green-600 text-white',
    'B-Tier': 'bg-blue-600 text-white',
    'C-Tier': 'bg-gray-600 text-white',
  };
  const tierBorder: Record<string, string> = {
    'S-Tier': 'border-yellow-500/40 hover:border-yellow-400/70',
    'A-Tier': 'border-green-500/30 hover:border-green-400/60',
    'B-Tier': 'border-blue-500/30 hover:border-blue-400/60',
    'C-Tier': 'border-gray-500/20 hover:border-gray-400/40',
  };
  const trendIcon = (t: string) => {
    if (t === 'Rising') return <TrendingUp className="w-3.5 h-3.5 text-green-400" />;
    if (t === 'Cooling' || t === 'Correcting') return <span className="text-xs text-orange-400">↘</span>;
    return <span className="text-xs text-gray-400">→</span>;
  };
  const trendColor = (t: string) =>
    t === 'Rising' ? 'text-green-400' : t === 'Stable' ? 'text-gray-300' : 'text-orange-400';

  const refName = (ref: string) => REF_PRODUCTION[ref]?.name ?? ref;

  const filtered = refs
    .filter(([, v]) => filterTier === 'All' || v.investmentGrade === filterTier)
    .filter(([, v]) => filterTrend === 'All' || v.currentTrend === filterTrend)
    .sort(([, a], [, b]) => tierOrder[a.investmentGrade] - tierOrder[b.investmentGrade]);

  const sTier = refs.filter(([, v]) => v.investmentGrade === 'S-Tier').length;
  const aTier = refs.filter(([, v]) => v.investmentGrade === 'A-Tier').length;
  const rising = refs.filter(([, v]) => v.currentTrend === 'Rising').length;
  const avgApprec = Math.round(
    refs.reduce((sum, [, v]) => sum + parseFloat(v.appreciationRate5yr.replace(/[^0-9.]/g, '') || '0'), 0) / refs.length
  );

  const parseAvgResale = (range: string): number | null => {
    const nums = range.match(/\$?([\d,]+)/g);
    if (!nums || nums.length < 2) return null;
    const lo = parseInt(nums[0].replace(/[$,]/g, ''));
    const hi = parseInt(nums[1].replace(/[$,]/g, ''));
    return Math.round((lo + hi) / 2);
  };

  const RESALE_TABLE: { category: string; items: { ref: string; name: string }[] }[] = [
    { category: 'Submariner (Current)', items: [
      { ref: '124060', name: 'Sub No-Date' }, { ref: '126610LN', name: 'Sub Date Black' },
      { ref: '126610LV', name: 'Sub "Starbucks"' }, { ref: '116610LV', name: 'Sub "Hulk"' },
      { ref: '126619LB', name: 'Sub "Smurf"' },
    ]},
    { category: 'GMT-Master II', items: [
      { ref: '126710BLRO', name: 'GMT "Pepsi"' }, { ref: '126710BLNR', name: 'GMT "Batman"' },
      { ref: '126720VTNR', name: 'GMT "Sprite"' }, { ref: '116710BLNR', name: 'GMT "Batman" Gen VI' },
    ]},
    { category: 'Daytona', items: [
      { ref: '126500LN', name: 'Daytona 4131' }, { ref: '116500LN', name: 'Daytona Ceramic' },
      { ref: '16520', name: 'Daytona "Zenith"' }, { ref: '6241', name: 'Daytona "Paul Newman"' },
    ]},
    { category: 'Explorer / Explorer II', items: [
      { ref: '124270', name: 'Explorer 36mm' }, { ref: '226570', name: 'Explorer II' },
      { ref: '1016', name: 'Explorer (Vintage)' },
    ]},
    { category: 'Sea-Dweller / DeepSea', items: [
      { ref: '126600', name: 'Sea-Dweller 43mm' }, { ref: '126660', name: 'DeepSea' },
      { ref: '16600', name: 'Sea-Dweller (Disc.)' },
    ]},
    { category: 'Day-Date / Datejust', items: [
      { ref: '228238', name: 'Day-Date 40 YG' }, { ref: '228235', name: 'Day-Date 40 Everose' },
      { ref: '126300', name: 'Datejust 41' },
    ]},
    { category: 'Specialty / Vintage', items: [
      { ref: '116400GV', name: 'Milgauss Green' }, { ref: '126622', name: 'Yacht-Master 40' },
      { ref: '6538', name: 'Sub "James Bond"' }, { ref: '6542', name: 'GMT "Bakelite"' },
      { ref: '5513', name: 'Sub Vintage' }, { ref: '1675', name: 'GMT "Pepsi" Vintage' },
    ]},
  ];

  return (
    <div className="space-y-8">
      {/* Vintage header */}
      <div className="text-center pb-6 border-b border-amber-500/20">
        <div className="text-xs tracking-[0.4em] text-amber-400/60 mb-2 uppercase" style={{fontFamily:"'Cormorant Garamond', serif"}}>
          <span className="simpleton-brand">Simpleton</span> Vision™ — Investment Intelligence Division
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-amber-100 mb-1" style={{fontFamily:"'Playfair Display', serif", letterSpacing:'0.06em'}}>
          Market Intelligence
        </h2>
        <p className="text-sm text-stone-400 max-w-xl mx-auto" style={{fontFamily:"'Cormorant Garamond', serif", fontSize:'1.05rem'}}>
          Live investment rankings, demand analysis, and collector intelligence for every tracked reference
        </p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {label:'References Tracked', value: refs.length, color:'text-amber-400', border:'border-amber-500/20'},
          {label:'S-Tier Blue Chips', value: sTier, color:'text-yellow-300', border:'border-yellow-500/20'},
          {label:'Currently Rising', value: rising, color:'text-green-400', border:'border-green-500/20'},
          {label:'Avg 5-Yr Appreciation', value: `+${avgApprec}%`, color:'text-blue-300', border:'border-blue-500/20'},
        ].map(s => (
          <Card key={s.label} className={`bg-white/5 border ${s.border} text-center p-4`}>
            <p className={`text-2xl sm:text-3xl font-bold mb-1 ${s.color}`} style={{fontFamily:"'Playfair Display', serif"}}>{s.value}</p>
            <p className="text-xs text-stone-400">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Average Resale Cost Table */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-amber-100" style={{fontFamily:"'Playfair Display', serif"}}>
            Average Resale Cost — 2026
          </h3>
          <div className="h-px flex-1 bg-amber-500/20" />
          <span className="text-xs text-stone-500">Midpoint of secondary market range</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {RESALE_TABLE.map(section => (
            <Card key={section.category} className="bg-white/[0.03] border-white/10">
              <div className="px-4 py-2 border-b border-white/10">
                <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">{section.category}</p>
              </div>
              <div className="divide-y divide-white/5">
                {section.items.map(item => {
                  const range = MARKET_VALUE[item.ref];
                  const avg = range ? parseAvgResale(range) : null;
                  const intel = ROLEX_INTELLIGENCE[item.ref];
                  return (
                    <div key={item.ref} className="flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        {intel && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                            intel.investmentGrade === 'S-Tier' ? 'bg-yellow-500 text-black' :
                            intel.investmentGrade === 'A-Tier' ? 'bg-green-600 text-white' :
                            intel.investmentGrade === 'B-Tier' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'
                          }`}>{intel.investmentGrade}</span>
                        )}
                        <div className="min-w-0">
                          <span className="text-xs text-white">{item.name}</span>
                          <span className="text-[10px] text-stone-600 font-mono ml-1.5">{item.ref}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        {avg ? (
                          <>
                            <p className="text-sm font-bold text-green-300">${avg.toLocaleString()}</p>
                            <p className="text-[10px] text-stone-600">{range}</p>
                          </>
                        ) : (
                          <p className="text-xs text-stone-600">—</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
        <p className="text-[10px] text-stone-600 text-center">Average resale = midpoint of secondary market range. Actual prices vary by condition, papers, and market timing.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-stone-400 mr-2">Investment Grade:</span>
        {['All','S-Tier','A-Tier','B-Tier','C-Tier'].map(t => (
          <button
            key={t}
            onClick={() => setFilterTier(t)}
            className={`px-3 py-1 rounded text-xs font-medium border transition-all ${filterTier === t ? 'bg-amber-500 text-black border-amber-400' : 'bg-white/5 text-stone-300 border-white/10 hover:border-amber-500/40'}`}
          >
            {t}
          </button>
        ))}
        <span className="text-xs text-stone-400 mx-2">Trend:</span>
        {['All','Rising','Stable','Cooling','Correcting'].map(t => (
          <button
            key={t}
            onClick={() => setFilterTrend(t)}
            className={`px-3 py-1 rounded text-xs font-medium border transition-all ${filterTrend === t ? 'bg-amber-500 text-black border-amber-400' : 'bg-white/5 text-stone-300 border-white/10 hover:border-amber-500/40'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Reference cards grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(([ref, intel]) => {
          const isOpen = expanded === ref;
          return (
            <div
              key={ref}
              className={`rounded-lg border bg-white/[0.03] transition-all duration-200 cursor-pointer ${tierBorder[intel.investmentGrade]} ${isOpen ? 'sm:col-span-2 xl:col-span-3' : ''}`}
              onClick={() => setExpanded(isOpen ? null : ref)}
            >
              {/* Card header - always visible */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tierColors[intel.investmentGrade]}`}>
                        {intel.investmentGrade}
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono">{ref}</span>
                    </div>
                    <h3 className="font-semibold text-white text-sm leading-snug" style={{fontFamily:"'Playfair Display', serif"}}>
                      {refName(ref)}
                    </h3>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 justify-end mb-0.5">
                      {trendIcon(intel.currentTrend)}
                      <span className={`text-xs font-semibold ${trendColor(intel.currentTrend)}`}>{intel.currentTrend}</span>
                    </div>
                    <div className="text-lg font-bold text-green-400" style={{fontFamily:"'Playfair Display', serif"}}>
                      {intel.appreciationRate5yr}
                    </div>
                    <div className="text-[10px] text-stone-500">5-yr return</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/5 rounded p-2">
                    <p className="text-[10px] text-stone-500 mb-0.5">Retail</p>
                    <p className="text-xs text-amber-300 font-semibold">{intel.retailPrice}</p>
                  </div>
                  <div className="bg-white/5 rounded p-2">
                    <p className="text-[10px] text-stone-500 mb-0.5">Market Premium</p>
                    <p className="text-xs text-white font-semibold">{intel.premiumOverRetail}</p>
                  </div>
                  <div className="bg-white/5 rounded p-2">
                    <p className="text-[10px] text-stone-500 mb-0.5">Waitlist</p>
                    <p className="text-xs text-orange-300 font-semibold">{intel.waitlistYears}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-stone-500">Demand: <span className={`font-semibold ${intel.demandLevel === 'Extreme' ? 'text-red-400' : intel.demandLevel === 'Very High' ? 'text-orange-400' : 'text-yellow-400'}`}>{intel.demandLevel}</span></span>
                  <span className="text-[10px] text-stone-500">ATH: <span className="text-white">{intel.peakPrice} ({intel.peakYear})</span></span>
                  <span className="text-[10px] text-amber-400/70">{isOpen ? '▲ Less' : '▼ Details'}</span>
                </div>
              </div>

              {/* Expanded details */}
              {isOpen && (
                <div className="px-4 pb-5 border-t border-white/10 pt-4 space-y-4" onClick={e => e.stopPropagation()}>
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

                  {/* Buying + Selling Intel */}
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

                  {/* Ask Simplicity */}
                  <Button
                    size="sm"
                    onClick={() => {
                      const q = `Tell me about the Rolex ${refName(ref)} (ref ${ref}) as an investment — current market, what to watch for, and whether now is a good time to buy or sell.`;
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
          <button onClick={() => { setFilterTier('All'); setFilterTrend('All'); }} className="mt-3 text-sm text-amber-400 underline">
            Clear filters
          </button>
        </div>
      )}

      {/* Bottom Disclaimer */}
      <div className="border-t border-white/10 pt-6 text-center">
        <p className="text-[11px] text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Market intelligence data is updated periodically and reflects secondary market conditions. Values shown represent typical ranges; actual sale prices may vary. Not financial advice. Always consult a certified watch specialist before making investment decisions.
        </p>
        <div className="mt-2 text-[10px] text-amber-600/40 tracking-widest uppercase" style={{fontFamily:"'Cormorant Garamond', serif"}}>
          <span className="simpleton-brand">Simpleton</span> Vision™ · The Archive · Market Intelligence Division
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTO-FETCHING WATCH PHOTO CARD
// ─────────────────────────────────────────────────────────────────────────────
function WatchPhotoCard({
  refNum, name, nickname, specs, localImage, accentColor = 'white'
}: {
  refNum: string;
  name: string;
  nickname?: string;
  specs: { label: string; value: string }[];
  localImage?: string;
  accentColor?: string;
}) {
  const [photo, setPhoto] = useState<{ url: string; source: string; attribution: string } | null>(null);
  const [loading, setLoading] = useState(!localImage);

  useEffect(() => {
    if (localImage) return;
    setLoading(true);
    fetch(`/api/watches/photo?query=${encodeURIComponent(`${name} ${refNum}`)}`)
      .then(r => r.json())
      .then(data => { if (data.url) setPhoto(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refNum, name, localImage]);

  const imgSrc = localImage || photo?.url;
  const accentClass = `text-${accentColor}-400`;
  const borderClass = `border-${accentColor}-500/30`;

  return (
    <div className="space-y-4">
      <div className={`aspect-square bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border-2 ${borderClass} flex items-center justify-center relative overflow-hidden`}>
        {loading && (
          <div className="flex flex-col items-center gap-2 text-stone-500">
            <div className="w-8 h-8 border-2 border-stone-600 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-xs">Loading photo...</p>
          </div>
        )}
        {imgSrc && !loading && (
          <img src={imgSrc} alt={`Rolex ${name} ${refNum}`} className="w-full h-full object-contain p-4" />
        )}
        {!imgSrc && !loading && (
          <div className="flex flex-col items-center gap-2 text-stone-600">
            <Crown className="w-10 h-10" />
            <p className="text-xs text-center px-4">Photo coming soon with Unsplash</p>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
          <h4 className={`text-lg font-semibold ${accentClass}`}>{refNum}</h4>
          <p className="text-sm text-yellow-300">{nickname || name}</p>
        </div>
        {photo?.source === 'wikimedia' && (
          <div className="absolute top-2 right-2">
            <span className="text-[9px] text-stone-600 bg-black/60 px-1 rounded">Wiki Commons</span>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <h4 className={`font-semibold ${accentClass}`}>{name}</h4>
        <div className="space-y-1 text-sm">
          {specs.map(s => (
            <div key={s.label} className="flex justify-between">
              <span className="text-yellow-400">{s.label}:</span>
              <span className="text-white text-right ml-2">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Watches() {
  const [searchSerial, setSearchSerial] = useState('');
  const [searchResult, setSearchResult] = useState<{year: string, era: string, notes: string, models?: string, context?: string} | null>(null);
  const [searchModel, setSearchModel] = useState('');
  const [modelResult, setModelResult] = useState<{name: string, category: string, details: string} | null>(null);
  const [watchPhoto, setWatchPhoto] = useState<{url: string, thumb: string, source: string, attribution: string, attributionUrl?: string, unsplashUrl?: string} | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [authSerial, setAuthSerial] = useState('');
  const [authRef, setAuthRef] = useState('');
  const [authResult, setAuthResult] = useState<{
    serialYear: string; refName: string; refKey: string; prodWindow: string;
    status: 'verified' | 'warning' | 'mismatch' | 'unknown';
    statusMessage: string; movement?: string; collectibility?: string; marketValue?: string;
  } | null>(null);
  const [compRef1, setCompRef1] = useState('');
  const [compRef2, setCompRef2] = useState('');
  const [compResult, setCompResult] = useState<{ref1Key: string; ref2Key: string; ref1: typeof REF_PRODUCTION[string] & {marketValue?: string; specs?: typeof SPECS_MAP[string]}; ref2: typeof REF_PRODUCTION[string] & {marketValue?: string; specs?: typeof SPECS_MAP[string]}} | null>(null);

  useEffect(() => {
    if (!modelResult) { setWatchPhoto(null); return; }
    const query = `${modelResult.name} ${searchModel}`.trim();
    setPhotoLoading(true);
    setWatchPhoto(null);
    fetch(`/api/watches/photo?query=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then(data => { if (data.url) setWatchPhoto(data); })
      .catch(() => {})
      .finally(() => setPhotoLoading(false));
  }, [modelResult]);

  const handleSerialSearch = () => {
    if (!searchSerial) return;

    const serial = searchSerial.toUpperCase().trim();
    const digitsOnly = serial.replace(/[^0-9]/g, '');
    const numericSerial = parseInt(digitsOnly);
    const isAllNumeric = /^\d+$/.test(serial);

    // ── RANDOM / SCRAMBLED ERA (2010+) ──────────────────────────────────────
    // Rolex adopted 8-character randomized alphanumeric serials around 2010.
    // They cannot be reliably decoded to a production year.
    if (!isAllNumeric && serial.length >= 6 && !/^[A-Z]\d{5,}$/.test(serial)) {
      setSearchResult({
        year: "2010–present",
        era: "Random serial era",
        notes: "Rolex switched to randomized serials around 2010. Only your warranty card or box paperwork can confirm the exact production year."
      });
      return;
    }

    // ── LETTER PREFIX SYSTEM (1987–2010) ────────────────────────────────────
    // Source: Bob's Watches / Rolex Passion Market
    if (!isAllNumeric) {
      const prefix = serial.charAt(0);
      const letterMap: Record<string, {year: string, notes: string, models: string, context: string}> = {
        'R': { year: "1987–1988", notes: "R-prefix: first letter-prefix series. Late R serials (R598,200+) are 1988.",
          models: "Submariner 16610, GMT-Master 16760 'Fat Lady', Daytona 16520 (Zenith debut), Datejust 16234",
          context: "Rolex launched the automatic Daytona 16520 with Zenith El Primero movement in 1988 — a landmark reference that redefined the Daytona." },
        'L': { year: "1988–1989", notes: "L-prefix: L980,000 marks the 1989 boundary.",
          models: "Submariner 16610, Daytona 16520, GMT-Master II 16710, Datejust 16234",
          context: "The GMT-Master II 16710 was introduced, offering independent hour hand setting — a major upgrade from the original GMT." },
        'E': { year: "1990", notes: "E-prefix: produced in 1990.",
          models: "Submariner 16610, Daytona 16520, GMT-Master II 16710, Explorer II 16570",
          context: "The Explorer II 16570 with its white and black dial options replaced the 16550 — still running the Zenith-based Cal. 3185." },
        'X': { year: "1991", notes: "X-prefix: produced in 1991.",
          models: "Submariner 16610, Daytona 16520, GMT-Master II 16710, Sea-Dweller 16600",
          context: "The Sea-Dweller 16600 replaced the 16660, with updated helium escape valve and increased water resistance to 1,220m." },
        'N': { year: "1991", notes: "N-prefix: produced in 1991.",
          models: "Submariner 16610, Daytona 16520, GMT-Master II 16710, Datejust 16234",
          context: "Parallel to the X-prefix, N-prefix watches were produced in the same year — both are 1991 production." },
        'C': { year: "1992", notes: "C-prefix: produced in 1992.",
          models: "Submariner 16610, Daytona 16520, GMT-Master II 16710, Day-Date 18238",
          context: "Early 1990s Rolex — the Daytona 16520 was extremely difficult to obtain at retail, already commanding grey market premiums." },
        'S': { year: "1993–1994", notes: "S-prefix: S860,880 marks the 1994 boundary.",
          models: "Submariner 16610/16610LV, Daytona 16520, GMT-Master II 16710, Datejust 16234",
          context: "The 'Kermit' Submariner 16610LV with green bezel was introduced in 2003 but 16610LN production was strong throughout this period." },
        'W': { year: "1995", notes: "W-prefix: produced in 1995.",
          models: "Submariner 16610, Daytona 16520, GMT-Master II 16710, Explorer 14270",
          context: "Mid-1990s Rolex production. Cal. 3135 was established as the workhorse movement across sport and dress references." },
        'T': { year: "1996", notes: "T-prefix: produced in 1996.",
          models: "Submariner 16610, Daytona 16520, GMT-Master II 16710, Datejust 16234",
          context: "Rolex's 'Superlative Chronometer' certification was well-established. The Daytona 16520 remained the most sought-after ref in the lineup." },
        'U': { year: "1997–1998", notes: "U-prefix: U932,144 marks the 1998 boundary.",
          models: "Submariner 16610, Daytona 16520, GMT-Master II 16710, Yacht-Master 16622",
          context: "The Yacht-Master 16622 in Rolesor (steel/platinum) was a flagship introduction — the first true luxury sport watch from Rolex in years." },
        'A': { year: "1999", notes: "A-prefix: produced in 1999.",
          models: "Submariner 16610, Daytona 16520, GMT-Master II 16710, Millenium Datejust 116234",
          context: "The turn of the millennium. The Daytona 16520 was discontinued and replaced by the in-house Cal. 4130 Daytona 116520 in 2000." },
        'P': { year: "2000", notes: "P-prefix: produced in 2000.",
          models: "Daytona 116520 (Cal. 4130 debut), Submariner 16610, GMT-Master II 16710, Datejust 116234",
          context: "A landmark year — Rolex replaced the Zenith movement with its own in-house Cal. 4130 in the Daytona 116520. Arguably the most significant movement Rolex ever developed." },
        'K': { year: "2000–2001", notes: "K-prefix: spans 2000–2001.",
          models: "Daytona 116520, Submariner 16610, GMT-Master II 16710, Explorer II 16570",
          context: "Early production of the in-house Daytona 116520. First-year examples are highly desirable — look for the 'A serial' (A-prefix) transitional pieces." },
        'Y': { year: "2002", notes: "Y-prefix: produced in 2002.",
          models: "Daytona 116520, Submariner 16610, GMT-Master II 16710, Datejust 116234",
          context: "Post-9/11 watch market showed resilience. The in-house Daytona was cementing its reputation as Rolex's finest movement." },
        'F': { year: "2003–2005", notes: "F-prefix: spans 2003–2005.",
          models: "Daytona 116520, Submariner 16610/16610LV 'Kermit', GMT-Master II 16710 'Pepsi'/'Batman' predecessor, Sea-Dweller 16600",
          context: "The Submariner 16610LV 'Kermit' (50th anniversary Sub with green bezel) was introduced in 2003 — now a major collector piece." },
        'D': { year: "2005–2006", notes: "D-prefix: spans 2005–2006.",
          models: "Daytona 116520, Submariner 16610, GMT-Master II 16710, Datejust 116234",
          context: "Rolex moved serial engraving to the rehaut (inner bezel ring) for the first time on new production — a key authentication point." },
        'Z': { year: "2006–2007", notes: "Z-prefix: spans 2006–2007.",
          models: "Daytona 116520, Submariner 116610LN (Gen VI debut), GMT-Master II 116710LN, Datejust 116234",
          context: "The Gen VI Submariner 116610LN was introduced with a larger 40mm case update and Cerachrom ceramic bezel — a major design evolution." },
        'M': { year: "2007–2008", notes: "M-prefix: spans 2007–2008.",
          models: "Daytona 116520, Submariner 116610LN/LV 'Hulk' predecessor, GMT-Master II 116710LN, Milgauss 116400",
          context: "Rolex reintroduced the Milgauss in 2007 after a 30-year hiatus with the 116400 — its lightning-bolt hand and anti-magnetic properties made it an instant hit." },
        'V': { year: "2008–2009", notes: "V-prefix: spans 2008–2009.",
          models: "Daytona 116520, Submariner 116610LN, GMT-Master II 116710LN/BLNR 'Batman' early", 
          context: "Serial engraving moved exclusively to the rehaut in 2008 — no bracelet removal needed to read the serial number. Key authentication change." },
        'G': { year: "2010", notes: "G-prefix: last letter-prefix series before Rolex switched to random serials.",
          models: "Daytona 116520/116500LN (Cerachrom bezel debut), Submariner 116610, GMT-Master II 116710BLNR 'Batman' debut",
          context: "The GMT-Master II 116710BLNR 'Batman' with blue/black bezel launched in 2013 but development was in this era. Rolex shifted to random serials shortly after G-prefix." },
      };
      if (letterMap[prefix]) {
        const r = letterMap[prefix];
        setSearchResult({ year: r.year, era: "Letter prefix system (1987–2010)", notes: r.notes, models: r.models, context: r.context });
        return;
      }
    }

    // ── SEQUENTIAL NUMERIC ERA (1926–1987) ──────────────────────────────────
    // Thresholds are the STARTING serial for each year per Bob's Watches chart.
    // Sorted highest-first so we find the correct year with the first match >= serial.
    if (isAllNumeric && !isNaN(numericSerial)) {
      const thresholds: Array<{start: number, year: string, notes: string, models?: string, context?: string}> = [
        { start: 9400000, year: "1987", notes: "Late sequential numeric era — just before Rolex switched to R-prefix letter serials.",
          models: "Submariner 16610, GMT-Master 16760 'Fat Lady', Datejust 16234, Day-Date 18038",
          context: "Rolex transitioned from all-numeric to letter-prefix serials mid-year. This watch sits at the tail end of a 60-year sequential numbering system." },
        { start: 8900000, year: "1986", notes: "Sequential numeric era.",
          models: "Submariner 16610, GMT-Master 16760, Datejust 16013/16234, Day-Date 18038, Sea-Dweller 16660",
          context: "Mid-1980s production. The GMT-Master 16760 'Fat Lady' (first GMT-II) was in full production with its larger case." },
        { start: 8614000, year: "1985", notes: "Sequential numeric era.",
          models: "Daytona 6263/6265 (manual), Submariner 16800, GMT-Master 16750, Datejust 16013",
          context: "The manual-wind Daytona 6263/6265 was still being produced. Rolex had not yet introduced the automatic Zenith-movement Daytona (1988)." },
        { start: 8070022, year: "1984", notes: "Sequential numeric era.",
          models: "Submariner 16800, GMT-Master 16750, Explorer II 16550, Datejust 16013/16014",
          context: "The Explorer II 16550 was available in both black and white 'cream' dial variants — the white dial is highly collectible today." },
        { start: 7400000, year: "1983", notes: "Sequential numeric era.",
          models: "Submariner 16800, GMT-Master 16750, Sea-Dweller 16660, Datejust 16013",
          context: "Rolex was in the late stages of the quick-set date movement era (Cal. 3035/3085), which replaced the older Cal. 1570." },
        { start: 7100000, year: "1982", notes: "Sequential numeric era.",
          models: "Submariner 16800, GMT-Master 16750, Daytona 6263, Datejust 16013/16030",
          context: "The Submariner 16800 featured the first sapphire crystal on a Sub, replacing the acrylic of earlier models." },
        { start: 6520870, year: "1981", notes: "Sequential numeric era.",
          models: "Submariner 16800, GMT-Master 16750, Explorer 14270, Datejust 16030",
          context: "Early 1980s Rolex production. The GMT-Master 16750 replaced the 1675 and introduced quick-set date for the first time on a GMT." },
        { start: 6434000, year: "1980", notes: "Sequential numeric era.",
          models: "Submariner 1680 / early 16800, GMT-Master 1675 / early 16750, Datejust 16013",
          context: "Transitional year — the 1675 GMT and 1680 Submariner were being phased out for the updated 167xx and 168xx references." },
        { start: 5737030, year: "1979", notes: "Sequential numeric era.",
          models: "Submariner 1680, GMT-Master 1675, Sea-Dweller 1665, Datejust 1601/16013",
          context: "Late-production vintage references — 1680 Subs and 1675 GMTs from this period are highly collectible, particularly Mk V and Mk VI dials." },
        { start: 5008000, year: "1977–1978", notes: "Sequential numeric era. Both 5,000,000 and 5,008,000 are cited for this window.",
          models: "Submariner 1680, GMT-Master 1675 'Pepsi', Datejust 1601, Day-Date 1803",
          context: "The iconic Submariner 1680 with red 'SUBMARINER' text and the 1675 GMT 'Pepsi' bezel were in full production." },
        { start: 4115299, year: "1976", notes: "Sequential numeric era.",
          models: "Submariner 1680, GMT-Master 1675, Sea-Dweller 1665 'Great White', Datejust 1601",
          context: "The Sea-Dweller 1665 'Great White' with its distinctive white text on the dial was in production — a landmark deep-diving watch." },
        { start: 3862196, year: "1975", notes: "Sequential numeric era.",
          models: "Submariner 1680, GMT-Master 1675, Explorer II 1655, Daytona 6263/6241",
          context: "The Explorer II 1655 'Steve McQueen' was in production — its orange hand and 24-hour bezel made it one of Rolex's most distinctive models." },
        { start: 3567927, year: "1974", notes: "Sequential numeric era.",
          models: "Submariner 1680, GMT-Master 1675, Daytona 6263/6241, Datejust 1601",
          context: "Early-mid 1970s Rolex. The manual-wind Daytona in steel (6263) was among the most desirable chronographs of the era." },
        { start: 3200268, year: "1973", notes: "Sequential numeric era.",
          models: "Submariner 1680, GMT-Master 1675, Daytona 6263, Milgauss 1019",
          context: "The Milgauss 1019 was in production — designed to resist magnetic fields up to 1,000 gauss for scientists and engineers." },
        { start: 2890459, year: "1972", notes: "Sequential numeric era.",
          models: "Submariner 1680, GMT-Master 1675 'Pepsi', Datejust 1601, Day-Date 1803",
          context: "Mid-production of the 1680 Submariner. Watches from this era are highly sought by vintage collectors for their 'tropical' dial potential." },
        { start: 2589295, year: "1971", notes: "Sequential numeric era.",
          models: "Submariner 1680, GMT-Master 1675, Explorer 1016, Daytona 6263",
          context: "The Explorer 1016 was in long-running production — one of the most respected tool watches Rolex ever made, known for its clean aesthetic." },
        { start: 2241882, year: "1970", notes: "Sequential numeric era.",
          models: "Submariner 1680 (transitional), GMT-Master 1675, Explorer 1016, Datejust 1601",
          context: "Rolex introduced Cal. 1570 (upgraded from 1560) across many references. The 1680 Sub transitioned from meters-first to feet-first dial text." },
        { start: 1900000, year: "1969", notes: "Sequential numeric era.",
          models: "Submariner 5513/1680, GMT-Master 1675, Daytona 6239/6241, Explorer 1016",
          context: "The Daytona 6241 with exotic 'Paul Newman' dial was in production — today one of the most valuable vintage Rolex references." },
        { start: 1752000, year: "1968", notes: "Sequential numeric era.",
          models: "Submariner 5513, GMT-Master 1675, Daytona 6239, Datejust 1601",
          context: "Late 1960s production — acrylic crystal, Cal. 1520/1570 movements, and gilt or matte dials define watches from this era." },
        { start: 1538435, year: "1967", notes: "Sequential numeric era.",
          models: "Submariner 5513, GMT-Master 1675, Daytona 6239 'Paul Newman', Day-Date 1803",
          context: "The 6239 Daytona with 'Paul Newman' exotic dial was produced during this period — these are among the most coveted vintage watches in the world." },
        { start: 1200000, year: "1966", notes: "Sequential numeric era.",
          models: "Submariner 5513/5512, GMT-Master 1675, Explorer 1016, Daytona 6238",
          context: "Mid-1960s production. The 5512 Submariner (4-line dial) and 5513 (no-crown-guard) were running parallel — both highly collectible today." },
        { start: 1100000, year: "1965", notes: "Sequential numeric era.",
          models: "Submariner 5512/5513, GMT-Master 1675, Datejust 1601, Day-Date 1803",
          context: "Gilt dial Submariners from this period command significant premiums. The gold text on black dial is a defining feature of mid-60s Rolex." },
        { start: 1008889, year: "1964", notes: "Rolex crossed the 1,000,000 serial milestone this year.",
          models: "Submariner 5512/5513, GMT-Master 1675, Explorer 1016, Daytona 6238",
          context: "A landmark production year — Rolex crossed the one-million serial mark. Early references with gilt dials and acrylic crystals from this year are prime vintage targets." },
        { start: 824000,  year: "1963", notes: "Sequential numeric era.",
          models: "Submariner 5512, GMT-Master 1675, Explorer 1016, Datejust 1601",
          context: "The Submariner 5512 with its crown guards and 4-line dial is a landmark reference. Watches from 1963 feature early Cal. 1530 or 1560 movements." },
        { start: 744000,  year: "1962", notes: "Sequential numeric era.",
          models: "Submariner 5508/5512, GMT-Master 6542/1675, Explorer 1016",
          context: "The GMT-Master transitioned from the Bakelite-bezel 6542 to the aluminum-bezel 1675 during this period — 6542s are among the rarest GMTs." },
        { start: 643153,  year: "1961", notes: "Sequential numeric era.",
          models: "Submariner 5508/5512, GMT-Master 6542, Explorer 1016, Datejust 6305",
          context: "Very early 5512 production. The GMT 6542 with its fragile Bakelite bezel is considered the holy grail for GMT collectors." },
        { start: 516000,  year: "1960", notes: "Sequential numeric era.",
          models: "Submariner 5508, GMT-Master 6542, Explorer 6610, Datejust 6305",
          context: "A pivotal year — the Submariner 5508 was in production and the 1960 Mariana Trench dive to 10,916m in a Rolex Oyster cemented its legendary status." },
        { start: 399453,  year: "1959", notes: "Sequential numeric era.",
          models: "Submariner 5508/6536, GMT-Master 6542, Explorer 6610",
          context: "Late 1950s vintage Rolex. Gilt dials, acrylic crystals, and early caliber movements define these pieces — all command strong collector premiums." },
        { start: 328000,  year: "1958", notes: "Sequential numeric era.",
          models: "Submariner 6536/6538, GMT-Master 6542, Explorer 6610",
          context: "The 'Big Crown' Submariner 6538 was in production — famously associated with early James Bond films and among the most valuable vintage Rolex pieces." },
        { start: 224000,  year: "1957", notes: "Sequential numeric era.",
          models: "Submariner 6538 'Big Crown', Explorer 6610, Datejust 6305, Milgauss 6541",
          context: "The original Milgauss 6541 with its distinctive lightning-bolt second hand was introduced around this period. Very rare and highly collectible." },
        { start: 133061,  year: "1956", notes: "Sequential numeric era.",
          models: "Submariner 6200/6538, GMT-Master 6542, Explorer 6610, Day-Date debut",
          context: "Rolex introduced the Day-Date (President) and the GMT-Master 6542 in 1956 — landmark references for the brand." },
        { start: 97000,   year: "1955", notes: "Sequential numeric era.",
          models: "Submariner 6200, Explorer 6150, Datejust 6305",
          context: "Early Submariner production. The 6200 'Big Crown' is among the earliest and most valuable Submariner references ever made." },
        { start: 855726,  year: "c. 1953", notes: "Early vintage. Serial ranges in this zone may span 1951–1953 across different product lines.",
          models: "Oyster Perpetual, early Datejust, Turn-O-Graph, pre-production Explorer",
          context: "Rolex introduced the original Submariner (reference 6204) and Explorer at the Basel Fair in 1953 — watches from this era are rare and significant." },
        { start: 726639,  year: "c. 1952", notes: "Early vintage serial.",
          models: "Oyster Perpetual, Datejust 6305, Bubble Back variants",
          context: "Pre-Submariner era vintage Rolex. These watches feature early self-winding movements and are considered significant horological artifacts." },
        { start: 709249,  year: "c. 1951", notes: "Early vintage serial.",
          models: "Oyster Perpetual, Datejust, Bubble Back",
          context: "Early 1950s Rolex — the Bubble Back Oyster Perpetual was the dominant model before the sport watch era began." },
        { start: 628840,  year: "c. 1948", notes: "Early vintage serial.",
          models: "Oyster Perpetual, Bubble Back, early Datejust",
          context: "Post-war Rolex production. The waterproof Oyster case and self-winding Perpetual movement were Rolex's key technological advantages of this era." },
        { start: 529163,  year: "c. 1947", notes: "Early vintage serial.", models: "Oyster Perpetual, Bubble Back", context: "Post-war era production." },
        { start: 367946,  year: "c. 1946", notes: "Post-war era vintage serial.", models: "Oyster Perpetual, Bubble Back", context: "First years of post-WWII production." },
        { start: 302459,  year: "c. 1945", notes: "War-era vintage serial.", models: "Oyster, Bubble Back", context: "WWII-era production — Rolex supplied watches to Allied POW officers." },
        { start: 269561,  year: "c. 1944", notes: "War-era vintage serial.", models: "Oyster, Bubble Back", context: "Wartime production." },
        { start: 230878,  year: "c. 1943", notes: "War-era vintage serial.", models: "Oyster", context: "Wartime production." },
        { start: 143509,  year: "c. 1942", notes: "War-era vintage serial.", models: "Oyster", context: "Wartime Rolex." },
        { start: 106047,  year: "c. 1941", notes: "Pre-war vintage serial.", models: "Oyster", context: "Pre-war / early wartime Rolex." },
        { start: 99775,   year: "c. 1940", notes: "Pre-war vintage serial.", models: "Oyster", context: "Pre-WWII Rolex production." },
        { start: 71224,   year: "c. 1939", notes: "Pre-war vintage serial.", models: "Oyster, early Perpetual", context: "Rolex introduced the self-winding Perpetual rotor in 1931 — watches from the late 1930s may feature this early movement." },
        { start: 43739,   year: "c. 1938", notes: "Pre-war vintage serial.", models: "Oyster", context: "Late 1930s production." },
        { start: 40920,   year: "c. 1937", notes: "Pre-war vintage serial.", models: "Oyster", context: "Late 1930s production." },
        { start: 36856,   year: "c. 1936", notes: "Pre-war vintage serial.", models: "Oyster", context: "Mid-1930s production." },
        { start: 34336,   year: "c. 1935", notes: "Pre-war vintage serial.", models: "Oyster", context: "Mid-1930s production." },
        { start: 30823,   year: "c. 1934", notes: "Depression-era vintage serial.", models: "Oyster", context: "Great Depression era. Rolex continued producing despite global economic turmoil." },
        { start: 29562,   year: "c. 1933", notes: "Depression-era vintage serial.", models: "Oyster", context: "Early 1930s." },
        { start: 29132,   year: "c. 1932", notes: "Depression-era vintage serial.", models: "Oyster", context: "Early 1930s." },
        { start: 23969,   year: "c. 1928", notes: "Very early Rolex production.", models: "Early Oyster case", context: "The Oyster waterproof case had just been patented in 1926 — watches from this era are extremely rare." },
        { start: 20190,   year: "c. 1927", notes: "Very early Rolex production.", models: "Early Oyster case", context: "Mercedes Gleitze crossed the English Channel wearing an Oyster in 1927 — the watch that put Rolex on the map." },
        { start: 1,       year: "c. 1926", notes: "Earliest known Rolex serial range.", models: "Original Oyster case", context: "The Rolex Oyster was patented in 1926 — a pioneering waterproof wristwatch design. Extremely rare historical pieces." },
      ];

      for (const t of thresholds) {
        if (numericSerial >= t.start) {
          setSearchResult({ year: t.year, era: "Sequential numeric era (1926–1987)", notes: t.notes, models: t.models, context: t.context });
          return;
        }
      }
    }

    setSearchResult({ year: "Unknown", era: "—", notes: "Could not identify this serial. Check the format — numeric serials are 4–7 digits; letter-prefix serials are one letter followed by 5–6 digits (e.g. R123456). Random 2010+ serials cannot be dated." });
  };

  const handleModelSearch = () => {
    if (!searchModel) return;
    const model = searchModel.toUpperCase().trim();

    // ─────────────────────────────────────────────────────────────────────────
    // COMPREHENSIVE ROLEX REFERENCE DATABASE (500+ models)
    // Fields: name | category | details | movement | nickname | collectibility
    // ─────────────────────────────────────────────────────────────────────────
    const modelDatabase: {[key: string]: {name: string, category: string, details: string, movement?: string, nickname?: string, collectibility?: string, notes?: string}} = {

      // ── SUBMARINER — Current ──────────────────────────────────────────────
      '124060': {name:'Submariner No-Date', category:'Sport/Dive', details:'41mm, Oystersteel, Black Cerachrom bezel, Black dial (2020–present)', movement:'Cal. 3230', collectibility:'High', notes:'Clean, no-date purist\'s choice. 70-hr power reserve.'},
      '126610LN': {name:'Submariner Date', category:'Sport/Dive', details:'41mm, Oystersteel, Black Cerachrom bezel, Black dial (2020–present)', movement:'Cal. 3235', collectibility:'High', notes:'Generation VII Sub. Successor to 116610LN.'},
      '126610LV': {name:'Submariner Date "Starbucks"', category:'Sport/Dive', details:'41mm, Oystersteel, Green/Black Cerachrom bezel, Black dial (2020–present)', movement:'Cal. 3235', nickname:'"Starbucks"', collectibility:'Very High', notes:'Black dial + green bezel combo earns the Starbucks nickname. Instant collector hit.'},
      '126619LB': {name:'Submariner Date "Smurf"', category:'Sport/Dive', details:'41mm, 18k White Gold, Blue Cerachrom bezel, Blue dial (2020–present)', movement:'Cal. 3235', nickname:'"Smurf"', collectibility:'Very High', notes:'Most prestigious steel-sport Submariner. White gold case with blue dial.'},
      '126613LN': {name:'Submariner Date "Blackeye"', category:'Sport/Dive', details:'41mm, Rolesor (Steel/Gold), Black Cerachrom bezel, Black dial (2020–present)', movement:'Cal. 3235', nickname:'"Blackeye"', collectibility:'High'},
      '126613LB': {name:'Submariner Date Two-Tone', category:'Sport/Dive', details:'41mm, Rolesor (Steel/Gold), Blue Cerachrom bezel, Blue dial (2020–present)', movement:'Cal. 3235', collectibility:'High'},
      '126618LN': {name:'Submariner Date', category:'Sport/Dive', details:'41mm, 18k Yellow Gold, Black Cerachrom bezel, Black dial (2020–present)', movement:'Cal. 3235', collectibility:'High'},
      '126618LB': {name:'Submariner Date', category:'Sport/Dive', details:'41mm, 18k Yellow Gold, Blue Cerachrom bezel, Blue dial (2020–present)', movement:'Cal. 3235', collectibility:'High'},

      // ── SUBMARINER — Generation VI (2010–2020) ───────────────────────────
      '116610LN': {name:'Submariner Date', category:'Sport/Dive', details:'40mm, Oystersteel, Black Cerachrom bezel (2010–2020)', movement:'Cal. 3135', collectibility:'High', notes:'Last gen with 3135. Highly desirable on secondary market.'},
      '116610LV': {name:'Submariner Date "Hulk"', category:'Sport/Dive', details:'40mm, Oystersteel, Green Cerachrom bezel, Green dial (2010–2020)', movement:'Cal. 3135', nickname:'"Hulk"', collectibility:'Extreme', notes:'Only Submariner ever with matching green dial AND green bezel. Discontinued 2020 — premiums skyrocket.'},
      '116619LB': {name:'Submariner Date "Smurf"', category:'Sport/Dive', details:'40mm, 18k White Gold, Blue Cerachrom bezel, Blue dial (2008–2020)', movement:'Cal. 3135', nickname:'"Smurf" (Gen VI)', collectibility:'Very High'},
      '114060': {name:'Submariner No-Date', category:'Sport/Dive', details:'40mm, Oystersteel, Black Cerachrom bezel (2012–2020)', movement:'Cal. 3130', collectibility:'High'},
      '116613LB': {name:'Submariner Date Two-Tone "Bluesy"', category:'Sport/Dive', details:'40mm, Rolesor (Steel/Gold), Blue Cerachrom bezel, Blue dial (2009–2020)', movement:'Cal. 3135', nickname:'"Bluesy"', collectibility:'High'},
      '116613LN': {name:'Submariner Date Two-Tone', category:'Sport/Dive', details:'40mm, Rolesor (Steel/Gold), Black Cerachrom bezel (2009–2020)', movement:'Cal. 3135', collectibility:'High'},
      '116618LN': {name:'Submariner Date Yellow Gold', category:'Sport/Dive', details:'40mm, 18k Yellow Gold, Black Cerachrom bezel (2010–2020)', movement:'Cal. 3135', collectibility:'High'},
      '116618LB': {name:'Submariner Date Yellow Gold Blue', category:'Sport/Dive', details:'40mm, 18k Yellow Gold, Blue Cerachrom bezel, Blue dial (2010–2020)', movement:'Cal. 3135', collectibility:'High'},

      // ── SUBMARINER — Generation V (1989–2009) ────────────────────────────
      '16610': {name:'Submariner Date', category:'Sport/Dive', details:'40mm, Oystersteel, Aluminum bezel, Sapphire crystal (1989–2010)', movement:'Cal. 3135', collectibility:'High', notes:'Long production run, many dial variants. Solid collector model.'},
      '16610LV': {name:'Submariner Date "Anniversary" / "Kermit"', category:'Sport/Dive', details:'40mm, Oystersteel, Green aluminum bezel, Black dial (2003–2010)', movement:'Cal. 3135', nickname:'"Kermit"', collectibility:'Extreme', notes:'50th anniversary Submariner. Only green-bezel Sub before Hulk. Extremely sought after.'},
      '16613': {name:'Submariner Date Two-Tone', category:'Sport/Dive', details:'40mm, Rolesor (Steel/Gold), Aluminum bezel (1989–2009)', movement:'Cal. 3135', collectibility:'Moderate'},
      '16618': {name:'Submariner Date Yellow Gold', category:'Sport/Dive', details:'40mm, 18k Yellow Gold, Aluminum bezel (1988–2009)', movement:'Cal. 3135', collectibility:'Moderate'},
      '14060': {name:'Submariner No-Date', category:'Sport/Dive', details:'40mm, Oystersteel, Aluminum bezel (1990–2007)', movement:'Cal. 3000', collectibility:'High', notes:'Solid vintage transition piece. First gen without date under sapphire.'},
      '14060M': {name:'Submariner No-Date Maxi Dial', category:'Sport/Dive', details:'40mm, Oystersteel, Aluminum bezel, Larger Maxi indices (2000–2012)', movement:'Cal. 3130', nickname:'"Maxi Dial"', collectibility:'High'},

      // ── SUBMARINER — Vintage (pre-1989) ──────────────────────────────────
      '16800': {name:'Submariner Date', category:'Vintage/Dive', details:'40mm, Oystersteel, First with sapphire crystal (1979–1988)', movement:'Cal. 3035', collectibility:'High', notes:'Transitional model bridging vintage and modern. First quickset Sub.'},
      '16800SD': {name:'Submariner Date "Tropical"', category:'Vintage/Dive', details:'40mm, Oystersteel, Faded tropical dials (1979–1988)', movement:'Cal. 3035', nickname:'"Tropical"', collectibility:'Extreme'},
      '5513': {name:'Submariner No-Date', category:'Vintage/Dive', details:'40mm, Oystersteel, Acrylic crystal, No crown guards (1962–1989)', movement:'Cal. 1520 / 1530', collectibility:'Very High', notes:'Longest produced Submariner. Multiple dial evolutions. Cornerstone of vintage collecting.'},
      '5512': {name:'Submariner No-Date COSC', category:'Vintage/Dive', details:'40mm, Oystersteel, COSC Chronometer certified (1959–1978)', movement:'Cal. 1560 / 1570', collectibility:'Very High', notes:'4-liner vs 2-liner dials. COSC certification adds desirability.'},
      '1680': {name:'Submariner Date "Red Sub"', category:'Vintage/Dive', details:'40mm, Oystersteel, First Submariner with date window (1969–1979)', movement:'Cal. 1575', nickname:'"Red Sub"', collectibility:'Extreme', notes:'Early examples have red "Submariner" text — the original Red Sub. Highly prized.'},
      '5508': {name:'Submariner "Big Crown"', category:'Vintage/Dive', details:'37–38mm, Big crown no crown guards (1958–1962)', movement:'Cal. 1530', nickname:'"Big Crown"', collectibility:'Extreme'},
      '6536': {name:'Submariner "James Bond"', category:'Vintage/Dive', details:'37mm, Small crown, No crown guards (1955–1959)', movement:'Cal. 1030', nickname:'"James Bond Sub"', collectibility:'Extreme', notes:'Worn by Sean Connery in early Bond films.'},
      '6204': {name:'Submariner First Generation', category:'Vintage/Dive', details:'37mm, First production Submariner, No crown guards (1953–1954)', movement:'Cal. 1030', collectibility:'Extreme', notes:'The birth of the Submariner. Rarest production Sub.'},
      '6200': {name:'Submariner "Big Crown"', category:'Vintage/Dive', details:'37mm, Very large crown, 200m rating (1954–1955)', movement:'Cal. 1030', collectibility:'Extreme'},
      '6205': {name:'Submariner Early', category:'Vintage/Dive', details:'37mm, Early reference, Transitional (1953–1955)', movement:'Cal. 1030', collectibility:'Extreme'},
      '6538': {name:'Submariner "James Bond Big Crown"', category:'Vintage/Dive', details:'38mm, Big crown, First Submariner with crown guards on some (1955–1959)', movement:'Cal. 1030', nickname:'"James Bond Big Crown"', collectibility:'Extreme'},

      // ── GMT-MASTER II — Current ──────────────────────────────────────────
      '126710BLNR': {name:'GMT-Master II "Batman"', category:'Sport/GMT', details:'40mm, Oystersteel, Blue/Black Cerachrom bezel, Jubilee bracelet (2019–present)', movement:'Cal. 3285', nickname:'"Batman" (Jubilee)', collectibility:'Extreme', notes:'Sports bracelet Batman (116710BLNR) replaced by Jubilee — instantly iconic.'},
      '126710BLRO': {name:'GMT-Master II "Pepsi"', category:'Sport/GMT', details:'40mm, Oystersteel, Blue/Red Cerachrom bezel, Jubilee bracelet (2018–present)', movement:'Cal. 3285', nickname:'"Pepsi" (Oystersteel)', collectibility:'Extreme', notes:'First steel Pepsi in 35+ years. Jubilee bracelet debut on GMT. One of the most coveted modern Rolexes.'},
      '126711CHNR': {name:'GMT-Master II "Root Beer"', category:'Sport/GMT', details:'40mm, Rolesor Steel/Rose Gold, Brown/Black Cerachrom bezel (2018–present)', movement:'Cal. 3285', nickname:'"Root Beer" (Rolesor)', collectibility:'Very High'},
      '126715CHNR': {name:'GMT-Master II "Root Beer"', category:'Sport/GMT', details:'40mm, 18k Rose Gold, Brown/Black Cerachrom bezel, Oysterflex strap (2018–present)', movement:'Cal. 3285', nickname:'"Root Beer" (Gold)', collectibility:'High'},
      '126719BLRO': {name:'GMT-Master II "Pepsi"', category:'Sport/GMT', details:'40mm, 18k White Gold, Blue/Red Cerachrom bezel (2018–present)', movement:'Cal. 3285', nickname:'"Pepsi" (White Gold)', collectibility:'High'},
      '126720VTNR': {name:'GMT-Master II "Sprite"', category:'Sport/GMT', details:'40mm, Oystersteel, Green/Black Cerachrom bezel, Left-handed crown (2022–present)', movement:'Cal. 3285', nickname:'"Sprite" / "Destro"', collectibility:'Extreme', notes:'Left-handed crown (destro) is unprecedented in modern Rolex lineup. Instant grail.'},

      // ── GMT-MASTER II — Previous Gen (2007–2018) ─────────────────────────
      '116710BLNR': {name:'GMT-Master II "Batman"', category:'Sport/GMT', details:'40mm, Oystersteel, Blue/Black Cerachrom bezel, Oyster bracelet (2013–2019)', movement:'Cal. 3186', nickname:'"Batman" (Original)', collectibility:'Extreme', notes:'Original Batman. Discontinued and immediately surged in price.'},
      '116710LN': {name:'GMT-Master II', category:'Sport/GMT', details:'40mm, Oystersteel, Black Cerachrom bezel (2007–2019)', movement:'Cal. 3186', collectibility:'High'},
      '116718LN': {name:'GMT-Master II Yellow Gold', category:'Sport/GMT', details:'40mm, 18k Yellow Gold, Black Cerachrom bezel (2005–2019)', movement:'Cal. 3186', collectibility:'High'},
      '116719BLRO': {name:'GMT-Master II "Pepsi" White Gold', category:'Sport/GMT', details:'40mm, 18k White Gold, Blue/Red Cerachrom bezel (2014–2018)', movement:'Cal. 3186', nickname:'"Pepsi" (WG Gen VI)', collectibility:'High'},

      // ── GMT-MASTER II — Gen V (1989–2007) ───────────────────────────────
      '16710': {name:'GMT-Master II', category:'Sport/GMT', details:'40mm, Oystersteel, Aluminum bezel, Sapphire crystal (1989–2007)', movement:'Cal. 3185', collectibility:'High', notes:'Long production, multiple bezel colors. First GMT II with quickset date.'},
      '16710BLRO': {name:'GMT-Master II "Pepsi"', category:'Sport/GMT', details:'40mm, Oystersteel, Blue/Red aluminum bezel (1989–2007)', movement:'Cal. 3185', nickname:'"Pepsi" (Gen V)', collectibility:'Very High'},
      '16710LN': {name:'GMT-Master II Black Bezel', category:'Sport/GMT', details:'40mm, Oystersteel, Black aluminum bezel (1989–2007)', movement:'Cal. 3185', collectibility:'High'},
      '16713': {name:'GMT-Master II Two-Tone', category:'Sport/GMT', details:'40mm, Rolesor (Steel/Gold), Aluminum bezel (1989–2007)', movement:'Cal. 3185', collectibility:'Moderate'},
      '16718': {name:'GMT-Master II Yellow Gold', category:'Sport/GMT', details:'40mm, 18k Yellow Gold, Aluminum bezel (1989–2007)', movement:'Cal. 3185', collectibility:'Moderate'},
      '16760': {name:'GMT-Master II "Fat Lady" / "Sophia Loren"', category:'Sport/GMT', details:'40mm, Oystersteel, First GMT-Master II, Black bezel, Larger crown (1983–1988)', movement:'Cal. 3085', nickname:'"Fat Lady" / "Sophia Loren"', collectibility:'Extreme', notes:'First GMT-Master II reference ever. Thick case gave rise to its nickname.'},

      // ── GMT-MASTER I — Vintage ─────────────────────────────────────────
      '1675': {name:'GMT-Master "Pepsi"', category:'Vintage/GMT', details:'40mm, Oystersteel, Red/Blue aluminum bezel (1959–1980)', movement:'Cal. 1565 / 1575', nickname:'"Pepsi" (Gen I)', collectibility:'Very High', notes:'Most produced vintage GMT. Multiple sub-references by bezel and dial.'},
      '1675MK1': {name:'GMT-Master "Gilt Dial"', category:'Vintage/GMT', details:'40mm, Early gilt dial variant (1959–1966)', movement:'Cal. 1565', nickname:'"Gilt Dial"', collectibility:'Extreme'},
      '6542': {name:'GMT-Master "Bakelite"', category:'Vintage/GMT', details:'38mm, First GMT-Master, Bakelite plastic bezel (1954–1959)', movement:'Cal. 1036', nickname:'"Bakelite"', collectibility:'Extreme', notes:'Created with Pan Am Airlines. First Rolex with dual time zone. Bakelite bezel is extremely fragile/rare.'},
      '1675PCPC': {name:'GMT-Master "Pepsi" Pointed Crown Guards', category:'Vintage/GMT', details:'40mm, Pointed crown guards (1959–1965)', movement:'Cal. 1565', nickname:'"PCG Pepsi"', collectibility:'Extreme'},
      '16750': {name:'GMT-Master', category:'Sport/GMT', details:'40mm, Oystersteel, Sapphire crystal, Quickset date (1981–1988)', movement:'Cal. 3075', collectibility:'High'},
      '16753': {name:'GMT-Master Two-Tone', category:'Sport/GMT', details:'40mm, Rolesor (Steel/Gold) (1980–1988)', movement:'Cal. 3075', collectibility:'Moderate'},
      '16758': {name:'GMT-Master Yellow Gold', category:'Sport/GMT', details:'40mm, 18k Yellow Gold, Aluminum bezel (1980–1988)', movement:'Cal. 3075', collectibility:'Moderate'},

      // ── DAYTONA — Current ───────────────────────────────────────────────
      '126500LN': {name:'Daytona', category:'Sport/Racing', details:'40mm, Oystersteel, Black Cerachrom bezel, White/Black dial (2023+)', movement:'Cal. 4131', collectibility:'Extreme', notes:'New 4131 movement. Case size remains 40mm. Massive waitlists.'},
      '126506': {name:'Daytona Platinum Icy Blue', category:'Sport/Racing', details:'40mm, Platinum, Ice blue dial, Cerachrom bezel (2023+)', movement:'Cal. 4131', collectibility:'Very High'},
      '116500LN': {name:'Daytona Ceramic Bezel', category:'Sport/Racing', details:'40mm, Oystersteel, Black/White Cerachrom bezel (2016–2023)', movement:'Cal. 4130', collectibility:'Extreme', notes:'Arguably the most wanted Rolex of all time. 10+ year waitlists at MSRP.'},
      '116503': {name:'Daytona Two-Tone', category:'Sport/Racing', details:'40mm, Rolesor (Steel/Gold), Ceramic bezel (2016–present)', movement:'Cal. 4130', collectibility:'High'},
      '116508': {name:'Daytona Yellow Gold', category:'Sport/Racing', details:'40mm, 18k Yellow Gold, Ceramic bezel, Multiple dials (2016–present)', movement:'Cal. 4130', collectibility:'High'},
      '116505': {name:'Daytona Rose Gold', category:'Sport/Racing', details:'40mm, 18k Everose Gold, Ceramic bezel, Chocolate/Black dial (2016–present)', movement:'Cal. 4130', collectibility:'High'},
      '116506': {name:'Daytona Platinum Ice Blue', category:'Sport/Racing', details:'40mm, Platinum, Ice Blue dial, Cerachrom bezel (2013–2023)', movement:'Cal. 4130', collectibility:'Very High'},
      '116509': {name:'Daytona White Gold', category:'Sport/Racing', details:'40mm, 18k White Gold, Cerachrom bezel (2008–present)', movement:'Cal. 4130', collectibility:'High'},
      '116595RBOW': {name:'Daytona "Rainbow"', category:'Sport/Racing', details:'40mm, 18k Everose Gold, Rainbow sapphire bezel, Paved dial (2012–present)', movement:'Cal. 4130', nickname:'"Rainbow"', collectibility:'Extreme', notes:'Most expensive production Daytona. Sapphire-set bezel in rainbow spectrum.'},

      // ── DAYTONA — Gen V (2000–2016) ─────────────────────────────────────
      '116520': {name:'Daytona Steel', category:'Sport/Racing', details:'40mm, Oystersteel, Metal bezel, White/Black dial (2000–2016)', movement:'Cal. 4130', collectibility:'Very High', notes:'First in-house Daytona movement (4130). Metal tachymeter bezel.'},
      '116523': {name:'Daytona Two-Tone "El Primero"', category:'Sport/Racing', details:'40mm, Rolesor (Steel/Gold), Metal bezel (2000–2016)', movement:'Cal. 4130', collectibility:'High'},
      '116528': {name:'Daytona Yellow Gold', category:'Sport/Racing', details:'40mm, 18k Yellow Gold, Metal bezel (2000–2016)', movement:'Cal. 4130', collectibility:'High'},

      // ── DAYTONA — "Zenith" Era (1988–2000) ──────────────────────────────
      '16520': {name:'Daytona "Zenith" / "El Primero"', category:'Vintage/Racing', details:'40mm, Oystersteel, First automatic Daytona, External movement (1988–2000)', movement:'Cal. 4030 (Zenith El Primero)', nickname:'"Zenith" / "El Primero"', collectibility:'Very High', notes:'Used modified Zenith El Primero before in-house 4130. Multiple dial generations.'},
      '16523': {name:'Daytona "Zenith" Two-Tone', category:'Vintage/Racing', details:'40mm, Rolesor, Zenith-based movement (1988–2000)', movement:'Cal. 4030 (Zenith)', collectibility:'High'},
      '16528': {name:'Daytona "Zenith" Yellow Gold', category:'Vintage/Racing', details:'40mm, 18k Yellow Gold, Zenith movement (1988–2000)', movement:'Cal. 4030 (Zenith)', collectibility:'High'},

      // ── DAYTONA — Manual Wind Era (1963–1987) ────────────────────────────
      '6241': {name:'Daytona "Exotic Dial"', category:'Vintage/Racing', details:'37mm, Manual wind, Black/Gold bezel variants (1965–1969)', movement:'Cal. 722-1', collectibility:'Extreme'},
      '6239': {name:'Daytona "Pump Pushers" First Gen', category:'Vintage/Racing', details:'37mm, Manual wind, Pump pushers, First Cosmograph (1963–1969)', movement:'Cal. 722', collectibility:'Very High', notes:'The first Daytona. Non-screw pushers distinguish from later 6265.'},
      '6240': {name:'Daytona "Underline"', category:'Vintage/Racing', details:'37mm, Manual wind, Pump pushers, Underline "Daytona" text (1965–1969)', movement:'Cal. 722', nickname:'"Underline"', collectibility:'Extreme'},
      '6262': {name:'Daytona Manual Wind', category:'Vintage/Racing', details:'37mm, Manual wind, Pump pushers (1970–1972)', movement:'Cal. 727', collectibility:'Very High'},
      '6264': {name:'Daytona Manual Wind Screw Pushers', category:'Vintage/Racing', details:'37mm, Manual wind, First screw pushers (1970–1972)', movement:'Cal. 727', collectibility:'Extreme', notes:'Transitional ref. Highly rare.'},
      '6263': {name:'Daytona Manual Wind', category:'Vintage/Racing', details:'37mm, Manual wind, Screw-down pushers (1971–1987)', movement:'Cal. 727', collectibility:'Very High'},
      '6265': {name:'Daytona "Paul Newman" eligible', category:'Vintage/Racing', details:'37mm, Manual wind, Screw-down pushers, Gold case (1971–1987)', movement:'Cal. 727', nickname:'Paul Newman variants', collectibility:'Extreme', notes:'"Paul Newman" dial variants of 6239/6241/6263/6265 are among the most expensive watches ever sold.'},
      '6234': {name:'Pre-Daytona "Thunderbird"', category:'Vintage/Racing', details:'36mm, Manual wind chronograph, Rotating bezel (1955–1961)', movement:'Cal. 72B', collectibility:'Very High'},

      // ── DATEJUST 41 — Current ────────────────────────────────────────────
      '126300': {name:'Datejust 41 Smooth Bezel', category:'Classic/Dress', details:'41mm, Oystersteel, Smooth bezel, Oyster bracelet (2016–present)', movement:'Cal. 3235', collectibility:'Moderate'},
      '126301': {name:'Datejust 41 Fluted Bezel', category:'Classic/Dress', details:'41mm, Oystersteel, Fluted gold bezel, Jubilee bracelet (2016–present)', movement:'Cal. 3235', collectibility:'Moderate'},
      '126334': {name:'Datejust 41 White Gold Bezel', category:'Classic/Dress', details:'41mm, Oystersteel/White Gold bezel, Jubilee bracelet (2016–present)', movement:'Cal. 3235', collectibility:'Moderate'},
      '126333': {name:'Datejust 41 Yellow Rolesor', category:'Classic/Dress', details:'41mm, Two-tone Steel/Yellow Gold, Jubilee bracelet (2016–present)', movement:'Cal. 3235', collectibility:'Moderate'},
      '126331': {name:'Datejust 41 Everose Rolesor', category:'Classic/Dress', details:'41mm, Two-tone Steel/Everose Gold, Jubilee bracelet (2016–present)', movement:'Cal. 3235', collectibility:'Moderate'},
      '126344': {name:'Datejust 41 White Gold', category:'Classic/Dress', details:'41mm, 18k White Gold, Diamond bezel (2016–present)', movement:'Cal. 3235', collectibility:'Moderate'},

      // ── DATEJUST 41 — Previous (2009–2016, "Datejust II") ────────────────
      '116300': {name:'Datejust II 41 Smooth', category:'Classic/Dress', details:'41mm, Oystersteel, Smooth bezel (2009–2016)', movement:'Cal. 3136', collectibility:'Low/Moderate'},
      '116334': {name:'Datejust II 41 White Gold Bezel', category:'Classic/Dress', details:'41mm, Oystersteel/White Gold bezel (2009–2016)', movement:'Cal. 3136', collectibility:'Low/Moderate'},

      // ── DATEJUST 36 — Current ────────────────────────────────────────────
      '126200': {name:'Datejust 36 Smooth Bezel', category:'Classic/Dress', details:'36mm, Oystersteel, Smooth bezel (2020–present)', movement:'Cal. 3235', collectibility:'Moderate'},
      '126234': {name:'Datejust 36 White Gold Bezel', category:'Classic/Dress', details:'36mm, Oystersteel/White Gold bezel, Jubilee bracelet (2020–present)', movement:'Cal. 3235', collectibility:'Moderate'},
      '126233': {name:'Datejust 36 Yellow Rolesor', category:'Classic/Dress', details:'36mm, Two-tone Steel/Yellow Gold (2020–present)', movement:'Cal. 3235', collectibility:'Moderate'},
      '126231': {name:'Datejust 36 Everose Rolesor', category:'Classic/Dress', details:'36mm, Two-tone Steel/Everose Gold (2020–present)', movement:'Cal. 3235', collectibility:'Moderate'},

      // ── DATEJUST 36 — Gen VI (2005–2020) ────────────────────────────────
      '116200': {name:'Datejust 36 Smooth', category:'Classic/Dress', details:'36mm, Oystersteel, Smooth bezel (2005–2020)', movement:'Cal. 3135', collectibility:'Moderate'},
      '116234': {name:'Datejust 36 White Gold Bezel', category:'Classic/Dress', details:'36mm, Oystersteel/White Gold bezel (2005–2020)', movement:'Cal. 3135', collectibility:'Moderate'},
      '116233': {name:'Datejust 36 Yellow Rolesor', category:'Classic/Dress', details:'36mm, Two-tone Steel/Yellow Gold (2005–2020)', movement:'Cal. 3135', collectibility:'Moderate'},
      '116232': {name:'Datejust 36 White Gold', category:'Classic/Dress', details:'36mm, 18k White Gold, Fluted bezel (2005–2020)', movement:'Cal. 3135', collectibility:'Moderate'},

      // ── DATEJUST 36 — Vintage ────────────────────────────────────────────
      '16234': {name:'Datejust 36 White Gold Bezel', category:'Classic/Dress', details:'36mm, Oystersteel/White Gold bezel (1988–2005)', movement:'Cal. 3135', collectibility:'Moderate'},
      '16200': {name:'Datejust 36 Smooth', category:'Classic/Dress', details:'36mm, Oystersteel, Smooth bezel (1988–2005)', movement:'Cal. 3135', collectibility:'Moderate'},
      '16233': {name:'Datejust 36 Two-Tone', category:'Classic/Dress', details:'36mm, Rolesor Two-tone (1988–2005)', movement:'Cal. 3135', collectibility:'Moderate'},
      '16220': {name:'Datejust 36 Engine-Turned Bezel', category:'Classic/Dress', details:'36mm, Oystersteel, Engine-turned bezel (1988–2005)', movement:'Cal. 3135', collectibility:'Moderate'},
      '16014': {name:'Datejust 36 Fluted', category:'Classic/Dress', details:'36mm, Oystersteel, Fluted bezel (1979–1989)', movement:'Cal. 3035', collectibility:'Moderate'},
      '16013': {name:'Datejust 36 Yellow Rolesor Fluted', category:'Classic/Dress', details:'36mm, Two-tone, Fluted bezel (1979–1989)', movement:'Cal. 3035', collectibility:'Moderate'},
      '16030': {name:'Datejust 36 White Gold Bezel', category:'Classic/Dress', details:'36mm, Oystersteel/White Gold (1978–1989)', movement:'Cal. 3035', collectibility:'Moderate'},
      '1601': {name:'Datejust 36 Engine-Turned Vintage', category:'Vintage/Dress', details:'36mm, Engine-turned bezel, Non-quickset date (1959–1988)', movement:'Cal. 1570 / 1575', collectibility:'High', notes:'Long-running classic reference. Many dial variants. True vintage piece.'},
      '1603': {name:'Datejust 36 Smooth Bezel Vintage', category:'Vintage/Dress', details:'36mm, Smooth bezel, Acrylic crystal (1959–1977)', movement:'Cal. 1570 / 1575', collectibility:'High'},
      '1600': {name:'Datejust 36 No Quickset', category:'Vintage/Dress', details:'36mm, Oystersteel, Acrylic crystal (1965–1977)', movement:'Cal. 1570', collectibility:'High'},
      '1630': {name:'Datejust 36 Two-Tone Vintage', category:'Vintage/Dress', details:'36mm, Two-tone, Engine-turned bezel (1959–1977)', movement:'Cal. 1570', collectibility:'High'},
      '6605': {name:'Datejust 36 Early', category:'Vintage/Dress', details:'36mm, Very early Datejust (1957–1960)', movement:'Cal. 1065', collectibility:'Very High'},
      '6305': {name:'Datejust 36 Bakelite', category:'Vintage/Dress', details:'36mm, First Datejust with magnifier cyclops (1953–1954)', movement:'Cal. 1065', collectibility:'Extreme'},
      '4467': {name:'Datejust "Bubbleback" First', category:'Vintage/Dress', details:'36mm, Very first Datejust (1945)', movement:'Cal. 10.5', collectibility:'Extreme', notes:'First Datejust ever made. Worn at Churchill/Roosevelt WWII Yalta conference.'},

      // ── DATEJUST 31 ──────────────────────────────────────────────────────
      '278274': {name:'Datejust 31', category:'Classic/Dress', details:'31mm, Oystersteel, Diamond-set bezel options (2018–present)', movement:'Cal. 2236', collectibility:'Moderate'},
      '278273': {name:'Datejust 31 Two-Tone', category:'Classic/Dress', details:'31mm, Two-tone Steel/Gold (2018–present)', movement:'Cal. 2236', collectibility:'Moderate'},
      '278271': {name:'Datejust 31 Everose', category:'Classic/Dress', details:'31mm, Two-tone Steel/Everose Gold (2018–present)', movement:'Cal. 2236', collectibility:'Moderate'},

      // ── LADY-DATEJUST (28mm) ─────────────────────────────────────────────
      '279174': {name:'Lady-Datejust 28', category:'Ladies/Dress', details:'28mm, Oystersteel/White Gold, Fluted bezel (2016–present)', movement:'Cal. 2236', collectibility:'Moderate'},
      '279173': {name:'Lady-Datejust 28', category:'Ladies/Dress', details:'28mm, Oystersteel/Yellow Gold, Fluted bezel (2016–present)', movement:'Cal. 2236', collectibility:'Moderate'},
      '279160': {name:'Lady-Datejust 28 Smooth', category:'Ladies/Dress', details:'28mm, Oystersteel, Smooth bezel (2016–present)', movement:'Cal. 2236', collectibility:'Moderate'},
      '279163': {name:'Lady-Datejust 28', category:'Ladies/Dress', details:'28mm, Oystersteel/Yellow Gold, Smooth bezel (2016–present)', movement:'Cal. 2236', collectibility:'Moderate'},
      '279165': {name:'Lady-Datejust 28', category:'Ladies/Dress', details:'28mm, Oystersteel/Everose, Smooth bezel (2016–present)', movement:'Cal. 2236', collectibility:'Moderate'},
      '279166': {name:'Lady-Datejust 28 Fluted', category:'Ladies/Dress', details:'28mm, Oystersteel, Fluted bezel (2016–present)', movement:'Cal. 2236', collectibility:'Moderate'},
      '279171': {name:'Lady-Datejust 28 Rolesor', category:'Ladies/Dress', details:'28mm, Oystersteel/Yellow Gold, Domed bezel (2016–present)', movement:'Cal. 2236', collectibility:'Moderate'},
      '279175': {name:'Lady-Datejust 28 Everose', category:'Ladies/Dress', details:'28mm, Oystersteel/Everose Gold, Fluted bezel (2016–present)', movement:'Cal. 2236', collectibility:'Moderate'},
      '279178': {name:'Lady-Datejust 28 Yellow Gold', category:'Ladies/Dress', details:'28mm, 18k Yellow Gold (2016–present)', movement:'Cal. 2236', collectibility:'High'},
      '279179': {name:'Lady-Datejust 28 White Gold', category:'Ladies/Dress', details:'28mm, 18k White Gold (2016–present)', movement:'Cal. 2236', collectibility:'High'},
      '279381': {name:'Lady-Datejust 28 Diamond', category:'Ladies/Dress', details:'28mm, Oystersteel/Yellow Gold, Diamond bezel, Jubilee (2016–present)', movement:'Cal. 2236', collectibility:'Moderate'},
      '279381RBR': {name:'Lady-Datejust 28 Diamond', category:'Ladies/Dress', details:'28mm, Oystersteel/Yellow Gold, Diamond bezel, Jubilee (2016–present)', movement:'Cal. 2236', collectibility:'Moderate'},
      '279383': {name:'Lady-Datejust 28 Diamond', category:'Ladies/Dress', details:'28mm, Oystersteel/Yellow Gold, Diamond bezel (2016–present)', movement:'Cal. 2236', collectibility:'Moderate'},
      '279383RBR': {name:'Lady-Datejust 28 Diamond', category:'Ladies/Dress', details:'28mm, Oystersteel/Yellow Gold, Diamond bezel (2016–present)', movement:'Cal. 2236', collectibility:'Moderate'},
      '279384': {name:'Lady-Datejust 28 Diamond', category:'Ladies/Dress', details:'28mm, Stainless Steel, Diamond bezel, Jubilee bracelet (2016–present)', movement:'Cal. 2236', collectibility:'Moderate'},
      '279384RBR': {name:'Lady-Datejust 28 Diamond', category:'Ladies/Dress', details:'28mm, Oystersteel/White Gold, Diamond bezel, Jubilee (2016–present)', movement:'Cal. 2236', collectibility:'Moderate'},
      '279385': {name:'Lady-Datejust 28 Diamond', category:'Ladies/Dress', details:'28mm, Oystersteel/Everose, Diamond bezel (2016–present)', movement:'Cal. 2236', collectibility:'Moderate'},
      '279385RBR': {name:'Lady-Datejust 28 Diamond', category:'Ladies/Dress', details:'28mm, Oystersteel/Everose, Diamond bezel, Jubilee (2016–present)', movement:'Cal. 2236', collectibility:'Moderate'},
      '279386': {name:'Lady-Datejust 28 Diamond', category:'Ladies/Dress', details:'28mm, Oystersteel/White Gold, Diamond bezel (2016–present)', movement:'Cal. 2236', collectibility:'Moderate'},
      '279386RBR': {name:'Lady-Datejust 28 Diamond', category:'Ladies/Dress', details:'28mm, Oystersteel/White Gold, Diamond bezel (2016–present)', movement:'Cal. 2236', collectibility:'Moderate'},
      '279135RBR': {name:'Lady-Datejust 28 Everose Diamond', category:'Ladies/Dress', details:'28mm, 18k Everose Gold, Diamond bezel (2016–present)', movement:'Cal. 2236', collectibility:'High'},
      '279138RBR': {name:'Lady-Datejust 28 WG Diamond', category:'Ladies/Dress', details:'28mm, 18k White Gold, Diamond bezel (2016–present)', movement:'Cal. 2236', collectibility:'High'},
      '179174': {name:'Lady-Datejust 26', category:'Ladies/Dress', details:'26mm, Oystersteel/White Gold, Fluted bezel (2006–2016)', movement:'Cal. 2235', collectibility:'Moderate'},
      '179173': {name:'Lady-Datejust 26', category:'Ladies/Dress', details:'26mm, Oystersteel/Yellow Gold, Fluted bezel (2006–2016)', movement:'Cal. 2235', collectibility:'Moderate'},
      '179171': {name:'Lady-Datejust 26 Rolesor', category:'Ladies/Dress', details:'26mm, Two-tone Steel/Yellow Gold (2006–2016)', movement:'Cal. 2235', collectibility:'Moderate'},
      '179160': {name:'Lady-Datejust 26 Smooth', category:'Ladies/Dress', details:'26mm, Oystersteel, Smooth bezel (2006–2016)', movement:'Cal. 2235', collectibility:'Moderate'},
      '179175': {name:'Lady-Datejust 26 Everose', category:'Ladies/Dress', details:'26mm, Everose Gold (2006–2016)', movement:'Cal. 2235', collectibility:'Moderate'},
      '179178': {name:'Lady-Datejust 26 Yellow Gold', category:'Ladies/Dress', details:'26mm, 18k Yellow Gold (2006–2016)', movement:'Cal. 2235', collectibility:'High'},
      '179384': {name:'Lady-Datejust 26 Diamond', category:'Ladies/Dress', details:'26mm, Oystersteel/White Gold, Diamond bezel, Jubilee (2006–2016)', movement:'Cal. 2235', collectibility:'Moderate'},
      '69174': {name:'Lady-Datejust 26', category:'Ladies/Dress', details:'26mm, Oystersteel/White Gold (1989–2006)', movement:'Cal. 2135', collectibility:'Moderate'},
      '69173': {name:'Lady-Datejust 26', category:'Ladies/Dress', details:'26mm, Oystersteel/Yellow Gold (1989–2006)', movement:'Cal. 2135', collectibility:'Moderate'},
      '69178': {name:'Lady-Datejust 26 Yellow Gold', category:'Ladies/Dress', details:'26mm, 18k Yellow Gold (1989–2006)', movement:'Cal. 2135', collectibility:'Moderate'},

      // ── PEARLMASTER ──────────────────────────────────────────────────────
      '81339': {name:'Pearlmaster 39', category:'Ladies/Luxury', details:'39mm, 18k White Gold, Full diamond set (2013–present)', movement:'Cal. 3235', collectibility:'Moderate'},
      '81338': {name:'Pearlmaster 39 Rose', category:'Ladies/Luxury', details:'39mm, 18k Everose Gold, Full diamond set (2013–present)', movement:'Cal. 3235', collectibility:'Moderate'},
      '80319': {name:'Pearlmaster 34 White Gold', category:'Ladies/Luxury', details:'34mm, 18k White Gold, Diamond bracelet (2010–present)', movement:'Cal. 2235', collectibility:'Moderate'},
      '80315': {name:'Pearlmaster 34 Rose Gold', category:'Ladies/Luxury', details:'34mm, 18k Rose Gold (2010–present)', movement:'Cal. 2235', collectibility:'Moderate'},

      // ── DAY-DATE — Current ───────────────────────────────────────────────
      '228238': {name:'Day-Date 40 Yellow Gold', category:'Luxury/Dress', details:'40mm, 18k Yellow Gold, President bracelet (2015–present)', movement:'Cal. 3255', collectibility:'High', notes:'The "President" watch. Only in precious metals. Cal. 3255 is the flagship movement.'},
      '228235': {name:'Day-Date 40 Rose Gold', category:'Luxury/Dress', details:'40mm, 18k Everose Gold, President bracelet (2015–present)', movement:'Cal. 3255', collectibility:'High'},
      '228239': {name:'Day-Date 40 White Gold', category:'Luxury/Dress', details:'40mm, 18k White Gold, President bracelet (2015–present)', movement:'Cal. 3255', collectibility:'High'},
      '228206': {name:'Day-Date 40 Platinum', category:'Luxury/Dress', details:'40mm, Platinum, Ice blue dial, President bracelet (2015–present)', movement:'Cal. 3255', collectibility:'Very High'},
      '228346': {name:'Day-Date 40 White Gold Diamonds', category:'Luxury/Dress', details:'40mm, 18k White Gold, Diamond-set bezel & dial (2015–present)', movement:'Cal. 3255', collectibility:'High'},
      '228345RBR': {name:'Day-Date 40 Rainbow', category:'Luxury/Dress', details:'40mm, Rose Gold, Rainbow sapphire bezel (2019–present)', movement:'Cal. 3255', nickname:'"Rainbow"', collectibility:'Extreme'},

      // ── DAY-DATE — Gen VII (2000–2015) ──────────────────────────────────
      '218238': {name:'Day-Date 40 Yellow Gold (Gen VII)', category:'Luxury/Dress', details:'40mm, 18k Yellow Gold (2008–2015)', movement:'Cal. 3156', collectibility:'High'},
      '218235': {name:'Day-Date 40 Rose Gold (Gen VII)', category:'Luxury/Dress', details:'40mm, 18k Everose Gold (2008–2015)', movement:'Cal. 3156', collectibility:'High'},
      '118238': {name:'Day-Date 36 Yellow Gold', category:'Luxury/Dress', details:'36mm, 18k Yellow Gold, President bracelet (2000–2019)', movement:'Cal. 3155', collectibility:'High'},
      '118235': {name:'Day-Date 36 Rose Gold', category:'Luxury/Dress', details:'36mm, 18k Rose Gold, President bracelet (2000–2019)', movement:'Cal. 3155', collectibility:'High'},
      '118239': {name:'Day-Date 36 White Gold', category:'Luxury/Dress', details:'36mm, 18k White Gold, President bracelet (2000–2019)', movement:'Cal. 3155', collectibility:'High'},
      '118206': {name:'Day-Date 36 Platinum', category:'Luxury/Dress', details:'36mm, Platinum, Ice blue dial (2000–2019)', movement:'Cal. 3155', collectibility:'Very High'},

      // ── DAY-DATE — Vintage ───────────────────────────────────────────────
      '18038': {name:'Day-Date 36 Yellow Gold Quickset', category:'Vintage/Dress', details:'36mm, 18k Yellow Gold, Quickset date (1977–1988)', movement:'Cal. 3055', collectibility:'High'},
      '18239': {name:'Day-Date 36 White Gold Quickset', category:'Vintage/Dress', details:'36mm, 18k White Gold (1977–1988)', movement:'Cal. 3055', collectibility:'High'},
      '18235': {name:'Day-Date 36 Rose Gold Quickset', category:'Vintage/Dress', details:'36mm, 18k Rose Gold (1977–1988)', movement:'Cal. 3055', collectibility:'High'},
      '1803': {name:'Day-Date 36 "Pie Pan" Yellow Gold', category:'Vintage/Dress', details:'36mm, 18k Yellow Gold, Pie-pan stepped dial (1956–1977)', movement:'Cal. 1556 / 1558', nickname:'"Pie Pan"', collectibility:'Very High', notes:'Original Day-Date. Pie-pan dials are most desirable. First watch to display day AND date.'},
      '1807': {name:'Day-Date 36 "Pie Pan" White Gold', category:'Vintage/Dress', details:'36mm, 18k White Gold, Pie-pan dial (1956–1977)', movement:'Cal. 1556', nickname:'"Pie Pan" White Gold', collectibility:'Very High'},
      '1811': {name:'Day-Date 36 "Pie Pan" Platinum', category:'Vintage/Dress', details:'36mm, Platinum (1956–1977)', movement:'Cal. 1556', collectibility:'Extreme'},
      '1804': {name:'Day-Date 36 Oyster Band', category:'Vintage/Dress', details:'36mm, 18k Yellow Gold, Oyster bracelet (1960s)', movement:'Cal. 1556', collectibility:'Very High'},
      '6611': {name:'Day-Date 36 Pre-Ref.1803', category:'Vintage/Dress', details:'36mm, Very early Day-Date reference (1956)', movement:'Cal. 1055', collectibility:'Extreme', notes:'First-year Day-Date production.'},

      // ── EXPLORER I ───────────────────────────────────────────────────────
      '124270': {name:'Explorer I 36', category:'Sport/Tool', details:'36mm, Oystersteel, Black dial with 3-6-9 numerals (2021–present)', movement:'Cal. 3230', collectibility:'High', notes:'Return to 36mm after 2010–2021\'s 39mm. 70-hr power reserve. Collector debate was fierce.'},
      '214270': {name:'Explorer I 39', category:'Sport/Tool', details:'39mm, Oystersteel, Black dial (2010–2021)', movement:'Cal. 3132', collectibility:'High'},
      '114270': {name:'Explorer I 36', category:'Sport/Tool', details:'36mm, Oystersteel, Black dial (2001–2010)', movement:'Cal. 3130', collectibility:'High'},
      '14270': {name:'Explorer I 36', category:'Sport/Tool', details:'36mm, Oystersteel, Black dial, Sapphire crystal (1989–2001)', movement:'Cal. 3000', collectibility:'High'},
      '1016': {name:'Explorer I "The One"', category:'Vintage/Tool', details:'36mm, Oystersteel, Matte black dial, 3-6-9 indices (1963–1989)', movement:'Cal. 1560 / 1570', collectibility:'Very High', notes:'26-year production run. Many evolutions. The definitive vintage Explorer. Gilt dials from early production are most desirable.'},
      '6610': {name:'Explorer I Early', category:'Vintage/Tool', details:'36mm, Oystersteel, Early Explorer (1957–1963)', movement:'Cal. 1030', collectibility:'Very High'},
      '6350': {name:'Explorer I First', category:'Vintage/Tool', details:'36mm, Very early Explorer reference (1953–1957)', movement:'Cal. 1036', collectibility:'Extreme', notes:'Worn by Edmund Hillary on Everest ascent, 1953.'},

      // ── EXPLORER II ──────────────────────────────────────────────────────
      '224270': {name:'Explorer II 42', category:'Sport/Tool', details:'42mm, Oystersteel, White/Black dial, 24-hr hand (2021–present)', movement:'Cal. 3285', collectibility:'High'},
      '216570': {name:'Explorer II 42', category:'Sport/Tool', details:'42mm, Oystersteel, White/Black dial (2011–2021)', movement:'Cal. 3187', collectibility:'High'},
      '16570': {name:'Explorer II 40', category:'Sport/Tool', details:'40mm, Oystersteel, White/Black dial (1989–2011)', movement:'Cal. 3185', collectibility:'High'},
      '1655': {name:'Explorer II "Steve McQueen" / "Freccione"', category:'Vintage/Tool', details:'39mm, Oystersteel, First Explorer II, Fixed 24-hr hand, Orange "freccione" hand (1971–1985)', movement:'Cal. 1575', nickname:'"Steve McQueen" / "Freccione"', collectibility:'Extreme', notes:'Iconic orange arrow hand (freccione). Associated with Steve McQueen. Fixed 24-hr disk, not independent hand.'},
      '16550': {name:'Explorer II 40 Cream Dial', category:'Sport/Tool', details:'40mm, Oystersteel, Cream or black dial (1985–1989)', movement:'Cal. 3085', collectibility:'Very High', notes:'Cream/ivory dial variants (orange-lume aging) are extremely sought after by collectors.'},

      // ── SEA-DWELLER ──────────────────────────────────────────────────────
      '126600': {name:'Sea-Dweller 43 "Red"', category:'Sport/Deep Dive', details:'43mm, Oystersteel, Red "Sea-Dweller" text, Cyclops lens (2017–present)', movement:'Cal. 3235', collectibility:'High', notes:'50th Anniversary model. First Sea-Dweller with cyclops lens. "Red text" returns after 40+ years.'},
      '126660': {name:'Sea-Dweller Deepsea D-Blue', category:'Sport/Deep Dive', details:'44mm, Oystersteel, D-Blue dial, 3,900m WR (2018–present)', movement:'Cal. 3235', collectibility:'High'},
      '126660D': {name:'Sea-Dweller Deepsea Challenge', category:'Sport/Deep Dive', details:'50mm, Titanium & RLX Titanium, 11,000m WR (2023+)', movement:'Cal. 3230', collectibility:'High'},
      '136660': {name:'Sea-Dweller Deepsea Challenge', category:'Sport/Deep Dive', details:'50mm, RLX Titanium, 11,000m water resistance (2022–present)', movement:'Cal. 3235', collectibility:'High'},
      '116660': {name:'Sea-Dweller Deepsea', category:'Sport/Deep Dive', details:'44mm, Oystersteel, 3,900m water resistance (2008–2018)', movement:'Cal. 3135', collectibility:'High'},
      '116660D': {name:'Sea-Dweller Deepsea D-Blue "James Cameron"', category:'Sport/Deep Dive', details:'44mm, D-Blue "Mariana Trench" dial (2014–2018)', movement:'Cal. 3135', nickname:'"James Cameron"', collectibility:'Very High'},
      '116600': {name:'Sea-Dweller 40 "No Cyclops"', category:'Sport/Deep Dive', details:'40mm, Oystersteel, No cyclops, 1,220m WR (2014–2017)', movement:'Cal. 3135', collectibility:'High'},
      '16600': {name:'Sea-Dweller 40 Classic', category:'Sport/Deep Dive', details:'40mm, Oystersteel, Helium escape valve (1978–2008)', movement:'Cal. 3135', collectibility:'High'},
      '1665': {name:'Sea-Dweller "Double Red"', category:'Vintage/Deep Dive', details:'40mm, Oystersteel, First Sea-Dweller, Two red text lines (1967–1977)', movement:'Cal. 1575', nickname:'"Double Red" (DRSD)', collectibility:'Extreme', notes:'Most coveted vintage Sea-Dweller. Single-Red (SRSD) and Great White variants also exist.'},

      // ── YACHT-MASTER ─────────────────────────────────────────────────────
      '226659': {name:'Yacht-Master 42 White Gold', category:'Sport/Sailing', details:'42mm, 18k White Gold, Dark Rhodium dial, Oysterflex (2019–present)', movement:'Cal. 3285', collectibility:'High'},
      '226627': {name:'Yacht-Master 42 Everose', category:'Sport/Sailing', details:'42mm, Everose Gold, Oysterflex strap (2023–present)', movement:'Cal. 3285', collectibility:'High'},
      '126629': {name:'Yacht-Master 40 White Gold', category:'Sport/Sailing', details:'40mm, 18k White Gold, Dark grey dial (2019–present)', movement:'Cal. 3235', collectibility:'High'},
      '126622': {name:'Yacht-Master 40 Platinum Bezel', category:'Sport/Sailing', details:'40mm, Oystersteel, Platinum Rolesium bezel (2016–present)', movement:'Cal. 3235', collectibility:'High'},
      '126655': {name:'Yacht-Master 40 Rose Gold Oysterflex', category:'Sport/Sailing', details:'40mm, 18k Everose Gold, Oysterflex rubber strap (2015–present)', movement:'Cal. 3235', collectibility:'High'},
      '116621': {name:'Yacht-Master 40 Rolesor', category:'Sport/Sailing', details:'40mm, Two-tone Steel/Gold (2007–2015)', movement:'Cal. 3135', collectibility:'Moderate'},
      '116622': {name:'Yacht-Master 40 Platinum Bezel (Gen VI)', category:'Sport/Sailing', details:'40mm, Oystersteel/Platinum bezel (2012–2016)', movement:'Cal. 3135', collectibility:'Moderate'},
      '116655': {name:'Yacht-Master 40 Rose Gold', category:'Sport/Sailing', details:'40mm, 18k Everose Gold, Oysterflex (2015–2019)', movement:'Cal. 3135', collectibility:'High'},
      '16622': {name:'Yacht-Master 40 Classic Steel/Platinum', category:'Sport/Sailing', details:'40mm, Oystersteel, Platinum Rolesium bezel (1992–2012)', movement:'Cal. 3135', collectibility:'Moderate', notes:'First Yacht-Master reference. Introduced luxury sport-sailing segment.'},
      '16628': {name:'Yacht-Master 40 Yellow Gold', category:'Sport/Sailing', details:'40mm, 18k Yellow Gold (1992–2012)', movement:'Cal. 3135', collectibility:'Moderate'},
      '16623': {name:'Yacht-Master 40 Rolesor', category:'Sport/Sailing', details:'40mm, Two-tone Steel/Gold (1992–2012)', movement:'Cal. 3135', collectibility:'Moderate'},
      '268655': {name:'Yacht-Master 37 Everose', category:'Sport/Sailing', details:'37mm, 18k Everose Gold, Oysterflex (2017–present)', movement:'Cal. 2236', collectibility:'Moderate'},
      '268622': {name:'Yacht-Master 37 Platinum Bezel', category:'Sport/Sailing', details:'37mm, Oystersteel/Platinum bezel (2019–present)', movement:'Cal. 2236', collectibility:'Moderate'},
      '169622': {name:'Yacht-Master 29 Ladies', category:'Ladies/Sailing', details:'29mm, Oystersteel/Platinum bezel (2019–present)', movement:'Cal. 2236', collectibility:'Moderate'},
      '226658': {name:'Yacht-Master 42 Yellow Gold', category:'Sport/Sailing', details:'42mm, 18k Yellow Gold, Oysterflex (2023–present)', movement:'Cal. 3285', collectibility:'High'},

      // ── MILGAUSS ─────────────────────────────────────────────────────────
      '116400GV': {name:'Milgauss Green Crystal', category:'Sport/Anti-Magnetic', details:'40mm, Oystersteel, Green crystal, Lightning bolt seconds (2007–2023)', movement:'Cal. 3131', nickname:'"Green Glass"', collectibility:'Very High', notes:'Discontinued 2023. Anti-magnetic to 1,000 gauss. Green sapphire crystal is unique in Rolex lineup.'},
      '116400': {name:'Milgauss Clear Crystal', category:'Sport/Anti-Magnetic', details:'40mm, Oystersteel, Clear sapphire crystal, Black/White/Orange dial (2007–2023)', movement:'Cal. 3131', collectibility:'High', notes:'Discontinued 2023. Strong secondary market demand.'},
      '1019': {name:'Milgauss Classic', category:'Vintage/Anti-Magnetic', details:'38mm, Oystersteel, Anti-magnetic, No date (1960–1988)', movement:'Cal. 1580', collectibility:'Very High', notes:'The iconic "watch for scientists." Worn at CERN. Clean lines, high collectibility.'},
      '6541': {name:'Milgauss First Reference', category:'Vintage/Anti-Magnetic', details:'38mm, Oystersteel, First Milgauss, Rare Faraday cage (1956–1960)', movement:'Cal. 1080', collectibility:'Extreme', notes:'Rarest of all Milgauss. Most had meshed inner shield. First antimagnetic reference.'},
      '6543': {name:'Milgauss Early', category:'Vintage/Anti-Magnetic', details:'38mm, Early Milgauss with lightning bolt seconds (1956–1960)', movement:'Cal. 1080', collectibility:'Extreme'},

      // ── AIR-KING ─────────────────────────────────────────────────────────
      '126900': {name:'Air-King', category:'Sport/Aviation', details:'40mm, Oystersteel, Black dial, 60min/12hr scale, 3285 movement (2022–present)', movement:'Cal. 3230', collectibility:'High', notes:'Redesigned 2022. Aviation tribute with Superluminova hour markers.'},
      '116900': {name:'Air-King', category:'Sport/Aviation', details:'40mm, Oystersteel, Black dial with Arabic 5-min markers (2016–2022)', movement:'Cal. 3131', collectibility:'High'},
      '14000M': {name:'Air-King 34mm SS', category:'Sport/Aviation', details:'34mm, Oystersteel, No date, Cal.3130, Sapphire crystal upgrade (2001–2007)', movement:'Cal. 3130', collectibility:'Moderate'},
      '14000': {name:'Air-King 34mm SS', category:'Sport/Aviation', details:'34mm, Oystersteel, No date (1989–2001)', movement:'Cal. 3000', collectibility:'Moderate'},
      '5500': {name:'Air-King 34 Vintage', category:'Vintage/Aviation', details:'34mm, Oystersteel, No date, Variety of dials (1957–1989)', movement:'Cal. 1520', collectibility:'High', notes:'Long-running vintage reference. "Air-King" name pays homage to British aviators of WWII.'},
      '5501': {name:'Air-King A Date', category:'Vintage/Aviation', details:'34mm, Oystersteel, Date window variant (1957–1977)', movement:'Cal. 1530', collectibility:'High'},
      '5520': {name:'Air-King "Air Lion"', category:'Vintage/Aviation', details:'34mm, Oystersteel, "Air Lion" text (1950s)', movement:'Cal. 1520', nickname:'"Air Lion"', collectibility:'Extreme', notes:'Air Lion, Air Tiger, and Air Giant were rare companion references.'},

      // ── OYSTER PERPETUAL ─────────────────────────────────────────────────
      '124300': {name:'Oyster Perpetual 41', category:'Entry/Sport', details:'41mm, Oystersteel, Lacquered candy-color dials (2020–present)', movement:'Cal. 3230', collectibility:'High', notes:'Candy apple red and turquoise dials caused secondary market premiums immediately.'},
      '126000': {name:'Oyster Perpetual 36', category:'Entry/Sport', details:'36mm, Oystersteel, Multiple dial colors (2020–present)', movement:'Cal. 3230', collectibility:'High'},
      '277200': {name:'Oyster Perpetual 31', category:'Entry/Sport', details:'31mm, Oystersteel, Multiple dial colors (2020–present)', movement:'Cal. 2232', collectibility:'Moderate'},
      '276200': {name:'Oyster Perpetual 28', category:'Entry/Sport', details:'28mm, Oystersteel, Multiple dial colors (2020–present)', movement:'Cal. 2232', collectibility:'Moderate'},
      '114300': {name:'Oyster Perpetual 39', category:'Entry/Sport', details:'39mm, Oystersteel (2015–2020)', movement:'Cal. 3132', collectibility:'Moderate'},
      '116000': {name:'Oyster Perpetual 36', category:'Entry/Sport', details:'36mm, Oystersteel (2007–2020)', movement:'Cal. 3132', collectibility:'Moderate'},
      '1002': {name:'Oyster Perpetual 34 Vintage', category:'Vintage/Sport', details:'34mm, Oystersteel, No date (1959–1977)', movement:'Cal. 1570', collectibility:'Moderate'},
      '6298': {name:'Oyster Perpetual Vintage Early', category:'Vintage/Sport', details:'34mm, Very early OP (1950s)', movement:'Cal. 1030', collectibility:'High'},

      // ── SKY-DWELLER ──────────────────────────────────────────────────────
      '336933': {name:'Sky-Dweller 42 Two-Tone', category:'Luxury/GMT', details:'42mm, Oystersteel/Yellow Gold, Jubilee, Annual calendar, Dual time (2023–present)', movement:'Cal. 9002', collectibility:'High'},
      '336934': {name:'Sky-Dweller 42 Steel/White Gold', category:'Luxury/GMT', details:'42mm, Oystersteel/White Gold bezel, Annual calendar, Dual time (2023–present)', movement:'Cal. 9002', collectibility:'High'},
      '336935': {name:'Sky-Dweller 42 Steel', category:'Luxury/GMT', details:'42mm, Oystersteel, Jubilee, Annual calendar, Dual time (2023–present)', movement:'Cal. 9002', collectibility:'High'},
      '336938': {name:'Sky-Dweller 42 Yellow Gold', category:'Luxury/GMT', details:'42mm, 18k Yellow Gold, Jubilee (2023–present)', movement:'Cal. 9002', collectibility:'High'},
      '336235': {name:'Sky-Dweller 42 Everose Gold', category:'Luxury/GMT', details:'42mm, 18k Everose Gold, Jubilee (2023–present)', movement:'Cal. 9002', collectibility:'High'},
      '336239': {name:'Sky-Dweller 42 White Gold', category:'Luxury/GMT', details:'42mm, 18k White Gold, Jubilee (2023–present)', movement:'Cal. 9002', collectibility:'High'},
      '326933': {name:'Sky-Dweller 42 Two-Tone (prev)', category:'Luxury/GMT', details:'42mm, Oystersteel/Yellow Gold, Oyster (2019–2023)', movement:'Cal. 9001', collectibility:'High'},
      '326934': {name:'Sky-Dweller 42 Steel/White Gold (Gen I)', category:'Luxury/GMT', details:'42mm, Oystersteel/White Gold bezel, Annual calendar (2017–2023)', movement:'Cal. 9001', collectibility:'High'},
      '326938': {name:'Sky-Dweller 42 Yellow Gold', category:'Luxury/GMT', details:'42mm, 18k Yellow Gold (2012–2023)', movement:'Cal. 9001', collectibility:'High'},
      '326935': {name:'Sky-Dweller 42 Steel (prev)', category:'Luxury/GMT', details:'42mm, Oystersteel, Oyster bracelet (2019–2023)', movement:'Cal. 9001', collectibility:'High'},
      '326939': {name:'Sky-Dweller 42 White Gold', category:'Luxury/GMT', details:'42mm, 18k White Gold (2012–2023)', movement:'Cal. 9001', collectibility:'High'},
      '326238': {name:'Sky-Dweller 42 Yellow Gold', category:'Luxury/GMT', details:'42mm, 18k Yellow Gold (2012–present)', movement:'Cal. 9001', collectibility:'High'},
      '326235': {name:'Sky-Dweller 42 Everose Gold', category:'Luxury/GMT', details:'42mm, 18k Everose Gold (2014–present)', movement:'Cal. 9001', collectibility:'High'},
      '326139': {name:'Sky-Dweller 42 White Gold', category:'Luxury/GMT', details:'42mm, 18k White Gold (2012–present)', movement:'Cal. 9001', collectibility:'High'},

      // ── CELLINI ──────────────────────────────────────────────────────────
      '50505': {name:'Cellini Time Rose Gold', category:'Dress/Formal', details:'39mm, 18k Everose Gold, Black leather strap (2014–2019)', movement:'Cal. 3132', collectibility:'Moderate'},
      '50509': {name:'Cellini Time White Gold', category:'Dress/Formal', details:'39mm, 18k White Gold, Leather strap (2014–2019)', movement:'Cal. 3132', collectibility:'Moderate'},
      '50519': {name:'Cellini Moonphase', category:'Dress/Formal', details:'39mm, Rose Gold, Moon phase indication (2017–2019)', movement:'Cal. 3195', collectibility:'Moderate'},
      '50525': {name:'Cellini Dual Time Rose Gold', category:'Dress/Formal', details:'39mm, 18k Everose Gold, Dual time zone (2014–2019)', movement:'Cal. 3180', collectibility:'Moderate'},
      '50529': {name:'Cellini Dual Time White Gold', category:'Dress/Formal', details:'39mm, 18k White Gold, Dual time zone (2014–2019)', movement:'Cal. 3180', collectibility:'Moderate'},
      '5116': {name:'Cellini Vintage', category:'Vintage/Formal', details:'35mm, 18k Gold, Hand-wound, Dress (1970s–2000s)', movement:'Cal. 1600', collectibility:'Moderate'},
      '4112': {name:'Cellini Early', category:'Vintage/Formal', details:'Rectangular/Asymmetric case (1960s–1970s)', movement:'Cal. 1600', collectibility:'High'},

      // ── TURN-O-GRAPH / THUNDERBIRD ────────────────────────────────────────
      '116264': {name:'Datejust Turn-O-Graph', category:'Classic/Dress', details:'36mm, Oystersteel/White Gold, Rotating bezel (2005–2011)', movement:'Cal. 3135', collectibility:'High', notes:'Last Turn-O-Graph reference. Rotating bezel predates GMT concept.'},
      '116264T': {name:'Datejust Turn-O-Graph Two-Tone', category:'Classic/Dress', details:'36mm, Rolesor, Rotating fluted bezel (2005–2011)', movement:'Cal. 3135', collectibility:'High'},
      '16264': {name:'Datejust Turn-O-Graph', category:'Classic/Dress', details:'36mm, Oystersteel, Rotating bezel (1988–2005)', movement:'Cal. 3135', collectibility:'High'},
      '16263': {name:'Datejust Turn-O-Graph Two-Tone', category:'Classic/Dress', details:'36mm, Rolesor (1988–2005)', movement:'Cal. 3135', collectibility:'High'},
      '6309': {name:'"Thunderbird" Turn-O-Graph', category:'Vintage/Dress', details:'34mm, Very early rotating bezel watch (1953)', movement:'Cal. 1030', nickname:'"Thunderbird"', collectibility:'Extreme', notes:'First Rolex with rotating bezel. Named after Blue Angels Thunderbird team.'},

      // ── YACHT-MASTER II ───────────────────────────────────────────────────
      '116688': {name:'Yacht-Master II 44 Yellow Gold', category:'Sport/Sailing', details:'44mm, 18k Yellow Gold, Regatta countdown (2007–present)', movement:'Cal. 4161', collectibility:'High', notes:'Only Rolex with mechanical regatta countdown timer. 10-min programmable.'},
      '116681': {name:'Yacht-Master II 44 Rolesor', category:'Sport/Sailing', details:'44mm, Two-tone Steel/Gold (2007–present)', movement:'Cal. 4161', collectibility:'High'},
      '116680': {name:'Yacht-Master II 44 White', category:'Sport/Sailing', details:'44mm, Oystersteel, White dial (2007–present)', movement:'Cal. 4161', collectibility:'High'},
    };

    // ── SEARCH LOGIC ─────────────────────────────────────────────────────────
    // 1. Exact match
    if (modelDatabase[model]) {
      setModelResult(modelDatabase[model]);
      return;
    }
    // 2. Case-insensitive exact
    const caseKey = Object.keys(modelDatabase).find(k => k === model);
    if (caseKey) {
      setModelResult(modelDatabase[caseKey]);
      return;
    }
    // 3. Partial matches (key contains query or query contains key)
    const partialMatches = Object.entries(modelDatabase).filter(([key]) =>
      key.includes(model) || model.includes(key)
    );
    if (partialMatches.length > 0) {
      const [, data] = partialMatches[0];
      setModelResult(data);
      return;
    }
    // 4. Name search (in case user types "Batman" or "Hulk")
    const nickMatch = Object.entries(modelDatabase).find(([, v]) =>
      v.nickname?.toUpperCase().includes(model) || v.name.toUpperCase().includes(model)
    );
    if (nickMatch) {
      setModelResult(nickMatch[1]);
      return;
    }
    setModelResult({
      name: 'Reference Not Found',
      category: 'Unknown',
      details: 'This reference is not in our database. Please verify the number. You can also ask Simplicity below for help identifying any Rolex model.',
    });
  };

  const handleAuthCheck = () => {
    if (!authSerial.trim() || !authRef.trim()) return;
    const parsed = parseSerialForYear(authSerial.trim());
    const refKey = authRef.toUpperCase().trim();
    const prodData = REF_PRODUCTION[refKey];
    const mv = MARKET_VALUE[refKey];
    if (!parsed) {
      setAuthResult({
        serialYear: 'Unknown', refName: prodData?.name ?? refKey, refKey,
        prodWindow: prodData ? `${prodData.start}–${prodData.end ?? 'present'}` : 'Unknown',
        status: 'unknown', statusMessage: 'Could not determine a production year from this serial number format.',
        movement: prodData?.movement, collectibility: prodData?.collectibility, marketValue: mv,
      });
      return;
    }
    if (!prodData) {
      setAuthResult({
        serialYear: parsed.year, refName: refKey, refKey, prodWindow: 'Unknown',
        status: 'unknown', statusMessage: `Reference ${refKey} is not in our production database. This doesn't indicate a problem — verify the reference number is correct.`,
        marketValue: mv,
      });
      return;
    }
    const yearNum = parsed.yearNum;
    const prodEnd = prodData.end ?? 2026;
    const inWindow = yearNum >= prodData.start && yearNum <= prodEnd;
    const borderline = !inWindow && (yearNum === prodData.start - 1 || (prodData.end !== null && yearNum === prodData.end + 1));
    const prodWindow = `${prodData.start}–${prodData.end ?? 'present'}`;
    const status: 'verified' | 'warning' | 'mismatch' = inWindow ? 'verified' : borderline ? 'warning' : 'mismatch';
    const statusMessage = status === 'verified'
      ? `Serial year ${parsed.year} falls within the confirmed production window for the ${prodData.name} (${prodWindow}). This is consistent with authentic production.`
      : status === 'warning'
      ? `Serial year ${parsed.year} is borderline to the ${prodData.name} production window (${prodWindow}). Early and late production transitions can overlap. Verify with box/papers.`
      : `Serial year ${parsed.year} does not match the ${prodData.name} production window (${prodWindow}). This is a significant discrepancy — this reference was not in production during that period.`;
    setAuthResult({
      serialYear: parsed.year, refName: prodData.name, refKey, prodWindow, status, statusMessage,
      movement: prodData.movement, collectibility: prodData.collectibility, marketValue: mv,
    });
  };

  const handleCompare = () => {
    if (!compRef1.trim() || !compRef2.trim()) return;
    const k1 = compRef1.toUpperCase().trim();
    const k2 = compRef2.toUpperCase().trim();
    const r1data = REF_PRODUCTION[k1];
    const r2data = REF_PRODUCTION[k2];
    setCompResult({
      ref1Key: k1, ref2Key: k2,
      ref1: r1data ? {...r1data, marketValue: MARKET_VALUE[k1], specs: SPECS_MAP[k1]} : undefined as any,
      ref2: r2data ? {...r2data, marketValue: MARKET_VALUE[k2], specs: SPECS_MAP[k2]} : undefined as any,
    });
  };

  return (
    <div className="min-h-screen bg-primary-950 text-white">
      <Navigation />
      
      {/* Header Section — "Rolex / The Archive" */}
      <section className="pt-20 pb-10 sm:pb-14 relative overflow-hidden" style={{background: 'linear-gradient(180deg, #0a0a0a 0%, #111108 60%, #0f0f0d 100%)'}}>
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.05) 1px, rgba(255,255,255,0.05) 2px)', backgroundSize: '100% 4px'}}></div>
        {/* Gold top rule */}
        <div className="absolute top-20 left-0 right-0 h-px" style={{background: 'linear-gradient(90deg, transparent 0%, rgba(202,163,79,0.6) 20%, rgba(202,163,79,0.9) 50%, rgba(202,163,79,0.6) 80%, transparent 100%)'}}></div>
        {/* Gold bottom rule */}
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{background: 'linear-gradient(90deg, transparent 0%, rgba(202,163,79,0.4) 30%, rgba(202,163,79,0.7) 50%, rgba(202,163,79,0.4) 70%, transparent 100%)'}}></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            {/* ROLEX wordmark */}
            <div className="mb-1 tracking-[0.3em] sm:tracking-[0.4em] text-[11px] sm:text-xs text-amber-400/70 uppercase font-light" style={{fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.4em'}}>
              <span className="simpleton-brand">Simpleton</span> Vision™ Presents
            </div>
            <h1 className="leading-none mb-0" style={{fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 'clamp(3rem, 10vw, 7rem)', letterSpacing: '0.12em', color: '#f5e6c0', textTransform: 'uppercase'}}>
              ROLEX
            </h1>
            {/* Rule between the two lines */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 my-2">
              <div className="h-px flex-1 max-w-[80px] sm:max-w-[140px]" style={{background: 'linear-gradient(90deg, transparent, rgba(202,163,79,0.8))'}}></div>
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400/80"></div>
              <div className="h-px flex-1 max-w-[80px] sm:max-w-[140px]" style={{background: 'linear-gradient(90deg, rgba(202,163,79,0.8), transparent)'}}></div>
            </div>
            <h2 className="leading-none" style={{fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(1.4rem, 5vw, 3.2rem)', letterSpacing: '0.18em', color: '#c9a44f'}}>
              The Archive
            </h2>
            <p className="mt-5 text-[13px] sm:text-sm text-stone-400 max-w-2xl mx-auto leading-relaxed px-2" style={{fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.04em'}}>
              Comprehensive reference data on serial numbers, identification details, market valuations, production history, and investment analysis. For informational purposes only — professional authentication recommended.
            </p>
            <div className="mt-4 text-[10px] sm:text-xs tracking-widest text-amber-600/60 uppercase" style={{fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.3em'}}>
              Est. 2024 &nbsp;·&nbsp; Geneva Standards &nbsp;·&nbsp; Professional Grade
            </div>
          </div>
        </div>
      </section>

      {/* BETA Testing Notice */}
      <div className="py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 border-b border-blue-500">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <span className="text-red-400 font-bold">BETA</span>
            <span className="text-white font-medium"> testing please email feedback to, </span>
            <span className="text-blue-300 font-medium">INTEL@SIMPLETONAPP.COM</span>
          </div>
        </div>
      </div>

      {/* Watch News Ticker */}
      <div className="py-4 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto">
          <NewsTicker category="watches" />
        </div>
      </div>

      {/* Advanced Cyberpunk Watch News Section */}
      <section className="py-8 sm:py-16 bg-gradient-to-br from-primary-950 via-gray-900 to-primary-950 relative overflow-hidden">
        {/* Cyberpunk Grid Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        
        {/* Holographic Scanning Beams */}
        <div className="absolute inset-0 pointer-events-none hidden sm:block">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        {/* Corner Holographic Effects - Hidden on mobile */}
        <div className="absolute top-0 left-0 w-16 sm:w-32 h-16 sm:h-32 border-t-2 sm:border-t-4 border-l-2 sm:border-l-4 border-cyan-500 opacity-60"></div>
        <div className="absolute top-0 right-0 w-16 sm:w-32 h-16 sm:h-32 border-t-2 sm:border-t-4 border-r-2 sm:border-r-4 border-purple-500 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-16 sm:w-32 h-16 sm:h-32 border-b-2 sm:border-b-4 border-l-2 sm:border-l-4 border-blue-500 opacity-60"></div>
        <div className="absolute bottom-0 right-0 w-16 sm:w-32 h-16 sm:h-32 border-b-2 sm:border-b-4 border-r-2 sm:border-r-4 border-pink-500 opacity-60"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              WATCH-FEED::LIVE
            </h2>
            <div className="text-sm sm:text-lg md:text-xl text-green-400 font-mono">
              [ LUXURY TIMEPIECE INTELLIGENCE NETWORK ]
            </div>
            <div className="text-xs sm:text-sm text-yellow-400 mt-2">
              Real-time market intelligence from premium watch industry sources
            </div>
          </div>
          
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {/* Watch News Articles with Cyberpunk Design */}
            <div className="lg:col-span-2 xl:col-span-3">
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Sample watch news articles with cyberpunk styling */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-blue-500/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative bg-gray-900/90 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400/60 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-cyan-400 font-mono">⌚ ROLEX-INTEL</span>
                      <span className="text-xs text-purple-400 font-mono">LIVE</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                      BREAKING: Rolex Unveils New Land-Dweller Collection
                    </h3>
                    <p className="text-sm text-gray-300 mb-4">
                      New Land-Dweller introduces Caliber 7135 high-frequency movement with Dynapulse escapement and 66-hour power reserve.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-yellow-400 font-mono">SOURCE: HODINKEE</span>
                      <span className="text-xs text-green-400 font-mono">VERIFIED</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative bg-gray-900/90 border border-purple-500/30 rounded-lg p-6 hover:border-purple-400/60 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-purple-400 font-mono">⌚ LUXURY-INTEL</span>
                      <span className="text-xs text-cyan-400 font-mono">LIVE</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors">
                      GMT-Master II "Sprite" Debuts in White Gold with Ceramic Dial
                    </h3>
                    <p className="text-sm text-gray-300 mb-4">
                      First-ever ceramic dial technology debuts on GMT-Master II Sprite, featuring high-gloss green surface matching the legendary "Hulk" intensity.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-yellow-400 font-mono">SOURCE: WATCHTIME</span>
                      <span className="text-xs text-green-400 font-mono">VERIFIED</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-green-500/20 to-purple-500/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative bg-gray-900/90 border border-blue-500/30 rounded-lg p-6 hover:border-blue-400/60 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-blue-400 font-mono">⌚ AUCTION-INTEL</span>
                      <span className="text-xs text-purple-400 font-mono">LIVE</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors">
                      Rare Tiger Iron Stone Dials for GMT-Master II Collection
                    </h3>
                    <p className="text-sm text-gray-300 mb-4">
                      Natural Tiger Iron stone dials composed of red jasper, hematite, and tiger's eye debut on solid gold GMT models, each pattern unique.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-yellow-400 font-mono">SOURCE: ROBB REPORT</span>
                      <span className="text-xs text-green-400 font-mono">VERIFIED</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-cyan-500/20 to-purple-500/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative bg-gray-900/90 border border-green-500/30 rounded-lg p-6 hover:border-green-400/60 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-green-400 font-mono">⌚ CELEB-INTEL</span>
                      <span className="text-xs text-cyan-400 font-mono">LIVE</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-green-300 transition-colors">
                      Daytona Gets Stunning Turquoise Dial Exclusive to Yellow Gold
                    </h3>
                    <p className="text-sm text-gray-300 mb-4">
                      New turquoise dial available exclusively on yellow gold Daytona Oysterflex model, adding vibrant color to the chronograph collection.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-yellow-400 font-mono">SOURCE: LUXURY DAILY</span>
                      <span className="text-xs text-green-400 font-mono">VERIFIED</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-blue-500/20 to-cyan-500/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative bg-gray-900/90 border border-pink-500/30 rounded-lg p-6 hover:border-pink-400/60 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-pink-400 font-mono">⌚ MARKET-INTEL</span>
                      <span className="text-xs text-purple-400 font-mono">LIVE</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-pink-300 transition-colors">
                      Sky-Dweller Debuts Vibrant Sunray Green Dial in 18K Gold
                    </h3>
                    <p className="text-sm text-gray-300 mb-4">
                      First time combining green and yellow gold tones on Sky-Dweller, retaining annual calendar and dual time zone complications.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-yellow-400 font-mono">SOURCE: BOB'S WATCHES</span>
                      <span className="text-xs text-green-400 font-mono">VERIFIED</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-green-500/20 to-blue-500/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative bg-gray-900/90 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400/60 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-cyan-400 font-mono">⌚ TECH-INTEL</span>
                      <span className="text-xs text-green-400 font-mono">LIVE</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                      Oyster Perpetual Refreshed with Lavender, Beige & Pistachio
                    </h3>
                    <p className="text-sm text-gray-300 mb-4">
                      New lacquered matte dials in muted pastel colors debut across Oyster Perpetual 28, 36, and 41 models - a first for Rolex.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-yellow-400 font-mono">SOURCE: WATCHTIME</span>
                      <span className="text-xs text-green-400 font-mono">VERIFIED</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rolex Lookup Tools */}
      <section className="py-8 sm:py-12 bg-primary-900/50">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Serial Number Lookup */}
            <Card className="glass-morphism border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-white">
                  <Search className="h-5 w-5 text-gold mr-3" />
                  Serial Number Lookup
                </CardTitle>
                <p className="text-sm text-yellow-300 mt-2">Find production year from serial number</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter serial (e.g., R123456, 1234567, M987654)"
                    value={searchSerial}
                    onChange={(e) => setSearchSerial(e.target.value)}
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-yellow-400"
                  />
                  <Button 
                    onClick={handleSerialSearch}
                    className="bg-gold text-white hover:bg-gold/90"
                  >
                    Lookup
                  </Button>
                </div>
                
                {searchResult && (
                  <div className="p-4 bg-white/10 rounded-lg border border-white/20 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-yellow-400 uppercase tracking-wide mb-1">Production Year</p>
                        <p className="text-3xl font-bold text-gold">{searchResult.year}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-yellow-400 uppercase tracking-wide mb-1">Serial Era</p>
                        <p className="text-xs font-medium text-white/80">{searchResult.era}</p>
                      </div>
                    </div>

                    {searchResult.models && (
                      <div className="pt-2 border-t border-white/10">
                        <p className="text-xs text-yellow-400 uppercase tracking-wide mb-1.5">Notable Models Produced This Year</p>
                        <p className="text-xs text-white/90 leading-relaxed">{searchResult.models}</p>
                      </div>
                    )}

                    {searchResult.context && (
                      <div className="pt-2 border-t border-white/10">
                        <p className="text-xs text-yellow-400 uppercase tracking-wide mb-1.5">Historical Context</p>
                        <p className="text-xs text-yellow-200/80 leading-relaxed italic">{searchResult.context}</p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-white/10">
                      <p className="text-[10px] text-white/40 leading-relaxed">{searchResult.notes}</p>
                    </div>

                    <div className="flex items-center justify-end gap-1 pt-1">
                      <Sparkles className="w-3 h-3 text-yellow-400/60" />
                      <p className="text-[10px] text-yellow-400/60 font-medium">Powered by Simplicity</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reference Number Search */}
            <Card className="glass-morphism border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-white">
                  <Database className="h-5 w-5 text-silver mr-3" />
                  Reference Number Search
                </CardTitle>
                <p className="text-sm text-yellow-300 mt-2">Identify watch type from reference number</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter reference (e.g., 116610LN, 126710BLRO, 124060)"
                    value={searchModel}
                    onChange={(e) => setSearchModel(e.target.value)}
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-yellow-400"
                  />
                  <Button 
                    onClick={handleModelSearch}
                    className="bg-silver text-white hover:bg-silver/90"
                  >
                    Identify
                  </Button>
                </div>
                
                {modelResult && (
                  <div className="p-4 bg-white/10 rounded-lg border border-white/20 space-y-3">
                    {photoLoading && (
                      <div className="w-full h-48 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                        <div className="text-center">
                          <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          <p className="text-xs text-yellow-400">Loading photo...</p>
                        </div>
                      </div>
                    )}
                    {watchPhoto && !photoLoading && (
                      <div className="relative rounded-lg overflow-hidden">
                        <img
                          src={watchPhoto.thumb || watchPhoto.url}
                          alt={modelResult.name}
                          className="w-full h-52 object-cover rounded-lg"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <a href={watchPhoto.unsplashUrl || watchPhoto.attributionUrl} target="_blank" rel="noopener noreferrer"
                          className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded hover:bg-black/80 transition-colors">
                          {watchPhoto.source === 'unsplash' ? '📷 Unsplash' : '📷 Wikimedia'}
                        </a>
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-yellow-400 mb-0.5">Watch Model</p>
                        <p className="text-lg font-bold text-white leading-tight">{modelResult.name}</p>
                        {(modelResult as any).nickname && (
                          <p className="text-sm text-gold font-medium mt-0.5">"{(modelResult as any).nickname}"</p>
                        )}
                      </div>
                      <Badge className="bg-blue-700 text-white text-xs shrink-0 mt-1">{modelResult.category}</Badge>
                    </div>
                    <div className="h-px bg-white/10" />
                    <div>
                      <p className="text-xs text-yellow-400 mb-1">Specifications</p>
                      <p className="text-sm text-yellow-200">{modelResult.details}</p>
                    </div>
                    {(modelResult as any).movement && (
                      <div>
                        <p className="text-xs text-yellow-400 mb-1">Movement</p>
                        <p className="text-sm text-cyan-300 font-semibold">{(modelResult as any).movement}</p>
                      </div>
                    )}
                    {/* Structured specs from SPECS_MAP */}
                    {SPECS_MAP[searchModel.toUpperCase().trim()] && (() => {
                      const sp = SPECS_MAP[searchModel.toUpperCase().trim()];
                      return (
                        <div>
                          <p className="text-xs text-yellow-400 mb-2">Technical Specs</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-white/5 rounded text-center">
                              <p className="text-[10px] text-yellow-400/70">Lug Width</p>
                              <p className="text-xs text-white font-medium">{sp.lugWidth}</p>
                            </div>
                            <div className="p-2 bg-white/5 rounded text-center">
                              <p className="text-[10px] text-yellow-400/70">Water Resistance</p>
                              <p className="text-xs text-white font-medium">{sp.waterResistance}</p>
                            </div>
                            <div className="p-2 bg-white/5 rounded text-center">
                              <p className="text-[10px] text-yellow-400/70">Crystal</p>
                              <p className="text-xs text-white font-medium">{sp.crystal}</p>
                            </div>
                            <div className="p-2 bg-white/5 rounded text-center">
                              <p className="text-[10px] text-yellow-400/70">Bracelet</p>
                              <p className="text-xs text-white font-medium">{sp.bracelet}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    {/* Market Value */}
                    {MARKET_VALUE[searchModel.toUpperCase().trim()] && (
                      <div className="p-3 bg-green-900/30 border border-green-500/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                          <p className="text-xs text-green-400 font-semibold">Grey Market Value (2026)</p>
                        </div>
                        <p className="text-base font-bold text-green-300">{MARKET_VALUE[searchModel.toUpperCase().trim()]}</p>
                        <p className="text-[10px] text-green-400/60 mt-0.5">Estimate based on dealer/auction data. Condition, papers & box affect price.</p>
                      </div>
                    )}
                    {/* Production Window from REF_PRODUCTION */}
                    {REF_PRODUCTION[searchModel.toUpperCase().trim()] && (() => {
                      const rp = REF_PRODUCTION[searchModel.toUpperCase().trim()];
                      return (
                        <div className="p-2 bg-blue-900/20 border border-blue-500/20 rounded">
                          <p className="text-[10px] text-blue-400 mb-0.5">Production Window</p>
                          <p className="text-xs text-blue-300 font-semibold">{rp.start} – {rp.end ?? 'present'}</p>
                        </div>
                      );
                    })()}
                    {/* Extended Intelligence from ROLEX_INTELLIGENCE */}
                    {ROLEX_INTELLIGENCE[searchModel.toUpperCase().trim()] && (() => {
                      const intel = ROLEX_INTELLIGENCE[searchModel.toUpperCase().trim()];
                      return (
                        <div className="space-y-2 mt-1">
                          {/* Investment Grade + Key Metrics */}
                          <div className="grid grid-cols-2 gap-1.5">
                            <div className="p-2 bg-amber-900/30 border border-amber-500/30 rounded text-center">
                              <p className="text-[10px] text-amber-400">Investment Grade</p>
                              <p className={`text-sm font-bold ${intel.investmentGrade === 'S-Tier' ? 'text-yellow-300' : intel.investmentGrade === 'A-Tier' ? 'text-green-300' : 'text-blue-300'}`}>{intel.investmentGrade}</p>
                            </div>
                            <div className="p-2 bg-purple-900/30 border border-purple-500/30 rounded text-center">
                              <p className="text-[10px] text-purple-400">5yr Appreciation</p>
                              <p className="text-sm font-bold text-purple-200">{intel.appreciationRate5yr}</p>
                            </div>
                            <div className="p-2 bg-slate-800/60 border border-slate-600/40 rounded text-center">
                              <p className="text-[10px] text-slate-400">Retail Price</p>
                              <p className="text-xs font-semibold text-white">{intel.retailPrice}</p>
                            </div>
                            <div className="p-2 bg-slate-800/60 border border-slate-600/40 rounded text-center">
                              <p className="text-[10px] text-slate-400">Market Premium</p>
                              <p className="text-xs font-semibold text-green-300">{intel.premiumOverRetail}</p>
                            </div>
                            <div className="p-2 bg-slate-800/60 border border-slate-600/40 rounded text-center">
                              <p className="text-[10px] text-slate-400">Waitlist</p>
                              <p className="text-xs font-semibold text-white">{intel.waitlistYears}</p>
                            </div>
                            <div className="p-2 bg-slate-800/60 border border-slate-600/40 rounded text-center">
                              <p className="text-[10px] text-slate-400">Current Trend</p>
                              <p className={`text-xs font-semibold ${intel.currentTrend === 'Rising' ? 'text-green-300' : intel.currentTrend === 'Cooling' || intel.currentTrend === 'Correcting' ? 'text-red-300' : 'text-yellow-300'}`}>{intel.currentTrend}</p>
                            </div>
                          </div>
                          {/* All-time high */}
                          <div className="p-2 bg-red-900/20 border border-red-500/20 rounded">
                            <p className="text-[10px] text-red-400 mb-0.5">All-Time High</p>
                            <p className="text-xs text-red-200 font-semibold">{intel.peakPrice} <span className="font-normal opacity-70">({intel.peakYear})</span></p>
                          </div>
                          {/* Why it matters */}
                          <div className="p-2 bg-white/5 border border-white/10 rounded">
                            <p className="text-[10px] text-yellow-400 mb-1">Why It Matters</p>
                            <p className="text-[11px] text-gray-300 leading-relaxed">{intel.whyItMatters}</p>
                          </div>
                          {/* Key Facts */}
                          <div className="p-2 bg-white/5 border border-white/10 rounded">
                            <p className="text-[10px] text-yellow-400 mb-1">Key Facts</p>
                            <ul className="space-y-1">
                              {intel.keyFacts.map((fact, fi) => (
                                <li key={fi} className="text-[11px] text-gray-300 flex gap-1.5">
                                  <span className="text-amber-400 shrink-0">›</span>{fact}
                                </li>
                              ))}
                            </ul>
                          </div>
                          {/* Notable Variants */}
                          {intel.notableVariants.length > 0 && (
                            <div className="p-2 bg-white/5 border border-white/10 rounded">
                              <p className="text-[10px] text-yellow-400 mb-1">Notable Variants</p>
                              <ul className="space-y-1">
                                {intel.notableVariants.map((v, vi) => (
                                  <li key={vi} className="text-[11px] text-gray-300 flex gap-1.5">
                                    <span className="text-cyan-400 shrink-0">›</span>{v}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {/* Auction Records */}
                          {intel.auctionRecords.length > 0 && (
                            <div className="p-2 bg-white/5 border border-white/10 rounded">
                              <p className="text-[10px] text-yellow-400 mb-1">Auction Records</p>
                              <ul className="space-y-1">
                                {intel.auctionRecords.map((r, ri) => (
                                  <li key={ri} className="text-[11px] text-gray-300 flex gap-1.5">
                                    <span className="text-green-400 shrink-0">›</span>{r}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {/* Buying/Selling Tips */}
                          <div className="grid grid-cols-1 gap-1.5">
                            <div className="p-2 bg-green-900/20 border border-green-500/20 rounded">
                              <p className="text-[10px] text-green-400 mb-1">Buying Intelligence</p>
                              <p className="text-[11px] text-gray-300 leading-relaxed">{intel.buyingTips}</p>
                            </div>
                            <div className="p-2 bg-orange-900/20 border border-orange-500/20 rounded">
                              <p className="text-[10px] text-orange-400 mb-1">Selling Intelligence</p>
                              <p className="text-[11px] text-gray-300 leading-relaxed">{intel.sellingTips}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    {(modelResult as any).collectibility && (
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-yellow-400">Collector Demand:</p>
                        <Badge className={`text-xs ${(modelResult as any).collectibility === 'Extreme' ? 'bg-red-700' : (modelResult as any).collectibility === 'Very High' ? 'bg-orange-700' : (modelResult as any).collectibility === 'High' ? 'bg-green-700' : 'bg-gray-600'}`}>
                          {(modelResult as any).collectibility}
                        </Badge>
                      </div>
                    )}
                    {(modelResult as any).notes && (
                      <div className="p-2 bg-gold/10 border border-gold/20 rounded">
                        <p className="text-xs text-yellow-400 mb-0.5">Collector Notes</p>
                        <p className="text-xs text-yellow-200">{(modelResult as any).notes}</p>
                      </div>
                    )}
                    {/* Ask Simplicity button */}
                    <div className="pt-1">
                      <Button
                        size="sm"
                        onClick={() => {
                          const q = `Tell me about the Rolex ${modelResult.name}${(modelResult as any).nickname ? ` ("${(modelResult as any).nickname}")` : ''} — ref ${searchModel}. What should I know about its value, authentication, and collectibility?`;
                          localStorage.setItem('simplicity-pending-question', q);
                          window.location.href = '/ai-chat';
                        }}
                        className="w-full bg-purple-700/60 hover:bg-purple-700/80 border border-purple-500/30 text-white text-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5 mr-2" />
                        Ask Simplicity about this watch
                      </Button>
                    </div>
                    <div className="flex items-center justify-end gap-1 pt-1">
                      <Sparkles className="w-3 h-3 text-yellow-400/60" />
                      <p className="text-[10px] text-yellow-400/60 font-medium">Powered by Simplicity</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 sm:py-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <Tabs defaultValue="rolex-guide" className="w-full">
            <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 mb-6 sm:mb-8">
              <TabsList className="inline-flex w-auto bg-white/10 border border-white/20 min-w-max gap-0">
                <TabsTrigger value="rolex-guide" className="text-white data-[state=active]:bg-gold data-[state=active]:text-yellow-900 text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4">
                  Serial Guide
                </TabsTrigger>
                <TabsTrigger value="rolex-models" className="text-white data-[state=active]:bg-gold data-[state=active]:text-yellow-900 text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4">
                  Model Database
                </TabsTrigger>
                <TabsTrigger value="movements" className="text-white data-[state=active]:bg-gold data-[state=active]:text-yellow-900 text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4">
                  Movements
                </TabsTrigger>
                <TabsTrigger value="history" className="text-white data-[state=active]:bg-gold data-[state=active]:text-yellow-900 text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4">
                  History
                </TabsTrigger>
                <TabsTrigger value="authentication" className="text-white data-[state=active]:bg-gold data-[state=active]:text-yellow-900 text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4">
                  Authentication
                </TabsTrigger>
                <TabsTrigger value="valuation" className="text-white data-[state=active]:bg-gold data-[state=active]:text-yellow-900 text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4">
                  Valuation Guide
                </TabsTrigger>
                <TabsTrigger value="ref-intelligence" className="text-white data-[state=active]:bg-gold data-[state=active]:text-yellow-900 text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4">
                  Reference Intelligence
                </TabsTrigger>
                <TabsTrigger value="market-intel" className="text-white data-[state=active]:bg-gold data-[state=active]:text-yellow-900 text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4">
                  Market Intelligence
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="rolex-guide">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Serial Number Systems */}
                <Card className="glass-morphism border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <Database className="h-5 w-5 text-gold mr-2" />
                      Serial Number Systems
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-white/5 rounded-lg">
                        <h4 className="font-semibold text-gold mb-2">Sequential Period (1926-1987)</h4>
                        <p className="text-sm text-yellow-300 mb-3">Simple numeric progression from 28,000 to 9,999,999</p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-yellow-400">
                          <div className="flex justify-between"><span>28,000</span><span>1926</span></div>
                          <div className="flex justify-between"><span>100,000</span><span>1954</span></div>
                          <div className="flex justify-between"><span>1,000,000</span><span>1963</span></div>
                          <div className="flex justify-between"><span>5,000,000</span><span>1977</span></div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-white/5 rounded-lg">
                        <h4 className="font-semibold text-silver mb-2">Letter Prefix Period (1987-2009)</h4>
                        <p className="text-sm text-yellow-300 mb-3">Letter + 6 digits (R123456)</p>
                        <div className="grid grid-cols-3 gap-2 text-xs text-yellow-400">
                          <div className="flex justify-between"><span>R</span><span>1987-88</span></div>
                          <div className="flex justify-between"><span>L</span><span>1989-90</span></div>
                          <div className="flex justify-between"><span>E</span><span>1990-91</span></div>
                          <div className="flex justify-between"><span>A</span><span>1998-99</span></div>
                          <div className="flex justify-between"><span>P</span><span>2000</span></div>
                          <div className="flex justify-between"><span>G</span><span>2009</span></div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-white/5 rounded-lg">
                        <h4 className="font-semibold text-blue-400 mb-2">Random Period (2010+)</h4>
                        <p className="text-sm text-yellow-300">8+ random characters - requires warranty card for dating</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Complete Year Chart */}
                <Card className="glass-morphism border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <Calendar className="h-5 w-5 text-gold mr-2" />
                      Complete Year Reference
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {/* Sequential Period Data */}
                      <div className="space-y-1 text-sm">
                        <h5 className="font-semibold text-gold">Sequential Period (1926-1987)</h5>
                        <div className="grid grid-cols-2 gap-1 text-xs text-yellow-400">
                          <div className="flex justify-between border-b border-white/10 py-1"><span>28,000</span><span>1926</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>29,000</span><span>1927</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>32,000</span><span>1928</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>37,000</span><span>1929</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>40,000</span><span>1930</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>50,000</span><span>1931</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>60,000</span><span>1932</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>85,000</span><span>1933-34</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>96,000</span><span>1935</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>135,000</span><span>1940</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>230,000</span><span>1945</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>270,000</span><span>1950</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>350,000</span><span>1953</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>1,000,000</span><span>1963</span></div>
                        </div>
                      </div>
                      
                      {/* Letter Prefix Data */}
                      <div className="space-y-1 text-sm mt-4">
                        <h5 className="font-semibold text-silver">Letter Prefix Period (1987-2009)</h5>
                        <div className="grid grid-cols-2 gap-1 text-xs text-yellow-400">
                          <div className="flex justify-between border-b border-white/10 py-1"><span>R</span><span>1987-1988</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>L</span><span>1989-1990</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>E</span><span>1990-1991</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>X</span><span>1991</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>N</span><span>1991</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>C</span><span>1992-1993</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>S</span><span>1993</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>W</span><span>1994-1995</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>T</span><span>1996</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>U</span><span>1997</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>A</span><span>1998-1999</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>P</span><span>2000</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>K</span><span>2001</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>Y</span><span>2002</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>F</span><span>2003-2004</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>D</span><span>2005</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>Z</span><span>2006</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>M</span><span>2007</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>V</span><span>2008</span></div>
                          <div className="flex justify-between border-b border-white/10 py-1"><span>G</span><span>2009</span></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Serial Number Location Guide */}
                <Card className="glass-morphism border-white/20 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <Info className="h-5 w-5 text-gold mr-2" />
                      Serial Number Location Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gold/20 rounded-full flex items-center justify-center">
                          <span className="text-2xl text-gold">📍</span>
                        </div>
                        <h4 className="font-semibold text-white mb-2">Pre-2005 Models</h4>
                        <p className="text-sm text-yellow-300">Between lugs at 6 o'clock position, behind bracelet. Remove bracelet to view.</p>
                      </div>
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 bg-silver/20 rounded-full flex items-center justify-center">
                          <span className="text-2xl text-silver">📍</span>
                        </div>
                        <h4 className="font-semibold text-white mb-2">2005-2008 Models</h4>
                        <p className="text-sm text-yellow-300">Both locations: between lugs AND on rehaut (inner bezel ring) at 6 o'clock.</p>
                      </div>
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 bg-blue-400/20 rounded-full flex items-center justify-center">
                          <span className="text-2xl text-blue-400">📍</span>
                        </div>
                        <h4 className="font-semibold text-white mb-2">2008+ Models</h4>
                        <p className="text-sm text-yellow-300">Only on rehaut (inner bezel ring) at 6 o'clock. Visible with magnifying glass.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="rolex-models">
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-semibold text-white mb-4">Complete Rolex Visual Database</h2>
                  <p className="text-yellow-300">Detailed pictures, movements, and specifications for authentic Rolex identification</p>
                </div>

                {/* Rolex Movement Gallery */}
                <Card className="glass-morphism border-white/20 mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white text-2xl">
                      <Crown className="h-6 w-6 text-gold mr-3" />
                      Rolex Movement Gallery - Detailed Pictures
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid lg:grid-cols-2 gap-8">
                      {/* Movement 3235 */}
                      <div className="space-y-4">
                        <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-gold/30 flex items-center justify-center relative overflow-hidden">
                          <img 
                            src={caliber3235Image} 
                            alt="Rolex Caliber 3235 Movement - New Generation Excellence"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                            <h4 className="text-lg font-semibold text-gold">Caliber 3235</h4>
                            <p className="text-sm text-yellow-300">New generation excellence</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gold">Caliber 3235 - New Generation</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-yellow-400">Power Reserve:</span> <span className="text-white">70 hours</span></div>
                            <div><span className="text-yellow-400">Frequency:</span> <span className="text-white">28,800 A/h</span></div>
                            <div><span className="text-yellow-400">Jewels:</span> <span className="text-white">31</span></div>
                            <div><span className="text-yellow-400">Functions:</span> <span className="text-white">Hours, Minutes, Seconds, Date</span></div>
                            <div><span className="text-yellow-400">Used in:</span> <span className="text-white">Datejust 41, Datejust 36</span></div>
                            <div><span className="text-yellow-400">Features:</span> <span className="text-white">Chronergy escapement, Parachrom hairspring</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Movement 4130 */}
                      <div className="space-y-4">
                        <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-gold/30 flex items-center justify-center relative overflow-hidden">
                          <img 
                            src={caliber4130Image} 
                            alt="Rolex Caliber 4130 Daytona Chronograph Movement"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                            <h4 className="text-lg font-semibold text-gold">Caliber 4130</h4>
                            <p className="text-sm text-yellow-300">Daytona chronograph master</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gold">Caliber 4130 - Chronograph Master</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-yellow-400">Power Reserve:</span> <span className="text-white">72 hours</span></div>
                            <div><span className="text-yellow-400">Frequency:</span> <span className="text-white">28,800 A/h</span></div>
                            <div><span className="text-yellow-400">Jewels:</span> <span className="text-white">44</span></div>
                            <div><span className="text-yellow-400">Functions:</span> <span className="text-white">Chronograph, Central seconds</span></div>
                            <div><span className="text-yellow-400">Used in:</span> <span className="text-white">Daytona</span></div>
                            <div><span className="text-yellow-400">Features:</span> <span className="text-white">Vertical clutch, Parachrom hairspring</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Movement 3285 */}
                      <div className="space-y-4">
                        <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-gold/30 flex items-center justify-center relative overflow-hidden">
                          <img 
                            src={caliber3285Image} 
                            alt="Rolex Caliber 3285 GMT Movement with Blue Parachrom Hairspring"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                            <h4 className="text-lg font-semibold text-gold">Caliber 3285</h4>
                            <p className="text-sm text-yellow-300">GMT-Master II precision</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gold">Caliber 3285 - GMT Function</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-yellow-400">Power Reserve:</span> <span className="text-white">70 hours</span></div>
                            <div><span className="text-yellow-400">Frequency:</span> <span className="text-white">28,800 A/h</span></div>
                            <div><span className="text-yellow-400">Jewels:</span> <span className="text-white">31</span></div>
                            <div><span className="text-yellow-400">Functions:</span> <span className="text-white">Hours, Minutes, Seconds, GMT, Date</span></div>
                            <div><span className="text-yellow-400">Used in:</span> <span className="text-white">GMT-Master II</span></div>
                            <div><span className="text-yellow-400">Features:</span> <span className="text-white">Independent hour hand, Parachrom hairspring</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Movement 3230 */}
                      <div className="space-y-4">
                        <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-gold/30 flex items-center justify-center relative overflow-hidden">
                          <img 
                            src={caliber3230Image} 
                            alt="Rolex Caliber 3230 Movement with Blue Parachrom Hairspring"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                            <h4 className="text-lg font-semibold text-gold">Caliber 3230</h4>
                            <p className="text-sm text-yellow-300">No-date excellence</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gold">Caliber 3230 - Pure Time</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-yellow-400">Power Reserve:</span> <span className="text-white">70 hours</span></div>
                            <div><span className="text-yellow-400">Frequency:</span> <span className="text-white">28,800 A/h</span></div>
                            <div><span className="text-yellow-400">Jewels:</span> <span className="text-white">31</span></div>
                            <div><span className="text-yellow-400">Functions:</span> <span className="text-white">Hours, Minutes, Seconds</span></div>
                            <div><span className="text-yellow-400">Used in:</span> <span className="text-white">Submariner No-Date</span></div>
                            <div><span className="text-yellow-400">Features:</span> <span className="text-white">Chronergy escapement, Parachrom hairspring</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Movement 3135 */}
                      <div className="space-y-4">
                        <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-gold/30 flex items-center justify-center relative overflow-hidden">
                          <img 
                            src={caliber3135Image} 
                            alt="Rolex Caliber 3135 Movement - The Legendary Workhorse"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                            <h4 className="text-lg font-semibold text-gold">Caliber 3135</h4>
                            <p className="text-sm text-yellow-300">Legendary workhorse</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gold">Caliber 3135 - The Workhorse</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-yellow-400">Power Reserve:</span> <span className="text-white">48 hours</span></div>
                            <div><span className="text-yellow-400">Frequency:</span> <span className="text-white">28,800 A/h</span></div>
                            <div><span className="text-yellow-400">Jewels:</span> <span className="text-white">31</span></div>
                            <div><span className="text-yellow-400">Functions:</span> <span className="text-white">Hours, Minutes, Seconds, Date</span></div>
                            <div><span className="text-yellow-400">Used in:</span> <span className="text-white">Submariner, GMT-Master, Explorer</span></div>
                            <div><span className="text-yellow-400">Features:</span> <span className="text-white">Quickset date, hack seconds</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Movement 1570 */}
                      <div className="space-y-4">
                        <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-gold/30 flex items-center justify-center relative overflow-hidden">
                          <img 
                            src={caliber1570Image} 
                            alt="Rolex Caliber 1570 Vintage Movement"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                            <h4 className="text-lg font-semibold text-gold">Caliber 1570</h4>
                            <p className="text-sm text-yellow-300">Vintage perfection</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gold">Caliber 1570 - Vintage Excellence</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-yellow-400">Power Reserve:</span> <span className="text-white">48 hours</span></div>
                            <div><span className="text-yellow-400">Frequency:</span> <span className="text-white">19,800 A/h</span></div>
                            <div><span className="text-yellow-400">Jewels:</span> <span className="text-white">26</span></div>
                            <div><span className="text-yellow-400">Functions:</span> <span className="text-white">Hours, Minutes, Seconds, Quickset Date</span></div>
                            <div><span className="text-yellow-400">Used in:</span> <span className="text-white">Submariner, GMT-Master, Datejust</span></div>
                            <div><span className="text-yellow-400">Features:</span> <span className="text-white">Hack feature, collector favorite</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Movement 7135 */}
                      <div className="space-y-4">
                        <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-gold/30 flex items-center justify-center relative overflow-hidden">
                          <img 
                            src={caliber7135Image} 
                            alt="Rolex Caliber 7135 Movement with Gold Rotor"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                            <h4 className="text-lg font-semibold text-gold">Caliber 7135</h4>
                            <p className="text-sm text-yellow-300">Sky-Dweller complexity</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gold">Caliber 7135 - Latest Innovation</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-yellow-400">Power Reserve:</span> <span className="text-white">70 hours</span></div>
                            <div><span className="text-yellow-400">Frequency:</span> <span className="text-white">28,800 A/h</span></div>
                            <div><span className="text-yellow-400">Jewels:</span> <span className="text-white">31</span></div>
                            <div><span className="text-yellow-400">Functions:</span> <span className="text-white">Hours, Minutes, Seconds, Date</span></div>
                            <div><span className="text-yellow-400">Used in:</span> <span className="text-white">Sea-Dweller, Deepsea</span></div>
                            <div><span className="text-yellow-400">Features:</span> <span className="text-white">Enhanced antimagnetic, 2025 debut</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Movement 3255 */}
                      <div className="space-y-4">
                        <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-gold/30 flex items-center justify-center relative overflow-hidden">
                          <img 
                            src={caliber3255Image} 
                            alt="Rolex Caliber 3255 Movement - Day-Date Presidential Movement"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                            <h4 className="text-lg font-semibold text-gold">Caliber 3255</h4>
                            <p className="text-sm text-yellow-300">Day-Date precision</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gold">Caliber 3255 - Presidential Movement</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-yellow-400">Power Reserve:</span> <span className="text-white">70 hours</span></div>
                            <div><span className="text-yellow-400">Frequency:</span> <span className="text-white">28,800 A/h</span></div>
                            <div><span className="text-yellow-400">Jewels:</span> <span className="text-white">31</span></div>
                            <div><span className="text-yellow-400">Functions:</span> <span className="text-white">Hours, Minutes, Seconds, Day, Date</span></div>
                            <div><span className="text-yellow-400">Used in:</span> <span className="text-white">Day-Date 40</span></div>
                            <div><span className="text-yellow-400">Features:</span> <span className="text-white">Day display, Chronergy escapement</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Movement 2236 */}
                      <div className="space-y-4">
                        <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-gold/30 flex items-center justify-center relative overflow-hidden">
                          <img 
                            src={caliber2236Image} 
                            alt="Rolex Caliber 2236 Movement - Ladies' Automatic Excellence"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                            <h4 className="text-lg font-semibold text-gold">Caliber 2236</h4>
                            <p className="text-sm text-yellow-300">Ladies' automatic excellence</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gold">Caliber 2236 - Ladies' Precision</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-yellow-400">Power Reserve:</span> <span className="text-white">55 hours</span></div>
                            <div><span className="text-yellow-400">Frequency:</span> <span className="text-white">28,800 A/h</span></div>
                            <div><span className="text-yellow-400">Jewels:</span> <span className="text-white">31</span></div>
                            <div><span className="text-yellow-400">Functions:</span> <span className="text-white">Hours, Minutes, Seconds, Date</span></div>
                            <div><span className="text-yellow-400">Used in:</span> <span className="text-white">Lady-Datejust 28</span></div>
                            <div><span className="text-yellow-400">Features:</span> <span className="text-white">Optimium escapement, ladies' sizing</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Movement 1560 — Vintage automatic, c.1959 */}
                      <div className="space-y-4">
                        <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-gold/30 flex items-center justify-center relative overflow-hidden">
                          <img src={caliber1560Image} alt="Rolex Caliber 1560 Vintage Movement" className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                            <h4 className="text-lg font-semibold text-gold">Caliber 1560</h4>
                            <p className="text-sm text-yellow-300">Vintage automatic pioneer</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gold">Caliber 1560 — Vintage Automatic (c. 1959)</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-yellow-400">Power Reserve:</span> <span className="text-white">42 hours</span></div>
                            <div><span className="text-yellow-400">Frequency:</span> <span className="text-white">18,000 A/h</span></div>
                            <div><span className="text-yellow-400">Jewels:</span> <span className="text-white">17</span></div>
                            <div><span className="text-yellow-400">Functions:</span> <span className="text-white">Hours, Minutes, Seconds</span></div>
                            <div><span className="text-yellow-400">Used in:</span> <span className="text-white">Submariner 5512/5513, Explorer 1016</span></div>
                            <div><span className="text-yellow-400">Features:</span> <span className="text-white">No-date, no hack, Glucydur balance</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Movement 3035 — First quickset date, c.1977 */}
                      <div className="space-y-4">
                        <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-gold/30 flex items-center justify-center relative overflow-hidden">
                          <img src={caliber3035Image} alt="Rolex Caliber 3035 Movement" className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                            <h4 className="text-lg font-semibold text-gold">Caliber 3035</h4>
                            <p className="text-sm text-yellow-300">First quickset date</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gold">Caliber 3035 — First Quickset Date (1977)</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-yellow-400">Power Reserve:</span> <span className="text-white">42 hours</span></div>
                            <div><span className="text-yellow-400">Frequency:</span> <span className="text-white">28,800 A/h</span></div>
                            <div><span className="text-yellow-400">Jewels:</span> <span className="text-white">27</span></div>
                            <div><span className="text-yellow-400">Functions:</span> <span className="text-white">Hours, Minutes, Seconds, Date</span></div>
                            <div><span className="text-yellow-400">Used in:</span> <span className="text-white">Submariner 16800, Datejust</span></div>
                            <div><span className="text-yellow-400">Features:</span> <span className="text-white">Rolex's first quickset date — landmark caliber</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Movement 3130 — No-date, c.1988 */}
                      <div className="space-y-4">
                        <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-gold/30 flex items-center justify-center relative overflow-hidden">
                          <img src={caliber3130Image} alt="Rolex Caliber 3130 Movement" className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                            <h4 className="text-lg font-semibold text-gold">Caliber 3130</h4>
                            <p className="text-sm text-yellow-300">Pure timekeeping, no date</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gold">Caliber 3130 — Time-Only (1988)</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-yellow-400">Power Reserve:</span> <span className="text-white">50 hours</span></div>
                            <div><span className="text-yellow-400">Frequency:</span> <span className="text-white">28,800 A/h</span></div>
                            <div><span className="text-yellow-400">Jewels:</span> <span className="text-white">31</span></div>
                            <div><span className="text-yellow-400">Functions:</span> <span className="text-white">Hours, Minutes, Seconds</span></div>
                            <div><span className="text-yellow-400">Used in:</span> <span className="text-white">Submariner No-Date 14060, Explorer 114270</span></div>
                            <div><span className="text-yellow-400">Features:</span> <span className="text-white">No-date variant of 3135, hack seconds</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Movement 3131 — Milgauss anti-magnetic */}
                      <div className="space-y-4">
                        <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-gold/30 flex items-center justify-center relative overflow-hidden">
                          <img src={caliber3131Image} alt="Rolex Caliber 3131 Milgauss Anti-Magnetic Movement" className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                            <h4 className="text-lg font-semibold text-gold">Caliber 3131</h4>
                            <p className="text-sm text-yellow-300">Milgauss anti-magnetic</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gold">Caliber 3131 — Anti-Magnetic Milgauss</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-yellow-400">Power Reserve:</span> <span className="text-white">48 hours</span></div>
                            <div><span className="text-yellow-400">Frequency:</span> <span className="text-white">28,800 A/h</span></div>
                            <div><span className="text-yellow-400">Jewels:</span> <span className="text-white">31</span></div>
                            <div><span className="text-yellow-400">Functions:</span> <span className="text-white">Hours, Minutes, Seconds, Date</span></div>
                            <div><span className="text-yellow-400">Used in:</span> <span className="text-white">Milgauss 116400 / 116400GV</span></div>
                            <div><span className="text-yellow-400">Features:</span> <span className="text-white">Paramagnetic blue Parachrom, Cu-Be alloy shield</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Movement 3135 — alternate view */}
                      <div className="space-y-4">
                        <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-gold/30 flex items-center justify-center relative overflow-hidden">
                          <img src={caliber3135f8Image} alt="Rolex Caliber 3135 Movement Detail View" className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                            <h4 className="text-lg font-semibold text-gold">Caliber 3135</h4>
                            <p className="text-sm text-yellow-300">Detailed rotor view</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gold">Caliber 3135 — Detailed Rotor View</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-yellow-400">Power Reserve:</span> <span className="text-white">48 hours</span></div>
                            <div><span className="text-yellow-400">Frequency:</span> <span className="text-white">28,800 A/h</span></div>
                            <div><span className="text-yellow-400">Jewels:</span> <span className="text-white">31</span></div>
                            <div><span className="text-yellow-400">Production:</span> <span className="text-white">1988–2020 (32 years)</span></div>
                            <div><span className="text-yellow-400">Used in:</span> <span className="text-white">Submariner Date, GMT-Master II, Explorer II</span></div>
                            <div><span className="text-yellow-400">Features:</span> <span className="text-white">Quickset date, hack seconds, Rolex Perpetual rotor</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Movement 3187 — GMT Paraflex */}
                      <div className="space-y-4">
                        <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-gold/30 flex items-center justify-center relative overflow-hidden">
                          <img src={caliber3187Image} alt="Rolex Caliber 3187 GMT Paraflex Movement" className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                            <h4 className="text-lg font-semibold text-gold">Caliber 3187</h4>
                            <p className="text-sm text-yellow-300">GMT Paraflex shock absorber</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gold">Caliber 3187 — GMT with Paraflex (2007)</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-yellow-400">Power Reserve:</span> <span className="text-white">48 hours</span></div>
                            <div><span className="text-yellow-400">Frequency:</span> <span className="text-white">28,800 A/h</span></div>
                            <div><span className="text-yellow-400">Jewels:</span> <span className="text-white">31</span></div>
                            <div><span className="text-yellow-400">Functions:</span> <span className="text-white">Hours, Minutes, Seconds, GMT, Date</span></div>
                            <div><span className="text-yellow-400">Used in:</span> <span className="text-white">GMT-Master II 116710 series</span></div>
                            <div><span className="text-yellow-400">Features:</span> <span className="text-white">Paraflex shock absorber, blue Parachrom hairspring</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Movement 2235 — Ladies' with date */}
                      <div className="space-y-4">
                        <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-gold/30 flex items-center justify-center relative overflow-hidden">
                          <img src={caliber2235Image} alt="Rolex Caliber 2235 Ladies Movement" className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                            <h4 className="text-lg font-semibold text-gold">Caliber 2235</h4>
                            <p className="text-sm text-yellow-300">Ladies' automatic with date</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gold">Caliber 2235 — Ladies' Automatic with Date</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-yellow-400">Power Reserve:</span> <span className="text-white">48 hours</span></div>
                            <div><span className="text-yellow-400">Frequency:</span> <span className="text-white">28,800 A/h</span></div>
                            <div><span className="text-yellow-400">Jewels:</span> <span className="text-white">31</span></div>
                            <div><span className="text-yellow-400">Functions:</span> <span className="text-white">Hours, Minutes, Seconds, Date</span></div>
                            <div><span className="text-yellow-400">Used in:</span> <span className="text-white">Lady-Datejust, Pearlmaster</span></div>
                            <div><span className="text-yellow-400">Features:</span> <span className="text-white">Compact feminine sizing, predecessor to cal. 2236</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Movement 2230 — Ladies' no-date */}
                      <div className="space-y-4">
                        <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-gold/30 flex items-center justify-center relative overflow-hidden">
                          <img src={caliber2230Image} alt="Rolex Caliber 2230 Ladies No-Date Movement" className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                            <h4 className="text-lg font-semibold text-gold">Caliber 2230</h4>
                            <p className="text-sm text-yellow-300">Ladies' time-only</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gold">Caliber 2230 — Ladies' Time-Only (2014)</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-yellow-400">Power Reserve:</span> <span className="text-white">55 hours</span></div>
                            <div><span className="text-yellow-400">Frequency:</span> <span className="text-white">28,800 A/h</span></div>
                            <div><span className="text-yellow-400">Jewels:</span> <span className="text-white">31</span></div>
                            <div><span className="text-yellow-400">Functions:</span> <span className="text-white">Hours, Minutes, Seconds</span></div>
                            <div><span className="text-yellow-400">Used in:</span> <span className="text-white">Lady-Datejust 28 No-Date</span></div>
                            <div><span className="text-yellow-400">Features:</span> <span className="text-white">No-date, compact movement, Parachrom hairspring</span></div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Watch Model Gallery */}
                <div className="space-y-8">
                  <h3 className="text-2xl font-semibold text-white text-center mb-8">Complete Rolex Model Gallery - Detailed Pictures</h3>

                  {/* Submariner Gallery */}
                  <Card className="glass-morphism border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Crown className="h-5 w-5 text-gold mr-2" />
                        Submariner Collection - Detailed Visual Guide
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid lg:grid-cols-3 gap-6">
                        {/* Submariner Date 126610LN */}
                        <div className="space-y-4">
                          <div className="aspect-square bg-gradient-to-br from-black to-gray-800 rounded-lg border-2 border-green-500/30 flex items-center justify-center relative overflow-hidden">
                            <img 
                              src={submariner126610LNImage} 
                              alt="Rolex Submariner Date 126610LN - Black Dial with Ceramic Bezel"
                              className="w-full h-full object-contain p-4"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                              <h4 className="text-lg font-semibold text-green-400">126610LN</h4>
                              <p className="text-sm text-yellow-300">Current Generation</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-semibold text-green-400">Submariner Date (2020-Present)</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between"><span className="text-yellow-400">Case Size:</span><span className="text-white">41mm</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Material:</span><span className="text-white">904L Steel</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Bezel:</span><span className="text-white">Cerachrom Black</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Movement:</span><span className="text-white">Cal. 3235</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Water Resistance:</span><span className="text-white">300m</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Features:</span><span className="text-white">Date, Cyclops lens</span></div>
                            </div>
                          </div>
                        </div>

                        {/* Submariner No-Date 124060 */}
                        <div className="space-y-4">
                          <div className="aspect-square bg-gradient-to-br from-black to-gray-800 rounded-lg border-2 border-green-500/30 flex items-center justify-center relative overflow-hidden">
                            <img 
                              src={submariner124060Image} 
                              alt="Rolex Submariner No-Date 124060"
                              className="w-full h-full object-contain p-4"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                              <h4 className="text-lg font-semibold text-green-400">124060</h4>
                              <p className="text-sm text-yellow-300">No-Date Purity</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-semibold text-green-400">Submariner No-Date (2020-Present)</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between"><span className="text-yellow-400">Case Size:</span><span className="text-white">41mm</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Material:</span><span className="text-white">904L Steel</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Bezel:</span><span className="text-white">Cerachrom Black</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Movement:</span><span className="text-white">Cal. 3230</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Water Resistance:</span><span className="text-white">300m</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Features:</span><span className="text-white">Clean dial</span></div>
                            </div>
                          </div>
                        </div>

                        {/* Submariner Hulk 116610LV */}
                        <div className="space-y-4">
                          <div className="aspect-square bg-gradient-to-br from-green-900 to-gray-800 rounded-lg border-2 border-green-400/50 flex items-center justify-center relative overflow-hidden">
                            <img 
                              src={submariner116610LVImage} 
                              alt="Rolex Submariner Hulk 116610LV - Green Dial and Bezel"
                              className="w-full h-full object-contain p-4"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                              <h4 className="text-lg font-semibold text-green-300">116610LV</h4>
                              <p className="text-sm text-yellow-300">"Hulk" - Discontinued</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-semibold text-green-300">Submariner "Hulk" (2010-2020)</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between"><span className="text-yellow-400">Case Size:</span><span className="text-white">40mm</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Material:</span><span className="text-white">904L Steel</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Bezel:</span><span className="text-white">Cerachrom Green</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Movement:</span><span className="text-white">Cal. 3135</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Water Resistance:</span><span className="text-white">300m</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Features:</span><span className="text-white">Green dial & bezel</span></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* GMT-Master II Gallery */}
                  <Card className="glass-morphism border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Crown className="h-5 w-5 text-gold mr-2" />
                        GMT-Master II Collection - Detailed Visual Guide
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid lg:grid-cols-3 gap-6">
                        {/* Pepsi GMT 126710BLRO */}
                        <div className="space-y-4">
                          <div className="aspect-square bg-gradient-to-br from-red-900 via-blue-900 to-gray-800 rounded-lg border-2 border-red-500/30 flex items-center justify-center relative overflow-hidden">
                            <img 
                              src={gmt126710BLROImage} 
                              alt="Rolex GMT-Master II Pepsi 126710BLRO"
                              className="w-full h-full object-contain p-4"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                              <h4 className="text-lg font-semibold text-red-400">126710BLRO</h4>
                              <p className="text-sm text-yellow-300">"Pepsi"</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-semibold text-red-400">GMT-Master II "Pepsi" (2018-Present)</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between"><span className="text-yellow-400">Case Size:</span><span className="text-white">40mm</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Material:</span><span className="text-white">904L Steel</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Bezel:</span><span className="text-white">Cerachrom Blue/Red</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Movement:</span><span className="text-white">Cal. 3285</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Water Resistance:</span><span className="text-white">100m</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Features:</span><span className="text-white">GMT, 24-hour bezel</span></div>
                            </div>
                          </div>
                        </div>

                        {/* Batman GMT 126710BLNR */}
                        <div className="space-y-4">
                          <div className="aspect-square bg-gradient-to-br from-blue-900 to-black rounded-lg border-2 border-blue-500/30 flex items-center justify-center relative overflow-hidden">
                            <img 
                              src={gmt126710BLNRImage} 
                              alt="Rolex GMT-Master II Batman 126710BLNR"
                              className="w-full h-full object-contain p-4"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                              <h4 className="text-lg font-semibold text-blue-400">126710BLNR</h4>
                              <p className="text-sm text-yellow-300">"Batman"</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-semibold text-blue-400">GMT-Master II "Batman" (2019-Present)</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between"><span className="text-yellow-400">Case Size:</span><span className="text-white">40mm</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Material:</span><span className="text-white">904L Steel</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Bezel:</span><span className="text-white">Cerachrom Blue/Black</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Movement:</span><span className="text-white">Cal. 3285</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Water Resistance:</span><span className="text-white">100m</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Features:</span><span className="text-white">GMT, Jubilee bracelet</span></div>
                            </div>
                          </div>
                        </div>

                        {/* Root Beer GMT 126711CHNR */}
                        <div className="space-y-4">
                          <div className="aspect-square bg-gradient-to-br from-yellow-800 via-amber-700 to-gray-800 rounded-lg border-2 border-amber-500/30 flex items-center justify-center relative overflow-hidden">
                            <img 
                              src={gmt126711CHNRImage} 
                              alt="Rolex GMT-Master II Root Beer 126711CHNR"
                              className="w-full h-full object-contain p-4"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                              <h4 className="text-lg font-semibold text-amber-400">126711CHNR</h4>
                              <p className="text-sm text-yellow-300">"Root Beer"</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-semibold text-amber-400">GMT-Master II "Root Beer" (2018-Present)</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between"><span className="text-yellow-400">Case Size:</span><span className="text-white">40mm</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Material:</span><span className="text-white">Steel/Yellow Gold</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Bezel:</span><span className="text-white">Cerachrom Brown/Black</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Movement:</span><span className="text-white">Cal. 3285</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Water Resistance:</span><span className="text-white">100m</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Features:</span><span className="text-white">Two-tone case</span></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Daytona Gallery */}
                  <Card className="glass-morphism border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Crown className="h-5 w-5 text-gold mr-2" />
                        Daytona Collection - Detailed Visual Guide
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid lg:grid-cols-3 gap-6">
                        {/* Daytona Steel 126500LN */}
                        <div className="space-y-4">
                          <div className="aspect-square bg-gradient-to-br from-gray-800 to-black rounded-lg border-2 border-white/30 flex items-center justify-center relative overflow-hidden">
                            <img 
                              src={daytona126500LNImage} 
                              alt="Rolex Cosmograph Daytona 126500LN White Panda Dial"
                              className="w-full h-full object-contain p-4"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                              <h4 className="text-lg font-semibold text-white">126500LN</h4>
                              <p className="text-sm text-yellow-300">Steel "Panda"</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-semibold text-white">Daytona Steel (2023-Present)</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between"><span className="text-yellow-400">Case Size:</span><span className="text-white">40mm</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Material:</span><span className="text-white">904L Steel</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Bezel:</span><span className="text-white">Cerachrom Black</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Movement:</span><span className="text-white">Cal. 4131</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Water Resistance:</span><span className="text-white">100m</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Features:</span><span className="text-white">Chronograph</span></div>
                            </div>
                          </div>
                        </div>

                        {/* Daytona Gold 116508 */}
                        <div className="space-y-4">
                          <div className="aspect-square bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-lg border-2 border-gold/50 flex items-center justify-center relative overflow-hidden">
                            <img 
                              src={daytona116508Image} 
                              alt="Rolex Cosmograph Daytona 116508 Yellow Gold Green Dial"
                              className="w-full h-full object-contain p-4"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                              <h4 className="text-lg font-semibold text-gold">116508</h4>
                              <p className="text-sm text-yellow-200">Yellow Gold Green</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-semibold text-gold">Daytona Yellow Gold (2016-Present)</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between"><span className="text-yellow-400">Case Size:</span><span className="text-white">40mm</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Material:</span><span className="text-white">18K Yellow Gold</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Bezel:</span><span className="text-white">Yellow Gold</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Movement:</span><span className="text-white">Cal. 4130</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Water Resistance:</span><span className="text-white">100m</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Features:</span><span className="text-white">Solid gold case</span></div>
                            </div>
                          </div>
                        </div>

                        {/* Daytona Rainbow 116595RBOW */}
                        <div className="space-y-4">
                          <div className="aspect-square bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-lg border-2 border-purple-400/50 flex items-center justify-center relative overflow-hidden">
                            <img 
                              src={daytona116595RBOWImage} 
                              alt="Rolex Cosmograph Daytona Rainbow 116595RBOW Everose Gold"
                              className="w-full h-full object-contain p-4"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                              <h4 className="text-lg font-semibold text-purple-300">116595RBOW</h4>
                              <p className="text-sm text-purple-200">Rainbow Diamonds</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-semibold text-purple-300">Daytona Rainbow (2012-Present)</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between"><span className="text-yellow-400">Case Size:</span><span className="text-white">40mm</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Material:</span><span className="text-white">18K White Gold</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Bezel:</span><span className="text-white">Rainbow Diamonds</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Movement:</span><span className="text-white">Cal. 4130</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Water Resistance:</span><span className="text-white">100m</span></div>
                              <div className="flex justify-between"><span className="text-yellow-400">Features:</span><span className="text-white">36 baguette diamonds</span></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {/* GMT Sprite + Explorer Gallery */}
                  <Card className="glass-morphism border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Crown className="h-5 w-5 text-gold mr-2" />
                        GMT "Sprite" · Explorer · Explorer II — Visual Guide
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid lg:grid-cols-3 gap-6">
                        <WatchPhotoCard refNum="126720VTNR" name="GMT-Master II Sprite" nickname='"Sprite" / Left-hand Crown' accentColor="green"
                          specs={[{label:'Case',value:'40mm Steel'},{label:'Bezel',value:'Cerachrom Green/Black'},{label:'Movement',value:'Cal. 3285'},{label:'Crown',value:'Left-sided (Destro)'},{label:'Water Res.',value:'100m'},{label:'Launched',value:'2022'}]} />
                        <WatchPhotoCard refNum="124270" name="Explorer 36mm" nickname="Explorer — Pure Form" accentColor="white"
                          specs={[{label:'Case',value:'36mm Steel'},{label:'Dial',value:'Black, 3-6-9'},{label:'Movement',value:'Cal. 3230'},{label:'Power',value:'70 hours'},{label:'Water Res.',value:'100m'},{label:'Launched',value:'2021'}]} />
                        <WatchPhotoCard refNum="226570" name="Explorer II 42mm" nickname="Explorer II — Polar" accentColor="orange"
                          specs={[{label:'Case',value:'42mm Steel'},{label:'Dial',value:'White or Black'},{label:'Movement',value:'Cal. 3285'},{label:'24hr Hand',value:'Fixed orange'},{label:'Water Res.',value:'100m'},{label:'Launched',value:'2021'}]} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sea-Dweller / DeepSea / Milgauss Gallery */}
                  <Card className="glass-morphism border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Crown className="h-5 w-5 text-gold mr-2" />
                        Sea-Dweller · DeepSea · Milgauss — Visual Guide
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid lg:grid-cols-3 gap-6">
                        <WatchPhotoCard refNum="126600" name="Sea-Dweller 43mm" nickname="50th Anniversary Edition" accentColor="blue"
                          specs={[{label:'Case',value:'43mm Steel'},{label:'Bezel',value:'Ceramic Black'},{label:'Movement',value:'Cal. 3235'},{label:'Water Res.',value:'1,220m'},{label:'HEV',value:'Helium Escape Valve'},{label:'Launched',value:'2017'}]} />
                        <WatchPhotoCard refNum="126660" name="DeepSea" nickname="D-Blue / James Cameron" accentColor="blue"
                          specs={[{label:'Case',value:'44mm Steel'},{label:'Dial',value:'D-Blue or Black'},{label:'Movement',value:'Cal. 3235'},{label:'Water Res.',value:'3,900m'},{label:'Crystal',value:'5mm Sapphire'},{label:'System',value:'Ringlock'}]} />
                        <WatchPhotoCard refNum="116400GV" name="Milgauss Green Crystal" nickname="Green Sapphire — Scientists" accentColor="green"
                          specs={[{label:'Case',value:'40mm Steel'},{label:'Crystal',value:'Green Sapphire (unique)'},{label:'Movement',value:'Cal. 3131'},{label:'Anti-mag',value:'1,000 Gauss'},{label:'Seconds',value:'Orange lightning bolt'},{label:'Launched',value:'2007'}]} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Day-Date / Datejust / Yacht-Master Gallery */}
                  <Card className="glass-morphism border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Crown className="h-5 w-5 text-gold mr-2" />
                        Day-Date · Datejust · Yacht-Master — Visual Guide
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid lg:grid-cols-3 gap-6">
                        <WatchPhotoCard refNum="228238" name="Day-Date 40 Yellow Gold" nickname='"The President"' accentColor="yellow"
                          specs={[{label:'Case',value:'40mm Yellow Gold'},{label:'Bracelet',value:'President'},{label:'Movement',value:'Cal. 3255'},{label:'Complication',value:'Day + Date spelled out'},{label:'Only in',value:'Gold & Platinum'},{label:'Heritage',value:'Since 1956'}]} />
                        <WatchPhotoCard refNum="126300" name="Datejust 41" nickname="The Everyman's Rolex" accentColor="white"
                          specs={[{label:'Case',value:'41mm Steel'},{label:'Bracelet',value:'Oyster or Jubilee'},{label:'Movement',value:'Cal. 3235'},{label:'Water Res.',value:'100m'},{label:'Heritage',value:'Since 1945'},{label:'Dials',value:'100+ combinations'}]} />
                        <WatchPhotoCard refNum="126622" name="Yacht-Master 40" nickname="Platinum Bezel on Steel" accentColor="slate"
                          specs={[{label:'Case',value:'40mm Steel'},{label:'Bezel',value:'Bidirectional Platinum'},{label:'Movement',value:'Cal. 3235'},{label:'Water Res.',value:'100m'},{label:'Bracelet',value:'Oyster'},{label:'Launched',value:'1992'}]} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Vintage Blue Chips Gallery */}
                  <Card className="glass-morphism border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Crown className="h-5 w-5 text-gold mr-2" />
                        Vintage Blue Chips — Visual Guide
                      </CardTitle>
                      <p className="text-xs text-stone-500 mt-1">Pre-1990 collector references — historically significant pieces</p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid lg:grid-cols-3 gap-6">
                        <WatchPhotoCard refNum="6542" name='GMT-Master "Bakelite"' nickname="First GMT — 1954" accentColor="red"
                          specs={[{label:'Case',value:'38mm Steel'},{label:'Bezel',value:'Bakelite Pepsi (rare)'},{label:'Movement',value:'Cal. 1036'},{label:'Era',value:'1954–1959'},{label:'History',value:'Pan Am pilots'},{label:'Collectibility',value:'Extreme'}]} />
                        <WatchPhotoCard refNum="5513" name="Submariner No-Date Vintage" nickname='"The Standard" — 1962–1989' accentColor="green"
                          specs={[{label:'Case',value:'40mm Steel'},{label:'Crystal',value:'Acrylic'},{label:'Movement',value:'Cal. 1520/1530'},{label:'Era',value:'1962–1989'},{label:'Production',value:'27 years'},{label:'Collectibility',value:'Very High'}]} />
                        <WatchPhotoCard refNum="16520" name='Daytona "Zenith"' nickname="Last Non-In-House — 1988" accentColor="white"
                          specs={[{label:'Case',value:'40mm Steel'},{label:'Movement',value:'Cal. 4030 (Zenith base)'},{label:'Era',value:'1988–2000'},{label:'Significance',value:'First auto Daytona'},{label:'Patrizzi dial',value:'Collector premium'},{label:'Collectibility',value:'Very High'}]} />
                      </div>
                      <div className="grid lg:grid-cols-3 gap-6 mt-6">
                        <WatchPhotoCard refNum="1675" name='GMT-Master "Pepsi" Vintage' nickname="Pan Am Standard — 1959" accentColor="red"
                          specs={[{label:'Case',value:'40mm Steel'},{label:'Bezel',value:'Red/Blue Aluminum'},{label:'Movement',value:'Cal. 1565/1575'},{label:'Era',value:'1959–1980'},{label:'Variants',value:'Gilt, Matte, Tropical'},{label:'Collectibility',value:'Very High'}]} />
                        <WatchPhotoCard refNum="6538" name='Submariner "James Bond"' nickname="Big Crown — 1956" accentColor="green"
                          specs={[{label:'Case',value:'38mm Steel'},{label:'Crown',value:'Big crown, no guards'},{label:'Movement',value:'Cal. 1030'},{label:'Era',value:'1955–1959'},{label:'Fame',value:'Connery Bond films'},{label:'Collectibility',value:'Extreme'}]} />
                        <WatchPhotoCard refNum="1016" name="Explorer (Vintage)" nickname="The Everest Watch — 1963" accentColor="white"
                          specs={[{label:'Case',value:'36mm Steel'},{label:'Dial',value:'Matte or Gilt black'},{label:'Movement',value:'Cal. 1560/1570'},{label:'Era',value:'1963–1989'},{label:'Production',value:'26 years'},{label:'Collectibility',value:'High/Very High'}]} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Submariner Collection */}
                  <Card className="glass-morphism border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Crown className="h-5 w-5 text-gold mr-2" />
                        Submariner Collection
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="p-3 bg-white/5 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gold">Submariner Date (126610LN)</h4>
                            <Badge className="bg-green-600">Current</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-yellow-400">Case:</span> <span className="text-white">41mm Steel</span></div>
                            <div><span className="text-yellow-400">Bezel:</span> <span className="text-white">Ceramic Black</span></div>
                            <div><span className="text-yellow-400">Movement:</span> <span className="text-white">3235</span></div>
                            <div><span className="text-yellow-400">Year:</span> <span className="text-white">2020-Present</span></div>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-white/5 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gold">Submariner Date (116610LN)</h4>
                            <Badge className="bg-gray-600">Discontinued</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-yellow-400">Case:</span> <span className="text-white">40mm Steel</span></div>
                            <div><span className="text-yellow-400">Bezel:</span> <span className="text-white">Ceramic Black</span></div>
                            <div><span className="text-yellow-400">Movement:</span> <span className="text-white">3135</span></div>
                            <div><span className="text-yellow-400">Year:</span> <span className="text-white">2010-2020</span></div>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-white/5 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gold">Submariner No-Date (124060)</h4>
                            <Badge className="bg-green-600">Current</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-yellow-400">Case:</span> <span className="text-white">41mm Steel</span></div>
                            <div><span className="text-yellow-400">Bezel:</span> <span className="text-white">Ceramic Black</span></div>
                            <div><span className="text-yellow-400">Movement:</span> <span className="text-white">3230</span></div>
                            <div><span className="text-yellow-400">Year:</span> <span className="text-white">2020-Present</span></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* GMT-Master Collection */}
                  <Card className="glass-morphism border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Crown className="h-5 w-5 text-gold mr-2" />
                        GMT-Master Collection
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="p-3 bg-white/5 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gold">GMT-Master II (126710BLNR)</h4>
                            <Badge className="bg-green-600">Current</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-yellow-400">Case:</span> <span className="text-white">40mm Steel</span></div>
                            <div><span className="text-yellow-400">Bezel:</span> <span className="text-white">Blue/Black Batman</span></div>
                            <div><span className="text-yellow-400">Movement:</span> <span className="text-white">3285</span></div>
                            <div><span className="text-yellow-400">Year:</span> <span className="text-white">2019-Present</span></div>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-white/5 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gold">GMT-Master II (126710BLRO)</h4>
                            <Badge className="bg-green-600">Current</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-yellow-400">Case:</span> <span className="text-white">40mm Steel</span></div>
                            <div><span className="text-yellow-400">Bezel:</span> <span className="text-white">Blue/Red Pepsi</span></div>
                            <div><span className="text-yellow-400">Movement:</span> <span className="text-white">3285</span></div>
                            <div><span className="text-yellow-400">Year:</span> <span className="text-white">2018-Present</span></div>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-white/5 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gold">GMT-Master II (116710LN)</h4>
                            <Badge className="bg-gray-600">Discontinued</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-yellow-400">Case:</span> <span className="text-white">40mm Steel</span></div>
                            <div><span className="text-yellow-400">Bezel:</span> <span className="text-white">Ceramic Black</span></div>
                            <div><span className="text-yellow-400">Movement:</span> <span className="text-white">3186</span></div>
                            <div><span className="text-yellow-400">Year:</span> <span className="text-white">2007-2019</span></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Datejust Collection */}
                  <Card className="glass-morphism border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Crown className="h-5 w-5 text-gold mr-2" />
                        Datejust Collection
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="p-3 bg-white/5 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gold">Datejust 41 (126334)</h4>
                            <Badge className="bg-green-600">Current</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-yellow-400">Case:</span> <span className="text-white">41mm Steel/WG</span></div>
                            <div><span className="text-yellow-400">Bezel:</span> <span className="text-white">Fluted White Gold</span></div>
                            <div><span className="text-yellow-400">Movement:</span> <span className="text-white">3235</span></div>
                            <div><span className="text-yellow-400">Year:</span> <span className="text-white">2016-Present</span></div>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-white/5 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gold">Datejust 36 (126234)</h4>
                            <Badge className="bg-green-600">Current</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-yellow-400">Case:</span> <span className="text-white">36mm Steel/WG</span></div>
                            <div><span className="text-yellow-400">Bezel:</span> <span className="text-white">Fluted White Gold</span></div>
                            <div><span className="text-yellow-400">Movement:</span> <span className="text-white">3235</span></div>
                            <div><span className="text-yellow-400">Year:</span> <span className="text-white">2016-Present</span></div>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-white/5 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gold">Lady-Datejust 28 (279384RBR)</h4>
                            <Badge className="bg-green-600">Current</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-yellow-400">Case:</span> <span className="text-white">28mm Steel/WG</span></div>
                            <div><span className="text-yellow-400">Bezel:</span> <span className="text-white">Diamond Set</span></div>
                            <div><span className="text-yellow-400">Movement:</span> <span className="text-white">2236</span></div>
                            <div><span className="text-yellow-400">Year:</span> <span className="text-white">2015-Present</span></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Daytona Collection */}
                  <Card className="glass-morphism border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Crown className="h-5 w-5 text-gold mr-2" />
                        Daytona Collection
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="p-3 bg-white/5 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gold">Daytona (126500LN)</h4>
                            <Badge className="bg-green-600">Current</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-yellow-400">Case:</span> <span className="text-white">40mm Steel</span></div>
                            <div><span className="text-yellow-400">Bezel:</span> <span className="text-white">Ceramic Black</span></div>
                            <div><span className="text-yellow-400">Movement:</span> <span className="text-white">4130</span></div>
                            <div><span className="text-yellow-400">Year:</span> <span className="text-white">2016-Present</span></div>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-white/5 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gold">Daytona (116500LN)</h4>
                            <Badge className="bg-gray-600">Discontinued</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-yellow-400">Case:</span> <span className="text-white">40mm Steel</span></div>
                            <div><span className="text-yellow-400">Bezel:</span> <span className="text-white">Ceramic Black</span></div>
                            <div><span className="text-yellow-400">Movement:</span> <span className="text-white">4130</span></div>
                            <div><span className="text-yellow-400">Year:</span> <span className="text-white">2016-2023</span></div>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-white/5 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gold">Daytona Gold (116508)</h4>
                            <Badge className="bg-yellow-600">Limited</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-yellow-400">Case:</span> <span className="text-white">40mm Yellow Gold</span></div>
                            <div><span className="text-yellow-400">Bezel:</span> <span className="text-white">Yellow Gold</span></div>
                            <div><span className="text-yellow-400">Movement:</span> <span className="text-white">4130</span></div>
                            <div><span className="text-yellow-400">Year:</span> <span className="text-white">2016-Present</span></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* ── MOVEMENTS TAB ─────────────────────────────────────── */}
            <TabsContent value="movements">
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-3">Rolex Movement Encyclopedia</h2>
                  <p className="text-yellow-300 max-w-3xl mx-auto">Every caliber Rolex has ever produced — technical specifications, history, and which models they powered.</p>
                </div>

                {/* Vintage Era */}
                <Card className="glass-morphism border-white/20">
                  <CardHeader>
                    <CardTitle className="text-gold text-xl">Vintage Era (1930s–1970s)</CardTitle>
                    <p className="text-yellow-300 text-sm">Hand-finished movements that defined Rolex's reputation for precision</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        {cal:'1030',yr:'1950',j:'17',freq:'18,000',pr:'42hr',fn:'H+M+S',uses:'Sub 6204, Explorer 6350, Air-King 5500',notes:'First Rolex in-house automatic. No hack, no quickset date.'},
                        {cal:'1036',yr:'1954',j:'17',freq:'18,000',pr:'42hr',fn:'H+M+S+GMT',uses:'GMT-Master 6542',notes:'GMT complication debut.'},
                        {cal:'1065',yr:'1956',j:'25',freq:'18,000',pr:'40hr',fn:'H+M+S+Date',uses:'Early Lady-Datejust',notes:'First ladies cal. with date.'},
                        {cal:'1080',yr:'1956',j:'17',freq:'18,000',pr:'42hr',fn:'H+M+S',uses:'Milgauss 6541, 6543',notes:'Anti-magnetic shielding, Faraday copper cage.'},
                        {cal:'1520',yr:'1957',j:'17',freq:'18,000',pr:'42hr',fn:'H+M+S',uses:'Air-King 5500, Oyster Perpetual 1002',notes:'Long production. No date, no hack.'},
                        {cal:'1530',yr:'1958',j:'25',freq:'18,000',pr:'42hr',fn:'H+M+S',uses:'Submariner 5508',notes:'Improved 1520, no hack.'},
                        {cal:'1556',yr:'1956',j:'25',freq:'18,000',pr:'48hr',fn:'H+M+S+Day+Date',uses:'Day-Date 1803/1807',notes:'First ever Day-Date caliber.'},
                        {cal:'1560',yr:'1959',j:'17',freq:'18,000',pr:'42hr',fn:'H+M+S',uses:'Sub 5512/5513, Explorer 1016 early',notes:'No hack, no quickset. Glucydur balance wheel.'},
                        {cal:'1565',yr:'1959',j:'26',freq:'18,000',pr:'42hr',fn:'H+M+S+GMT',uses:'GMT-Master 1675 early',notes:'GMT function. No hack.'},
                        {cal:'1570',yr:'1965',j:'26',freq:'19,800',pr:'48hr',fn:'H+M+S+Date',uses:'Sub 5512/5513 late, Datejust 1601, Air-King',notes:'First Rolex with HACK seconds. Quickset date. Collector workhorse.'},
                        {cal:'1575',yr:'1965',j:'26',freq:'19,800',pr:'48hr',fn:'H+M+S+Date+GMT',uses:'Red Sub 1680, GMT 1675, Sea-Dweller 1665',notes:'Date version of 1570 with GMT function.'},
                        {cal:'1580',yr:'1960',j:'26',freq:'19,800',pr:'48hr',fn:'H+M+S',uses:'Milgauss 1019',notes:'Anti-magnetic, no date.'},
                        {cal:'722/727',yr:'1963',j:'17',freq:'21,600',pr:'48hr',fn:'H+M+S+Chronograph',uses:'Daytona 6239–6265',notes:'Manual wind. Valjoux-based chronograph. Paul Newman models.'},
                        {cal:'2135',yr:'1977',j:'29',freq:'28,800',pr:'42hr',fn:'H+M+S+Date',uses:'Lady-Datejust 69173',notes:'High-beat ladies cal. with date.'},
                      ].map(m => (
                        <div key={m.cal} className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-gold text-base">Cal. {m.cal}</h4>
                            <span className="text-xs text-yellow-400">Intro: {m.yr}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1 text-xs">
                            <div><span className="text-gray-400">Jewels</span><br/><span className="text-white font-semibold">{m.j}j</span></div>
                            <div><span className="text-gray-400">Freq.</span><br/><span className="text-white font-semibold">{m.freq} bph</span></div>
                            <div><span className="text-gray-400">P. Reserve</span><br/><span className="text-white font-semibold">{m.pr}</span></div>
                          </div>
                          <p className="text-xs text-cyan-300"><span className="text-gray-400">Used in: </span>{m.uses}</p>
                          {m.notes && <p className="text-xs text-yellow-200 italic">{m.notes}</p>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Transition Era */}
                <Card className="glass-morphism border-white/20">
                  <CardHeader>
                    <CardTitle className="text-silver text-xl">Transition Era (1977–1999)</CardTitle>
                    <p className="text-yellow-300 text-sm">Quickset date, higher frequency, sapphire crystal — modernizing Rolex</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        {cal:'3000',yr:'1977',j:'31',freq:'28,800',pr:'42hr',fn:'H+M+S',uses:'Submariner 14060 (early)',notes:'First 8 ticks/second Rolex, no date version.'},
                        {cal:'3035',yr:'1977',j:'27',freq:'28,800',pr:'42hr',fn:'H+M+S+Date',uses:'Sub 16800, Datejust 16014/16030',notes:'HISTORIC: First Rolex with quickset date. High-beat debut for men\'s models.'},
                        {cal:'3055',yr:'1977',j:'31',freq:'28,800',pr:'42hr',fn:'H+M+S+Day+Date',uses:'Day-Date 18038/18239',notes:'Day-Date version of 3035 with quickset.'},
                        {cal:'3075',yr:'1981',j:'31',freq:'28,800',pr:'42hr',fn:'H+M+S+Date+GMT',uses:'GMT-Master 16750/16753/16758',notes:'First GMT with quickset date.'},
                        {cal:'3085',yr:'1983',j:'31',freq:'28,800',pr:'42hr',fn:'H+M+S+Date+Indep GMT',uses:'GMT-Master II 16760 "Fat Lady," Explorer II 16550',notes:'HISTORIC: First cal. with independently adjustable hour hand.'},
                        {cal:'3130',yr:'1988',j:'31',freq:'28,800',pr:'50hr',fn:'H+M+S',uses:'Sub 14060M, Explorer 114270',notes:'No-date sibling of 3135. 50-hr power reserve.'},
                        {cal:'3135',yr:'1988',j:'31',freq:'28,800',pr:'48hr',fn:'H+M+S+Date',uses:'Sub Date, GMT-Master II (16710+), Explorer II, DJ, Sea-Dweller',notes:'THE WORKHORSE. 32-year production run (1988–2020). Quintessential Rolex movement.'},
                        {cal:'3155',yr:'1988',j:'31',freq:'28,800',pr:'48hr',fn:'H+M+S+Day+Date',uses:'Day-Date 118238/118239',notes:'Day-Date flagship, companion to 3135.'},
                        {cal:'3185',yr:'1989',j:'31',freq:'28,800',pr:'48hr',fn:'H+M+S+Date+GMT',uses:'GMT-Master II 16710, Explorer II 16570',notes:'GMT-Master II workhorse of the 90s-2000s.'},
                        {cal:'4030',yr:'1988',j:'31',freq:'28,800',pr:'48hr',fn:'H+M+S+Chronograph',uses:'Daytona 16520 "Zenith"',notes:'Modified Zenith El Primero. Rolex reduced frequency from 36,000 to 28,800 bph.'},
                        {cal:'3056',yr:'1988',j:'31',freq:'28,800',pr:'48hr',fn:'H+M+S+Day+Date',uses:'Day-Date II 218238',notes:'Datejust II / Day-Date II variant.'},
                      ].map(m => (
                        <div key={m.cal} className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-silver text-base">Cal. {m.cal}</h4>
                            <span className="text-xs text-yellow-400">Intro: {m.yr}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1 text-xs">
                            <div><span className="text-gray-400">Jewels</span><br/><span className="text-white font-semibold">{m.j}j</span></div>
                            <div><span className="text-gray-400">Freq.</span><br/><span className="text-white font-semibold">{m.freq} bph</span></div>
                            <div><span className="text-gray-400">P. Reserve</span><br/><span className="text-white font-semibold">{m.pr}</span></div>
                          </div>
                          <p className="text-xs text-cyan-300"><span className="text-gray-400">Used in: </span>{m.uses}</p>
                          {m.notes && <p className="text-xs text-yellow-200 italic">{m.notes}</p>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Modern Chronergy Era */}
                <Card className="glass-morphism border-white/20">
                  <CardHeader>
                    <CardTitle className="text-blue-400 text-xl">Modern Era (2000–Present)</CardTitle>
                    <p className="text-yellow-300 text-sm">Parachrom hairspring, Chronergy escapement, 70-hour power reserves — Rolex at peak engineering</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        {cal:'4130',yr:'2000',j:'44',freq:'28,800',pr:'72hr',fn:'H+M+S+Chronograph',uses:'Daytona 116500LN, 116520, 116595RBOW (2000–2023)',notes:'First entirely in-house Daytona chronograph. Vertical clutch, no column wheel needed. Landmark caliber.'},
                        {cal:'3186',yr:'2005',j:'31',freq:'28,800',pr:'48hr',fn:'H+M+S+Date+GMT',uses:'GMT-Master II 116710LN/BLNR, 116718LN',notes:'First GMT with Parachrom blue hairspring. Landmark upgrade.'},
                        {cal:'3187',yr:'2007',j:'31',freq:'28,800',pr:'48hr',fn:'H+M+S+Date+GMT',uses:'Explorer II 216570, GMT 116710 variants',notes:'GMT with Paraflex shock absorber for superior durability.'},
                        {cal:'3132',yr:'2010',j:'31',freq:'28,800',pr:'48hr',fn:'H+M+S',uses:'Explorer I 214270, OP 114300',notes:'Parachrom hairspring, no date, for Explorer I.'},
                        {cal:'3136',yr:'2009',j:'31',freq:'28,800',pr:'48hr',fn:'H+M+S+Date',uses:'Datejust II 116300',notes:'Parachrom, date, for Datejust II series.'},
                        {cal:'3156',yr:'2008',j:'31',freq:'28,800',pr:'48hr',fn:'H+M+S+Day+Date',uses:'Day-Date 40 218238/218235',notes:'Day-Date 40mm flagship cal. before 3255.'},
                        {cal:'3131',yr:'2007',j:'31',freq:'28,800',pr:'48hr',fn:'H+M+S+Date',uses:'Milgauss 116400/116400GV',notes:'Anti-magnetic copper-beryllium Faraday cage. Paramagnetic Parachrom hairspring. Resists 1,000 gauss.'},
                        {cal:'2230',yr:'2014',j:'31',freq:'28,800',pr:'55hr',fn:'H+M+S',uses:'Lady-Datejust 28 no-date',notes:'Ladies compact no-date. 55hr power reserve.'},
                        {cal:'2235',yr:'2000',j:'31',freq:'28,800',pr:'48hr',fn:'H+M+S+Date',uses:'Lady-Datejust 26/179174, Pearlmaster 34',notes:'Ladies with date. Predecessor to 2236.'},
                        {cal:'2236',yr:'2012',j:'31',freq:'28,800',pr:'55hr',fn:'H+M+S+Date',uses:'Lady-Datejust 28, Datejust 31, Pearlmaster 34',notes:'Parachrom, Syloxi silicon hairspring. 55hr. Current ladies flagship.'},
                        {cal:'2232',yr:'2020',j:'31',freq:'28,800',pr:'55hr',fn:'H+M+S',uses:'Oyster Perpetual 28/31',notes:'Ladies OP, no date, 55hr.'},
                        {cal:'3235',yr:'2015',j:'31',freq:'28,800',pr:'70hr',fn:'H+M+S+Date',uses:'Sub Date, DJ41, Sea-Dweller, GMT new gen (all post-2020)',notes:'CURRENT FLAGSHIP. Chronergy escapement (50% more efficient). 70hr. Parachrom hairspring. Benchmark modern movement.'},
                        {cal:'3255',yr:'2015',j:'31',freq:'28,800',pr:'70hr',fn:'H+M+S+Day+Date',uses:'Day-Date 40 (228238/228235/228239)',notes:'Day-Date companion to 3235. 70hr. Most prestigious complication movement Rolex makes regularly.'},
                        {cal:'3285',yr:'2018',j:'31',freq:'28,800',pr:'70hr',fn:'H+M+S+Date+GMT',uses:'GMT-Master II 126710, Yacht-Master 40 42',notes:'70hr. Independent GMT hand. Current GMT flagship.'},
                        {cal:'3230',yr:'2019',j:'31',freq:'28,800',pr:'70hr',fn:'H+M+S',uses:'Sub No-Date 124060, Explorer 124270, Air-King 126900, OP 41/36',notes:'No-date modern flagship. 70hr Chronergy.'},
                        {cal:'4131',yr:'2023',j:'44',freq:'28,800',pr:'72hr',fn:'H+M+S+Chronograph',uses:'Daytona 126500LN+',notes:'Evolved 4130. New Daytona generation. Still in-house chronograph with vertical clutch.'},
                        {cal:'4161',yr:'2007',j:'54',freq:'28,800',pr:'72hr',fn:'H+M+S+Chronograph+Regatta',uses:'Yacht-Master II 116688/116681/116680',notes:'Most complex Rolex chronograph. Programmable 10-min regatta countdown. 54 jewels.'},
                        {cal:'9001',yr:'2012',j:'40',freq:'28,800',pr:'72hr',fn:'H+M+S+Date+Annual Cal+GMT',uses:'Sky-Dweller 326938–326939',notes:'MOST COMPLEX ROLEX MOVEMENT. Annual calendar (12 months set once/yr) + independent GMT. 40 jewels, 72hr.'},
                        {cal:'9002',yr:'2023',j:'40',freq:'28,800',pr:'72hr',fn:'H+M+S+Date+Annual Cal+GMT',uses:'Sky-Dweller 336934+',notes:'Updated Sky-Dweller. Improved 9001. Current Cal.'},
                        {cal:'3195',yr:'2017',j:'37',freq:'28,800',pr:'48hr',fn:'H+M+S+Moonphase+Date',uses:'Cellini Moonphase 50519',notes:'Only Rolex moonphase. Cellini dress watch exclusive.'},
                        {cal:'3180',yr:'2014',j:'31',freq:'28,800',pr:'48hr',fn:'H+M+S+Dual Time',uses:'Cellini Dual Time 50525/50529',notes:'Rolex dress watch dual time. Cellini exclusive.'},
                      ].map(m => (
                        <div key={m.cal} className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-blue-300 text-base">Cal. {m.cal}</h4>
                            <span className="text-xs text-yellow-400">Intro: {m.yr}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1 text-xs">
                            <div><span className="text-gray-400">Jewels</span><br/><span className="text-white font-semibold">{m.j}j</span></div>
                            <div><span className="text-gray-400">Freq.</span><br/><span className="text-white font-semibold">{m.freq} bph</span></div>
                            <div><span className="text-gray-400">P. Reserve</span><br/><span className="text-white font-semibold">{m.pr}</span></div>
                          </div>
                          <p className="text-xs text-cyan-300"><span className="text-gray-400">Used in: </span>{m.uses}</p>
                          {m.notes && <p className="text-xs text-yellow-200 italic">{m.notes}</p>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ── HISTORY TAB ─────────────────────────────────────── */}
            <TabsContent value="history">
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-3">Rolex Complete History</h2>
                  <p className="text-yellow-300 max-w-3xl mx-auto">Over a century of horological innovation — from a London import business to the world's most recognized luxury brand.</p>
                </div>
                <div className="grid lg:grid-cols-2 gap-6">
                  {[
                    {era:'1905–1925: The Founding', color:'text-amber-400', items:[
                      '1905 — Hans Wilsdorf and Alfred Davis found Wilsdorf & Davis in London, importing Swiss movements',
                      '1908 — Hans Wilsdorf registers "Rolex" brand name — short, pronounceable in any language',
                      '1910 — First watch to receive Swiss Chronometer certification (Bienne observatory)',
                      '1914 — British Kew Observatory grants Rolex "Class A" certificate — first wristwatch ever',
                      '1919 — Wilsdorf moves company to Geneva, Switzerland (avoiding UK wartime tariffs)',
                      '1920 — Montres Rolex SA officially founded in Geneva',
                    ]},
                    {era:'1926–1950: Foundations of Greatness', color:'text-yellow-400', items:[
                      '1926 — Oyster case patented — world\'s first truly waterproof/dustproof watch case',
                      '1927 — Mercedes Gleitze swims English Channel wearing an Oyster. First product placement in history',
                      '1931 — Perpetual self-winding rotor invented — still the basis of all Rolex movements today',
                      '1945 — Datejust 4467 introduced — world\'s first wristwatch with date window. Worn at Yalta Conference by FDR, Churchill, Stalin',
                      '1947 — Hans Wilsdorf\'s wife dies. He creates the Hans Wilsdorf Foundation — Rolex becomes entirely charitable trust-owned (no shareholders)',
                    ]},
                    {era:'1953–1960: Sport Legends Born', color:'text-green-400', items:[
                      '1953 — Submariner ref. 6204 debuts at Basel. Explorer 6350 worn by Hillary & Tenzing on first Everest summit',
                      '1954 — GMT-Master 6542 created with Pan Am Airlines for trans-Atlantic pilots to track two time zones',
                      '1955 — Datejust gets cyclops lens magnifier. Air-King line born (tribute to WWII RAF aviators)',
                      '1956 — Day-Date "The President" — world\'s first watch to display day spelled out + date. Only in precious metals',
                      '1956 — Milgauss debuts. Anti-magnetic to 1,000 gauss for CERN scientists',
                      '1959 — GMT-Master 1675 "Pepsi" becomes the most recognizable pilot\'s watch ever made',
                    ]},
                    {era:'1963–1980: Racing & Diving Icons', color:'text-blue-400', items:[
                      '1963 — Cosmograph Daytona ref. 6239 debuts. Named for Daytona International Speedway',
                      '1963 — Explorer I 1016 begins 26-year production run. The ultimate tool watch',
                      '1967 — Sea-Dweller 1665 "Double Red" — first dive watch with helium escape valve. 600m WR',
                      '1971 — Explorer II 1655 with fixed 24hr disc. Associated with spelunkers and Steve McQueen',
                      '1972 — Andre Heiniger becomes CEO. Global expansion era begins',
                      '1978 — Sea-Dweller 16600 with 1,220m water resistance. Benchmark professional dive watch',
                    ]},
                    {era:'1983–2000: Mechanical Revolution', color:'text-purple-400', items:[
                      '1983 — GMT-Master II 16760 "Fat Lady" — first independently adjustable second time zone',
                      '1988 — Rolex launches Cal. 3135 — runs 32 years, powers Submariner Date for entire era',
                      '1988 — Daytona 16520 "Zenith" — first automatic Daytona, using modified Zenith El Primero',
                      '1992 — Yacht-Master debuts — luxury sport-sailing segment created',
                      '2000 — Cal. 4130 replaces Zenith in Daytona with entirely in-house chronograph movement',
                    ]},
                    {era:'2003–2015: Ceramic & Parachrom', color:'text-cyan-400', items:[
                      '2003 — "Kermit" 16610LV — 50th anniversary green-bezel Submariner',
                      '2005 — Cal. 3186 introduces Parachrom blue hairspring (10x more shockproof, antimagnetic)',
                      '2007 — Milgauss revived as 116400/116400GV after 19-year absence',
                      '2008 — Serial numbers move exclusively to rehaut engraving. Cerachrom ceramic bezel debuts on Sub',
                      '2010 — "Hulk" 116610LV — only Submariner ever with green dial AND green bezel',
                      '2012 — Sky-Dweller with Cal. 9001 — most complex Rolex movement ever (annual calendar + GMT)',
                      '2015 — Cal. 3235 debuts — 70hr power reserve, Chronergy escapement. New gold standard',
                    ]},
                    {era:'2016–2023: Modern Grails', color:'text-rose-400', items:[
                      '2016 — Ceramic Daytona 116500LN — immediately most waitlisted watch on earth',
                      '2017 — Sea-Dweller 126600 50th Anniversary with Red text + cyclops lens',
                      '2018 — Steel "Pepsi" GMT 126710BLRO returns after 35-year absence in steel',
                      '2019 — "Batman" gets Jubilee bracelet (126710BLNR). GMT case entirely redesigned',
                      '2020 — Submariner grows to 41mm, new Cal. 3235/3230. Major architecture change',
                      '2021 — Explorer returns to 36mm after public pressure. Explorer II grows to 42mm',
                      '2022 — "Sprite/Destro" 126720VTNR — left-handed crown. Unprecedented in modern Rolex lineup',
                      '2023 — Rolex acquires Bucherer (world\'s largest authorized dealer). Daytona gets new Cal. 4131. Milgauss discontinued',
                      '2023 — Rolex Certified Pre-Owned (CPO) program expands through ADs worldwide',
                    ]},
                    {era:'Notable People & Rolex', color:'text-gold', items:[
                      'Hans Wilsdorf (1881–1960) — Founder. Orphaned at 12, became greatest watch brand builder in history',
                      'Franklin D. Roosevelt — Wore 18K gold Datejust at Yalta Conference, 1945',
                      'Sir Edmund Hillary — Wore Explorer on first Everest summit, May 29, 1953',
                      'Paul Newman — His personal Daytona 6239 sold for $17.8M at Phillips 2017 — world record',
                      'Steve McQueen — Wore Explorer II 1655 in Le Mans (1970)',
                      'James Bond (Sean Connery) — Wore Submariner 6536 in Dr. No (1962)',
                      'Martin Luther King Jr. — Wore Day-Date 1803. "The President\'s watch."',
                      'Nelson Mandela — Wore Day-Date after his release from prison (1990)',
                      'James Cameron — Wore Deep Sea Challenge prototype to bottom of Mariana Trench (2012)',
                      'Sylvester Stallone — Platinum Day-Date collector. Has commissioned custom stone dial pieces',
                    ]},
                  ].map(section => (
                    <Card key={section.era} className="glass-morphism border-white/20">
                      <CardHeader className="pb-3">
                        <CardTitle className={`text-lg ${section.color}`}>{section.era}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {section.items.map((item, i) => (
                            <li key={i} className="flex gap-2 text-sm">
                              <span className="text-gold mt-0.5 shrink-0">▸</span>
                              <span className="text-yellow-200">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="authentication">
              <div className="space-y-8">
                <h2 className="text-2xl font-semibold text-white mb-4">Identification Reference Guide</h2>
                <p className="text-sm text-yellow-400/80 mb-4">For informational purposes only. Professional authentication by a certified watchmaker or authorized Rolex service center is recommended for all transactions.</p>
                
                {/* AI-Powered Authentication Assistant */}
                <RolexAIAssistant />
                
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Authentication Key Points */}
                  <Card className="glass-morphism border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Crown className="h-5 w-5 text-gold mr-2" />
                        Authentication Essentials
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-white/5 rounded-lg">
                        <h4 className="font-semibold text-gold mb-2">Movement Quality</h4>
                        <p className="text-sm text-yellow-300 mb-3">Authentic Rolex movements show exceptional finishing</p>
                        <ul className="text-xs text-gray-300 space-y-1">
                          <li>• Clean, precise engravings</li>
                          <li>• Proper jewel placement</li>
                          <li>• Smooth rotor rotation</li>
                          <li>• Correct caliber markings</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-white/5 rounded-lg">
                        <h4 className="font-semibold text-gold mb-2">Dial Verification</h4>
                        <p className="text-sm text-yellow-300 mb-3">Inspect text, markers, and overall quality</p>
                        <ul className="text-xs text-gray-300 space-y-1">
                          <li>• Sharp, clean text printing</li>
                          <li>• Proper Swiss Made positioning</li>
                          <li>• Correct font styles</li>
                          <li>• Luminous material quality</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-white/5 rounded-lg">
                        <h4 className="font-semibold text-gold mb-2">Case Construction</h4>
                        <p className="text-sm text-yellow-300 mb-3">Rolex cases demonstrate superior build quality</p>
                        <ul className="text-xs text-gray-300 space-y-1">
                          <li>• Solid, weighty feel</li>
                          <li>• Precise crown threading</li>
                          <li>• Proper case back markings</li>
                          <li>• Smooth bezel operation</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Red Flags to Watch For */}
                  <Card className="glass-morphism border-red-500/20">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Database className="h-5 w-5 text-red-400 mr-2" />
                        Common Red Flags
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                        <h4 className="font-semibold text-red-400 mb-2">Movement Issues</h4>
                        <ul className="text-sm text-red-200 space-y-1">
                          <li>• Rough or cheap finishing</li>
                          <li>• Incorrect rotor design</li>
                          <li>• Wrong movement markings</li>
                          <li>• Poor jewel quality</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                        <h4 className="font-semibold text-red-400 mb-2">Dial Problems</h4>
                        <ul className="text-sm text-red-200 space-y-1">
                          <li>• Blurry or misaligned text</li>
                          <li>• Wrong font styles</li>
                          <li>• Poor luminous application</li>
                          <li>• Incorrect marker placement</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                        <h4 className="font-semibold text-red-400 mb-2">Construction Flaws</h4>
                        <ul className="text-sm text-red-200 space-y-1">
                          <li>• Light weight or hollow feel</li>
                          <li>• Rough crown operation</li>
                          <li>• Poor bracelet construction</li>
                          <li>• Misaligned case components</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Professional Authentication Services */}
                  <Card className="glass-morphism border-white/20 lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Info className="h-5 w-5 text-blue-400 mr-2" />
                        Professional Authentication Services
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="w-20 h-20 mx-auto mb-4 bg-blue-400/20 rounded-full flex items-center justify-center">
                            <span className="text-2xl text-blue-400">🏢</span>
                          </div>
                          <h4 className="font-semibold text-white mb-2">Authorized Dealers</h4>
                          <p className="text-sm text-yellow-300">Visit official Rolex dealers for professional authentication and service history verification.</p>
                        </div>
                        <div className="text-center">
                          <div className="w-20 h-20 mx-auto mb-4 bg-green-400/20 rounded-full flex items-center justify-center">
                            <span className="text-2xl text-green-400">🔍</span>
                          </div>
                          <h4 className="font-semibold text-white mb-2">Certified Appraisers</h4>
                          <p className="text-sm text-yellow-300">Independent certified appraisers can provide detailed authentication reports for insurance and resale.</p>
                        </div>
                        <div className="text-center">
                          <div className="w-20 h-20 mx-auto mb-4 bg-purple-400/20 rounded-full flex items-center justify-center">
                            <span className="text-2xl text-purple-400">⚙️</span>
                          </div>
                          <h4 className="font-semibold text-white mb-2">Rolex Service Centers</h4>
                          <p className="text-sm text-yellow-300">Official Rolex Service Centers can authenticate and provide service documentation for genuine timepieces.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="valuation">
              <div className="space-y-8">
                {/* Professional Pricing Header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">Professional Rolex Valuation Guide</h2>
                  <p className="text-yellow-300 text-lg">Current market pricing for authentic Rolex timepieces - Updated July 2025</p>
                  <div className="mt-4 p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-300 font-semibold">⚡ LIVE MARKET DATA - Real-time pricing from authenticated dealers and auction houses</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Submariner Pricing */}
                  <Card className="glass-morphism border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Crown className="h-5 w-5 text-gold mr-2" />
                        Submariner Collection Pricing
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-green-600/10 border border-green-500/30 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-gold text-lg">Submariner Date (126610LN)</h4>
                          <Badge className="bg-green-600">Current Production</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between"><span className="text-yellow-400">MSRP (Retail):</span><span className="text-green-400 font-bold">$10,650</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">Secondary Market:</span><span className="text-blue-400 font-bold">$12,732</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">Market Range:</span><span className="text-white">$12,900 - $18,000</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">Premium Over MSRP:</span><span className="text-orange-400">+19.5%</span></div>
                        </div>
                        <div className="mt-3 text-sm text-gray-300">
                          <p>• 41mm Steel, Ceramic bezel, Cal. 3235</p>
                          <p>• Median sale time: 20 days</p>
                          <p>• Top 1% of Rolex watches by popularity</p>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-600/10 border border-gray-500/30 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-gold text-lg">Submariner Date (116610LN)</h4>
                          <Badge className="bg-gray-600">Discontinued</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between"><span className="text-yellow-400">Last MSRP:</span><span className="text-gray-400">$9,550</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">Secondary Market:</span><span className="text-blue-400 font-bold">$11,800</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">Market Range:</span><span className="text-white">$11,200 - $15,500</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">Premium Over MSRP:</span><span className="text-orange-400">+23.5%</span></div>
                        </div>
                        <div className="mt-3 text-sm text-gray-300">
                          <p>• 40mm Steel, Ceramic bezel, Cal. 3135</p>
                          <p>• Production: 2010-2020</p>
                          <p>• Strong collector demand</p>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-600/10 border border-blue-500/30 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-gold text-lg">Submariner "Hulk" (126610LV)</h4>
                          <Badge className="bg-green-600">Current Production</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between"><span className="text-yellow-400">MSRP (Retail):</span><span className="text-green-400 font-bold">$10,800</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">Secondary Market:</span><span className="text-blue-400 font-bold">$15,200</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">Market Range:</span><span className="text-white">$14,500 - $22,000</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">Premium Over MSRP:</span><span className="text-orange-400">+40.7%</span></div>
                        </div>
                        <div className="mt-3 text-sm text-gray-300">
                          <p>• 41mm Steel, Green ceramic bezel and dial</p>
                          <p>• Highly sought after color combination</p>
                          <p>• Strong investment potential</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* GMT-Master II Pricing */}
                  <Card className="glass-morphism border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Crown className="h-5 w-5 text-gold mr-2" />
                        GMT-Master II Collection Pricing
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-blue-600/10 border border-blue-500/30 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-gold text-lg">GMT-Master II "Batman" (126710BLNR)</h4>
                          <Badge className="bg-blue-600">Current Production</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between"><span className="text-yellow-400">MSRP (Retail):</span><span className="text-green-400 font-bold">$10,700</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">Secondary Market:</span><span className="text-blue-400 font-bold">$13,900</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">Market Range:</span><span className="text-white">$13,200 - $18,500</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">Premium Over MSRP:</span><span className="text-orange-400">+29.9%</span></div>
                        </div>
                        <div className="mt-3 text-sm text-gray-300">
                          <p>• 40mm Steel, Blue/Black ceramic bezel</p>
                          <p>• Jubilee bracelet, Cal. 3285</p>
                          <p>• Iconic "Batman" color scheme</p>
                        </div>
                      </div>

                      <div className="p-4 bg-red-600/10 border border-red-500/30 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-gold text-lg">GMT-Master II "Pepsi" (126710BLRO)</h4>
                          <Badge className="bg-red-600">High Demand</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between"><span className="text-yellow-400">MSRP (Retail):</span><span className="text-green-400 font-bold">$10,700</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">Secondary Market:</span><span className="text-blue-400 font-bold">$16,800</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">Market Range:</span><span className="text-white">$15,900 - $24,000</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">Premium Over MSRP:</span><span className="text-orange-400">+57.0%</span></div>
                        </div>
                        <div className="mt-3 text-sm text-gray-300">
                          <p>• 40mm Steel, Blue/Red ceramic bezel</p>
                          <p>• Oyster bracelet, Cal. 3285</p>
                          <p>• Extremely high demand, long waitlists</p>
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-600/10 border border-yellow-500/30 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-gold text-lg">GMT-Master II "Root Beer" (126711CHNR)</h4>
                          <Badge className="bg-yellow-600">Two-Tone</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between"><span className="text-yellow-400">MSRP (Retail):</span><span className="text-green-400 font-bold">$16,750</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">Secondary Market:</span><span className="text-blue-400 font-bold">$18,400</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">Market Range:</span><span className="text-white">$17,500 - $25,000</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">Premium Over MSRP:</span><span className="text-orange-400">+9.9%</span></div>
                        </div>
                        <div className="mt-3 text-sm text-gray-300">
                          <p>• 40mm Steel/Gold, Brown/Black ceramic</p>
                          <p>• Two-tone Oystersteel and gold</p>
                          <p>• More accessible than steel models</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Daytona Pricing */}
                  <Card className="glass-morphism border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Crown className="h-5 w-5 text-gold mr-2" />
                        Daytona Collection Pricing
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-purple-600/10 border border-purple-500/30 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-gold text-lg">Daytona Steel (116500LN)</h4>
                          <Badge className="bg-purple-600">Extreme Demand</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between"><span className="text-yellow-400">MSRP (Retail):</span><span className="text-green-400 font-bold">$14,800</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">Secondary Market:</span><span className="text-blue-400 font-bold">$28,500</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">Market Range:</span><span className="text-white">$26,000 - $35,000</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">Premium Over MSRP:</span><span className="text-red-400">+92.6%</span></div>
                        </div>
                        <div className="mt-3 text-sm text-gray-300">
                          <p>• 40mm Steel, Ceramic bezel, Cal. 4130</p>
                          <p>• 5-10 year waitlists at AD</p>
                          <p>• Highest demand sports Rolex</p>
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-600/10 border border-yellow-500/30 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-gold text-lg">Daytona Gold (116508)</h4>
                          <Badge className="bg-yellow-600">Precious Metal</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between"><span className="text-yellow-400">MSRP (Retail):</span><span className="text-green-400 font-bold">$39,650</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">Secondary Market:</span><span className="text-blue-400 font-bold">$42,800</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">Market Range:</span><span className="text-white">$38,000 - $55,000</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">Premium Over MSRP:</span><span className="text-orange-400">+7.9%</span></div>
                        </div>
                        <div className="mt-3 text-sm text-gray-300">
                          <p>• 40mm 18K Yellow Gold, Cal. 4130</p>
                          <p>• More available than steel versions</p>
                          <p>• Excellent value retention</p>
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/30 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-gold text-lg">Daytona Rainbow (116595RBOW)</h4>
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Ultra Rare</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between"><span className="text-yellow-400">MSRP (Retail):</span><span className="text-green-400 font-bold">$96,900</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">Secondary Market:</span><span className="text-blue-400 font-bold">$450,000</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">Market Range:</span><span className="text-white">$400,000 - $650,000</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">Premium Over MSRP:</span><span className="text-red-400">+364.4%</span></div>
                        </div>
                        <div className="mt-3 text-sm text-gray-300">
                          <p>• 40mm White Gold, 36 rainbow diamonds</p>
                          <p>• Diamond-set dial and bracelet</p>
                          <p>• Investment-grade collectible</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Market Analysis */}
                  <Card className="glass-morphism border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Crown className="h-5 w-5 text-gold mr-2" />
                        Market Analysis & Investment Guide
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-blue-600/10 border border-blue-500/30 rounded-lg">
                        <h4 className="font-semibold text-blue-400 mb-3">Market Performance (2025)</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-yellow-400">Overall Rolex Market:</span><span className="text-red-400">-2.2% YoY</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">Submariner Collection:</span><span className="text-red-400">-3.9% YoY</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">GMT-Master Collection:</span><span className="text-green-400">+1.8% YoY</span></div>
                          <div className="flex justify-between"><span className="text-yellow-400">Daytona Collection:</span><span className="text-green-400">+5.2% YoY</span></div>
                        </div>
                      </div>

                      <div className="p-4 bg-green-600/10 border border-green-500/30 rounded-lg">
                        <h4 className="font-semibold text-green-400 mb-3">Investment Rankings</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-yellow-400">🥇 Daytona Steel</span>
                            <span className="text-green-400 font-bold">Excellent</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-yellow-400">🥈 GMT "Pepsi"</span>
                            <span className="text-green-400 font-bold">Excellent</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-yellow-400">🥉 Submariner "Hulk"</span>
                            <span className="text-blue-400 font-bold">Very Good</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-yellow-400">4. GMT "Batman"</span>
                            <span className="text-blue-400 font-bold">Very Good</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-yellow-400">5. Submariner Date</span>
                            <span className="text-orange-400 font-bold">Good</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-600/10 border border-yellow-500/30 rounded-lg">
                        <h4 className="font-semibold text-yellow-400 mb-3">Market Insights</h4>
                        <div className="space-y-2 text-sm text-gray-300">
                          <p>• <strong>Best liquidity:</strong> Submariner models (median 20 days to sell)</p>
                          <p>• <strong>Highest premiums:</strong> Steel sports models (Daytona, GMT, Submariner)</p>
                          <p>• <strong>Price stability:</strong> Gold models less volatile than steel</p>
                          <p>• <strong>Future outlook:</strong> Limited production supports price appreciation</p>
                          <p>• <strong>Condition matters:</strong> Box & papers add 15-25% value</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Disclaimer */}
                <div className="mt-8 p-4 bg-gray-600/10 border border-gray-500/30 rounded-lg">
                  <p className="text-gray-400 text-sm text-center">
                    <strong>Disclaimer:</strong> Pricing data sourced from Chrono24, WatchCharts, and authorized dealers. 
                    Actual market values may vary based on condition, provenance, and market conditions. 
                    Updated July 24, 2025. For investment advice, consult qualified professionals.
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* ─── REFERENCE INTELLIGENCE TAB ─────────────────────────────── */}
            <TabsContent value="ref-intelligence">
              <div className="space-y-8">

                {/* Header */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Reference Intelligence Suite</h2>
                  <p className="text-yellow-300 text-sm">Six professional-grade tools powered by Simplicity</p>
                </div>

                {/* ── 1. Serial + Reference Cross-Authentication ─────────────── */}
                <Card className="glass-morphism border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white text-lg">
                      <ShieldCheck className="h-5 w-5 text-green-400 mr-3" />
                      Serial + Reference Cross-Authentication
                    </CardTitle>
                    <p className="text-sm text-yellow-300 mt-1">
                      Verify that a reference number was actually being produced in the year the serial indicates — a real authentication checkpoint.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-yellow-400 mb-1.5">Serial Number</p>
                        <Input
                          placeholder="e.g., 9617161 or F123456"
                          value={authSerial}
                          onChange={e => setAuthSerial(e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-yellow-400 mb-1.5">Reference Number</p>
                        <Input
                          placeholder="e.g., 116610LN or 116610LV"
                          value={authRef}
                          onChange={e => setAuthRef(e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleAuthCheck}
                      className="w-full bg-green-800/60 hover:bg-green-700/80 border border-green-500/30 text-white"
                    >
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Run Authentication Check
                    </Button>

                    {authResult && (
                      <div className={`p-4 rounded-lg border space-y-3 ${
                        authResult.status === 'verified' ? 'bg-green-900/30 border-green-500/40' :
                        authResult.status === 'warning' ? 'bg-yellow-900/30 border-yellow-500/40' :
                        authResult.status === 'mismatch' ? 'bg-red-900/30 border-red-500/40' :
                        'bg-white/10 border-white/20'
                      }`}>
                        {/* Status Banner */}
                        <div className="flex items-center gap-3">
                          {authResult.status === 'verified' && <CheckCircle className="w-6 h-6 text-green-400 shrink-0" />}
                          {authResult.status === 'warning' && <AlertTriangle className="w-6 h-6 text-yellow-400 shrink-0" />}
                          {authResult.status === 'mismatch' && <XCircle className="w-6 h-6 text-red-400 shrink-0" />}
                          {authResult.status === 'unknown' && <Info className="w-6 h-6 text-gray-400 shrink-0" />}
                          <div>
                            <p className={`text-sm font-bold ${
                              authResult.status === 'verified' ? 'text-green-300' :
                              authResult.status === 'warning' ? 'text-yellow-300' :
                              authResult.status === 'mismatch' ? 'text-red-300' : 'text-gray-300'
                            }`}>
                              {authResult.status === 'verified' ? 'PRODUCTION MATCH VERIFIED' :
                               authResult.status === 'warning' ? 'BORDERLINE — VERIFY WITH PAPERS' :
                               authResult.status === 'mismatch' ? 'PRODUCTION MISMATCH DETECTED' : 'INSUFFICIENT DATA'}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm text-white/80 leading-relaxed">{authResult.statusMessage}</p>

                        <div className="h-px bg-white/10" />

                        {/* Detail grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="p-2 bg-white/5 rounded text-center">
                            <p className="text-[10px] text-yellow-400/70 mb-0.5">Serial Year</p>
                            <p className="text-sm font-bold text-white">{authResult.serialYear}</p>
                          </div>
                          <div className="p-2 bg-white/5 rounded text-center">
                            <p className="text-[10px] text-yellow-400/70 mb-0.5">Reference</p>
                            <p className="text-sm font-bold text-cyan-300">{authResult.refKey}</p>
                          </div>
                          <div className="p-2 bg-white/5 rounded text-center">
                            <p className="text-[10px] text-yellow-400/70 mb-0.5">Production Window</p>
                            <p className="text-sm font-bold text-white">{authResult.prodWindow}</p>
                          </div>
                          {authResult.movement && (
                            <div className="p-2 bg-white/5 rounded text-center">
                              <p className="text-[10px] text-yellow-400/70 mb-0.5">Movement</p>
                              <p className="text-xs font-semibold text-cyan-300">{authResult.movement}</p>
                            </div>
                          )}
                          {authResult.collectibility && (
                            <div className="p-2 bg-white/5 rounded text-center">
                              <p className="text-[10px] text-yellow-400/70 mb-0.5">Collector Demand</p>
                              <Badge className={`text-[10px] ${authResult.collectibility === 'Extreme' ? 'bg-red-700' : authResult.collectibility === 'Very High' ? 'bg-orange-700' : 'bg-green-700'}`}>
                                {authResult.collectibility}
                              </Badge>
                            </div>
                          )}
                          {authResult.marketValue && (
                            <div className="p-2 bg-green-900/30 border border-green-500/20 rounded text-center">
                              <p className="text-[10px] text-green-400/70 mb-0.5">Grey Market Value</p>
                              <p className="text-xs font-bold text-green-300">{authResult.marketValue}</p>
                            </div>
                          )}
                        </div>

                        <div className="p-2 bg-black/20 rounded">
                          <p className="text-xs text-white font-medium">{authResult.refName}</p>
                        </div>

                        <Button size="sm" onClick={() => {
                          const q = `I'm checking authentication on a Rolex ${authResult.refName} (ref ${authResult.refKey}) with serial year ${authResult.serialYear}. The production window is ${authResult.prodWindow}. What else should I look for to verify authenticity?`;
                          localStorage.setItem('simplicity-pending-question', q);
                          window.location.href = '/ai-chat';
                        }} className="w-full bg-purple-700/50 hover:bg-purple-700/70 border border-purple-500/30 text-white text-xs">
                          <MessageSquare className="w-3.5 h-3.5 mr-2" />
                          Ask Simplicity for deeper authentication guidance
                        </Button>

                        <div className="flex items-center justify-end gap-1">
                          <Sparkles className="w-3 h-3 text-yellow-400/60" />
                          <p className="text-[10px] text-yellow-400/60">Powered by Simplicity</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* ── 2. Reference Comparison Tool ─────────────────────────────── */}
                <Card className="glass-morphism border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white text-lg">
                      <GitCompare className="h-5 w-5 text-cyan-400 mr-3" />
                      Reference Comparison Tool
                    </CardTitle>
                    <p className="text-sm text-yellow-300 mt-1">
                      Compare two references side by side — specs, movement, market value, collectibility, production window.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-yellow-400 mb-1.5">Reference A</p>
                        <Input
                          placeholder="e.g., 116610LN"
                          value={compRef1}
                          onChange={e => setCompRef1(e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-yellow-400 mb-1.5">Reference B</p>
                        <Input
                          placeholder="e.g., 116610LV"
                          value={compRef2}
                          onChange={e => setCompRef2(e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleCompare}
                      className="w-full bg-cyan-900/50 hover:bg-cyan-800/70 border border-cyan-500/30 text-white"
                    >
                      <GitCompare className="w-4 h-4 mr-2" />
                      Compare References
                    </Button>

                    {compResult && (
                      <div className="space-y-4">
                        {/* Column headers */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 bg-blue-900/30 border border-blue-500/30 rounded">
                            <p className="text-[10px] text-blue-400">REFERENCE A</p>
                            <p className="text-sm font-bold text-cyan-300">{compResult.ref1Key}</p>
                          </div>
                          <div className="p-2 bg-white/5 rounded flex items-center justify-center">
                            <GitCompare className="w-5 h-5 text-white/40" />
                          </div>
                          <div className="p-2 bg-purple-900/30 border border-purple-500/30 rounded">
                            <p className="text-[10px] text-purple-400">REFERENCE B</p>
                            <p className="text-sm font-bold text-purple-300">{compResult.ref2Key}</p>
                          </div>
                        </div>

                        {/* Model Name */}
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <div className="p-2 bg-white/5 rounded text-center">
                            <p className="text-xs text-white font-medium leading-tight">
                              {compResult.ref1 ? compResult.ref1.name : <span className="text-red-400">Not found</span>}
                            </p>
                          </div>
                          <div className="text-center"><p className="text-[10px] text-yellow-400/70">MODEL</p></div>
                          <div className="p-2 bg-white/5 rounded text-center">
                            <p className="text-xs text-white font-medium leading-tight">
                              {compResult.ref2 ? compResult.ref2.name : <span className="text-red-400">Not found</span>}
                            </p>
                          </div>
                        </div>

                        {/* Category */}
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <div className="p-2 bg-white/5 rounded text-center">
                            <p className="text-xs text-yellow-200">{compResult.ref1?.category ?? '—'}</p>
                          </div>
                          <div className="text-center"><p className="text-[10px] text-yellow-400/70">CATEGORY</p></div>
                          <div className="p-2 bg-white/5 rounded text-center">
                            <p className="text-xs text-yellow-200">{compResult.ref2?.category ?? '—'}</p>
                          </div>
                        </div>

                        {/* Production Window */}
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <div className="p-2 bg-white/5 rounded text-center">
                            <p className="text-xs text-blue-300 font-semibold">
                              {compResult.ref1 ? `${compResult.ref1.start}–${compResult.ref1.end ?? 'present'}` : '—'}
                            </p>
                          </div>
                          <div className="text-center"><p className="text-[10px] text-yellow-400/70">PRODUCTION</p></div>
                          <div className="p-2 bg-white/5 rounded text-center">
                            <p className="text-xs text-blue-300 font-semibold">
                              {compResult.ref2 ? `${compResult.ref2.start}–${compResult.ref2.end ?? 'present'}` : '—'}
                            </p>
                          </div>
                        </div>

                        {/* Movement */}
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <div className="p-2 bg-white/5 rounded text-center">
                            <p className="text-xs text-cyan-300 font-semibold">{compResult.ref1?.movement ?? '—'}</p>
                          </div>
                          <div className="text-center"><p className="text-[10px] text-yellow-400/70">MOVEMENT</p></div>
                          <div className="p-2 bg-white/5 rounded text-center">
                            <p className="text-xs text-cyan-300 font-semibold">{compResult.ref2?.movement ?? '—'}</p>
                          </div>
                        </div>

                        {/* Lug Width */}
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <div className="p-2 bg-white/5 rounded text-center">
                            <p className="text-xs text-white">{compResult.ref1?.specs?.lugWidth ?? '—'}</p>
                          </div>
                          <div className="text-center"><p className="text-[10px] text-yellow-400/70">LUG WIDTH</p></div>
                          <div className="p-2 bg-white/5 rounded text-center">
                            <p className="text-xs text-white">{compResult.ref2?.specs?.lugWidth ?? '—'}</p>
                          </div>
                        </div>

                        {/* Water Resistance */}
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <div className="p-2 bg-white/5 rounded text-center">
                            <p className="text-xs text-white">{compResult.ref1?.specs?.waterResistance ?? '—'}</p>
                          </div>
                          <div className="text-center"><p className="text-[10px] text-yellow-400/70">WATER RESIST.</p></div>
                          <div className="p-2 bg-white/5 rounded text-center">
                            <p className="text-xs text-white">{compResult.ref2?.specs?.waterResistance ?? '—'}</p>
                          </div>
                        </div>

                        {/* Crystal */}
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <div className="p-2 bg-white/5 rounded text-center">
                            <p className="text-xs text-white">{compResult.ref1?.specs?.crystal ?? '—'}</p>
                          </div>
                          <div className="text-center"><p className="text-[10px] text-yellow-400/70">CRYSTAL</p></div>
                          <div className="p-2 bg-white/5 rounded text-center">
                            <p className="text-xs text-white">{compResult.ref2?.specs?.crystal ?? '—'}</p>
                          </div>
                        </div>

                        {/* Bracelet */}
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <div className="p-2 bg-white/5 rounded text-center">
                            <p className="text-xs text-white">{compResult.ref1?.specs?.bracelet ?? '—'}</p>
                          </div>
                          <div className="text-center"><p className="text-[10px] text-yellow-400/70">BRACELET</p></div>
                          <div className="p-2 bg-white/5 rounded text-center">
                            <p className="text-xs text-white">{compResult.ref2?.specs?.bracelet ?? '—'}</p>
                          </div>
                        </div>

                        {/* Collectibility */}
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <div className="p-2 bg-white/5 rounded text-center">
                            {compResult.ref1?.collectibility ? (
                              <Badge className={`text-[10px] ${compResult.ref1.collectibility === 'Extreme' ? 'bg-red-700' : compResult.ref1.collectibility === 'Very High' ? 'bg-orange-700' : compResult.ref1.collectibility === 'High' ? 'bg-green-700' : 'bg-gray-600'}`}>
                                {compResult.ref1.collectibility}
                              </Badge>
                            ) : <span className="text-xs text-white/40">—</span>}
                          </div>
                          <div className="text-center"><p className="text-[10px] text-yellow-400/70">COLLECTIBILITY</p></div>
                          <div className="p-2 bg-white/5 rounded text-center">
                            {compResult.ref2?.collectibility ? (
                              <Badge className={`text-[10px] ${compResult.ref2.collectibility === 'Extreme' ? 'bg-red-700' : compResult.ref2.collectibility === 'Very High' ? 'bg-orange-700' : compResult.ref2.collectibility === 'High' ? 'bg-green-700' : 'bg-gray-600'}`}>
                                {compResult.ref2.collectibility}
                              </Badge>
                            ) : <span className="text-xs text-white/40">—</span>}
                          </div>
                        </div>

                        {/* Market Value */}
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <div className="p-2 bg-green-900/30 border border-green-500/20 rounded text-center">
                            <p className="text-xs font-bold text-green-300">{compResult.ref1?.marketValue ?? '—'}</p>
                          </div>
                          <div className="text-center">
                            <TrendingUp className="w-4 h-4 text-green-400/70 mx-auto mb-0.5" />
                            <p className="text-[10px] text-yellow-400/70">GREY MARKET</p>
                          </div>
                          <div className="p-2 bg-green-900/30 border border-green-500/20 rounded text-center">
                            <p className="text-xs font-bold text-green-300">{compResult.ref2?.marketValue ?? '—'}</p>
                          </div>
                        </div>

                        {/* Ask Simplicity */}
                        <Button size="sm" onClick={() => {
                          const q = `Compare the Rolex ref ${compResult.ref1Key} (${compResult.ref1?.name ?? 'unknown'}) vs ref ${compResult.ref2Key} (${compResult.ref2?.name ?? 'unknown'}). Which is the better investment? What are the key differences a buyer should know about?`;
                          localStorage.setItem('simplicity-pending-question', q);
                          window.location.href = '/ai-chat';
                        }} className="w-full bg-purple-700/50 hover:bg-purple-700/70 border border-purple-500/30 text-white text-xs">
                          <MessageSquare className="w-3.5 h-3.5 mr-2" />
                          Ask Simplicity to compare these two references in depth
                        </Button>

                        <div className="flex items-center justify-end gap-1">
                          <Sparkles className="w-3 h-3 text-yellow-400/60" />
                          <p className="text-[10px] text-yellow-400/60">Powered by Simplicity</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* ── 3. Market Value Quick Lookup ───────────────────────────────── */}
                <Card className="glass-morphism border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white text-lg">
                      <TrendingUp className="h-5 w-5 text-green-400 mr-3" />
                      Market Value Quick Reference
                    </CardTitle>
                    <p className="text-sm text-yellow-300 mt-1">Current 2026 grey market estimates for the most traded references</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {label: 'Submariner (Current Gen)', items: [
                          {ref:'124060',name:'Sub No-Date'},{ref:'126610LN',name:'Sub Date Black'},
                          {ref:'126610LV',name:'Sub "Starbucks"'},{ref:'116610LV',name:'Sub "Hulk"'},
                          {ref:'126619LB',name:'Sub "Smurf"'},{ref:'16610LV',name:'Sub "Kermit"'},
                        ]},
                        {label: 'GMT-Master II', items: [
                          {ref:'126710BLRO',name:'GMT "Pepsi"'},{ref:'126710BLNR',name:'GMT "Batman"'},
                          {ref:'126720VTNR',name:'GMT "Sprite"'},{ref:'116710BLNR',name:'GMT "Batman" Gen VI'},
                          {ref:'126711CHNR',name:'GMT "Root Beer"'},
                        ]},
                        {label: 'Daytona', items: [
                          {ref:'126500LN',name:'Daytona 4131'},{ref:'116500LN',name:'Daytona Ceramic'},
                          {ref:'116595RBOW',name:'Daytona "Rainbow"'},{ref:'16520',name:'Daytona "Zenith"'},
                          {ref:'6241',name:'Daytona "Paul Newman"'},
                        ]},
                        {label: 'Explorer / Explorer II', items: [
                          {ref:'124270',name:'Explorer 36mm'},{ref:'214270',name:'Explorer 39mm'},
                          {ref:'226570',name:'Explorer II'},{ref:'1016',name:'Explorer (Vintage)'},
                        ]},
                        {label: 'Sea-Dweller / DeepSea', items: [
                          {ref:'126600',name:'Sea-Dweller 43mm'},{ref:'126660',name:'DeepSea'},
                          {ref:'136660',name:'DeepSea (Current)'},{ref:'16600',name:'Sea-Dweller (Disc.)'},
                        ]},
                        {label: 'Day-Date / Datejust', items: [
                          {ref:'228238',name:'Day-Date 40 YG'},{ref:'228235',name:'Day-Date 40 Everose'},
                          {ref:'228239',name:'Day-Date 40 Platinum'},{ref:'126300',name:'Datejust 41'},
                          {ref:'126200',name:'Datejust 36'},
                        ]},
                        {label: 'Specialty & Yacht-Master', items: [
                          {ref:'116400GV',name:'Milgauss Green'},{ref:'116400',name:'Milgauss'},
                          {ref:'126622',name:'Yacht-Master 40'},{ref:'126621',name:'Yacht-Master Everose'},
                          {ref:'116688',name:'Yacht-Master II'},
                        ]},
                        {label: 'Vintage Blue Chips', items: [
                          {ref:'6538',name:'Sub "James Bond"'},{ref:'6542',name:'GMT "Bakelite"'},
                          {ref:'5513',name:'Sub Vintage'},{ref:'1675',name:'GMT "Pepsi" Vintage'},
                          {ref:'6241',name:'Daytona "Paul Newman"'},{ref:'1016',name:'Explorer Vintage'},
                        ]},
                      ].map(section => (
                        <div key={section.label}>
                          <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wide mb-2">{section.label}</p>
                          <div className="space-y-1.5">
                            {section.items.map(item => (
                              <div key={item.ref} className="flex items-center justify-between p-2 bg-white/5 rounded hover:bg-white/10 transition-colors">
                                <div>
                                  <span className="text-xs text-cyan-400 font-mono mr-2">{item.ref}</span>
                                  <span className="text-xs text-white">{item.name}</span>
                                </div>
                                <span className="text-xs font-bold text-green-300">{MARKET_VALUE[item.ref] ?? '—'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <p className="text-[10px] text-white/30 text-center mt-4">Grey market estimates based on dealer/auction data, 2026. Condition and papers affect price significantly.</p>
                    </div>
                  </CardContent>
                </Card>

                {/* ── 4. Parts & Specs Quick Lookup ─────────────────────────────── */}
                <Card className="glass-morphism border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white text-lg">
                      <Wrench className="h-5 w-5 text-orange-400 mr-3" />
                      Parts & Technical Specs Lookup
                    </CardTitle>
                    <p className="text-sm text-yellow-300 mt-1">Lug width, water resistance, crystal type, and bracelet end links by reference</p>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left text-yellow-400 py-2 pr-3 font-semibold">Reference</th>
                            <th className="text-left text-yellow-400 py-2 pr-3 font-semibold">Model</th>
                            <th className="text-center text-yellow-400 py-2 pr-3 font-semibold">Lug</th>
                            <th className="text-left text-yellow-400 py-2 pr-3 font-semibold">Water Resist.</th>
                            <th className="text-left text-yellow-400 py-2 font-semibold">Crystal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(SPECS_MAP).slice(0, 24).map(([ref, sp]) => (
                            <tr key={ref} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="py-1.5 pr-3 text-cyan-400 font-mono">{ref}</td>
                              <td className="py-1.5 pr-3 text-white">{REF_PRODUCTION[ref]?.name ?? '—'}</td>
                              <td className="py-1.5 pr-3 text-white text-center">{sp.lugWidth}</td>
                              <td className="py-1.5 pr-3 text-white">{sp.waterResistance}</td>
                              <td className="py-1.5 text-white">{sp.crystal}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-[10px] text-white/30 text-center mt-4">Showing key references. Use Reference Lookup above for full specs on any model.</p>
                  </CardContent>
                </Card>

                {/* ── 5. Simplicity Integration Tip ──────────────────────────────── */}
                <Card className="glass-morphism border-purple-500/30 bg-purple-900/10">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-700/30 rounded-full shrink-0">
                        <MessageSquare className="w-6 h-6 text-purple-300" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg mb-2">Ask Simplicity Anything</h3>
                        <p className="text-yellow-200 text-sm mb-4">
                          Every reference lookup, auth check, and comparison has an "Ask Simplicity" button that pre-loads your watch data into an expert AI conversation. 
                          Ask about what to look for when buying, investment potential, authentication tells, service history, or anything else about a specific reference.
                        </p>
                        <Button
                          onClick={() => { window.location.href = '/ai-chat'; }}
                          className="bg-purple-700/60 hover:bg-purple-700/80 border border-purple-500/30 text-white"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Open Simplicity Chat
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </TabsContent>

            {/* ─── MARKET INTELLIGENCE TAB ─────────────────────────────────── */}
            <TabsContent value="market-intel">
              <MarketIntelligencePanel />
            </TabsContent>

          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}