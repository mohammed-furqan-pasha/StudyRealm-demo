'use client';
import { ArrowRight } from 'lucide-react';
import { usePager } from './PageFlow';
import SceneShell, { SplitHeadline, SceneObject, StageReveal } from './SceneShell';
import TopBar from './TopBar';
import { OBJECTS } from '../data/sceneAssets';
import { RoleConfig, RoleKey, CtaAction } from '../types';
import { ROLE_CONFIGS, CALENDLY_URL } from '../data/roleConfig';

import { HERO_OBJECT_CLASS } from '../lib/stageScenes';
export { HERO_OBJECT_CLASS };

export interface HeroSlideProps {
  config?: RoleConfig['hero'] & { key: RoleKey };
}

export function HeroSlide({ config: propConfig }: HeroSlideProps) {
  const { goTo } = usePager();
  const config = propConfig || { ...ROLE_CONFIGS.Other.hero, key: ROLE_CONFIGS.Other.key };

  const heroObjects: SceneObject[] = [
    {
      src: OBJECTS.heroBook,
      className: HERO_OBJECT_CLASS,
      layer: 'behind',
      depth: 'near',
      eager: true,
    },
    {
      src: OBJECTS.heroBrain,
      className: HERO_OBJECT_CLASS,
      layer: 'behind',
      depth: 'near',
      eager: true,
    },
  ];

  const handleCta = (action: CtaAction) => {
    if (action.type === 'goTo') {
      goTo(action.id);
    } else if (action.type === 'calendly') {
      window.open(CALENDLY_URL, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <SceneShell scene="hero" objects={heroObjects}>
      {/* Static Scrim for Text Legibility */}
      <div
        className="hero-scrim absolute inset-0 pointer-events-none z-0"
        aria-hidden="true"
      />
      <style>{`
        .hero-scrim {
          background: linear-gradient(180deg, transparent 20%, rgba(5,20,40,0.5) 100%);
        }
        @media (min-width: 768px) {
          .hero-scrim {
            background: linear-gradient(90deg, rgba(5,20,40,0.30), transparent 60%);
          }
        }
        .hero-headline,
        .hero-sub {
          text-shadow: 0 2px 24px rgba(5, 20, 40, 0.45);
        }
      `}</style>

      {/* Nav / Top Bar */}
      <TopBar />

      {/* Main Hero Content */}
      <div className="flex-1 w-full px-5 sm:px-8 py-4 flex flex-col justify-center items-start z-10 md:absolute md:left-[7%] md:top-[45%] md:-translate-y-1/2 md:max-w-[52vw] md:w-full md:px-0 md:py-0 md:mx-0 md:justify-start">
        <div
          className="w-full flex flex-col items-start text-left"
          style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
        >
          {/* Tag */}
          <StageReveal order={0} className="w-full">
            <div className="uppercase text-[12px] sm:text-[13px] tracking-[0.2em] text-white/80 font-medium mb-[20px]">
              {config.tag}
            </div>
          </StageReveal>

          {/* Headline */}
          <SplitHeadline
            lines={config.headlineLines}
            className="hero-headline text-white font-semibold text-[clamp(2.6rem,4.9vw,5.5rem)] leading-[1.08] tracking-[-0.02em] max-w-full text-left [text-shadow:0_2px_24px_rgba(5,20,40,0.45)]"
          />

          {/* Sub text */}
          {Boolean(config.sub?.trim()) && (
            <StageReveal order={2} className="w-full">
              <p
                className="hero-sub mt-[24px] text-white/90 text-[clamp(1rem,1.25vw,1.25rem)] max-w-[640px] [text-wrap:balance] font-normal leading-relaxed [text-shadow:0_2px_24px_rgba(5,20,40,0.45)]"
                style={{ fontFamily: 'var(--font-outfit), sans-serif', textShadow: '0 2px 24px rgba(5,20,40,0.45)', textWrap: 'balance' }}
              >
                {config.sub}
              </p>
            </StageReveal>
          )}

          {/* Buttons */}
          <StageReveal order={3} className="w-full md:w-auto">
            <div className="mt-[28px] flex flex-col md:flex-row w-full md:w-auto items-stretch md:items-center gap-[12px] md:gap-[16px]">
              <button
                type="button"
                onClick={() => handleCta(config.primaryCta.action)}
                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                className="h-[52px] px-8 rounded-full font-semibold text-[16px] text-white bg-[#14B8A6] hover:bg-[#0D9488] active:scale-95 transition-all text-center flex items-center justify-center gap-2 select-none cursor-pointer"
              >
                <span>{config.primaryCta.label}</span>
                <ArrowRight className="w-5 h-5 ml-1 shrink-0" />
              </button>
              {config.secondaryCta && (
                <button
                  type="button"
                  onClick={() => config.secondaryCta && handleCta(config.secondaryCta.action)}
                  style={{ fontFamily: 'var(--font-outfit), sans-serif', backgroundColor: 'rgba(5,20,40,0.35)' }}
                  className="h-[52px] px-8 rounded-full font-normal text-[16px] text-white bg-[rgba(5,20,40,0.35)] border border-white/80 hover:bg-white/10 active:scale-95 transition-all text-center flex items-center justify-center gap-2 select-none cursor-pointer"
                >
                  <span>{config.secondaryCta.label}</span>
                </button>
              )}
            </div>
          </StageReveal>
        </div>
      </div>
    </SceneShell>
  );
}
