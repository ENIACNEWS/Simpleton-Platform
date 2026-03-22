/**
 * Simplicity Ding — crisp two-note ascending notification sound,
 * modeled after Replit's agent completion chime.
 * Very short (~0.5s), high-pitched, glass-bell quality.
 */

let _ctx: AudioContext | null = null;

function ctx(): AudioContext | null {
  try {
    const C = window.AudioContext || (window as any).webkitAudioContext;
    if (!C) return null;
    if (!_ctx || _ctx.state === 'closed') _ctx = new C();
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  } catch { return null; }
}

function tone(
  ac: AudioContext,
  freq: number,
  startSec: number,
  decaySec: number,
  gain: number,
  dest: AudioNode
) {
  const t = ac.currentTime + startSec;

  // Pure sine — clean, bell-like
  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, t);

  // Tiny upper partial for sparkle
  const osc2 = ac.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq * 2.756, t); // inharmonic partial → glass quality

  const g = ac.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.006);       // instant strike
  g.gain.exponentialRampToValueAtTime(0.001, t + decaySec);

  const g2 = ac.createGain();
  g2.gain.setValueAtTime(0, t);
  g2.gain.linearRampToValueAtTime(gain * 0.18, t + 0.006);
  g2.gain.exponentialRampToValueAtTime(0.001, t + decaySec * 0.30);

  osc.connect(g);   g.connect(dest);
  osc2.connect(g2); g2.connect(dest);
  osc.start(t);  osc.stop(t + decaySec + 0.02);
  osc2.start(t); osc2.stop(t + decaySec * 0.35);
}

export function playSimplicityDing(volume = 0.50): void {
  try {
    const ac = ctx();
    if (!ac) return;

    const master = ac.createGain();
    master.gain.setValueAtTime(volume, ac.currentTime);
    master.connect(ac.destination);

    // Short bright reverb
    const rev = ac.createConvolver();
    const len = Math.floor(ac.sampleRate * 0.6);
    const buf = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++)
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6);
    }
    rev.buffer = buf;

    const wet = ac.createGain(); wet.gain.value = 0.18; rev.connect(wet); wet.connect(master);
    const dry = ac.createGain(); dry.gain.value = 0.82; dry.connect(master);

    const send = ac.createGain(); send.gain.value = 1;
    send.connect(dry); send.connect(rev);

    // Replit-style: two ascending bright pings
    // First: A5 (880 Hz) — quick
    tone(ac, 880,  0.00, 0.32, 0.65, send);
    // Second: E6 (1319 Hz) — higher, bright finish
    tone(ac, 1319, 0.14, 0.38, 0.55, send);
  } catch {}
}

/** Pre-warm the AudioContext on first user interaction */
export function prewarmDing(): void {
  ctx();
}
