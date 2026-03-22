/**
 * Performance optimization utilities for production
 */

import { lazy } from 'react';

// Lazy load heavy components for better performance
export const LazyComponents = {
  // Database components (heavy with large datasets)
  PremiumCoinDatabase: lazy(() => import('@/components/database/premium-coin-database')),
  CoinComparisonTool: lazy(() => import('@/components/database/coin-comparison-tool')),
  CoinPortfolioTracker: lazy(() => import('@/components/database/coin-portfolio-tracker')),
  PricingHistoryChart: lazy(() => import('@/components/database/pricing-history-chart')),
  
  // Calculator components
  DiamondCalculator: lazy(() => import('@/components/calculator/diamond-calculator')),
  
  // AI Assistant (only load when needed)
  AIAssistant: lazy(() => import('@/components/ai-assistant'))
};

// Performance monitoring utilities
export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();

  static startTiming(name: string) {
    if (typeof performance !== 'undefined') {
      this.marks.set(name, performance.now());
    }
  }

  static endTiming(name: string): number {
    if (typeof performance !== 'undefined') {
      const start = this.marks.get(name);
      if (start) {
        const duration = performance.now() - start;
        this.marks.delete(name);
        
        // Only log in development
        if (import.meta.env.DEV) {
          console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
        }
        
        return duration;
      }
    }
    return 0;
  }

  static measureComponent<T extends (...args: any[]) => any>(
    name: string,
    component: T
  ): T {
    return ((...args: any[]) => {
      this.startTiming(name);
      const result = component(...args);
      this.endTiming(name);
      return result;
    }) as T;
  }
}

// Image optimization utilities
export const ImageOptimization = {
  // Lazy loading for images
  setupImageLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || '';
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach((img) => {
        imageObserver.observe(img);
      });
    }
  },

  // WebP format detection
  supportsWebP(): Promise<boolean> {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }
};

// Bundle optimization
export const BundleOptimization = {
  // Preload critical resources
  preloadCriticalResources() {
    const criticalResources = [
      '/api/pricing/latest',
      '/manifest.json'
    ];

    criticalResources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.endsWith('.json') ? 'fetch' : 'script';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  },

  // Setup service worker for caching
  async registerServiceWorker() {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      try {
        await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered successfully');
      } catch (error) {
        console.warn('Service Worker registration failed:', error);
      }
    }
  }
};

export default {
  LazyComponents,
  PerformanceMonitor,
  ImageOptimization,
  BundleOptimization
};