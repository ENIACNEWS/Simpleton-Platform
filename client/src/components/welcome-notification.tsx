import { useEffect, useState, useCallback, useRef } from "react";
import { useVoicePreference } from "@/hooks/use-voice-preference";
import { playSimplicityVoice, prefetchSimplicityVoice } from "@/lib/simplicity-voice";

// Show welcome once per visit (resets after 8 hours so returning users see it)
const WELCOME_KEY = "sv_welcomed_at_v4";
const WELCOME_TTL_MS = 8 * 60 * 60 * 1000;

function shouldShowWelcome(): boolean {
  try {
    const ts = localStorage.getItem(WELCOME_KEY);
    if (!ts) return true;
    return Date.now() - parseInt(ts, 10) > WELCOME_TTL_MS;
  } catch { return true; }
}

function markWelcomeShown(): void {
  try { localStorage.setItem(WELCOME_KEY, String(Date.now())); } catch {}
}

function playLuxuryChime(onVoiceCue: () => void): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) { onVoiceCue(); return; }
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") ctx.resume();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.28, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const reverb = ctx.createConvolver();
    const reverbLen = ctx.sampleRate * 2.8;
    const impulse = ctx.createBuffer(2, reverbLen, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < reverbLen; i++)
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / reverbLen, 2.8);
    }
    reverb.buffer = impulse;

    const reverbGain = ctx.createGain();
    reverbGain.gain.setValueAtTime(0.30, ctx.currentTime);
    reverb.connect(reverbGain); reverbGain.connect(masterGain);

    const dryGain = ctx.createGain();
    dryGain.gain.setValueAtTime(0.70, ctx.currentTime);
    dryGain.connect(masterGain);

    const beat = 60 / 115;

    const notes = [
      { freq: 392.00, start: 0,            dur: 2.4 },
      { freq: 493.88, start: beat * 0.5,   dur: 2.2 },
      { freq: 587.33, start: beat * 1.0,   dur: 2.0 },
      { freq: 783.99, start: beat * 1.75,  dur: 2.6 },
      { freq: 987.77, start: beat * 2.5,   dur: 2.2 },
    ];

    notes.forEach(({ freq, start, dur }) => {
      const t = ctx.currentTime + start;
      const osc1 = ctx.createOscillator(); osc1.type = "sine";     osc1.frequency.setValueAtTime(freq, t);
      const osc2 = ctx.createOscillator(); osc2.type = "triangle"; osc2.frequency.setValueAtTime(freq, t);
      const osc3 = ctx.createOscillator(); osc3.type = "sine";     osc3.frequency.setValueAtTime(freq * 2, t);

      const g1 = ctx.createGain();
      g1.gain.setValueAtTime(0, t); g1.gain.linearRampToValueAtTime(0.40, t + 0.015); g1.gain.exponentialRampToValueAtTime(0.001, t + dur);
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0, t); g2.gain.linearRampToValueAtTime(0.18, t + 0.020); g2.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.75);
      const g3 = ctx.createGain();
      g3.gain.setValueAtTime(0, t); g3.gain.linearRampToValueAtTime(0.08, t + 0.025); g3.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.40);

      osc1.connect(g1); osc2.connect(g2); osc3.connect(g3);
      [g1, g2, g3].forEach(g => { g.connect(dryGain); g.connect(reverb); });
      [osc1, osc2, osc3].forEach(o => { o.start(t); o.stop(t + dur); });
    });

    const voiceDelay = (beat * 2.5 + 0.4) * 1000;
    setTimeout(onVoiceCue, voiceDelay);
    setTimeout(() => ctx.close().catch(() => {}), 7000);
  } catch {
    onVoiceCue();
  }
}

