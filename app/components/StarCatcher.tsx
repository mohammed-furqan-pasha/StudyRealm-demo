'use client';

import { useState, useEffect } from 'react';
import { useReducedMotion } from 'motion/react';
import { Lock, Check, ArrowRight } from 'lucide-react';
import { playAudio, stopAudioFor } from '../lib/tts';

export interface StarCatcherProps {
  onContinue: () => void;
}

interface StarPosition {
  id: number;
  top: string;
  left: string;
  delay: string;
}

const STAR_POSITIONS: StarPosition[] = [
  { id: 1, top: '24%', left: '16%', delay: '0s' },
  { id: 2, top: '56%', left: '24%', delay: '0.4s' },
  { id: 3, top: '30%', left: '50%', delay: '0.8s' },
  { id: 4, top: '60%', left: '72%', delay: '0.2s' },
  { id: 5, top: '22%', left: '80%', delay: '0.6s' },
];

const THEMES = [
  {
    id: 'neon',
    name: 'Neon City',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #701a75 50%, #0369a1 100%)',
    locked: true,
  },
  {
    id: 'space',
    name: 'Space',
    gradient: 'linear-gradient(135deg, #050b1e 0%, #160d33 50%, #290c42 100%)',
    locked: false,
  },
  {
    id: 'mountain',
    name: 'Mountain',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #0f766e 50%, #1e3a5f 100%)',
    locked: true,
  },
];

const RANKING_DATA = [
  { rank: 1, name: 'Meera', stars: 9, isYou: false },
  { rank: 2, name: 'Rohan', stars: 7, isYou: false },
  { rank: 3, name: 'You', stars: 5, isYou: true },
  { rank: 4, name: 'Kabir', stars: 3, isYou: false },
];

