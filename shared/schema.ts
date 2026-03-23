import { pgTable, text, serial, integer, boolean, decimal, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
}, (table) => [
  index("IDX_session_expire").on(table.expire),
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique(),
  email: text("email").notNull().unique(),
  password: text("password"), // null for social logins
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  provider: text("provider").notNull().default("email"), // email, google, facebook, apple, github, twitter
  providerId: text("provider_id"), // ID from social provider
  role: text("role").notNull().default("user"), // user, expert, admin
  isVerified: boolean("is_verified").notNull().default(false),
  emailVerified: boolean("email_verified").notNull().default(false),
  // Subscription fields
  subscriptionStatus: text("subscription_status").notNull().default("free"), // free, premium
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  gmailRefreshToken: text("gmail_refresh_token"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const coins = pgTable("coins", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // gold, silver, platinum, palladium
  yearStart: integer("year_start").notNull(),
  yearEnd: integer("year_end"),
  purity: decimal("purity", { precision: 5, scale: 4 }).notNull(), // 0.9999 format
  weight: decimal("weight", { precision: 10, scale: 4 }).notNull(), // in troy ounces
  diameter: decimal("diameter", { precision: 5, scale: 2 }), // in mm
  thickness: decimal("thickness", { precision: 4, scale: 2 }), // in mm
  mintage: integer("mintage"),
  description: text("description"),
  specifications: jsonb("specifications"), // additional specs
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const pricingData = pgTable("pricing_data", {
  id: serial("id").primaryKey(),
  metal: text("metal").notNull(), // gold, silver, platinum, palladium
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  source: text("source").notNull(),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  category: text("category").notNull(), // beginner, intermediate, expert
  tags: text("tags").array(),
  authorId: integer("author_id").notNull(),
  readTime: integer("read_time").notNull(), // in minutes
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const discussions = pgTable("discussions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").notNull(),
  category: text("category").notNull(),
  isAnswered: boolean("is_answered").notNull().default(false),
  views: integer("views").notNull().default(0),
  likes: integer("likes").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const replies = pgTable("replies", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  discussionId: integer("discussion_id").notNull(),
  authorId: integer("author_id").notNull(),
  isExpertAnswer: boolean("is_expert_answer").notNull().default(false),
  likes: integer("likes").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").notNull().default(false),
  // Automated Rebalancing Configuration
  autoRebalanceEnabled: boolean("auto_rebalance_enabled").notNull().default(false),
  rebalanceFrequency: text("rebalance_frequency").default("monthly"), // daily, weekly, monthly, quarterly
  thresholdPercentage: decimal("threshold_percentage", { precision: 5, scale: 2 }).default("5.00"), // rebalance when allocation drifts beyond this %
  targetGoldPercentage: decimal("target_gold_percentage", { precision: 5, scale: 2 }).default("60.00"),
  targetSilverPercentage: decimal("target_silver_percentage", { precision: 5, scale: 2 }).default("30.00"),
  targetPlatinumPercentage: decimal("target_platinum_percentage", { precision: 5, scale: 2 }).default("10.00"),
  lastRebalanceDate: timestamp("last_rebalance_date"),
  nextRebalanceDate: timestamp("next_rebalance_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const portfolioItems = pgTable("portfolio_items", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").notNull(),
  coinId: integer("coin_id"),
  customName: text("custom_name"),
  metalType: text("metal_type").notNull().default("gold"), // gold, silver, platinum for rebalancing
  weight: decimal("weight", { precision: 10, scale: 4 }).notNull().default("0"),
  purity: decimal("purity", { precision: 5, scale: 3 }).notNull().default("0.999"),
  quantity: decimal("quantity", { precision: 10, scale: 4 }).notNull(),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  purchaseDate: timestamp("purchase_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Rebalancing History Table
export const rebalanceHistory = pgTable("rebalance_history", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").notNull(),
  rebalanceDate: timestamp("rebalance_date").notNull().defaultNow(),
  triggerReason: text("trigger_reason").notNull(), // "threshold", "scheduled", "manual"
  
  // Before rebalancing
  beforeGoldPercentage: decimal("before_gold_percentage", { precision: 5, scale: 2 }).notNull(),
  beforeSilverPercentage: decimal("before_silver_percentage", { precision: 5, scale: 2 }).notNull(),
  beforePlatinumPercentage: decimal("before_platinum_percentage", { precision: 5, scale: 2 }).notNull(),
  beforeTotalValue: decimal("before_total_value", { precision: 12, scale: 2 }).notNull(),
  
  // After rebalancing (target)
  afterGoldPercentage: decimal("after_gold_percentage", { precision: 5, scale: 2 }).notNull(),
  afterSilverPercentage: decimal("after_silver_percentage", { precision: 5, scale: 2 }).notNull(),
  afterPlatinumPercentage: decimal("after_platinum_percentage", { precision: 5, scale: 2 }).notNull(),
  afterTotalValue: decimal("after_total_value", { precision: 12, scale: 2 }).notNull(),
  
  // Rebalancing transactions
  transactions: jsonb("transactions"), // Array of buy/sell recommendations
  status: text("status").notNull().default("pending"), // pending, executed, cancelled
  executionNotes: text("execution_notes"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// API Keys for External Access
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  keyId: text("key_id").notNull().unique(), // public identifier (sk_...)
  keySecret: text("key_secret").notNull().unique(), // hashed secret
  userId: integer("user_id").notNull(),
  name: text("name").notNull(), // user-friendly name
  tier: text("tier").notNull().default("free"), // free, developer, professional, enterprise
  
  // Rate Limiting
  requestsPerMinute: integer("requests_per_minute").notNull().default(10),
  requestsPerDay: integer("requests_per_day").notNull().default(1000),
  requestsPerMonth: integer("requests_per_month").notNull().default(10000),
  
  // Permissions
  allowedEndpoints: text("allowed_endpoints").array().default(["pricing", "ticker"]), // pricing, ticker, portfolio, ai
  allowedOrigins: text("allowed_origins").array(), // CORS origins
  
  // Status
  isActive: boolean("is_active").notNull().default(true),
  lastUsed: timestamp("last_used"),
  expiresAt: timestamp("expires_at"), // null for no expiration
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_api_keys_key_id").on(table.keyId),
  index("idx_api_keys_user_id").on(table.userId),
]);

// API Usage Tracking
export const apiUsage = pgTable("api_usage", {
  id: serial("id").primaryKey(),
  apiKeyId: integer("api_key_id").notNull(),
  endpoint: text("endpoint").notNull(), // /api/pricing/kitco
  method: text("method").notNull(), // GET, POST
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  responseTime: integer("response_time"), // milliseconds
  statusCode: integer("status_code").notNull(),
  requestSize: integer("request_size"), // bytes
  responseSize: integer("response_size"), // bytes
  timestamp: timestamp("timestamp").notNull().defaultNow(),
}, (table) => [
  index("idx_api_usage_key_id").on(table.apiKeyId),
  index("idx_api_usage_timestamp").on(table.timestamp),
  index("idx_api_usage_endpoint").on(table.endpoint),
]);

// API Rate Limiting Buckets
export const rateLimitBuckets = pgTable("rate_limit_buckets", {
  id: serial("id").primaryKey(),
  apiKeyId: integer("api_key_id").notNull(),
  bucketType: text("bucket_type").notNull(), // minute, day, month
  bucketTime: timestamp("bucket_time").notNull(), // start of the time window
  requestCount: integer("request_count").notNull().default(0),
  lastReset: timestamp("last_reset").notNull().defaultNow(),
}, (table) => [
  index("idx_rate_limit_key_bucket").on(table.apiKeyId, table.bucketType, table.bucketTime),
]);

// Subscription Management
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").notNull(),
  stripePriceId: text("stripe_price_id").notNull(),
  status: text("status").notNull(), // active, canceled, past_due, unpaid
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  canceledAt: timestamp("canceled_at"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_subscriptions_user_id").on(table.userId),
  index("idx_subscriptions_stripe_customer").on(table.stripeCustomerId),
]);

// Commercial License Management
// Business Demographics API
export const businessDemographics = pgTable("business_demographics", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  domain: text("domain").unique(),
  industry: text("industry").notNull(),
  subIndustry: text("sub_industry"),
  employeeCount: integer("employee_count"),
  estimatedRevenue: decimal("estimated_revenue", { precision: 15, scale: 2 }),
  foundedYear: integer("founded_year"),
  headquarters: text("headquarters"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  zipCode: text("zip_code"),
  phoneNumber: text("phone_number"),
  website: text("website"),
  description: text("description"),
  technologies: text("technologies").array(),
  socialProfiles: jsonb("social_profiles"),
  fundingInfo: jsonb("funding_info"),
  keyPersonnel: jsonb("key_personnel"),
  competitorAnalysis: jsonb("competitor_analysis"),
  marketSegment: text("market_segment"),
  businessModel: text("business_model"),
  publicTrading: boolean("public_trading").default(false),
  stockSymbol: text("stock_symbol"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  dataSource: text("data_source").notNull(),
  confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_business_demographics_domain").on(table.domain),
  index("idx_business_demographics_company").on(table.companyName),
  index("idx_business_demographics_industry").on(table.industry),
]);

export const licenseKeys = pgTable("license_keys", {
  id: serial("id").primaryKey(),
  licenseKey: text("license_key").notNull().unique(), // SB-XXXX-XXXX-XXXX-XXXX
  userId: integer("user_id").notNull(),
  companyName: text("company_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  
  // License Type
  licenseType: text("license_type").notNull(), // individual, small_business, enterprise, white_label
  
  // Pricing
  annualPrice: decimal("annual_price", { precision: 8, scale: 2 }).notNull(), // regular price
  discountPrice: decimal("discount_price", { precision: 8, scale: 2 }), // first-year discount price
  isFirstYear: boolean("is_first_year").notNull().default(true),
  
  // Status and Dates
  status: text("status").notNull().default("active"), // active, expired, suspended, cancelled
  purchaseDate: timestamp("purchase_date").notNull().defaultNow(),
  expiryDate: timestamp("expiry_date").notNull(),
  lastValidation: timestamp("last_validation"),
  gracePeriodDays: integer("grace_period_days").notNull().default(30),
  
  // Usage Limits (based on license type)
  maxDeployments: integer("max_deployments").notNull().default(1),
  maxUsers: integer("max_users").notNull().default(1),
  maxRevenue: decimal("max_revenue", { precision: 12, scale: 2 }), // revenue limit for license type
  
  // Features
  allowCommercialUse: boolean("allow_commercial_use").notNull().default(true),
  allowRedistribution: boolean("allow_redistribution").notNull().default(false),
  allowWhiteLabel: boolean("allow_white_label").notNull().default(false),
  allowSourceAccess: boolean("allow_source_access").notNull().default(false),
  
  // Support Level
  supportLevel: text("support_level").notNull().default("email"), // none, email, priority, dedicated
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_license_keys_key").on(table.licenseKey),
  index("idx_license_keys_user_id").on(table.userId),
  index("idx_license_keys_status").on(table.status),
  index("idx_license_keys_expiry").on(table.expiryDate),
]);

// License Usage Tracking
export const licenseUsage = pgTable("license_usage", {
  id: serial("id").primaryKey(),
  licenseKeyId: integer("license_key_id").notNull(),
  deploymentId: text("deployment_id").notNull(), // unique identifier for each deployment
  applicationName: text("application_name"),
  serverIp: text("server_ip"),
  hostName: text("host_name"),
  
  // Usage Metrics
  startupTime: timestamp("startup_time").notNull().defaultNow(),
  lastHeartbeat: timestamp("last_heartbeat").notNull().defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
  
  // Environment Info
  nodeVersion: text("node_version"),
  platform: text("platform"), // docker, heroku, aws, digitalocean, etc
  environment: text("environment").notNull().default("production"), // development, staging, production
  
  // Company Info (for compliance)
  estimatedRevenue: decimal("estimated_revenue", { precision: 12, scale: 2 }),
  userCount: integer("user_count"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_license_usage_key_id").on(table.licenseKeyId),
  index("idx_license_usage_deployment").on(table.deploymentId),
  index("idx_license_usage_active").on(table.isActive),
]);

// License Validation Logs
export const licenseValidation = pgTable("license_validation", {
  id: serial("id").primaryKey(),
  licenseKeyId: integer("license_key_id"), // nullable for invalid keys
  deploymentId: text("deployment_id").notNull(),
  
  // Validation Result
  isValid: boolean("is_valid").notNull(),
  validationReason: text("validation_reason"), // expired, suspended, invalid_key, etc
  
  // Request Info
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  requestDetails: jsonb("request_details"),
  
  // Response
  responseTime: integer("response_time"), // milliseconds
  cacheHit: boolean("cache_hit").notNull().default(false),
  
  timestamp: timestamp("timestamp").notNull().defaultNow(),
}, (table) => [
  index("idx_license_validation_key_id").on(table.licenseKeyId),
  index("idx_license_validation_timestamp").on(table.timestamp),
  index("idx_license_validation_valid").on(table.isValid),
]);

// AI Usage Tracking (for 30-minute limits)
export const aiUsage = pgTable("ai_usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sessionId: text("session_id"), // to group conversations
  messageCount: integer("message_count").notNull().default(1),
  tokensUsed: integer("tokens_used").notNull().default(0),
  minutesUsed: decimal("minutes_used", { precision: 5, scale: 2 }).notNull().default("0.5"), // estimated conversation time
  aiProvider: text("ai_provider").notNull().default("anthropic"), // anthropic, openai, google
  modelUsed: text("model_used"), // claude-sonnet-4, gpt-4, etc
  imageAnalysis: boolean("image_analysis").notNull().default(false), // Simpleton Vision usage
  timestamp: timestamp("timestamp").notNull().defaultNow(),
}, (table) => [
  index("idx_ai_usage_user_id").on(table.userId),
  index("idx_ai_usage_timestamp").on(table.timestamp),
  index("idx_ai_usage_session").on(table.sessionId),
]);

// Daily AI usage summary for quick limit checking
export const dailyAiUsage = pgTable("daily_ai_usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  usageDate: timestamp("usage_date").notNull(), // date only (set to start of day)
  totalMinutes: decimal("total_minutes", { precision: 7, scale: 2 }).notNull().default("0"),
  totalMessages: integer("total_messages").notNull().default(0),
  totalTokens: integer("total_tokens").notNull().default(0),
  visionUsageCount: integer("vision_usage_count").notNull().default(0),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
}, (table) => [
  index("idx_daily_ai_usage_user_date").on(table.userId, table.usageDate),
]);

// Community Support Tables
export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // technical, investing, news, general
  tags: text("tags").array().default([]),
  upvotes: integer("upvotes").notNull().default(0),
  replies: integer("replies").notNull().default(0),
  isSticky: boolean("is_sticky").notNull().default(false),
  isLocked: boolean("is_locked").notNull().default(false),
  lastReplyAt: timestamp("last_reply_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_community_posts_user_id").on(table.userId),
  index("idx_community_posts_category").on(table.category),
  index("idx_community_posts_created_at").on(table.createdAt),
]);

export const communityPostReplies = pgTable("community_post_replies", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  parentReplyId: integer("parent_reply_id"), // for threaded replies
  upvotes: integer("upvotes").notNull().default(0),
  isExpertReply: boolean("is_expert_reply").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_community_replies_post_id").on(table.postId),
  index("idx_community_replies_user_id").on(table.userId),
]);

export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // api, billing, technical, general
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  status: text("status").notNull().default("open"), // open, in_progress, resolved, closed
  assignedTo: text("assigned_to"), // staff member name
  tags: text("tags").array().default([]),
  internalNotes: text("internal_notes"),
  resolutionNotes: text("resolution_notes"),
  resolvedAt: timestamp("resolved_at"),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_support_tickets_user_id").on(table.userId),
  index("idx_support_tickets_status").on(table.status),
  index("idx_support_tickets_priority").on(table.priority),
]);

export const supportTicketResponses = pgTable("support_ticket_responses", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull(),
  userId: integer("user_id").notNull(),
  message: text("message").notNull(),
  isStaff: boolean("is_staff").notNull().default(false),
  isInternal: boolean("is_internal").notNull().default(false), // internal staff notes
  attachments: text("attachments").array().default([]), // file URLs
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_support_responses_ticket_id").on(table.ticketId),
  index("idx_support_responses_user_id").on(table.userId),
]);

// Rolex Database Tables
export const rolexModels = pgTable("rolex_models", {
  id: serial("id").primaryKey(),
  referenceNumber: text("reference_number").notNull().unique(), // e.g., "116610LV"
  name: text("name").notNull(), // e.g., "Submariner Date Hulk"
  collection: text("collection").notNull(), // Submariner, Daytona, GMT-Master, etc.
  category: text("category").notNull(), // Sport/Dive, Luxury/Dress, Vintage/Racing
  subCategory: text("sub_category"), // Date/No-Date, Chronograph, GMT
  
  // Production Information
  productionStartYear: integer("production_start_year").notNull(),
  productionEndYear: integer("production_end_year"), // null for current production
  isCurrentProduction: boolean("is_current_production").notNull().default(false),
  isLimitedEdition: boolean("is_limited_edition").notNull().default(false),
  limitedEditionQuantity: integer("limited_edition_quantity"),
  
  // Physical Specifications
  caseSize: decimal("case_size", { precision: 4, scale: 1 }).notNull(), // 40.0mm
  caseMaterial: text("case_material").notNull(), // Oystersteel, Gold, Platinum
  caseThickness: decimal("case_thickness", { precision: 4, scale: 2 }), // 12.5mm
  lugWidth: decimal("lug_width", { precision: 4, scale: 1 }), // 20.0mm
  
  // Dial Information
  dialColors: text("dial_colors").array().notNull(), // ["Black", "Green", "Blue"]
  dialType: text("dial_type"), // Gloss, Matte, Sunburst
  indexMarkers: text("index_markers"), // Dot, Applied, Roman
  
  // Bezel Information
  bezelType: text("bezel_type"), // Unidirectional, Bidirectional, Fixed
  bezelMaterial: text("bezel_material"), // Ceramic, Aluminum, Gold
  bezelColors: text("bezel_colors").array(), // ["Black", "Green"]
  
  // Movement Information
  movementCaliber: text("movement_caliber").notNull(), // 3135, 3230, etc.
  powerReserve: integer("power_reserve"), // hours
  
  // Bracelet/Strap Information
  braceletTypes: text("bracelet_types").array().notNull(), // ["Oyster", "Jubilee"]
  braceletMaterial: text("bracelet_material"), // Oystersteel, Gold
  claspType: text("clasp_type"), // Oysterclasp, Fliplock
  
  // Water Resistance & Functions
  waterResistance: integer("water_resistance").notNull(), // meters
  functions: text("functions").array().notNull(), // ["Time", "Date", "GMT"]
  
  // Pricing and Market Information
  originalRetailPrice: decimal("original_retail_price", { precision: 10, scale: 2 }),
  currentMarketValue: decimal("current_market_value", { precision: 10, scale: 2 }),
  currency: text("currency").notNull().default("USD"),
  lastPriceUpdate: timestamp("last_price_update"),
  
  // Collectibility and Rarity
  rarityScore: integer("rarity_score").default(1), // 1-10 scale
  collectibilityNotes: text("collectibility_notes"),
  notableFeatures: text("notable_features").array(), // ["First ceramic bezel", "Paul Newman dial"]
  
  // Additional Information
  description: text("description"),
  technicalSpecs: jsonb("technical_specs"), // Additional technical details
  imageUrls: text("image_urls").array(), // Product images
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_rolex_models_reference").on(table.referenceNumber),
  index("idx_rolex_models_collection").on(table.collection),
  index("idx_rolex_models_category").on(table.category),
  index("idx_rolex_models_production_year").on(table.productionStartYear, table.productionEndYear),
  index("idx_rolex_models_current_production").on(table.isCurrentProduction),
]);

export const rolexMovements = pgTable("rolex_movements", {
  id: serial("id").primaryKey(),
  caliber: text("caliber").notNull().unique(), // 3135, 3230, 3255, etc.
  name: text("name"), // Official movement name
  type: text("type").notNull(), // Automatic, Manual, Quartz
  
  // Technical Specifications
  diameter: decimal("diameter", { precision: 4, scale: 2 }), // 28.50mm
  thickness: decimal("thickness", { precision: 4, scale: 2 }), // 6.00mm
  jewels: integer("jewels"), // 31 jewels
  frequency: integer("frequency"), // 28800 vph
  powerReserve: integer("power_reserve"), // 70 hours
  
  // Production Information
  introductionYear: integer("introduction_year").notNull(),
  discontinuedYear: integer("discontinued_year"), // null if still in production
  isCurrentProduction: boolean("is_current_production").notNull().default(false),
  
  // Features and Functions
  features: text("features").array().notNull(), // ["Date", "GMT", "Chronograph"]
  complications: text("complications").array(), // ["Annual Calendar", "Moon Phase"]
  
  // Technical Details
  escapement: text("escapement"), // Swiss lever
  balanceWheel: text("balance_wheel"), // Glucydur
  hairspring: text("hairspring"), // Parachrom
  shock_absorption: text("shock_absorption"), // Paraflex
  
  // Certification and Standards
  chronometer_certified: boolean("chronometer_certified").notNull().default(false),
  antimagnetic_rating: text("antimagnetic_rating"), // 1000 gauss, etc.
  
  // Performance Specifications
  accuracy_range: text("accuracy_range"), // -2/+2 seconds per day
  service_interval: integer("service_interval"), // years
  
  // Manufacturing Details
  base_movement: text("base_movement"), // If based on another caliber
  manufactured_by: text("manufactured_by").default("Rolex"),
  
  // Notable Information
  notable_features: text("notable_features").array(),
  common_issues: text("common_issues").array(),
  authentication_points: text("authentication_points").array(),
  
  description: text("description"),
  technicalSpecs: jsonb("technical_specs"),
  imageUrls: text("image_urls").array(), // Movement images
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_rolex_movements_caliber").on(table.caliber),
  index("idx_rolex_movements_type").on(table.type),
  index("idx_rolex_movements_year").on(table.introductionYear),
  index("idx_rolex_movements_current").on(table.isCurrentProduction),
]);

export const rolexSerialRanges = pgTable("rolex_serial_ranges", {
  id: serial("id").primaryKey(),
  serialFormat: text("serial_format").notNull(), // "Sequential", "Letter Prefix", "Random"
  
  // Serial Range Information
  startSerial: text("start_serial"), // "29000" or "R000001" 
  endSerial: text("end_serial"), // "37000" or "R999999"
  prefix: text("prefix"), // "R", "L", "E" for letter prefix system
  
  // Date Information
  startYear: integer("start_year").notNull(),
  endYear: integer("end_year"),
  startMonth: integer("start_month"), // More precise dating when available
  endMonth: integer("end_month"),
  
  // Production Information
  estimatedProduction: integer("estimated_production"), // Number of watches
  productionNotes: text("production_notes"), // Special notes about this period
  
  // System Information
  datingSystem: text("dating_system").notNull(), // "Sequential", "Letter", "Random"
  accuracyLevel: text("accuracy_level").notNull(), // "Exact", "Approximate", "Estimated"
  
  // Notable Events
  historicalContext: text("historical_context"), // "War period", "Post-war expansion"
  specialFeatures: text("special_features").array(), // Notable features from this period
  
  isActive: boolean("is_active").notNull().default(true),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_rolex_serial_year").on(table.startYear, table.endYear),
  index("idx_rolex_serial_prefix").on(table.prefix),
  index("idx_rolex_serial_format").on(table.serialFormat),
]);

export const rolexMarketValues = pgTable("rolex_market_values", {
  id: serial("id").primaryKey(),
  modelId: integer("model_id").notNull(),
  
  // Price Information
  condition: text("condition").notNull(), // "Mint", "Excellent", "Very Good", "Good", "Fair", "Poor"
  lowEstimate: decimal("low_estimate", { precision: 12, scale: 2 }).notNull(),
  highEstimate: decimal("high_estimate", { precision: 12, scale: 2 }).notNull(),
  averagePrice: decimal("average_price", { precision: 12, scale: 2 }),
  currency: text("currency").notNull().default("USD"),
  
  // Market Source Information
  source: text("source").notNull(), // "Auction", "Dealer", "Private Sale", "Estimated"
  sourceDetails: text("source_details"), // Specific auction house, dealer, etc.
  
  // Date Information
  priceDate: timestamp("price_date").notNull(),
  marketPeriod: text("market_period"), // "Q1 2024", "2024", for aggregated data
  
  // Additional Factors
  complications: text("complications").array(), // Factors affecting price
  braceletIncluded: boolean("bracelet_included").default(true),
  boxAndPapers: boolean("box_and_papers").default(false),
  serviceHistory: boolean("service_history").default(false),
  originalParts: boolean("original_parts").default(true),
  
  // Market Trends
  priceDirection: text("price_direction"), // "Rising", "Falling", "Stable"
  demandLevel: text("demand_level"), // "High", "Medium", "Low"
  liquidityLevel: text("liquidity_level"), // "High", "Medium", "Low"
  
  // Investment Information
  appreciationRate: decimal("appreciation_rate", { precision: 5, scale: 2 }), // Annual %
  volatilityScore: integer("volatility_score"), // 1-10 scale
  investmentGrade: text("investment_grade"), // "Blue Chip", "Growth", "Speculative"
  
  notes: text("notes"),
  dataQuality: text("data_quality").notNull().default("Verified"), // "Verified", "Estimated", "Projected"
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_rolex_market_model").on(table.modelId),
  index("idx_rolex_market_condition").on(table.condition),
  index("idx_rolex_market_date").on(table.priceDate),
  index("idx_rolex_market_source").on(table.source),
]);

export const rolexAuthenticationMarkers = pgTable("rolex_authentication_markers", {
  id: serial("id").primaryKey(),
  modelId: integer("model_id"), // null for general authentication points
  movementId: integer("movement_id"), // null for case/dial/bracelet markers
  
  // Authentication Point Information
  component: text("component").notNull(), // "Case", "Dial", "Movement", "Bracelet", "Crown", "Caseback"
  markerType: text("marker_type").notNull(), // "Engraving", "Font", "Logo", "Finish", "Dimension"
  
  // Detailed Description
  authenticFeature: text("authentic_feature").notNull(), // What to look for on genuine pieces
  commonFake: text("common_fake"), // How fakes typically differ
  
  // Verification Information
  difficulty: text("difficulty").notNull(), // "Easy", "Moderate", "Expert", "Equipment Required"
  toolsRequired: text("tools_required").array(), // ["Loupe", "Microscope", "UV Light"]
  
  // Time Period Information
  applicableFromYear: integer("applicable_from_year"), // When this marker started
  applicableToYear: integer("applicable_to_year"), // When it ended, null if current
  
  // Importance and Reliability
  importance: text("importance").notNull(), // "Critical", "Important", "Supporting", "Minor"
  reliability: integer("reliability_score").notNull(), // 1-10, how reliable this marker is
  
  // Reference Information
  imageUrls: text("image_urls").array(), // Reference images
  videoUrls: text("video_urls").array(), // Reference videos
  
  // Notes and Context
  detailedDescription: text("detailed_description"),
  expertNotes: text("expert_notes"),
  commonMistakes: text("common_mistakes").array(),
  
  // Verification Status
  verifiedBy: text("verified_by"), // Expert who verified this information
  verificationDate: timestamp("verification_date"),
  
  isActive: boolean("is_active").notNull().default(true),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_rolex_auth_model").on(table.modelId),
  index("idx_rolex_auth_movement").on(table.movementId),
  index("idx_rolex_auth_component").on(table.component),
  index("idx_rolex_auth_importance").on(table.importance),
  index("idx_rolex_auth_year").on(table.applicableFromYear, table.applicableToYear),
]);

// Export Center Tables
export const exportTemplates = pgTable("export_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  format: text("format").notNull(), // pdf, csv, xlsx, json
  category: text("category").notNull(), // portfolio, analytics, transactions, reports
  fields: text("fields").array().notNull(), // list of included fields
  templateConfig: jsonb("template_config"), // template-specific configuration
  isCustomizable: boolean("is_customizable").notNull().default(true),
  requiresPremium: boolean("requires_premium").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const exportJobs = pgTable("export_jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  templateId: integer("template_id").notNull(),
  jobId: text("job_id").notNull().unique(), // external job identifier
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  progress: integer("progress").notNull().default(0), // 0-100
  parameters: jsonb("parameters"), // export parameters and filters
  customFields: text("custom_fields").array().default([]),
  fileUrl: text("file_url"), // download URL when completed
  fileName: text("file_name"),
  fileSize: integer("file_size"), // bytes
  errorMessage: text("error_message"),
  expiresAt: timestamp("expires_at"), // when download link expires
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_export_jobs_user_id").on(table.userId),
  index("idx_export_jobs_status").on(table.status),
  index("idx_export_jobs_created_at").on(table.createdAt),
]);

export const scheduledExports = pgTable("scheduled_exports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  templateId: integer("template_id").notNull(),
  name: text("name").notNull(),
  frequency: text("frequency").notNull(), // daily, weekly, monthly, quarterly
  dayOfWeek: integer("day_of_week"), // 0-6 for weekly
  dayOfMonth: integer("day_of_month"), // 1-31 for monthly
  timeOfDay: text("time_of_day").notNull().default("09:00"), // HH:MM format
  timezone: text("timezone").notNull().default("UTC"),
  parameters: jsonb("parameters"), // export parameters
  emailRecipients: text("email_recipients").array().default([]),
  isActive: boolean("is_active").notNull().default(true),
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run").notNull(),
  lastJobId: text("last_job_id"), // reference to last export job
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_scheduled_exports_user_id").on(table.userId),
  index("idx_scheduled_exports_next_run").on(table.nextRun),
]);

