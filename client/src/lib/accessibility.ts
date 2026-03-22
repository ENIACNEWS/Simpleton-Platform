/**
 * Accessibility utilities for WCAG compliance
 */

export class AccessibilityUtils {
  // Keyboard navigation enhancement
  static setupKeyboardNavigation(): void {
    document.addEventListener('keydown', this.handleKeyboardNavigation);
    
    // Add focus-visible polyfill for older browsers
    this.addFocusVisibleSupport();
  }

  private static handleKeyboardNavigation(event: KeyboardEvent): void {
    // ESC key to close modals
    if (event.key === 'Escape') {
      const openModals = document.querySelectorAll('[role="dialog"][aria-hidden="false"]');
      openModals.forEach(modal => {
        const closeButton = modal.querySelector('[aria-label="Close"]');
        if (closeButton) (closeButton as HTMLElement).click();
      });
    }

    // Tab trapping in modals
    if (event.key === 'Tab') {
      const activeModal = document.querySelector('[role="dialog"][aria-hidden="false"]');
      if (activeModal) {
        this.trapFocus(event, activeModal as HTMLElement);
      }
    }
  }

  private static trapFocus(event: KeyboardEvent, container: HTMLElement): void {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  private static addFocusVisibleSupport(): void {
    let hadKeyboardEvent = true;
    const keyboardThrottleTimeout = 100;

    const pointerEvents = ['mousedown', 'touchstart'];
    const keyboardEvents = ['keydown'];

    pointerEvents.forEach(event => {
      document.addEventListener(event, () => {
        hadKeyboardEvent = false;
      });
    });

    keyboardEvents.forEach(event => {
      document.addEventListener(event, () => {
        hadKeyboardEvent = true;
      });
    });

    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      if (hadKeyboardEvent || target.matches(':focus-visible')) {
        target.classList.add('focus-visible');
      }
    });

    document.addEventListener('focusout', (event) => {
      const target = event.target as HTMLElement;
      target.classList.remove('focus-visible');
    });
  }

  // Screen reader announcements
  static announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Color contrast validation
  static validateColorContrast(backgroundColor: string, textColor: string): boolean {
    const bg = this.parseColor(backgroundColor);
    const text = this.parseColor(textColor);
    
    if (!bg || !text) return false;
    
    const bgLuminance = this.getLuminance(bg);
    const textLuminance = this.getLuminance(text);
    
    const ratio = (Math.max(bgLuminance, textLuminance) + 0.05) / 
                  (Math.min(bgLuminance, textLuminance) + 0.05);
    
    return ratio >= 4.5; // WCAG AA standard
  }

  private static parseColor(color: string): { r: number; g: number; b: number } | null {
    // Simple hex color parser
    const hex = color.replace('#', '');
    if (hex.length !== 6) return null;
    
    return {
      r: parseInt(hex.substr(0, 2), 16),
      g: parseInt(hex.substr(2, 2), 16),
      b: parseInt(hex.substr(4, 2), 16)
    };
  }

  private static getLuminance(color: { r: number; g: number; b: number }): number {
    const { r, g, b } = color;
    
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;
    
    const rLin = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLin = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLin = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
    
    return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
  }

  // Form accessibility enhancement
  static enhanceFormAccessibility(): void {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, select, textarea');
      
      inputs.forEach(input => {
        const element = input as HTMLInputElement;
        
        // Add required aria attributes
        if (element.hasAttribute('required')) {
          element.setAttribute('aria-required', 'true');
        }
        
        // Link labels properly
        const label = form.querySelector(`label[for="${element.id}"]`);
        if (!label && !element.getAttribute('aria-label')) {
          const placeholder = element.getAttribute('placeholder');
          if (placeholder) {
            element.setAttribute('aria-label', placeholder);
          }
        }
      });
    });
  }

  // Calculator accessibility enhancements
  static enhanceCalculatorAccessibility(): void {
    const calculatorButtons = document.querySelectorAll('[data-calculator-button]');
    
    calculatorButtons.forEach(button => {
      const element = button as HTMLButtonElement;
      
      // Add proper ARIA labels for screen readers
      if (!element.getAttribute('aria-label')) {
        const text = element.textContent?.trim();
        if (text) {
          let ariaLabel = text;
          
          // Special cases for calculator buttons
          if (text === 'C') ariaLabel = 'Clear calculator';
          if (text === 'ENTER') ariaLabel = 'Calculate result';
          if (text === 'BACK') ariaLabel = 'Backspace';
          if (text.includes('K')) ariaLabel = `${text} karat gold`;
          if (text === '925') ariaLabel = 'Sterling silver 925';
          
          element.setAttribute('aria-label', ariaLabel);
        }
      }
      
      // Add keyboard support
      element.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          element.click();
        }
      });
    });
  }
}

// High contrast mode detection
export class HighContrastMode {
  static isActive(): boolean {
    return window.matchMedia('(prefers-contrast: high)').matches;
  }

  static setupHighContrastSupport(): void {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    
    const handleContrastChange = (event: MediaQueryListEvent) => {
      document.body.classList.toggle('high-contrast', event.matches);
    };
    
    mediaQuery.addEventListener('change', handleContrastChange);
    handleContrastChange(mediaQuery as any);
  }
}

// Reduced motion support
export class ReducedMotion {
  static isPreferred(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  static setupReducedMotionSupport(): void {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleMotionChange = (event: MediaQueryListEvent) => {
      document.body.classList.toggle('reduce-motion', event.matches);
    };
    
    mediaQuery.addEventListener('change', handleMotionChange);
    handleMotionChange(mediaQuery as any);
  }
}

export default {
  AccessibilityUtils,
  HighContrastMode,
  ReducedMotion
};