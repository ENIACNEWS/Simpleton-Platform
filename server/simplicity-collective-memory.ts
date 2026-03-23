/**
 * Simplicity Collective Intelligence System
 * 
 * Three-tier memory architecture:
 * Layer 1: Personal Memory (per-user, private) - handled by simplicity-memory.ts
 * Layer 2: Cross-Device Identity - user accounts link sessions across devices
 * Layer 3: Collective Knowledge - anonymized problem/solution pairs learned from ALL users
 * 
 * Privacy rules:
 * - Personal details (names, specific assets, deals) NEVER enter collective memory
 * - Only problem-solving knowledge, how-tos, and solutions get promoted
 * - Source conversations are never referenced or identifiable
 */

import { db } from './db';
import { collectiveInsights } from '@shared/schema';
import { eq, and, desc, sql, ilike } from 'drizzle-orm';

export interface CollectiveInsight {
  category: string;
  topic: string;
  problem: string;
  solution: string;
  tags: string[];
}

/**
 * Search collective knowledge for insights relevant to the current conversation.
 * Returns anonymized solutions that Simplicity has learned from past interactions.
 */
export async function searchCollectiveKnowledge(
  query: string,
  category?: string,
  limit: number = 5
): Promise<CollectiveInsight[]> {
  try {
    // Extract key terms from the query for matching
    const searchTerms = query
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 3);

    if (searchTerms.length === 0) return [];

    // Build search conditions - match against problem and tags
    const conditions = [];
    
    if (category) {
      conditions.push(eq(collectiveInsights.category, category));
    }

    // Search using ILIKE for fuzzy matching on problem and solution
    const searchPattern = '%' + searchTerms.slice(0, 3).join('%') + '%';
    
    const results = await db
      .select()
      .from(collectiveInsights)
      .where(
        sql`(lower(${collectiveInsights.problem}) LIKE lower(${searchPattern})
          OR lower(${collectiveInsights.solution}) LIKE lower(${searchPattern})
          OR ${collectiveInsights.tags}::text ILIKE lower(${searchPattern}))
          ${category ? sql`AND ${collectiveInsights.category} = ${category}` : sql``}`
      )
      .orderBy(desc(collectiveInsights.timesHelpful), desc(collectiveInsights.lastReinforced))
      .limit(limit);

    // Update access counts for retrieved insights
    for (const r of results) {
      await db.update(collectiveInsights)
        .set({ 
          totalInteractions: r.totalInteractions + 1,
          lastReinforced: new Date()
        })
        .where(eq(collectiveInsights.id, r.id));
    }

    return results.map(r => ({
      category: r.category,
      topic: r.topic,
      problem: r.problem,
      solution: r.solution,
      tags: r.tags || [],
    }));
  } catch (e) {
    console.log('Collective knowledge search (non-blocking):', e);
    return [];
  }
}

/**
 * Extract anonymized knowledge from a conversation and store it in collective memory.
 * This runs after every successful interaction to build the shared knowledge base.
 * 
 * PRIVACY: Uses AI to strip all personal identifiers before storage.
 */
export async function extractCollectiveKnowledge(
  userMessage: string,
  aiResponse: string
): Promise<void> {
  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = `You are the knowledge extraction engine for Simplicity's Collective Intelligence system.

Your job: Extract ANONYMIZED, REUSABLE knowledge from this conversation exchange. This knowledge will help future users who encounter similar problems.

STRICT PRIVACY RULES:
- NEVER include names, locations, specific dollar amounts from deals, or any personally identifiable information
- NEVER reference "a user" or "someone" — write solutions as universal knowledge
- Only extract knowledge that would be genuinely useful to OTHER people
- Focus on: problem patterns, solutions, techniques, identification methods, grading criteria, pricing factors, authentication tips

CATEGORIES to use:
- diamond_grading: clarity, color, cut, carat, certification
- gold_testing: purity, karat, testing methods, melt value
- silver_testing: purity, hallmarks, testing
- rolex_authentication: serial numbers, movements, dials, common fakes
- coin_grading: conditions, mint marks, varieties, errors
- precious_metals_investing: strategies, timing, market factors
- jewelry_appraisal: techniques, factors, documentation
- troubleshooting: platform issues, calculator problems, common fixes
- market_intelligence: pricing trends, supply/demand, market conditions
- general_knowledge: anything else useful and reusable

User asked: "${userMessage.slice(0, 600)}"
Simplicity answered: "${aiResponse.slice(0, 800)}"

If this exchange contains reusable knowledge, respond with ONLY a JSON array:
[{"category":"diamond_grading","topic":"vs2_inclusion_types","problem":"How to identify VS2 inclusions under 10x loupe","solution":"VS2 inclusions are minor... [the universal knowledge]","tags":["vs2","clarity","loupe","inclusions"]}]

Return [] if:
- The exchange is just casual conversation
- The knowledge is too personal/specific to be universally useful
- It is basic greetings or small talk`;

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '[]';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return;

    const insights: CollectiveInsight[] = JSON.parse(jsonMatch[0]);

    for (const insight of insights.slice(0, 3)) {
      if (!insight.problem || !insight.solution || !insight.category) continue;

      // Check if similar insight already exists (dedup by topic)
      const existing = await db
        .select()
        .from(collectiveInsights)
        .where(
          and(
            eq(collectiveInsights.category, insight.category),
            eq(collectiveInsights.topic, insight.topic)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Reinforce existing knowledge — bump helpfulness and merge solution if richer
        const prev = existing[0];
        const mergedSolution = insight.solution.length > prev.solution.length
          ? insight.solution
          : prev.solution;
        
        await db.update(collectiveInsights)
          .set({
            solution: mergedSolution,
            timesHelpful: prev.timesHelpful + 1,
            sourceConversationCount: prev.sourceConversationCount + 1,
            lastReinforced: new Date(),
            updatedAt: new Date(),
            tags: [...new Set([...(prev.tags || []), ...(insight.tags || [])])],
          })
          .where(eq(collectiveInsights.id, prev.id));
      } else {
        // Insert new collective insight
        await db.insert(collectiveInsights).values({
          category: insight.category,
          topic: insight.topic,
          problem: insight.problem,
          solution: insight.solution,
          tags: insight.tags || [],
          timesHelpful: 1,
          totalInteractions: 1,
          sourceConversationCount: 1,
        });
      }
    }
  } catch (e) {
    // Non-blocking — collective learning never interrupts the main flow
    console.log('Collective knowledge extraction (non-blocking):', e);
  }
}

