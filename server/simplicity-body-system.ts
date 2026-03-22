import { db } from './db';
import { listedBusinesses } from '@shared/schema';
import { eq, or } from 'drizzle-orm';
import { getKitcoPricing } from './kitco-pricing';
import { getUncachableSendGridClient } from './sendgrid-client';

interface AuditResult {
  entityType: string;
  entityId: number | string;
  entityName: string;
  field: string;
  oldValue: string;
  newValue: string;
  confidence: number;
  source: string;
  action: 'auto_fixed' | 'flagged';
}

interface BodyAuditReport {
  timestamp: string;
  duration: number;
  totalChecked: number;
  issuesFound: number;
  autoFixed: number;
  flagged: number;
  results: AuditResult[];
  marketHealth: {
    goldPrice: number;
    silverPrice: number;
    platinumPrice: number;
    status: 'live' | 'stale' | 'failed' | 'skipped';
  };
}

class SimplicityBodySystem {
  private isRunning = false;
  private auditInterval: NodeJS.Timeout | null = null;
  private lastAuditReport: BodyAuditReport | null = null;
  private auditHistory: BodyAuditReport[] = [];

  start() {
    console.log('Simplicity Body System starting — hourly self-audit enabled');

    this.runFullAudit().catch(console.error);

    this.auditInterval = setInterval(() => {
      this.runFullAudit();
    }, 60 * 60 * 1000);
  }

  stop() {
    if (this.auditInterval) {
      clearInterval(this.auditInterval);
      this.auditInterval = null;
    }
  }

  getLastReport(): BodyAuditReport | null {
    return this.lastAuditReport;
  }

  getAuditHistory(): BodyAuditReport[] {
    return this.auditHistory.slice(-24);
  }

  async runFullAudit(): Promise<BodyAuditReport> {
    if (this.isRunning) {
      console.log('Body audit already in progress, skipping');
      return this.lastAuditReport ?? { timestamp: new Date().toISOString(), duration: 0, totalChecked: 0, issuesFound: 0, autoFixed: 0, flagged: 0, results: [], marketHealth: { goldPrice: 0, silverPrice: 0, platinumPrice: 0, status: 'skipped' } };
    }

    this.isRunning = true;
    const startTime = Date.now();
    const allResults: AuditResult[] = [];

    console.log('Simplicity starting body audit...');

    try {
      const businessResults = await this.auditBusinessListings();
      allResults.push(...businessResults);

      const marketHealth = await this.auditMarketData();

      const coinResults = await this.auditCoinData();
      allResults.push(...coinResults);

      const autoFixed = allResults.filter(r => r.action === 'auto_fixed').length;
      const flagged = allResults.filter(r => r.action === 'flagged').length;

      const report: BodyAuditReport = {
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        totalChecked: allResults.length + 4,
        issuesFound: allResults.length,
        autoFixed,
        flagged,
        results: allResults,
        marketHealth,
      };

      this.lastAuditReport = report;
      this.auditHistory.push(report);
      if (this.auditHistory.length > 48) this.auditHistory.shift();

      if (allResults.length > 0) {
        await this.sendAuditAlert(report);
      }

      console.log(`Body audit complete: ${allResults.length} issues found, ${autoFixed} auto-fixed, ${flagged} flagged`);
      return report;

    } catch (error) {
      console.error('Body audit error:', error);
      const failReport: BodyAuditReport = {
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        totalChecked: 0,
        issuesFound: 0,
        autoFixed: 0,
        flagged: 0,
        results: [],
        marketHealth: { goldPrice: 0, silverPrice: 0, platinumPrice: 0, status: 'failed' },
      };
      this.lastAuditReport = failReport;
      return failReport;
    } finally {
      this.isRunning = false;
    }
  }

