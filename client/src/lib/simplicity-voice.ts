import { isVoiceEnabled } from '@/hooks/use-voice-preference';

// Priority-ordered list — youthful, bright, energetic voices first
const VOICE_PRIORITY = [
  'Microsoft Jenny Online (Natural) - English (United States)', // bright & young
  'Google US English Female',   // clear, youthful American
  'Microsoft Jenny',            // Windows neural — warm & young
  'Samantha',                   // macOS — natural female
  'Karen',                      // macOS Australian
  'Google UK English Female',   // UK — clear and natural
  'Microsoft Aria Online (Natural) - English (United States)',
  'Microsoft Aria',
  'Tessa',                      // macOS South African
  'Moira',                      // macOS Irish
  'Microsoft Zira',
  'Google UK English Male',
  'Microsoft David',
];

let bestVoiceCache: SpeechSynthesisVoice | null | undefined = undefined;

function pickBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (bestVoiceCache !== undefined) return bestVoiceCache;

  for (const name of VOICE_PRIORITY) {
    const found = voices.find(v => v.name === name);
    if (found) { bestVoiceCache = found; return found; }
  }
  // Fallback: any English voice that sounds like it could be natural
  const enFemale = voices.find(v =>
    v.lang.startsWith('en') && (/online|natural|neural/i.test(v.name))
  );
  if (enFemale) { bestVoiceCache = enFemale; return enFemale; }

  const anyEn = voices.find(v => v.lang.startsWith('en-US')) ||
                voices.find(v => v.lang.startsWith('en'));
  bestVoiceCache = anyEn || null;
  return bestVoiceCache;
}

function preprocessTextForSpeech(text: string): string {
  return text
    // Replace em-dash with pause phrase
    .replace(/—/g, ', ')
    // Expand common abbreviations
    .replace(/\bct\b/gi, 'carat')
    .replace(/\boz\b/gi, 'ounce')
    .replace(/\bkarat\b/gi, 'karat')
    // Add slight pause after sentence end
    .replace(/([.!?])\s+/g, '$1 ')
    // Clean up extra whitespace
    .replace(/\s{2,}/g, ' ')
    .trim();
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

export function stopSimplicityVoice() {
  try {
    if (activeUtterance) {
      window.speechSynthesis?.cancel();
      activeUtterance = null;
    }
  } catch {}
}

export function playSimplicityVoice(text: string, opts: {
  volume?: number;
  rate?: number;
  pitch?: number;
  onEnd?: () => void;
  onError?: () => void;
} = {}): void {
  if (!isVoiceEnabled()) return;

  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const cleaned = preprocessTextForSpeech(text);
    if (!cleaned) return;

    const utter = new SpeechSynthesisUtterance(cleaned);
    utter.volume = opts.volume ?? 0.85;
    utter.rate   = opts.rate   ?? 0.95;
    utter.pitch  = opts.pitch  ?? 1.10;

    utter.onend = () => { activeUtterance = null; opts.onEnd?.(); };
    utter.onerror = (e) => {
      if (e.error !== 'interrupted') { activeUtterance = null; opts.onError?.(); }
    };

    const doSpeak = (voices: SpeechSynthesisVoice[]) => {
      const voice = pickBestVoice(voices);
      if (voice) utter.voice = voice;
      activeUtterance = utter;
      window.speechSynthesis.speak(utter);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      doSpeak(voices);
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', function handler() {
        window.speechSynthesis.removeEventListener('voiceschanged', handler);
        doSpeak(window.speechSynthesis.getVoices());
      });
    }
  } catch {}
}

export async function playSimplicityVoiceFromAPI(text: string, opts: {
  volume?: number;
  rate?: number;
  pitch?: number;
  onEnd?: () => void;
  onError?: () => void;
} = {}): Promise<void> {
  if (!isVoiceEnabled()) return;

  try {
    const response = await fetch('/api/assistant/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      playSimplicityVoice(text, opts);
      return;
    }

    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('audio')) {
      // Real audio file from a TTS API
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.volume = opts.volume ?? 0.82;
      audio.onended = () => { URL.revokeObjectURL(url); opts.onEnd?.(); };
      audio.onerror = () => { URL.revokeObjectURL(url); playSimplicityVoice(text, opts); };
      await audio.play().catch(() => playSimplicityVoice(text, opts));
    } else {
      // Server signaled to use browser TTS
      playSimplicityVoice(text, opts);
    }
  } catch {
    playSimplicityVoice(text, opts);
  }
}

export function prefetchSimplicityVoice(text: string): void {
  // Prime the voice engine so the first word doesn't clip
  try {
    if (!window.speechSynthesis) return;
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      pickBestVoice(voices); // cache the best voice early
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', function h() {
        window.speechSynthesis.removeEventListener('voiceschanged', h);
        pickBestVoice(window.speechSynthesis.getVoices());
      });
    }
  } catch {}
}
