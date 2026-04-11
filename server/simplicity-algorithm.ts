/**
 * SIMPLICITY RECOMMENDATION ALGORITHM
 * ────────────────────────────────────
 * Progressive profiling system inspired by TikTok's recommendation engine.
 * Generates personalized suggested prompts based on accumulated user knowledge.
 *
 * Three phases of user understanding:
 *
 *   COLD  (0-2 interactions)   →  Broad, diverse prompts across all domains.
 *                                  Goal: read the room. Don't assume anything.
 *                                  Show one prompt from each major category to
 *                                  see what they engage with.
 *
 *   WARM  (3-10 interactions)  →  Start narrowing. 60% prompts based on what
 *                                  they've engaged with, 40% exploration of
 *                                  adjacent topics. Acknowledge what we know
 *                                  ("Your 14K Cuban...") but don't be creepy.
 *
 *   HOT   (10+ interactions)   →  Full personalization. 80% deep-dive into
 *                                  their known interests with specific context
 *                                  (their items, their price points, their
 *                                  market positions). 20% curated exploration
 *                                  of topics adjacent to their profile.
 *
 * The key insight from TikTok: you don't ask users what they want.
 * You OBSERVE what they engage with and silently adapt. The user should
 * feel like Simplicity "just gets them" without ever being told.
 *
 * Anti-patterns to avoid:
 * - Never go 100% personalized — always leave room for discovery
 * - Never mention that you're profiling them
 * - Never be aggressive early — earn trust through relevance over time
 * - Never show the same prompt twice in a session
 */

import { db } from './db';
import { assistantSessions, userMemories } from '@shared/schema';
import { eq, desc, sql } from 'drizzle-orm';

