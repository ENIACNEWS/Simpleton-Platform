import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { useLivePricing } from "@/hooks/use-live-pricing";
import { useAppMode } from "@/hooks/use-app-mode";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Brain,
  Calculator,
  ChevronDown,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  Loader2,
  ImagePlus,
  Camera,
  X,
  Scale,
  RotateCcw,
  Diamond,
  Sparkles,
  Zap,
  Shield,
  Menu,
} from "lucide-react";

const TROY_OZ_GRAMS = 31.1034768;

const GOLD_KARATS = [
  { label: "24K", purity: 99.9, desc: "Pure Gold" },
  { label: "22K", purity: 91.7, desc: "Investment" },
  { label: "21K", purity: 87.5, desc: "High Grade" },
  { label: "20K", purity: 83.3, desc: "Premium" },
  { label: "18K", purity: 75.0, desc: "Fine Jewelry" },
  { label: "16K", purity: 66.7, desc: "Quality" },
  { label: "14K", purity: 58.3, desc: "Standard" },
  { label: "12K", purity: 50.0, desc: "Medium" },
  { label: "10K", purity: 41.7, desc: "Entry Level" },
  { label: "9K", purity: 37.5, desc: "Basic" },
  { label: "8K", purity: 33.3, desc: "Low Grade" },
  { label: "6K", purity: 25.0, desc: "Minimal" },
];

const SILVER_PURITIES = [
  { label: ".999", purity: 99.9, desc: "Fine Silver" },
  { label: ".958", purity: 95.8, desc: "Britannia" },
  { label: ".925", purity: 92.5, desc: "Sterling" },
  { label: ".900", purity: 90.0, desc: "Coin Silver" },
  { label: ".835", purity: 83.5, desc: "European" },
  { label: ".800", purity: 80.0, desc: "Standard" },
];

const PLATINUM_PURITIES = [
  { label: ".999", purity: 99.9, desc: "Pure" },
  { label: ".950", purity: 95.0, desc: "Premium" },
  { label: ".900", purity: 90.0, desc: "Standard" },
];

const DIAMOND_SHAPES = ["Round", "Princess", "Cushion", "Emerald", "Oval", "Pear", "Marquise", "Asscher", "Radiant", "Heart"];
const DIAMOND_COLORS = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
const DIAMOND_CLARITIES = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3"];
const DIAMOND_CUTS = ["Excellent", "Very Good", "Good", "Fair", "Poor"];

type Metal = "gold" | "silver" | "platinum";
type WeightUnit = "grams" | "oz" | "dwt";

interface ScrapItem {
  id: number;
  metal: Metal;
  karat: string;
  purity: number;
  weight: number;
  unit: WeightUnit;
  value: number;
}

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  imageUrl?: string;
  isNew?: boolean;
}

interface DiamondEstimate {
  pricePerCarat: number;
  totalPrice: number;
  shape: string;
  caratRange: string;
  source: "rapaport" | "market";
}

function StreamingText({ text, speed = 12, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      if (i >= text.length) {
        setDisplayed(text);
        setDone(true);
        clearInterval(interval);
        onComplete?.();
      } else {
        setDisplayed(text.slice(0, i));
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return <>{displayed}{!done && <span className="inline-block w-0.5 h-4 ml-0.5 animate-pulse" style={{ background: "rgba(201,169,110,0.6)", verticalAlign: "text-bottom" }} />}</>;
}

function SimplicityThinkingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center relative" style={{ background: "linear-gradient(135deg, rgba(201,169,110,0.15), rgba(201,169,110,0.05))", border: "1px solid rgba(201,169,110,0.2)" }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-xl" style={{ background: "conic-gradient(from 0deg, transparent, rgba(201,169,110,0.2), transparent)", }} />
        <Sparkles className="w-3.5 h-3.5 relative z-10" style={{ color: "#c9a96e" }} />
      </div>
      <div className="rounded-2xl rounded-tl-md px-5 py-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium tracking-wide" style={{ color: "rgba(201,169,110,0.7)" }}>Simplicity is thinking</span>
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.15, 0.7, 0.15], scale: [0.8, 1.1, 0.8] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#c9a96e" }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SimplicityAvatar() {
  return (
    <div className="rounded-xl flex-shrink-0 flex items-center justify-center relative overflow-hidden" style={{ width: 32, height: 32, background: "linear-gradient(135deg, rgba(201,169,110,0.12), rgba(201,169,110,0.04))", border: "1px solid rgba(201,169,110,0.15)" }}>
      <Sparkles className="w-3.5 h-3.5 relative z-10" style={{ color: "#c9a96e" }} />
    </div>
  );
}

function getSessionToken(): string {
  const key = "simplicity_session_token";
  try {
    let token = localStorage.getItem(key);
    if (!token) {
      token = "sv_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 10);
      localStorage.setItem(key, token);
    }
    return token;
  } catch {
    return "sv_" + Date.now().toString(36);
  }
}

function convertToGrams(weight: number, unit: WeightUnit): number {
  if (unit === "oz") return weight * TROY_OZ_GRAMS;
  if (unit === "dwt") return weight * 1.55517384;
  return weight;
}

function formatCurrency(num: number | undefined | null): string {
  if (num == null || isNaN(num)) return "$0.00";
  if (num >= 1000000) return "$" + (num / 1000000).toFixed(2) + "M";
  if (num >= 1000) return "$" + num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return "$" + num.toFixed(2);
}

function getPurityOptions(metal: Metal) {
  if (metal === "gold") return GOLD_KARATS;
  if (metal === "silver") return SILVER_PURITIES;
  return PLATINUM_PURITIES;
}

function getDefaultPurity(metal: Metal) {
  if (metal === "gold") return GOLD_KARATS[6];
  if (metal === "silver") return SILVER_PURITIES[2];
  return PLATINUM_PURITIES[1];
}

const font = "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const fontMono = "'SF Mono', 'Fira Code', 'JetBrains Mono', monospace";

const premium = {
  bg: "#0a0a0a",
  bgCard: "rgba(255,255,255,0.03)",
  bgCardHover: "rgba(255,255,255,0.06)",
  bgGlass: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.06)",
  borderLight: "rgba(255,255,255,0.1)",
  borderAccent: "rgba(255,255,255,0.15)",
  text: "#f5f5f7",
  textSecondary: "rgba(255,255,255,0.5)",
  textTertiary: "rgba(255,255,255,0.3)",
  accent: "#0071e3",
  accentGlow: "rgba(0,113,227,0.15)",
  gold: "#c9a96e",
  goldGlow: "rgba(201,169,110,0.12)",
  silver: "#a8a9ad",
  platinum: "#b5b5b5",
  green: "#30d158",
  greenGlow: "rgba(48,209,88,0.12)",
  red: "#ff453a",
  diamond: "#b4a7d6",
  diamondGlow: "rgba(180,167,214,0.12)",
  bgElevated: "rgba(255,255,255,0.05)",
};

const inputStyle = {
  background: "rgba(255,255,255,0.04)",
  border: `1px solid ${premium.border}`,
  color: premium.text,
  fontFamily: font,
  fontSize: "14px",
  borderRadius: "14px",
  padding: "12px 16px",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  width: "100%",
};

function MetalSelector({ value, onChange }: { value: Metal; onChange: (m: Metal) => void }) {
  return (
    <div className="flex gap-2">
      {(["gold", "silver", "platinum"] as Metal[]).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className="flex-1 py-3 rounded-2xl text-sm font-medium transition-all duration-300"
          style={{
            background: value === m
              ? m === "gold" ? `linear-gradient(135deg, ${premium.gold}, #b8943e)` : m === "silver" ? `linear-gradient(135deg, ${premium.silver}, #8a8b8f)` : `linear-gradient(135deg, ${premium.platinum}, #9a9a9a)`
              : premium.bgCard,
            color: value === m ? "#000" : premium.textSecondary,
            border: `1px solid ${value === m ? "transparent" : premium.border}`,
            fontFamily: font,
            letterSpacing: "0.02em",
            fontWeight: value === m ? 600 : 400,
          }}
        >
          {m.charAt(0).toUpperCase() + m.slice(1)}
        </button>
      ))}
    </div>
  );
}

function PuritySelector({ metal: m, value, onChange }: { metal: Metal; value: { label: string; purity: number; desc: string }; onChange: (p: { label: string; purity: number; desc: string }) => void }) {
  const options = getPurityOptions(m);
  return (
    <div className="relative">
      <select
        value={value.label}
        onChange={(e) => { const opt = options.find((o) => o.label === e.target.value); if (opt) onChange(opt); }}
        className="w-full py-3 px-4 rounded-2xl text-sm appearance-none cursor-pointer"
        style={{ background: premium.bgCard, border: `1px solid ${premium.border}`, color: premium.text, fontFamily: font }}
      >
        {options.map((o) => (
          <option key={o.label} value={o.label}>{o.label} — {o.desc} ({o.purity}%)</option>
        ))}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: premium.textTertiary }} />
    </div>
  );
}

