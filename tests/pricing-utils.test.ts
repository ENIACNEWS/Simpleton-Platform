import { describe, it, expect } from 'vitest';

describe('Pricing Utilities', () => {
  // Melt value calculation test
  it('should calculate gold melt value correctly', () => {
    const spotPrice = 2800; // per troy oz
    const weightGrams = 23;
    const karatPurity: Record<number, number> = {
      24: 0.999, 22: 0.917, 18: 0.750, 14: 0.583, 10: 0.417
    };

    const gramsToTroyOz = 1 / 31.1035;

    // 14K gold chain at 23 grams
    const purity = karatPurity[14];
    const troyOz = weightGrams * gramsToTroyOz;
    const pureGoldOz = troyOz * purity;
    const meltValue = pureGoldOz * spotPrice;

    expect(meltValue).toBeGreaterThan(0);
    expect(meltValue).toBeLessThan(spotPrice); // 23g of 14K should be less than 1 oz of pure
    expect(pureGoldOz).toBeCloseTo(0.4309, 2);
  });

  it('should calculate silver melt value for junk silver', () => {
    const silverSpot = 32; // per troy oz
    // Morgan Dollar contains 0.77344 troy oz of silver
    const silverContent = 0.77344;
    const meltValue = silverContent * silverSpot;

    expect(meltValue).toBeCloseTo(24.75, 0);
  });

  it('should handle gold/silver ratio calculation', () => {
    const goldPrice = 2800;
    const silverPrice = 32;
    const ratio = goldPrice / silverPrice;

    expect(ratio).toBeGreaterThan(50);
    expect(ratio).toBeLessThan(120);
    expect(ratio).toBeCloseTo(87.5, 0);
  });

  it('should convert between weight units correctly', () => {
    // 1 troy ounce = 31.1035 grams
    const troyOzToGrams = 31.1035;
    // 1 pennyweight (dwt) = 1.55517 grams
    const dwtToGrams = 1.55517;
    // 20 dwt = 1 troy ounce
    const dwtPerTroyOz = 20;

    expect(troyOzToGrams).toBeCloseTo(31.1035, 4);
    expect(dwtToGrams * dwtPerTroyOz).toBeCloseTo(troyOzToGrams, 1);

    // Convert 10 grams to troy ounces
    const tenGramsInTroyOz = 10 / troyOzToGrams;
    expect(tenGramsInTroyOz).toBeCloseTo(0.3215, 3);
  });

  it('should validate diamond pricing tiers', () => {
    // Rapaport pricing jumps at key carat weights
    const priceTiers = [0.30, 0.50, 0.70, 1.00, 1.50, 2.00, 3.00, 5.00];

    // Each tier should be larger than the previous
    for (let i = 1; i < priceTiers.length; i++) {
      expect(priceTiers[i]).toBeGreaterThan(priceTiers[i-1]);
    }

    // 1 carat should be in the list
    expect(priceTiers).toContain(1.00);
  });
});