  private async auditBusinessListings(): Promise<AuditResult[]> {
    const results: AuditResult[] = [];

    try {
      const businesses = await db.select().from(listedBusinesses).limit(20);

      for (const biz of businesses) {
        if (biz.phone && !/^\+?[\d\s\-().]+$/.test(biz.phone)) {
          results.push({
            entityType: 'business',
            entityId: biz.id,
            entityName: biz.name,
            field: 'phone',
            oldValue: biz.phone,
            newValue: 'Invalid format detected',
            confidence: 0.9,
            source: 'format_validation',
            action: 'flagged',
          });
        }

        if (biz.website && !biz.website.startsWith('http')) {
          const corrected = `https://${biz.website}`;
          await db.update(listedBusinesses)
            .set({ website: corrected })
            .where(eq(listedBusinesses.id, biz.id));

          results.push({
            entityType: 'business',
            entityId: biz.id,
            entityName: biz.name,
            field: 'website',
            oldValue: biz.website,
            newValue: corrected,
            confidence: 1.0,
            source: 'format_validation',
            action: 'auto_fixed',
          });
        }
      }
    } catch (error) {
      console.error('Business listing audit error:', error);
    }

    return results;
  }

  private async auditMarketData(): Promise<BodyAuditReport['marketHealth']> {
    try {
      const prices = await getKitcoPricing();
      if (prices.gold > 0 && prices.silver > 0) {
        return {
          goldPrice: prices.gold,
          silverPrice: prices.silver,
          platinumPrice: prices.platinum,
          status: 'live',
        };
      }
      return { goldPrice: 0, silverPrice: 0, platinumPrice: 0, status: 'stale' };
    } catch {
      return { goldPrice: 0, silverPrice: 0, platinumPrice: 0, status: 'failed' };
    }
  }

  private async auditCoinData(): Promise<AuditResult[]> {
    const results: AuditResult[] = [];

    try {
      const { coins } = await import('@shared/schema');
      const sampleCoins = await db.select().from(coins).limit(10);

      for (const coin of sampleCoins) {
        if (coin.weight && coin.weight <= 0) {
          results.push({
            entityType: 'coin',
            entityId: coin.id,
            entityName: coin.name,
            field: 'weight',
            oldValue: String(coin.weight),
            newValue: 'Invalid weight detected',
            confidence: 0.95,
            source: 'data_validation',
            action: 'flagged',
          });
        }
      }
    } catch (error) {
      console.error('Coin data audit error:', error);
    }

    return results;
  }

