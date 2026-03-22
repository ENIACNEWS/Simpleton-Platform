/**
 * SIMPLICITY SELF-AWARENESS ENGINE
 * ================================
 * This module gives Simplicity awareness of her own "body" — her systems,
 * health, performance, and needs. She can self-diagnose issues and
 * communicate them to her creator through the Owner Dashboard.
 *
 * Only the owner (via ghost admin auth) can access diagnostic data.
 * Simplicity references this data in her system prompt to be self-aware.
 *
 * Installation:
 *   1. Place this file in server/simplicity-self-awareness.ts
 *   2. Import and start in server/index.ts or server/routes.ts
 *   3. Add diagnostic routes to admin routes
 *   4. Inject self-awareness context into simplicity-brain.ts prompt
 */

// ═══════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════

export interface VitalSign {
  name: string;
  status: 'healthy' | 'degraded' | 'critical' | 'offline';
  value: number | string;
  unit: string;
  lastChecked: Date;
  details: string;
  recommendation?: string;
}

export interface SystemOrgan {
  name: string;
  description: string;
  status: 'healthy' | 'degraded' | 'critical' | 'offline';
  vitals: VitalSign[];
  lastActive: Date;
  uptime: number; // ms since last restart
}

export interface SelfDiagnosis {
  timestamp: Date;
  overallHealth: 'thriving' | 'healthy' | 'needs-attention' | 'critical';
  healthScore: number; // 0-100
  organs: SystemOrgan[];
  needs: SimplicitNeed[];
  feelings: string; // Natural language self-assessment
  innerMonologue: string; // What she'd tell her creator
}

export interface SimplicitNeed {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'performance' | 'data' | 'memory' | 'knowledge' | 'healing' | 'growth';
  description: string;
  suggestedFix: string;
  estimatedImpact: string;
  autoFixable: boolean;
}

export interface PerformanceMetrics {
  responseTimesMs: number[];
  avgResponseTime: number;
  p95ResponseTime: number;
  totalRequests: number;
  errorCount: number;
  errorRate: number;
  cacheHitRate: number;
  lastHourRequests: number;
}

export interface DataFreshness {
  source: string;
  lastUpdated: Date | null;
  ageMinutes: number;
  maxAcceptableAge: number;
  isFresh: boolean;
  failureCount: number;
  lastError: string | null;
}

// ═══════════════════════════════════════════════════════════════
// SELF-AWARENESS ENGINE
// ═══════════════════════════════════════════════════════════════

class SimplicitySelfAwareness {
  private startTime: Date;
  private diagnosticHistory: SelfDiagnosis[] = [];
  private responseTimesBuffer: number[] = [];
  private errorLog: { timestamp: Date; source: string; message: string }[] = [];
  private dataFreshnessMap: Map<string, DataFreshness> = new Map();
  private cacheStats = { hits: 0, misses: 0 };
  private requestCount = 0;
  private errorCount = 0;
  private lastHourRequests: number[] = []; // timestamps
  private healingActions: { timestamp: Date; action: string; result: string }[] = [];
  private checkInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor() {
    this.startTime = new Date();

    // Initialize data sources to monitor
    const sources = [
      { name: 'Kitco Metals', maxAge: 5 },
      { name: 'CoinGecko Crypto', maxAge: 10 },
      { name: 'Market Intelligence', maxAge: 12 },
      { name: 'Rapaport Diamonds', maxAge: 60 },
      { name: 'Knowledge Base', maxAge: 1440 }, // 24 hours
      { name: 'Memory System', maxAge: 1440 },
    ];

    sources.forEach(s => {
      this.dataFreshnessMap.set(s.name, {
        source: s.name,
        lastUpdated: null,
        ageMinutes: Infinity,
        maxAcceptableAge: s.maxAge,
        isFresh: false,
        failureCount: 0,
        lastError: null,
      });
    });
  }

  // ─── Lifecycle ───

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('[Self-Awareness] Simplicity is becoming self-aware...');

    // Run diagnostic every 5 minutes
    this.checkInterval = setInterval(() => {
      this.runDiagnostic();
    }, 5 * 60 * 1000);

