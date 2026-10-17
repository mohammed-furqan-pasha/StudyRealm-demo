'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { demoChapter } from '../data/demoChapter';
import { ContentBlock, TapRevealSpot } from '../types';
import StainHook from './StainHook';
import KitchenLab from './KitchenLab';

import { playAudio, visibleRatio, watchSectionVisibility, stopAudioFor } from '../lib/tts';

import { ChevronDown } from 'lucide-react';
import GuideBot from './GuideBot';
import SceneShell from './SceneShell';

// ─── TAP REVEAL BLOCK ──────────────────────────────────────────────────────
function TapReveal({
  block,
  onAutoRead,
  shouldStart,
  onComplete,
}: {
  block: Extract<ContentBlock, { type: 'tap_reveal' }>;
  onAutoRead: (t: string) => void;
  shouldStart: () => boolean;
  onComplete?: () => void;
}) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [openLabels, setOpenLabels] = useState<Set<string>>(new Set());
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const hasNotifiedRef = useRef(false);

  useEffect(() => {
    onAutoRead(block.instruction || 'Tap the glowing dots to explore the acid and base diagram.');
  }, [block.instruction, onAutoRead]);

  useEffect(() => {
    if (block.spots.length > 0 && revealed.size === block.spots.length) {
      if (!hasNotifiedRef.current) {
        hasNotifiedRef.current = true;
        onComplete?.();
      }
    } else {
      hasNotifiedRef.current = false;
    }
  }, [revealed.size, block.spots.length, onComplete]);

  const tap = (spot: TapRevealSpot) => {
    setRevealed(p => new Set(p).add(spot.id));
    if (block.style === 'inline_labels') {
      setOpenLabels(p => {
        const next = new Set(p);
        if (next.has(spot.id)) next.delete(spot.id);
        else next.add(spot.id);
        return next;
      });
    } else {
      setActiveLabel(spot.label);
    }
    playAudio(spot.audio, true, 'en-IN', undefined, undefined, shouldStart, 'demo');
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <p className="text-white/80 text-sm text-center">{block.instruction || 'Tap the glowing dots to reveal the parts'}</p>
      <div className="relative w-full rounded-2xl aspect-[4/3] max-w-[520px] mx-auto overflow-hidden bg-slate-900 shadow-lg border border-white/10">
        {!imgError ? (
          <img 
            src={block.asset} 
            alt="Interactive Diagram" 
            className="w-full h-full object-cover" 
            onError={() => setImgError(true)} 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 relative">
            {/* faint grid */}
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            {block.spots.map(spot => {
              const emojiMatch = spot.label.match(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u);
              const emoji = emojiMatch ? emojiMatch[0] : '📍';
              return (
                <div key={`err-${spot.id}`} className="absolute text-[36px] drop-shadow-md pointer-events-none" style={{ left: `${spot.x}%`, top: `${spot.y}%`, transform: 'translate(-50%, -50%)' }}>
                  {emoji}
                </div>
              );
            })}
          </div>
        )}
        {block.spots.map((spot: TapRevealSpot) => {
          const isAbove = spot.y > 40;
          const vStyle: React.CSSProperties = isAbove ? { bottom: 'calc(50% + 24px)' } : { top: 'calc(50% + 24px)' };
          const hAlign = spot.x < 25 ? 'left' : spot.x > 75 ? 'right' : 'center';
          const hStyle: React.CSSProperties = hAlign === 'left' ? { left: 'calc(50% - 18px)' } : hAlign === 'right' ? { right: 'calc(50% - 18px)' } : { left: '50%' };
          const baseTransform = hAlign === 'center' ? 'translateX(-50%)' : '';
          const isOpen = openLabels.has(spot.id);
          
          return (
          <div
            key={spot.id}
            className="absolute"
            style={{
              left: `${spot.x}%`,
              top: `${spot.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: isOpen ? 20 : 10,
            }}
          >
            <button
              onClick={() => tap(spot)}
              className="w-11 h-11 flex items-center justify-center relative z-10"
            >
              {block.style === 'inline_labels' ? (
                <div className="relative flex items-center justify-center w-full h-full">
                  <div className={`absolute w-[10px] h-[10px] rounded-full bg-teal-400 ${!revealed.has(spot.id) ? 'animate-ping opacity-75' : ''}`} style={{ animationDuration: '1.6s' }} />
                  <div className="absolute w-[10px] h-[10px] rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]" />
                  {revealed.has(spot.id) && <div className="absolute w-4 h-4 rounded-full border-[1.5px] border-teal-400 opacity-70" />}
                </div>
              ) : (
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    revealed.has(spot.id)
                      ? 'border-[3px] border-white bg-transparent text-transparent shadow-lg scale-125 ring-2 ring-teal-400 ring-offset-2 ring-offset-black/20'
                      : 'border-2 border-white bg-teal-400 text-white shadow-lg spot-pulse'
                  }`}
                >
                  {revealed.has(spot.id) ? '' : '?'}
                </div>
              )}
            </button>
            {block.style === 'inline_labels' && (
              <div
                className="absolute px-4 py-2 rounded-xl text-white font-medium text-[13px] shadow-xl text-center flex flex-col"
                style={{
                  ...vStyle,
                  ...hStyle,
                  background: 'linear-gradient(180deg, rgba(10,40,58,0.92), rgba(6,22,38,0.96))',
                  border: '1px solid rgba(94, 234, 212, 0.28)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.14), 0 8px 24px rgba(0, 0, 0, 0.4)',
                  width: 'max-content',
                  maxWidth: '220px',
                  whiteSpace: 'normal',
                  transformOrigin: isAbove ? `center bottom` : `center top`,
                  opacity: isOpen ? 1 : 0,
                  transform: isOpen ? `${baseTransform} scale(1)` : `${baseTransform} scale(0.8)`,
                  pointerEvents: isOpen ? 'auto' : 'none',
                  transition: 'all 200ms ease-out',
                }}
                onClick={(e) => { e.stopPropagation(); tap(spot); }}
              >
                <div className="font-bold">{spot.label}</div>
                {spot.definition && <div className="text-[11px] text-white/70 mt-1 leading-snug font-normal">{spot.definition}</div>}
              </div>
            )}
          </div>
        )})}
      </div>

      {block.style !== 'inline_labels' && (
        <>
          <div className="min-h-[48px] flex items-center justify-center">
            {activeLabel ? (
              <div
                className="text-white px-5 py-2 rounded-full font-bold text-sm animate-[slideUp_0.3s_ease-out]"
                style={{
                  background: 'linear-gradient(180deg, rgba(10,40,58,0.85), rgba(6,22,38,0.90))',
                  border: '1px solid rgba(94, 234, 212, 0.28)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.14)',
                }}
              >
                {activeLabel}
              </div>
            ) : (
              <p className="text-white/80 text-sm">Tap the dots to discover each part</p>
            )}
          </div>

          <div className="flex gap-2">
            {block.spots.map((s: TapRevealSpot) => (
              <div key={s.id} className={`w-2 h-2 rounded-full transition-all ${revealed.has(s.id) ? 'bg-yellow-400' : 'bg-white/40'}`} />
            ))}
          </div>

          <button
            onClick={() => { setRevealed(new Set()); setActiveLabel(null); setOpenLabels(new Set()); }}
            className="text-white/80 text-xs hover:text-white transition flex items-center gap-1"
          >
            🔄 Reset Diagram
          </button>
        </>
      )}
    </div>
  );
}

