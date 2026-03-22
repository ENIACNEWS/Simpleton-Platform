import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Diamond, TrendingUp, Sparkles, Award, Calculator, CircleDot, Plus, Minus, ChevronDown, ChevronUp, Info } from 'lucide-react';

const CLARITY_OPTIONS = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'] as const;
const COLOR_OPTIONS = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'] as const;
const SHAPE_OPTIONS = ['Round', 'Princess', 'Cushion', 'Emerald', 'Oval', 'Pear', 'Marquise', 'Heart'] as const;

const BASE_PRICES: Record<string, number> = {
  FL: 15000, IF: 12000, VVS1: 9500, VVS2: 8000, VS1: 6500, VS2: 5500,
  SI1: 4200, SI2: 3200, I1: 2400, I2: 1800, I3: 1200,
};

const COLOR_MULTIPLIERS: Record<string, number> = {
  D: 1.75, E: 1.55, F: 1.35, G: 1.20, H: 1.10, I: 1.00, J: 0.90, K: 0.80, L: 0.70, M: 0.60,
};

const SHAPE_MULTIPLIERS: Record<string, number> = {
  Round: 1.35, Princess: 1.02, Cushion: 1.04, Emerald: 1.03, Oval: 1.06, Pear: 1.00, Marquise: 0.93, Heart: 0.80,
};

function calcDiamondPrice(carat: number, color: string, clarity: string, shape: string, labGrown: boolean) {
  const base = BASE_PRICES[clarity] || 4200;
  const colorMul = COLOR_MULTIPLIERS[color] || 1.0;
  const shapeMul = SHAPE_MULTIPLIERS[shape] || 1.0;
  const total = carat * base * colorMul * shapeMul * (labGrown ? 0.5 : 1);
  return total;
}

function PanelWrapper({ icon, title, children }: { icon: JSX.Element; title: string; children: JSX.Element | JSX.Element[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl shadow-2xl overflow-hidden" style={{ background: 'rgba(8,8,16,0.95)', border: '1px solid rgba(185,220,255,0.08)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span style={{ color: 'rgba(185,220,255,0.6)' }}>{icon}</span>
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t" style={{ borderColor: 'rgba(185,220,255,0.06)' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'number', min, max, step }: { label: string; value: string | number; onChange: (v: string) => void; type?: string; min?: number; max?: number; step?: number }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        step={step}
        className="rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-blue-400/30 transition-colors"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: readonly string[] | string[] }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400/30 transition-colors appearance-none"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-gray-900">{o}</option>
        ))}
      </select>
    </div>
  );
}

interface DiamondEntry {
  carat: number;
  color: string;
  clarity: string;
  shape: string;
  type: string;
}

