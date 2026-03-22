import { nanoid } from "nanoid";
import crypto from "crypto";
import { db } from "./db";
import { licenseKeys, licenseUsage, licenseValidation } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import type { LicenseKey, InsertLicenseKey } from "@shared/schema";

// License Type Configuration
interface LicenseConfig {
  licenseType: string;
  displayName: string;
  description: string;
  nextSteps: string;
  unitLabel: string;
  valueStatement: string;
  annualPrice: number;
  discountPrice: number;
  maxDeployments: number;
  maxUsers: number;
  maxRevenue?: number;
  allowCommercialUse: boolean;
  allowRedistribution: boolean;
  allowWhiteLabel: boolean;
  allowSourceAccess: boolean;
  supportLevel: string;
}

const LICENSE_CONFIGS: Record<string, LicenseConfig> = {
  prospector: {
    licenseType: "prospector",
    displayName: "Prospector License",
    description: "Perfect for individual prospectors exploring the precious metals landscape",
    nextSteps: "Start your prospecting journey with full calculator access",
    unitLabel: "Personal Use Only",
    valueStatement: "Discover the power of professional precious metals calculations without any cost",
    annualPrice: 0,
    discountPrice: 0,
    maxDeployments: 1,
    maxUsers: 1,
    allowCommercialUse: false,
    allowRedistribution: false,
    allowWhiteLabel: false,
    allowSourceAccess: false,
    supportLevel: "community"
  },
  miner: {
    licenseType: "miner",
    displayName: "Miner License",
    description: "Built for small mining operations and precious metals dealers ready to scale their business operations",
    nextSteps: "Upgrade to commercial mining rights and unlock business-grade features",
    unitLabel: "Small Business Operations",
    valueStatement: "Transform your precious metals business with professional-grade tools and commercial usage rights",
    annualPrice: 99,
    discountPrice: 49.50, // 50% off first year
    maxDeployments: 3,
    maxUsers: 5,
    maxRevenue: 1000000, // $1M revenue limit
    allowCommercialUse: true,
    allowRedistribution: false,
    allowWhiteLabel: false,
    allowSourceAccess: false,
    supportLevel: "email"
  },
  refinery: {
    licenseType: "refinery",
    displayName: "Refinery License",
    description: "Enterprise-grade licensing for large-scale refining operations and institutional precious metals processing",
    nextSteps: "Deploy enterprise refinery infrastructure with full source code access",
    unitLabel: "Enterprise Operations",
    valueStatement: "Power your enterprise with unlimited commercial rights, source code access, and priority support",
    annualPrice: 999,
    discountPrice: 499.50, // 50% off first year
    maxDeployments: 10,
    maxUsers: 100,
    allowCommercialUse: true,
    allowRedistribution: true,
    allowWhiteLabel: false,
    allowSourceAccess: true,
    supportLevel: "priority"
  },
  mint: {
    licenseType: "mint",
    displayName: "Mint License",
    description: "Ultimate white-label minting authority for software companies and platform builders creating their own precious metals solutions",
    nextSteps: "Launch your own branded precious metals platform with complete white-label rights",
    unitLabel: "White-Label Authority",
    valueStatement: "Build your precious metals empire with complete minting rights, unlimited deployments, and dedicated support",
    annualPrice: 5000,
    discountPrice: 2500, // 50% off first year
    maxDeployments: 50,
    maxUsers: 1000,
    allowCommercialUse: true,
    allowRedistribution: true,
    allowWhiteLabel: true,
    allowSourceAccess: true,
    supportLevel: "dedicated"
  }
};

export class LicenseService {
  
  /**
   * Generate a unique license key based on license type
   */
  static generateLicenseKey(licenseType: string): string {
    const prefixes = {
      prospector: "PROS",
      miner: "MINE",
      refinery: "REFN",
      mint: "MINT"
    };
    
    const prefix = prefixes[licenseType as keyof typeof prefixes] || "UNK";
    const segments = [
      nanoid(4).toUpperCase(),
      nanoid(4).toUpperCase(),
      nanoid(4).toUpperCase(),
      nanoid(4).toUpperCase()
    ];
    
    return `${prefix}-${segments.join("-")}`;
  }