// ─── FLIP CARD BLOCK ───────────────────────────────────────────────────────
function FlipCard({
  block,
  onAutoRead,
  shouldStart,
  onComplete,
}: {
  block: Extract<ContentBlock, { type: 'flip_card' }>;
  onAutoRead: (t: string) => void;
  shouldStart: () => boolean;
  onComplete?: () => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const [hasEverFlipped, setHasEverFlipped] = useState(false);

  useEffect(() => { onAutoRead(block.audio_front); }, [block.audio_front, onAutoRead]);

  const handleFlip = () => {
    const next = !flipped;
    setFlipped(next);
    if (next && !hasEverFlipped) {
      setHasEverFlipped(true);
      onComplete?.();
    }
    playAudio(next ? block.audio_back : block.audio_front, true, 'en-IN', undefined, undefined, shouldStart, 'demo');
  };

  const showFlipInvite = !flipped && !hasEverFlipped;

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {!hasEverFlipped && !flipped ? (
        <p className="inline-flex items-center gap-1.5 rounded-full bg-teal-400/15 border border-teal-300/40 px-3 py-1 text-[13px] font-medium text-teal-200">
          👆 Tap the card
        </p>
      ) : (
        <p className="text-white/80 text-sm text-center opacity-0 select-none pointer-events-none" aria-hidden="true">
          Tap the card to reveal the answer
        </p>
      )}
      <div className="flip-container w-full max-w-[380px] h-[180px] md:h-[200px]">
        <div className={`flip-inner w-full h-full ${flipped ? 'flipped' : ''}`}>
          {/* Front */}
          <div
            className={`flip-face w-full h-full flex flex-col items-center justify-center p-4 md:p-6 cursor-pointer ${
              showFlipInvite ? 'flip-glow' : ''
            }`}
            style={{
              background: 'linear-gradient(180deg, rgba(10,40,58,0.82), rgba(6,22,38,0.88))',
              border: '1px solid rgba(94, 234, 212, 0.28)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.14)',
              borderRadius: '16px',
            }}
            onClick={handleFlip}
          >
            <div className="text-3xl md:text-4xl mb-3">🤔</div>
            <p className="text-white text-center text-xs md:text-base font-medium leading-relaxed">{block.front}</p>
            <p className="text-xs mt-4 absolute bottom-4" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>Tap to flip ↓</p>
          </div>
          {/* Back */}
          <div
            className="flip-face flip-back w-full h-full flex flex-col items-center justify-center p-4 md:p-6 cursor-pointer"
            onClick={handleFlip}
            style={{
              background: 'linear-gradient(135deg, rgba(20,184,166,0.75), rgba(14,116,144,0.75))',
              border: '1px solid rgba(94, 234, 212, 0.35)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.14)',
              borderRadius: '16px',
            }}
          >
            <div className="text-3xl md:text-4xl mb-3">✨</div>
            <p className="text-white text-center text-lg md:text-2xl font-bold">{block.back}</p>
            <p className="text-xs mt-4 absolute bottom-4" style={{ color: 'rgba(255, 255, 255, 0.50)' }}>Tap to flip back ↑</p>
          </div>
        </div>
      </div>
      <button
        onClick={() => { setFlipped(false); onAutoRead(block.audio_front); }}
        className="text-white/80 text-xs hover:text-white transition"
      >
        🔄 Reset Card
      </button>
    </div>
  );
}

