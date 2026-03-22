import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function BetaBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem("beta-banner-dismissed");
    if (!wasDismissed) {
      setDismissed(false);
    }
  }, []);

  function handleDismiss() {
    setDismissed(true);
    sessionStorage.setItem("beta-banner-dismissed", "true");
  }

  if (dismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-black px-4 py-2.5 text-center z-[100]">
      <div className="max-w-5xl mx-auto flex items-center justify-center gap-2 flex-wrap">
        <span className="inline-block bg-black text-yellow-400 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
          Beta
        </span>
        <p className="text-sm font-medium">
          Welcome to <span className="simpleton-brand">Simpleton</span> Vision Beta — all features are completely free during this testing phase. Some features are still in development and may not work as expected.
        </p>
      </div>
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/10 transition-colors"
        aria-label="Dismiss beta notice"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
