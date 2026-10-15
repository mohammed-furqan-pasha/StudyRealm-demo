import { createContext, useContext } from 'react';
import { TIME_SCALE } from './stageScenes';

export type Tier = 'full' | 'lite' | 'minimal';

export const TIER_SCALE: Record<Tier, number> = {
  full: 1,
  lite: 0.75,
  minimal: 0.5,
};

export const getEffectiveTimeScale = (tier: Tier, baseTimeScale: number = TIME_SCALE): number => {
  return baseTimeScale * (TIER_SCALE[tier] ?? 1);
};

export function downgradeTier(tier: Tier): Tier {
  if (tier === 'full') return 'lite';
  return 'minimal';
}

export interface QualityContextType {
  tier: Tier;
}

export const QualityContext = createContext<QualityContextType>({ tier: 'full' });
export const useQuality = () => useContext(QualityContext);

export const SESSION_QUALITY_KEY = 'sr_quality';
export const SESSION_MONITORED_COUNT_KEY = 'sr_quality_monitored_count';

export function detectTier(): Tier {
  if (typeof window === 'undefined') return 'full';

  // 1. URL parameter overrides everything: ?quality=full|lite|minimal (stored in sessionStorage)
  try {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('quality');
    if (q === 'full' || q === 'lite' || q === 'minimal') {
      try {
        sessionStorage.setItem(SESSION_QUALITY_KEY, q);
      } catch {}
      return q;
    }
  } catch {}

  // 2. prefers-reduced-motion: reduce -> 'minimal'
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return 'minimal';
    }
  } catch {}

  // 3. Stored session downgrade is respected
  try {
    const stored = sessionStorage.getItem(SESSION_QUALITY_KEY);
    if (stored === 'full' || stored === 'lite' || stored === 'minimal') {
      return stored;
    }
  } catch {}

  // 4. Low-end hardware / network detection -> 'lite'
  try {
    // navigator.hardwareConcurrency <= 4
    if (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4) {
      return 'lite';
    }

    // navigator.deviceMemory <= 4
    const devMem = (navigator as any).deviceMemory;
    if (typeof devMem === 'number' && devMem <= 4) {
      return 'lite';
    }

    // connection.saveData or effectiveType '2g' or '3g'
    const conn = (navigator as any).connection;
    if (conn) {
      if (conn.saveData === true) return 'lite';
      const et = conn.effectiveType;
      if (et === '2g' || et === 'slow-2g' || et === '3g') {
        return 'lite';
      }
    }
  } catch {}

  return 'full';
}
