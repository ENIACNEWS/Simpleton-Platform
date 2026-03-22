import fs from 'fs';
import path from 'path';

const srcPath = path.join(process.cwd(), 'server/routes-monolith-backup.ts');
const content = fs.readFileSync(srcPath, 'utf-8');
const lines = content.split('\n');

function getIndent(line: string): number {
  const match = line.match(/^(\s*)/);
  return match ? match[1].length : 0;
}

interface Block {
  startLine: number;
  endLine: number;
  path: string;
  method: string;
  code: string[];
}

function extractRouteBlocks(): Block[] {
  const blocks: Block[] = [];
  const routePattern = /^\s*app\.(get|post|put|patch|delete)\s*\(\s*["'`]([^"'`]+)/;
  
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(routePattern);
    if (match) {
      const startLine = i;
      const baseIndent = getIndent(lines[i]);
      let braceCount = 0;
      let started = false;
      let endLine = i;
      
      for (let j = i; j < lines.length; j++) {
        const line = lines[j];
        for (const ch of line) {
          if (ch === '{') { braceCount++; started = true; }
          if (ch === '}') braceCount--;
        }
        if (started && braceCount <= 0) {
          if (lines[j + 1]?.trim() === '});' || lines[j + 1]?.trim() === '});') {
            endLine = j + 1;
          } else {
            endLine = j;
          }
          break;
        }
      }
      
      if (endLine <= startLine) endLine = startLine + 1;
      
      const closingLine = lines[endLine]?.trim();
      if (closingLine !== '});' && closingLine !== '});') {
        for (let k = endLine; k < Math.min(endLine + 5, lines.length); k++) {
          if (lines[k]?.trim() === '});') {
            endLine = k;
            break;
          }
        }
      }
      
      blocks.push({
        startLine,
        endLine,
        path: match[2],
        method: match[1],
        code: lines.slice(startLine, endLine + 1),
      });
    }
  }
  return blocks;
}

function categorize(p: string): string {
  if (p.startsWith('/api/chat/') || (p.startsWith('/api/assistant/') && !p.includes('appraise'))) return 'assistant';
  if (p.startsWith('/api/assistant/appraise') || p.startsWith('/api/appraisal/')) return 'appraisal';
  if (p.startsWith('/api/auth/')) return 'auth';
  if (p.startsWith('/api/portfolio') || p === '/api/portfolio-items') return 'portfolio';
  if (p.startsWith('/api/s7/') || p.startsWith('/api/ghost-admin/')) return 'admin';
  if (p.startsWith('/api/admin/ghost-login') || p.startsWith('/api/admin/dashboard') || p.startsWith('/api/admin/files') || p.startsWith('/api/admin/ip-') || p.startsWith('/api/admin/access-')) return 'admin';
  if (p.startsWith('/api/protected-files/') || p.startsWith('/api/maintenance/') || p.startsWith('/api/marketing/')) return 'admin';
  if (p.startsWith('/api/pricing/') || p.startsWith('/api/coins') || p.startsWith('/api/calculator/') || p.startsWith('/api/articles') || p.startsWith('/api/discussions')) return 'pricing';
  if (p.startsWith('/api/news/') || p.startsWith('/api/ticker/') || p.startsWith('/api/tickers/') || p.startsWith('/api/market-signals/') || p.startsWith('/api/market/')) return 'market';
  if (p.startsWith('/api/quantum/') || p.startsWith('/api/quantum-ticker')) return 'market';
  if (p.startsWith('/api/v1/index') || p.startsWith('/api/v1/predictions')) return 'market';
  if (p.startsWith('/api/revolutionary/') || p.startsWith('/api/status/')) return 'market';
  if (p.startsWith('/api/price-alerts') || p.startsWith('/api/transactions')) return 'market';
  if (p.startsWith('/api/free-apis') || p.startsWith('/api/competitive-pricing') || p.startsWith('/api/simpleton-vision') || p.startsWith('/api/economic') || p.startsWith('/api/forex')) return 'market';
  if (p.startsWith('/api/diamond') || p.startsWith('/api/admin/diamond') || p.startsWith('/api/admin/rapaport') || p.startsWith('/api/diamonds/')) return 'diamonds';
  if (p.startsWith('/api/gmail/')) return 'gmail';
  if (p.startsWith('/api/simpletons-list') || p.startsWith('/api/admin/businesses') || p.startsWith('/api/admin/complaints') || p.startsWith('/api/admin/sync-google')) return 'simpletons-list';
  if (p.startsWith('/api/intelligence/') || p.startsWith('/api/body/')) return 'intelligence';
  if (p.startsWith('/api/rolex') || p.startsWith('/api/watches')) return 'watches';
  if (p.startsWith('/api/openai/') || p.startsWith('/api/universal-ai')) return 'ai-services';
  if (p.startsWith('/api/ai/')) return 'ai-services';
  if (p.startsWith('/api/business/')) return 'platform';
  if (p.startsWith('/api/enterprise/') || p.startsWith('/api/qa/')) return 'platform';
  if (p.startsWith('/api/licenses/')) return 'platform';
  return 'platform';
}

const blocks = extractRouteBlocks();
console.log(`Extracted ${blocks.length} route blocks`);

const groups: Record<string, Block[]> = {};
for (const b of blocks) {
  const cat = categorize(b.path);
  if (!groups[cat]) groups[cat] = [];
  groups[cat].push(b);
}

function findContextLines(startLine: number, endLine: number): string[] {
  const context: string[] = [];
  for (let i = Math.max(0, startLine - 15); i < startLine; i++) {
    const line = lines[i];
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*') || line.trim() === '') {
      if (line.trim().startsWith('// ─') || line.trim().startsWith('//') && line.trim().length > 3) {
        context.push(line);
      }
    }
    if (line.trim().startsWith('const ') && !line.includes('app.')) {
      const isUsedInBlock = lines.slice(startLine, endLine + 1).some(l => {
        const varName = line.match(/const\s+(\w+)/)?.[1];
        return varName && l.includes(varName);
      });
      if (isUsedInBlock) context.push(line);
    }
  }
  return context;
}

