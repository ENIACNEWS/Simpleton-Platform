import { Request, Response, NextFunction } from "express";
import type { User } from "@shared/schema";

/**
 * Comprehensive Rate Limiting & Security System
 * Prevents API abuse and enforces subscription tier limits
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  dailyLimit: number; // Max requests per day
  tierName: string;
}

interface UserLimits {
  [key: string]: RateLimitConfig;
}

// Subscription tier limits
const TIER_LIMITS: UserLimits = {
  free: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute (increased for development)
    dailyLimit: 10000, // 10,000 requests per day (increased for development)
    tierName: "Free Tier"
  },
  silver: {
    windowMs: 60 * 1000, // 1 minute  
    maxRequests: 100, // 100 requests per minute
    dailyLimit: 10000, // 10,000 requests per day
    tierName: "Silver Access"
  },
  gold: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 500, // 500 requests per minute
    dailyLimit: 100000, // 100,000 requests per day
    tierName: "Gold API"
  },
  platinum: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 1000, // 1,000 requests per minute
    dailyLimit: 500000, // 500,000 requests per day
    tierName: "Platinum Pro"
  },
  diamond: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10000, // 10,000 requests per minute
    dailyLimit: 10000000, // 10M requests per day
    tierName: "Diamond Elite"
  }
};

// In-memory storage for rate limiting (in production, use Redis)
class RateLimitStore {
  private requests: Map<string, { count: number; resetTime: number; dailyCount: number; dailyResetTime: number }> = new Map();

  getRequestCount(key: string, windowMs: number): { count: number; dailyCount: number; shouldReset: boolean; shouldResetDaily: boolean } {
    const now = Date.now();
    const data = this.requests.get(key);
    
    if (!data) {
      this.requests.set(key, { 
        count: 0, 
        resetTime: now + windowMs,
        dailyCount: 0,
        dailyResetTime: now + (24 * 60 * 60 * 1000) // 24 hours
      });
      return { count: 0, dailyCount: 0, shouldReset: false, shouldResetDaily: false };
    }

    const shouldReset = now > data.resetTime;
    const shouldResetDaily = now > data.dailyResetTime;
    
    if (shouldReset) {
      data.count = 0;
      data.resetTime = now + windowMs;
    }
    
    if (shouldResetDaily) {
      data.dailyCount = 0;
      data.dailyResetTime = now + (24 * 60 * 60 * 1000);
    }

    return { 
      count: data.count, 
      dailyCount: data.dailyCount,
      shouldReset, 
      shouldResetDaily 
    };
  }

  incrementCount(key: string): void {
    const data = this.requests.get(key);
    if (data) {
      data.count++;
      data.dailyCount++;
    }
  }

  getRemainingTime(key: string): number {
    const data = this.requests.get(key);
    if (!data) return 0;
    return Math.max(0, data.resetTime - Date.now());
  }
}

const rateLimitStore = new RateLimitStore();

// Security: Block suspicious activity
class SecurityMonitor {
  private suspiciousIPs: Map<string, { violations: number; lastViolation: number }> = new Map();
  private blockedIPs: Set<string> = new Set();

  isSuspicious(ip: string, userAgent?: string): boolean {
    // Block known bot user agents
    if (userAgent) {
      const botPatterns = [
        /bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i, /python/i
      ];
      if (botPatterns.some(pattern => pattern.test(userAgent))) {
        this.addViolation(ip, "Bot detected");
        return true;
      }
    }

    // Check if IP is already blocked
    if (this.blockedIPs.has(ip)) {
      return true;
    }

    return false;
  }

  addViolation(ip: string, reason: string): void {
    const data = this.suspiciousIPs.get(ip) || { violations: 0, lastViolation: 0 };
    data.violations++;
    data.lastViolation = Date.now();
    this.suspiciousIPs.set(ip, data);

    // Block IP after 5 violations
    if (data.violations >= 5) {
      this.blockedIPs.add(ip);
      console.log(`🚨 SECURITY: Blocked IP ${ip} after ${data.violations} violations. Reason: ${reason}`);
    }
  }

  getViolations(ip: string): number {
    return this.suspiciousIPs.get(ip)?.violations || 0;
  }

  getAllViolations(): { ip: string; violations: number; lastViolation: number }[] {
    return Array.from(this.suspiciousIPs.entries()).map(([ip, data]) => ({
      ip,
      violations: data.violations,
      lastViolation: data.lastViolation
    }));
  }

  getBlockedIPs(): string[] {
    return Array.from(this.blockedIPs);
  }

  getTotalViolations(): number {
    return Array.from(this.suspiciousIPs.values())
      .reduce((sum, data) => sum + data.violations, 0);
  }

  // Clear blocked IP to restore access
  clearBlockedIP(ip: string): void {
    this.blockedIPs.delete(ip);
    this.suspiciousIPs.delete(ip);
    console.log(`✅ SECURITY: Cleared blocked IP ${ip} for feedback system access`);
  }

  // Clear all blocked IPs (for system reset)
  clearAllBlockedIPs(): void {
    const blockedCount = this.blockedIPs.size;
    this.blockedIPs.clear();
    this.suspiciousIPs.clear();
    console.log(`✅ SECURITY: Cleared ${blockedCount} blocked IPs for system reset`);
  }
}

const securityMonitor = new SecurityMonitor();

// Export security monitor functions
export function clearBlockedIP(ip: string): void {
  securityMonitor.clearBlockedIP(ip);
}

export function clearAllBlockedIPs(): void {
  securityMonitor.clearAllBlockedIPs();
}

// Clear blocked IPs on server start for development
console.log("🔄 DEVELOPMENT: Clearing all blocked IPs for fresh start");
clearAllBlockedIPs();

// Get user's subscription tier
function getUserTier(user?: any): string {
  if (!user) return "free";
  
  // Check user's subscription status
  const subscription = user.subscription || user.tier || "free";
  return subscription.toLowerCase();
}

// API Key validation and tier detection
function getAPIKeyTier(apiKey?: string): string {
  if (!apiKey) return "free";
  
  // Extract tier from API key prefix
  if (apiKey.startsWith("sk_diamond_")) return "diamond";
  if (apiKey.startsWith("sk_platinum_")) return "platinum";
  if (apiKey.startsWith("sk_gold_")) return "gold";
  if (apiKey.startsWith("sk_silver_")) return "silver";
  
  return "free";
}

// Main rate limiting middleware
export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.connection.remoteAddress || "unknown";
  const userAgent = req.get("User-Agent");
  const apiKey = req.headers.authorization?.replace("Bearer ", "");
  
  // Skip ALL security checks for feedback submissions to ensure customer support accessibility
  if (req.path === '/api/feedback/submit') {
    return next();
  }
  
  // PRODUCTION FIX: Whitelist internal API calls for quantum tickers and core functionality
  const internalPaths = [
    '/api/ticker/metals',
    '/api/ticker/intelligence',
    '/api/ticker/lottery',
    '/api/ticker/diamonds',
    '/api/quantum-ticker-2055',
    '/api/api-documents',
    '/api/analytics/precious-metals-stats',
    '/api/analytics/financial-stats',
    '/api/analytics/ai-stats',
    '/api/analytics',
    '/api/pricing/kitco',
    '/api/pricing/latest',
    '/api/health',
    '/api/security/stats',
    '/api/ai/status'
  ];
  
  // Allow internal calls and localhost traffic without rate limiting
  if (internalPaths.some(path => req.path.startsWith(path)) || 
      ip === '127.0.0.1' || 
      ip === '::1' || 
      ip === 'localhost' ||
      userAgent?.includes('node-fetch') ||
      userAgent?.includes('axios')) {
    return next();
  }
  
  // Security check
  if (securityMonitor.isSuspicious(ip, userAgent)) {
    return res.status(429).json({
      error: "Too Many Requests",
      message: "IP blocked for suspicious activity",
      code: "SECURITY_BLOCK",
      violations: securityMonitor.getViolations(ip)
    });
  }

  // Determine user tier
  const userTier = apiKey ? getAPIKeyTier(apiKey) : getUserTier(req.user);
  const limits = TIER_LIMITS[userTier] || TIER_LIMITS.free;
  
  // Create unique key for rate limiting
  const limitKey = apiKey ? `api_${apiKey}` : `ip_${ip}`;
  
  // Check current usage
  const usage = rateLimitStore.getRequestCount(limitKey, limits.windowMs);
  
  // Check if limits exceeded
  if (usage.count >= limits.maxRequests) {
    securityMonitor.addViolation(ip, "Rate limit exceeded");
    
    return res.status(429).json({
      error: "Rate Limit Exceeded",
      message: `${limits.tierName} limit: ${limits.maxRequests} requests per minute`,
      retryAfter: Math.ceil(rateLimitStore.getRemainingTime(limitKey) / 1000),
      limits: {
        tier: limits.tierName,
        minuteLimit: limits.maxRequests,
        dailyLimit: limits.dailyLimit,
        current: usage.count,
        dailyCurrent: usage.dailyCount
      }
    });
  }
  
  // Check daily limits
  if (usage.dailyCount >= limits.dailyLimit) {
    securityMonitor.addViolation(ip, "Daily limit exceeded");
    
    return res.status(429).json({
      error: "Daily Limit Exceeded", 
      message: `${limits.tierName} daily limit: ${limits.dailyLimit} requests per day`,
      limits: {
        tier: limits.tierName,
        dailyLimit: limits.dailyLimit,
        dailyCurrent: usage.dailyCount,
        resetsAt: new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString()
      }
    });
  }

  // Increment usage counter
  rateLimitStore.incrementCount(limitKey);
  
  // Add rate limit headers
  res.set({
    'X-RateLimit-Limit': limits.maxRequests.toString(),
    'X-RateLimit-Remaining': Math.max(0, limits.maxRequests - usage.count - 1).toString(),
    'X-RateLimit-Reset': new Date(Date.now() + rateLimitStore.getRemainingTime(limitKey)).toISOString(),
    'X-RateLimit-Tier': limits.tierName,
    'X-Daily-Limit': limits.dailyLimit.toString(),
    'X-Daily-Remaining': Math.max(0, limits.dailyLimit - usage.dailyCount - 1).toString()
  });

  next();
}

// Middleware specifically for API endpoints
export function apiRateLimiter(req: Request, res: Response, next: NextFunction) {
  // Skip rate limiting for feedback submissions to ensure customer support accessibility
  if (req.path === '/api/feedback/submit') {
    return next();
  }
  
  // Only apply to API routes
  if (!req.path.startsWith('/api/')) {
    return next();
  }
  
  return rateLimiter(req, res, next);
}

// Get current usage stats for a user/API key
export function getUsageStats(apiKey?: string, ip?: string): any {
  const limitKey = apiKey ? `api_${apiKey}` : `ip_${ip}`;
  const tier = apiKey ? getAPIKeyTier(apiKey) : "free";
  const limits = TIER_LIMITS[tier];
  const usage = rateLimitStore.getRequestCount(limitKey, limits.windowMs);
  
  return {
    tier: limits.tierName,
    limits: {
      minuteLimit: limits.maxRequests,
      dailyLimit: limits.dailyLimit
    },
    usage: {
      currentMinute: usage.count,
      currentDay: usage.dailyCount,
      remainingMinute: Math.max(0, limits.maxRequests - usage.count),
      remainingDay: Math.max(0, limits.dailyLimit - usage.dailyCount)
    },
    resetTimes: {
      minuteReset: new Date(Date.now() + rateLimitStore.getRemainingTime(limitKey)).toISOString(),
      dailyReset: new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString()
    }
  };
}

// Get comprehensive security statistics
// getSecurityStats function removed as requested by user

export { TIER_LIMITS, securityMonitor };