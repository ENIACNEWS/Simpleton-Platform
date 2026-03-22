import { Request, Response, NextFunction } from "express";
import { db } from "./db";
import { apiKeys, apiUsage, rateLimitBuckets } from "@shared/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import crypto from "crypto";

// Extended Request type with API key info
export interface AuthenticatedRequest extends Request {
  apiKey?: {
    id: number;
    keyId: string;
    userId: number;
    tier: string;
    allowedEndpoints: string[];
    requestsPerMinute: number;
    requestsPerDay: number;
    requestsPerMonth: number;
  };
}

/**
 * Middleware to authenticate external API requests using API keys
 * Supports format: Authorization: Bearer smpl_live_<key>
 */
export const authenticateAPIKey = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Skip authentication for internal requests (no Authorization header)
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next();
  }

  try {
    // Extract API key from Authorization header
    const token = authHeader.replace(/^Bearer\s+/, '');
    
    if (!token || (!token.startsWith('smpl_live_') && !token.startsWith('sk_live_'))) {
      return res.status(401).json({
        error: "Invalid API key format",
        message: "API key must be provided in Authorization header"
      });
    }

    // Find the API key in database
    const [apiKey] = await db
      .select()
      .from(apiKeys)
      .where(and(
        eq(apiKeys.keyId, token),
        eq(apiKeys.isActive, true)
      ));

    if (!apiKey) {
      return res.status(401).json({
        error: "Invalid API key",
        message: "API key not found or inactive"
      });
    }

    // Check if API key has expired
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return res.status(401).json({
        error: "API key expired",
        message: "Please generate a new API key"
      });
    }

    // Check endpoint permissions with expanded mapping
    const endpoint = req.path.split('/')[2]; // /api/pricing -> pricing
    const subEndpoint = req.path.split('/')[3]; // /api/ai/process -> process
    
    // Permission mapping - high-level permissions to specific endpoints
    const permissionMap: { [key: string]: string[] } = {
      'ai': ['ai', 'process', 'models', 'consensus', 'generate', 'analyze', 'vision', 'chat'],
      'business': ['business', 'demographics', 'company', 'industry', 'competitors', 'stats'],
      'generate-pdf': ['generate-pdf', 'pdf', 'document', 'report'],
      'pricing': ['pricing', 'metals', 'kitco', 'latest'],
      'diamonds': ['diamonds', 'rapaport', 'valuation'],
      'market': ['market', 'ticker', 'stocks', 'crypto', 'forex', 'polygon', 'alpha-vantage', 'coinmarketcap'],
      'quantum': ['quantum', 'quantum-ticker', 'quantum-management'],
      'quantum-ticker': ['quantum-ticker', 'ticker', 'market-data'],
      'metals': ['metals', 'pricing', 'kitco', 'precious'],
      'finance': ['finance', 'stocks', 'market', 'economic'],
      'financial': ['financial', 'finance', 'stocks', 'market', 'economic', 'polygon', 'alpha-vantage'],
      'crypto': ['crypto', 'cryptocurrency', 'coinmarketcap', 'market', 'trading'],
      'stocks': ['stocks', 'equity', 'polygon', 'alpha-vantage', 'market', 'financial'],
      'polygon': ['polygon', 'stocks', 'market', 'equity', 'financial'],
      'alpha-vantage': ['alpha-vantage', 'stocks', 'market', 'financial', 'economic'],
      'coinmarketcap': ['coinmarketcap', 'crypto', 'cryptocurrency', 'market'],
      'openai': ['openai', 'ai', 'models', 'chat', 'completions', 'vision', 'embeddings', 'fine-tuning'],
      'chat': ['chat', 'completions', 'openai', 'ai', 'models'],
      'completions': ['completions', 'chat', 'openai', 'ai', 'models'],
      'vision': ['vision', 'image', 'openai', 'ai', 'analyze'],
      'models': ['models', 'openai', 'ai', 'list', 'retrieve'],
      'embeddings': ['embeddings', 'openai', 'ai', 'vector'],
      'fine-tuning': ['fine-tuning', 'openai', 'ai', 'training'],
      'pdf-generation': ['pdf-generation', 'generate-pdf', 'pdf', 'document'],
      'ai-access': ['ai-access', 'ai', 'process', 'models']
    };

    // Check if the API key has permission for this endpoint
    if (apiKey.allowedEndpoints && apiKey.allowedEndpoints.length > 0) {
      let hasPermission = false;
      
      for (const permission of apiKey.allowedEndpoints) {
        const allowedEndpoints = permissionMap[permission] || [permission];
        if (allowedEndpoints.includes(endpoint) || allowedEndpoints.includes(subEndpoint)) {
          hasPermission = true;
          break;
        }
      }
      
      if (!hasPermission) {
        return res.status(403).json({
          error: "Endpoint not allowed",
          message: `Your API key doesn't have access to '${endpoint}' endpoints. Required permissions: ${endpoint}`
        });
      }
    }

    // Add API key info to request
    req.apiKey = {
      id: apiKey.id,
      keyId: apiKey.keyId,
      userId: apiKey.userId,
      tier: apiKey.tier,
      allowedEndpoints: apiKey.allowedEndpoints || [],
      requestsPerMinute: apiKey.requestsPerMinute,
      requestsPerDay: apiKey.requestsPerDay,
      requestsPerMonth: apiKey.requestsPerMonth,
    };

    // Update last used timestamp
    await db
      .update(apiKeys)
      .set({ lastUsed: new Date() })
      .where(eq(apiKeys.id, apiKey.id));

    next();
  } catch (error) {
    console.error("API authentication error:", error);
    res.status(500).json({
      error: "Authentication error",
      message: "Internal server error during authentication"
    });
  }
};

