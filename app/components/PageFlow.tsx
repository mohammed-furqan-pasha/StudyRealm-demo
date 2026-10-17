'use client';
import { createContext, useContext, useState, useEffect, useLayoutEffect, useMemo, useRef, forwardRef, useImperativeHandle, useCallback, ReactNode } from 'react';
import { LazyMotion, domAnimation, m, MotionConfig, useReducedMotion } from 'motion/react';
import Stage from './Stage';
import { isStaged, isStageMode, isFadeMode, PAIR_TIMING, PHONE_TIMING, TIME_SCALE, ARRIVAL_ENABLED, ARRIVAL_TIMING } from '../lib/stageScenes';
import {
  detectTier,
  Tier,
  TIER_SCALE,
  QualityContext,
  downgradeTier,
  SESSION_QUALITY_KEY,
  SESSION_MONITORED_COUNT_KEY,
} from '../lib/quality';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const EDGE_PX = 2;
const SWIPE_MIN = 56;
const SWIPE_RATIO = 1.2;
const EDGE_ZONE = 24;
const NAV_UNLOCK_CAP_MS = 900;

interface Page {
  id: string;
  label: string;
  node: ReactNode;
  hideNext?: boolean;
  gestures?: boolean;
}

export type TextPhase = 'hidden' | 'enter' | 'leave' | 'done';

interface PagerContextType {
  goTo: (id: string) => void;
  next: () => void;
  prev: () => void;
  index: number;
  id: string;
}

const PagerContext = createContext<PagerContextType | null>(null);

export const usePager = () => {
  const ctx = useContext(PagerContext);
  if (!ctx) throw new Error('usePager must be used within PageFlow');
  return ctx;
};

export interface PageStateContextType {
  isCurrent: boolean;
  direction: 1 | -1;
  axis: 'x' | 'y';
  staged?: boolean;
  desktop?: boolean;
  textDelayMs?: number;
  isLeaving?: boolean;
  transitionId?: number;
  transitionDir?: 1 | -1;
  choreographed?: boolean;
}

export const PageStateContext = createContext<PageStateContextType>({
  isCurrent: true,
  direction: 1,
  axis: 'y',
  staged: false,
  textDelayMs: 250,
  isLeaving: false,
  transitionId: 0,
  transitionDir: 1,
  choreographed: false,
});

export const usePageState = () => useContext(PageStateContext);

interface PageStateProviderProps {
  isCurrent: boolean;
  direction: 1 | -1;
  axis: 'x' | 'y';
  staged?: boolean;
  desktop?: boolean;
  textDelayMs?: number;
  isLeaving?: boolean;
  transitionId?: number;
  transitionDir?: 1 | -1;
  choreographed?: boolean;
  children: ReactNode;
}

function PageStateProvider({
  isCurrent,
  direction,
  axis,
  staged,
  desktop,
  textDelayMs,
  isLeaving,
  transitionId,
  transitionDir,
  choreographed,
  children,
}: PageStateProviderProps) {
  const value = useMemo(
    () => ({
      isCurrent,
      direction,
      axis,
      staged,
      desktop,
      textDelayMs,
      isLeaving,
      transitionId,
      transitionDir,
      choreographed,
    }),
    [
      isCurrent,
      direction,
      axis,
      staged,
      desktop,
      textDelayMs,
      isLeaving,
      transitionId,
      transitionDir,
      choreographed,
    ]
  );

  return (
    <PageStateContext.Provider value={value}>
      {children}
    </PageStateContext.Provider>
  );
}

export interface PageFlowHandle {
  goTo: (id: string) => void;
}

interface PageFlowProps {
  pages: Page[];
  locked?: boolean;
}

const canScrollInDirection = (target: EventTarget | null, pageEl: HTMLElement, dir: number) => {
  let el = target as HTMLElement | null;
  while (el && el !== document.body && el !== document.documentElement) {
    if (el.scrollHeight > el.clientHeight + 1) {
      const style = window.getComputedStyle(el);
      const overflow = style.overflowY;
      if (overflow === 'auto' || overflow === 'scroll') {
        if (dir > 0) {
          if (el.scrollTop + el.clientHeight < el.scrollHeight - EDGE_PX) return true;
        } else if (dir < 0) {
          if (el.scrollTop > EDGE_PX) return true;
        }
      }
    }
    if (el === pageEl) break;
    el = el.parentElement;
  }
  return false;
};

const canScrollXInDirection = (target: EventTarget | null, pageEl: HTMLElement, dir: number) => {
  let el = target as HTMLElement | null;
  while (el && el !== document.body && el !== document.documentElement) {
    if (el.scrollWidth > el.clientWidth + 1) {
      const style = window.getComputedStyle(el);
      const overflow = style.overflowX;
      if (overflow === 'auto' || overflow === 'scroll') {
        if (dir > 0) {
          if (el.scrollLeft + el.clientWidth < el.scrollWidth - EDGE_PX) return true;
        } else if (dir < 0) {
          if (el.scrollLeft > EDGE_PX) return true;
        }
      }
    }
    if (el === pageEl) break;
    el = el.parentElement;
  }
  return false;
};

interface TransitionState {
  id: number;
  fromId: string;
  toId: string;
  dir: 1 | -1;
  choreographed: boolean;
}

