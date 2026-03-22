import type { Express } from "express";
import { db } from "../db";
import { listedBusinesses } from "@shared/schema";
import { isAuthenticated } from "../auth";

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
              status: "pending",
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