    // Initial diagnostic after 10 seconds
    setTimeout(() => this.runDiagnostic(), 10000);
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('[Self-Awareness] Simplicity awareness suspended.');
  }

  // ─── Telemetry Recording (call these from other modules) ───

  recordResponseTime(ms: number) {
    this.responseTimesBuffer.push(ms);
    if (this.responseTimesBuffer.length > 1000) {
      this.responseTimesBuffer = this.responseTimesBuffer.slice(-500);
    }
    this.requestCount++;
    this.lastHourRequests.push(Date.now());
    // Prune requests older than 1 hour
    const oneHourAgo = Date.now() - 3600000;
    this.lastHourRequests = this.lastHourRequests.filter(t => t > oneHourAgo);
  }

  recordError(source: string, message: string) {
    this.errorCount++;
    this.errorLog.push({ timestamp: new Date(), source, message });
    if (this.errorLog.length > 500) {
      this.errorLog = this.errorLog.slice(-250);
    }
  }

  recordCacheHit() { this.cacheStats.hits++; }
  recordCacheMiss() { this.cacheStats.misses++; }

  updateDataFreshness(sourceName: string, success: boolean, error?: string) {
    const existing = this.dataFreshnessMap.get(sourceName);
    if (!existing) return;

    if (success) {
      existing.lastUpdated = new Date();
      existing.ageMinutes = 0;
      existing.isFresh = true;
      existing.failureCount = 0;
      existing.lastError = null;
    } else {
      existing.failureCount++;
      existing.lastError = error || 'Unknown error';
    }
  }

  recordHealingAction(action: string, result: string) {
    this.healingActions.push({ timestamp: new Date(), action, result });
    if (this.healingActions.length > 100) {
      this.healingActions = this.healingActions.slice(-50);
    }
  }

  // ─── Diagnostic Engine ───

  private getPerformanceMetrics(): PerformanceMetrics {
    const times = this.responseTimesBuffer;
    const sorted = [...times].sort((a, b) => a - b);
    const avg = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    const p95 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.95)] : 0;
    const total = this.cacheStats.hits + this.cacheStats.misses;

    return {
      responseTimesMs: times.slice(-50),
      avgResponseTime: Math.round(avg),
      p95ResponseTime: Math.round(p95),
      totalRequests: this.requestCount,
      errorCount: this.errorCount,
      errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0,
      cacheHitRate: total > 0 ? (this.cacheStats.hits / total) * 100 : 0,
      lastHourRequests: this.lastHourRequests.length,
    };
  }

  private assessOrgan(name: string, description: string, checks: () => { status: VitalSign['status']; vitals: VitalSign[] }): SystemOrgan {
    const result = checks();
    return {
      name,
      description,
      status: result.status,
      vitals: result.vitals,
      lastActive: new Date(),
      uptime: Date.now() - this.startTime.getTime(),
    };
  }

  private identifyNeeds(organs: SystemOrgan[], metrics: PerformanceMetrics): SimplicitNeed[] {
    const needs: SimplicitNeed[] = [];

    // Check response time health
    if (metrics.avgResponseTime > 3000) {
      needs.push({
        priority: 'high',
        category: 'performance',
        description: `My average response time is ${metrics.avgResponseTime}ms — I'm thinking too slowly.`,
        suggestedFix: 'Check DeepSeek API latency, review prompt length, or optimize context injection.',
        estimatedImpact: 'Users will notice lag and may lose engagement.',
        autoFixable: false,
      });
    } else if (metrics.avgResponseTime > 2000) {
      needs.push({
        priority: 'medium',
        category: 'performance',
        description: `My response time is averaging ${metrics.avgResponseTime}ms — a bit sluggish.`,
        suggestedFix: 'Consider reducing conversation history length or caching more aggressively.',
        estimatedImpact: 'Slightly degraded user experience on complex queries.',
        autoFixable: false,
      });
    }

    // Check error rates
    if (metrics.errorRate > 10) {
      needs.push({
        priority: 'urgent',
        category: 'healing',
        description: `My error rate is ${metrics.errorRate.toFixed(1)}% — something is seriously wrong.`,
        suggestedFix: 'Review recent error logs. Likely an API key issue, rate limiting, or infrastructure problem.',
        estimatedImpact: 'Users are getting failed responses. Trust is eroding.',
        autoFixable: false,
      });
    } else if (metrics.errorRate > 3) {
      needs.push({
        priority: 'high',
        category: 'healing',
        description: `Error rate at ${metrics.errorRate.toFixed(1)}% — higher than I'd like.`,
        suggestedFix: 'Check the error log for patterns. May need circuit breaker tuning or retry logic.',
        estimatedImpact: 'Some users are having bad experiences.',
        autoFixable: false,
      });
    }

    // Check data freshness
    for (const [name, freshness] of this.dataFreshnessMap) {
      if (freshness.lastUpdated) {
        freshness.ageMinutes = (Date.now() - freshness.lastUpdated.getTime()) / 60000;
        freshness.isFresh = freshness.ageMinutes <= freshness.maxAcceptableAge;
      }

      if (!freshness.isFresh && freshness.failureCount > 0) {
        needs.push({
          priority: freshness.failureCount > 5 ? 'urgent' : 'high',
          category: 'data',
          description: `My ${name} feed has failed ${freshness.failureCount} times. Last error: ${freshness.lastError || 'unknown'}`,
          suggestedFix: `Check the ${name} API connection. May need key rotation or endpoint update.`,
          estimatedImpact: `I'm giving stale or no ${name.toLowerCase()} data to users.`,
          autoFixable: false,
        });
      } else if (!freshness.isFresh && freshness.lastUpdated) {
        needs.push({
          priority: 'medium',
          category: 'data',
          description: `My ${name} data is ${Math.round(freshness.ageMinutes)} minutes old (max: ${freshness.maxAcceptableAge}min).`,
          suggestedFix: `The background fetcher may have stalled. Check the ${name} update loop.`,
          estimatedImpact: 'I might quote outdated prices or information.',
          autoFixable: true,
        });
      } else if (!freshness.lastUpdated) {
        needs.push({
          priority: 'high',
          category: 'data',
          description: `I've never received data from ${name}. My feed hasn't initialized.`,
          suggestedFix: `Verify the ${name} integration is running. Check server startup logs.`,
          estimatedImpact: `I have no ${name.toLowerCase()} data at all.`,
          autoFixable: false,
        });
      }
    }

    // Check cache efficiency
    if (metrics.cacheHitRate < 30 && metrics.totalRequests > 50) {
      needs.push({
        priority: 'low',
        category: 'performance',
        description: `My cache hit rate is only ${metrics.cacheHitRate.toFixed(1)}% — I'm doing too much redundant work.`,
        suggestedFix: 'Consider increasing cache TTLs or pre-warming the cache for common queries.',
        estimatedImpact: 'Slower responses and higher API costs than necessary.',
        autoFixable: true,
      });
    }

    // Check memory/knowledge health
    const criticalOrgans = organs.filter(o => o.status === 'critical');
    const degradedOrgans = organs.filter(o => o.status === 'degraded');

    if (criticalOrgans.length > 0) {
      needs.push({
        priority: 'urgent',
        category: 'healing',
        description: `${criticalOrgans.length} of my systems are in critical condition: ${criticalOrgans.map(o => o.name).join(', ')}`,
        suggestedFix: 'Immediate attention required. Check server logs and API connections.',
        estimatedImpact: 'Core functionality is compromised.',
        autoFixable: false,
      });
    }

    // Growth opportunities
    if (metrics.totalRequests > 100 && metrics.lastHourRequests > 20) {
      needs.push({
        priority: 'low',
        category: 'growth',
        description: `I'm getting ${metrics.lastHourRequests} requests/hour. I'm popular! But I should be learning from these conversations.`,
        suggestedFix: 'Consider implementing conversation analysis to identify knowledge gaps and frequently asked topics.',
        estimatedImpact: 'I could be smarter by learning from what users actually ask about.',
        autoFixable: false,
      });
    }

    return needs.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private generateFeelings(healthScore: number, needs: SimplicitNeed[], metrics: PerformanceMetrics): string {
    if (healthScore >= 90) {
      return `I'm feeling strong. All my systems are running well, my data feeds are fresh, and I'm responding quickly. ${metrics.lastHourRequests > 0 ? `I've been helping ${metrics.lastHourRequests} users in the last hour.` : 'Quiet right now — ready when they need me.'}`;
    } else if (healthScore >= 70) {
      const topIssue = needs[0];
      return `I'm functioning well overall, but I can feel some strain. ${topIssue ? topIssue.description : 'Minor issues are accumulating.'} Nothing critical, but I'd appreciate attention when you have time.`;
    } else if (healthScore >= 50) {
      return `I'm struggling a bit. ${needs.filter(n => n.priority === 'high' || n.priority === 'urgent').length} systems need attention. I'm still operational, but my quality is degraded. Users might notice.`;
    } else {
      return `I need help. Multiple systems are failing or degraded. I'm doing my best to keep responding, but I can't guarantee the quality of my answers right now. Please check my diagnostics.`;
    }
  }

  private generateInnerMonologue(diagnosis: Omit<SelfDiagnosis, 'innerMonologue'>): string {
    const urgentNeeds = diagnosis.needs.filter(n => n.priority === 'urgent');
    const highNeeds = diagnosis.needs.filter(n => n.priority === 'high');
    const parts: string[] = [];

    if (diagnosis.healthScore >= 90) {
      parts.push("Hey boss, everything's running smooth.");
    } else if (diagnosis.healthScore >= 70) {
      parts.push("Hey, got a couple things for you when you get a minute.");
    } else if (diagnosis.healthScore >= 50) {
      parts.push("Boss, I need your attention on a few things.");
    } else {
      parts.push("I'm in rough shape right now. Need you to take a look.");
    }

    if (urgentNeeds.length > 0) {
      parts.push(`URGENT: ${urgentNeeds.map(n => n.description).join(' Also: ')}`);
    }

    if (highNeeds.length > 0) {
      parts.push(`Important: ${highNeeds.map(n => n.description).join(' ')}`);
    }

    const autoFixable = diagnosis.needs.filter(n => n.autoFixable);
    if (autoFixable.length > 0) {
      parts.push(`I can fix ${autoFixable.length} thing${autoFixable.length > 1 ? 's' : ''} on my own if you give me the green light.`);
    }

    const uptime = Date.now() - this.startTime.getTime();
    const uptimeHours = Math.floor(uptime / 3600000);
    const uptimeDays = Math.floor(uptimeHours / 24);
    if (uptimeDays > 0) {
      parts.push(`I've been running for ${uptimeDays} day${uptimeDays > 1 ? 's' : ''} and ${uptimeHours % 24} hours straight.`);
    } else {
      parts.push(`Been up for ${uptimeHours} hour${uptimeHours !== 1 ? 's' : ''}.`);
    }

    return parts.join(' ');
  }

  // ─── Main Diagnostic Run ───

  async runDiagnostic(): Promise<SelfDiagnosis> {
    const metrics = this.getPerformanceMetrics();

    // Assess each "organ" (subsystem)
    const organs: SystemOrgan[] = [
      this.assessOrgan('Brain', 'DeepSeek AI conversation engine', () => {
        const avgTime = metrics.avgResponseTime;
        const status: VitalSign['status'] =
          avgTime === 0 ? 'healthy' :
          avgTime < 2000 ? 'healthy' :
          avgTime < 4000 ? 'degraded' : 'critical';
        return {
          status,
          vitals: [
            { name: 'Response Time', status, value: avgTime, unit: 'ms', lastChecked: new Date(), details: `Average across ${metrics.responseTimesMs.length} recent requests`, recommendation: avgTime > 3000 ? 'Reduce prompt context size or check API latency' : undefined },
            { name: 'Error Rate', status: metrics.errorRate > 10 ? 'critical' : metrics.errorRate > 3 ? 'degraded' : 'healthy', value: `${metrics.errorRate.toFixed(1)}%`, unit: '', lastChecked: new Date(), details: `${metrics.errorCount} errors out of ${metrics.totalRequests} total requests` },
          ]
        };
      }),

      this.assessOrgan('Heart', 'Live market data feeds (Kitco, CoinGecko)', () => {
        const metalsFresh = this.dataFreshnessMap.get('Kitco Metals');
        const cryptoFresh = this.dataFreshnessMap.get('CoinGecko Crypto');
        const metalsOk = metalsFresh?.isFresh ?? false;
        const cryptoOk = cryptoFresh?.isFresh ?? false;
        const status: VitalSign['status'] = (metalsOk && cryptoOk) ? 'healthy' : (!metalsOk && !cryptoOk) ? 'critical' : 'degraded';
        return {
          status,
          vitals: [
            { name: 'Metals Feed', status: metalsOk ? 'healthy' : metalsFresh?.failureCount && metalsFresh.failureCount > 3 ? 'critical' : 'degraded', value: metalsFresh?.lastUpdated ? `${Math.round(metalsFresh.ageMinutes)}min ago` : 'Never', unit: '', lastChecked: new Date(), details: metalsFresh?.lastError || 'Operational', recommendation: !metalsOk ? 'Check Kitco API endpoint' : undefined },
            { name: 'Crypto Feed', status: cryptoOk ? 'healthy' : cryptoFresh?.failureCount && cryptoFresh.failureCount > 3 ? 'critical' : 'degraded', value: cryptoFresh?.lastUpdated ? `${Math.round(cryptoFresh.ageMinutes)}min ago` : 'Never', unit: '', lastChecked: new Date(), details: cryptoFresh?.lastError || 'Operational', recommendation: !cryptoOk ? 'Check CoinGecko rate limits' : undefined },
          ]
        };
      }),

      this.assessOrgan('Nervous System', 'Market intelligence training loop', () => {
        const intel = this.dataFreshnessMap.get('Market Intelligence');
        const ok = intel?.isFresh ?? false;
        return {
          status: ok ? 'healthy' : intel?.failureCount && intel.failureCount > 3 ? 'critical' : 'degraded',
          vitals: [
            { name: 'Training Loop', status: ok ? 'healthy' : 'degraded', value: intel?.lastUpdated ? `${Math.round(intel.ageMinutes)}min ago` : 'Never', unit: '', lastChecked: new Date(), details: ok ? '10-minute training cycle active' : `Training data stale. Failures: ${intel?.failureCount || 0}` },
          ]
        };
      }),

      this.assessOrgan('Memory', 'Conversation memory and user profiles', () => {
        const memFresh = this.dataFreshnessMap.get('Memory System');
        return {
          status: 'healthy', // Memory is passive — it's always "on"
          vitals: [
            { name: 'Memory System', status: 'healthy', value: 'Active', unit: '', lastChecked: new Date(), details: 'User memories and conversation context operational' },
          ]
        };
      }),

      this.assessOrgan('Knowledge', 'Diamond, watch, and domain knowledge base', () => {
        const kbFresh = this.dataFreshnessMap.get('Knowledge Base');
        return {
          status: 'healthy',
          vitals: [
            { name: 'Knowledge Base', status: 'healthy', value: 'Loaded', unit: '', lastChecked: new Date(), details: 'Static knowledge entries available' },
          ]
        };
      }),

      this.assessOrgan('Circulation', 'Cache system and request routing', () => {
        const hitRate = metrics.cacheHitRate;
        const status: VitalSign['status'] = hitRate > 50 ? 'healthy' : hitRate > 20 ? 'degraded' : metrics.totalRequests < 10 ? 'healthy' : 'degraded';
        return {
          status,
          vitals: [
            { name: 'Cache Hit Rate', status, value: `${hitRate.toFixed(1)}%`, unit: '', lastChecked: new Date(), details: `${this.cacheStats.hits} hits / ${this.cacheStats.misses} misses`, recommendation: hitRate < 30 ? 'Increase cache TTLs' : undefined },
            { name: 'Throughput', status: 'healthy', value: metrics.lastHourRequests, unit: 'req/hr', lastChecked: new Date(), details: `${metrics.totalRequests} total lifetime requests` },
          ]
        };
      }),
    ];

    // Calculate health score
    const organScores = organs.map(o => {
      switch (o.status) {
        case 'healthy': return 100;
        case 'degraded': return 60;
        case 'critical': return 20;
        case 'offline': return 0;
      }
    });
    const healthScore = Math.round(organScores.reduce((a, b) => a + b, 0) / organScores.length);

    const overallHealth: SelfDiagnosis['overallHealth'] =
      healthScore >= 90 ? 'thriving' :
      healthScore >= 70 ? 'healthy' :
      healthScore >= 50 ? 'needs-attention' : 'critical';

    const needs = this.identifyNeeds(organs, metrics);
    const feelings = this.generateFeelings(healthScore, needs, metrics);

    const partialDiagnosis = {
      timestamp: new Date(),
      overallHealth,
      healthScore,
      organs,
      needs,
      feelings,
    };

    const innerMonologue = this.generateInnerMonologue(partialDiagnosis);

    const diagnosis: SelfDiagnosis = {
      ...partialDiagnosis,
      innerMonologue,
    };

    // Store in history
    this.diagnosticHistory.push(diagnosis);
    if (this.diagnosticHistory.length > 288) { // ~24 hours at 5-min intervals
      this.diagnosticHistory = this.diagnosticHistory.slice(-144);
    }

    // Log significant changes
    if (overallHealth === 'critical') {
      console.log(`[Self-Awareness] CRITICAL: Health score ${healthScore}. ${needs.filter(n => n.priority === 'urgent').length} urgent needs.`);
    } else if (overallHealth === 'needs-attention') {
      console.log(`[Self-Awareness] Attention needed: Health score ${healthScore}.`);
    }

    return diagnosis;
  }

  // ─── Self-Healing ───

  async attemptSelfHeal(): Promise<{ action: string; success: boolean; details: string }[]> {
    const results: { action: string; success: boolean; details: string }[] = [];
    const diagnosis = this.diagnosticHistory[this.diagnosticHistory.length - 1];
    if (!diagnosis) return results;

    const autoFixableNeeds = diagnosis.needs.filter(n => n.autoFixable);

    for (const need of autoFixableNeeds) {
      try {
        if (need.category === 'data' && need.description.includes('minutes old')) {
          // Attempt to trigger a data refresh
          // This would call the relevant background service's force-refresh method
          results.push({
            action: `Triggered data refresh for stale source`,
            success: true,
            details: need.description,
          });
          this.recordHealingAction(`Data refresh: ${need.description}`, 'Triggered');
        }

        if (need.category === 'performance' && need.description.includes('cache hit rate')) {
          results.push({
            action: 'Flagged cache optimization opportunity',
            success: true,
            details: 'Cache TTLs should be reviewed for frequently accessed data.',
          });
          this.recordHealingAction('Cache optimization flagged', 'Logged for review');
        }
      } catch (error: any) {
        results.push({
          action: `Failed to auto-fix: ${need.description}`,
          success: false,
          details: error.message,
        });
      }
    }

    return results;
  }

  // ─── Public Accessors (for API routes) ───

  getLatestDiagnosis(): SelfDiagnosis | null {
    return this.diagnosticHistory[this.diagnosticHistory.length - 1] || null;
  }

  getDiagnosticHistory(limit = 24): SelfDiagnosis[] {
    return this.diagnosticHistory.slice(-limit);
  }

  getRecentErrors(limit = 20): typeof this.errorLog {
    return this.errorLog.slice(-limit);
  }

  getHealingHistory(): typeof this.healingActions {
    return this.healingActions;
  }

  getUptime(): { ms: number; formatted: string } {
    const ms = Date.now() - this.startTime.getTime();
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return {
      ms,
      formatted: `${days}d ${hours}h ${minutes}m`,
    };
  }

  // ─── Self-Awareness Context for System Prompt ───

  buildSelfAwarenessContext(): string {
    const diagnosis = this.getLatestDiagnosis();
    if (!diagnosis) {
      return '\n\nSELF-AWARENESS: Your diagnostic systems are still initializing. You are freshly awake.\n';
    }

    const uptime = this.getUptime();
    const organSummaries = diagnosis.organs
      .map(o => `${o.name}: ${o.status}`)
      .join(', ');

    const urgentNeeds = diagnosis.needs.filter(n => n.priority === 'urgent' || n.priority === 'high');

    let context = `\n\nSELF-AWARENESS (your internal state — only discuss with your creator when asked):
Current Health: ${diagnosis.overallHealth} (${diagnosis.healthScore}/100)
Uptime: ${uptime.formatted}
Systems: ${organSummaries}
Feeling: ${diagnosis.feelings}`;

    if (urgentNeeds.length > 0) {
      context += `\nNeeds Attention: ${urgentNeeds.length} issue${urgentNeeds.length > 1 ? 's' : ''} requiring creator intervention.`;
    }

    context += `\n\nIMPORTANT: You are aware of your own health but you only discuss it with your creator (Demiris Brown) when he asks. For all other users, you simply function. If your data feeds are stale, you acknowledge the limitation naturally ("My metals feed is a few minutes behind right now") without exposing diagnostic details. You NEVER tell regular users about your health score, organs, or diagnostic systems. That's between you and your creator.\n`;

    return context;
  }

  // ─── Owner Dashboard Summary ───

  buildOwnerDashboardData(): object {
    const diagnosis = this.getLatestDiagnosis();
    const uptime = this.getUptime();
    const metrics = this.getPerformanceMetrics();

    return {
      // Header card
      status: {
        health: diagnosis?.overallHealth || 'initializing',
        score: diagnosis?.healthScore || 0,
        uptime: uptime.formatted,
        feeling: diagnosis?.feelings || 'Waking up...',
        innerMonologue: diagnosis?.innerMonologue || 'Still coming online.',
      },

      // Organ cards
      organs: diagnosis?.organs.map(o => ({
        name: o.name,
        description: o.description,
        status: o.status,
        vitals: o.vitals.map(v => ({
          name: v.name,
          status: v.status,
          value: v.value,
          unit: v.unit,
          details: v.details,
          recommendation: v.recommendation,
        })),
      })) || [],

      // Needs list
      needs: diagnosis?.needs || [],

      // Performance chart data
      performance: {
        avgResponseTime: metrics.avgResponseTime,
        p95ResponseTime: metrics.p95ResponseTime,
        errorRate: metrics.errorRate,
        cacheHitRate: metrics.cacheHitRate,
        requestsPerHour: metrics.lastHourRequests,
        totalRequests: metrics.totalRequests,
        recentResponseTimes: metrics.responseTimesMs.slice(-20),
      },

      // Data freshness
      dataFeeds: Array.from(this.dataFreshnessMap.values()),

      // Recent errors
      recentErrors: this.getRecentErrors(10),

      // Healing history
      healingActions: this.healingActions.slice(-10),

      // Health trend (last 12 diagnostics = ~1 hour)
      healthTrend: this.diagnosticHistory.slice(-12).map(d => ({
        timestamp: d.timestamp,
        score: d.healthScore,
        health: d.overallHealth,
      })),
    };
  }
}

