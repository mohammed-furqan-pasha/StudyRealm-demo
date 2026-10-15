export interface SceneAsset {
  bgColor: string;
  gradient: string;
  lg: string;
  sm: string;
  position?: string;
}

export type SceneKey = 'hero' | 'aha' | 'demo' | 'features' | 'survey' | 'contact';

export const SCENES: Record<SceneKey, SceneAsset> = {
  hero: {
    bgColor: '#0F3A52',
    gradient: 'linear-gradient(180deg, #0A2441 0%, #12506B 45%, #1B6D87 62%, #D98C68 90%, #8A6A7E 100%)',
    lg: '/scenes/hero-lg.webp',
    sm: '/scenes/hero-sm.webp',
    position: '50% 85%',
  },
  aha: {
    bgColor: '#050B18',
    gradient: 'radial-gradient(ellipse at 72% 12%, #0E3A4A 0%, #07182A 38%, #030812 100%)',
    lg: '/scenes/space-lg.webp',
    sm: '/scenes/space-lg.webp',
    position: '50% 50%',
  },
  demo: {
    bgColor: '#07101E',
    gradient: 'radial-gradient(ellipse at 70% 0%, #0B3140 0%, #07182A 45%, #040A16 100%)',
    lg: '/scenes/space-lg.webp',
    sm: '/scenes/space-lg.webp',
    position: '50% 60%',
  },
  features: {
    bgColor: '#050B18',
    gradient: 'radial-gradient(ellipse at 30% 8%, #0E3A4A 0%, #07182A 40%, #030812 100%)',
    lg: '/scenes/space-lg.webp',
    sm: '/scenes/space-lg.webp',
    position: '50% 0%',
  },
  survey: {
    bgColor: '#07121F',
    gradient: 'radial-gradient(ellipse at 80% 0%, #0B3140 0%, #07182A 45%, #040A16 100%)',
    lg: '/scenes/space-lg.webp',
    sm: '/scenes/space-lg.webp',
    position: '100% 30%',
  },
  contact: {
    bgColor: '#0A1020',
    gradient: 'linear-gradient(180deg, #050B18 0%, #0A1426 60%, #1A1424 100%)',
    lg: '/scenes/space-lg.webp',
    sm: '/scenes/space-lg.webp',
    position: '50% 20%',
  },
} as const;

export const OBJECTS = {
  heroBook: '/objects/hero-book-clear.webp',
  heroBrain: '/objects/hero-brain.webp',
  planetSpace: '/objects/planet-space.webp',
  groundSpace: '/objects/two-human-at-space.webp',
  planetHorizon: '/objects/planet-horizon.webp',
} as const;

export type ObjectKey = keyof typeof OBJECTS;