const PageFlow = forwardRef<PageFlowHandle, PageFlowProps>(({ pages, locked }, ref) => {
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isStagedNav, setIsStagedNav] = useState(false);
  const [leavingId, setLeavingId] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Quality tier state (SSR default 'full', set in layout effect before first transition)
  const [tier, setTier] = useState<Tier>('full');
  const tierRef = useRef<Tier>(tier);
  tierRef.current = tier;

  useIsomorphicLayoutEffect(() => {
    const initialTier = detectTier();
    setTier(initialTier);
    tierRef.current = initialTier;
  }, []);

  const effectiveTimeScale = isDesktop ? (TIME_SCALE * (TIER_SCALE[tier] ?? 1)) : TIME_SCALE;

  // Frame monitor for desktop: runs during the first two choreographed transitions of the session
  const monitoredTransitionsRef = useRef<number>(0);
  useIsomorphicLayoutEffect(() => {
    try {
      const storedCount = sessionStorage.getItem(SESSION_MONITORED_COUNT_KEY);
      if (storedCount) {
        monitoredTransitionsRef.current = parseInt(storedCount, 10) || 0;
      }
    } catch {}
  }, []);

  const activeMonitorCleanupRef = useRef<(() => void) | null>(null);

  // Text phase: Record<pageId, 'hidden' | 'enter' | 'leave' | 'done'>
  const [textPhase, setTextPhase] = useState<Record<string, TextPhase>>(() => {
    const initial: Record<string, TextPhase> = {};
    pages.forEach((p, i) => {
      initial[p.id] = (!locked && i === 0) ? 'enter' : 'hidden';
    });
    return initial;
  });
  const textPhaseRef = useRef(textPhase);

  // Settled state for active page text animations: Record<pageId, boolean>
  const [settled, setSettled] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    pages.forEach((p) => {
      initial[p.id] = false;
    });
    return initial;
  });
  const settledRef = useRef(settled);
  settledRef.current = settled;

  const settleTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const settleRafsRef = useRef<number[]>([]);

  const clearSettleTimers = () => {
    settleTimersRef.current.forEach((t) => clearTimeout(t));
    settleTimersRef.current = [];
    settleRafsRef.current.forEach((r) => cancelAnimationFrame(r));
    settleRafsRef.current = [];
  };

  const [textNavTiming, setTextNavTiming] = useState<{ dir: 1 | -1; delay: string }>({
    dir: 1,
    delay: locked ? '0ms' : '300ms',
  });

  const pagesRef = useRef(pages);
  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  const prevLockedRef = useRef(locked);
  useEffect(() => {
    if (prevLockedRef.current && !locked) {
      clearSettleTimers();
      setSettled((prev) => ({ ...prev, hero: false }));
      settledRef.current.hero = false;

      const currentPages = pagesRef.current;
      const currentId = currentPages[indexRef.current]?.id;
      if (currentId && currentId !== 'hero') {
        setSettled((prev) => ({ ...prev, [currentId]: false }));
        settledRef.current[currentId] = false;
      }

      const isHeroArrival = isDesktop && ARRIVAL_ENABLED && !shouldReduceMotion && tier !== 'minimal' && currentId === 'hero';

      if (isHeroArrival) {
        const nextId = ++transitionCounterRef.current;
        if (currentId) {
          setEnteredAt((prev) => ({ ...prev, [currentId]: nextId }));
        }
        setIsArriving(true);

        const nextPhases: Record<string, TextPhase> = {};
        currentPages.forEach((p) => {
          nextPhases[p.id] = p.id === currentId ? 'enter' : 'hidden';
        });
        textPhaseRef.current = nextPhases;
        setTextPhase(nextPhases);

        const arrivalTextDelayMs = Math.round(ARRIVAL_TIMING.textDelayMs * effectiveTimeScale);
        setTextNavTiming({
          dir: 1,
          delay: `${arrivalTextDelayMs}ms`,
        });

        const arrivalTotalMs = Math.round(ARRIVAL_TIMING.totalMs * effectiveTimeScale);
        const arrivalUnlockMs = Math.round(arrivalTotalMs * 0.85);

        transRef.current = true;
        wheelActiveDuringLockRef.current = true;

        clearTransitionTimers();

        const tUnlock = setTimeout(() => {
          transRef.current = false;
        }, arrivalUnlockMs);

        const tEnd = setTimeout(() => {
          setIsArriving(false);
        }, arrivalTotalMs);

        timersRef.current = [tUnlock, tEnd];
      } else {
        if (currentId) {
          setEnteredAt((prev) => ({ ...prev, [currentId]: 0 }));
        }
        const nextPhases: Record<string, TextPhase> = {};
        currentPages.forEach((p) => {
          nextPhases[p.id] = p.id === currentId ? 'enter' : 'hidden';
        });
        textPhaseRef.current = nextPhases;
        setTextPhase(nextPhases);
        setTextNavTiming({
          dir: 1,
          delay: '300ms',
        });
        setIsArriving(false);
      }
    } else if (!prevLockedRef.current && locked) {
      clearSettleTimers();
      const currentPages = pagesRef.current;
      const nextPhases: Record<string, TextPhase> = {};
      currentPages.forEach((p) => {
        nextPhases[p.id] = 'hidden';
      });
      textPhaseRef.current = nextPhases;
      setTextPhase(nextPhases);
      setIsArriving(false);
      clearTransitionTimers();
      setIsTransitioning(false);
      setIsStagedNav(false);
      transRef.current = false;
      pendingNavRef.current = null;
    }
    prevLockedRef.current = locked;
  }, [locked, isDesktop, shouldReduceMotion]);

  // Transition object: { id, fromId, toId, dir }
  const transitionCounterRef = useRef(0);
  const [transition, setTransition] = useState<TransitionState>(() => ({
    id: 0,
    fromId: pages[0]?.id || '',
    toId: pages[0]?.id || '',
    dir: 1,
    choreographed: false,
  }));
  const transitionRef = useRef(transition);
  useEffect(() => {
    transitionRef.current = transition;
  }, [transition]);

  const [enteredAt, setEnteredAt] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    pages.forEach((p) => {
      initial[p.id] = 0;
    });
    return initial;
  });
  const [stagePrevId, setStagePrevId] = useState<string | null>(null);
  const [isArriving, setIsArriving] = useState(false);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTransitionTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    if (activeMonitorCleanupRef.current) {
      activeMonitorCleanupRef.current();
      activeMonitorCleanupRef.current = null;
    }
  };

  const wheelQuietTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelActiveDuringLockRef = useRef(false);

  useEffect(() => {
    return () => {
      clearTransitionTimers();
      clearSettleTimers();
      transRef.current = false;
      pendingNavRef.current = null;
      if (wheelQuietTimerRef.current) {
        clearTimeout(wheelQuietTimerRef.current);
        wheelQuietTimerRef.current = null;
      }
    };
  }, []);

  const scrollRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const indexRef = useRef(index);
  const transRef = useRef(false);
  const lockedRef = useRef(locked);
  const isDesktopRef = useRef(isDesktop);
  const pendingIsDesktopRef = useRef<boolean | null>(null);
  const pendingNavRef = useRef<string | null>(null);

  const goToRef = useRef<(id: string) => void>(() => {});
  const nextRef = useRef<() => void>(() => {});
  const prevRef = useRef<() => void>(() => {});

  indexRef.current = index;
  lockedRef.current = locked;
  isDesktopRef.current = isDesktop;
  pagesRef.current = pages;

  useEffect(() => { indexRef.current = index; }, [index]);
  useEffect(() => { lockedRef.current = locked; }, [locked]);
  useEffect(() => { isDesktopRef.current = isDesktop; }, [isDesktop]);

  // MatchMedia for navigation axis (Desktop: >= 768px vertical, Mobile: < 768px horizontal)
  useIsomorphicLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(min-width: 768px)');
    
    const updateAxis = (matches: boolean) => {
      if (transRef.current) {
        pendingIsDesktopRef.current = matches;
      } else {
        setIsDesktop(matches);
        isDesktopRef.current = matches;
        pendingIsDesktopRef.current = null;
      }
    };

    updateAxis(mql.matches);

    const handler = (e: MediaQueryListEvent) => {
      updateAxis(e.matches);
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);


  const goTo = (id: string) => {
    if (lockedRef.current) return;
    const currentPages = pagesRef.current;
    const targetIndex = currentPages.findIndex(p => p.id === id);
    if (targetIndex === -1 || targetIndex === indexRef.current) return;

    if (transRef.current) {
      pendingNavRef.current = id;
      return;
    }

    if (pendingIsDesktopRef.current !== null) {
      setIsDesktop(pendingIsDesktopRef.current);
      isDesktopRef.current = pendingIsDesktopRef.current;
      pendingIsDesktopRef.current = null;
    }

    const fromId = currentPages[indexRef.current]?.id;
    const toId = currentPages[targetIndex]?.id;
    const isDesktopNav = isDesktopRef.current;
    // On desktop and mobile, all transitions between stage and fade modes run through the choreographed path
    const isChoreographed = isDesktopNav
      ? (isStageMode(fromId) || isFadeMode(fromId)) && (isStageMode(toId) || isFadeMode(toId))
      : (isStageMode(fromId) || isFadeMode(fromId)) && (isStageMode(toId) || isFadeMode(toId));
    const isFwd = targetIndex > indexRef.current;

    clearTransitionTimers();
    clearSettleTimers();

      // goTo sets settled[toId] = false and settled[fromId] = false
      setSettled((prev) => {
        const next = { ...prev };
        if (toId) next[toId] = false;
        if (fromId) next[fromId] = false;
        return next;
      });
      if (toId) settledRef.current[toId] = false;
      if (fromId) settledRef.current[fromId] = false;

      const nextId = ++transitionCounterRef.current;
      const thisTransId = nextId;
      const newTransition: TransitionState = {
        id: nextId,
        fromId: fromId || '',
        toId: toId || '',
        dir: isFwd ? 1 : -1,
        choreographed: isChoreographed,
      };
      transitionRef.current = newTransition;
      setTransition(newTransition);

      if (toId) {
        setEnteredAt((prev) => ({ ...prev, [toId]: nextId }));
      }
      setStagePrevId(fromId || null);
      setIsArriving(false);

      if (isChoreographed) {
        // CHOREOGRAPHED PATH (desktop all, mobile hero <-> aha)
        const isFadeTransition = isFadeMode(fromId) || isFadeMode(toId);
        const timingKey = isFwd ? 'fwd' : 'back';
        const stagedTiming = isDesktopNav ? PAIR_TIMING[timingKey] : PHONE_TIMING[timingKey];

        // Synchronously update textPhase and textNavTiming for desktop
        const nextPhases: Record<string, TextPhase> = {};
        currentPages.forEach((p) => {
          if (p.id === toId) {
            nextPhases[p.id] = 'enter';
          } else if (p.id === fromId) {
            nextPhases[p.id] = 'leave';
          } else {
            nextPhases[p.id] = 'hidden';
          }
        });
        textPhaseRef.current = nextPhases;
        setTextPhase(nextPhases);

        const navEffectiveTimeScale = isDesktopNav ? (TIME_SCALE * (TIER_SCALE[tierRef.current] ?? 1)) : TIME_SCALE;
        const desktopDelayMs = Math.round(PAIR_TIMING[timingKey].textDelayMs * navEffectiveTimeScale);
        setTextNavTiming({
          dir: isFwd ? 1 : -1,
          delay: `${desktopDelayMs}ms`,
        });

        // Timing: desktop vs phone vs reduced motion / minimal
        let totalMs: number;
        let unlockMs: number;
        let leaveDurationMs: number;

        const isMinimalOrReduced = shouldReduceMotion || (isDesktopNav && tierRef.current === 'minimal');

        if (isMinimalOrReduced) {
          totalMs = 300;
          unlockMs = 300;
          leaveDurationMs = 300;
        } else if (isDesktopNav) {
          const rawTextDelayMs = PAIR_TIMING[timingKey].textDelayMs;
          const computedUnlockMs = Math.round((rawTextDelayMs + 700) * navEffectiveTimeScale);
          unlockMs = Math.min(computedUnlockMs, Math.round(NAV_UNLOCK_CAP_MS * navEffectiveTimeScale));
          totalMs = computedUnlockMs + Math.round(1000 * navEffectiveTimeScale);
          if (isFadeMode(fromId)) {
            leaveDurationMs = Math.round(450 * navEffectiveTimeScale);
          } else {
            leaveDurationMs = Math.round(520 * navEffectiveTimeScale);
          }
        } else {
          // stage <-> stage desktop or phone (phone fallback)
          totalMs = Math.round(stagedTiming.totalMs * TIME_SCALE);
          unlockMs = Math.round(PHONE_TIMING[timingKey].unlockMs * TIME_SCALE);
          leaveDurationMs = Math.round(320 * TIME_SCALE);
        }

        // Frame monitor: first 2 choreographed transitions of session
        const shouldMonitor = isDesktopNav && monitoredTransitionsRef.current < 2 && tierRef.current !== 'minimal';
        if (shouldMonitor) {
          if (activeMonitorCleanupRef.current) {
            activeMonitorCleanupRef.current();
            activeMonitorCleanupRef.current = null;
          }

          let monitorRafId: number | null = null;
          let lastTime = performance.now();
          let frameCount = 0;
          let dropCount = 0;

          const onFrame = (now: number) => {
            const delta = now - lastTime;
            lastTime = now;
            frameCount++;
            if (delta > 33) {
              dropCount++;
            }
            monitorRafId = requestAnimationFrame(onFrame);
          };
          monitorRafId = requestAnimationFrame(onFrame);

          activeMonitorCleanupRef.current = () => {
            if (monitorRafId !== null) {
              cancelAnimationFrame(monitorRafId);
              monitorRafId = null;
            }
            monitoredTransitionsRef.current += 1;
            try {
              sessionStorage.setItem(SESSION_MONITORED_COUNT_KEY, String(monitoredTransitionsRef.current));
            } catch {}

            if (frameCount > 5) {
              const dropRate = dropCount / frameCount;
              if (dropRate > 0.15) {
                const currentTier = tierRef.current;
                const nextTier = downgradeTier(currentTier);
                if (nextTier !== currentTier) {
                  tierRef.current = nextTier;
                  setTier(nextTier);
                  try {
                    sessionStorage.setItem(SESSION_QUALITY_KEY, nextTier);
                  } catch {}
                }
              }
            }
          };
        }

        setPrevIndex(indexRef.current);
        setIndex(targetIndex);
        setIsTransitioning(true);
        setIsStagedNav(true);
        setLeavingId(fromId);
        transRef.current = true;
        wheelActiveDuringLockRef.current = true;
        if (isDesktopNav) {
          window.dispatchEvent(new Event('scroll'));
        }

        // 1. Outgoing wrapper stays visible for leaveDurationMs
        const t1 = setTimeout(() => {
          if (transitionRef.current.id !== thisTransId) return;
          setLeavingId((cur) => (cur === fromId ? null : cur));
          if (!isDesktopNav) {
            window.dispatchEvent(new Event('scroll'));
          }
        }, leaveDurationMs);

        // 2. Input lock: unlockMs (85% of totalMs on desktop)
        const t2 = setTimeout(() => {
          if (transitionRef.current.id !== thisTransId) return;
          transRef.current = false;
          setStagePrevId(null);

          const pendingId = pendingNavRef.current;
          pendingNavRef.current = null;
          if (pendingId) {
            const curPages = pagesRef.current;
            const pIdx = curPages.findIndex((p) => p.id === pendingId);
            if (pIdx !== -1 && pIdx !== indexRef.current) {
              goToRef.current(pendingId);
            }
          }
        }, unlockMs);

        // 3. Total duration / at rest: totalMs
        const t3 = setTimeout(() => {
          if (transitionRef.current.id !== thisTransId) return;
          if (activeMonitorCleanupRef.current) {
            activeMonitorCleanupRef.current();
            activeMonitorCleanupRef.current = null;
          }
          setIsTransitioning(false);
          setIsStagedNav(false);
          transRef.current = false;
          if (scrollRefs.current[targetIndex]) {
            scrollRefs.current[targetIndex]!.scrollTop = 0;
          }
          window.dispatchEvent(new Event('scroll'));

          if (pendingIsDesktopRef.current !== null) {
            setIsDesktop(pendingIsDesktopRef.current);
            isDesktopRef.current = pendingIsDesktopRef.current;
            pendingIsDesktopRef.current = null;
          }
        }, totalMs);

        timersRef.current = [t1, t2, t3];
      } else {
        // LEGACY PATH (unchanged)
        const transLockMs = (isFwd ? 650 : 550) + 120; // 770ms or 670ms

        setPrevIndex(indexRef.current);
        setIndex(targetIndex);
        setIsTransitioning(true);
        setIsStagedNav(false);
        setLeavingId(null);
        transRef.current = true;
        wheelActiveDuringLockRef.current = true;
        window.dispatchEvent(new Event('scroll'));

        const tLegacy = setTimeout(() => {
          if (transitionRef.current.id !== thisTransId) return;
          setIsTransitioning(false);
          transRef.current = false;
          setStagePrevId(null);

          const pendingId = pendingNavRef.current;
          pendingNavRef.current = null;
          if (pendingId) {
            const curPages = pagesRef.current;
            const pIdx = curPages.findIndex((p) => p.id === pendingId);
            if (pIdx !== -1 && pIdx !== indexRef.current) {
              goToRef.current(pendingId);
            }
          }

          if (scrollRefs.current[targetIndex]) {
            scrollRefs.current[targetIndex]!.scrollTop = 0;
          }
          window.dispatchEvent(new Event('scroll'));

          if (pendingIsDesktopRef.current !== null) {
            setIsDesktop(pendingIsDesktopRef.current);
            isDesktopRef.current = pendingIsDesktopRef.current;
            pendingIsDesktopRef.current = null;
          }
        }, transLockMs);

        timersRef.current = [tLegacy];
      }
  };

  const next = () => {
    const currentPages = pagesRef.current;
    if (indexRef.current < currentPages.length - 1) {
      goToRef.current(currentPages[indexRef.current + 1].id);
    }
  };

  const prev = () => {
    const currentPages = pagesRef.current;
    if (indexRef.current > 0) {
      goToRef.current(currentPages[indexRef.current - 1].id);
    }
  };

  goToRef.current = goTo;
  nextRef.current = next;
  prevRef.current = prev;

  useImperativeHandle(ref, () => ({ goTo: (id: string) => goToRef.current(id) }), []);

  const markSettled = useCallback((pageId: string) => {
    setSettled((prev) => {
      if (prev[pageId]) return prev;
      return { ...prev, [pageId]: true };
    });
    settledRef.current[pageId] = true;
  }, []);

  const runSettleCheck = useCallback((isRetry = false) => {
    if (!isDesktopRef.current || lockedRef.current) return;
    const currentPages = pagesRef.current;
    const activeIdx = indexRef.current;
    const activePage = currentPages[activeIdx];
    if (!activePage) return;
    const activeId = activePage.id;

    if (settledRef.current[activeId]) return;

    const wrapper = scrollRefs.current[activeIdx];
    if (!wrapper) return;

    const checkTransId = transitionRef.current.id;

    const rawAnims: any[] = typeof (wrapper as any).getAnimations === 'function'
      ? (wrapper as any).getAnimations({ subtree: true })
      : [];
    const anims = rawAnims.filter(
      (a) => a.animationName && /^st(Word|Reveal)(In|Out)$/.test(a.animationName)
    );

    const hasStElements = wrapper.querySelector('.st-word, .st-reveal') !== null;

    if (anims.length === 0) {
      if (hasStElements && !isRetry) {
        // Elements exist but animations are not yet registered at the first check:
        // Recheck after the longest delay instead of settling early
        const navEffectiveTimeScale = TIME_SCALE * (TIER_SCALE[tierRef.current] ?? 1);
        const longestDelay = Math.round(2200 * navEffectiveTimeScale);
        const retryTimer = setTimeout(() => {
          if (transitionRef.current.id !== checkTransId) return;
          runSettleCheck(true);
        }, longestDelay);
        settleTimersRef.current.push(retryTimer);
        return;
      }
      markSettled(activeId);
      return;
    }

    Promise.allSettled(anims.map((a) => a.finished)).then(() => {
      if (transitionRef.current.id !== checkTransId) return;
      markSettled(activeId);
    });

    let maxEndTime = 0;
    for (const a of anims) {
      const timing = a.effect?.getComputedTiming?.();
      const end = typeof timing?.endTime === 'number' ? timing.endTime : 0;
      const current = typeof a.currentTime === 'number' ? a.currentTime : 0;
      const remaining = Math.max(0, end - current);
      if (remaining > maxEndTime) {
        maxEndTime = remaining;
      }
    }

    const navEffectiveTimeScale = TIME_SCALE * (TIER_SCALE[tierRef.current] ?? 1);
    const upperLimitMs = Math.round(3500 * navEffectiveTimeScale);
    const safetyDelay = Math.max(upperLimitMs, maxEndTime + 400);

    const safetyTimer = setTimeout(() => {
      if (transitionRef.current.id !== checkTransId) return;
      // It must never fire while any entrance animation of that page is still running
      const currentRaw: any[] = typeof (wrapper as any).getAnimations === 'function'
        ? (wrapper as any).getAnimations({ subtree: true })
        : [];
      const stillRunning = currentRaw.filter(
        (a) => a.animationName && /^st(Word|Reveal)(In|Out)$/.test(a.animationName) && a.playState === 'running'
      );
      if (stillRunning.length > 0) {
        Promise.allSettled(stillRunning.map((a) => a.finished)).then(() => {
          if (transitionRef.current.id !== checkTransId) return;
          markSettled(activeId);
        });
        return;
      }
      markSettled(activeId);
    }, safetyDelay);
    settleTimersRef.current.push(safetyTimer);
  }, [markSettled]);

  // Settle check trigger (a): two animation frames after active page's phase enters 'enter'
  useEffect(() => {
    if (!isDesktop || locked) return;
    const activePage = pages[index];
    if (!activePage) return;
    const activeId = activePage.id;

    if (settled[activeId]) return;

    clearSettleTimers();

    const scheduledTransId = transition.id;
    let raf2Id: number;
    const raf1Id = requestAnimationFrame(() => {
      if (transitionRef.current.id !== scheduledTransId) return;
      raf2Id = requestAnimationFrame(() => {
        if (transitionRef.current.id !== scheduledTransId) return;
        runSettleCheck();
      });
      settleRafsRef.current.push(raf2Id);
    });
    settleRafsRef.current.push(raf1Id);

    return () => {
      cancelAnimationFrame(raf1Id);
      if (raf2Id) cancelAnimationFrame(raf2Id);
    };
  }, [index, locked, isDesktop, transition.id, pages, runSettleCheck]);

  // Settle check triggers: (b) on visibilitychange (to visible), (c) on window resize (debounced 150ms)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const activePage = pagesRef.current[indexRef.current];
        if (activePage && !settledRef.current[activePage.id]) {
          runSettleCheck();
        }
      }
    };

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const activePage = pagesRef.current[indexRef.current];
        if (activePage && !settledRef.current[activePage.id]) {
          runSettleCheck();
        }
      }, 150);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, [runSettleCheck]);

  // KEYBOARD NAVIGATION
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lockedRef.current || transRef.current) return;
      const currentPage = pagesRef.current[indexRef.current];
      if (currentPage?.id === 'demo' || currentPage?.gestures === false) return;

      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) return;

      if (isDesktopRef.current) {
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
          e.preventDefault();
          nextRef.current();
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
          e.preventDefault();
          prevRef.current();
        }
      } else {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          nextRef.current();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          prevRef.current();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // WHEEL & TOUCH GESTURES
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // 250ms momentum guard quiet timer
      if (wheelQuietTimerRef.current) clearTimeout(wheelQuietTimerRef.current);
      wheelQuietTimerRef.current = setTimeout(() => {
        wheelActiveDuringLockRef.current = false;
      }, 250);

      if (e.ctrlKey) return;

      // Lock: input is ignored during lock. Track that wheel was active during lock.
      if (lockedRef.current || transRef.current) {
        wheelActiveDuringLockRef.current = true;
        e.preventDefault();
        return;
      }

      // Momentum guard: navigation never starts from a wheel event that began during the lock
      // and wheel input is ignored until 250ms have passed since the last wheel event
      if (wheelActiveDuringLockRef.current) {
        e.preventDefault();
        return;
      }

      if (!isDesktopRef.current) return;

      const currentPage = pagesRef.current[indexRef.current];
      if (currentPage?.id === 'demo' || currentPage?.gestures === false) return;

      const target = e.target as HTMLElement;
      if (target.closest?.('input, textarea, select, [contenteditable], [data-no-pageflow]')) return;

      if (Math.abs(e.deltaY) < 8) return;

      const pageEl = scrollRefs.current[indexRef.current];
      if (!pageEl) return;

      const dir = e.deltaY > 0 ? 1 : -1;

      if (canScrollInDirection(target, pageEl, dir)) {
        return;
      }

      e.preventDefault();

      if (dir > 0) {
        if (indexRef.current < pagesRef.current.length - 1) {
          wheelActiveDuringLockRef.current = true;
          nextRef.current();
        }
      } else {
        if (indexRef.current > 0) {
          wheelActiveDuringLockRef.current = true;
          prevRef.current();
        }
      }
    };

    let touchStartX = 0;
    let touchStartY = 0;
    let touchValid = false;
    let touchTarget: EventTarget | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      if (isDesktopRef.current) return;
      if (e.touches.length !== 1) { touchValid = false; return; }
      const target = e.target as HTMLElement;
      if (target.closest?.('input, textarea, select, [contenteditable], [data-no-pageflow]')) {
        touchValid = false; return;
      }

      const startX = e.touches[0].clientX;
      if (startX < EDGE_ZONE || startX > window.innerWidth - EDGE_ZONE) {
        touchValid = false; return;
      }

      const currentPage = pagesRef.current[indexRef.current];
      if (currentPage?.id === 'demo' || currentPage?.gestures === false || lockedRef.current || transRef.current) {
        touchValid = false; return;
      }

      const pageEl = scrollRefs.current[indexRef.current];
      if (!pageEl) { touchValid = false; return; }

      touchValid = true;
      touchStartX = startX;
      touchStartY = e.touches[0].clientY;
      touchTarget = e.target;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isDesktopRef.current || !touchValid) return;
      touchValid = false;
      if (lockedRef.current || transRef.current) return;
      const currentPage = pagesRef.current[indexRef.current];
      if (currentPage?.id === 'demo' || currentPage?.gestures === false) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const dx = endX - touchStartX;
      const dy = endY - touchStartY;

      if (Math.abs(dx) < SWIPE_MIN) return;
      if (Math.abs(dx) <= Math.abs(dy) * SWIPE_RATIO) return;

      const pageEl = scrollRefs.current[indexRef.current];
      if (!pageEl) return;

      const scrollDir = dx < 0 ? 1 : -1;
      if (canScrollXInDirection(touchTarget, pageEl, scrollDir)) return;

      const hasNext = dx < 0 && indexRef.current < pagesRef.current.length - 1;
      const hasPrev = dx > 0 && indexRef.current > 0;
      if (hasNext) {
        nextRef.current();
      } else if (hasPrev) {
        prevRef.current();
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      if (wheelQuietTimerRef.current) {
        clearTimeout(wheelQuietTimerRef.current);
        wheelQuietTimerRef.current = null;
      }
    };
  }, []);

  const activePage = pages[index];
  const isForward = index > prevIndex;
  const duration = isForward ? 0.65 : 0.55;

  const neighbourIds = [
    index > 0 ? pages[index - 1]?.id : undefined,
    index < pages.length - 1 ? pages[index + 1]?.id : undefined,
  ].filter((id): id is string => Boolean(id));

  const twoStepIds = [
    index > 1 ? pages[index - 2]?.id : undefined,
    index < pages.length - 2 ? pages[index + 2]?.id : undefined,
  ].filter((id): id is string => Boolean(id));


  const stableGoTo = useCallback((id: string) => {
    goToRef.current(id);
  }, []);

  const stableNext = useCallback(() => {
    nextRef.current();
  }, []);

  const stablePrev = useCallback(() => {
    prevRef.current();
  }, []);

  const pagerContextValue = useMemo(
    () => ({
      goTo: stableGoTo,
      next: stableNext,
      prev: stablePrev,
      index,
      id: activePage?.id,
    }),
    [stableGoTo, stableNext, stablePrev, index, activePage?.id]
  );

  return (
    <PagerContext.Provider value={pagerContextValue}>
      <QualityContext.Provider value={{ tier }}>
        <MotionConfig reducedMotion="user">
          <LazyMotion features={domAnimation}>
            <div ref={containerRef} className="relative h-[100dvh] w-full overflow-hidden bg-slate-900">
              <Stage
                currentId={activePage?.id || ''}
                prevId={isDesktop ? stagePrevId : (prevIndex !== null && pages[prevIndex] ? pages[prevIndex].id : null)}
                direction={transition.dir}
                transitioning={isTransitioning}
                desktop={isDesktop}
                reducedMotion={!!shouldReduceMotion}
                tier={tier}
                transitionId={transition.id}
                enteredAt={enteredAt}
                locked={locked}
                arriving={isArriving}
                neighbourIds={neighbourIds}
                twoStepIds={twoStepIds}
              />
            {pages.map((p, i) => {
              const isActive = i === index;
              const isLeavingPage = isStagedNav && p.id === leavingId;
              const isAfter = i > index;
              const enteringBackward = isActive && index < prevIndex;

              let animateObj;
              let transitionObj;
              let isDesktopWrapperVisible = false;

              if (isDesktop) {
                const isStagePage = isStageMode(p.id);
                isDesktopWrapperVisible = isActive || p.id === leavingId;

                if (isStagePage) {
                  // 'stage' mode pages: always { opacity: 1, x: 0, y: 0 } with transition { duration: 0 };
                  animateObj = { opacity: 1, x: 0, y: 0, visibility: isDesktopWrapperVisible ? ('visible' as const) : ('hidden' as const) };
                  transitionObj = { duration: 0 };
                } else {
                  // 'fade' mode pages (demo, survey): active { opacity: 1 }, inactive { opacity: 0 }
                  animateObj = {
                    opacity: isActive ? 1 : 0,
                    x: 0,
                    y: 0,
                    visibility: isDesktopWrapperVisible ? ('visible' as const) : ('hidden' as const),
                  };

                  if (isActive) {
                    if (isTransitioning) {
                      const leavingPageId = leavingId || transition.fromId;
                      const leavingIsStage = leavingPageId ? isStageMode(leavingPageId) : false;
                      transitionObj = (shouldReduceMotion || tier === 'minimal')
                        ? { duration: 0.3 }
                        : {
                            opacity: {
                              duration: 0.5 * effectiveTimeScale,
                              delay: leavingIsStage ? 0.6 * effectiveTimeScale : 0,
                            },
                          };
                    } else {
                      transitionObj = { duration: 0 };
                    }
                  } else if (p.id === leavingId) {
                    transitionObj = (shouldReduceMotion || tier === 'minimal')
                      ? { duration: 0.3 }
                      : {
                          opacity: {
                            duration: 0.45 * effectiveTimeScale,
                            delay: 0,
                          },
                        };
                  } else {
                    transitionObj = { duration: 0 };
                  }
                }
              } else {
                // PHONE BRANCH
                if (transition.choreographed) {
                  const isStagePage = isStageMode(p.id);
                  const isVisible = isActive || isLeavingPage;

                  if (isStagePage) {
                    // 'stage' mode pages: always { opacity: 1, x: 0, y: 0 } with transition { duration: 0 };
                    animateObj = {
                      x: 0,
                      y: 0,
                      opacity: isVisible ? 1 : 0,
                      visibility: isVisible ? ("visible" as const) : ("hidden" as const),
                    };
                    transitionObj = { duration: 0 };
                  } else {
                    // 'fade' mode pages (demo, survey): active { opacity: 1 }, inactive { opacity: 0 }
                    animateObj = {
                      x: 0,
                      y: 0,
                      opacity: isActive ? 1 : 0,
                      visibility: isVisible ? ("visible" as const) : ("hidden" as const),
                    };

                    if (isActive) {
                      if (isTransitioning) {
                        const leavingPageId = leavingId || transition.fromId;
                        const leavingIsStage = leavingPageId ? isStageMode(leavingPageId) : false;
                        transitionObj = (shouldReduceMotion || tier === 'minimal')
                          ? { duration: 0.3 }
                          : {
                              opacity: {
                                duration: 0.3 * effectiveTimeScale,
                                delay: leavingIsStage ? 0.36 * effectiveTimeScale : 0,
                              },
                            };
                      } else {
                        transitionObj = { duration: 0 };
                      }
                    } else if (p.id === leavingId) {
                      transitionObj = (shouldReduceMotion || tier === 'minimal')
                        ? { duration: 0.3 }
                        : {
                            opacity: {
                              duration: 0.27 * effectiveTimeScale,
                              delay: 0,
                            },
                          };
                    } else {
                      transitionObj = { duration: 0 };
                    }
                  }
                } else {
                  if (isActive) {
                    animateObj = {
                      x: enteringBackward ? ["-22%", "0%"] : "0%",
                      y: 0,
                      opacity: enteringBackward ? [0, 1] : 1,
                      visibility: "visible" as const,
                    };
                  } else if (isAfter) {
                    animateObj = {
                      x: "100%",
                      y: 0,
                      opacity: 1,
                      visibility: "visible" as const,
                      transitionEnd: { visibility: "hidden" as const }
                    };
                  } else {
                    animateObj = {
                      x: "-22%",
                      y: 0,
                      opacity: 0,
                      visibility: "visible" as const,
                      transitionEnd: { x: "-100%", visibility: "hidden" as const }
                    };
                  }

                  transitionObj = { x: { duration, ease: [0.22, 1, 0.36, 1] as const }, opacity: { duration: 0.5 } };
                }
              }

              const effectivePhase = (isDesktop && isActive && !locked) ? (settled[p.id] ? 'done' : 'enter') : textPhase[p.id];

              return (
                <m.div
                  key={p.id}
                  ref={(el: HTMLDivElement | null) => { scrollRefs.current[i] = el; }}
                  className="absolute inset-0 pageflow-scroll"
                  style={{
                    zIndex: i + 1,
                    visibility: isDesktop ? (isDesktopWrapperVisible ? 'visible' : 'hidden') : undefined,
                    display: isDesktop ? (isDesktopWrapperVisible ? undefined : 'none') : (isActive || isLeavingPage ? undefined : 'none'),
                    ...(isDesktop ? ({
                      '--text-dir': textNavTiming?.dir ?? 1,
                      '--text-delay': textNavTiming?.delay || '300ms',
                      '--ts': effectiveTimeScale,
                    } as React.CSSProperties) : {}),
                  }}
                  initial={false}
                  animate={animateObj}
                  transition={transitionObj}
                  transformTemplate={
                    isDesktop
                      ? () => "none"
                      : (_, generated) => (isStagedNav || (isActive && !isTransitioning) ? "none" : generated)
                  }
                  inert={!isActive}
                  aria-hidden={!isActive}
                  data-page-current={isActive && !locked ? 'true' : 'false'}
                  data-text-phase={isDesktop ? effectivePhase : undefined}
                >
                  <PageStateProvider
                    isCurrent={isActive}
                    direction={transition.dir}
                    axis={isDesktop ? 'y' : 'x'}
                    staged={isStaged(p.id)}
                    desktop={isDesktop}
                    textDelayMs={
                      (isDesktop ? isStagedNav : transition.choreographed)
                        ? Math.round(
                            (isDesktop ? PAIR_TIMING : PHONE_TIMING)[
                              transition.dir === -1 ? 'back' : 'fwd'
                            ].textDelayMs * (isDesktop ? effectiveTimeScale : TIME_SCALE)
                          )
                        : 250
                    }
                    isLeaving={isStagedNav && p.id === leavingId}
                    transitionId={transition.id}
                    transitionDir={transition.dir}
                    choreographed={transition.choreographed}
                  >
                    {p.node}
                  </PageStateProvider>
                </m.div>
              );
            })}

            {/* Progress Line */}
            <div className="absolute top-0 inset-x-0 h-[3px] pointer-events-none z-30 select-none [-webkit-tap-highlight-color:transparent]" aria-hidden="true">
              <div
                className="h-full w-full"
                style={{
                  background: '#14B8A6',
                  transform: `scaleX(${(index + 1) / pages.length})`,
                  transformOrigin: 'left',
                  transition: 'transform 650ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              />
            </div>

            {/* Controls Layer */}
            {!locked && (
              <>
                {/* Desktop Controls (>= 768px) */}
                <div className="hidden md:contents">
                  {/* Scene Counter: plain text, no bg, no border, no pill, "01 / 06" format, 13px, letter-spacing 0.12em, white at 70%, left 5%, bottom ~36px (lifted on contact) */}
                  <div
                    aria-label={`Scene ${index + 1} of ${pages.length}`}
                    className={`absolute z-30 pointer-events-none select-none text-[13px] tracking-[0.12em] text-white/70 tabular-nums font-medium transition-[bottom] duration-300 ${
                      activePage?.id === 'contact' ? 'bottom-[100px] left-[5%]' : 'bottom-[36px] left-[5%]'
                    }`}
                  >
                    {String(index + 1).padStart(2, '0')} / {String(pages.length).padStart(2, '0')}
                  </div>

                  {/* Chevrons: vertical stack centered at bottom ~28px, up above down, no circle/bg/border, 20px thin icons, 44x44 transparent hit area, dimmed to 25% when disabled */}
                  <div className="absolute bottom-[28px] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-auto select-none">
                    <button
                      type="button"
                      onClick={index > 0 ? () => prevRef.current() : undefined}
                      disabled={index === 0}
                      aria-disabled={index === 0}
                      aria-label="Previous scene"
                      tabIndex={index === 0 ? -1 : 0}
                      className={`w-[44px] h-[44px] flex items-center justify-center bg-transparent border-0 transition-[opacity,transform] active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-md group ${
                        index === 0 ? 'opacity-25 cursor-default pointer-events-none' : 'opacity-100 cursor-pointer'
                      }`}
                    >
                      <svg
                        className="w-[20px] h-[20px] text-white/70 transition-colors group-hover:text-white group-focus-visible:text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={index < pages.length - 1 ? () => nextRef.current() : undefined}
                      disabled={index >= pages.length - 1}
                      aria-disabled={index >= pages.length - 1}
                      aria-label="Next scene"
                      tabIndex={index >= pages.length - 1 ? -1 : 0}
                      className={`w-[44px] h-[44px] flex items-center justify-center bg-transparent border-0 transition-[opacity,transform] active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-md group ${
                        index >= pages.length - 1 ? 'opacity-25 cursor-default pointer-events-none' : 'opacity-100 cursor-pointer'
                      }`}
                    >
                      <svg
                        className="w-[20px] h-[20px] text-white/70 transition-colors group-hover:text-white group-focus-visible:text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Mobile Controls (< 768px): exactly as it was */}
                <div className="md:hidden">
                  {/* Scene Counter (bottom-left) */}
                  <div
                    aria-label={`Scene ${index + 1} of ${pages.length}`}
                    className={`absolute z-30 pointer-events-auto flex items-center justify-center bg-slate-900/85 border border-white/15 text-white select-none shadow-lg px-3.5 py-2 rounded-full text-xs font-semibold tabular-nums tracking-wider ${
                      activePage?.id === 'contact' ? 'bottom-20 left-4' : 'bottom-[max(16px,env(safe-area-inset-bottom,0px))] left-4'
                    }`}
                  >
                    <span>
                      {index + 1}/{pages.length}
                    </span>
                  </div>

                  {/* Prev / Next Chevrons (bottom-center) */}
                  <div className="absolute bottom-[max(16px,env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 pointer-events-auto select-none">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => prevRef.current()}
                        aria-label="Previous scene"
                        className="w-11 h-11 rounded-full bg-slate-900/85 border border-white/15 text-white flex items-center justify-center hover:bg-slate-800 transition active:scale-95 shadow-lg select-none [touch-action:manipulation]"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}

                    {index < pages.length - 1 && (
                      <button
                        type="button"
                        onClick={() => nextRef.current()}
                        aria-label="Next scene"
                        className="w-11 h-11 rounded-full bg-slate-900/85 border border-white/15 text-white flex items-center justify-center hover:bg-slate-800 transition active:scale-95 shadow-lg select-none [touch-action:manipulation]"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}


            <div className="sr-only" aria-live="polite">
              Page {index + 1} of {pages.length}: {activePage?.label}
            </div>
          </div>
        </LazyMotion>
      </MotionConfig>
    </QualityContext.Provider>
  </PagerContext.Provider>
  );
});

PageFlow.displayName = 'PageFlow';
export default PageFlow;
