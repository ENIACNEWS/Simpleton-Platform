import { db } from "./db";
import { listedBusinesses } from "@shared/schema";
import { sql, isNull, or, lt, eq } from "drizzle-orm";

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_API_KEY;
const SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000;
const BATCH_SIZE = 10;
const DELAY_BETWEEN_CALLS = 2000;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function findPlaceId(name: string, address: string, city: string, state: string): Promise<string | null> {
  if (!GOOGLE_API_KEY) return null;
  try {
    const query = encodeURIComponent(`${name} ${address} ${city} ${state}`);
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id&key=${GOOGLE_API_KEY}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await r.json();
    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].place_id;
    }
  } catch (e: any) {
    console.error(`Google Places lookup failed for ${name}:`, e.message);
  }
  return null;
}

async function fetchGoogleReviews(placeId: string): Promise<{ rating: number; reviewCount: number } | null> {
  if (!GOOGLE_API_KEY || !placeId) return null;
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating,user_ratings_total&key=${GOOGLE_API_KEY}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await r.json();
    if (data.result) {
      return {
        rating: data.result.rating || 0,
        reviewCount: data.result.user_ratings_total || 0,
      };
    }
  } catch (e: any) {
    console.error(`Google review fetch failed for ${placeId}:`, e.message);
  }
  return null;
}

async function syncBatch() {
  if (!GOOGLE_API_KEY) return 0;

  const staleThreshold = new Date(Date.now() - SYNC_INTERVAL_MS);

  const businessesToSync = await db.select().from(listedBusinesses)
    .where(
      sql`${listedBusinesses.status} IN ('approved', 'blacklisted') AND (${listedBusinesses.lastGoogleSync} IS NULL OR ${listedBusinesses.lastGoogleSync} < ${staleThreshold})`
    )
    .limit(BATCH_SIZE);

  if (businessesToSync.length === 0) return 0;

  let updated = 0;

  for (const biz of businessesToSync) {
    try {
      let placeId = biz.googlePlaceId;

      if (!placeId) {
        placeId = await findPlaceId(biz.name, biz.address, biz.city, biz.state);
        if (placeId) {
          await db.update(listedBusinesses)
            .set({ googlePlaceId: placeId })
            .where(eq(listedBusinesses.id, biz.id));
        }
        await sleep(DELAY_BETWEEN_CALLS);
      }

      if (placeId) {
        const reviews = await fetchGoogleReviews(placeId);
        if (reviews) {
          await db.update(listedBusinesses)
            .set({
              googleRating: reviews.rating.toFixed(1),
              googleReviewCount: reviews.reviewCount,
              lastGoogleSync: new Date(),
            })
            .where(eq(listedBusinesses.id, biz.id));
          updated++;
        } else {
          await db.update(listedBusinesses)
            .set({ lastGoogleSync: new Date() })
            .where(eq(listedBusinesses.id, biz.id));
        }
      } else {
        await db.update(listedBusinesses)
          .set({ lastGoogleSync: new Date() })
          .where(eq(listedBusinesses.id, biz.id));
      }

      await sleep(DELAY_BETWEEN_CALLS);
    } catch (e: any) {
      console.error(`Sync error for ${biz.name}:`, e.message);
      await db.update(listedBusinesses)
        .set({ lastGoogleSync: new Date() })
        .where(eq(listedBusinesses.id, biz.id));
    }
  }

  return updated;
}

let syncInterval: ReturnType<typeof setInterval> | null = null;

export function startGoogleReviewSync() {
  if (syncInterval) return;

  if (!GOOGLE_API_KEY) {
    console.log('📊 Google Review Sync: No API key configured (GOOGLE_PLACES_API_KEY). Reviews will use existing data.');
    console.log('📊 To enable auto-sync, add GOOGLE_PLACES_API_KEY environment variable.');
    return;
  }

  console.log('📊 Google Review Sync: Starting automatic review updates...');

  setTimeout(async () => {
    try {
      const count = await syncBatch();
      console.log(`📊 Google Review Sync: Initial batch updated ${count} businesses`);
    } catch (e: any) {
      console.error('Google Review Sync initial batch error:', e.message);
    }
  }, 30000);

  syncInterval = setInterval(async () => {
    try {
      const count = await syncBatch();
      if (count > 0) {
        console.log(`📊 Google Review Sync: Updated ${count} businesses`);
      }
    } catch (e: any) {
      console.error('Google Review Sync error:', e.message);
    }
  }, 5 * 60 * 1000);
}

export function stopGoogleReviewSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}
