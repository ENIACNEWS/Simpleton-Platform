import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface BrainAwareness {
  currentPage: string;

  calculator?: {
    display: string;
    selectedMetal: string;
    selectedPurity: number;
    selectedKarat: number;
    selectedUnit: string;
    livePrice: number;
    loanPrice: number;
    sellPrice: number;
    priceMode: "live" | "custom";
    scrapItems?: Array<{ weight: number; karat: string; value: number }>;
    lastCalculation?: number;
  };

  diamonds?: {
    selectedCarat?: number;
    selectedClarity?: string;
    selectedColor?: string;
    selectedCut?: string;
    estimatedValue?: number;
  };

  database?: {
    searchQuery?: string;
    selectedCoin?: string;
    selectedMetal?: string;
    viewingCoin?: { name: string; weight: number; purity: number; meltValue: number };
  };

  market?: {
    goldPrice: number;
    silverPrice: number;
    platinumPrice: number;
    lastUpdated?: string;
  };

  directory?: {
    viewingBusiness?: { name: string; category: string; city: string; state: string; rating?: number };
    searchQuery?: string;
  };

  user?: {
    isLoggedIn: boolean;
    portfolioValue?: number;
  };

  intelligence?: {
    goldOutlook?: string;
    goldConfidence?: number;
    silverOutlook?: string;
    silverConfidence?: number;
    platinumOutlook?: string;
    platinumConfidence?: number;
    overallRiskScore?: number;
    overallSentiment?: string;
    convergenceAlert?: string;
    convergenceRiskLevel?: string;
    lastFetched?: string;
  };

  lastAction?: {
    type: string;
    detail: string;
    timestamp: number;
  };
}

export interface BrainAction {
  type:
    | "SET_CALCULATOR_METAL"
    | "SET_CALCULATOR_KARAT"
    | "SET_CALCULATOR_VALUE"
    | "OPEN_SCRAP_MODAL"
    | "OPEN_CUSTOM_RATES"
    | "NAVIGATE_TO"
    | "FILTER_DATABASE"
    | "HIGHLIGHT_COIN"
    | "SHOW_DIAMOND_GRADE"
    | "PULSE_ELEMENT";
  payload: any;
}

interface BrainContextType {
  awareness: BrainAwareness;
  updateAwareness: (update: Partial<BrainAwareness>) => void;
  logAction: (type: string, detail: string) => void;
  isOpen: boolean;
  openBrain: (prefilledMessage?: string) => void;
  closeBrain: () => void;
  prefilledMessage: string;
  setPrefilledMessage: (msg: string) => void;
  pendingAction: BrainAction | null;
  dispatchAction: (action: BrainAction) => void;
  clearAction: () => void;
  suggestion: { message: string; context: string } | null;
  setSuggestion: (s: { message: string; context: string } | null) => void;
}

const BrainContext = createContext<BrainContextType | null>(null);

