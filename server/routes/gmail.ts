import type { Express } from "express";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { isAuthenticated } from "../auth";

function extractEmailBody(payload: any): string {
  if (!payload) return '';
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      const text = extractEmailBody(part);
      if (text) return text;
    }
  }
  return '';
}

async function getGmailForUser(req: any) {
  const user = req.user as any;
  const refreshToken = user?.gmailRefreshToken;
  if (!refreshToken) throw new Error('NOT_CONNECTED');
  const { getUncachableGmailClient } = await import("../gmail-client");
  return getUncachableGmailClient(refreshToken);
}

export function registerGmailRoutes(app: Express) {
  app.get("/api/gmail/redirect-uri", isAuthenticated, async (req, res) => {
    const appDomain = process.env.APP_DOMAIN || `${req.protocol}://${req.get('host')}`;
    const uri = `${appDomain}/api/gmail/callback`;
    res.json({ redirectUri: uri });
  });

  app.get("/api/gmail/auth", isAuthenticated, async (req, res) => {
    try {
      const { getAuthUrl } = await import("../gmail-client");
      const user = req.user as any;
      const url = getAuthUrl(user.id);
      res.redirect(url);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/gmail/callback", async (req, res) => {
    try {
      const code = req.query.code as string;
      const state = req.query.state as string;
      if (!code) return res.status(400).send('Missing authorization code from Google.');
      if (!state) return res.status(400).send('Missing state parameter.');

      const { getOAuth2Client, parseStateUserId } = await import("../gmail-client");
      const userId = parseStateUserId(state);
      if (!userId) return res.status(400).send('Invalid state parameter.');

      const oauth2Client = getOAuth2Client();
      const { tokens } = await oauth2Client.getToken(code);

      if (!tokens.refresh_token) {
        return res.redirect('/gmail-organizer?error=no_refresh_token');
      }

      await db.update(users).set({ gmailRefreshToken: tokens.refresh_token }).where(eq(users.id, userId));
      res.redirect('/gmail-organizer?connected=1');
    } catch (err: any) {
      console.error('Gmail callback error:', err.message);
      const errorCode = encodeURIComponent(err.message?.slice(0, 80) || 'oauth_failed');
      res.redirect(`/gmail-organizer?error=${errorCode}`);
    }
  });

  app.get("/api/gmail/status", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    res.json({ connected: !!user?.gmailRefreshToken });
  });

  app.post("/api/gmail/disconnect", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      await db.update(users).set({ gmailRefreshToken: null }).where(eq(users.id, user.id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/gmail/inbox", isAuthenticated, async (req, res) => {
    try {
      const gmail = await getGmailForUser(req);
      const maxResults = parseInt(String(req.query.maxResults || '25'));
      const pageToken = req.query.pageToken as string | undefined;
      const labelId = (req.query.label as string) || 'INBOX';

      const listRes = await gmail.users.messages.list({
        userId: 'me',
        maxResults,
        labelIds: [labelId],
        ...(pageToken ? { pageToken } : {}),
      });

      const messages = listRes.data.messages || [];
      const nextPageToken = listRes.data.nextPageToken || null;

      const details = await Promise.all(
        messages.slice(0, 25).map(async (m) => {
          const detail = await gmail.users.messages.get({
            userId: 'me',
            id: m.id!,
            format: 'metadata',
            metadataHeaders: ['From', 'To', 'Subject', 'Date'],
          });
          const headers = detail.data.payload?.headers || [];
          const h = (name: string) => headers.find((h: any) => h.name === name)?.value || '';
          return {
            id: m.id,
            threadId: m.threadId,
            snippet: detail.data.snippet,
            labelIds: detail.data.labelIds,
            isUnread: detail.data.labelIds?.includes('UNREAD'),
            from: h('From'),
            to: h('To'),
            subject: h('Subject'),
            date: h('Date'),
            internalDate: detail.data.internalDate,
          };
        })
      );

      res.json({ messages: details, nextPageToken });
    } catch (err: any) {
      console.error('Gmail inbox error:', err.message);
      if (err.message === 'NOT_CONNECTED') return res.status(403).json({ error: 'NOT_CONNECTED' });
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/gmail/message/:id", isAuthenticated, async (req, res) => {
    try {
      const gmail = await getGmailForUser(req);
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: req.params.id,
        format: 'full',
      });

      const headers = msg.data.payload?.headers || [];
      const h = (name: string) => headers.find((h: any) => h.name === name)?.value || '';

      res.json({
        id: msg.data.id,
        threadId: msg.data.threadId,
        labelIds: msg.data.labelIds,
        snippet: msg.data.snippet,
        from: h('From'),
        to: h('To'),
        subject: h('Subject'),
        date: h('Date'),
        body: extractEmailBody(msg.data.payload),
      });
    } catch (err: any) {
      console.error('Gmail message error:', err.message);
      if (err.message === 'NOT_CONNECTED') return res.status(403).json({ error: 'NOT_CONNECTED' });
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/gmail/label", isAuthenticated, async (req, res) => {
    try {
      const gmail = await getGmailForUser(req);
      const { messageId, addLabelIds = [], removeLabelIds = [] } = req.body;
      if (!messageId) return res.status(400).json({ error: 'messageId required' });
      await gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: { addLabelIds, removeLabelIds },
      });
      res.json({ success: true });
    } catch (err: any) {
      if (err.message === 'NOT_CONNECTED') return res.status(403).json({ error: 'NOT_CONNECTED' });
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/gmail/labels", isAuthenticated, async (req, res) => {
    try {
      const gmail = await getGmailForUser(req);
      const labelsRes = await gmail.users.labels.list({ userId: 'me' });
      res.json({ labels: labelsRes.data.labels || [] });
    } catch (err: any) {
      if (err.message === 'NOT_CONNECTED') return res.status(403).json({ error: 'NOT_CONNECTED' });
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/gmail/ai-organize", isAuthenticated, async (req, res) => {
    try {
      const { messageId } = req.body;
      if (!messageId) return res.status(400).json({ error: 'messageId required' });

      const gmail = await getGmailForUser(req);
      const msg = await gmail.users.messages.get({
        userId: 'me', id: messageId, format: 'full',
      });

      const headers = msg.data.payload?.headers || [];
      const h = (name: string) => headers.find((h: any) => h.name === name)?.value || '';
      const subject = h('Subject');
      const from = h('From');
      const body = extractEmailBody(msg.data.payload).slice(0, 2000);

      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const aiRes = await client.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: `You are Simplicity, the AI assistant inside Simpleton™. Analyze this email and respond with a JSON object only (no markdown):
{
  "summary": "2-3 sentence summary of the email",
  "category": "one of: Finance, Work, Personal, Shopping, Newsletter, Spam, Travel, Healthcare, Legal, Other",
  "priority": "one of: High, Medium, Low",
  "suggestedAction": "one brief suggested action",
  "sentiment": "one of: Positive, Neutral, Negative, Urgent"
}

Email:
From: ${from}
Subject: ${subject}
Body: ${body}`
        }]
      });

      const text = (aiRes.content[0] as any).text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: text, category: 'Other', priority: 'Medium', suggestedAction: 'Review', sentiment: 'Neutral' };

      res.json({ analysis });
    } catch (err: any) {
      console.error('Gmail AI organize error:', err.message);
      if (err.message === 'NOT_CONNECTED') return res.status(403).json({ error: 'NOT_CONNECTED' });
      res.status(500).json({ error: err.message });
    }
  });
}
