/**
 * SIMPLICITY WEB INTELLIGENCE ENGINE
 *
 * The right way to pull information from the web.
 * No scrapers. No fake data. No Math.random() fillers.
 *
 * Three layers:
 *   1. VERIFIED APIs   — authoritative sources with real keys
 *   2. AI WEB SEARCH   — Claude uses web_search tool for anything not in an API
 *   3. VALIDATION      — every piece of data is confidence-scored before storage
 *
 * Sources used:
 *   - Google Places API  → business listings (phone, address, hours, website)
 *   - Kitco API          → live metals pricing (already working)
 *   - FRED API           → economic context (already working)
 *   - CoinGecko          → crypto correlation (free, no key)
 *   - Claude web_search  → everything else — coin data, news, market context
 */

import Anthropic from '@anthropic-ai/sdk';
import { db } from './db';
import { listedBusinesses } from '@shared/schema';
import { eq, isNull, lt, or } from 'drizzle-orm';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_API_KEY;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IntelligenceResult<T> {
  data: T | null;
  confidence: number;       // 0-1
  source: string;           // where it came from
  fetchedAt: string;        // ISO timestamp
  error?: string;
}

export interface BusinessListing {
  name: string;
  phone: string | null;
  address: string;
  city: string;
  state: string;
  zip: string;
  hours: string | null;
  website: string | null;
  rating: number | null;
  reviewCount: number | null;
  placeId: string | null;
}

export interface CoinData {
  name: string;
  metalContent: number;  // troy oz
  metal: 'gold' | 'silver' | 'platinum';
  purity: number;        // 0-1
  meltValue: number;     // calculated at current spot
  numismaticPremium?: { low: number; high: number };
  keyDate: boolean;
  mintMarks: string[];
  years: string;
}

export interface MarketContext {
  metal: string;
  spotPrice: number;
  trend7d: 'up' | 'down' | 'flat';
  trendPct7d: number;
  goldSilverRatio?: number;
  dollarStrength?: number;
  headline: string;
  sources: string[];
}

// ─── Layer 1: Google Places (New) — Business Listings ───────────────────────

function parseAddressComponents(components: any[]): { street: string; city: string; state: string; zip: string } {
  const get = (type: string) => components.find((c: any) => c.types?.includes(type));
  const streetNumber = get('street_number')?.longText || '';
  const route = get('route')?.longText || '';
  return {
    street: streetNumber && route ? `${streetNumber} ${route}` : '',
    city: get('locality')?.longText || get('sublocality')?.longText || '',
    state: get('administrative_area_level_1')?.shortText || '',
    zip: get('postal_code')?.longText || '',
  };
}

function formatRegularHours(hours: any): string | null {
  if (!hours?.periods) return null;
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const lines: string[] = [];
  for (const period of hours.periods) {
    const day = dayNames[period.open?.day] || '';
    const open = period.open?.hour !== undefined ? `${String(period.open.hour).padStart(2, '0')}:${String(period.open.minute || 0).padStart(2, '0')}` : '';
    const close = period.close?.hour !== undefined ? `${String(period.close.hour).padStart(2, '0')}:${String(period.close.minute || 0).padStart(2, '0')}` : '';
    if (day && open) lines.push(`${day}: ${open}–${close}`);
  }
  return lines.length > 0 ? lines.join(' | ') : null;
}

export async function fetchBusinessFromGoogle(
  name: string,
  address: string,
  city: string,
  state: string
): Promise<IntelligenceResult<BusinessListing>> {
  if (!GOOGLE_API_KEY) {
    return { data: null, confidence: 0, source: 'none', fetchedAt: new Date().toISOString(), error: 'GOOGLE_PLACES_API_KEY not set' };
  }

  try {
    const searchRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.regularOpeningHours,places.addressComponents',
      },
      body: JSON.stringify({ textQuery: `${name} ${address} ${city} ${state}` }),
      signal: AbortSignal.timeout(10000),
    });

    const searchData = await searchRes.json() as any;

    if (searchData.error) {
      return { data: null, confidence: 0.1, source: 'google_places_new', fetchedAt: new Date().toISOString(), error: `Google Places: ${searchData.error.message || searchData.error.status}` };
    }

    if (!searchData.places || searchData.places.length === 0) {
      return { data: null, confidence: 0.1, source: 'google_places_new', fetchedAt: new Date().toISOString(), error: 'No results found' };
    }

    const place = searchData.places[0];
    const parsed = parseAddressComponents(place.addressComponents || []);
    const hours = formatRegularHours(place.regularOpeningHours);

    return {
      data: {
        name,
        phone: place.nationalPhoneNumber || null,
        address: parsed.street || address,
        city: parsed.city || city,
        state: parsed.state || state,
        zip: parsed.zip || '',
        hours,
        website: place.websiteUri || null,
        rating: place.rating || null,
        reviewCount: place.userRatingCount || null,
        placeId: place.id || null,
      },
      confidence: 0.95,
      source: 'google_places_api_new',
      fetchedAt: new Date().toISOString(),
    };
  } catch (e: any) {
    return { data: null, confidence: 0, source: 'google_places_new', fetchedAt: new Date().toISOString(), error: e.message };
  }
}

