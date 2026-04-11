// ============================================
// AUTONOMOUS SCHEDULER — Persistent cron-style agent execution
// Parses cron expressions and runs agents on schedule
// ============================================

import { db } from "../db";
import { agentTasks, agentDefinitions } from "../../shared/schema";
import { eq, and, lte, isNull } from "drizzle-orm";
import { AGENT_CONFIGS, type AgentConfig } from "./config";
import { runAgent } from "./runner";
import { collectSecurityTelemetry, formatTelemetryForPrompt } from "./sentinel-collector";

// Simple cron parser for: minute hour dayOfMonth month dayOfWeek
function parseCron(expr: string): { minute: number[]; hour: number[]; dom: number[]; month: number[]; dow: number[] } {
  const parts = expr.split(" ");
  if (parts.length !== 5) throw new Error(`Invalid cron: ${expr}`);
  return {
    minute: parseField(parts[0], 0, 59),
    hour: parseField(parts[1], 0, 23),
    dom: parseField(parts[2], 1, 31),
    month: parseField(parts[3], 1, 12),
    dow: parseField(parts[4], 0, 6),
  };
}

function parseField(field: string, min: number, max: number): number[] {
  if (field === "*") return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  if (field.includes(",")) return field.split(",").flatMap((f) => parseField(f, min, max));
  if (field.includes("-")) {
    const [a, b] = field.split("-").map(Number);
    return Array.from({ length: b - a + 1 }, (_, i) => a + i);
  }
  if (field.includes("/")) {
    const [base, step] = field.split("/");
    const s = Number(step);
    const start = base === "*" ? min : Number(base);
    const result: number[] = [];
    for (let i = start; i <= max; i += s) result.push(i);
    return result;
  }
  return [Number(field)];
}

function shouldRunNow(cron: ReturnType<typeof parseCron>, now: Date): boolean {
  return (
    cron.minute.includes(now.getMinutes()) &&
    cron.hour.includes(now.getHours()) &&
    cron.dom.includes(now.getDate()) &&
    cron.month.includes(now.getMonth() + 1) &&
    cron.dow.includes(now.getDay())
  );
}

// Task prompts for scheduled runs (sync or async)
const SCHEDULED_PROMPTS: Record<string, () => string | Promise<string>> = {
  sentinel: async () => {
    try {
      const telemetry = await collectSecurityTelemetry();
      return formatTelemetryForPrompt(telemetry);
    } catch (err: any) {
      return `Security telemetry collection failed: ${err.message}. Run a general threat assessment based on your knowledge of the infrastructure. Report this collection failure as a 🟡 MEDIUM finding.`;
    }
  },

  pulse: () => `Run your hourly health check for ${new Date().toISOString()}.

Check the following and report status:
1. Is the Simpletonapp server responding? (assume yes if this message reaches you — the server is running)
2. Review any recent error patterns you're aware of
3. Check if Anthropic API is operational (you're responding, so yes)
4. Memory and performance status

Provide a brief status report with severity classification. If everything is green, say so concisely. Only flag issues that need attention.`,

  ledger: () => `Generate the daily financial and usage summary for ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}.

Based on what you know about Simpleton Technologies' cost structure, provide:
1. Estimated daily API costs (Anthropic, Vehicle Databases, SendGrid)
2. Key metrics to watch
3. One actionable recommendation

Note: You may not have access to real-time billing data. Provide your best analysis based on the operational patterns you know about and flag what data you'd need for a more precise report.`,

  market: () => {
    const hour = new Date().getHours();
    const slot = hour < 10 ? "morning" : hour < 15 ? "afternoon" : "evening";
    return `Generate ${slot} social media content for ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}.

Create 3 ready-to-post pieces:
1. TikTok/X — punchy, hook-first, under 150 characters
2. Instagram — visual concept description + caption
3. Facebook — educational post, 2-3 paragraphs

Topic rotation: Pick from product features, industry tips, founder story, market data insights, or social proof. Mix it up from yesterday.

For each post, include: [Platform] [Content] [Hashtags] [Best posting time]`;
  },

  scout: () => `Weekly lead research report for ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}.

Research and profile 5 potential customers for Simpleton Technologies:
1. 3 pawn shops in the Midwest (Michigan, Ohio, Indiana preferred)
2. 1 used auto dealer in the Detroit metro area
3. 1 potential industry partner or association

For each target provide:
- Business name, city, state
- Estimated size (single location vs. chain)
- Best product fit (SimpliFaxs, Simpletonapp, or both)
- Suggested plan tier ($299 or $499)
- One-line personalized outreach hook
- Any public contact info you're confident about

Flag targets that look like high-value early adopters.`,

  draft: () => `Weekly content calendar for ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} week.

Create a 7-day content calendar for Simpleton Technologies:
- 3 posts per day across TikTok, Instagram, Facebook, X
- Mix content types: product demos, industry tips, founder moments, market data, social proof
- Include 1 longer-form piece (YouTube script or blog outline)
- Include 1 email newsletter draft for the week
- Flag any industry events, holidays, or trends to leverage

Format as a scannable table: Day | Platform | Content Type | Hook/Headline | Notes`,
};

class AgentScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private running = false;
  private lastCheckedMinute = -1;

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;

    // Seed agent definitions into DB on first run
    await this.seedAgentDefinitions();

    // Check every 30 seconds — execute when the minute changes
    this.intervalId = setInterval(() => this.tick(), 30_000);
    console.log("[AgentScheduler] Started — checking schedules every 30s");
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.running = false;
    console.log("[AgentScheduler] Stopped");
  }

  private async tick(): Promise<void> {
    const now = new Date();
    const currentMinute = now.getHours() * 60 + now.getMinutes();

    // Only check once per minute
    if (currentMinute === this.lastCheckedMinute) return;
    this.lastCheckedMinute = currentMinute;

    for (const config of AGENT_CONFIGS) {
      if (!config.schedule) continue;

      try {
        const cron = parseCron(config.schedule);
        if (!shouldRunNow(cron, now)) continue;

        // Check if agent is active
        const [agentDef] = await db
          .select()
          .from(agentDefinitions)
          .where(eq(agentDefinitions.agentId, config.agentId))
          .limit(1);

        if (agentDef && !agentDef.isActive) {
          console.log(`[AgentScheduler] ${config.name} is paused — skipping`);
          continue;
        }

        // Get the prompt for this scheduled run
        const getPrompt = SCHEDULED_PROMPTS[config.agentId];
        if (!getPrompt) {
          console.log(`[AgentScheduler] No scheduled prompt for ${config.agentId} — skipping`);
          continue;
        }

        const prompt = await Promise.resolve(getPrompt());

        // Create task
        const [task] = await db
          .insert(agentTasks)
          .values({
            agentId: config.agentId,
            taskType: "scheduled",
            trigger: "cron",
            status: "pending",
            priority: 5,
            input: prompt,
            deliveryMethod: "email",
            deliveredTo: config.deliveryEmail,
            scheduledFor: now,
          })
          .returning();

        console.log(`[AgentScheduler] Dispatching ${config.name} (task #${task.id})`);

        // Run async — don't block the scheduler
        runAgent(config.agentId, prompt, {
          taskId: task.id,
          deliveryMethod: "email",
          deliveredTo: config.deliveryEmail,
        }).catch((err) => {
          console.error(`[AgentScheduler] ${config.name} execution failed:`, err.message);
        });
      } catch (err: any) {
        console.error(`[AgentScheduler] Error checking ${config.agentId}:`, err.message);
      }
    }
  }

  private async seedAgentDefinitions(): Promise<void> {
    try {
      for (const config of AGENT_CONFIGS) {
        const [existing] = await db
          .select()
          .from(agentDefinitions)
          .where(eq(agentDefinitions.agentId, config.agentId))
          .limit(1);

        if (!existing) {
          await db.insert(agentDefinitions).values({
            agentId: config.agentId,
            name: config.name,
            product: config.product,
            model: config.model,
            systemPrompt: config.systemPrompt,
            schedule: config.schedule,
            isActive: true,
          });
          console.log(`[AgentScheduler] Seeded agent: ${config.name}`);
        }
      }
    } catch (err: any) {
      console.error("[AgentScheduler] Seed error (non-blocking):", err.message);
    }
  }

  async getStatus(): Promise<{
    running: boolean;
    agents: Array<{
      agentId: string;
      name: string;
      isActive: boolean;
      schedule: string | null;
      lastRunAt: Date | null;
      totalRuns: number;
      totalTokens: number;
    }>;
  }> {
    try {
      const agents = await db.select().from(agentDefinitions);
      return {
        running: this.running,
        agents: agents.map((a) => ({
          agentId: a.agentId,
          name: a.name,
          isActive: a.isActive,
          schedule: a.schedule,
          lastRunAt: a.lastRunAt,
          totalRuns: a.totalRuns,
          totalTokens: a.totalTokens,
        })),
      };
    } catch {
      return {
        running: this.running,
        agents: AGENT_CONFIGS.map((c) => ({
          agentId: c.agentId,
          name: c.name,
          isActive: true,
          schedule: c.schedule,
          lastRunAt: null,
          totalRuns: 0,
          totalTokens: 0,
        })),
      };
    }
  }
}

export const agentScheduler = new AgentScheduler();