function findGhostMiddleware(): string[] {
  const result: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('ghostOwnerCheck') && (lines[i].includes('const ') || lines[i].includes('function ') || lines[i].includes('let '))) {
      let j = i;
      let braces = 0;
      let started = false;
      while (j < lines.length) {
        for (const ch of lines[j]) {
          if (ch === '{') { braces++; started = true; }
          if (ch === '}') braces--;
        }
        result.push(lines[j]);
        if (started && braces <= 0) break;
        j++;
      }
      result.push('');
    }
    if (lines[i].includes('GhostAdminIntelligence') && lines[i].includes('new ')) {
      result.push(lines[i]);
    }
  }
  return result;
}

const routesDir = path.join(process.cwd(), 'server/routes');
if (!fs.existsSync(routesDir)) fs.mkdirSync(routesDir, { recursive: true });

const moduleNames: string[] = [];

for (const [cat, catBlocks] of Object.entries(groups)) {
  const exportName = `register${cat.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}Routes`;
  moduleNames.push(cat);

  let moduleCode = `import type { Express, Request, Response, NextFunction } from "express";\n`;
  moduleCode += `import { db } from "../db";\n`;
  moduleCode += `import { eq, and, sql, count, desc, asc } from "drizzle-orm";\n`;
  moduleCode += `import { isAuthenticated } from "../auth";\n`;
  
  const allCode = catBlocks.map(b => b.code.join('\n')).join('\n');
  
  const schemaImports = new Set<string>();
  const schemaNames = ['users','portfolios','portfolioItems','licenseKeys','rolexModels','rolexMovements','rolexSerialRanges','rolexMarketValues','rolexAuthenticationMarkers','apiKeys','sessions','assistantSessions','assistantMessages','activityLogs','calculatorSettings','calculationHistory','diamondCalculatorSettings','globalDiamondPrices','rapaportPrices','userMemories','revenuePhases','documentPurchases','dailyUsage','listedBusinesses','businessReviews','businessComplaints','siteVisitors','ghostConversations','ghostMessages','appraisals','insertCoinSchema','insertArticleSchema','insertDiscussionSchema','insertReplySchema','insertUserSchema'];
  for (const name of schemaNames) {
    if (allCode.includes(name)) schemaImports.add(name);
  }
  if (schemaImports.size > 0) {
    moduleCode += `import { ${Array.from(schemaImports).join(', ')} } from "@shared/schema";\n`;
  }

  if (allCode.includes('crypto.')) moduleCode += `import crypto from "crypto";\n`;
  if (allCode.includes('bcrypt.') || allCode.includes('bcryptjs')) moduleCode += `import bcrypt from "bcryptjs";\n`;
  if (allCode.includes('Anthropic')) moduleCode += `import Anthropic from "@anthropic-ai/sdk";\n`;
  if (allCode.includes('storage.')) moduleCode += `import { storage } from "../storage";\n`;
  if (allCode.includes('passport.') || allCode.includes('passport,')) moduleCode += `import passport from "passport";\n`;
  if (allCode.includes('notifyOwner') || allCode.includes('newUserEmailBody') || allCode.includes('feedbackEmailBody')) moduleCode += `import { notifyOwner, newUserEmailBody, feedbackEmailBody } from "../notify-owner";\n`;
  if (allCode.includes('hashPassword') || allCode.includes('generateToken')) moduleCode += `import { generateToken, hashPassword } from "../auth";\n`;
  if (allCode.includes('rebalancingService')) moduleCode += `import { rebalancingService } from "../rebalancing-service";\n`;
  if (allCode.includes('getKitcoPricing') || allCode.includes('handleKitcoPricing')) moduleCode += `import { handleKitcoPricing, getKitcoPricing } from "../kitco-pricing";\n`;
  if (allCode.includes('handleRevolutionaryPricing')) moduleCode += `import { handleRevolutionaryPricing } from "../metals-aggregator";\n`;
  if (allCode.includes('handleRevolutionaryAI') || allCode.includes('multiProviderAI')) moduleCode += `import { handleRevolutionaryAI, multiProviderAI } from "../ai-engine";\n`;
  if (allCode.includes('getMetalsNews') || allCode.includes('getDiamondsNews')) moduleCode += `import { getMetalsNews, getDiamondsNews, getCoinsNews, getWatchesNews, getAllNews, getNewsTicker } from "../news-feed-api";\n`;
  if (allCode.includes('getFreeAPIData') || allCode.includes('getRSSFeeds')) moduleCode += `import { getFreeAPIData, getRSSFeeds } from "../free-apis-integration";\n`;
  if (allCode.includes('getQuantumMarketData') || allCode.includes('getQuantumSavings')) moduleCode += `import { getQuantumMarketData, getQuantumSavings, getQuantumStatus } from "../quantum-ticker-2056";\n`;
  if (allCode.includes('getAllAPIStatus') || allCode.includes('getAPIMarketValue') || allCode.includes('getAPIHistory')) moduleCode += `import { getAllAPIStatus, getAPIMarketValue, getAPIHistory } from "../api-status-monitor";\n`;
  if (allCode.includes('getEnhancedMetalsData') || allCode.includes('getMarketIntelligence')) moduleCode += `import { getEnhancedMetalsData, getMarketIntelligence } from "../ticker-apis";\n`;
  if (allCode.includes('RAPAPORT_GRID_LOCKED')) moduleCode += `import { RAPAPORT_GRID_LOCKED } from "@shared/rapaport-grid-lock";\n`;
  if (allCode.includes('PEAR_PRICING_GRID_LOCKED')) moduleCode += `import { PEAR_PRICING_GRID_LOCKED } from "@shared/pear-pricing-grid-lock";\n`;
  if (allCode.includes('revolutionaryDiamondAggregator')) moduleCode += `import { revolutionaryDiamondAggregator } from "../diamond-aggregator";\n`;
  if (allCode.includes('authenticateAPIKey') || allCode.includes('rateLimitAPIKey') || allCode.includes('logAPIUsage')) moduleCode += `import { authenticateAPIKey, rateLimitAPIKey, logAPIUsage, type AuthenticatedRequest } from "../api-auth";\n`;
  if (allCode.includes('GhostAdminIntelligence')) moduleCode += `import { GhostAdminIntelligence } from "../ghost-admin-competitive-intelligence";\n`;
  if (allCode.includes('v7,') || allCode.includes('getAllVisitors') || allCode.includes('getAllUsers') || allCode.includes('getVisitorStats') || allCode.includes('promoteOwners')) moduleCode += `import { v7, s7m, promoteOwners, getAllVisitors, getAllUsers, getVisitorStats } from "../s7-core";\n`;
  if (allCode.includes('adminSecurity') || allCode.includes('ownerOnlyAccess')) moduleCode += `import { adminSecurity, ownerOnlyAccess } from "../admin-security";\n`;
  if (allCode.includes('selfMaintenanceSystem')) moduleCode += `import { selfMaintenanceSystem } from "../self-maintenance-system";\n`;
  if (allCode.includes('subscriptionService')) moduleCode += `import { subscriptionService } from "../subscription-service";\n`;
  if (allCode.includes('enhancedAI')) moduleCode += `import { enhancedAI } from "../ai-intelligence";\n`;
  if (allCode.includes('handleAIChat') || allCode.includes('handleAIProviderStats') || allCode.includes('handleAIProviderList') || allCode.includes('handleAIBulletproofStatus')) moduleCode += `import { handleAIChat, handleAIProviderStats, handleAIProviderList, handleAIBulletproofStatus } from "../ai-aggregator";\n`;
  if (allCode.includes('handleQuantumChatCompletion') || allCode.includes('handleQuantumVisionAnalysis') || allCode.includes('handleQuantumModels')) moduleCode += `import { handleQuantumChatCompletion, handleQuantumVisionAnalysis, handleQuantumModels } from "../quantum-engine";\n`;
  if (allCode.includes('all50AIModelsEngine') || allCode.includes('ALL_50_AI_MODELS')) moduleCode += `import { all50AIModelsEngine, ALL_50_AI_MODELS } from "../all-50-ai-models";\n`;
  if (allCode.includes('enterpriseAPIManager')) moduleCode += `import { enterpriseAPIManager } from "../enterprise-api-integrations";\n`;
  if (allCode.includes('qaAutomation')) moduleCode += `import { qaAutomation } from "../qa-automation";\n`;
  if (allCode.includes('LicenseService')) moduleCode += `import { LicenseService } from "../license-service";\n`;
  if (allCode.includes('getBusinessDemographics') || allCode.includes('getBusinessDetails')) moduleCode += `import { getBusinessDemographics, getBusinessDetails, getIndustryAnalysis, getCompetitorAnalysis, getBusinessIntelligenceStats, getBusinessAPIDocumentation } from "../business-demographics-api";\n`;
  if (allCode.includes('getUncachableSendGridClient')) moduleCode += `import { getUncachableSendGridClient } from "../sendgrid-client";\n`;
  if (allCode.includes('getUserAPIKeys') || allCode.includes('createAPIKey') || allCode.includes('updateAPIKey') || allCode.includes('deleteAPIKey') || allCode.includes('getAPIKeyUsage') || allCode.includes('getAPIBilling') || allCode.includes('getAPIDocumentation')) moduleCode += `import { getUserAPIKeys, createAPIKey, updateAPIKey, deleteAPIKey, getAPIKeyUsage, getAPIBilling, getAPIDocumentation } from "../api-management";\n`;
  if (allCode.includes('RevolutionaryDataCollector') || allCode.includes('revolutionaryCollector')) moduleCode += `import { RevolutionaryDataCollector } from "../data-collector";\n`;
  if (allCode.includes('revolutionaryPasscodes') || allCode.includes('communicationStats')) moduleCode += `import { revolutionaryPasscodes, communicationStats } from "../revolutionary-communications";\n`;
  if (allCode.includes('analyzeRolexCondition') || allCode.includes('getRolexMovementExpertise') || allCode.includes('analyzeRolexFeatures')) moduleCode += `import { analyzeRolexCondition, getRolexMovementExpertise, analyzeRolexFeatures } from "../ai-rolex-expert";\n`;
  if (allCode.includes('autoUpdateRolexDatabase')) moduleCode += `import { autoUpdateRolexDatabase } from "../rolex-auto-updater";\n`;
  if (allCode.includes('Stripe')) moduleCode += `import Stripe from "stripe";\n`;
  if (allCode.includes('multer') || allCode.includes('upload.')) moduleCode += `import multer from "multer";\nexport const upload = multer({ storage: multer.memoryStorage() });\n`;
  if (allCode.includes('nodemailer')) moduleCode += `import nodemailer from "nodemailer";\n`;
  if (allCode.includes('puppeteer')) moduleCode += `import puppeteer from "puppeteer";\n`;
  if (allCode.includes('getUsageStats')) moduleCode += `import { getUsageStats } from "../rate-limiter";\n`;

  moduleCode += `\n`;

  if (cat === 'market' && allCode.includes('revolutionaryCollector')) {
    moduleCode += `const revolutionaryCollector = new RevolutionaryDataCollector();\n\n`;
  }
  
  if (cat === 'pricing' && allCode.includes('revolutionaryCollector')) {
    moduleCode += `const revolutionaryCollector = new RevolutionaryDataCollector();\n\n`;
  }

  moduleCode += `export function ${exportName}(app: Express) {\n`;

  if (cat === 'admin') {
    const ghostMiddleware = findGhostMiddleware();
    if (ghostMiddleware.length > 0) {
      moduleCode += ghostMiddleware.join('\n') + '\n\n';
    }
  }

  for (const block of catBlocks) {
    const contextLines = findContextLines(block.startLine, block.endLine);
    if (contextLines.length > 0) {
      moduleCode += contextLines.join('\n') + '\n';
    }
    moduleCode += block.code.join('\n') + '\n\n';
  }

  moduleCode += `}\n`;

  const filePath = path.join(routesDir, `${cat}.ts`);
  const existingFiles = ['quantum-management.ts', 'quantum-trilogy-routes.ts', 'rapaport-grid-updater.ts'];
  if (existingFiles.includes(`${cat}.ts`)) {
    console.log(`SKIP: ${cat}.ts already exists`);
    continue;
  }
  
  fs.writeFileSync(filePath, moduleCode);
  console.log(`WROTE: server/routes/${cat}.ts (${catBlocks.length} routes, ${moduleCode.split('\n').length} lines)`);
}

const helperFunctions: string[] = [];
for (let i = 0; i < 441; i++) {
  helperFunctions.push(lines[i]);
}

let registerRoutesStart = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('export async function registerRoutes')) {
    registerRoutesStart = i;
    break;
  }
}

const middlewareLines: string[] = [];
for (let i = registerRoutesStart; i < Math.min(registerRoutesStart + 20, lines.length); i++) {
  middlewareLines.push(lines[i]);
}

const endLines: string[] = [];
for (let i = lines.length - 30; i < lines.length; i++) {
  endLines.push(lines[i]);
}

console.log(`\n=== SUMMARY ===`);
console.log(`Total routes extracted: ${blocks.length}`);
console.log(`Modules created: ${moduleNames.length}`);
for (const [cat, catBlocks] of Object.entries(groups)) {
  console.log(`  ${cat}: ${catBlocks.length} routes`);
}
console.log(`\nHelper functions (pre-registerRoutes): ${registerRoutesStart} lines`);
console.log(`Last 10 lines of file:`);
for (let i = lines.length - 10; i < lines.length; i++) {
  console.log(`  ${i}: ${lines[i]}`);
}