function UnitSelector({ value, onChange }: { value: WeightUnit; onChange: (u: WeightUnit) => void }) {
  return (
    <div className="flex gap-2">
      {(["grams", "oz", "dwt"] as WeightUnit[]).map((u) => (
        <button
          key={u}
          onClick={() => onChange(u)}
          className="px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300"
          style={{
            background: value === u ? premium.accent : premium.bgCard,
            color: value === u ? "#fff" : premium.textSecondary,
            border: `1px solid ${value === u ? "transparent" : premium.border}`,
          }}
        >
          {u === "oz" ? "Troy oz" : u === "dwt" ? "DWT" : "Grams"}
        </button>
      ))}
    </div>
  );
}

function SectionCard({ children, glow }: { children: React.ReactNode; glow?: string }) {
  return (
    <div
      className="rounded-3xl p-5 space-y-4"
      style={{
        background: premium.bgCard,
        border: `1px solid ${premium.border}`,
        boxShadow: glow ? `0 0 60px ${glow}, 0 1px 3px rgba(0,0,0,0.2)` : "0 1px 3px rgba(0,0,0,0.1)",
        backdropFilter: "blur(40px)",
      }}
    >
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium tracking-widest uppercase" style={{ color: premium.textTertiary, letterSpacing: "0.1em" }}>{children}</p>
  );
}

const simpletonTabs = [
  { id: "calc" as const, label: "Metals", icon: Calculator },
  { id: "diamond" as const, label: "Diamonds", icon: Diamond },
  { id: "scrap" as const, label: "Batch", icon: Scale },
  { id: "reverse" as const, label: "Reverse", icon: RotateCcw },
  { id: "chat" as const, label: "Ask AI", icon: Brain },
];

function getInitialTab(): "calc" | "diamond" | "scrap" | "reverse" | "chat" {
  try {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "calc" || tab === "diamond" || tab === "scrap" || tab === "reverse" || tab === "chat") return tab;
  } catch {}
  return "calc";
}

