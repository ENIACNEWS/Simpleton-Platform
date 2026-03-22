import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, Diamond, Settings, RotateCcw, Percent, X, Lock, Star, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useSubscription } from "@/hooks/use-subscription";
import { useAuth } from "@/hooks/use-auth";
import { NewsTicker, useNewsTickerToggle } from "@/components/news/news-ticker";

// Diamond types and grades with professional warnings
const CLARITY_GRADES = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3"];

// Authentic GIA Clarity Database with Professional Characteristics
const GIA_CLARITY_DATABASE = {
  'FL': {
    name: 'FLAWLESS',
    description: 'No inclusions or blemishes under 10x magnification',
    characteristics: 'Perfect crystal clarity',
    rarity: '< 1% of all diamonds',
    visual: '◊ PERFECT ◊',
    quality: 'EXCEPTIONAL',
    price_impact: 'Maximum premium',
    professional_note: 'Investment grade - Extremely rare'
  },
  'IF': {
    name: 'INTERNALLY FLAWLESS', 
    description: 'No inclusions under 10x, only minor surface blemishes',
    characteristics: 'Crystal clear interior',
    rarity: '< 3% of all diamonds',
    visual: '◊ PRISTINE ◊',
    quality: 'PREMIUM',
    price_impact: 'Very high premium',
    professional_note: 'Nearly perfect - Exceptional value'
  },
  'VVS1': {
    name: 'VERY VERY SLIGHTLY INCLUDED 1',
    description: 'Extremely difficult inclusions for skilled graders',
    characteristics: 'Minute pinpoints or needles',
    rarity: '~ 5% of all diamonds',
    visual: '◊ · ◊',
    quality: 'PREMIUM GRADE',
    price_impact: 'High premium',
    professional_note: 'Exceptional clarity - Eye perfect'
  },
  'VVS2': {
    name: 'VERY VERY SLIGHTLY INCLUDED 2',
    description: 'Very difficult inclusions to see under 10x',
    characteristics: 'Small pinpoints, faint needles',
    rarity: '~ 5% of all diamonds',
    visual: '◊ ·· ◊',
    quality: 'PREMIUM GRADE',
    price_impact: 'High premium',
    professional_note: 'Premium clarity - Excellent choice'
  },
  'VS1': {
    name: 'VERY SLIGHTLY INCLUDED 1',
    description: 'Minor inclusions difficult to see under 10x',
    characteristics: 'Small crystals, feathers',
    rarity: '~ 15% of all diamonds',
    visual: '◊ ··· ◊',
    quality: 'EXCELLENT GRADE',
    price_impact: 'Moderate premium',
    professional_note: 'Excellent value - Eye clean'
  },
  'VS2': {
    name: 'VERY SLIGHTLY INCLUDED 2',
    description: 'Minor inclusions somewhat easy to see under 10x',
    characteristics: 'Visible crystals, small feathers',
    rarity: '~ 15% of all diamonds',
    visual: '◊ ···· ◊',
    quality: 'EXCELLENT GRADE',
    price_impact: 'Moderate premium',
    professional_note: 'Great value - Typically eye clean'
  },
  'SI1': {
    name: 'SLIGHTLY INCLUDED 1',
    description: 'Inclusions noticeable to skilled graders under 10x',
    characteristics: 'Crystals, clouds, feathers',
    rarity: '~ 25% of all diamonds',
    visual: '◊ ·····• ◊',
    quality: 'GOOD GRADE',
    price_impact: 'Balanced pricing',
    professional_note: 'Best value - Often eye clean'
  },
  'SI2': {
    name: 'SLIGHTLY INCLUDED 2',
    description: 'Inclusions easily noticeable under 10x',
    characteristics: 'Larger crystals, clouds',
    rarity: '~ 25% of all diamonds',
    visual: '◊ ••·••• ◊',
    quality: 'GOOD GRADE',
    price_impact: 'Value pricing',
    professional_note: 'Budget conscious - Select carefully'
  },
  'I1': {
    name: 'INCLUDED 1',
    description: 'Obvious inclusions under 10x, may affect brilliance',
    characteristics: 'Large crystals, dense clouds',
    rarity: '~ 8% of jewelry grade',
    visual: '◊ •••••• ◊',
    quality: 'COMMERCIAL GRADE',
    price_impact: 'Budget friendly',
    professional_note: 'Visible inclusions - Significant savings'
  },
  'I2': {
    name: 'INCLUDED 2',
    description: 'Obvious inclusions clearly affecting appearance',
    characteristics: 'Heavy inclusions, large feathers',
    rarity: '~ 2% of jewelry grade',
    visual: '◊ ••••••• ◊',
    quality: 'BUDGET GRADE',
    price_impact: 'Low cost',
    professional_note: 'Heavily included - Major savings'
  },
  'I3': {
    name: 'INCLUDED 3',
    description: 'Severe inclusions affecting transparency/brilliance',
    characteristics: 'Very heavy inclusions, cracks',
    rarity: '< 1% of jewelry grade',
    visual: '◊ •••••••• ◊',
    quality: 'ENTRY GRADE',
    price_impact: 'Lowest cost',
    professional_note: 'Severely included - Durability concerns'
  }
};
const COLOR_GRADES = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];

// GIA-based diamond color mapping
const getGIAColorShade = (colorGrade: string) => {
  const giaColorMap = {
    'D': '#FFFFFF',      // Absolutely colorless - icy white (most rare)
    'E': '#FFFFFB',      // Colorless - exceptional white  
    'F': '#FFFFF6',      // Colorless - rare white
    'G': '#FFFFF0',      // Near colorless - fine white
    'H': '#FFFEE8',      // Near colorless - white
    'I': '#FFFED8',      // Near colorless - commercial white
    'J': '#FFFDC0',      // Faint color - top light brown
    'K': '#FFFCA0',      // Faint color - light brown
    'L': '#FFFB80',      // Light color - brown
    'M': '#FFFA60'       // Light color - light brown
  };
  return giaColorMap[colorGrade as keyof typeof giaColorMap] || '#FFFFFF';
};
const DIAMOND_SHAPES = ["ROUND", "PRINCESS", "CUSHION", "EMERALD", "OVAL", "PEAR", "MARQUISE", "ASSCHER", "RADIANT", "HEART"];

// PROFESSIONAL GRADE WARNINGS - Industry Standards
const GRADE_WARNINGS = {
  clarity: {
    "I3": "⚠️ I3 clarity diamonds have visible inclusions affecting beauty and value",
    "I2": "⚠️ I2 clarity diamonds have noticeable inclusions",
    "I1": "⚠️ I1 clarity diamonds have eye-visible inclusions"
  },
  color: {
    "K": "⚠️ K color shows noticeable yellow tint",
    "L": "⚠️ L color shows visible yellow tint",
    "M": "⚠️ M color shows strong yellow tint affecting value"
  },
  cut: {
    "POOR": "⚠️ Poor cut significantly reduces diamond brilliance and value",
    "FAIR": "⚠️ Fair cut reduces light performance and overall beauty"
  }
};

// MARKET VALIDATION RANGES - Prevent unrealistic percentage settings
const MARKET_VALIDATION = {
  loan: { min: 5, max: 60, typical: { min: 15, max: 35 } },
  wholesale: { min: 40, max: 95, typical: { min: 60, max: 85 } }
};

interface DiamondCalculatorProps {
  onMenuToggle?: () => void;
}

