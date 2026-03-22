import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAutoHideHeaderOptions {
  idleDelay?: number; // Time in ms before hiding header
  scrollThreshold?: number; // Minimum scroll distance to trigger hide/show
  enabled?: boolean; // Whether auto-hide is enabled
}

interface UseAutoHideHeaderReturn {
  isHeaderVisible: boolean;
  isScrollingUp: boolean;
  scrollY: number;
  isIdle: boolean;
}

export function useAutoHideHeader({
  idleDelay = 3000, // 3 seconds
  scrollThreshold = 10, // 10px
  enabled = true
}: UseAutoHideHeaderOptions = {}): UseAutoHideHeaderReturn {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isIdle, setIsIdle] = useState(false);
  
  const lastScrollY = useRef(0);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);
  const ticking = useRef(false);

  // Reset idle timer
  const resetIdleTimer = useCallback(() => {
    if (!enabled) return;
    
    setIsIdle(false);
    setIsHeaderVisible(true);
    
    if (idleTimer.current) {
      clearTimeout(idleTimer.current);
    }
    
    idleTimer.current = setTimeout(() => {
      setIsIdle(true);
      // Only hide header if user is not at the very top of page
      if (window.scrollY > 100) {
        setIsHeaderVisible(false);
      }
    }, idleDelay);
  }, [enabled, idleDelay]);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (!enabled) return;
    
    const currentScrollY = window.scrollY;
    const scrollDirection = currentScrollY > lastScrollY.current;
    
    setScrollY(currentScrollY);
    setIsScrollingUp(!scrollDirection);
    
    // Show header when scrolling up or near top
    if (!scrollDirection || currentScrollY < 100) {
      setIsHeaderVisible(true);
      setIsIdle(false);
    }
    // Hide header when scrolling down (if not idle detection will handle it)
    else if (scrollDirection && Math.abs(currentScrollY - lastScrollY.current) > scrollThreshold) {
      // Don't immediately hide, let idle detection handle it
      resetIdleTimer();
    }
    
    lastScrollY.current = currentScrollY;
    resetIdleTimer();
  }, [enabled, scrollThreshold, resetIdleTimer]);

  // Throttled scroll handler
  const throttledScrollHandler = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        handleScroll();
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, [handleScroll]);

  // Handle user interactions (mouse move, click, touch, keyboard)
  const handleUserActivity = useCallback(() => {
    if (!enabled) return;
    resetIdleTimer();
  }, [enabled, resetIdleTimer]);

  useEffect(() => {
    if (!enabled) {
      setIsHeaderVisible(true);
      setIsIdle(false);
      return;
    }

    // Event listeners for user activity
    const events = [
      'scroll',
      'mousemove',
      'mousedown',
      'click',
      'keypress',
      'touchstart',
      'touchmove'
    ];

    // Add scroll listener separately with throttling
    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    
    // Add other activity listeners
    events.slice(1).forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Initialize idle timer
    resetIdleTimer();

    return () => {
      // Cleanup
      window.removeEventListener('scroll', throttledScrollHandler);
      events.slice(1).forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      
      if (idleTimer.current) {
        clearTimeout(idleTimer.current);
      }
    };
  }, [enabled, throttledScrollHandler, handleUserActivity, resetIdleTimer]);

  return {
    isHeaderVisible,
    isScrollingUp,
    scrollY,
    isIdle
  };
}