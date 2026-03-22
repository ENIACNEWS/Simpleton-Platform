import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  planId: varchar("plan_id", { length: 50 }).notNull(),
  billingPeriod: varchar("billing_period", { length: 10 }).notNull().default("monthly"), // monthly or annual
  status: varchar("status", { length: 20 }).notNull().default("active"),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date").notNull(),
  calculationsUsed: integer("calculations_used").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in cents
  annualPrice: integer("annual_price").notNull(), // in cents, with 20% discount
  calculationsLimit: integer("calculations_limit").notNull().default(-1), // -1 = unlimited
  features: text("features").notNull(), // JSON string
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  createdAt: true,
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

// Default plans for the system
export const defaultPlans: InsertSubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Try Simpleton Vision — no credit card required",
    price: 0,
    calculationsLimit: 25,
    apiCallsLimit: 0,
    features: JSON.stringify([
      "Basic precious metals calculator",
      "Live gold, silver, platinum spot prices",
      "5 AI lookups per day",
      "Limited coin and jewelry database",
      "3 documents for $0.99"
    ]),
    isActive: true,
  },
  {
    id: "pro",
    name: "Simpleton Pro",
    description: "For collectors, enthusiasts, and smart buyers",
    price: 999,
    calculationsLimit: -1,
    features: JSON.stringify([
      "Unlimited AI assistant (Simplicity)",
      "Rolex authentication and reference database",
      "Full coin database with melt values",
      "AI diamond pricing engine",
      "Market intelligence and buy/hold/sell signals",
      "Portfolio tracking with performance charts",
      "Professional appraisals: $4.99 each"
    ]),
    isActive: true,
  },
];