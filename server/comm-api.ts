import { Router } from "express";
import { nanoid } from "nanoid";
import crypto from "crypto";
import { isAuthenticated } from "./auth";
import { db } from "./db";
import { revolutionaryCommApiKeys, revolutionaryCommUsage, type InsertRevolutionaryCommApiKey } from "@shared/schema";
import { eq, and, desc, count, sum, gte } from "drizzle-orm";

const router = Router();

// Generate API Key for Revolutionary Communications
router.post("/generate", isAuthenticated, async (req: any, res) => {
  try {
    const { name, tier = "basic", permissions = {} } = req.body;
    const userId = req.user?.id;

    if (!name) {
      return res.status(400).json({ error: "API key name is required" });
    }

    // Generate unique key ID and secret
    const keyId = `rck_${nanoid(32)}`;
    const keySecret = crypto.randomBytes(32).toString('hex');
    const hashedSecret = crypto.createHash('sha256').update(keySecret).digest('hex');

    // Set tier-based limits
    const tierLimits = {
      basic: { perDay: 100, perMonth: 1000 },
      professional: { perDay: 500, perMonth: 10000 },
      enterprise: { perDay: 2000, perMonth: 50000 }
    };

    const limits = tierLimits[tier as keyof typeof tierLimits] || tierLimits.basic;

    const newApiKey: InsertRevolutionaryCommApiKey = {
      keyId,
      keySecret: hashedSecret,
      userId,
      name,
      tier,
      allowSMS: permissions.allowSMS ?? true,
      allowEmail: permissions.allowEmail ?? true,
      allowPasscode: permissions.allowPasscode ?? true,
      allowTesting: permissions.allowTesting ?? true,
      communicationsPerDay: limits.perDay,
      communicationsPerMonth: limits.perMonth,
      ipWhitelist: permissions.ipWhitelist || null,
      webhookUrl: permissions.webhookUrl || null,
    };

    const [createdKey] = await db.insert(revolutionaryCommApiKeys).values(newApiKey).returning();

    res.json({
      success: true,
      apiKey: {
        ...createdKey,
        keySecret: undefined, // Don't return hashed secret
        publicKey: keyId,
        secretKey: keySecret // Return plaintext secret only once
      },
      message: "Revolutionary Communications API key generated successfully"
    });
  } catch (error: any) {
    console.error("Revolutionary Communications API key generation error:", error);
    res.status(500).json({ error: "Failed to generate API key" });
  }
});

// List user's Revolutionary Communications API keys
router.get("/list", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id;

    const apiKeys = await db
      .select({
        id: revolutionaryCommApiKeys.id,
        keyId: revolutionaryCommApiKeys.keyId,
        name: revolutionaryCommApiKeys.name,
        tier: revolutionaryCommApiKeys.tier,
        allowSMS: revolutionaryCommApiKeys.allowSMS,
        allowEmail: revolutionaryCommApiKeys.allowEmail,
        allowPasscode: revolutionaryCommApiKeys.allowPasscode,
        allowTesting: revolutionaryCommApiKeys.allowTesting,
        communicationsPerDay: revolutionaryCommApiKeys.communicationsPerDay,
        communicationsPerMonth: revolutionaryCommApiKeys.communicationsPerMonth,
        isActive: revolutionaryCommApiKeys.isActive,
        lastUsed: revolutionaryCommApiKeys.lastUsed,
        expiresAt: revolutionaryCommApiKeys.expiresAt,
        createdAt: revolutionaryCommApiKeys.createdAt,
      })
      .from(revolutionaryCommApiKeys)
      .where(eq(revolutionaryCommApiKeys.userId, userId))
      .orderBy(desc(revolutionaryCommApiKeys.createdAt));

    res.json({
      success: true,
      apiKeys
    });
  } catch (error: any) {
    console.error("Revolutionary Communications API keys list error:", error);
    res.status(500).json({ error: "Failed to fetch API keys" });
  }
});

