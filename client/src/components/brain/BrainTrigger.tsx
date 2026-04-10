import { Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { useBrain } from "@/lib/brain-context";

// Design tokens — shared with the editorial site language.
const T = {
  gold: '#c9a84c',
  goldGlow: 'rgba(201,168,76,0.30)',
  glass: 'rgba(11,11,18,0.75)',
  hairline: 'rgba(244,239,226,0.18)',
};

export function BrainTrigger() {
  const { isOpen, openBrain, suggestion, awareness } = useBrain();

  const [location] = useLocation();

  // Hide on /simplicity — the full workspace is already there
  if (isOpen || location === '/simplicity') return null;

  const hasActivity = !!(
    suggestion ||
    (awareness.calculator?.lastCalculation && awareness.calculator.lastCalculation > 0)
  );

  return (
    <button
      onClick={() => openBrain()}
      aria-label="Talk to Simplicity"
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9998,
        width: 56,
        height: 56,
        borderRadius: '50%',
        border: `1.5px solid ${hasActivity ? T.gold : T.hairline}`,
        background: T.glass,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: hasActivity
          ? `0 0 24px ${T.goldGlow}, 0 8px 32px rgba(0,0,0,0.4)`
          : '0 8px 32px rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}
      onMouseOver={e => {
        e.currentTarget.style.borderColor = T.gold;
        e.currentTarget.style.boxShadow = `0 0 28px ${T.goldGlow}, 0 8px 32px rgba(0,0,0,0.4)`;
        e.currentTarget.style.transform = 'scale(1.08)';
      }}
      onMouseOut={e => {
        e.currentTarget.style.borderColor = hasActivity ? T.gold : T.hairline;
        e.currentTarget.style.boxShadow = hasActivity
          ? `0 0 24px ${T.goldGlow}, 0 8px 32px rgba(0,0,0,0.4)`
          : '0 8px 32px rgba(0,0,0,0.4)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {/* Playfair "S" monogram */}
      <span style={{
        fontFamily: '"Playfair Display", Georgia, serif',
        fontSize: 24,
        fontWeight: 400,
        fontStyle: 'italic',
        color: T.gold,
        lineHeight: 1,
        marginTop: -1,
      }}>
        S
      </span>

      {/* Suggestion / activity badge */}
      {suggestion && (
        <span style={{
          position: 'absolute',
          top: -2,
          right: -2,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: T.gold,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 8px ${T.goldGlow}`,
        }}>
          <Sparkles style={{ width: 9, height: 9, color: '#0b0b12' }} />
        </span>
      )}
    </button>
  );
}