  /**
   * Create a new license key
   */
  static async createLicense(data: {
    userId: number;
    licenseType: string;
    companyName: string;
    contactEmail: string;
  }): Promise<LicenseKey> {
    const config = LICENSE_CONFIGS[data.licenseType];
    if (!config) {
      throw new Error(`Invalid license type: ${data.licenseType}`);
    }

    const licenseKey = this.generateLicenseKey(data.licenseType);
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year from now

    const insertData: InsertLicenseKey = {
      licenseKey,
      userId: data.userId,
      companyName: data.companyName,
      contactEmail: data.contactEmail,
      licenseType: config.licenseType,
      annualPrice: config.annualPrice.toString(),
      discountPrice: config.discountPrice.toString(),
      isFirstYear: true,
      status: "active",
      expiryDate,
      maxDeployments: config.maxDeployments,
      maxUsers: config.maxUsers,
      maxRevenue: config.maxRevenue?.toString(),
      allowCommercialUse: config.allowCommercialUse,
      allowRedistribution: config.allowRedistribution,
      allowWhiteLabel: config.allowWhiteLabel,
      allowSourceAccess: config.allowSourceAccess,
      supportLevel: config.supportLevel,
      gracePeriodDays: 30
    };

    const [license] = await db.insert(licenseKeys).values(insertData).returning();
    return license;
  }

  /**
   * Validate a license key
   */
  static async validateLicense(licenseKey: string, deploymentId: string, requestInfo?: {
    ip?: string;
    userAgent?: string;
    hostName?: string;
    platform?: string;
  }): Promise<{
    isValid: boolean;
    license?: LicenseKey;
    reason?: string;
  }> {
    const startTime = Date.now();
    
    try {
      // Find the license
      const [license] = await db
        .select()
        .from(licenseKeys)
        .where(eq(licenseKeys.licenseKey, licenseKey))
        .limit(1);

      if (!license) {
        await this.logValidation(null, deploymentId, false, "invalid_key", requestInfo, Date.now() - startTime);
        return { isValid: false, reason: "License key not found" };
      }

      // Check if license is active
      if (license.status !== "active") {
        await this.logValidation(license.id, deploymentId, false, `status_${license.status}`, requestInfo, Date.now() - startTime);
        return { isValid: false, reason: `License is ${license.status}`, license };
      }

      // Check expiry with grace period
      const now = new Date();
      const expiryWithGrace = new Date(license.expiryDate);
      expiryWithGrace.setDate(expiryWithGrace.getDate() + (license.gracePeriodDays || 30));
      
      if (now > expiryWithGrace) {
        await this.logValidation(license.id, deploymentId, false, "expired", requestInfo, Date.now() - startTime);
        return { isValid: false, reason: "License has expired", license };
      }

      // Update last validation time
      await db
        .update(licenseKeys)
        .set({ lastValidation: now })
        .where(eq(licenseKeys.id, license.id));

      // Record usage if deployment info provided
      if (requestInfo) {
        await this.recordUsage(license.id, deploymentId, requestInfo);
      }

      await this.logValidation(license.id, deploymentId, true, "valid", requestInfo, Date.now() - startTime);
      return { isValid: true, license };
      
    } catch (error) {
      await this.logValidation(null, deploymentId, false, "system_error", requestInfo, Date.now() - startTime);
      return { isValid: false, reason: "System error during validation" };
    }
  }