export function WelcomeNotification() {
  const [phase, setPhase] = useState<"idle" | "entering" | "visible" | "exiting" | "done">("idle");
  const { voiceEnabled, toggleVoice } = useVoicePreference();
  const audioUnlockedRef = useRef(false);
  const audioPlayedRef = useRef(false);

  const playAudio = useCallback(() => {
    if (audioPlayedRef.current) return;
    audioPlayedRef.current = true;
    playLuxuryChime(() => {
      playSimplicityVoice("Welcome to Simpleton", { volume: 0.85, rate: 0.95, pitch: 1.10 });
    });
  }, []);

  // Unlock audio context on first user interaction, then play chime + voice
  const unlockAndPlay = useCallback(() => {
    if (audioUnlockedRef.current) return;
    audioUnlockedRef.current = true;
    playAudio();
  }, [playAudio]);

  useEffect(() => {
    if (!shouldShowWelcome()) return;
    markWelcomeShown();

    prefetchSimplicityVoice("Welcome to Simpleton");

    // Show the visual card after a short delay (no interaction needed)
    const showTimer = setTimeout(() => {
      setPhase("entering");
      setTimeout(() => setPhase("visible"), 100);
      setTimeout(() => setPhase("exiting"), 5500);
      setTimeout(() => setPhase("done"), 6800);
    }, 800);

    // Listen for first user interaction to unlock audio
    const handler = (e: Event) => {
      // Don't steal click from the voice toggle button
      if ((e.target as HTMLElement)?.closest?.('.voice-pill')) return;
      unlockAndPlay();
      window.removeEventListener("click", handler);
      window.removeEventListener("touchstart", handler);
      window.removeEventListener("keydown", handler);
      window.removeEventListener("scroll", handler);
    };

    window.addEventListener("click", handler);
    window.addEventListener("touchstart", handler);
    window.addEventListener("keydown", handler);
    window.addEventListener("scroll", handler);

    return () => {
      clearTimeout(showTimer);
      window.removeEventListener("click", handler);
      window.removeEventListener("touchstart", handler);
      window.removeEventListener("keydown", handler);
      window.removeEventListener("scroll", handler);
    };
  }, [unlockAndPlay]);

  if (phase === "idle" || phase === "done") return null;

  return (
    <>
      <style>{`
        @keyframes welcomeShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes welcomeSlideIn {
          0% { opacity: 0; transform: translate(-50%, -30px) scale(0.92); }
          100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
        @keyframes welcomeSlideOut {
          0% { opacity: 1; transform: translate(-50%, 0) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -30px) scale(0.92); }
        }
        @keyframes welcomeBarGrow {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes diamondSpin {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.15); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        .voice-pill {
          background: none;
          border: 1px solid rgba(212,175,55,0.25);
          border-radius: 20px;
          padding: 4px 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          color: rgba(212,175,55,0.65);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }
        .voice-pill:hover {
          border-color: rgba(212,175,55,0.55);
          color: rgba(212,175,55,1);
          background: rgba(212,175,55,0.08);
        }
      `}</style>

      {/* Ambient glow overlay */}
      <div className="fixed inset-0 z-[9998] pointer-events-none" style={{
        background: phase === "entering" || phase === "visible"
          ? "radial-gradient(ellipse at top center, rgba(212,175,55,0.06) 0%, transparent 60%)"
          : "transparent",
        transition: "background 1.5s ease",
      }} />

      {/* Card */}
      <div className="fixed z-[9999]" style={{
        top: "28px", left: "50%",
        animation: phase === "exiting"
          ? "welcomeSlideOut 1.2s ease-in forwards"
          : "welcomeSlideIn 0.8s cubic-bezier(0.16,1,0.3,1) forwards",
      }}>
        <div style={{
          position: "relative",
          padding: "24px 44px 20px 36px",
          borderRadius: "20px",
          background: "linear-gradient(145deg,#1a1a1a 0%,#0d0d0d 50%,#1a1a1a 100%)",
          border: "1px solid rgba(212,175,55,0.35)",
          boxShadow: "0 0 60px rgba(212,175,55,0.12),0 0 120px rgba(212,175,55,0.06),0 25px 50px rgba(0,0,0,0.5),inset 0 1px 0 rgba(212,175,55,0.15),inset 0 -1px 0 rgba(0,0,0,0.3)",
          overflow: "hidden",
          minWidth: "390px",
        }}>
          {/* Top accent line */}
          <div style={{ position:"absolute",top:0,left:0,right:0,height:"1px",background:"linear-gradient(90deg,transparent,rgba(212,175,55,0.6),transparent)" }} />

          {/* Shimmer wash */}
          <div style={{
            position:"absolute",inset:0,
            background:"linear-gradient(90deg,transparent 0%,rgba(212,175,55,0.04) 25%,rgba(255,215,0,0.06) 50%,rgba(212,175,55,0.04) 75%,transparent 100%)",
            backgroundSize:"200% 100%",
            animation:"welcomeShimmer 4s ease-in-out infinite",
            borderRadius:"20px",
          }} />

          {/* Sparkle accents */}
          {[{t:12,r:16,s:10,d:"2s"},{t:20,r:36,s:8,d:"2.5s 0.5s"},{b:32,l:24,s:7,d:"3s 1s"}].map((p,i) => (
            <div key={i} style={{ position:"absolute",top:p.t,right:p.r,bottom:p.b,left:p.l,opacity:0.12 }}>
              <div style={{ animation:`sparkle ${p.d} ease-in-out infinite`,color:"#d4af37",fontSize:`${p.s}px` }}>✦</div>
            </div>
          ))}

          {/* Content row */}
          <div style={{ position:"relative",display:"flex",alignItems:"center",gap:"20px" }}>
            <div style={{
              width:52,height:52,borderRadius:16,flexShrink:0,
              background:"linear-gradient(145deg,#d4af37 0%,#b8960c 40%,#d4af37 70%,#f0d060 100%)",
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:"0 4px 20px rgba(212,175,55,0.3),inset 0 1px 0 rgba(255,255,255,0.2)",
            }}>
              <div style={{ animation:"diamondSpin 6s ease-in-out infinite",fontSize:24,filter:"drop-shadow(0 0 4px rgba(255,255,255,0.4))" }}>💎</div>
            </div>

            <div style={{ display:"flex",flexDirection:"column",gap:4 }}>
              <span style={{
                fontSize:11,fontWeight:600,letterSpacing:"3px",textTransform:"uppercase",
                background:"linear-gradient(90deg,#d4af37,#f0d060,#d4af37)",backgroundSize:"200% 100%",
                WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
                animation:"welcomeShimmer 3s ease-in-out infinite",
              }}>Welcome</span>
              <span style={{ fontSize:22,fontWeight:700,color:"#ffffff",letterSpacing:"0.5px",textShadow:"0 0 20px rgba(212,175,55,0.15)" }}>
                Welcome to <span className="simpleton-brand">Simpleton</span>
              </span>
              <span style={{ fontSize:12,color:"rgba(212,175,55,0.5)",fontWeight:400,letterSpacing:"1px" }}>
                Premium Precious Metals &amp; Diamonds
              </span>
            </div>
          </div>

          {/* Voice toggle */}
          <div style={{ position:"relative",display:"flex",alignItems:"center",justifyContent:"flex-end",marginTop:14 }}>
            <button
              className="voice-pill"
              onClick={(e) => { e.stopPropagation(); toggleVoice(); }}
              title={voiceEnabled ? "Click to turn voice off" : "Click to turn voice on"}
            >
              <span style={{ fontSize:13 }}>{voiceEnabled ? "🔊" : "🔇"}</span>
              <span>Voice {voiceEnabled ? "On" : "Off"}</span>
            </button>
          </div>

          {/* Progress bar */}
          <div style={{
            position:"absolute",bottom:0,left:0,height:"2px",
            background:"linear-gradient(90deg,#d4af37,#f0d060,#d4af37)",
            animation:"welcomeBarGrow 5.5s linear forwards",
            borderRadius:"0 0 20px 20px",
          }} />
        </div>
      </div>
    </>
  );
}
