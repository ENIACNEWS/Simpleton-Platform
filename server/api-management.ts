import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { apiKeys } from "@shared/schema";
import crypto from 'crypto';

export interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  created: string;
  lastUsed: string;
  isActive: boolean;
}

export interface UsageData {
  currentMonth: {
    calls: number;
    limit: number;
    categories: {
      metals: number;
      finance: number;
      ai: number;
    };
  };
  topEndpoints: Array<{
    endpoint: string;
    calls: number;
  }>;
}

export interface BillingData {
  plan: string;
  price: number;
  nextBilling: string;
  paymentMethod: string;
  invoices: Array<{
    id: string;
    amount: number;
    date: string;
    status: string;
  }>;
}

export async function getUserAPIKeys(userId?: string): Promise<APIKey[]> {
  try {
    // Return real API keys from database
    const keys = await db.select().from(apiKeys);
    return keys.map(key => ({
      id: key.id.toString(),
      name: key.name,
      key: key.keyId, // Using keyId as the display key
      permissions: key.allowedEndpoints || ['metals', 'finance', 'ai'],
      created: key.createdAt.toISOString().split('T')[0],
      lastUsed: key.lastUsed ? key.lastUsed.toISOString().split('T')[0] : 'Never',
      isActive: key.isActive
    }));
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return [];
  }
}

export async function createAPIKey(keyName: string, permissions: string[] = ['metals', 'finance', 'ai']): Promise<APIKey> {
  const keyId = `smpl_live_${crypto.randomBytes(32).toString('hex')}`;
  const keySecret = crypto.randomBytes(64).toString('hex');
  
  // Store in database
  const result = await db.insert(apiKeys).values({
    keyId: keyId,
    keySecret: keySecret,
    userId: 1, // Default user ID for now
    name: keyName,
    allowedEndpoints: permissions,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning();

  return {
    id: result[0].id.toString(),
    name: keyName,
    key: keyId, // Return the public key ID
    permissions,
    created: new Date().toISOString().split('T')[0],
    lastUsed: new Date().toISOString().split('T')[0],
    isActive: true
  };
}

export async function updateAPIKey(keyId: string, updates: Partial<APIKey>): Promise<APIKey | null> {
  // TODO: Implement when user system is ready
  return null;
}

export async function deleteAPIKey(keyId: string): Promise<boolean> {
  // TODO: Implement when user system is ready
  return false;
}

export async function getAPIKeyUsage(keyId?: string): Promise<UsageData> {
  // Return empty usage data - user needs to actually use API to generate real usage
  return {
    currentMonth: {
      calls: 0,
      limit: 10000,
      categories: {
        metals: 0,
        finance: 0,
        ai: 0
      }
    },
    topEndpoints: []
  };
}

export async function getAPIBilling(): Promise<BillingData> {
  return {
    plan: "Free Tier",
    price: 0,
    nextBilling: "No billing - Free tier",
    paymentMethod: "No payment method required",
    invoices: []
  };
}

export function getAPIDocumentation() {
  return {
    endpoints: [
      {
        path: "/api/metals/spot-price",
        method: "GET",
        description: "Get real-time precious metals spot prices",
        parameters: ["metal (optional)"],
        rateLimit: "1000 requests/day"
      },
      {
        path: "/api/stocks/quote",
        method: "GET", 
        description: "Get stock quotes and market data",
        parameters: ["symbol (required)"],
        rateLimit: "5000 requests/day"
      },
      {
        path: "/api/ai/chat",
        method: "POST",
        description: "AI-powered chat and analysis",
        parameters: ["message (required)", "model (optional)"],
        rateLimit: "100 requests/hour"
      }
    ]
  };
}