export default function SimpletonMode() {
  const [, setLocation] = useLocation();
  const { prices: metalPrices, isLoading: pricesLoading } = useLivePricing();
  const { isMobile } = useAppMode();

  const [metal, setMetal] = useState<Metal>("gold");
  const [purityOption, setPurityOption] = useState(getDefaultPurity("gold"));
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<WeightUnit>("grams");
  const [activeTab, setActiveTab] = useState<"calc" | "diamond" | "scrap" | "reverse" | "chat">(getInitialTab);

  useEffect(() => {
    function syncTab() {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "calc" || tab === "diamond" || tab === "scrap" || tab === "reverse" || tab === "chat") {
        setActiveTab(tab);
      }
    }
    syncTab();
    window.addEventListener("popstate", syncTab);
    window.addEventListener("simpleton-tab-change", syncTab);
    return () => {
      window.removeEventListener("popstate", syncTab);
      window.removeEventListener("simpleton-tab-change", syncTab);
    };
  }, []);

  const [pricingMode, setPricingMode] = useState<"live" | "custom">("live");
  const [customSpotPrice, setCustomSpotPrice] = useState("");
  const [loanRate, setLoanRate] = useState("");
  const [sellRate, setSellRate] = useState("");
  const [rateMode, setRateMode] = useState<"single" | "per-karat">("single");
  const [perKaratRates, setPerKaratRates] = useState<Record<string, { loan: string; sell: string }>>({});
  const [showRateTable, setShowRateTable] = useState(false);
  const [spotLoanPct, setSpotLoanPct] = useState(79);
  const [spotSellSpread, setSpotSellSpread] = useState(4);
  const [spotSilverLoanPct, setSpotSilverLoanPct] = useState(39);
  const [spotSilverSpread, setSpotSilverSpread] = useState(0.25);
  const [showSpotCalc, setShowSpotCalc] = useState(false);

  const [scrapItems, setScrapItems] = useState<ScrapItem[]>([]);
  const [scrapMetal, setScrapMetal] = useState<Metal>("gold");
  const [scrapKarat, setScrapKarat] = useState(GOLD_KARATS[6]);
  const [scrapWeight, setScrapWeight] = useState("");
  const [scrapUnit, setScrapUnit] = useState<WeightUnit>("grams");

  const [reversePrice, setReversePrice] = useState("");
  const [reverseMetal, setReverseMetal] = useState<Metal>("gold");
  const [reverseKaratOption, setReverseKaratOption] = useState(getDefaultPurity("gold"));

  const [diamondCarat, setDiamondCarat] = useState("");
  const [diamondColor, setDiamondColor] = useState("G");
  const [diamondClarity, setDiamondClarity] = useState("VS1");
  const [diamondCut, setDiamondCut] = useState("Excellent");
  const [diamondShape, setDiamondShape] = useState("Round");
  const [diamondType, setDiamondType] = useState<"NATURAL" | "LAB_GROWN">("NATURAL");
  const [diamondEstimate, setDiamondEstimate] = useState<DiamondEstimate | null>(null);
  const [diamondLoading, setDiamondLoading] = useState(false);
  const [diamondError, setDiamondError] = useState("");
  const [diamondPricingSource, setDiamondPricingSource] = useState<"rapaport" | "market">("rapaport");
  const [diamondLoanPct, setDiamondLoanPct] = useState("");
  const [diamondSellPct, setDiamondSellPct] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try { return localStorage.getItem("simplicity-muted") === "true"; } catch { return false; }
  });
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [speakingLoading, setSpeakingLoading] = useState<string | null>(null);
  const [welcomePlayed, setWelcomePlayed] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const diamondResultRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionTokenRef = useRef<string>(getSessionToken());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const isMutedRef = useRef(isMuted);
  const lastSpokenIdRef = useRef<string | null>(null);

  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { try { localStorage.setItem("simplicity-muted", String(isMuted)); } catch {} }, [isMuted]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, chatLoading]);
  useEffect(() => { if (diamondEstimate) setTimeout(() => diamondResultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 300); }, [diamondEstimate]);

  useEffect(() => {
    if (welcomePlayed || isMuted) return;
    const alreadyWelcomed = sessionStorage.getItem("simpleton-welcomed");
    if (alreadyWelcomed) { setWelcomePlayed(true); return; }
    const timer = setTimeout(async () => {
      try {
        const welcomeText = "Welcome to Simpleton Mode. I'm Simplicity, your personal assistant for metals, diamonds, and AI appraisals. Just tap Ask AI whenever you need me.";
        const response = await fetch("/api/assistant/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: welcomeText }),
        });
        if (!response.ok) throw new Error("TTS failed");
        if (isMutedRef.current) return;
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audioUrlRef.current = url;
        if (isMutedRef.current) return;
        audio.onended = () => { URL.revokeObjectURL(url); audioRef.current = null; audioUrlRef.current = null; };
        await audio.play().catch(() => {});
        sessionStorage.setItem("simpleton-welcomed", "true");
        setWelcomePlayed(true);
      } catch {
        setWelcomePlayed(true);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [welcomePlayed, isMuted]);

  const effectiveSpotPrice = useMemo(() => {
    if (pricingMode === "custom" && customSpotPrice) {
      const csp = parseFloat(customSpotPrice);
      if (csp > 0) return csp;
    }
    return metalPrices?.[metal] || 0;
  }, [pricingMode, customSpotPrice, metal, metalPrices]);

  const calculateRatesFromSpot = useCallback((
    loanPct = 0.79,
    sellSprd = 4.0,
    silverLoanPct = 0.39,
    silverSprd = 0.25,
    platLoanPct = 0.75,
    platSprd = 4.0
  ) => {
    const goldSpot = metalPrices?.gold || 0;
    const silverSpot = metalPrices?.silver || 0;
    const platSpot = metalPrices?.platinum || 0;
    if (goldSpot <= 0 && silverSpot <= 0 && platSpot <= 0) return;

    const newRates: Record<string, { loan: string; sell: string }> = { ...perKaratRates };

    if (goldSpot > 0) {
      const goldPerGram = goldSpot / TROY_OZ_GRAMS;
      GOLD_KARATS.forEach(({ label, purity }) => {
        const melt = goldPerGram * (purity / 100);
        const loan = Math.round(melt * loanPct * 100) / 100;
        const sell = Math.round((loan + sellSprd) * 100) / 100;
        newRates[label] = { loan: loan.toFixed(2), sell: sell.toFixed(2) };
      });
    }

    if (silverSpot > 0) {
      const silverPerGram = silverSpot / TROY_OZ_GRAMS;
      SILVER_PURITIES.forEach(({ label, purity }) => {
        const melt = silverPerGram * (purity / 100);
        const loan = Math.round(melt * silverLoanPct * 100) / 100;
        const sell = Math.round((loan + silverSprd) * 100) / 100;
        newRates[label] = { loan: loan.toFixed(2), sell: sell.toFixed(2) };
      });
    }

    if (platSpot > 0) {
      const platPerGram = platSpot / TROY_OZ_GRAMS;
      PLATINUM_PURITIES.forEach(({ label, purity }) => {
        const melt = platPerGram * (purity / 100);
        const loan = Math.round(melt * platLoanPct * 100) / 100;
        const sell = Math.round((loan + platSprd) * 100) / 100;
        newRates[label] = { loan: loan.toFixed(2), sell: sell.toFixed(2) };
      });
    }

    setPerKaratRates(newRates);
    setRateMode("per-karat");
    setShowRateTable(true);
  }, [metalPrices, perKaratRates]);

  const calcResult = useMemo(() => {
    const w = parseFloat(weight);
    if (!w || w <= 0) return null;
    if (effectiveSpotPrice <= 0) return null;
    const weightGrams = convertToGrams(w, unit);
    const purityDecimal = purityOption.purity / 100;
    const pricePerGram = effectiveSpotPrice / TROY_OZ_GRAMS;
    const liveValue = weightGrams * purityDecimal * pricePerGram;

    let lr: number, sr: number;
    if (rateMode === "per-karat") {
      const karatRates = perKaratRates[purityOption.label] || { loan: "", sell: "" };
      lr = parseFloat(karatRates.loan);
      sr = parseFloat(karatRates.sell);
    } else {
      lr = parseFloat(loanRate);
      sr = parseFloat(sellRate);
    }
    const loanValue = lr > 0 ? weightGrams * lr : null;
    const sellValue = sr > 0 ? weightGrams * sr : null;

    return {
      value: Math.round(liveValue * 100) / 100,
      loanValue: loanValue ? Math.round(loanValue * 100) / 100 : null,
      sellValue: sellValue ? Math.round(sellValue * 100) / 100 : null,
      pricePerGram: Math.round(pricePerGram * purityDecimal * 100) / 100,
      pureWeight: Math.round(weightGrams * purityDecimal * 1000) / 1000,
      spotPrice: effectiveSpotPrice,
    };
  }, [weight, effectiveSpotPrice, purityOption, unit, loanRate, sellRate, rateMode, perKaratRates]);

  const reverseResult = useMemo(() => {
    const price = parseFloat(reversePrice);
    if (!price || price <= 0 || !metalPrices) return null;
    const spotPrice = metalPrices[reverseMetal] || 0;
    if (spotPrice <= 0) return null;
    const purityDecimal = reverseKaratOption.purity / 100;
    const pricePerGram = (spotPrice / TROY_OZ_GRAMS) * purityDecimal;
    const weightGrams = price / pricePerGram;
    return {
      grams: Math.round(weightGrams * 1000) / 1000,
      oz: Math.round((weightGrams / TROY_OZ_GRAMS) * 10000) / 10000,
      dwt: Math.round((weightGrams / 1.55517384) * 1000) / 1000,
      pricePerGram: Math.round(pricePerGram * 100) / 100,
    };
  }, [reversePrice, reverseMetal, reverseKaratOption, metalPrices]);

  const scrapTotal = useMemo(() => scrapItems.reduce((sum, item) => sum + item.value, 0), [scrapItems]);

  const addScrapItem = () => {
    const w = parseFloat(scrapWeight);
    if (!w || w <= 0 || !metalPrices) return;
    const spotPrice = metalPrices[scrapMetal] || 0;
    if (spotPrice <= 0) return;
    const weightGrams = convertToGrams(w, scrapUnit);
    const purityDecimal = scrapKarat.purity / 100;
    const value = weightGrams * purityDecimal * (spotPrice / TROY_OZ_GRAMS);

    setScrapItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        metal: scrapMetal,
        karat: scrapKarat.label,
        purity: scrapKarat.purity,
        weight: w,
        unit: scrapUnit,
        value: Math.round(value * 100) / 100,
      },
    ]);
    setScrapWeight("");
  };

  const priceDiamond = useCallback(async () => {
    const carat = parseFloat(diamondCarat);
    if (!carat || carat <= 0) { setDiamondError("Please enter a valid carat weight"); return; }
    setDiamondLoading(true);
    setDiamondError("");
    setDiamondEstimate(null);
    try {
      if (diamondPricingSource === "rapaport") {
        const rapShape = diamondShape.toUpperCase() === "ROUND" ? "round" : "pear";
        const params = new URLSearchParams({ carat: String(carat), color: diamondColor, clarity: diamondClarity, shape: rapShape });
        const response = await fetch(`/api/diamonds/rap-price?${params}`);
        if (!response.ok) throw new Error("Price not found for this combination");
        const data = await response.json();
        if (!data.success) throw new Error(data.error || "Price not available");
        setDiamondEstimate({
          pricePerCarat: data.pricePerCaratUSD,
          totalPrice: data.totalPriceUSD,
          shape: rapShape,
          caratRange: data.caratRange || "",
          source: "rapaport",
        });
      } else {
        const cutMap: Record<string, string> = { "Excellent": "Ideal", "Very Good": "Very Good", "Good": "Good", "Fair": "Fair" };
        const mappedCut = cutMap[diamondCut] || "Ideal";
        const params = new URLSearchParams({ carat: String(carat), cut: mappedCut, color: diamondColor, clarity: diamondClarity });
        const response = await fetch(`/api/diamonds/price?${params}`);
        if (!response.ok) throw new Error("Price not found");
        const data = await response.json();
        if (!data.success) throw new Error(data.error || "Price not available");
        setDiamondEstimate({
          pricePerCarat: data.pricePerCarat,
          totalPrice: data.price,
          shape: diamondShape.toLowerCase(),
          caratRange: "",
          source: "market",
        });
      }
    } catch {
      setDiamondError("Price not available for this combination. Try adjusting specs.");
    } finally {
      setDiamondLoading(false);
    }
  }, [diamondCarat, diamondColor, diamondClarity, diamondShape, diamondCut, diamondPricingSource]);

  useEffect(() => {
    setDiamondEstimate(null);
    setDiamondError("");
  }, [diamondCarat, diamondColor, diamondClarity, diamondShape, diamondCut, diamondType]);

  useEffect(() => {
    const carat = parseFloat(diamondCarat);
    if (carat && carat > 0) {
      priceDiamond();
    } else {
      setDiamondEstimate(null);
      setDiamondError("");
    }
  }, [diamondPricingSource]);

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.removeAttribute("src"); audioRef.current.load(); audioRef.current = null; }
    if (audioUrlRef.current) { URL.revokeObjectURL(audioUrlRef.current); audioUrlRef.current = null; }
  }, []);

  const stopSpeaking = useCallback(() => { cleanupAudio(); setSpeakingMessageId(null); setSpeakingLoading(null); }, [cleanupAudio]);

  const handleSpeak = useCallback(async (message: ChatMessage) => {
    if (speakingMessageId === message.id) { stopSpeaking(); return; }
    stopSpeaking();
    setSpeakingLoading(message.id);
    try {
      const response = await fetch("/api/assistant/speak", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: message.content }) });
      if (!response.ok) throw new Error("TTS failed");
      if (isMutedRef.current) { setSpeakingLoading(null); return; }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      cleanupAudio();
      audioUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      setSpeakingMessageId(message.id);
      setSpeakingLoading(null);
      audio.onended = () => { setSpeakingMessageId(null); cleanupAudio(); };
      audio.onerror = () => { setSpeakingMessageId(null); setSpeakingLoading(null); cleanupAudio(); };
      await audio.play().catch(() => { setSpeakingMessageId(null); setSpeakingLoading(null); cleanupAudio(); });
    } catch { setSpeakingLoading(null); setSpeakingMessageId(null); }
  }, [speakingMessageId, stopSpeaking, cleanupAudio]);

  useEffect(() => { return () => { stopSpeaking(); }; }, [stopSpeaking]);

  const fireAndForgetSpeak = useCallback((content: string, msgId: string) => {
    if (isMutedRef.current) return;
    lastSpokenIdRef.current = msgId;
    stopSpeaking();
    setSpeakingLoading(msgId);
    fetch("/api/assistant/speak", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: content }) })
      .then(r => { if (!r.ok) throw new Error("TTS failed"); return r.blob(); })
      .then(blob => {
        if (isMutedRef.current) { setSpeakingLoading(null); return; }
        const url = URL.createObjectURL(blob);
        cleanupAudio();
        audioUrlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;
        setSpeakingMessageId(msgId);
        setSpeakingLoading(null);
        audio.onended = () => { setSpeakingMessageId(null); cleanupAudio(); };
        audio.onerror = () => { setSpeakingMessageId(null); setSpeakingLoading(null); cleanupAudio(); };
        audio.play().catch(() => { setSpeakingMessageId(null); setSpeakingLoading(null); cleanupAudio(); });
      })
      .catch(() => { setSpeakingLoading(null); setSpeakingMessageId(null); });
  }, [stopSpeaking, cleanupAudio]);

  const sendChat = async (text?: string) => {
    const userText = text || chatInput.trim();
    if (!userText && !imagePreview) return;
    const userMessage: ChatMessage = { id: Date.now().toString(), type: "user", content: userText || "Please analyze this image", timestamp: new Date(), imageUrl: imagePreview || undefined };
    setMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    const currentImage = imagePreview;
    setImagePreview(null);
    setChatLoading(true);
    try {
      let imageBase64 = null;
      if (currentImage) imageBase64 = currentImage.split(",")[1];
      const endpoint = imageBase64 ? "/api/assistant/appraise" : "/api/assistant/help";
      const body = imageBase64
        ? { image: imageBase64, description: userText || "Please appraise this item", sessionToken: sessionTokenRef.current }
        : { message: userText, context: "full_expert", sessionToken: sessionTokenRef.current, pageContext: "/simpleton-mode" };
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const rawContent = data.response || data.appraisal || "I received your message but couldn't generate a response.";
      const cleanContent = rawContent.replace(/\*[^*]+\*/g, "").replace(/\n{3,}/g, "\n\n").trim();
      const msgId = (Date.now() + 1).toString();
      fireAndForgetSpeak(cleanContent, msgId);
      setMessages((prev) => [...prev, { id: msgId, type: "assistant", content: cleanContent, timestamp: new Date(), isNew: true }]);
    } catch {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), type: "assistant", content: "I'm having trouble right now. Please try again in a moment.", timestamp: new Date(), isNew: true }]);
    } finally { setChatLoading(false); }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => { setImagePreview(ev.target?.result as string); setActiveTab("chat"); };
      reader.readAsDataURL(file);
    }
  };

  const inputFocusStyle = `1px solid ${premium.borderAccent}`;

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: premium.bg, fontFamily: font }}>
      <header
        className="flex items-center justify-between px-5 sm:px-8 py-4 flex-shrink-0"
        style={{
          borderBottom: `1px solid ${premium.border}`,
          background: "rgba(10,10,10,0.8)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
        }}
      >
        <button onClick={() => setLocation("/")} className="flex items-center gap-2 text-sm font-medium transition-all duration-300 hover:opacity-60" style={{ color: premium.textSecondary }}>
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))", border: `1px solid ${premium.borderLight}` }}>
              <Sparkles className="w-4 h-4" style={{ color: premium.gold }} />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight leading-tight" style={{ color: premium.text }}>Simpleton Mode</h1>
            <p className="text-[10px] tracking-wide leading-tight" style={{ color: premium.textTertiary }}>
              {pricesLoading ? "CONNECTING..." : metalPrices ? `GOLD ${formatCurrency(metalPrices.gold)}/OZ` : "OFFLINE"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { if (!isMuted) { stopSpeaking(); setIsMuted(true); } else { setIsMuted(false); } }}
            className="w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-300 hover:opacity-60"
            style={{ background: premium.bgCard, border: `1px solid ${premium.border}` }}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" style={{ color: premium.textTertiary }} /> : <Volume2 className="w-4 h-4" style={{ color: premium.gold }} />}
          </button>
          {isMobile && (
            <button
              onClick={() => window.dispatchEvent(new Event("simpleton-open-more"))}
              className="w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-300 hover:opacity-60"
              style={{ background: "rgba(201,169,110,0.12)", border: `1px solid rgba(201,169,110,0.25)` }}
              title="More features"
            >
              <Menu className="w-4 h-4" style={{ color: premium.gold }} />
            </button>
          )}
        </div>
      </header>

      <div className="flex gap-1 px-5 sm:px-8 py-3 flex-shrink-0 overflow-x-auto" style={{ borderBottom: `1px solid ${premium.border}`, background: "rgba(10,10,10,0.6)" }}>
        {simpletonTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 whitespace-nowrap"
            style={{
              background: activeTab === tab.id ? "rgba(255,255,255,0.08)" : "transparent",
              color: activeTab === tab.id ? premium.text : premium.textTertiary,
              border: activeTab === tab.id ? `1px solid ${premium.borderLight}` : "1px solid transparent",
              letterSpacing: "0.03em",
            }}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6">
        <div className="max-w-lg mx-auto">

          <div style={{ display: activeTab === "calc" ? "block" : "none" }}>
            <div className="space-y-5">

              <div
                className="rounded-3xl p-6 transition-opacity duration-300"
                style={{
                  opacity: calcResult ? 1 : 0.4,
                  background: calcResult
                    ? metal === "gold"
                      ? "linear-gradient(160deg, rgba(201,169,110,0.12), rgba(201,169,110,0.04))"
                      : metal === "silver"
                      ? "linear-gradient(160deg, rgba(168,169,173,0.12), rgba(168,169,173,0.04))"
                      : "linear-gradient(160deg, rgba(181,181,181,0.12), rgba(181,181,181,0.04))"
                    : "linear-gradient(160deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
                  border: `1px solid ${calcResult ? (metal === "gold" ? "rgba(201,169,110,0.2)" : "rgba(168,169,173,0.15)") : "rgba(255,255,255,0.06)"}`,
                }}
              >
                {calcResult ? (
                  <>
                    <p className="text-[10px] font-medium text-center tracking-widest uppercase" style={{ color: premium.textSecondary }}>
                      {weight} {unit === "oz" ? "troy oz" : unit} · {purityOption.label} {metal}
                    </p>

                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="text-center py-3 rounded-xl" style={{ background: "rgba(0,113,227,0.08)", border: "1px solid rgba(0,113,227,0.15)" }}>
                        <p className="text-[9px] tracking-widest uppercase font-semibold" style={{ color: premium.accent }}>Loan</p>
                        <p className="text-lg font-bold mt-1" style={{ color: premium.accent, fontFamily: fontMono }}>{calcResult.loanValue ? formatCurrency(calcResult.loanValue) : '—'}</p>
                      </div>
                      <div className="text-center py-3 rounded-xl" style={{ background: metal === "gold" ? premium.goldGlow : "rgba(168,169,173,0.08)", border: `1px solid ${metal === "gold" ? "rgba(201,169,110,0.2)" : "rgba(168,169,173,0.15)"}` }}>
                        <p className="text-[9px] tracking-widest uppercase font-semibold" style={{ color: premium.textTertiary }}>{pricingMode === "custom" ? "Custom" : "Live Spot"}</p>
                        <p className="text-lg font-bold mt-1" style={{ color: premium.text, fontFamily: fontMono }}>{formatCurrency(calcResult.value)}</p>
                      </div>
                      <div className="text-center py-3 rounded-xl" style={{ background: premium.greenGlow, border: "1px solid rgba(48,209,88,0.2)" }}>
                        <p className="text-[9px] tracking-widest uppercase font-semibold" style={{ color: premium.green }}>Sell</p>
                        <p className="text-lg font-bold mt-1" style={{ color: premium.green, fontFamily: fontMono }}>{calcResult.sellValue ? formatCurrency(calcResult.sellValue) : '—'}</p>
                      </div>
                    </div>

                    <div className="flex justify-center gap-6 mt-4 text-[10px] tracking-wide" style={{ color: premium.textTertiary }}>
                      <span>Spot {formatCurrency(calcResult.spotPrice)}/oz</span>
                      <span>{formatCurrency(calcResult.pricePerGram)}/g</span>
                      <span>Pure {calcResult.pureWeight}g</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-3xl font-bold tracking-tighter" style={{ color: "rgba(255,255,255,0.15)", fontFamily: fontMono }}>$0.00</p>
                    <p className="text-[10px] mt-1 tracking-wider uppercase" style={{ color: premium.textTertiary }}>Enter weight to calculate</p>
                  </div>
                )}
              </div>

              <SectionCard glow={premium.goldGlow}>
                <Label>Metal</Label>
                <MetalSelector value={metal} onChange={(m) => { setMetal(m); setPurityOption(getDefaultPurity(m)); }} />
                <Label>Purity / Karat</Label>
                <PuritySelector metal={metal} value={purityOption} onChange={setPurityOption} />
                <Label>Weight</Label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={weight}
                  onChange={(e) => { const v = e.target.value; if (v === "" || /^[0-9]*\.?[0-9]*$/.test(v)) setWeight(v); }}
                  placeholder="0.00"
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = premium.borderAccent; }}
                  onBlur={(e) => { e.target.style.borderColor = premium.border; }}
                />
                <UnitSelector value={unit} onChange={setUnit} />
              </SectionCard>

              <SectionCard>
                <div className="flex items-center justify-between">
                  <Label>Pricing</Label>
                  <div className="flex gap-1">
                    <button onClick={() => setPricingMode("live")} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wider uppercase transition-all duration-300" style={{ background: pricingMode === "live" ? premium.green : premium.bgCard, color: pricingMode === "live" ? "#000" : premium.textTertiary, border: `1px solid ${pricingMode === "live" ? "transparent" : premium.border}` }}>Live</button>
                    <button onClick={() => setPricingMode("custom")} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wider uppercase transition-all duration-300" style={{ background: pricingMode === "custom" ? premium.gold : premium.bgCard, color: pricingMode === "custom" ? "#000" : premium.textTertiary, border: `1px solid ${pricingMode === "custom" ? "transparent" : premium.border}` }}>Custom</button>
                  </div>
                </div>
                {pricingMode === "custom" && (
                  <div>
                    <Label>Custom Spot (per troy oz)</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: premium.textTertiary }}>$</span>
                      <input type="text" inputMode="decimal" value={customSpotPrice} onChange={(e) => { const v = e.target.value; if (v === "" || /^[0-9]*\.?[0-9]*$/.test(v)) setCustomSpotPrice(v); }} placeholder={metalPrices ? metalPrices[metal].toFixed(2) : "0"} className="w-full" style={{ ...inputStyle, paddingLeft: "28px", background: premium.goldGlow, borderColor: "rgba(201,169,110,0.2)" }} />
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <Label>Loan / Sell Rates ($/g)</Label>
                  <div className="flex gap-1">
                    <button onClick={() => setRateMode("single")} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wider uppercase transition-all duration-300" style={{ background: rateMode === "single" ? premium.accent : premium.bgCard, color: rateMode === "single" ? "#000" : premium.textTertiary, border: `1px solid ${rateMode === "single" ? "transparent" : premium.border}` }}>Single</button>
                    <button onClick={() => { setRateMode("per-karat"); setShowRateTable(true); }} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wider uppercase transition-all duration-300" style={{ background: rateMode === "per-karat" ? premium.gold : premium.bgCard, color: rateMode === "per-karat" ? "#000" : premium.textTertiary, border: `1px solid ${rateMode === "per-karat" ? "transparent" : premium.border}` }}>Per Karat</button>
                  </div>
                </div>

                {rateMode === "single" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Loan Rate</Label>
                      <input type="text" inputMode="decimal" value={loanRate} onChange={(e) => { const v = e.target.value; if (v === "" || /^[0-9]*\.?[0-9]*$/.test(v)) setLoanRate(v); }} placeholder="—" style={{ ...inputStyle, marginTop: "6px" }} />
                    </div>
                    <div>
                      <Label>Sell Rate</Label>
                      <input type="text" inputMode="decimal" value={sellRate} onChange={(e) => { const v = e.target.value; if (v === "" || /^[0-9]*\.?[0-9]*$/.test(v)) setSellRate(v); }} placeholder="—" style={{ ...inputStyle, marginTop: "6px" }} />
                    </div>
                  </div>
                )}

                {rateMode === "per-karat" && (
                  <div className="mt-2">
                    <button
                      onClick={() => setShowRateTable(!showRateTable)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors"
                      style={{ background: premium.bgElevated, border: `1px solid ${premium.border}` }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium" style={{ color: premium.text }}>
                          {metal === "gold" ? "Karat" : "Purity"} Rate Table
                        </span>
                        {Object.keys(perKaratRates).filter(k => {
                          const r = perKaratRates[k];
                          return (r.loan && parseFloat(r.loan) > 0) || (r.sell && parseFloat(r.sell) > 0);
                        }).length > 0 && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: "rgba(201,169,110,0.15)", color: premium.gold }}>
                            {Object.keys(perKaratRates).filter(k => {
                              const r = perKaratRates[k];
                              return (r.loan && parseFloat(r.loan) > 0) || (r.sell && parseFloat(r.sell) > 0);
                            }).length} set
                          </span>
                        )}
                      </div>
                      <ChevronDown className="w-4 h-4 transition-transform" style={{ color: premium.textTertiary, transform: showRateTable ? "rotate(180deg)" : "rotate(0deg)" }} />
                    </button>

                    {showRateTable && (
                      <div className="mt-2 rounded-xl overflow-hidden" style={{ border: `1px solid ${premium.border}`, background: premium.bgElevated }}>
                        <div className="grid grid-cols-[1fr,1fr,1fr] gap-0 px-3 py-2" style={{ borderBottom: `1px solid ${premium.border}` }}>
                          <span className="text-[9px] font-semibold tracking-widest uppercase" style={{ color: premium.textTertiary }}>{metal === "gold" ? "Karat" : "Purity"}</span>
                          <span className="text-[9px] font-semibold tracking-widest uppercase text-center" style={{ color: premium.textTertiary }}>Loan $/g</span>
                          <span className="text-[9px] font-semibold tracking-widest uppercase text-center" style={{ color: premium.textTertiary }}>Sell $/g</span>
                        </div>
                        <div className="max-h-[280px] overflow-y-auto">
                          {getPurityOptions(metal).map((opt) => {
                            const rates = perKaratRates[opt.label] || { loan: "", sell: "" };
                            const isSelected = purityOption.label === opt.label;
                            return (
                              <div
                                key={opt.label}
                                className="grid grid-cols-[1fr,1fr,1fr] gap-2 px-3 py-1.5 items-center"
                                style={{
                                  background: isSelected ? "rgba(201,169,110,0.06)" : "transparent",
                                  borderLeft: isSelected ? "2px solid rgba(201,169,110,0.5)" : "2px solid transparent",
                                }}
                              >
                                <div>
                                  <span className="text-xs font-semibold" style={{ color: isSelected ? premium.gold : premium.text }}>{opt.label}</span>
                                  <span className="text-[9px] ml-1" style={{ color: premium.textTertiary }}>{opt.desc}</span>
                                </div>
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={rates.loan}
                                  onChange={(e) => { const v = e.target.value; if (v === "" || /^[0-9]*\.?[0-9]*$/.test(v)) setPerKaratRates(prev => ({ ...prev, [opt.label]: { ...prev[opt.label] || { loan: "", sell: "" }, loan: v } })); }}
                                  placeholder="—"
                                  className="w-full text-center"
                                  style={{ ...inputStyle, padding: "6px 4px", fontSize: "12px", marginTop: 0 }}
                                />
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={rates.sell}
                                  onChange={(e) => { const v = e.target.value; if (v === "" || /^[0-9]*\.?[0-9]*$/.test(v)) setPerKaratRates(prev => ({ ...prev, [opt.label]: { ...prev[opt.label] || { loan: "", sell: "" }, sell: v } })); }}
                                  placeholder="—"
                                  className="w-full text-center"
                                  style={{ ...inputStyle, padding: "6px 4px", fontSize: "12px", marginTop: 0 }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {!showRateTable && perKaratRates[purityOption.label] && (
                      <div className="mt-2 grid grid-cols-2 gap-3 px-1">
                        <div className="text-center py-2 rounded-lg" style={{ background: premium.bgElevated }}>
                          <p className="text-[9px] tracking-wider uppercase" style={{ color: premium.textTertiary }}>Loan {purityOption.label}</p>
                          <p className="text-sm font-semibold mt-0.5" style={{ color: premium.accent, fontFamily: fontMono }}>${perKaratRates[purityOption.label]?.loan || "—"}/g</p>
                        </div>
                        <div className="text-center py-2 rounded-lg" style={{ background: premium.bgElevated }}>
                          <p className="text-[9px] tracking-wider uppercase" style={{ color: premium.textTertiary }}>Sell {purityOption.label}</p>
                          <p className="text-sm font-semibold mt-0.5" style={{ color: premium.green, fontFamily: fontMono }}>${perKaratRates[purityOption.label]?.sell || "—"}/g</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-3">
                  <button
                    onClick={() => setShowSpotCalc(!showSpotCalc)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors"
                    style={{ background: showSpotCalc ? premium.goldGlow : premium.bgElevated, border: `1px solid ${showSpotCalc ? 'rgba(201,169,110,0.3)' : premium.border}` }}
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5" style={{ color: premium.gold }} />
                      <span className="text-xs font-semibold" style={{ color: premium.gold }}>Calculate from Live Spot</span>
                    </div>
                    <ChevronDown className="w-4 h-4 transition-transform" style={{ color: premium.textTertiary, transform: showSpotCalc ? "rotate(180deg)" : "rotate(0deg)" }} />
                  </button>

                  {showSpotCalc && metalPrices && (
                    <div className="mt-2 rounded-xl p-4" style={{ background: premium.bgElevated, border: `1px solid ${premium.border}` }}>
                      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                        <div className="py-2 rounded-lg" style={{ background: premium.goldGlow }}>
                          <p className="text-[9px] tracking-wider uppercase" style={{ color: premium.textTertiary }}>Gold</p>
                          <p className="text-xs font-semibold" style={{ color: premium.gold, fontFamily: fontMono }}>${metalPrices.gold?.toFixed(2)}/oz</p>
                          <p className="text-[9px]" style={{ color: premium.textTertiary }}>${(metalPrices.gold / TROY_OZ_GRAMS).toFixed(2)}/g</p>
                        </div>
                        <div className="py-2 rounded-lg" style={{ background: "rgba(168,169,173,0.08)" }}>
                          <p className="text-[9px] tracking-wider uppercase" style={{ color: premium.textTertiary }}>Silver</p>
                          <p className="text-xs font-semibold" style={{ color: premium.silver, fontFamily: fontMono }}>${metalPrices.silver?.toFixed(2)}/oz</p>
                          <p className="text-[9px]" style={{ color: premium.textTertiary }}>${(metalPrices.silver / TROY_OZ_GRAMS).toFixed(2)}/g</p>
                        </div>
                        <div className="py-2 rounded-lg" style={{ background: "rgba(181,181,181,0.08)" }}>
                          <p className="text-[9px] tracking-wider uppercase" style={{ color: premium.textTertiary }}>Platinum</p>
                          <p className="text-xs font-semibold" style={{ color: premium.platinum, fontFamily: fontMono }}>${metalPrices.platinum?.toFixed(2)}/oz</p>
                          <p className="text-[9px]" style={{ color: premium.textTertiary }}>${(metalPrices.platinum / TROY_OZ_GRAMS).toFixed(2)}/g</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <label className="text-[10px] block mb-1 font-semibold" style={{ color: premium.gold }}>Gold Loan %</label>
                          <div className="flex items-center gap-2">
                            <input type="range" min={50} max={95} value={spotLoanPct} onChange={e => setSpotLoanPct(Number(e.target.value))} className="flex-1" style={{ accentColor: premium.gold }} />
                            <span className="font-mono text-xs w-10 text-right" style={{ color: premium.gold }}>{spotLoanPct}%</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] block mb-1 font-semibold" style={{ color: premium.green }}>Gold Sell Spread</label>
                          <div className="flex items-center gap-2">
                            <input type="range" min={1} max={15} value={spotSellSpread} onChange={e => setSpotSellSpread(Number(e.target.value))} className="flex-1" style={{ accentColor: premium.green }} />
                            <span className="font-mono text-xs w-10 text-right" style={{ color: premium.green }}>+${spotSellSpread}</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] block mb-1 font-semibold" style={{ color: premium.silver }}>Silver Loan %</label>
                          <div className="flex items-center gap-2">
                            <input type="range" min={20} max={80} value={spotSilverLoanPct} onChange={e => setSpotSilverLoanPct(Number(e.target.value))} className="flex-1" style={{ accentColor: premium.silver }} />
                            <span className="font-mono text-xs w-10 text-right" style={{ color: premium.silver }}>{spotSilverLoanPct}%</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] block mb-1 font-semibold" style={{ color: premium.textSecondary }}>Silver Sell Spread</label>
                          <div className="flex items-center gap-2">
                            <input type="range" min={0} max={2} step={0.05} value={spotSilverSpread} onChange={e => setSpotSilverSpread(Number(e.target.value))} className="flex-1" style={{ accentColor: premium.silver }} />
                            <span className="font-mono text-xs w-12 text-right" style={{ color: premium.textSecondary }}>+${spotSilverSpread.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {metalPrices.gold > 0 && (
                        <div className="rounded-lg p-3 mb-4" style={{ background: premium.bgCard }}>
                          <p className="text-[9px] tracking-wider uppercase mb-2" style={{ color: premium.textTertiary }}>Preview at today's spot</p>
                          <div className="grid grid-cols-5 gap-1">
                            {['10K','14K','18K','22K','24K'].map(k => {
                              const purityMap: Record<string, number> = {'10K':41.7,'14K':58.3,'18K':75.0,'22K':91.7,'24K':99.9};
                              const melt = (metalPrices.gold / TROY_OZ_GRAMS) * (purityMap[k] / 100);
                              const loan = Math.round(melt * (spotLoanPct/100) * 100) / 100;
                              const sell = Math.round((loan + spotSellSpread) * 100) / 100;
                              return (
                                <div key={k} className="text-center">
                                  <p className="text-[10px] font-bold" style={{ color: premium.gold }}>{k}</p>
                                  <p className="text-[10px]" style={{ color: premium.accent, fontFamily: fontMono }}>${loan.toFixed(2)}</p>
                                  <p className="text-[10px]" style={{ color: premium.green, fontFamily: fontMono }}>${sell.toFixed(2)}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => calculateRatesFromSpot(spotLoanPct/100, spotSellSpread, spotSilverLoanPct/100, spotSilverSpread)}
                        className="w-full py-3 rounded-xl text-sm font-bold transition-all"
                        style={{ background: premium.gold, color: "#000" }}
                      >
                        Apply Rates to All Karats
                      </button>
                    </div>
                  )}
                </div>
              </SectionCard>

              {metalPrices && !pricesLoading && (
                <SectionCard>
                  <Label>Live Spot Prices</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {(["gold", "silver", "platinum"] as Metal[]).map((m) => (
                      <div key={m} className="text-center py-2">
                        <p className="text-[10px] tracking-wider uppercase" style={{ color: premium.textTertiary }}>{m}</p>
                        <p className="text-sm font-semibold mt-1" style={{ color: premium.text, fontFamily: fontMono }}>{formatCurrency(metalPrices[m])}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}
            </div>
          </div>

          <div style={{ display: activeTab === "diamond" ? "block" : "none" }}>
            <div className="space-y-5">

              <div
                className="rounded-3xl p-6 transition-opacity duration-300"
                style={{
                  opacity: diamondEstimate ? 1 : 0.4,
                  background: diamondEstimate
                    ? diamondEstimate.source === "market"
                      ? "linear-gradient(160deg, rgba(96,165,250,0.1), rgba(96,165,250,0.03))"
                      : "linear-gradient(160deg, rgba(180,167,214,0.1), rgba(180,167,214,0.03))"
                    : "linear-gradient(160deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
                  border: `1px solid ${diamondEstimate ? (diamondEstimate.source === "market" ? "rgba(96,165,250,0.2)" : "rgba(180,167,214,0.15)") : "rgba(255,255,255,0.06)"}`,
                }}
              >
                <div className="flex justify-center mb-3">
                  <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${premium.border}` }}>
                    <button
                      onClick={() => setDiamondPricingSource("rapaport")}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wider uppercase transition-all duration-300"
                      style={{
                        background: diamondPricingSource === "rapaport" ? premium.diamond : "transparent",
                        color: diamondPricingSource === "rapaport" ? "#000" : premium.textTertiary,
                        border: `1px solid ${diamondPricingSource === "rapaport" ? "transparent" : "transparent"}`,
                      }}
                    >
                      Rapaport
                    </button>
                    <button
                      onClick={() => setDiamondPricingSource("market")}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wider uppercase transition-all duration-300"
                      style={{
                        background: diamondPricingSource === "market" ? "#60a5fa" : "transparent",
                        color: diamondPricingSource === "market" ? "#000" : premium.textTertiary,
                        border: `1px solid ${diamondPricingSource === "market" ? "transparent" : "transparent"}`,
                      }}
                    >
                      Market
                    </button>
                  </div>
                </div>

                {diamondEstimate ? (
                  <>
                    <div className="text-center">
                      <p className="text-[10px] tracking-widest uppercase" style={{ color: premium.textTertiary }}>
                        {diamondCarat}ct {diamondColor} {diamondClarity} {diamondCut} {diamondShape} · {diamondType === "NATURAL" ? "Natural" : "Lab Grown"}
                      </p>
                      <p className="text-4xl font-bold tracking-tighter mt-2" style={{ color: diamondEstimate.source === "market" ? "#60a5fa" : "#e8c547", fontFamily: fontMono }}>
                        {formatCurrency(diamondEstimate.totalPrice)}
                      </p>
                      <p className="text-[10px] tracking-wider uppercase mt-1" style={{ color: premium.textTertiary }}>
                        {diamondEstimate.source === "rapaport" ? "Rapaport Grid Price" : "Market Price"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 mt-4" style={{ borderTop: `1px solid ${premium.border}` }}>
                      <div className="text-center">
                        <p className="text-[10px] tracking-wider uppercase" style={{ color: premium.textTertiary }}>$/Carat</p>
                        <p className="text-lg font-bold mt-1" style={{ color: premium.text, fontFamily: fontMono }}>{formatCurrency(diamondEstimate.pricePerCarat)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] tracking-wider uppercase" style={{ color: premium.textTertiary }}>Total</p>
                        <p className="text-lg font-bold mt-1" style={{ color: diamondEstimate.source === "market" ? "#60a5fa" : "#e8c547", fontFamily: fontMono }}>{formatCurrency(diamondEstimate.totalPrice)}</p>
                      </div>
                    </div>

                    {(diamondLoanPct || diamondSellPct) && (
                      <div className="grid grid-cols-2 gap-4 pt-3 mt-3" style={{ borderTop: `1px solid ${premium.border}` }}>
                        {diamondLoanPct && parseFloat(diamondLoanPct) > 0 && (
                          <div className="text-center">
                            <p className="text-[10px] tracking-wider uppercase" style={{ color: premium.textTertiary }}>Loan ({diamondLoanPct}%)</p>
                            <p className="text-xl font-bold mt-1" style={{ color: premium.accent, fontFamily: fontMono }}>{formatCurrency(diamondEstimate.totalPrice * parseFloat(diamondLoanPct) / 100)}</p>
                          </div>
                        )}
                        {diamondSellPct && parseFloat(diamondSellPct) > 0 && (
                          <div className="text-center">
                            <p className="text-[10px] tracking-wider uppercase" style={{ color: premium.textTertiary }}>Sell ({diamondSellPct}%)</p>
                            <p className="text-xl font-bold mt-1" style={{ color: premium.green, fontFamily: fontMono }}>{formatCurrency(diamondEstimate.totalPrice * parseFloat(diamondSellPct) / 100)}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-[9px] text-center pt-2 mt-2" style={{ color: premium.textTertiary }}>
                      {diamondEstimate.source === "rapaport" ? "Rapaport wholesale pricing grid" : "Market transaction data"}
                    </p>
                  </>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-3xl font-bold tracking-tighter" style={{ color: "rgba(255,255,255,0.15)", fontFamily: fontMono }}>$0.00</p>
                    <p className="text-[10px] mt-1 tracking-wider uppercase" style={{ color: premium.textTertiary }}>Enter details to price diamond</p>
                  </div>
                )}
              </div>

              {diamondError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl p-4 text-center" style={{ background: "rgba(255,69,58,0.08)", border: "1px solid rgba(255,69,58,0.2)" }}>
                  <p className="text-xs" style={{ color: premium.red }}>{diamondError}</p>
                </motion.div>
              )}

              <SectionCard glow={premium.diamondGlow}>
                <div className="flex items-center justify-between">
                  <Label>Diamond Type</Label>
                  <div className="flex gap-1">
                    <button onClick={() => setDiamondType("NATURAL")} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wider uppercase transition-all duration-300" style={{ background: diamondType === "NATURAL" ? premium.diamond : premium.bgCard, color: diamondType === "NATURAL" ? "#000" : premium.textTertiary, border: `1px solid ${diamondType === "NATURAL" ? "transparent" : premium.border}` }}>Natural</button>
                    <button onClick={() => setDiamondType("LAB_GROWN")} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wider uppercase transition-all duration-300" style={{ background: diamondType === "LAB_GROWN" ? "#60a5fa" : premium.bgCard, color: diamondType === "LAB_GROWN" ? "#000" : premium.textTertiary, border: `1px solid ${diamondType === "LAB_GROWN" ? "transparent" : premium.border}` }}>Lab Grown</button>
                  </div>
                </div>

                <Label>Carat Weight</Label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={diamondCarat}
                  onChange={(e) => { const v = e.target.value; if (v === "" || /^[0-9]*\.?[0-9]*$/.test(v)) setDiamondCarat(v); }}
                  placeholder="1.00"
                  style={inputStyle}
                />

                <Label>Shape</Label>
                <div className="grid grid-cols-5 gap-1.5">
                  {DIAMOND_SHAPES.map((s) => (
                    <button key={s} onClick={() => setDiamondShape(s)} className="py-2 rounded-xl text-[10px] font-medium transition-all duration-200" style={{ background: diamondShape === s ? "rgba(180,167,214,0.15)" : premium.bgCard, color: diamondShape === s ? premium.diamond : premium.textTertiary, border: `1px solid ${diamondShape === s ? "rgba(180,167,214,0.3)" : premium.border}` }}>
                      {s}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Color</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {DIAMOND_COLORS.map((c) => (
                        <button key={c} onClick={() => setDiamondColor(c)} className="w-8 h-8 rounded-lg text-[11px] font-semibold transition-all duration-200" style={{ background: diamondColor === c ? "rgba(180,167,214,0.2)" : premium.bgCard, color: diamondColor === c ? premium.text : premium.textTertiary, border: `1px solid ${diamondColor === c ? "rgba(180,167,214,0.3)" : premium.border}` }}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Clarity</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {DIAMOND_CLARITIES.map((c) => (
                        <button key={c} onClick={() => setDiamondClarity(c)} className="px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-200" style={{ background: diamondClarity === c ? "rgba(180,167,214,0.2)" : premium.bgCard, color: diamondClarity === c ? premium.text : premium.textTertiary, border: `1px solid ${diamondClarity === c ? "rgba(180,167,214,0.3)" : premium.border}` }}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Label>Cut</Label>
                <div className="flex gap-1.5">
                  {DIAMOND_CUTS.map((c) => (
                    <button key={c} onClick={() => setDiamondCut(c)} className="flex-1 py-2.5 rounded-xl text-[10px] font-medium transition-all duration-200" style={{ background: diamondCut === c ? "rgba(180,167,214,0.15)" : premium.bgCard, color: diamondCut === c ? premium.diamond : premium.textTertiary, border: `1px solid ${diamondCut === c ? "rgba(180,167,214,0.3)" : premium.border}` }}>
                      {c}
                    </button>
                  ))}
                </div>
              </SectionCard>

              <div className="flex gap-3">
                <button
                  onClick={priceDiamond}
                  disabled={diamondLoading || !diamondCarat}
                  className="flex-1 py-4 rounded-2xl text-sm font-semibold tracking-wide transition-all duration-300 disabled:opacity-40"
                  style={{
                    background: `linear-gradient(135deg, ${premium.diamond}, #8b7bb8)`,
                    color: "#000",
                    border: "none",
                    letterSpacing: "0.05em",
                  }}
                >
                  {diamondLoading ? (
                    <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</span>
                  ) : (
                    <span className="flex items-center justify-center gap-2"><Sparkles className="w-4 h-4" /> Get Diamond Price</span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setDiamondCarat("");
                    setDiamondEstimate(null);
                    setDiamondError("");
                    setDiamondLoanPct("");
                    setDiamondSellPct("");
                  }}
                  disabled={diamondLoading}
                  className="px-5 py-4 rounded-2xl text-sm font-semibold tracking-wide transition-all duration-300 disabled:opacity-40"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: premium.textSecondary,
                    border: `1px solid ${premium.border}`,
                    letterSpacing: "0.05em",
                  }}
                >
                  Clear
                </button>
              </div>

              <SectionCard>
                <Label>Loan / Sell Rates (%)</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Loan %</Label>
                    <input type="text" inputMode="decimal" value={diamondLoanPct} onChange={(e) => { const v = e.target.value; if (v === "" || /^[0-9]*\.?[0-9]*$/.test(v)) setDiamondLoanPct(v); }} placeholder="e.g. 40" style={{ ...inputStyle, marginTop: "6px" }} />
                  </div>
                  <div>
                    <Label>Sell %</Label>
                    <input type="text" inputMode="decimal" value={diamondSellPct} onChange={(e) => { const v = e.target.value; if (v === "" || /^[0-9]*\.?[0-9]*$/.test(v)) setDiamondSellPct(v); }} placeholder="e.g. 60" style={{ ...inputStyle, marginTop: "6px" }} />
                  </div>
                </div>
              </SectionCard>

            </div>
          </div>

          <div style={{ display: activeTab === "scrap" ? "block" : "none" }}>
            <div className="space-y-5">
              <SectionCard>
                <Label>Add Scrap Item</Label>
                <MetalSelector value={scrapMetal} onChange={(m) => { setScrapMetal(m); setScrapKarat(getDefaultPurity(m)); }} />
                <PuritySelector metal={scrapMetal} value={scrapKarat} onChange={setScrapKarat} />
                <input
                  type="text"
                  inputMode="decimal"
                  value={scrapWeight}
                  onChange={(e) => { const v = e.target.value; if (v === "" || /^[0-9]*\.?[0-9]*$/.test(v)) setScrapWeight(v); }}
                  placeholder="0.00"
                  style={inputStyle}
                  onKeyDown={(e) => { if (e.key === "Enter") addScrapItem(); }}
                />
                <div className="flex items-center justify-between">
                  <UnitSelector value={scrapUnit} onChange={setScrapUnit} />
                  <button
                    onClick={addScrapItem}
                    disabled={!scrapWeight || parseFloat(scrapWeight) <= 0}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all duration-300 disabled:opacity-30"
                    style={{ background: premium.accent, color: "#fff" }}
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </SectionCard>

              {scrapItems.length > 0 && (
                <div className="rounded-3xl overflow-hidden" style={{ border: `1px solid ${premium.border}` }}>
                  <div className="px-5 py-4" style={{ background: "rgba(255,255,255,0.03)", borderBottom: `1px solid ${premium.border}` }}>
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] tracking-wider uppercase" style={{ color: premium.textTertiary }}>{scrapItems.length} item{scrapItems.length !== 1 ? "s" : ""}</p>
                      <p className="text-xl font-bold" style={{ color: premium.green, fontFamily: fontMono }}>{formatCurrency(scrapTotal)}</p>
                    </div>
                  </div>
                  <div style={{ background: premium.bgCard }}>
                    {scrapItems.map((item, i) => (
                      <div key={item.id} className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: i < scrapItems.length - 1 ? `1px solid ${premium.border}` : "none" }}>
                        <p className="text-sm" style={{ color: premium.text }}>
                          {item.weight} {item.unit === "oz" ? "troy oz" : item.unit} {item.karat} {item.metal}
                        </p>
                        <div className="flex items-center gap-4">
                          <p className="text-sm font-semibold" style={{ color: premium.text, fontFamily: fontMono }}>{formatCurrency(item.value)}</p>
                          <button onClick={() => setScrapItems((prev) => prev.filter((s) => s.id !== item.id))} className="p-1.5 rounded-full hover:opacity-60 transition-opacity">
                            <Trash2 className="w-3.5 h-3.5" style={{ color: premium.red }} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-5 py-3" style={{ background: "rgba(255,255,255,0.02)", borderTop: `1px solid ${premium.border}` }}>
                    <button onClick={() => setScrapItems([])} className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: premium.red }}>Clear All</button>
                  </div>
                </div>
              )}

              {scrapItems.length === 0 && (
                <div className="text-center py-12">
                  <Scale className="w-10 h-10 mx-auto mb-3" style={{ color: premium.textTertiary }} />
                  <p className="text-xs tracking-wide" style={{ color: premium.textTertiary }}>Add items to calculate batch total</p>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: activeTab === "reverse" ? "block" : "none" }}>
            <div className="space-y-5">
              <SectionCard>
                <Label>Price to Weight</Label>
                <p className="text-xs" style={{ color: premium.textTertiary }}>Enter a dollar amount to find how much metal it buys</p>
                <MetalSelector value={reverseMetal} onChange={(m) => { setReverseMetal(m); setReverseKaratOption(getDefaultPurity(m)); }} />
                <PuritySelector metal={reverseMetal} value={reverseKaratOption} onChange={setReverseKaratOption} />
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: premium.textTertiary }}>$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={reversePrice}
                    onChange={(e) => { const v = e.target.value; if (v === "" || /^[0-9]*\.?[0-9]*$/.test(v)) setReversePrice(v); }}
                    placeholder="0.00"
                    style={{ ...inputStyle, paddingLeft: "28px" }}
                  />
                </div>
              </SectionCard>

              <AnimatePresence>
                {reverseResult && (
                  <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl p-6" style={{ background: premium.bgCard, border: `1px solid ${premium.border}` }}>
                    <p className="text-[10px] font-medium text-center tracking-widest uppercase mb-4" style={{ color: premium.textTertiary }}>
                      {formatCurrency(parseFloat(reversePrice))} buys {reverseKaratOption.label} {reverseMetal}
                    </p>
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <p className="text-2xl font-bold" style={{ color: premium.text, fontFamily: fontMono }}>{reverseResult.grams}</p>
                        <p className="text-[10px] tracking-wider uppercase mt-1" style={{ color: premium.textTertiary }}>grams</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold" style={{ color: premium.text, fontFamily: fontMono }}>{reverseResult.oz}</p>
                        <p className="text-[10px] tracking-wider uppercase mt-1" style={{ color: premium.textTertiary }}>troy oz</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold" style={{ color: premium.text, fontFamily: fontMono }}>{reverseResult.dwt}</p>
                        <p className="text-[10px] tracking-wider uppercase mt-1" style={{ color: premium.textTertiary }}>DWT</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-center mt-4 tracking-wide" style={{ color: premium.textTertiary }}>
                      {formatCurrency(reverseResult.pricePerGram)}/g at current spot
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {activeTab === "chat" && (
            <div className="space-y-4">
              {messages.length === 0 && !chatLoading && (
                <div className="py-8">
                  <div className="text-center mb-8">
                    <div className="relative w-20 h-20 mx-auto mb-5">
                      <div className="absolute inset-0 rounded-[22px]" style={{ background: "linear-gradient(135deg, rgba(201,169,110,0.12), rgba(201,169,110,0.03))", border: "1px solid rgba(201,169,110,0.15)" }} />
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-[22px]" style={{ background: "conic-gradient(from 0deg, transparent 0%, rgba(201,169,110,0.08) 25%, transparent 50%)" }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-8 h-8" style={{ color: premium.gold }} />
                      </div>
                    </div>
                    <h2 className="text-lg font-semibold tracking-tight" style={{ color: premium.text }}>Simplicity</h2>
                    <p className="text-[10px] tracking-[0.15em] uppercase mt-1" style={{ color: premium.gold }}>AI Expert Assistant</p>
                    <p className="text-xs mt-3 max-w-xs mx-auto leading-relaxed" style={{ color: premium.textTertiary }}>
                      Precious metals, diamonds, watches, photo appraisals — powered by multi-provider AI consensus
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2 max-w-sm mx-auto">
                    {[
                      { q: "What's 10g of 14K gold worth today?", icon: Calculator, accent: premium.gold },
                      { q: "How do I identify a Rolex model?", icon: Shield, accent: "#60a5fa" },
                      { q: "Explain the 4Cs of diamonds", icon: Diamond, accent: premium.diamond },
                      { q: "What's the best precious metals investment?", icon: Zap, accent: premium.green },
                    ].map((item, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.08 }}
                        onClick={() => sendChat(item.q)}
                        className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-left transition-all duration-300 hover:scale-[1.01] group"
                        style={{ background: premium.bgCard, border: `1px solid ${premium.border}` }}
                      >
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.accent}10`, border: `1px solid ${item.accent}20` }}>
                          <item.icon className="w-3.5 h-3.5" style={{ color: item.accent }} />
                        </div>
                        <span className="text-xs leading-snug" style={{ color: premium.textSecondary }}>{item.q}</span>
                      </motion.button>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-4 mt-6 pt-4" style={{ borderTop: `1px solid ${premium.border}` }}>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: premium.green }} />
                      <span className="text-[9px] tracking-wider uppercase" style={{ color: premium.textTertiary }}>Multi-AI Consensus</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: premium.gold }} />
                      <span className="text-[9px] tracking-wider uppercase" style={{ color: premium.textTertiary }}>Voice Enabled</span>
                    </div>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.type === "user" ? "justify-end" : "items-start gap-3"}`}
                >
                  {message.type === "assistant" && <SimplicityAvatar />}
                  <div
                    className={`max-w-[80%] rounded-2xl ${message.type === "user" ? "rounded-br-md px-4 py-3" : "rounded-tl-md px-5 py-4"}`}
                    style={message.type === "user"
                      ? { background: "rgba(201,169,110,0.15)", color: premium.text, border: "1px solid rgba(201,169,110,0.2)" }
                      : { background: "rgba(255,255,255,0.03)", color: premium.text, border: `1px solid ${premium.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }
                    }
                  >
                    {message.type === "assistant" && (
                      <div className="flex items-center gap-2 mb-2 pb-2" style={{ borderBottom: `1px solid ${premium.border}` }}>
                        <span className="text-[9px] font-semibold tracking-[0.12em] uppercase" style={{ color: premium.gold }}>Simplicity</span>
                        <span className="text-[9px]" style={{ color: premium.textTertiary }}>·</span>
                        <span className="text-[9px]" style={{ color: premium.textTertiary }}>
                          {message.timestamp.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                        </span>
                      </div>
                    )}
                    {message.imageUrl && <img src={message.imageUrl} alt="Uploaded" className="w-full max-h-48 object-cover rounded-xl mb-3" style={{ border: `1px solid ${premium.border}` }} />}
                    <div className="text-[13px] leading-[1.7] whitespace-pre-wrap" style={{ fontFamily: font }}>
                      {message.type === "assistant" && message.isNew ? (
                        <StreamingText text={message.content} speed={8} onComplete={() => {
                          setMessages(prev => prev.map(m => m.id === message.id ? { ...m, isNew: false } : m));
                        }} />
                      ) : message.content}
                    </div>
                    {message.type === "assistant" && (
                      <div className="flex items-center gap-2 mt-3 pt-2" style={{ borderTop: `1px solid ${premium.border}` }}>
                        <button onClick={() => handleSpeak(message)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all duration-200 hover:opacity-70" style={{ background: "rgba(255,255,255,0.04)" }}>
                          {speakingLoading === message.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" style={{ color: premium.gold }} />
                          ) : speakingMessageId === message.id ? (
                            <div className="flex items-center gap-0.5">
                              {[0, 1, 2, 3].map((i) => (
                                <motion.div key={i} animate={{ scaleY: [0.4, 1.2, 0.4] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }} className="w-[2px] h-3 rounded-full" style={{ background: premium.gold }} />
                              ))}
                            </div>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3" style={{ color: premium.textTertiary }} />
                              <span className="text-[9px] tracking-wider uppercase" style={{ color: premium.textTertiary }}>Listen</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    {message.type === "user" && (
                      <p className="text-[9px] text-right mt-1.5" style={{ color: "rgba(201,169,110,0.4)" }}>
                        {message.timestamp.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}

              {chatLoading && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <SimplicityThinkingIndicator />
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {activeTab === "chat" && (
        <>
          {imagePreview && (
            <div className="flex items-center gap-3 px-5 py-3 flex-shrink-0" style={{ borderTop: `1px solid ${premium.border}`, background: "rgba(10,10,10,0.9)", backdropFilter: "blur(40px)" }}>
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-14 h-14 rounded-xl object-cover" style={{ border: `1px solid ${premium.border}` }} />
                <button onClick={() => setImagePreview(null)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-transform hover:scale-110" style={{ background: premium.red }}>
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
              <div>
                <span className="text-[10px] tracking-wider uppercase block" style={{ color: premium.textTertiary }}>Image Attached</span>
                <span className="text-[9px]" style={{ color: premium.textTertiary }}>Ready for AI analysis</span>
              </div>
            </div>
          )}
          <div className="flex-shrink-0 px-5 sm:px-8 py-4" style={{ borderTop: `1px solid ${premium.border}`, background: "rgba(10,10,10,0.92)", backdropFilter: "blur(40px)", paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            <div className="max-w-lg mx-auto">
              <div className="flex items-center gap-2 rounded-2xl px-2 py-2" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${premium.border}`, boxShadow: "0 -2px 20px rgba(0,0,0,0.2)" }}>
                <button onClick={() => fileInputRef.current?.click()} className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 hover:opacity-60 transition-all duration-200" style={{ color: premium.textTertiary, background: "rgba(255,255,255,0.03)" }}>
                  <ImagePlus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.capture = "environment";
                    inp.onchange = (e: any) => { const f = e.target?.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => setImagePreview(ev.target?.result as string); r.readAsDataURL(f); } };
                    inp.click();
                  }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 hover:opacity-60 transition-all duration-200 sm:hidden"
                  style={{ color: premium.textTertiary, background: "rgba(255,255,255,0.03)" }}
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={chatInputRef}
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                  placeholder="Ask Simplicity anything..."
                  className="flex-1 bg-transparent border-none outline-none text-sm min-w-0 px-2 py-2"
                  style={{ color: premium.text, caretColor: premium.gold, letterSpacing: "0.01em" }}
                  disabled={chatLoading}
                />
                <button
                  onClick={() => sendChat()}
                  disabled={chatLoading || (!chatInput.trim() && !imagePreview)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-15 transition-all duration-300"
                  style={{
                    background: chatInput.trim() || imagePreview
                      ? "linear-gradient(135deg, rgba(201,169,110,0.9), rgba(201,169,110,0.7))"
                      : "rgba(255,255,255,0.04)",
                  }}
                >
                  <Send className="w-4 h-4" style={{ color: chatInput.trim() || imagePreview ? "#000" : premium.textTertiary }} />
                </button>
              </div>
              <p className="text-center mt-2 text-[8px] tracking-wider uppercase" style={{ color: premium.textTertiary }}>
                Powered by <span className="simpleton-brand">Simpleton</span>™ AI Consensus Engine
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