// Get API key usage statistics
router.get("/:keyId/usage", isAuthenticated, async (req: any, res) => {
  try {
    const { keyId } = req.params;
    const userId = req.user?.id;

    // Verify key belongs to user
    const apiKey = await db
      .select()
      .from(revolutionaryCommApiKeys)
      .where(and(
        eq(revolutionaryCommApiKeys.keyId, keyId),
        eq(revolutionaryCommApiKeys.userId, userId)
      ))
      .limit(1);

    if (!apiKey.length) {
      return res.status(404).json({ error: "API key not found" });
    }

    // Get usage statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    // Today's usage
    const [todayUsage] = await db
      .select({ count: count() })
      .from(revolutionaryCommUsage)
      .where(and(
        eq(revolutionaryCommUsage.apiKeyId, apiKey[0].id),
        gte(revolutionaryCommUsage.createdAt, today)
      ));

    // This month's usage
    const [monthUsage] = await db
      .select({ count: count() })
      .from(revolutionaryCommUsage)
      .where(and(
        eq(revolutionaryCommUsage.apiKeyId, apiKey[0].id),
        gte(revolutionaryCommUsage.createdAt, thisMonth)
      ));

    // Recent usage logs
    const recentUsage = await db
      .select()
      .from(revolutionaryCommUsage)
      .where(eq(revolutionaryCommUsage.apiKeyId, apiKey[0].id))
      .orderBy(desc(revolutionaryCommUsage.createdAt))
      .limit(50);

    res.json({
      success: true,
      usage: {
        today: todayUsage?.count || 0,
        month: monthUsage?.count || 0,
        dailyLimit: apiKey[0].communicationsPerDay,
        monthlyLimit: apiKey[0].communicationsPerMonth,
        recentActivity: recentUsage
      }
    });
  } catch (error: any) {
    console.error("Revolutionary Communications API key usage error:", error);
    res.status(500).json({ error: "Failed to fetch usage statistics" });
  }
});

// Update API key settings
router.patch("/:keyId", isAuthenticated, async (req: any, res) => {
  try {
    const { keyId } = req.params;
    const userId = req.user?.id;
    const { name, isActive, permissions, webhookUrl, ipWhitelist } = req.body;

    // Verify key belongs to user
    const apiKey = await db
      .select()
      .from(revolutionaryCommApiKeys)
      .where(and(
        eq(revolutionaryCommApiKeys.keyId, keyId),
        eq(revolutionaryCommApiKeys.userId, userId)
      ))
      .limit(1);

    if (!apiKey.length) {
      return res.status(404).json({ error: "API key not found" });
    }

    // Update API key
    const updateData: any = { updatedAt: new Date() };
    if (name) updateData.name = name;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (permissions) {
      if (typeof permissions.allowSMS === 'boolean') updateData.allowSMS = permissions.allowSMS;
      if (typeof permissions.allowEmail === 'boolean') updateData.allowEmail = permissions.allowEmail;
      if (typeof permissions.allowPasscode === 'boolean') updateData.allowPasscode = permissions.allowPasscode;
      if (typeof permissions.allowTesting === 'boolean') updateData.allowTesting = permissions.allowTesting;
    }
    if (webhookUrl !== undefined) updateData.webhookUrl = webhookUrl || null;
    if (ipWhitelist !== undefined) updateData.ipWhitelist = ipWhitelist;

    await db
      .update(revolutionaryCommApiKeys)
      .set(updateData)
      .where(eq(revolutionaryCommApiKeys.id, apiKey[0].id));

    res.json({
      success: true,
      message: "Revolutionary Communications API key updated successfully"
    });
  } catch (error: any) {
    console.error("Revolutionary Communications API key update error:", error);
    res.status(500).json({ error: "Failed to update API key" });
  }
});

// Delete API key
router.delete("/:keyId", isAuthenticated, async (req: any, res) => {
  try {
    const { keyId } = req.params;
    const userId = req.user?.id;

    // Verify key belongs to user
    const apiKey = await db
      .select()
      .from(revolutionaryCommApiKeys)
      .where(and(
        eq(revolutionaryCommApiKeys.keyId, keyId),
        eq(revolutionaryCommApiKeys.userId, userId)
      ))
      .limit(1);

    if (!apiKey.length) {
      return res.status(404).json({ error: "API key not found" });
    }

    // Delete API key and usage records
    await db.delete(revolutionaryCommUsage).where(eq(revolutionaryCommUsage.apiKeyId, apiKey[0].id));
    await db.delete(revolutionaryCommApiKeys).where(eq(revolutionaryCommApiKeys.id, apiKey[0].id));

    res.json({
      success: true,
      message: "Revolutionary Communications API key deleted successfully"
    });
  } catch (error: any) {
    console.error("Revolutionary Communications API key deletion error:", error);
    res.status(500).json({ error: "Failed to delete API key" });
  }
});

export { router as revolutionaryCommApiRouter };