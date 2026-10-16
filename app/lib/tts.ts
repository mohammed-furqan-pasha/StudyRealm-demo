let voicesPromise: Promise<void> | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];

let activeOwner: string | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeUtteranceStarted = false;
let lastSpeakAt = 0;
const ownerEpochs: Record<string, number> = {};
const epochOf = (owner: string) => ownerEpochs[owner] ?? 0;

export function visibleRatio(el: Element | null): number {
  if (!el || typeof window === 'undefined') return 0;
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
  const denom = Math.min(r.height, vh) || 1;
  return Math.max(0, visible) / denom;
}

export function stripForSpeech(text: string): string {
  if (!text) return '';
  return text.replace(/[\p{Extended_Pictographic}\uFE0F\u200D\u20E3▸→←↓]/gu, '')
             .replace(/\s+/g, ' ')
             .trim();
}

export function stopAudioFor(owner: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  ownerEpochs[owner] = epochOf(owner) + 1; // invalidates any playAudio call still waiting on its awaits
  if (activeOwner !== owner) return;       // never silence another section's speech
  const synth = window.speechSynthesis;
  const stoppedAt = Date.now();
  
  if (activeUtterance && !activeUtteranceStarted) {
    // Chrome bug: cancelling a pending utterance detaches it to the OS,
    // making it play fully and unstoppable. We MUST wait for it to start.
    const u = activeUtterance;
    const oldStart = u.onstart;
    u.onstart = (e) => {
      if (oldStart) oldStart.call(u, e);
      synth.cancel();
    };
    // Fallback if onstart never fires
    setTimeout(() => synth.cancel(), 1000);
  } else {
    synth.cancel();
    // Retry, but only if nothing new has started speaking since.
    [120, 400].forEach(ms => setTimeout(() => {
      if (lastSpeakAt <= stoppedAt) synth.cancel();
    }, ms));
  }
  
  activeOwner = null;
  activeUtterance = null;
}

export function watchSectionVisibility(
  getEl: () => Element | null,
  stopBelow: number,        // stop speech when visible ratio falls under this
  onHidden: () => void
): () => void {
  if (typeof window === 'undefined') return () => {};
  const isHidden = () => document.hidden || visibleRatio(getEl()) < stopBelow;
  let wasHidden = isHidden();
  let raf = 0;
  const check = () => {
    raf = 0;
    const hidden = isHidden();
    const synth = window.speechSynthesis;
    if (hidden && (!wasHidden || synth.speaking || synth.pending)) onHidden();
    wasHidden = hidden;
  };
  const schedule = () => { if (!raf) raf = requestAnimationFrame(check); };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  document.addEventListener('visibilitychange', check); // direct call: rAF is throttled in hidden tabs
  const interval = window.setInterval(check, 250);
  return () => {
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    document.removeEventListener('visibilitychange', check);
    window.clearInterval(interval);
    if (raf) cancelAnimationFrame(raf);
  };
}

export function preloadVoices(): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return Promise.resolve();
  if (!voicesPromise) {
    voicesPromise = new Promise((resolve) => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) { cachedVoices = voices; resolve(); }
      else {
        window.speechSynthesis.onvoiceschanged = () => {
          cachedVoices = window.speechSynthesis.getVoices();
          if (cachedVoices.length > 0) resolve();
        };
      }
    });
  }
  return voicesPromise;
}

let isSpeechRaw: boolean | null = null;

function checkSpeechRaw(): boolean {
  if (typeof window === 'undefined') return false;
  if (isSpeechRaw !== null) return isSpeechRaw;
  try {
    const params = new URLSearchParams(window.location.search);
    isSpeechRaw = params.get('speech') === 'raw';
  } catch {
    isSpeechRaw = false;
  }
  return isSpeechRaw;
}

export const PRONOUNCE_ALWAYS: [RegExp, string][] = [
  [/\bNCF\s+2023\b/g, 'N C F twenty twenty-three'],
  [/\bNCF\b/g, 'N C F'],
  [/\bCBSE\b/g, 'C B S E'],
  [/\bICSE\b/g, 'I C S E'],
  [/\bLKG\b/g, 'L K G'],
  [/\bMSME\b/g, 'M S M E'],
  [/\bAI\b/g, 'A I'],
  [/\bStudyRealm\b/g, 'Study Realm'],
  [/\bStudyLand\b/g, 'Study Land'],
  [/\b400\+/g, '400 plus'],
  [/\b1\s*[–—\-]\s*10\b/g, '1 to 10'],
];

export const PRONOUNCE_NON_INDIAN: [RegExp, string][] = [
  [/\bhaldi\b/gi, 'hul-dee'],
  [/\bdahi\b/gi, 'duh-hee'],
];

export function isNonIndianVoice(voice: SpeechSynthesisVoice | null): boolean {
  if (!voice || !voice.lang) return true;
  const lowerLang = voice.lang.toLowerCase();
  return !lowerLang.startsWith('en-in') && !lowerLang.startsWith('en_in');
}

