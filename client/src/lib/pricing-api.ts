import { PricingData, LivePrices } from "@/types";

// Real-time precious metals pricing from authentic sources
export async function fetchLatestPricing(): Promise<LivePrices> {
  // Primary: Kitco Data Source (most reliable precious metals specialist)
  try {
    const kitcoResponse = await fetch('/api/pricing/kitco');
    if (kitcoResponse.ok) {
      const kitcoData = await kitcoResponse.json();
      if (kitcoData.success && kitcoData.prices) {

        return kitcoData.prices;
      }
    }
  } catch (e) {
    console.log('Kitco API unavailable, trying Coinbase...');
  }
  
  // Fallback: Coinbase Public API (confirmed working - no API key required!)
  try {
    const coinbaseResponse = await fetch('https://api.coinbase.com/v2/exchange-rates');
    if (coinbaseResponse.ok) {
      const coinbaseData = await coinbaseResponse.json();
      
      if (coinbaseData && coinbaseData.data && coinbaseData.data.rates) {
        const rates = coinbaseData.data.rates;
        
        const goldRate = rates.XAU; // Gold in USD (Coinbase returns as fraction)
        const silverRate = rates.XAG; // Silver in USD (Coinbase returns as fraction)
        
        if (goldRate && goldRate > 0) {
          // Coinbase returns rates as fractions (1/USD_per_oz), so we need to invert them
          const goldPrice = 1 / parseFloat(goldRate);
          const silverPrice = silverRate ? 1 / parseFloat(silverRate) : 0;
          const platinumPrice = rates.XPT ? 1 / parseFloat(rates.XPT) : 0;
          
          return {
            gold: goldPrice,
            silver: silverPrice,
            platinum: platinumPrice,
            palladium: 0, // Removed - using fractional oz button instead
          };
        }
      }
    }
  } catch (e) {
    console.log('Coinbase API temporarily unavailable:', e);
  }

  console.log('📝 Testing claimed free APIs completed. Checking authenticated sources...');

  // 1. Try Metals-API (free tier: 100 requests/month)
  const metalsApiKey = import.meta.env.VITE_METALS_API_KEY;
  if (metalsApiKey) {
    try {
      const metalsResponse = await fetch(`https://metals-api.com/api/latest?access_key=${metalsApiKey}&base=USD&symbols=XAU,XAG,XPT,XPD`);
      if (metalsResponse.ok) {
        const metalsData = await metalsResponse.json();
        console.log('✅ Metals-API connected successfully:', metalsData);
        if (metalsData && metalsData.success && metalsData.rates) {
          return {
            gold: metalsData.rates.XAU ? (1 / metalsData.rates.XAU) : 0,
            silver: metalsData.rates.XAG ? (1 / metalsData.rates.XAG) : 0,
            platinum: metalsData.rates.XPT ? (1 / metalsData.rates.XPT) : 0,
            palladium: metalsData.rates.XPD ? (1 / metalsData.rates.XPD) : 0,
          };
        }
      }
    } catch (e) {
      console.log('❌ Metals-API unavailable:', e);
    }
  }

  // 2. Try MetalpriceAPI (free tier available)
  const metalpriceApiKey = import.meta.env.VITE_METALPRICE_API_KEY;
  if (metalpriceApiKey) {
    try {
      const metalPriceResponse = await fetch(`https://api.metalpriceapi.com/v1/latest?api_key=${metalpriceApiKey}&base=USD&currencies=XAU,XAG,XPT,XPD`);
      if (metalPriceResponse.ok) {
        const metalPriceData = await metalPriceResponse.json();
        console.log('✅ MetalpriceAPI connected successfully:', metalPriceData);
        if (metalPriceData && metalPriceData.success && metalPriceData.rates) {
          return {
            gold: metalPriceData.rates.USDXAU || 0,
            silver: metalPriceData.rates.USDXAG || 0,
            platinum: metalPriceData.rates.USDXPT || 0,
            palladium: metalPriceData.rates.USDXPD || 0,
          };
        }
      }
    } catch (e) {
      console.log('❌ MetalpriceAPI unavailable:', e);
    }
  }

  // 3. Try GoldAPI.io (free tier: 1,000 requests/month)
  const goldApiKey = import.meta.env.VITE_GOLDAPI_KEY;
  if (goldApiKey) {
    try {
      const goldApiResponse = await fetch(`https://www.goldapi.io/api/XAU/USD`, {
        headers: { 'x-access-token': goldApiKey }
      });
      if (goldApiResponse.ok) {
        const goldData = await goldApiResponse.json();
        console.log('✅ GoldAPI.io connected successfully:', goldData);
        if (goldData && goldData.price) {
          // Get silver separately
          try {
            const silverResponse = await fetch(`https://www.goldapi.io/api/XAG/USD`, {
              headers: { 'x-access-token': goldApiKey }
            });
            const silverData = await silverResponse.json();
            return {
              gold: parseFloat(goldData.price),
              silver: silverData?.price ? parseFloat(silverData.price) : 0,
              platinum: 0, // Would need separate calls
              palladium: 0, // Would need separate calls
            };
          } catch {
            return {
              gold: parseFloat(goldData.price),
              silver: 0,
              platinum: 0,
              palladium: 0,
            };
          }
        }
      }
    } catch (e) {
      console.log('❌ GoldAPI.io unavailable:', e);
    }
  }

  // 5. Try backend API as final fallback
  try {
    const response = await fetch('/api/pricing/live-external');
    if (response.ok) {
      const data = await response.json();
      if (data && data.gold && data.gold > 0) {
        return data;
      }
    }
  } catch (e) {
    console.log('Backend live pricing unavailable');
  }

  // If all authentic sources fail, throw error (never use fake data)
  throw new Error('Live pricing temporarily unavailable. All precious metals APIs are not responding.');
}

export async function fetchMetalHistory(metal: string): Promise<PricingData[]> {
  try {
    const response = await fetch(`/api/pricing/${metal}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${metal} pricing history`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${metal} history:`, error);
    return [];
  }
}
