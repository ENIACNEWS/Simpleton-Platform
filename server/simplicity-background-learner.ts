import { db } from "./db";
import { simplicityKnowledge } from "@shared/schema";
import { InsertSimplicityKnowledge } from "@shared/schema";
import Anthropic from "@anthropic-ai/sdk";

interface PriceSnapshot {
  gold: number;
  silver: number;
  platinum: number;
  palladium: number;
  timestamp: number;
}

interface MarketMovement {
  metal: string;
  change: number;
  changePercent: number;
  current: number;
}

interface StudyTopic {
  topic: string;
  description: string;
  category: SimplicityKnowledgeCategory;
}

type SimplicityKnowledgeCategory =
  | "market_data"
  | "industry_news"
  | "metal_prices"
  | "diamond_market"
  | "general_knowledge";

const STUDY_CURRICULUM: StudyTopic[] = [
  {
    topic: "Diamond 4Cs Grading System",
    description: "In-depth study of Carat weight, Color, Clarity, and Cut in diamond valuation",
    category: "diamond_market"
  },
  {
    topic: "Precious Metals Supply Chain",
    description: "Mining operations, refining processes, and supply chain dynamics for gold, silver, platinum",
    category: "metal_prices"
  },
  {
    topic: "Rolex Sports Watch Market Trends",
    description: "Collector demand, secondary market prices, and release schedules for Rolex sports models",
    category: "general_knowledge"
  },
  {
    topic: "Economic Indicators and Metals Correlation",
    description: "How CPI, Fed interest rates, USD index, and inflation affect precious metals prices",
    category: "market_data"
  },
  {
    topic: "Coin Grading and Certification Standards",
    description: "PCGS, NGC, and CAC certification standards for rare coins and collectibles",
    category: "general_knowledge"
  },
  {
    topic: "Gold Price Seasonality Patterns",
    description: "Historical seasonal trends in gold pricing and typical market cycles",
    category: "market_data"
  },
  {
    topic: "Gemological Authentication Methods",
    description: "Modern techniques for detecting synthetic diamonds and treated gemstones",
    category: "diamond_market"
  },
  {
    topic: "Silver Industrial Demand Trends",
    description: "Photovoltaic, electronics, and industrial applications driving silver demand",
    category: "metal_prices"
  },
  {
    topic: "Auction Market Insights for Luxury Watches",
    description: "Christie's, Sotheby's, and specialist auction results for high-end timepieces",
    category: "general_knowledge"
  },
  {
    topic: "Platinum Group Metals Future",
    description: "Emerging uses in hydrogen fuel cells and catalytic converters",
    category: "metal_prices"
  }
];

class StudyScheduler {
  private intervals: NodeJS.Timeout[] = [];
  private priceHistory: PriceSnapshot[] = [];
  private currentCurriculumIndex: number = 0;
  private anthropicClient: Anthropic | null = null;
  private isRunning: boolean = false;

  constructor() {
    this.initializeAnthropic();
  }

  private initializeAnthropic(): void {
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropicClient = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn("[SimpleLearner] Background learner already running");
      return;
    }

    this.isRunning = true;
    console.log("[SimpleLearner] Starting background learning system");

    // Every 30 minutes: Fetch metal prices
    const priceInterval = setInterval(async () => {
      try {
        await this.studyMarketPrices();
      } catch (error) {
        console.error("[SimpleLearner] Market price study failed:", error instanceof Error ? error.message : error);
      }
    }, 30 * 60 * 1000);
    this.intervals.push(priceInterval);

    // Every 2 hours: Summarize market movements
    const summaryInterval = setInterval(async () => {
      try {
        await this.summarizeMarketMovements();
      } catch (error) {
        console.error("[SimpleLearner] Market summary failed:", error instanceof Error ? error.message : error);
      }
    }, 2 * 60 * 60 * 1000);
    this.intervals.push(summaryInterval);

    // Every 6 hours: Study a new topic
    const curriculumInterval = setInterval(async () => {
      try {
        await this.studyCurriculumTopic();
      } catch (error) {
        console.error("[SimpleLearner] Curriculum study failed:", error instanceof Error ? error.message : error);
      }
    }, 6 * 60 * 60 * 1000);
    this.intervals.push(curriculumInterval);

