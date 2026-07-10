let voicesPromise: Promise<void> | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];

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
  onEnd?: () => void
) {
  if (!botEnabled || !text?.trim()) return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  
  // 1. Hard cancel and flush
  window.speechSynthesis.cancel();

  // 2. Micro-delay — lets the engine fully flush before we queue new speech
  //    This is the key fix for the Chrome resume-loop bug
  await new Promise(resolve => setTimeout(resolve, 80));

  // 3. If something snuck in during the flush gap, cancel again
  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    window.speechSynthesis.cancel();
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  // 4. Await voices
  await preloadVoices();
  
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
    onStart?.();
  };

  utterance.onend = () => {
    if (ended) return;   // guard: ignore any duplicate end events
    ended = true;
    onEnd?.();
  };

  utterance.onerror = (e) => {
    // 'interrupted' is expected when we cancel mid-speech — not a real error
    if (e.error === 'interrupted') return;
    if (ended) return;
    ended = true;
    onEnd?.();
  };
  
  // 7. Speak
  window.speechSynthesis.speak(utterance);
}
