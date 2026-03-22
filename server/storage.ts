import {
  users,
  coins,
  pricingData,
  articles,
  discussions,
  replies,
  portfolios,
  portfolioItems,
  communityPosts,
  communityPostReplies,
  supportTickets,
  supportTicketResponses,
  exportTemplates,
  exportJobs,
  scheduledExports,
  teamMembers,
  organizationRoles,
  activityLogs,
  organizationSettings,
  type User,
  type InsertUser,
  type Coin,
  type InsertCoin,
  type PricingData,
  type Article,
  type InsertArticle,
  type Discussion,
  type InsertDiscussion,
  type Reply,
  type InsertReply,
  type Portfolio,
  type InsertPortfolio,
  type PortfolioItem,
  type InsertPortfolioItem,
  type CommunityPost,
  type InsertCommunityPost,
  type CommunityPostReply,
  type InsertCommunityPostReply,
  type SupportTicket,
  type InsertSupportTicket,
  type SupportTicketResponse,
  type InsertSupportTicketResponse,
  type ExportTemplate,
  type InsertExportTemplate,
  type ExportJob,
  type InsertExportJob,
  type ScheduledExport,
  type InsertScheduledExport,
  type TeamMember,
  type InsertTeamMember,
  type OrganizationRole,
  type InsertOrganizationRole,
  type ActivityLog,
  type InsertActivityLog,
  type OrganizationSettings,
  type InsertOrganizationSettings,
  assistantSessions,
  assistantMessages,
  type AssistantSession,
  type InsertAssistantSession,
  type AssistantMessage,
  type InsertAssistantMessage,
  simplicityKnowledge,
  simplicityFeedback,
  simplicityLearnedFacts,
  type SimplicityKnowledge,
  type InsertSimplicityKnowledge,
  type SimplicityFeedback,
  type InsertSimplicityFeedback,
  type SimplicityLearnedFact,
  type InsertSimplicityLearnedFact,
  priceAlerts,
  marketTransactions,
  marketPredictions,
  simpletonIndex,
  type PriceAlert,
  type InsertPriceAlert,
  type MarketTransaction,
  type InsertMarketTransaction,
  type MarketPrediction,
  type InsertMarketPrediction,
  type SimpletonIndex,
  type InsertSimpletonIndex,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByProvider(provider: string, providerId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Coins
  getCoins(filters?: { type?: string; yearStart?: number; yearEnd?: number; search?: string }): Promise<Coin[]>;
  getCoin(id: number): Promise<Coin | undefined>;
  createCoin(coin: InsertCoin): Promise<Coin>;
  
  // Pricing
  getLatestPricing(): Promise<PricingData[]>;
  getPricingByMetal(metal: string): Promise<PricingData[]>;
  createPricingData(data: Omit<PricingData, 'id'>): Promise<PricingData>;
  
  // Articles
  getArticles(category?: string): Promise<Article[]>;
  getArticle(id: number): Promise<Article | undefined>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  
  // Discussions
  getDiscussions(category?: string): Promise<Discussion[]>;
  getDiscussion(id: number): Promise<Discussion | undefined>;
  createDiscussion(discussion: InsertDiscussion): Promise<Discussion>;
  
  // Replies
  getRepliesByDiscussion(discussionId: number): Promise<Reply[]>;
  createReply(reply: InsertReply): Promise<Reply>;
  
  // Portfolios
  getUserPortfolios(userId: number): Promise<Portfolio[]>;
  getPortfolio(id: number): Promise<Portfolio | undefined>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  
  // Portfolio Items
  getPortfolioItems(portfolioId: number): Promise<PortfolioItem[]>;
  createPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem>;
  
  // Community Support System
  // Community Posts
  getCommunityPosts(category?: string): Promise<CommunityPost[]>;
  getCommunityPost(id: number): Promise<CommunityPost | undefined>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  updateCommunityPost(id: number, post: Partial<InsertCommunityPost>): Promise<CommunityPost | undefined>;
  
  // Community Post Replies
  getCommunityPostReplies(postId: number): Promise<CommunityPostReply[]>;
  createCommunityPostReply(reply: InsertCommunityPostReply): Promise<CommunityPostReply>;
  
  // Support Tickets
  getSupportTickets(userId?: number, status?: string): Promise<SupportTicket[]>;
  getSupportTicket(id: number): Promise<SupportTicket | undefined>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: number, ticket: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined>;
  
  // Support Ticket Responses
  getSupportTicketResponses(ticketId: number): Promise<SupportTicketResponse[]>;
  createSupportTicketResponse(response: InsertSupportTicketResponse): Promise<SupportTicketResponse>;
  
  // Export Center
  // Export Templates
  getExportTemplates(category?: string): Promise<ExportTemplate[]>;
  getExportTemplate(id: number): Promise<ExportTemplate | undefined>;
  createExportTemplate(template: InsertExportTemplate): Promise<ExportTemplate>;
  
  // Export Jobs
  getExportJobs(userId: number, status?: string): Promise<ExportJob[]>;
  getExportJob(id: number): Promise<ExportJob | undefined>;
  createExportJob(job: InsertExportJob): Promise<ExportJob>;
  updateExportJob(id: number, job: Partial<InsertExportJob>): Promise<ExportJob | undefined>;
  
  // Scheduled Exports
  getScheduledExports(userId: number): Promise<ScheduledExport[]>;
  getScheduledExport(id: number): Promise<ScheduledExport | undefined>;
  createScheduledExport(scheduledExport: InsertScheduledExport): Promise<ScheduledExport>;
  updateScheduledExport(id: number, scheduledExportData: Partial<InsertScheduledExport>): Promise<ScheduledExport | undefined>;
  
  // Multi-User Management
  // Team Members
  getTeamMembers(organizationId: number): Promise<TeamMember[]>;
  getTeamMember(id: number): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: number, member: Partial<InsertTeamMember>): Promise<TeamMember | undefined>;
  
  // Organization Roles
  getOrganizationRoles(organizationId: number): Promise<OrganizationRole[]>;
  createOrganizationRole(role: InsertOrganizationRole): Promise<OrganizationRole>;
  
  // Activity Logs
  getActivityLogs(organizationId: number, limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  
  // Organization Settings
  getOrganizationSettings(organizationId: number): Promise<OrganizationSettings | undefined>;
  createOrganizationSettings(settings: InsertOrganizationSettings): Promise<OrganizationSettings>;
  updateOrganizationSettings(organizationId: number, settings: Partial<InsertOrganizationSettings>): Promise<OrganizationSettings | undefined>;
  
  // Database Count Methods for Storage Stats
  getUserCount(): Promise<number>;
  getCoinCount(): Promise<number>;
  getArticleCount(): Promise<number>;
  getDiscussionCount(): Promise<number>;
  getPortfolioCount(): Promise<number>;
  getCommunityPostCount(): Promise<number>;
  getSupportTicketCount(): Promise<number>;

  // Simplicity AI Memory System
  getOrCreateAssistantSession(sessionToken: string): Promise<AssistantSession>;
  getAssistantSession(sessionToken: string): Promise<AssistantSession | undefined>;
  updateAssistantSession(id: number, data: Partial<InsertAssistantSession>): Promise<AssistantSession | undefined>;
  saveAssistantMessage(message: InsertAssistantMessage): Promise<AssistantMessage>;
  getAssistantMessages(sessionId: number, limit?: number): Promise<AssistantMessage[]>;
  updateSessionActivity(sessionId: number, page?: string): Promise<void>;

  // Simplicity Knowledge Base & Learning
  searchKnowledge(query: string, category?: string, limit?: number): Promise<SimplicityKnowledge[]>;
  saveFeedback(feedback: InsertSimplicityFeedback): Promise<SimplicityFeedback>;
  saveLearnedFact(fact: InsertSimplicityLearnedFact): Promise<SimplicityLearnedFact>;
  incrementKnowledgeAccess(knowledgeIds: number[]): Promise<void>;
  getKnowledgeStats(): Promise<{ totalEntries: number; totalFeedback: number; totalFacts: number; avgRating: number }>;

  // Price Alerts
  createPriceAlert(alert: InsertPriceAlert): Promise<PriceAlert>;
  getPriceAlerts(userId: number, status?: string): Promise<PriceAlert[]>;
  getActivePriceAlerts(): Promise<PriceAlert[]>;
  updatePriceAlert(id: number, data: Partial<PriceAlert>): Promise<PriceAlert | undefined>;
  deletePriceAlert(id: number): Promise<void>;

  // Market Transactions
  createMarketTransaction(tx: InsertMarketTransaction): Promise<MarketTransaction>;
  getMarketTransactions(itemType?: string, days?: number): Promise<MarketTransaction[]>;
  getTransactionStats(itemType: string, specs?: any): Promise<{ avgPrice: number; count: number; minPrice: number; maxPrice: number }>;

  createPrediction(prediction: InsertMarketPrediction): Promise<MarketPrediction>;
  getPredictions(itemType: string, limit?: number): Promise<MarketPrediction[]>;
  getPendingPredictions(): Promise<MarketPrediction[]>;
  updatePrediction(id: number, data: Partial<MarketPrediction>): Promise<MarketPrediction | undefined>;
  getPredictionAccuracy(itemType?: string): Promise<{ avgAccuracy: number; count: number; byType: Record<string, { avg: number; count: number }> }>;

  createIndexEntry(entry: InsertSimpletonIndex): Promise<SimpletonIndex>;
  getLatestIndex(assetType: string): Promise<SimpletonIndex | undefined>;
  getIndexHistory(assetType: string, days?: number): Promise<SimpletonIndex[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByProvider(provider: string, providerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users)
      .where(and(eq(users.provider, provider), eq(users.providerId, providerId)));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getCoins(filters?: { type?: string; yearStart?: number; yearEnd?: number; search?: string }): Promise<Coin[]> {
    let query = db.select().from(coins);
    
    if (filters) {
      const conditions = [];
      if (filters.type) conditions.push(eq(coins.type, filters.type));
      if (filters.yearStart) conditions.push(gte(coins.yearStart, filters.yearStart));
      if (filters.yearEnd) conditions.push(lte(coins.yearEnd || coins.yearStart, filters.yearEnd));
      if (filters.search) conditions.push(like(coins.name, `%${filters.search}%`));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
    }
    
    return await query.orderBy(coins.name);
  }

  async getCoin(id: number): Promise<Coin | undefined> {
    const [coin] = await db.select().from(coins).where(eq(coins.id, id));
    return coin || undefined;
  }

  async createCoin(coin: InsertCoin): Promise<Coin> {
    const [newCoin] = await db.insert(coins).values(coin).returning();
    return newCoin;
  }

  async getLatestPricing(): Promise<PricingData[]> {
    return await db
      .select()
      .from(pricingData)
      .orderBy(desc(pricingData.timestamp))
      .limit(4); // Latest price for each metal
  }

  async getPricingByMetal(metal: string): Promise<PricingData[]> {
    return await db
      .select()
      .from(pricingData)
      .where(eq(pricingData.metal, metal))
      .orderBy(desc(pricingData.timestamp))
      .limit(24); // Last 24 hours
  }

  async createPricingData(data: Omit<PricingData, 'id'>): Promise<PricingData> {
    const [newData] = await db.insert(pricingData).values(data).returning();
    return newData;
  }

  async getArticles(category?: string): Promise<Article[]> {
    if (category) {
      return await db
        .select()
        .from(articles)
        .where(and(eq(articles.isPublished, true), eq(articles.category, category)))
        .orderBy(desc(articles.publishedAt));
    }
    
    return await db
      .select()
      .from(articles)
      .where(eq(articles.isPublished, true))
      .orderBy(desc(articles.publishedAt));
  }

  async getArticle(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article || undefined;
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.slug, slug));
    return article || undefined;
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const [newArticle] = await db.insert(articles).values(article).returning();
    return newArticle;
  }

  async getDiscussions(category?: string): Promise<Discussion[]> {
    if (category) {
      return await db
        .select()
        .from(discussions)
        .where(eq(discussions.category, category))
        .orderBy(desc(discussions.updatedAt));
    }
    
    return await db
      .select()
      .from(discussions)
      .orderBy(desc(discussions.updatedAt));
  }

  async getDiscussion(id: number): Promise<Discussion | undefined> {
    const [discussion] = await db.select().from(discussions).where(eq(discussions.id, id));
    return discussion || undefined;
  }

  async createDiscussion(discussion: InsertDiscussion): Promise<Discussion> {
    const [newDiscussion] = await db.insert(discussions).values(discussion).returning();
    return newDiscussion;
  }

  async getRepliesByDiscussion(discussionId: number): Promise<Reply[]> {
    return await db
      .select()
      .from(replies)
      .where(eq(replies.discussionId, discussionId))
      .orderBy(replies.createdAt);
  }

  async createReply(reply: InsertReply): Promise<Reply> {
    const [newReply] = await db.insert(replies).values(reply).returning();
    return newReply;
  }

  async getUserPortfolios(userId: number): Promise<Portfolio[]> {
    return await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.userId, userId))
      .orderBy(desc(portfolios.createdAt));
  }

  async getPortfolio(id: number): Promise<Portfolio | undefined> {
    const [portfolio] = await db.select().from(portfolios).where(eq(portfolios.id, id));
    return portfolio || undefined;
  }

  async createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio> {
    const [newPortfolio] = await db.insert(portfolios).values(portfolio).returning();
    return newPortfolio;
  }

  async getPortfolioItems(portfolioId: number): Promise<PortfolioItem[]> {
    return await db
      .select()
      .from(portfolioItems)
      .where(eq(portfolioItems.portfolioId, portfolioId))
      .orderBy(portfolioItems.createdAt);
  }

  async createPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem> {
    const [newItem] = await db.insert(portfolioItems).values(item).returning();
    return newItem;
  }

  // Community Support System Implementation
  async getCommunityPosts(category?: string): Promise<CommunityPost[]> {
    if (category) {
      return await db
        .select()
        .from(communityPosts)
        .where(eq(communityPosts.category, category))
        .orderBy(desc(communityPosts.createdAt));
    }
    
    return await db
      .select()
      .from(communityPosts)
      .orderBy(desc(communityPosts.createdAt));
  }

  async getCommunityPost(id: number): Promise<CommunityPost | undefined> {
    const [post] = await db.select().from(communityPosts).where(eq(communityPosts.id, id));
    return post || undefined;
  }

  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const [newPost] = await db.insert(communityPosts).values(post).returning();
    return newPost;
  }

  async updateCommunityPost(id: number, postData: Partial<InsertCommunityPost>): Promise<CommunityPost | undefined> {
    const [post] = await db.update(communityPosts)
      .set({ ...postData, updatedAt: new Date() })
      .where(eq(communityPosts.id, id))
      .returning();
    return post || undefined;
  }

  async getCommunityPostReplies(postId: number): Promise<CommunityPostReply[]> {
    return await db
      .select()
      .from(communityPostReplies)
      .where(eq(communityPostReplies.postId, postId))
      .orderBy(communityPostReplies.createdAt);
  }

  async createCommunityPostReply(reply: InsertCommunityPostReply): Promise<CommunityPostReply> {
    const [newReply] = await db.insert(communityPostReplies).values(reply).returning();
    return newReply;
  }

  async getSupportTickets(userId?: number, status?: string): Promise<SupportTicket[]> {
    if (userId && status) {
      return await db
        .select()
        .from(supportTickets)
        .where(and(eq(supportTickets.userId, userId), eq(supportTickets.status, status)))
        .orderBy(desc(supportTickets.createdAt));
    } else if (userId) {
      return await db
        .select()
        .from(supportTickets)
        .where(eq(supportTickets.userId, userId))
        .orderBy(desc(supportTickets.createdAt));
    } else if (status) {
      return await db
        .select()
        .from(supportTickets)
        .where(eq(supportTickets.status, status))
        .orderBy(desc(supportTickets.createdAt));
    }
    
    return await db
      .select()
      .from(supportTickets)
      .orderBy(desc(supportTickets.createdAt));
  }

  async getSupportTicket(id: number): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, id));
    return ticket || undefined;
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const [newTicket] = await db.insert(supportTickets).values(ticket).returning();
    return newTicket;
  }

  async updateSupportTicket(id: number, ticketData: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined> {
    const [ticket] = await db.update(supportTickets)
      .set({ ...ticketData, updatedAt: new Date() })
      .where(eq(supportTickets.id, id))
      .returning();
    return ticket || undefined;
  }

  async getSupportTicketResponses(ticketId: number): Promise<SupportTicketResponse[]> {
    return await db
      .select()
      .from(supportTicketResponses)
      .where(eq(supportTicketResponses.ticketId, ticketId))
      .orderBy(supportTicketResponses.createdAt);
  }

  async createSupportTicketResponse(response: InsertSupportTicketResponse): Promise<SupportTicketResponse> {
    const [newResponse] = await db.insert(supportTicketResponses).values(response).returning();
    return newResponse;
  }

  // Export Center Implementation
  async getExportTemplates(category?: string): Promise<ExportTemplate[]> {
    if (category) {
      return await db
        .select()
        .from(exportTemplates)
        .where(and(eq(exportTemplates.isActive, true), eq(exportTemplates.category, category)))
        .orderBy(exportTemplates.name);
    }
    
    return await db
      .select()
      .from(exportTemplates)
      .where(eq(exportTemplates.isActive, true))
      .orderBy(exportTemplates.name);
  }

  async getExportTemplate(id: number): Promise<ExportTemplate | undefined> {
    const [template] = await db.select().from(exportTemplates).where(eq(exportTemplates.id, id));
    return template || undefined;
  }

  async createExportTemplate(template: InsertExportTemplate): Promise<ExportTemplate> {
    const [newTemplate] = await db.insert(exportTemplates).values(template).returning();
    return newTemplate;
  }

  async getExportJobs(userId: number, status?: string): Promise<ExportJob[]> {
    if (status) {
      return await db
        .select()
        .from(exportJobs)
        .where(and(eq(exportJobs.userId, userId), eq(exportJobs.status, status)))
        .orderBy(desc(exportJobs.createdAt));
    }
    
    return await db
      .select()
      .from(exportJobs)
      .where(eq(exportJobs.userId, userId))
      .orderBy(desc(exportJobs.createdAt));
  }

  async getExportJob(id: number): Promise<ExportJob | undefined> {
    const [job] = await db.select().from(exportJobs).where(eq(exportJobs.id, id));
    return job || undefined;
  }

  async createExportJob(job: InsertExportJob): Promise<ExportJob> {
    const [newJob] = await db.insert(exportJobs).values(job).returning();
    return newJob;
  }

  async updateExportJob(id: number, jobData: Partial<InsertExportJob>): Promise<ExportJob | undefined> {
    const [job] = await db.update(exportJobs)
      .set(jobData)
      .where(eq(exportJobs.id, id))
      .returning();
    return job || undefined;
  }

  async getScheduledExports(userId: number): Promise<ScheduledExport[]> {
    return await db
      .select()
      .from(scheduledExports)
      .where(eq(scheduledExports.userId, userId))
      .orderBy(scheduledExports.nextRun);
  }

  async getScheduledExport(id: number): Promise<ScheduledExport | undefined> {
    const [scheduledExport] = await db.select().from(scheduledExports).where(eq(scheduledExports.id, id));
    return scheduledExport || undefined;
  }

  async createScheduledExport(scheduledExportData: InsertScheduledExport): Promise<ScheduledExport> {
    const [newExport] = await db.insert(scheduledExports).values(scheduledExportData).returning();
    return newExport;
  }

  async updateScheduledExport(id: number, exportData: Partial<InsertScheduledExport>): Promise<ScheduledExport | undefined> {
    const [scheduledExport] = await db.update(scheduledExports)
      .set({ ...exportData, updatedAt: new Date() })
      .where(eq(scheduledExports.id, id))
      .returning();
    return scheduledExport || undefined;
  }

  // Multi-User Management Implementation
  async getTeamMembers(organizationId: number): Promise<TeamMember[]> {
    return await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.organizationId, organizationId))
      .orderBy(teamMembers.createdAt);
  }

  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    const [member] = await db.select().from(teamMembers).where(eq(teamMembers.id, id));
    return member || undefined;
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const [newMember] = await db.insert(teamMembers).values(member).returning();
    return newMember;
  }

  async updateTeamMember(id: number, memberData: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    const [member] = await db.update(teamMembers)
      .set({ ...memberData, updatedAt: new Date() })
      .where(eq(teamMembers.id, id))
      .returning();
    return member || undefined;
  }

  async getOrganizationRoles(organizationId: number): Promise<OrganizationRole[]> {
    return await db
      .select()
      .from(organizationRoles)
      .where(and(eq(organizationRoles.organizationId, organizationId), eq(organizationRoles.isActive, true)))
      .orderBy(organizationRoles.level);
  }

  async createOrganizationRole(role: InsertOrganizationRole): Promise<OrganizationRole> {
    const [newRole] = await db.insert(organizationRoles).values(role).returning();
    return newRole;
  }

  async getActivityLogs(organizationId: number, limit?: number): Promise<ActivityLog[]> {
    if (limit) {
      return await db
        .select()
        .from(activityLogs)
        .where(eq(activityLogs.organizationId, organizationId))
        .orderBy(desc(activityLogs.timestamp))
        .limit(limit);
    }
    
    return await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.organizationId, organizationId))
      .orderBy(desc(activityLogs.timestamp));
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [newLog] = await db.insert(activityLogs).values(log).returning();
    return newLog;
  }

  async getOrganizationSettings(organizationId: number): Promise<OrganizationSettings | undefined> {
    const [settings] = await db
      .select()
      .from(organizationSettings)
      .where(eq(organizationSettings.organizationId, organizationId));
    return settings || undefined;
  }

  async createOrganizationSettings(settings: InsertOrganizationSettings): Promise<OrganizationSettings> {
    const [newSettings] = await db.insert(organizationSettings).values(settings).returning();
    return newSettings;
  }

  async updateOrganizationSettings(organizationId: number, settingsData: Partial<InsertOrganizationSettings>): Promise<OrganizationSettings | undefined> {
    const [settings] = await db.update(organizationSettings)
      .set({ ...settingsData, updatedAt: new Date() })
      .where(eq(organizationSettings.organizationId, organizationId))
      .returning();
    return settings || undefined;
  }

  // Database Count Methods for Storage Stats
  async getUserCount(): Promise<number> {
    const result = await db.select().from(users);
    return result.length;
  }

  async getCoinCount(): Promise<number> {
    const result = await db.select().from(coins);
    return result.length;
  }

  async getArticleCount(): Promise<number> {
    const result = await db.select().from(articles);
    return result.length;
  }

  async getDiscussionCount(): Promise<number> {
    const result = await db.select().from(discussions);
    return result.length;
  }

  async getPortfolioCount(): Promise<number> {
    const result = await db.select().from(portfolios);
    return result.length;
  }

  async getCommunityPostCount(): Promise<number> {
    const result = await db.select().from(communityPosts);
    return result.length;
  }

  async getSupportTicketCount(): Promise<number> {
    const result = await db.select().from(supportTickets);
    return result.length;
  }

  async getOrCreateAssistantSession(sessionToken: string): Promise<AssistantSession> {
    const [existing] = await db.select().from(assistantSessions)
      .where(eq(assistantSessions.sessionToken, sessionToken));
    if (existing) return existing;
    const [created] = await db.insert(assistantSessions)
      .values({ sessionToken, messageCount: 0 })
      .returning();
    return created;
  }

  async getAssistantSession(sessionToken: string): Promise<AssistantSession | undefined> {
    const [session] = await db.select().from(assistantSessions)
      .where(eq(assistantSessions.sessionToken, sessionToken));
    return session || undefined;
  }

  async updateAssistantSession(id: number, data: Partial<InsertAssistantSession>): Promise<AssistantSession | undefined> {
    const updatePayload: any = { ...data, lastActiveAt: new Date() };
    const [updated] = await db.update(assistantSessions)
      .set(updatePayload)
      .where(eq(assistantSessions.id, id))
      .returning();
    return updated || undefined;
  }

  async saveAssistantMessage(message: InsertAssistantMessage): Promise<AssistantMessage> {
    const [saved] = await db.insert(assistantMessages)
      .values(message as any)
      .returning();
    await db.update(assistantSessions)
      .set({
        messageCount: sql`${assistantSessions.messageCount} + 1`,
        lastActiveAt: new Date(),
      })
      .where(eq(assistantSessions.id, message.sessionId));
    return saved;
  }

  async getAssistantMessages(sessionId: number, limit: number = 20): Promise<AssistantMessage[]> {
    const messages = await db.select().from(assistantMessages)
      .where(eq(assistantMessages.sessionId, sessionId))
      .orderBy(desc(assistantMessages.createdAt))
      .limit(limit);
    return messages.reverse();
  }

  async updateSessionActivity(sessionId: number, page?: string): Promise<void> {
    const updateData: Record<string, any> = { lastActiveAt: new Date() };
    if (page) updateData.lastPage = page;
    await db.update(assistantSessions)
      .set(updateData)
      .where(eq(assistantSessions.id, sessionId));
  }

  async searchKnowledge(query: string, category?: string, limit: number = 10): Promise<SimplicityKnowledge[]> {
    const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    if (keywords.length === 0) return [];

    const conditions: any[] = [];
    
    if (category) {
      conditions.push(eq(simplicityKnowledge.category, category));
    }

    const searchPattern = keywords.map(k => `%${k}%`);
    const orConditions = searchPattern.map(pattern => 
      sql`(LOWER(${simplicityKnowledge.topic}) LIKE ${pattern} OR LOWER(${simplicityKnowledge.content}) LIKE ${pattern} OR ${pattern} = ANY(${simplicityKnowledge.tags}))`
    );
    
    const combinedOr = sql`(${sql.join(orConditions, sql` OR `)})`;
    conditions.push(combinedOr);

    const results = await db.select().from(simplicityKnowledge)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .orderBy(desc(simplicityKnowledge.accessCount))
      .limit(limit);
    
    return results;
  }

  async saveFeedback(feedback: InsertSimplicityFeedback): Promise<SimplicityFeedback> {
    const [saved] = await db.insert(simplicityFeedback)
      .values(feedback as any)
      .returning();
    return saved;
  }

  async saveLearnedFact(fact: InsertSimplicityLearnedFact): Promise<SimplicityLearnedFact> {
    const [saved] = await db.insert(simplicityLearnedFacts)
      .values(fact as any)
      .returning();
    return saved;
  }

  async incrementKnowledgeAccess(knowledgeIds: number[]): Promise<void> {
    if (knowledgeIds.length === 0) return;
    for (const id of knowledgeIds) {
      await db.update(simplicityKnowledge)
        .set({ 
          accessCount: sql`${simplicityKnowledge.accessCount} + 1`,
          lastAccessed: new Date(),
        })
        .where(eq(simplicityKnowledge.id, id));
    }
  }

  async getKnowledgeStats(): Promise<{ totalEntries: number; totalFeedback: number; totalFacts: number; avgRating: number }> {
    const [entries] = await db.select({ count: sql`count(*)::int` }).from(simplicityKnowledge);
    const [feedback] = await db.select({ count: sql`count(*)::int`, avg: sql`COALESCE(AVG(rating), 0)` }).from(simplicityFeedback);
    const [facts] = await db.select({ count: sql`count(*)::int` }).from(simplicityLearnedFacts);
    return {
      totalEntries: (entries as any).count || 0,
      totalFeedback: (feedback as any).count || 0,
      totalFacts: (facts as any).count || 0,
      avgRating: parseFloat((feedback as any).avg) || 0,
    };
  }

  async createPriceAlert(alert: InsertPriceAlert): Promise<PriceAlert> {
    const [created] = await db.insert(priceAlerts).values(alert).returning();
    return created;
  }

  async getPriceAlerts(userId: number, status?: string): Promise<PriceAlert[]> {
    if (status) {
      return db.select().from(priceAlerts).where(and(eq(priceAlerts.userId, userId), eq(priceAlerts.status, status))).orderBy(desc(priceAlerts.createdAt));
    }
    return db.select().from(priceAlerts).where(eq(priceAlerts.userId, userId)).orderBy(desc(priceAlerts.createdAt));
  }

  async getActivePriceAlerts(): Promise<PriceAlert[]> {
    return db.select().from(priceAlerts).where(eq(priceAlerts.status, 'active'));
  }

  async updatePriceAlert(id: number, data: Partial<PriceAlert>): Promise<PriceAlert | undefined> {
    const [updated] = await db.update(priceAlerts).set(data).where(eq(priceAlerts.id, id)).returning();
    return updated || undefined;
  }

  async deletePriceAlert(id: number): Promise<void> {
    await db.delete(priceAlerts).where(eq(priceAlerts.id, id));
  }

  async createMarketTransaction(tx: InsertMarketTransaction): Promise<MarketTransaction> {
    const [created] = await db.insert(marketTransactions).values(tx).returning();
    return created;
  }

  async getMarketTransactions(itemType?: string, days?: number): Promise<MarketTransaction[]> {
    const conditions = [];
    if (itemType) conditions.push(eq(marketTransactions.itemType, itemType));
    if (days) conditions.push(gte(marketTransactions.createdAt, new Date(Date.now() - days * 86400000)));
    if (conditions.length > 0) {
      return db.select().from(marketTransactions).where(and(...conditions)).orderBy(desc(marketTransactions.createdAt));
    }
    return db.select().from(marketTransactions).orderBy(desc(marketTransactions.createdAt));
  }

  async getTransactionStats(itemType: string, specs?: any): Promise<{ avgPrice: number; count: number; minPrice: number; maxPrice: number }> {
    const conditions = [eq(marketTransactions.itemType, itemType)];
    if (specs) {
      conditions.push(gte(marketTransactions.createdAt, new Date(Date.now() - 90 * 86400000)));
    }
    const [result] = await db.select({
      avgPrice: sql`COALESCE(AVG(actual_price::numeric), 0)`,
      count: sql`count(*)::int`,
      minPrice: sql`COALESCE(MIN(actual_price::numeric), 0)`,
      maxPrice: sql`COALESCE(MAX(actual_price::numeric), 0)`,
    }).from(marketTransactions).where(and(...conditions));
    return {
      avgPrice: parseFloat((result as any).avgPrice) || 0,
      count: (result as any).count || 0,
      minPrice: parseFloat((result as any).minPrice) || 0,
      maxPrice: parseFloat((result as any).maxPrice) || 0,
    };
  }

  async createPrediction(prediction: InsertMarketPrediction): Promise<MarketPrediction> {
    const [created] = await db.insert(marketPredictions).values(prediction).returning();
    return created;
  }

  async getPredictions(itemType: string, limit = 20): Promise<MarketPrediction[]> {
    return db.select().from(marketPredictions)
      .where(eq(marketPredictions.itemType, itemType))
      .orderBy(desc(marketPredictions.createdAt))
      .limit(limit);
  }

  async getPendingPredictions(): Promise<MarketPrediction[]> {
    return db.select().from(marketPredictions)
      .where(and(
        sql`${marketPredictions.targetDate} <= NOW()`,
        sql`${marketPredictions.actualPrice} IS NULL`
      ))
      .orderBy(desc(marketPredictions.targetDate));
  }

  async updatePrediction(id: number, data: Partial<MarketPrediction>): Promise<MarketPrediction | undefined> {
    const [updated] = await db.update(marketPredictions).set(data).where(eq(marketPredictions.id, id)).returning();
    return updated;
  }

  async getPredictionAccuracy(itemType?: string): Promise<{ avgAccuracy: number; count: number; byType: Record<string, { avg: number; count: number }> }> {
    const conditions: any[] = [sql`${marketPredictions.accuracy} IS NOT NULL`];
    if (itemType) conditions.push(eq(marketPredictions.itemType, itemType));

    const [overall] = await db.select({
      avgAccuracy: sql`COALESCE(AVG(accuracy::numeric), 0)`,
      count: sql`count(*)::int`,
    }).from(marketPredictions).where(and(...conditions));

    const byTypeRows = await db.select({
      itemType: marketPredictions.itemType,
      avg: sql`AVG(accuracy::numeric)`,
      count: sql`count(*)::int`,
    }).from(marketPredictions)
      .where(sql`${marketPredictions.accuracy} IS NOT NULL`)
      .groupBy(marketPredictions.itemType);

    const byType: Record<string, { avg: number; count: number }> = {};
    for (const row of byTypeRows) {
      byType[row.itemType] = { avg: parseFloat(String(row.avg)) || 0, count: Number(row.count) || 0 };
    }

    return {
      avgAccuracy: parseFloat(String((overall as any).avgAccuracy)) || 0,
      count: Number((overall as any).count) || 0,
      byType,
    };
  }

  async createIndexEntry(entry: InsertSimpletonIndex): Promise<SimpletonIndex> {
    const [created] = await db.insert(simpletonIndex).values(entry).returning();
    return created;
  }

  async getLatestIndex(assetType: string): Promise<SimpletonIndex | undefined> {
    const [latest] = await db.select().from(simpletonIndex)
      .where(eq(simpletonIndex.assetType, assetType))
      .orderBy(desc(simpletonIndex.indexDate))
      .limit(1);
    return latest;
  }

  async getIndexHistory(assetType: string, days = 30): Promise<SimpletonIndex[]> {
    return db.select().from(simpletonIndex)
      .where(and(
        eq(simpletonIndex.assetType, assetType),
        gte(simpletonIndex.indexDate, new Date(Date.now() - days * 86400000))
      ))
      .orderBy(desc(simpletonIndex.indexDate));
  }
}

export const storage = new DatabaseStorage();