  private async sendAuditAlert(report: BodyAuditReport): Promise<void> {
    try {
      const sgClient = await getUncachableSendGridClient();
      if (!sgClient) {
        console.log('SendGrid not configured — skipping audit email');
        return;
      }

      const fixedItems = report.results.filter(r => r.action === 'auto_fixed');
      const flaggedItems = report.results.filter(r => r.action === 'flagged');

      const fixedRows = fixedItems.map(r =>
        `<tr style="border-bottom:1px solid #334155;"><td style="padding:8px 4px;color:#e2e8f0;">${r.entityName}</td><td style="padding:8px 4px;color:#e2e8f0;">${r.field}</td><td style="padding:8px 4px;color:#ef4444;text-decoration:line-through;">${r.oldValue}</td><td style="padding:8px 4px;color:#22c55e;">${r.newValue}</td></tr>`
      ).join('');

      const flaggedRows = flaggedItems.map(r =>
        `<tr style="border-bottom:1px solid #334155;"><td style="padding:8px 4px;color:#e2e8f0;">${r.entityName}</td><td style="padding:8px 4px;color:#e2e8f0;">${r.field}</td><td style="padding:8px 4px;color:#e2e8f0;">${r.oldValue}</td><td style="padding:8px 4px;color:#f59e0b;">${r.newValue}</td><td style="padding:8px 4px;color:#94a3b8;">${(r.confidence * 100).toFixed(0)}%</td></tr>`
      ).join('');

      const emailBody = `<!DOCTYPE html>
<html>
<body style="background:#0f172a; color:#e2e8f0; font-family:system-ui,-apple-system,sans-serif; padding:24px;">
  <h2 style="color:#60a5fa; margin:0 0 16px;">Simplicity Body Audit Report</h2>
  <p style="color:#94a3b8; font-size:13px;">
    ${new Date(report.timestamp).toLocaleString('en-US', { timeZone: 'America/Detroit' })} ET | Duration: ${(report.duration / 1000).toFixed(1)}s
  </p>

  <div style="background:#1e293b; border:1px solid #334155; border-radius:8px; padding:16px; margin-bottom:24px;">
    <h3 style="margin:0 0 8px; color:#94a3b8; font-size:13px;">Market Health</h3>
    <p style="margin:0; color:#e2e8f0;">
      Gold: $${report.marketHealth.goldPrice.toFixed(2)} | Silver: $${report.marketHealth.silverPrice.toFixed(2)} | Platinum: $${report.marketHealth.platinumPrice.toFixed(2)} | Status: ${report.marketHealth.status}
    </p>
  </div>

  ${fixedItems.length > 0 ? `
  <div style="background:#1e293b; border:1px solid #22c55e33; border-radius:8px; padding:16px; margin-bottom:24px;">
    <h3 style="margin:0 0 12px; color:#22c55e; font-size:14px;">Auto-Fixed (${fixedItems.length} items)</h3>
    <table style="width:100%; border-collapse:collapse; font-size:12px;">
      <thead>
        <tr style="color:#94a3b8; border-bottom:1px solid #334155;">
          <th style="text-align:left; padding:8px 4px;">Item</th>
          <th style="text-align:left; padding:8px 4px;">Field</th>
          <th style="text-align:left; padding:8px 4px;">Old</th>
          <th style="text-align:left; padding:8px 4px;">New</th>
        </tr>
      </thead>
      <tbody>${fixedRows}</tbody>
    </table>
  </div>` : ''}

  ${flaggedItems.length > 0 ? `
  <div style="background:#1e293b; border:1px solid #f59e0b33; border-radius:8px; padding:16px; margin-bottom:24px;">
    <h3 style="margin:0 0 12px; color:#f59e0b; font-size:14px;">Needs Your Review (${flaggedItems.length} items)</h3>
    <table style="width:100%; border-collapse:collapse; font-size:12px;">
      <thead>
        <tr style="color:#94a3b8; border-bottom:1px solid #334155;">
          <th style="text-align:left; padding:8px 4px;">Item</th>
          <th style="text-align:left; padding:8px 4px;">Field</th>
          <th style="text-align:left; padding:8px 4px;">Current</th>
          <th style="text-align:left; padding:8px 4px;">Suggested</th>
          <th style="text-align:left; padding:8px 4px;">Confidence</th>
        </tr>
      </thead>
      <tbody>${flaggedRows}</tbody>
    </table>
  </div>` : ''}

  ${report.issuesFound === 0 ? `
  <div style="background:#1e293b; border:1px solid #22c55e33; border-radius:8px; padding:16px; text-align:center;">
    <p style="color:#22c55e; margin:0; font-size:14px;">All systems healthy. No issues found in this audit cycle.</p>
  </div>` : ''}

  <p style="color:#475569; font-size:11px; text-align:center; margin-top:24px;">
    Simplicity Body System | simpletonapp.com | LaDale Industries LLC<br>
    Audit duration: ${(report.duration / 1000).toFixed(1)}s | Next audit in ~1 hour
  </p>
</body>
</html>`;

      await sgClient.send({
        to: 'demiris@simpletonapp.com',
        from: 'intel@simpletonapp.com',
        subject: `Simplicity Body Audit: ${report.autoFixed} fixed, ${report.flagged} flagged — ${new Date(report.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Detroit' })} ET`,
        html: emailBody,
      });

      console.log('Body audit report emailed to Demiris');
    } catch (emailError) {
      console.error('Failed to send audit email:', emailError);
    }
  }
}

export const simplicityBodySystem = new SimplicityBodySystem();
