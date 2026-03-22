import { discoverNewBusinesses } from '../server/simplicity-web-intelligence';
import { db } from '../server/db';
import { listedBusinesses } from '../shared/schema';

const US_CITIES: [string, string][] = [
  // Alabama
  ["Birmingham", "AL"], ["Montgomery", "AL"], ["Huntsville", "AL"], ["Mobile", "AL"], ["Tuscaloosa", "AL"],
  // Alaska
  ["Anchorage", "AK"], ["Fairbanks", "AK"], ["Juneau", "AK"],
  // Arizona
  ["Phoenix", "AZ"], ["Tucson", "AZ"], ["Mesa", "AZ"], ["Scottsdale", "AZ"], ["Tempe", "AZ"], ["Glendale", "AZ"],
  // Arkansas
  ["Little Rock", "AR"], ["Fort Smith", "AR"], ["Fayetteville", "AR"], ["Jonesboro", "AR"],
  // California
  ["Los Angeles", "CA"], ["San Francisco", "CA"], ["San Diego", "CA"], ["San Jose", "CA"], ["Sacramento", "CA"],
  ["Oakland", "CA"], ["Fresno", "CA"], ["Long Beach", "CA"], ["Bakersfield", "CA"], ["Anaheim", "CA"],
  ["Riverside", "CA"], ["Stockton", "CA"], ["Modesto", "CA"], ["Compton", "CA"], ["Inglewood", "CA"],
  // Colorado
  ["Denver", "CO"], ["Colorado Springs", "CO"], ["Aurora", "CO"], ["Fort Collins", "CO"], ["Pueblo", "CO"],
  // Connecticut
  ["Hartford", "CT"], ["Bridgeport", "CT"], ["New Haven", "CT"], ["Stamford", "CT"], ["Waterbury", "CT"],
  // Delaware
  ["Wilmington", "DE"], ["Dover", "DE"], ["Newark", "DE"],
  // Florida
  ["Miami", "FL"], ["Orlando", "FL"], ["Tampa", "FL"], ["Jacksonville", "FL"], ["Fort Lauderdale", "FL"],
  ["St Petersburg", "FL"], ["Hialeah", "FL"], ["Tallahassee", "FL"], ["Fort Myers", "FL"], ["Pensacola", "FL"],
  ["West Palm Beach", "FL"], ["Daytona Beach", "FL"],
  // Georgia
  ["Atlanta", "GA"], ["Savannah", "GA"], ["Augusta", "GA"], ["Columbus", "GA"], ["Macon", "GA"],
  ["Athens", "GA"], ["Marietta", "GA"],
  // Hawaii
  ["Honolulu", "HI"], ["Hilo", "HI"],
  // Idaho
  ["Boise", "ID"], ["Nampa", "ID"], ["Idaho Falls", "ID"],
  // Illinois
  ["Chicago", "IL"], ["Springfield", "IL"], ["Rockford", "IL"], ["Peoria", "IL"], ["Aurora", "IL"],
  ["Joliet", "IL"], ["Naperville", "IL"], ["Cicero", "IL"],
  // Indiana
  ["Indianapolis", "IN"], ["Fort Wayne", "IN"], ["Evansville", "IN"], ["South Bend", "IN"], ["Gary", "IN"],
  ["Hammond", "IN"], ["Muncie", "IN"],
  // Iowa
  ["Des Moines", "IA"], ["Cedar Rapids", "IA"], ["Davenport", "IA"], ["Sioux City", "IA"], ["Waterloo", "IA"],
  // Kansas
  ["Wichita", "KS"], ["Kansas City", "KS"], ["Topeka", "KS"], ["Overland Park", "KS"],
  // Kentucky
  ["Louisville", "KY"], ["Lexington", "KY"], ["Bowling Green", "KY"], ["Covington", "KY"], ["Owensboro", "KY"],
  // Louisiana
  ["New Orleans", "LA"], ["Baton Rouge", "LA"], ["Shreveport", "LA"], ["Lafayette", "LA"], ["Lake Charles", "LA"],
  ["Monroe", "LA"],
  // Maine
  ["Portland", "ME"], ["Bangor", "ME"], ["Lewiston", "ME"],
  // Maryland
  ["Baltimore", "MD"], ["Silver Spring", "MD"], ["Rockville", "MD"], ["Annapolis", "MD"], ["Frederick", "MD"],
  // Massachusetts
  ["Boston", "MA"], ["Worcester", "MA"], ["Springfield", "MA"], ["Lowell", "MA"], ["Brockton", "MA"],
  ["New Bedford", "MA"],
  // Minnesota
  ["Minneapolis", "MN"], ["St Paul", "MN"], ["Rochester", "MN"], ["Duluth", "MN"], ["Brooklyn Park", "MN"],
  // Mississippi
  ["Jackson", "MS"], ["Gulfport", "MS"], ["Hattiesburg", "MS"], ["Biloxi", "MS"], ["Meridian", "MS"],
  // Missouri
  ["Kansas City", "MO"], ["St Louis", "MO"], ["Springfield", "MO"], ["Columbia", "MO"], ["Independence", "MO"],
  // Montana
  ["Billings", "MT"], ["Missoula", "MT"], ["Great Falls", "MT"],
  // Nebraska
  ["Omaha", "NE"], ["Lincoln", "NE"], ["Grand Island", "NE"],
  // Nevada
  ["Las Vegas", "NV"], ["Reno", "NV"], ["Henderson", "NV"], ["North Las Vegas", "NV"],
  // New Hampshire
  ["Manchester", "NH"], ["Nashua", "NH"], ["Concord", "NH"],
  // New Jersey
  ["Newark", "NJ"], ["Jersey City", "NJ"], ["Paterson", "NJ"], ["Elizabeth", "NJ"], ["Trenton", "NJ"],
  ["Camden", "NJ"], ["Atlantic City", "NJ"],
  // New Mexico
  ["Albuquerque", "NM"], ["Las Cruces", "NM"], ["Santa Fe", "NM"],
  // New York
  ["New York", "NY"], ["Brooklyn", "NY"], ["Queens", "NY"], ["Bronx", "NY"], ["Buffalo", "NY"],
  ["Rochester", "NY"], ["Syracuse", "NY"], ["Albany", "NY"], ["Yonkers", "NY"], ["Staten Island", "NY"],
  // North Carolina
  ["Charlotte", "NC"], ["Raleigh", "NC"], ["Greensboro", "NC"], ["Durham", "NC"], ["Winston-Salem", "NC"],
  ["Fayetteville", "NC"], ["Wilmington", "NC"],
  // North Dakota
  ["Fargo", "ND"], ["Bismarck", "ND"], ["Grand Forks", "ND"],
  // Ohio
  ["Columbus", "OH"], ["Cleveland", "OH"], ["Cincinnati", "OH"], ["Toledo", "OH"], ["Akron", "OH"],
  ["Dayton", "OH"], ["Canton", "OH"], ["Youngstown", "OH"],
  // Oklahoma
  ["Oklahoma City", "OK"], ["Tulsa", "OK"], ["Norman", "OK"], ["Lawton", "OK"],
  // Oregon
  ["Portland", "OR"], ["Eugene", "OR"], ["Salem", "OR"], ["Medford", "OR"],
  // Pennsylvania
  ["Philadelphia", "PA"], ["Pittsburgh", "PA"], ["Allentown", "PA"], ["Erie", "PA"], ["Reading", "PA"],
  ["Scranton", "PA"], ["Harrisburg", "PA"],
  // Rhode Island
  ["Providence", "RI"], ["Warwick", "RI"], ["Cranston", "RI"],
  // South Carolina
  ["Charleston", "SC"], ["Columbia", "SC"], ["Greenville", "SC"], ["Myrtle Beach", "SC"], ["North Charleston", "SC"],
  // South Dakota
  ["Sioux Falls", "SD"], ["Rapid City", "SD"],
  // Tennessee
  ["Memphis", "TN"], ["Nashville", "TN"], ["Knoxville", "TN"], ["Chattanooga", "TN"], ["Clarksville", "TN"],
  ["Murfreesboro", "TN"],
  // Texas
  ["Houston", "TX"], ["Dallas", "TX"], ["San Antonio", "TX"], ["Austin", "TX"], ["Fort Worth", "TX"],
  ["El Paso", "TX"], ["Arlington", "TX"], ["Corpus Christi", "TX"], ["Lubbock", "TX"], ["Laredo", "TX"],
  ["Amarillo", "TX"], ["Brownsville", "TX"], ["McAllen", "TX"], ["Beaumont", "TX"], ["Waco", "TX"],
  // Utah
  ["Salt Lake City", "UT"], ["Provo", "UT"], ["Ogden", "UT"], ["West Valley City", "UT"],
  // Vermont
  ["Burlington", "VT"], ["Rutland", "VT"],
  // Virginia
  ["Virginia Beach", "VA"], ["Norfolk", "VA"], ["Richmond", "VA"], ["Newport News", "VA"], ["Alexandria", "VA"],
  ["Hampton", "VA"], ["Roanoke", "VA"],
  // Washington
  ["Seattle", "WA"], ["Tacoma", "WA"], ["Spokane", "WA"], ["Vancouver", "WA"], ["Everett", "WA"],
  // West Virginia
  ["Charleston", "WV"], ["Huntington", "WV"], ["Morgantown", "WV"],
  // Wisconsin
  ["Milwaukee", "WI"], ["Madison", "WI"], ["Green Bay", "WI"], ["Kenosha", "WI"], ["Racine", "WI"],
  // Wyoming
  ["Cheyenne", "WY"], ["Casper", "WY"],
  // DC
  ["Washington", "DC"],
];