    // Every 24 hours: Consolidate daily learnings
    const consolidateInterval = setInterval(async () => {
      try {
        await this.consolidateDailyLearnings();
      } catch (error) {
        console.error("[SimpleLearner] Daily consolidation failed:", error instanceof Error ? error.message : error);
      }
    }, 24 * 60 * 60 * 1000);
    this.intervals.push(consolidateInterval);

    // Run initial studies immediately (staggered to avoid overwhelming the system)
    setTimeout(() => this.studyMarketPrices().catch(e => console.error("[SimpleLearner] Initial price fetch failed:", e)), 2000);
    setTimeout(() => this.studyCurriculumTopic().catch(e => console.error("[SimpleLearner] Initial curriculum study failed:", e)), 5000);

    console.log("[SimpleLearner] Background learner started with 4 study intervals");
  }

  async stop(): Promise<void> {
    console.log("[SimpleLearner] Stopping background learning system");
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    this.isRunning = false;
  }

  private async studyMarketPrices(): Promise<void> {
    console.log("[SimpleLearner] Starting market price study");

    try {
      const prices = await this.fetchMetalPrices();
      if (!prices) {
        console.warn("[SimpleLearner] Could not fetch metal prices");
        return;
      }

      const snapshot: PriceSnapshot = {
        ...prices,
        timestamp: Date.now()
      };

      this.priceHistory.push(snapshot);
      if (this.priceHistory.length > 168) {
        this.priceHistory.shift();
      }

      await this.storeMarketSnapshot(snapshot);
      console.log("[SimpleLearner] Market price study completed");
    } catch (error) {
      console.error("[SimpleLearner] Market price study error:", error instanceof Error ? error.message : error);
    }
  }

  private async fetchMetalPrices(): Promise<{ gold: number; silver: number; platinum: number; palladium: number } | null> {
    try {
      const response = await fetch("https://api.metals.live/v1/spot/metals?symbols=GOLD,SILVER,PLATINUM,PALLADIUM", {
        headers: { "User-Agent": "Simplicity-Learner/1.0" },
        timeout: 10000
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json() as Record<string, { price: number }>;
      return {
        gold: data.GOLD?.price || 0,
        silver: data.SILVER?.price || 0,
        platinum: data.PLATINUM?.price || 0,
        palladium: data.PALLADIUM?.price || 0
      };
    } catch (error) {
      console.error("[SimpleLearner] Metal price fetch failed:", error instanceof Error ? error.message : error);
      return null;
    }
  }

  private async storeMarketSnapshot(snapshot: PriceSnapshot): Promise<void> {
    try {
      const content = `Gold: $${snapshot.gold.toFixed(2)}/oz | Silver: $${snapshot.silver.toFixed(2)}/oz | Platinum: $${snapshot.platinum.toFixed(2)}/oz | Palladium: $${snapshot.palladium.toFixed(2)}/oz`;

      const knowledge: InsertSimplicityKnowledge = {
        topic: "Real-time Market Prices",
        content,
        category: "market_data",
        source: "metals.live API",
        confidence: 0.95,
        tags: ["gold", "silver", "platinum", "palladium", "spot_price"]
      };

      await db.insert(simplicityKnowledge).values(knowledge as any);
    } catch (error) {
      console.error("[SimpleLearner] Failed to store market snapshot:", error instanceof Error ? error.message : error);
    }
  }

  private async summarizeMarketMovements(): Promise<void> {
    console.log("[SimpleLearner] Starting market movement summary");

    try {
      if (this.priceHistory.length < 2) {
        console.log("[SimpleLearner] Insufficient price history for summary");
        return;
      }

      const movements = this.calculateMarketMovements();
      if (movements.length === 0) {
        return;
      }

      const summaryContent = this.generateMarketSummary(movements);

      const knowledge: InsertSimplicityKnowledge = {
        topic: "Market Movement Summary",
        content: summaryContent,
        category: "market_data",
        source: "internal analysis",
        confidence: 0.85,
        tags: ["market_analysis", "price_trends", "movement"]
      };

      await db.insert(simplicityKnowledge).values(knowledge as any);
      console.log("[SimpleLearner] Market movement summary completed");
    } catch (error) {
      console.error("[SimpleLearner] Market summary error:", error instanceof Error ? error.message : error);
    }
  }

  private calculateMarketMovements(): MarketMovement[] {
    if (this.priceHistory.length < 2) return [];

    const recent = this.priceHistory[this.priceHistory.length - 1];
    const previous = this.priceHistory[Math.max(0, this.priceHistory.length - 2)];

    const movements: MarketMovement[] = [];

    const metals = ["gold", "silver", "platinum", "palladium"] as const;
    for (const metal of metals) {
      const key = metal as keyof typeof recent;
      const prev = previous[key];
      const curr = recent[key];

      if (prev > 0) {
        const change = curr - prev;
        const changePercent = (change / prev) * 100;

        movements.push({
          metal,
          change,
          changePercent,
          current: curr
        });
      }
    }

    return movements;
  }

  private generateMarketSummary(movements: MarketMovement[]): string {
    const summaryParts: string[] = [];

    for (const movement of movements) {
      const direction = movement.change >= 0 ? "↑" : "↓";
      const changeStr = `${direction} ${Math.abs(movement.changePercent).toFixed(2)}%`;
      summaryParts.push(
        `${movement.metal.toUpperCase()}: $${movement.current.toFixed(2)} (${changeStr})`
      );
    }

    return `Market Update - ${summaryParts.join(" | ")}`;
  }

  private async studyCurriculumTopic(): Promise<void> {
    if (!this.anthropicClient) {
      console.warn("[SimpleLearner] Anthropic client not initialized, skipping curriculum study");
      return;
    }

    const topic = STUDY_CURRICULUM[this.currentCurriculumIndex % STUDY_CURRICULUM.length];
    this.currentCurriculumIndex++;

    console.log(`[SimpleLearner] Starting curriculum study: ${topic.topic}`);

    try {
      const prompt = `You are an expert in precious metals, diamonds, watches, and collectibles. Generate a comprehensive study note about the following topic for an AI assistant learning system. The note should be accurate, insightful, and highlight key facts and trends that would help in providing better customer service.

Topic: ${topic.topic}
Description: ${topic.description}

Please provide:
1. Key concepts and definitions
2. Current market trends or recent developments
3. Practical applications for a precious metals and collectibles platform
4. 2-3 important facts the assistant should remember

Format your response as a structured knowledge entry suitable for a learning system.`;

      const message = await this.anthropicClient.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const studyContent = message.content
        .filter((block) => block.type === "text")
        .map((block) => (block as { type: "text"; text: string }).text)
        .join("\n");

      const knowledge: InsertSimplicityKnowledge = {
        topic: topic.topic,
        content: studyContent,
        category: topic.category,
        source: "Claude AI Study Session",
        confidence: 0.9,
        tags: [topic.topic.toLowerCase().replace(/\s+/g, "_")]
      };

      await db.insert(simplicityKnowledge).values(knowledge as any);
      console.log(`[SimpleLearner] Curriculum study completed: ${topic.topic}`);
    } catch (error) {
      console.error(`[SimpleLearner] Curriculum study failed for ${topic.topic}:`, error instanceof Error ? error.message : error);
    }
  }

  private async consolidateDailyLearnings(): Promise<void> {
    console.log("[SimpleLearner] Starting daily consolidation");

    try {
      const stats = await this.getKnowledgeStats();

      const consolidationContent = `Daily Learning Consolidation Report:
- Total knowledge entries: ${stats.totalEntries}
- Breakdown by category: Market Data (${stats.marketDataCount}), Diamond Market (${stats.diamondCount}), Metal Prices (${stats.metalCount}), General Knowledge (${stats.generalCount})
- Knowledge base expansion: +${stats.newTodayCount} entries added today
- System confidence level: ${(stats.avgConfidence * 100).toFixed(1)}%
- Most accessed topics: ${stats.topTopics.join(", ")}`;

      const knowledge: InsertSimplicityKnowledge = {
        topic: "Daily Learning Consolidation",
        content: consolidationContent,
        category: "general_knowledge",
        source: "internal consolidation",
        confidence: 1.0,
        tags: ["consolidation", "daily_report", "learning_stats"]
      };

      await db.insert(simplicityKnowledge).values(knowledge as any);
      console.log("[SimpleLearner] Daily consolidation completed");
    } catch (error) {
      console.error("[SimpleLearner] Daily consolidation error:", error instanceof Error ? error.message : error);
    }
  }

  private async getKnowledgeStats(): Promise<{
    totalEntries: number;
    newTodayCount: number;
    avgConfidence: number;
    marketDataCount: number;
    diamondCount: number;
    metalCount: number;
    generalCount: number;
    topTopics: string[];
  }> {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const [totalResult] = await db.execute(`
        SELECT COUNT(*) as count FROM simplicity_knowledge
      `);
      const total = (totalResult as any).rows?.[0]?.count || 0;

      const [newTodayResult] = await db.execute(`
        SELECT COUNT(*) as count FROM simplicity_knowledge
        WHERE created_at > $1
      `, [oneDayAgo]);
      const newToday = (newTodayResult as any).rows?.[0]?.count || 0;

      const [confidenceResult] = await db.execute(`
        SELECT AVG(confidence) as avg_conf FROM simplicity_knowledge
      `);
      const avgConf = (confidenceResult as any).rows?.[0]?.avg_conf || 0.8;

      const categories = ["market_data", "diamond_market", "metal_prices", "general_knowledge"];
      const countResults: Record<string, number> = {};

      for (const cat of categories) {
        const [result] = await db.execute(`
          SELECT COUNT(*) as count FROM simplicity_knowledge WHERE category = $1
        `, [cat]);
        countResults[cat] = (result as any).rows?.[0]?.count || 0;
      }

      const [topicsResult] = await db.execute(`
        SELECT topic FROM simplicity_knowledge
        ORDER BY access_count DESC LIMIT 3
      `);
      const topTopics = ((topicsResult as any).rows || []).map((r: any) => r.topic);

      return {
        totalEntries: total,
        newTodayCount: newToday,
        avgConfidence: avgConf,
        marketDataCount: countResults["market_data"],
        diamondCount: countResults["diamond_market"],
        metalCount: countResults["metal_prices"],
        generalCount: countResults["general_knowledge"],
        topTopics
      };
    } catch (error) {
      console.error("[SimpleLearner] Failed to get knowledge stats:", error instanceof Error ? error.message : error);
      return {
        totalEntries: 0,
        newTodayCount: 0,
        avgConfidence: 0.8,
        marketDataCount: 0,
        diamondCount: 0,
        metalCount: 0,
        generalCount: 0,
        topTopics: []
      };
    }
  }

  async getRecentLearnings(category: SimplicityKnowledgeCategory, limit: number = 10): Promise<any[]> {
    try {
      const results = await db.execute(`
        SELECT id, topic, content, category, source, confidence, created_at, access_count
        FROM simplicity_knowledge
        WHERE category = $1
        ORDER BY created_at DESC
        LIMIT $2
      `, [category, limit]);

      return ((results as any)[0]?.rows || []);
    } catch (error) {
      console.error("[SimpleLearner] Failed to get recent learnings:", error instanceof Error ? error.message : error);
      return [];
    }
  }

  async getMarketSummary(): Promise<any | null> {
    try {
      const results = await db.execute(`
        SELECT topic, content, created_at
        FROM simplicity_knowledge
        WHERE topic = 'Market Movement Summary'
        ORDER BY created_at DESC
        LIMIT 1
      `);

      return ((results as any)[0]?.rows?.[0]) || null;
    } catch (error) {
      console.error("[SimpleLearner] Failed to get market summary:", error instanceof Error ? error.message : error);
      return null;
    }
  }

  async getStudyNotes(topic: string): Promise<any[]> {
    try {
      const results = await db.execute(`
        SELECT id, topic, content, source, confidence, created_at
        FROM simplicity_knowledge
        WHERE LOWER(topic) LIKE LOWER($1)
        ORDER BY created_at DESC
        LIMIT 10
      `, [`%${topic}%`]);

      return ((results as any)[0]?.rows || []);
    } catch (error) {
      console.error("[SimpleLearner] Failed to get study notes:", error instanceof Error ? error.message : error);
      return [];
    }
  }

  isActive(): boolean {
    return this.isRunning;
  }
}

export const backgroundLearner = new StudyScheduler();

export async function startBackgroundLearning(): Promise<void> {
  await backgroundLearner.start();
}

export async function stopBackgroundLearning(): Promise<void> {
  await backgroundLearner.stop();
}

export function isBackgroundLearnerRunning(): boolean {
  return backgroundLearner.isActive();
}

export async function getBackgroundLearnerStats(): Promise<any> {
  return {
    isRunning: backgroundLearner.isActive(),
    curriculumTopics: STUDY_CURRICULUM.length,
    version: "1.0"
  };
}
