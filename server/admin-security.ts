/**
 * OWNER-ONLY ADMIN SECURITY SYSTEM
 * Hidden backdoor access for intellectual property protection
 * Copyright 2025 - Simpleton Platform
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const OWNER_SECRET_KEY = process.env.OWNER_SECRET_KEY || '';
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || '';

interface AccessLog {
  ip: string;
  userAgent: string;
  timestamp: string;
  endpoint: string;
  suspicious: boolean;
}

class AdminSecuritySystem {
  private accessLogs: AccessLog[] = [];
  private authorizedSessions = new Set<string>();

  // Generate secure session token
  generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Verify owner secret key
  verifyOwnerAccess(secretKey: string): boolean {
    return secretKey === OWNER_SECRET_KEY;
  }

  // Log all access attempts
  logAccess(req: Request, endpoint: string): void {
    const log: AccessLog = {
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      timestamp: new Date().toISOString(),
      endpoint,
      suspicious: this.isSuspicious(req)
    };

    this.accessLogs.push(log);
    
    // Keep only last 1000 logs
    if (this.accessLogs.length > 1000) {
      this.accessLogs = this.accessLogs.slice(-1000);
    }

    // Log suspicious activity
    if (log.suspicious) {
      console.warn(`🚨 SUSPICIOUS ACCESS DETECTED: ${log.ip} - ${log.endpoint}`);
    }
  }

  // Detect suspicious activity
  private isSuspicious(req: Request): boolean {
    const userAgent = req.get('User-Agent') || '';
    const suspiciousPatterns = [
      'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 
      'postman', 'insomnia', 'thunder', 'automated'
    ];

    return suspiciousPatterns.some(pattern => 
      userAgent.toLowerCase().includes(pattern)
    );
  }

  // Get all access logs
  getAccessLogs(): AccessLog[] {
    return this.accessLogs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // Get suspicious activity
  getSuspiciousActivity(): AccessLog[] {
    return this.accessLogs.filter(log => log.suspicious);
  }

  // Authorize admin session
  authorizeSession(sessionToken: string): void {
    this.authorizedSessions.add(sessionToken);
  }

  // Verify admin session
  isAuthorizedSession(sessionToken: string): boolean {
    return this.authorizedSessions.has(sessionToken);
  }

  // Get system security status
  getSecurityStatus() {
    const total = this.accessLogs.length;
    const suspicious = this.getSuspiciousActivity().length;
    const recent = this.accessLogs.filter(log => 
      Date.now() - new Date(log.timestamp).getTime() < 24 * 60 * 60 * 1000
    ).length;

    return {
      total_access_attempts: total,
      suspicious_activity: suspicious,
      last_24_hours: recent,
      security_level: suspicious > 10 ? 'HIGH_ALERT' : suspicious > 5 ? 'MODERATE' : 'SECURE',
      authorized_sessions: this.authorizedSessions.size
    };
  }
}

export const adminSecurity = new AdminSecuritySystem();

// Middleware to protect owner-only routes
export const ownerOnlyAccess = (req: Request, res: Response, next: NextFunction) => {
  const sessionToken = req.headers['x-admin-session'] as string;
  
  if (!sessionToken || !adminSecurity.isAuthorizedSession(sessionToken)) {
    adminSecurity.logAccess(req, 'UNAUTHORIZED_ADMIN_ACCESS');
    return res.status(401).json({ error: 'Access denied - Owner authorization required' });
  }

  next();
};

// Middleware to log all access attempts
export const logAllAccess = (req: Request, res: Response, next: NextFunction) => {
  // Skip logging for hidden gems quantum data routes to avoid false suspicious activity alerts
  if (!req.path.startsWith('/api/hidden-gems/')) {
    adminSecurity.logAccess(req, req.path);
  }
  next();
};