/**
 * Rate limiting middleware for external API requests
 */
export const rateLimitAPIKey = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Skip rate limiting for internal requests
  if (!req.apiKey) {
    return next();
  }

  try {
    const now = new Date();
    const apiKeyId = req.apiKey.id;

    // Check rate limits for minute, day, and month
    const limits = [
      { type: 'minute', limit: req.apiKey.requestsPerMinute, window: 1 },
      { type: 'day', limit: req.apiKey.requestsPerDay, window: 24 * 60 },
      { type: 'month', limit: req.apiKey.requestsPerMonth, window: 30 * 24 * 60 }
    ];

    for (const { type, limit, window } of limits) {
      const windowStart = new Date(now.getTime() - window * 60 * 1000);
      
      // Get or create rate limit bucket
      const bucketTime = getBucketTime(now, type);
      
      const [bucket] = await db
        .select()
        .from(rateLimitBuckets)
        .where(and(
          eq(rateLimitBuckets.apiKeyId, apiKeyId),
          eq(rateLimitBuckets.bucketType, type),
          eq(rateLimitBuckets.bucketTime, bucketTime)
        ));

      let currentCount = 0;

      if (bucket) {
        currentCount = bucket.requestCount;
        
        // Reset bucket if it's a new time window
        if (shouldResetBucket(bucket.lastReset, type)) {
          await db
            .update(rateLimitBuckets)
            .set({ requestCount: 0, lastReset: now })
            .where(eq(rateLimitBuckets.id, bucket.id));
          currentCount = 0;
        }
      } else {
        // Create new bucket
        await db
          .insert(rateLimitBuckets)
          .values({
            apiKeyId,
            bucketType: type,
            bucketTime,
            requestCount: 0,
            lastReset: now
          });
      }

      // Check if limit exceeded
      if (currentCount >= limit) {
        return res.status(429).json({
          error: "Rate limit exceeded",
          message: `Too many requests. Limit: ${limit} per ${type}`,
          retryAfter: getRetryAfter(type)
        });
      }
    }

    // Increment all buckets
    for (const { type } of limits) {
      const bucketTime = getBucketTime(now, type);
      
      await db
        .update(rateLimitBuckets)
        .set({ 
          requestCount: sql`${rateLimitBuckets.requestCount} + 1`
        })
        .where(and(
          eq(rateLimitBuckets.apiKeyId, apiKeyId),
          eq(rateLimitBuckets.bucketType, type),
          eq(rateLimitBuckets.bucketTime, bucketTime)
        ));
    }

    next();
  } catch (error) {
    console.error("Rate limiting error:", error);
    res.status(500).json({
      error: "Rate limiting error",
      message: "Internal server error during rate limiting"
    });
  }
};

/**
 * Middleware to log API usage for analytics and billing
 */
export const logAPIUsage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Skip logging for internal requests
  if (!req.apiKey) {
    return next();
  }

  const startTime = Date.now();
  
  // Override res.json to capture response data
  const originalJson = res.json.bind(res);
  let responseSize = 0;
  
  res.json = function(data: any) {
    const jsonString = JSON.stringify(data);
    responseSize = Buffer.byteLength(jsonString, 'utf8');
    return originalJson(data);
  };

  // Continue to next middleware
  res.on('finish', async () => {
    try {
      const responseTime = Date.now() - startTime;
      const requestSize = parseInt(req.headers['content-length'] || '0');

      await db.insert(apiUsage).values({
        apiKeyId: req.apiKey!.id,
        endpoint: req.path,
        method: req.method,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        responseTime,
        statusCode: res.statusCode,
        requestSize,
        responseSize
      });
    } catch (error) {
      console.error("Error logging API usage:", error);
    }
  });

  next();
};

/**
 * Generate API key pair (public key ID + secret)
 */
export function generateAPIKey(): { keyId: string; keySecret: string } {
  const keyId = `smpl_live_${crypto.randomBytes(16).toString('hex')}`;
  const keySecret = crypto.randomBytes(32).toString('hex');
  
  return { keyId, keySecret };
}

/**
 * Hash API key secret for secure storage
 */
export function hashAPISecret(secret: string): string {
  return crypto
    .createHash('sha256')
    .update(secret)
    .digest('hex');
}

// Utility functions
function getBucketTime(date: Date, bucketType: string): Date {
  const time = new Date(date);
  
  switch (bucketType) {
    case 'minute':
      time.setSeconds(0, 0);
      break;
    case 'day':
      time.setHours(0, 0, 0, 0);
      break;
    case 'month':
      time.setDate(1);
      time.setHours(0, 0, 0, 0);
      break;
  }
  
  return time;
}

function shouldResetBucket(lastReset: Date, bucketType: string): boolean {
  const now = new Date();
  const timeDiff = now.getTime() - lastReset.getTime();
  
  switch (bucketType) {
    case 'minute':
      return timeDiff >= 60 * 1000;
    case 'day':
      return timeDiff >= 24 * 60 * 60 * 1000;
    case 'month':
      return now.getMonth() !== lastReset.getMonth() || 
             now.getFullYear() !== lastReset.getFullYear();
    default:
      return false;
  }
}

function getRetryAfter(bucketType: string): number {
  switch (bucketType) {
    case 'minute':
      return 60;
    case 'day':
      return 24 * 60 * 60;
    case 'month':
      return 30 * 24 * 60 * 60;
    default:
      return 60;
  }
}