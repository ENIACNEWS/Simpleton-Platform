/**
 * Security utilities for production deployment
 */

// Input sanitization utilities
export class SecurityUtils {
  // Sanitize HTML content to prevent XSS
  static sanitizeHTML(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  // Validate and sanitize numeric inputs
  static sanitizeNumber(input: string | number, min = 0, max = 1000000): number {
    const num = typeof input === 'string' ? parseFloat(input) : input;
    if (isNaN(num)) return 0;
    return Math.min(Math.max(num, min), max);
  }

  // Validate email format
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Rate limiting for API calls
  private static rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  static checkRateLimit(key: string, maxRequests = 100, windowMs = 60000): boolean {
    const now = Date.now();
    const record = this.rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
      this.rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  // Content Security Policy headers (for server implementation)
  static getCSPHeaders(): Record<string, string> {
    return {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://api.coinbase.com https://metals-api.com",
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; '),
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    };
  }

  // Validate API endpoints
  static isValidAPIEndpoint(url: string): boolean {
    const allowedDomains = [
      'api.coinbase.com',
      'metals-api.com',
      'localhost',
      '127.0.0.1'
    ];

    try {
      const urlObj = new URL(url);
      return allowedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
      );
    } catch {
      return false;
    }
  }

  // Secure local storage operations
  static secureSetItem(key: string, value: any): boolean {
    try {
      const sanitizedKey = this.sanitizeHTML(key);
      const serialized = JSON.stringify(value);
      localStorage.setItem(sanitizedKey, serialized);
      return true;
    } catch (error) {
      console.warn('Secure storage failed:', error);
      return false;
    }
  }

  static secureGetItem<T>(key: string, defaultValue: T): T {
    try {
      const sanitizedKey = this.sanitizeHTML(key);
      const item = localStorage.getItem(sanitizedKey);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn('Secure retrieval failed:', error);
      return defaultValue;
    }
  }
}

// Environment validation
export class EnvironmentSecurity {
  static validateEnvironment(): boolean {
    // Only validate environment in production builds
    if (!import.meta.env.PROD) {
      return true;
    }
    
    const requiredVars = ['VITE_APP_NAME'];
    const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
    
    if (missingVars.length > 0) {
      console.warn('Missing environment variables:', missingVars);
      return false;
    }
    
    return true;
  }

  static isSecureContext(): boolean {
    return window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  }

  static checkBrowserSecurity(): void {
    if (!this.isSecureContext()) {
      console.warn('Application should be served over HTTPS in production');
    }

    // Only warn about Service Worker in production
    if (import.meta.env.PROD && !('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
    }

    if (!('localStorage' in window)) {
      console.warn('Local Storage not supported');
    }
  }
}

export default {
  SecurityUtils,
  EnvironmentSecurity
};