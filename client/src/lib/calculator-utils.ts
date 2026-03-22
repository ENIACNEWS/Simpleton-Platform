import { CalculatorResult } from "@/types";

export const KARAT_PURITIES = {
  "24K": 1.0,
  "22K": 0.9167,
  "18K": 0.75,
  "14K": 0.5833,
  "10K": 0.4167,
  "925": 0.925, // Sterling silver
} as const;

export const METAL_TYPES = {
  GOLD: "gold",
  SILVER: "silver",
  PLATINUM: "platinum",
  PALLADIUM: "palladium",
  DIAMOND: "diamond",
} as const;

export const DIAMOND_CLARITY = {
  "FL": "Flawless",
  "IF": "Internally Flawless", 
  "VVS1": "Very Very Slightly Included 1",
  "VVS2": "Very Very Slightly Included 2",
  "VS1": "Very Slightly Included 1",
  "VS2": "Very Slightly Included 2",
  "SI1": "Slightly Included 1",
  "SI2": "Slightly Included 2",
  "I1": "Included 1",
  "I2": "Included 2",
  "I3": "Included 3",
} as const;

export const DIAMOND_COLOR = {
  "D": "Colorless",
  "E": "Colorless",
  "F": "Colorless", 
  "G": "Near Colorless",
  "H": "Near Colorless",
  "I": "Near Colorless",
  "J": "Near Colorless",
  "K": "Faint Yellow",
  "L": "Faint Yellow",
  "M": "Faint Yellow",
} as const;

export const DIAMOND_CUT = {
  "EXCELLENT": "Excellent",
  "VERY_GOOD": "Very Good",
  "GOOD": "Good",
  "FAIR": "Fair",
  "POOR": "Poor",
} as const;

export type DiamondClarityType = keyof typeof DIAMOND_CLARITY;
export type DiamondColorType = keyof typeof DIAMOND_COLOR;
export type DiamondCutType = keyof typeof DIAMOND_CUT;

export type KaratType = keyof typeof KARAT_PURITIES;
export type MetalType = typeof METAL_TYPES[keyof typeof METAL_TYPES];

export function calculateMeltValue(
  weight: number,
  purity: number,
  pricePerOz: number
): number {
  return weight * purity * pricePerOz;
}

export function convertWeight(
  value: number,
  fromUnit: string,
  toUnit: string
): number {
  const conversions = {
    'g': 0.0321507, // grams to troy ounces
    'oz': 1, // troy ounces
    'dwt': 0.05, // pennyweight to troy ounces
    'gr': 0.00228571, // grains to troy ounces
  };
  
  const fromOz = value * (conversions[fromUnit as keyof typeof conversions] || 1);
  return fromOz / (conversions[toUnit as keyof typeof conversions] || 1);
}

export async function performCalculation(
  weight: number,
  purity: number,
  metal: MetalType,
  customPrice?: number
): Promise<CalculatorResult> {
  try {
    const response = await fetch('/api/calculator/precious-metals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        weight,
        purity,
        metal,
        customPrice,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Calculation failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Calculator error:', error);
    throw error;
  }
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatWeight(weight: number, unit = 'oz'): string {
  return `${weight.toFixed(4)} ${unit}`;
}

export function formatPurity(purity: number, asPercentage = false): string {
  if (asPercentage) {
    return `${(purity * 100).toFixed(1)}%`;
  }
  return purity.toFixed(4);
}
