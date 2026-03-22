import type { Express } from "express";

export function registerAssistantRoutes(app: Express) {
  app.get("/api/chat/history", async (req, res) => {
    try {
      const sessionToken = req.query.sessionToken as string;
      if (!sessionToken) return res.json({ messages: [] });
      const { db } = await import('../db');
      const { assistantSessions, assistantMessages } = await import('../../shared/schema');
      const { eq, desc, asc } = await import('drizzle-orm');
      const [session] = await db.select().from(assistantSessions).where(eq(assistantSessions.sessionToken, sessionToken)).limit(1);
      if (!session) return res.json({ messages: [], userName: null });
      const msgs = await db.select().from(assistantMessages).where(eq(assistantMessages.sessionId, session.id)).orderBy(asc(assistantMessages.createdAt), asc(assistantMessages.id)).limit(100);
      res.json({ messages: msgs, userName: session.userProfile?.name || null });
    } catch (error) {
      console.error('Chat history error:', error);
      res.json({ messages: [] });
    }
  });

  app.post("/api/chat/save", async (req, res) => {
    try {
      const { sessionToken, userMessage, assistantMessage, metadata, userName } = req.body;
      if (!sessionToken || !userMessage) return res.status(400).json({ error: 'Missing data' });
      const { db } = await import('../db');
      const { assistantSessions, assistantMessages } = await import('../../shared/schema');
      const { eq } = await import('drizzle-orm');

      let [session] = await db.select().from(assistantSessions).where(eq(assistantSessions.sessionToken, sessionToken)).limit(1);
      if (!session) {
        const [newSession] = await db.insert(assistantSessions).values({
          sessionToken,
          messageCount: 0,
          userProfile: userName ? { name: userName } : undefined,
        }).returning();
        session = newSession;
      }

      if (userName && (!session.userProfile?.name || session.userProfile.name !== userName)) {
        await db.update(assistantSessions)
          .set({ userProfile: { ...session.userProfile, name: userName } })
          .where(eq(assistantSessions.id, session.id));
      }

      await db.insert(assistantMessages).values([
        { sessionId: session.id, role: 'user', content: userMessage, pageContext: '/ai-chat' },
        { sessionId: session.id, role: 'assistant', content: assistantMessage || '', metadata: metadata || {}, pageContext: '/ai-chat' },
      ]);

      await db.update(assistantSessions)
        .set({ messageCount: (session.messageCount || 0) + 2, lastActiveAt: new Date() })
        .where(eq(assistantSessions.id, session.id));

      res.json({ success: true });
    } catch (error) {
      console.error('Chat save error:', error);
      res.json({ success: false });
    }
  });

  app.post("/api/chat/set-name", async (req, res) => {
    try {
      const { sessionToken, name } = req.body;
      if (!sessionToken || !name) return res.status(400).json({ error: 'Missing data' });
      const { db } = await import('../db');
      const { assistantSessions } = await import('../../shared/schema');
      const { eq } = await import('drizzle-orm');

      const [session] = await db.select().from(assistantSessions).where(eq(assistantSessions.sessionToken, sessionToken)).limit(1);
      if (session) {
        await db.update(assistantSessions)
          .set({ userProfile: { ...session.userProfile, name } })
          .where(eq(assistantSessions.id, session.id));
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Set name error:', error);
      res.json({ success: false });
    }
  });

  app.post("/api/assistant/session", async (req, res) => {
    try {
      const { sessionToken, page } = req.body;
      if (!sessionToken || typeof sessionToken !== 'string') {
        return res.status(400).json({ error: "sessionToken is required" });
      }
      const { buildSimplicityPrompt } = await import('../simplicity-brain');
      const { session, history } = await buildSimplicityPrompt(sessionToken, page || null);

      const formattedHistory = history.map(m => ({
        id: m.id.toString(),
        type: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: m.createdAt,
        metadata: m.metadata,
        pageContext: m.pageContext,
      }));

      res.json({
        sessionId: session.id,
        messageCount: session.messageCount,
        userProfile: session.userProfile,
        history: formattedHistory,
        isReturning: session.messageCount > 0,
      });
    } catch (error) {
      console.error('❌ Session init error:', error);
      res.json({ sessionId: 0, messageCount: 0, history: [], isReturning: false });
    }
  });

  app.post("/api/assistant/speak", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: "text is required" });
      }

      const cleanText = text
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]*`/g, '')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        .replace(/~~([^~]+)~~/g, '$1')
        .replace(/#{1,6}\s+/g, '')
        .replace(/^\s*[-*+]\s+/gm, '')
        .replace(/^\s*\d+\.\s+/gm, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/[|]/g, '')
        .replace(/[-]{3,}/g, '')
        .replace(/[=]{3,}/g, '')
        .replace(/\n{2,}/g, '. ')
        .replace(/\n/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();

      const truncated = cleanText.length > 4000 ? cleanText.substring(0, 4000) : cleanText;

      if (!truncated) {
        return res.status(400).json({ error: "No speakable text" });
      }

      res.json({
        useBrowserTTS: true,
        text: truncated,
        voice: 'shimmer',
      });
    } catch (error: any) {
      console.error('❌ TTS error:', error);
      res.status(500).json({ error: "Failed to generate speech", useBrowserTTS: true });
    }
  });

  app.post("/api/assistant/help", async (req, res) => {
    try {
      console.log('🤖 Simplicity Chat Request received - PRIORITY ROUTE');
      
      const { message, context, sessionToken, pageContext, appContext, stream } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          error: "Message is required and must be a string"
        });
      }

      const { buildSimplicityPrompt, saveInteraction } = await import('../simplicity-brain');
      
      let systemPrompt: string;
      let session: any = null;
      const chatUserId = (req as any).user?.id || null;
      
      if (sessionToken) {
        const brain = await buildSimplicityPrompt(sessionToken, pageContext || null, message, chatUserId || undefined);
        systemPrompt = brain.systemPrompt;
        session = brain.session;
        if (brain.knowledgeUsed > 0) {
          console.log(`📚 Simplicity used ${brain.knowledgeUsed} knowledge entries for this response`);
        }
      } else {
        systemPrompt = `You are Simplicity, the world-class AI expert for Simpleton™. Context: ${context || 'full_expert'}`;
      }

      if (appContext && typeof appContext === 'string') {
        systemPrompt += "\n\n" + appContext;
      }

      const withTimeout = <T>(p: Promise<T>, ms: number, label: string): Promise<T> => {
        let t: NodeJS.Timeout;
        const timer = new Promise<never>((_, rej) => { t = setTimeout(() => rej(new Error(`${label} timed out`)), ms); });
        return Promise.race([p.finally(() => clearTimeout(t)), timer]);
      };

      const liveDataPattern = /current\s*price|spot\s*price|how\s*much\s*is|what.*worth|price\s*today|live\s*price|melt\s*value|today.*price|gold.*price|silver.*price|platinum.*price|per\s*oz|per\s*ounce|per\s*carat|\$\d|calculate.*value|coin.*value|rolex.*value|diamond.*price|alert\s*me|notify\s*me|price\s*alert|watch.*price|tell\s*me\s*when|i\s*sold|i\s*bought|log.*sale|record.*transaction|closed\s*a\s*deal|apprais|what\s*is\s*this\s*worth|valuat|predict|forecast|where.*headed|simpleton\s*index|real.*price|dealer.*pay|market\s*memory/i;
      const needsLiveData = liveDataPattern.test(message);

      let responseText: string | null = null;
      let activeProviders: string[] = [];
      let confidenceScore = 0.85;
      let processingTime = 0;
      let toolsUsed: string[] = [];

      const betaStart = Date.now();

      if (needsLiveData) {
        try {
          const { simplicityWithTools } = await import('../ai-tools');
          const toolResult = await withTimeout(simplicityWithTools(systemPrompt, message, 1200, chatUserId), 11000, 'Tool Calls');
          responseText = toolResult.text;
          activeProviders = [toolResult.model];
          confidenceScore = 0.95;
          processingTime = Date.now() - betaStart;
          toolsUsed = toolResult.toolsUsed;
          console.log(`✅ Tool Calls (${toolResult.toolsUsed.join(', ') || 'no tools'}): ${processingTime}ms`);
        } catch (toolErr: any) {
          console.log(`⚠️ Tool Calls failed/timed out (${toolErr?.message}), using fast provider...`);
        }
      } else {
        console.log(`⚡ Fast path: routing directly to Claude (no live data needed)`);
      }

      if (!responseText) {
        try {
          const { multiProviderAI } = await import('../ai-engine');
          const fastResult = await withTimeout(
            multiProviderAI.processSingle(message, systemPrompt),
            14000,
            'Fast provider'
          );
          responseText = fastResult.response;
          activeProviders = [`${fastResult.provider}/${fastResult.model}`];
          confidenceScore = 0.93;
          processingTime = Date.now() - betaStart;
          console.log(`✅ Fast provider (${fastResult.provider}): ${processingTime}ms`);
        } catch (fastErr: any) {
          console.log(`⚠️ Fast provider failed (${fastErr?.message}), falling back to multi-AI provider`);
        }
      }

      if (!responseText) {
        try {
          const { multiAIProvider } = await import('../multi-ai-provider');
          console.log('🤖 Multi-AI Provider: Querying all available providers...');
          const consensusResult = await withTimeout(
            multiAIProvider.queryWithConsensus(message, systemPrompt),
            20000,
            'Multi-AI consensus'
          );

          responseText = consensusResult.bestResponse;
          activeProviders = consensusResult.responses.map((r: any) => r.provider);
          confidenceScore = consensusResult.confidence === 'high' ? 0.95 : consensusResult.confidence === 'medium' ? 0.85 : 0.75;
          processingTime = Date.now() - betaStart;
          console.log(`✅ Multi-AI (${activeProviders.join(', ')}): ${processingTime}ms [${consensusResult.confidence} confidence]`);
        } catch (multiErr: any) {
          console.log(`❌ Multi-AI failed (${multiErr?.message})`);
          return res.status(500).json({
            error: "Unable to generate response at this time",
            response: "I'm having trouble connecting to my knowledge systems. Please try again in a moment.",
            activeProviders: [],
            confidenceScore: 0,
            processingTime: 0
          });
        }
      }

      const responseData = {
        response: responseText,
        activeProviders,
        confidenceScore,
        processingTime,
        toolsUsed,
      };

      if (session) {
        try {
          await saveInteraction(session, message, responseText!, pageContext || null, {
            providers: responseData.activeProviders,
            confidence: responseData.confidenceScore,
            processingTime: responseData.processingTime,
          });
        } catch (saveErr) {
          console.log('⚠️ Could not save conversation (non-blocking):', saveErr);
        }

        if (chatUserId) {
          import('../simplicity-memory').then(({ extractAndSaveMemories }) => {
            extractAndSaveMemories(chatUserId, message, responseText!).catch(() => {});
          }).catch(() => {});
        }
      }

      if (stream && responseText) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const words = responseText.split(/(\s+)/);
        let i = 0;
        const chunkSize = 3;
        const interval = setInterval(() => {
          if (i >= words.length) {
            res.write(`data: ${JSON.stringify({ metadata: { providers: activeProviders, confidence: confidenceScore, processingTime, toolsUsed } })}\n\n`);
            res.write('data: [DONE]\n\n');
            clearInterval(interval);
            res.end();
            return;
          }
          const token = words.slice(i, i + chunkSize).join('');
          res.write(`data: ${JSON.stringify({ token })}\n\n`);
          i += chunkSize;
        }, 30);

        req.on('close', () => clearInterval(interval));
        return;
      }

      res.json(responseData);

    } catch (error) {
      console.error('❌ Simplicity Chat Error:', error);
      res.status(500).json({
        error: "Internal server error",
        response: "I apologize, but I'm experiencing technical difficulties. Please try again or contact support if the issue persists.",
        activeProviders: [],
        confidenceScore: 0,
        processingTime: 0
      });
    }
  });
}
