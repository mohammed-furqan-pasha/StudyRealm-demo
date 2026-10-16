import { preloadVoices, describeVoiceChoice } from './tts';
import { detectTier } from './quality';

export const DIAGNOSTICS_ENABLED = true;
export const INCLUDE_DEVICE_INFO_FOR_STUDENT_ROLE = true;

const FALLBACK_ENDPOINT = 'https://script.google.com/macros/s/AKfycbydtyFaM1VYGakvHhV7Fa1gpbh0WX5PRgh_fFQSdWmigxh1yv2JkOBbuPcHvjJyUW00/exec';
const DIAG_ENDPOINT = process.env.NEXT_PUBLIC_DIAG_ENDPOINT || FALLBACK_ENDPOINT;

function getQueryParam(param: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
  } catch {
    return null;
  }
}

function getSessionId(): string {
  const key = 'sr_diag_session';
  try {
    const existing = sessionStorage.getItem(key);
    if (existing && existing.length === 12) return existing;
  } catch {}

  let str = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(12);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
    for (let i = 0; i < 12; i++) {
      str += chars[bytes[i] % chars.length];
    }
  } else {
    for (let i = 0; i < 12; i++) {
      str += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  try {
    sessionStorage.setItem(key, str);
  } catch {}
  return str;
}

function joinUnderLimit(items: string[], separator: string, limit: number): string {
  const result: string[] = [];
  let totalLen = 0;
  for (const item of items) {
    const addedLen = result.length === 0 ? item.length : separator.length + item.length;
    if (totalLen + addedLen <= limit) {
      result.push(item);
      totalLen += addedLen;
    } else {
      break;
    }
  }
  return result.join(separator);
}

function getBrowserInfo(): string {
  if (typeof navigator === 'undefined') return '';
  const uad = (navigator as any).userAgentData;
  if (uad && Array.isArray(uad.brands)) {
    const brand = uad.brands.find((b: any) =>
      !b.brand.includes('Chromium') &&
      !b.brand.toLowerCase().includes('not') &&
      !b.brand.toLowerCase().includes('brand')
    ) || uad.brands[0];
    if (brand) {
      return `${brand.brand} ${brand.version}`;
    }
  }
  const ua = navigator.userAgent || '';
  if (/Edg(?:e|A|iOS)?\/(\d+)/i.test(ua)) {
    const match = ua.match(/Edg(?:e|A|iOS)?\/(\d+)/i);
    return `Edge ${match ? match[1] : ''}`.trim();
  }
  if (/SamsungBrowser\/(\d+)/i.test(ua)) {
    const match = ua.match(/SamsungBrowser\/(\d+)/i);
    return `Samsung Internet ${match ? match[1] : ''}`.trim();
  }
  if (/Firefox\/(\d+)/i.test(ua)) {
    const match = ua.match(/Firefox\/(\d+)/i);
    return `Firefox ${match ? match[1] : ''}`.trim();
  }
  if (/Chrome\/(\d+)/i.test(ua)) {
    const match = ua.match(/Chrome\/(\d+)/i);
    return `Chrome ${match ? match[1] : ''}`.trim();
  }
  if (/Version\/(\d+).*Safari/i.test(ua)) {
    const match = ua.match(/Version\/(\d+)/i);
    return `Safari ${match ? match[1] : ''}`.trim();
  }
  return '';
}

async function getOSInfo(): Promise<string> {
  if (typeof navigator === 'undefined') return '';
  const ua = navigator.userAgent || '';
  const uad = (navigator as any).userAgentData;

  if (uad && typeof uad.getHighEntropyValues === 'function') {
    try {
      const he = await uad.getHighEntropyValues(['platform', 'platformVersion']);
      if (he.platform === 'Android' && he.platformVersion) {
        const major = he.platformVersion.split('.')[0];
        return `Android ${major}`;
      }
      if (he.platform === 'Windows' && he.platformVersion) {
        const major = parseInt(he.platformVersion.split('.')[0], 10);
        return major >= 13 ? 'Windows 11' : 'Windows 10';
      }
      if (he.platform) {
        return he.platform;
      }
    } catch {}
  }

  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Android/i.test(ua)) {
    const match = ua.match(/Android\s+([0-9]+)/i);
    return match ? `Android ${match[1]}` : 'Android';
  }
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'macOS';
  if (/CrOS/i.test(ua)) return 'ChromeOS';
  if (/Linux/i.test(ua)) return 'Linux';
  return '';
}

function getDeviceFamily(): string {
  if (typeof navigator === 'undefined') return 'Other';
  const ua = navigator.userAgent || '';
  const uad = (navigator as any).userAgentData;
  const isMobile = uad?.mobile ?? (/Mobi|Android/i.test(ua));

  if (/iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return 'iPad';
  }
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/Android/i.test(ua)) {
    return isMobile && !/Tablet/i.test(ua) ? 'Android phone' : 'Android tablet';
  }
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'Mac';
  if (/CrOS/i.test(ua)) return 'ChromeOS';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Other';
}

async function getModel(isStudent: boolean): Promise<string> {
  if (isStudent && !INCLUDE_DEVICE_INFO_FOR_STUDENT_ROLE) return '';
  if (typeof window === 'undefined' || !window.isSecureContext) return '';
  const uad = (navigator as any).userAgentData;
  if (uad && typeof uad.getHighEntropyValues === 'function') {
    try {
      const he = await uad.getHighEntropyValues(['model']);
      return he.model || '';
    } catch {}
  }
  return '';
}

