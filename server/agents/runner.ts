// ============================================
// AGENT RUNNER — Executes agent tasks via Anthropic API
// ============================================

import Anthropic from "@anthropic-ai/sdk";
import { db } from "../db";
import { agentTasks, agentDefinitions } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { getAgentConfig, type AgentConfig } from "./config";
import { getUncachableSendGridClient } from "../sendgrid-client";

interface RunResult {
  output: string;
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
  error?: string;
}

export async function runAgent(
  agentId: string,
  input: string,
  options?: {
    taskId?: number;
    deliveryMethod?: "email" | "dashboard" | "none";
    deliveredTo?: string;
    priority?: number;
  }
): Promise<RunResult> {
  const config = getAgentConfig(agentId);
  if (!config) {
    throw new Error(`Unknown agent: ${agentId}`);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }

  // Create task record if not already created
  let taskId = options?.taskId;
  if (!taskId) {
    const [task] = await db
      .insert(agentTasks)
      .values({
        agentId,
        taskType: "manual",
        trigger: "manual",
        status: "pending",
        priority: options?.priority ?? 5,
        input,
        deliveryMethod: options?.deliveryMethod ?? "dashboard",
        deliveredTo: options?.deliveredTo,
      })
      .returning();
    taskId = task.id;
  }

  // Mark task as running
  await db
    .update(agentTasks)
    .set({ status: "running", startedAt: new Date() })
    .where(eq(agentTasks.id, taskId));

  const startTime = Date.now();

  try {
    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: config.model,
      max_tokens: 4096,
      system: config.systemPrompt,
      messages: [{ role: "user", content: input }],
    });

    const output =
      response.content
        .filter((b) => b.type === "text")
        .map((b) => (b as any).text)
        .join("\n") || "";

    const durationMs = Date.now() - startTime;
    const inputTokens = response.usage?.input_tokens ?? 0;
    const outputTokens = response.usage?.output_tokens ?? 0;

    // Update task as completed
    await db
      .update(agentTasks)
      .set({
        status: "completed",
        output,
        inputTokens,
        outputTokens,
        durationMs,
        completedAt: new Date(),
      })
      .where(eq(agentTasks.id, taskId));

    // Update agent stats
    await db.execute(
      `UPDATE agent_definitions SET last_run_at = NOW(), total_runs = total_runs + 1, total_tokens = total_tokens + ${inputTokens + outputTokens}, updated_at = NOW() WHERE agent_id = '${agentId}'`
    );

    // Deliver results
    const deliveryMethod = options?.deliveryMethod ?? "dashboard";
    if (deliveryMethod === "email") {
      await deliverViaEmail(config, input, output, options?.deliveredTo);
      await db
        .update(agentTasks)
        .set({ deliveredAt: new Date() })
        .where(eq(agentTasks.id, taskId));
    }

    return { output, inputTokens, outputTokens, durationMs };
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    const errorMsg = err.message || "Unknown error";

    await db
      .update(agentTasks)
      .set({
        status: "failed",
        error: errorMsg,
        durationMs,
        completedAt: new Date(),
      })
      .where(eq(agentTasks.id, taskId));

    console.error(`[Agent:${agentId}] Task ${taskId} failed:`, errorMsg);
    return { output: "", inputTokens: 0, outputTokens: 0, durationMs, error: errorMsg };
  }
}

async function deliverViaEmail(
  config: AgentConfig,
  input: string,
  output: string,
  toEmail?: string
): Promise<void> {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    const to = toEmail || config.deliveryEmail;

    await client.send({
      to,
      from: { email: fromEmail, name: "Simpleton Agent System" },
      subject: `[${config.name}] Agent Report — ${new Date().toLocaleDateString()}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 680px; margin: 0 auto; padding: 24px; background: #0a0a0f; color: #e8e4dc;">
          <div style="border-bottom: 2px solid #c9a54e; padding-bottom: 16px; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 24px; color: #c9a54e;">${config.name}</h1>
            <p style="margin: 4px 0 0; font-size: 13px; color: #8a8578;">${config.description}</p>
          </div>

          <div style="background: #12121a; border: 1px solid #1e1e2a; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <h3 style="margin: 0 0 8px; font-size: 13px; color: #8a8578; text-transform: uppercase; letter-spacing: 1px;">Task Input</h3>
            <p style="margin: 0; font-size: 14px; white-space: pre-wrap;">${escapeHtml(input.substring(0, 500))}${input.length > 500 ? "..." : ""}</p>
          </div>

          <div style="background: #12121a; border: 1px solid #1e1e2a; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 8px; font-size: 13px; color: #c9a54e; text-transform: uppercase; letter-spacing: 1px;">Agent Output</h3>
            <div style="margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(output)}</div>
          </div>

          <div style="border-top: 1px solid #1e1e2a; padding-top: 12px; font-size: 11px; color: #555;">
            Simpleton Technologies — Autonomous Agent System<br/>
            ${new Date().toISOString()}
          </div>
        </div>
      `,
    });
    console.log(`[Agent:${config.agentId}] Report emailed to ${to}`);
  } catch (err: any) {
    console.error(`[Agent:${config.agentId}] Email delivery failed:`, err.message);
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br/>");
}
