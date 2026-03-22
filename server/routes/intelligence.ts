import type { Express } from "express";
import { db } from "../db";
import { listedBusinesses } from "@shared/schema";
import { isAuthenticated } from "../auth";
import { count } from "drizzle-orm";

// Nationwide discovery status tracking
let discoveryRunning = false;
let discoveryProgress = { citiesSearched: 0, totalCities: 0, totalFound: 0, totalAdded: 0, status: 'idle' as string };

const US_CITIES: [string, string][] = [
  ["Birmingham","AL"],["Montgomery","AL"],["Huntsville","AL"],["Mobile","AL"],["Tuscaloosa","AL"],
  ["Anchorage","AK"],["Fairbanks","AK"],["Juneau","AK"],
  ["Phoenix","AZ"],["Tucson","AZ"],["Mesa","AZ"],["Scottsdale","AZ"],["Tempe","AZ"],["Glendale","AZ"],
  ["Little Rock","AR"],["Fort Smith","AR"],["Fayetteville","AR"],["Jonesboro","AR"],
  ["Los Angeles","CA"],["San Francisco","CA"],["San Diego","CA"],["San Jose","CA"],["Sacramento","CA"],
  ["Oakland","CA"],["Fresno","CA"],["Long Beach","CA"],["Bakersfield","CA"],["Anaheim","CA"],
  ["Riverside","CA"],["Stockton","CA"],["Modesto","CA"],["Compton","CA"],["Inglewood","CA"],
  ["Denver","CO"],["Colorado Springs","CO"],["Aurora","CO"],["Fort Collins","CO"],["Pueblo","CO"],
  ["Hartford","CT"],["Bridgeport","CT"],["New Haven","CT"],["Stamford","CT"],["Waterbury","CT"],
  ["Wilmington","DE"],["Dover","DE"],["Newark","DE"],
  ["Miami","FL"],["Orlando","FL"],["Tampa","FL"],["Jacksonville","FL"],["Fort Lauderdale","FL"],
  ["St Petersburg","FL"],["Hialeah","FL"],["Tallahassee","FL"],["Fort Myers","FL"],["Pensacola","FL"],
  ["West Palm Beach","FL"],["Daytona Beach","FL"],
  ["Atlanta","GA"],["Savannah","GA"],["Augusta","GA"],["Columbus","GA"],["Macon","GA"],["Athens","GA"],["Marietta","GA"],
  ["Honolulu","HI"],["Hilo","HI"],
  ["Boise","ID"],["Nampa","ID"],["Idaho Falls","ID"],
  ["Chicago","IL"],["Springfield","IL"],["Rockford","IL"],["Peoria","IL"],["Aurora","IL"],["Joliet","IL"],["Naperville","IL"],["Cicero","IL"],
  ["Indianapolis","IN"],["Fort Wayne","IN"],["Evansville","IN"],["South Bend","IN"],["Gary","IN"],["Hammond","IN"],["Muncie","IN"],
  ["Des Moines","IA"],["Cedar Rapids","IA"],["Davenport","IA"],["Sioux City","IA"],["Waterloo","IA"],
  ["Wichita","KS"],["Kansas City","KS"],["Topeka","KS"],["Overland Park","KS"],
  ["Louisville","KY"],["Lexington","KY"],["Bowling Green","KY"],["Covington","KY"],["Owensboro","KY"],
  ["New Orleans","LA"],["Baton Rouge","LA"],["Shreveport","LA"],["Lafayette","LA"],["Lake Charles","LA"],["Monroe","LA"],
  ["Portland","ME"],["Bangor","ME"],["Lewiston","ME"],
  ["Baltimore","MD"],["Silver Spring","MD"],["Rockville","MD"],["Annapolis","MD"],["Frederick","MD"],
  ["Boston","MA"],["Worcester","MA"],["Springfield","MA"],["Lowell","MA"],["Brockton","MA"],["New Bedford","MA"],
  ["Detroit","MI"],["Grand Rapids","MI"],["Warren","MI"],["Sterling Heights","MI"],["Lansing","MI"],
  ["Ann Arbor","MI"],["Flint","MI"],["Dearborn","MI"],["Livonia","MI"],["Troy","MI"],
  ["Roseville","MI"],["Pontiac","MI"],["Saginaw","MI"],["Kalamazoo","MI"],["Southfield","MI"],
  ["Minneapolis","MN"],["St Paul","MN"],["Rochester","MN"],["Duluth","MN"],["Brooklyn Park","MN"],
  ["Jackson","MS"],["Gulfport","MS"],["Hattiesburg","MS"],["Biloxi","MS"],["Meridian","MS"],
  ["Kansas City","MO"],["St Louis","MO"],["Springfield","MO"],["Columbia","MO"],["Independence","MO"],
  ["Billings","MT"],["Missoula","MT"],["Great Falls","MT"],
  ["Omaha","NE"],["Lincoln","NE"],["Grand Island","NE"],
  ["Las Vegas","NV"],["Reno","NV"],["Henderson","NV"],["North Las Vegas","NV"],
  ["Manchester","NH"],["Nashua","NH"],["Concord","NH"],
  ["Newark","NJ"],["Jersey City","NJ"],["Paterson","NJ"],["Elizabeth","NJ"],["Trenton","NJ"],["Camden","NJ"],["Atlantic City","NJ"],
  ["Albuquerque","NM"],["Las Cruces","NM"],["Santa Fe","NM"],
  ["New York","NY"],["Brooklyn","NY"],["Queens","NY"],["Bronx","NY"],["Buffalo","NY"],
  ["Rochester","NY"],["Syracuse","NY"],["Albany","NY"],["Yonkers","NY"],["Staten Island","NY"],
  ["Charlotte","NC"],["Raleigh","NC"],["Greensboro","NC"],["Durham","NC"],["Winston-Salem","NC"],["Fayetteville","NC"],["Wilmington","NC"],
  ["Fargo","ND"],["Bismarck","ND"],["Grand Forks","ND"],
  ["Columbus","OH"],["Cleveland","OH"],["Cincinnati","OH"],["Toledo","OH"],["Akron","OH"],["Dayton","OH"],["Canton","OH"],["Youngstown","OH"],
  ["Oklahoma City","OK"],["Tulsa","OK"],["Norman","OK"],["Lawton","OK"],
  ["Portland","OR"],["Eugene","OR"],["Salem","OR"],["Medford","OR"],
  ["Philadelphia","PA"],["Pittsburgh","PA"],["Allentown","PA"],["Erie","PA"],["Reading","PA"],["Scranton","PA"],["Harrisburg","PA"],
  ["Providence","RI"],["Warwick","RI"],["Cranston","RI"],
  ["Charleston","SC"],["Columbia","SC"],["Greenville","SC"],["Myrtle Beach","SC"],["North Charleston","SC"],
  ["Sioux Falls","SD"],["Rapid City","SD"],
  ["Memphis","TN"],["Nashville","TN"],["Knoxville","TN"],["Chattanooga","TN"],["Clarksville","TN"],["Murfreesboro","TN"],
  ["Houston","TX"],["Dallas","TX"],["San Antonio","TX"],["Austin","TX"],["Fort Worth","TX"],
  ["El Paso","TX"],["Arlington","TX"],["Corpus Christi","TX"],["Lubbock","TX"],["Laredo","TX"],
  ["Amarillo","TX"],["Brownsville","TX"],["McAllen","TX"],["Beaumont","TX"],["Waco","TX"],
  ["Salt Lake City","UT"],["Provo","UT"],["Ogden","UT"],["West Valley City","UT"],
  ["Burlington","VT"],["Rutland","VT"],
  ["Virginia Beach","VA"],["Norfolk","VA"],["Richmond","VA"],["Newport News","VA"],["Alexandria","VA"],["Hampton","VA"],["Roanoke","VA"],
  ["Seattle","WA"],["Tacoma","WA"],["Spokane","WA"],["Vancouver","WA"],["Everett","WA"],
  ["Charleston","WV"],["Huntington","WV"],["Morgantown","WV"],
  ["Milwaukee","WI"],["Madison","WI"],["Green Bay","WI"],["Kenosha","WI"],["Racine","WI"],
  ["Cheyenne","WY"],["Casper","WY"],
  ["Washington","DC"],
];