export function pronounce(text: string, voice: SpeechSynthesisVoice | null): string {
  if (!text) return '';
  if (checkSpeechRaw()) return text;

  let result = text;
  for (const [pattern, replacement] of PRONOUNCE_ALWAYS) {
    result = result.replace(pattern, replacement);
  }

  if (isNonIndianVoice(voice)) {
    for (const [pattern, replacement] of PRONOUNCE_NON_INDIAN) {
      result = result.replace(pattern, replacement);
    }
  }

  return result;
}

const isFemaleName = (name: string) => {
  const lower = name.toLowerCase();
  return lower.includes('female') ||
    ['raveena','heera','priya','veena','neerja','samantha','karen','moira',
     'tessa','victoria','lekha','kavya'].some(n => lower.includes(n));
};

const EXPLICIT_INDIAN_NAMES = ['raveena', 'heera', 'priya', 'veena', 'neerja', 'prabhat'];

const isExplicitIndian = (v: SpeechSynthesisVoice) => {
  const lowerName = v.name.toLowerCase();
  const lowerLang = v.lang.replace('_', '-').toLowerCase();
  const matchesLang = lowerLang === 'en-in' || lowerLang === 'en-us' || lowerLang === 'en-gb';
  return matchesLang && EXPLICIT_INDIAN_NAMES.some(n => lowerName.includes(n));
};

const isNaturalName = (name: string) => {
  const lower = name.toLowerCase();
  return lower.includes('natural') || lower.includes('neural') || lower.includes('online');
};

const isEnInLang = (lang: string) => {
  const lower = lang.replace('_', '-').toLowerCase();
  return lower === 'en-in';
};

function getVoiceScore(v: SpeechSynthesisVoice, langCode: string): number {
  const lowerName = v.name.toLowerCase();
  const lowerLang = v.lang.replace('_', '-').toLowerCase();
  const naturalBonus = (isEnInLang(v.lang) && isNaturalName(v.name)) ? 5 : 0;

  if (langCode === 'en-IN') {
    // 1. Explicit Indian names (Neerja, Prabhat, Raveena, Heera, Priya, Veena)
    if (isExplicitIndian(v)) {
      return 100 + (isNaturalName(v.name) ? 5 : 0);
    }
    // 2. Indian female (lang en-IN + female name)
    if (isEnInLang(v.lang) && isFemaleName(v.name)) {
      return 80 + naturalBonus;
    }
    // 3. Any Indian (lang en-IN)
    if (isEnInLang(v.lang)) {
      return 60 + naturalBonus;
    }
  }

  // 4. Google female
  if (lowerName.includes('google') && isFemaleName(v.name)) {
    return 50;
  }
  // 5. Mac female (Samantha, Karen, Moira, Tessa)
  if (['samantha', 'karen', 'moira', 'tessa'].some(n => lowerName.includes(n))) {
    return 40;
  }
  // 6. US female
  if (lowerLang === 'en-us' && isFemaleName(v.name)) {
    return 30;
  }
  // 7. Any English
  if (lowerLang.startsWith('en')) {
    return 20;
  }
  // 8. Default voice
  return 10;
}

function findBestVoiceCandidate(voices: SpeechSynthesisVoice[], langCode: string): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;
  let bestVoice = voices[0];
  let bestScore = getVoiceScore(bestVoice, langCode);

  for (let i = 1; i < voices.length; i++) {
    const score = getVoiceScore(voices[i], langCode);
    if (score > bestScore) {
      bestScore = score;
      bestVoice = voices[i];
    }
  }
  return bestVoice;
}

let sessionVoiceKey: string | null = null;
let loggedVoiceSession = false;

function logVoiceOnce(name: string, lang: string) {
  if (loggedVoiceSession) return;
  loggedVoiceSession = true;
  // TEMP-DEBUG: development-only voice logging once per session
  if (process.env.NODE_ENV !== 'production') {
    console.info('[tts] voice', name, lang);
  }
}

function selectVoicePure(
  voices: SpeechSynthesisVoice[],
  langCode: string,
  currentKey: string | null,
  isBusy: boolean
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  if (currentKey) {
    const existing = voices.find(v => `${v.name}|${v.lang}` === currentKey);
    // Never switch voices while speech is active or pending
    if (isBusy && existing) {
      return existing;
    }

    if (existing) {
      // Check if a better voice has appeared later (e.g. via voiceschanged)
      const candidate = findBestVoiceCandidate(voices, langCode);
      if (candidate && getVoiceScore(candidate, langCode) > getVoiceScore(existing, langCode)) {
        return candidate;
      }
      return existing;
    }
  }

  return findBestVoiceCandidate(voices, langCode);
}

function getBestVoice(langCode: string): SpeechSynthesisVoice | null {
  const voices = cachedVoices;
  if (!voices || voices.length === 0) return null;

  const isBusy = typeof window !== 'undefined' && 'speechSynthesis' in window &&
    (window.speechSynthesis.speaking || window.speechSynthesis.pending);

  const chosen = selectVoicePure(voices, langCode, sessionVoiceKey, isBusy);
  if (chosen) {
    sessionVoiceKey = `${chosen.name}|${chosen.lang}`;
    logVoiceOnce(chosen.name, chosen.lang);
  }
  return chosen;
}