export default function StarCatcher({ onContinue }: StarCatcherProps) {
  const shouldReduceMotion = useReducedMotion();
  const [collectedCount, setCollectedCount] = useState(0);
  const [poppingStars, setPoppingStars] = useState<number[]>([]);
  const [collectedStars, setCollectedStars] = useState<number[]>([]);

  // Audio: read 'Tap the stars!' once on mount using the same playAudio pattern as SurveySection
  useEffect(() => {
    playAudio(
      'Tap the stars!',
      true,
      'en-IN',
      undefined,
      undefined,
      undefined,
      'starCatcher'
    );
    return () => {
      stopAudioFor('starCatcher');
    };
  }, []);

  const handleStarClick = (starId: number) => {
    if (poppingStars.includes(starId) || collectedStars.includes(starId)) return;

    setCollectedCount((prev) => Math.min(5, prev + 1));

    if (shouldReduceMotion) {
      // Under reduced motion: instant removal, no scale/fade
      setCollectedStars((prev) => [...prev, starId]);
    } else {
      setPoppingStars((prev) => [...prev, starId]);
      setTimeout(() => {
        setCollectedStars((prev) => [...prev, starId]);
        setPoppingStars((prev) => prev.filter((id) => id !== starId));
      }, 300);
    }
  };

  const isUnlocked = collectedCount >= 5;

  return (
    <div
      className="w-full max-w-[440px] mx-auto flex flex-col gap-3 select-none text-left"
      style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
    >
      <style>{`
        @keyframes star-bob {
          0%, 100% {
            transform: translateY(-8px);
          }
          50% {
            transform: translateY(8px);
          }
        }
        .star-bobbing {
          animation: star-bob 2.2s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .star-bobbing {
            animation: none !important;
          }
          .star-pop-transition {
            transition: none !important;
          }
          .theme-crossfade {
            transition: none !important;
          }
        }
      `}</style>

      {/* 1. Play Area */}
      <div
        className="relative w-full h-[clamp(200px,34dvh,300px)] rounded-3xl overflow-hidden shadow-2xl border border-[rgba(94,234,212,0.25)] flex items-center justify-center"
      >
        {/* Background Layer 1: Dark Slate-Navy Gradient */}
        <div
          className="theme-crossfade absolute inset-0 bg-gradient-to-b from-[#0b192c] via-[#091524] to-[#040a12] transition-opacity duration-700 pointer-events-none"
          style={{
            opacity: isUnlocked ? 0 : 1,
            transition: shouldReduceMotion ? 'none' : 'opacity 700ms ease-in-out',
          }}
        />

        {/* Background Layer 2: Space Gradient with CSS Star Dots */}
        <div
          className="theme-crossfade absolute inset-0 bg-gradient-to-br from-[#050b1e] via-[#160d33] to-[#290c42] transition-opacity duration-700 pointer-events-none"
          style={{
            opacity: isUnlocked ? 1 : 0,
            transition: shouldReduceMotion ? 'none' : 'opacity 700ms ease-in-out',
          }}
        >
          {/* Subtle star dots for space environment */}
          <span className="absolute top-[18%] left-[22%] w-1.5 h-1.5 rounded-full bg-white/70 shadow-[0_0_6px_#fff]" />
          <span className="absolute top-[48%] left-[12%] w-1 h-1 rounded-full bg-white/60" />
          <span className="absolute top-[68%] left-[36%] w-1.5 h-1.5 rounded-full bg-cyan-200/80 shadow-[0_0_8px_#06b6d4]" />
          <span className="absolute top-[26%] left-[70%] w-2 h-2 rounded-full bg-purple-200/80 shadow-[0_0_8px_#c084fc]" />
          <span className="absolute top-[62%] left-[82%] w-1 h-1 rounded-full bg-white/50" />
          <span className="absolute top-[80%] left-[58%] w-1.5 h-1.5 rounded-full bg-white/70" />
        </div>

        {/* Top-Left: Sample chip */}
        <div className="absolute top-3.5 left-4 z-20 pointer-events-none">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white text-slate-900 select-none shadow-md shrink-0">
            Sample
          </span>
        </div>

        {/* Top-Right: Star Counter */}
        <div className="absolute top-3.5 right-4 z-20 pointer-events-none">
          <div className="text-2xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            ⭐ {collectedCount}/5
          </div>
        </div>

        {/* 2. Five Star Buttons */}
        {STAR_POSITIONS.map((star) => {
          const isCollected = collectedStars.includes(star.id);
          const isPopping = poppingStars.includes(star.id);

          if (isCollected) return null;

          return (
            <button
              key={star.id}
              type="button"
              aria-label={`Collect star ${star.id} of 5`}
              onClick={() => handleStarClick(star.id)}
              onKeyDown={(e) => {
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                  e.stopPropagation();
                }
              }}
              style={{
                top: star.top,
                left: star.left,
                animationDelay: star.delay,
                transform: isPopping
                  ? 'translate(-50%, -50%) scale(1.6)'
                  : 'translate(-50%, -50%)',
                opacity: isPopping ? 0 : 1,
                transition: shouldReduceMotion
                  ? 'none'
                  : isPopping
                  ? 'transform 300ms ease-out, opacity 300ms ease-out'
                  : 'none',
              }}
              className={`absolute w-[56px] h-[56px] min-w-[56px] min-h-[56px] rounded-full flex items-center justify-center z-10 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 select-none touch-manipulation ${
                isPopping ? '' : 'star-bobbing'
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="#FBBF24"
                stroke="#F59E0B"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-10 h-10 drop-shadow-[0_0_12px_rgba(251,191,36,0.85)] filter transition-transform hover:scale-110 active:scale-95"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          );
        })}

        {/* Unlock Celebration Chip at 5/5 */}
        {isUnlocked && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-4 z-20 pointer-events-none"
            style={{
              opacity: 1,
              transition: shouldReduceMotion ? 'none' : 'opacity 400ms ease-out',
            }}
          >
            <div className="px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-violet-600/30 border border-violet-400 text-white backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.45)] flex items-center gap-2 select-none">
              <span>🌌</span>
              <span>Space theme unlocked!</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Theme Swatches */}
      <div className="w-full flex items-center justify-center gap-3 pt-0.5">
        {THEMES.map((theme) => {
          const isThemeUnlocked = theme.id === 'space' ? isUnlocked : false;
          return (
            <div key={theme.id} className="flex flex-col items-center gap-1 select-none">
              <div
                className="relative w-16 h-8 rounded-lg border border-white/20 overflow-hidden flex items-center justify-center shadow-sm"
                style={{ background: theme.gradient }}
              >
                {isThemeUnlocked ? (
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-teal-400 text-slate-900 shadow">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                ) : (
                  <Lock className="w-3.5 h-3.5 text-white/70" />
                )}
              </div>
              <span className="text-[11px] text-slate-300 font-medium">
                {theme.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* 4. Sample Class Ranking (rises in after unlock) */}
      {isUnlocked && (
        <div
          className="w-full space-y-1.5 transition-all duration-500 ease-out"
          style={{
            opacity: isUnlocked ? 1 : 0,
            transform: isUnlocked || shouldReduceMotion ? 'translateY(0)' : 'translateY(12px)',
            transition: shouldReduceMotion
              ? 'none'
              : 'opacity 400ms ease-out, transform 400ms ease-out',
          }}
        >
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {RANKING_DATA.map((row) => (
              <div
                key={row.name}
                className={`px-3 py-1.5 rounded-xl flex items-center justify-between border ${
                  row.isYou
                    ? 'bg-teal-500/20 border-teal-400/50 text-teal-200 font-semibold shadow-[0_0_12px_rgba(20,184,166,0.25)]'
                    : 'bg-white/5 border-white/10 text-slate-300 font-medium'
                }`}
              >
                <span>{row.name}</span>
                <span className="text-amber-300 font-semibold">⭐ {row.stars}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 text-center leading-normal">
            Sample class. Play the chapter to climb!
          </p>
        </div>
      )}

      {/* 5. Primary and Skip Buttons */}
      <div className="w-full flex flex-col items-center gap-1 pt-1">
        <button
          type="button"
          onClick={onContinue}
          style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
          className="w-full h-[52px] px-8 rounded-full font-semibold text-[16px] text-white bg-[#14B8A6] hover:bg-[#0D9488] active:scale-95 transition-all text-center flex items-center justify-center gap-2 select-none cursor-pointer shadow-lg"
        >
          <span>Now play the chapter</span>
          <ArrowRight className="w-5 h-5 ml-1 shrink-0" />
        </button>
        <button
          type="button"
          onClick={onContinue}
          style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
          className="h-[44px] px-6 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer select-none flex items-center justify-center"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
