'use client';

import { useState, useRef } from 'react';
import { m, useReducedMotion } from 'motion/react';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Trophy,
  ClipboardCheck,
  RotateCcw,
  Volume2,
  Star,
  Brain,
  Handshake,
  Sparkles,
  ArrowRight,
  Box,
  type LucideIcon,
} from 'lucide-react';
import { usePager, usePageState } from './PageFlow';
import SceneShell, { SplitHeadline, SceneObject, CoverBox, StageReveal } from './SceneShell';
import TopBar from './TopBar';
import { OBJECTS } from '../data/sceneAssets';
import { FEATURE_CARDS } from '../data/featureCards';
import { ROLE_CONFIGS } from '../data/roleConfig';
import { RoleConfig, FeatureCard } from '../types';

export const MOBILE_FEATURES_TAB_FADE = 0.15;
export const MOBILE_FEATURES_CHIP_SCALE = 0.18;

// Tunable offset to position planet horizon near 80% viewport height
const FEATURES_HORIZON_CLASS = 'absolute left-0 bottom-[-22%] w-full h-auto';

const FEATURES_OBJECT_HORIZON: SceneObject = {
  src: OBJECTS.planetHorizon,
  className: FEATURES_HORIZON_CLASS,
  layer: 'behind',
  depth: 'near',
  cover: true,
};

const FEATURES_SCENE_OBJECTS: SceneObject[] = [FEATURES_OBJECT_HORIZON];

const IMAGE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  '/img/parent-dashboard.webp': { width: 1920, height: 1080 },
  '/img/teacher-analytics.webp': { width: 1920, height: 1080 },
  '/img/teacher-dashboard.webp': { width: 1892, height: 1080 },
  '/img/student-app-brain.webp': { width: 895, height: 544 },
};

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  TrendingUp,
  Users,
  Trophy,
  ClipboardCheck,
  RotateCcw,
  Volume2,
  Star,
  Brain,
  Handshake,
  Box,
};

function getCardIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] || Sparkles;
}

function CardIcon({ name, className }: { name?: string; className?: string }) {
  const Icon = getCardIcon(name || '');
  return <Icon className={className} />;
}

export interface LockedFeaturesProps {
  config?: RoleConfig['features'];
}