export function registerIntelligenceRoutes(app: Express) {
  app.post("/api/intelligence/sync-businesses", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ error: "Auth required" });
      const { limit = 20 } = req.body;
      const { syncBusinessListings } = await import("../simplicity-web-intelligence");
      const result = await syncBusinessListings(limit);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/intelligence/discover-businesses", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ error: "Auth required" });
      const { city, state, category = "pawn_shop", autoAdd = false } = req.body;
      if (!city || !state) return res.status(400).json({ error: "city and state required" });

      const { discoverNewBusinesses } = await import("../simplicity-web-intelligence");
      const result = await discoverNewBusinesses(city, state, category);

      if (autoAdd && result.data && result.data.length > 0) {
        let added = 0;
        for (const biz of result.data.slice(0, 10)) {
          try {
            await db.insert(listedBusinesses).values({
              name: biz.name,
              address: biz.address,
              city: biz.city,
              state: biz.state,
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
          } catch (e) {}
        }
        return res.json({ ...result, autoAdded: added, data: result.data });
      }

      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Nationwide discovery - populates all US pawn shops via Google Places API
  app.post("/api/intelligence/discover-nationwide", async (req, res) => {
    try {
      const adminKey = req.headers["x-admin-key"] || req.body.adminKey;
      if (adminKey !== process.env.SESSION_SECRET) {
        const user = (req as any).user;
        if (!user) return res.status(401).json({ error: "Auth or admin key required" });
      }

      if (discoveryRunning) {
        return res.json({ status: "already_running", progress: discoveryProgress });
      }

      discoveryRunning = true;
      discoveryProgress = { citiesSearched: 0, totalCities: US_CITIES.length, totalFound: 0, totalAdded: 0, status: "running" };
      res.json({ status: "started", totalCities: US_CITIES.length, message: "Nationwide discovery started. Check /api/intelligence/discover-status for progress." });

      // Run in background
      (async () => {
        const { discoverNewBusinesses } = await import("../simplicity-web-intelligence");
        for (const [city, state] of US_CITIES) {
          discoveryProgress.citiesSearched++;
          try {
            const result = await discoverNewBusinesses(city, state, "pawn_shop");
            if (result.data && result.data.length > 0) {
              discoveryProgress.totalFound += result.data.length;
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
                    category: "pawn_shop",
                    status: "approved",
                    googleRating: biz.rating ? String(biz.rating) : null,
                    googleReviewCount: biz.reviewCount,
                    googlePlaceId: biz.placeId,
                    lastGoogleSync: new Date(),
                  }).onConflictDoNothing();
                  discoveryProgress.totalAdded++;
                } catch (e: any) {}
              }
            }
            // Rate limit: 500ms between cities
            await new Promise(r => setTimeout(r, 500));
          } catch (e: any) {
            console.error(`Discovery error for ${city}, ${state}: ${e.message}`);
          }
          discoveryProgress.status = `Processing ${city}, ${state} (${discoveryProgress.citiesSearched}/${US_CITIES.length})`;
        }
        discoveryProgress.status = "complete";
        discoveryRunning = false;
        console.log(`Nationwide discovery complete: ${discoveryProgress.totalAdded} businesses added from ${discoveryProgress.totalFound} found`);
      })().catch(e => {
        discoveryProgress.status = "error: " + e.message;
        discoveryRunning = false;
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Check discovery progress
  app.get("/api/intelligence/discover-status", async (req, res) => {
    try {
      const [bizCount] = await db.select({ total: count() }).from(listedBusinesses);
      res.json({ ...discoveryProgress, running: discoveryRunning, totalBusinessesInDB: bizCount.total });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/intelligence/coin/:name", async (req, res) => {
    try {
      const { fetchCoinData } = await import("../simplicity-web-intelligence");
      const result = await fetchCoinData(decodeURIComponent(req.params.name));
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/intelligence/market/:metal", async (req, res) => {
    try {
      const { fetchMarketContext } = await import("../simplicity-web-intelligence");
      const { getKitcoPricing } = await import("../kitco-pricing");
      const pricing = await getKitcoPricing();
      const metal = req.params.metal.toLowerCase();
      const spotPrice = pricing?.prices?.[metal] || 0;
      const result = await fetchMarketContext(metal, spotPrice);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/intelligence/lookup-business", async (req, res) => {
    try {
      const { name, address, city, state } = req.body;
      if (!name || !city || !state) return res.status(400).json({ error: "name, city, state required" });
      const { fetchBusinessFromGoogle } = await import("../simplicity-web-intelligence");
      const result = await fetchBusinessFromGoogle(name, address || "", city, state);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/body/report", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || user.email !== 'intel@simpletonapp.com') {
        return res.status(403).json({ error: 'Owner access only' });
      }
      const { simplicityBodySystem } = await import('../simplicity-body-system');
      const report = simplicityBodySystem.getLastReport();
      if (!report) {
        return res.json({ status: 'no_audit_yet', message: 'Audit runs 30s after server boot, then hourly.' });
      }
      res.json(report);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/body/history", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || user.email !== 'intel@simpletonapp.com') {
        return res.status(403).json({ error: 'Owner access only' });
      }
      const { simplicityBodySystem } = await import('../simplicity-body-system');
      res.json({ history: simplicityBodySystem.getAuditHistory() });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/body/audit", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || user.email !== 'intel@simpletonapp.com') {
        return res.status(403).json({ error: 'Owner access only' });
      }
      const { simplicityBodySystem } = await import('../simplicity-body-system');
      res.json({ status: 'started', message: 'Manual audit triggered — check /api/body/report in ~30 seconds' });
      simplicityBodySystem.runFullAudit().catch(console.error);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
}