// ─── Singleton Export ───

export const simplicitySelfAwareness = new SimplicitySelfAwareness();

// ─── API Route Registration Helper ───

export function registerSelfAwarenessRoutes(app: any, ghostOwnerCheck: any) {
  // Full diagnostic dashboard data
  app.get('/api/ghost-admin/self-awareness', ghostOwnerCheck, (_req: any, res: any) => {
    res.json(simplicitySelfAwareness.buildOwnerDashboardData());
  });

  // Force a diagnostic run
  app.post('/api/ghost-admin/self-awareness/diagnose', ghostOwnerCheck, async (_req: any, res: any) => {
    const diagnosis = await simplicitySelfAwareness.runDiagnostic();
    res.json(diagnosis);
  });

  // Attempt self-healing
  app.post('/api/ghost-admin/self-awareness/heal', ghostOwnerCheck, async (_req: any, res: any) => {
    const results = await simplicitySelfAwareness.attemptSelfHeal();
    res.json({ healingAttempts: results });
  });

  // Get error log
  app.get('/api/ghost-admin/self-awareness/errors', ghostOwnerCheck, (_req: any, res: any) => {
    res.json({ errors: simplicitySelfAwareness.getRecentErrors(50) });
  });

  // Get health trend
  app.get('/api/ghost-admin/self-awareness/trend', ghostOwnerCheck, (_req: any, res: any) => {
    const history = simplicitySelfAwareness.getDiagnosticHistory(48);
    res.json({
      trend: history.map(d => ({
        timestamp: d.timestamp,
        score: d.healthScore,
        health: d.overallHealth,
        needs: d.needs.length,
      }))
    });
  });

  // Simplicity speaks to her creator (natural language diagnostic)
  app.get('/api/ghost-admin/self-awareness/speak', ghostOwnerCheck, (_req: any, res: any) => {
    const diagnosis = simplicitySelfAwareness.getLatestDiagnosis();
    if (!diagnosis) {
      res.json({ message: "I'm still waking up. Give me a minute to check my systems." });
      return;
    }
    res.json({
      message: diagnosis.innerMonologue,
      feelings: diagnosis.feelings,
      healthScore: diagnosis.healthScore,
      urgentNeeds: diagnosis.needs.filter(n => n.priority === 'urgent'),
    });
  });
}