export function describeVoiceChoice(): {
  voices: { name: string; lang: string; localService: boolean }[];
  chosen: { name: string; lang: string; localService: boolean } | null;
  hasEnIN: boolean;
} {
  const voicesList = (typeof window !== 'undefined' && 'speechSynthesis' in window)
    ? (window.speechSynthesis.getVoices().length > 0 ? window.speechSynthesis.getVoices() : cachedVoices)
    : cachedVoices;

  const voices = (voicesList || []).map(v => ({
    name: v.name,
    lang: v.lang,
    localService: Boolean(v.localService),
  }));

  const isBusy = typeof window !== 'undefined' && 'speechSynthesis' in window &&
    (window.speechSynthesis.speaking || window.speechSynthesis.pending);

  // Pure read: use sessionVoiceKey if present, but do not mutate sessionVoiceKey or logs
  const chosenVoice = selectVoicePure(voicesList || [], 'en-IN', sessionVoiceKey, isBusy);

  const chosen = chosenVoice ? {
    name: chosenVoice.name,
    lang: chosenVoice.lang,
    localService: Boolean(chosenVoice.localService),
  } : null;

  const hasEnIN = (voicesList || []).some(v => {
    const l = v.lang.toLowerCase().replace('_', '-');
    return l === 'en-in' || l.startsWith('en-in');
  });

  return {
    voices,
    chosen,
    hasEnIN,
  };
}

export async function playAudio(
  text: string,
  botEnabled: boolean,
  langCode: string = 'en-IN',
  onStart?: () => void,
  onEnd?: () => void,
  // Checked right before speak() actually fires — lets the caller bail out
  // if conditions changed during the awaits above (e.g. the user scrolled
  // away from the section while voices were still loading). Optional and
  // backward compatible: omitting it preserves the old behavior exactly.
  shouldStart?: () => boolean,
  owner: string = 'default'
) {
  const myEpoch = epochOf(owner);
  const stale = () => myEpoch !== epochOf(owner);

  if (!botEnabled || !text?.trim()) { onEnd?.(); return; }
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) { onEnd?.(); return; }
  
  // 1. Hard cancel and flush if we are starting new speech
  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    window.speechSynthesis.cancel();
  }

  // 2. Micro-delay — lets the engine fully flush before we queue new speech
  //    This is the key fix for the Chrome resume-loop bug
  await new Promise(resolve => setTimeout(resolve, 80));
  if (stale()) { onEnd?.(); return; }

  // 3. If something snuck in during the flush gap, cancel again
  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    window.speechSynthesis.cancel();
    await new Promise(resolve => setTimeout(resolve, 50));
    if (stale()) { onEnd?.(); return; }
  }
  
  // 4. Await voices
  await preloadVoices();
  if (stale()) { onEnd?.(); return; }

  // 4.5. Re-check right before speaking — this closes the race window.
  // Everything above this line can take a noticeable moment (voice loading
  // especially), and the caller's visibility may have changed since they
  // first decided to call playAudio.
  if (stale()) { onEnd?.(); return; }
  if (shouldStart) {
    const res = shouldStart();
    if (!res) { onEnd?.(); return; }
  }
  
  // 5. Build utterance
  const voice = getBestVoice(langCode);
  const utterance = new SpeechSynthesisUtterance(pronounce(stripForSpeech(text), voice));
  if (voice) utterance.voice = voice;
  
  utterance.rate = 0.92;
  utterance.pitch = 1.05;
  utterance.volume = 1.0;
  utterance.lang = voice?.lang || 'en-IN';
  
  // 6. Wire callbacks — mark ended so no resume loop can restart it
  let ended = false;

  utterance.onstart = () => {
    activeUtteranceStarted = true;
    onStart?.();
  };

  utterance.onend = () => {
    if (ended) return;   // guard: ignore any duplicate end events
    ended = true;
    if (activeOwner === owner) activeOwner = null;
    onEnd?.();
  };

  utterance.onerror = (e) => {
    if (ended) return;
    ended = true;
    if (activeOwner === owner) {
      activeOwner = null;
      activeUtterance = null;
    }
    // 'interrupted' is expected when we cancel mid-speech — not a real error
    if (e.error === 'interrupted') return;
    onEnd?.();
  };
  
  // 7. One last check immediately before speak() — covers the (rare) case
  // where state changed in the microtask gap between the check above and
  // utterance construction.
  if (stale()) { onEnd?.(); return; }
  if (shouldStart) {
    const res = shouldStart();
    if (!res) { onEnd?.(); return; }
  }

  // 8. Speak
  activeOwner = owner;
  activeUtterance = utterance;
  activeUtteranceStarted = false;
  lastSpeakAt = Date.now();
  window.speechSynthesis.speak(utterance);
}