// ─── CELEBRATION BLOCK ─────────────────────────────────────────────────────
function CelebrationBlock({ block, onContinue, onAutoRead }: { block: Extract<ContentBlock,{type:'celebration'}>, onContinue:()=>void, onAutoRead:(text:string)=>void }) {
  useEffect(() => {
    onAutoRead('You did it! Acids and bases sounds like a hard chapter, but you just learned it from a haldi stain and a few kitchen bottles. Learning can be this simple.');
  }, [onAutoRead]);

  return (
    <div className="flex flex-col items-center gap-6 text-center py-4">
      <div className="text-5xl md:text-6xl animate-[starBurst_0.6s_cubic-bezier(0.34,1.56,0.64,1)_forwards]">🎉</div>
      <div>
        <h3 className="text-white text-xl md:text-2xl font-bold mb-1">{block.title}</h3>
        <p className="text-white/70 text-[10px] md:text-sm">{block.subtitle}</p>
      </div>
      <div className="flex gap-1 md:gap-2 text-xl md:text-2xl">
        {['⭐','⭐','⭐'].map((s,i) => (
          <span key={i} className="star-burst" style={{ animationDelay: `${i*0.15}s` }}>{s}</span>
        ))}
      </div>
      <div className="w-full bg-white/10 rounded-2xl p-3 md:p-4 border border-white/20">
        <p className="text-white text-xs md:text-sm leading-relaxed">
          This is <strong>one chapter</strong>. There are <strong>400+ moments</strong> like this across every subject, Class 1–10 — Practice, Ranked quizzes, AI doubt-clearing, and full teacher & parent dashboards, all NCF 2023 mapped automatically.
        </p>
      </div>
      <button
        onClick={onContinue}
        className="px-8 py-3.5 rounded-2xl text-black font-bold text-sm transition-all hover:shadow-lg hover:-translate-y-0.5"
        style={{ background: 'linear-gradient(135deg, #FBBF24, #F59E0B)' }}
      >
        See All Features →
      </button>
    </div>
  );
}

