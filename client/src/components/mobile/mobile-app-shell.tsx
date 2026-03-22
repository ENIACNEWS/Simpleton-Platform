import { useState, useEffect, memo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Watch,
  TrendingUp,
  FileText,
  Briefcase,
  Monitor,
  ChevronRight,
  X,
  BarChart3,
  MessageCircle,
  BookOpen,
  User,
  Coins,
  Menu,
  Home,
} from "lucide-react";

interface MobileAppShellProps {
  children: React.ReactNode;
  onSwitchToDesktop: () => void;
}

interface MoreMenuItem {
  label: string;
  icon: typeof Watch;
  path: string;
  description: string;
}

const moreMenuItems: MoreMenuItem[] = [
  { label: "Live Price Board", icon: BarChart3, path: "/price-board", description: "TV display for counter pricing" },
  { label: "Coin Calculator", icon: Coins, path: "/coin-calculator", description: "Coin pricing and database" },
  { label: "Rolex Intelligence", icon: Watch, path: "/watches", description: "Market data and authentication" },
  { label: "Market Intelligence", icon: TrendingUp, path: "/markets", description: "AI-powered market analysis" },
  { label: "Market Signals", icon: BarChart3, path: "/market-signals", description: "Convergence signal detector" },
  { label: "Professional Appraisal", icon: FileText, path: "/jewelry-appraisal", description: "Certified appraisal service" },
  { label: "Portfolio", icon: Briefcase, path: "/portfolio", description: "Track your valuables" },
  { label: "Full AI Chat", icon: MessageCircle, path: "/ai-chat", description: "Complete AI conversation" },
  { label: "Education", icon: BookOpen, path: "/education", description: "Learning paths and guides" },
  { label: "Account", icon: User, path: "/account", description: "Manage your profile" },
];

const MobileContent = memo(function MobileContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto">
      {children}
    </div>
  );
});

export function MobileAppShell({ children, onSwitchToDesktop }: MobileAppShellProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [location, setLocation] = useLocation();

  const isSimpletonMode = location === "/" || location.startsWith("/simpleton-mode");

  useEffect(() => {
    function handleOpenMore() { setShowMoreMenu(true); }
    window.addEventListener("simpleton-open-more", handleOpenMore);
    return () => window.removeEventListener("simpleton-open-more", handleOpenMore);
  }, []);

  function handleMoreNavigate(path: string) {
    setShowMoreMenu(false);
    setLocation(path);
  }

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: "#0a0a0a", fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <MobileContent>{children}</MobileContent>

      {!isSimpletonMode && !showMoreMenu && (
        <div className="fixed bottom-6 right-4 z-[200] flex flex-col gap-2" style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0px)" }}>
          <button
            onClick={() => setShowMoreMenu(true)}
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            style={{ background: "rgba(201,169,110,0.9)", border: "2px solid rgba(255,255,255,0.2)" }}
          >
            <Menu className="w-5 h-5" style={{ color: "#0a0a0a" }} />
          </button>
          <button
            onClick={() => setLocation("/simpleton-mode")}
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            style={{ background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.15)" }}
          >
            <Home className="w-5 h-5" style={{ color: "#f5f5f7" }} />
          </button>
        </div>
      )}

      <AnimatePresence>
        {showMoreMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300]"
              style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
              onClick={() => setShowMoreMenu(false)}
            />
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed top-0 left-0 right-0 z-[301] rounded-b-2xl overflow-hidden"
              style={{ background: "#1a1a1a", borderBottom: "1px solid rgba(255,255,255,0.1)", maxHeight: "80vh", paddingTop: "max(env(safe-area-inset-top, 8px), 8px)" }}
            >
              <div className="flex items-center justify-between px-5 pt-3 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="text-base font-semibold" style={{ color: "#f5f5f7" }}>More Features</span>
                <button onClick={() => setShowMoreMenu(false)} className="p-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <X className="w-4 h-4" style={{ color: "#f5f5f7" }} />
                </button>
              </div>

              <div className="overflow-y-auto" style={{ maxHeight: "calc(80vh - 60px)" }}>
                <div className="px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>Tools & Features</p>
                  {moreMenuItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleMoreNavigate(item.path)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-0.5 active:bg-white/5 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.12)" }}>
                        <item.icon className="w-4 h-4" style={{ color: "#c9a96e" }} />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "#f5f5f7" }}>{item.label}</p>
                        <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{item.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.15)" }} />
                    </button>
                  ))}
                </div>

                <div className="px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <button
                    onClick={() => { setShowMoreMenu(false); onSwitchToDesktop(); }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl active:bg-white/5 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,113,227,0.08)", border: "1px solid rgba(0,113,227,0.12)" }}>
                      <Monitor className="w-4 h-4" style={{ color: "#0071e3" }} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium" style={{ color: "#f5f5f7" }}>Switch to Desktop View</p>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Full website with all features</p>
                    </div>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.15)" }} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