// ───────────────────────────────────────────────────────────────────────
//  Domain categories — the universe of things Simplicity knows about
// ───────────────────────────────────────────────────────────────────────
const DOMAINS = {
  gold: {
    label: 'Gold & Metals',
    signals: ['gold', 'silver', 'platinum', 'palladium', 'rhodium', 'melt', 'spot', 'karat', '14k', '18k', '10k', '24k', 'troy', 'bullion', 'bar', 'ingot', 'scrap'],
    cold: [
      "What's gold trading at right now?",
      "How do I calculate the melt value of jewelry?",
      "What's the gold-to-silver ratio telling us?",
    ],
    warm: (ctx: ProfileContext) => [
      ctx.preferredMetal ? `What's ${ctx.preferredMetal} doing today?` : "Live precious metals update",
      ctx.preferredKarat ? `Melt value check: ${ctx.preferredKarat} at today's spot` : "Calculate a melt value",
      "Should I be buying or selling metals right now?",
      "What's moving in the platinum group metals?",
    ],
    hot: (ctx: ProfileContext) => [
      ctx.ownedItems.length > 0 ? `Updated value of your ${ctx.ownedItems[0]}` : "Portfolio value check at current spot",
      ctx.preferredMetal ? `${ctx.preferredMetal} market analysis — this week's signals` : "Gold market deep dive",
      "Central bank gold buying — what's the latest?",
      ctx.investorType === 'dealer' ? "Wholesale bid/ask spread analysis" : "Best time to accumulate this month",
    ],
  },
  diamonds: {
    label: 'Diamonds',
    signals: ['diamond', 'carat', 'clarity', 'color', 'cut', 'gia', 'ags', 'igi', 'rapaport', 'lab-grown', 'natural', 'vs1', 'vs2', 'si1', 'vvs', 'inclusion'],
    cold: [
      "How are diamonds graded and priced?",
      "Lab-grown vs natural — what's the market saying?",
      "What diamond specs give the best value?",
    ],
    warm: (ctx: ProfileContext) => [
      "Break down today's Rapaport pricing trends",
      ctx.diamondInterest ? `Update on ${ctx.diamondInterest} diamonds` : "Which clarity grade is the sweet spot?",
      "Are diamond prices trending up or down?",
    ],
    hot: (ctx: ProfileContext) => [
      ctx.diamondSpecs ? `Market check: ${ctx.diamondSpecs}` : "Diamond investment analysis",
      "Wholesale vs retail diamond pricing gap",
      ctx.investorType === 'dealer' ? "Best margins in current diamond market" : "How to buy a diamond without overpaying",
    ],
  },
  rolex: {
    label: 'Rolex',
    signals: ['rolex', 'submariner', 'daytona', 'datejust', 'gmt', 'explorer', 'oyster', 'jubilee', 'pepsi', 'batman', 'hulk', 'ref', 'reference', 'caliber', 'movement', '3135', '3235', '126610', '116500'],
    cold: [
      "Which Rolex models hold value best?",
      "How do I identify a Rolex by reference number?",
      "Is the Rolex secondary market still strong?",
    ],
    warm: (ctx: ProfileContext) => [
      ctx.watchInterest ? `${ctx.watchInterest} market update` : "Rolex market trends this quarter",
      "How to spot a fake Rolex — quick authentication tips",
      "What's driving the premium on sports models?",
    ],
    hot: (ctx: ProfileContext) => [
      ctx.watchModel ? `Current value of your ${ctx.watchModel}` : "Your Rolex portfolio — what's appreciating?",
      ctx.watchInterest ? `Deep dive: ${ctx.watchInterest} price history and outlook` : "Rolex investment strategy",
      ctx.investorType === 'dealer' ? "Best Rolex models for resale margin" : "When to buy — seasonal Rolex pricing patterns",
    ],
  },
  coins: {
    label: 'Coins',
    signals: ['coin', 'morgan', 'eagle', 'buffalo', 'maple', 'krugerrand', 'numismatic', 'mint', 'ms-', 'proof', 'pcgs', 'ngc', 'grading', 'sheldon', 'junk silver', 'constitutional'],
    cold: [
      "What makes certain coins more valuable?",
      "Morgan Silver Dollar — what should I know?",
      "Bullion vs numismatic — what's the difference?",
    ],
    warm: (ctx: ProfileContext) => [
      "US Gold Eagle melt value at today's spot",
      ctx.coinInterest ? `${ctx.coinInterest} price check` : "Best coins for stacking right now",
      "Junk silver bags — current premium over spot",
    ],
    hot: (ctx: ProfileContext) => [
      ctx.ownedCoins.length > 0 ? `Your ${ctx.ownedCoins[0]} — updated melt and collector value` : "Coin portfolio check",
      ctx.investorType === 'dealer' ? "Which coins have the tightest buy/sell spread?" : "Key dates worth hunting for",
      "Grading impact on value — when does certification pay off?",
    ],
  },
  appraisal: {
    label: 'Appraisals',
    signals: ['apprais', 'value', 'worth', 'insurance', 'replacement', 'estate', 'liquidation', 'hallmark', 'stamp', 'purity', 'test', 'acid test', 'xrf'],
    cold: [
      "How does a professional appraisal work?",
      "What's the difference between melt value and retail value?",
      "How do I read hallmarks on jewelry?",
    ],
    warm: (ctx: ProfileContext) => [
      "Upload a photo for an instant AI appraisal",
      "What documentation do I need for insurance?",
      ctx.preferredMetal ? `How to appraise ${ctx.preferredMetal} jewelry` : "Appraising estate jewelry",
    ],
    hot: (ctx: ProfileContext) => [
      "Get a certified appraisal from our GIA gemologist",
      ctx.investorType === 'dealer' ? "Batch appraisal strategies for inventory" : "When should I update my jewelry appraisal?",
      "Upload a photo — let me identify the piece",
    ],
  },
  general: {
    label: 'Beyond Markets',
    signals: ['life', 'advice', 'think', 'feel', 'opinion', 'philosophy', 'history', 'book', 'music', 'recommend'],
    cold: [
      "What's the best investment for a beginner?",
      "How do pawn shops determine prices?",
      "What should every jewelry buyer know?",
    ],
    warm: (ctx: ProfileContext) => [
      ctx.name ? `${ctx.name}, what's on your mind today?` : "What's on your mind today?",
      "Tell me something I probably don't know about the industry",
      "What's your honest take on the market right now?",
    ],
    hot: (ctx: ProfileContext) => [
      ctx.name ? `Good to see you again, ${ctx.name}. What are we working on?` : "Welcome back — what's on the agenda?",
      "Give me your contrarian take on today's market",
      "Surprise me with something interesting",
    ],
  },
};