// Multi-User Management Tables
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(), // links to main user account
  userId: integer("user_id"), // null for pending invitations
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").notNull().default("viewer"), // admin, manager, analyst, viewer
  permissions: text("permissions").array().default([]), // granular permissions
  status: text("status").notNull().default("pending"), // pending, active, suspended, deactivated
  inviteToken: text("invite_token").unique(), // for pending invitations
  invitedBy: integer("invited_by").notNull(), // user ID who sent invitation
  lastActiveAt: timestamp("last_active_at"),
  invitedAt: timestamp("invited_at").notNull().defaultNow(),
  joinedAt: timestamp("joined_at"),
  deactivatedAt: timestamp("deactivated_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_team_members_organization_id").on(table.organizationId),
  index("idx_team_members_user_id").on(table.userId),
  index("idx_team_members_email").on(table.email),
  index("idx_team_members_status").on(table.status),
]);

export const organizationRoles = pgTable("organization_roles", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  permissions: text("permissions").array().notNull(),
  level: integer("level").notNull().default(1), // 1-10, higher = more access
  isSystemRole: boolean("is_system_role").notNull().default(false), // built-in roles
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_org_roles_organization_id").on(table.organizationId),
]);

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  userId: integer("user_id"), // null for system actions
  userName: text("user_name"), // cached for performance
  action: text("action").notNull(), // login, logout, export, invite_user, etc.
  resource: text("resource"), // what was acted upon
  resourceId: text("resource_id"), // ID of the resource
  details: jsonb("details"), // additional action details
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  status: text("status").notNull().default("success"), // success, failed, warning
  timestamp: timestamp("timestamp").notNull().defaultNow(),
}, (table) => [
  index("idx_activity_logs_organization_id").on(table.organizationId),
  index("idx_activity_logs_user_id").on(table.userId),
  index("idx_activity_logs_timestamp").on(table.timestamp),
  index("idx_activity_logs_action").on(table.action),
]);

