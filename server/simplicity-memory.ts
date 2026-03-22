import { db } from './db';
import { userMemories } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export interface MemoryFact {
  category: string;
  key: string;
  value: string;
  confidence: number;
}

export async function getUserMemories(userId: number) {
  return db.select().from(userMemories)
    .where(eq(userMemories.userId, userId))
    .orderBy(userMemories.category, userMemories.lastReinforced);
}

export async function saveMemory(userId: number, fact: MemoryFact) {
  try {
    const existing = await db.select().from(userMemories)
      .where(and(eq(userMemories.userId, userId), eq(userMemories.memoryKey, fact.key)))
      .limit(1);

    if (existing.length > 0) {
      const prevConf = parseFloat(existing[0].confidence || '0.75');
      const newConf = Math.min(0.99, prevConf * 0.4 + fact.confidence * 0.6 + 0.05);
      await db.update(userMemories).set({
        memoryValue: fact.value,
        confidence: String(newConf),
        timesReinforced: existing[0].timesReinforced + 1,
        lastReinforced: new Date(),
      }).where(and(eq(userMemories.userId, userId), eq(userMemories.memoryKey, fact.key)));
    } else {
      await db.insert(userMemories).values({
        userId,
        category: fact.category,
        memoryKey: fact.key,
        memoryValue: fact.value,
        confidence: String(fact.confidence),
      });
    }
  } catch (e) {
    // non-blocking
  }
}

export async function deleteMemory(userId: number, memoryId: number) {
  await db.delete(userMemories)
    .where(and(eq(userMemories.userId, userId), eq(userMemories.id, memoryId)));
}

export async function extractAndSaveMemories(userId: number, userMessage: string, aiResponse: string): Promise<void> {
  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = `You are Simplicity's memory system. Your job is to learn everything meaningful about this user so future conversations feel personal, informed, and continuous.

Extract ALL of the following from the conversation exchange below:
- Personal identity: name, age, location, occupation, business type
- What they own or collect: specific jewelry, coins, metals, watches, diamonds (capture exact details — "10K gold Franco chain 22.7g", "1oz American Eagle", "1.2ct D VS1 diamond")
- What they're trying to do: buy, sell, appraise, invest, learn, authenticate
- Revealed preferences: styles they like, metals they prefer, price ranges they work in
- Professional context: are they a dealer, jeweler, investor, collector, hobbyist?
- Knowledge level: are they a beginner asking basics, or an expert using trade terminology?
- Topics they care about: recurring themes, what they ask about repeatedly
- Anything personal they mentioned in passing

Be LIBERAL. If the user revealed something meaningful through what they said or how they said it, capture it. You do NOT need an explicit declaration — inferences with high confidence count.

Categories to use: identity, collections, assets, interests, preferences, goals, expertise, context

User said: "${userMessage.slice(0, 800)}"
Simplicity responded: "${aiResponse.slice(0, 400)}"

Respond with ONLY a JSON array (no markdown, no explanation):
[{"category":"collections","key":"chain_owned","value":"10K gold Franco chain, 22.7g","confidence":0.95}]

Return [] only if the conversation contains zero meaningful personal information.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '[]';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return;

    const facts: MemoryFact[] = JSON.parse(jsonMatch[0]);
    for (const fact of facts.slice(0, 8)) {
      if (fact.key && fact.value && typeof fact.confidence === 'number' && fact.confidence >= 0.60) {
        await saveMemory(userId, fact);
      }
    }
  } catch (e) {
    // non-blocking — memory extraction never interrupts the main flow
  }
}

export function formatMemoriesForPrompt(memories: { category: string; memoryKey: string; memoryValue: string; timesReinforced?: number }[]): string {
  if (!memories.length) return '';

  const grouped: Record<string, string[]> = {};
  for (const m of memories) {
    const cat = m.category || 'facts';
    if (!grouped[cat]) grouped[cat] = [];
    const reinforced = m.timesReinforced && m.timesReinforced > 1 ? ` (mentioned ${m.timesReinforced}x)` : '';
    grouped[cat].push(`${m.memoryKey}: ${m.memoryValue}${reinforced}`);
  }

  const lines = Object.entries(grouped)
    .map(([cat, facts]) => `  ${cat.toUpperCase()}: ${facts.join(' | ')}`)
    .join('\n');

  return `\n\nSIMPLICITY MEMORY — WHAT YOU KNOW ABOUT THIS PERSON (built across all their sessions):
${lines}

MEMORY USAGE RULES — NON-NEGOTIABLE:
- If you know their name, use it naturally throughout the conversation.
- If they've mentioned specific items they own, reference those items directly when relevant — don't make them repeat themselves.
- If you know their expertise level, calibrate your explanations accordingly.
- If they have recurring goals or interests, proactively connect those to what you're discussing.
- Acknowledge new information they share and connect it to what you already know about them.
- Never say "as an AI I don't have memory of past conversations" — you DO remember this person.\n`;
}
