import { discoverNewBusinesses } from '../server/simplicity-web-intelligence';
import { db } from '../server/db';
import { listedBusinesses } from '../shared/schema';

const MICHIGAN_CITIES = [
  "Detroit", "Grand Rapids", "Flint", "Lansing", "Saginaw", "Kalamazoo",
  "Ann Arbor", "Pontiac", "Dearborn", "Warren", "Sterling Heights", "Southfield",
  "Taylor", "Muskegon", "Battle Creek", "Bay City", "Jackson", "Port Huron",
  "Traverse City", "Midland", "Holland", "Benton Harbor", "Mount Pleasant",
  "Marquette", "Alpena", "Ypsilanti", "Livonia", "Westland", "Canton",
  "Roseville", "Eastpointe", "Lincoln Park", "Hamtramck", "Ferndale",
  "Royal Oak", "Madison Heights", "Redford", "Inkster", "Ecorse"
];

async function run() {
  let totalFound = 0;
  let totalAdded = 0;

  for (const city of MICHIGAN_CITIES) {
    try {
      console.log(`\n--- ${city}, MI ---`);
      const result = await discoverNewBusinesses(city, "MI", "pawn_shop");

      if (result.data && result.data.length > 0) {
        console.log(`  Found ${result.data.length} new businesses (source: ${result.source})`);
        totalFound += result.data.length;

        for (const biz of result.data.slice(0, 10)) {
          try {
            await db.insert(listedBusinesses).values({
              name: biz.name,
              address: biz.address || "Address pending verification",
              city: biz.city || city,
              state: biz.state || "MI",
              zip: biz.zip || "00000",
              phone: biz.phone,
              website: biz.website,
              hours: biz.hours,
              category: "pawn_shop",
              status: "pending",
              googleRating: biz.rating ? String(biz.rating) : null,
              googleReviewCount: biz.reviewCount,
              googlePlaceId: biz.placeId,
              lastGoogleSync: new Date(),
            }).onConflictDoNothing();
            totalAdded++;
            console.log(`  + ${biz.name} (rating: ${biz.rating || 'N/A'})`);
          } catch (e: any) {
            console.log(`  SKIP ${biz.name}: ${e.message?.slice(0, 60)}`);
          }
        }
      } else {
        console.log(`  No new businesses found (${result.error || 'all already listed'})`);
      }

      await new Promise(r => setTimeout(r, 500));
    } catch (e: any) {
      console.log(`  ERROR: ${e.message?.slice(0, 80)}`);
    }
  }

  console.log(`\n========================================`);
  console.log(`MICHIGAN PAWN SHOP DISCOVERY COMPLETE`);
  console.log(`Cities searched: ${MICHIGAN_CITIES.length}`);
  console.log(`New businesses found: ${totalFound}`);
  console.log(`Added to Simpleton's List: ${totalAdded}`);
  console.log(`========================================`);

  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
