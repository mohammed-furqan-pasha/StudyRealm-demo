import { SCENES, OBJECTS } from '../data/sceneAssets';

export const STAGE_ENABLED = true;
export const TIME_SCALE = 1.25;

export const EASE_IN = [0.55, 0, 1, 0.45] as const;
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export type T = { delay: number; duration: number }; // milliseconds

export interface StageObject {
  id: string;
  src: string;
  wrapperClass: string;
  imgClass?: string;
  depth: 'far' | 'mid' | 'near';
  travelY: string;
  travelX: string;
  showOnPhone: boolean;
  cover?: boolean;
  timing: {
    enterFwd: T;
    exitFwd: T;
    enterBack: T;
    exitBack: T;
  };
}

export interface StageScene {
  id: string;
  plate: {
    lg: string;
    sm: string;
    position?: string;
    zIndex: number;
  };
  fallback: {
    bgColor: string;
    gradient: string;
  };
  objects: StageObject[];
}

export const HERO_OBJECT_CLASS =
  'absolute left-0 right-0 mx-auto top-[18%] w-[86vw] max-w-[420px] h-auto pointer-events-none object-contain md:left-[68.5%] md:right-auto md:mx-0 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[63vw] md:max-w-[1250px]';

export const STAGE_SCENES: Record<string, StageScene> = {
  hero: {
    id: 'hero',
    plate: {
      lg: SCENES.hero.lg,
      sm: SCENES.hero.sm,
      position: SCENES.hero.position,
      zIndex: 0,
    },
    fallback: {
      bgColor: SCENES.hero.bgColor,
      gradient: SCENES.hero.gradient,
    },
    objects: [
      {
        id: 'hero-book',
        src: OBJECTS.heroBook,
        wrapperClass: HERO_OBJECT_CLASS,
        depth: 'near',
        travelY: '125vh',
        travelX: '120vw',
        showOnPhone: true,
        timing: {
          enterFwd: { delay: 150, duration: 650 },
          exitFwd: { delay: 60, duration: 600 },
          enterBack: { delay: 150, duration: 650 },
          exitBack: { delay: 60, duration: 600 },
        },
      },
      {
        id: 'hero-brain',
        src: OBJECTS.heroBrain,
        wrapperClass: HERO_OBJECT_CLASS,
        depth: 'mid',
        travelY: '90vh',
        travelX: '100vw',
        showOnPhone: true,
        timing: {
          enterFwd: { delay: 250, duration: 650 },
          exitFwd: { delay: 0, duration: 650 },
          enterBack: { delay: 250, duration: 650 },
          exitBack: { delay: 0, duration: 650 },
        },
      },
    ],
  },
  aha: {
    id: 'aha',
    plate: {
      lg: SCENES.aha.lg,
      sm: SCENES.aha.sm,
      position: SCENES.aha.position,
      zIndex: 2,
    },
    fallback: {
      bgColor: SCENES.aha.bgColor,
      gradient: SCENES.aha.gradient,
    },
    objects: [
      {
        id: 'planet',
        src: OBJECTS.planetSpace,
        depth: 'far',
        cover: true,
        wrapperClass: '',
        imgClass: 'absolute left-[32.6%] top-[19%] w-[40.1%] h-auto',
        travelY: '100vh',
        travelX: '150vw',
        showOnPhone: true,
        timing: {
          enterFwd: { delay: 800, duration: 800 },
          exitFwd: { delay: 60, duration: 600 },
          enterBack: { delay: 800, duration: 800 },
          exitBack: { delay: 60, duration: 600 },
        },
      },
      {
        id: 'ground',
        src: OBJECTS.groundSpace,
        depth: 'near',
        cover: true,
        wrapperClass: '',
        imgClass: 'absolute left-0 bottom-0 w-full h-auto',
        travelY: '105%',
        travelX: '105%',
        showOnPhone: true,
        timing: {
          enterFwd: { delay: 650, duration: 750 },
          exitFwd: { delay: 0, duration: 600 },
          enterBack: { delay: 650, duration: 750 },
          exitBack: { delay: 0, duration: 600 },
        },
      },
    ],
  },
  features: {
    id: 'features',
    plate: {
      lg: SCENES.features.lg,
      sm: SCENES.features.sm,
      position: SCENES.features.position,
      zIndex: 2,
    },
    fallback: {
      bgColor: SCENES.features.bgColor,
      gradient: SCENES.features.gradient,
    },
    objects: [
      {
        id: 'planet-horizon',
        src: OBJECTS.planetHorizon,
        depth: 'near',
        cover: true,
        wrapperClass: '',
        imgClass: 'absolute left-0 bottom-0 w-full h-auto',
        travelY: '105%',
        travelX: '105%',
        showOnPhone: true,
        timing: {
          enterFwd: { delay: 650, duration: 750 },
          exitFwd: { delay: 40, duration: 600 },
          enterBack: { delay: 650, duration: 750 },
          exitBack: { delay: 0, duration: 600 },
        },
      },
    ],
  },
  contact: {
    id: 'contact',
    plate: {
      lg: SCENES.contact.lg,
      sm: SCENES.contact.sm,
      position: SCENES.contact.position,
      zIndex: 2,
    },
    fallback: {
      bgColor: SCENES.contact.bgColor,
      gradient: SCENES.contact.gradient,
    },
    objects: [],
  },
};