// ───────────────────────────────────────────────────────────────────────
//  Profile context — extracted from user memories + session data
// ───────────────────────────────────────────────────────────────────────
interface ProfileContext {
  phase: 'cold' | 'warm' | 'hot';
  interactionCount: number;
  name: string | null;
  investorType: string | null; // dealer, collector, investor, hobbyist
  preferredMetal: string | null;
  preferredKarat: string | null;
  watchModel: string | null;
  watchInterest: string | null;
  diamondInterest: string | null;
  diamondSpecs: string | null;
  coinInterest: string | null;
  ownedItems: string[];
  ownedCoins: string[];
  topDomains: string[]; // ranked by engagement
  recentTopics: string[];
}

function buildProfileContext(
  sessionProfile: any,
  memories: Array<{ category: string; memoryKey: string; memoryValue: string; timesReinforced: number }>,
  messageCount: number,
): ProfileContext {
  // Determine phase
  let phase: 'cold' | 'warm' | 'hot' = 'cold';
  if (messageCount >= 10 || memories.length >= 8) phase = 'hot';
  else if (messageCount >= 3 || memories.length >= 2) phase = 'warm';

  // Extract from memories
  const ctx: ProfileContext = {
    phase,
    interactionCount: messageCount,
    name: null,
    investorType: null,
    preferredMetal: null,
    preferredKarat: null,
    watchModel: null,
    watchInterest: null,
    diamondInterest: null,
    diamondSpecs: null,
    coinInterest: null,
    ownedItems: [],
    ownedCoins: [],
    topDomains: [],
    recentTopics: [],
  };

  // Parse session profile (if available)
  if (sessionProfile) {
    if (sessionProfile.name) ctx.name = sessionProfile.name;
    if (sessionProfile.investorType) ctx.investorType = sessionProfile.investorType;
    if (sessionProfile.interests) ctx.recentTopics = sessionProfile.interests;
  }

  // Parse memories with domain scoring
  const domainScores: Record<string, number> = {};

  for (const m of memories) {
    const key = m.memoryKey.toLowerCase();
    const val = m.memoryValue.toLowerCase();
    const weight = Math.min(m.timesReinforced, 5); // cap at 5x reinforcement

    // Extract specific facts
    if (m.category === 'identity' && key.includes('name')) ctx.name = m.memoryValue;
    if (m.category === 'identity' && (key.includes('type') || key.includes('role') || key.includes('occupation'))) {
      if (val.includes('dealer') || val.includes('pawn') || val.includes('jeweler')) ctx.investorType = 'dealer';
      else if (val.includes('collector')) ctx.investorType = 'collector';
      else if (val.includes('investor')) ctx.investorType = 'investor';
    }
    if (key.includes('metal') || key.includes('prefer')) {
      if (val.includes('gold')) ctx.preferredMetal = 'gold';
      else if (val.includes('silver')) ctx.preferredMetal = 'silver';
      else if (val.includes('platinum')) ctx.preferredMetal = 'platinum';
    }
    if (key.includes('karat') || val.match(/\d+k/i)) {
      const karatMatch = val.match(/(\d+)k/i);
      if (karatMatch) ctx.preferredKarat = `${karatMatch[1]}K`;
    }
    if (key.includes('watch') || key.includes('rolex')) {
      ctx.watchInterest = m.memoryValue;
      const modelMatch = val.match(/(submariner|daytona|datejust|gmt|explorer|day-date|yacht)/i);
      if (modelMatch) ctx.watchModel = modelMatch[1];
    }
    if (key.includes('diamond')) {
      ctx.diamondInterest = m.memoryValue;
      const specMatch = val.match(/(\d+\.?\d*)\s*ct?\s*(d|e|f|g|h|i|j)?\s*(fl|if|vvs|vs|si|i\d)/i);
      if (specMatch) ctx.diamondSpecs = `${specMatch[1]}ct ${specMatch[2] || ''} ${specMatch[3] || ''}`.trim();
    }
    if (key.includes('coin') || m.category === 'collections' && val.match(/eagle|morgan|maple|krugerrand|buffalo/i)) {
      ctx.ownedCoins.push(m.memoryValue);
    }
    if (m.category === 'collections' || m.category === 'assets') {
      ctx.ownedItems.push(m.memoryValue);
    }

    // Score domains based on signal words
    for (const [domain, config] of Object.entries(DOMAINS)) {
      for (const signal of config.signals) {
        if (val.includes(signal) || key.includes(signal)) {
          domainScores[domain] = (domainScores[domain] || 0) + weight;
        }
      }
    }
  }

  // Rank domains by engagement score
  ctx.topDomains = Object.entries(domainScores)
    .sort((a, b) => b[1] - a[1])
    .map(([domain]) => domain);

  return ctx;
}

