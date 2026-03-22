import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useLivePricing } from "@/hooks/use-live-pricing";
import { useAuth } from "@/hooks/use-auth";
import { useBrain } from "@/lib/brain-context";

const playClickSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;

    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(85, t);
    sub.frequency.exponentialRampToValueAtTime(60, t + 0.06);
    subGain.gain.setValueAtTime(0.18, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    sub.connect(subGain);
    subGain.connect(ctx.destination);

    const body = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    body.type = 'sine';
    body.frequency.setValueAtTime(260, t);
    body.frequency.exponentialRampToValueAtTime(200, t + 0.05);
    bodyGain.gain.setValueAtTime(0.12, t);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    body.connect(bodyGain);
    bodyGain.connect(ctx.destination);

    const harmonic = ctx.createOscillator();
    const harmonicGain = ctx.createGain();
    harmonic.type = 'sine';
    harmonic.frequency.setValueAtTime(520, t);
    harmonic.frequency.exponentialRampToValueAtTime(400, t + 0.03);
    harmonicGain.gain.setValueAtTime(0.04, t);
    harmonicGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    harmonic.connect(harmonicGain);
    harmonicGain.connect(ctx.destination);

    sub.start(t); sub.stop(t + 0.08);
    body.start(t); body.stop(t + 0.1);
    harmonic.start(t); harmonic.stop(t + 0.06);
    setTimeout(() => ctx.close(), 250);
  } catch {}
};

