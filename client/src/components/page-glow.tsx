import { useState, useEffect } from "react";
import { Palette } from "lucide-react";

const GLOW_COLORS = [
  { name: "Gold", value: "rgba(212, 175, 55, 0.15)", accent: "#d4af37" },
  { name: "Blue", value: "rgba(59, 130, 246, 0.12)", accent: "#3b82f6" },
  { name: "Purple", value: "rgba(147, 51, 234, 0.12)", accent: "#9333ea" },
  { name: "Emerald", value: "rgba(16, 185, 129, 0.12)", accent: "#10b981" },
  { name: "Rose", value: "rgba(244, 63, 94, 0.10)", accent: "#f43e5e" },
  { name: "Cyan", value: "rgba(6, 182, 212, 0.12)", accent: "#06b6d4" },
  { name: "Off", value: "transparent", accent: "#666" },
];

export function PageGlow() {
  const [colorIndex, setColorIndex] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('simpleton-glow-color') : null;
    return saved ? parseInt(saved, 10) : 0;
  });
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    localStorage.setItem('simpleton-glow-color', String(colorIndex));
  }, [colorIndex]);

  const current = GLOW_COLORS[colorIndex] || GLOW_COLORS[0];
  const isOff = current.value === "transparent";

  return (
    <>
      {/* Glow overlay - fixed, non-interactive, behind everything */}
      {!isOff && (
        <div
          className="page-glow-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 9999,
            boxShadow: `inset 0 0 80px 20px ${current.value}, inset 0 0 200px 60px ${current.value.replace(/[\d.]+\)$/, (m) => parseFloat(m) * 0.4 + ')')}`,
            animation: 'glowPulse 6s ease-in-out infinite',
            borderRadius: '0',
          }}
        />
      )}

      {/* Tiny color picker toggle */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="fixed bottom-20 left-4 z-[10000] w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: isOff ? 'rgba(255,255,255,0.1)' : current.value.replace(/[\d.]+\)$/, '0.3)'),
          border: `1.5px solid ${current.accent}40`,
          backdropFilter: 'blur(8px)',
        }}
        title="Customize page glow"
      >
        <Palette className="w-3.5 h-3.5" style={{ color: current.accent, opacity: 0.7 }} />
      </button>

      {/* Color picker popup */}
      {showPicker && (
        <div
          className="fixed bottom-32 left-4 z-[10001] p-3 rounded-xl backdrop-blur-xl"
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <p className="text-[10px] text-white/50 uppercase tracking-wider mb-2 font-medium">Page Glow</p>
          <div className="flex gap-1.5">
            {GLOW_COLORS.map((color, i) => (
              <button
                key={color.name}
                onClick={() => { setColorIndex(i); setShowPicker(false); }}
                className="w-7 h-7 rounded-full transition-all duration-200 hover:scale-110"
                style={{
                  background: color.accent,
                  opacity: i === colorIndex ? 1 : 0.5,
                  border: i === colorIndex ? '2px solid white' : '2px solid transparent',
                  boxShadow: i === colorIndex ? `0 0 12px ${color.accent}60` : 'none',
                }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Keyframe animation injected via style tag */}
      <style>{`
        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  );
}
