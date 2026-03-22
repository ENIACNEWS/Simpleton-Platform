import fs from 'fs';
import path from 'path';

const routesPath = path.join(process.cwd(), 'server/routes-monolith-backup.ts');
const content = fs.readFileSync(routesPath, 'utf-8');
const lines = content.split('\n');

interface RouteBlock {
  startLine: number;
  endLine: number;
  path: string;
  method: string;
}

function findRouteBlocks(): RouteBlock[] {
  const blocks: RouteBlock[] = [];
  const routePattern = /^\s*app\.(get|post|put|patch|delete)\s*\(\s*["'`]([^"'`]+)/;
  
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(routePattern);
    if (match) {
      blocks.push({
        startLine: i,
        endLine: -1,
        method: match[1],
        path: match[2],
      });
    }
  }
  return blocks;
}

const blocks = findRouteBlocks();
console.log(`Found ${blocks.length} route handlers`);

const categories: Record<string, string[]> = {};
for (const b of blocks) {
  const p = b.path;
  let cat = 'platform';
  
  if (p.startsWith('/api/chat/') || (p.startsWith('/api/assistant/') && !p.includes('appraise'))) cat = 'assistant';
  else if (p.startsWith('/api/assistant/appraise')) cat = 'appraisal';
  else if (p.startsWith('/api/appraisal/')) cat = 'appraisal';
  else if (p.startsWith('/api/auth/')) cat = 'auth';
  else if (p.startsWith('/api/portfolio')) cat = 'portfolio';
  else if (p.startsWith('/api/s7/') || p.startsWith('/api/ghost-admin/')) cat = 'admin';
  else if (p.startsWith('/api/pricing/') || p.startsWith('/api/coins') || p.startsWith('/api/calculator/') || p.startsWith('/api/articles') || p.startsWith('/api/discussions')) cat = 'pricing';
  else if (p.startsWith('/api/news/') || p.startsWith('/api/ticker/') || p.startsWith('/api/tickers/') || p.startsWith('/api/market-signals/') || p.startsWith('/api/market/') || p.startsWith('/api/price-alerts') || p.startsWith('/api/transactions')) cat = 'market';
  else if (p.startsWith('/api/quantum/') || p.startsWith('/api/quantum-ticker')) cat = 'market';
  else if (p.startsWith('/api/v1/index') || p.startsWith('/api/v1/predictions')) cat = 'market';
  else if (p.startsWith('/api/revolutionary/') || p.startsWith('/api/status/')) cat = 'market';
  else if (p.startsWith('/api/diamond') || p.startsWith('/api/admin/diamond') || p.startsWith('/api/admin/rapaport') || p.startsWith('/api/diamonds/')) cat = 'diamonds';
  else if (p.startsWith('/api/gmail/')) cat = 'gmail';
  else if (p.startsWith('/api/simpletons-list') || p.startsWith('/api/admin/businesses') || p.startsWith('/api/admin/complaints') || p.startsWith('/api/admin/sync-google')) cat = 'simpletons-list';
  else if (p.startsWith('/api/intelligence/') || p.startsWith('/api/body/')) cat = 'intelligence';
  else if (p.startsWith('/api/user/memories') || p.startsWith('/api/revenue/') || p.startsWith('/api/documents/') || p.startsWith('/api/usage/') || p.startsWith('/api/admin/revenue') || p.startsWith('/api/subscription/')) cat = 'platform';
  else if (p.startsWith('/api/rolex') || p.startsWith('/api/watches')) cat = 'watches';
  else if (p.startsWith('/api/api-keys') || p.startsWith('/api/openai/') || p.startsWith('/api/ai/') || p.startsWith('/api/universal-ai')) cat = 'ai-services';
  else if (p.startsWith('/api/business/')) cat = 'business-intel';
  else if (p.startsWith('/api/enterprise/') || p.startsWith('/api/qa/')) cat = 'enterprise';
  else if (p.startsWith('/api/licenses/')) cat = 'licenses';
  else if (p.startsWith('/api/feedback/')) cat = 'platform';
  else if (p.startsWith('/api/free-apis')) cat = 'market';
  else if (p.startsWith('/api/competitive-pricing') || p.startsWith('/api/simpleton-vision') || p.startsWith('/api/economic') || p.startsWith('/api/forex')) cat = 'market';
  else if (p.startsWith('/api/community/') || p.startsWith('/api/support/') || p.startsWith('/api/analytics/') || p.startsWith('/api/export/') || p.startsWith('/api/team/')) cat = 'platform';
  else if (p.startsWith('/api/marketing/') || p.startsWith('/api/admin/ghost-login') || p.startsWith('/api/admin/dashboard') || p.startsWith('/api/admin/files') || p.startsWith('/api/admin/ip-') || p.startsWith('/api/admin/access-')) cat = 'admin';
  else if (p.startsWith('/api/protected-files/') || p.startsWith('/api/maintenance/')) cat = 'admin';
  else if (p.startsWith('/api/database/') || p.startsWith('/api/health') || p.startsWith('/api/docs') || p.startsWith('/api/api-documents') || p.startsWith('/api/stats') || p.startsWith('/api/validation')) cat = 'platform';
  
  if (!categories[cat]) categories[cat] = [];
  categories[cat].push(`${b.method.toUpperCase()} ${p}`);
}

console.log('\n=== ROUTE DISTRIBUTION ===');
for (const [cat, routes] of Object.entries(categories).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n${cat}: ${routes.length} routes`);
  for (const r of routes.slice(0, 5)) console.log(`  ${r}`);
  if (routes.length > 5) console.log(`  ... and ${routes.length - 5} more`);
}