function getScreen(isStudent: boolean): string {
  if (isStudent && !INCLUDE_DEVICE_INFO_FOR_STUDENT_ROLE) return '';
  if (typeof window === 'undefined' || !window.screen) return '';
  const w = Math.round(window.screen.width / 10) * 10;
  const h = Math.round(window.screen.height / 10) * 10;
  return `${w}x${h}`;
}

function getDpr(): number {
  if (typeof window === 'undefined') return 1;
  const dpr = window.devicePixelRatio || 1;
  return Math.round(dpr * 2) / 2;
}

function getInApp(): string {
  if (typeof navigator === 'undefined') return '';
  const ua = navigator.userAgent || '';
  if (/FBAN|FBAV/i.test(ua)) return 'facebook';
  if (/Instagram/i.test(ua)) return 'instagram';
  if (/;\s*wv\)/i.test(ua)) return 'android-webview';
  if (/iPhone|iPad|iPod/i.test(ua) && /AppleWebKit/i.test(ua) && !/Safari\//i.test(ua)) {
    return 'ios-webview';
  }
  return '';
}

export async function collectVoiceDiagnostics(role: string): Promise<void> {
  if (!DIAGNOSTICS_ENABLED) return;
  if (!DIAG_ENDPOINT) return;

  if (typeof window === 'undefined') return;

  try {
    if (sessionStorage.getItem('sr_diag_sent')) return;
  } catch {
    return;
  }

  if (typeof navigator !== 'undefined') {
    if (navigator.doNotTrack === '1') return;
    if ((navigator as any).globalPrivacyControl === true) return;
  }

  if (getQueryParam('nodiag') !== null) return;

  // Wait for voices: await preloadVoices() with a 3s timeout
  await Promise.race([
    preloadVoices(),
    new Promise(resolve => setTimeout(resolve, 3000)),
  ]);

  const choice = describeVoiceChoice();
  const formatVoice = (v: { name: string; lang: string; localService: boolean }) =>
    `${v.name} (${v.lang}, ${v.localService ? 'L' : 'R'})`;

  // voicesEn: chosen voice first, then en-IN voices, then the rest
  const isEnLang = (lang: string) => {
    const l = lang.toLowerCase().replace('_', '-');
    return l === 'en' || l.startsWith('en-');
  };
  const isEnInLang = (lang: string) => {
    const l = lang.toLowerCase().replace('_', '-');
    return l === 'en-in' || l.startsWith('en-in');
  };

  const enVoices = choice.voices.filter(v => isEnLang(v.lang));
  const orderedEnVoices: { name: string; lang: string; localService: boolean }[] = [];
  const added = new Set<string>();

  if (choice.chosen && isEnLang(choice.chosen.lang)) {
    const key = `${choice.chosen.name}|${choice.chosen.lang}`;
    orderedEnVoices.push(choice.chosen);
    added.add(key);
  }

  for (const v of enVoices) {
    const key = `${v.name}|${v.lang}`;
    if (isEnInLang(v.lang) && !added.has(key)) {
      orderedEnVoices.push(v);
      added.add(key);
    }
  }

  for (const v of enVoices) {
    const key = `${v.name}|${v.lang}`;
    if (!added.has(key)) {
      orderedEnVoices.push(v);
      added.add(key);
    }
  }

  const voicesEn = joinUnderLimit(orderedEnVoices.map(formatVoice), '; ', 1500);

  // voicesIndic: lang starts with hi, kn, ta, te, ml, mr, bn, gu, or pa
  const indicPrefixes = ['hi', 'kn', 'ta', 'te', 'ml', 'mr', 'bn', 'gu', 'pa'];
  const indicVoices = choice.voices.filter(v => {
    const l = v.lang.toLowerCase();
    return indicPrefixes.some(prefix => l.startsWith(prefix));
  });
  const voicesIndic = joinUnderLimit(indicVoices.map(formatVoice), '; ', 800);

  // langs: distinct lang codes joined with ',' under 300 chars
  const distinctLangs = Array.from(new Set(choice.voices.map(v => v.lang)));
  const langs = joinUnderLimit(distinctLangs, ',', 300);

  const isStudent = (role || '').trim().toLowerCase() === 'student';
  const browser = getBrowserInfo();
  const os = await getOSInfo();
  const deviceFamily = getDeviceFamily();
  const model = await getModel(isStudent);
  const screen = getScreen(isStudent);
  const dpr = getDpr();
  const inApp = getInApp();
  const tier = detectTier();
  const ua = model ? '' : (typeof navigator !== 'undefined' ? (navigator.userAgent || '').slice(0, 200) : '');

  const payload = {
    formType: 'voice_diag' as const,
    session: getSessionId(),
    app: 'demo' as const,
    role: role || '',
    voiceName: choice.chosen ? choice.chosen.name : '',
    voiceLang: choice.chosen ? choice.chosen.lang : '',
    local: choice.chosen ? choice.chosen.localService : false,
    hasEnIN: choice.hasEnIN,
    voicesEn,
    voicesIndic,
    langs,
    voiceCount: choice.voices.length,
    browser,
    os,
    deviceFamily,
    model,
    screen,
    dpr,
    inApp,
    tier,
    ua,
  };

  if (process.env.NODE_ENV !== 'production') {
    console.info('[voice_diag] Dispatching payload to:', DIAG_ENDPOINT, payload);
  }

  try {
    fetch(DIAG_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      keepalive: true,
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
      },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch {}

  try {
    sessionStorage.setItem('sr_diag_sent', '1');
  } catch {}
}
