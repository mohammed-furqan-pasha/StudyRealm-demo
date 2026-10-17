'use client';

import { useState, useEffect, useRef, ReactNode, HTMLAttributes } from 'react';
import { m, useReducedMotion } from 'motion/react';
import { SCENES, SceneKey } from '../data/sceneAssets';
import { usePageState } from './PageFlow';
import { isStaged, isStageMode, EASE_IN, EASE_OUT, TIME_SCALE } from '../lib/stageScenes';

export const PARALLAX_BG = 4;
export const PARALLAX_MID = 14;
export const PARALLAX_NEAR = 22;
export const PARALLAX_TEXT = 26;
export const PARALLAX_DURATION = 0.65;
export const PARALLAX_EASE = [0.22, 1, 0.36, 1] as const;

export const SCENE_BOTTOM_RESERVE_DESKTOP = 120;
export const SCENE_BOTTOM_RESERVE_MOBILE = 88;

export const MOBILE_ENTER_DURATION_REVEAL = 0.9;
export const MOBILE_ENTER_DURATION_WORD = 0.95;
export const MOBILE_ENTER_EASE = [0.33, 1, 0.68, 1] as const;

export { CoverBox } from './CoverBox';
import { CoverBox } from './CoverBox';

export interface SceneObject {
  src: string;
  className: string;
  layer: 'behind' | 'front';
  depth: 'mid' | 'near';
  eager?: boolean;
  cover?: boolean;
}

export interface SceneShellProps {
  scene: SceneKey;
  objects?: SceneObject[];
  children?: ReactNode;
}

function SceneObjectItem({ obj }: { obj: SceneObject }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const imgEl = (
    <img
      ref={(el) => {
        if (el && el.complete && el.naturalWidth > 0 && !loaded) {
          setLoaded(true);
        }
      }}
      src={obj.src}
      alt=""
      aria-hidden="true"
      draggable={false}
      loading={obj.eager ? 'eager' : 'lazy'}
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
      className={`pointer-events-none select-none transition-opacity duration-500 ${obj.className}`}
      style={{
        opacity: loaded && !error ? 1 : 0,
        display: error ? 'none' : undefined,
      }}
    />
  );

  if (obj.cover) {
    return <CoverBox>{imgEl}</CoverBox>;
  }

  return imgEl;
}