export default function LockedFeatures({ config: propConfig }: LockedFeaturesProps) {
  const { goTo } = usePager();
  const { isCurrent = true, isLeaving = false, transitionId = 0 } = usePageState();
  const shouldReduceMotion = useReducedMotion();
  const lastTransitionIdRef = useRef(transitionId);
  const [hasMobileSwitchedTab, setHasMobileSwitchedTab] = useState(false);

  if (lastTransitionIdRef.current !== transitionId) {
    lastTransitionIdRef.current = transitionId;
    if (hasMobileSwitchedTab) {
      setHasMobileSwitchedTab(false);
    }
  }
  const config = propConfig || ROLE_CONFIGS.Other.features;

  const cardIds = config.cardIds || [];
  const cards: FeatureCard[] = cardIds
    .map((id) => FEATURE_CARDS[id])
    .filter(Boolean);

  const [activeTab, setActiveTab] = useState(0);
  const [hasUserSelected, setHasUserSelected] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  const activeCard = cards[activeTab] || cards[0];
  const hasImage = Boolean(activeCard?.image && !failedImages[activeCard.id]);

  const cleanCtaLabel = config.ctaLabel.replace(/[\s→▸►>]+$/, '').trim();

  return (
    <SceneShell scene="features" objects={FEATURES_SCENE_OBJECTS}>
      {/* Static Scrim for Text Legibility */}
      <div
        className="features-scrim absolute inset-0 pointer-events-none z-0"
        aria-hidden="true"
      />
      <style>{`
        .features-scrim {
          background: linear-gradient(180deg, transparent 20%, rgba(3,8,18,0.55) 100%);
        }
        @media (min-width: 768px) {
          .features-scrim {
            background: linear-gradient(90deg, rgba(3,8,18,0.5), transparent 60%);
          }
        }
      `}</style>

      {/* Nav / Top Bar */}
      <TopBar />

      {/* DESKTOP VIEW (>= 768px) */}
      {/* Left Text Column: identical in style and entrance animation to hero and AhaScene */}
      <div
        className="hidden md:flex md:flex-col md:items-start md:text-left md:absolute md:left-[7%] md:top-[45%] md:-translate-y-1/2 md:max-w-[44vw] md:w-full z-10"
        style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
      >
        {/* Tag */}
        <StageReveal order={0} className="w-full">
          <div className="uppercase text-[12px] sm:text-[13px] md:text-[length:calc(13*var(--u))] tracking-[0.2em] text-white/80 font-medium mb-[20px]">
            {config.tag}
          </div>
        </StageReveal>

        {/* Headline: Word-by-word reveal */}
        <SplitHeadline
          lines={config.headlineLines}
          className="text-white font-semibold text-[max(clamp(2.6rem,4.9vw,5.5rem),4.583vw)] leading-[1.08] tracking-[-0.02em] max-w-full text-left [text-shadow:0_2px_24px_rgba(5,20,40,0.45)]"
        />

        {/* Description: 24px below headline */}
        <StageReveal order={2} className="w-full">
          <p className="mt-[24px] text-white/90 text-[max(clamp(1rem,1.25vw,1.25rem),1.0417vw)] max-w-[560px] font-normal leading-relaxed line-clamp-3 [text-shadow:0_2px_24px_rgba(5,20,40,0.45)]">
            {config.description}
          </p>
        </StageReveal>

        {/* Primary Pill Button: 28px below */}
        <StageReveal order={4} className="w-full md:w-auto">
          <button
            type="button"
            onClick={() => goTo('survey')}
            className="mt-[28px] h-[52px] md:h-[52px] px-8 md:px-8 rounded-full font-semibold text-[16px] text-white bg-[#14B8A6] hover:bg-[#0D9488] active:scale-95 transition-all text-center flex items-center justify-center gap-2 select-none cursor-pointer"
            style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
          >
            <span>{cleanCtaLabel}</span>
            <ArrowRight className="w-5 h-5 ml-1 shrink-0" />
          </button>
        </StageReveal>
      </div>

      {/* Right Orbit Window Column (Desktop: Rises 14vh like Page 2 right panel) */}
      <StageReveal
        order={3}
        rise="14vh"
        className="hidden md:flex flex-col gap-[10px] absolute right-[5%] top-[max(92px,12dvh)] w-[clamp(400px,26vw,500px)] z-20"
      >
        <div style={{ fontFamily: 'var(--font-outfit), sans-serif' }} className="flex flex-col gap-[10px] w-full">
        {/* a. WINDOW */}
        <div
          className="rounded-[20px] overflow-hidden border border-[rgba(94,234,212,0.35)] flex flex-col shrink-0"
          style={{
            boxShadow: '0 30px 80px -24px rgba(45,212,191,0.35)',
          }}
        >
          {/* 36px Title Bar */}
          <div className="h-[36px] bg-[rgba(8,20,34,0.96)] px-4 flex items-center justify-between border-b border-[rgba(94,234,212,0.15)] shrink-0 select-none">
            {/* 3 slate-600 dots */}
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-slate-600" />
              <div className="w-2 h-2 rounded-full bg-slate-600" />
              <div className="w-2 h-2 rounded-full bg-slate-600" />
            </div>

            {/* Badge pill */}
            {activeCard && (
              <span className="px-2.5 py-0.5 rounded-full bg-white text-slate-900 text-[12px] font-semibold tracking-wide">
                {activeCard.badge ?? 'Sample data'}
              </span>
            )}
          </div>

          {/* Body: fixed aspect-ratio 16 / 10, background #0B1626 */}
          <div className="relative w-full aspect-[16/10] bg-[#0B1626] overflow-hidden flex items-center justify-center">
            {activeCard && (
              <m.div
                key={activeCard.id}
                initial={hasUserSelected ? { opacity: 0, y: shouldReduceMotion ? 0 : 8 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                transformTemplate={(_, generated) => 'none'}
                className="w-full h-full flex items-center justify-center"
              >
                {hasImage ? (
                  <img
                    src={activeCard.image}
                    alt={activeCard.title}
                    width={activeCard.image ? IMAGE_DIMENSIONS[activeCard.image]?.width : undefined}
                    height={activeCard.image ? IMAGE_DIMENSIONS[activeCard.image]?.height : undefined}
                    loading="lazy"
                    onError={() => handleImageError(activeCard.id)}
                    draggable={false}
                    className="w-full h-full object-contain object-top pointer-events-none select-none"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 select-none">
                    <div className="w-[72px] h-[72px] rounded-full bg-[#14B8A6]/20 border border-[#14B8A6]/40 flex items-center justify-center text-[#14B8A6] mb-3">
                      <CardIcon name={activeCard.icon} className="w-9 h-9" />
                    </div>
                    <p className="text-teal-300 uppercase text-[12px] font-medium tracking-[0.18em] mb-1">
                      {activeCard.kicker}
                    </p>
                    <h4 className="text-white font-semibold text-[22px] leading-tight max-w-sm">
                      {activeCard.title}
                    </h4>
                  </div>
                )}
              </m.div>
            )}
          </div>
        </div>

        {/* b. CHIPS: one grid row whose columns equal the card count */}
        <div
          className="grid gap-2 w-full box-border min-w-0"
          style={{
            gridTemplateColumns: `repeat(${cards.length}, minmax(0, 1fr))`,
          }}
        >
          {cards.map((card, idx) => {
            const isActive = idx === activeTab;
            const Icon = getCardIcon(card.icon);

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => {
                  setHasUserSelected(true);
                  setActiveTab(idx);
                }}
                aria-pressed={isActive}
                className={`min-h-[60px] min-w-0 rounded-[16px] px-1 py-1.5 flex flex-col items-center justify-center gap-1.5 transition select-none cursor-pointer text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                  isActive
                    ? 'bg-[#14B8A6] text-white shadow-md shadow-teal-500/20'
                    : 'bg-[rgba(10,40,58,0.78)] border border-[rgba(94,234,212,0.35)] text-white hover:bg-[rgba(14,54,78,0.85)]'
                }`}
                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span
                  className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full"
                  style={{
                    fontSize: 'clamp(10.5px, 0.78vw, 13px)',
                    fontWeight: 500,
                  }}
                >
                  {card.shortTitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* c. CAPTION */}
        {activeCard && (
          <div className="min-h-[72px] text-left" aria-live="polite">
            <div className="flex items-baseline flex-wrap gap-x-2.5 gap-y-0.5">
              <span
                className="text-white text-[17px] leading-snug"
                style={{ fontFamily: 'var(--font-outfit), sans-serif', fontWeight: 600 }}
              >
                {activeCard.title}
              </span>
              <span
                className="text-teal-300 uppercase text-[11px] font-medium tracking-[0.16em]"
                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
              >
                {activeCard.kicker}
              </span>
            </div>
            <p
              className="mt-1 text-white/85 text-[14.5px] leading-relaxed line-clamp-2"
              style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
            >
              {activeCard.description}
            </p>
          </div>
        )}
        </div>
      </StageReveal>

      {/* MOBILE VIEW (< 768px): TopBar then scroll container */}
      <div
        className="flex md:hidden flex-col w-full px-5 py-4 overflow-y-auto pageflow-scroll pb-36 text-left"
        style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
      >
        {/* Tag */}
        <StageReveal order={0}>
          <div className="uppercase text-[12px] tracking-[0.2em] text-white/80 font-medium mb-2.5">
            {config.tag}
          </div>
        </StageReveal>

        {/* Headline */}
        <SplitHeadline
          lines={config.headlineLines}
          className="text-white font-semibold text-[clamp(2.2rem,6.5vw,3.2rem)] leading-[1.1] tracking-[-0.02em] mb-3 text-left [text-shadow:0_2px_24px_rgba(5,20,40,0.45)]"
        />

        {/* Description */}
        <StageReveal order={2}>
          <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-5 line-clamp-3">
            {config.description}
          </p>
        </StageReveal>

        {/* Window at full width (16/10 ratio) */}
        <StageReveal order={3} rise={30} className="w-full shrink-0">
          <div
            className="rounded-[20px] overflow-hidden border border-[rgba(94,234,212,0.35)] flex flex-col w-full mb-3 shrink-0"
            style={{
              boxShadow: '0 20px 50px -20px rgba(45,212,191,0.35)',
            }}
          >
            {/* 36px Title Bar */}
            <div className="h-[36px] bg-[rgba(8,20,34,0.96)] px-3.5 flex items-center justify-between border-b border-[rgba(94,234,212,0.15)] shrink-0 select-none">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-600" />
                <div className="w-2 h-2 rounded-full bg-slate-600" />
                <div className="w-2 h-2 rounded-full bg-slate-600" />
              </div>
              {activeCard && (
                <span className="px-2 py-0.5 rounded-full bg-white text-slate-900 text-[11px] font-semibold tracking-wide">
                  {activeCard.badge ?? 'Sample data'}
                </span>
              )}
            </div>

            {/* 16/10 Body */}
            <div className="relative w-full aspect-[16/10] bg-[#0B1626] overflow-hidden flex items-center justify-center">
              {activeCard && (
                <m.div
                  key={`mob-${activeCard.id}`}
                  initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: shouldReduceMotion ? 0 : MOBILE_FEATURES_TAB_FADE, ease: [0.22, 1, 0.36, 1] as const }}
                  transformTemplate={(_, generated) => 'none'}
                  className="w-full h-full flex items-center justify-center"
                >
                  {hasImage ? (
                    <img
                      src={activeCard.image}
                      alt={activeCard.title}
                      width={activeCard.image ? IMAGE_DIMENSIONS[activeCard.image]?.width : undefined}
                      height={activeCard.image ? IMAGE_DIMENSIONS[activeCard.image]?.height : undefined}
                      loading="lazy"
                      onError={() => handleImageError(activeCard.id)}
                      draggable={false}
                      className="w-full h-full object-contain object-top pointer-events-none select-none"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 select-none">
                      <div className="w-14 h-14 rounded-full bg-[#14B8A6]/20 border border-[#14B8A6]/40 flex items-center justify-center text-[#14B8A6] mb-2.5">
                        <CardIcon name={activeCard.icon} className="w-7 h-7" />
                      </div>
                      <p className="text-teal-300 uppercase text-[11px] font-medium tracking-[0.18em] mb-1">
                        {activeCard.kicker}
                      </p>
                      <h4 className="text-white font-semibold text-lg leading-tight max-w-xs">
                        {activeCard.title}
                      </h4>
                    </div>
                  )}
                </m.div>
              )}
            </div>
          </div>
        </StageReveal>

        {/* Chips in a 1-row grid matching card count */}
        <StageReveal order={4} className="w-full shrink-0">
          <div
            className="grid gap-2 w-full box-border min-w-0 mb-4 shrink-0"
            style={{
              gridTemplateColumns: `repeat(${cards.length}, minmax(0, 1fr))`,
            }}
          >
            {cards.map((card, idx) => {
              const isActive = idx === activeTab;
              const Icon = getCardIcon(card.icon);

              return (
                <button
                  key={`mob-chip-${card.id}`}
                  type="button"
                  onClick={() => {
                    setHasMobileSwitchedTab(true);
                    setActiveTab(idx);
                  }}
                  aria-pressed={isActive}
                  className={`min-h-[60px] min-w-0 rounded-[16px] px-1 py-1.5 flex flex-col items-center justify-center gap-1.5 transition select-none cursor-pointer text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                    isActive
                      ? 'bg-[#14B8A6] text-white shadow-md shadow-teal-500/20'
                      : 'bg-[rgba(10,40,58,0.78)] border border-[rgba(94,234,212,0.35)] text-white hover:bg-[rgba(14,54,78,0.85)]'
                  }`}
                  style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span
                    className="text-[11px] leading-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-full font-medium"
                  >
                    {isActive && hasMobileSwitchedTab && !shouldReduceMotion && !isLeaving ? (
                      <m.span
                        key={`active-${card.id}`}
                        className="inline-block"
                        animate={{ scale: [1, 1.04, 1] }}
                        transition={{ duration: MOBILE_FEATURES_CHIP_SCALE, ease: [0.22, 1, 0.36, 1] as const }}
                      >
                        {card.shortTitle}
                      </m.span>
                    ) : (
                      card.shortTitle
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </StageReveal>

        {/* Caption */}
        {activeCard && (
          <StageReveal order={5} className="w-full shrink-0">
            <m.div
              key={`mob-caption-${activeCard.id}`}
              initial={hasMobileSwitchedTab && !shouldReduceMotion && !isLeaving ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              transition={{ duration: shouldReduceMotion ? 0 : MOBILE_FEATURES_TAB_FADE, ease: [0.22, 1, 0.36, 1] as const }}
              className="min-h-[72px] text-left shrink-0"
              aria-live="polite"
            >
              <div className="flex items-baseline flex-wrap gap-x-2.5 gap-y-0.5">
                <span
                  className="text-white text-[17px] leading-snug"
                  style={{ fontFamily: 'var(--font-outfit), sans-serif', fontWeight: 600 }}
                >
                  {activeCard.title}
                </span>
                <span
                  className="text-teal-300 uppercase text-[11px] font-medium tracking-[0.16em]"
                  style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                >
                  {activeCard.kicker}
                </span>
              </div>
              <p
                className="mt-1 text-white/85 text-[14.5px] leading-relaxed line-clamp-2"
                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
              >
                {activeCard.description}
              </p>
            </m.div>
          </StageReveal>
        )}

        {/* Primary Button Last */}
        <StageReveal order={6} className="w-full shrink-0">
          <button
            type="button"
            onClick={() => goTo('survey')}
            className="h-[48px] w-full rounded-full font-semibold text-[16px] text-white bg-[#14B8A6] hover:bg-[#0D9488] active:scale-95 transition-all text-center flex items-center justify-center gap-2 select-none cursor-pointer shadow-lg shadow-teal-500/25 mt-3 shrink-0"
          >
            <span>{cleanCtaLabel}</span>
            <ArrowRight className="w-5 h-5 ml-1 shrink-0" />
          </button>
        </StageReveal>
      </div>
    </SceneShell>
  );
}