// ─── Layer 2: AI Web Search (anything not in a direct API) ────────────────────

export async function fetchWithAISearch<T>(
  query: string,
  extractionPrompt: string,
  expectedSchema: string
): Promise<IntelligenceResult<T>> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      tools: [{ type: 'web_search_20250305' as any, name: 'web_search' }],
      messages: [{
        role: 'user',
        content: `${query}\n\n${extractionPrompt}\n\nReturn ONLY a JSON object matching this schema (no markdown, no explanation):\n${expectedSchema}`,
      }],
    });

    // Extract the text response
    let responseText = '';
    for (const block of response.content) {
      if (block.type === 'text') responseText += block.text;
    }

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { data: null, confidence: 0.3, source: 'ai_web_search', fetchedAt: new Date().toISOString(), error: 'No JSON in response' };
    }

    const parsed = JSON.parse(jsonMatch[0]) as T;

    return {
      data: parsed,
      confidence: 0.80,
      source: 'ai_web_search_claude',
      fetchedAt: new Date().toISOString(),
    };
  } catch (e: any) {
    return { data: null, confidence: 0, source: 'ai_web_search', fetchedAt: new Date().toISOString(), error: e.message };
  }
}

// ─── Layer 3: Specialized fetchers ───────────────────────────────────────────

export async function fetchPawnshopsForCity(city: string, state: string, limit = 10): Promise<IntelligenceResult<BusinessListing[]>> {
  if (!GOOGLE_API_KEY) {
    // Fallback: AI web search
    const result = await fetchWithAISearch<{ businesses: BusinessListing[] }>(
      `Find the top pawnshops and jewelry buyers in ${city}, ${state}`,
      `Search for real, currently operating pawnshops and jewelry loan businesses in ${city}, ${state}. For each one find: exact name, street address, phone number, website if available, and business hours. Only include businesses you are highly confident are real and currently operating.`,
      `{"businesses": [{"name": "string", "address": "string", "city": "string", "state": "string", "zip": "string", "phone": "string or null", "website": "string or null", "hours": "string or null", "rating": null, "reviewCount": null, "placeId": null}]}`
    );

    if (result.data?.businesses) {
      return { ...result, data: result.data.businesses };
    }
    return { data: [], confidence: 0.3, source: 'ai_web_search', fetchedAt: new Date().toISOString() };
  }

  // Use Google Places API (New) Text Search
  try {
    const searchRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.addressComponents',
      },
      body: JSON.stringify({ textQuery: `pawn shop jewelry buyer ${city} ${state}`, maxResultCount: limit }),
      signal: AbortSignal.timeout(10000),
    });

    const data = await searchRes.json() as any;

    if (data.error) {
      return { data: [], confidence: 0.1, source: 'google_places_new_text_search', fetchedAt: new Date().toISOString(), error: data.error.message || data.error.status };
    }

    if (!data.places || data.places.length === 0) {
      return { data: [], confidence: 0.1, source: 'google_places_new_text_search', fetchedAt: new Date().toISOString(), error: 'No results' };
    }

    const businesses: BusinessListing[] = data.places.slice(0, limit).map((place: any) => {
      const parsed = parseAddressComponents(place.addressComponents || []);
      return {
        name: place.displayName?.text || '',
        phone: place.nationalPhoneNumber || null,
        address: parsed.street || '',
        city: parsed.city || city,
        state: parsed.state || state,
        zip: parsed.zip || '',
        hours: null,
        website: place.websiteUri || null,
        rating: place.rating || null,
        reviewCount: place.userRatingCount || null,
        placeId: place.id || null,
      };
    });

    return {
      data: businesses,
      confidence: 0.85,
      source: 'google_places_new_text_search',
      fetchedAt: new Date().toISOString(),
    };
  } catch (e: any) {
    return { data: [], confidence: 0, source: 'google_places_new_text_search', fetchedAt: new Date().toISOString(), error: e.message };
  }
}

export async function fetchCoinData(coinName: string): Promise<IntelligenceResult<CoinData>> {
  return fetchWithAISearch<CoinData>(
    `Find accurate numismatic data for the ${coinName}`,
    `Search for the exact specifications of the ${coinName} coin. Find: metal content in troy ounces, metal type (gold/silver/platinum), purity as decimal, whether it's a key date coin, all mint marks produced, and years of production. Also find current numismatic premium range over melt value for circulated examples. Only return data you are certain is accurate from authoritative numismatic sources.`,
    `{"name": "string", "metalContent": "number (troy oz)", "metal": "gold|silver|platinum", "purity": "number 0-1", "meltValue": 0, "numismaticPremium": {"low": "number", "high": "number"}, "keyDate": "boolean", "mintMarks": ["array of strings"], "years": "string range e.g. 1878-1921"}`
  );
}

