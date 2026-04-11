// ============================================
// AGENT API ROUTES — Management, triggers, and monitoring
// ============================================

import { Router } from "express";
import { db } from "../db";
import { agentTasks, agentDefinitions } from "../../shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { runAgent, agentScheduler, getAllAgentConfigs, getAgentConfig } from "../agents";

const router = Router();

// ── GET /api/agents/status — Full system status ────────────
router.get("/status", async (_req, res) => {
  try {
    const status = await agentScheduler.getStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/agents/configs — List all agent configs ───────
router.get("/configs", (_req, res) => {
  const configs = getAllAgentConfigs().map((c) => ({
    agentId: c.agentId,
    name: c.name,
    product: c.product,
    model: c.model,
    schedule: c.schedule,
    description: c.description,
  }));
  res.json(configs);
});

// ── GET /api/agents/tasks — Recent task history ────────────
router.get("/tasks", async (req, res) => {
  try {
    const agentId = req.query.agent as string | undefined;
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;

    let tasks;
    if (agentId) {
      tasks = await db
        .select()
        .from(agentTasks)
        .where(eq(agentTasks.agentId, agentId))
        .orderBy(desc(agentTasks.createdAt))
        .limit(limit)
        .offset(offset);
    } else {
      tasks = await db
        .select()
        .from(agentTasks)
        .orderBy(desc(agentTasks.createdAt))
        .limit(limit)
        .offset(offset);
    }

    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/agents/tasks/:id — Single task detail ─────────
router.get("/tasks/:id", async (req, res) => {
  try {
    const [task] = await db
      .select()
      .from(agentTasks)
      .where(eq(agentTasks.id, Number(req.params.id)))
      .limit(1);

    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/agents/run — Manually trigger an agent ───────
router.post("/run", async (req, res) => {
  try {
    const { agentId, input, deliveryMethod, deliveredTo } = req.body;

    if (!agentId || !input) {
      return res.status(400).json({ error: "agentId and input are required" });
    }

    const config = getAgentConfig(agentId);
    if (!config) {
      return res.status(404).json({ error: `Unknown agent: ${agentId}` });
    }

    // Create task record
    const [task] = await db
      .insert(agentTasks)
      .values({
        agentId,
        taskType: "manual",
        trigger: "manual",
        status: "pending",
        priority: 3,
        input,
        deliveryMethod: deliveryMethod || "dashboard",
        deliveredTo: deliveredTo || config.deliveryEmail,
      })
      .returning();

    // Run async
    runAgent(agentId, input, {
      taskId: task.id,
      deliveryMethod: deliveryMethod || "dashboard",
      deliveredTo: deliveredTo || config.deliveryEmail,
    }).catch((err) => {
      console.error(`[AgentRoute] Manual run failed:`, err.message);
    });

    res.json({
      message: `${config.name} dispatched`,
      taskId: task.id,
      agentId,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/agents/dispatch — Inbound message trigger (for Dispatch agent) ──
router.post("/dispatch", async (req, res) => {
  try {
    const { from, subject, body, source } = req.body;

    if (!body) {
      return res.status(400).json({ error: "body is required" });
    }

    const input = `Incoming inquiry from ${from || "unknown sender"}${subject ? ` — Subject: "${subject}"` : ""}${source ? ` (via ${source})` : ""}:

${body}

Draft a professional response.`;

    const [task] = await db
      .insert(agentTasks)
      .values({
        agentId: "dispatch",
        taskType: "triggered",
        trigger: "webhook",
        status: "pending",
        priority: 3,
        input,
        deliveryMethod: "email",
        deliveredTo: "demiris@simpletonapp.com",
      })
      .returning();

    runAgent("dispatch", input, {
      taskId: task.id,
      deliveryMethod: "email",
      deliveredTo: "demiris@simpletonapp.com",
    }).catch((err) => {
      console.error("[AgentRoute] Dispatch trigger failed:", err.message);
    });

    res.json({ message: "Dispatch agent triggered", taskId: task.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/agents/alert — Security alert trigger (for Sentinel) ──
router.post("/alert", async (req, res) => {
  try {
    const { source, severity, description, data } = req.body;

    if (!description) {
      return res.status(400).json({ error: "description is required" });
    }

    const input = `🚨 SECURITY ALERT — ${severity?.toUpperCase() || "UNKNOWN"} SEVERITY
Source: ${source || "External monitor"}
Time: ${new Date().toISOString()}

${description}

${data ? `Raw data:\n${typeof data === "string" ? data : JSON.stringify(data, null, 2)}` : ""}

Analyze this alert. Classify severity, identify the threat, and provide immediate recommended actions.`;

    const [task] = await db
      .insert(agentTasks)
      .values({
        agentId: "sentinel",
        taskType: "triggered",
        trigger: "alert",
        status: "pending",
        priority: severity === "critical" ? 1 : severity === "high" ? 2 : 3,
        input,
        deliveryMethod: "email",
        deliveredTo: "demiris@simpletonapp.com",
      })
      .returning();

    runAgent("sentinel", input, {
      taskId: task.id,
      deliveryMethod: "email",
      deliveredTo: "demiris@simpletonapp.com",
    }).catch((err) => {
      console.error("[AgentRoute] Sentinel alert failed:", err.message);
    });

    res.json({ message: "Sentinel alerted", taskId: task.id, severity });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/agents/toggle — Enable/disable an agent ─────
router.post("/toggle", async (req, res) => {
  try {
    const { agentId, isActive } = req.body;

    if (!agentId || typeof isActive !== "boolean") {
      return res.status(400).json({ error: "agentId and isActive (boolean) required" });
    }

    await db
      .update(agentDefinitions)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(agentDefinitions.agentId, agentId));

    res.json({ message: `${agentId} ${isActive ? "activated" : "paused"}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/agents/stats — Aggregate stats ────────────────
router.get("/stats", async (_req, res) => {
  try {
    const result = await db.execute(sql`
      SELECT
        COUNT(*) as total_tasks,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_tasks,
        COUNT(*) FILTER (WHERE status = 'running') as running_tasks,
        COALESCE(SUM(input_tokens), 0) as total_input_tokens,
        COALESCE(SUM(output_tokens), 0) as total_output_tokens,
        COALESCE(AVG(duration_ms), 0) as avg_duration_ms,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as tasks_24h,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as tasks_7d
      FROM agent_tasks
    `);
    const stats = (result as any).rows?.[0] || result;

    const agents = await db.select().from(agentDefinitions);

    res.json({
      overview: stats,
      agents: agents.map((a) => ({
        agentId: a.agentId,
        name: a.name,
        isActive: a.isActive,
        totalRuns: a.totalRuns,
        totalTokens: a.totalTokens,
        lastRunAt: a.lastRunAt,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export function registerAgentRoutes(app: any): void {
  app.use("/api/agents", router);
  console.log("[Agents] API routes registered");
}
