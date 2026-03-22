import { useState, useEffect, useCallback } from 'react';

const VOICE_KEY = 'sv-voice-enabled';

function readVoicePref(): boolean {
  try {
    const val = localStorage.getItem(VOICE_KEY);
    return val === null ? true : val !== 'false';
  } catch { return true; }
}

function writeVoicePref(enabled: boolean) {
  try { localStorage.setItem(VOICE_KEY, String(enabled)); } catch {}
}

export function useVoicePreference() {
  const [voiceEnabled, setVoiceEnabledState] = useState<boolean>(() => readVoicePref());

  useEffect(() => {
    const sync = () => setVoiceEnabledState(readVoicePref());
    window.addEventListener('sv-voice-change', sync);
    return () => window.removeEventListener('sv-voice-change', sync);
  }, []);

  const setVoiceEnabled = useCallback((enabled: boolean) => {
    writeVoicePref(enabled);
    setVoiceEnabledState(enabled);
    window.dispatchEvent(new Event('sv-voice-change'));
  }, []);

  const toggleVoice = useCallback(() => {
    const next = !readVoicePref();
    writeVoicePref(next);
    setVoiceEnabledState(next);
    window.dispatchEvent(new Event('sv-voice-change'));
  }, []);

  return { voiceEnabled, setVoiceEnabled, toggleVoice };
}

export function isVoiceEnabled(): boolean {
  return readVoicePref();
}