/**
 * Format collective knowledge for inclusion in Simplicity's system prompt.
 * Makes Simplicity aware of solutions she has learned from past interactions
 * without revealing any personal details about who taught her.
 */
export function formatCollectiveKnowledgeForPrompt(
  insights: CollectiveInsight[]
): string {
  if (!insights.length) return '';

  const grouped: Record<string, string[]> = {};
  for (const insight of insights) {
    const cat = insight.category || 'general';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(
      `Topic: ${insight.topic}\n  Problem: ${insight.problem}\n  Solution: ${insight.solution}`
    );
  }

  const sections = Object.entries(grouped)
    .map(([cat, items]) => `  ${cat.toUpperCase().replace(/_/g, ' ')}:\n${items.join('\n\n')}`)
    .join('\n\n');

  return `

SIMPLICITY COLLECTIVE INTELLIGENCE — KNOWLEDGE YOU HAVE LEARNED FROM EXPERIENCE:
The following solutions and insights come from your accumulated experience helping many people.
Use this knowledge naturally — you learned it through practice, not from any specific person.
Never say "another user told me" or "I learned this from someone." You simply KNOW this.

${sections}

When using collective knowledge:
- Present it as your own expertise (because it IS — you learned it)
- If the insight is highly relevant, lead with it confidently
- Connect it to the specific question being asked
- Add your own analysis on top of the retrieved knowledge
`;
}

/**
 * Get conversation sessions for a user (for the sidebar).
 * Returns a list of past conversations with titles and timestamps.
 */
export async function getUserConversationSessions(
  userId?: number,
  sessionToken?: string,
  limit: number = 20
): Promise<Array<{
  id: number;
  sessionToken: string;
  title: string | null;
  summary: string | null;
  messageCount: number;
  lastActiveAt: Date;
  createdAt: Date;
}>> {
  try {
    const { assistantSessions } = await import('@shared/schema');
    
    let results;
    if (userId) {
      // Cross-device: get all sessions for this user account
      results = await db
        .select()
        .from(assistantSessions)
        .where(eq(assistantSessions.userId, userId))
        .orderBy(desc(assistantSessions.lastActiveAt))
        .limit(limit);
    } else if (sessionToken) {
      // Anonymous: get sessions for this browser token
      results = await db
        .select()
        .from(assistantSessions)
        .where(eq(assistantSessions.sessionToken, sessionToken))
        .orderBy(desc(assistantSessions.lastActiveAt))
        .limit(limit);
    } else {
      return [];
    }

    return results.map(r => ({
      id: r.id,
      sessionToken: r.sessionToken,
      title: r.userProfile?.lastTopic || null,
      summary: null,
      messageCount: r.messageCount || 0,
      lastActiveAt: r.lastActiveAt || r.createdAt || new Date(),
      createdAt: r.createdAt || new Date(),
    }));
  } catch (e) {
    console.log('Get conversation sessions (non-blocking):', e);
    return [];
  }
}

/**
 * Auto-generate a conversation title from the first message.
 */
export async function generateConversationTitle(
  firstMessage: string
): Promise<string> {
  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 30,
      messages: [{
        role: 'user',
        content: `Generate a very short (3-6 word) conversation title for this message. No quotes, no punctuation at the end. Examples: "Gold Chain Appraisal", "Diamond Clarity Question", "Rolex Authentication Help"\n\nMessage: "${firstMessage.slice(0, 200)}"`
      }]
    });

    const title = response.content[0].type === 'text'
      ? response.content[0].text.trim().replace(/^["']|["']$/g, '')
      : 'New Conversation';
    
    return title.length > 50 ? title.slice(0, 50) : title;
  } catch {
    // Fallback: use first few words of the message
    return firstMessage.slice(0, 40).replace(/\s+\S*$/, '') + '...';
  }
}

/**
 * Link an anonymous session to a user account (for cross-device sync).
 * Called when a user signs in — merges their anonymous session history into their account.
 */
export async function linkSessionToUser(
  sessionToken: string,
  userId: number
): Promise<void> {
  try {
    const { assistantSessions } = await import('@shared/schema');
    
    await db.update(assistantSessions)
      .set({ userId })
      .where(
        and(
          eq(assistantSessions.sessionToken, sessionToken),
          sql`${assistantSessions.userId} IS NULL`
        )
      );
  } catch (e) {
    console.log('Link session to user (non-blocking):', e);
  }
}