const flashButton = (btn: HTMLElement) => {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:absolute;inset:0;border-radius:inherit;
    background:radial-gradient(circle,rgba(255,215,0,0.5) 0%,rgba(255,215,0,0) 70%);
    pointer-events:none;z-index:50;animation:btnFlash 0.3s ease-out forwards;
  `;
  btn.style.position = 'relative';
  btn.style.overflow = 'hidden';
  btn.appendChild(overlay);
  setTimeout(() => overlay.remove(), 350);
};

if (typeof document !== 'undefined' && !document.getElementById('btn-flash-style')) {
  const s = document.createElement('style');
  s.id = 'btn-flash-style';
  s.textContent = `
    @keyframes btnFlash {
      0% { opacity:1; transform:scale(0.3); }
      50% { opacity:0.8; transform:scale(1.2); }
      100% { opacity:0; transform:scale(1.5); }
    }
  `;
  document.head.appendChild(s);
}

// Memory System for Calculator State Persistence
const saveCalculatorState = (key: string, value: any): void => {
  try {
    localStorage.setItem(`simpleton-${key}`, JSON.stringify(value));
  } catch (error) {
    // Silent fallback
  }
};

const loadCalculatorState = (key: string, defaultValue: any): any => {
  try {
    const stored = localStorage.getItem(`simpleton-${key}`);
    if (stored !== null) {
      return JSON.parse(stored);
    }
    return defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

interface AuthenticSimpletonCalculatorProps {
  onMenuToggle?: () => void;
}

export function AuthenticSimpletonCalculator({ onMenuToggle }: AuthenticSimpletonCalculatorProps = {}) {
  const buttonFeedback = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const button = target.closest('button') as HTMLElement | null;
    if (!button) return;
    flashButton(button);
    playClickSound();
    try { if (navigator.vibrate) navigator.vibrate(30); } catch {}
  }, []);

  // Core calculator state with advanced persistent memory
  const [display, setDisplay] = useState('0'); // Always start with zero display
  const [currentInput, setCurrentInput] = useState(''); // Always start with empty input
  const [selectedMetal, setSelectedMetal] = useState<'gold' | 'silver' | 'platinum'>(() => loadCalculatorState('selected-metal', 'gold'));
  const [selectedPurity, setSelectedPurity] = useState(() => loadCalculatorState('selected-purity', 99.9));
  const [selectedUnit, setSelectedUnit] = useState<'grams' | 'oz'>(() => loadCalculatorState('selected-unit', 'grams'));
  const [mode, setMode] = useState<'weight' | 'purity' | 'price' | 'reverse'>(() => loadCalculatorState('mode', 'weight'));
  const [priceMode, setPriceMode] = useState<'live' | 'custom'>(() => loadCalculatorState('price-mode', 'live'));
  const [customSpotPrice, setCustomSpotPrice] = useState<number | null>(() => loadCalculatorState('custom-spot-price', null));
  const [reverseKarat, setReverseKarat] = useState(() => loadCalculatorState('reverse-karat', 24));
  const [reversePricePerGram, setReversePricePerGram] = useState<number | null>(() => loadCalculatorState('reverse-price-per-gram', null));
  const [reverseResults, setReverseResults] = useState<{[key: string]: number} | null>(null);
  const [memory, setMemory] = useState<number | null>(() => loadCalculatorState('memory', null));
  const [isTraditionalMode, setIsTraditionalMode] = useState(() => loadCalculatorState('traditional-mode', false));
  const [selectedKarat, setSelectedKarat] = useState(() => loadCalculatorState('selected-karat', 24));
  const [isCleared, setIsCleared] = useState(false); // Track if calculator has been cleared
  const [isCycling, setIsCycling] = useState(false); // Prevent calculations during cycling
  const [priceType, setPriceType] = useState<'live' | 'loan' | 'sell'>(() => loadCalculatorState('price-type', 'live'));

  const [spotLoanPct, setSpotLoanPct] = useState(79);
  const [spotSellSpread, setSpotSellSpread] = useState(4);
  const [spotSilverLoanPct, setSpotSilverLoanPct] = useState(39);
  const [spotSilverSpread, setSpotSilverSpread] = useState(0.25);

  // Fractional oz cycling state - replaces palladium functionality
  const [fractionalOzIndex, setFractionalOzIndex] = useState(() => loadCalculatorState('fractional-oz-index', 0));
  const fractionalOzOptions = [
    { value: 0.5, label: '1/2 OZ' },
    { value: 0.25, label: '1/4 OZ' },
    { value: 0.1, label: '1/10 OZ' },
    { value: 0.01, label: '1/100 OZ' }
  ];
  
  // Enhanced dual pricing system with localStorage persistence
  const [loanRates, setLoanRates] = useState<{[key: string]: number}>(() => {
    try {
      const saved = localStorage.getItem('simpleton-loan-rates');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [sellRates, setSellRates] = useState<{[key: string]: number}>(() => {
    try {
      const saved = localStorage.getItem('simpleton-sell-rates');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  
  // Enhanced Backup System for Recall Feature
  const [backupLoanRates, setBackupLoanRates] = useState<{[key: string]: number}>(() => {
    try {
      const saved = localStorage.getItem('simpleton-backup-loan-rates');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [backupSellRates, setBackupSellRates] = useState<{[key: string]: number}>(() => {
    try {
      const saved = localStorage.getItem('simpleton-backup-sell-rates');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [backupCustomSpotPrices, setBackupCustomSpotPrices] = useState<{[key: string]: number | undefined}>(() => {
    try {
      const saved = localStorage.getItem('simpleton-backup-custom-spot-prices');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  

  const [showDualPriceModal, setShowDualPriceModal] = useState(false);
  const [selectedKaratForPricing, setSelectedKaratForPricing] = useState<{value: number, label: string, purity: number} | null>(null);
  const [yourRatesMode, setYourRatesMode] = useState(false);
  const [showCustomRatesModal, setShowCustomRatesModal] = useState(false);
  const [showClearRatesModal, setShowClearRatesModal] = useState(false);
  const [showCustomSpotModal, setShowCustomSpotModal] = useState(false);
  
  // SCRAP batch calculator state
  const [showScrapModal, setShowScrapModal] = useState(false);
  const [scrapItems, setScrapItems] = useState<Array<{id: number, weight: number, karat: string, purity: number, value: number}>>([]);
  const [scrapWeight, setScrapWeight] = useState('');
  const [scrapKarat, setScrapKarat] = useState('14K');
  const [customSpotPrices, setCustomSpotPrices] = useState<{[key: string]: number | undefined}>(() => {
    try {
      const saved = localStorage.getItem('simpleton-custom-spot-prices');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [livePrice, setLivePrice] = useState<number | string>(0);
  const [loanPrice, setLoanPrice] = useState<number | string>(0);
  const [sellPrice, setSellPrice] = useState<number | string>(0);
  
  // Traditional calculator state
  const [traditionalDisplay, setTraditionalDisplay] = useState('0');
  const [traditionalPrevious, setTraditionalPrevious] = useState<number | null>(null);
  const [traditionalOperation, setTraditionalOperation] = useState<string | null>(null);
  const [traditionalWaitingForOperand, setTraditionalWaitingForOperand] = useState(false);
  const [traditionalMemory, setTraditionalMemory] = useState<number>(0);
  
  const { prices: metalPrices } = useLivePricing();
  const { user, isAuthenticated } = useAuth();
  const settingsLoadedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveSettingsToServer = useCallback(() => {
    if (!isAuthenticated) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const currentCustomSpotPricesStr = localStorage.getItem('simpleton-custom-spot-prices');
        const currentLoanRatesStr = localStorage.getItem('simpleton-loan-rates');
        const currentSellRatesStr = localStorage.getItem('simpleton-sell-rates');
        await fetch('/api/calculator/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            customSpotPrices: currentCustomSpotPricesStr ? JSON.parse(currentCustomSpotPricesStr) : {},
            selectedMetal: loadCalculatorState('selected-metal', 'gold'),
            selectedKarat: loadCalculatorState('selected-karat', 24),
            selectedPurity: loadCalculatorState('selected-purity', 99.9),
            selectedUnit: loadCalculatorState('selected-unit', 'grams'),
            priceMode: loadCalculatorState('price-mode', 'live'),
            priceType: loadCalculatorState('price-type', 'live'),
            customSpotPrice: loadCalculatorState('custom-spot-price', null),
            isTraditionalMode: loadCalculatorState('traditional-mode', false),
            customLoanRates: currentLoanRatesStr ? JSON.parse(currentLoanRatesStr) : {},
            customSellRates: currentSellRatesStr ? JSON.parse(currentSellRatesStr) : {},
          }),
        });
      } catch {}
    }, 2000);
  }, [isAuthenticated]);

  const currentUserId = user?.id;
  useEffect(() => {
    settingsLoadedRef.current = false;
  }, [currentUserId]);

  useEffect(() => {
    if (!isAuthenticated || settingsLoadedRef.current) return;
    settingsLoadedRef.current = true;
    (async () => {
      try {
        const res = await fetch('/api/calculator/settings', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (!data.success || !data.settings) return;
        const s = data.settings;
        if (s.customSpotPrices && Object.keys(s.customSpotPrices).length > 0) {
          setCustomSpotPrices(s.customSpotPrices);
          localStorage.setItem('simpleton-custom-spot-prices', JSON.stringify(s.customSpotPrices));
        }
        if (s.selectedMetal) { setSelectedMetal(s.selectedMetal); saveCalculatorState('selected-metal', s.selectedMetal); }
        if (s.selectedKarat) { setSelectedKarat(s.selectedKarat); saveCalculatorState('selected-karat', s.selectedKarat); }
        if (s.selectedPurity) { setSelectedPurity(parseFloat(s.selectedPurity)); saveCalculatorState('selected-purity', parseFloat(s.selectedPurity)); }
        if (s.selectedUnit) { setSelectedUnit(s.selectedUnit); saveCalculatorState('selected-unit', s.selectedUnit); }
        if (s.priceMode) { setPriceMode(s.priceMode); saveCalculatorState('price-mode', s.priceMode); }
        if (s.priceType) { setPriceType(s.priceType); saveCalculatorState('price-type', s.priceType); }
        if (s.customSpotPrice) { setCustomSpotPrice(parseFloat(s.customSpotPrice)); saveCalculatorState('custom-spot-price', parseFloat(s.customSpotPrice)); }
        if (s.isTraditionalMode !== undefined) { setIsTraditionalMode(s.isTraditionalMode); saveCalculatorState('traditional-mode', s.isTraditionalMode); }
        if (s.customLoanRates && Object.keys(s.customLoanRates).length > 0) {
          setLoanRates(s.customLoanRates);
          localStorage.setItem('simpleton-loan-rates', JSON.stringify(s.customLoanRates));
        }
        if (s.customSellRates && Object.keys(s.customSellRates).length > 0) {
          setSellRates(s.customSellRates);
          localStorage.setItem('simpleton-sell-rates', JSON.stringify(s.customSellRates));
        }
      } catch {}
    })();
  }, [isAuthenticated]);

  const logCalculationHistory = useCallback(async (metal: string, karat: string, purity: number, weight: number, unit: string, spotPrice: number, meltValue: number, pt: string) => {
    if (!isAuthenticated) return;
    try {
      await fetch('/api/calculator/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ metal, karat, purity, weight, unit, spotPrice, meltValue, priceType: pt }),
      });
    } catch {}
  }, [isAuthenticated]);

  // Advanced Memory System - Auto-save all calculator states
  useEffect(() => {
    saveCalculatorState('display', display);
  }, [display]);

  useEffect(() => {
    saveCalculatorState('current-input', currentInput);
  }, [currentInput]);

  useEffect(() => {
    saveCalculatorState('selected-metal', selectedMetal);
    saveSettingsToServer();
  }, [selectedMetal, saveSettingsToServer]);

  useEffect(() => {
    saveCalculatorState('selected-purity', selectedPurity);
    saveSettingsToServer();
  }, [selectedPurity, saveSettingsToServer]);

  useEffect(() => {
    saveCalculatorState('selected-unit', selectedUnit);
    saveSettingsToServer();
  }, [selectedUnit, saveSettingsToServer]);

  useEffect(() => {
    saveCalculatorState('mode', mode);
  }, [mode]);

  useEffect(() => {
    saveCalculatorState('price-mode', priceMode);
    saveSettingsToServer();
  }, [priceMode, saveSettingsToServer]);

  useEffect(() => {
    saveCalculatorState('custom-spot-price', customSpotPrice);
    saveSettingsToServer();
  }, [customSpotPrice, saveSettingsToServer]);

  useEffect(() => {
    saveCalculatorState('reverse-karat', reverseKarat);
  }, [reverseKarat]);

  useEffect(() => {
    saveCalculatorState('reverse-price-per-gram', reversePricePerGram);
  }, [reversePricePerGram]);

  useEffect(() => {
    saveCalculatorState('memory', memory);
  }, [memory]);

  useEffect(() => {
    saveCalculatorState('traditional-mode', isTraditionalMode);
    saveSettingsToServer();
  }, [isTraditionalMode, saveSettingsToServer]);

  useEffect(() => {
    saveCalculatorState('selected-karat', selectedKarat);
    saveSettingsToServer();
  }, [selectedKarat, saveSettingsToServer]);

  const { updateAwareness, logAction } = useBrain();
  useEffect(() => {
    updateAwareness({
      calculator: {
        display,
        selectedMetal,
        selectedPurity,
        selectedKarat,
        selectedUnit: 'grams',
        livePrice: typeof livePrice === 'number' ? livePrice : parseFloat(String(livePrice)) || 0,
        loanPrice: typeof loanPrice === 'number' ? loanPrice : parseFloat(String(loanPrice)) || 0,
        sellPrice: typeof sellPrice === 'number' ? sellPrice : parseFloat(String(sellPrice)) || 0,
        priceMode,
        scrapItems: scrapItems.length > 0 ? scrapItems : undefined,
        lastCalculation: parseFloat(display.replace(/[^0-9.]/g, '')) || 0,
      }
    });
  }, [display, selectedMetal, selectedPurity, selectedKarat, livePrice, loanPrice, sellPrice, priceMode, scrapItems]);

  // Enhanced Memory System with Backup Creation
  const createBackup = () => {
    try {
      // Create backup of current rates before any changes
      localStorage.setItem('simpleton-backup-loan-rates', JSON.stringify(loanRates));
      localStorage.setItem('simpleton-backup-sell-rates', JSON.stringify(sellRates));
      localStorage.setItem('simpleton-backup-custom-spot-prices', JSON.stringify(customSpotPrices));
      setBackupLoanRates(loanRates);
      setBackupSellRates(sellRates);
      setBackupCustomSpotPrices(customSpotPrices);

    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  };

  // Recall Function - Restore Previous Custom Prices
  const recallPreviousPrices = () => {
    try {
      // Create backup of current state first
      createBackup();
      
      // Restore from backup
      setLoanRates(backupLoanRates);
      setSellRates(backupSellRates);
      setCustomSpotPrices(backupCustomSpotPrices);
      

    } catch (error) {
      console.error('Failed to recall previous prices:', error);
    }
  };

  // Auto-Fill Feature - Mathematical Price Interpolation/Extrapolation
  const autoFillMissingPrices = () => {
    try {
      createBackup(); // Create backup before changes
      
      // Karat and purity mappings for all metals
      const karatPurities: {[key: string]: number} = {
        // Gold karats
        '6K': 25.0,
        '8K': 33.3,
        '9K': 37.5,
        '10K': 41.7,
        '12K': 50.0,
        '14K': 58.3,
        '16K': 66.7,
        '18K': 75.0,
        '20K': 83.3,
        '21K': 87.5,
        '22K': 91.7,
        '24K': 99.9,
        // Silver purities (silver prefix for auto-fill)
        '.925': 92.5,
        '.958': 95.8,
        '.999': 99.9,
        '.900': 90.0,
        '.835': 83.5,
        '.800': 80.0,
        // Platinum purities
        '.950': 95.0
      };

      const calculateMissingRates = (existingRates: {[key: string]: number}) => {
        const newRates = { ...existingRates };
        
        // Separate metals for different calculations
        const goldKarats = Object.keys(karatPurities).filter(k => k.endsWith('K'));
        const silverKarats = Object.keys(karatPurities).filter(k => k.startsWith('.') && ['925', '958', '999', '900', '835', '800'].some(s => k.includes(s)));
        const platinumKarats = Object.keys(karatPurities).filter(k => k === '.950');
        
        // Calculate missing gold rates
        const goldEntries = Object.entries(existingRates)
          .filter(([karat]) => goldKarats.includes(karat))
          .map(([karat, price]) => {
            const purity = karatPurities[karat];
            if (purity === undefined) throw new Error(`Unknown karat: ${karat}`);
            return { karat, price, purity };
          })
          .sort((a, b) => a.purity - b.purity);

        // Only calculate gold if we have at least 2 gold entries
        if (goldEntries.length >= 2) {
          const n = goldEntries.length;
          const sumX = goldEntries.reduce((sum, entry) => sum + entry.purity, 0);
          const sumY = goldEntries.reduce((sum, entry) => sum + entry.price, 0);
          const sumXY = goldEntries.reduce((sum, entry) => sum + entry.purity * entry.price, 0);
          const sumXX = goldEntries.reduce((sum, entry) => sum + entry.purity * entry.purity, 0);
          
          const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
          const intercept = (sumY - slope * sumX) / n;

          // Fill in missing gold rates only
          goldKarats.forEach(karat => {
            if (!existingRates[karat]) {
              const purity = karatPurities[karat];
              const calculatedPrice = slope * purity + intercept;
              // Round to whole numbers for clean pricing, minimum $1
              newRates[karat] = Math.max(1, Math.round(calculatedPrice));
            }
          });
        }

        // Silver auto-fill: if we have silver price, keep it as-is
        // Silver pricing is completely different from gold and shouldn't be interpolated
        
        return newRates;
      };

      // Auto-fill loan rates
      const newLoanRates = calculateMissingRates(loanRates);
      setLoanRates(newLoanRates);

      // Auto-fill sell rates  
      const newSellRates = calculateMissingRates(sellRates);
      setSellRates(newSellRates);


      
    } catch (error) {
      console.error('Failed to auto-fill missing prices:', error);
    }
  };

  // ── CALCULATE RATES FROM SPOT (MCPB Algorithm) ────────────────────────────
  // Reverse-engineered from Motor City Pawn Brokers whiteboard:
  //   Gold loan  = melt value per gram × loanPct (default 79%)
  //   Gold sell  = loan + spreadPerGram (default $4/g)
  //   Silver loan = silver melt × silverLoanPct (default 39%)
  //   Silver sell = silver loan + silverSpread (default $0.25/g)
  //   Platinum loan = platinum melt × platLoanPct (default 75%)
  //   Platinum sell = platinum loan + platSpread (default $4/g)
  const calculateRatesFromSpot = (
    loanPct = 0.79,
    sellSpread = 4.0,
    silverLoanPct = 0.39,
    silverSpread = 0.25,
    platLoanPct = 0.75,
    platSpread = 4.0
  ) => {
    const TROY = 31.1034768;
    const goldSpot = metalPrices?.gold || 0;
    const silverSpot = metalPrices?.silver || 0;
    const platSpot = metalPrices?.platinum || 0;

    if (goldSpot <= 0 && silverSpot <= 0 && platSpot <= 0) return;

    createBackup();

    const newLoan: {[key: string]: number} = { ...loanRates };
    const newSell: {[key: string]: number} = { ...sellRates };

    // Gold — all karats
    if (goldSpot > 0) {
      const goldPerGram = goldSpot / TROY;
      GOLD_KARATS.forEach(({ label, purity }) => {
        const melt = goldPerGram * (purity / 100);
        newLoan[label] = Math.round(melt * loanPct * 100) / 100;
        newSell[label] = Math.round((newLoan[label] + sellSpread) * 100) / 100;
      });
    }

    // Silver — all purities
    if (silverSpot > 0) {
      const silverPerGram = silverSpot / TROY;
      SILVER_PURITIES.forEach(({ label, purity }) => {
        const melt = silverPerGram * (purity / 100);
        newLoan[label] = Math.round(melt * silverLoanPct * 100) / 100;
        newSell[label] = Math.round((newLoan[label] + silverSpread) * 100) / 100;
      });
    }

    // Platinum
    if (platSpot > 0) {
      const platPerGram = platSpot / TROY;
      PLATINUM_PURITIES.forEach(({ label, purity }) => {
        const melt = platPerGram * (purity / 100);
        newLoan[label] = Math.round(melt * platLoanPct * 100) / 100;
        newSell[label] = Math.round((newLoan[label] + platSpread) * 100) / 100;
      });
    }

    setLoanRates(newLoan);
    setSellRates(newSell);
  };

  // Persist custom rates to localStorage with auto-backup + server sync
  useEffect(() => {
    try {
      localStorage.setItem('simpleton-loan-rates', JSON.stringify(loanRates));
      saveSettingsToServer();
    } catch (error) {
      console.error('Failed to save loan rates:', error);
    }
  }, [loanRates, saveSettingsToServer]);

  useEffect(() => {
    try {
      localStorage.setItem('simpleton-sell-rates', JSON.stringify(sellRates));
      saveSettingsToServer();
    } catch (error) {
      console.error('Failed to save sell rates:', error);
    }
  }, [sellRates, saveSettingsToServer]);

  // Persist custom spot prices with enhanced memory + server sync
  useEffect(() => {
    try {
      localStorage.setItem('simpleton-custom-spot-prices', JSON.stringify(customSpotPrices));
      saveSettingsToServer();
    } catch (error) {
      console.error('Failed to save custom spot prices:', error);
    }
  }, [customSpotPrices, saveSettingsToServer]);

  // Update LED displays when rates or price type changes
  useEffect(() => {
    // Check for corrupted sell rates on load and auto-fix
    const checkForCorruptedRates = () => {
      const hasExtremeRate = Object.values(sellRates).some((rate: any) => 
        typeof rate === 'number' && rate > 5000
      );
      
      if (hasExtremeRate) {
        console.log('🚨 CORRUPTED RATES DETECTED IN USEEFFECT - Auto-fixing...');
        emergencyReset();
        return true;
      }
      return false;
    };
    
    // Don't update LED displays if calculator has been cleared or is cycling
    if (isCleared || isCycling) {
      return;
    }
    
    // Check for corrupted rates first
    if (checkForCorruptedRates()) {
      return;
    }
    
    if (currentInput && mode === 'weight' && !isTraditionalMode) {
      const weight = parseFloat(currentInput);
      if (!isNaN(weight)) {
        calculateValue(weight);
      } else {
        updateLEDDisplays();
      }
    } else if (!isTraditionalMode) {
      // Update LED displays with per-gram prices when no weight is entered
      updateLEDDisplays();
    }
  }, [loanRates, sellRates, priceType, selectedMetal, selectedPurity, metalPrices, isCleared, isCycling]);

  // Traditional calculator functions
  const traditionalCalculate = () => {
    const inputValue = parseFloat(traditionalDisplay);
    
    if (traditionalPrevious === null) {
      return;
    }
    
    if (traditionalOperation) {
      let result = 0;
      switch (traditionalOperation) {
        case '+':
          result = traditionalPrevious + inputValue;
          break;
        case '-':
          result = traditionalPrevious - inputValue;
          break;
        case '*':
          result = traditionalPrevious * inputValue;
          break;
        case '/':
          if (inputValue === 0) {
            setTraditionalDisplay('Error');
            return;
          }
          result = traditionalPrevious / inputValue;
          break;
        default:
          return;
      }
      
      setTraditionalDisplay(result.toString());
      setTraditionalPrevious(result);
      setTraditionalOperation(null);
      setTraditionalWaitingForOperand(false);
      logCalculationHistory('calculator', traditionalOperation, 0, traditionalPrevious, `${traditionalOperation} ${inputValue}`, 0, result, 'traditional');
    }
  };

  const traditionalInputNumber = (digit: string) => {
    if (traditionalWaitingForOperand) {
      setTraditionalDisplay(digit);
      setTraditionalWaitingForOperand(false);
    } else {
      setTraditionalDisplay(traditionalDisplay === '0' ? digit : traditionalDisplay + digit);
    }
  };

  const traditionalInputDot = () => {
    if (traditionalWaitingForOperand) {
      setTraditionalDisplay('0.');
      setTraditionalWaitingForOperand(false);
    } else if (traditionalDisplay.indexOf('.') === -1) {
      setTraditionalDisplay(traditionalDisplay + '.');
    }
  };

  const traditionalInputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(traditionalDisplay);
    
    if (traditionalPrevious === null) {
      setTraditionalPrevious(inputValue);
    } else if (traditionalOperation) {
      traditionalCalculate();
    }
    
    setTraditionalWaitingForOperand(true);
    setTraditionalOperation(nextOperation);
  };

  // Persist custom spot prices to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('simpleton-custom-spot-prices', JSON.stringify(customSpotPrices));
    } catch (error) {
      console.error('Failed to save custom spot prices:', error);
    }
  }, [customSpotPrices]);

  // Complete karat and purity definitions for custom rates
  const GOLD_KARATS = [
    { karat: 24, purity: 99.9, label: '24K' },
    { karat: 22, purity: 91.7, label: '22K' },
    { karat: 21, purity: 87.5, label: '21K' },
    { karat: 20, purity: 83.3, label: '20K' },
    { karat: 18, purity: 75.0, label: '18K' },
    { karat: 16, purity: 66.7, label: '16K' },
    { karat: 14, purity: 58.3, label: '14K' },
    { karat: 12, purity: 50.0, label: '12K' },
    { karat: 10, purity: 41.7, label: '10K' },
    { karat: 9, purity: 37.5, label: '9K' },
    { karat: 8, purity: 33.3, label: '8K' },
    { karat: 6, purity: 25.0, label: '6K' }
  ];

  const SILVER_PURITIES = [
    { purity: 99.9, label: '.999' },
    { purity: 95.8, label: '.958' },
    { purity: 92.5, label: '.925' },
    { purity: 90.0, label: '.900' },
    { purity: 83.5, label: '.835' },
    { purity: 80.0, label: '.800' }
  ];

  const PLATINUM_PURITIES = [
    { purity: 95.0, label: '.950', desc: 'Premium Grade' }
  ];

  // Enhanced mathematical accuracy with industry-standard precision
  const PRECISION_CONSTANTS = {
    GRAMS_PER_TROY_OUNCE: 31.1034768,
    GRAMS_PER_PENNYWEIGHT: 1.55517384,
    CALCULATION_PRECISION: 15,
    CURRENCY_PRECISION: 2,
    PURITY_PRECISION: 4
  };

  // Karat/Purity options for Gold and Silver - exactly as in your implementation
  const getMetalOptions = () => {
    if (selectedMetal === 'gold') {
      return [
        { value: 24, purity: 99.9, label: '24K', desc: 'Pure Gold' },
        { value: 22, purity: 91.7, label: '22K', desc: 'Investment' },
        { value: 21, purity: 87.5, label: '21K', desc: 'High Grade' },
        { value: 20, purity: 83.3, label: '20K', desc: 'Premium' },
        { value: 18, purity: 75.0, label: '18K', desc: 'Fine Jewelry' },
        { value: 16, purity: 66.7, label: '16K', desc: 'Quality' },
        { value: 14, purity: 58.3, label: '14K', desc: 'Standard' },
        { value: 12, purity: 50.0, label: '12K', desc: 'Medium' },
        { value: 10, purity: 41.7, label: '10K', desc: 'Entry Level' },
        { value: 9, purity: 37.5, label: '9K', desc: 'Basic' },
        { value: 8, purity: 33.3, label: '8K', desc: 'Low Grade' },
        { value: 6, purity: 25.0, label: '6K', desc: 'Minimal' },
      ];
    } else if (selectedMetal === 'silver') {
      return [
        { value: 999, purity: 99.9, label: '.999', desc: 'Fine Silver' },
        { value: 958, purity: 95.8, label: '.958', desc: 'Britannia' },
        { value: 925, purity: 92.5, label: '.925', desc: 'Sterling' },
        { value: 900, purity: 90.0, label: '.900', desc: 'Coin Silver' },
        { value: 835, purity: 83.5, label: '.835', desc: 'European' },
        { value: 800, purity: 80.0, label: '.800', desc: 'Standard' },
      ];
    } else {
      // Platinum and Palladium
      return [
        { value: 999, purity: 99.9, label: '.999', desc: 'Pure' },
        { value: 950, purity: 95.0, label: '.950', desc: 'Premium' },
        { value: 900, purity: 90.0, label: '.900', desc: 'Standard' },
      ];
    }
  };

  // Essential helper functions - from your implementation
  const karatToPurity = (karat: number) => {
    return (karat / 24) * 100;
  };

  const purityToKarat = (purity: number) => {
    return (purity / 100) * 24;
  };

  const getCurrentKarat = () => {
    return Math.round(purityToKarat(selectedPurity));
  };

  // Helper function to get current karat/purity label for displays
  const getCurrentKaratLabel = () => {
    if (selectedMetal === 'gold') {
      return `${getCurrentKarat()}K`;
    } else if (selectedMetal === 'silver') {
      return `.${Math.round(selectedPurity * 10)}`;
    } else {
      return `.${Math.round(selectedPurity * 10)}`;
    }
  };

  // Fractional oz cycling function
  const cycleFractionalOz = () => {
    const nextIndex = (fractionalOzIndex + 1) % fractionalOzOptions.length;
    setFractionalOzIndex(nextIndex);
    saveCalculatorState('fractional-oz-index', nextIndex);
    
    // Set to troy oz mode and input the fractional value
    setSelectedUnit('oz');
    saveCalculatorState('selected-unit', 'oz');
    
    const fractionalValue = fractionalOzOptions[nextIndex].value.toString();
    setCurrentInput(fractionalValue);
    setDisplay(fractionalValue);
    

  };

  // Metal selection with appropriate purity defaults
  const selectMetal = (metal: 'gold' | 'silver' | 'platinum') => {
    // Determine appropriate default purity for the metal
    let newPurity = 58.3; // Default to 14K gold
    let displayLabel = '14K';
    
    switch (metal) {
      case 'gold':
        newPurity = 58.3; // 14K - most common gold purity
        displayLabel = '14K';
        break;
      case 'silver':
        newPurity = 92.5; // .925 Sterling - most common silver purity
        displayLabel = '.925';
        break;
      case 'platinum':
        newPurity = 95.0; // .950 - most common platinum purity
        displayLabel = '.950';
        break;
    }
    
    // Update state atomically - React will batch these updates
    setSelectedMetal(metal);
    setSelectedPurity(newPurity);
    
    // Clear custom rates when switching metals
    setLoanPrice(0);
    setSellPrice(0);
    
    // Update display if no current input
    if (!currentInput || mode !== 'weight') {
      setDisplay(`${metal.toUpperCase()} ${displayLabel} selected`);
    }
    

  };

  const convertToGrams = (weight: number) => {
    return selectedUnit === 'oz' ? weight * PRECISION_CONSTANTS.GRAMS_PER_TROY_OUNCE : weight;
  };

  // Get current price based on mode
  const getCurrentPrice = () => {
    // Check for custom spot prices first
    const metalKey = selectedMetal === 'gold' ? 'gold' :
                    selectedMetal === 'silver' ? 'silver' :
                    selectedMetal === 'platinum' ? 'platinum' : 'gold';
    
    // Use custom spot price if available
    if (customSpotPrices[metalKey] && customSpotPrices[metalKey] > 0) {
      return customSpotPrices[metalKey];
    }
    
    // Legacy support for old custom spot price system
    if (yourRatesMode && customSpotPrice) {
      return customSpotPrice;
    }
    
    // Fall back to live market prices
    const spotPrice = metalPrices?.[metalKey] || 0;
    return spotPrice;
  };

  // State-of-the-art number formatting - optimized for display fit and performance
  const formatDisplayNumber = (num: number) => {
    const magnitude = Math.abs(num);
    
    // Enhanced precision formatting for precious metals calculations
    if (magnitude >= 10000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (magnitude >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (magnitude >= 10000) {
      return (num / 1000).toFixed(2) + 'K'; // Increased precision from 1 to 2 decimals
    } else if (magnitude >= 1000) {
      return (num / 1000).toFixed(3) + 'K'; // Increased precision from 2 to 3 decimals for accuracy
    } else if (magnitude >= 100) {
      return num.toFixed(2); // Show 2 decimals for currency precision
    } else if (magnitude >= 10) {
      return num.toFixed(2); // Show 2 decimals for currency precision
    } else if (magnitude >= 1) {
      return num.toFixed(2); // Standard currency precision
    } else {
      return num.toFixed(4); // High precision for small values
    }
  };

  // Helper function to check if LED price is a number and > 0
  const isValidLEDPrice = (price: number | string): boolean => {
    return typeof price === 'number' && price > 0;
  };

  // Calculate LED display prices per gram
  const updateLEDDisplays = () => {
    const currentKarat = getCurrentKarat();
    const currentKaratLabel = selectedMetal === 'gold' ? `${currentKarat}K` : 
                             selectedMetal === 'silver' ? `.${Math.round(selectedPurity * 10)}` :
                             `.${Math.round(selectedPurity * 10)}`;
    
    const spotPrice = getCurrentPrice();
    const loanRate = loanRates[currentKaratLabel];
    const sellRate = sellRates[currentKaratLabel];
    
    // Mathematical constant: 1 troy ounce = 31.1034768 grams (EXACT)
    const TROY_OUNCE_TO_GRAMS = 31.1034768;
    
    let livePricePerGram = 0;
    let loanPricePerGram = 0;
    let sellPricePerGram = 0;
    
    // Calculate live price per gram with 8-decimal precision
    if (isFinite(spotPrice) && spotPrice > 0) {
      const purePricePerGram = spotPrice / TROY_OUNCE_TO_GRAMS;
      const actualPurity = selectedPurity / 100;
      livePricePerGram = purePricePerGram * actualPurity;
    }
    
    // Custom rates are already per gram
    loanPricePerGram = loanRate || 0;
    sellPricePerGram = sellRate || 0;
    
    // Round to currency precision
    const finalLivePrice = Math.round(livePricePerGram * 100) / 100;
    const finalLoanPrice = Math.round(loanPricePerGram * 100) / 100;
    const finalSellPrice = Math.round(sellPricePerGram * 100) / 100;
    
    // Update LED displays
    setLivePrice(finalLivePrice);
    setLoanPrice(finalLoanPrice);
    setSellPrice(finalSellPrice);
  };

  // Calculate values with precision
  const calculateValue = (weight: number, overridePurity?: number) => {
    if (!isFinite(weight) || weight <= 0) {
      updateLEDDisplays();
      return 0;
    }
    
    // Convert weight to grams with 8-decimal precision
    const weightInGrams = convertToGrams(weight);
    const purityToUse = overridePurity !== undefined ? overridePurity : selectedPurity;
    
    // Get current metal and karat label
    const currentKarat = overridePurity !== undefined ? purityToKarat(overridePurity) : getCurrentKarat();
    const currentKaratLabel = selectedMetal === 'gold' ? `${currentKarat}K` : 
                             selectedMetal === 'silver' ? `.${Math.round(purityToUse * 10)}` :
                             `.${Math.round(purityToUse * 10)}`;
    
    // Get pricing data
    const spotPrice = getCurrentPrice();
    const loanRate = loanRates[currentKaratLabel];
    const sellRate = sellRates[currentKaratLabel];
    
    // Debug logging for extreme values
    if (sellRate && sellRate > 1000) {
      console.log(`🚨 EXTREME SELL RATE DETECTED:`, {
        currentKaratLabel,
        sellRate,
        spotPrice,
        allSellRates: sellRates
      });
    }
    
    // Mathematical constants with supercomputer precision
    const TROY_OUNCE_TO_GRAMS = 31.1034768; // EXACT international standard
    
    let liveResult = 0;
    let loanResult = 0;
    let sellResult = 0;
    
    // Live price calculation with 8-decimal precision
    if (isFinite(spotPrice) && spotPrice > 0) {
      const actualPurity = purityToUse / 100;
      const pureMetalWeight = weightInGrams * actualPurity;
      const spotPricePerGram = spotPrice / TROY_OUNCE_TO_GRAMS;
      liveResult = pureMetalWeight * spotPricePerGram;
    }
    
    // Custom rate calculations (already per gram)
    if (loanRate && isFinite(loanRate)) {
      loanResult = weightInGrams * loanRate;
    }
    
    if (sellRate && isFinite(sellRate)) {
      sellResult = weightInGrams * sellRate;
      // Debug logging for high sell rate values
      if (sellResult > 10000) {
        console.log(`🚨 HIGH SELL VALUE DETECTED:`, {
          weightInGrams,
          sellRate,
          sellResult,
          currentKaratLabel,
          spotPrice
        });
      }
    }
    
    // Round to currency precision with mathematical perfection
    const finalLiveResult = Math.round(liveResult * 100) / 100;
    const finalLoanResult = Math.round(loanResult * 100) / 100;
    const finalSellResult = Math.round(sellResult * 100) / 100;
    
    // Update LED displays with total calculated values
    setLivePrice(finalLiveResult);
    setLoanPrice(finalLoanResult);
    setSellPrice(finalSellResult);
    
    // Return the result based on current price type
    const result = priceType === 'loan' && loanRate ? finalLoanResult :
                   priceType === 'sell' && sellRate ? finalSellResult :
                   finalLiveResult;
    
    return result;
  };

  // Emergency reset function to fix calculation errors
  const emergencyReset = () => {
    // Clear all custom rates
    setLoanRates({});
    setSellRates({});
    setCustomSpotPrices({});
    
    // Clear all localStorage
    try {
      localStorage.removeItem('simpleton-loan-rates');
      localStorage.removeItem('simpleton-sell-rates');
      localStorage.removeItem('simpleton-custom-spot-prices');
      localStorage.removeItem('simpleton-your-rates-mode');
      localStorage.removeItem('simpleton-custom-spot-price');
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
    
    // Reset all states
    setYourRatesMode(false);
    setCustomSpotPrice(0);
    setLivePrice(0);
    setLoanPrice(0);
    setSellPrice(0);
    setDisplay('Calculator reset - using live market prices');
    
    console.log('🔄 EMERGENCY RESET: All custom rates cleared, using live market prices only');
  };

  // Clear all custom rates function with localStorage cleanup
  const clearAllRates = () => {
    setLoanRates({});
    setSellRates({});
    try {
      localStorage.removeItem('simpleton-loan-rates');
      localStorage.removeItem('simpleton-sell-rates');
    } catch (error) {
      console.error('Failed to clear rates from localStorage:', error);
    }
    setShowClearRatesModal(false);
    setDisplay('All rates cleared');
    // Reset LED displays
    setLivePrice(0);
    setLoanPrice(0);
    setSellPrice(0);
  };

  // Open custom rates modal
  const openCustomRatesModal = () => {
    setShowCustomRatesModal(true);
  };

  // Set individual custom rate with immediate persistence
  const setCustomRate = (label: string, type: 'loan' | 'sell', rate: number) => {
    if (type === 'loan') {
      setLoanRates(prev => {
        const newRates = { ...prev, [label]: rate };
        console.log('Setting loan rate:', label, rate, 'New rates:', newRates);
        return newRates;
      });
    } else {
      setSellRates(prev => {
        const newRates = { ...prev, [label]: rate };
        console.log('Setting sell rate:', label, rate, 'New rates:', newRates);
        return newRates;
      });
    }
    
    // Force recalculation if there's current input
    if (currentInput && mode === 'weight') {
      const weight = parseFloat(currentInput);
      if (!isNaN(weight)) {
        setTimeout(() => {
          const value = calculateValue(weight);
          setDisplay(`$${formatDisplayNumber(value)}`);
        }, 100);
      }
    }
  };

  // Number input handler
  const handleNumber = (num: string) => {
    // Re-enable LED displays when user starts entering numbers
    if (isCleared) {
      setIsCleared(false);
    }
    
    if (isTraditionalMode) {
      if (traditionalWaitingForOperand) {
        setTraditionalDisplay(num);
        setTraditionalWaitingForOperand(false);
      } else {
        setTraditionalDisplay(traditionalDisplay === '0' ? num : traditionalDisplay + num);
      }
    } else {
      if (display === '0' || display.startsWith('$') || display.includes('K') || display.includes('%') || display === 'Price to reverse') {
        setCurrentInput(num);
        setDisplay(num);
      } else {
        setCurrentInput(currentInput + num);
        setDisplay(currentInput + num);
      }
    }
  };

  // Advanced Memory Reset Function
  const resetCalculatorMemory = () => {
    try {
      // Clear all simpleton-related localStorage entries
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('simpleton-')) {
          localStorage.removeItem(key);
        }
      });

      
      // Reset all states to defaults
      setDisplay('0');
      setCurrentInput('');
      setSelectedMetal('gold');
      setSelectedPurity(99.9);
      setSelectedUnit('grams');
      setMode('weight');
      setPriceMode('live');
      setCustomSpotPrice(null);
      setReverseKarat(24);
      setReversePricePerGram(null);
      setMemory(null);
      setIsTraditionalMode(false);
      setSelectedKarat(24);
      setLoanRates({});
      setSellRates({});
      setCustomSpotPrices({});
      
      // Reset traditional mode
      setTraditionalDisplay('0');
      setTraditionalPrevious(null);
      setTraditionalOperation(null);
      setTraditionalWaitingForOperand(false);
      setTraditionalMemory(0);
    } catch (error) {
      console.error('Failed to reset memory:', error);
    }
  };

  // Clear function - NO DEFAULT approach requiring explicit metal/karat selection
  const handleClear = () => {
    // C button clears everything and forces user to select metal/karat - NO DEFAULT
    setDisplay('SELECT METAL & KARAT');
    setCurrentInput('');
    setMode('weight');
    setReverseResults(null);
    
    // Clear the custom loan/sell price displays and show selection required
    setLivePrice('SELECT');
    setLoanPrice('SELECT');
    setSellPrice('SELECT');
    
    // NO DEFAULT - Clear metal selection completely to force user choice
    setSelectedMetal('gold'); // Keep as gold for UI consistency but mark as requiring selection
    setSelectedPurity(0); // Zero indicates no selection made - requires explicit choice
    setSelectedKarat(0); // Zero indicates no selection made - requires explicit choice
    
    // Mark calculator as cleared to prevent automatic LED updates and require selection
    setIsCleared(true);
    
    // DO NOT save any default values - user must make conscious selection
    // This prevents accidental calculations with wrong metal/karat assumptions
    
    if (isTraditionalMode) {
      setTraditionalDisplay('0');
      setTraditionalPrevious(null);
      setTraditionalOperation(null);
      setTraditionalWaitingForOperand(false);
    }
    
    console.log('Calculator cleared - NO DEFAULT: User must select metal and karat before calculating');

  };

  // Backspace function
  const handleBack = () => {
    if (currentInput.length > 1) {
      const newInput = currentInput.slice(0, -1);
      setCurrentInput(newInput);
      setDisplay(newInput);
    } else {
      setCurrentInput('');
      setDisplay('0');
    }
  };

  // Metal cycling function - Fixed to use selectMetal for proper synchronization
  const cycleMetal = () => {
    const metals: ('gold' | 'silver' | 'platinum')[] = ['gold', 'silver', 'platinum'];
    const currentIndex = metals.indexOf(selectedMetal);
    const nextIndex = (currentIndex + 1) % metals.length;
    const nextMetal = metals[nextIndex];
    
    // Use selectMetal to ensure proper metal+purity synchronization
    selectMetal(nextMetal);
  };

  // Karat cycling function for gold - cycles karat on button and main display only
  const cycleKarat = () => {
    if (selectedMetal === 'gold') {
      const goldKarats = [24, 22, 21, 20, 18, 16, 14, 12, 10, 9, 8, 6];
      const currentKarat = Math.round(purityToKarat(selectedPurity));
      const currentIndex = goldKarats.indexOf(currentKarat);
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % goldKarats.length;
      const nextKarat = goldKarats[nextIndex];
      const nextPurity = KARAT_PURITIES[`${nextKarat}K`] || karatToPurity(nextKarat);
      
      // Update karat selection
      setSelectedPurity(nextPurity);
      setSelectedKarat(nextKarat);
      
      // Show karat type in main display only
      const karatDisplay = `${nextKarat}K`;
      setDisplay(karatDisplay);
      setCurrentInput('');
      
      // Save the selected karat for memory  
      saveCalculatorState('selected-karat', nextKarat);
      saveCalculatorState('selected-purity', nextPurity);
      
      console.log(`Cycling to ${nextKarat}K (${nextPurity.toFixed(2)}%) - Button and main display updated`);
    }
  };

  // YOUR RATES functionality - exactly as in your implementation
  const setKaratMode = () => {
    if (!yourRatesMode) {
      const currentKarat = getCurrentKarat();
      const currentKaratLabel = selectedMetal === 'gold' ? `${currentKarat}K` : 
                               selectedMetal === 'silver' ? `.${Math.round(selectedPurity * 10)}` :
                               `.${Math.round(selectedPurity * 10)}`;
      const rate = prompt(`Enter custom rate for ${currentKaratLabel} ${selectedMetal} (per troy ounce):`);
      if (rate && !isNaN(parseFloat(rate))) {
        setCustomSpotPrice(parseFloat(rate));
        setYourRatesMode(true);
        setPriceMode('custom');
        setDisplay(`Custom: $${rate}/oz`);
      }
    } else {
      setYourRatesMode(false);
      setCustomSpotPrice(null);
      setPriceMode('live');
      setDisplay('Live pricing');
    }
  };

  // Reverse mode functionality
  const setReverseMode = () => {
    if (mode === 'reverse') {
      setMode('weight');
      setDisplay('0');
      setReverseResults(null);
    } else {
      setMode('reverse');
      setCurrentInput('');
      setDisplay('Enter $/gram target');
    }
  };

  // Reverse karat cycling / Purity info
  const cycleReverseKarat = () => {
    if (mode === 'reverse') {
      const karats = [6, 8, 9, 10, 12, 14, 16, 18, 20, 21, 22, 24];
      const currentIndex = karats.indexOf(reverseKarat);
      const nextIndex = (currentIndex + 1) % karats.length;
      const newKarat = karats[nextIndex];
      setReverseKarat(newKarat);
      
      // Update selectedPurity to match the new karat
      const purityMap: { [key: number]: number } = {
        6: 25.0, 8: 33.3, 9: 37.5, 10: 41.7, 12: 50.0, 14: 58.3,
        16: 66.7, 18: 75.0, 20: 83.3, 21: 87.5, 22: 91.7, 24: 99.9
      };
      
      setSelectedPurity(purityMap[newKarat]);
      setDisplay(`${newKarat}K selected - Enter $/gram`);
      setCurrentInput(''); // Clear any previous input
      setReverseResults(null); // Clear previous results
    } else {
      // Show purity info
      const currentKarat = getCurrentKarat();
      const info = selectedMetal === 'gold' ? `${currentKarat}K = ${selectedPurity}% pure gold` :
                   selectedMetal === 'silver' ? `.${Math.round(selectedPurity * 10)} = ${selectedPurity}% pure silver` :
                   `.${Math.round(selectedPurity * 10)} = ${selectedPurity}% pure ${selectedMetal}`;
      setDisplay(info);
    }
  };

  // ENTER function - calculate melt value or reverse calculation
  const handleEnter = () => {
    if (isTraditionalMode) {
      traditionalCalculate();
      return;
    }

    if (mode === 'weight' && currentInput) {
      const weight = parseFloat(currentInput);
      if (isFinite(weight) && weight > 0) {
        const value = calculateValue(weight);
        setDisplay(`$${formatDisplayNumber(value)}`);
        const currentKarat = getCurrentKarat();
        const karatLabel = selectedMetal === 'gold' ? `${currentKarat}K` : `.${Math.round(selectedPurity * 10)}`;
        const spotPrice = getCurrentPrice();
        logCalculationHistory(selectedMetal, karatLabel, selectedPurity, weight, selectedUnit, spotPrice, value, priceType);
      }
    } else if (mode === 'reverse' && currentInput) {
      const desiredPricePerGram = parseFloat(currentInput);
      if (desiredPricePerGram > 0) {
        const currentPurity = selectedPurity / 100;
        const requiredSpotPricePerGram = desiredPricePerGram / currentPurity;
        const requiredSpotPricePerOz = requiredSpotPricePerGram * PRECISION_CONSTANTS.GRAMS_PER_TROY_OUNCE;
        
        const results: {[key: string]: number} = {};
        const options = getMetalOptions();
        options.forEach(opt => {
          const pricePerGram = requiredSpotPricePerGram * (opt.purity / 100);
          results[opt.label] = pricePerGram;
        });
        
        setReverseResults(results);
        const currentKarat = getCurrentKarat();
        setDisplay(`${currentKarat}K@$${desiredPricePerGram}/g needs $${requiredSpotPricePerOz.toFixed(0)}/oz spot`);
        logCalculationHistory(selectedMetal, `${currentKarat}K`, selectedPurity, desiredPricePerGram, 'g (reverse)', requiredSpotPricePerOz, desiredPricePerGram, 'reverse');
      }
    }
  };

  // Split function
  const setShowSplitModal = () => {
    const pieces = prompt('How many people to split between?');
    if (pieces && !isNaN(parseFloat(pieces))) {
      const currentValue = parseFloat(display.replace('$', '').replace('K', '000').replace('M', '000000'));
      const result = currentValue / parseFloat(pieces);
      setDisplay(`$${formatDisplayNumber(result)}`);
    }
  };

  // Multiply function
  const setShowMultiplyModal = () => {
    const pieces = prompt('How many pieces?');
    if (pieces && !isNaN(parseFloat(pieces))) {
      const currentValue = parseFloat(display.replace('$', '').replace('K', '000').replace('M', '000000'));
      const result = currentValue * parseFloat(pieces);
      setDisplay(`$${formatDisplayNumber(result)}`);
    }
  };



  // Plus/minus toggle
  const toggleSign = () => {
    if (isTraditionalMode) {
      if (traditionalDisplay !== '0') {
        setTraditionalDisplay(traditionalDisplay.charAt(0) === '-' ? traditionalDisplay.slice(1) : '-' + traditionalDisplay);
      }
    } else {
      if (currentInput && currentInput !== '0') {
        const newInput = currentInput.charAt(0) === '-' ? currentInput.slice(1) : '-' + currentInput;
        setCurrentInput(newInput);
        setDisplay(newInput);
      }
    }
  };

  // Decimal input
  const inputDecimal = () => {
    if (isTraditionalMode) {
      if (!traditionalDisplay.includes('.')) {
        setTraditionalDisplay(traditionalDisplay + '.');
      }
    } else {
      if (!currentInput.includes('.')) {
        const newInput = currentInput === '' ? '0.' : currentInput + '.';
        setCurrentInput(newInput);
        setDisplay(newInput);
      }
    }
  };

  // Quick karat selection buttons - exactly as in your design
  const quickKaratButtons = [
    { label: '24K', purity: 99.9 },
    { label: '22K', purity: 91.7 },
    { label: '18K', purity: 75.0 },
    { label: '14K', purity: 58.3 },
    { label: '10K', purity: 41.7 },
    { label: '925', purity: 92.5 }
  ];

  const selectQuickKarat = (button: { label: string; purity: number }) => {
    setSelectedPurity(button.purity);
    if (button.label === '925') {
      setSelectedMetal('silver');
    } else {
      setSelectedMetal('gold');
    }
    
    // Clear the "no default" state since user made explicit selection
    setIsCleared(false);
    
    // Save the user's conscious selection to memory
    saveCalculatorState('selected-metal', button.label === '925' ? 'silver' : 'gold');
    saveCalculatorState('selected-purity', button.purity);
    saveCalculatorState('selected-karat', button.label === '925' ? 925 : parseInt(button.label.replace('K', '')));
    
    // If we have input, immediately recalculate and show value
    if (currentInput && mode === 'weight') {
      const weight = parseFloat(currentInput);
      if (!isNaN(weight)) {
        const value = calculateValue(weight);
        setDisplay(`$${formatDisplayNumber(value)}`);
      }
    } else {
      // Show karat selection confirmation
      setDisplay(`${button.label} (${button.purity}%) SELECTED`);
    }
    
    console.log(`NO DEFAULT: User explicitly selected ${button.label} (${button.purity}%) - Calculator ready for use`);
  };

  // Intelligent text scaling for buttons
  const getButtonTextSize = (text: string, buttonWidth = 'normal') => {
    const length = text.length;
    if (buttonWidth === 'wide') {
      if (length <= 4) return 'text-sm';
      if (length <= 6) return 'text-xs';
      return 'text-[10px]';
    }
    // Normal width buttons
    if (length <= 2) return 'text-lg';
    if (length <= 4) return 'text-sm';
    if (length <= 6) return 'text-xs';
    if (length <= 8) return 'text-[10px]';
    return 'text-[8px]';
  };

  const getButtonClasses = (text: string, baseClasses: string, buttonWidth = 'normal') => {
    const textSize = getButtonTextSize(text, buttonWidth);
    return `${baseClasses} ${textSize} leading-tight break-words hyphens-auto`;
  };

  // Ergonomic button styling - 80+ years of calculator design experience
  const getErgonomicButtonStyle = (buttonType: 'number' | 'operation' | 'metal' | 'karat' | 'special' | 'destructive' | 'memory', frequency: 'high' | 'medium' | 'low' = 'medium') => {
    const sizeClasses = {
      high: 'min-h-[56px] text-lg font-bold px-4 py-3',
      medium: 'min-h-[48px] text-base font-semibold px-3 py-2',
      low: 'min-h-[42px] text-sm font-medium px-2 py-1'
    };

    const buttonStyles: Record<string, { bg: string; border: string; shadow: string; textColor: string; hoverBg: string }> = {
      number: {
        bg: 'linear-gradient(180deg, #4a4a5a 0%, #35354a 40%, #2a2a3e 100%)',
        border: '1px solid rgba(120,120,160,0.3)',
        shadow: 'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
        textColor: '#ffffff',
        hoverBg: 'linear-gradient(180deg, #555568 0%, #404058 40%, #35354a 100%)'
      },
      operation: {
        bg: 'linear-gradient(180deg, #1a6b8a 0%, #145a78 40%, #0e4a68 100%)',
        border: '1px solid rgba(80,180,220,0.3)',
        shadow: 'inset 0 1px 0 rgba(120,220,255,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
        textColor: '#ffffff',
        hoverBg: 'linear-gradient(180deg, #1e7a9a 0%, #186888 40%, #125878 100%)'
      },
      metal: { bg: '', border: '', shadow: '', textColor: '', hoverBg: '' },
      karat: {
        bg: 'linear-gradient(180deg, #c49000 0%, #a67a00 40%, #8a6500 100%)',
        border: '1px solid rgba(255,200,50,0.35)',
        shadow: 'inset 0 1px 0 rgba(255,230,120,0.25), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
        textColor: '#ffffff',
        hoverBg: 'linear-gradient(180deg, #d4a010 0%, #b88a00 40%, #9a7500 100%)'
      },
      special: {
        bg: 'linear-gradient(180deg, #b03030 0%, #8a2020 40%, #701818 100%)',
        border: '1px solid rgba(255,100,100,0.3)',
        shadow: 'inset 0 1px 0 rgba(255,150,150,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
        textColor: '#ffffff',
        hoverBg: 'linear-gradient(180deg, #c04040 0%, #9a3030 40%, #802020 100%)'
      },
      destructive: {
        bg: 'linear-gradient(180deg, #c05020 0%, #a04018 40%, #883010 100%)',
        border: '1px solid rgba(255,140,80,0.3)',
        shadow: 'inset 0 1px 0 rgba(255,180,120,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
        textColor: '#ffffff',
        hoverBg: 'linear-gradient(180deg, #d06030 0%, #b05020 40%, #984018 100%)'
      },
      memory: {
        bg: 'linear-gradient(180deg, #1a8a4a 0%, #147038 40%, #0e5a2e 100%)',
        border: '1px solid rgba(80,220,140,0.3)',
        shadow: 'inset 0 1px 0 rgba(120,255,180,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
        textColor: '#ffffff',
        hoverBg: 'linear-gradient(180deg, #1e9a58 0%, #188045 40%, #126a38 100%)'
      }
    };

    const s = buttonStyles[buttonType] || buttonStyles.number;

    return {
      style: {
        ...stateOfTheArtTextStyle,
        transition: 'all 0.12s ease-out',
        userSelect: 'none' as const,
        cursor: 'pointer',
        background: s.bg,
        border: s.border,
        boxShadow: s.shadow,
        color: s.textColor,
        borderRadius: '6px',
        textShadow: '0 1px 2px rgba(0,0,0,0.4)',
      },
      className: `${sizeClasses[frequency]} active:translate-y-[1px]`
    };
  };

  // Specialized metal button gradients with perfect text centering for longer text
  const getMetalButtonStyle = (metal: 'gold' | 'silver' | 'platinum', isSelected: boolean) => {
    const metalStyles = {
      gold: {
        bg: isSelected 
          ? 'linear-gradient(180deg, #d4a020 0%, #b08a10 40%, #8a6a00 100%)'
          : 'linear-gradient(180deg, #b89000 0%, #9a7800 40%, #7a6000 100%)',
        border: isSelected ? '2px solid rgba(255,200,50,0.6)' : '1px solid rgba(255,200,50,0.3)',
        shadow: isSelected 
          ? 'inset 0 1px 0 rgba(255,230,120,0.3), inset 0 -2px 0 rgba(0,0,0,0.3), 0 0 12px rgba(255,200,50,0.3), 0 2px 4px rgba(0,0,0,0.4)'
          : 'inset 0 1px 0 rgba(255,230,120,0.2), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)'
      },
      silver: {
        bg: isSelected
          ? 'linear-gradient(180deg, #808898 0%, #606878 40%, #484e60 100%)'
          : 'linear-gradient(180deg, #686e80 0%, #505868 40%, #404858 100%)',
        border: isSelected ? '2px solid rgba(180,190,210,0.5)' : '1px solid rgba(160,170,190,0.3)',
        shadow: isSelected
          ? 'inset 0 1px 0 rgba(200,210,230,0.2), inset 0 -2px 0 rgba(0,0,0,0.3), 0 0 12px rgba(180,190,210,0.2), 0 2px 4px rgba(0,0,0,0.4)'
          : 'inset 0 1px 0 rgba(200,210,230,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)'
      },
      platinum: {
        bg: isSelected
          ? 'linear-gradient(180deg, #7a8090 0%, #5a6070 40%, #444a58 100%)'
          : 'linear-gradient(180deg, #606878 0%, #4a5268 40%, #3a4258 100%)',
        border: isSelected ? '2px solid rgba(170,180,200,0.5)' : '1px solid rgba(150,160,180,0.3)',
        shadow: isSelected
          ? 'inset 0 1px 0 rgba(190,200,220,0.2), inset 0 -2px 0 rgba(0,0,0,0.3), 0 0 12px rgba(170,180,200,0.2), 0 2px 4px rgba(0,0,0,0.4)'
          : 'inset 0 1px 0 rgba(190,200,220,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)'
      }
    };

    const ms = metalStyles[metal];
    return `text-white min-h-[55px] font-bold transition-all duration-150 flex items-center justify-center px-2 py-2 leading-tight active:translate-y-[1px]`;
  };

  const getMetalButtonInlineStyle = (metal: 'gold' | 'silver' | 'platinum', isSelected: boolean) => {
    const metalStyles = {
      gold: {
        bg: isSelected 
          ? 'linear-gradient(180deg, #d4a020 0%, #b08a10 40%, #8a6a00 100%)'
          : 'linear-gradient(180deg, #b89000 0%, #9a7800 40%, #7a6000 100%)',
        border: isSelected ? '2px solid rgba(255,200,50,0.6)' : '1px solid rgba(255,200,50,0.3)',
        shadow: isSelected 
          ? 'inset 0 1px 0 rgba(255,230,120,0.3), inset 0 -2px 0 rgba(0,0,0,0.3), 0 0 12px rgba(255,200,50,0.3), 0 2px 4px rgba(0,0,0,0.4)'
          : 'inset 0 1px 0 rgba(255,230,120,0.2), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)'
      },
      silver: {
        bg: isSelected
          ? 'linear-gradient(180deg, #808898 0%, #606878 40%, #484e60 100%)'
          : 'linear-gradient(180deg, #686e80 0%, #505868 40%, #404858 100%)',
        border: isSelected ? '2px solid rgba(180,190,210,0.5)' : '1px solid rgba(160,170,190,0.3)',
        shadow: isSelected
          ? 'inset 0 1px 0 rgba(200,210,230,0.2), inset 0 -2px 0 rgba(0,0,0,0.3), 0 0 12px rgba(180,190,210,0.2), 0 2px 4px rgba(0,0,0,0.4)'
          : 'inset 0 1px 0 rgba(200,210,230,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)'
      },
      platinum: {
        bg: isSelected
          ? 'linear-gradient(180deg, #7a8090 0%, #5a6070 40%, #444a58 100%)'
          : 'linear-gradient(180deg, #606878 0%, #4a5268 40%, #3a4258 100%)',
        border: isSelected ? '2px solid rgba(170,180,200,0.5)' : '1px solid rgba(150,160,180,0.3)',
        shadow: isSelected
          ? 'inset 0 1px 0 rgba(190,200,220,0.2), inset 0 -2px 0 rgba(0,0,0,0.3), 0 0 12px rgba(170,180,200,0.2), 0 2px 4px rgba(0,0,0,0.4)'
          : 'inset 0 1px 0 rgba(190,200,220,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)'
      }
    };
    const ms = metalStyles[metal];
    return {
      background: ms.bg,
      border: ms.border,
      boxShadow: ms.shadow,
      borderRadius: '6px',
      color: '#ffffff',
      textShadow: '0 1px 2px rgba(0,0,0,0.4)',
    };
  };

  // State-of-the-art typography styles for consistent application
  const stateOfTheArtTextStyle = {
    WebkitFontSmoothing: 'antialiased' as const,
    MozOsxFontSmoothing: 'grayscale' as const,
    textRendering: 'optimizeLegibility' as const,
    fontFeatureSettings: '"liga" 1, "kern" 1',
    fontVariant: 'tabular-nums' as const
  };

  // Mobile-optimized text sizing that remains readable at all scales
  const getMobileOptimizedTextClass = (baseSize: 'xs' | 'sm' | 'base' | 'lg') => {
    const sizeMap = {
      xs: 'text-xs sm:text-sm', // Minimum readable size
      sm: 'text-sm sm:text-base',
      base: 'text-base sm:text-lg',
      lg: 'text-lg sm:text-xl'
    };
    return sizeMap[baseSize];
  };

  // Enhanced text styling with minimum readable size enforcement
  const getEnhancedTextStyle = (fontSize = '14px') => ({
    ...stateOfTheArtTextStyle,
    fontSize: `max(${fontSize}, 11px)`, // Never smaller than 11px
    fontWeight: '600',
    textShadow: '0 1px 2px rgba(0,0,0,0.1)', // Subtle shadow for better contrast
    lineHeight: '1.2'
  });

  // SCRAP batch calculator functions
  const addScrapItem = () => {
    if (!scrapWeight || parseFloat(scrapWeight) <= 0) return;
    
    const weight = parseFloat(scrapWeight);
    const purity = KARAT_PURITIES[scrapKarat] || 75.0;
    const currentPrice = getCurrentPrice();
    const value = weight * (purity / 100) * (currentPrice / 31.1035); // Convert oz to grams
    
    const newItem = {
      id: Date.now(),
      weight,
      karat: scrapKarat,
      purity,
      value
    };
    
    setScrapItems(prev => [...prev, newItem]);
    setScrapWeight('');

  };

  const removeScrapItem = (id: number) => {
    setScrapItems(prev => prev.filter(item => item.id !== id));
  };

  const clearScrapBatch = () => {
    setScrapItems([]);
    setScrapWeight('');
  };

  const getTotalScrapValue = () => {
    return scrapItems.reduce((total, item) => total + item.value, 0);
  };

  const getTotalScrapWeight = () => {
    return scrapItems.reduce((total, item) => total + item.weight, 0);
  };

  const KARAT_PURITIES: {[key: string]: number} = {
    '6K': 25.0,
    '8K': 33.3,
    '9K': 37.5,
    '10K': 41.7,
    '12K': 50.0,
    '14K': 58.3,
    '16K': 66.7,
    '18K': 75.0,
    '20K': 83.3,
    '21K': 87.5,
    '22K': 91.7,
    '24K': 99.9,
    '.925': 92.5 // Sterling silver
  };

  // Format display with unit indicator
  const formatDisplayWithUnit = (displayValue: string) => {
    // Only add unit indicator if display contains a number and we're in weight mode
    if (mode === 'weight' && displayValue !== '0' && /^\d+\.?\d*$/.test(displayValue)) {
      if (selectedUnit === 'grams') {
        return (
          <>
            {displayValue}
            <span style={{ fontSize: '0.7em', verticalAlign: 'top' }}>G</span>
          </>
        );
      } else if (selectedUnit === 'oz') {
        return (
          <>
            {displayValue}
            <span style={{ fontSize: '0.7em', verticalAlign: 'top' }}>OZ</span>
          </>
        );
      }
    }
    return displayValue;
  };

  return (
    <div 
      className="calculator-main-container futuristic-gap-fill relative p-2 sm:p-3 md:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto"
      style={{
        border: '3px solid rgba(255,215,0,0.12)',
        borderRadius: '8px',
        boxSizing: 'border-box',
        background: 'linear-gradient(135deg, rgba(8,8,16,0.97) 0%, rgba(12,12,22,0.97) 100%)',
        boxShadow: '0 25px 60px -12px rgba(0,0,0,0.6), 0 0 30px rgba(255,215,0,0.03)'
      }}
      onPointerDown={buttonFeedback}
    >
      {/* LED Price Display Buttons */}
      <div className="futuristic-gap-fill grid grid-cols-3 gap-[3px] sm:gap-1 mb-2 sm:mb-3" style={{padding: '4px', borderRadius: '8px', background: 'rgba(8,8,16,0.5)'}}>
        {/* Live Price LED */}
        <button
          onClick={() => setPriceType('live')}
          className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg border-2 transition-all duration-200 min-h-[50px] sm:min-h-[60px] flex flex-col justify-center ${
            priceType === 'live' 
              ? 'border-green-400 bg-green-900 ring-2 ring-green-400' 
              : 'border-gray-600 bg-gray-800 hover:border-green-300'
          }`}
          style={{
            boxShadow: priceType === 'live' ? '0 0 20px rgba(34, 197, 94, 0.5)' : 'none'
          }}
        >
          <div className="text-[13px] font-extrabold text-green-300 mb-1 leading-none tracking-widest" style={{
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility'
          }}>SPOT LIVE</div>
          <div className="text-[14px] font-mono font-black leading-none tracking-wide text-center" style={{
            color: '#00FF41',
            textShadow: '0 0 1px #000000, 0 0 3px #00FF41, 0 0 6px #00FF41',
            fontFamily: '"SF Mono", "JetBrains Mono", "Monaco", monospace',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility',
            fontFeatureSettings: '"liga" 1, "kern" 1',
            fontVariant: 'tabular-nums',
            filter: 'brightness(1.1) contrast(1.2)'
          }}>
            {!isTraditionalMode && isValidLEDPrice(livePrice) ? `$${formatDisplayNumber(livePrice as number)}` : typeof livePrice === 'string' ? livePrice : `$${getCurrentPrice().toFixed(0)}`}
            <span className="text-[10px] font-bold ml-1" style={{
              color: '#FFD700',
              textShadow: '0 0 1px #000000, 0 0 2px #FFD700',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale'
            }}>
              {!isCleared ? getCurrentKaratLabel() : ''}
            </span>
          </div>
        </button>

        {/* Loan Price LED */}
        <button
          onClick={() => setPriceType('loan')}
          className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg border-2 transition-all duration-200 min-h-[50px] sm:min-h-[60px] flex flex-col justify-center ${
            priceType === 'loan' 
              ? 'border-blue-400 bg-blue-900 ring-2 ring-blue-400' 
              : 'border-gray-600 bg-gray-800 hover:border-blue-300'
          }`}
          style={{
            boxShadow: priceType === 'loan' ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none'
          }}
        >
          <div className="text-[13px] font-extrabold text-blue-300 mb-1 leading-none tracking-widest" style={{
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility'
          }}>CUSTOM LOAN</div>
          <div className="text-[14px] font-mono font-black leading-none tracking-wide text-center" style={{
            color: '#00BFFF',
            textShadow: '0 0 1px #000000, 0 0 3px #00BFFF, 0 0 6px #00BFFF',
            fontFamily: '"SF Mono", "JetBrains Mono", "Monaco", monospace',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility',
            fontFeatureSettings: '"liga" 1, "kern" 1',
            fontVariant: 'tabular-nums',
            filter: 'brightness(1.1) contrast(1.2)'
          }}>
            {!isTraditionalMode && isValidLEDPrice(loanPrice) ? `$${formatDisplayNumber(loanPrice as number)}` : typeof loanPrice === 'string' ? loanPrice : '$0.00'}
            <span className="text-[10px] font-bold ml-1" style={{
              color: '#FFD700',
              textShadow: '0 0 1px #000000, 0 0 2px #FFD700',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale'
            }}>
              {!isCleared ? getCurrentKaratLabel() : ''}
            </span>
          </div>
        </button>

        {/* Sell Price LED */}
        <button
          onClick={() => setPriceType('sell')}
          className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg border-2 transition-all duration-200 min-h-[50px] sm:min-h-[60px] flex flex-col justify-center ${
            priceType === 'sell' 
              ? 'border-orange-400 bg-orange-900 ring-2 ring-orange-400' 
              : 'border-gray-600 bg-gray-800 hover:border-orange-300'
          }`}
          style={{
            boxShadow: priceType === 'sell' ? '0 0 20px rgba(251, 146, 60, 0.5)' : 'none'
          }}
        >
          <div className="text-[13px] font-extrabold text-orange-300 mb-1 leading-none tracking-widest" style={{
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility'
          }}>CUSTOM SELL</div>
          <div className="text-[14px] font-mono font-black leading-none tracking-wide text-center" style={{
            color: '#FF8C00',
            textShadow: '0 0 1px #000000, 0 0 3px #FF8C00, 0 0 6px #FF8C00',
            fontFamily: '"SF Mono", "JetBrains Mono", "Monaco", monospace',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility',
            fontFeatureSettings: '"liga" 1, "kern" 1',
            fontVariant: 'tabular-nums',
            filter: 'brightness(1.1) contrast(1.2)'
          }}>
            {!isTraditionalMode && isValidLEDPrice(sellPrice) ? `$${formatDisplayNumber(sellPrice as number)}` : typeof sellPrice === 'string' ? sellPrice : '$0.00'}
            <span className="text-[10px] font-bold ml-1" style={{
              color: '#FFD700',
              textShadow: '0 0 1px #000000, 0 0 2px #FFD700',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale'
            }}>
              {!isCleared ? getCurrentKaratLabel() : ''}
            </span>
          </div>
        </button>
      </div>

      {/* Display */}
      {!isTraditionalMode ? (
        <div className="p-3 sm:p-4 md:p-5 mb-2 sm:mb-3 md:mb-4 shadow-2xl" style={{background: 'linear-gradient(135deg, rgba(8,8,16,0.95) 0%, rgba(12,12,20,0.95) 100%)', border: '1px solid rgba(255,215,0,0.1)', borderRadius: '12px'}}>
          {/* Top Row: Units (left) and Metal/Purity (right) */}
          <div className="flex justify-between items-start mb-4">
            {/* Top Left: GRAMS • TROY OZ */}
            <div className="text-[12px] font-bold text-yellow-300" style={{
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility',
              fontFeatureSettings: '"liga" 1, "kern" 1'
            }}>
              <button 
                onClick={() => setSelectedUnit('grams')}
                className={`unit-selection-button hover:text-yellow-100 transition-all duration-300 ${selectedUnit === 'grams' ? 'font-extrabold text-yellow-200' : ''}`}
                style={{
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility',
                  fontFeatureSettings: '"liga" 1, "kern" 1'
                }}
              >
                GRAMS
              </button>
              <span className="mx-2 text-yellow-500 text-[12px]">•</span>
              <button 
                onClick={() => setSelectedUnit('oz')}
                className={`unit-selection-button hover:text-yellow-100 transition-all duration-300 ${selectedUnit === 'oz' ? 'font-extrabold text-yellow-200' : ''}`}
                style={{
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility',
                  fontFeatureSettings: '"liga" 1, "kern" 1'
                }}
              >
                TROY OZ
              </button>
            </div>
            
            {/* Top Right: GOLD • 41.7% PURE 🔴 LIVE */}
            <div className="text-xs sm:text-sm lg:text-base xl:text-lg text-yellow-300 font-bold tracking-wider leading-tight text-right" style={{
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility',
              fontFeatureSettings: '"liga" 1, "kern" 1, "ss01" 1, "tnum" 1',
              fontOpticalSizing: 'auto',
              letterSpacing: '0.05em',
              textShadow: '0 0 1px #000000, 0 0 2px #FFD700'
            }}>
              {selectedMetal.toUpperCase()} • {selectedPurity.toFixed(selectedPurity % 1 === 0 ? 0 : 1)}% PURE
              {yourRatesMode ? ' ⭐ CUSTOM' : ' 🔴 LIVE'}
            </div>
          </div>
          
          {/* Center: Main Display */}
          <div className="text-center mb-4">
            {/* Value Type Label */}
            <div className="text-xs sm:text-sm text-yellow-400 font-bold mb-2 tracking-widest" style={{
              textShadow: '0 0 1px #000000, 0 0 2px #FFD700',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale'
            }}>
              {priceType === 'live' ? 'METAL VALUE' : priceType === 'loan' ? 'LOAN VALUE' : 'SELL VALUE'}
            </div>
            <div className={`font-mono font-black text-yellow-300 mb-2 tracking-wide leading-none ${
              display === 'SELECT METAL & KARAT' 
                ? 'text-[26px]' // 26px for words/selection message (30% increase)
                : 'text-[45px]' // 45px for numbers/calculations (28% increase)
            }`} style={{
              textShadow: '0 0 2px rgba(255,215,0,0.5), 0 0 8px rgba(255,215,0,0.2)',
              filter: 'brightness(1.2) contrast(1.3)',
              fontFamily: '"SF Mono", "JetBrains Mono", "Monaco", "Consolas", monospace',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility',
              fontFeatureSettings: '"liga" 1, "kern" 1, "tnum" 1',
              fontVariant: 'tabular-nums',
              letterSpacing: '0.025em',
              color: '#FFD700',
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textAlign: 'center',
              wordSpacing: '0.1em',
              fontOpticalSizing: 'auto',
              fontStretch: 'normal'
            }}>
              {(() => {
                // Use the exact same values as the small screens
                if (display.startsWith('$') && currentInput && parseFloat(currentInput) > 0) {
                  switch(priceType) {
                    case 'loan':
                      return `$${loanPrice.toFixed(2)}`;
                    case 'sell':
                      return `$${sellPrice.toFixed(2)}`;
                    case 'live':
                    default:
                      return `$${livePrice.toFixed(2)}`;
                  }
                } else {
                  return formatDisplayWithUnit(display);
                }
              })()}
            </div>
            
            {/* Weight Reminder - Shows input weight after calculation */}
            {display.startsWith('$') && currentInput && parseFloat(currentInput) > 0 && (
              <div className="text-xs sm:text-sm text-yellow-400 font-medium mt-2 opacity-80" style={{
                textShadow: '0 0 1px #000000, 0 0 2px #FFD700',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility',
                fontFeatureSettings: '"liga" 1, "kern" 1',
                letterSpacing: '0.02em'
              }}>
                @ {parseFloat(currentInput).toFixed(parseFloat(currentInput) % 1 === 0 ? 0 : 2)} {selectedUnit === 'grams' ? 'grams' : 'troy oz'}
              </div>
            )}
          </div>
          
          {/* Bottom Center: Spot Price • Live MARKET */}
          <div className="text-center">
            <div className="text-sm sm:text-base lg:text-lg text-yellow-300 font-semibold tracking-wide leading-tight" style={{
              textShadow: '0 0 2px rgba(255,215,0,0.4), 0 0 6px rgba(255,215,0,0.15)',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility',
              fontFeatureSettings: '"liga" 1, "kern" 1, "tnum" 1, "ss01" 1',
              fontVariant: 'tabular-nums',
              fontOpticalSizing: 'auto',
              letterSpacing: '0.03em'
            }}>
              ${getCurrentPrice().toFixed(2)}/oz • {priceType === 'live' ? 'LIVE' : priceType === 'loan' ? 'LOAN' : 'SELL'} PRICE
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 sm:p-4 md:p-5 mb-2 sm:mb-3 md:mb-4 shadow-2xl traditional-calculator" style={{
          background: 'linear-gradient(135deg, rgba(8,8,16,0.95) 0%, rgba(12,12,20,0.95) 100%)',
          border: '1px solid rgba(255,215,0,0.1)',
          borderRadius: '12px'
        }}>
          <div className="text-center mb-3">
            <div className="text-xs font-bold tracking-[0.15em] mb-1" style={{
              ...stateOfTheArtTextStyle,
              color: 'rgba(255,215,0,0.5)',
              textShadow: '0 0 4px rgba(255,215,0,0.15)',
            }}>
              PRECISION OFFICE
            </div>
            <div className="text-xs font-bold tracking-[0.15em]" style={{
              ...stateOfTheArtTextStyle,
              color: 'rgba(255,215,0,0.5)',
              textShadow: '0 0 4px rgba(255,215,0,0.15)',
            }}>
              CALCULATOR™
            </div>
          </div>
          
          <div className="flex justify-center mb-3">
            <Button 
              onClick={() => setIsTraditionalMode(false)}
              className="px-4 py-2 text-white font-bold rounded-lg text-xs shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center space-x-2 justify-center"
              style={{
                ...stateOfTheArtTextStyle,
                background: 'linear-gradient(180deg, #c09020 0%, #a07818 40%, #886010 100%)',
                border: '1px solid rgba(255,215,0,0.4)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), 0 4px 12px rgba(255,215,0,0.2)',
                textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                borderRadius: '6px',
              }}
            >
              <span className="text-sm">⬅</span>
              <span className="font-extrabold tracking-wider">SIMPLETON P.M.</span>
            </Button>
          </div>
          
          <div className="text-center mb-3">
            <div className="text-xs text-yellow-400 font-bold mb-2 tracking-widest" style={{
              textShadow: '0 0 1px #000000, 0 0 2px #FFD700',
            }}>
              STANDARD CALCULATOR
            </div>
            <div className="font-mono font-black text-[40px] leading-none tracking-wide py-3 px-4 rounded-lg" style={{
              fontFamily: '"SF Mono", "JetBrains Mono", "Monaco", "Consolas", monospace',
              color: '#FFD700',
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              filter: 'brightness(1.2) contrast(1.3)',
              textAlign: 'right',
              minHeight: '55px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}>
              {traditionalDisplay}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs font-medium tracking-wider" style={{
              color: 'rgba(255,215,0,0.3)',
              textShadow: '0 0 2px rgba(255,215,0,0.1)',
            }}>
              Professional 12-Digit LCD Display
            </div>
          </div>
        </div>
      )}

      {/* Reverse Results Display */}
      {reverseResults && !isTraditionalMode && (
        <div className="futuristic-gap-fill p-3 rounded-lg mb-4 text-xs">
          <div className="text-yellow-300 mb-2 font-semibold" style={stateOfTheArtTextStyle}>Price per gram for each karat:</div>
          <div className="futuristic-gap-fill grid grid-cols-3 gap-2" style={{padding: '6px', borderRadius: '4px'}}>
            {Object.entries(reverseResults).map(([karat, price]) => (
              <div key={karat} className="text-white font-medium" style={stateOfTheArtTextStyle}>
                {karat}: ${price.toFixed(2)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ergonomic Karat Selection Row - Sized by industry frequency */}
      {!isTraditionalMode && (
        <div className="futuristic-gap-fill grid grid-cols-6 gap-[3px] sm:gap-1 md:gap-[5px] mb-3" style={{padding: '4px', borderRadius: '6px', background: 'rgba(255,215,0,0.015)'}}>
          {quickKaratButtons.map((karat) => {
            // Frequency-based sizing - 80+ years industry knowledge
            const frequency = karat.label === '14K' || karat.label === '18K' ? 'high' : 
                            karat.label === '10K' || karat.label === '925' ? 'medium' : 'low';
            const buttonStyle = getErgonomicButtonStyle('karat', frequency);
            
            return (
              <Button
                key={karat.label}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  selectQuickKarat(karat);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectQuickKarat(karat);
                }}
                className={`${selectedPurity === karat.purity ? 'ring-4 ring-yellow-300' : ''} ${buttonStyle.className}`}
                style={buttonStyle.style}
              >
                {karat.label}
              </Button>
            );
          })}
        </div>
      )}

      {/* Price Mode Selector - Top of Calculator */}
      <div className="mb-3">
        <div className="futuristic-gap-fill flex justify-center gap-1 p-1 rounded-lg">
          <Button
            onClick={() => {
              setPriceType('live');
              saveCalculatorState('price-type', 'live');
            }}
            className={`flex-1 text-xs py-1 px-2 rounded transition-all duration-200 ${
              priceType === 'live' 
                ? 'bg-green-600 text-white shadow-lg font-bold' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            style={{ minHeight: '28px' }}
          >
            LIVE MARKET
          </Button>
          <Button
            onClick={() => {
              setPriceType('loan');
              saveCalculatorState('price-type', 'loan');
            }}
            className={`flex-1 text-xs py-1 px-2 rounded transition-all duration-200 ${
              priceType === 'loan' 
                ? 'bg-blue-600 text-white shadow-lg font-bold' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            style={{ minHeight: '28px' }}
          >
            LOAN PRICE
          </Button>
          <Button
            onClick={() => {
              setPriceType('sell');
              saveCalculatorState('price-type', 'sell');
            }}
            className={`flex-1 text-xs py-1 px-2 rounded transition-all duration-200 ${
              priceType === 'sell' 
                ? 'bg-orange-600 text-white shadow-lg font-bold' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            style={{ minHeight: '28px' }}
          >
            SELL PRICE
          </Button>
        </div>
      </div>

      {/* Main Calculator Grid - Symmetrical Layout */}
      <div className="futuristic-gap-fill grid grid-cols-4 gap-[3px] sm:gap-1 md:gap-[5px] max-w-none" style={{padding: '4px', borderRadius: '6px', background: 'rgba(255,215,0,0.015)'}}>
        {!isTraditionalMode ? (
          <>
            {/* Precious Metals Mode - Row 1: Mode Selection & Back Button */}
            <Button 
              onClick={() => setIsTraditionalMode(true)}
              className={getButtonClasses('TRAD', `font-bold text-white transition-all duration-150 min-h-[50px] sm:min-h-[45px] flex items-center justify-center px-1 active:translate-y-[1px]`)}
              style={{
                background: isTraditionalMode ? 'linear-gradient(180deg, #2a8a4a 0%, #1a7038 40%, #105a2e 100%)' : 'linear-gradient(180deg, #4a4a5a 0%, #35354a 40%, #2a2a3e 100%)',
                border: isTraditionalMode ? '1px solid rgba(80,220,140,0.4)' : '1px solid rgba(120,120,160,0.3)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
                borderRadius: '6px', textShadow: '0 1px 2px rgba(0,0,0,0.4)'
              }}
            >
              TRAD
            </Button>
            <Button 
              onClick={() => {
                if (isTraditionalMode) {
                  setIsTraditionalMode(false);
                } else if (selectedMetal === 'gold') {
                  cycleKarat();
                } else {
                  setIsTraditionalMode(false);
                }
              }}
              className={`font-mono text-xs bg-black border border-yellow-400/40 rounded px-2 py-1 min-h-[50px] sm:min-h-[45px] flex items-center justify-center 
                         text-yellow-400 transition-all duration-200 cursor-pointer font-bold
                         hover:border-yellow-400/60 hover:text-yellow-300
                         ${!isTraditionalMode ? 'border-yellow-400/70 text-yellow-300' : ''}
                         whitespace-nowrap overflow-hidden`}
            >
              {selectedMetal === 'gold' ? `GOLD ${selectedKarat}K` : 'METALS'}
            </Button>
            <Button onClick={handleClear} className={getButtonClasses('C', 'font-bold text-white min-h-[50px] sm:min-h-[45px] flex items-center justify-center active:translate-y-[1px]')} style={{
              background: 'linear-gradient(180deg, #c04040 0%, #a03030 40%, #802020 100%)',
              border: '1px solid rgba(255,120,120,0.3)',
              boxShadow: 'inset 0 1px 0 rgba(255,160,160,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
              borderRadius: '6px', textShadow: '0 1px 2px rgba(0,0,0,0.4)'
            }}>C</Button>
            <Button 
              onClick={emergencyReset} 
              className={getButtonClasses('RESET RATES', 'font-bold text-white min-h-[50px] sm:min-h-[45px] flex items-center justify-center text-xs active:translate-y-[1px]')}
              style={{
                background: 'linear-gradient(180deg, #b03030 0%, #8a2020 40%, #701818 100%)',
                border: '1px solid rgba(255,100,100,0.3)',
                boxShadow: 'inset 0 1px 0 rgba(255,140,140,0.12), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
                borderRadius: '6px', textShadow: '0 1px 2px rgba(0,0,0,0.4)'
              }}
              title="⚠️ WARNING: This will clear ALL custom rates and use live market prices only"
            >
              RESET RATES
            </Button>
          </>
        ) : (
          <>
            {/* Traditional Calculator Mode - Office Calculator Layout */}
            {/* Top Row: Function Keys */}
            <Button 
              onClick={() => {
                setTraditionalDisplay('0');
                setTraditionalPrevious(null);
                setTraditionalOperation(null);
                setTraditionalWaitingForOperand(false);
              }}
              className={getButtonClasses('AC', 'text-white font-bold min-h-[50px] flex items-center justify-center active:translate-y-[1px]')}
              style={{
                background: 'linear-gradient(180deg, #c04040 0%, #a03030 40%, #802020 100%)',
                border: '1px solid rgba(255,100,100,0.3)',
                boxShadow: 'inset 0 1px 0 rgba(255,150,150,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
                borderRadius: '6px',
                textShadow: '0 1px 2px rgba(0,0,0,0.4)'
              }}
            >
              AC
            </Button>
            <Button 
              onClick={() => {
                setTraditionalDisplay('0');
                setTraditionalWaitingForOperand(false);
              }}
              className={getButtonClasses('CE', 'text-white font-bold min-h-[50px] flex items-center justify-center active:translate-y-[1px]')}
              style={{
                background: 'linear-gradient(180deg, #c07020 0%, #a05818 40%, #884810 100%)',
                border: '1px solid rgba(255,140,80,0.3)',
                boxShadow: 'inset 0 1px 0 rgba(255,180,120,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
                borderRadius: '6px',
                textShadow: '0 1px 2px rgba(0,0,0,0.4)'
              }}
            >
              CE
            </Button>
            <Button 
              onClick={() => {
                const value = parseFloat(traditionalDisplay);
                if (!isNaN(value)) {
                  setTraditionalDisplay((value / 100).toString());
                }
              }}
              className={getButtonClasses('%', 'text-white font-bold min-h-[50px] flex items-center justify-center active:translate-y-[1px]')}
              style={{
                background: 'linear-gradient(180deg, #1a6b8a 0%, #145a78 40%, #0e4a68 100%)',
                border: '1px solid rgba(80,180,220,0.3)',
                boxShadow: 'inset 0 1px 0 rgba(120,220,255,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
                borderRadius: '6px',
                textShadow: '0 1px 2px rgba(0,0,0,0.4)'
              }}
            >
              %
            </Button>
            <Button 
              onClick={() => traditionalInputOperation('/')}
              className={getButtonClasses('÷', 'text-white font-bold min-h-[50px] flex items-center justify-center active:translate-y-[1px]')}
              style={{
                background: 'linear-gradient(180deg, #1a6b8a 0%, #145a78 40%, #0e4a68 100%)',
                border: '1px solid rgba(80,180,220,0.3)',
                boxShadow: 'inset 0 1px 0 rgba(120,220,255,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
                borderRadius: '6px',
                textShadow: '0 1px 2px rgba(0,0,0,0.4)'
              }}
            >
              ÷
            </Button>
          </>
        )}

        {/* Row 2: Different layouts for each mode */}
        {!isTraditionalMode ? (
          <>
            {/* Precious Metals Mode - Direct Metal Selection with Perfect Symmetry */}
            <Button 
              onClick={() => selectMetal('gold')}
              className={getButtonClasses('GOLD', getMetalButtonStyle('gold', selectedMetal === 'gold'))}
              style={{...getMetalButtonInlineStyle('gold', selectedMetal === 'gold'), ...stateOfTheArtTextStyle}}
            >
              GOLD
            </Button>
            <Button 
              onClick={() => selectMetal('silver')}
              className={getButtonClasses('SILVER', getMetalButtonStyle('silver', selectedMetal === 'silver'))}
              style={{...getMetalButtonInlineStyle('silver', selectedMetal === 'silver'), ...stateOfTheArtTextStyle}}
            >
              SILVER
            </Button>
            <Button 
              onClick={() => selectMetal('platinum')}
              className={getButtonClasses('PLATINUM', getMetalButtonStyle('platinum', selectedMetal === 'platinum'), 'wide')}
              style={{...getMetalButtonInlineStyle('platinum', selectedMetal === 'platinum'), ...stateOfTheArtTextStyle}}
            >
              PLATINUM
            </Button>
            <Button 
              onClick={cycleFractionalOz}
              className={getButtonClasses(fractionalOzOptions[fractionalOzIndex].label, 'font-bold text-white transition-all duration-200 min-h-[45px] flex flex-col items-center justify-center px-1 active:translate-y-[1px]', 'wide')}
              style={{
                background: 'linear-gradient(180deg, #1a8a4a 0%, #147038 40%, #0e5a2e 100%)',
                border: '1px solid rgba(80,220,140,0.3)',
                boxShadow: 'inset 0 1px 0 rgba(120,255,180,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
                borderRadius: '6px',
                textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                ...stateOfTheArtTextStyle
              }}
            >
              <div style={getEnhancedTextStyle('9px')}>FRACTIONAL</div>
              <div style={getEnhancedTextStyle('10px')}>{fractionalOzOptions[fractionalOzIndex].label}</div>
            </Button>
          </>
        ) : (
          <>
            {/* Traditional Calculator Mode - Memory Functions Row */}
            <Button 
              onClick={() => {
                const value = parseFloat(traditionalDisplay);
                if (!isNaN(value)) {
                  setTraditionalMemory(traditionalMemory + value);
                }
              }}
              className={getButtonClasses('M+', 'text-white font-bold min-h-[50px] flex items-center justify-center active:translate-y-[1px]')}
              style={{
                background: 'linear-gradient(180deg, #3a3a8a 0%, #2a2a70 40%, #1e1e5a 100%)',
                border: '1px solid rgba(120,120,220,0.3)',
                boxShadow: 'inset 0 1px 0 rgba(160,160,255,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
                borderRadius: '6px',
                textShadow: '0 1px 2px rgba(0,0,0,0.4)'
              }}
            >
              M+
            </Button>
            <Button 
              onClick={() => {
                const value = parseFloat(traditionalDisplay);
                if (!isNaN(value)) {
                  setTraditionalMemory(traditionalMemory - value);
                }
              }}
              className={getButtonClasses('M-', 'text-white font-bold min-h-[50px] flex items-center justify-center active:translate-y-[1px]')}
              style={{
                background: 'linear-gradient(180deg, #3a3a8a 0%, #2a2a70 40%, #1e1e5a 100%)',
                border: '1px solid rgba(120,120,220,0.3)',
                boxShadow: 'inset 0 1px 0 rgba(160,160,255,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
                borderRadius: '6px',
                textShadow: '0 1px 2px rgba(0,0,0,0.4)'
              }}
            >
              M-
            </Button>
            <Button 
              onClick={() => {
                setTraditionalDisplay(traditionalMemory.toString());
                setTraditionalMemory(0);
              }}
              className={getButtonClasses('MRC', 'text-white font-bold min-h-[50px] flex items-center justify-center active:translate-y-[1px]')}
              style={{
                background: 'linear-gradient(180deg, #3a3a8a 0%, #2a2a70 40%, #1e1e5a 100%)',
                border: '1px solid rgba(120,120,220,0.3)',
                boxShadow: 'inset 0 1px 0 rgba(160,160,255,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
                borderRadius: '6px',
                textShadow: '0 1px 2px rgba(0,0,0,0.4)'
              }}
            >
              MRC
            </Button>
            <Button 
              onClick={() => {
                const value = parseFloat(traditionalDisplay);
                if (!isNaN(value)) {
                  setTraditionalDisplay((-value).toString());
                }
              }}
              className={getButtonClasses('+/-', 'text-white font-bold min-h-[50px] flex items-center justify-center active:translate-y-[1px]')}
              style={{
                background: 'linear-gradient(180deg, #1a8a4a 0%, #147038 40%, #0e5a2e 100%)',
                border: '1px solid rgba(80,220,140,0.3)',
                boxShadow: 'inset 0 1px 0 rgba(120,255,180,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
                borderRadius: '6px',
                textShadow: '0 1px 2px rgba(0,0,0,0.4)'
              }}
            >
              +/-
            </Button>
          </>
        )}

        {/* Row 3: 7 8 9 Function - Ergonomic number buttons */}
        <Button 
          onClick={() => isTraditionalMode ? traditionalInputNumber('7') : handleNumber('7')} 
          className={getErgonomicButtonStyle('number', 'high').className}
          style={getErgonomicButtonStyle('number', 'high').style}
        >
          7
        </Button>
        <Button 
          onClick={() => isTraditionalMode ? traditionalInputNumber('8') : handleNumber('8')} 
          className={getErgonomicButtonStyle('number', 'high').className}
          style={getErgonomicButtonStyle('number', 'high').style}
        >
          8
        </Button>
        <Button 
          onClick={() => isTraditionalMode ? traditionalInputNumber('9') : handleNumber('9')} 
          className={getErgonomicButtonStyle('number', 'high').className}
          style={getErgonomicButtonStyle('number', 'high').style}
        >
          9
        </Button>
        {!isTraditionalMode ? (
          <Button 
            onClick={() => setShowCustomSpotModal(true)}
            className={getButtonClasses(`CUSTOM SPOT ${Object.keys(customSpotPrices).length > 0 ? '★' : ''}`, 'font-bold text-white transition-all duration-200 min-h-[45px] flex flex-col items-center justify-center px-1 active:translate-y-[1px]')}
            style={{
              background: 'linear-gradient(180deg, #1a7a8a 0%, #146878 40%, #0e5568 100%)',
              border: '1px solid rgba(80,200,220,0.3)',
              boxShadow: Object.keys(customSpotPrices).length > 0
                ? 'inset 0 1px 0 rgba(120,220,255,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4), 0 0 10px rgba(80,200,220,0.3)'
                : 'inset 0 1px 0 rgba(120,220,255,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
              borderRadius: '6px',
              textShadow: '0 1px 2px rgba(0,0,0,0.4)',
              ...stateOfTheArtTextStyle
            }}
          >
            <div style={getEnhancedTextStyle('10px')}>CUSTOM</div>
            <div style={getEnhancedTextStyle('10px')}>SPOT {Object.keys(customSpotPrices).length > 0 ? '★' : ''}</div>
          </Button>
        ) : (
          <Button 
            onClick={() => traditionalInputOperation('*')}
            className={getButtonClasses('×', 'font-bold text-white text-xl min-h-[55px] flex items-center justify-center active:translate-y-[1px]')}
            style={{
              background: 'linear-gradient(180deg, #1a6b8a 0%, #145a78 40%, #0e4a68 100%)',
              border: '1px solid rgba(80,180,220,0.3)',
              boxShadow: 'inset 0 1px 0 rgba(120,220,255,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
              borderRadius: '6px',
              textShadow: '0 1px 2px rgba(0,0,0,0.4)'
            }}
          >
            ×
          </Button>
        )}

        {/* Row 4: 4 5 6 Function - Ergonomic number buttons */}
        <Button 
          onClick={() => isTraditionalMode ? traditionalInputNumber('4') : handleNumber('4')} 
          className={getErgonomicButtonStyle('number', 'high').className}
          style={getErgonomicButtonStyle('number', 'high').style}
        >
          4
        </Button>
        <Button 
          onClick={() => isTraditionalMode ? traditionalInputNumber('5') : handleNumber('5')} 
          className={getErgonomicButtonStyle('number', 'high').className}
          style={getErgonomicButtonStyle('number', 'high').style}
        >
          5
        </Button>
        <Button 
          onClick={() => isTraditionalMode ? traditionalInputNumber('6') : handleNumber('6')} 
          className={getErgonomicButtonStyle('number', 'high').className}
          style={getErgonomicButtonStyle('number', 'high').style}
        >
          6
        </Button>
        {!isTraditionalMode ? (
          <Button 
            onClick={openCustomRatesModal}
            className={getButtonClasses(`CUSTOM RATES ${Object.keys(loanRates).length > 0 || Object.keys(sellRates).length > 0 ? '★' : ''}`, 'font-bold text-white transition-all duration-200 min-h-[45px] flex flex-col items-center justify-center px-1 active:translate-y-[1px]')}
            style={{
              background: 'linear-gradient(180deg, #b08020 0%, #906818 40%, #705010 100%)',
              border: '1px solid rgba(220,160,50,0.3)',
              boxShadow: Object.keys(loanRates).length > 0 || Object.keys(sellRates).length > 0
                ? 'inset 0 1px 0 rgba(255,200,80,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4), 0 0 10px rgba(220,160,50,0.3)'
                : 'inset 0 1px 0 rgba(255,200,80,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
              borderRadius: '6px',
              textShadow: '0 1px 2px rgba(0,0,0,0.4)',
              ...stateOfTheArtTextStyle
            }}
          >
            <div style={getEnhancedTextStyle('10px')}>CUSTOM</div>
            <div style={getEnhancedTextStyle('10px')}>RATES {Object.keys(loanRates).length > 0 || Object.keys(sellRates).length > 0 ? '★' : ''}</div>
          </Button>
        ) : (
          <Button 
            onClick={() => traditionalInputOperation('-')}
            className={getButtonClasses('-', 'font-bold text-white text-xl min-h-[55px] flex items-center justify-center active:translate-y-[1px]')}
            style={{
              background: 'linear-gradient(180deg, #1a6b8a 0%, #145a78 40%, #0e4a68 100%)',
              border: '1px solid rgba(80,180,220,0.3)',
              boxShadow: 'inset 0 1px 0 rgba(120,220,255,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
              borderRadius: '6px',
              textShadow: '0 1px 2px rgba(0,0,0,0.4)'
            }}
          >
            -
          </Button>
        )}

        {/* Row 5: 1 2 3 Function - Ergonomic number buttons */}
        <Button 
          onClick={() => isTraditionalMode ? traditionalInputNumber('1') : handleNumber('1')} 
          className={getErgonomicButtonStyle('number', 'high').className}
          style={getErgonomicButtonStyle('number', 'high').style}
        >
          1
        </Button>
        <Button 
          onClick={() => isTraditionalMode ? traditionalInputNumber('2') : handleNumber('2')} 
          className={getErgonomicButtonStyle('number', 'high').className}
          style={getErgonomicButtonStyle('number', 'high').style}
        >
          2
        </Button>
        <Button 
          onClick={() => isTraditionalMode ? traditionalInputNumber('3') : handleNumber('3')} 
          className={getErgonomicButtonStyle('number', 'high').className}
          style={getErgonomicButtonStyle('number', 'high').style}
        >
          3
        </Button>
        {!isTraditionalMode ? (
          <Button 
            onClick={handleEnter}
            className={getErgonomicButtonStyle('memory', 'high').className}
            style={getErgonomicButtonStyle('memory', 'high').style}
          >
            ENTER
          </Button>
        ) : (
          <Button 
            onClick={() => traditionalInputOperation('+')}
            className={getButtonClasses('+', 'font-bold text-white text-xl min-h-[55px] flex items-center justify-center active:translate-y-[1px]')}
            style={{
              background: 'linear-gradient(180deg, #1a6b8a 0%, #145a78 40%, #0e4a68 100%)',
              border: '1px solid rgba(80,180,220,0.3)',
              boxShadow: 'inset 0 1px 0 rgba(120,220,255,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
              borderRadius: '6px',
              textShadow: '0 1px 2px rgba(0,0,0,0.4)'
            }}
          >
            +
          </Button>
        )}

        {/* Row 6: Bottom Row */}
        {!isTraditionalMode ? (
          <>
            {/* Precious Metals Mode - Ergonomically optimized bottom row */}
            <Button 
              onClick={setReverseMode}
              className={getButtonClasses('REV', 'font-bold text-white transition-all duration-200 min-h-[45px] flex items-center justify-center px-1 active:translate-y-[1px]')}
              style={{
                background: 'linear-gradient(180deg, #1a7a8a 0%, #146878 40%, #0e5568 100%)',
                border: '1px solid rgba(80,200,220,0.3)',
                boxShadow: mode === 'reverse'
                  ? 'inset 0 1px 0 rgba(120,220,255,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4), 0 0 10px rgba(80,200,220,0.3)'
                  : 'inset 0 1px 0 rgba(120,220,255,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
                borderRadius: '6px',
                textShadow: '0 1px 2px rgba(0,0,0,0.4)'
              }}
            >
              REV
            </Button>
            <Button 
              onClick={() => handleNumber('0')} 
              className={getErgonomicButtonStyle('number', 'high').className}
              style={getErgonomicButtonStyle('number', 'high').style}
            >
              0
            </Button>
            <Button 
              onClick={inputDecimal} 
              className={getErgonomicButtonStyle('number', 'high').className}
              style={getErgonomicButtonStyle('number', 'high').style}
            >
              .
            </Button>
            <Button 
              onClick={() => setShowScrapModal(true)}
              className={getErgonomicButtonStyle('special', 'high').className}
              style={getErgonomicButtonStyle('special', 'high').style}
            >
              SCRAP
            </Button>
          </>
        ) : (
          <>
            {/* Traditional Calculator Mode - 0 (wide) . = */}
            <Button 
              onClick={() => traditionalInputNumber('0')} 
              className={getButtonClasses('0', 'text-white font-bold text-xl min-h-[55px] flex items-center justify-center col-span-2 active:translate-y-[1px]', 'wide')}
              style={{
                background: 'linear-gradient(180deg, #4a4a5a 0%, #35354a 40%, #2a2a3e 100%)',
                border: '1px solid rgba(120,120,160,0.3)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
                borderRadius: '6px',
                textShadow: '0 1px 2px rgba(0,0,0,0.4)'
              }}
            >
              0
            </Button>
            <Button 
              onClick={traditionalInputDot} 
              className={getButtonClasses('.', 'text-white font-bold text-xl min-h-[55px] flex items-center justify-center active:translate-y-[1px]')}
              style={{
                background: 'linear-gradient(180deg, #4a4a5a 0%, #35354a 40%, #2a2a3e 100%)',
                border: '1px solid rgba(120,120,160,0.3)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
                borderRadius: '6px',
                textShadow: '0 1px 2px rgba(0,0,0,0.4)'
              }}
            >
              .
            </Button>
            <Button 
              onClick={traditionalCalculate}
              className={getButtonClasses('=', 'font-bold text-white text-xl min-h-[55px] flex items-center justify-center active:translate-y-[1px]')}
              style={{
                background: 'linear-gradient(180deg, #1a8a4a 0%, #147038 40%, #0e5a2e 100%)',
                border: '1px solid rgba(80,220,140,0.3)',
                boxShadow: 'inset 0 1px 0 rgba(120,255,180,0.15), inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.4)',
                borderRadius: '6px',
                textShadow: '0 1px 2px rgba(0,0,0,0.4)'
              }}
            >
              =
            </Button>
          </>
        )}
      </div>

      {/* Custom Rates Modal */}
      {showCustomRatesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[60] p-4">
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] shadow-2xl" style={{
            background: 'linear-gradient(135deg, rgba(12,12,20,0.98) 0%, rgba(8,8,16,0.98) 100%)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.7), 0 0 20px rgba(255,215,0,0.05)',
            border: '2px solid rgba(255,215,0,0.2)'
          }}>
            <div className="sticky top-0 bg-gray-900 z-10 p-6 border-b border-gray-600 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-yellow-200">Custom Rates (Gold • Silver • Platinum)</h2>
                <button
                  onClick={() => setShowCustomRatesModal(false)}
                  className="text-yellow-400 hover:text-white text-2xl bg-gray-800 hover:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="px-6 pb-12 overflow-y-auto custom-scrollbar" style={{
              maxHeight: 'calc(90vh - 90px)'
            }}>
              {/* Gold Karats */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-yellow-200 mb-4">Gold Karats (per gram)</h3>
                <div className="grid grid-cols-1 gap-3">
                  {GOLD_KARATS.map((karat) => (
                    <div key={karat.label} className="bg-gray-800 p-3 rounded-lg border border-gray-500">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className="font-bold text-white text-lg">{karat.label}</span>
                          <span className="text-yellow-300 ml-2 font-semibold">{karat.purity}% Pure</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-blue-200 block mb-1 font-semibold">Loan Rate</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={loanRates[karat.label] || ''}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value)) {
                                setCustomRate(karat.label, 'loan', value);
                              } else if (e.target.value === '') {
                                setLoanRates(prev => {
                                  const newRates = { ...prev };
                                  delete newRates[karat.label];
                                  return newRates;
                                });
                              }
                            }}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-500 rounded text-white text-sm font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-orange-200 block mb-1 font-semibold">Sell Rate</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={sellRates[karat.label] || ''}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value)) {
                                setCustomRate(karat.label, 'sell', value);
                              } else if (e.target.value === '') {
                                setSellRates(prev => {
                                  const newRates = { ...prev };
                                  delete newRates[karat.label];
                                  return newRates;
                                });
                              }
                            }}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-500 rounded text-white text-sm font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Silver Purities */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-yellow-200 mb-4">Silver Purities (per gram)</h3>
                <div className="grid grid-cols-1 gap-3">
                  {SILVER_PURITIES.filter(purity => purity.purity >= 80.0).map((purity) => (
                    <div key={purity.label} className="bg-gray-800 p-3 rounded-lg border border-gray-500">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className="font-bold text-white text-lg">{purity.label}</span>
                          <span className="text-yellow-300 ml-2 font-semibold">{purity.purity}% Pure Silver</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-blue-200 block mb-1 font-semibold">Loan Rate</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={loanRates[purity.label] || ''}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value)) {
                                setCustomRate(purity.label, 'loan', value);
                              } else if (e.target.value === '') {
                                setLoanRates(prev => {
                                  const newRates = { ...prev };
                                  delete newRates[purity.label];
                                  return newRates;
                                });
                              }
                            }}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-500 rounded text-white text-sm font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-orange-200 block mb-1 font-semibold">Sell Rate</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={sellRates[purity.label] || ''}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value)) {
                                setCustomRate(purity.label, 'sell', value);
                              } else if (e.target.value === '') {
                                setSellRates(prev => {
                                  const newRates = { ...prev };
                                  delete newRates[purity.label];
                                  return newRates;
                                });
                              }
                            }}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-500 rounded text-white text-sm font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platinum Purities */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-yellow-200 mb-4">Platinum Purities (per gram)</h3>
                <div className="grid grid-cols-1 gap-3">
                  {PLATINUM_PURITIES.map((purity) => (
                    <div key={purity.label} className="bg-gray-800 p-3 rounded-lg border border-gray-500">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className="font-bold text-white text-lg">{purity.label}</span>
                          <span className="text-yellow-300 ml-2 font-semibold">{purity.purity}% Pure Platinum</span>
                          <span className="text-gray-200 ml-2 text-sm">({purity.desc})</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-blue-200 block mb-1 font-semibold">Loan Rate</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={loanRates[purity.label] || ''}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value)) {
                                setCustomRate(purity.label, 'loan', value);
                              } else if (e.target.value === '') {
                                setLoanRates(prev => {
                                  const newRates = { ...prev };
                                  delete newRates[purity.label];
                                  return newRates;
                                });
                              }
                            }}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-500 rounded text-white text-sm font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-orange-200 block mb-1 font-semibold">Sell Rate</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={sellRates[purity.label] || ''}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value)) {
                                setCustomRate(purity.label, 'sell', value);
                              } else if (e.target.value === '') {
                                setSellRates(prev => {
                                  const newRates = { ...prev };
                                  delete newRates[purity.label];
                                  return newRates;
                                });
                              }
                            }}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-500 rounded text-white text-sm font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Calculate from Spot ── */}
              <div className="mt-8 mb-6 bg-gray-800 rounded-xl p-4 border border-yellow-500/30">
                <div className="text-yellow-300 font-bold text-sm mb-1 flex items-center gap-2">
                  ⚡ Calculate Rates from Live Spot
                </div>
                <div className="text-gray-400 text-xs mb-4">
                  Applies your loan % and sell spread to today's live spot prices across all karats automatically.
                  Based on the MCPB algorithm: Gold loan ≈ 79% of melt · Sell = Loan + $4/g
                </div>

                {/* Live spot preview */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: 'Gold', key: 'gold', color: 'text-yellow-400' },
                    { label: 'Silver', key: 'silver', color: 'text-gray-300' },
                    { label: 'Platinum', key: 'platinum', color: 'text-blue-300' },
                  ].map(({ label, key, color }) => (
                    <div key={key} className="bg-gray-900 rounded-lg p-2 text-center">
                      <div className={`text-xs font-bold ${color}`}>{label}</div>
                      <div className="text-white text-xs font-mono mt-1">
                        ${((metalPrices as any)?.[key] || 0).toFixed(0)}/oz
                      </div>
                      <div className="text-gray-500 text-xs">
                        ${(((metalPrices as any)?.[key] || 0) / 31.1035).toFixed(2)}/g
                      </div>
                    </div>
                  ))}
                </div>

                {/* Percentage controls */}
                <div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <label className="text-xs text-blue-300 block mb-1 font-semibold">Gold Loan %</label>
                          <div className="flex items-center gap-2">
                            <input type="range" min={50} max={95} value={spotLoanPct} onChange={e => setSpotLoanPct(Number(e.target.value))}
                              className="flex-1 accent-yellow-400" />
                            <span className="text-yellow-300 font-mono text-sm w-10 text-right">{spotLoanPct}%</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-orange-300 block mb-1 font-semibold">Gold Sell Spread ($/g)</label>
                          <div className="flex items-center gap-2">
                            <input type="range" min={1} max={15} value={spotSellSpread} onChange={e => setSpotSellSpread(Number(e.target.value))}
                              className="flex-1 accent-orange-400" />
                            <span className="text-orange-300 font-mono text-sm w-10 text-right">+${spotSellSpread}</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-300 block mb-1 font-semibold">Silver Loan %</label>
                          <div className="flex items-center gap-2">
                            <input type="range" min={20} max={80} value={spotSilverLoanPct} onChange={e => setSpotSilverLoanPct(Number(e.target.value))}
                              className="flex-1 accent-gray-400" />
                            <span className="text-gray-300 font-mono text-sm w-10 text-right">{spotSilverLoanPct}%</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 block mb-1 font-semibold">Silver Sell Spread ($/g)</label>
                          <div className="flex items-center gap-2">
                            <input type="range" min={0} max={2} step={0.05} value={spotSilverSpread} onChange={e => setSpotSilverSpread(Number(e.target.value))}
                              className="flex-1 accent-gray-400" />
                            <span className="text-gray-300 font-mono text-sm w-12 text-right">+${spotSilverSpread.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {(metalPrices as any)?.gold > 0 && (
                        <div className="bg-gray-900 rounded-lg p-3 mb-4 text-xs">
                          <div className="text-gray-400 mb-2 font-semibold">Preview at today's spot:</div>
                          <div className="grid grid-cols-3 gap-2">
                            {['10K','14K','18K','22K','24K'].map(k => {
                              const purityMap: Record<string, number> = {'10K':41.7,'14K':58.3,'18K':75.0,'22K':91.7,'24K':99.9};
                              const melt = ((metalPrices as any)?.gold / 31.1035) * (purityMap[k] / 100);
                              const loan = Math.round(melt * (spotLoanPct/100) * 100) / 100;
                              const sell = Math.round((loan + spotSellSpread) * 100) / 100;
                              return (
                                <div key={k} className="text-center">
                                  <div className="text-yellow-400 font-bold">{k}</div>
                                  <div className="text-blue-300">L: ${loan.toFixed(2)}</div>
                                  <div className="text-orange-300">S: ${sell.toFixed(2)}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={() => calculateRatesFromSpot(spotLoanPct/100, spotSellSpread, spotSilverLoanPct/100, spotSilverSpread)}
                        className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 text-sm"
                      >
                        ⚡ Apply These Rates to All Karats
                      </Button>
                    </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
                <Button
                  onClick={() => setShowCustomRatesModal(false)}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 min-h-[44px]"
                >
                  Save & Close
                </Button>
                
                <Button
                  onClick={autoFillMissingPrices}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 min-h-[44px] text-sm"
                  disabled={Object.keys(loanRates).length < 2 && Object.keys(sellRates).length < 2}
                >
                  🧮 Auto-Fill Missing
                </Button>
                
                <Button
                  onClick={recallPreviousPrices}
                  className="bg-amber-700 hover:bg-amber-800 text-white font-bold px-6 py-2 min-h-[44px] text-sm"
                  disabled={Object.keys(backupLoanRates).length === 0 && Object.keys(backupSellRates).length === 0 && Object.keys(backupCustomSpotPrices).length === 0}
                >
                  🔄 Recall Previous
                </Button>
                
                <Button
                  onClick={() => setShowClearRatesModal(true)}
                  className="bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold px-6 py-2 border-2 border-red-400 shadow-lg min-h-[44px] text-sm"
                  disabled={Object.keys(loanRates).length === 0 && Object.keys(sellRates).length === 0}
                >
                  Clear All Rates
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Rates Confirmation Modal */}
      {showClearRatesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border-2 border-red-500 max-w-md w-full">
            <div className="p-6">
              <div className="text-center">
                <div className="text-red-400 text-6xl mb-4">⚠️</div>
                <h2 className="text-xl font-bold text-red-400 mb-4">Clear All Custom Rates?</h2>
                <p className="text-yellow-300 mb-6">
                  This will permanently delete ALL custom loan and sell rates for all karats and purities. 
                  This action cannot be undone.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => setShowClearRatesModal(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-6 py-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={clearAllRates}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2"
                  >
                    Clear All Rates
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Spot Price Modal */}
      {showCustomSpotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border-2 border-cyan-500 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-cyan-400">Custom Spot Prices</h2>
                <Button
                  onClick={() => setShowCustomSpotModal(false)}
                  className="text-yellow-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>

              <div className="text-yellow-300 mb-6">
                <p>Set custom spot prices per troy ounce for precise calculations. Leave blank to use live market prices.</p>
              </div>

              <div className="space-y-6">
                {/* Gold Spot Price */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-yellow-400 mb-3">Gold Spot Price</h3>
                  <div className="flex items-center gap-4">
                    <label className="text-white font-medium">$/oz:</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Live market price"
                      value={customSpotPrices.gold || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value && !isNaN(parseFloat(value))) {
                          setCustomSpotPrices(prev => ({
                            ...prev,
                            gold: parseFloat(value)
                          }));
                        } else {
                          setCustomSpotPrices(prev => {
                            const newPrices = { ...prev };
                            delete newPrices.gold;
                            return newPrices;
                          });
                        }
                      }}
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white flex-1 max-w-40"
                    />
                    <Button
                      onClick={() => {
                        setCustomSpotPrices(prev => {
                          const newPrices = { ...prev };
                          delete newPrices.gold;
                          return newPrices;
                        });
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2"
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                {/* Silver Spot Price */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-yellow-300 mb-3">Silver Spot Price</h3>
                  <div className="flex items-center gap-4">
                    <label className="text-white font-medium">$/oz:</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Live market price"
                      value={customSpotPrices.silver || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value && !isNaN(parseFloat(value))) {
                          setCustomSpotPrices(prev => ({
                            ...prev,
                            silver: parseFloat(value)
                          }));
                        } else {
                          setCustomSpotPrices(prev => {
                            const newPrices = { ...prev };
                            delete newPrices.silver;
                            return newPrices;
                          });
                        }
                      }}
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white flex-1 max-w-40"
                    />
                    <Button
                      onClick={() => {
                        setCustomSpotPrices(prev => {
                          const newPrices = { ...prev };
                          delete newPrices.silver;
                          return newPrices;
                        });
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2"
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                {/* Platinum Spot Price */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-yellow-300 mb-3">Platinum Spot Price</h3>
                  <div className="flex items-center gap-4">
                    <label className="text-white font-medium">$/oz:</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Live market price"
                      value={customSpotPrices.platinum || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value && !isNaN(parseFloat(value))) {
                          setCustomSpotPrices(prev => ({
                            ...prev,
                            platinum: parseFloat(value)
                          }));
                        } else {
                          setCustomSpotPrices(prev => {
                            const newPrices = { ...prev };
                            delete newPrices.platinum;
                            return newPrices;
                          });
                        }
                      }}
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white flex-1 max-w-40"
                    />
                    <Button
                      onClick={() => {
                        setCustomSpotPrices(prev => {
                          const newPrices = { ...prev };
                          delete newPrices.platinum;
                          return newPrices;
                        });
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button
                  onClick={() => setShowCustomSpotModal(false)}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-6 py-2"
                >
                  Save & Close
                </Button>
                <Button
                  onClick={() => {
                    setCustomSpotPrices({});
                    setShowCustomSpotModal(false);
                  }}
                  className="bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold px-6 py-2 border-2 border-red-400 shadow-lg"
                  disabled={Object.keys(customSpotPrices).length === 0}
                >
                  Clear All Prices
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCRAP Batch Calculator Modal */}
      {showScrapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" style={{background: 'linear-gradient(135deg, rgba(12,12,20,0.98) 0%, rgba(8,8,16,0.98) 100%)', border: '2px solid rgba(255,215,0,0.15)'}}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2" style={{...stateOfTheArtTextStyle, color: 'rgba(255,215,0,0.8)'}}>
                    🗂️ SCRAP BATCH CALCULATOR
                  </h2>
                  <p className="text-sm" style={{...stateOfTheArtTextStyle, color: 'rgba(255,215,0,0.6)'}}>
                    Mixed-lot precious metals calculator • Add multiple pieces, get instant totals
                  </p>
                </div>
                <button
                  onClick={() => setShowScrapModal(false)}
                  className="hover:text-white text-3xl font-bold"
                  style={{...stateOfTheArtTextStyle, color: 'rgba(255,215,0,0.5)'}}
                >
                  ×
                </button>
              </div>

              {/* Add New Item Section */}
              <div className="p-4 rounded-lg mb-6" style={{background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.1)'}}>
                <h3 className="text-lg font-bold mb-3" style={{...stateOfTheArtTextStyle, color: 'rgba(255,215,0,0.8)'}}>Add Scrap Item</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="text-sm mb-2 block" style={{...stateOfTheArtTextStyle, color: 'rgba(255,215,0,0.6)'}}>Weight (grams)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={scrapWeight}
                      onChange={(e) => setScrapWeight(e.target.value)}
                      className="w-full px-3 py-2 rounded text-white"
                      style={{...stateOfTheArtTextStyle, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,215,0,0.1)'}}
                    />
                  </div>
                  <div>
                    <label className="text-sm mb-2 block" style={{...stateOfTheArtTextStyle, color: 'rgba(255,215,0,0.6)'}}>Karat/Purity</label>
                    <select
                      value={scrapKarat}
                      onChange={(e) => setScrapKarat(e.target.value)}
                      className="w-full px-3 py-2 rounded text-white"
                      style={{...stateOfTheArtTextStyle, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,215,0,0.1)'}}
                    >
                      {Object.entries(KARAT_PURITIES).map(([karat, purity]) => (
                        <option key={karat} value={karat}>
                          {karat} ({purity}%)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm mb-2 block" style={{...stateOfTheArtTextStyle, color: 'rgba(255,215,0,0.6)'}}>Estimated Value</label>
                    <div className="px-3 py-2 rounded text-sm" style={{...stateOfTheArtTextStyle, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,215,0,0.1)', color: 'rgba(255,215,0,0.7)'}}>
                      ${scrapWeight && parseFloat(scrapWeight) > 0 ? 
                        ((parseFloat(scrapWeight) * ((KARAT_PURITIES[scrapKarat] || 75.0) / 100) * (getCurrentPrice() / 31.1035)).toFixed(2)) : 
                        '0.00'}
                    </div>
                  </div>
                  <Button
                    onClick={addScrapItem}
                    disabled={!scrapWeight || parseFloat(scrapWeight) <= 0}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 disabled:opacity-50"
                    style={stateOfTheArtTextStyle}
                  >
                    ➕ Add Item
                  </Button>
                </div>
              </div>

              {/* Batch Items List */}
              <div className="p-4 rounded-lg mb-6" style={{background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.1)'}}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold" style={{...stateOfTheArtTextStyle, color: 'rgba(255,215,0,0.8)'}}>
                    Scrap Batch ({scrapItems.length} items)
                  </h3>
                  {scrapItems.length > 0 && (
                    <Button
                      onClick={clearScrapBatch}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1"
                      style={stateOfTheArtTextStyle}
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                {scrapItems.length === 0 ? (
                  <div className="text-center py-8" style={{...stateOfTheArtTextStyle, color: 'rgba(255,215,0,0.6)'}}>
                    No items in batch. Add your first scrap item above.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {scrapItems.map((item) => (
                      <div key={item.id} className="p-3 rounded flex justify-between items-center" style={{background: 'rgba(255,215,0,0.03)', border: '1px solid rgba(255,215,0,0.08)'}}>
                        <div className="flex-1 grid grid-cols-4 gap-4 text-sm" style={stateOfTheArtTextStyle}>
                          <div style={{color: 'rgba(255,215,0,0.7)'}}>
                            <span className="font-semibold">{item.weight}g</span>
                          </div>
                          <div style={{color: 'rgba(255,215,0,0.7)'}}>
                            <span className="font-semibold">{item.karat}</span> ({item.purity}%)
                          </div>
                          <div className="text-green-300 font-bold">
                            ${item.value.toFixed(2)}
                          </div>
                          <div className="flex justify-end">
                            <Button
                              onClick={() => removeScrapItem(item.id)}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1"
                              style={stateOfTheArtTextStyle}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total Summary */}
              {scrapItems.length > 0 && (
                <div className="bg-gradient-to-r from-green-800 to-green-700 p-6 rounded-lg border-2 border-green-400 mb-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-green-200 text-sm mb-1" style={stateOfTheArtTextStyle}>Total Weight</div>
                      <div className="text-2xl font-bold text-white" style={stateOfTheArtTextStyle}>
                        {getTotalScrapWeight().toFixed(2)}g
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-200 text-sm mb-1" style={stateOfTheArtTextStyle}>Total Value</div>
                      <div className="text-3xl font-bold text-yellow-300" style={{
                        ...stateOfTheArtTextStyle,
                        textShadow: '0 0 10px rgba(255, 255, 0, 0.5)'
                      }}>
                        ${getTotalScrapValue().toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button
                  onClick={() => setShowScrapModal(false)}
                  className="bg-amber-700 hover:bg-amber-800 text-white font-bold px-6 py-2"
                  style={stateOfTheArtTextStyle}
                >
                  Close
                </Button>
                <div className="text-sm flex items-center" style={{...stateOfTheArtTextStyle, color: 'rgba(255,215,0,0.6)'}}>
                  💎 Batch processing for mixed-lot calculations
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      

    </div>
  );
}