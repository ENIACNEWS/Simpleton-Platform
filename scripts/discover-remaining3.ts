import { discoverNewBusinesses } from '../server/simplicity-web-intelligence';
import { db } from '../server/db';
import { listedBusinesses } from '../shared/schema';
import { sql } from 'drizzle-orm';

const CITIES: [string, string][] = [
  // Jewelry stores - remaining states
  ["Tucson", "AZ"], ["Little Rock", "AR"], ["Fresno", "CA"], ["Hartford", "CT"],
  ["Wilmington", "DE"], ["Fort Lauderdale", "FL"], ["Savannah", "GA"],
  ["Honolulu", "HI"], ["Boise", "ID"], ["Springfield", "IL"], ["Fort Wayne", "IN"],
  ["Wichita", "KS"], ["Lexington", "KY"], ["Shreveport", "LA"],
  ["Portland", "ME"], ["Worcester", "MA"], ["Grand Rapids", "MI"], ["Flint", "MI"],
  ["Rochester", "MN"], ["Jackson", "MS"], ["Omaha", "NE"],
  ["Reno", "NV"], ["Newark", "NJ"], ["Albuquerque", "NM"],
  ["Buffalo", "NY"], ["Syracuse", "NY"], ["Greensboro", "NC"],
  ["Fargo", "ND"], ["Toledo", "OH"], ["Tulsa", "OK"],
  ["Eugene", "OR"], ["Allentown", "PA"], ["Providence", "RI"],
  ["Greenville", "SC"], ["Columbia", "SC"], ["Sioux Falls", "SD"],
  ["Knoxville", "TN"], ["Chattanooga", "TN"],
  ["El Paso", "TX"], ["Corpus Christi", "TX"], ["Lubbock", "TX"],
  ["Provo", "UT"], ["Burlington", "VT"], ["Roanoke", "VA"],
  ["Spokane", "WA"], ["Tacoma", "WA"],
  ["Charleston", "WV"], ["Green Bay", "WI"],
  ["Casper", "WY"],
  // Coin dealers - major cities
  ["New York", "NY"], ["Los Angeles", "CA"], ["Chicago", "IL"], ["Houston", "TX"],
  ["Dallas", "TX"], ["Phoenix", "AZ"], ["Philadelphia", "PA"], ["San Antonio", "TX"],
  ["San Diego", "CA"], ["Denver", "CO"], ["Miami", "FL"], ["Atlanta", "GA"],
  ["Seattle", "WA"], ["Detroit", "MI"], ["Minneapolis", "MN"],
  ["Tampa", "FL"], ["Las Vegas", "NV"], ["Cleveland", "OH"],
  ["Nashville", "TN"], ["Kansas City", "MO"], ["Columbus", "OH"],
  ["Charlotte", "NC"], ["Indianapolis", "IN"], ["Jacksonville", "FL"],
  ["San Francisco", "CA"], ["Austin", "TX"],
];

async function run() {
  let totalAdded = 0;
  let searchCount = 0;

  for (const [city, state] of CITIES) {
    searchCount++;
    const category = searchCount <= 49 ? 'jewelry_store' : 'coin_dealer';

    try {
      process.stdout.write(`[${searchCount}] ${city}, ${state} (${category})... `);
      const result = await discoverNewBusinesses(city, state, category as any);

      if (result.data && result.data.length > 0) {
        let added = 0;
        for (const biz of result.data.slice(0, 20)) {
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
        console.log(`found ${result.data.length}, added ${added}`);
      } else {
        console.log(`0 new`);
      }

      await new Promise(r => setTimeout(r, 400));
    } catch (e: any) {
      console.log(`ERROR: ${e.message?.slice(0, 60)}`);
    }
  }

  const total = await db.select({ count: sql<number>`count(*)` }).from(listedBusinesses);
  const byState = await db.execute(sql`SELECT state, count(*) as cnt FROM listed_businesses GROUP BY state ORDER BY cnt DESC LIMIT 15`);
  console.log(`\n${'='.repeat(50)}`);
  console.log(`  BATCH 3 COMPLETE`);
  console.log(`  Searches: ${searchCount}`);
  console.log(`  Added this batch: ${totalAdded}`);
  console.log(`  GRAND TOTAL: ${total[0].count}`);
  console.log(`\n  Top 15 states:`);
  for (const row of byState.rows) { console.log(`    ${row.state}: ${row.cnt}`); }
  console.log(`${'='.repeat(50)}`);

  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