export default function SceneShell({ scene, objects = [], children }: SceneShellProps) {
  const { isCurrent, direction, axis, desktop, choreographed = false } = usePageState();
  const [hasSettled, setHasSettled] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [bgError, setBgError] = useState(false);
  const prevIsCurrent = useRef(false);

  const sceneConfig = SCENES[scene] || SCENES.hero;

  const bypassParallax = desktop || choreographed;

  useEffect(() => {
    if (bypassParallax) {
      prevIsCurrent.current = isCurrent;
      return;
    }
    if (isCurrent && !prevIsCurrent.current) {
      setHasSettled(false);
      const timer = setTimeout(() => {
        setHasSettled(true);
      }, PARALLAX_DURATION * 1000 + 40);
      return () => clearTimeout(timer);
    } else if (!isCurrent) {
      setHasSettled(true);
    }
    prevIsCurrent.current = isCurrent;
  }, [bypassParallax, isCurrent]);

  if (isStageMode(scene)) {
    return (
      <div
        className="relative z-10 w-full h-full flex flex-col overflow-y-auto pageflow-scroll pb-[88px] md:pb-[120px]"
        style={{
          paddingBottom: `calc(${
            desktop ? SCENE_BOTTOM_RESERVE_DESKTOP : SCENE_BOTTOM_RESERVE_MOBILE
          }px + env(safe-area-inset-bottom, 0px))`,
          transform: 'none',
        }}
      >
        {children}
      </div>
    );
  }

  const getLayerAnimate = (percent: number) => {
    if (bypassParallax) {
      return { [axis]: '0%' };
    }
    if (isCurrent && !hasSettled) {
      const offset = `${direction * percent}%`;
      return { [axis]: [offset, '0%'] };
    }
    return { [axis]: '0%' };
  };

  const layerTransition = !bypassParallax && isCurrent && !hasSettled
    ? { duration: PARALLAX_DURATION, ease: PARALLAX_EASE }
    : { duration: 0 };

  const layerTransformTemplate = (_: unknown, generated: string) => {
    return (bypassParallax || !isCurrent || hasSettled) ? 'none' : generated;
  };

  const behindMid = objects.filter((o) => o.layer === 'behind' && o.depth === 'mid');
  const behindNear = objects.filter((o) => o.layer === 'behind' && o.depth === 'near');
  const frontMid = objects.filter((o) => o.layer === 'front' && o.depth === 'mid');
  const frontNear = objects.filter((o) => o.layer === 'front' && o.depth === 'near');

  return (
    <div
      className="relative w-full h-[100dvh] overflow-hidden"
      style={{
        backgroundColor: sceneConfig.bgColor,
        backgroundImage: sceneConfig.gradient,
      }}
    >
      {/* Background Image Layer */}
      <m.div
        className="absolute inset-0 pointer-events-none select-none"
        animate={bypassParallax ? undefined : getLayerAnimate(PARALLAX_BG)}
        transition={bypassParallax ? { duration: 0 } : layerTransition}
        transformTemplate={bypassParallax ? () => 'none' : layerTransformTemplate}
      >
        <picture className="w-full h-full block">
          <source media="(min-width: 768px)" srcSet={sceneConfig.lg} />
          <img
            ref={(el) => {
              if (el && el.complete && el.naturalWidth > 0 && !bgLoaded) {
                setBgLoaded(true);
              }
            }}
            src={sceneConfig.sm}
            alt=""
            aria-hidden="true"
            draggable={false}
            width={1920}
            height={1080}
            loading="eager"
            onLoad={() => setBgLoaded(true)}
            onError={() => setBgError(true)}
            className="w-full h-full object-cover transition-opacity duration-500"
            style={{
              opacity: bgError ? 0 : 1,
              display: bgError ? 'none' : undefined,
              objectPosition: sceneConfig.position ?? '50% 50%',
            }}
          />
        </picture>
      </m.div>

      {/* Behind Mid Objects */}
      {behindMid.length > 0 && (
        <m.div
          className="absolute inset-0 pointer-events-none select-none z-[1]"
          animate={bypassParallax ? undefined : getLayerAnimate(PARALLAX_MID)}
          transition={bypassParallax ? { duration: 0 } : layerTransition}
          transformTemplate={bypassParallax ? () => 'none' : layerTransformTemplate}
        >
          {behindMid.map((obj, i) => (
            <SceneObjectItem key={`bm-${i}-${obj.src}`} obj={obj} />
          ))}
        </m.div>
      )}

      {/* Behind Near Objects */}
      {behindNear.length > 0 && (
        <m.div
          className="absolute inset-0 pointer-events-none select-none z-[2]"
          animate={bypassParallax ? undefined : getLayerAnimate(PARALLAX_NEAR)}
          transition={bypassParallax ? { duration: 0 } : layerTransition}
          transformTemplate={bypassParallax ? () => 'none' : layerTransformTemplate}
        >
          {behindNear.map((obj, i) => (
            <SceneObjectItem key={`bn-${i}-${obj.src}`} obj={obj} />
          ))}
        </m.div>
      )}

      {/* Content / Text Layer */}
      <m.div
        className="relative z-10 w-full h-full flex flex-col overflow-y-auto pageflow-scroll pb-[88px] md:pb-[120px]"
        style={{
          paddingBottom: `calc(${
            desktop ? SCENE_BOTTOM_RESERVE_DESKTOP : SCENE_BOTTOM_RESERVE_MOBILE
          }px + env(safe-area-inset-bottom, 0px))`,
          ...(bypassParallax ? { transform: 'none' } : {}),
        }}
        animate={bypassParallax ? undefined : getLayerAnimate(PARALLAX_TEXT)}
        transition={bypassParallax ? { duration: 0 } : layerTransition}
        transformTemplate={bypassParallax ? () => 'none' : layerTransformTemplate}
        onAnimationComplete={() => {
          if (!bypassParallax && isCurrent) setHasSettled(true);
        }}
      >
        {children}
      </m.div>

      {/* Front Mid Objects */}
      {frontMid.length > 0 && (
        <m.div
          className="absolute inset-0 pointer-events-none select-none z-[20]"
          animate={bypassParallax ? undefined : getLayerAnimate(PARALLAX_MID)}
          transition={bypassParallax ? { duration: 0 } : layerTransition}
          transformTemplate={bypassParallax ? () => 'none' : layerTransformTemplate}
        >
          {frontMid.map((obj, i) => (
            <SceneObjectItem key={`fm-${i}-${obj.src}`} obj={obj} />
          ))}
        </m.div>
      )}

      {/* Front Near Objects */}
      {frontNear.length > 0 && (
        <m.div
          className="absolute inset-0 pointer-events-none select-none z-[30]"
          animate={bypassParallax ? undefined : getLayerAnimate(PARALLAX_NEAR)}
          transition={bypassParallax ? { duration: 0 } : layerTransition}
          transformTemplate={bypassParallax ? () => 'none' : layerTransformTemplate}
        >
          {frontNear.map((obj, i) => (
            <SceneObjectItem key={`fn-${i}-${obj.src}`} obj={obj} />
          ))}
        </m.div>
      )}
    </div>
  );
}

