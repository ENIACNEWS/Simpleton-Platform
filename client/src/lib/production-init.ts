/**
 * Production initialization system
 * Orchestrates all optimization utilities for launch readiness
 */

import { AccessibilityUtils, HighContrastMode, ReducedMotion } from './accessibility';
import { BundleOptimization, ImageOptimization } from './performance';
import { EnvironmentSecurity } from './security';

export class ProductionInitializer {
  private static initialized = false;

  static async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Environment validation
      EnvironmentSecurity.validateEnvironment();
      EnvironmentSecurity.checkBrowserSecurity();

      // Accessibility setup
      AccessibilityUtils.setupKeyboardNavigation();
      AccessibilityUtils.enhanceFormAccessibility();
      HighContrastMode.setupHighContrastSupport();
      ReducedMotion.setupReducedMotionSupport();

      // Performance optimizations
      BundleOptimization.preloadCriticalResources();
      ImageOptimization.setupImageLazyLoading();
      
      // Service worker registration (production only)
      if (import.meta.env.PROD) {
        await BundleOptimization.registerServiceWorker();
      }

      // Calculator accessibility (when available)
      this.setupCalculatorAccessibility();

      // WebP support detection
      const supportsWebP = await ImageOptimization.supportsWebP();
      if (supportsWebP) {
        document.documentElement.classList.add('webp-support');
      }

      this.initialized = true;
      
      if (import.meta.env.DEV) {
        console.log('✅ Production optimizations initialized');
      }

    } catch (error) {
      console.warn('Production initialization failed:', error);
    }
  }

  private static setupCalculatorAccessibility(): void {
    // Wait for DOM to be ready
    const observer = new MutationObserver(() => {
      const calculatorButtons = document.querySelectorAll('[data-calculator-button]');
      if (calculatorButtons.length > 0) {
        AccessibilityUtils.enhanceCalculatorAccessibility();
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Cleanup observer after 10 seconds
    setTimeout(() => observer.disconnect(), 10000);
  }

  // Performance monitoring for critical operations
  static monitorCriticalPerformance(): void {
    if (typeof performance !== 'undefined' && performance.mark) {
      // Mark page load performance
      performance.mark('simpleton-app-start');
      
      // Monitor pricing data load
      window.addEventListener('load', () => {
        performance.mark('simpleton-app-loaded');
        
        if (import.meta.env.DEV) {
          const loadTime = performance.now();
          console.log(`⚡ App loaded in ${loadTime.toFixed(2)}ms`);
        }
      });
    }
  }

  // SEO and meta tag optimization
  static optimizeSEO(): void {
    // Ensure proper viewport
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no');
      document.head.appendChild(viewport);
    }

    // Add canonical URL if missing
    if (!document.querySelector('link[rel="canonical"]')) {
      const canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = window.location.href;
      document.head.appendChild(canonical);
    }

    // Add schema markup for calculator
    this.addCalculatorSchema();
  }

  private static addCalculatorSchema(): void {
    if (document.querySelector('script[type="application/ld+json"]')) return;

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': 'Simpleton Precious Metals Calculator',
      'applicationCategory': 'FinanceApplication',
      'operatingSystem': 'Any',
      'url': window.location.origin,
      'description': 'Professional precious metals calculator with professional-grade precision',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      },
      'featureList': [
        '8-decimal precision calculations',
        'Live precious metals pricing',
        'SCRAP batch processing',
        'Custom rate management',
        'Comprehensive coin database'
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  // Security headers check (for development verification)
  static checkSecurityHeaders(): void {
    if (import.meta.env.DEV) {
      // Check if HTTPS is used (except localhost)
      if (window.location.protocol !== 'https:' && !window.location.hostname.includes('localhost')) {
        console.warn('⚠️ HTTPS should be used in production');
      }

      // Check for mixed content
      if (window.location.protocol === 'https:') {
        const httpResources = Array.from(document.querySelectorAll('[src^="http:"], [href^="http:"]'));
        if (httpResources.length > 0) {
          console.warn('⚠️ Mixed content detected:', httpResources);
        }
      }
    }
  }

  // Cache optimization
  static optimizeCaching(): void {
    // Preload critical resources
    const criticalResources = [
      '/manifest.json',
      '/generated-icon.png'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.endsWith('.png') ? 'image' : 'fetch';
      document.head.appendChild(link);
    });
  }
}

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      ProductionInitializer.initialize();
      ProductionInitializer.monitorCriticalPerformance();
      ProductionInitializer.optimizeSEO();
      ProductionInitializer.checkSecurityHeaders();
      ProductionInitializer.optimizeCaching();
    });
  } else {
    ProductionInitializer.initialize();
    ProductionInitializer.monitorCriticalPerformance();
    ProductionInitializer.optimizeSEO();
    ProductionInitializer.checkSecurityHeaders();
    ProductionInitializer.optimizeCaching();
  }
}

export default ProductionInitializer;