export const organizationSettings = pgTable("organization_settings", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().unique(),
  organizationName: text("organization_name").notNull(),
  allowedDomains: text("allowed_domains").array().default([]), // email domain restrictions
  requireTwoFactor: boolean("require_two_factor").notNull().default(false),
  allowedIpRanges: text("allowed_ip_ranges").array().default([]), // IP restrictions
  sessionTimeout: integer("session_timeout").notNull().default(480), // minutes
  dataRetentionDays: integer("data_retention_days").notNull().default(365),
  exportPermissions: jsonb("export_permissions"), // detailed export controls
  apiPermissions: jsonb("api_permissions"), // API access controls
  securitySettings: jsonb("security_settings"), // additional security config
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_org_settings_organization_id").on(table.organizationId),
]);

// Revolutionary Communications API Keys
export const revolutionaryCommApiKeys = pgTable("revolutionary_comm_api_keys", {
  id: serial("id").primaryKey(),
  keyId: text("key_id").notNull().unique(), // public identifier (rck_...)
  keySecret: text("key_secret").notNull().unique(), // hashed secret
  userId: integer("user_id").notNull(),
  name: text("name").notNull(), // user-friendly name
  tier: text("tier").notNull().default("basic"), // basic, professional, enterprise
  
  // Revolutionary Communications Permissions
  allowSMS: boolean("allow_sms").notNull().default(true),
  allowEmail: boolean("allow_email").notNull().default(true),
  allowPasscode: boolean("allow_passcode").notNull().default(true),
  allowTesting: boolean("allow_testing").notNull().default(true),
  
  // Rate Limiting for Revolutionary Communications
  communicationsPerDay: integer("communications_per_day").notNull().default(100),
  communicationsPerMonth: integer("communications_per_month").notNull().default(1000),
  
  // Revolutionary Security Features
  ipWhitelist: text("ip_whitelist").array(), // Allowed IP addresses
  webhookUrl: text("webhook_url"), // Callback URL for communication events
  
  // Status
  isActive: boolean("is_active").notNull().default(true),
  lastUsed: timestamp("last_used"),
  expiresAt: timestamp("expires_at"), // null for no expiration
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_revolutionary_comm_api_keys_key_id").on(table.keyId),
  index("idx_revolutionary_comm_api_keys_user_id").on(table.userId),
]);

