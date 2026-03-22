import type { Express } from "express";
import { db } from "../db";
import { eq, and, sql } from "drizzle-orm";
import { listedBusinesses, businessReviews, businessComplaints, users } from "@shared/schema";
import { isAuthenticated } from "../auth";
import { notifyOwner } from "../notify-owner";
import { startGoogleReviewSync } from "../google-review-sync";

export function registerSimpletonListRoutes(app: Express) {
  app.get("/api/simpletons-list", async (req, res) => {
    try {
      const { city, state, zip, category, sort } = req.query;
      let conditions: any[] = [
        sql`${listedBusinesses.status} IN ('approved', 'blacklisted')`
      ];

      if (city && String(city).trim()) {
        conditions.push(sql`LOWER(${listedBusinesses.city}) = LOWER(${String(city).trim()})`);
      }
      if (state && String(state).trim()) {
        conditions.push(sql`UPPER(${listedBusinesses.state}) = UPPER(${String(state).trim()})`);
      }
      if (zip && String(zip).trim()) {
        const zipVal = String(zip).trim().replace(/[^0-9]/g, '');
        if (zipVal.length >= 3) {
          const zipPrefix = zipVal.substring(0, 3);
          conditions.push(sql`${listedBusinesses.zip} LIKE ${zipPrefix + '%'}`);
        } else if (zipVal.length > 0) {
          conditions.push(sql`${listedBusinesses.zip} LIKE ${zipVal + '%'}`);
        }
      }
      if (category && String(category) !== "all") {
        conditions.push(eq(listedBusinesses.category, String(category)));
      }

      const businesses = await db.select().from(listedBusinesses)
        .where(and(...conditions))
        .orderBy(listedBusinesses.name);

      const results = await Promise.all(businesses.map(async (b) => {
        const reviews = await db.select({
          avg: sql<number>`COALESCE(AVG(rating), 0)`,
          count: sql<number>`COUNT(*)`,
        }).from(businessReviews).where(eq(businessReviews.businessId, b.id));

        const googleRating = b.googleRating ? parseFloat(b.googleRating) : 0;
        const googleCount = b.googleReviewCount || 0;
        const userAvg = Number(reviews[0]?.avg || 0);
        const userCount = Number(reviews[0]?.count || 0);

        const totalReviews = googleCount + userCount;
        const combinedRating = totalReviews > 0
          ? ((googleRating * googleCount) + (userAvg * userCount)) / totalReviews
          : 0;

        return {
          ...b,
          avgRating: Math.round(combinedRating * 10) / 10,
          reviewCount: totalReviews,
          userRating: userAvg,
          userReviewCount: userCount,
        };
      }));

      const sortDir = String(sort || "highest");
      const zipVal = zip ? String(zip).trim() : "";
      results.sort((a, b) => {
        if (zipVal) {
          const aExact = a.zip === zipVal ? 1 : 0;
          const bExact = b.zip === zipVal ? 1 : 0;
          if (bExact !== aExact) return bExact - aExact;
        }
        const aVerified = a.simpletonVerified ? 1 : 0;
        const bVerified = b.simpletonVerified ? 1 : 0;
        if (bVerified !== aVerified) return bVerified - aVerified;
        if (sortDir === "lowest") return a.avgRating - b.avgRating;
        return b.avgRating - a.avgRating;
      });

      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/simpletons-list/business/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid business ID" });
      const [business] = await db.select().from(listedBusinesses)
        .where(and(eq(listedBusinesses.id, id), sql`${listedBusinesses.status} IN ('approved', 'blacklisted')`));
      if (!business) return res.status(404).json({ error: "Business not found" });
      res.json(business);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/simpletons-list/reviews/:businessId", async (req, res) => {
    try {
      const bId = parseInt(req.params.businessId);
      if (isNaN(bId)) return res.status(400).json({ error: "Invalid business ID" });
      const reviews = await db.select({
        id: businessReviews.id,
        businessId: businessReviews.businessId,
        userId: businessReviews.userId,
        rating: businessReviews.rating,
        reviewText: businessReviews.reviewText,
        createdAt: businessReviews.createdAt,
        username: users.username,
      }).from(businessReviews)
        .leftJoin(users, eq(businessReviews.userId, users.id))
        .where(eq(businessReviews.businessId, bId))
        .orderBy(sql`${businessReviews.createdAt} DESC`);

      res.json(reviews.map(r => ({ ...r, username: r.username || "Anonymous" })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/simpletons-list/reviews", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { businessId, rating, reviewText } = req.body;

      if (!businessId || !rating || !reviewText) {
        return res.status(400).json({ error: "Business ID, rating, and review text are required" });
      }
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }

      const [biz] = await db.select().from(listedBusinesses).where(eq(listedBusinesses.id, businessId));
      if (!biz) return res.status(404).json({ error: "Business not found" });

      const [existing] = await db.select().from(businessReviews)
        .where(and(eq(businessReviews.businessId, businessId), eq(businessReviews.userId, user.id)));
      if (existing) {
        return res.status(400).json({ error: "You have already reviewed this business" });
      }

      const [review] = await db.insert(businessReviews).values({
        businessId,
        userId: user.id,
        rating,
        reviewText,
      }).returning();

      res.json(review);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/simpletons-list/complaints/:businessId", isAuthenticated, async (req, res) => {
    try {
      const bId = parseInt(req.params.businessId);
      if (isNaN(bId)) return res.status(400).json({ error: "Invalid business ID" });
      const complaints = await db.select().from(businessComplaints)
        .where(eq(businessComplaints.businessId, bId))
        .orderBy(sql`${businessComplaints.createdAt} DESC`);
      res.json(complaints);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/simpletons-list/complaints", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { businessId, complaintText, severity } = req.body;

      if (!businessId || !complaintText) {
        return res.status(400).json({ error: "Business ID and complaint text are required" });
      }

      const [biz] = await db.select().from(listedBusinesses).where(eq(listedBusinesses.id, businessId));
      if (!biz) return res.status(404).json({ error: "Business not found" });

      const [complaint] = await db.insert(businessComplaints).values({
        businessId,
        userId: user.id,
        complaintText,
        severity: severity || "low",
      }).returning();

      notifyOwner({
        subject: `New Complaint Filed — Simpleton's List`,
        body: `<div style="font-family:Arial,sans-serif;padding:20px;background:#0a1d3f;color:#fff;border-radius:12px;">
          <h2 style="color:#ef4444;">New Business Complaint</h2>
          <p>Business ID: ${businessId}</p>
          <p>Severity: ${severity || "low"}</p>
          <p>Complaint: ${complaintText.substring(0, 200)}</p>
          <p>Filed by user #${user.id}</p>
        </div>`,
      }).catch(() => {});

      res.json(complaint);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/businesses", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.id !== 1 && user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const businesses = await db.select().from(listedBusinesses)
        .orderBy(sql`${listedBusinesses.createdAt} DESC`);

      const results = await Promise.all(businesses.map(async (b) => {
        const [reviewStats] = await db.select({
          avg: sql<number>`COALESCE(AVG(rating), 0)`,
          count: sql<number>`COUNT(*)`,
        }).from(businessReviews).where(eq(businessReviews.businessId, b.id));

        const [complaintStats] = await db.select({
          total: sql<number>`COUNT(*)`,
          pending: sql<number>`COUNT(*) FILTER (WHERE investigation_status = 'pending')`,
        }).from(businessComplaints).where(eq(businessComplaints.businessId, b.id));

        return {
          ...b,
          avgRating: Number(reviewStats?.avg || 0),
          reviewCount: Number(reviewStats?.count || 0),
          complaintCount: Number(complaintStats?.total || 0),
          pendingComplaints: Number(complaintStats?.pending || 0),
        };
      }));

      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/simpletons-list/search-online", isAuthenticated, async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || String(query).trim().length < 3) {
        return res.status(400).json({ error: "Please enter a search query (at least 3 characters)" });
      }

      const searchQuery = String(query).trim();
      const OpenAI = (await import("openai")).default;
      const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: "https://api.deepseek.com",
      });

      const completion = await client.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `You are a business data lookup assistant. The user is searching for real pawn shops, gold buyers, jewelers, or coin dealers. Return ONLY real, verified businesses that actually exist. Do NOT invent or fabricate businesses. If you are not confident a business exists, do not include it. Return results as a JSON array of objects with these fields: name, address, city, state (2-letter), zip, phone, website (or null), hours (or null), googleRating (number or null). Return at most 8 results. Return ONLY the JSON array, no other text.`
          },
          {
            role: "user",
            content: `Search for real pawn shops or gold/jewelry/coin dealers matching: "${searchQuery}". Return only businesses you are confident actually exist with accurate addresses and phone numbers.`
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      });

      const content = completion.choices[0]?.message?.content || "[]";
      let results: any[] = [];
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          results = JSON.parse(jsonMatch[0]);
        }
      } catch {
        results = [];
      }

      const cleaned = results
        .filter((r: any) => r.name && r.address && r.city && r.state)
        .map((r: any) => ({
          name: String(r.name).trim(),
          address: String(r.address).trim(),
          city: String(r.city).trim(),
          state: String(r.state).trim().toUpperCase().substring(0, 2),
          zip: String(r.zip || "").trim().substring(0, 5),
          phone: r.phone ? String(r.phone).trim() : null,
          website: r.website ? String(r.website).trim() : null,
          hours: r.hours ? String(r.hours).trim() : null,
          googleRating: r.googleRating || null,
        }));

      res.json({ results: cleaned });
    } catch (error: any) {
      console.error("Online search error:", error.message);
      res.status(500).json({ error: "Search failed. Please try again." });
    }
  });

  app.post("/api/simpletons-list/suggest", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { name, address, city, state, zip, phone, website, hours, category, googleRating } = req.body;
      if (!name || !address || !city || !state || !zip) {
        return res.status(400).json({ error: "Name, address, city, state, and zip are required" });
      }

      const [business] = await db.insert(listedBusinesses).values({
        name: name.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim().toUpperCase().substring(0, 2),
        zip: zip.trim().substring(0, 5),
        phone: phone?.trim() || null,
        website: website?.trim() || null,
        hours: hours?.trim() || null,
        googleRating: googleRating ? String(googleRating) : null,
        category: category || "pawn_shop",
        status: "pending",
        addedBy: user.id,
      }).returning();

      res.json(business);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/businesses", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.id !== 1 && user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { name, address, city, state, zip, phone, website, category, status } = req.body;
      if (!name || !address || !city || !state || !zip || !category) {
        return res.status(400).json({ error: "Name, address, city, state, zip, and category are required" });
      }

      const [business] = await db.insert(listedBusinesses).values({
        name,
        address,
        city: city.trim(),
        state: state.trim().toUpperCase(),
        zip: zip.trim(),
        phone: phone || null,
        website: website || null,
        category,
        status: status || "pending",
        addedBy: user.id,
        approvalDate: status === "approved" ? new Date() : null,
      }).returning();

      res.json(business);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/businesses/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.id !== 1 && user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const { status, ...updates } = req.body;
      const setValues: any = { ...updates };

      if (status) {
        setValues.status = status;
        if (status === "approved") {
          setValues.approvalDate = new Date();
        }
      }

      const [updated] = await db.update(listedBusinesses)
        .set(setValues)
        .where(eq(listedBusinesses.id, id))
        .returning();

      if (!updated) return res.status(404).json({ error: "Business not found" });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/businesses/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.id !== 1 && user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      await db.delete(businessReviews).where(eq(businessReviews.businessId, id));
      await db.delete(businessComplaints).where(eq(businessComplaints.businessId, id));
      await db.delete(listedBusinesses).where(eq(listedBusinesses.id, id));

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/complaints", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.id !== 1 && user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const complaints = await db.select({
        id: businessComplaints.id,
        businessId: businessComplaints.businessId,
        userId: businessComplaints.userId,
        complaintText: businessComplaints.complaintText,
        severity: businessComplaints.severity,
        investigationStatus: businessComplaints.investigationStatus,
        resolutionNotes: businessComplaints.resolutionNotes,
        createdAt: businessComplaints.createdAt,
        resolvedAt: businessComplaints.resolvedAt,
        businessName: listedBusinesses.name,
      }).from(businessComplaints)
        .leftJoin(listedBusinesses, eq(businessComplaints.businessId, listedBusinesses.id))
        .orderBy(sql`${businessComplaints.createdAt} DESC`);

      res.json(complaints);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/complaints/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.id !== 1 && user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const { investigationStatus, resolutionNotes } = req.body;
      const setValues: any = {};

      if (investigationStatus) setValues.investigationStatus = investigationStatus;
      if (resolutionNotes !== undefined) setValues.resolutionNotes = resolutionNotes;
      if (investigationStatus === "resolved" || investigationStatus === "confirmed") {
        setValues.resolvedAt = new Date();
      }

      const [updated] = await db.update(businessComplaints)
        .set(setValues)
        .where(eq(businessComplaints.id, id))
        .returning();

      if (!updated) return res.status(404).json({ error: "Complaint not found" });

      if (investigationStatus === "confirmed") {
        await db.update(listedBusinesses)
          .set({ status: "flagged" })
          .where(eq(listedBusinesses.id, updated.businessId));
      }

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  startGoogleReviewSync();

  app.post("/api/admin/sync-google-reviews", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.id !== 1 && user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const staleThreshold = new Date(Date.now() - 6 * 60 * 60 * 1000);
      const [syncStatus] = await db.select({
        total: sql<number>`COUNT(*)`,
        synced: sql<number>`COUNT(CASE WHEN ${listedBusinesses.lastGoogleSync} IS NOT NULL THEN 1 END)`,
        stale: sql<number>`COUNT(CASE WHEN ${listedBusinesses.lastGoogleSync} IS NULL OR ${listedBusinesses.lastGoogleSync} < ${staleThreshold} THEN 1 END)`,
      }).from(listedBusinesses);

      const hasApiKey = !!(process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_API_KEY);

      res.json({
        apiKeyConfigured: hasApiKey,
        totalBusinesses: Number(syncStatus.total),
        syncedBusinesses: Number(syncStatus.synced),
        staleBusinesses: Number(syncStatus.stale),
        message: hasApiKey
          ? "Google review sync is active. Reviews update automatically every 6 hours."
          : "Add GOOGLE_PLACES_API_KEY to enable automatic Google review syncing.",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
