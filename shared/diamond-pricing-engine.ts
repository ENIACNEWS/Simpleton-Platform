/**
 * DUAL-CATEGORY DIAMOND PRICING ENGINE
 * 
 * Dual-category pricing system:
 * - ROUND diamonds: Uses Round Rapaport grid (shared/rapaport-grid-lock.ts)
 * - ALL other shapes: Uses Pear pricing grid (shared/pear-pricing-grid-lock.ts)
 * 
 * Formula: All numbers × 100 = USD per carat
 */

import { getRapaportGridPrice } from './rapaport-grid-lock';
import { getPearGridPrice } from './pear-pricing-grid-lock';

/**
 * Get carat range for Round diamond grid
 */
function getCaratRange(carat: number): string | null {
  if (carat >= 0.01 && carat <= 0.03) return "0.01-0.03";
  if (carat >= 0.04 && carat <= 0.07) return "0.04-0.07";
  if (carat >= 0.08 && carat <= 0.14) return "0.08-0.14";
  if (carat >= 0.15 && carat <= 0.17) return "0.15-0.17";
  if (carat >= 0.18 && carat <= 0.22) return "0.18-0.22";
  if (carat >= 0.23 && carat <= 0.29) return "0.23-0.29";
  if (carat >= 0.30 && carat <= 0.39) return "0.30-0.39";
  if (carat >= 0.40 && carat <= 0.49) return "0.40-0.49";
  if (carat >= 0.50 && carat <= 0.69) return "0.50-0.69";
  if (carat >= 0.70 && carat <= 0.89) return "0.70-0.89";
  if (carat >= 0.90 && carat <= 0.99) return "0.90-0.99";
  if (carat >= 1.00 && carat <= 1.49) return "1.00-1.49";
  return null;
}

/**
 * Get carat range for Pear diamond grid (all non-round shapes)
 */
function getPearCaratRange(carat: number): string | null {
  if (carat >= 0.18 && carat <= 0.22) return "0.18-0.22";
  if (carat >= 0.23 && carat <= 0.29) return "0.23-0.29";
  if (carat >= 0.30 && carat <= 0.39) return "0.30-0.39";
  if (carat >= 0.40 && carat <= 0.49) return "0.40-0.49";
  if (carat >= 0.50 && carat <= 0.69) return "0.50-0.69";
  if (carat >= 0.70 && carat <= 0.89) return "0.70-0.89";
  if (carat >= 0.90 && carat <= 0.99) return "0.90-0.99";
  if (carat >= 1.00 && carat <= 1.49) return "1.00-1.49";
  if (carat >= 1.50 && carat <= 1.99) return "1.50-1.99";
  if (carat >= 2.00 && carat <= 2.99) return "2.00-2.99";
  if (carat >= 3.00 && carat <= 3.99) return "3.00-3.99";
  if (carat >= 4.00 && carat <= 4.99) return "4.00-4.99";
  if (carat >= 5.00 && carat <= 5.99) return "5.00-5.99";
  if (carat >= 6.00 && carat <= 6.99) return "6.00-6.99";
  if (carat >= 7.00 && carat <= 7.99) return "7.00-7.99";
  if (carat >= 8.00 && carat <= 8.99) return "8.00-8.99";
  if (carat >= 9.00 && carat <= 9.99) return "9.00-9.99";
  if (carat >= 10.00 && carat <= 10.99) return "10.00-10.99";
  return null;
}

/**
 * Dual-category diamond pricing:
 * - ROUND diamonds: Uses Round Rapaport grid
 * - ALL other shapes: Uses Pear pricing grid
 * Formula: All numbers × 100 = USD per carat
 */
export function priceDiamond(
  carat: number | string, 
  color: string, 
  clarity: string, 
  shape: string, 
  method: string | null = null
): string {
  try {
    // Input validation
    const caratNum = typeof carat === 'string' ? parseFloat(carat) : carat;
    
    if (isNaN(caratNum) || caratNum <= 0 || caratNum > 50) {
      throw new Error(`Invalid carat weight: ${carat}. Must be between 0.01 and 50.00`);
    }
    
    const normalizedColor = color.toUpperCase();
    const normalizedClarity = clarity.toUpperCase();
    const normalizedShape = shape.toUpperCase();
    
    // 🔒 DUAL-CATEGORY SYSTEM - AUTHENTIC RAPAPORT METHODOLOGY
    let pricePerCarat = 0;
    
    if (normalizedShape === 'ROUND') {
      // Use Round Rapaport grid for ROUND diamonds only
      const caratRange = getCaratRange(caratNum);
      if (caratRange) {
        pricePerCarat = getRapaportGridPrice(caratRange, normalizedColor, normalizedClarity);
        console.log(`💎 AUTHENTIC RAPAPORT PRICING:
    ${caratNum}ct ${normalizedColor} ${normalizedClarity} ${normalizedShape}
    Pricing Table: ROUND Diamonds
    Rapaport Price: $${pricePerCarat.toLocaleString()}/ct
    Total Wholesale: $${(pricePerCarat * caratNum).toLocaleString()}`);
      }
    } else {
      // Use Pear pricing grid for ALL non-round shapes
      const caratRange = getPearCaratRange(caratNum);
      if (caratRange) {
        pricePerCarat = getPearGridPrice(caratRange, normalizedColor, normalizedClarity);
        console.log(`💎 AUTHENTIC RAPAPORT PRICING:
    ${caratNum}ct ${normalizedColor} ${normalizedClarity} ${normalizedShape}
    Pricing Table: PEAR (All Non-Round Shapes)
    Rapaport Price: $${pricePerCarat.toLocaleString()}/ct
    Total Wholesale: $${(pricePerCarat * caratNum).toLocaleString()}`);
      }
    }
    
    if (pricePerCarat === 0) {
      throw new Error(`No pricing available for ${caratNum}ct ${normalizedColor} ${normalizedClarity} ${normalizedShape}`);
    }
    
    // Calculate total price: carat × pricePerCarat
    const totalPrice = caratNum * pricePerCarat;
    
    // Return as string with 2 decimal places
    return totalPrice.toFixed(2);
  } catch (error) {
    console.error('Diamond pricing error:', error);
    throw error;
  }
}

/**
 * Refresh pricing data from live source (handled by hourly updater)
 */
export async function refreshPricingData(): Promise<void> {
  console.log('🔄 Pricing data refresh: Handled by hourly Rapaport grid updater');
}

/**
 * Get available diamond shapes for validation
 */
export const DIAMOND_SHAPES = [
  'ROUND', 'PRINCESS', 'EMERALD', 'OVAL', 'MARQUISE', 
  'CUSHION', 'ASSCHER', 'RADIANT', 'HEART', 'PEAR'
] as const;

/**
 * Get available diamond colors for validation
 */
export const DIAMOND_COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'] as const;

/**
 * Get available diamond clarities for validation
 */
export const DIAMOND_CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'] as const;

/**
 * Validate diamond specifications without pricing
 */
export function validateDiamondSpecs(carat: number, color: string, clarity: string, shape: string): boolean {
  try {
    if (isNaN(carat) || carat <= 0 || carat > 50) return false;
    if (!DIAMOND_COLORS.includes(color.toUpperCase() as any)) return false;
    if (!DIAMOND_CLARITIES.includes(clarity.toUpperCase() as any)) return false;
    if (!DIAMOND_SHAPES.includes(shape.toUpperCase() as any)) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Get available options for validation
 */
export const DIAMOND_OPTIONS = {
  colors: DIAMOND_COLORS,
  clarities: DIAMOND_CLARITIES,
  shapes: DIAMOND_SHAPES
} as const;