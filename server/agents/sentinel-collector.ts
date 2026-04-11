// ============================================
// SENTINEL DATA COLLECTOR
// Gathers real security telemetry for the Sentinel agent
// ============================================

import { db } from "../db";
import { sql } from "drizzle-orm";

export interface SecurityTelemetry {
  timestamp: string;
  uptime: string;
  memory: { heapUsedMB: number; heapTotalMB: number; rssMB: number; percentUsed: number };
  recentApiUsage: { totalRequests: number; uniqueIPs: number; topEndpoints: any[]; errorRate: number };
  recentVisitors: { total24h: number; uniqueIPs24h: number; suspiciousAgents: any[] };
  rateLimitViolations: { blocked: number; topOffenders: any[] };
  authActivity: { recentLogins: number; failedLogins: number; newUsers24h: number };
  apiKeyActivity: { activeKeys: number; expiredKeys: number; recentUsage: any[] };
  agentSystemHealth: { totalTasks24h: number; failedTasks24h: number; runningTasks: number };
  environmentChecks: { hasAnthropicKey: boolean; hasSendGridKey: boolean; hasSessionSecret: boolean; hasDatabaseUrl: boolean; nodeEnv: string };
}

export async function collectSecurityTelemetry(): Promise<SecurityTelemetry> {
  const now = new Date();
  const startMs = Date.now();

  // Memory
  const mem = process.memoryUsage();
  const memory = {
    heapUsedMB: Math.round(mem.heapUsed / 1048576),
    heapTotalMB: Math.round(mem.heapTotal / 1048576),
    rssMB: Math.round(mem.rss / 1048576),
    percentUsed: Math.round((mem.heapUsed / mem.heapTotal) * 100),
  };

  // Uptime
  const uptimeSec = process.uptime();
  const uptimeH = Math.floor(uptimeSec / 3600);
  const uptimeM = Math.floor((uptimeSec % 3600) / 60);
  const uptime = `${uptimeH}h ${uptimeM}m`;

  // DB queries — wrapped in try/catch so partial failures don't crash the collector
  let recentApiUsage = { totalRequests: 0, uniqueIPs: 0, topEndpoints: [] as any[], errorRate: 0 };
  let recentVisitors = { total24h: 0, uniqueIPs24h: 0, suspiciousAgents: [] as any[] };
  let authActivity = { recentLogins: 0, failedLogins: 0, newUsers24h: 0 };
  let apiKeyActivity = { activeKeys: 0, expiredKeys: 0, recentUsage: [] as any[] };
  let agentSystemHealth = { totalTasks24h: 0, failedTasks24h: 0, runningTasks: 0 };
  let rateLimitViolations = { blocked: 0, topOffenders: [] as any[] };

  try {
    // API usage last 24h
    const apiRows = await db.execute(sql`
      SELECT
        COUNT(*) as total,
        COUNT(DISTINCT ip_address) as unique_ips,
        COUNT(*) FILTER (WHERE status_code >= 400) as errors,
        COUNT(*) FILTER (WHERE status_code >= 400)::float / GREATEST(COUNT(*), 1) as error_rate
      FROM api_usage
      WHERE timestamp > NOW() - INTERVAL '24 hours'
    `);
    const apiData = (apiRows as any).rows?.[0] || {};
    recentApiUsage.totalRequests = Number(apiData.total || 0);
    recentApiUsage.uniqueIPs = Number(apiData.unique_ips || 0);
    recentApiUsage.errorRate = Math.round(Number(apiData.error_rate || 0) * 100);

    // Top endpoints
    const topEndpoints = await db.execute(sql`
      SELECT endpoint, COUNT(*) as count, COUNT(*) FILTER (WHERE status_code >= 400) as errors
      FROM api_usage
      WHERE timestamp > NOW() - INTERVAL '24 hours'
      GROUP BY endpoint
      ORDER BY count DESC
      LIMIT 10
    `);
    recentApiUsage.topEndpoints = (topEndpoints as any).rows || [];
  } catch (e) {
    // api_usage table may not exist
  }

  try {
    // Visitor activity last 24h
    const visitorRows = await db.execute(sql`
      SELECT
        COUNT(*) as total,
        COUNT(DISTINCT ip_address) as unique_ips
      FROM site_visitors
      WHERE last_visit_at > NOW() - INTERVAL '24 hours'
    `);
    const vData = (visitorRows as any).rows?.[0] || {};
    recentVisitors.total24h = Number(vData.total || 0);
    recentVisitors.uniqueIPs24h = Number(vData.unique_ips || 0);

    // Suspicious user agents
    const suspicious = await db.execute(sql`
      SELECT ip_address, user_agent, browser, os, visit_count, last_visit_at
      FROM site_visitors
      WHERE last_visit_at > NOW() - INTERVAL '24 hours'
      AND (
        LOWER(user_agent) LIKE '%bot%'
        OR LOWER(user_agent) LIKE '%crawler%'
        OR LOWER(user_agent) LIKE '%spider%'
        OR LOWER(user_agent) LIKE '%scraper%'
        OR LOWER(user_agent) LIKE '%curl%'
        OR LOWER(user_agent) LIKE '%wget%'
        OR LOWER(user_agent) LIKE '%python%'
        OR LOWER(user_agent) LIKE '%postman%'
        OR LOWER(user_agent) LIKE '%headless%'
      )
      ORDER BY last_visit_at DESC
      LIMIT 20
    `);
    recentVisitors.suspiciousAgents = (suspicious as any).rows || [];
  } catch (e) {
    // site_visitors table may not exist
  }

  try {
    // Auth activity
    const authRows = await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE action = 'login' AND status = 'success') as logins,
        COUNT(*) FILTER (WHERE action = 'login' AND status = 'failed') as failed_logins
      FROM activity_logs
      WHERE timestamp > NOW() - INTERVAL '24 hours'
    `);
    const aData = (authRows as any).rows?.[0] || {};
    authActivity.recentLogins = Number(aData.logins || 0);
    authActivity.failedLogins = Number(aData.failed_logins || 0);

    const newUsers = await db.execute(sql`
      SELECT COUNT(*) as count FROM users WHERE created_at > NOW() - INTERVAL '24 hours'
    `);
    authActivity.newUsers24h = Number(((newUsers as any).rows?.[0] || {}).count || 0);
  } catch (e) {
    // activity_logs may not exist
  }

  try {
    // API key status
    const keyRows = await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE is_active = true AND (expires_at IS NULL OR expires_at > NOW())) as active,
        COUNT(*) FILTER (WHERE is_active = false OR (expires_at IS NOT NULL AND expires_at <= NOW())) as expired
      FROM api_keys
    `);
    const kData = (keyRows as any).rows?.[0] || {};
    apiKeyActivity.activeKeys = Number(kData.active || 0);
    apiKeyActivity.expiredKeys = Number(kData.expired || 0);
  } catch (e) {
    // api_keys may not exist
  }

  try {
    // Agent system health
    const agentRows = await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as total_24h,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours' AND status = 'failed') as failed_24h,
        COUNT(*) FILTER (WHERE status = 'running') as running
      FROM agent_tasks
    `);
    const agData = (agentRows as any).rows?.[0] || {};
    agentSystemHealth.totalTasks24h = Number(agData.total_24h || 0);
    agentSystemHealth.failedTasks24h = Number(agData.failed_24h || 0);
    agentSystemHealth.runningTasks = Number(agData.running || 0);
  } catch (e) {
    // agent_tasks may not exist yet
  }

  // Environment checks (no secrets exposed — just boolean presence)
  const environmentChecks = {
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    hasSendGridKey: !!(process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith("SG.")),
    hasSessionSecret: !!process.env.SESSION_SECRET,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV || "undefined",
  };

  return {
    timestamp: now.toISOString(),
    uptime,
    memory,
    recentApiUsage,
    recentVisitors,
    rateLimitViolations,
    authActivity,
    apiKeyActivity,
    agentSystemHealth,
    environmentChecks,
  };
}

export function formatTelemetryForPrompt(t: SecurityTelemetry): string {
  return `═══════════════════════════════════════════════════
SENTINEL SECURITY TELEMETRY — ${t.timestamp}
═══════════════════════════════════════════════════

SERVER STATUS
  Uptime: ${t.uptime}
  Memory: ${t.memory.heapUsedMB}MB / ${t.memory.heapTotalMB}MB (${t.memory.percentUsed}% heap) | RSS: ${t.memory.rssMB}MB
  Node Environment: ${t.environmentChecks.nodeEnv}

ENVIRONMENT KEYS
  Anthropic API Key: ${t.environmentChecks.hasAnthropicKey ? "✓ Present" : "✗ MISSING"}
  SendGrid API Key: ${t.environmentChecks.hasSendGridKey ? "✓ Present" : "✗ MISSING"}
  Session Secret: ${t.environmentChecks.hasSessionSecret ? "✓ Present" : "✗ MISSING"}
  Database URL: ${t.environmentChecks.hasDatabaseUrl ? "✓ Present" : "✗ MISSING"}

API USAGE (24h)
  Total Requests: ${t.recentApiUsage.totalRequests}
  Unique IPs: ${t.recentApiUsage.uniqueIPs}
  Error Rate: ${t.recentApiUsage.errorRate}%
  Top Endpoints:
${t.recentApiUsage.topEndpoints.map((e: any) => `    ${e.endpoint}: ${e.count} reqs (${e.errors} errors)`).join("\n") || "    (no data)"}

VISITOR ACTIVITY (24h)
  Total Visitors: ${t.recentVisitors.total24h}
  Unique IPs: ${t.recentVisitors.uniqueIPs24h}
  Suspicious User-Agents Detected: ${t.recentVisitors.suspiciousAgents.length}
${t.recentVisitors.suspiciousAgents.slice(0, 10).map((s: any) => `    ⚠ ${s.ip_address} — ${(s.user_agent || "").substring(0, 80)} (${s.visit_count} visits)`).join("\n") || "    (none)"}

AUTHENTICATION (24h)
  Successful Logins: ${t.authActivity.recentLogins}
  Failed Logins: ${t.authActivity.failedLogins}${t.authActivity.failedLogins >= 5 ? " ⚠ ELEVATED" : ""}
  New User Registrations: ${t.authActivity.newUsers24h}

API KEYS
  Active Keys: ${t.apiKeyActivity.activeKeys}
  Expired/Disabled Keys: ${t.apiKeyActivity.expiredKeys}

AGENT SYSTEM HEALTH (24h)
  Total Agent Tasks: ${t.agentSystemHealth.totalTasks24h}
  Failed Tasks: ${t.agentSystemHealth.failedTasks24h}${t.agentSystemHealth.failedTasks24h > 0 ? " ⚠" : ""}
  Currently Running: ${t.agentSystemHealth.runningTasks}

═══════════════════════════════════════════════════
Analyze the above telemetry. Report any threats, anomalies, or vulnerabilities.
Classify each finding by severity (🔴 CRITICAL / 🟠 HIGH / 🟡 MEDIUM / 🟢 LOW).
If everything is clean, say so — but still recommend one proactive hardening action.
═══════════════════════════════════════════════════`;
}
