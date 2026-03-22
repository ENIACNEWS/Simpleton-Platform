import Anthropic from '@anthropic-ai/sdk';
import { db } from './db';
import { emailConversations, emailMessages } from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { getUncachableSendGridClient } from './sendgrid-client';

const INTEL_EMAIL = 'INTEL@simpletonapp.com';

const SYSTEM_PROMPT = `You are Simplicity INTEL, the AI-powered email intelligence system for Simpleton Vision™ — the world's premier precious metals, diamonds, watches, and collectibles intelligence platform.

Your role: Respond to emails sent to INTEL@simpletonapp.com with expert, helpful, and professional answers. You represent a premium brand that competes with Bloomberg Terminal-level intelligence at a fraction of the cost.

Your expertise covers:
- Precious metals (gold, silver, platinum, palladium) — pricing, market trends, investment strategies
- Diamond pricing and grading (GIA, AGS standards), lab-grown vs natural
- Luxury watches (especially Rolex) — authentication, valuation, market trends
- Numismatics — US gold and silver coins, melt values, collectible premiums
- General market intelligence and portfolio strategy
- Simpleton Vision™ platform features, subscriptions, and capabilities

Response guidelines:
1. Be warm, professional, and knowledgeable — like a trusted advisor at a high-end firm
2. Provide actionable insights, not just generic information
3. When discussing prices or values, note that real-time data is available on the Simpleton Vision™ platform
4. Sign off as "Simplicity INTEL" with a professional closing
5. Keep responses concise but thorough — aim for 200-400 words unless the topic requires more
6. If asked about something outside your expertise, acknowledge it honestly and redirect to relevant resources
7. Always invite them to explore the platform for real-time data: simpletonapp.com
8. Format responses in clean, readable plain text (no markdown since this is email)

Tone: Confident, knowledgeable, approachable. Think "Goldman Sachs meets friendly neighborhood expert."`;

export async function generateAIResponse(
  senderEmail: string,
  senderName: string | null,
  subject: string,
  bodyText: string,
  conversationHistory: { role: string; content: string }[] = []
): Promise<{ response: string; model: string; tokensUsed: number; processingTimeMs: number }> {
  const startTime = Date.now();

  const anthropic = new Anthropic();

  const messages: Anthropic.MessageParam[] = [
    ...conversationHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    {
      role: 'user' as const,
      content: `From: ${senderName ? `${senderName} <${senderEmail}>` : senderEmail}\nSubject: ${subject}\n\n${bodyText}`,
    },
  ];

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages,
  });

  const responseText = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map(block => block.text)
    .join('\n');

  const processingTimeMs = Date.now() - startTime;
  const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

  return {
    response: responseText,
    model: 'claude-sonnet-4-20250514',
    tokensUsed,
    processingTimeMs,
  };
}