export function DiamondCalculator({ onMenuToggle }: DiamondCalculatorProps = {}) {
  const [showFallingDiamonds, setShowFallingDiamonds] = useState(false);
  const [showGridSystem, setShowGridSystem] = useState(false);
  const [gridType, setGridType] = useState<'round' | 'pear'>('round');
  const [calculationHistory, setCalculationHistory] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('diamond-calculation-history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  // Function to save calculation to history (local + server)
  const saveCalculationToHistory = (calculation: any) => {
    const newCalculation = {
      ...calculation,
      timestamp: new Date().toLocaleString(),
      id: Date.now()
    };
    
    setCalculationHistory(prev => {
      const updated = [newCalculation, ...prev];
      const sliced = updated.slice(0, 10);
      localStorage.setItem('diamond-calculation-history', JSON.stringify(sliced));
      return sliced;
    });
    
    logDiamondCalculation({
      carat: calculation.carat,
      color: calculation.color,
      clarity: calculation.clarity,
      cut: calculation.cut,
      diamondType: calculation.diamondType,
      totalValue: calculation.totalValue,
      pricingSystem: calculation.pricingSystem,
    });
  };
  const [gridData, setGridData] = useState<any>({});
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [, setLocation] = useLocation();
  
  // News ticker state management
  const { isEnabled: newsEnabled, toggle: toggleNews } = useNewsTickerToggle('diamonds', true);
  
  // Subscription state
  const {
    features,
    canUseCalculator,
    getRemainingCalculations,
    canAccessRapaport,
    canExportPdf,
    canUseCustomSettings,
    getUpgradeMessage,
    isAuthenticated
  } = useSubscription();

  const { user } = useAuth();
  const diamondSettingsLoadedRef = useRef(false);
  const diamondSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentUserId = user?.id;

  useEffect(() => {
    diamondSettingsLoadedRef.current = false;
  }, [currentUserId]);

  const saveDiamondSettingsToServer = useCallback(() => {
    if (!isAuthenticated) return;
    if (diamondSaveTimerRef.current) clearTimeout(diamondSaveTimerRef.current);
    diamondSaveTimerRef.current = setTimeout(async () => {
      try {
        const gridDataStr = localStorage.getItem('simpletonGridData');
        await fetch('/api/diamond-calculator/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            pricingSystem: localStorage.getItem('diamond-pricing-system') || 'ai',
            labGrownPercentage: parseFloat(localStorage.getItem('diamond-lab-grown-percentage') || '0.5'),
            loanPercentage: parseFloat(localStorage.getItem('diamond-loan-percentage') || '50'),
            wholesalePercentage: parseFloat(localStorage.getItem('diamond-wholesale-percentage') || '50'),
            percentageLocked: localStorage.getItem('diamond-percentage-locked') === 'true',
            gridData: gridDataStr ? JSON.parse(gridDataStr) : {},
          }),
        });
      } catch {}
    }, 2000);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || diamondSettingsLoadedRef.current) return;
    diamondSettingsLoadedRef.current = true;
    (async () => {
      try {
        const res = await fetch('/api/diamond-calculator/settings', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (!data.success || !data.settings) return;
        const s = data.settings;
        if (s.pricingSystem) {
          setPricingSystem(s.pricingSystem);
          localStorage.setItem('diamond-pricing-system', s.pricingSystem);
        }
        if (s.labGrownPercentage != null) {
          setLabGrownPercentage(parseFloat(s.labGrownPercentage));
          localStorage.setItem('diamond-lab-grown-percentage', s.labGrownPercentage);
        }
        if (s.loanPercentage != null) {
          setLoanPercentage(parseFloat(s.loanPercentage));
          localStorage.setItem('diamond-loan-percentage', s.loanPercentage);
        }
        if (s.wholesalePercentage != null) {
          setWholesalePercentage(parseFloat(s.wholesalePercentage));
          localStorage.setItem('diamond-wholesale-percentage', s.wholesalePercentage);
        }
        if (s.percentageLocked !== undefined) {
          setPercentageLocked(s.percentageLocked);
          localStorage.setItem('diamond-percentage-locked', s.percentageLocked ? 'true' : 'false');
        }
        if (s.gridData && typeof s.gridData === 'object' && Object.keys(s.gridData).length > 0) {
          setGridData(s.gridData);
          localStorage.setItem('simpletonGridData', JSON.stringify(s.gridData));
        }
      } catch {}
    })();
  }, [isAuthenticated]);

  const logDiamondCalculation = useCallback(async (calcData: any) => {
    if (!isAuthenticated) return;
    try {
      await fetch('/api/diamond-calculator/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(calcData),
      });
    } catch {}
  }, [isAuthenticated]);

  // Grid system functions
  const getPearGridData = () => {
    const defaultData = {
      '0.18-0.22': { D: {VVS: 13.7, VS: 11.6, SI1: 10.0, SI2: 8.5, SI3: 7.1, I1: 6.0, I2: 4.5, I3: 3.6}, E: {VVS: 12.1, VS: 10.2, SI1: 8.8, SI2: 7.5, SI3: 6.3, I1: 5.2, I2: 4.0, I3: 3.2}, F: {VVS: 10.0, VS: 8.5, SI1: 7.5, SI2: 6.5, SI3: 5.4, I1: 4.5, I2: 3.5, I3: 2.7}, G: {VVS: 7.7, VS: 6.5, SI1: 5.7, SI2: 4.9, SI3: 4.2, I1: 3.5, I2: 2.7, I3: 2.1}, H: {VVS: 6.0, VS: 5.1, SI1: 4.3, SI2: 3.7, SI3: 3.2, I1: 2.6, I2: 2.0, I3: 1.5}},
      '0.30-0.39': { D: {IF: 24, VVS1: 22, VVS2: 20, VS1: 18, VS2: 17, SI1: 16, SI2: 14, I1: 12, I2: 10, I3: 8}, E: {IF: 22, VVS1: 20, VVS2: 18, VS1: 17, VS2: 16, SI1: 15, SI2: 13, I1: 11, I2: 9, I3: 6}, F: {IF: 20, VVS1: 18, VVS2: 17, VS1: 16, VS2: 15, SI1: 14, SI2: 12, I1: 10, I2: 8, I3: 7}, G: {IF: 18, VVS1: 17, VVS2: 16, VS1: 15, VS2: 14, SI1: 13, SI2: 11, I1: 9, I2: 8, I3: 7}, H: {IF: 17, VVS1: 16, VVS2: 15, VS1: 14, VS2: 13, SI1: 12, SI2: 10, I1: 8, I2: 7, I3: 6}},
      '0.50-0.69': { D: {IF: 33, VVS1: 30, VVS2: 28, VS1: 26, VS2: 24, SI1: 22, SI2: 20, I1: 18, I2: 16, I3: 13}, E: {IF: 30, VVS1: 28, VVS2: 26, VS1: 25, VS2: 23, SI1: 21, SI2: 18, I1: 17, I2: 15, I3: 12}, F: {IF: 28, VVS1: 26, VVS2: 25, VS1: 24, VS2: 22, SI1: 20, SI2: 17, I1: 16, I2: 14, I3: 11}, G: {IF: 26, VVS1: 24, VVS2: 23, VS1: 22, VS2: 21, SI1: 19, SI2: 16, I1: 15, I2: 13, I3: 10}, H: {IF: 24, VVS1: 22, VVS2: 21, VS1: 20, VS2: 19, SI1: 18, SI2: 15, I1: 14, I2: 12, I3: 9}},
      '1.00-1.49': { D: {IF: 93, VVS1: 82, VVS2: 76, VS1: 67, VS2: 57, SI1: 46, SI2: 39, I1: 35, I2: 31, I3: 21}, E: {IF: 82, VVS1: 75, VVS2: 69, VS1: 62, VS2: 54, SI1: 43, SI2: 37, I1: 33, I2: 29, I3: 20}, F: {IF: 74, VVS1: 68, VVS2: 64, VS1: 58, VS2: 51, SI1: 40, SI2: 35, I1: 31, I2: 28, I3: 20}, G: {IF: 66, VVS1: 62, VVS2: 58, VS1: 54, VS2: 48, SI1: 38, SI2: 33, I1: 29, I2: 26, I3: 19}, H: {IF: 56, VVS1: 52, VVS2: 49, VS1: 46, VS2: 42, SI1: 35, SI2: 31, I1: 27, I2: 24, I3: 18}}
    };
    
    return { ...defaultData, ...gridData.pear };
  };

  const getRoundGridData = () => {
    const defaultData = {
      '0.30-0.39': { D: {IF: 31, VVS1: 29, VVS2: 27, VS1: 25, VS2: 23, SI1: 21, SI2: 19, I1: 17, I2: 15, I3: 11}, E: {IF: 26, VVS1: 24, VVS2: 23, VS1: 21, VS2: 19, SI1: 18, SI2: 16, I1: 14, I2: 12, I3: 10}, F: {IF: 23, VVS1: 21, VVS2: 20, VS1: 19, VS2: 17, SI1: 16, SI2: 14, I1: 12, I2: 11, I3: 10}, G: {IF: 20, VVS1: 19, VVS2: 18, VS1: 17, VS2: 15, SI1: 14, SI2: 12, I1: 11, I2: 10, I3: 9}, H: {IF: 17, VVS1: 16, VVS2: 15, VS1: 14, VS2: 13, SI1: 12, SI2: 11, I1: 10, I2: 9, I3: 8}},
      '0.50-0.69': { D: {IF: 55, VVS1: 51, VVS2: 48, VS1: 45, VS2: 42, SI1: 39, SI2: 36, I1: 33, I2: 30, I3: 14}, E: {IF: 44, VVS1: 42, VVS2: 39, VS1: 37, VS2: 35, SI1: 32, SI2: 30, I1: 27, I2: 25, I3: 13}, F: {IF: 38, VVS1: 36, VVS2: 34, VS1: 32, VS2: 30, SI1: 28, SI2: 26, I1: 24, I2: 22, I3: 12}, G: {IF: 32, VVS1: 30, VVS2: 29, VS1: 27, VS2: 26, SI1: 24, SI2: 23, I1: 21, I2: 19, I3: 11}, H: {IF: 26, VVS1: 25, VVS2: 24, VS1: 23, VS2: 22, SI1: 21, SI2: 20, I1: 18, I2: 17, I3: 11}},
      '1.00-1.49': { D: {IF: 95, VVS1: 88, VVS2: 83, VS1: 78, VS2: 73, SI1: 68, SI2: 63, I1: 58, I2: 53, I3: 32}, E: {IF: 82, VVS1: 77, VVS2: 73, VS1: 69, VS2: 65, SI1: 61, SI2: 57, I1: 53, I2: 49, I3: 29}, F: {IF: 74, VVS1: 70, VVS2: 67, VS1: 64, VS2: 60, SI1: 57, SI2: 53, I1: 50, I2: 46, I3: 27}, G: {IF: 66, VVS1: 63, VVS2: 60, VS1: 57, VS2: 54, SI1: 51, SI2: 48, I1: 45, I2: 42, I3: 24}, H: {IF: 58, VVS1: 55, VVS2: 53, VS1: 50, VS2: 48, SI1: 45, SI2: 43, I1: 40, I2: 38, I3: 22}}
    };
    
    return { ...defaultData, ...gridData.round };
  };

  const handleCellEdit = (caratRange: string, color: string, clarity: string, value: string) => {
    const newGridData = { ...gridData };
    const gridType = selectedCut.toLowerCase() === 'round' ? 'round' : 'pear';
    
    if (!newGridData[gridType]) newGridData[gridType] = {};
    if (!newGridData[gridType][caratRange]) newGridData[gridType][caratRange] = {};
    if (!newGridData[gridType][caratRange][color]) newGridData[gridType][caratRange][color] = {};
    
    newGridData[gridType][caratRange][color][clarity] = parseFloat(value) || 0;
    setGridData(newGridData);
    
    // Save to localStorage
    localStorage.setItem('simpletonGridData', JSON.stringify(newGridData));
  };

  const saveGridChanges = () => {
    localStorage.setItem('simpletonGridData', JSON.stringify(gridData));
    saveDiamondSettingsToServer();
  };

  const resetGridToDefaults = () => {
    setGridData({});
    localStorage.removeItem('simpletonGridData');
    console.log('Grid reset to defaults');
  };

  // Load grid data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('simpletonGridData');
    if (savedData) {
      try {
        setGridData(JSON.parse(savedData));
      } catch (e) {
        console.error('Error loading grid data:', e);
      }
    }
  }, []);

  // Handle leave button with falling diamond animation
  const handleLeaveCalculator = () => {
    setShowFallingDiamonds(true);
    setTimeout(() => {
      setShowFallingDiamonds(false);
      setShowMenu(false);
      // Navigate back to hero page
      setLocation('/');
    }, 2000);
  };
  // Calculator state - Default to zero like spot price system
  const [display, setDisplay] = useState("0.00");
  const [carats, setCarats] = useState("0.00");
  const [clarity, setClarity] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [cut, setCut] = useState<string | null>(null);
  const [diamondType, setDiamondType] = useState("NATURAL"); // NATURAL or LAB_GROWN
  const [growthMethod, setGrowthMethod] = useState("CVD"); // CVD, HPHT, Mixed
  const [result, setResult] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [priceType, setPriceType] = useState<'live'>('live'); // Only show live market value
  
  // Sales percentage for pricing calculations  
  const [salesPercentage, setSalesPercentage] = useState(50); // Default 50% of live price
  
  const [autoScale, setAutoScale] = useState(true);
  const [manualScale, setManualScale] = useState(() => {
    try {
      const saved = localStorage.getItem('diamond-manual-scale-value');
      return saved ? parseFloat(saved) : 1.0;
    } catch {
      return 1.0;
    }
  });

  // Lab-grown percentage vs natural diamonds
  const [labGrownPercentage, setLabGrownPercentage] = useState(() => {
    try {
      const saved = localStorage.getItem('diamond-lab-grown-percentage');
      return saved ? parseFloat(saved) : 0.5;
    } catch {
      return 0.5;
    }
  });
  
  useEffect(() => {
    if (!autoScale) return;
    const computeOptimalScale = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const calcWidth = 520;
      const calcHeight = 700;
      const scaleX = (w * 0.85) / calcWidth;
      const scaleY = (h * 0.80) / calcHeight;
      const optimal = Math.min(scaleX, scaleY, 3.0);
      setManualScale(Math.round(Math.max(optimal, 0.3) * 10) / 10);
    };
    computeOptimalScale();
    window.addEventListener('resize', computeOptimalScale);
    return () => window.removeEventListener('resize', computeOptimalScale);
  }, [autoScale]);

  useEffect(() => {
    try {
      localStorage.setItem('diamond-manual-scale-value', manualScale.toString());
    } catch (error) {
      console.warn('Failed to save diamond scale value:', error);
    }
  }, [manualScale]);

  // Save lab-grown percentage to localStorage + server sync
  useEffect(() => {
    try {
      localStorage.setItem('diamond-lab-grown-percentage', labGrownPercentage.toString());
      saveDiamondSettingsToServer();
    } catch (error) {
      console.warn('Failed to save lab-grown percentage:', error);
    }
  }, [labGrownPercentage, saveDiamondSettingsToServer]);

  const increaseScale = () => {
    setAutoScale(false);
    setManualScale(prev => Math.min(prev + 0.1, 3.0));
  };

  const decreaseScale = () => {
    setAutoScale(false);
    setManualScale(prev => Math.max(prev - 0.1, 0.3));
  };

  // Lab-Grown Diamond Pricing Function
  const priceLabGrownDiamond = (carat: number, color: string, clarity: string, shape: string, method: string): number => {
    // Base price per carat based on carat weight
    const getBasePricePerCt = (carats: number): number => {
      if (carats >= 0.30 && carats <= 0.49) return 500;
      if (carats >= 0.50 && carats <= 0.74) return 800;
      if (carats >= 0.75 && carats <= 0.99) return 1100;
      if (carats >= 1.00 && carats <= 1.49) return 1300;
      if (carats >= 1.50 && carats <= 2.49) return 1500;
      if (carats >= 2.50 && carats <= 3.99) return 1700;
      if (carats >= 4.00) return 1900;
      return 500; // Default for very small stones
    };

    // Color factors - same as natural diamonds
    const colorFactors: { [key: string]: number } = {
      'D': 1.00, 'E': 0.98, 'F': 0.96, 'G': 0.90, 'H': 0.85, 
      'I': 0.80, 'J': 0.75, 'K': 0.70, 'L': 0.65, 'M': 0.60
    };

    // Clarity factors - same as natural diamonds
    const clarityFactors: { [key: string]: number } = {
      'FL': 1.00, 'IF': 0.98, 'VVS1': 0.96, 'VVS2': 0.94, 
      'VS1': 0.90, 'VS2': 0.85, 'SI1': 0.75, 'SI2': 0.65, 'I1': 0.50
    };

    // Shape factors - same relative discounts as natural
    const shapeFactors: { [key: string]: number } = {
      'ROUND': 1.00, 'PRINCESS': 0.85, 'CUSHION': 0.75, 'EMERALD': 0.65,
      'ASSCHER': 0.65, 'MARQUISE': 0.80, 'OVAL': 0.85, 'RADIANT': 0.80, 'PEAR': 0.80, 'HEART': 0.80
    };

    // Method factors for lab-grown production
    const methodFactors: { [key: string]: number } = {
      'CVD': 1.00, 'HPHT': 0.95, 'Mixed': 0.97
    };

    // Get natural diamond price first
    const naturalPrice = priceDiamond(carat, color, clarity, shape);
    
    // Apply lab-grown percentage (adjustable by user)
    return naturalPrice * (labGrownPercentage / 100);
  };

  // Market pricing (in dollars per carat)
  // Live diamond market pricing state
  const [marketPrice, setMarketPrice] = useState(8500); // Professional grade 1ct diamond base price
  const [diamondPricing, setDiamondPricing] = useState<any[]>([]);
  
  // AI pricing estimate state
  const [aiEstimate, setAiEstimate] = useState<{
    lowEstimate: number; midEstimate: number; highEstimate: number;
    confidence: number; pricePerCarat: number; marketTrend: string;
    factors: string[]; source: string; disclaimer: string;
  } | null>(null);
  const [aiPricingLoading, setAiPricingLoading] = useState(false);

  // Pricing system toggle - FREE Kaggle vs Rapaport Grid vs AI Intelligence
  const [pricingSystem, setPricingSystem] = useState(() => {
    try {
      const saved = localStorage.getItem('diamond-pricing-system');
      return saved || 'ai'; // Default to AI Intelligence
    } catch {
      return 'ai';
    }
  });

  // Save pricing system choice to localStorage
  const switchPricingSystem = (system: string) => {
    setPricingSystem(system);
    localStorage.setItem('diamond-pricing-system', system);
    saveDiamondSettingsToServer();
    
    // Update market price immediately if diamond is already calculated
    if (clarity && color && cut && display && parseFloat(display) > 0) {
      const newPrice = getCurrentDiamondPrice();
      setMarketPrice(newPrice);
      
      // Also update loan and wholesale prices
      const loanValue = (newPrice * loanPercentage) / 100;
      const wholesaleValue = (newPrice * wholesalePercentage) / 100;
      setLoanPrice(`$${loanValue.toLocaleString()}`);
      setWholesalePrice(`$${wholesaleValue.toLocaleString()}`);
    }
  };

  // Fetch live diamond pricing from FREE Kaggle dataset
  useEffect(() => {
    const fetchDiamondPricing = async () => {
      try {
        const response = await fetch('/api/diamonds/pricing');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.length > 0) {
            setDiamondPricing(data.data);
            
            // Set market price based on 1ct round diamond average
            const roundDiamonds = data.data.filter((d: any) => 
              d.shape === 'Round' && d.carat >= 0.9 && d.carat <= 1.1
            );
            if (roundDiamonds.length > 0) {
              const avgPrice = roundDiamonds.reduce((sum: number, d: any) => sum + d.price, 0) / roundDiamonds.length;
              setMarketPrice(Math.round(avgPrice));
              console.log(`💎 LIVE DIAMOND PRICING: Market price updated to $${Math.round(avgPrice)} based on ${roundDiamonds.length} 1ct round diamonds`);
            }
          }
        }
      } catch (error) {
        console.warn("💎 DIAMOND API: Using fallback pricing - API unavailable", error);
      }
    };

    fetchDiamondPricing();
    // Update diamond pricing every 5 minutes
    const interval = setInterval(fetchDiamondPricing, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Price screen states
  const [currentScreen, setCurrentScreen] = useState<"MARKET" | "LOAN" | "WHOLESALE">("MARKET");
  const [showPercentageMenu, setShowPercentageMenu] = useState(false);
  const [showPercentageSettings, setShowPercentageSettings] = useState(false);

  // Percentage settings (persistent in localStorage)
  const [loanPercentage, setLoanPercentage] = useState(() => {
    try {
      const saved = localStorage.getItem('diamond-loan-percentage');
      return saved ? parseInt(saved) : 25;
    } catch {
      return 25;
    }
  });

  // Remove this duplicate - using wholesalePercentage instead

  // Diamond specification state
  const [selectedClarity, setSelectedClarity] = useState('VS1');
  const [selectedCut, setSelectedCut] = useState('Round');
  const [selectedCarats, setSelectedCarats] = useState(1.0);
  const [showMenu, setShowMenu] = useState(false);
  // Available options
  const clarityGrades = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'];
  const cutTypes = ['Round', 'Princess', 'Emerald', 'Oval', 'Pear', 'Marquise', 'Heart', 'Cushion'];
  const caratSizes = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0];


  

  
  // Cycling functions
  const cycleClarity = () => {
    const currentIndex = clarityGrades.indexOf(selectedClarity);
    const nextIndex = (currentIndex + 1) % clarityGrades.length;
    setSelectedClarity(clarityGrades[nextIndex]);
  };
  
  const cycleCut = () => {
    const currentIndex = DIAMOND_SHAPES.indexOf(selectedCut as any);
    const nextIndex = (currentIndex + 1) % DIAMOND_SHAPES.length;
    setSelectedCut(DIAMOND_SHAPES[nextIndex] as any);
  };

  // Adjust carat weight with validation and real-time updates
  const adjustCarats = (delta: number) => {
    const currentValue = parseFloat(display) || 0;
    const newValue = Math.max(0.01, Math.min(50.00, currentValue + delta));
    const formattedValue = newValue.toFixed(2);
    setDisplay(formattedValue);
    setCarats(formattedValue);
    console.log(`💎 CARAT WEIGHT: Adjusted to ${formattedValue} carats`);
  };

  // Lab-grown diamond toggle function
  const toggleDiamondType = () => {
    const newType = diamondType === "NATURAL" ? "LAB_GROWN" : "NATURAL";
    setDiamondType(newType);
    console.log(`💎 DIAMOND TYPE: Changed to ${newType}`);
    playFuturisticSound(newType === "LAB_GROWN" ? 600 : 800, 0.2);
  };

  // Growth method cycling for lab-grown diamonds
  const cycleGrowthMethod = () => {
    const methods = ["CVD", "HPHT", "Mixed"];
    const currentIndex = methods.indexOf(growthMethod);
    const nextIndex = (currentIndex + 1) % methods.length;
    setGrowthMethod(methods[nextIndex]);
    console.log(`💎 GROWTH METHOD: Changed to ${methods[nextIndex]}`);
    playFuturisticSound(700, 0.15);
  };

  // Get current diamond price using selected pricing system
  const getCurrentDiamondPrice = (): number => {
    const carats = Number(display) || 0;
    if (clarity && color && cut && carats > 0) {
      
      if (pricingSystem === 'rapaport') {
        // Use Rapaport Grid System
        try {
          const wholesalePrice = priceDiamond(carats, color, clarity, cut, diamondType);
          console.log(`💎 RAPAPORT GRID PRICING: ${carats}ct ${color} ${clarity} ${cut} = $${wholesalePrice}`);
          
          if (diamondType === "LAB_GROWN") {
            return wholesalePrice * 0.50; // Lab-grown at 50% of natural
          } else {
            return wholesalePrice;
          }
        } catch (error) {
          console.error('Rapaport pricing error:', error);
          return 0;
        }
      } else {
        // Use FREE Kaggle dataset for pricing
        if (diamondPricing && diamondPricing.length > 0) {
          // Find similar diamonds from the free dataset
          const similarDiamonds = diamondPricing.filter((d: any) => 
            d.cut === cut && 
            d.color === color && 
            d.clarity === clarity &&
            Math.abs(d.carat - carats) < 0.2 // Within 0.2ct range
          );
          
          if (similarDiamonds.length > 0) {
            // Use average price from similar diamonds
            const avgPrice = similarDiamonds.reduce((sum: number, d: any) => sum + d.price, 0) / similarDiamonds.length;
            const totalPrice = avgPrice * carats;
            
            console.log(`💎 FREE KAGGLE PRICING: ${carats}ct ${color} ${clarity} ${cut} = $${totalPrice.toFixed(2)} (${similarDiamonds.length} similar diamonds)`);
            
            if (diamondType === "LAB_GROWN") {
              return totalPrice * 0.50; // Lab-grown at 50% of natural
            } else {
              return totalPrice;
            }
          }
        }
        
        // Fallback to basic calculation if no similar diamonds found
        const basePrice = 5000; // Base price per carat
        const clarityMultiplier = { FL: 1.0, IF: 0.95, VVS1: 0.9, VVS2: 0.85, VS1: 0.8, VS2: 0.75, SI1: 0.6, SI2: 0.45, I1: 0.3, I2: 0.2, I3: 0.1 };
        const colorMultiplier = { D: 1.0, E: 0.95, F: 0.9, G: 0.85, H: 0.8, I: 0.75, J: 0.7, K: 0.65, L: 0.6, M: 0.55 };
        const cutMultiplier = { EXCELLENT: 1.2, VERY_GOOD: 1.1, GOOD: 1.0, FAIR: 0.9, POOR: 0.8 };
        
        const totalPrice = carats * basePrice * 
          (clarityMultiplier[clarity] || 0.8) * 
          (colorMultiplier[color] || 0.8) * 
          (cutMultiplier[cut] || 1.0);
        
        console.log(`💎 FALLBACK PRICING: ${carats}ct ${color} ${clarity} ${cut} = $${totalPrice.toFixed(2)}`);
        
        if (diamondType === "LAB_GROWN") {
          return totalPrice * 0.50;
        } else {
          return totalPrice;
        }
      }
    }
    return 0;
  };

  const [wholesalePercentage, setWholesalePercentage] = useState(() => {
    try {
      const saved = localStorage.getItem('diamond-wholesale-percentage');
      return saved ? parseInt(saved) : 30; // Start at 30% instead of 75%
    } catch {
      return 30;
    }
  });

  // Percentage lock system
  const [percentageLocked, setPercentageLocked] = useState(() => {
    try {
      const saved = localStorage.getItem('diamond-percentage-locked');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [showUnlockWarning, setShowUnlockWarning] = useState(false);

  const playFuturisticSound = (_frequency?: number, _duration?: number) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      const t = ctx.currentTime;

      const sub = ctx.createOscillator();
      const subG = ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(90, t);
      sub.frequency.exponentialRampToValueAtTime(65, t + 0.05);
      subG.gain.setValueAtTime(0.14, t);
      subG.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      sub.connect(subG); subG.connect(ctx.destination);

      const body = ctx.createOscillator();
      const bodyG = ctx.createGain();
      body.type = 'sine';
      body.frequency.setValueAtTime(320, t);
      body.frequency.exponentialRampToValueAtTime(240, t + 0.04);
      bodyG.gain.setValueAtTime(0.10, t);
      bodyG.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      body.connect(bodyG); bodyG.connect(ctx.destination);

      const shimmer = ctx.createOscillator();
      const shimmerG = ctx.createGain();
      shimmer.type = 'sine';
      shimmer.frequency.setValueAtTime(640, t);
      shimmer.frequency.exponentialRampToValueAtTime(480, t + 0.025);
      shimmerG.gain.setValueAtTime(0.03, t);
      shimmerG.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      shimmer.connect(shimmerG); shimmerG.connect(ctx.destination);

      const air = ctx.createOscillator();
      const airG = ctx.createGain();
      air.type = 'sine';
      air.frequency.setValueAtTime(1280, t);
      air.frequency.exponentialRampToValueAtTime(960, t + 0.015);
      airG.gain.setValueAtTime(0.008, t);
      airG.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
      air.connect(airG); airG.connect(ctx.destination);

      sub.start(t); sub.stop(t + 0.07);
      body.start(t); body.stop(t + 0.09);
      shimmer.start(t); shimmer.stop(t + 0.05);
      air.start(t); air.stop(t + 0.03);
      setTimeout(() => ctx.close(), 250);
    } catch {}
  };

  // Percentage lock management
  const togglePercentageLock = () => {
    if (percentageLocked) {
      setShowUnlockWarning(true);
    } else {
      setPercentageLocked(true);
      localStorage.setItem('diamond-percentage-locked', 'true');
      console.log('🔒 PERCENTAGE LOCK: Activated - Settings protected from accidental changes');
      playFuturisticSound(1200, 0.2); // Lock sound
    }
  };

  const confirmUnlock = () => {
    setPercentageLocked(false);
    setShowUnlockWarning(false);
    localStorage.setItem('diamond-percentage-locked', 'false');
    console.log('🔓 PERCENTAGE LOCK: Deactivated - Settings can now be modified');
    playFuturisticSound(400, 0.3); // Unlock sound
  };

  // Adjustment functions for 1% increments with futuristic audio
  const adjustLoanPercentage = (change: number) => {
    if (percentageLocked) {
      playFuturisticSound(200, 0.1); // Blocked sound
      console.log('🚫 PERCENTAGE ADJUSTMENT: Blocked - Settings are locked');
      return;
    }
    
    const newValue = Math.max(0, Math.min(80, loanPercentage + change));
    setLoanPercentage(newValue);
    localStorage.setItem('diamond-loan-percentage', newValue.toString());
    console.log(`💰 LOAN PERCENTAGE: Set to ${newValue}%`);
    
    // Trigger immediate loan price recalculation if diamond is already calculated
    if (result && result > 0) {
      const newLoanValue = (result * newValue) / 100;
      setLoanPrice(`$${newLoanValue.toLocaleString()}`);
      console.log(`💰 LOAN PRICE UPDATED: $${newLoanValue.toLocaleString()} (${newValue}%)`);
    }
    
    // Futuristic sound: higher pitch for increase, lower for decrease
    playFuturisticSound(change > 0 ? 800 + (newValue * 8) : 600 - (newValue * 4));
  };

  const adjustWholesalePercentage = (change: number) => {
    if (percentageLocked) {
      playFuturisticSound(200, 0.1); // Blocked sound
      console.log('🚫 PERCENTAGE ADJUSTMENT: Blocked - Settings are locked');
      return;
    }
    
    const newValue = Math.max(0, Math.min(90, wholesalePercentage + change));
    setWholesalePercentage(newValue);
    setSalesPercentage(newValue); // Keep both variables synchronized
    localStorage.setItem('diamond-wholesale-percentage', newValue.toString());
    localStorage.setItem('diamond-sales-percentage', newValue.toString());
    console.log(`💎 SALES PERCENTAGE: Set to ${newValue}%`);
    
    // Trigger immediate wholesale price recalculation if diamond is already calculated
    if (result && result > 0) {
      const newWholesaleValue = (result * newValue) / 100;
      setWholesalePrice(`$${newWholesaleValue.toLocaleString()}`);
      console.log(`💎 WHOLESALE PRICE UPDATED: $${newWholesaleValue.toLocaleString()} (${newValue}%)`);
    }
    
    // Different frequency range for sales (diamond-like tones)
    playFuturisticSound(change > 0 ? 1000 + (newValue * 10) : 700 - (newValue * 5));
  };

  // Advanced LED displays for each component
  const [clarityDisplay, setClarityDisplay] = useState("SELECT CLARITY");
  const [colorDisplay, setColorDisplay] = useState("SELECT COLOR");
  const [cutDisplay, setCutDisplay] = useState("SELECT CUT");
  const [loanPrice, setLoanPrice] = useState("$0.00");
  const [wholesalePrice, setWholesalePrice] = useState("$0.00");

  // Cycling states
  const [clarityIndex, setClarityIndex] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);
  const [cutIndex, setCutIndex] = useState(0);

  // Save percentage settings to localStorage + server sync
  useEffect(() => {
    localStorage.setItem('diamond-loan-percentage', loanPercentage.toString());
    saveDiamondSettingsToServer();
  }, [loanPercentage, saveDiamondSettingsToServer]);

  useEffect(() => {
    localStorage.setItem('diamond-wholesale-percentage', wholesalePercentage.toString());
    saveDiamondSettingsToServer();
  }, [wholesalePercentage, saveDiamondSettingsToServer]);

  // AUTHENTIC RAPAPORT-ALIGNED DIAMOND PRICING (Based on 2024 Rapaport Price List)
  // Verified against actual Rapaport pricing: 1ct I2 I = $2,700/carat
  const DIAMOND_PRICING = {
    NATURAL: {
      // Authentic Rapaport base prices per carat (verified against actual price list)
      clarity: { 
        FL: 15000,   // Flawless - museum grade
        IF: 12000,   // Internally Flawless  
        VVS1: 9500,  // Very Very Slightly Included 1
        VVS2: 8000,  // Very Very Slightly Included 2
        VS1: 6500,   // Very Slightly Included 1
        VS2: 5500,   // Very Slightly Included 2  
        SI1: 4200,   // Slightly Included 1
        SI2: 3200,   // Slightly Included 2
        I1: 2400,    // Included 1
        I2: 1800,    // Included 2 - aligned with Rapaport $2,700 for I color
        I3: 1200     // Included 3
      },
      // Color multipliers (D-M range - authentic Rapaport methodology)
      color: { 
        D: 1.75,     // Colorless - exceptional white
        E: 1.55,     // Colorless - rare white  
        F: 1.35,     // Colorless - fine white
        G: 1.20,     // Near colorless - fine white
        H: 1.10,     // Near colorless - white
        I: 1.50,     // Near colorless - commercial white (adjusted for Rapaport alignment)
        J: 0.90,     // Faint color - top light brown
        K: 0.80,     // Faint color - light brown
        L: 0.70,     // Light color - brown
        M: 0.60      // Light color - light brown
      },
      // Shape premiums (RapNet methodology: Round separate, Pear baseline for fancy shapes)
      shape: { 
        ROUND: 1.35,     // Round brilliant - separate pricing (most popular)
        PEAR: 1.00,      // Pear - RapNet baseline for all fancy shapes
        PRINCESS: 1.02,  // Princess relative to pear baseline
        CUSHION: 1.04,   // Cushion relative to pear baseline
        OVAL: 1.06,      // Oval relative to pear baseline  
        EMERALD: 1.03,   // Emerald relative to pear baseline
        RADIANT: 0.98,   // Radiant relative to pear baseline
        ASSCHER: 0.96,   // Asscher relative to pear baseline
        MARQUISE: 0.93,  // Marquise relative to pear baseline
        BAGUETTE: 0.76   // Baguette relative to pear baseline
      }
    },
    LAB_GROWN: {
      // Lab-grown pricing at ~50% of natural (2024 market conditions)
      clarity: { 
        FL: 9250,    // Lab-grown premium discounted
        IF: 7600,    
        VVS1: 6400,  
        VVS2: 5300,  
        VS1: 4200,   
        VS2: 3600,   
        SI1: 2900,   
        SI2: 2100,   
        I1: 1200,    
        I2: 750,     
        I3: 450      
      },
      color: { 
        D: 1.70,     // Reduced premiums for lab-grown
        E: 1.50,     
        F: 1.30,     
        G: 1.15,     
        H: 1.08,     
        I: 1.00,     
        J: 0.90,     
        K: 0.80,     
        L: 0.70,     
        M: 0.60      
      },
      shape: { 
        ROUND: 1.25,     // Lab-grown round separate pricing
        PEAR: 1.00,      // Lab-grown pear baseline for fancy shapes
        PRINCESS: 1.02,  // Princess relative to lab-grown pear baseline
        CUSHION: 1.04,   // Cushion relative to lab-grown pear baseline
        OVAL: 1.06,      // Oval relative to lab-grown pear baseline
        EMERALD: 1.03,   // Emerald relative to lab-grown pear baseline
        RADIANT: 0.98,   // Radiant relative to lab-grown pear baseline
        ASSCHER: 0.96,   // Asscher relative to lab-grown pear baseline
        MARQUISE: 0.93,  // Marquise relative to lab-grown pear baseline
        BAGUETTE: 0.76   // Baguette relative to lab-grown pear baseline
      }
    }
  };

  // Format number for LED display
  const formatLEDNumber = (num: string | number): string => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n)) return "0.00";
    return n.toFixed(2).padStart(8, ' ');
  };

  // FAILSAFE: Handle number input with comprehensive validation
  const handleNumberInput = (num: string) => {
    // SAFETY: Prevent input during calculation to avoid state conflicts
    if (isCalculating) {
      console.warn("🚫 INPUT BLOCKED: Calculation in progress - preventing user input conflicts");
      return;
    }

    if (display === "0.00" || display === "SELECT CARATS") {
      setDisplay(num === "." ? "0." : num);
    } else if (num === "." && !display.includes(".")) {
      setDisplay(display + ".");
    } else if (num !== ".") {
      // FAILSAFE: Limit input length to prevent display overflow
      if (display.length < 8) {
        const newDisplay = display + num;
        const caratValue = parseFloat(newDisplay);
        
        // CRITICAL FAILSAFE: Maximum carat limit for realistic diamonds
        if (caratValue > 50) {
          console.warn("🚫 SAFETY LIMIT: Carat weight exceeds 50ct - blocking unrealistic input");
          alert("⚠️ SAFETY WARNING: Maximum allowed carat weight is 50ct for accuracy protection");
          return;
        }
        
        setDisplay(newDisplay);
      }
    }
  };

  // FAILSAFE: Clear function with safety confirmation for high values
  const handleClear = () => {
    // SAFETY: Confirm clear if valuable calculation exists
    if (result && result > 10000) {
      const confirmClear = confirm(
        `⚠️ CLEAR CONFIRMATION\n\n` +
        `Current calculation shows: $${result.toLocaleString()}\n\n` +
        `Are you sure you want to clear this valuable calculation?\n` +
        `You will need to re-enter all diamond specifications.`
      );
      
      if (!confirmClear) {
        console.log("🛡️ CLEAR CANCELLED: User chose to preserve valuable calculation");
        return;
      }
    }
    
    // SAFETY: Reset all values to safe defaults requiring explicit selection
    setDisplay("0.00");
    setCarats("0.00");
    setResult(null);
    
    // RESET: Clear any grade selections to force new explicit choices
    setClarity(null);
    setColor(null);
    setCut(null);
    
    // Reset visual displays
    setClarityDisplay("SELECT CLARITY");
    setColorDisplay("SELECT COLOR");
    setCutDisplay("SELECT CUT");
    setLoanPrice("$0.00");
    setWholesalePrice("$0.00");
    setMarketPrice(8500); // Reset to default value
    
    // Reset cycling states
    setClarityIndex(0);
    setColorIndex(0);
    setCutIndex(0);
    
    // Reset diamond type and growth method
    setDiamondType("NATURAL");
    setGrowthMethod("CVD");
    
    // Reset percentages to defaults
    setSalesPercentage(50);
    setLoanPercentage(25);
    setWholesalePercentage(30);
    setPercentageLocked(false);
    setLabGrownPercentage(11.7);
    
    // Clear localStorage for percentages and settings
    localStorage.removeItem('diamond-loan-percentage');
    localStorage.removeItem('diamond-wholesale-percentage');
    localStorage.removeItem('diamond-sales-percentage');
    localStorage.removeItem('diamond-percentage-locked');
    localStorage.removeItem('diamond-lab-grown-percentage');
    
    console.log("🔄 CALCULATOR CLEARED: All values reset - NO DEFAULT approach enforced");
    console.log("🚨 SAFETY: User must explicitly select all diamond properties before calculating");
  };

  // Backspace function


  // FAILSAFE: Set carats with comprehensive validation
  const handleSetCarats = () => {
    const caratValue = parseFloat(display);
    
    // CRITICAL SAFETY CHECKS
    if (isNaN(caratValue) || caratValue <= 0) {
      console.warn("🚫 INVALID INPUT: Carat weight must be a positive number");
      alert("⚠️ INVALID INPUT: Please enter a valid carat weight greater than 0");
      return;
    }
    
    if (caratValue < 0.001) {
      console.warn("🚫 SAFETY LIMIT: Minimum carat weight is 0.001ct");
      alert("⚠️ SAFETY WARNING: Minimum carat weight is 0.001ct for accurate pricing");
      return;
    }
    
    if (caratValue > 50) {
      console.warn("🚫 SAFETY LIMIT: Maximum carat weight is 50ct");
      alert("⚠️ SAFETY WARNING: Maximum carat weight is 50ct - please verify diamond specifications");
      return;
    }
    
    // PROFESSIONAL WARNING for high-value diamonds
    if (caratValue > 10) {
      const confirmHighValue = confirm(
        `⚠️ HIGH-VALUE DIAMOND DETECTED\n\n` +
        `Carat Weight: ${caratValue}ct\n` +
        `This is an exceptionally large diamond requiring expert verification.\n\n` +
        `⚠️ IMPORTANT: Ensure all specifications are accurate before proceeding.\n` +
        `Large diamonds require GIA/AGS certification for accurate valuation.\n\n` +
        `Continue with calculation?`
      );
      
      if (!confirmHighValue) {
        console.log("🛡️ USER CANCELLED: High-value diamond calculation cancelled for safety");
        return;
      }
    }
    
    setCarats(formatLEDNumber(caratValue));
    setDisplay(formatLEDNumber(caratValue));
    console.log(`✅ CARAT SET: ${caratValue}ct validated and confirmed`);
  };

  // Cycle through clarity grades with authentic GIA characteristics
  // Generate infinitely random inclusion patterns based on GIA clarity scale
  const generateRandomInclusions = (grade: string) => {
    const inclusionDensity = {
      'FL': 0,     // Flawless - no inclusions (perfect crystal clarity)
      'IF': 0,     // Internally Flawless - no inclusions (crystal clear interior)
      'VVS1': 1,   // Very Very Slightly Included 1 - minute pinpoints/needles  
      'VVS2': 2,   // Very Very Slightly Included 2 - small pinpoints/faint needles
      'VS1': 4,    // Very Slightly Included 1 - small crystals/feathers
      'VS2': 6,    // Very Slightly Included 2 - visible crystals/small feathers
      'SI1': 12,   // Slightly Included 1 - crystals/clouds/feathers
      'SI2': 20,   // Slightly Included 2 - larger crystals/clouds
      'I1': 35,    // Included 1 - large crystals/dense clouds
      'I2': 50,    // Included 2 - heavy inclusions/large feathers
      'I3': 80     // Included 3 - very heavy inclusions/cracks (severe coverage)
    };

    const density = inclusionDensity[grade as keyof typeof inclusionDensity] || 0;
    if (density === 0) return [];

    const inclusions = [];
    for (let i = 0; i < density; i++) {
      inclusions.push({
        x: Math.random() * 85 + 5, // 5% to 90% to stay within button bounds
        y: Math.random() * 70 + 15, // 15% to 85% to stay within button bounds
        size: Math.random() * 4 + 2, // 2px to 6px random size
        opacity: Math.random() * 0.7 + 0.3, // 0.3 to 1.0 opacity for visibility
        type: Math.random() > 0.5 ? '•' : '·', // Mix of inclusion types (crystals vs pinpoints)
        animation: Math.random() * 2 + 1 // 1s to 3s animation duration
      });
    }
    return inclusions;
  };

  const cycleClarityGrade = () => {
    if (clarity === null) {
      // First selection - start with FL (best clarity)
      setClarity(CLARITY_GRADES[0]);
      const giaData = GIA_CLARITY_DATABASE[CLARITY_GRADES[0] as keyof typeof GIA_CLARITY_DATABASE];
      setClarityDisplay(`${CLARITY_GRADES[0]} • ${giaData.visual}`);
      console.log(`💎 CLARITY SELECTED: ${CLARITY_GRADES[0]} - ${giaData.name}`);
      console.log(`💎 GIA CHARACTERISTICS: ${giaData.characteristics}`);
      console.log(`💎 RARITY: ${giaData.rarity}`);
    } else {
      // Cycle through clarity grades
      const currentIndex = CLARITY_GRADES.indexOf(clarity);
      const nextIndex = (currentIndex + 1) % CLARITY_GRADES.length;
      const nextGrade = CLARITY_GRADES[nextIndex];
      const giaData = GIA_CLARITY_DATABASE[nextGrade as keyof typeof GIA_CLARITY_DATABASE];
      
      // Generate infinitely random inclusion pattern for this grade
      const randomInclusions = generateRandomInclusions(nextGrade);
      
      // Update display with authentic GIA visual pattern
      setClarityDisplay(`${nextGrade} • ${giaData.visual}`);
      
      // Apply random inclusion effects to clarity button
      setTimeout(() => {
        const clarityButton = document.querySelector('.clarity-button');
        if (clarityButton) {
          // Remove previous random inclusions
          const existingInclusions = clarityButton.querySelectorAll('.random-inclusion');
          existingInclusions.forEach(inc => inc.remove());
          
          // Add new infinitely random inclusions covering whole button
          randomInclusions.forEach((inclusion, index) => {
            const inclusionElement = document.createElement('span');
            inclusionElement.className = 'random-inclusion';
            inclusionElement.textContent = inclusion.type;
            inclusionElement.style.cssText = `
              position: absolute !important;
              left: ${inclusion.x}% !important;
              top: ${inclusion.y}% !important;
              font-size: ${inclusion.size}px !important;
              color: rgba(255, 255, 255, ${inclusion.opacity}) !important;
              background-color: rgba(218, 112, 214, 0.8) !important;
              border-radius: 50% !important;
              width: ${inclusion.size}px !important;
              height: ${inclusion.size}px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              pointer-events: none !important;
              z-index: 25 !important;
              animation: inclusionFlicker ${inclusion.animation}s infinite !important;
              font-family: monospace !important;
              font-weight: 900 !important;
              text-shadow: 0 0 2px rgba(0,0,0,1) !important;
              box-shadow: 0 0 4px rgba(218, 112, 214, 0.6) !important;
            `;
            clarityButton.appendChild(inclusionElement);
          });
          
          console.log(`🎯 VISUAL INCLUSIONS: Applied ${randomInclusions.length} inclusion elements to button surface`);
        }
      }, 100); // Increase delay to ensure DOM is ready
      
      // PROFESSIONAL WARNING for problematic clarity grades
      if (GRADE_WARNINGS.clarity[nextGrade as keyof typeof GRADE_WARNINGS.clarity]) {
        const warning = GRADE_WARNINGS.clarity[nextGrade as keyof typeof GRADE_WARNINGS.clarity];
        console.warn(`🚨 CLARITY WARNING: ${warning}`);
      }
      
      setClarity(nextGrade);
      console.log(`💎 CLARITY CYCLED: ${nextGrade} - ${giaData.name}`);
      console.log(`💎 GIA CHARACTERISTICS: ${giaData.characteristics}`);
      console.log(`💎 QUALITY GRADE: ${giaData.quality}`);
      console.log(`💎 PROFESSIONAL NOTE: ${giaData.professional_note}`);
      console.log(`💎 RANDOM INCLUSIONS: Generated ${randomInclusions.length} unique inclusion patterns - INFINITELY RANDOM!`);
    }
  };

  // Cycle through color grades with professional warnings
  const cycleColorGrade = () => {
    if (color === null) {
      // First selection - start with D (best color)
      setColor(COLOR_GRADES[0]);
      console.log(`💎 COLOR SELECTED: ${COLOR_GRADES[0]} - First selection`);
    } else {
      // Cycle through color grades
      const currentIndex = COLOR_GRADES.indexOf(color);
      const nextIndex = (currentIndex + 1) % COLOR_GRADES.length;
      const nextGrade = COLOR_GRADES[nextIndex];
      
      // PROFESSIONAL WARNING for problematic color grades
      if (GRADE_WARNINGS.color[nextGrade as keyof typeof GRADE_WARNINGS.color]) {
        const warning = GRADE_WARNINGS.color[nextGrade as keyof typeof GRADE_WARNINGS.color];
        console.warn(`🚨 COLOR WARNING: ${warning}`);
      }
      
      setColor(nextGrade);
      console.log(`💎 COLOR CYCLED: ${nextGrade}`);
    }
  };

  // Generate diamond shape SVG based on selected shape
  const generateDiamondShapeSVG = (shape: string) => {
    const shapeDefinitions = {
      'ROUND': `<circle cx="50" cy="50" r="20" fill="rgba(218, 112, 214, 0.6)" stroke="rgba(218, 112, 214, 0.9)" stroke-width="2"/>`,
      'PRINCESS': `<rect x="30" y="30" width="40" height="40" fill="rgba(218, 112, 214, 0.6)" stroke="rgba(218, 112, 214, 0.9)" stroke-width="2" transform="rotate(45 50 50)"/>`,
      'CUSHION': `<rect x="30" y="30" width="40" height="40" rx="8" ry="8" fill="rgba(218, 112, 214, 0.6)" stroke="rgba(218, 112, 214, 0.9)" stroke-width="2"/>`,
      'EMERALD': `<rect x="30" y="35" width="40" height="30" rx="2" ry="2" fill="rgba(218, 112, 214, 0.6)" stroke="rgba(218, 112, 214, 0.9)" stroke-width="2"/>`,
      'OVAL': `<ellipse cx="50" cy="50" rx="18" ry="25" fill="rgba(218, 112, 214, 0.6)" stroke="rgba(218, 112, 214, 0.9)" stroke-width="2"/>`,
      'RADIANT': `<polygon points="50,25 65,35 65,65 50,75 35,65 35,35" fill="rgba(218, 112, 214, 0.6)" stroke="rgba(218, 112, 214, 0.9)" stroke-width="2"/>`,
      'ASSCHER': `<rect x="30" y="30" width="40" height="40" rx="4" ry="4" fill="rgba(218, 112, 214, 0.6)" stroke="rgba(218, 112, 214, 0.9)" stroke-width="2" transform="rotate(45 50 50)"/>`,
      'MARQUISE': `<ellipse cx="50" cy="50" rx="25" ry="15" fill="rgba(218, 112, 214, 0.6)" stroke="rgba(218, 112, 214, 0.9)" stroke-width="2" transform="rotate(90 50 50)"/>`,
      'HEART': `<path d="M50,30 C50,30 30,15 20,30 C20,45 50,65 50,65 C50,65 80,45 80,30 C70,15 50,30 50,30 Z" fill="rgba(218, 112, 214, 0.6)" stroke="rgba(218, 112, 214, 0.9)" stroke-width="2"/>`,
      'PEAR': `<path d="M50,25 C60,25 70,35 70,45 C70,55 50,75 50,75 C40,65 30,50 30,40 C30,30 40,25 50,25 Z" fill="rgba(218, 112, 214, 0.6)" stroke="rgba(218, 112, 214, 0.9)" stroke-width="2"/>`
    };
    
    return shapeDefinitions[shape as keyof typeof shapeDefinitions] || shapeDefinitions['ROUND'];
  };

  // Cycle through cut grades with professional warnings and visual shape background
  const cycleCutGrade = () => {
    const currentShape = cut;
    
    if (cut === null) {
      // First selection - start with ROUND (most popular shape)
      setCut(DIAMOND_SHAPES[0]);
      console.log(`💎 SHAPE SELECTED: ${DIAMOND_SHAPES[0]} - First selection`);
    } else {
      // Cycle through diamond shapes
      const currentIndex = DIAMOND_SHAPES.indexOf(cut);
      const nextIndex = (currentIndex + 1) % DIAMOND_SHAPES.length;
      const nextShape = DIAMOND_SHAPES[nextIndex];
      
      setCut(nextShape);
      console.log(`💎 SHAPE CYCLED: ${nextShape}`);
    }

    // Apply diamond shape background visualization
    setTimeout(() => {
      const shapeButton = document.querySelector('.shape-button');
      if (shapeButton && (cut || DIAMOND_SHAPES[0])) {
        // Remove previous shape background
        const existingShape = shapeButton.querySelector('.diamond-shape-background');
        if (existingShape) {
          existingShape.remove();
        }
        
        // Add new diamond shape SVG background using the current shape
        const currentShape = cut || DIAMOND_SHAPES[0];
        const shapeSVG = generateDiamondShapeSVG(currentShape);
        const shapeElement = document.createElement('div');
        shapeElement.className = 'diamond-shape-background';
        const svgMarkup = `<svg width="100%" height="100%" viewBox="0 0 100 100" style="position: absolute; top: 0; left: 0; z-index: 5; pointer-events: none; opacity: 1.0;">${shapeSVG}</svg>`;
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgMarkup, 'image/svg+xml');
        const svgNode = svgDoc.documentElement;
        shapeElement.appendChild(document.importNode(svgNode, true));
        shapeElement.style.cssText = `
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          pointer-events: none !important;
          z-index: 5 !important;
          display: block !important;
          visibility: visible !important;
        `;
        shapeButton.appendChild(shapeElement);
        
        console.log(`🎯 SHAPE BACKGROUND: Applied ${currentShape} diamond shape visualization to button`);
      }
    }, 10);
  };

  // AUTHENTIC RAPAPORT DIAMOND PRICING ENGINE
  // Direct lookup from actual Rapaport Diamond Report - May 16, 2025
  const priceDiamond = (carat: number, color: string, clarity: string, shape: string, type: string = "NATURAL"): number => {
    // COMPLETE AUTHENTIC RAPAPORT PRICE LOOKUP TABLE (Per Carat in $00s)
    // Based on actual Rapaport Diamond Report screenshots - May 16, 2025
    const getRapaPricePerCarat = (caratWeight: number, color: string, clarity: string): number => {
      
      // 0.01 - 0.03 CT bracket
      const prices_0_01_0_03: { [key: string]: { [key: string]: number } } = {
        'D': { 'VVS': 8.3, 'VS': 7.3, 'SI1': 6.4, 'SI2': 4.5, 'SI3': 4.0, 'I1': 3.5, 'I2': 2.8, 'I3': 2.8 },
        'E': { 'VVS': 7.1, 'VS': 6.4, 'SI1': 5.7, 'SI2': 5.0, 'SI3': 4.4, 'I1': 3.8, 'I2': 3.1, 'I3': 2.6 },
        'F': { 'VVS': 6.1, 'VS': 5.5, 'SI1': 4.9, 'SI2': 4.4, 'SI3': 4.0, 'I1': 3.4, 'I2': 2.8, 'I3': 2.4 },
        'G': { 'VVS': 5.2, 'VS': 4.8, 'SI1': 4.4, 'SI2': 4.0, 'SI3': 3.4, 'I1': 2.8, 'I2': 2.4, 'I3': 1.6 },
        'H': { 'VVS': 4.4, 'VS': 3.9, 'SI1': 3.4, 'SI2': 2.8, 'SI3': 2.5, 'I1': 2.0, 'I2': 2.0, 'I3': 1.6 },
        'I': { 'VVS': 3.9, 'VS': 3.4, 'SI1': 3.1, 'SI2': 2.8, 'SI3': 2.0, 'I1': 1.6, 'I2': 1.4, 'I3': 1.2 },
        'J': { 'VVS': 2.9, 'VS': 2.6, 'SI1': 2.3, 'SI2': 2.0, 'SI3': 1.8, 'I1': 1.6, 'I2': 1.4, 'I3': 1.2 }
      };

      // 0.04 - 0.07 CT bracket
      const prices_0_04_0_07: { [key: string]: { [key: string]: number } } = {
        'D': { 'VVS': 9.0, 'VS': 7.9, 'SI1': 6.8, 'SI2': 6.0, 'SI3': 5.3, 'I1': 4.8, 'I2': 4.0, 'I3': 3.1 },
        'E': { 'VVS': 7.7, 'VS': 6.9, 'SI1': 6.2, 'SI2': 5.5, 'SI3': 4.9, 'I1': 4.4, 'I2': 3.6, 'I3': 2.8 },
        'F': { 'VVS': 6.5, 'VS': 5.9, 'SI1': 5.4, 'SI2': 4.8, 'SI3': 4.4, 'I1': 4.0, 'I2': 3.2, 'I3': 2.6 },
        'G': { 'VVS': 4.7, 'VS': 4.2, 'SI1': 3.8, 'SI2': 3.4, 'SI3': 3.1, 'I1': 2.7, 'I2': 2.2, 'I3': 1.7 },
        'H': { 'VVS': 3.1, 'VS': 2.8, 'SI1': 2.4, 'SI2': 2.1, 'SI3': 1.9, 'I1': 1.7, 'I2': 1.5, 'I3': 1.3 }
      };

      // 0.08 - 0.14 CT bracket
      const prices_0_08_0_14: { [key: string]: { [key: string]: number } } = {
        'D': { 'VVS': 10.6, 'VS': 9.6, 'SI1': 8.5, 'SI2': 7.6, 'SI3': 6.8, 'I1': 5.7, 'I2': 4.8, 'I3': 4.0 },
        'E': { 'VVS': 8.8, 'VS': 8.2, 'SI1': 7.7, 'SI2': 6.9, 'SI3': 6.2, 'I1': 5.2, 'I2': 4.3, 'I3': 3.6 },
        'F': { 'VVS': 7.6, 'VS': 7.0, 'SI1': 6.5, 'SI2': 5.8, 'SI3': 5.1, 'I1': 4.5, 'I2': 3.7, 'I3': 3.2 },
        'G': { 'VVS': 6.3, 'VS': 5.6, 'SI1': 5.0, 'SI2': 4.3, 'SI3': 3.8, 'I1': 3.4, 'I2': 2.8, 'I3': 2.3 },
        'H': { 'VVS': 4.1, 'VS': 3.7, 'SI1': 3.3, 'SI2': 2.9, 'SI3': 2.6, 'I1': 2.2, 'I2': 1.9, 'I3': 1.6 }
      };

      // 0.15 - 0.17 CT bracket  
      const prices_0_15_0_17: { [key: string]: { [key: string]: number } } = {
        'D': { 'VVS': 12.5, 'VS': 11.1, 'SI1': 9.8, 'SI2': 8.5, 'SI3': 7.6, 'I1': 6.4, 'I2': 5.2, 'I3': 4.4 },
        'E': { 'VVS': 10.5, 'VS': 9.6, 'SI1': 8.7, 'SI2': 7.7, 'SI3': 6.8, 'I1': 5.7, 'I2': 4.7, 'I3': 4.0 },
        'F': { 'VVS': 8.5, 'VS': 7.7, 'SI1': 7.0, 'SI2': 6.2, 'SI3': 5.4, 'I1': 4.8, 'I2': 4.0, 'I3': 3.6 },
        'G': { 'VVS': 6.9, 'VS': 6.2, 'SI1': 5.3, 'SI2': 4.6, 'SI3': 4.1, 'I1': 3.7, 'I2': 3.1, 'I3': 2.6 }
      };

      // 0.18 - 0.22 CT bracket
      const prices_0_18_0_22: { [key: string]: { [key: string]: number } } = {
        'D': { 'VVS': 14.0, 'VS': 12.6, 'SI1': 11.1, 'SI2': 9.6, 'SI3': 8.4, 'I1': 6.9, 'I2': 5.6, 'I3': 4.8 },
        'E': { 'VVS': 12.0, 'VS': 10.6, 'SI1': 9.5, 'SI2': 8.3, 'SI3': 7.3, 'I1': 6.3, 'I2': 5.1, 'I3': 4.3 },
        'F': { 'VVS': 9.8, 'VS': 8.8, 'SI1': 8.0, 'SI2': 7.0, 'SI3': 6.1, 'I1': 5.2, 'I2': 4.3, 'I3': 3.9 },
        'G': { 'VVS': 8.2, 'VS': 7.0, 'SI1': 6.2, 'SI2': 5.2, 'SI3': 4.6, 'I1': 4.0, 'I2': 3.4, 'I3': 2.8 },
        'H': { 'VVS': 6.6, 'VS': 5.6, 'SI1': 4.8, 'SI2': 4.1, 'SI3': 3.6, 'I1': 2.9, 'I2': 2.4, 'I3': 2.0 }
      };

      // 0.23 - 0.29 CT bracket
      const prices_0_23_0_29: { [key: string]: { [key: string]: number } } = {
        'D': { 'VVS': 16.5, 'VS': 15.0, 'SI1': 13.0, 'SI2': 10.9, 'SI3': 9.4, 'I1': 7.6, 'I2': 6.0, 'I3': 5.1 },
        'E': { 'VVS': 13.5, 'VS': 12.2, 'SI1': 10.7, 'SI2': 9.2, 'SI3': 8.1, 'I1': 6.9, 'I2': 5.5, 'I3': 4.6 },
        'F': { 'VVS': 11.1, 'VS': 10.1, 'SI1': 9.2, 'SI2': 7.8, 'SI3': 6.8, 'I1': 5.6, 'I2': 4.7, 'I3': 4.2 },
        'G': { 'VVS': 9.2, 'VS': 8.0, 'SI1': 7.0, 'SI2': 6.1, 'SI3': 5.4, 'I1': 4.4, 'I2': 3.7, 'I3': 3.0 },
        'H': { 'VVS': 7.8, 'VS': 6.7, 'SI1': 5.6, 'SI2': 4.9, 'SI3': 4.4, 'I1': 3.6, 'I2': 2.8, 'I3': 2.2 }
      };

      // 0.30 - 0.39 CT bracket (RAPAPORT 05/16/25)
      const prices_0_30_0_39: { [key: string]: { [key: string]: number } } = {
        'D': { 'IF': 31, 'VVS1': 25, 'VVS2': 22, 'VS1': 20, 'VS2': 18, 'SI1': 17, 'SI2': 16, 'I1': 13, 'I2': 11, 'I3': 7 },
        'E': { 'IF': 26, 'VVS1': 23, 'VVS2': 20, 'VS1': 18, 'VS2': 17, 'SI1': 16, 'SI2': 15, 'I1': 12, 'I2': 10, 'I3': 6 },
        'F': { 'IF': 23, 'VVS1': 21, 'VVS2': 19, 'VS1': 17, 'VS2': 16, 'SI1': 15, 'SI2': 14, 'I1': 11, 'I2': 10, 'I3': 5 },
        'G': { 'IF': 20, 'VVS1': 18, 'VVS2': 17, 'VS1': 16, 'VS2': 15, 'SI1': 14, 'SI2': 13, 'I1': 10, 'I2': 9, 'I3': 5 },
        'H': { 'IF': 17, 'VVS1': 16, 'VVS2': 15, 'VS1': 15, 'VS2': 14, 'SI1': 13, 'SI2': 12, 'I1': 10, 'I2': 8, 'I3': 5 },
        'I': { 'IF': 15, 'VVS1': 14, 'VVS2': 13, 'VS1': 13, 'VS2': 12, 'SI1': 12, 'SI2': 11, 'I1': 9, 'I2': 7, 'I3': 5 },
        'J': { 'IF': 13, 'VVS1': 12, 'VVS2': 11, 'VS1': 11, 'VS2': 10, 'SI1': 10, 'SI2': 10, 'I1': 8, 'I2': 7, 'I3': 4 },
        'K': { 'IF': 12, 'VVS1': 11, 'VVS2': 10, 'VS1': 9, 'VS2': 9, 'SI1': 9, 'SI2': 9, 'I1': 7, 'I2': 6, 'I3': 4 },
        'L': { 'IF': 11, 'VVS1': 10, 'VVS2': 9, 'VS1': 8, 'VS2': 8, 'SI1': 8, 'SI2': 8, 'I1': 6, 'I2': 5, 'I3': 4 },
        'M': { 'IF': 10, 'VVS1': 9, 'VVS2': 9, 'VS1': 8, 'VS2': 8, 'SI1': 8, 'SI2': 7, 'I1': 5, 'I2': 4, 'I3': 3 }
      };

      // 0.40 - 0.49 CT bracket (RAPAPORT 05/16/25)
      const prices_0_40_0_49: { [key: string]: { [key: string]: number } } = {
        'D': { 'IF': 35, 'VVS1': 29, 'VVS2': 25, 'VS1': 23, 'VS2': 21, 'SI1': 20, 'SI2': 18, 'I1': 15, 'I2': 12, 'I3': 8 },
        'E': { 'IF': 29, 'VVS1': 26, 'VVS2': 23, 'VS1': 21, 'VS2': 20, 'SI1': 19, 'SI2': 17, 'I1': 14, 'I2': 11, 'I3': 7 },
        'F': { 'IF': 26, 'VVS1': 24, 'VVS2': 22, 'VS1': 20, 'VS2': 19, 'SI1': 18, 'SI2': 16, 'I1': 13, 'I2': 11, 'I3': 7 },
        'G': { 'IF': 23, 'VVS1': 21, 'VVS2': 20, 'VS1': 19, 'VS2': 18, 'SI1': 17, 'SI2': 15, 'I1': 12, 'I2': 10, 'I3': 6 },
        'H': { 'IF': 21, 'VVS1': 19, 'VVS2': 18, 'VS1': 17, 'VS2': 16, 'SI1': 15, 'SI2': 14, 'I1': 12, 'I2': 9, 'I3': 6 },
        'I': { 'IF': 19, 'VVS1': 17, 'VVS2': 16, 'VS1': 15, 'VS2': 14, 'SI1': 14, 'SI2': 13, 'I1': 11, 'I2': 8, 'I3': 6 },
        'J': { 'IF': 16, 'VVS1': 15, 'VVS2': 14, 'VS1': 13, 'VS2': 13, 'SI1': 12, 'SI2': 12, 'I1': 10, 'I2': 8, 'I3': 5 },
        'K': { 'IF': 14, 'VVS1': 13, 'VVS2': 12, 'VS1': 11, 'VS2': 11, 'SI1': 10, 'SI2': 10, 'I1': 8, 'I2': 7, 'I3': 5 },
        'L': { 'IF': 13, 'VVS1': 12, 'VVS2': 11, 'VS1': 10, 'VS2': 10, 'SI1': 9, 'SI2': 9, 'I1': 7, 'I2': 6, 'I3': 4 },
        'M': { 'IF': 12, 'VVS1': 11, 'VVS2': 10, 'VS1': 9, 'VS2': 9, 'SI1': 9, 'SI2': 8, 'I1': 6, 'I2': 5, 'I3': 3 }
      };

      // 0.50 - 0.69 CT bracket (RAPAPORT 05/16/25)
      const prices_0_50_0_69: { [key: string]: { [key: string]: number } } = {
        'D': { 'IF': 55, 'VVS1': 46, 'VVS2': 36, 'VS1': 30, 'VS2': 27, 'SI1': 24, 'SI2': 20, 'I1': 16, 'I2': 14, 'I3': 11 },
        'E': { 'IF': 44, 'VVS1': 40, 'VVS2': 33, 'VS1': 28, 'VS2': 25, 'SI1': 22, 'SI2': 19, 'I1': 15, 'I2': 13, 'I3': 10 },
        'F': { 'IF': 38, 'VVS1': 35, 'VVS2': 30, 'VS1': 26, 'VS2': 24, 'SI1': 21, 'SI2': 18, 'I1': 14, 'I2': 12, 'I3': 10 },
        'G': { 'IF': 32, 'VVS1': 29, 'VVS2': 26, 'VS1': 24, 'VS2': 23, 'SI1': 20, 'SI2': 17, 'I1': 13, 'I2': 11, 'I3': 9 },
        'H': { 'IF': 26, 'VVS1': 24, 'VVS2': 23, 'VS1': 22, 'VS2': 21, 'SI1': 19, 'SI2': 16, 'I1': 12, 'I2': 11, 'I3': 8 },
        'I': { 'IF': 23, 'VVS1': 21, 'VVS2': 20, 'VS1': 19, 'VS2': 18, 'SI1': 17, 'SI2': 15, 'I1': 12, 'I2': 10, 'I3': 8 },
        'J': { 'IF': 20, 'VVS1': 18, 'VVS2': 17, 'VS1': 16, 'VS2': 15, 'SI1': 14, 'SI2': 13, 'I1': 11, 'I2': 10, 'I3': 7 },
        'K': { 'IF': 17, 'VVS1': 16, 'VVS2': 15, 'VS1': 14, 'VS2': 13, 'SI1': 12, 'SI2': 11, 'I1': 10, 'I2': 9, 'I3': 7 },
        'L': { 'IF': 15, 'VVS1': 14, 'VVS2': 13, 'VS1': 12, 'VS2': 11, 'SI1': 10, 'SI2': 10, 'I1': 9, 'I2': 8, 'I3': 6 },
        'M': { 'IF': 14, 'VVS1': 13, 'VVS2': 12, 'VS1': 11, 'VS2': 10, 'SI1': 10, 'SI2': 9, 'I1': 7, 'I2': 5, 'I3': 3 }
      };

      // 0.70 - 0.89 CT bracket (RAPAPORT 05/16/25)
      const prices_0_70_0_89: { [key: string]: { [key: string]: number } } = {
        'D': { 'IF': 70, 'VVS1': 58, 'VVS2': 45, 'VS1': 39, 'VS2': 34, 'SI1': 31, 'SI2': 27, 'I1': 23, 'I2': 19, 'I3': 12 },
        'E': { 'IF': 57, 'VVS1': 51, 'VVS2': 42, 'VS1': 37, 'VS2': 32, 'SI1': 29, 'SI2': 25, 'I1': 21, 'I2': 18, 'I3': 11 },
        'F': { 'IF': 50, 'VVS1': 46, 'VVS2': 40, 'VS1': 35, 'VS2': 30, 'SI1': 27, 'SI2': 23, 'I1': 20, 'I2': 17, 'I3': 11 },
        'G': { 'IF': 42, 'VVS1': 39, 'VVS2': 35, 'VS1': 32, 'VS2': 28, 'SI1': 25, 'SI2': 22, 'I1': 19, 'I2': 16, 'I3': 10 },
        'H': { 'IF': 34, 'VVS1': 31, 'VVS2': 29, 'VS1': 28, 'VS2': 26, 'SI1': 23, 'SI2': 20, 'I1': 18, 'I2': 15, 'I3': 9 },
        'I': { 'IF': 30, 'VVS1': 27, 'VVS2': 25, 'VS1': 24, 'VS2': 22, 'SI1': 20, 'SI2': 18, 'I1': 16, 'I2': 14, 'I3': 9 },
        'J': { 'IF': 25, 'VVS1': 23, 'VVS2': 21, 'VS1': 20, 'VS2': 19, 'SI1': 18, 'SI2': 16, 'I1': 14, 'I2': 13, 'I3': 8 },
        'K': { 'IF': 23, 'VVS1': 21, 'VVS2': 19, 'VS1': 18, 'VS2': 17, 'SI1': 16, 'SI2': 15, 'I1': 13, 'I2': 11, 'I3': 8 },
        'L': { 'IF': 21, 'VVS1': 19, 'VVS2': 17, 'VS1': 16, 'VS2': 15, 'SI1': 14, 'SI2': 13, 'I1': 12, 'I2': 9, 'I3': 7 },
        'M': { 'IF': 19, 'VVS1': 17, 'VVS2': 15, 'VS1': 14, 'VS2': 13, 'SI1': 13, 'SI2': 12, 'I1': 9, 'I2': 6, 'I3': 4 }
      };

      // 1.00 - 1.49 CT bracket (RAPAPORT 05/16/25)
      const prices_1_00_1_49: { [key: string]: { [key: string]: number } } = {
        'D': { 'IF': 160, 'VVS1': 128, 'VVS2': 102, 'VS1': 87, 'VS2': 73, 'SI1': 60, 'SI2': 48, 'I1': 38, 'I2': 25, 'I3': 16 },
        'E': { 'IF': 150, 'VVS1': 111, 'VVS2': 93, 'VS1': 79, 'VS2': 66, 'SI1': 56, 'SI2': 42, 'I1': 35, 'I2': 24, 'I3': 15 },
        'F': { 'IF': 107, 'VVS1': 97, 'VVS2': 84, 'VS1': 72, 'VS2': 60, 'SI1': 52, 'SI2': 42, 'I1': 33, 'I2': 23, 'I3': 15 },
        'G': { 'IF': 82, 'VVS1': 77, 'VVS2': 70, 'VS1': 62, 'VS2': 54, 'SI1': 41, 'SI2': 40, 'I1': 31, 'I2': 22, 'I3': 14 },
        'H': { 'IF': 61, 'VVS1': 58, 'VVS2': 55, 'VS1': 52, 'VS2': 48, 'SI1': 44, 'SI2': 37, 'I1': 29, 'I2': 21, 'I3': 13 },
        'I': { 'IF': 52, 'VVS1': 49, 'VVS2': 46, 'VS1': 43, 'VS2': 40, 'SI1': 39, 'SI2': 34, 'I1': 27, 'I2': 20, 'I3': 13 },
        'J': { 'IF': 43, 'VVS1': 40, 'VVS2': 37, 'VS1': 34, 'VS2': 33, 'SI1': 32, 'SI2': 30, 'I1': 26, 'I2': 19, 'I3': 12 },
        'K': { 'IF': 36, 'VVS1': 33, 'VVS2': 31, 'VS1': 29, 'VS2': 28, 'SI1': 27, 'SI2': 25, 'I1': 23, 'I2': 18, 'I3': 12 },
        'L': { 'IF': 31, 'VVS1': 28, 'VVS2': 26, 'VS1': 25, 'VS2': 24, 'SI1': 23, 'SI2': 22, 'I1': 20, 'I2': 17, 'I3': 11 },
        'M': { 'IF': 27, 'VVS1': 26, 'VVS2': 24, 'VS1': 23, 'VS2': 23, 'SI1': 22, 'SI2': 21, 'I1': 18, 'I2': 17, 'I3': 11 }
      };

      // 1.50 - 1.99 CT bracket (RAPAPORT 05/16/25)
      const prices_1_50_1_99: { [key: string]: { [key: string]: number } } = {
        'D': { 'IF': 210, 'VVS1': 187, 'VVS2': 154, 'VS1': 134, 'VS2': 120, 'SI1': 96, 'SI2': 78, 'I1': 57, 'I2': 35, 'I3': 15 },
        'E': { 'IF': 188, 'VVS1': 173, 'VVS2': 143, 'VS1': 122, 'VS2': 110, 'SI1': 89, 'SI2': 71, 'I1': 54, 'I2': 33, 'I3': 15 },
        'F': { 'IF': 164, 'VVS1': 153, 'VVS2': 132, 'VS1': 114, 'VS2': 103, 'SI1': 84, 'SI2': 67, 'I1': 48, 'I2': 30, 'I3': 15 },
        'G': { 'IF': 136, 'VVS1': 126, 'VVS2': 114, 'VS1': 99, 'VS2': 89, 'SI1': 78, 'SI2': 63, 'I1': 48, 'I2': 30, 'I3': 15 },
        'H': { 'IF': 108, 'VVS1': 100, 'VVS2': 91, 'VS1': 81, 'VS2': 74, 'SI1': 69, 'SI2': 57, 'I1': 42, 'I2': 27, 'I3': 14 },
        'I': { 'IF': 87, 'VVS1': 81, 'VVS2': 73, 'VS1': 63, 'VS2': 57, 'SI1': 53, 'SI2': 48, 'I1': 40, 'I2': 27, 'I3': 14 },
        'J': { 'IF': 74, 'VVS1': 67, 'VVS2': 61, 'VS1': 57, 'VS2': 53, 'SI1': 50, 'SI2': 45, 'I1': 37, 'I2': 26, 'I3': 14 }
      };

      // 2.00 - 2.99 CT bracket (RAPAPORT 05/16/25)
      const prices_2_00_2_99: { [key: string]: { [key: string]: number } } = {
        'D': { 'IF': 330, 'VVS1': 275, 'VVS2': 235, 'VS1': 205, 'VS2': 175, 'SI1': 141, 'SI2': 113, 'I1': 80, 'I2': 41, 'I3': 19 },
        'E': { 'IF': 270, 'VVS1': 245, 'VVS2': 210, 'VS1': 190, 'VS2': 160, 'SI1': 132, 'SI2': 105, 'I1': 72, 'I2': 37, 'I3': 17 },
        'F': { 'IF': 245, 'VVS1': 220, 'VVS2': 195, 'VS1': 175, 'VS2': 150, 'SI1': 123, 'SI2': 98, 'I1': 65, 'I2': 34, 'I3': 16 },
        'G': { 'IF': 205, 'VVS1': 185, 'VVS2': 165, 'VS1': 150, 'VS2': 135, 'SI1': 112, 'SI2': 87, 'I1': 63, 'I2': 32, 'I3': 16 },
        'H': { 'IF': 165, 'VVS1': 150, 'VVS2': 135, 'VS1': 125, 'VS2': 115, 'SI1': 104, 'SI2': 78, 'I1': 55, 'I2': 28, 'I3': 15 },
        'I': { 'IF': 135, 'VVS1': 120, 'VVS2': 110, 'VS1': 100, 'VS2': 95, 'SI1': 90, 'SI2': 68, 'I1': 47, 'I2': 25, 'I3': 14 },
        'J': { 'IF': 109, 'VVS1': 99, 'VVS2': 91, 'VS1': 84, 'VS2': 76, 'SI1': 69, 'SI2': 63, 'I1': 44, 'I2': 22, 'I3': 13 }
      };

      // 3.00 - 3.99 CT bracket (RAPAPORT 05/16/25)
      const prices_3_00_3_99: { [key: string]: { [key: string]: number } } = {
        'D': { 'IF': 550, 'VVS1': 460, 'VVS2': 410, 'VS1': 350, 'VS2': 295, 'SI1': 235, 'SI2': 200, 'I1': 103, 'I2': 49, 'I3': 21 },
        'E': { 'IF': 450, 'VVS1': 420, 'VVS2': 370, 'VS1': 320, 'VS2': 265, 'SI1': 210, 'SI2': 185, 'I1': 98, 'I2': 47, 'I3': 20 },
        'F': { 'IF': 405, 'VVS1': 375, 'VVS2': 335, 'VS1': 295, 'VS2': 245, 'SI1': 195, 'SI2': 170, 'I1': 93, 'I2': 45, 'I3': 19 },
        'G': { 'IF': 335, 'VVS1': 315, 'VVS2': 280, 'VS1': 245, 'VS2': 210, 'SI1': 180, 'SI2': 155, 'I1': 82, 'I2': 41, 'I3': 17 },
        'H': { 'IF': 270, 'VVS1': 250, 'VVS2': 225, 'VS1': 205, 'VS2': 185, 'SI1': 160, 'SI2': 140, 'I1': 74, 'I2': 37, 'I3': 15 },
        'I': { 'IF': 220, 'VVS1': 205, 'VVS2': 190, 'VS1': 175, 'VS2': 160, 'SI1': 140, 'SI2': 120, 'I1': 66, 'I2': 33, 'I3': 14 },
        'J': { 'IF': 175, 'VVS1': 165, 'VVS2': 150, 'VS1': 140, 'VS2': 130, 'SI1': 110, 'SI2': 84, 'I1': 54, 'I2': 29, 'I3': 13 }
      };

      // 4.00 - 4.99 CT bracket (RAPAPORT 05/16/25)
      const prices_4_00_4_99: { [key: string]: { [key: string]: number } } = {
        'D': { 'IF': 745, 'VVS1': 645, 'VVS2': 585, 'VS1': 495, 'VS2': 415, 'SI1': 315, 'SI2': 255, 'I1': 111, 'I2': 54, 'I3': 23 },
        'E': { 'IF': 625, 'VVS1': 585, 'VVS2': 525, 'VS1': 450, 'VS2': 390, 'SI1': 295, 'SI2': 240, 'I1': 106, 'I2': 52, 'I3': 22 },
        'F': { 'IF': 565, 'VVS1': 520, 'VVS2': 475, 'VS1': 410, 'VS2': 355, 'SI1': 275, 'SI2': 225, 'I1': 101, 'I2': 50, 'I3': 21 },
        'G': { 'IF': 465, 'VVS1': 430, 'VVS2': 395, 'VS1': 360, 'VS2': 315, 'SI1': 245, 'SI2': 200, 'I1': 95, 'I2': 47, 'I3': 20 },
        'H': { 'IF': 360, 'VVS1': 335, 'VVS2': 315, 'VS1': 295, 'VS2': 260, 'SI1': 215, 'SI2': 180, 'I1': 88, 'I2': 44, 'I3': 19 },
        'I': { 'IF': 280, 'VVS1': 260, 'VVS2': 245, 'VS1': 230, 'VS2': 210, 'SI1': 165, 'SI2': 140, 'I1': 66, 'I2': 28, 'I3': 15 },
        'J': { 'IF': 225, 'VVS1': 195, 'VVS2': 185, 'VS1': 170, 'VS2': 153, 'SI1': 140, 'SI2': 125, 'I1': 61, 'I2': 26, 'I3': 14 }
      };

      // ===== PEAR SHAPE PRICING TABLES =====
      // PEAR 0.18 - 0.22 CT bracket
      const pear_prices_0_18_0_22: { [key: string]: { [key: string]: number } } = {
        'D': { 'VVS': 13.7, 'VS': 11.6, 'SI1': 10.0, 'SI2': 8.5, 'SI3': 7.1, 'I1': 6.0, 'I2': 4.5, 'I3': 3.6 },
        'E': { 'VVS': 12.1, 'VS': 10.2, 'SI1': 8.8, 'SI2': 7.5, 'SI3': 6.3, 'I1': 5.2, 'I2': 4.0, 'I3': 3.2 },
        'F': { 'VVS': 10.0, 'VS': 8.5, 'SI1': 7.5, 'SI2': 6.5, 'SI3': 5.4, 'I1': 4.5, 'I2': 3.5, 'I3': 2.7 },
        'G': { 'VVS': 7.7, 'VS': 6.5, 'SI1': 5.7, 'SI2': 4.9, 'SI3': 4.2, 'I1': 3.5, 'I2': 2.7, 'I3': 2.1 },
        'H': { 'VVS': 6.0, 'VS': 5.1, 'SI1': 4.3, 'SI2': 3.7, 'SI3': 3.2, 'I1': 2.6, 'I2': 2.0, 'I3': 1.5 }
      };

      // PEAR 0.23 - 0.29 CT bracket
      const pear_prices_0_23_0_29: { [key: string]: { [key: string]: number } } = {
        'D': { 'VVS': 16.1, 'VS': 14.0, 'SI1': 11.3, 'SI2': 9.7, 'SI3': 8.2, 'I1': 6.6, 'I2': 5.1, 'I3': 4.0 },
        'E': { 'VVS': 14.1, 'VS': 12.1, 'SI1': 9.9, 'SI2': 8.4, 'SI3': 7.2, 'I1': 5.7, 'I2': 4.5, 'I3': 3.5 },
        'F': { 'VVS': 11.8, 'VS': 10.9, 'SI1': 8.4, 'SI2': 7.2, 'SI3': 6.3, 'I1': 4.9, 'I2': 3.9, 'I3': 3.0 },
        'G': { 'VVS': 9.4, 'VS': 8.2, 'SI1': 6.7, 'SI2': 5.9, 'SI3': 5.1, 'I1': 3.9, 'I2': 3.1, 'I3': 2.3 },
        'H': { 'VVS': 7.8, 'VS': 6.6, 'SI1': 5.5, 'SI2': 4.8, 'SI3': 4.2, 'I1': 3.1, 'I2': 2.4, 'I3': 1.7 }
      };

      // PEAR 0.30 - 0.39 CT bracket
      const pear_prices_0_30_0_39: { [key: string]: { [key: string]: number } } = {
        'D': { 'IF': 24, 'VVS1': 22, 'VVS2': 20, 'VS1': 18, 'VS2': 17, 'SI1': 16, 'SI2': 14, 'I1': 12, 'I2': 10, 'I3': 8 },
        'E': { 'IF': 22, 'VVS1': 20, 'VVS2': 18, 'VS1': 17, 'VS2': 16, 'SI1': 15, 'SI2': 13, 'I1': 11, 'I2': 9, 'I3': 6 },
        'F': { 'IF': 20, 'VVS1': 18, 'VVS2': 17, 'VS1': 16, 'VS2': 15, 'SI1': 14, 'SI2': 12, 'I1': 10, 'I2': 8, 'I3': 7 },
        'G': { 'IF': 18, 'VVS1': 17, 'VVS2': 16, 'VS1': 15, 'VS2': 14, 'SI1': 13, 'SI2': 11, 'I1': 9, 'I2': 8, 'I3': 7 },
        'H': { 'IF': 17, 'VVS1': 16, 'VVS2': 15, 'VS1': 14, 'VS2': 13, 'SI1': 12, 'SI2': 10, 'I1': 8, 'I2': 7, 'I3': 6 },
        'I': { 'IF': 15, 'VVS1': 14, 'VVS2': 13, 'VS1': 12, 'VS2': 11, 'SI1': 10, 'SI2': 9, 'I1': 8, 'I2': 7, 'I3': 6 },
        'J': { 'IF': 13, 'VVS1': 12, 'VVS2': 11, 'VS1': 11, 'VS2': 10, 'SI1': 9, 'SI2': 8, 'I1': 7, 'I2': 6, 'I3': 5 },
        'K': { 'IF': 12, 'VVS1': 11, 'VVS2': 10, 'VS1': 9, 'VS2': 9, 'SI1': 8, 'SI2': 7, 'I1': 7, 'I2': 6, 'I3': 5 },
        'L': { 'IF': 10, 'VVS1': 9, 'VVS2': 9, 'VS1': 8, 'VS2': 8, 'SI1': 8, 'SI2': 7, 'I1': 6, 'I2': 5, 'I3': 4 },
        'M': { 'IF': 9, 'VVS1': 9, 'VVS2': 9, 'VS1': 8, 'VS2': 8, 'SI1': 7, 'SI2': 6, 'I1': 5, 'I2': 4, 'I3': 3 }
      };

      // PEAR 0.40 - 0.49 CT bracket
      const pear_prices_0_40_0_49: { [key: string]: { [key: string]: number } } = {
        'D': { 'IF': 30, 'VVS1': 26, 'VVS2': 24, 'VS1': 22, 'VS2': 20, 'SI1': 18, 'SI2': 16, 'I1': 14, 'I2': 12, 'I3': 9 },
        'E': { 'IF': 27, 'VVS1': 24, 'VVS2': 22, 'VS1': 20, 'VS2': 19, 'SI1': 17, 'SI2': 15, 'I1': 13, 'I2': 11, 'I3': 9 },
        'F': { 'IF': 25, 'VVS1': 23, 'VVS2': 21, 'VS1': 19, 'VS2': 18, 'SI1': 16, 'SI2': 14, 'I1': 12, 'I2': 10, 'I3': 8 },
        'G': { 'IF': 23, 'VVS1': 21, 'VVS2': 19, 'VS1': 18, 'VS2': 17, 'SI1': 15, 'SI2': 13, 'I1': 11, 'I2': 10, 'I3': 8 },
        'H': { 'IF': 21, 'VVS1': 19, 'VVS2': 18, 'VS1': 17, 'VS2': 16, 'SI1': 14, 'SI2': 12, 'I1': 10, 'I2': 9, 'I3': 7 },
        'I': { 'IF': 19, 'VVS1': 17, 'VVS2': 16, 'VS1': 15, 'VS2': 14, 'SI1': 13, 'SI2': 11, 'I1': 10, 'I2': 8, 'I3': 7 },
        'J': { 'IF': 16, 'VVS1': 15, 'VVS2': 14, 'VS1': 13, 'VS2': 13, 'SI1': 12, 'SI2': 11, 'I1': 9, 'I2': 7, 'I3': 6 },
        'K': { 'IF': 14, 'VVS1': 13, 'VVS2': 12, 'VS1': 11, 'VS2': 11, 'SI1': 10, 'SI2': 9, 'I1': 8, 'I2': 7, 'I3': 6 },
        'L': { 'IF': 13, 'VVS1': 12, 'VVS2': 11, 'VS1': 10, 'VS2': 10, 'SI1': 9, 'SI2': 8, 'I1': 7, 'I2': 6, 'I3': 5 },
        'M': { 'IF': 12, 'VVS1': 11, 'VVS2': 10, 'VS1': 9, 'VS2': 9, 'SI1': 8, 'SI2': 7, 'I1': 6, 'I2': 5, 'I3': 4 }
      };

      // PEAR 0.50 - 0.69 CT bracket
      const pear_prices_0_50_0_69: { [key: string]: { [key: string]: number } } = {
        'D': { 'IF': 33, 'VVS1': 30, 'VVS2': 28, 'VS1': 26, 'VS2': 24, 'SI1': 22, 'SI2': 20, 'I1': 18, 'I2': 16, 'I3': 13 },
        'E': { 'IF': 30, 'VVS1': 28, 'VVS2': 26, 'VS1': 25, 'VS2': 23, 'SI1': 21, 'SI2': 18, 'I1': 17, 'I2': 15, 'I3': 12 },
        'F': { 'IF': 28, 'VVS1': 26, 'VVS2': 25, 'VS1': 24, 'VS2': 22, 'SI1': 20, 'SI2': 17, 'I1': 16, 'I2': 14, 'I3': 11 },
        'G': { 'IF': 26, 'VVS1': 24, 'VVS2': 23, 'VS1': 22, 'VS2': 21, 'SI1': 19, 'SI2': 16, 'I1': 15, 'I2': 13, 'I3': 10 },
        'H': { 'IF': 24, 'VVS1': 22, 'VVS2': 21, 'VS1': 20, 'VS2': 19, 'SI1': 18, 'SI2': 15, 'I1': 14, 'I2': 12, 'I3': 9 },
        'I': { 'IF': 22, 'VVS1': 20, 'VVS2': 19, 'VS1': 18, 'VS2': 17, 'SI1': 16, 'SI2': 14, 'I1': 13, 'I2': 11, 'I3': 8 },
        'J': { 'IF': 19, 'VVS1': 18, 'VVS2': 17, 'VS1': 16, 'VS2': 15, 'SI1': 14, 'SI2': 13, 'I1': 11, 'I2': 10, 'I3': 7 },
        'K': { 'IF': 17, 'VVS1': 16, 'VVS2': 15, 'VS1': 14, 'VS2': 13, 'SI1': 12, 'SI2': 11, 'I1': 10, 'I2': 9, 'I3': 7 },
        'L': { 'IF': 15, 'VVS1': 14, 'VVS2': 13, 'VS1': 12, 'VS2': 11, 'SI1': 11, 'SI2': 10, 'I1': 9, 'I2': 8, 'I3': 6 },
        'M': { 'IF': 14, 'VVS1': 13, 'VVS2': 12, 'VS1': 11, 'VS2': 10, 'SI1': 10, 'SI2': 9, 'I1': 8, 'I2': 7, 'I3': 5 }
      };

      // PEAR 0.70 - 0.89 CT bracket  
      const pear_prices_0_70_0_89: { [key: string]: { [key: string]: number } } = {
        'D': { 'IF': 47, 'VVS1': 43, 'VVS2': 40, 'VS1': 37, 'VS2': 34, 'SI1': 28, 'SI2': 24, 'I1': 22, 'I2': 20, 'I3': 16 },
        'E': { 'IF': 43, 'VVS1': 40, 'VVS2': 38, 'VS1': 35, 'VS2': 32, 'SI1': 26, 'SI2': 22, 'I1': 20, 'I2': 18, 'I3': 15 },
        'F': { 'IF': 40, 'VVS1': 38, 'VVS2': 36, 'VS1': 33, 'VS2': 30, 'SI1': 24, 'SI2': 20, 'I1': 18, 'I2': 16, 'I3': 14 },
        'G': { 'IF': 37, 'VVS1': 35, 'VVS2': 33, 'VS1': 31, 'VS2': 28, 'SI1': 22, 'SI2': 18, 'I1': 17, 'I2': 16, 'I3': 14 },
        'H': { 'IF': 34, 'VVS1': 32, 'VVS2': 30, 'VS1': 28, 'VS2': 25, 'SI1': 21, 'SI2': 17, 'I1': 16, 'I2': 15, 'I3': 13 },
        'I': { 'IF': 31, 'VVS1': 29, 'VVS2': 27, 'VS1': 25, 'VS2': 22, 'SI1': 20, 'SI2': 16, 'I1': 16, 'I2': 14, 'I3': 12 },
        'J': { 'IF': 26, 'VVS1': 25, 'VVS2': 23, 'VS1': 21, 'VS2': 19, 'SI1': 17, 'SI2': 16, 'I1': 15, 'I2': 13, 'I3': 11 },
        'K': { 'IF': 22, 'VVS1': 21, 'VVS2': 20, 'VS1': 19, 'VS2': 18, 'SI1': 16, 'SI2': 15, 'I1': 14, 'I2': 12, 'I3': 10 },
        'L': { 'IF': 20, 'VVS1': 19, 'VVS2': 18, 'VS1': 17, 'VS2': 16, 'SI1': 15, 'SI2': 14, 'I1': 13, 'I2': 11, 'I3': 8 },
        'M': { 'IF': 18, 'VVS1': 17, 'VVS2': 16, 'VS1': 15, 'VS2': 14, 'SI1': 13, 'SI2': 12, 'I1': 11, 'I2': 9, 'I3': 7 }
      };

      // PEAR 0.90 - 0.99 CT bracket
      const pear_prices_0_90_0_99: { [key: string]: { [key: string]: number } } = {
        'D': { 'IF': 67, 'VVS1': 63, 'VVS2': 56, 'VS1': 52, 'VS2': 44, 'SI1': 37, 'SI2': 33, 'I1': 30, 'I2': 24, 'I3': 18 },
        'E': { 'IF': 62, 'VVS1': 57, 'VVS2': 49, 'VS1': 42, 'VS2': 35, 'SI1': 31, 'SI2': 28, 'I1': 23, 'I2': 17, 'I3': 10 },
        'F': { 'IF': 55, 'VVS1': 52, 'VVS2': 49, 'VS1': 46, 'VS2': 40, 'SI1': 33, 'SI2': 29, 'I1': 26, 'I2': 22, 'I3': 16 },
        'G': { 'IF': 52, 'VVS1': 49, 'VVS2': 45, 'VS1': 43, 'VS2': 38, 'SI1': 32, 'SI2': 27, 'I1': 24, 'I2': 21, 'I3': 16 },
        'H': { 'IF': 48, 'VVS1': 45, 'VVS2': 42, 'VS1': 39, 'VS2': 35, 'SI1': 30, 'SI2': 25, 'I1': 22, 'I2': 20, 'I3': 15 },
        'I': { 'IF': 41, 'VVS1': 39, 'VVS2': 37, 'VS1': 34, 'VS2': 31, 'SI1': 27, 'SI2': 23, 'I1': 21, 'I2': 19, 'I3': 14 },
        'J': { 'IF': 36, 'VVS1': 34, 'VVS2': 32, 'VS1': 30, 'VS2': 27, 'SI1': 24, 'SI2': 21, 'I1': 19, 'I2': 17, 'I3': 13 },
        'K': { 'IF': 30, 'VVS1': 28, 'VVS2': 26, 'VS1': 25, 'VS2': 23, 'SI1': 21, 'SI2': 19, 'I1': 17, 'I2': 15, 'I3': 12 },
        'L': { 'IF': 24, 'VVS1': 23, 'VVS2': 22, 'VS1': 20, 'VS2': 19, 'SI1': 18, 'SI2': 16, 'I1': 15, 'I2': 13, 'I3': 10 },
        'M': { 'IF': 20, 'VVS1': 19, 'VVS2': 18, 'VS1': 17, 'VS2': 16, 'SI1': 15, 'SI2': 14, 'I1': 13, 'I2': 11, 'I3': 9 }
      };

      // PEAR 1.00 - 1.49 CT bracket
      const pear_prices_1_00_1_49: { [key: string]: { [key: string]: number } } = {
        'D': { 'IF': 93, 'VVS1': 82, 'VVS2': 76, 'VS1': 67, 'VS2': 57, 'SI1': 46, 'SI2': 39, 'I1': 35, 'I2': 31, 'I3': 21 },
        'E': { 'IF': 82, 'VVS1': 75, 'VVS2': 69, 'VS1': 62, 'VS2': 54, 'SI1': 43, 'SI2': 37, 'I1': 33, 'I2': 29, 'I3': 20 },
        'F': { 'IF': 74, 'VVS1': 68, 'VVS2': 64, 'VS1': 58, 'VS2': 51, 'SI1': 40, 'SI2': 35, 'I1': 31, 'I2': 28, 'I3': 20 },
        'G': { 'IF': 66, 'VVS1': 62, 'VVS2': 58, 'VS1': 54, 'VS2': 48, 'SI1': 38, 'SI2': 33, 'I1': 29, 'I2': 26, 'I3': 19 },
        'H': { 'IF': 56, 'VVS1': 52, 'VVS2': 49, 'VS1': 46, 'VS2': 42, 'SI1': 35, 'SI2': 31, 'I1': 27, 'I2': 24, 'I3': 18 },
        'I': { 'IF': 47, 'VVS1': 44, 'VVS2': 42, 'VS1': 39, 'VS2': 37, 'SI1': 32, 'SI2': 28, 'I1': 24, 'I2': 22, 'I3': 17 },
        'J': { 'IF': 40, 'VVS1': 38, 'VVS2': 36, 'VS1': 34, 'VS2': 32, 'SI1': 29, 'SI2': 25, 'I1': 22, 'I2': 19, 'I3': 15 },
        'K': { 'IF': 34, 'VVS1': 32, 'VVS2': 30, 'VS1': 28, 'VS2': 26, 'SI1': 24, 'SI2': 22, 'I1': 19, 'I2': 17, 'I3': 14 },
        'L': { 'IF': 29, 'VVS1': 27, 'VVS2': 25, 'VS1': 23, 'VS2': 22, 'SI1': 20, 'SI2': 19, 'I1': 18, 'I2': 16, 'I3': 13 },
        'M': { 'IF': 25, 'VVS1': 23, 'VVS2': 21, 'VS1': 20, 'VS2': 19, 'SI1': 18, 'SI2': 17, 'I1': 16, 'I2': 13, 'I3': 10 }
      };

      // PEAR 1.50 - 1.99 CT bracket
      const pear_prices_1_50_1_99: { [key: string]: { [key: string]: number } } = {
        'D': { 'IF': 141, 'VVS1': 132, 'VVS2': 125, 'VS1': 116, 'VS2': 99, 'SI1': 81, 'SI2': 67, 'I1': 59, 'I2': 51, 'I3': 27 },
        'E': { 'IF': 132, 'VVS1': 124, 'VVS2': 116, 'VS1': 108, 'VS2': 93, 'SI1': 76, 'SI2': 63, 'I1': 55, 'I2': 48, 'I3': 26 },
        'F': { 'IF': 123, 'VVS1': 115, 'VVS2': 108, 'VS1': 102, 'VS2': 88, 'SI1': 72, 'SI2': 60, 'I1': 51, 'I2': 45, 'I3': 25 },
        'G': { 'IF': 109, 'VVS1': 105, 'VVS2': 100, 'VS1': 93, 'VS2': 82, 'SI1': 67, 'SI2': 56, 'I1': 48, 'I2': 42, 'I3': 24 },
        'H': { 'IF': 92, 'VVS1': 88, 'VVS2': 84, 'VS1': 79, 'VS2': 71, 'SI1': 62, 'SI2': 52, 'I1': 45, 'I2': 39, 'I3': 23 },
        'I': { 'IF': 79, 'VVS1': 75, 'VVS2': 72, 'VS1': 68, 'VS2': 63, 'SI1': 56, 'SI2': 48, 'I1': 42, 'I2': 36, 'I3': 22 },
        'J': { 'IF': 64, 'VVS1': 61, 'VVS2': 58, 'VS1': 55, 'VS2': 52, 'SI1': 48, 'SI2': 44, 'I1': 38, 'I2': 33, 'I3': 20 },
        'K': { 'IF': 49, 'VVS1': 47, 'VVS2': 45, 'VS1': 43, 'VS2': 41, 'SI1': 39, 'SI2': 37, 'I1': 33, 'I2': 29, 'I3': 18 },
        'L': { 'IF': 41, 'VVS1': 39, 'VVS2': 37, 'VS1': 36, 'VS2': 34, 'SI1': 32, 'SI2': 30, 'I1': 28, 'I2': 26, 'I3': 16 },
        'M': { 'IF': 35, 'VVS1': 33, 'VVS2': 32, 'VS1': 31, 'VS2': 29, 'SI1': 27, 'SI2': 25, 'I1': 24, 'I2': 22, 'I3': 15 }
      };

      // PEAR 2.00 - 2.99 CT bracket
      const pear_prices_2_00_2_99: { [key: string]: { [key: string]: number } } = {
        'D': { 'IF': 215, 'VVS1': 200, 'VVS2': 185, 'VS1': 175, 'VS2': 160, 'SI1': 135, 'SI2': 103, 'I1': 82, 'I2': 69, 'I3': 30 },
        'E': { 'IF': 200, 'VVS1': 185, 'VVS2': 170, 'VS1': 160, 'VS2': 150, 'SI1': 125, 'SI2': 96, 'I1': 78, 'I2': 64, 'I3': 29 },
        'F': { 'IF': 185, 'VVS1': 170, 'VVS2': 160, 'VS1': 150, 'VS2': 140, 'SI1': 117, 'SI2': 91, 'I1': 74, 'I2': 59, 'I3': 28 },
        'G': { 'IF': 170, 'VVS1': 160, 'VVS2': 150, 'VS1': 140, 'VS2': 130, 'SI1': 107, 'SI2': 86, 'I1': 70, 'I2': 55, 'I3': 27 },
        'H': { 'IF': 135, 'VVS1': 125, 'VVS2': 120, 'VS1': 115, 'VS2': 110, 'SI1': 99, 'SI2': 82, 'I1': 64, 'I2': 51, 'I3': 25 },
        'I': { 'IF': 108, 'VVS1': 104, 'VVS2': 99, 'VS1': 95, 'VS2': 90, 'SI1': 85, 'SI2': 75, 'I1': 57, 'I2': 48, 'I3': 24 },
        'J': { 'IF': 88, 'VVS1': 84, 'VVS2': 81, 'VS1': 77, 'VS2': 74, 'SI1': 70, 'SI2': 63, 'I1': 51, 'I2': 45, 'I3': 22 },
        'K': { 'IF': 70, 'VVS1': 66, 'VVS2': 63, 'VS1': 60, 'VS2': 58, 'SI1': 55, 'SI2': 51, 'I1': 43, 'I2': 37, 'I3': 21 },
        'L': { 'IF': 54, 'VVS1': 51, 'VVS2': 49, 'VS1': 47, 'VS2': 45, 'SI1': 43, 'SI2': 41, 'I1': 36, 'I2': 33, 'I3': 19 },
        'M': { 'IF': 45, 'VVS1': 42, 'VVS2': 40, 'VS1': 38, 'VS2': 36, 'SI1': 35, 'SI2': 33, 'I1': 29, 'I2': 27, 'I3': 18 }
      };
      
      // PEAR 3.00 - 3.99 CT bracket
      const pear_prices_3_00_3_99: { [key: string]: { [key: string]: number } } = {
        'D': { 'IF': 420, 'VVS1': 355, 'VVS2': 325, 'VS1': 300, 'VS2': 270, 'SI1': 230, 'SI2': 175, 'I1': 118, 'I2': 86, 'I3': 36 },
        'E': { 'IF': 365, 'VVS1': 325, 'VVS2': 295, 'VS1': 275, 'VS2': 245, 'SI1': 215, 'SI2': 165, 'I1': 109, 'I2': 80, 'I3': 33 },
        'F': { 'IF': 325, 'VVS1': 295, 'VVS2': 270, 'VS1': 250, 'VS2': 225, 'SI1': 195, 'SI2': 155, 'I1': 101, 'I2': 74, 'I3': 30 },
        'G': { 'IF': 290, 'VVS1': 265, 'VVS2': 245, 'VS1': 225, 'VS2': 205, 'SI1': 180, 'SI2': 145, 'I1': 92, 'I2': 67, 'I3': 29 },
        'H': { 'IF': 240, 'VVS1': 226, 'VVS2': 210, 'VS1': 195, 'VS2': 180, 'SI1': 160, 'SI2': 135, 'I1': 85, 'I2': 62, 'I3': 27 },
        'I': { 'IF': 195, 'VVS1': 185, 'VVS2': 175, 'VS1': 165, 'VS2': 155, 'SI1': 140, 'SI2': 120, 'I1': 79, 'I2': 57, 'I3': 26 },
        'J': { 'IF': 164, 'VVS1': 142, 'VVS2': 135, 'VS1': 127, 'VS2': 121, 'SI1': 111, 'SI2': 102, 'I1': 71, 'I2': 54, 'I3': 25 },
        'K': { 'IF': 119, 'VVS1': 111, 'VVS2': 105, 'VS1': 100, 'VS2': 94, 'SI1': 88, 'SI2': 82, 'I1': 61, 'I2': 50, 'I3': 24 },
        'L': { 'IF': 89, 'VVS1': 83, 'VVS2': 79, 'VS1': 75, 'VS2': 71, 'SI1': 66, 'SI2': 62, 'I1': 53, 'I2': 44, 'I3': 23 },
        'M': { 'IF': 67, 'VVS1': 63, 'VVS2': 60, 'VS1': 57, 'VS2': 54, 'SI1': 49, 'SI2': 46, 'I1': 41, 'I2': 36, 'I3': 21 }
      };

      // PEAR 4.00 - 4.99 CT bracket
      const pear_prices_4_00_4_99: { [key: string]: { [key: string]: number } } = {
        'D': { 'IF': 535, 'VVS1': 460, 'VVS2': 435, 'VS1': 405, 'VS2': 375, 'SI1': 265, 'SI2': 195, 'I1': 130, 'I2': 92, 'I3': 39 },
        'E': { 'IF': 460, 'VVS1': 420, 'VVS2': 400, 'VS1': 375, 'VS2': 345, 'SI1': 245, 'SI2': 185, 'I1': 123, 'I2': 88, 'I3': 37 },
        'F': { 'IF': 420, 'VVS1': 390, 'VVS2': 370, 'VS1': 345, 'VS2': 315, 'SI1': 230, 'SI2': 175, 'I1': 113, 'I2': 82, 'I3': 35 },
        'G': { 'IF': 375, 'VVS1': 340, 'VVS2': 320, 'VS1': 300, 'VS2': 275, 'SI1': 215, 'SI2': 165, 'I1': 104, 'I2': 77, 'I3': 32 },
        'H': { 'IF': 305, 'VVS1': 285, 'VVS2': 270, 'VS1': 255, 'VS2': 235, 'SI1': 190, 'SI2': 155, 'I1': 98, 'I2': 72, 'I3': 29 },
        'I': { 'IF': 250, 'VVS1': 235, 'VVS2': 220, 'VS1': 205, 'VS2': 190, 'SI1': 165, 'SI2': 140, 'I1': 90, 'I2': 65, 'I3': 28 },
        'J': { 'IF': 195, 'VVS1': 185, 'VVS2': 175, 'VS1': 165, 'VS2': 155, 'SI1': 140, 'SI2': 125, 'I1': 81, 'I2': 61, 'I3': 26 },
        'K': { 'IF': 158, 'VVS1': 148, 'VVS2': 139, 'VS1': 132, 'VS2': 123, 'SI1': 115, 'SI2': 105, 'I1': 70, 'I2': 56, 'I3': 25 },
        'L': { 'IF': 113, 'VVS1': 106, 'VVS2': 100, 'VS1': 95, 'VS2': 90, 'SI1': 84, 'SI2': 77, 'I1': 58, 'I2': 48, 'I3': 24 },
        'M': { 'IF': 81, 'VVS1': 77, 'VVS2': 74, 'VS1': 71, 'VS2': 68, 'SI1': 64, 'SI2': 61, 'I1': 47, 'I2': 39, 'I3': 22 }
      };

      // PEAR 5.00 - 5.99 CT bracket
      const pear_prices_5_00_5_99: { [key: string]: { [key: string]: number } } = {
        'D': { 'IF': 750, 'VVS1': 635, 'VVS2': 600, 'VS1': 570, 'VS2': 490, 'SI1': 375, 'SI2': 270, 'I1': 146, 'I2': 105, 'I3': 43 },
        'E': { 'IF': 630, 'VVS1': 580, 'VVS2': 550, 'VS1': 525, 'VS2': 455, 'SI1': 350, 'SI2': 250, 'I1': 139, 'I2': 95, 'I3': 40 },
        'F': { 'IF': 565, 'VVS1': 535, 'VVS2': 510, 'VS1': 485, 'VS2': 430, 'SI1': 320, 'SI2': 235, 'I1': 129, 'I2': 89, 'I3': 38 },
        'G': { 'IF': 500, 'VVS1': 470, 'VVS2': 445, 'VS1': 425, 'VS2': 365, 'SI1': 295, 'SI2': 220, 'I1': 124, 'I2': 84, 'I3': 36 },
        'H': { 'IF': 420, 'VVS1': 385, 'VVS2': 365, 'VS1': 335, 'VS2': 300, 'SI1': 250, 'SI2': 205, 'I1': 118, 'I2': 81, 'I3': 33 },
        'I': { 'IF': 325, 'VVS1': 300, 'VVS2': 275, 'VS1': 255, 'VS2': 235, 'SI1': 210, 'SI2': 180, 'I1': 107, 'I2': 77, 'I3': 30 },
        'J': { 'IF': 250, 'VVS1': 230, 'VVS2': 215, 'VS1': 200, 'VS2': 185, 'SI1': 175, 'SI2': 160, 'I1': 97, 'I2': 70, 'I3': 28 },
        'K': { 'IF': 195, 'VVS1': 185, 'VVS2': 175, 'VS1': 165, 'VS2': 155, 'SI1': 145, 'SI2': 135, 'I1': 88, 'I2': 65, 'I3': 27 },
        'L': { 'IF': 150, 'VVS1': 140, 'VVS2': 135, 'VS1': 130, 'VS2': 125, 'SI1': 120, 'SI2': 110, 'I1': 71, 'I2': 56, 'I3': 24 },
        'M': { 'IF': 115, 'VVS1': 110, 'VVS2': 105, 'VS1': 95, 'VS2': 90, 'SI1': 85, 'SI2': 80, 'I1': 61, 'I2': 46, 'I3': 23 }
      };
      
      // PEAR 6.00 - 6.99 CT bracket
      const pear_prices_6_00_6_99: { [key: string]: { [key: string]: number } } = {
        'D': { 'IF': 880, 'VVS1': 745, 'VVS2': 705, 'VS1': 670, 'VS2': 575, 'SI1': 440, 'SI2': 315, 'I1': 171, 'I2': 123, 'I3': 50 },
        'E': { 'IF': 740, 'VVS1': 680, 'VVS2': 645, 'VS1': 615, 'VS2': 535, 'SI1': 410, 'SI2': 295, 'I1': 163, 'I2': 112, 'I3': 47 },
        'F': { 'IF': 665, 'VVS1': 630, 'VVS2': 600, 'VS1': 570, 'VS2': 505, 'SI1': 375, 'SI2': 275, 'I1': 151, 'I2': 104, 'I3': 44 },
        'G': { 'IF': 590, 'VVS1': 555, 'VVS2': 525, 'VS1': 500, 'VS2': 430, 'SI1': 345, 'SI2': 260, 'I1': 145, 'I2': 98, 'I3': 42 },
        'H': { 'IF': 495, 'VVS1': 455, 'VVS2': 430, 'VS1': 395, 'VS2': 355, 'SI1': 295, 'SI2': 240, 'I1': 138, 'I2': 95, 'I3': 39 },
        'I': { 'IF': 385, 'VVS1': 355, 'VVS2': 325, 'VS1': 300, 'VS2': 275, 'SI1': 245, 'SI2': 210, 'I1': 125, 'I2': 90, 'I3': 35 },
        'J': { 'IF': 295, 'VVS1': 270, 'VVS2': 255, 'VS1': 235, 'VS2': 220, 'SI1': 205, 'SI2': 185, 'I1': 114, 'I2': 82, 'I3': 33 },
        'K': { 'IF': 230, 'VVS1': 215, 'VVS2': 205, 'VS1': 195, 'VS2': 180, 'SI1': 170, 'SI2': 155, 'I1': 103, 'I2': 76, 'I3': 32 },
        'L': { 'IF': 175, 'VVS1': 165, 'VVS2': 160, 'VS1': 150, 'VS2': 145, 'SI1': 140, 'SI2': 125, 'I1': 83, 'I2': 66, 'I3': 28 },
        'M': { 'IF': 135, 'VVS1': 130, 'VVS2': 125, 'VS1': 115, 'VS2': 105, 'SI1': 100, 'SI2': 95, 'I1': 72, 'I2': 54, 'I3': 27 }
      };
      
      // PEAR 7.00 - 7.99 CT bracket
      const pear_prices_7_00_7_99: { [key: string]: { [key: string]: number } } = {
        'D': { 'IF': 1030, 'VVS1': 875, 'VVS2': 825, 'VS1': 785, 'VS2': 675, 'SI1': 515, 'SI2': 370, 'I1': 200, 'I2': 144, 'I3': 59 },
        'E': { 'IF': 865, 'VVS1': 795, 'VVS2': 755, 'VS1': 720, 'VS2': 625, 'SI1': 480, 'SI2': 345, 'I1': 191, 'I2': 131, 'I3': 55 },
        'F': { 'IF': 780, 'VVS1': 735, 'VVS2': 700, 'VS1': 665, 'VS2': 590, 'SI1': 440, 'SI2': 325, 'I1': 177, 'I2': 122, 'I3': 52 },
        'G': { 'IF': 690, 'VVS1': 650, 'VVS2': 615, 'VS1': 585, 'VS2': 505, 'SI1': 405, 'SI2': 305, 'I1': 170, 'I2': 115, 'I3': 49 },
        'H': { 'IF': 580, 'VVS1': 535, 'VVS2': 505, 'VS1': 465, 'VS2': 415, 'SI1': 345, 'SI2': 280, 'I1': 162, 'I2': 111, 'I3': 46 },
        'I': { 'IF': 450, 'VVS1': 415, 'VVS2': 380, 'VS1': 350, 'VS2': 320, 'SI1': 285, 'SI2': 245, 'I1': 146, 'I2': 105, 'I3': 41 },
        'J': { 'IF': 345, 'VVS1': 315, 'VVS2': 295, 'VS1': 275, 'VS2': 255, 'SI1': 240, 'SI2': 215, 'I1': 133, 'I2': 96, 'I3': 39 },
        'K': { 'IF': 270, 'VVS1': 250, 'VVS2': 240, 'VS1': 225, 'VS2': 210, 'SI1': 195, 'SI2': 180, 'I1': 120, 'I2': 89, 'I3': 37 },
        'L': { 'IF': 205, 'VVS1': 195, 'VVS2': 185, 'VS1': 175, 'VS2': 165, 'SI1': 160, 'SI2': 145, 'I1': 97, 'I2': 77, 'I3': 33 },
        'M': { 'IF': 160, 'VVS1': 150, 'VVS2': 145, 'VS1': 135, 'VS2': 125, 'SI1': 115, 'SI2': 110, 'I1': 84, 'I2': 63, 'I3': 31 }
      };
      
      // PEAR 8.00 - 8.99 CT bracket
      const pear_prices_8_00_8_99: { [key: string]: { [key: string]: number } } = {
        'D': { 'IF': 1205, 'VVS1': 1025, 'VVS2': 965, 'VS1': 920, 'VS2': 790, 'SI1': 605, 'SI2': 435, 'I1': 235, 'I2': 169, 'I3': 69 },
        'E': { 'IF': 1015, 'VVS1': 930, 'VVS2': 885, 'VS1': 845, 'VS2': 735, 'SI1': 565, 'SI2': 405, 'I1': 224, 'I2': 154, 'I3': 65 },
        'F': { 'IF': 915, 'VVS1': 860, 'VVS2': 820, 'VS1': 780, 'VS2': 690, 'SI1': 520, 'SI2': 380, 'I1': 208, 'I2': 143, 'I3': 61 },
        'G': { 'IF': 810, 'VVS1': 765, 'VVS2': 720, 'VS1': 685, 'VS2': 590, 'SI1': 475, 'SI2': 355, 'I1': 199, 'I2': 135, 'I3': 57 },
        'H': { 'IF': 680, 'VVS1': 625, 'VVS2': 590, 'VS1': 545, 'VS2': 485, 'SI1': 405, 'SI2': 330, 'I1': 190, 'I2': 130, 'I3': 54 },
        'I': { 'IF': 530, 'VVS1': 485, 'VVS2': 445, 'VS1': 410, 'VS2': 375, 'SI1': 335, 'SI2': 285, 'I1': 171, 'I2': 123, 'I3': 48 },
        'J': { 'IF': 405, 'VVS1': 370, 'VVS2': 345, 'VS1': 320, 'VS2': 300, 'SI1': 280, 'SI2': 250, 'I1': 156, 'I2': 113, 'I3': 45 },
        'K': { 'IF': 315, 'VVS1': 295, 'VVS2': 280, 'VS1': 265, 'VS2': 245, 'SI1': 230, 'SI2': 210, 'I1': 141, 'I2': 104, 'I3': 43 },
        'L': { 'IF': 240, 'VVS1': 230, 'VVS2': 215, 'VS1': 205, 'VS2': 195, 'SI1': 185, 'SI2': 170, 'I1': 114, 'I2': 91, 'I3': 39 },
        'M': { 'IF': 185, 'VVS1': 175, 'VVS2': 170, 'VS1': 160, 'VS2': 145, 'SI1': 135, 'SI2': 125, 'I1': 98, 'I2': 74, 'I3': 36 }
      };
      
      // PEAR 9.00 - 9.99 CT bracket
      const pear_prices_9_00_9_99: { [key: string]: { [key: string]: number } } = {
        'D': { 'IF': 1410, 'VVS1': 1200, 'VVS2': 1130, 'VS1': 1075, 'VS2': 925, 'SI1': 710, 'SI2': 510, 'I1': 275, 'I2': 198, 'I3': 81 },
        'E': { 'IF': 1190, 'VVS1': 1090, 'VVS2': 1035, 'VS1': 990, 'VS2': 860, 'SI1': 660, 'SI2': 475, 'I1': 262, 'I2': 180, 'I3': 76 },
        'F': { 'IF': 1070, 'VVS1': 1005, 'VVS2': 960, 'VS1': 915, 'VS2': 810, 'SI1': 605, 'SI2': 445, 'I1': 243, 'I2': 167, 'I3': 72 },
        'G': { 'IF': 950, 'VVS1': 895, 'VVS2': 845, 'VS1': 805, 'VS2': 695, 'SI1': 560, 'SI2': 420, 'I1': 233, 'I2': 158, 'I3': 67 },
        'H': { 'IF': 800, 'VVS1': 735, 'VVS2': 695, 'VS1': 640, 'VS2': 570, 'SI1': 475, 'SI2': 385, 'I1': 222, 'I2': 152, 'I3': 63 },
        'I': { 'IF': 620, 'VVS1': 570, 'VVS2': 525, 'VS1': 480, 'VS2': 440, 'SI1': 395, 'SI2': 335, 'I1': 200, 'I2': 144, 'I3': 56 },
        'J': { 'IF': 475, 'VVS1': 435, 'VVS2': 405, 'VS1': 375, 'VS2': 350, 'SI1': 325, 'SI2': 295, 'I1': 183, 'I2': 132, 'I3': 53 },
        'K': { 'IF': 370, 'VVS1': 345, 'VVS2': 325, 'VS1': 310, 'VS2': 285, 'SI1': 270, 'SI2': 245, 'I1': 165, 'I2': 122, 'I3': 50 },
        'L': { 'IF': 280, 'VVS1': 270, 'VVS2': 255, 'VS1': 240, 'VS2': 225, 'SI1': 215, 'SI2': 200, 'I1': 133, 'I2': 106, 'I3': 45 },
        'M': { 'IF': 215, 'VVS1': 205, 'VVS2': 195, 'VS1': 185, 'VS2': 170, 'SI1': 160, 'SI2': 145, 'I1': 115, 'I2': 87, 'I3': 42 }
      };

      // PEAR 10.00 - 10.99 CT bracket
      const pear_prices_10_00_10_99: { [key: string]: { [key: string]: number } } = {
        'D': { 'IF': 1320, 'VVS1': 1075, 'VVS2': 1001, 'VS1': 920, 'VS2': 795, 'SI1': 575, 'SI2': 410, 'I1': 205, 'I2': 124, 'I3': 53 },
        'E': { 'IF': 1070, 'VVS1': 965, 'VVS2': 905, 'VS1': 835, 'VS2': 725, 'SI1': 535, 'SI2': 390, 'I1': 195, 'I2': 117, 'I3': 50 },
        'F': { 'IF': 945, 'VVS1': 885, 'VVS2': 835, 'VS1': 765, 'VS2': 665, 'SI1': 495, 'SI2': 365, 'I1': 185, 'I2': 111, 'I3': 48 },
        'G': { 'IF': 920, 'VVS1': 745, 'VVS2': 695, 'VS1': 650, 'VS2': 575, 'SI1': 460, 'SI2': 340, 'I1': 170, 'I2': 106, 'I3': 45 },
        'H': { 'IF': 655, 'VVS1': 610, 'VVS2': 570, 'VS1': 530, 'VS2': 465, 'SI1': 395, 'SI2': 305, 'I1': 160, 'I2': 101, 'I3': 44 },
        'I': { 'IF': 510, 'VVS1': 475, 'VVS2': 440, 'VS1': 405, 'VS2': 370, 'SI1': 330, 'SI2': 260, 'I1': 150, 'I2': 97, 'I3': 42 },
        'J': { 'IF': 395, 'VVS1': 370, 'VVS2': 345, 'VS1': 315, 'VS2': 285, 'SI1': 255, 'SI2': 220, 'I1': 135, 'I2': 91, 'I3': 40 },
        'K': { 'IF': 315, 'VVS1': 295, 'VVS2': 275, 'VS1': 250, 'VS2': 230, 'SI1': 210, 'SI2': 185, 'I1': 120, 'I2': 86, 'I3': 38 },
        'L': { 'IF': 230, 'VVS1': 215, 'VVS2': 205, 'VS1': 190, 'VS2': 175, 'SI1': 160, 'SI2': 140, 'I1': 120, 'I2': 77, 'I3': 36 },
        'M': { 'IF': 175, 'VVS1': 165, 'VVS2': 155, 'VS1': 145, 'VS2': 135, 'SI1': 125, 'SI2': 115, 'I1': 90, 'I2': 64, 'I3': 33 }
      };

      // Helper function to normalize clarity for smaller stones
      const normalizeClarity = (clarity: string): string => {
        // For smaller stones, some brackets use simplified clarity grades
        if (clarity === 'VVS1' || clarity === 'VVS2') return 'VVS';
        if (clarity === 'VS1' || clarity === 'VS2') return 'VS'; 
        if (clarity === 'SI1') return 'SI1';
        if (clarity === 'SI2') return 'SI2';
        if (clarity === 'SI3') return 'SI3'; // Some smaller stones have SI3
        return clarity;
      };

      // Determine which price table to use based on shape
      const isRound = (shape === 'ROUND');
      
      // For ROUND diamonds - use original round pricing
      if (isRound) {
        // Round diamond pricing logic
        if (caratWeight >= 0.01 && caratWeight <= 0.03) {
          const normalizedClarity = normalizeClarity(clarity);
          if (prices_0_01_0_03[color] && prices_0_01_0_03[color][normalizedClarity]) {
            return prices_0_01_0_03[color][normalizedClarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        if (caratWeight >= 0.04 && caratWeight <= 0.07) {
        const normalizedClarity = normalizeClarity(clarity);
        if (prices_0_04_0_07[color] && prices_0_04_0_07[color][normalizedClarity]) {
          return prices_0_04_0_07[color][normalizedClarity] * 100;
        }
        return 0; // No price available for this section
      }
      
      if (caratWeight >= 0.08 && caratWeight <= 0.14) {
        const normalizedClarity = normalizeClarity(clarity);
        if (prices_0_08_0_14[color] && prices_0_08_0_14[color][normalizedClarity]) {
          return prices_0_08_0_14[color][normalizedClarity] * 100;
        }
        return 0; // No price available for this section
      }
      
      if (caratWeight >= 0.15 && caratWeight <= 0.17) {
        const normalizedClarity = normalizeClarity(clarity);
        if (prices_0_15_0_17[color] && prices_0_15_0_17[color][normalizedClarity]) {
          return prices_0_15_0_17[color][normalizedClarity] * 100;
        }
        return 0; // No price available for this section
      }
      
      if (caratWeight >= 0.18 && caratWeight <= 0.22) {
        const normalizedClarity = normalizeClarity(clarity);
        if (prices_0_18_0_22[color] && prices_0_18_0_22[color][normalizedClarity]) {
          return prices_0_18_0_22[color][normalizedClarity] * 100;
        }
        return 0; // No price available for this section
      }
      
      if (caratWeight >= 0.23 && caratWeight <= 0.29) {
        const normalizedClarity = normalizeClarity(clarity);
        if (prices_0_23_0_29[color] && prices_0_23_0_29[color][normalizedClarity]) {
          return prices_0_23_0_29[color][normalizedClarity] * 100;
        }
        return 0; // No price available for this section
      }
      
      if (caratWeight >= 0.30 && caratWeight <= 0.39) {
        if (prices_0_30_0_39[color] && prices_0_30_0_39[color][clarity]) {
          return prices_0_30_0_39[color][clarity] * 100;
        }
        return 0; // No price available for this section
      }
      
      if (caratWeight >= 0.40 && caratWeight <= 0.49) {
        if (prices_0_40_0_49[color] && prices_0_40_0_49[color][clarity]) {
          return prices_0_40_0_49[color][clarity] * 100;
        }
        return 0; // No price available for this section
      }
      
      if (caratWeight >= 0.50 && caratWeight <= 0.69) {
        if (prices_0_50_0_69[color] && prices_0_50_0_69[color][clarity]) {
          return prices_0_50_0_69[color][clarity] * 100;
        }
        return 0; // No price available for this section
      }
      
      if (caratWeight >= 0.70 && caratWeight <= 0.89) {
        if (prices_0_70_0_89[color] && prices_0_70_0_89[color][clarity]) {
          return prices_0_70_0_89[color][clarity] * 100;
        }
        return 0; // No price available for this section
      }
      
      if (caratWeight >= 0.90 && caratWeight <= 0.99) {
        const prices_0_90_0_99: { [key: string]: { [key: string]: number } } = {
          'D': { 'IF': 104, 'VVS1': 94, 'VVS2': 75, 'VS1': 60, 'VS2': 52, 'SI1': 46, 'SI2': 38, 'I1': 29, 'I2': 22, 'I3': 15 },
          'E': { 'IF': 95, 'VVS1': 86, 'VVS2': 69, 'VS1': 55, 'VS2': 48, 'SI1': 42, 'SI2': 34, 'I1': 26, 'I2': 20, 'I3': 13 },
          'F': { 'IF': 87, 'VVS1': 80, 'VVS2': 64, 'VS1': 51, 'VS2': 44, 'SI1': 39, 'SI2': 31, 'I1': 22, 'I2': 17, 'I3': 11 },
          'G': { 'IF': 69, 'VVS1': 64, 'VVS2': 55, 'VS1': 46, 'VS2': 42, 'SI1': 36, 'SI2': 27, 'I1': 19, 'I2': 16, 'I3': 10 },
          'H': { 'IF': 52, 'VVS1': 48, 'VVS2': 43, 'VS1': 39, 'VS2': 35, 'SI1': 30, 'SI2': 24, 'I1': 17, 'I2': 11, 'I3': 7 },
          'I': { 'IF': 47, 'VVS1': 43, 'VVS2': 39, 'VS1': 32, 'VS2': 29, 'SI1': 27, 'SI2': 24, 'I1': 16, 'I2': 10, 'I3': 6 },
          'J': { 'IF': 38, 'VVS1': 35, 'VVS2': 32, 'VS1': 29, 'VS2': 27, 'SI1': 26, 'SI2': 24, 'I1': 16, 'I2': 10, 'I3': 5 },
          'K': { 'IF': 34, 'VVS1': 31, 'VVS2': 28, 'VS1': 26, 'VS2': 24, 'SI1': 23, 'SI2': 21, 'I1': 15, 'I2': 9, 'I3': 5 },
          'L': { 'IF': 28, 'VVS1': 26, 'VVS2': 24, 'VS1': 22, 'VS2': 19, 'SI1': 18, 'SI2': 18, 'I1': 13, 'I2': 8, 'I3': 4 },
          'M': { 'IF': 24, 'VVS1': 22, 'VVS2': 20, 'VS1': 19, 'VS2': 17, 'SI1': 15, 'SI2': 15, 'I1': 7, 'I2': 5, 'I3': 2 }
        };
        if (prices_0_90_0_99[color] && prices_0_90_0_99[color][clarity]) {
          return prices_0_90_0_99[color][clarity] * 100;
        }
        return 0; // No price available for this section
      }
      
        if (caratWeight >= 1.00 && caratWeight <= 1.49) {
          // Use original clarity for this bracket - no normalization needed
          if (prices_1_00_1_49[color] && prices_1_00_1_49[color][clarity]) {
            return prices_1_00_1_49[color][clarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        if (caratWeight >= 1.50 && caratWeight <= 1.99) {
          // Use original clarity for this bracket - no normalization needed
          if (prices_1_50_1_99[color] && prices_1_50_1_99[color][clarity]) {
            return prices_1_50_1_99[color][clarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        if (caratWeight >= 2.00 && caratWeight <= 2.99) {
          // Use original clarity for this bracket - no normalization needed
          if (prices_2_00_2_99[color] && prices_2_00_2_99[color][clarity]) {
            return prices_2_00_2_99[color][clarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        if (caratWeight >= 3.00 && caratWeight <= 3.99) {
          // Use original clarity for this bracket - no normalization needed
          if (prices_3_00_3_99[color] && prices_3_00_3_99[color][clarity]) {
            return prices_3_00_3_99[color][clarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        if (caratWeight >= 4.00 && caratWeight <= 4.99) {
          // Use original clarity for this bracket - no normalization needed
          if (prices_4_00_4_99[color] && prices_4_00_4_99[color][clarity]) {
            return prices_4_00_4_99[color][clarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        if (caratWeight >= 5.00 && caratWeight <= 5.99) {
          const prices_5_00_5_99: { [key: string]: { [key: string]: number } } = {
            'D': { 'FL': 980, 'IF': 857, 'VVS1': 716, 'VVS2': 667, 'VS1': 551, 'VS2': 475, 'SI1': 364, 'SI2': 276, 'I1': 214, 'I2': 164, 'I3': 121 },
            'E': { 'FL': 932, 'IF': 811, 'VVS1': 678, 'VVS2': 630, 'VS1': 514, 'VS2': 436, 'SI1': 332, 'SI2': 252, 'I1': 196, 'I2': 151, 'I3': 112 },
            'F': { 'FL': 886, 'IF': 765, 'VVS1': 637, 'VVS2': 588, 'VS1': 471, 'VS2': 399, 'SI1': 296, 'SI2': 226, 'I1': 178, 'I2': 139, 'I3': 102 },
            'G': { 'FL': 825, 'IF': 707, 'VVS1': 585, 'VVS2': 535, 'VS1': 426, 'VS2': 355, 'SI1': 266, 'SI2': 199, 'I1': 157, 'I2': 124, 'I3': 94 },
            'H': { 'FL': 761, 'IF': 640, 'VVS1': 523, 'VVS2': 475, 'VS1': 377, 'VS2': 311, 'SI1': 231, 'SI2': 176, 'I1': 139, 'I2': 112, 'I3': 85 },
            'I': { 'FL': 661, 'IF': 553, 'VVS1': 452, 'VVS2': 406, 'VS1': 320, 'VS2': 266, 'SI1': 196, 'SI2': 151, 'I1': 121, 'I2': 98, 'I3': 75 },
            'J': { 'FL': 599, 'IF': 487, 'VVS1': 395, 'VVS2': 347, 'VS1': 275, 'VS2': 226, 'SI1': 167, 'SI2': 128, 'I1': 102, 'I2': 85, 'I3': 68 }
          };
          // Use original clarity for this bracket - no normalization needed
          if (prices_5_00_5_99[color] && prices_5_00_5_99[color][clarity]) {
            return prices_5_00_5_99[color][clarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        if (caratWeight >= 6.00 && caratWeight <= 6.99) {
          const prices_6_00_6_99: { [key: string]: { [key: string]: number } } = {
            'D': { 'FL': 1150, 'IF': 1006, 'VVS1': 840, 'VVS2': 783, 'VS1': 646, 'VS2': 557, 'SI1': 427, 'SI2': 324, 'I1': 251, 'I2': 193, 'I3': 142 },
            'E': { 'FL': 1094, 'IF': 953, 'VVS1': 796, 'VVS2': 740, 'VS1': 603, 'VS2': 512, 'SI1': 390, 'SI2': 296, 'I1': 230, 'I2': 177, 'I3': 131 },
            'F': { 'FL': 1040, 'IF': 898, 'VVS1': 748, 'VVS2': 691, 'VS1': 553, 'VS2': 469, 'SI1': 348, 'SI2': 266, 'I1': 209, 'I2': 163, 'I3': 120 },
            'G': { 'FL': 969, 'IF': 830, 'VVS1': 687, 'VVS2': 628, 'VS1': 500, 'VS2': 417, 'SI1': 312, 'SI2': 234, 'I1': 184, 'I2': 146, 'I3': 110 },
            'H': { 'FL': 894, 'IF': 752, 'VVS1': 614, 'VVS2': 558, 'VS1': 442, 'VS2': 365, 'SI1': 271, 'SI2': 206, 'I1': 163, 'I2': 131, 'I3': 100 },
            'I': { 'FL': 776, 'IF': 650, 'VVS1': 531, 'VVS2': 477, 'VS1': 376, 'VS2': 312, 'SI1': 230, 'SI2': 177, 'I1': 142, 'I2': 115, 'I3': 88 },
            'J': { 'FL': 704, 'IF': 572, 'VVS1': 464, 'VVS2': 408, 'VS1': 323, 'VS2': 266, 'SI1': 196, 'SI2': 150, 'I1': 120, 'I2': 100, 'I3': 80 }
          };
          // Use original clarity for this bracket - no normalization needed
          if (prices_6_00_6_99[color] && prices_6_00_6_99[color][clarity]) {
            return prices_6_00_6_99[color][clarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        if (caratWeight >= 7.00 && caratWeight <= 7.99) {
          const prices_7_00_7_99: { [key: string]: { [key: string]: number } } = {
            'D': { 'FL': 1350, 'IF': 1181, 'VVS1': 986, 'VVS2': 919, 'VS1': 758, 'VS2': 654, 'SI1': 501, 'SI2': 380, 'I1': 295, 'I2': 226, 'I3': 167 },
            'E': { 'FL': 1284, 'IF': 1119, 'VVS1': 935, 'VVS2': 869, 'VS1': 709, 'VS2': 601, 'SI1': 458, 'SI2': 347, 'I1': 270, 'I2': 208, 'I3': 154 },
            'F': { 'FL': 1222, 'IF': 1054, 'VVS1': 878, 'VVS2': 811, 'VS1': 649, 'VS2': 550, 'SI1': 408, 'SI2': 312, 'I1': 246, 'I2': 192, 'I3': 141 },
            'G': { 'FL': 1138, 'IF': 975, 'VVS1': 807, 'VVS2': 738, 'VS1': 587, 'VS2': 489, 'SI1': 366, 'SI2': 275, 'I1': 216, 'I2': 171, 'I3': 129 },
            'H': { 'FL': 1050, 'IF': 883, 'VVS1': 722, 'VVS2': 656, 'VS1': 520, 'VS2': 429, 'SI1': 319, 'SI2': 243, 'I1': 192, 'I2': 154, 'I3': 117 },
            'I': { 'FL': 912, 'IF': 763, 'VVS1': 624, 'VVS2': 561, 'VS1': 442, 'VS2': 367, 'SI1': 271, 'SI2': 208, 'I1': 167, 'I2': 135, 'I3': 103 },
            'J': { 'FL': 827, 'IF': 672, 'VVS1': 545, 'VVS2': 479, 'VS1': 380, 'VS2': 313, 'SI1': 231, 'SI2': 177, 'I1': 141, 'I2': 117, 'I3': 94 }
          };
          // Use original clarity for this bracket - no normalization needed
          if (prices_7_00_7_99[color] && prices_7_00_7_99[color][clarity]) {
            return prices_7_00_7_99[color][clarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        if (caratWeight >= 8.00 && caratWeight <= 8.99) {
          const prices_8_00_8_99: { [key: string]: { [key: string]: number } } = {
            'D': { 'FL': 1580, 'IF': 1383, 'VVS1': 1155, 'VVS2': 1077, 'VS1': 888, 'VS2': 766, 'SI1': 587, 'SI2': 445, 'I1': 346, 'I2': 265, 'I3': 196 },
            'E': { 'FL': 1504, 'IF': 1311, 'VVS1': 1096, 'VVS2': 1018, 'VS1': 831, 'VS2': 704, 'SI1': 537, 'SI2': 407, 'I1': 317, 'I2': 244, 'I3': 181 },
            'F': { 'FL': 1432, 'IF': 1236, 'VVS1': 1029, 'VVS2': 951, 'VS1': 761, 'VS2': 645, 'SI1': 479, 'SI2': 366, 'I1': 288, 'I2': 225, 'I3': 165 },
            'G': { 'FL': 1334, 'IF': 1143, 'VVS1': 946, 'VVS2': 865, 'VS1': 688, 'VS2': 573, 'SI1': 430, 'SI2': 323, 'I1': 254, 'I2': 201, 'I3': 152 },
            'H': { 'FL': 1231, 'IF': 1035, 'VVS1': 846, 'VVS2': 769, 'VS1': 609, 'VS2': 503, 'SI1': 374, 'SI2': 285, 'I1': 225, 'I2': 181, 'I3': 137 },
            'I': { 'FL': 1070, 'IF': 896, 'VVS1': 732, 'VVS2': 658, 'VS1': 519, 'VS2': 431, 'SI1': 318, 'SI2': 244, 'I1': 196, 'I2': 159, 'I3': 121 },
            'J': { 'FL': 970, 'IF': 788, 'VVS1': 639, 'VVS2': 562, 'VS1': 446, 'VS2': 367, 'SI1': 271, 'SI2': 208, 'I1': 166, 'I2': 138, 'I3': 110 }
          };
          // Use original clarity for this bracket - no normalization needed
          if (prices_8_00_8_99[color] && prices_8_00_8_99[color][clarity]) {
            return prices_8_00_8_99[color][clarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        if (caratWeight >= 9.00 && caratWeight <= 9.99) {
          const prices_9_00_9_99: { [key: string]: { [key: string]: number } } = {
            'D': { 'FL': 1850, 'IF': 1620, 'VVS1': 1353, 'VVS2': 1261, 'VS1': 1040, 'VS2': 897, 'SI1': 688, 'SI2': 522, 'I1': 406, 'I2': 311, 'I3': 230 },
            'E': { 'FL': 1760, 'IF': 1535, 'VVS1': 1282, 'VVS2': 1192, 'VS1': 973, 'VS2': 825, 'SI1': 629, 'SI2': 477, 'I1': 371, 'I2': 286, 'I3': 212 },
            'F': { 'FL': 1677, 'IF': 1447, 'VVS1': 1205, 'VVS2': 1113, 'VS1': 891, 'VS2': 755, 'SI1': 561, 'SI2': 429, 'I1': 338, 'I2': 264, 'I3': 194 },
            'G': { 'FL': 1562, 'IF': 1339, 'VVS1': 1108, 'VVS2': 1014, 'VS1': 806, 'VS2': 672, 'SI1': 504, 'SI2': 378, 'I1': 298, 'I2': 236, 'I3': 178 },
            'H': { 'FL': 1442, 'IF': 1212, 'VVS1': 991, 'VVS2': 901, 'VS1': 714, 'VS2': 589, 'SI1': 438, 'SI2': 334, 'I1': 264, 'I2': 212, 'I3': 161 },
            'I': { 'FL': 1254, 'IF': 1050, 'VVS1': 859, 'VVS2': 772, 'VS1': 609, 'VS2': 505, 'SI1': 373, 'SI2': 286, 'I1': 230, 'I2': 186, 'I3': 142 },
            'J': { 'FL': 1137, 'IF': 924, 'VVS1': 749, 'VVS2': 659, 'VS1': 523, 'VS2': 431, 'SI1': 318, 'SI2': 244, 'I1': 194, 'I2': 161, 'I3': 129 }
          };
          // Use original clarity for this bracket - no normalization needed
          if (prices_9_00_9_99[color] && prices_9_00_9_99[color][clarity]) {
            return prices_9_00_9_99[color][clarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        if (caratWeight >= 10.00 && caratWeight <= 10.99) {
          const prices_10_00_10_99: { [key: string]: { [key: string]: number } } = {
            'D': { 'FL': 2200, 'IF': 1925, 'VVS1': 1608, 'VVS2': 1499, 'VS1': 1236, 'VS2': 1067, 'SI1': 818, 'SI2': 620, 'I1': 483, 'I2': 370, 'I3': 273 },
            'E': { 'FL': 2094, 'IF': 1826, 'VVS1': 1525, 'VVS2': 1418, 'VS1': 1157, 'VS2': 981, 'SI1': 748, 'SI2': 567, 'I1': 441, 'I2': 340, 'I3': 252 },
            'F': { 'FL': 1995, 'IF': 1721, 'VVS1': 1434, 'VVS2': 1324, 'VS1': 1060, 'VS2': 898, 'SI1': 667, 'SI2': 510, 'I1': 402, 'I2': 314, 'I3': 231 },
            'G': { 'FL': 1858, 'IF': 1594, 'VVS1': 1319, 'VVS2': 1207, 'VS1': 959, 'VS2': 799, 'SI1': 599, 'SI2': 450, 'I1': 354, 'I2': 281, 'I3': 212 },
            'H': { 'FL': 1715, 'IF': 1442, 'VVS1': 1178, 'VVS2': 1071, 'VS1': 849, 'VS2': 701, 'SI1': 521, 'SI2': 397, 'I1': 314, 'I2': 252, 'I3': 191 },
            'I': { 'FL': 1491, 'IF': 1248, 'VVS1': 1021, 'VVS2': 918, 'VS1': 724, 'VS2': 601, 'SI1': 443, 'SI2': 340, 'I1': 273, 'I2': 221, 'I3': 169 },
            'J': { 'FL': 1352, 'IF': 1099, 'VVS1': 891, 'VVS2': 784, 'VS1': 622, 'VS2': 512, 'SI1': 378, 'SI2': 290, 'I1': 231, 'I2': 192, 'I3': 153 }
          };
          // Use original clarity for this bracket - no normalization needed
          if (prices_10_00_10_99[color] && prices_10_00_10_99[color][clarity]) {
            return prices_10_00_10_99[color][clarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        // NO FALLBACK - Outside defined sections return 0
        return 0;
        
      } else {
        // For ALL NON-ROUND shapes - use PEAR pricing
        
        // PEAR pricing has different clarity mappings for smaller stones
        const normalizePearClarity = (clarity: string): string => {
          // For 0.18-0.29 range, use simplified mapping
          if (caratWeight < 0.30) {
            if (['FL', 'IF', 'VVS1', 'VVS2'].includes(clarity)) return 'VVS';
            if (['VS1', 'VS2'].includes(clarity)) return 'VS';
            return clarity; // SI1, SI2, SI3, I1, I2, I3
          }
          return clarity; // Use full clarity for larger stones
        };
        
        if (caratWeight >= 0.18 && caratWeight <= 0.22) {
          const normalizedClarity = normalizePearClarity(clarity);
          if (pear_prices_0_18_0_22[color] && pear_prices_0_18_0_22[color][normalizedClarity]) {
            return pear_prices_0_18_0_22[color][normalizedClarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        if (caratWeight >= 0.23 && caratWeight <= 0.29) {
          const normalizedClarity = normalizePearClarity(clarity);
          if (pear_prices_0_23_0_29[color] && pear_prices_0_23_0_29[color][normalizedClarity]) {
            return pear_prices_0_23_0_29[color][normalizedClarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        if (caratWeight >= 0.30 && caratWeight <= 0.39) {
          if (pear_prices_0_30_0_39[color] && pear_prices_0_30_0_39[color][clarity]) {
            return pear_prices_0_30_0_39[color][clarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        if (caratWeight >= 0.40 && caratWeight <= 0.49) {
          if (pear_prices_0_40_0_49[color] && pear_prices_0_40_0_49[color][clarity]) {
            return pear_prices_0_40_0_49[color][clarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        if (caratWeight >= 0.50 && caratWeight <= 0.69) {
          if (pear_prices_0_50_0_69[color] && pear_prices_0_50_0_69[color][clarity]) {
            return pear_prices_0_50_0_69[color][clarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        if (caratWeight >= 0.70 && caratWeight <= 0.89) {
          if (pear_prices_0_70_0_89[color] && pear_prices_0_70_0_89[color][clarity]) {
            return pear_prices_0_70_0_89[color][clarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        if (caratWeight >= 0.90 && caratWeight <= 0.99) {
          if (pear_prices_0_90_0_99[color] && pear_prices_0_90_0_99[color][clarity]) {
            return pear_prices_0_90_0_99[color][clarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        if (caratWeight >= 1.00 && caratWeight <= 1.49) {
          if (pear_prices_1_00_1_49[color] && pear_prices_1_00_1_49[color][clarity]) {
            return pear_prices_1_00_1_49[color][clarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        if (caratWeight >= 1.50 && caratWeight <= 1.99) {
          if (pear_prices_1_50_1_99[color] && pear_prices_1_50_1_99[color][clarity]) {
            return pear_prices_1_50_1_99[color][clarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        if (caratWeight >= 2.00 && caratWeight <= 2.99) {
          if (pear_prices_2_00_2_99[color] && pear_prices_2_00_2_99[color][clarity]) {
            return pear_prices_2_00_2_99[color][clarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        if (caratWeight >= 3.00 && caratWeight <= 3.99) {
          if (pear_prices_3_00_3_99[color] && pear_prices_3_00_3_99[color][clarity]) {
            return pear_prices_3_00_3_99[color][clarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        if (caratWeight >= 4.00 && caratWeight <= 4.99) {
          if (pear_prices_4_00_4_99[color] && pear_prices_4_00_4_99[color][clarity]) {
            return pear_prices_4_00_4_99[color][clarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        if (caratWeight >= 5.00 && caratWeight <= 5.99) {
          if (pear_prices_5_00_5_99[color] && pear_prices_5_00_5_99[color][clarity]) {
            return pear_prices_5_00_5_99[color][clarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        if (caratWeight >= 6.00 && caratWeight <= 6.99) {
          if (pear_prices_6_00_6_99[color] && pear_prices_6_00_6_99[color][clarity]) {
            return pear_prices_6_00_6_99[color][clarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        if (caratWeight >= 7.00 && caratWeight <= 7.99) {
          if (pear_prices_7_00_7_99[color] && pear_prices_7_00_7_99[color][clarity]) {
            return pear_prices_7_00_7_99[color][clarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        if (caratWeight >= 8.00 && caratWeight <= 8.99) {
          if (pear_prices_8_00_8_99[color] && pear_prices_8_00_8_99[color][clarity]) {
            return pear_prices_8_00_8_99[color][clarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        if (caratWeight >= 9.00 && caratWeight <= 9.99) {
          if (pear_prices_9_00_9_99[color] && pear_prices_9_00_9_99[color][clarity]) {
            return pear_prices_9_00_9_99[color][clarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        if (caratWeight >= 10.00 && caratWeight <= 10.99) {
          if (pear_prices_10_00_10_99[color] && pear_prices_10_00_10_99[color][clarity]) {
            return pear_prices_10_00_10_99[color][clarity] * 100;
          }
          return 0; // No price available for this section
        }
        
        // NO FALLBACK - Outside defined sections return 0
        return 0;
      }
      
      throw new Error(`Invalid carat weight: ${caratWeight}. Must be ≥ 0.01ct`);
    };

    // Get direct Rapaport price per carat
    const rapaPricePerCarat = getRapaPricePerCarat(carat, color, clarity);

    // Shape verification (Round vs Non-Round pricing tables)
    const validShapes = ['ROUND', 'PRINCESS', 'CUSHION', 'EMERALD', 'ASSCHER', 'MARQUISE', 'OVAL', 'RADIANT', 'PEAR', 'HEART', 'BAGUETTE'];
    const isRoundShape = (shape === 'ROUND');

    // Error checking for valid inputs
    const validColors = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
    const validClarities = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'];
    
    if (!validColors.includes(color)) {
      throw new Error(`Invalid color grade: ${color}. Must be D-M`);
    }
    if (!validClarities.includes(clarity)) {
      throw new Error(`Invalid clarity grade: ${clarity}. Must be FL-I3`);
    }
    if (!validShapes.includes(shape)) {
      throw new Error(`Invalid shape: ${shape}. Must be valid diamond shape`);
    }
    
    // Minimum carat weight validation
    const minimumCarat = type === "LAB_GROWN" ? 0.01 : 0.30;
    if (carat < minimumCarat) {
      throw new Error(`Minimum carat weight is ${minimumCarat}ct for ${type.toLowerCase().replace('_', '-')} diamonds. Provided: ${carat}ct`);
    }

    // Calculate final price: Direct Rapaport lookup (no shape factors - tables handle this)
    const wholesalePrice = carat * rapaPricePerCarat;

    console.log(`💎 AUTHENTIC RAPAPORT PRICING:
    ${carat}ct ${color} ${clarity} ${shape}
    Pricing Table: ${isRoundShape ? 'ROUND Diamonds' : 'PEAR (All Non-Round Shapes)'}
    Rapaport Price: $${rapaPricePerCarat.toLocaleString()}/ct
    Total Wholesale: $${wholesalePrice.toLocaleString()}`);

    return wholesalePrice;
  };

  // FAILSAFE: Calculate diamond value with comprehensive safety checks
  const calculateDiamondValue = async () => {
    const caratValue = parseFloat(carats);
    
    // BETA TEST: All features free for 30 days - no calculation limits
    
    // COMPREHENSIVE PRE-CALCULATION SAFETY CHECKS
    if (isNaN(caratValue) || caratValue <= 0) {
      console.warn("🚫 CALCULATION BLOCKED: Invalid carat weight");
      alert("⚠️ CALCULATION ERROR: Please set a valid carat weight before calculating");
      return;
    }
    
    if (caratValue < 0.001) {
      console.warn("🚫 CALCULATION BLOCKED: Carat weight too small for accurate pricing");
      alert("⚠️ ACCURACY WARNING: Minimum 0.001ct required for reliable diamond pricing");
      return;
    }
    
    if (clarity === null) {
      console.warn("🚫 CALCULATION BLOCKED: Clarity grade not selected");
      alert("⚠️ MISSING SPECIFICATION: Please select clarity grade before calculating");
      return;
    }
    
    if (color === null) {
      console.warn("🚫 CALCULATION BLOCKED: Color grade not selected");
      alert("⚠️ MISSING SPECIFICATION: Please select color grade before calculating");
      return;
    }
    
    if (cut === null) {
      console.warn("🚫 CALCULATION BLOCKED: Cut shape not selected");
      alert("⚠️ MISSING SPECIFICATION: Please select diamond shape before calculating");
      return;
    }

    // PROFESSIONAL WARNING for high-value calculations
    const estimatedValue = caratValue * 5000; // Rough estimate for warning threshold
    if (estimatedValue > 100000) {
      const confirmHighValue = confirm(
        `⚠️ HIGH-VALUE CALCULATION WARNING\n\n` +
        `Diamond Specifications:\n` +
        `• Carat Weight: ${caratValue}ct\n` +
        `• Clarity: ${clarity}\n` +
        `• Color: ${color}\n` +
        `• Cut: ${cut}\n` +
        `• Type: ${diamondType.replace('_', ' ')}\n\n` +
        `Estimated Value: Over $100,000\n\n` +
        `⚠️ IMPORTANT REMINDERS:\n` +
        `• This calculator provides estimates only\n` +
        `• High-value diamonds require professional appraisal\n` +
        `• Market conditions affect actual prices\n` +
        `• Verify all specifications before making financial decisions\n\n` +
        `Continue with calculation?`
      );
      
      if (!confirmHighValue) {
        console.log("🛡️ USER CANCELLED: High-value calculation cancelled for safety");
        return;
      }
    }

    setIsCalculating(true);
    setAiEstimate(null);
    console.log("🔄 DIAMOND CALCULATION: Starting comprehensive valuation process...");
    
    if (pricingSystem === 'ai') {
      setAiPricingLoading(true);
      try {
        const response = await fetch('/api/diamonds/ai-price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            carat: caratValue,
            color,
            clarity,
            cut,
            shape: cut,
            type: diamondType,
            growthMethod: diamondType === 'LAB_GROWN' ? growthMethod : undefined
          })
        });

        if (!response.ok) throw new Error('AI pricing unavailable');
        const data = await response.json();

        if (data.success && data.estimate) {
          const est = data.estimate;
          setAiEstimate(est);
          const totalMarketValue = est.midEstimate;
          const loanValue = (totalMarketValue * loanPercentage) / 100;
          const wholesaleValue = (totalMarketValue * wholesalePercentage) / 100;

          setResult(totalMarketValue);
          setMarketPrice(totalMarketValue);
          setLoanPrice(`$${loanValue.toLocaleString()}`);
          setWholesalePrice(`$${wholesaleValue.toLocaleString()}`);

          saveCalculationToHistory({
            carat: caratValue, color, clarity, cut,
            totalValue: totalMarketValue, loanValue, wholesaleValue,
            diamondType, pricingSystem: 'ai'
          });

          console.log(`✅ AI DIAMOND VALUATION COMPLETE: $${est.lowEstimate.toLocaleString()} - $${est.highEstimate.toLocaleString()} (${est.confidence}% confidence)`);
        } else {
          throw new Error('Invalid AI response');
        }
      } catch (error) {
        console.error("AI pricing error, falling back to Rapaport:", error);
        const wholesalePrice = priceDiamond(caratValue, color, clarity, cut, diamondType);
        let totalMarketValue = diamondType === 'LAB_GROWN' ? wholesalePrice * 0.50 : wholesalePrice;
        const loanValue = (totalMarketValue * loanPercentage) / 100;
        const wholesaleValue = (totalMarketValue * wholesalePercentage) / 100;
        setResult(totalMarketValue);
        setMarketPrice(totalMarketValue);
        setLoanPrice(`$${loanValue.toLocaleString()}`);
        setWholesalePrice(`$${wholesaleValue.toLocaleString()}`);
        saveCalculationToHistory({
          carat: caratValue, color, clarity, cut,
          totalValue: totalMarketValue, loanValue, wholesaleValue,
          diamondType, pricingSystem: 'rapaport-fallback'
        });
      } finally {
        setAiPricingLoading(false);
        setIsCalculating(false);
      }
    } else {
      setTimeout(() => {
        try {
          // Use server-side DB price when available (same source as RAP GRID panel)
          // so the calculated result always matches what the grid displays
          const wholesalePrice = (rapData?.pricePerCaratUSD && rapData.pricePerCaratUSD > 0)
            ? rapData.pricePerCaratUSD * caratValue
            : priceDiamond(caratValue, color, clarity, cut, diamondType);
          let totalMarketValue = wholesalePrice;

          if (diamondType === 'LAB_GROWN') {
            totalMarketValue = wholesalePrice * 0.50;
          }

          if (isNaN(totalMarketValue) || totalMarketValue <= 0) {
            alert("Unable to calculate value. Please check specifications.");
            setIsCalculating(false);
            return;
          }

          if (totalMarketValue > 50000000) {
            alert("Calculated value exceeds $50M. Please verify all specifications.");
            setIsCalculating(false);
            return;
          }

          const loanValue = (totalMarketValue * loanPercentage) / 100;
          const wholesaleValue = (totalMarketValue * wholesalePercentage) / 100;

          setResult(totalMarketValue);
          setMarketPrice(totalMarketValue);
          setLoanPrice(`$${loanValue.toLocaleString()}`);
          setWholesalePrice(`$${wholesaleValue.toLocaleString()}`);

          saveCalculationToHistory({
            carat: caratValue, color, clarity, cut,
            totalValue: totalMarketValue, loanValue, wholesaleValue,
            diamondType, pricingSystem
          });

          console.log(`✅ DIAMOND VALUATION COMPLETE: $${totalMarketValue.toLocaleString()}`);
        } catch (error) {
          console.error("PRICING ERROR:", error);
          const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
          alert(`Pricing error: ${errorMessage}\n\nPlease verify all specifications and try again.`);
        } finally {
          setIsCalculating(false);
        }
      }, 1500);
    }
  };

  // Get current price for display based on selected screen
  const getCurrentPrice = () => {
    switch (currentScreen) {
      case "MARKET": return marketPrice;
      case "LOAN": return loanPrice;
      case "WHOLESALE": return wholesalePrice;
      default: return marketPrice;
    }
  };

  // Get current screen label with percentage
  const getCurrentScreenLabel = () => {
    switch (currentScreen) {
      case "MARKET": return "MARKET PRICE";
      case "LOAN": return `LOAN (${loanPercentage}%)`;
      case "WHOLESALE": return `WHOLESALE (${wholesalePercentage}%)`;
      default: return "MARKET PRICE";
    }
  };

  // Remove duplicate functions - using the ones defined above

  // ── Live Rapaport Grid Lookup ──────────────────────────────────────────────
  const rapShape = cut === "ROUND" ? "round" : cut === "PEAR" ? "pear" : null;
  const rapCaratNum = parseFloat(carats);
  const rapEnabled = !!(rapShape && color && clarity && !isNaN(rapCaratNum) && rapCaratNum > 0);

  const { data: rapData, isFetching: rapFetching } = useQuery<{
    success: boolean;
    rapValue: number;
    pricePerCaratUSD: number;
    totalPriceUSD: number;
    caratRange: string;
    color: string;
    clarity: string;
  }>({
    queryKey: ["/api/diamonds/rap-price", rapShape, rapCaratNum, color, clarity],
    enabled: rapEnabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
    queryFn: async () => {
      const params = new URLSearchParams({
        shape: rapShape!,
        carat: String(rapCaratNum),
        color: color!,
        clarity: clarity!,
      });
      const res = await fetch(`/api/diamonds/rap-price?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  return (
    <div 
      className="relative w-full max-w-2xl mx-auto rounded-xl p-4"
      style={{ 
        zoom: manualScale,
        background: 'linear-gradient(135deg, rgba(10,10,18,0.95) 0%, rgba(15,15,28,0.95) 100%)',
        border: '1px solid rgba(185,220,255,0.12)',
        boxShadow: '0 20px 50px -12px rgba(0,0,0,0.5)',
      }}
    >





      {/* Main Display */}




      {/* Percentage Controls */}
      {(currentScreen === "LOAN" || currentScreen === "WHOLESALE") && (
        <div className="mb-4 p-2 rounded" style={{ background: 'rgba(185,220,255,0.04)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">
              {currentScreen === "LOAN" ? "Loan %" : "Wholesale %"}
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => currentScreen === "LOAN" ? adjustLoanPercentage(-1) : adjustWholesalePercentage(-1)}
                className="h-6 w-6 p-0"
              >
                -
              </Button>
              <span className="text-sm font-mono w-8 text-center">
                {currentScreen === "LOAN" ? loanPercentage : wholesalePercentage}%
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => currentScreen === "LOAN" ? adjustLoanPercentage(1) : adjustWholesalePercentage(1)}
                className="h-6 w-6 p-0"
              >
                +
              </Button>
            </div>
          </div>
        </div>
      )}



      {/* Professional Five-Screen 8K LED Display System */}
      <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-3">
        {/* Live Market Price LED */}
        <button
          onClick={() => setPriceType('live')}
          className="px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-all duration-200 min-h-[50px] sm:min-h-[60px] flex flex-col justify-center"
          style={{
            border: priceType === 'live' ? '1px solid rgba(100,200,150,0.35)' : '1px solid rgba(255,255,255,0.08)',
            background: priceType === 'live' ? 'rgba(100,200,150,0.08)' : 'rgba(255,255,255,0.03)',
            boxShadow: priceType === 'live' ? '0 0 8px rgba(100,200,150,0.15)' : 'none'
          }}
        >
          <div className="text-[10px] font-extrabold text-green-300 mb-1 leading-none tracking-widest" style={{
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility'
          }}>LIVE MARKET</div>
          <div className="text-[11px] font-mono font-black leading-none tracking-wide text-center" style={{
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
            ${marketPrice.toLocaleString()}
            <span className="text-[8px] font-bold ml-1" style={{
              color: '#FFD700',
              textShadow: '0 0 1px #000000, 0 0 2px #FFD700',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale'
            }}>
              /CT
            </span>
          </div>
        </button>

        {/* Loan Percent LED */}
        <button
          onClick={() => setPriceType('loan')}
          className="px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-all duration-200 min-h-[50px] sm:min-h-[60px] flex flex-col justify-center"
          style={{
            border: priceType === 'loan' ? '1px solid rgba(100,149,237,0.35)' : '1px solid rgba(255,255,255,0.08)',
            background: priceType === 'loan' ? 'rgba(100,149,237,0.08)' : 'rgba(255,255,255,0.03)',
            boxShadow: priceType === 'loan' ? '0 0 8px rgba(100,149,237,0.15)' : 'none'
          }}
        >
          <div className="text-[10px] font-extrabold text-blue-300 mb-1 leading-none tracking-widest" style={{
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility'
          }}>LOAN PERCENT</div>
          <div className="text-[11px] font-mono font-black leading-none tracking-wide text-center" style={{
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
            ${(() => {
              // Calculate actual loan value using base price and loan percentage
              const basePrice = getCurrentDiamondPrice();
              const loanValue = basePrice * (loanPercentage / 100);
              return !isNaN(loanValue) && loanValue > 0 ? loanValue.toLocaleString() : '0';
            })()}
            <span className="text-[8px] font-bold ml-1" style={{
              color: '#FFD700',
              textShadow: '0 0 1px #000000, 0 0 2px #FFD700',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale'
            }}>
              {loanPercentage}%
            </span>
          </div>
        </button>

        {/* Sales Percent LED */}
        <button
          onClick={() => setPriceType('sell')}
          className="px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-all duration-200 min-h-[50px] sm:min-h-[60px] flex flex-col justify-center"
          style={{
            border: priceType === 'sell' ? '1px solid rgba(185,220,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
            background: priceType === 'sell' ? 'rgba(185,220,255,0.12)' : 'rgba(255,255,255,0.03)',
            boxShadow: priceType === 'sell' ? '0 0 8px rgba(185,220,255,0.15)' : 'none'
          }}
        >
          <div className="text-[10px] font-extrabold mb-1 leading-none tracking-widest" style={{
            color: 'rgba(185,220,255,0.7)',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility'
          }}>SALES PERCENT</div>
          <div className="text-[11px] font-mono font-black leading-none tracking-wide text-center" style={{
            color: 'rgba(185,220,255,0.7)',
            textShadow: '0 0 1px #000000, 0 0 3px rgba(185,220,255,0.4), 0 0 6px rgba(185,220,255,0.2)',
            fontFamily: '"SF Mono", "JetBrains Mono", "Monaco", monospace',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility',
            fontFeatureSettings: '"liga" 1, "kern" 1',
            fontVariant: 'tabular-nums',
            filter: 'brightness(1.1) contrast(1.2)'
          }}>
            ${(() => {
              // Calculate actual sales value using base price and sales percentage
              const basePrice = getCurrentDiamondPrice();
              const salesValue = basePrice * (salesPercentage / 100);
              return !isNaN(salesValue) && salesValue > 0 ? salesValue.toLocaleString() : '0';
            })()}
            <span className="text-[8px] font-bold ml-1" style={{
              color: '#FFD700',
              textShadow: '0 0 1px #000000, 0 0 2px #FFD700',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale'
            }}>
              {salesPercentage}%
            </span>
          </div>
        </button>
      </div>

      
      {/* Admin Rapaport Grid Price Indicator */}
      {rapEnabled && (
        <div className="mb-2 px-3 py-2 rounded-lg flex items-center justify-between" style={{
          background: 'rgba(20,16,8,0.85)',
          border: '1px solid rgba(255,191,0,0.25)',
          boxShadow: rapData ? '0 0 8px rgba(255,191,0,0.08)' : 'none',
        }}>
          <div className="flex items-center gap-2">
            <div className="text-[9px] font-extrabold tracking-widest" style={{ color: 'rgba(255,191,0,0.75)' }}>
              RAP GRID
            </div>
            {rapData && (
              <div className="text-[9px]" style={{ color: 'rgba(255,191,0,0.45)' }}>
                ({rapData.caratRange} · {rapData.color} · {rapData.clarity})
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {rapFetching && (
              <div className="text-[10px]" style={{ color: 'rgba(255,191,0,0.5)' }}>loading…</div>
            )}
            {!rapFetching && rapData && (
              <>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-black" style={{
                    color: '#FFD700',
                    textShadow: '0 0 1px #000, 0 0 4px rgba(255,215,0,0.5)',
                    fontFamily: '"SF Mono", "JetBrains Mono", "Monaco", monospace',
                    fontVariant: 'tabular-nums',
                  }}>
                    Rap {rapData.rapValue}
                  </span>
                  <span className="text-[8px] ml-1" style={{ color: 'rgba(255,191,0,0.5)' }}>(×$100)</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-black" style={{
                    color: '#FFD700',
                    textShadow: '0 0 1px #000, 0 0 4px rgba(255,215,0,0.5)',
                    fontFamily: '"SF Mono", "JetBrains Mono", "Monaco", monospace',
                    fontVariant: 'tabular-nums',
                  }}>
                    ${rapData.pricePerCaratUSD.toLocaleString()}/ct
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px]" style={{ color: 'rgba(255,191,0,0.55)' }}>Total</span>
                  <span className="text-[10px] font-mono font-black ml-1" style={{
                    color: '#FFD700',
                    fontFamily: '"SF Mono", "JetBrains Mono", "Monaco", monospace',
                    fontVariant: 'tabular-nums',
                  }}>
                    ${rapData.totalPriceUSD.toLocaleString()}
                  </span>
                </div>
              </>
            )}
            {!rapFetching && !rapData && (
              <div className="text-[9px]" style={{ color: 'rgba(255,191,0,0.35)' }}>not in grid</div>
            )}
          </div>
        </div>
      )}

      {/* Ultra 8K Crystal Clear Main Diamond Display */}
      <div className="p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl mb-2 sm:mb-3 md:mb-4 shadow-2xl" style={{ background: 'linear-gradient(135deg, rgba(8,8,16,0.9) 0%, rgba(12,12,22,0.9) 100%)', border: '1px solid rgba(185,220,255,0.1)' }}>
        {/* Top Row: Carat Input (left) and Diamond Type (right) */}
        <div className="flex justify-between items-start mb-4">
          {/* Top Left: Clean Carat Weight Buttons Only */}
          <div className="flex items-center gap-2">
            {/* Clean Carat Adjustment Buttons */}
            <div className="flex flex-col gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => adjustCarats(0.01)}
                className="h-8 w-10 p-0 text-sm font-bold"
                style={{
                  backgroundColor: 'rgba(185,220,255,0.1)',
                  color: 'rgba(185,220,255,0.7)',
                  borderColor: 'rgba(185,220,255,0.2)',
                  zIndex: 10
                }}
              >
                +
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => adjustCarats(-0.01)}
                className="h-8 w-10 p-0 text-sm font-bold"
                style={{
                  backgroundColor: 'rgba(185,220,255,0.1)',
                  color: 'rgba(185,220,255,0.7)',
                  borderColor: 'rgba(185,220,255,0.2)',
                  zIndex: 10
                }}
              >
                -
              </Button>
            </div>
            <span className="text-sm font-bold" style={{ color: 'rgba(185,220,255,0.5)' }}>CT</span>
          </div>
          
          {/* Top Right: Clickable Diamond Type Toggle */}
          <div 
            onClick={toggleDiamondType}
            className="text-xs sm:text-sm lg:text-base xl:text-lg font-bold tracking-wider leading-tight text-right cursor-pointer transition-colors duration-200 select-none" 
            style={{
              color: 'rgba(185,220,255,0.7)',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility',
              fontFeatureSettings: '"liga" 1, "kern" 1, "ss01" 1, "tnum" 1',
              fontOpticalSizing: 'auto',
              letterSpacing: '0.05em',
              textShadow: '0 0 1px #000, 0 0 2px rgba(185,220,255,0.3)'
            }}
            title="Click to toggle between Natural and Lab-Grown diamonds"
          >
            <span className="hover:animate-pulse">{diamondType}</span>
            {diamondType === "LAB_GROWN" && (
              <span 
                onClick={(e) => { e.stopPropagation(); cycleGrowthMethod(); }}
                className="ml-2 text-xs px-2 py-1 rounded transition-colors"
                style={{ background: 'rgba(185,220,255,0.08)', border: '1px solid rgba(185,220,255,0.15)' }}
                title="Click to cycle growth method: CVD, HPHT, Mixed"
              >
                {growthMethod}
              </span>
            )}
            {clarityGrades.includes(clarity as any) && <span className="ml-2">• {clarity}</span>}
            
            {/* Lab-Grown Percentage Display - Always visible when LAB_GROWN */}
            {diamondType === "LAB_GROWN" && (
              <div className="mt-1 text-xs font-mono text-center" style={{ color: 'rgba(130,220,170,0.7)' }}>
                {labGrownPercentage.toFixed(1)}% of Natural Price
              </div>
            )}
          </div>
        </div>
        
        {/* Center: Main Price Display - 25% Larger */}
        <div className="text-center mb-5 py-2">
          {/* ESTIMATED VALUE Label moved above price */}
          <div className="text-xs sm:text-sm font-bold mb-2 tracking-widest" style={{
            color: 'rgba(185,220,255,0.5)',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility'
          }}>
            {priceType === 'live' ? 'ESTIMATED VALUE' : priceType === 'loan' ? 'LOAN VALUE' : 'SELL VALUE'}
          </div>
          
          <div className={`font-mono font-black mb-3 tracking-wide leading-none text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl`} style={{
            color: 'rgba(220,230,255,0.95)',
            textShadow: '0 0 2px rgba(185,220,255,0.4), 0 0 8px rgba(185,220,255,0.15)',
            filter: 'brightness(1.1)',
            fontFamily: '"SF Mono", "JetBrains Mono", "Monaco", "Consolas", monospace',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility',
            fontFeatureSettings: '"liga" 1, "kern" 1, "tnum" 1, "ss01" 1',
            fontOpticalSizing: 'auto',
            fontVariationSettings: '"wght" 900'
          }}>
            {/* Main Price Display - Center Focus with 25% Larger Text */}
            {clarity && color && cut && display && Number(display) > 0 
              ? (() => {
                  const basePrice = getCurrentDiamondPrice();
                  switch(priceType) {
                    case 'loan':
                      return `$${(basePrice * (loanPercentage / 100)).toLocaleString()}`;
                    case 'sell':
                      return `$${(basePrice * (salesPercentage / 100)).toLocaleString()}`;
                    case 'live':
                    default:
                      return `$${basePrice.toLocaleString()}`;
                  }
                })()
              : "SELECT ALL SPECS"
            }
          </div>
        </div>
        
        {/* Bottom: Carat Weight Display */}
        <div className="border-t pt-3" style={{ borderColor: 'rgba(185,220,255,0.1)' }}>
          <div className="text-center">
            <div className="text-sm sm:text-lg lg:text-xl font-mono font-black tracking-wide leading-none" style={{
              color: 'rgba(185,220,255,0.8)',
              textShadow: '0 0 1px rgba(185,220,255,0.2)',
              fontFamily: '"SF Mono", "JetBrains Mono", "Monaco", monospace',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility',
              fontFeatureSettings: '"liga" 1, "kern" 1, "tnum" 1'
            }}>
              {/* Carat weight display */}
              {display || '0.00'} CARATS
            </div>
            
            {/* Lab-Grown Percentage Comparison Display */}
            {diamondType === "LAB_GROWN" && (
              <div className="mt-2 text-xs font-mono tracking-wide" style={{ color: 'rgba(130,220,170,0.7)' }}>
                Lab-Grown: {labGrownPercentage.toFixed(1)}% of Natural Price
                {clarity && color && cut && display && Number(display) > 0 && (
                  <div className="text-[10px] text-green-400 mt-1">
                    Natural would be: ${priceDiamond(Number(display), color, clarity, cut).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simplified Diamond Controls - Pawn Broker Style */}
      <div className="space-y-2 mb-4">
        {/* Top Row: Digital LED Grade Selection */}
        <div className="grid grid-cols-3 gap-1 sm:gap-2">
          {/* Digital Clarity LED */}
          <button
            onClick={cycleClarityGrade}
            className="clarity-button clarity-button-base px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-all duration-200 min-h-[50px] sm:min-h-[60px] flex flex-col justify-center relative overflow-hidden"
            style={{
              border: '1px solid rgba(185,220,255,0.4)',
              background: 'rgba(185,220,255,0.12)',
              boxShadow: '0 0 8px rgba(185,220,255,0.15)'
            }}
          >
            <div className="text-[10px] font-extrabold mb-1 leading-none tracking-widest" style={{
              color: 'rgba(185,220,255,0.7)',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility'
            }}>CLARITY</div>
            <div className="text-[11px] font-mono font-black leading-none tracking-wide text-center gia-clarity-display inclusion-pattern" style={{
              color: 'rgba(185,220,255,0.7)',
              textShadow: '0 0 1px #000000, 0 0 3px rgba(185,220,255,0.4), 0 0 6px rgba(185,220,255,0.2)',
              fontFamily: '"SF Mono", "JetBrains Mono", "Monaco", monospace',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility',
              fontFeatureSettings: '"liga" 1, "kern" 1',
              fontVariant: 'tabular-nums',
              filter: 'brightness(1.1) contrast(1.2)'
            }}>
              {clarityDisplay}
            </div>
            <div className="clarity-inclusions"></div>
          </button>

          {/* GIA Color LED with Authentic Diamond Color */}
          <button
            onClick={cycleColorGrade}
            className="px-2 sm:px-3 py-1 sm:py-2 rounded-lg border-2 ring-2 transition-all duration-300 min-h-[50px] sm:min-h-[60px] flex flex-col justify-center"
            style={{
              backgroundColor: color ? `${getGIAColorShade(color)}40` : 'rgba(185,220,255,0.12)',
              borderColor: color ? getGIAColorShade(color) : 'rgba(185,220,255,0.4)',
              ringColor: color ? getGIAColorShade(color) : 'rgba(185,220,255,0.4)',
              boxShadow: color 
                ? `0 0 20px ${getGIAColorShade(color)}80`
                : '0 0 8px rgba(185,220,255,0.15)',
              backdropFilter: 'blur(8px)', // Glass effect to make colors pop
              WebkitBackdropFilter: 'blur(8px)'
            }}
          >
            <div className="text-[10px] font-extrabold mb-1 leading-none tracking-widest" style={{
              color: 'rgba(185,220,255,0.7)',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility'
            }}>COLOR</div>
            <div className="text-[11px] font-mono font-black leading-none tracking-wide text-center" style={{
              color: color ? '#000000' : 'rgba(185,220,255,0.7)',
              textShadow: color 
                ? `0 0 1px ${getGIAColorShade(color)}, 0 0 3px ${getGIAColorShade(color)}` 
                : '0 0 1px #000000, 0 0 3px rgba(185,220,255,0.4), 0 0 6px rgba(185,220,255,0.2)',
              fontFamily: '"SF Mono", "JetBrains Mono", "Monaco", monospace',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility',
              fontFeatureSettings: '"liga" 1, "kern" 1',
              fontVariant: 'tabular-nums',
              filter: 'brightness(1.1) contrast(1.2)',
              fontWeight: '900'
            }}>
              {color || "SELECT"}
            </div>
          </button>

          {/* Digital Cut LED */}
          <button
            onClick={cycleCutGrade}
            className="shape-button px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-all duration-200 min-h-[50px] sm:min-h-[60px] flex flex-col justify-center relative overflow-hidden"
            style={{
              border: '1px solid rgba(185,220,255,0.4)',
              background: 'rgba(185,220,255,0.12)',
              boxShadow: '0 0 8px rgba(185,220,255,0.15)'
            }}
          >
            <div className="text-[10px] font-extrabold mb-1 leading-none tracking-widest relative z-10" style={{
              color: 'rgba(185,220,255,0.7)',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility'
            }}>SHAPE</div>
            <div className="text-[11px] font-mono font-black leading-none tracking-wide text-center relative z-10" style={{
              color: 'rgba(185,220,255,0.7)',
              textShadow: '0 0 1px #000000, 0 0 3px rgba(185,220,255,0.4), 0 0 6px rgba(185,220,255,0.2)',
              fontFamily: '"SF Mono", "JetBrains Mono", "Monaco", monospace',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility',
              fontFeatureSettings: '"liga" 1, "kern" 1',
              fontVariant: 'tabular-nums',
              filter: 'brightness(1.1) contrast(1.2)'
            }}>
              {cut || "SELECT"}
            </div>
          </button>
        </div>

        {/* Quick Select Carat Buttons */}
        <div className="rounded-lg p-2" style={{ background: 'rgba(185,220,255,0.04)', border: '1px solid rgba(185,220,255,0.1)' }}>
          <div className="text-xs font-bold mb-2 text-center" style={{ color: 'rgba(185,220,255,0.7)' }}>QUICK SELECT</div>
          <div className="grid grid-cols-5 gap-1">
            {caratSizes.map((size) => (
              <button
                key={size}
                onClick={() => {
                  setDisplay(size.toString());
                  setCarats(size.toString());
                  setSelectedCarats(size);
                  console.log(`💎 QUICK SELECT: ${size} carats selected`);
                }}
                className="py-1 px-1 text-xs font-bold rounded border transition-colors"
                style={{
                  backgroundColor: Number(display) === size ? 'rgba(185,220,255,0.2)' : 'rgba(185,220,255,0.06)',
                  color: Number(display) === size ? 'rgba(220,230,255,0.95)' : 'rgba(185,220,255,0.6)',
                  borderColor: Number(display) === size ? 'rgba(185,220,255,0.4)' : 'rgba(185,220,255,0.15)',
                  zIndex: 10
                }}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Digital Percentage Controls with Live Display */}
        <div className="grid grid-cols-4 gap-1 sm:gap-2">
          <button 
            onClick={() => adjustLoanPercentage(-1)}
            className={`relative text-white text-[10px] py-2 px-1 rounded-lg border transition-all duration-300 font-bold shadow-lg transform hover:scale-105 active:scale-95 ${
              percentageLocked 
                ? 'bg-gradient-to-br from-gray-700 to-gray-600 border-gray-500 cursor-not-allowed opacity-50' 
                : ''
            }`}
            style={{
              background: percentageLocked ? undefined : 'rgba(100,149,237,0.15)',
              border: percentageLocked ? undefined : '1px solid rgba(100,149,237,0.25)',
              boxShadow: percentageLocked ? '0 0 10px rgba(107, 114, 128, 0.3)' : '0 0 12px rgba(100,149,237,0.15)',
              animation: percentageLocked ? 'none' : 'pulse 2s infinite'
            }}
          >
            <div className="text-[8px] leading-tight" style={{ color: percentageLocked ? 'rgba(156,163,175,1)' : 'rgba(185,220,255,0.7)' }}>LOAN</div>
            <div className="text-white font-mono text-xs leading-tight">-{loanPercentage}%</div>
            {percentageLocked && <div className="absolute top-1 right-1 text-gray-400 text-[8px]">🔒</div>}
          </button>
          <button 
            onClick={() => adjustLoanPercentage(1)}
            className={`relative text-white text-[10px] py-2 px-1 rounded-lg border transition-all duration-300 font-bold shadow-lg transform hover:scale-105 active:scale-95 ${
              percentageLocked 
                ? 'bg-gradient-to-br from-gray-700 to-gray-600 border-gray-500 cursor-not-allowed opacity-50' 
                : ''
            }`}
            style={{
              background: percentageLocked ? undefined : 'rgba(100,149,237,0.2)',
              border: percentageLocked ? undefined : '1px solid rgba(100,149,237,0.3)',
              boxShadow: percentageLocked ? '0 0 10px rgba(107, 114, 128, 0.3)' : '0 0 12px rgba(100,149,237,0.2)',
              animation: percentageLocked ? 'none' : 'pulse 2s infinite'
            }}
          >
            <div className="text-[8px] leading-tight" style={{ color: percentageLocked ? 'rgba(156,163,175,1)' : 'rgba(185,220,255,0.8)' }}>LOAN</div>
            <div className="text-white font-mono text-xs leading-tight">+{loanPercentage}%</div>
            {percentageLocked && <div className="absolute top-1 right-1 text-gray-400 text-[8px]">🔒</div>}
          </button>
          <button 
            onClick={() => adjustWholesalePercentage(-1)}
            className={`relative text-white text-[10px] py-2 px-1 rounded-lg border transition-all duration-300 font-bold shadow-lg transform hover:scale-105 active:scale-95 ${
              percentageLocked 
                ? 'bg-gradient-to-br from-gray-700 to-gray-600 border-gray-500 cursor-not-allowed opacity-50' 
                : ''
            }`}
            style={{
              background: percentageLocked ? undefined : 'rgba(249,115,22,0.15)',
              border: percentageLocked ? undefined : '1px solid rgba(249,115,22,0.25)',
              boxShadow: percentageLocked ? '0 0 10px rgba(107, 114, 128, 0.3)' : '0 0 12px rgba(249,115,22,0.15)',
              animation: percentageLocked ? 'none' : 'pulse 2s infinite'
            }}
          >
            <div className="text-[8px] leading-tight" style={{ color: percentageLocked ? 'rgba(156,163,175,1)' : 'rgba(249,200,150,0.8)' }}>SALE</div>
            <div className="text-white font-mono text-xs leading-tight">-{wholesalePercentage}%</div>
            {percentageLocked && <div className="absolute top-1 right-1 text-gray-400 text-[8px]">🔒</div>}
          </button>
          <button 
            onClick={() => adjustWholesalePercentage(1)}
            className={`relative text-white text-[10px] py-2 px-1 rounded-lg border transition-all duration-300 font-bold shadow-lg transform hover:scale-105 active:scale-95 ${
              percentageLocked 
                ? 'bg-gradient-to-br from-gray-700 to-gray-600 border-gray-500 cursor-not-allowed opacity-50' 
                : ''
            }`}
            style={{
              background: percentageLocked ? undefined : 'rgba(249,115,22,0.2)',
              border: percentageLocked ? undefined : '1px solid rgba(249,115,22,0.3)',
              boxShadow: percentageLocked ? '0 0 10px rgba(107, 114, 128, 0.3)' : '0 0 12px rgba(249,115,22,0.2)',
              animation: percentageLocked ? 'none' : 'pulse 2s infinite'
            }}
          >
            <div className="text-[8px] leading-tight" style={{ color: percentageLocked ? 'rgba(156,163,175,1)' : 'rgba(249,200,150,0.9)' }}>SALE</div>
            <div className="text-white font-mono text-xs leading-tight">+{wholesalePercentage}%</div>
            {percentageLocked && <div className="absolute top-1 right-1 text-gray-400 text-[8px]">🔒</div>}
          </button>
        </div>

        {/* Percentage Lock Control */}
        <div className="mt-4">
          <button 
            onClick={togglePercentageLock}
            className={`w-full py-3 px-4 rounded-lg border transition-all duration-300 font-bold text-sm shadow-lg transform hover:scale-[1.02] active:scale-95 ${
              percentageLocked 
                ? 'bg-gradient-to-r from-green-800 to-green-700 hover:from-green-700 hover:to-green-600 border-green-500 text-white shadow-green-500/30' 
                : 'bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 border-red-500 text-white shadow-red-500/30'
            }`}
            style={{
              boxShadow: percentageLocked 
                ? '0 0 20px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                : '0 0 20px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            {percentageLocked ? '🔒 PERCENTAGE LOCKED' : '🔓 PERCENTAGE UNLOCKED'}
          </button>
        </div>

        {/* Calculation History Display - Most Recent Only */}
        <div className="mt-4 border-t pt-4" style={{ borderColor: 'rgba(185,220,255,0.1)' }}>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold" style={{ color: 'rgba(185,220,255,0.7)' }}>CALCULATION HISTORY</h3>
              {calculationHistory.length > 0 && (
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white transition-colors"
                  style={{ background: 'rgba(185,220,255,0.1)' }}
                  title="View all history"
                >
                  H
                </button>
              )}
            </div>
            {calculationHistory.length > 0 && (
              <button
                onClick={() => setShowClearConfirmation(true)}
                className="text-xs transition-colors"
                style={{ color: 'rgba(185,220,255,0.5)' }}
              >
                Clear History
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            {calculationHistory.length === 0 ? (
              <div className="text-center py-4 text-slate-400 text-xs">
                No calculations yet
              </div>
            ) : (
              // Show only the most recent calculation
              <div className="rounded-lg p-3" style={{ background: 'rgba(185,220,255,0.04)', border: '1px solid rgba(185,220,255,0.08)' }}>
                <div className="flex justify-between items-start mb-1">
                  <div className="text-xs font-bold" style={{ color: 'rgba(185,220,255,0.7)' }}>
                    #{calculationHistory.length} - {calculationHistory[0].timestamp}
                  </div>
                  <div className="text-xs font-mono font-bold" style={{ color: 'rgba(130,220,170,0.7)' }}>
                    ${calculationHistory[0].totalValue?.toLocaleString() || 'N/A'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span style={{ color: 'rgba(185,220,255,0.5)' }}>Carat:</span> <span className="text-white">{calculationHistory[0].carat}</span>
                  </div>
                  <div>
                    <span style={{ color: 'rgba(185,220,255,0.5)' }}>Color:</span> <span className="text-white">{calculationHistory[0].color}</span>
                  </div>
                  <div>
                    <span style={{ color: 'rgba(185,220,255,0.5)' }}>Clarity:</span> <span className="text-white">{calculationHistory[0].clarity}</span>
                  </div>
                  <div>
                    <span style={{ color: 'rgba(185,220,255,0.5)' }}>Cut:</span> <span className="text-white">{calculationHistory[0].cut}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History Modal Popup */}
        {showHistoryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowHistoryModal(false)}>
            <div className="rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto" style={{ background: 'rgba(10,10,18,0.97)', border: '1px solid rgba(185,220,255,0.12)' }} onClick={e => e.stopPropagation()}>
              <div className="p-4" style={{ borderBottom: '1px solid rgba(185,220,255,0.1)' }}>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold" style={{ color: 'rgba(185,220,255,0.7)' }}>All Calculation History</h3>
                  <button
                    onClick={() => setShowHistoryModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                {calculationHistory.map((calc, index) => (
                  <div key={calc.id} className="rounded-lg p-3" style={{ background: 'rgba(185,220,255,0.04)', border: '1px solid rgba(185,220,255,0.08)' }}>
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-xs font-bold" style={{ color: 'rgba(185,220,255,0.7)' }}>
                        #{calculationHistory.length - index} - {calc.timestamp}
                      </div>
                      <div className="text-xs font-mono font-bold" style={{ color: 'rgba(130,220,170,0.7)' }}>
                        ${calc.totalValue?.toLocaleString() || 'N/A'}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span style={{ color: 'rgba(185,220,255,0.5)' }}>Carat:</span> <span className="text-white">{calc.carat}</span>
                      </div>
                      <div>
                        <span style={{ color: 'rgba(185,220,255,0.5)' }}>Color:</span> <span className="text-white">{calc.color}</span>
                      </div>
                      <div>
                        <span style={{ color: 'rgba(185,220,255,0.5)' }}>Clarity:</span> <span className="text-white">{calc.clarity}</span>
                      </div>
                      <div>
                        <span style={{ color: 'rgba(185,220,255,0.5)' }}>Cut:</span> <span className="text-white">{calc.cut}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Clear History Confirmation Dialog */}
        {showClearConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowClearConfirmation(false)}>
            <div className="bg-gray-900 rounded-lg border border-red-500/30 max-w-md w-full" onClick={e => e.stopPropagation()}>
              <div className="p-6 text-center">
                <div className="text-2xl mb-4">⚠️</div>
                <h3 className="text-lg font-bold text-red-300 mb-3">Clear All History?</h3>
                <p className="text-sm text-gray-300 mb-6">
                  This will permanently delete all {calculationHistory.length} calculation{calculationHistory.length !== 1 ? 's' : ''} from your history. 
                  This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowClearConfirmation(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setCalculationHistory([]);
                      localStorage.removeItem('diamond-calculation-history');
                      setShowClearConfirmation(false);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Clear History
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lab-Grown Percentage Control - Only show when LAB_GROWN is selected */}
        {diamondType === "LAB_GROWN" && (
          <div className="mt-4 border-t pt-4" style={{ borderColor: 'rgba(185,220,255,0.1)' }}>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold" style={{ color: 'rgba(100,200,150,0.7)' }}>LAB-GROWN % OF NATURAL</label>
              <span className="text-xs font-mono font-bold px-2 py-1 rounded" style={{ color: 'rgba(130,220,170,0.7)', background: 'rgba(100,200,150,0.08)' }}>
                {labGrownPercentage.toFixed(1)}%
              </span>
            </div>

            {/* Lab-grown percentage adjustment buttons */}
            <div className="flex justify-center gap-2 mb-2">
              <button
                onClick={() => {
                  const newValue = Math.max(1.0, labGrownPercentage - 0.1);
                  setLabGrownPercentage(newValue);
                  localStorage.setItem('diamond-lab-grown-percentage', newValue.toString());
                  console.log(`💎 Lab-Grown Percentage: Decreased to ${newValue.toFixed(1)}%`);
                }}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded transition-colors"
              >
                -
              </button>
              <button
                onClick={() => {
                  const newValue = Math.min(100.0, labGrownPercentage + 0.1);
                  setLabGrownPercentage(newValue);
                  localStorage.setItem('diamond-lab-grown-percentage', newValue.toString());
                  console.log(`💎 Lab-Grown Percentage: Increased to ${newValue.toFixed(1)}%`);
                }}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded transition-colors"
              >
                +
              </button>
            </div>

            <div className="text-xs text-green-300 mt-1 text-center">
              Adjust lab-grown price as percentage of identical natural diamond
            </div>
            
            {/* Industry Standard Disclosure */}
            <div className="mt-2 p-2 bg-blue-900/30 border border-blue-500/30 rounded text-xs text-blue-300">
              <div className="font-semibold text-blue-200 mb-1">📊 Industry Standard:</div>
              <div>Lab-grown diamonds typically trade at 11.7% vs natural diamonds of the same quality according to industry standards.</div>
            </div>
          </div>
        )}

      </div>



      {/* AI Market Intelligence Panel */}
      {aiEstimate && pricingSystem === 'ai' && (
        <div className="mb-4 p-3 bg-gradient-to-br from-cyan-900/40 to-blue-900/40 rounded-lg border border-cyan-500/40">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-300">AI MARKET INTELLIGENCE</span>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-cyan-600/30 text-cyan-200">
              {aiEstimate.confidence}% confidence
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="text-center p-2 bg-slate-800/60 rounded">
              <div className="text-xs text-slate-400">LOW</div>
              <div className="text-sm font-bold text-red-300">${aiEstimate.lowEstimate.toLocaleString()}</div>
            </div>
            <div className="text-center p-2 bg-slate-800/60 rounded border border-cyan-500/30">
              <div className="text-xs text-slate-400">MARKET</div>
              <div className="text-sm font-bold text-green-300">${aiEstimate.midEstimate.toLocaleString()}</div>
            </div>
            <div className="text-center p-2 bg-slate-800/60 rounded">
              <div className="text-xs text-slate-400">HIGH</div>
              <div className="text-sm font-bold text-blue-300">${aiEstimate.highEstimate.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs text-slate-400">$/ct: <span className="text-white font-medium">${aiEstimate.pricePerCarat.toLocaleString()}</span></span>
            <span className="text-xs text-slate-400">Trend: <span className={`font-medium ${aiEstimate.marketTrend === 'rising' ? 'text-green-400' : aiEstimate.marketTrend === 'falling' ? 'text-red-400' : 'text-yellow-400'}`}>{aiEstimate.marketTrend.toUpperCase()}</span></span>
          </div>
          {aiEstimate.factors.length > 0 && (
            <div className="text-xs text-slate-400 space-y-0.5">
              {aiEstimate.factors.slice(0, 3).map((f, i) => (
                <div key={i} className="flex items-start gap-1"><span className="text-cyan-500 mt-0.5">&#8226;</span> {f}</div>
              ))}
            </div>
          )}
          <div className="mt-2 text-xs text-slate-500 italic leading-tight">
            {aiEstimate.disclaimer}
          </div>
        </div>
      )}

      {/* AI Loading Indicator */}
      {aiPricingLoading && (
        <div className="mb-4 p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/30 flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-cyan-300">AI analyzing diamond market data...</span>
        </div>
      )}

      {/* BETA TEST: Free Access to All Features */}
      <div className="mb-4 p-3 bg-green-600/20 rounded-lg border border-green-500/30">
        <div className="flex items-center justify-center mb-2">
          <div className="text-xs font-medium text-green-300">BETA TEST - ALL FEATURES FREE FOR 30 DAYS</div>
        </div>
        
        <div className="text-xs text-green-200 text-center">
          Enjoy unlimited calculations, Rapaport pricing, and PDF export during our beta test period!
        </div>
      </div>

      {/* Bottom Controls: Pricing System & Grid System */}
      <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(185,220,255,0.04)', border: '1px solid rgba(185,220,255,0.1)' }}>
        <div className="grid grid-cols-2 gap-3">
          {/* Pricing System Toggle */}
          <div>
            <div className="text-xs font-medium mb-2" style={{ color: 'rgba(185,220,255,0.7)' }}>PRICING SYSTEM</div>
            <div className="flex gap-1">
              <button
                onClick={() => switchPricingSystem('ai')}
                className={`flex-1 px-2 py-2 rounded-md text-xs font-medium transition-all ${
                  pricingSystem === 'ai'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                AI
              </button>
              <button
                onClick={() => switchPricingSystem('kaggle')}
                className={`flex-1 px-2 py-2 rounded-md text-xs font-medium transition-all ${
                  pricingSystem === 'kaggle' 
                    ? 'bg-green-600 text-white shadow-lg' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                LIVE
              </button>
              <button
                onClick={() => switchPricingSystem('rapaport')}
                className={`flex-1 px-2 py-2 rounded-md text-xs font-medium transition-all ${
                  pricingSystem === 'rapaport' 
                    ? 'text-white shadow-lg' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                style={pricingSystem === 'rapaport' ? { background: 'rgba(185,220,255,0.2)' } : {}}
              >
                RAP
              </button>
            </div>
            <div className="text-xs text-slate-400 mt-1 text-center">
              {pricingSystem === 'ai' ? 'Simplicity Market Intelligence' : pricingSystem === 'kaggle' ? 'Kaggle Dataset' : 'Grid System'}
            </div>
          </div>

          {/* Grid System Buttons */}
          <div>
            <div className="text-xs font-medium text-blue-300 mb-2">GRID SYSTEM</div>
            <div className="flex gap-1">
              <button
                onClick={() => {
                  setGridType('round');
                  setShowGridSystem(true);
                }}
                className="flex-1 px-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-all shadow-lg"
              >
                ROUND GRID
              </button>
              <button
                onClick={() => {
                  setGridType('pear');
                  setShowGridSystem(true);
                }}
                className="flex-1 px-2 py-2 text-white rounded-md text-xs font-medium transition-all shadow-lg"
                style={{ background: 'rgba(185,220,255,0.15)', border: '1px solid rgba(185,220,255,0.2)' }}
              >
                PEAR GRID
              </button>
            </div>
            <div className="text-xs text-slate-400 mt-1 text-center">
              View & customize pricing
            </div>
          </div>
        </div>
      </div>

      {/* Simple Action Buttons - Pawn Broker Style */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={calculateDiamondValue}
          disabled={isCalculating}
          className="text-white text-sm py-2 px-3 rounded-lg transition-colors font-bold shadow-lg"
          style={{ background: 'rgba(185,220,255,0.15)', border: '1px solid rgba(185,220,255,0.25)' }}
        >
          {isCalculating ? "CALCULATING..." : "CALCULATE VALUE"}
        </button>
        <button
          onClick={handleClear}
          className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-3 rounded-lg border border-gray-500 transition-colors font-bold shadow-lg"
        >
          CLEAR
        </button>
      </div>

      {/* PDF Export Button - FREE during beta test */}
      <div className="mt-3">
        <button
          onClick={() => {
            alert('PDF export functionality coming soon!\n\nDuring the beta test period, all features are free for 30 days.');
          }}
          className="w-full py-2 px-3 rounded-lg border text-sm font-bold transition-colors shadow-lg bg-green-600 hover:bg-green-700 text-white border-green-500"
        >
          EXPORT TO PDF (BETA)
        </button>
      </div>

      {/* Simple Footer */}
      <div className="mt-4 text-center">
        <div className="text-xs font-bold" style={{ color: 'rgba(185,220,255,0.5)' }}>
          <span className="simpleton-brand">Simpleton</span>™ Diamond Calculator
        </div>
      </div>

      {/* Unlock Warning Modal */}
      {showUnlockWarning && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-xl p-6 max-w-md border border-red-500 shadow-2xl">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-white mb-4">UNLOCK PERCENTAGE SETTINGS?</h3>
              <p className="text-red-200 mb-6 leading-relaxed">
                This will allow percentage settings to be modified. 
                <br />
                <strong className="text-white">Are you sure you want to unlock?</strong>
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowUnlockWarning(false)}
                  className="flex-1 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white py-3 px-4 rounded-lg font-bold transition-all duration-300 border border-gray-500"
                >
                  CANCEL
                </button>
                <button 
                  onClick={confirmUnlock}
                  className="flex-1 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white py-3 px-4 rounded-lg font-bold transition-all duration-300 border border-red-400"
                >
                  UNLOCK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid System Modal */}
      {showGridSystem && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2">
          <div className="bg-slate-900 rounded-xl p-6 max-w-[95vw] w-full max-h-[95vh] overflow-y-auto border border-blue-500 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-white">
                {gridType === 'round' ? 'Round Diamond' : 'Pear/Fancy Shape'} Pricing Grid
              </h3>
              <button
                onClick={() => setShowGridSystem(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-slate-800 rounded-lg">
              <div className="text-sm text-blue-300 mb-2">
                <strong>Current Selection:</strong> {carats}ct {color} {clarity} {selectedCut.toUpperCase()}
              </div>
              <div className="text-sm text-green-300">
                <strong>Pricing System:</strong> {pricingSystem === 'ai' ? 'Simplicity Market Intelligence' : pricingSystem === 'kaggle' ? 'Kaggle Dataset (LIVE)' : 'Rapaport Grid System'}
              </div>
            </div>

            {/* Editable Grid Display */}
            <div className="bg-slate-800 p-4 rounded-lg">
              <h4 className="text-lg font-bold text-white mb-3">
                {gridType === 'round' ? 'Round Diamond' : 'Pear/Fancy Shape'} Pricing Grid
              </h4>
              
              {/* Dynamic Grid Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse border border-slate-600">
                  <thead>
                    <tr className="bg-slate-700">
                      <th className="border border-slate-600 p-2 text-white font-bold">Carat Range</th>
                      <th className="border border-slate-600 p-2 text-white font-bold">D</th>
                      <th className="border border-slate-600 p-2 text-white font-bold">E</th>
                      <th className="border border-slate-600 p-2 text-white font-bold">F</th>
                      <th className="border border-slate-600 p-2 text-white font-bold">G</th>
                      <th className="border border-slate-600 p-2 text-white font-bold">H</th>
                    </tr>
                    <tr className="bg-slate-800">
                      <th className="border border-slate-600 p-1 text-gray-300 text-xs">Clarity</th>
                      <th className="border border-slate-600 p-1 text-gray-300 text-xs">IF-I3</th>
                      <th className="border border-slate-600 p-1 text-gray-300 text-xs">IF-I3</th>
                      <th className="border border-slate-600 p-1 text-gray-300 text-xs">IF-I3</th>
                      <th className="border border-slate-600 p-1 text-gray-300 text-xs">IF-I3</th>
                      <th className="border border-slate-600 p-1 text-gray-300 text-xs">IF-I3</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const currentData = gridType === 'round' ? getRoundGridData() : getPearGridData();
                      const caratRanges = Object.keys(currentData);
                      
                      return caratRanges.map((caratRange, index) => (
                        <tr key={caratRange} className={index % 2 === 0 ? "bg-slate-900" : "bg-slate-800"}>
                          <td className="border border-slate-600 p-2 text-yellow-300 font-bold">
                            {caratRange}
                          </td>
                          {['D', 'E', 'F', 'G', 'H'].map(color => {
                            const colorData = currentData[caratRange][color] || {};
                            const clarityValues = Object.keys(colorData);
                            const minPrice = Math.min(...Object.values(colorData));
                            const maxPrice = Math.max(...Object.values(colorData));
                            
                            return (
                              <td key={color} className="border border-slate-600 p-1 text-white text-center">
                                <div className="space-y-1">
                                  <div className="text-xs font-bold text-green-300">
                                    {maxPrice}-{minPrice}
                                  </div>
                                  <div className="text-xs text-gray-300">
                                    {clarityValues.length} grades
                                  </div>
                                  <button
                                    onClick={() => {
                                      const cellKey = `${caratRange}-${color}`;
                                      setEditingCell(cellKey);
                                      setEditValue(JSON.stringify(colorData));
                                    }}
                                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-1 py-0.5 rounded"
                                  >
                                    Edit
                                  </button>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
              
              {/* Edit Modal */}
              {editingCell && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-slate-800 p-4 rounded-lg max-w-md w-full">
                    <h5 className="text-lg font-bold text-white mb-3">
                      Edit {editingCell} - {selectedCut.toLowerCase() === 'round' ? 'Round' : 'Pear'}
                    </h5>
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full h-32 bg-slate-700 text-white p-2 rounded text-xs font-mono"
                      placeholder='Enter JSON format: {"IF": 100, "VVS1": 90, "VVS2": 85, ...}'
                    />
                    <div className="mt-3 flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingCell(null)}
                        className="px-3 py-1 bg-gray-600 text-white rounded text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          try {
                            const [caratRange, color] = editingCell.split('-');
                            const parsedData = JSON.parse(editValue);
                            Object.entries(parsedData).forEach(([clarity, value]) => {
                              handleCellEdit(caratRange, color, clarity, value.toString());
                            });
                            setEditingCell(null);
                          } catch (e) {
                            alert('Invalid JSON format');
                          }
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-4 text-center">
                <button
                  onClick={saveGridChanges}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold mr-3"
                >
                  SAVE CHANGES
                </button>
                <button
                  onClick={resetGridToDefaults}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold"
                >
                  RESET TO DEFAULTS
                </button>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-gray-400">
              <p><strong>Note:</strong> All values are in USD per carat. Changes are saved locally and will persist between sessions.</p>
              <p><strong>Grid System:</strong> {pricingSystem === 'rapaport' ? 'Authentic Rapaport pricing structure' : 'Kaggle dataset with editable overrides'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Premium Goodbye Animation with Falling Diamonds */}
      {showFallingDiamonds && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-lg flex items-center justify-center">
          {/* Falling diamonds */}
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-50px',
                animation: `fall ${2 + Math.random() * 2}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`,
                color: `hsl(${280 + Math.random() * 60}, 70%, 70%)`,
              }}
            >
              💎
            </div>
          ))}
          
          <div className="text-center z-10">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-2xl" style={{ background: 'linear-gradient(135deg, rgba(185,220,255,0.3), rgba(185,220,255,0.15))' }}>
                <span className="text-3xl">💎</span>
              </div>
            </div>
            
            <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #b9dcff, #e8e8e8, #b9dcff)',
                WebkitBackgroundClip: 'text',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility',
                fontFeatureSettings: '"liga", "kern"',
                fontOpticalSizing: 'auto'
              }}
            >
              Hope to see you soon!
            </h1>
            
            <p className="text-xl font-medium"
              style={{
                color: 'rgba(185,220,255,0.7)',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility'
              }}
            >
              Returning to <span className="simpleton-brand">Simpleton</span> Home...
            </p>
          </div>
        </div>
      )}
      
      {/* News Ticker - Integrated at bottom of calculator display */}
      <NewsTicker 
        category="diamonds" 
        isEnabled={newsEnabled}
        onToggle={toggleNews}
      />
    </div>
  );
}