// ───────────────────────────────────────────────────────────────────────
//  Smart prompt generation — the core algorithm
// ───────────────────────────────────────────────────────────────────────
function generateSmartPrompts(ctx: ProfileContext, mode: string, count: number = 6): string[] {
  const prompts: string[] = [];
  const used = new Set<string>();

  const addPrompt = (p: string) => {
    if (!used.has(p) && prompts.length < count) {
      used.add(p);
      prompts.push(p);
    }
  };

  // If we're in a specific mode, weight that domain heavily
  const modeDomain = DOMAINS[mode as keyof typeof DOMAINS];

  if (ctx.phase === 'cold') {
    // ── COLD START: broad exploration across domains ──
    // Show one prompt from each domain to discover interests
    // Prioritize the active mode but include variety
    if (modeDomain) {
      modeDomain.cold.forEach(p => addPrompt(p));
    }
    // Fill remaining with diverse cold prompts from other domains
    const otherDomains = Object.entries(DOMAINS).filter(([k]) => k !== mode);
    for (const [, config] of otherDomains) {
      if (prompts.length < count && config.cold[0]) {
        addPrompt(config.cold[0]);
      }
    }
    return prompts;
  }

  if (ctx.phase === 'warm') {
    // ── WARM: 60% interest-based, 40% exploration ──
    const personalCount = Math.ceil(count * 0.6);
    const exploreCount = count - personalCount;

    // Personal prompts from their top domains
    if (modeDomain) {
      const warmPrompts = modeDomain.warm(ctx);
      warmPrompts.slice(0, 2).forEach(p => addPrompt(p));
    }
    for (const domain of ctx.topDomains) {
      if (prompts.length >= personalCount) break;
      const config = DOMAINS[domain as keyof typeof DOMAINS];
      if (config) {
        const warmPrompts = config.warm(ctx);
        addPrompt(warmPrompts[0]);
      }
    }

    // Exploration: domains they haven't engaged with
    const unexplored = Object.entries(DOMAINS).filter(([k]) => !ctx.topDomains.includes(k) && k !== mode);
    for (const [, config] of unexplored) {
      if (prompts.length >= personalCount + exploreCount) break;
      addPrompt(config.cold[Math.floor(Math.random() * config.cold.length)]);
    }

    // Fill any remaining slots
    if (modeDomain && prompts.length < count) {
      modeDomain.warm(ctx).forEach(p => addPrompt(p));
    }

    return prompts;
  }

  // ── HOT: 80% deep personalization, 20% curated exploration ──
  const deepCount = Math.ceil(count * 0.8);
  const curatedCount = count - deepCount;

  // Deep personalization from their top domains
  if (modeDomain) {
    modeDomain.hot(ctx).forEach(p => addPrompt(p));
  }
  for (const domain of ctx.topDomains) {
    if (prompts.length >= deepCount) break;
    const config = DOMAINS[domain as keyof typeof DOMAINS];
    if (config) {
      const hotPrompts = config.hot(ctx);
      hotPrompts.forEach(p => addPrompt(p));
    }
  }

  // Curated exploration: adjacent to their interests, not random
  const adjacent: Record<string, string[]> = {
    gold: ['coins', 'appraisal'],
    diamonds: ['appraisal', 'general'],
    rolex: ['gold', 'appraisal'],
    coins: ['gold', 'general'],
    appraisal: ['diamonds', 'gold'],
    general: ['gold', 'diamonds'],
  };

  const topDomain = ctx.topDomains[0] || mode;
  const adjacentDomains = adjacent[topDomain] || ['general'];
  for (const adjDomain of adjacentDomains) {
    if (prompts.length >= deepCount + curatedCount) break;
    const config = DOMAINS[adjDomain as keyof typeof DOMAINS];
    if (config) {
      const warmPrompts = config.warm(ctx);
      addPrompt(warmPrompts[Math.floor(Math.random() * warmPrompts.length)]);
    }
  }

  // Fill any remaining
  if (prompts.length < count && modeDomain) {
    modeDomain.warm(ctx).forEach(p => addPrompt(p));
  }

  return prompts;
}

