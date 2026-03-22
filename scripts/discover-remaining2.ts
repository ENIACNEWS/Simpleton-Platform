import { discoverNewBusinesses } from '../server/simplicity-web-intelligence';
import { db } from '../server/db';
import { listedBusinesses } from '../shared/schema';
import { sql } from 'drizzle-orm';

const CITIES: [string, string][] = [
  // Remaining from pawn_shop pass
  ["Kenosha", "WI"], ["Racine", "WI"], ["Appleton", "WI"], ["Oshkosh", "WI"],
  ["Charleston", "WV"], ["Huntington", "WV"], ["Morgantown", "WV"], ["Parkersburg", "WV"],
  ["Salt Lake City", "UT"], ["Provo", "UT"], ["Ogden", "UT"], ["West Valley City", "UT"], ["St George", "UT"],
  ["Sioux Falls", "SD"], ["Rapid City", "SD"], ["Aberdeen", "SD"],
  ["Burlington", "VT"], ["Rutland", "VT"],
  ["Cheyenne", "WY"], ["Casper", "WY"], ["Laramie", "WY"],
  ["Washington", "DC"],
  ["Des Moines", "IA"], ["Cedar Rapids", "IA"], ["Davenport", "IA"],
  ["Manchester", "NH"], ["Nashua", "NH"],
  ["Portland", "ME"], ["Bangor", "ME"], ["Augusta", "ME"],
  // Jewelry stores - biggest states
  ["Houston", "TX"], ["Dallas", "TX"], ["San Antonio", "TX"], ["Austin", "TX"],
  ["Los Angeles", "CA"], ["San Francisco", "CA"], ["San Diego", "CA"],
  ["New York", "NY"], ["Brooklyn", "NY"], ["Miami", "FL"], ["Orlando", "FL"], ["Tampa", "FL"],
  ["Chicago", "IL"], ["Atlanta", "GA"], ["Philadelphia", "PA"], ["Phoenix", "AZ"],
  ["Denver", "CO"], ["Seattle", "WA"], ["Las Vegas", "NV"], ["Nashville", "TN"],
  ["Charlotte", "NC"], ["Detroit", "MI"], ["Cleveland", "OH"], ["Boston", "MA"],
  ["Minneapolis", "MN"], ["Kansas City", "MO"], ["St Louis", "MO"],
  ["Portland", "OR"], ["Indianapolis", "IN"], ["Columbus", "OH"],
  ["Milwaukee", "WI"], ["Memphis", "TN"], ["Louisville", "KY"],
  ["New Orleans", "LA"], ["Oklahoma City", "OK"], ["Raleigh", "NC"],
  ["Richmond", "VA"], ["Norfolk", "VA"], ["Birmingham", "AL"],
  ["Jacksonville", "FL"], ["San Jose", "CA"], ["Sacramento", "CA"],
  ["Pittsburgh", "PA"], ["Baltimore", "MD"], ["Salt Lake City", "UT"],
];

async function run() {
  let totalAdded = 0;
  let searchCount = 0;

  for (const [city, state] of CITIES) {
    searchCount++;
    const isPawnDone = searchCount <= 30;
    const category = isPawnDone ? 'pawn_shop' : 'jewelry_store';

    try {
      process.stdout.write(`[${searchCount}] ${city}, ${state} (${category})... `);
      const result = await discoverNewBusinesses(city, state, category);

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
  console.log(`\n${'='.repeat(50)}`);
  console.log(`  BATCH 2 COMPLETE`);
  console.log(`  Searches: ${searchCount}`);
  console.log(`  Added this batch: ${totalAdded}`);
  console.log(`  GRAND TOTAL in Simpleton's List: ${total[0].count}`);
  console.log(`${'='.repeat(50)}`);

  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
