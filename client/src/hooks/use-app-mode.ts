import { useState, useEffect, useCallback } from "react";

type AppMode = "desktop" | "mobile";

function isPWAStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const isIOSStandalone = (navigator as any).standalone === true;
  return isStandalone || isIOSStandalone;
}

function isMobileOrTablet(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i;
  if (mobileRegex.test(ua)) return true;
  if ("ontouchstart" in window && navigator.maxTouchPoints > 1 && window.innerWidth <= 1024) return true;
  if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return true;
  return false;
}

function getInitialMode(): AppMode {
  if (typeof window === "undefined") return "desktop";
  const saved = localStorage.getItem("simpleton-app-mode");
  if (saved === "mobile") return "mobile";
  if (saved === "desktop") return "desktop";
  // No saved preference - auto-detect based on device
  return isMobileOrTablet() ? "mobile" : "desktop";
}

export function useAppMode() {
  const [mode, setModeState] = useState<AppMode>(getInitialMode);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsStandalone(isPWAStandalone());
    setIsTouchDevice(isMobileOrTablet());
    // Auto-set mobile mode on first visit from mobile device
    const saved = localStorage.getItem("simpleton-app-mode");
    if (!saved && isMobileOrTablet()) {
      setModeState("mobile");
      localStorage.setItem("simpleton-app-mode", "mobile");
    }
  }, []);

  const setMode = useCallback((newMode: AppMode) => {
    setModeState(newMode);
    localStorage.setItem("simpleton-app-mode", newMode);
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === "desktop" ? "mobile" : "desktop");
  }, [mode, setMode]);

  return {
    mode,
    setMode,
    toggleMode,
    isStandalone,
    isMobile: mode === "mobile",
    isDesktop: mode === "desktop",
    isTouchDevice,
  };
}