const CATEGORIES: Array<'pawn_shop' | 'jewelry_store'> = ['pawn_shop', 'jewelry_store'];

async function run() {
  let totalFound = 0;
  let totalAdded = 0;
  let citiesSearched = 0;

  for (const category of CATEGORIES) {
    const label = category === 'pawn_shop' ? 'PAWN SHOPS' : 'JEWELRY STORES';
    console.log(`\n${'='.repeat(50)}`);
    console.log(`  DISCOVERING ${label} NATIONWIDE`);
    console.log(`${'='.repeat(50)}`);

    for (const [city, state] of US_CITIES) {
      citiesSearched++;
      try {
        process.stdout.write(`[${citiesSearched}] ${city}, ${state} (${category})... `);
        const result = await discoverNewBusinesses(city, state, category);

        if (result.data && result.data.length > 0) {
          let added = 0;
          totalFound += result.data.length;

          for (const biz of result.data.slice(0, 20)) {
            try {
              await db.insert(listedBusinesses).values({
                name: biz.name,
                address: biz.address || "Address pending verification",
                city: biz.city || city,
                state: biz.state || state,
                zip: biz.zip || "00000",
                phone: biz.phone,
                website: biz.website,
                hours: biz.hours,
                category,
                status: "approved",
                googleRating: biz.rating ? String(biz.rating) : null,
                googleReviewCount: biz.reviewCount,
                googlePlaceId: biz.placeId,
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

        await new Promise(r => setTimeout(r, 300));
      } catch (e: any) {
        console.log(`ERROR: ${e.message?.slice(0, 60)}`);
      }
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`  NATIONWIDE DISCOVERY COMPLETE`);
  console.log(`  Searches: ${citiesSearched}`);
  console.log(`  Found: ${totalFound}`);
  console.log(`  Added: ${totalAdded}`);
  console.log(`${'='.repeat(50)}`);

  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