export interface SplitHeadlineProps {
  lines: string[];
  className?: string;
}

export function SplitHeadline({ lines, className = '' }: SplitHeadlineProps) {
  const {
    isCurrent,
    direction,
    staged,
    textDelayMs = 250,
    isLeaving,
    desktop,
    transitionId = 0,
    transitionDir,
    choreographed = false,
  } = usePageState();
  const shouldReduceMotion = useReducedMotion();
  const [settled, setSettled] = useState(true);
  const fullText = lines.join(' ');

  useEffect(() => {
    if (desktop) return;
    if (!isCurrent || isLeaving) {
      setSettled(false);
    }
  }, [desktop, isCurrent, isLeaving, transitionId]);

  if (desktop) {
    let wordIndex = 0;
    return (
      <div
        role="heading"
        aria-level={1}
        aria-label={fullText}
        className={className}
        style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
      >
        {lines.map((line, lIdx) => {
          const words = line.trim().split(/\s+/).filter(Boolean);
          return (
            <span key={`line-${lIdx}`} className="block">
              {words.map((word) => {
                const currentIdx = wordIndex++;
                return (
                  <span
                    key={`word-${currentIdx}-${word}`}
                    className="inline-block overflow-hidden pb-1 align-bottom mr-[0.28em] last:mr-0"
                  >
                    <span
                      className="st-word inline-block"
                      style={{ '--i': currentIdx } as React.CSSProperties}
                      aria-hidden="true"
                    >
                      {word}
                    </span>
                  </span>
                );
              })}
            </span>
          );
        })}
      </div>
    );
  }

  const isDesktopStaged = desktop && staged;
  const dir = transitionDir ?? direction;
  let wordIndex = 0;

  return (
    <div
      key={fullText}
      role="heading"
      aria-level={1}
      aria-label={fullText}
      className={className}
      style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
    >
      {lines.map((line, lIdx) => {
        const words = line.trim().split(/\s+/).filter(Boolean);
        return (
          <span key={`line-${lIdx}`} className="block">
            {words.map((word) => {
              const currentIdx = wordIndex++;

              let initialObj: false | Record<string, any>;
              let animateObj: Record<string, any>;
              let transitionObj: Record<string, any>;

              if (staged) {
                if (choreographed) {
                  const enterX = dir === 1 ? '10vw' : '-10vw';
                  const leaveX = dir === 1 ? '-5vw' : '5vw';

                  if (shouldReduceMotion) {
                    initialObj = { opacity: isLeaving ? 1 : 0, x: 0, y: 0 };
                    animateObj = isLeaving
                      ? { opacity: 0, x: 0, y: 0 }
                      : isCurrent
                      ? { opacity: 1, x: 0, y: 0 }
                      : { opacity: 0, x: 0, y: 0 };
                    transitionObj = {
                      duration: isLeaving ? 0.2 : 0.3,
                      delay: isLeaving ? currentIdx * 0.02 : 0,
                    };
                  } else if (isLeaving) {
                    initialObj = { x: 0, y: 0, opacity: 1 };
                    animateObj = { x: leaveX, y: 0, opacity: 0 };
                    transitionObj = {
                      duration: 0.28 * TIME_SCALE,
                      ease: EASE_IN,
                      delay: currentIdx * (0.02 * TIME_SCALE),
                    };
                  } else if (isCurrent) {
                    initialObj = { x: enterX, y: 0, opacity: 0 };
                    animateObj = { x: 0, y: 0, opacity: 1 };
                    transitionObj = {
                      duration: MOBILE_ENTER_DURATION_WORD * TIME_SCALE,
                      ease: MOBILE_ENTER_EASE,
                      delay: textDelayMs / 1000 + currentIdx * (0.09 * TIME_SCALE),
                    };
                  } else {
                    initialObj = { x: enterX, y: 0, opacity: 0 };
                    animateObj = { x: enterX, y: 0, opacity: 0 };
                    transitionObj = { duration: 0 };
                  }
                } else if (shouldReduceMotion) {
                  initialObj = { opacity: isLeaving ? 1 : 0 };
                  animateObj = isLeaving
                    ? { opacity: 0 }
                    : isCurrent
                    ? { opacity: 1 }
                    : { opacity: 0 };
                  transitionObj = {
                    duration: isLeaving ? 0.2 : 0.3,
                    delay: isLeaving ? currentIdx * 0.02 : 0,
                  };
                } else if (isLeaving) {
                  const leaveY = isDesktopStaged ? (dir === 1 ? '-110%' : '110%') : '-110%';
                  initialObj = { y: '0%', opacity: 1 };
                  animateObj = { y: leaveY, opacity: 0 };
                  transitionObj = {
                    duration: 0.28 * TIME_SCALE,
                    ease: EASE_IN,
                    delay: currentIdx * (0.02 * TIME_SCALE),
                  };
                } else if (isCurrent) {
                  const enterY = isDesktopStaged ? (dir === 1 ? '115%' : '-115%') : '115%';
                  initialObj = { y: enterY, opacity: 0 };
                  animateObj = { y: '0%', opacity: 1 };
                  transitionObj = {
                    duration: 0.75 * TIME_SCALE,
                    ease: EASE_OUT,
                    delay: textDelayMs / 1000 + currentIdx * (0.09 * TIME_SCALE),
                  };
                } else {
                  const enterY = isDesktopStaged ? (dir === 1 ? '115%' : '-115%') : '115%';
                  initialObj = { y: enterY, opacity: 0 };
                  animateObj = { y: enterY, opacity: 0 };
                  transitionObj = { duration: 0 };
                }
              } else {
                const delay = 0.25 + currentIdx * 0.06;
                initialObj = { y: '105%', opacity: 0 };
                animateObj = isCurrent
                  ? { y: '0%', opacity: 1 }
                  : { y: '105%', opacity: 0 };
                transitionObj = isCurrent
                  ? {
                      duration: 0.5,
                      ease: PARALLAX_EASE,
                      delay,
                    }
                  : { duration: 0 };
              }

              return (
                <span
                  key={`word-${currentIdx}-${word}`}
                  className={`inline-block ${choreographed ? '' : 'overflow-hidden'} pb-1 align-bottom mr-[0.28em] last:mr-0`}
                >
                  <m.span
                    key={`word-${currentIdx}-${word}-t${transitionId}`}
                    className="inline-block"
                    aria-hidden="true"
                    initial={initialObj}
                    animate={animateObj}
                    transition={transitionObj}
                    style={!desktop && staged && !settled && isCurrent ? { opacity: 0 } : undefined}
                    onAnimationComplete={() => {
                      if (isCurrent && !isLeaving) {
                        setSettled(true);
                      }
                    }}
                    transformTemplate={(_, generated) =>
                      staged && settled && isCurrent && !isLeaving ? 'none' : generated
                    }
                  >
                    {word}
                  </m.span>
                </span>
              );
            })}
          </span>
        );
      })}
    </div>
  );
}