export type SceneMode = 'stage' | 'fade';

export const SCENE_MODES: Record<string, SceneMode> = {
  hero: 'stage',
  aha: 'stage',
  demo: 'fade',
  features: 'stage',
  survey: 'fade',
  contact: 'stage',
};

export const isStageMode = (id: string): boolean => {
  return SCENE_MODES[id] === 'stage';
};

export const isFadeMode = (id: string): boolean => {
  return SCENE_MODES[id] === 'fade';
};

export const HAZE = {
  src: '/scenes/haze-hero-night.webp',
  pairs: [['hero', 'aha']] as const,
};

export const hasHaze = (a: string, b: string): boolean => {
  return HAZE.pairs.some(
    ([p1, p2]) => (a === p1 && b === p2) || (a === p2 && b === p1)
  );
};

export const PAIR_TIMING = {
  fwd: {
    hazeIn: { delay: 200, duration: 400 },
    plateIn: { delay: 500, duration: 450 },
    textDelayMs: 1050,
    totalMs: 1700,
    unlockMs: 900,
  },
  back: {
    plateOut: { delay: 400, duration: 400 },
    hazeOut: { delay: 700, duration: 400 },
    textDelayMs: 950,
    totalMs: 1600,
    unlockMs: 850,
  },
};

export const PHONE_TIMING = {
  fwd: {
    plateIn: {
      delay: Math.round(PAIR_TIMING.fwd.plateIn.delay * 0.6),
      duration: Math.round(PAIR_TIMING.fwd.plateIn.duration * 0.6),
    },
    textDelayMs: Math.round(PAIR_TIMING.fwd.textDelayMs * 0.6),
    totalMs: Math.round(PAIR_TIMING.fwd.totalMs * 0.6),
    unlockMs: Math.round(PAIR_TIMING.fwd.unlockMs * 0.6),
  },
  back: {
    plateOut: {
      delay: Math.round(PAIR_TIMING.back.plateOut.delay * 0.6),
      duration: Math.round(PAIR_TIMING.back.plateOut.duration * 0.6),
    },
    textDelayMs: Math.round(PAIR_TIMING.back.textDelayMs * 0.6),
    totalMs: Math.round(PAIR_TIMING.back.totalMs * 0.6),
    unlockMs: Math.round(PAIR_TIMING.back.unlockMs * 0.6),
  },
};

export const ARRIVAL_ENABLED = true;
export const ARRIVAL_TIMING = {
  objectsDelayMs: 150,
  textDelayMs: 900,
  totalMs: 1800,
};

export const isStaged = (id: string): boolean => {
  return STAGE_ENABLED && isStageMode(id);
};

const preloadedSrcs = new Set<string>();

export function preloadImage(src: string): void {
  if (!src || typeof window === 'undefined' || preloadedSrcs.has(src)) return;
  preloadedSrcs.add(src);
  try {
    const img = new Image();
    img.src = src;
    if (typeof img.decode === 'function') {
      img.decode().catch(() => {});
    }
  } catch {
    // ignore errors
  }
}

export function preloadNeighbouringStageAssets(currentId: string, desktop: boolean): void {
  if (typeof window === 'undefined') return;

  const conn = (navigator as any)?.connection;
  if (conn?.saveData || conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g') {
    return;
  }

  const otherIds = Object.keys(STAGE_SCENES).filter((id) => id !== currentId);
  for (const otherId of otherIds) {
    const scene = STAGE_SCENES[otherId];
    if (!scene) continue;

    const plateSrc = desktop ? scene.plate.lg : scene.plate.sm;
    preloadImage(plateSrc);

    for (const obj of scene.objects) {
      if (!desktop && !obj.showOnPhone) continue;
      preloadImage(obj.src);
    }

    if (desktop && hasHaze(currentId, otherId)) {
      preloadImage(HAZE.src);
    }
  }
}