// ───────────────────────────────────────────────────────────────────────
//  Public API — called from the route handler
// ───────────────────────────────────────────────────────────────────────
export async function getSmartPrompts(
  sessionToken: string,
  mode: string = 'general',
  count: number = 6,
): Promise<{ prompts: string[]; phase: string; profileDepth: number }> {
  try {
    // Load session + profile
    const [session] = await db.select().from(assistantSessions)
      .where(eq(assistantSessions.sessionToken, sessionToken))
      .limit(1);

    if (!session) {
      // Brand new user — pure cold start
      const coldCtx: ProfileContext = {
        phase: 'cold', interactionCount: 0, name: null, investorType: null,
        preferredMetal: null, preferredKarat: null, watchModel: null, watchInterest: null,
        diamondInterest: null, diamondSpecs: null, coinInterest: null,
        ownedItems: [], ownedCoins: [], topDomains: [], recentTopics: [],
      };
      return {
        prompts: generateSmartPrompts(coldCtx, mode, count),
        phase: 'cold',
        profileDepth: 0,
      };
    }

    // Count interactions (messages from this session)
    const messageCount = await db.execute(sql`
      SELECT COUNT(*) as cnt FROM assistant_messages
      WHERE session_id = ${session.id} AND role = 'user'
    `);
    const msgCount = parseInt(String(messageCount.rows[0]?.cnt || '0'), 10);

    // Load user memories (if we have a linked user ID)
    let memories: Array<{ category: string; memoryKey: string; memoryValue: string; timesReinforced: number }> = [];
    if ((session as any).userId) {
      const mems = await db.select().from(userMemories)
        .where(eq(userMemories.userId, (session as any).userId))
        .orderBy(desc(userMemories.timesReinforced))
        .limit(30);
      memories = mems.map(m => ({
        category: m.category,
        memoryKey: m.memoryKey,
        memoryValue: m.memoryValue,
        timesReinforced: m.timesReinforced,
      }));
    }

    // Build profile context
    const ctx = buildProfileContext(session.userProfile, memories, msgCount);

    // Generate prompts
    const prompts = generateSmartPrompts(ctx, mode, count);

    return {
      prompts,
      phase: ctx.phase,
      profileDepth: memories.length + msgCount,
    };
  } catch (e) {
    console.warn('⚠️ Smart prompts error (falling back to cold):', e);
    // Graceful fallback — never break the UI
    const domain = DOMAINS[mode as keyof typeof DOMAINS] || DOMAINS.general;
    return {
      prompts: domain.cold,
      phase: 'cold',
      profileDepth: 0,
    };
  }
}