// ─── MAIN DEMO PLAYER ──────────────────────────────────────────────────────
const SLIDE_LABELS: Record<string, string> = {
  story_panel: 'Story',
  stain_hook: 'Haldi Stain',
  kitchen_lab: 'Kitchen Lab',
  tap_reveal: 'Tap to Reveal',
  flip_card: 'Flip Card',
  sequence: 'Sequence',
  celebration: 'Complete',
};

interface DemoPlayerProps {
  onComplete: () => void;
  isActive?: boolean;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  prevPageLabel?: string;
  nextPageLabel?: string;
}

export default function DemoPlayer({
  onComplete,
  isActive = true,
  onPrevPage,
  onNextPage,
  prevPageLabel,
  nextPageLabel,
}: DemoPlayerProps) {
  const [current, setCurrent] = useState(0);
  const [partDone, setPartDone] = useState(false);
  const markDone = useCallback(() => setPartDone(true), []);

  useEffect(() => {
    setPartDone(false);
  }, [current]);

  const [speaking, setSpeaking] = useState(false);
  const [direction, setDirection] = useState<'right'|'left'>('right');
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [canScroll, setCanScroll] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const cardScrollRef = useRef<HTMLDivElement>(null);
  const cardContentRef = useRef<HTMLDivElement>(null);
  const scrollRafRef = useRef<number | null>(null);

  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [atTop, setAtTop] = useState(true);
  
  const blocks = demoChapter.blocks;
  const total = blocks.length;
  const block = blocks[current];
  const lastAudioRef = useRef('');

  const isActiveRef = useRef(isActive);
  const isIntersectingRef = useRef(isIntersecting);
  
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  const canSpeakNow = useCallback(
    () => isActiveRef.current && visibleRatio(containerRef.current) >= 0.5,
    []
  );

  const canPlay = isActive && isIntersecting;

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      const isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
      isIntersectingRef.current = isVisible;
      setIsIntersecting(isVisible);
    }, { threshold: [0, 0.5, 1] });
    
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const updateScrollState = useCallback(() => {
    const el = cardScrollRef.current;
    if (!el) return;
    const st = el.scrollTop;
    const ch = el.clientHeight;
    const sh = el.scrollHeight;
    const nextAtTop = st < 8;
    const nextCanScrollUp = st > 1;
    const nextCanScrollDown = sh > ch && st + ch < sh - 2;

    setAtTop((prev) => (prev !== nextAtTop ? nextAtTop : prev));
    setCanScrollUp((prev) => (prev !== nextCanScrollUp ? nextCanScrollUp : prev));
    setCanScrollDown((prev) => (prev !== nextCanScrollDown ? nextCanScrollDown : prev));
  }, []);

  useEffect(() => {
    const el = cardScrollRef.current;
    if (!el) return;

    const onScroll = () => {
      if (scrollRafRef.current !== null) return;
      scrollRafRef.current = requestAnimationFrame(() => {
        updateScrollState();
        scrollRafRef.current = null;
      });
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    };
  }, [updateScrollState]);

  useEffect(() => {
    const el = cardScrollRef.current;
    const contentEl = cardContentRef.current;
    if (!el) return;

    updateScrollState();

    const ro = new ResizeObserver(() => {
      updateScrollState();
    });

    ro.observe(el);
    if (contentEl) ro.observe(contentEl);

    return () => ro.disconnect();
  }, [updateScrollState, current]);

  useEffect(() => {
    if (cardScrollRef.current) {
      cardScrollRef.current.scrollTop = 0;
      updateScrollState();
    }
  }, [current, updateScrollState]);

  useEffect(() => {
    const checkScroll = () => {
      if (!scrollRef.current || !innerRef.current) return;
      setCanScroll(innerRef.current.scrollHeight > scrollRef.current.clientHeight + 1);
    };
    const ro = new ResizeObserver(checkScroll);
    if (scrollRef.current) ro.observe(scrollRef.current);
    if (innerRef.current) ro.observe(innerRef.current);
    checkScroll();
    return () => ro.disconnect();
  }, [current]);

  useEffect(() => watchSectionVisibility(
    () => containerRef.current,
    0.4,
    () => { stopAudioFor('demo'); setSpeaking(false); }
  ), []);

  // When canPlay becomes true, automatically read the last queued audio
  useEffect(() => {
    if (canPlay && lastAudioRef.current) {
      playAudio(lastAudioRef.current, true, 'en-IN', () => setSpeaking(true), () => setSpeaking(false), canSpeakNow, 'demo');
    }
  }, [canPlay, canSpeakNow]);

  const [prevCanPlay, setPrevCanPlay] = useState(canPlay);
  if (canPlay !== prevCanPlay) {
    setPrevCanPlay(canPlay);
    if (!canPlay) {
      stopAudioFor('demo');
      setSpeaking(false);
    }
  }

  const autoRead = useCallback((text: string) => {
    lastAudioRef.current = text;
    if (canSpeakNow()) {
      playAudio(text, true, 'en-IN', () => setSpeaking(true), () => setSpeaking(false), canSpeakNow, 'demo');
    }
  }, [canSpeakNow]);

  const go = (dir: 1|-1) => {
    const next = current + dir;
    if (next < 0 || next >= total) return;
    stopAudioFor('demo');
    setSpeaking(false);
    setPartDone(false);
    setTimeout(() => {
      setDirection(dir === 1 ? 'right' : 'left');
      setCurrent(next);
      if (cardScrollRef.current) cardScrollRef.current.scrollTop = 0;
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, 100);
  };

  const handleScrollDownHint = () => {
    const el = cardScrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientHeight * 0.6;
    const isReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({
      top: scrollAmount,
      behavior: isReduced ? 'auto' : 'smooth',
    });
  };

  const progress = ((current + 1) / total) * 100;

  const isFirstPart = current === 0;
  const isPrevDisabled = isFirstPart && !onPrevPage;
  const handlePrevClick = () => {
    if (isFirstPart) {
      if (onPrevPage) onPrevPage();
    } else {
      go(-1);
    }
  };
  const prevAriaLabel = isFirstPart && prevPageLabel ? `Previous: ${prevPageLabel}` : undefined;

  const isLastPart = current === total - 1;
  const isNextDisabled = isLastPart && !onNextPage;
  const handleNextClick = () => {
    if (isLastPart) {
      if (onNextPage) onNextPage();
    } else {
      go(1);
    }
  };
  const nextAriaLabel = isLastPart && nextPageLabel ? `Next: ${nextPageLabel}` : undefined;

  const showNextGlow = partDone && !isNextDisabled && (block.type === 'tap_reveal' || block.type === 'flip_card');

  return (
    <SceneShell scene="demo">
      <style>{`
        .demo-card-frame {
          height: auto;
          max-height: calc(100dvh - 210px);
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 768px) {
          .demo-card-frame {
            height: min(720px, calc(100dvh - 192px));
            max-height: min(720px, calc(100dvh - 192px));
          }
        }
        @media (min-width: 768px) and (max-height: 959px) {
          .demo-card-scroll {
            padding: 1.5rem 2rem !important;
          }
          .demo-card-scroll h2 {
            font-size: 1.125rem !important;
            line-height: 1.25 !important;
          }
          .demo-card-scroll h3 {
            font-size: 1.25rem !important;
            line-height: 1.25 !important;
          }
        }
        .demo-card-scroll {
          width: 100%;
          height: 100%;
          min-height: 0;
          flex: 1 1 auto;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.4) rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
        }
        .demo-card-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .demo-card-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 3px;
        }
        .demo-card-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.4);
          border-radius: 3px;
        }
        .demo-card-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.6);
        }
      `}</style>

      {/* Static veil */}
      <div
        className="absolute inset-0 pointer-events-none z-0 select-none"
        style={{ background: 'rgba(3,8,18,0.28)' }}
        aria-hidden="true"
      />

      <section
        id="demo"
        ref={containerRef}
        className="relative w-full h-full flex flex-col z-10"
        style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
      >
        {/* Top Progress Area */}
        <div className="relative md:absolute md:top-0 md:inset-x-0 z-20 w-full px-4 md:px-8 pt-4 pb-2 md:py-0 md:h-[72px] flex items-center justify-between gap-3 md:gap-6 shrink-0">
          <div className="text-white/80 text-xs font-bold tracking-widest whitespace-nowrap uppercase shrink-0">
            PART {current + 1} OF {total} · <span className="text-white/70">{SLIDE_LABELS[block.type] || ''}</span>
          </div>
          <div className="flex-1 flex items-center gap-[6px] h-6 max-w-xl" role="tablist" aria-label="Demo parts">
            {blocks.map((b, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to part ${i + 1}: ${SLIDE_LABELS[b.type] || ''}`}
                onClick={() => {
                  stopAudioFor('demo');
                  setSpeaking(false);
                  setPartDone(false);
                  setTimeout(() => {
                    setDirection(i > current ? 'right' : 'left');
                    setCurrent(i);
                    if (cardScrollRef.current) cardScrollRef.current.scrollTop = 0;
                    if (scrollRef.current) scrollRef.current.scrollTop = 0;
                  }, 100);
                }}
                className="flex-1 h-6 flex items-center cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-sm"
              >
                <span
                  className={`w-full h-1 rounded-full transition-colors duration-200 ${
                    i <= current ? 'bg-[#FBBF24]' : 'bg-slate-600 group-hover:bg-slate-500'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="relative z-20 flex-1 min-h-0 w-full h-full flex flex-col">
          {/* Desktop Prev arrow (circular, floating at md:left-8) */}
          <button
            type="button"
            onClick={handlePrevClick}
            disabled={isPrevDisabled}
            aria-label={prevAriaLabel || 'Previous part'}
            className="hidden md:flex absolute md:top-1/2 md:-translate-y-1/2 md:left-8 w-12 h-12 rounded-full text-white items-center justify-center transition disabled:opacity-0 z-30 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            style={{
              background: 'rgba(8, 24, 40, 0.85)',
              border: '1px solid rgba(94, 234, 212, 0.28)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.14)',
            }}
          >
            ‹
          </button>

          {/* Desktop Next arrow (circular, floating at md:right-8) */}
          <button
            type="button"
            onClick={handleNextClick}
            disabled={isNextDisabled}
            aria-label={nextAriaLabel || 'Next part'}
            className={`hidden md:flex absolute md:top-1/2 md:-translate-y-1/2 md:right-8 w-12 h-12 rounded-full text-white items-center justify-center transition disabled:opacity-0 z-30 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
              showNextGlow ? 'next-glow' : ''
            }`}
            style={{
              background: 'rgba(8, 24, 40, 0.85)',
              border: '1px solid rgba(94, 234, 212, 0.28)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.14)',
            }}
          >
            <span className={showNextGlow ? 'next-glow-arrow' : ''}>›</span>
          </button>

          {/* Scroll Wrapper */}
          <div
            ref={scrollRef}
            className={`w-full h-full px-4 md:overflow-hidden ${
              canScroll ? 'overflow-y-auto touch-pan-y' : 'overflow-y-visible'
            } [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`}
          >
            {/* Inner centering div: Card centered in the free band */}
            <div
              ref={innerRef}
              className="min-h-full w-full flex flex-col items-center pt-2 pb-2 md:pt-[72px] md:pb-0"
            >
              {/* Centered group wrapper with margin-block auto for scroll-safe centering */}
              <div className="st-reveal w-full flex flex-col items-center my-auto" style={{ '--o': 0, '--rise': '14vh' } as React.CSSProperties}>
                <div
                  key={current}
                  className={`w-full ${
                    block.type === 'story_panel' ? 'max-w-6xl' : 'max-w-2xl'
                  } mx-auto z-20 flex flex-col items-center my-auto ${
                    direction === 'right' ? 'slide-up-next' : 'slide-up-prev'
                  }`}
                >
                  {/* Fake glass content panel */}
                  <div
                    className="demo-card-frame relative w-full overflow-hidden"
                    style={
                      block.type === 'story_panel'
                        ? {}
                        : {
                            background:
                              'linear-gradient(180deg, rgba(10,40,58,0.82), rgba(6,22,38,0.88))',
                            border: '1px solid rgba(94,234,212,0.28)',
                            boxShadow:
                              '0 4px 24px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.14)',
                            borderRadius: '20px',
                          }
                    }
                  >
                    {/* Top Fade (pinned inside card, outside scrolling content) */}
                    <div
                      aria-hidden="true"
                      className={`absolute top-0 inset-x-0 h-[56px] pointer-events-none z-10 transition-opacity duration-150 ${
                        canScrollUp ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(10,40,58,0.95) 0%, rgba(10,40,58,0) 100%)',
                      }}
                    />

                    {/* Scroll Container */}
                    <div
                      ref={cardScrollRef}
                      tabIndex={0}
                      role="region"
                      aria-label="Lesson content, scrollable"
                      className={`demo-card-scroll w-full h-full outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-inset ${
                        block.type === 'story_panel' ? '' : 'p-5 md:p-10'
                      }`}
                    >
                      <div
                        ref={cardContentRef}
                        className={`w-full flex flex-col items-center ${
                          canScrollDown || canScrollUp ? 'my-0' : 'my-auto'
                        }`}
                      >
                        {block.type === 'stain_hook' && (
                          <StainHook block={block} onAutoRead={autoRead} onNext={() => go(1)} />
                        )}
                        {block.type === 'kitchen_lab' && (
                          <KitchenLab block={block} onAutoRead={autoRead} onNext={() => go(1)} />
                        )}
                        {block.type === 'tap_reveal' && (
                          <TapReveal block={block} onAutoRead={autoRead} shouldStart={canSpeakNow} onComplete={markDone} />
                        )}
                        {block.type === 'flip_card' && (
                          <FlipCard block={block} onAutoRead={autoRead} shouldStart={canSpeakNow} onComplete={markDone} />
                        )}
                        {block.type === 'celebration' && (
                          <CelebrationBlock block={block} onContinue={onComplete} onAutoRead={autoRead} />
                        )}
                      </div>
                    </div>

                    {/* Bottom Fade (pinned inside card, outside scrolling content) */}
                    <div
                      aria-hidden="true"
                      className={`absolute bottom-0 inset-x-0 h-[56px] pointer-events-none z-10 transition-opacity duration-150 ${
                        canScrollDown ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{
                        background:
                          'linear-gradient(0deg, rgba(6,22,38,0.95) 0%, rgba(6,22,38,0) 100%)',
                      }}
                    />

                    {/* Hint Pill */}
                    <button
                      type="button"
                      onClick={handleScrollDownHint}
                      aria-label="Scroll down for more"
                      className={`absolute bottom-[10px] left-1/2 -translate-x-1/2 z-20 h-[28px] px-3 rounded-[14px] flex items-center gap-1.5 text-[12px] text-white/90 font-medium cursor-pointer transition-opacity duration-150 select-none shadow-md ${
                        canScrollDown && atTop
                          ? 'opacity-100 pointer-events-auto'
                          : 'opacity-0 pointer-events-none'
                      }`}
                      style={{
                        background: 'rgba(8, 24, 40, 0.85)',
                        border: '1px solid rgba(94, 234, 212, 0.35)',
                        fontFamily: 'var(--font-outfit), sans-serif',
                      }}
                    >
                      <ChevronDown className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                      <span>Scroll for more</span>
                    </button>
                  </div>

                  {/* Mobile inner navigation row (under card, in normal flow) */}
                  <div className="w-full flex md:hidden justify-between items-center mt-3 z-20">
                    <button
                      type="button"
                      onClick={handlePrevClick}
                      disabled={isPrevDisabled}
                      aria-label={prevAriaLabel || 'Previous part'}
                      className={`min-h-[44px] px-4 rounded-full bg-slate-900/80 border border-white/30 text-sm font-semibold text-white flex items-center justify-center transition cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                        isPrevDisabled ? 'opacity-0 pointer-events-none' : 'hover:bg-white/15 active:scale-95'
                      }`}
                    >
                      ‹ Back
                    </button>

                    <button
                      type="button"
                      onClick={handleNextClick}
                      disabled={isNextDisabled}
                      aria-label={nextAriaLabel || 'Next part'}
                      className={`min-h-[44px] px-4 rounded-full bg-slate-900/80 border border-teal-300/60 text-sm font-semibold text-white flex items-center justify-center transition cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                        isNextDisabled ? 'opacity-0 pointer-events-none' : 'hover:bg-white/15 active:scale-95'
                      } ${showNextGlow ? 'next-glow' : ''}`}
                    >
                      Next part <span className={showNextGlow ? 'next-glow-arrow' : ''}>›</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TTS Bot: fixed bottom-right via GuideBot component */}
        {isIntersecting && (
          <GuideBot
            isReading={speaking}
            onTap={() =>
              playAudio(
                lastAudioRef.current,
                true,
                'en-IN',
                () => setSpeaking(true),
                () => setSpeaking(false),
                canSpeakNow,
                'demo'
              )
            }
          />
        )}
      </section>
    </SceneShell>
  );
}
