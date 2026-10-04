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

const isFemaleName = (name: string) => {
  const lower = name.toLowerCase();
  return lower.includes('female') ||
    ['raveena','heera','priya','veena','samantha','karen','moira',
     'tessa','victoria','lekha','kavya'].some(n => lower.includes(n));
};

function getBestVoice(langCode: string): SpeechSynthesisVoice | null {
  const voices = cachedVoices;
  if (!voices || voices.length === 0) return null;

  if (langCode === 'en-IN') {
    const indianSpecific = voices.find(v => (v.lang === 'en-IN' || v.lang === 'en-US' || v.lang === 'en-GB') && ['raveena', 'heera', 'priya', 'veena'].some(n => v.name.toLowerCase().includes(n)));
    if (indianSpecific) return indianSpecific;

    const indianFemale = voices.find(v => v.lang === 'en-IN' && isFemaleName(v.name));
    if (indianFemale) return indianFemale;

    const anyIndian = voices.find(v => v.lang === 'en-IN');
    if (anyIndian) return anyIndian;
  }

  const googleFemale = voices.find(v => v.name.toLowerCase().includes('google') && isFemaleName(v.name));
  if (googleFemale) return googleFemale;

  const macFemale = voices.find(v => ['samantha', 'karen', 'moira', 'tessa'].some(n => v.name.toLowerCase().includes(n)));
  if (macFemale) return macFemale;

  const usFemale = voices.find(v => v.lang === 'en-US' && isFemaleName(v.name));
  if (usFemale) return usFemale;

  const anyEnglish = voices.find(v => v.lang.startsWith('en'));
  if (anyEnglish) return anyEnglish;

  return voices[0] || null;
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

  if (!botEnabled || !text?.trim()) return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  
  // 1. Hard cancel and flush if we are starting new speech
  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    window.speechSynthesis.cancel();
  }

  // 2. Micro-delay — lets the engine fully flush before we queue new speech
  //    This is the key fix for the Chrome resume-loop bug
  await new Promise(resolve => setTimeout(resolve, 80));
  if (stale()) return;

  // 3. If something snuck in during the flush gap, cancel again
  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    window.speechSynthesis.cancel();
    await new Promise(resolve => setTimeout(resolve, 50));
    if (stale()) return;
  }
  
  // 4. Await voices
  await preloadVoices();
  if (stale()) return;

  // 4.5. Re-check right before speaking — this closes the race window.
  // Everything above this line can take a noticeable moment (voice loading
  // especially), and the caller's visibility may have changed since they
  // first decided to call playAudio.
  if (stale()) return;
  if (shouldStart) {
    const res = shouldStart();
    if (!res) return;
  }
  
  // 5. Build utterance
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = getBestVoice(langCode);
  if (voice) utterance.voice = voice;
  
  utterance.rate = 0.92;
  utterance.pitch = 1.05;
  utterance.volume = 1.0;
  utterance.lang = langCode;
  
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
  if (stale()) return;
  if (shouldStart) {
    const res = shouldStart();
    if (!res) return;
  }

  // 8. Speak
  activeOwner = owner;
  activeUtterance = utterance;
  activeUtteranceStarted = false;
  lastSpeakAt = Date.now();
  window.speechSynthesis.speak(utterance);
}
