import { discoverNewBusinesses, fetchWithAISearch } from '../server/simplicity-web-intelligence';
import { db } from '../server/db';
import { listedBusinesses } from '../shared/schema';
import { sql } from 'drizzle-orm';

interface AIBusiness {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string | null;
  website: string | null;
  rating: number | null;
}

async function discoverViaAI(city: string, state: string, category: string): Promise<{ data: AIBusiness[]; source: string }> {
  const typeLabel = category === 'pawn_shop' ? 'pawn shops and gold buyers' : 'jewelry stores and diamond dealers';
  const result = await fetchWithAISearch<{ businesses: AIBusiness[] }>(
    `Find all ${typeLabel} in ${city}, ${state}`,
    `Search for real, currently operating ${typeLabel} in ${city}, ${state}. Find as many as possible (up to 20). For each, get: exact business name, full street address, city, state, zip code, phone number, and website if available. Only include businesses you can verify are real and currently operating.`,
    `{"businesses": [{"name": "string", "address": "string", "city": "string", "state": "string", "zip": "string", "phone": "string or null", "website": "string or null", "rating": null}]}`
  );

  if (result.data?.businesses) {
    return { data: result.data.businesses, source: 'ai_web_search' };
  }
  return { data: [], source: 'ai_web_search' };
}

const REMAINING_CITIES: [string, string][] = [
  // Texas (only 6 so far, need way more)
  ["Houston", "TX"], ["Dallas", "TX"], ["San Antonio", "TX"], ["Austin", "TX"], ["Fort Worth", "TX"],
  ["El Paso", "TX"], ["Arlington", "TX"], ["Corpus Christi", "TX"], ["Lubbock", "TX"], ["Laredo", "TX"],
  ["Amarillo", "TX"], ["Brownsville", "TX"], ["McAllen", "TX"], ["Beaumont", "TX"], ["Waco", "TX"],
  ["Midland", "TX"], ["Odessa", "TX"], ["Tyler", "TX"], ["Killeen", "TX"], ["Abilene", "TX"],
  // Tennessee
  ["Memphis", "TN"], ["Nashville", "TN"], ["Knoxville", "TN"], ["Chattanooga", "TN"], ["Clarksville", "TN"],
  ["Murfreesboro", "TN"], ["Jackson", "TN"], ["Johnson City", "TN"],
  // South Carolina
  ["Charleston", "SC"], ["Columbia", "SC"], ["Greenville", "SC"], ["Myrtle Beach", "SC"], ["North Charleston", "SC"],
  ["Rock Hill", "SC"], ["Spartanburg", "SC"],
  // Virginia
  ["Virginia Beach", "VA"], ["Norfolk", "VA"], ["Richmond", "VA"], ["Newport News", "VA"], ["Alexandria", "VA"],
  ["Hampton", "VA"], ["Roanoke", "VA"], ["Chesapeake", "VA"], ["Lynchburg", "VA"],
  // Washington
  ["Seattle", "WA"], ["Tacoma", "WA"], ["Spokane", "WA"], ["Vancouver", "WA"], ["Everett", "WA"],
  ["Kent", "WA"], ["Renton", "WA"], ["Bellevue", "WA"],
  // Wisconsin
  ["Milwaukee", "WI"], ["Madison", "WI"], ["Green Bay", "WI"], ["Kenosha", "WI"], ["Racine", "WI"],
  ["Appleton", "WI"], ["Oshkosh", "WI"],
  // West Virginia
  ["Charleston", "WV"], ["Huntington", "WV"], ["Morgantown", "WV"], ["Parkersburg", "WV"],
  // Utah
  ["Salt Lake City", "UT"], ["Provo", "UT"], ["Ogden", "UT"], ["West Valley City", "UT"], ["St George", "UT"],
  // South Dakota
  ["Sioux Falls", "SD"], ["Rapid City", "SD"], ["Aberdeen", "SD"],
  // Vermont
  ["Burlington", "VT"], ["Rutland", "VT"],
  // Wyoming
  ["Cheyenne", "WY"], ["Casper", "WY"], ["Laramie", "WY"],
  // DC
  ["Washington", "DC"],
  // Iowa (more)
  ["Des Moines", "IA"], ["Cedar Rapids", "IA"], ["Davenport", "IA"],
  // New Hampshire (more)
  ["Manchester", "NH"], ["Nashua", "NH"],
  // Maine (more)
  ["Portland", "ME"], ["Bangor", "ME"], ["Augusta", "ME"],
];

const CATEGORIES: Array<'pawn_shop' | 'jewelry_store'> = ['pawn_shop', 'jewelry_store'];

async function run() {
  let totalAdded = 0;
  let searchCount = 0;
  let useGoogle = true;

  for (const category of CATEGORIES) {
    const label = category === 'pawn_shop' ? 'PAWN SHOPS' : 'JEWELRY STORES';
    console.log(`\n${'='.repeat(50)}`);
    console.log(`  DISCOVERING ${label}`);
    console.log(`${'='.repeat(50)}`);

    for (const [city, state] of REMAINING_CITIES) {
      searchCount++;
      try {
        process.stdout.write(`[${searchCount}] ${city}, ${state} (${category}) via ${useGoogle ? 'Google' : 'AI'}... `);

        let businesses: any[] = [];
        let source = '';

        if (useGoogle) {
          const result = await discoverNewBusinesses(city, state, category);
          businesses = result.data || [];
          source = result.source;
        } else {
          const result = await discoverViaAI(city, state, category);
          businesses = result.data;
          source = result.source;
        }

        useGoogle = !useGoogle;

        if (businesses.length > 0) {
          let added = 0;
          for (const biz of businesses.slice(0, 20)) {
            try {
              await db.insert(listedBusinesses).values({
                name: biz.name,
                address: biz.address || "Address pending verification",
                city: biz.city || city,
                state: biz.state || state,
                zip: biz.zip || "00000",
                phone: biz.phone || null,
                website: biz.website || null,
                hours: biz.hours || null,
                category,
                status: "approved",
                googleRating: biz.rating ? String(biz.rating) : null,
                googleReviewCount: biz.reviewCount || null,
                googlePlaceId: biz.placeId || null,
                lastGoogleSync: new Date(),
              }).onConflictDoNothing();
              added++;
              totalAdded++;
            } catch (e: any) {}
          }
          console.log(`found ${businesses.length}, added ${added} [${source}]`);
        } else {
          console.log(`0 new [${source}]`);
        }

        await new Promise(r => setTimeout(r, useGoogle ? 300 : 500));
      } catch (e: any) {
        console.log(`ERROR: ${e.message?.slice(0, 60)}`);
      }
    }
  }

  const total = await db.select({ count: sql<number>`count(*)` }).from(listedBusinesses);
  console.log(`\n${'='.repeat(50)}`);
  console.log(`  BATCH COMPLETE`);
  console.log(`  Searches: ${searchCount}`);
  console.log(`  Added this batch: ${totalAdded}`);
  console.log(`  Total in Simpleton's List: ${total[0].count}`);
  console.log(`${'='.repeat(50)}`);

  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
