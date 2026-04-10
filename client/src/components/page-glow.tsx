import { useState, useEffect } from "react";
import { Palette, Sun } from "lucide-react";

const GLOW_COLORS = [
  { name: "Gold", value: "212, 175, 55", accent: "#d4af37" },
  { name: "Blue", value: "59, 130, 246", accent: "#3b82f6" },
  { name: "Purple", value: "147, 51, 234", accent: "#9333ea" },
  { name: "Emerald", value: "16, 185, 129", accent: "#10b981" },
  { name: "Rose", value: "244, 63, 94", accent: "#f43e5e" },
  { name: "Cyan", value: "6, 182, 212", accent: "#06b6d4" },
  { name: "Off", value: "0, 0, 0", accent: "#666" },
];

const BRIGHTNESS_LEVELS = [
  { name: "Whisper", outer: 0.06, inner: 0.025 },
  { name: "Subtle", outer: 0.12, inner: 0.05 },
  { name: "Medium", outer: 0.2, inner: 0.08 },
  { name: "Bright", outer: 0.3, inner: 0.12 },
];

export function PageGlow() {
  const [colorIndex, setColorIndex] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('simpleton-glow-color') : null;
    return saved ? parseInt(saved, 10) : 0;
  });
  const [brightness, setBrightness] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('simpleton-glow-brightness') : null;
    return saved ? parseInt(saved, 10) : 1;
  });
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    localStorage.setItem('simpleton-glow-color', String(colorIndex));
  }, [colorIndex]);

  useEffect(() => {
    localStorage.setItem('simpleton-glow-brightness', String(brightness));
  }, [brightness]);

  const current = GLOW_COLORS[colorIndex] || GLOW_COLORS[0];
  const bright = BRIGHTNESS_LEVELS[brightness] || BRIGHTNESS_LEVELS[1];
  const isOff = current.name === "Off";

  return (
    <>
      {!isOff && (
        <div
          className="page-glow-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 9999,
            boxShadow: `inset 0 0 80px 20px rgba(${current.value}, ${bright.outer}), inset 0 0 200px 60px rgba(${current.value}, ${bright.inner})`,
            animation: 'glowPulse 6s ease-in-out infinite',
            // Screen blend prevents the glow from darkening page content.
            // Without this the inset box-shadow + opacity pulse was
            // covering the entire viewport with a 50-100% dark overlay,
            // making all sections below the hero invisible.
            mixBlendMode: 'screen',
          }}
        />
      )}

      <button
        onClick={() => setShowPicker(!showPicker)}
        className="fixed bottom-20 left-4 z-[10000] w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: isOff ? 'rgba(255,255,255,0.08)' : `rgba(${current.value}, 0.2)`,
          border: `1.5px solid ${current.accent}40`,
          backdropFilter: 'blur(8px)',
        }}
        title="Customize page glow"
      >
        <Palette className="w-3.5 h-3.5" style={{ color: current.accent, opacity: 0.7 }} />
      </button>

      {showPicker && (
        <div
          className="fixed bottom-32 left-4 z-[10001] p-3 rounded-xl backdrop-blur-xl"
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <p className="text-[10px] text-white/50 uppercase tracking-wider mb-2 font-medium">Glow Color</p>
          <div className="flex gap-1.5 mb-3">
            {GLOW_COLORS.map((color, i) => (
              <button
                key={color.name}
                onClick={() => setColorIndex(i)}
                className="w-7 h-7 rounded-full transition-all duration-200 hover:scale-110"
                style={{
                  background: color.name === "Off" ? 'rgba(255,255,255,0.1)' : color.accent,
                  opacity: i === colorIndex ? 1 : 0.5,
                  border: i === colorIndex ? '2px solid white' : '2px solid transparent',
                  boxShadow: i === colorIndex ? `0 0 12px ${color.accent}60` : 'none',
                }}
                title={color.name}
              />
            ))}
          </div>

          {!isOff && (
            <>
              <p className="text-[10px] text-white/50 uppercase tracking-wider mb-2 font-medium flex items-center gap-1">
                <Sun className="w-3 h-3" /> Brightness
              </p>
              <div className="flex gap-1.5">
                {BRIGHTNESS_LEVELS.map((level, i) => (
                  <button
                    key={level.name}
                    onClick={() => setBrightness(i)}
                    className="px-2 py-1 rounded-md text-[10px] font-medium transition-all duration-200"
                    style={{
                      background: i === brightness ? `rgba(${current.value}, 0.3)` : 'rgba(255,255,255,0.05)',
                      color: i === brightness ? 'white' : 'rgba(255,255,255,0.4)',
                      border: i === brightness ? `1px solid ${current.accent}60` : '1px solid transparent',
                    }}
                  >
                    {level.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes glowPulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  );
}