export function DiamondComparisonPanel() {
  const [diamonds, setDiamonds] = useState<DiamondEntry[]>([
    { carat: 1.0, color: 'G', clarity: 'VS1', shape: 'Round', type: 'Natural' },
    { carat: 1.0, color: 'H', clarity: 'SI1', shape: 'Round', type: 'Natural' },
  ]);

  const update = (idx: number, field: keyof DiamondEntry, val: string | number) => {
    setDiamonds((prev) => prev.map((d, i) => (i === idx ? { ...d, [field]: field === 'carat' ? parseFloat(val as string) || 0 : val } : d)));
  };

  const prices = diamonds.map((d) => calcDiamondPrice(d.carat, d.color, d.clarity, d.shape, d.type === 'Lab-Grown'));
  const perCaratPrices = diamonds.map((d, i) => (d.carat > 0 ? prices[i] / d.carat : 0));
  const bestIdx = perCaratPrices.indexOf(Math.min(...perCaratPrices.filter((p) => p > 0)));

  return (
    <PanelWrapper icon={<Diamond className="w-5 h-5" />} title="Diamond Comparison Tool">
      <div className="pt-4 space-y-4">
        <div className="flex gap-2 mb-3">
          {diamonds.length < 4 && (
            <button onClick={() => setDiamonds([...diamonds, { carat: 1.0, color: 'G', clarity: 'VS1', shape: 'Round', type: 'Natural' }])} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors" style={{ background: 'rgba(185,220,255,0.08)', color: 'rgba(185,220,255,0.6)', border: '1px solid rgba(185,220,255,0.1)' }}>
              <Plus className="w-3 h-3" /> Add Diamond
            </button>
          )}
          {diamonds.length > 2 && (
            <button onClick={() => setDiamonds(diamonds.slice(0, -1))} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600/20 text-red-300 text-xs hover:bg-red-600/40 transition-colors border border-red-500/20">
              <Minus className="w-3 h-3" /> Remove Last
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {diamonds.map((d, i) => {
            const total = prices[i];
            const ppc = perCaratPrices[i];
            const isBest = i === bestIdx && total > 0;
            return (
              <div key={i} className={`rounded-xl p-4 border space-y-3 ${isBest ? 'border-green-500/40 bg-green-500/5' : 'border-white/5 bg-white/[0.02]'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Diamond {i + 1}</span>
                  {isBest && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-500/20 text-green-400">BEST VALUE</span>}
                </div>
                <InputField label="Carat" value={d.carat} onChange={(v) => update(i, 'carat', v)} min={0.1} max={30} step={0.01} />
                <SelectField label="Color" value={d.color} onChange={(v) => update(i, 'color', v)} options={COLOR_OPTIONS} />
                <SelectField label="Clarity" value={d.clarity} onChange={(v) => update(i, 'clarity', v)} options={CLARITY_OPTIONS} />
                <SelectField label="Shape" value={d.shape} onChange={(v) => update(i, 'shape', v)} options={SHAPE_OPTIONS} />
                <SelectField label="Type" value={d.type} onChange={(v) => update(i, 'type', v)} options={['Natural', 'Lab-Grown']} />
                <div className="pt-2 border-t border-white/5 space-y-1">
                  <div className="flex justify-between text-xs"><span className="text-gray-400">Total Price</span><span className="font-mono text-white font-bold">${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-400">Price/Carat</span><span className="font-mono" style={{ color: 'rgba(185,220,255,0.5)' }}>${ppc.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PanelWrapper>
  );
}

const HISTORY_DATA = {
  'D/IF': [
    { year: 2021, price: 16500 }, { year: 2022, price: 15200 }, { year: 2023, price: 15800 }, { year: 2024, price: 16900 }, { year: 2025, price: 17500 },
  ],
  'G/VS1': [
    { year: 2021, price: 7200 }, { year: 2022, price: 6500 }, { year: 2023, price: 6900 }, { year: 2024, price: 7400 }, { year: 2025, price: 7800 },
  ],
  'I/SI1': [
    { year: 2021, price: 3800 }, { year: 2022, price: 3400 }, { year: 2023, price: 3600 }, { year: 2024, price: 3900 }, { year: 2025, price: 4200 },
  ],
};

const LINE_COLORS: Record<string, string> = { 'D/IF': '#b9dcff', 'G/VS1': '#60a5fa', 'I/SI1': '#34d399' };

export function DiamondPriceHistoryPanel() {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; price: number; year: number } | null>(null);

  const allPrices = Object.values(HISTORY_DATA).flat().map((d) => d.price);
  const minP = Math.min(...allPrices) * 0.9;
  const maxP = Math.max(...allPrices) * 1.05;
  const W = 600;
  const H = 250;
  const padL = 60;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const toX = (year: number) => padL + ((year - 2021) / 4) * chartW;
  const toY = (price: number) => padT + chartH - ((price - minP) / (maxP - minP)) * chartH;

  return (
    <PanelWrapper icon={<TrendingUp className="w-5 h-5" />} title="Diamond Price History (5-Year Trends)">
      <div className="pt-4">
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[700px] mx-auto" onMouseLeave={() => setTooltip(null)}>
            {[0, 1, 2, 3, 4].map((i) => {
              const y = padT + (chartH / 4) * i;
              const val = maxP - ((maxP - minP) / 4) * i;
              return (
                <g key={i}>
                  <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgba(255,255,255,0.06)" />
                  <text x={padL - 6} y={y + 4} textAnchor="end" fill="#9ca3af" fontSize="10" fontFamily="monospace">${(val / 1000).toFixed(1)}k</text>
                </g>
              );
            })}
            {[2021, 2022, 2023, 2024, 2025].map((yr) => (
              <text key={yr} x={toX(yr)} y={H - 8} textAnchor="middle" fill="#9ca3af" fontSize="10" fontFamily="monospace">{yr}</text>
            ))}
            {Object.entries(HISTORY_DATA).map(([label, data]) => {
              const pts = data.map((d) => `${toX(d.year)},${toY(d.price)}`).join(' ');
              return (
                <g key={label}>
                  <polyline points={pts} fill="none" stroke={LINE_COLORS[label]} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                  {data.map((d) => (
                    <circle
                      key={d.year}
                      cx={toX(d.year)}
                      cy={toY(d.price)}
                      r="4"
                      fill={LINE_COLORS[label]}
                      stroke="rgba(0,0,0,0.5)"
                      strokeWidth="1"
                      className="cursor-pointer"
                      onMouseEnter={(e) => {
                        const rect = (e.target as SVGElement).closest('svg')?.getBoundingClientRect();
                        if (rect) setTooltip({ x: toX(d.year), y: toY(d.price) - 12, label, price: d.price, year: d.year });
                      }}
                    />
                  ))}
                </g>
              );
            })}
            {tooltip && (
              <g>
                <rect x={tooltip.x - 55} y={tooltip.y - 30} width="110" height="28" rx="6" fill="rgba(15,15,20,0.95)" stroke="rgba(185,220,255,0.2)" />
                <text x={tooltip.x} y={tooltip.y - 12} textAnchor="middle" fill="white" fontSize="10" fontFamily="monospace">
                  {tooltip.year} · ${tooltip.price.toLocaleString()}
                </text>
              </g>
            )}
          </svg>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {Object.keys(HISTORY_DATA).map((label) => (
            <div key={label} className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full" style={{ background: LINE_COLORS[label] }} />
              <span className="text-gray-300">1ct {label}</span>
            </div>
          ))}
        </div>
      </div>
    </PanelWrapper>
  );
}

const FLUORESCENCE_LEVELS = [
  { name: 'None', impact: '0%', low: 0, high: 0, color: 'from-gray-500 to-gray-600' },
  { name: 'Faint', impact: '-1%', low: -1, high: -1, color: 'from-blue-900 to-blue-800' },
  { name: 'Medium', impact: '-3% to -5%', low: -3, high: -5, color: 'from-blue-700 to-blue-600' },
  { name: 'Strong', impact: '-7% to -15%', low: -7, high: -15, color: 'from-blue-500 to-blue-400' },
  { name: 'Very Strong', impact: '-10% to -25%', low: -10, high: -25, color: 'from-blue-400 to-cyan-400' },
];

export function FluorescencePanel() {
  const [basePrice, setBasePrice] = useState(10000);

  return (
    <PanelWrapper icon={<Sparkles className="w-5 h-5" />} title="Fluorescence Impact Calculator">
      <div className="pt-4 space-y-5">
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-300 leading-relaxed">
            Fluorescence is the visible light some diamonds emit when exposed to UV rays. While faint fluorescence rarely affects value, strong fluorescence can cause a hazy or milky appearance in higher-color diamonds (D-H), reducing their market price. In lower-color diamonds (I+), medium fluorescence may actually improve perceived color.
          </p>
        </div>

        <InputField label="Base Diamond Price ($)" value={basePrice} onChange={(v) => setBasePrice(parseFloat(v) || 0)} min={0} step={100} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {FLUORESCENCE_LEVELS.map((f) => {
            const avgImpact = (f.low + f.high) / 2;
            const adjusted = basePrice * (1 + avgImpact / 100);
            return (
              <div key={f.name} className="rounded-xl p-3 border border-white/5 bg-white/[0.02] space-y-2">
                <div className={`h-2 rounded-full bg-gradient-to-r ${f.color}`} />
                <div className="text-sm font-bold text-white">{f.name}</div>
                <div className="text-xs font-mono" style={{ color: 'rgba(185,220,255,0.5)' }}>{f.impact}</div>
                <div className="pt-1 border-t border-white/5">
                  <span className="text-xs text-gray-400">Adjusted: </span>
                  <span className="font-mono text-sm text-white">${adjusted.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PanelWrapper>
  );
}

const CERT_LABS = [
  { name: 'GIA', premium: '+10% to +15%', low: 10, high: 15, desc: 'Gemological Institute of America — the global gold standard for diamond grading. Most trusted and consistent grading worldwide.', badge: 'bg-blue-600/30 text-blue-200' },
  { name: 'AGS', premium: '+5% to +10%', low: 5, high: 10, desc: 'American Gem Society — known for rigorous cut grading and scientific approach. Highly respected in the US market.', badge: 'bg-blue-600/30 text-blue-300' },
  { name: 'IGI', premium: '+0% to +5%', low: 0, high: 5, desc: 'International Gemological Institute — popular for lab-grown diamond grading. Growing reputation with consistent standards.', badge: 'bg-teal-600/30 text-teal-300' },
  { name: 'EGL', premium: '-5% to -10%', low: -5, high: -10, desc: 'European Gemological Laboratory — historically lenient grading. Often grades 1-2 grades higher than GIA standards.', badge: 'bg-orange-600/30 text-orange-300' },
  { name: 'None', premium: '-15% to -25%', low: -15, high: -25, desc: 'Uncertified diamond — no third-party verification of quality. Significantly reduces resale value and buyer confidence.', badge: 'bg-red-600/30 text-red-300' },
];

export function CertificationPremiumPanel() {
  const [baseValue, setBaseValue] = useState(10000);

  return (
    <PanelWrapper icon={<Award className="w-5 h-5" />} title="Certification Premium Comparison">
      <div className="pt-4 space-y-5">
        <InputField label="Base Diamond Value ($)" value={baseValue} onChange={(v) => setBaseValue(parseFloat(v) || 0)} min={0} step={100} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {CERT_LABS.map((lab) => {
            const avgPremium = (lab.low + lab.high) / 2;
            const adjusted = baseValue * (1 + avgPremium / 100);
            return (
              <div key={lab.name} className="rounded-xl p-4 border border-white/5 bg-white/[0.02] space-y-3 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold px-2 py-0.5 rounded ${lab.badge}`}>{lab.name}</span>
                  <span className="text-xs font-mono text-gray-400">{lab.premium}</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed flex-1">{lab.desc}</p>
                <div className="pt-2 border-t border-white/5">
                  <span className="text-xs text-gray-400">Value: </span>
                  <span className={`font-mono text-sm font-bold ${avgPremium >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${adjusted.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PanelWrapper>
  );
}

export function InvestmentCalculatorPanel() {
  const [purchasePrice, setPurchasePrice] = useState(10000);
  const [purchaseYear, setPurchaseYear] = useState('2015');
  const [diamondType, setDiamondType] = useState('Natural');

  const currentYear = 2025;
  const years = currentYear - parseInt(purchaseYear);
  const yearOptions = Array.from({ length: 26 }, (_, i) => String(2000 + i));

  const naturalRate = 0.04;
  const labRate = -0.20;
  const rate = diamondType === 'Natural' ? naturalRate : labRate;
  const currentValue = purchasePrice * Math.pow(1 + rate, years);
  const gainLoss = currentValue - purchasePrice;
  const annualizedReturn = years > 0 ? (Math.pow(currentValue / purchasePrice, 1 / years) - 1) * 100 : 0;
  const maxBar = Math.max(purchasePrice, currentValue);

  return (
    <PanelWrapper icon={<Calculator className="w-5 h-5" />} title="Diamond Investment Calculator">
      <div className="pt-4 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InputField label="Purchase Price ($)" value={purchasePrice} onChange={(v) => setPurchasePrice(parseFloat(v) || 0)} min={0} step={100} />
          <SelectField label="Purchase Year" value={purchaseYear} onChange={setPurchaseYear} options={yearOptions} />
          <SelectField label="Diamond Type" value={diamondType} onChange={setDiamondType} options={['Natural', 'Lab-Grown']} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl p-4 border border-white/5 bg-white/[0.02]">
            <div className="text-xs text-gray-400 mb-1">Current Estimated Value</div>
            <div className="text-xl font-mono font-bold text-white">${currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
          <div className="rounded-xl p-4 border border-white/5 bg-white/[0.02]">
            <div className="text-xs text-gray-400 mb-1">Total Gain/Loss</div>
            <div className={`text-xl font-mono font-bold ${gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {gainLoss >= 0 ? '+' : ''}{gainLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="rounded-xl p-4 border border-white/5 bg-white/[0.02]">
            <div className="text-xs text-gray-400 mb-1">Annualized Return</div>
            <div className={`text-xl font-mono font-bold ${annualizedReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {annualizedReturn >= 0 ? '+' : ''}{annualizedReturn.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-gray-400">Purchase vs Current Value</div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-20">Purchase</span>
              <div className="flex-1 h-6 rounded-lg bg-white/5 overflow-hidden">
                <div className="h-full rounded-lg transition-all duration-500" style={{ width: `${maxBar > 0 ? (purchasePrice / maxBar) * 100 : 0}%`, background: 'linear-gradient(to right, rgba(185,220,255,0.3), rgba(185,220,255,0.2))' }} />
              </div>
              <span className="text-xs font-mono text-white w-24 text-right">${purchasePrice.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-20">Current</span>
              <div className="flex-1 h-6 rounded-lg bg-white/5 overflow-hidden">
                <div className={`h-full rounded-lg transition-all duration-500 ${gainLoss >= 0 ? 'bg-gradient-to-r from-green-600 to-green-500' : 'bg-gradient-to-r from-red-600 to-red-500'}`} style={{ width: `${maxBar > 0 ? (currentValue / maxBar) * 100 : 0}%` }} />
              </div>
              <span className="text-xs font-mono text-white w-24 text-right">${currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: 'rgba(185,220,255,0.03)', border: '1px solid rgba(185,220,255,0.06)' }}>
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'rgba(185,220,255,0.5)' }} />
          <p className="text-xs text-gray-400 leading-relaxed">
            {diamondType === 'Natural'
              ? 'Natural diamonds have historically appreciated 3-5% annually, driven by supply constraints and enduring demand. Actual returns vary based on quality, market conditions, and certification.'
              : 'Lab-grown diamonds have experienced significant depreciation (15-25% annually) as production technology improves and supply increases. They are not considered investment vehicles.'}
          </p>
        </div>
      </div>
    </PanelWrapper>
  );
}

const METALS = [
  { name: '14K Gold', priceKey: 'gold', purity: 0.585 },
  { name: '18K Gold', priceKey: 'gold', purity: 0.75 },
  { name: 'Platinum', priceKey: 'platinum', purity: 0.95 },
  { name: 'Palladium', priceKey: 'palladium', purity: 0.95 },
  { name: 'Sterling Silver', priceKey: 'silver', purity: 0.925 },
];

const SETTINGS = [
  { name: 'Solitaire', grams: 4, labor: 300 },
  { name: 'Halo', grams: 5.5, labor: 600 },
  { name: 'Three-Stone', grams: 6, labor: 700 },
  { name: 'Pavé', grams: 5, labor: 800 },
  { name: 'Vintage', grams: 6.5, labor: 900 },
  { name: 'Cathedral', grams: 5.5, labor: 500 },
];

export function RingSettingEstimatorPanel() {
  const [diamondCost, setDiamondCost] = useState(5000);
  const [metalIdx, setMetalIdx] = useState(0);
  const [settingIdx, setSettingIdx] = useState(0);
  const [metalPrices, setMetalPrices] = useState<Record<string, number>>({ gold: 65, platinum: 32, palladium: 38, silver: 0.85 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchPrices = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/pricing/kitco');
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data) {
            const goldOz = data.gold?.price || data.prices?.gold || 2400;
            const platOz = data.platinum?.price || data.prices?.platinum || 1000;
            const palOz = data.palladium?.price || data.prices?.palladium || 1200;
            const silverOz = data.silver?.price || data.prices?.silver || 28;
            setMetalPrices({
              gold: goldOz / 31.1035,
              platinum: platOz / 31.1035,
              palladium: palOz / 31.1035,
              silver: silverOz / 31.1035,
            });
          }
        }
      } catch {
        // keep fallback prices
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPrices();
    return () => { cancelled = true; };
  }, []);

  const metal = METALS[metalIdx];
  const setting = SETTINGS[settingIdx];
  const pricePerGram = metalPrices[metal.priceKey] || 0;
  const metalCost = setting.grams * pricePerGram * metal.purity;
  const totalRing = diamondCost + metalCost + setting.labor;

  return (
    <PanelWrapper icon={<CircleDot className="w-5 h-5" />} title="Ring Setting Cost Estimator">
      <div className="pt-4 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InputField label="Diamond Cost ($)" value={diamondCost} onChange={(v) => setDiamondCost(parseFloat(v) || 0)} min={0} step={100} />
          <SelectField label="Metal" value={metal.name} onChange={(v) => setMetalIdx(METALS.findIndex((m) => m.name === v))} options={METALS.map((m) => m.name)} />
          <SelectField label="Setting Style" value={setting.name} onChange={(v) => setSettingIdx(SETTINGS.findIndex((s) => s.name === v))} options={SETTINGS.map((s) => s.name)} />
        </div>

        <div className="rounded-xl border border-white/5 bg-white/[0.02] divide-y divide-white/5">
          <div className="flex justify-between px-4 py-3">
            <span className="text-sm text-gray-400">Diamond</span>
            <span className="font-mono text-sm text-white">${diamondCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between px-4 py-3">
            <span className="text-sm text-gray-400">{metal.name} ({setting.grams}g × ${pricePerGram.toFixed(2)}/g × {metal.purity})</span>
            <span className="font-mono text-sm text-white">${metalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between px-4 py-3">
            <span className="text-sm text-gray-400">Labor ({setting.name} setting)</span>
            <span className="font-mono text-sm text-white">${setting.labor.toLocaleString()}</span>
          </div>
          <div className="flex justify-between px-4 py-3" style={{ background: 'rgba(185,220,255,0.03)' }}>
            <span className="text-sm font-bold text-white">Total Ring Estimate</span>
            <span className="font-mono text-lg font-bold bg-gradient-to-r from-blue-300 to-blue-400 bg-clip-text text-transparent">
              ${totalRing.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {loading && <p className="text-xs text-gray-500 text-center">Fetching live metal prices…</p>}
      </div>
    </PanelWrapper>
  );
}