export function BrainProvider({ children }: { children: ReactNode }) {
  const [awareness, setAwareness] = useState<BrainAwareness>({
    currentPage: "/",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [prefilledMessage, setPrefilledMessage] = useState("");
  const [pendingAction, setPendingAction] = useState<BrainAction | null>(null);
  const [suggestion, setSuggestion] = useState<{ message: string; context: string } | null>(null);

  const updateAwareness = useCallback((update: Partial<BrainAwareness>) => {
    setAwareness(prev => ({
      ...prev,
      ...update,
      calculator: update.calculator ? { ...prev.calculator, ...update.calculator } as BrainAwareness["calculator"] : prev.calculator,
      diamonds: update.diamonds ? { ...prev.diamonds, ...update.diamonds } : prev.diamonds,
      database: update.database ? { ...prev.database, ...update.database } : prev.database,
      market: update.market ? { ...prev.market, ...update.market } : prev.market,
      directory: update.directory ? { ...prev.directory, ...update.directory } : prev.directory,
      intelligence: update.intelligence ? { ...prev.intelligence, ...update.intelligence } : prev.intelligence,
    }));
  }, []);

  const logAction = useCallback((type: string, detail: string) => {
    setAwareness(prev => ({
      ...prev,
      lastAction: { type, detail, timestamp: Date.now() }
    }));
  }, []);

  const openBrain = useCallback((prefilled?: string) => {
    if (prefilled) setPrefilledMessage(prefilled);
    setIsOpen(true);
  }, []);

  const closeBrain = useCallback(() => {
    setIsOpen(false);
    setPrefilledMessage("");
  }, []);

  const dispatchAction = useCallback((action: BrainAction) => {
    setPendingAction(action);
  }, []);

  const clearAction = useCallback(() => {
    setPendingAction(null);
  }, []);

  return (
    <BrainContext.Provider value={{
      awareness,
      updateAwareness,
      logAction,
      isOpen,
      openBrain,
      closeBrain,
      prefilledMessage,
      setPrefilledMessage,
      pendingAction,
      dispatchAction,
      clearAction,
      suggestion,
      setSuggestion,
    }}>
      {children}
    </BrainContext.Provider>
  );
}

export function useBrain() {
  const ctx = useContext(BrainContext);
  if (!ctx) throw new Error("useBrain must be used inside BrainProvider");
  return ctx;
}

export function buildBrainSystemContext(awareness: BrainAwareness): string {
  const parts: string[] = [];

  parts.push(`CURRENT APP STATE (what the user is looking at right now):`);
  parts.push(`Page: ${awareness.currentPage}`);

  if (awareness.calculator) {
    const c = awareness.calculator;
    parts.push(`\nCALCULATOR STATE:`);
    parts.push(`- Metal: ${c.selectedMetal}, Purity: ${c.selectedPurity}% (${c.selectedKarat}K)`);
    parts.push(`- Display value: ${c.display}`);
    parts.push(`- Price mode: ${c.priceMode}`);
    parts.push(`- Live price: $${c.livePrice?.toFixed(2)}/oz | Loan price: $${c.loanPrice?.toFixed(2)}/oz | Sell price: $${c.sellPrice?.toFixed(2)}/oz`);
    if (c.lastCalculation) parts.push(`- Last calculated value: $${c.lastCalculation.toFixed(2)}`);
    if (c.scrapItems && c.scrapItems.length > 0) {
      parts.push(`- SCRAP batch: ${c.scrapItems.length} items, total value $${c.scrapItems.reduce((s, i) => s + i.value, 0).toFixed(2)}`);
    }
  }

  if (awareness.diamonds) {
    const d = awareness.diamonds;
    parts.push(`\nDIAMOND CALCULATOR STATE:`);
    if (d.selectedCarat) parts.push(`- Carat: ${d.selectedCarat}`);
    if (d.selectedClarity) parts.push(`- Clarity: ${d.selectedClarity}`);
    if (d.selectedColor) parts.push(`- Color: ${d.selectedColor}`);
    if (d.selectedCut) parts.push(`- Cut: ${d.selectedCut}`);
    if (d.estimatedValue) parts.push(`- Estimated value: $${d.estimatedValue.toLocaleString()}`);
  }

  if (awareness.database?.viewingCoin) {
    const coin = awareness.database.viewingCoin;
    parts.push(`\nUSER IS VIEWING COIN: ${coin.name}`);
    parts.push(`- Weight: ${coin.weight}g, Purity: ${coin.purity}%, Melt value: $${coin.meltValue?.toFixed(2)}`);
  }

  if (awareness.directory?.viewingBusiness) {
    const biz = awareness.directory.viewingBusiness;
    parts.push(`\nUSER IS VIEWING BUSINESS: ${biz.name}`);
    parts.push(`- Category: ${biz.category}, Location: ${biz.city}, ${biz.state}`);
    if (biz.rating) parts.push(`- Rating: ${biz.rating}/5`);
  }

  if (awareness.market) {
    const m = awareness.market;
    parts.push(`\nLIVE MARKET PRICES:`);
    parts.push(`- Gold: $${m.goldPrice?.toFixed(2)}/oz | Silver: $${m.silverPrice?.toFixed(2)}/oz | Platinum: $${m.platinumPrice?.toFixed(2)}/oz`);
  }

  if (awareness.intelligence) {
    const intel = awareness.intelligence;
    parts.push(`\nMARKET INTELLIGENCE (updated ${intel.lastFetched || 'recently'}):`);
    if (intel.goldOutlook) parts.push(`- Gold outlook: ${intel.goldOutlook} (confidence: ${intel.goldConfidence}%)`);
    if (intel.silverOutlook) parts.push(`- Silver outlook: ${intel.silverOutlook} (confidence: ${intel.silverConfidence}%)`);
    if (intel.platinumOutlook) parts.push(`- Platinum outlook: ${intel.platinumOutlook} (confidence: ${intel.platinumConfidence}%)`);
    if (intel.overallRiskScore !== undefined) parts.push(`- Overall risk score: ${intel.overallRiskScore}/100`);
    if (intel.overallSentiment) parts.push(`- Market sentiment: ${intel.overallSentiment}`);
    if (intel.convergenceAlert) parts.push(`- Convergence alert: ${intel.convergenceAlert} (risk: ${intel.convergenceRiskLevel})`);
  }

  if (awareness.lastAction) {
    parts.push(`\nLAST USER ACTION: ${awareness.lastAction.type} — ${awareness.lastAction.detail}`);
  }

  return parts.join("\n");
}