export async function fetchMarketContext(metal: string, currentSpotPrice: number): Promise<IntelligenceResult<MarketContext>> {
  return fetchWithAISearch<MarketContext>(
    `Get current market context for ${metal} precious metals. Current spot price: $${currentSpotPrice}/oz`,
    `Search for the latest ${metal} market news and price movement. Find: 7-day price trend direction and percentage, current gold/silver ratio if relevant, any major market headlines affecting ${metal} prices today. Use only real current data from financial news sources.`,
    `{"metal": "string", "spotPrice": "number", "trend7d": "up|down|flat", "trendPct7d": "number", "goldSilverRatio": "number or null", "dollarStrength": "number or null", "headline": "string - one key market headline", "sources": ["array of source names used"]}`
  );
}

// ─── Batch business updater ───────────────────────────────────────────────────

export async function syncBusinessListings(limit = 20): Promise<{
  checked: number;
  updated: number;
  errors: number;
  details: string[];
}> {
  const results = { checked: 0, updated: 0, errors: 0, details: [] as string[] };

  if (!GOOGLE_API_KEY) {
    results.details.push('Google Places API key not configured. Set GOOGLE_PLACES_API_KEY to enable automatic syncing.');
    return results;
  }

  // Get businesses due for sync (older than 7 days or never synced)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const businesses = await db.select().from(listedBusinesses)
    .where(or(
      isNull(listedBusinesses.lastGoogleSync),
      lt(listedBusinesses.lastGoogleSync, sevenDaysAgo)
    ))
    .limit(limit);

  for (const biz of businesses) {
    results.checked++;

    try {
      const result = await fetchBusinessFromGoogle(biz.name, biz.address, biz.city, biz.state);

      if (result.data && result.confidence >= 0.8) {
        const updates: Record<string, any> = {
          lastGoogleSync: new Date(),
        };

        // Only update fields that have real data and differ from current
        if (result.data.phone && result.data.phone !== biz.phone) {
          updates.phone = result.data.phone;
        }
        if (result.data.website && !biz.website) {
          updates.website = result.data.website;
        }
        if (result.data.hours && result.data.hours !== biz.hours) {
          updates.hours = result.data.hours;
        }
        if (result.data.rating) {
          updates.googleRating = String(result.data.rating);
        }
        if (result.data.reviewCount) {
          updates.googleReviewCount = result.data.reviewCount;
        }
        if (result.data.placeId && !biz.googlePlaceId) {
          updates.googlePlaceId = result.data.placeId;
        }

        await db.update(listedBusinesses)
          .set(updates)
          .where(eq(listedBusinesses.id, biz.id));

        const fieldsChanged = Object.keys(updates).filter(k => k !== 'lastGoogleSync');
        if (fieldsChanged.length > 0) {
          results.updated++;
          results.details.push(`✅ ${biz.name}: updated ${fieldsChanged.join(', ')}`);
        } else {
          results.details.push(`✓ ${biz.name}: verified accurate, no changes needed`);
        }
      } else {
        // Just mark as synced to avoid re-checking every hour
        await db.update(listedBusinesses)
          .set({ lastGoogleSync: new Date() })
          .where(eq(listedBusinesses.id, biz.id));

        results.details.push(`⚠️ ${biz.name}: low confidence (${Math.round(result.confidence * 100)}%) — ${result.error || 'not found'}`);
      }

      // Respect Google rate limits
      await new Promise(r => setTimeout(r, 200));

    } catch (e: any) {
      results.errors++;
      results.details.push(`❌ ${biz.name}: ${e.message}`);
    }
  }

  return results;
}

// ─── Add new businesses to Simpleton's List via Google Places search ──────────

export async function discoverNewBusinesses(
  city: string,
  state: string,
  category: 'pawn_shop' | 'jewelry_store' | 'coin_dealer' = 'pawn_shop'
): Promise<IntelligenceResult<BusinessListing[]>> {
  const searchTerms: Record<string, string> = {
    pawn_shop: 'pawn shop jewelry loan',
    jewelry_store: 'jewelry store gold buyer',
    coin_dealer: 'coin shop numismatic dealer',
  };

  const searchTerm = searchTerms[category];
  const result = await fetchPawnshopsForCity(city, state, 20);

  // Filter out businesses already in the database
  if (result.data && result.data.length > 0) {
    const existingNames = await db.select({ name: listedBusinesses.name })
      .from(listedBusinesses)
      .where(eq(listedBusinesses.city, city));

    const existingSet = new Set(existingNames.map(b => b.name.toLowerCase()));
    const newBusinesses = result.data.filter(b => !existingSet.has(b.name.toLowerCase()));

    return { ...result, data: newBusinesses };
  }

  return result;
}