// Revolutionary Communications Usage Tracking
export const revolutionaryCommUsage = pgTable("revolutionary_comm_usage", {
  id: serial("id").primaryKey(),
  apiKeyId: integer("api_key_id").notNull(),
  endpoint: text("endpoint").notNull(), // /api/communication/status, /api/security/request-passcode
  method: text("method").notNull(), // GET, POST
  ipAddress: text("ip_address"),
  communicationType: text("communication_type"), // sms, email, passcode
  success: boolean("success").notNull(),
  responseTime: integer("response_time"), // milliseconds
  errorMessage: text("error_message"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  articles: many(articles),
  discussions: many(discussions),
  replies: many(replies),
  portfolios: many(portfolios),
  apiKeys: many(apiKeys),
  subscription: one(subscriptions),
  aiUsage: many(aiUsage),
  dailyAiUsage: many(dailyAiUsage),
}));

export const articlesRelations = relations(articles, ({ one }) => ({
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
  }),
}));

export const discussionsRelations = relations(discussions, ({ one, many }) => ({
  author: one(users, {
    fields: [discussions.authorId],
    references: [users.id],
  }),
  replies: many(replies),
}));

export const repliesRelations = relations(replies, ({ one }) => ({
  discussion: one(discussions, {
    fields: [replies.discussionId],
    references: [discussions.id],
  }),
  author: one(users, {
    fields: [replies.authorId],
    references: [users.id],
  }),
}));

