import { eq, and } from "drizzle-orm";
import { db } from "./db";
import { subscriptions, subscriptionPlans, defaultPlans } from "@shared/subscription-schema";
import { nanoid } from "nanoid";

export class SubscriptionService {
  async initializePlans() {
    // Insert default plans if they don't exist
    for (const plan of defaultPlans) {
      const existing = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, plan.id));
      if (existing.length === 0) {
        await db.insert(subscriptionPlans).values(plan);
      }
    }
  }

  async getAllPlans() {
    return await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true));
  }

  async getUserSubscription(userId: string) {
    const result = await db
      .select({
        subscription: subscriptions,
        plan: subscriptionPlans,
      })
      .from(subscriptions)
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.isActive, true)
        )
      )
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  async createSubscription(userId: string, planId: string) {
    const plan = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, planId)).limit(1);
    if (plan.length === 0) {
      throw new Error("Plan not found");
    }

    // Check if user already has an active subscription
    const existing = await this.getUserSubscription(userId);
    if (existing) {
      throw new Error("User already has an active subscription");
    }

    const subscriptionId = nanoid();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month from now

    const subscription = await db.insert(subscriptions).values({
      id: subscriptionId,
      userId,
      planId,
      status: "active",
      endDate,
      calculationsUsed: 0,
      apiCallsUsed: 0,
      isActive: true,
    }).returning();

    return subscription[0];
  }

  async incrementCalculationUsage(userId: string) {
    const userSub = await this.getUserSubscription(userId);
    if (!userSub) {
      // User has no subscription, treat as free tier
      return await this.checkCalculationLimit(userId, "free");
    }

    // Check if user has unlimited calculations
    if (userSub.plan.calculationsLimit === -1) {
      return { success: true, remaining: "unlimited" };
    }

    // Check if user has reached their limit
    if (userSub.subscription.calculationsUsed >= userSub.plan.calculationsLimit) {
      return { success: false, error: "Calculation limit reached" };
    }

    // Increment usage
    await db.update(subscriptions)
      .set({ calculationsUsed: userSub.subscription.calculationsUsed + 1 })
      .where(eq(subscriptions.id, userSub.subscription.id));

    const remaining = userSub.plan.calculationsLimit - (userSub.subscription.calculationsUsed + 1);
    return { success: true, remaining };
  }

  async checkCalculationLimit(userId: string, planId: string) {
    // For free tier, check daily limit
    if (planId === "free") {
      // This would typically check against a daily usage table
      // For now, assume free users get 25 calculations per day
      return { success: true, remaining: 25 };
    }
    return { success: true, remaining: "unlimited" };
  }

  async getSubscriptionFeatures(userId: string) {
    const userSub = await this.getUserSubscription(userId);
    
    if (!userSub) {
      // Default free tier features
      return {
        hasUnlimitedCalculations: false,
        hasRapaportAccess: false,
        hasPdfExport: false,
        hasBatchProcessing: false,
        hasCustomSettings: false,
        hasPrioritySupport: false,
        calculationsLimit: 25,
        calculationsUsed: 0,
        planName: "Free",
        planId: "free"
      };
    }

    const features = JSON.parse(userSub.plan.features);
    return {
      hasUnlimitedCalculations: userSub.plan.calculationsLimit === -1,
      hasRapaportAccess: userSub.plan.id === "pro",
      hasPdfExport: userSub.plan.id === "pro",
      hasBatchProcessing: userSub.plan.id === "pro",
      hasCustomSettings: userSub.plan.id === "pro",
      hasPrioritySupport: userSub.plan.id === "pro",
      calculationsLimit: userSub.plan.calculationsLimit,
      calculationsUsed: userSub.subscription.calculationsUsed,
      planName: userSub.plan.name,
      planId: userSub.plan.id
    };
  }

  async checkCalculationLimit(userId: string, planId?: string) {
    const userSub = await this.getUserSubscription(userId);
    const currentPlan = userSub?.plan || defaultPlans.find(p => p.id === (planId || "free"))!;

    if (currentPlan.calculationsLimit === -1) {
      return { allowed: true, remaining: -1 }; // unlimited
    }

    const used = userSub?.subscription.calculationsUsed || 0;
    const limit = currentPlan.calculationsLimit;
    const remaining = limit - used;

    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining),
      limit,
      used,
    };
  }

  async hasRapaportAccess(userId: string) {
    const userSub = await this.getUserSubscription(userId);
    if (!userSub) {
      return false; // Free tier uses Kaggle dataset only
    }
    
    return userSub.plan.id === "pro";
  }

  async hasBatchProcessing(userId: string) {
    const userSub = await this.getUserSubscription(userId);
    if (!userSub) {
      return false;
    }
    
    // Only Pro tier gets batch processing
    return userSub.plan.id === "pro";
  }

  async cancelSubscription(userId: string) {
    const userSub = await this.getUserSubscription(userId);
    if (!userSub) {
      throw new Error("No active subscription found");
    }

    await db
      .update(subscriptions)
      .set({ isActive: false, status: "cancelled" })
      .where(eq(subscriptions.id, userSub.subscription.id));

    return true;
  }

  async getSubscriptionStats(userId: string) {
    const userSub = await this.getUserSubscription(userId);
    if (!userSub) {
      return {
        plan: "free",
        calculationsUsed: 0,
        calculationsLimit: 25,
        hasRapaportAccess: false,
        hasBatchProcessing: false,
        status: "free",
      };
    }

    return {
      plan: userSub.plan.name,
      calculationsUsed: userSub.subscription.calculationsUsed,
      calculationsLimit: userSub.plan.calculationsLimit,
      hasRapaportAccess: userSub.plan.id === "pro",
      hasBatchProcessing: userSub.plan.id === "pro",
      status: userSub.subscription.status,
      endDate: userSub.subscription.endDate,
    };
  }
}

export const subscriptionService = new SubscriptionService();