  /**
   * Record usage for a license
   */
  private static async recordUsage(licenseKeyId: number, deploymentId: string, requestInfo: {
    hostName?: string;
    platform?: string;
  }): Promise<void> {
    try {
      // Check if deployment already exists
      const [existingUsage] = await db
        .select()
        .from(licenseUsage)
        .where(and(
          eq(licenseUsage.licenseKeyId, licenseKeyId),
          eq(licenseUsage.deploymentId, deploymentId)
        ))
        .limit(1);

      if (existingUsage) {
        // Update last heartbeat
        await db
          .update(licenseUsage)
          .set({ 
            lastHeartbeat: new Date(),
            isActive: true,
            hostName: requestInfo.hostName || existingUsage.hostName,
            platform: requestInfo.platform || existingUsage.platform
          })
          .where(eq(licenseUsage.id, existingUsage.id));
      } else {
        // Create new usage record
        await db.insert(licenseUsage).values({
          licenseKeyId,
          deploymentId,
          hostName: requestInfo.hostName,
          platform: requestInfo.platform,
          environment: "production", // Default to production
          isActive: true
        });
      }
    } catch (error) {
      console.error("Error recording license usage:", error);
    }
  }

  /**
   * Log validation attempt
   */
  private static async logValidation(
    licenseKeyId: number | null,
    deploymentId: string,
    isValid: boolean,
    reason: string,
    requestInfo?: {
      ip?: string;
      userAgent?: string;
    },
    responseTime?: number
  ): Promise<void> {
    try {
      await db.insert(licenseValidation).values({
        licenseKeyId,
        deploymentId,
        isValid,
        validationReason: reason,
        ipAddress: requestInfo?.ip,
        userAgent: requestInfo?.userAgent,
        responseTime,
        cacheHit: false
      });
    } catch (error) {
      console.error("Error logging validation:", error);
    }
  }

  /**
   * Get license analytics
   */
  static async getLicenseAnalytics(licenseKeyId: number): Promise<{
    totalValidations: number;
    successfulValidations: number;
    failedValidations: number;
    activeDeployments: number;
    totalDeployments: number;
    usageOverTime: Array<{ date: string; validations: number }>;
  }> {
    try {
      // Get validation stats
      const validationStats = await db
        .select({
          total: sql<number>`count(*)`,
          successful: sql<number>`count(*) filter (where is_valid = true)`,
          failed: sql<number>`count(*) filter (where is_valid = false)`
        })
        .from(licenseValidation)
        .where(eq(licenseValidation.licenseKeyId, licenseKeyId));

      // Get deployment stats
      const deploymentStats = await db
        .select({
          total: sql<number>`count(*)`,
          active: sql<number>`count(*) filter (where is_active = true)`
        })
        .from(licenseUsage)
        .where(eq(licenseUsage.licenseKeyId, licenseKeyId));

      // Get usage over time (last 30 days)
      const usageOverTime = await db
        .select({
          date: sql<string>`date(timestamp)`,
          validations: sql<number>`count(*)`
        })
        .from(licenseValidation)
        .where(and(
          eq(licenseValidation.licenseKeyId, licenseKeyId),
          sql`timestamp >= current_date - interval '30 days'`
        ))
        .groupBy(sql`date(timestamp)`)
        .orderBy(sql`date(timestamp)`);

      return {
        totalValidations: validationStats[0]?.total || 0,
        successfulValidations: validationStats[0]?.successful || 0,
        failedValidations: validationStats[0]?.failed || 0,
        activeDeployments: deploymentStats[0]?.active || 0,
        totalDeployments: deploymentStats[0]?.total || 0,
        usageOverTime: usageOverTime || []
      };
    } catch (error) {
      console.error("Error getting license analytics:", error);
      return {
        totalValidations: 0,
        successfulValidations: 0,
        failedValidations: 0,
        activeDeployments: 0,
        totalDeployments: 0,
        usageOverTime: []
      };
    }
  }

  /**
   * Get license configuration for a license type
   */
  static getLicenseConfig(licenseType: string): LicenseConfig | null {
    return LICENSE_CONFIGS[licenseType] || null;
  }

  /**
   * Get all available license types with pricing
   */
  static getAllLicenseTypes(): Array<LicenseConfig & { id: string }> {
    return Object.entries(LICENSE_CONFIGS).map(([id, config]) => ({
      id,
      ...config
    }));
  }
}