export const portfoliosRelations = relations(portfolios, ({ one, many }) => ({
  user: one(users, {
    fields: [portfolios.userId],
    references: [users.id],
  }),
  items: many(portfolioItems),
  rebalanceHistory: many(rebalanceHistory),
}));

export const portfolioItemsRelations = relations(portfolioItems, ({ one }) => ({
  portfolio: one(portfolios, {
    fields: [portfolioItems.portfolioId],
    references: [portfolios.id],
  }),
  coin: one(coins, {
    fields: [portfolioItems.coinId],
    references: [coins.id],
  }),
}));

export const rebalanceHistoryRelations = relations(rebalanceHistory, ({ one }) => ({
  portfolio: one(portfolios, {
    fields: [rebalanceHistory.portfolioId],
    references: [portfolios.id],
  }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one, many }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
  usage: many(apiUsage),
  rateLimitBuckets: many(rateLimitBuckets),
}));

export const apiUsageRelations = relations(apiUsage, ({ one }) => ({
  apiKey: one(apiKeys, {
    fields: [apiUsage.apiKeyId],
    references: [apiKeys.id],
  }),
}));

export const rateLimitBucketsRelations = relations(rateLimitBuckets, ({ one }) => ({
  apiKey: one(apiKeys, {
    fields: [rateLimitBuckets.apiKeyId],
    references: [apiKeys.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const aiUsageRelations = relations(aiUsage, ({ one }) => ({
  user: one(users, {
    fields: [aiUsage.userId],
    references: [users.id],
  }),
}));

export const dailyAiUsageRelations = relations(dailyAiUsage, ({ one }) => ({
  user: one(users, {
    fields: [dailyAiUsage.userId],
    references: [users.id],
  }),
}));

// Community Support Relations
export const communityPostsRelations = relations(communityPosts, ({ one, many }) => ({
  user: one(users, {
    fields: [communityPosts.userId],
    references: [users.id],
  }),
  replies: many(communityPostReplies),
}));

export const communityPostRepliesRelations = relations(communityPostReplies, ({ one }) => ({
  post: one(communityPosts, {
    fields: [communityPostReplies.postId],
    references: [communityPosts.id],
  }),
  user: one(users, {
    fields: [communityPostReplies.userId],
    references: [users.id],
  }),
  parentReply: one(communityPostReplies, {
    fields: [communityPostReplies.parentReplyId],
    references: [communityPostReplies.id],
  }),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one, many }) => ({
  user: one(users, {
    fields: [supportTickets.userId],
    references: [users.id],
  }),
  responses: many(supportTicketResponses),
}));

export const supportTicketResponsesRelations = relations(supportTicketResponses, ({ one }) => ({
  ticket: one(supportTickets, {
    fields: [supportTicketResponses.ticketId],
    references: [supportTickets.id],
  }),
  user: one(users, {
    fields: [supportTicketResponses.userId],
    references: [users.id],
  }),
}));

// Export Center Relations
export const exportJobsRelations = relations(exportJobs, ({ one }) => ({
  user: one(users, {
    fields: [exportJobs.userId],
    references: [users.id],
  }),
  template: one(exportTemplates, {
    fields: [exportJobs.templateId],
    references: [exportTemplates.id],
  }),
}));

export const scheduledExportsRelations = relations(scheduledExports, ({ one }) => ({
  user: one(users, {
    fields: [scheduledExports.userId],
    references: [users.id],
  }),
  template: one(exportTemplates, {
    fields: [scheduledExports.templateId],
    references: [exportTemplates.id],
  }),
}));

// Multi-User Management Relations
export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  organization: one(users, {
    fields: [teamMembers.organizationId],
    references: [users.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  invitedByUser: one(users, {
    fields: [teamMembers.invitedBy],
    references: [users.id],
  }),
}));

export const organizationRolesRelations = relations(organizationRoles, ({ one }) => ({
  organization: one(users, {
    fields: [organizationRoles.organizationId],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  organization: one(users, {
    fields: [activityLogs.organizationId],
    references: [users.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const organizationSettingsRelations = relations(organizationSettings, ({ one }) => ({
  organization: one(users, {
    fields: [organizationSettings.organizationId],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isVerified: true,
  emailVerified: true
}).extend({
  password: z.string().min(8).optional(), // password is optional for social logins
});

export const insertCoinSchema = createInsertSchema(coins).omit({
  id: true,
  createdAt: true,
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDiscussionSchema = createInsertSchema(discussions).omit({
  id: true,
  views: true,
  likes: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReplySchema = createInsertSchema(replies).omit({
  id: true,
  likes: true,
  createdAt: true,
});

export const insertPortfolioSchema = createInsertSchema(portfolios).omit({
  id: true,
  createdAt: true,
});

export const insertPortfolioItemSchema = createInsertSchema(portfolioItems).omit({
  id: true,
  createdAt: true,
});

export const insertRebalanceHistorySchema = createInsertSchema(rebalanceHistory).omit({
  id: true,
  rebalanceDate: true,
  createdAt: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastUsed: true,
});

export const insertApiUsageSchema = createInsertSchema(apiUsage).omit({
  id: true,
  timestamp: true,
});

export const insertRateLimitBucketSchema = createInsertSchema(rateLimitBuckets).omit({
  id: true,
  lastReset: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiUsageSchema = createInsertSchema(aiUsage).omit({
  id: true,
  timestamp: true,
});

export const insertDailyAiUsageSchema = createInsertSchema(dailyAiUsage).omit({
  id: true,
  lastUpdated: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCoin = z.infer<typeof insertCoinSchema>;
export type Coin = typeof coins.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;
export type InsertDiscussion = z.infer<typeof insertDiscussionSchema>;
export type Discussion = typeof discussions.$inferSelect;
export type InsertReply = z.infer<typeof insertReplySchema>;
export type Reply = typeof replies.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolioItem = z.infer<typeof insertPortfolioItemSchema>;
export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type InsertRebalanceHistory = z.infer<typeof insertRebalanceHistorySchema>;
export type RebalanceHistory = typeof rebalanceHistory.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiUsage = z.infer<typeof insertApiUsageSchema>;
export type ApiUsage = typeof apiUsage.$inferSelect;
export type InsertRateLimitBucket = z.infer<typeof insertRateLimitBucketSchema>;
export type RateLimitBucket = typeof rateLimitBuckets.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertAiUsage = z.infer<typeof insertAiUsageSchema>;
export type AiUsage = typeof aiUsage.$inferSelect;
export type InsertDailyAiUsage = z.infer<typeof insertDailyAiUsageSchema>;
export type DailyAiUsage = typeof dailyAiUsage.$inferSelect;
export type PricingData = typeof pricingData.$inferSelect;

// Community Support Types
export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;
export type CommunityPostReply = typeof communityPostReplies.$inferSelect;
export type InsertCommunityPostReply = typeof communityPostReplies.$inferInsert;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;
export type SupportTicketResponse = typeof supportTicketResponses.$inferSelect;
export type InsertSupportTicketResponse = typeof supportTicketResponses.$inferInsert;

// Export Center Types
export type ExportTemplate = typeof exportTemplates.$inferSelect;
export type InsertExportTemplate = typeof exportTemplates.$inferInsert;
export type ExportJob = typeof exportJobs.$inferSelect;
export type InsertExportJob = typeof exportJobs.$inferInsert;
export type ScheduledExport = typeof scheduledExports.$inferSelect;
export type InsertScheduledExport = typeof scheduledExports.$inferInsert;

// Multi-User Management Types
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;
export type OrganizationRole = typeof organizationRoles.$inferSelect;
export type InsertOrganizationRole = typeof organizationRoles.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;
export type OrganizationSettings = typeof organizationSettings.$inferSelect;
export type InsertOrganizationSettings = typeof organizationSettings.$inferInsert;

// Revolutionary Communications API Key Types
export type RevolutionaryCommApiKey = typeof revolutionaryCommApiKeys.$inferSelect;
export type InsertRevolutionaryCommApiKey = typeof revolutionaryCommApiKeys.$inferInsert;
export type RevolutionaryCommUsage = typeof revolutionaryCommUsage.$inferSelect;
export type InsertRevolutionaryCommUsage = typeof revolutionaryCommUsage.$inferInsert;

// Commercial License Types
export type LicenseKey = typeof licenseKeys.$inferSelect;
export type InsertLicenseKey = typeof licenseKeys.$inferInsert;
export type LicenseUsage = typeof licenseUsage.$inferSelect;
export type InsertLicenseUsage = typeof licenseUsage.$inferInsert;
export type LicenseValidation = typeof licenseValidation.$inferSelect;
export type InsertLicenseValidation = typeof licenseValidation.$inferInsert;

// Rolex Database Relations
export const rolexModelsRelations = relations(rolexModels, ({ many, one }) => ({
  marketValues: many(rolexMarketValues),
  authenticationMarkers: many(rolexAuthenticationMarkers),
  movement: one(rolexMovements, {
    fields: [rolexModels.movementCaliber],
    references: [rolexMovements.caliber],
  }),
}));

export const rolexMovementsRelations = relations(rolexMovements, ({ many }) => ({
  models: many(rolexModels),
  authenticationMarkers: many(rolexAuthenticationMarkers),
}));

export const rolexMarketValuesRelations = relations(rolexMarketValues, ({ one }) => ({
  model: one(rolexModels, {
    fields: [rolexMarketValues.modelId],
    references: [rolexModels.id],
  }),
}));

export const rolexAuthenticationMarkersRelations = relations(rolexAuthenticationMarkers, ({ one }) => ({
  model: one(rolexModels, {
    fields: [rolexAuthenticationMarkers.modelId],
    references: [rolexModels.id],
  }),
  movement: one(rolexMovements, {
    fields: [rolexAuthenticationMarkers.movementId],
    references: [rolexMovements.id],
  }),
}));

// Rolex Insert Schemas
export const insertRolexModelSchema = createInsertSchema(rolexModels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRolexMovementSchema = createInsertSchema(rolexMovements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRolexSerialRangeSchema = createInsertSchema(rolexSerialRanges).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRolexMarketValueSchema = createInsertSchema(rolexMarketValues).omit({
  id: true,
  createdAt: true,
});

export const insertRolexAuthenticationMarkerSchema = createInsertSchema(rolexAuthenticationMarkers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Rolex Types
export type RolexModel = typeof rolexModels.$inferSelect;
export type InsertRolexModel = z.infer<typeof insertRolexModelSchema>;
export type RolexMovement = typeof rolexMovements.$inferSelect;
export type InsertRolexMovement = z.infer<typeof insertRolexMovementSchema>;
export type RolexSerialRange = typeof rolexSerialRanges.$inferSelect;
export type InsertRolexSerialRange = z.infer<typeof insertRolexSerialRangeSchema>;
export type RolexMarketValue = typeof rolexMarketValues.$inferSelect;
export type InsertRolexMarketValue = z.infer<typeof insertRolexMarketValueSchema>;
export type RolexAuthenticationMarker = typeof rolexAuthenticationMarkers.$inferSelect;
export type InsertRolexAuthenticationMarker = z.infer<typeof insertRolexAuthenticationMarkerSchema>;

// ═══════════════════════════════════════════════════════════════
// SIMPLICITY AI MEMORY SYSTEM
// ═══════════════════════════════════════════════════════════════

export const assistantSessions = pgTable("assistant_sessions", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull().unique(),
  userId: integer("user_id"),
  userProfile: jsonb("user_profile").$type<{
    name?: string;
    interests?: string[];
    knowledgeLevel?: string;
    collections?: string[];
    notes?: string[];
  }>(),
  lastPage: text("last_page"),
  messageCount: integer("message_count").notNull().default(0),
  memorySummary: text("memory_summary"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastActiveAt: timestamp("last_active_at").notNull().defaultNow(),
}, (table) => [
  index("IDX_assistant_session_token").on(table.sessionToken),
  index("IDX_assistant_session_user").on(table.userId),
]);

export const assistantMessages = pgTable("assistant_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  pageContext: text("page_context"),
  metadata: jsonb("metadata").$type<{
    appraisalType?: string;
    providers?: string[];
    confidence?: number;
    processingTime?: number;
    hasImage?: boolean;
  }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("IDX_assistant_msg_session").on(table.sessionId),
  index("IDX_assistant_msg_created").on(table.createdAt),
]);

export const assistantSessionsRelations = relations(assistantSessions, ({ many }) => ({
  messages: many(assistantMessages),
}));

export const assistantMessagesRelations = relations(assistantMessages, ({ one }) => ({
  session: one(assistantSessions, {
    fields: [assistantMessages.sessionId],
    references: [assistantSessions.id],
  }),
}));

export const insertAssistantSessionSchema = createInsertSchema(assistantSessions).omit({
  id: true,
  createdAt: true,
  lastActiveAt: true,
});

export const insertAssistantMessageSchema = createInsertSchema(assistantMessages).omit({
  id: true,
  createdAt: true,
});

export type AssistantSession = typeof assistantSessions.$inferSelect;
export type InsertAssistantSession = z.infer<typeof insertAssistantSessionSchema>;
export type AssistantMessage = typeof assistantMessages.$inferSelect;
export type InsertAssistantMessage = z.infer<typeof insertAssistantMessageSchema>;

// ═══════════════════════════════════════════════════════════════
// SIMPLICITY KNOWLEDGE BASE & LEARNING SYSTEM
// ═══════════════════════════════════════════════════════════════

export const simplicityKnowledge = pgTable("simplicity_knowledge", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  topic: text("topic").notNull(),
  content: text("content").notNull(),
  tags: text("tags").array().default([]),
  source: text("source"),
  confidence: decimal("confidence", { precision: 3, scale: 2 }).default("1.00"),
  accessCount: integer("access_count").notNull().default(0),
  lastAccessed: timestamp("last_accessed"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_sk_category").on(table.category),
  index("idx_sk_subcategory").on(table.subcategory),
  index("idx_sk_topic").on(table.topic),
  index("idx_sk_access_count").on(table.accessCount),
]);

export const simplicityFeedback = pgTable("simplicity_feedback", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id"),
  sessionId: integer("session_id"),
  rating: integer("rating").notNull(),
  feedbackType: text("feedback_type").notNull().default("thumbs"),
  userComment: text("user_comment"),
  questionTopic: text("question_topic"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_sf_message_id").on(table.messageId),
  index("idx_sf_session_id").on(table.sessionId),
  index("idx_sf_rating").on(table.rating),
]);

export const simplicityLearnedFacts = pgTable("simplicity_learned_facts", {
  id: serial("id").primaryKey(),
  sourceType: text("source_type").notNull(),
  category: text("category").notNull(),
  fact: text("fact").notNull(),
  context: text("context"),
  verificationStatus: text("verification_status").notNull().default("unverified"),
  usefulnessScore: decimal("usefulness_score", { precision: 3, scale: 2 }).default("0.50"),
  timesUsed: integer("times_used").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_slf_source").on(table.sourceType),
  index("idx_slf_category").on(table.category),
  index("idx_slf_verification").on(table.verificationStatus),
]);

export const insertSimplicityKnowledgeSchema = createInsertSchema(simplicityKnowledge).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  accessCount: true,
  lastAccessed: true,
});

export const insertSimplicityFeedbackSchema = createInsertSchema(simplicityFeedback).omit({
  id: true,
  createdAt: true,
});

export const insertSimplicityLearnedFactSchema = createInsertSchema(simplicityLearnedFacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  timesUsed: true,
});

export type SimplicityKnowledge = typeof simplicityKnowledge.$inferSelect;
export type InsertSimplicityKnowledge = z.infer<typeof insertSimplicityKnowledgeSchema>;
export type SimplicityFeedback = typeof simplicityFeedback.$inferSelect;
export type InsertSimplicityFeedback = z.infer<typeof insertSimplicityFeedbackSchema>;
export type SimplicityLearnedFact = typeof simplicityLearnedFacts.$inferSelect;
export type InsertSimplicityLearnedFact = z.infer<typeof insertSimplicityLearnedFactSchema>;

// ==================== AI Email Auto-Responder (Simplicity INTEL) ====================

export const emailConversations = pgTable("email_conversations", {
  id: serial("id").primaryKey(),
  senderEmail: text("sender_email").notNull(),
  senderName: text("sender_name"),
  subject: text("subject").notNull(),
  status: text("status").notNull().default("active"), // active, resolved, flagged, archived
  messageCount: integer("message_count").notNull().default(0),
  lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("IDX_email_conv_sender").on(table.senderEmail),
  index("IDX_email_conv_status").on(table.status),
  index("IDX_email_conv_last_msg").on(table.lastMessageAt),
]);

export const emailMessages = pgTable("email_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  direction: text("direction").notNull(), // inbound, outbound
  fromEmail: text("from_email").notNull(),
  toEmail: text("to_email").notNull(),
  subject: text("subject"),
  bodyText: text("body_text"),
  bodyHtml: text("body_html"),
  aiModel: text("ai_model"), // which model generated the response
  sendgridMessageId: text("sendgrid_message_id"),
  metadata: jsonb("metadata").$type<{
    headers?: Record<string, string>;
    attachments?: { filename: string; type: string; size: number }[];
    processingTimeMs?: number;
    tokensUsed?: number;
  }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("IDX_email_msg_conv").on(table.conversationId),
  index("IDX_email_msg_direction").on(table.direction),
  index("IDX_email_msg_created").on(table.createdAt),
]);

export const emailConversationsRelations = relations(emailConversations, ({ many }) => ({
  messages: many(emailMessages),
}));

export const emailMessagesRelations = relations(emailMessages, ({ one }) => ({
  conversation: one(emailConversations, {
    fields: [emailMessages.conversationId],
    references: [emailConversations.id],
  }),
}));

export const insertEmailConversationSchema = createInsertSchema(emailConversations).omit({
  id: true,
  createdAt: true,
  lastMessageAt: true,
});

export const insertEmailMessageSchema = createInsertSchema(emailMessages).omit({
  id: true,
  createdAt: true,
});

export type EmailConversation = typeof emailConversations.$inferSelect;
export type InsertEmailConversation = z.infer<typeof insertEmailConversationSchema>;
export type EmailMessage = typeof emailMessages.$inferSelect;
export type InsertEmailMessage = z.infer<typeof insertEmailMessageSchema>;

// Calculator Settings - persists custom rates and preferences per user
export const calculatorSettings = pgTable("calculator_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  customSpotPrices: jsonb("custom_spot_prices").default('{}'),
  selectedMetal: text("selected_metal").default('gold'),
  selectedKarat: integer("selected_karat").default(24),
  selectedPurity: decimal("selected_purity").default('99.9'),
  selectedUnit: text("selected_unit").default('grams'),
  priceMode: text("price_mode").default('live'),
  priceType: text("price_type").default('live'),
  customSpotPrice: decimal("custom_spot_price"),
  isTraditionalMode: boolean("is_traditional_mode").default(false),
  customLoanRates: jsonb("custom_loan_rates").default('{}'),
  customSellRates: jsonb("custom_sell_rates").default('{}'),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_calc_settings_user").on(table.userId),
]);

// Calculation History - tracks all calculations for signed-in users
export const calculationHistory = pgTable("calculation_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  metal: text("metal").notNull(),
  karat: text("karat"),
  purity: decimal("purity"),
  weight: decimal("weight").notNull(),
  unit: text("unit").notNull(),
  spotPrice: decimal("spot_price").notNull(),
  meltValue: decimal("melt_value").notNull(),
  priceType: text("price_type").default('live'),
  calculatedAt: timestamp("calculated_at").defaultNow(),
}, (table) => [
  index("idx_calc_history_user").on(table.userId),
  index("idx_calc_history_date").on(table.calculatedAt),
]);

export const insertCalculatorSettingsSchema = createInsertSchema(calculatorSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertCalculationHistorySchema = createInsertSchema(calculationHistory).omit({
  id: true,
  calculatedAt: true,
});

export type CalculatorSettings = typeof calculatorSettings.$inferSelect;
export type InsertCalculatorSettings = z.infer<typeof insertCalculatorSettingsSchema>;
export type CalculationHistory = typeof calculationHistory.$inferSelect;
export type InsertCalculationHistory = z.infer<typeof insertCalculationHistorySchema>;

export const diamondCalculatorSettings = pgTable("diamond_calculator_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  pricingSystem: text("pricing_system").default('ai'),
  labGrownPercentage: decimal("lab_grown_percentage").default('0.5'),
  loanPercentage: decimal("loan_percentage").default('50'),
  wholesalePercentage: decimal("wholesale_percentage").default('50'),
  percentageLocked: boolean("percentage_locked").default(false),
  gridData: jsonb("grid_data").default('{}'),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_diamond_settings_user").on(table.userId),
]);

export const insertDiamondCalculatorSettingsSchema = createInsertSchema(diamondCalculatorSettings).omit({
  id: true,
  updatedAt: true,
});

export type DiamondCalculatorSettings = typeof diamondCalculatorSettings.$inferSelect;
export type InsertDiamondCalculatorSettings = z.infer<typeof insertDiamondCalculatorSettingsSchema>;

export const globalDiamondPrices = pgTable("global_diamond_prices", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  caratBracket: text("carat_bracket").notNull(),
  pricePerCarat: integer("price_per_carat").notNull(),
  typicalGrades: text("typical_grades"),
  source: text("source").default('manual'),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: text("updated_by").default('admin'),
});

export const insertGlobalDiamondPriceSchema = createInsertSchema(globalDiamondPrices).omit({
  id: true,
  updatedAt: true,
});

export type GlobalDiamondPrice = typeof globalDiamondPrices.$inferSelect;
export type InsertGlobalDiamondPrice = z.infer<typeof insertGlobalDiamondPriceSchema>;

export const rapaportPrices = pgTable("rapaport_prices", {
  id: serial("id").primaryKey(),
  shape: text("shape").notNull().default('round'),
  caratRange: text("carat_range").notNull(),
  colorGrade: text("color_grade").notNull(),
  clarityGrade: text("clarity_grade").notNull(),
  price: integer("price").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: text("updated_by").default('admin'),
});

export const insertRapaportPriceSchema = createInsertSchema(rapaportPrices).omit({
  id: true,
  updatedAt: true,
});

export type RapaportPrice = typeof rapaportPrices.$inferSelect;
export type InsertRapaportPrice = z.infer<typeof insertRapaportPriceSchema>;

// ═══════════════════════════════════════════════════════════════
// SIMPLICITY MEMORY PROTOCOL — Persistent User Intelligence
// ═══════════════════════════════════════════════════════════════

export const userMemories = pgTable("user_memories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  category: text("category").notNull().default("facts"),
  memoryKey: text("memory_key").notNull(),
  memoryValue: text("memory_value").notNull(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }).notNull().default("0.85"),
  timesReinforced: integer("times_reinforced").notNull().default(1),
  lastReinforced: timestamp("last_reinforced").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_um_user_id").on(table.userId),
  index("idx_um_category").on(table.category),
]);

export const insertUserMemorySchema = createInsertSchema(userMemories).omit({
  id: true,
  createdAt: true,
  lastReinforced: true,
  timesReinforced: true,
});

export type UserMemory = typeof userMemories.$inferSelect;
export type InsertUserMemory = z.infer<typeof insertUserMemorySchema>;

// ═══════════════════════════════════════════════════════════════
// REVENUE ROADMAP — Phase Tracking & Notifications
// ═══════════════════════════════════════════════════════════════

export const revenuePhases = pgTable("revenue_phases", {
  id: serial("id").primaryKey(),
  phaseNumber: integer("phase_number").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  revenueTarget: integer("revenue_target").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull().default("upcoming"),
  actualRevenue: integer("actual_revenue").notNull().default(0),
  notifiedStart: boolean("notified_start").notNull().default(false),
  notifiedEnd: boolean("notified_end").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRevenuePhaseSchema = createInsertSchema(revenuePhases).omit({
  id: true,
  createdAt: true,
});

export type RevenuePhase = typeof revenuePhases.$inferSelect;
export type InsertRevenuePhase = z.infer<typeof insertRevenuePhaseSchema>;

// ═══════════════════════════════════════════════════════════════
// DOCUMENT PURCHASES — Per-Document Payment Tracking
// ═══════════════════════════════════════════════════════════════

export const documentPurchases = pgTable("document_purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  documentType: text("document_type").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("usd"),
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  status: text("status").notNull().default("pending"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDocumentPurchaseSchema = createInsertSchema(documentPurchases).omit({
  id: true,
  createdAt: true,
});

export type DocumentPurchase = typeof documentPurchases.$inferSelect;
export type InsertDocumentPurchase = z.infer<typeof insertDocumentPurchaseSchema>;

// ═══════════════════════════════════════════════════════════════
// DAILY USAGE — Free Tier Limit Enforcement
// ═══════════════════════════════════════════════════════════════

export const dailyUsage = pgTable("daily_usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  usageDate: text("usage_date").notNull(),
  aiLookups: integer("ai_lookups").notNull().default(0),
  calculations: integer("calculations").notNull().default(0),
  documentsGenerated: integer("documents_generated").notNull().default(0),
}, (table) => [
  index("idx_daily_usage_user_date").on(table.userId, table.usageDate),
]);

export const insertDailyUsageSchema = createInsertSchema(dailyUsage).omit({
  id: true,
});

export type DailyUsage = typeof dailyUsage.$inferSelect;
export type InsertDailyUsage = z.infer<typeof insertDailyUsageSchema>;

// ═══════════════════════════════════════════════════════════════
// SIMPLETON'S LIST — Vetted Dealer/Pawn Shop Directory
// ═══════════════════════════════════════════════════════════════

export const listedBusinesses = pgTable("listed_businesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  phone: text("phone"),
  website: text("website"),
  hours: text("hours"),
  category: text("category").notNull(),
  status: text("status").notNull().default("pending"),
  googleRating: text("google_rating"),
  googleReviewCount: integer("google_review_count"),
  simpletonVerified: boolean("simpleton_verified").default(false),
  googlePlaceId: text("google_place_id"),
  lastGoogleSync: timestamp("last_google_sync"),
  approvalDate: timestamp("approval_date"),
  addedBy: integer("added_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_business_city_state").on(table.city, table.state),
  index("idx_business_zip").on(table.zip),
  index("idx_business_status").on(table.status),
]);

export const insertListedBusinessSchema = createInsertSchema(listedBusinesses).omit({
  id: true,
  createdAt: true,
  approvalDate: true,
});

export type ListedBusiness = typeof listedBusinesses.$inferSelect;
export type InsertListedBusiness = z.infer<typeof insertListedBusinessSchema>;

export const businessReviews = pgTable("business_reviews", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  userId: integer("user_id").notNull(),
  rating: integer("rating").notNull(),
  reviewText: text("review_text").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_review_business").on(table.businessId),
]);

export const insertBusinessReviewSchema = createInsertSchema(businessReviews).omit({
  id: true,
  createdAt: true,
});

export type BusinessReview = typeof businessReviews.$inferSelect;
export type InsertBusinessReview = z.infer<typeof insertBusinessReviewSchema>;

export const businessComplaints = pgTable("business_complaints", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  userId: integer("user_id").notNull(),
  complaintText: text("complaint_text").notNull(),
  severity: text("severity").notNull().default("low"),
  investigationStatus: text("investigation_status").notNull().default("pending"),
  resolutionNotes: text("resolution_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
}, (table) => [
  index("idx_complaint_business").on(table.businessId),
  index("idx_complaint_status").on(table.investigationStatus),
]);

export const insertBusinessComplaintSchema = createInsertSchema(businessComplaints).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

export type BusinessComplaint = typeof businessComplaints.$inferSelect;
export type InsertBusinessComplaint = z.infer<typeof insertBusinessComplaintSchema>;

export const siteVisitors = pgTable("site_visitors", {
  id: serial("id").primaryKey(),
  fingerprint: text("fingerprint"),
  ipAddress: text("ip_address"),
  city: text("city"),
  region: text("region"),
  country: text("country"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  userAgent: text("user_agent"),
  browser: text("browser"),
  os: text("os"),
  device: text("device"),
  referrer: text("referrer"),
  landingPage: text("landing_page"),
  userId: integer("user_id"),
  email: text("email"),
  visitCount: integer("visit_count").notNull().default(1),
  lastVisitAt: timestamp("last_visit_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_sv_ip").on(table.ipAddress),
  index("idx_sv_uid").on(table.userId),
  index("idx_sv_fp").on(table.fingerprint),
]);

export type SiteVisitor = typeof siteVisitors.$inferSelect;

export const ghostConversations = pgTable("ghost_conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("New Conversation"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const ghostMessages = pgTable("ghost_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_gm_conv").on(table.conversationId),
]);

export type GhostConversation = typeof ghostConversations.$inferSelect;
export type GhostMessage = typeof ghostMessages.$inferSelect;

export const priceAlerts = pgTable("price_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  assetType: text("asset_type").notNull(),
  assetName: text("asset_name").notNull(),
  targetPrice: decimal("target_price", { precision: 12, scale: 2 }).notNull(),
  direction: text("direction").notNull().default("above"),
  status: text("status").notNull().default("active"),
  priceAtCreation: decimal("price_at_creation", { precision: 12, scale: 2 }),
  triggeredAt: timestamp("triggered_at"),
  triggeredPrice: decimal("triggered_price", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_pa_user").on(table.userId),
  index("idx_pa_status").on(table.status),
]);

export const insertPriceAlertSchema = createInsertSchema(priceAlerts).omit({ id: true, triggeredAt: true, triggeredPrice: true, createdAt: true });
export type InsertPriceAlert = z.infer<typeof insertPriceAlertSchema>;
export type PriceAlert = typeof priceAlerts.$inferSelect;

export const marketTransactions = pgTable("market_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  itemType: text("item_type").notNull(),
  specs: jsonb("specs"),
  appraisedPrice: decimal("appraised_price", { precision: 12, scale: 2 }),
  actualPrice: decimal("actual_price", { precision: 12, scale: 2 }).notNull(),
  region: text("region"),
  dealerId: text("dealer_id"),
  notes: text("notes"),
  confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }),
  verificationMethod: text("verification_method"),
  verificationNotes: text("verification_notes"),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_mt_type").on(table.itemType),
  index("idx_mt_user").on(table.userId),
]);

export const insertMarketTransactionSchema = createInsertSchema(marketTransactions).omit({ id: true, createdAt: true });
export type InsertMarketTransaction = z.infer<typeof insertMarketTransactionSchema>;
export type MarketTransaction = typeof marketTransactions.$inferSelect;

export const marketPredictions = pgTable("market_predictions", {
  id: serial("id").primaryKey(),
  itemType: text("item_type").notNull(),
  itemSpecs: jsonb("item_specs"),
  predictedPrice: decimal("predicted_price", { precision: 12, scale: 2 }).notNull(),
  confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }).notNull(),
  predictionDate: timestamp("prediction_date").notNull().defaultNow(),
  targetDate: timestamp("target_date").notNull(),
  actualPrice: decimal("actual_price", { precision: 12, scale: 2 }),
  accuracy: decimal("accuracy", { precision: 5, scale: 4 }),
  modelVersion: text("model_version").default("memory-engine-v1"),
  featuresUsed: jsonb("features_used"),
  reasoning: text("reasoning"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_pred_item").on(table.itemType, table.predictionDate),
  index("idx_pred_accuracy").on(table.accuracy),
]);

export const insertMarketPredictionSchema = createInsertSchema(marketPredictions).omit({ id: true, actualPrice: true, accuracy: true, createdAt: true });
export type InsertMarketPrediction = z.infer<typeof insertMarketPredictionSchema>;
export type MarketPrediction = typeof marketPredictions.$inferSelect;

export const simpletonIndex = pgTable("simpleton_index", {
  id: serial("id").primaryKey(),
  assetType: text("asset_type").notNull(),
  indexDate: timestamp("index_date").notNull().defaultNow(),
  spotPrice: decimal("spot_price", { precision: 12, scale: 2 }).notNull(),
  simpletonPrice: decimal("simpleton_price", { precision: 12, scale: 2 }).notNull(),
  premium: decimal("premium", { precision: 8, scale: 2 }),
  transactionCount: integer("transaction_count").default(0),
  participantCount: integer("participant_count").default(0),
  trend: text("trend"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_si_asset_date").on(table.assetType, table.indexDate),
]);

export const insertSimpletonIndexSchema = createInsertSchema(simpletonIndex).omit({ id: true, createdAt: true });
export type InsertSimpletonIndex = z.infer<typeof insertSimpletonIndexSchema>;
export type SimpletonIndex = typeof simpletonIndex.$inferSelect;

export const appraisals = pgTable("appraisals", {
  id: serial("id").primaryKey(),
  appraisalNumber: text("appraisal_number").notNull().unique(),
  shareToken: text("share_token").notNull().unique(),
  status: text("status").notNull().default("pending"),
  itemCategory: text("item_category").notNull().default("jewelry"),
  itemDescription: text("item_description").notNull(),
  retailValue: text("retail_value"),
  itemImages: jsonb("item_images").default([]),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerAddress: text("customer_address"),
  customerCityStateZip: text("customer_city_state_zip"),
  appraisalDate: text("appraisal_date"),
  certifiedBy: text("certified_by"),
  certificationNotes: text("certification_notes"),
  certifiedAt: timestamp("certified_at"),
  aiAssessment: text("ai_assessment"),
  itemSpecs: jsonb("item_specs").default({}),
  templateStyle: text("template_style").default("classic"),
  zoomRequested: boolean("zoom_requested").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_appraisal_number").on(table.appraisalNumber),
  index("idx_appraisal_token").on(table.shareToken),
  index("idx_appraisal_email").on(table.customerEmail),
  index("idx_appraisal_status").on(table.status),
]);

export const insertAppraisalSchema = createInsertSchema(appraisals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  certifiedAt: true,
});
export type Appraisal = typeof appraisals.$inferSelect;
export type InsertAppraisal = z.infer<typeof insertAppraisalSchema>;

export const appraisalCounter = pgTable("appraisal_counter", {
  id: serial("id").primaryKey(),
  lastNumber: integer("last_number").notNull().default(0),
});

export * from "./models/chat";


// ============================================
// SIMPLICITY COLLECTIVE INTELLIGENCE
// Anonymized knowledge learned from ALL user interactions
// Private details stay in userMemories; only problem/solution knowledge lives here
// ============================================

export const collectiveInsights = pgTable("collective_insights", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // e.g. "diamond_grading", "gold_testing", "rolex_auth", "coin_grading", "troubleshooting"
  topic: text("topic").notNull(), // e.g. "fake_rolex_serial_detection"
  problem: text("problem").notNull(), // The question/problem pattern (anonymized)
  solution: text("solution").notNull(), // The answer/solution that worked
  tags: text("tags").array().default([]),
  timesHelpful: integer("times_helpful").notNull().default(1),
  totalInteractions: integer("total_interactions").notNull().default(1),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0.80"),
  regionsSeen: text("regions_seen").array().default([]), // anonymized geographic spread
  verificationStatus: text("verification_status").notNull().default("learned"), // learned, verified, expert_confirmed
  sourceConversationCount: integer("source_conversation_count").notNull().default(1),
  lastReinforced: timestamp("last_reinforced").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const conversationSessions = pgTable("conversation_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id), // null for anonymous
  sessionToken: text("session_token").notNull(),
  title: text("title"), // auto-generated conversation title
  summary: text("summary"), // brief summary of conversation
  messageCount: integer("message_count").notNull().default(0),
  lastActiveAt: timestamp("last_active_at").notNull().defaultNow(),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