export interface StageRevealProps {
  order: number;
  rise?: number | string;
  children: ReactNode;
  className?: string;
}

export function StageReveal({
  order,
  rise = '10dvh',
  children,
  className = '',
}: StageRevealProps) {
  const {
    isCurrent,
    staged,
    textDelayMs = 250,
    isLeaving,
    desktop,
    transitionId = 0,
    transitionDir,
    direction,
    choreographed = false,
  } = usePageState();
  const shouldReduceMotion = useReducedMotion();
  const [settled, setSettled] = useState(true);

  useEffect(() => {
    if (desktop) return;
    if (!isCurrent || isLeaving) {
      setSettled(false);
    }
  }, [desktop, isCurrent, isLeaving, transitionId]);

  if (!staged) {
    return <div className={className}>{children}</div>;
  }

  if (desktop) {
    return (
      <div
        className={`st-reveal ${className}`}
        style={{
          '--o': order,
          '--rise': typeof rise === 'number' ? `${rise}px` : rise,
        } as React.CSSProperties}
      >
        {children}
      </div>
    );
  }

  const isDesktopStaged = desktop && staged;
  const dir = transitionDir ?? direction;

  const posRise = typeof rise === 'number' ? `${rise}px` : rise;
  const negRise =
    typeof rise === 'number'
      ? `-${rise}px`
      : rise.startsWith('-')
      ? rise.slice(1)
      : `-${rise}`;

  const enterY = isDesktopStaged ? (dir === 1 ? posRise : negRise) : posRise;
  const leaveY = isDesktopStaged ? (dir === 1 ? negRise : posRise) : negRise;

  let initialTarget: false | Record<string, any> = false;
  let animateTarget: Record<string, any>;
  let transitionConfig: Record<string, any>;

  if (choreographed) {
    const enterX = dir === 1 ? '18vw' : '-18vw';
    const leaveX = dir === 1 ? '-8vw' : '8vw';

    if (shouldReduceMotion) {
      initialTarget = {
        opacity: isLeaving ? 1 : 0,
        x: 0,
        y: 0,
      };
      animateTarget = {
        opacity: isLeaving ? 0 : isCurrent ? 1 : 0,
        x: 0,
        y: 0,
      };
      transitionConfig = {
        duration: isLeaving ? 0.18 : 0.3,
        delay: 0,
      };
    } else if (isLeaving) {
      initialTarget = {
        opacity: 1,
        x: 0,
        y: 0,
      };
      animateTarget = {
        opacity: 0,
        x: leaveX,
        y: 0,
      };
      transitionConfig = {
        duration: 0.25 * TIME_SCALE,
        ease: EASE_IN,
      };
    } else if (isCurrent) {
      initialTarget = {
        opacity: 0,
        x: enterX,
        y: 0,
      };
      animateTarget = {
        opacity: 1,
        x: 0,
        y: 0,
      };
      transitionConfig = {
        duration: MOBILE_ENTER_DURATION_REVEAL * TIME_SCALE,
        ease: MOBILE_ENTER_EASE,
        delay: textDelayMs / 1000 + 0.1 * TIME_SCALE + order * (0.1 * TIME_SCALE),
      };
    } else {
      initialTarget = {
        opacity: 0,
        x: enterX,
        y: 0,
      };
      animateTarget = {
        opacity: 0,
        x: enterX,
        y: 0,
      };
      transitionConfig = { duration: 0 };
    }
  } else {
    const posRise = typeof rise === 'number' ? `${rise}px` : rise;
    const negRise =
      typeof rise === 'number'
        ? `-${rise}px`
        : rise.startsWith('-')
        ? rise.slice(1)
        : `-${rise}`;

    const enterY = isDesktopStaged ? (dir === 1 ? posRise : negRise) : posRise;
    const leaveY = isDesktopStaged ? (dir === 1 ? negRise : posRise) : negRise;

    if (shouldReduceMotion) {
      initialTarget = {
        opacity: isLeaving ? 1 : 0,
        y: 0,
      };
      animateTarget = {
        opacity: isLeaving ? 0 : isCurrent ? 1 : 0,
        y: 0,
      };
      transitionConfig = {
        duration: isLeaving ? 0.18 : 0.3,
        delay: 0,
      };
    } else if (isLeaving) {
      initialTarget = {
        opacity: 1,
        y: 0,
      };
      animateTarget = {
        opacity: 0,
        y: leaveY,
      };
      transitionConfig = {
        duration: 0.25 * TIME_SCALE,
        ease: EASE_IN,
      };
    } else if (isCurrent) {
      initialTarget = {
        opacity: 0,
        y: enterY,
      };
      animateTarget = {
        opacity: 1,
        y: 0,
      };
      transitionConfig = {
        duration: 0.7 * TIME_SCALE,
        ease: EASE_OUT,
        delay: textDelayMs / 1000 + 0.1 * TIME_SCALE + order * (0.1 * TIME_SCALE),
      };
    } else {
      initialTarget = {
        opacity: 0,
        y: enterY,
      };
      animateTarget = {
        opacity: 0,
        y: enterY,
      };
      transitionConfig = { duration: 0 };
    }
  }

  return (
    <m.div
      key={`reveal-${order}-t${transitionId}`}
      className={className}
      initial={initialTarget}
      animate={animateTarget}
      transition={transitionConfig}
      style={!desktop && staged && !settled && isCurrent ? { opacity: 0 } : undefined}
      onAnimationComplete={() => {
        if (isCurrent && !isLeaving) {
          setSettled(true);
        }
      }}
      transformTemplate={(_, generated) =>
        settled && isCurrent && !isLeaving ? 'none' : generated
      }
    >
      {children}
    </m.div>
  );
}

export interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
}

export function GlassPanel({ children, className = '', ...props }: GlassPanelProps) {
  return (
    <div
      className={`rounded-3xl border border-white/15 bg-gradient-to-b from-white/10 to-white/5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
