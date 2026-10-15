'use client';

import { useState, useEffect } from 'react';
import { m } from 'motion/react';
import { CoverBox } from './CoverBox';
import {
  STAGE_ENABLED,
  TIME_SCALE,
  STAGE_SCENES,
  StageScene,
  StageObject,
  HAZE,
  hasHaze,
  PAIR_TIMING,
  PHONE_TIMING,
  EASE_IN,
  EASE_OUT,
  isStaged,
  isStageMode,
  isFadeMode,
  preloadNeighbouringStageAssets,
  ARRIVAL_TIMING,
} from '../lib/stageScenes';

export interface StageProps {
  currentId: string;
  prevId: string | null;
  direction: 1 | -1;
  transitioning: boolean;
  desktop: boolean;
  reducedMotion: boolean;
  transitionId?: number;
  enteredAt?: Record<string, number>;
  locked?: boolean;
  arriving?: boolean;
}

function StagePlate({
  scene,
  state,
  currentId,
  prevId,
  direction,
  desktop,
  reducedMotion,
  transitioning,
}: {
  scene: StageScene;
  state: 'active' | 'leaving' | 'hidden';
  currentId: string;
  prevId: string | null;
  direction: 1 | -1;
  desktop: boolean;
  reducedMotion: boolean;
  transitioning: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  const isCurrentStage = isStageMode(currentId);
  const isPrevStage = prevId !== null && isStageMode(prevId);
  const isStageToStage = isCurrentStage && isPrevStage;
  const isFadeToStage = !isPrevStage && isCurrentStage;
  const isStageToFade = isPrevStage && !isCurrentStage;
  const hasHazePair = desktop && prevId !== null && hasHaze(currentId, prevId);

  let initial: false | { opacity: number } = false;
  let animate: { opacity: number } = { opacity: state === 'hidden' ? 0 : 1 };
  let transition: Record<string, any> = { duration: 0 };

  if (reducedMotion) {
    if (state === 'active') {
      initial = { opacity: 0 };
      animate = { opacity: 1 };
      transition = { duration: 0.3 };
    } else if (state === 'leaving') {
      initial = { opacity: 1 };
      animate = { opacity: 0 };
      transition = { duration: 0.3 };
    } else {
      animate = { opacity: 0 };
      transition = { duration: 0 };
    }
  } else if (desktop) {
    if (!transitioning || (state === 'active' && !prevId)) {
      initial = false;
      animate = { opacity: state === 'hidden' ? 0 : 1 };
      transition = { duration: 0 };
    } else if (isFadeToStage) {
      // fade -> stage (e.g. demo -> features): mount and fade in over 0.4 * TIME_SCALE
      if (state === 'active') {
        initial = { opacity: 0 };
        animate = { opacity: 1 };
        transition = {
          duration: 0.4 * TIME_SCALE,
          ease: EASE_OUT,
        };
      }
    } else if (isStageToFade) {
      // stage -> fade (e.g. aha -> demo or features -> demo)
      if (state === 'leaving') {
        if (direction === -1) {
          // Backward mirror of fade -> stage: fade out over 0.4 * TIME_SCALE
          initial = { opacity: 1 };
          animate = { opacity: 0 };
          transition = {
            duration: 0.4 * TIME_SCALE,
            ease: EASE_IN,
          };
        } else {
          // Forward: stays at 1 underneath while fade page fades in over it
          initial = false;
          animate = { opacity: 1 };
          transition = { duration: 0 };
        }
      }
    } else if (isStageToStage) {
      if (hasHazePair) {
        // Pairs with haze (hero <-> aha)
        if (direction === 1) {
          if (scene.id === 'hero') {
            initial = false;
            animate = { opacity: 1 };
            transition = { duration: 0 };
          } else if (scene.id === 'aha') {
            initial = { opacity: 0 };
            animate = { opacity: 1 };
            transition = {
              delay: (PAIR_TIMING.fwd.plateIn.delay * TIME_SCALE) / 1000,
              duration: (PAIR_TIMING.fwd.plateIn.duration * TIME_SCALE) / 1000,
              ease: EASE_OUT,
            };
          }
        } else {
          if (scene.id === 'hero') {
            initial = false;
            animate = { opacity: 1 };
            transition = { duration: 0 };
          } else if (scene.id === 'aha') {
            initial = { opacity: 1 };
            animate = { opacity: 0 };
            transition = {
              delay: (PAIR_TIMING.back.plateOut.delay * TIME_SCALE) / 1000,
              duration: (PAIR_TIMING.back.plateOut.duration * TIME_SCALE) / 1000,
              ease: EASE_IN,
            };
          }
        }
      } else {
        // Every other stage pair crossfades its plates:
        // incoming plate above, fade 0.45 * TIME_SCALE at delay 0.5 * TIME_SCALE
        if (state === 'active') {
          initial = { opacity: 0 };
          animate = { opacity: 1 };
          transition = {
            delay: 0.5 * TIME_SCALE,
            duration: 0.45 * TIME_SCALE,
            ease: EASE_OUT,
          };
        } else if (state === 'leaving') {
          initial = false;
          animate = { opacity: 1 };
          transition = { duration: 0 };
        }
      }
    } else {
      // At rest
      if (state === 'active' || state === 'leaving') {
        animate = { opacity: 1 };
        transition = { duration: 0 };
      } else {
        animate = { opacity: 0 };
        transition = { duration: 0 };
      }
    }
  } else {
    // Mobile / Phones (no haze, PHONE_TIMING)
    if (isStageToStage) {
      if (direction === 1) {
        if (scene.id === 'hero') {
          initial = false;
          animate = { opacity: 1 };
          transition = { duration: 0 };
        } else {
          initial = { opacity: 0 };
          animate = { opacity: 1 };
          transition = {
            delay: (PHONE_TIMING.fwd.plateIn.delay * TIME_SCALE) / 1000,
            duration: (PHONE_TIMING.fwd.plateIn.duration * TIME_SCALE) / 1000,
            ease: EASE_OUT,
          };
        }
      } else {
        if (scene.id === 'hero') {
          initial = false;
          animate = { opacity: 1 };
          transition = { duration: 0 };
        } else {
          initial = { opacity: 1 };
          animate = { opacity: 0 };
          transition = {
            delay: (PHONE_TIMING.back.plateOut.delay * TIME_SCALE) / 1000,
            duration: (PHONE_TIMING.back.plateOut.duration * TIME_SCALE) / 1000,
            ease: EASE_IN,
          };
        }
      }
    } else {
      if (state === 'active' || state === 'leaving') {
        animate = { opacity: 1 };
        transition = { duration: 0 };
      } else {
        animate = { opacity: 0 };
        transition = { duration: 0 };
      }
    }
  }

  const isIncomingAbove =
    desktop && state === 'active' && !hasHazePair && isStageToStage;
  const plateZIndex = isIncomingAbove ? (scene.plate.zIndex || 2) + 1 : scene.plate.zIndex;

  return (
    <m.div
      className="absolute inset-0 pointer-events-none select-none"
      style={{
        zIndex: plateZIndex,
        backgroundColor: scene.fallback.bgColor,
        backgroundImage: scene.fallback.gradient,
      }}
      initial={initial}
      animate={animate}
      transition={transition}
    >
      {!imgError && (
        <picture className="w-full h-full block">
          <source media="(min-width: 768px)" srcSet={scene.plate.lg} />
          <img
            src={scene.plate.sm}
            alt=""
            draggable={false}
            decoding="async"
            loading="eager"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
            style={{
              objectPosition: scene.plate.position ?? '50% 50%',
            }}
          />
        </picture>
      )}
    </m.div>
  );
}

function StageObjectElement({
  obj,
  index,
  state,
  transitioning,
  direction,
  desktop,
  reducedMotion,
  locked = false,
  arriving = false,
}: {
  obj: StageObject;
  index: number;
  state: 'active' | 'leaving' | 'hidden';
  transitioning: boolean;
  direction: 1 | -1;
  desktop: boolean;
  reducedMotion: boolean;
  locked?: boolean;
  arriving?: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  if (imgError) return null;
  if (!desktop && !obj.showOnPhone) return null;

  const travel = desktop ? obj.travelY : obj.travelX;
  const axis = desktop ? 'y' : 'x';
  const scale = desktop ? 1 : 0.75;

  let initial: false | Record<string, string | number> = false;
  let animate: Record<string, any> = { opacity: state === 'hidden' ? 0 : 1, x: 0, y: 0 };
  let transition: Record<string, any> = { duration: 0 };

  if (desktop && locked) {
    initial = false;
    animate = { opacity: 0, x: 0, y: 0 };
    transition = { duration: 0 };
  } else if (desktop && arriving && !reducedMotion) {
    const timing = obj.timing.enterFwd;
    const duration = (timing.duration * scale * TIME_SCALE) / 1000;
    const delay = ((timing.delay + ARRIVAL_TIMING.objectsDelayMs) * scale * TIME_SCALE) / 1000;

    initial = { [axis]: travel, opacity: 0 };
    animate = { [axis]: 0, opacity: [0, 1, 1] };
    transition = {
      [axis]: {
        duration,
        delay,
        ease: EASE_OUT,
      },
      opacity: {
        duration,
        delay,
        times: [0, 0.08, 1],
        ease: 'linear',
      },
    };
  } else if (reducedMotion) {
    if (state === 'active') {
      initial = transitioning ? { opacity: 0 } : false;
      animate = { opacity: 1, x: 0, y: 0 };
      transition = transitioning ? { duration: 0.3 } : { duration: 0 };
    } else if (state === 'leaving') {
      initial = { opacity: 1, x: 0, y: 0 };
      animate = { opacity: 0, x: 0, y: 0 };
      transition = { duration: 0.3 };
    } else {
      animate = { opacity: 0, x: 0, y: 0 };
      transition = { duration: 0 };
    }
  } else if (transitioning) {
    const isFwd = direction === 1;

    if (state === 'active') {
      // ENTERING
      // Forward: comes from +travel to 0 with EASE_OUT and enterFwd
      // Backward: comes from -travel to 0 with EASE_OUT and enterBack
      const fromPos = isFwd ? travel : `-${travel}`;
      const timing = isFwd ? obj.timing.enterFwd : obj.timing.enterBack;
      const duration = (timing.duration * scale * TIME_SCALE) / 1000;
      const delay = (timing.delay * scale * TIME_SCALE) / 1000;

      initial = { [axis]: fromPos, opacity: 0 };
      animate = { [axis]: 0, opacity: [0, 1, 1] };
      transition = {
        [axis]: {
          duration,
          delay,
          ease: EASE_OUT,
        },
        opacity: {
          duration,
          delay,
          times: [0, 0.08, 1],
          ease: 'linear',
        },
      };
    } else if (state === 'leaving') {
      // LEAVING
      // Forward: goes to -travel with EASE_IN and exitFwd
      // Backward: goes to +travel with EASE_IN and exitBack
      const targetPos = isFwd ? `-${travel}` : travel;
      const timing = isFwd ? obj.timing.exitFwd : obj.timing.exitBack;
      const duration = (timing.duration * scale * TIME_SCALE) / 1000;
      const delay = (timing.delay * scale * TIME_SCALE) / 1000;

      initial = { [axis]: 0, opacity: 1 };
      animate = { [axis]: targetPos, opacity: [1, 1, 0] };
      transition = {
        [axis]: {
          duration,
          delay,
          ease: EASE_IN,
        },
        opacity: {
          duration,
          delay,
          times: [0, 0.9, 1],
          ease: 'linear',
        },
      };
    } else {
      animate = { opacity: 0 };
      transition = { duration: 0 };
    }
  } else {
    // Not staged pair (at rest or legacy)
    if (state === 'active' || state === 'leaving') {
      animate = { opacity: 1, x: 0, y: 0 };
      transition = { duration: 0 };
    } else {
      animate = { opacity: 0 };
      transition = { duration: 0 };
    }
  }

  const imgClassName = obj.cover
    ? `${obj.imgClass || ''} pointer-events-none select-none`
    : 'w-full h-full object-contain pointer-events-none select-none';

  const imgEl = (
    <m.img
      src={obj.src}
      alt=""
      draggable={false}
      decoding="async"
      onError={() => setImgError(true)}
      className={imgClassName}
      initial={initial}
      animate={animate}
      transition={transition}
      transformTemplate={(_, generated) =>
        !transitioning && !arriving && state === 'active' ? 'none' : generated
      }
    />
  );

  const wrapperClass = obj.cover
    ? 'absolute inset-0 pointer-events-none'
    : obj.wrapperClass;

  return (
    <div
      className={wrapperClass}
      style={{
        zIndex: 10 + index,
      }}
    >
      {obj.cover ? <CoverBox>{imgEl}</CoverBox> : imgEl}
    </div>
  );
}

function StageHazePlate({
  src,
  direction,
  transitioning,
}: {
  src: string;
  direction: 1 | -1;
  transitioning?: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  if (imgError) return null;

  if (!transitioning) {
    return (
      <m.div
        className="absolute inset-0 pointer-events-none select-none"
        style={{ zIndex: 1 }}
        initial={false}
        animate={{ opacity: 0 }}
        transition={{ duration: 0 }}
      >
        <img
          src={src}
          alt=""
          draggable={false}
          decoding="async"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </m.div>
    );
  }

  // FORWARD: haze fades 0 to 1 (hazeIn)
  // BACKWARD: at the start set the haze to opacity 1 instantly (it is covered by the aha plate), then the haze fades 1 to 0 (back.hazeOut)
  const isFwd = direction === 1;
  const initial = isFwd ? { opacity: 0 } : { opacity: 1 };
  const animate = isFwd ? { opacity: 1 } : { opacity: 0 };
  const transition = isFwd
    ? {
        delay: (PAIR_TIMING.fwd.hazeIn.delay * TIME_SCALE) / 1000,
        duration: (PAIR_TIMING.fwd.hazeIn.duration * TIME_SCALE) / 1000,
        ease: EASE_OUT,
      }
    : {
        delay: (PAIR_TIMING.back.hazeOut.delay * TIME_SCALE) / 1000,
        duration: (PAIR_TIMING.back.hazeOut.duration * TIME_SCALE) / 1000,
        ease: EASE_IN,
      };

  return (
    <m.div
      className="absolute inset-0 pointer-events-none select-none"
      style={{ zIndex: 1 }}
      initial={initial}
      animate={animate}
      transition={transition}
    >
      <img
        src={src}
        alt=""
        draggable={false}
        decoding="async"
        onError={() => setImgError(true)}
        className="w-full h-full object-cover"
      />
    </m.div>
  );
}

export function Stage({
  currentId,
  prevId,
  direction,
  transitioning,
  desktop,
  reducedMotion,
  transitionId,
  enteredAt = {},
  locked = false,
  arriving = false,
}: StageProps) {
  if (!STAGE_ENABLED) return null;

  // Preloading neighbouring scene assets when current page is a staged scene
  useEffect(() => {
    if (!STAGE_ENABLED || !isStaged(currentId)) return;

    const conn = (typeof navigator !== 'undefined' && (navigator as any).connection) || null;
    if (conn?.saveData || conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g') {
      return;
    }

    const runPreload = () => {
      preloadNeighbouringStageAssets(currentId, desktop);
    };

    const win = typeof window !== 'undefined' ? (window as any) : null;
    if (!win) return;

    let handle: any;
    if (typeof win.requestIdleCallback === 'function') {
      handle = win.requestIdleCallback(runPreload);
    } else {
      handle = setTimeout(runPreload, 1500);
    }

    return () => {
      if (typeof win.cancelIdleCallback === 'function') {
        win.cancelIdleCallback(handle);
      } else {
        clearTimeout(handle);
      }
    };
  }, [currentId, desktop]);

  const isCurrentStage = isStageMode(currentId);
  const isPrevStage = prevId !== null && isStageMode(prevId);

  // Stage visibility: the Stage is mounted whenever either side of the transition is a stage scene,
  // and while the current page is a stage scene. When the transition ends and the current page is a fade page, unmount the Stage layers.
  if (!isCurrentStage && (!transitioning || !isPrevStage)) {
    return null;
  }

  const isStagePair = transitioning && isCurrentStage && isPrevStage;

  // Active scene:
  // When target is staged: currentScene is the active one
  // When transition from staged to fade: prevScene stays visible until transition ends
  const currentScene = isCurrentStage ? STAGE_SCENES[currentId] : null;
  const prevScene =
    transitioning && isPrevStage && prevId && prevId !== currentId
      ? STAGE_SCENES[prevId]
      : null;

  if (!currentScene && !prevScene) return null;

  // Haze is shown only during desktop staged transitions between pairs with haze (and not reduced motion)
  const showHaze =
    desktop &&
    isStagePair &&
    !reducedMotion &&
    prevId !== null &&
    hasHaze(currentId, prevId);

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Current scene plate */}
      {currentScene && (
        <StagePlate
          key={`plate-${currentScene.id}-e${enteredAt[currentScene.id] ?? 0}`}
          scene={currentScene}
          state="active"
          currentId={currentId}
          prevId={prevId}
          direction={direction}
          desktop={desktop}
          reducedMotion={reducedMotion}
          transitioning={transitioning}
        />
      )}

      {/* Previous scene plate (during transitions) */}
      {prevScene && (
        <StagePlate
          key={`plate-${prevScene.id}-e${enteredAt[prevScene.id] ?? 0}`}
          scene={prevScene}
          state="leaving"
          currentId={currentId}
          prevId={prevId}
          direction={direction}
          desktop={desktop}
          reducedMotion={reducedMotion}
          transitioning={transitioning}
        />
      )}

      {/* Haze plate (z-index 1) */}
      {showHaze && (
        <StageHazePlate
          key={`haze-t${transitionId ?? 0}`}
          src={HAZE.src}
          direction={direction}
          transitioning={transitioning}
        />
      )}

      {/* Current scene objects */}
      {currentScene?.objects.map((obj, i) => (
        <StageObjectElement
          key={`${currentScene.id}-${obj.id}-e${enteredAt[currentScene.id] ?? 0}`}
          obj={obj}
          index={i}
          state="active"
          transitioning={transitioning}
          direction={direction}
          desktop={desktop}
          reducedMotion={reducedMotion}
          locked={locked}
          arriving={arriving}
        />
      ))}

      {/* Previous scene objects (during transitions) */}
      {prevScene?.objects.map((obj, i) => (
        <StageObjectElement
          key={`${prevScene.id}-${obj.id}-e${enteredAt[prevScene.id] ?? 0}`}
          obj={obj}
          index={i}
          state="leaving"
          transitioning={transitioning}
          direction={direction}
          desktop={desktop}
          reducedMotion={reducedMotion}
        />
      ))}
    </div>
  );
}

export default Stage;