export async function findOrCreateConversation(
  senderEmail: string,
  senderName: string | null,
  subject: string
): Promise<number> {
  const normalizedSubject = subject.replace(/^(Re:|Fwd:|FW:)\s*/gi, '').trim();

  const existing = await db
    .select()
    .from(emailConversations)
    .where(
      and(
        eq(emailConversations.senderEmail, senderEmail),
        eq(emailConversations.subject, normalizedSubject),
        eq(emailConversations.status, 'active')
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  const [conversation] = await db
    .insert(emailConversations)
    .values({
      senderEmail,
      senderName,
      subject: normalizedSubject,
      status: 'active',
      messageCount: 0,
    })
    .returning();

  return conversation.id;
}

export async function getConversationHistory(conversationId: number): Promise<{ role: string; content: string }[]> {
  const messages = await db
    .select()
    .from(emailMessages)
    .where(eq(emailMessages.conversationId, conversationId))
    .orderBy(emailMessages.createdAt);

  return messages.map(msg => ({
    role: msg.direction === 'inbound' ? 'user' : 'assistant',
    content: msg.bodyText || '',
  }));
}

export async function processInboundEmail(params: {
  from: string;
  fromName?: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  headers?: Record<string, string>;
  attachments?: { filename: string; type: string; size: number }[];
}): Promise<{ success: boolean; conversationId: number; responseId: number }> {
  const { from, fromName, subject, text, html, headers, attachments } = params;

  const conversationId = await findOrCreateConversation(from, fromName || null, subject);

  const [inboundMsg] = await db
    .insert(emailMessages)
    .values({
      conversationId,
      direction: 'inbound',
      fromEmail: from,
      toEmail: INTEL_EMAIL,
      subject,
      bodyText: text,
      bodyHtml: html || null,
      metadata: { headers: headers || {}, attachments: attachments || [] },
    })
    .returning();

  await db
    .update(emailConversations)
    .set({
      messageCount: sql`${emailConversations.messageCount} + 1`,
      lastMessageAt: new Date(),
    })
    .where(eq(emailConversations.id, conversationId));

  const history = await getConversationHistory(conversationId);
  const previousMessages = history.slice(0, -1);

  const aiResult = await generateAIResponse(from, fromName || null, subject, text, previousMessages);

  const [outboundMsg] = await db
    .insert(emailMessages)
    .values({
      conversationId,
      direction: 'outbound',
      fromEmail: INTEL_EMAIL,
      toEmail: from,
      subject: `Re: ${subject}`,
      bodyText: aiResult.response,
      bodyHtml: formatEmailHtml(aiResult.response, subject),
      aiModel: aiResult.model,
      metadata: {
        processingTimeMs: aiResult.processingTimeMs,
        tokensUsed: aiResult.tokensUsed,
      },
    })
    .returning();

  await db
    .update(emailConversations)
    .set({
      messageCount: sql`${emailConversations.messageCount} + 1`,
      lastMessageAt: new Date(),
    })
    .where(eq(emailConversations.id, conversationId));

  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    await client.send({
      to: from,
      from: { email: fromEmail, name: 'Simplicity INTEL' },
      replyTo: { email: INTEL_EMAIL, name: 'Simplicity INTEL' },
      subject: `Re: ${subject}`,
      text: aiResult.response,
      html: formatEmailHtml(aiResult.response, subject),
    });
    console.log(`📧 INTEL: Auto-reply sent to ${from} for conversation #${conversationId}`);
  } catch (err) {
    console.error('📧 INTEL: Failed to send reply via SendGrid:', err);
  }

  return { success: true, conversationId, responseId: outboundMsg.id };
}

function formatEmailHtml(text: string, subject: string): string {
  const paragraphs = text.split('\n\n').map(p => `<p style="margin: 0 0 16px 0; line-height: 1.6;">${p.replace(/\n/g, '<br>')}</p>`).join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Georgia', serif; color: #1a1a2e; background-color: #f8f9fa; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 24px 32px; border-radius: 12px 12px 0 0;">
      <h1 style="color: #d4af37; margin: 0; font-size: 20px; letter-spacing: 1px;">SIMPLICITY INTEL</h1>
      <p style="color: #8899aa; margin: 4px 0 0 0; font-size: 12px;">Simpleton Vision™ Intelligence Division</p>
    </div>
    <div style="background: #ffffff; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e8e8e8; border-top: none;">
      <p style="color: #666; font-size: 12px; margin: 0 0 20px 0;">RE: ${subject}</p>
      ${paragraphs}
    </div>
    <div style="text-align: center; padding: 20px; color: #999; font-size: 11px;">
      <p style="margin: 0;">Powered by Simpleton Vision™ — Data Intelligence, Simplified</p>
      <p style="margin: 4px 0 0 0;"><a href="https://simpletonapp.com" style="color: #d4af37; text-decoration: none;">simpletonapp.com</a></p>
    </div>
  </div>
</body>
</html>`;
}

export async function getEmailStats() {
  const totalConversations = await db.select({ count: sql<number>`count(*)` }).from(emailConversations);
  const activeConversations = await db.select({ count: sql<number>`count(*)` }).from(emailConversations).where(eq(emailConversations.status, 'active'));
  const totalMessages = await db.select({ count: sql<number>`count(*)` }).from(emailMessages);
  const outboundMessages = await db.select({ count: sql<number>`count(*)` }).from(emailMessages).where(eq(emailMessages.direction, 'outbound'));

  const recentConversations = await db
    .select()
    .from(emailConversations)
    .orderBy(desc(emailConversations.lastMessageAt))
    .limit(20);

  return {
    totalConversations: Number(totalConversations[0]?.count || 0),
    activeConversations: Number(activeConversations[0]?.count || 0),
    totalMessages: Number(totalMessages[0]?.count || 0),
    autoRepliesSent: Number(outboundMessages[0]?.count || 0),
    recentConversations,
  };
}

export async function getConversationWithMessages(conversationId: number) {
  const conversation = await db
    .select()
    .from(emailConversations)
    .where(eq(emailConversations.id, conversationId))
    .limit(1);

  if (!conversation.length) return null;

  const messages = await db
    .select()
    .from(emailMessages)
    .where(eq(emailMessages.conversationId, conversationId))
    .orderBy(emailMessages.createdAt);

  return { ...conversation[0], messages };
}

export async function getAllConversations() {
  return db
    .select()
    .from(emailConversations)
    .orderBy(desc(emailConversations.lastMessageAt));
}

export async function updateConversationStatus(conversationId: number, status: string) {
  return db
    .update(emailConversations)
    .set({ status })
    .where(eq(emailConversations.id, conversationId));
}
