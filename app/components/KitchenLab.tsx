'use client';

import { useState, useEffect, useId, useRef } from 'react';
import { ContentBlock, KitchenLabItem } from '../types';

const MYSTERY_PROMPT = 'Tap the mystery bottle ❓ to test it on a fresh strip';

function PaperStrip({ 
  baseColor, 
  resultColor, 
  state,
  reactive,
  clipId 
}: { 
  baseColor: string, 
  resultColor?: string, 
  state: 'blank' | 'animating' | 'done',
  reactive: boolean,
  clipId: string 
}) {
  return (
    <svg viewBox="0 0 48 80" className="h-[clamp(48px,10dvh,84px)] w-auto drop-shadow-md overflow-visible">
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width="48" height="80" rx="6" />
        </clipPath>
      </defs>
      
      <rect x="0" y="0" width="48" height="80" rx="6" fill={baseColor} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
      <rect x="0" y="0" width="48" height="80" rx="6" fill="rgba(255,255,255,0.1)" />
      
      {state !== 'blank' && resultColor && (
        <>
          {reactive ? (
            state === 'done' ? (
              <rect x="0" y="0" width="48" height="80" rx="6" fill={resultColor} clipPath={`url(#${clipId})`} />
            ) : (
              <g clipPath={`url(#${clipId})`}>
                <circle 
                  cx="24" cy="30" r="60" 
                  fill={resultColor} 
                  className="kl-bloom"
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                />
              </g>
            )
          ) : (
            <circle 
              cx="24" cy="30" r="13" 
              fill="rgba(0,0,0,0.12)" 
              className={state === 'animating' ? 'kl-bloom' : ''}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              clipPath={`url(#${clipId})`}
            />
          )}
        </>
      )}
    </svg>
  );
}

function SpectrumTrack({
  items,
  testedIds,
  labels,
  markerPos,
  markerText,
  compact = false
}: {
  items: KitchenLabItem[];
  testedIds: Set<string>;
  labels: { left: string, mid: string, right: string };
  markerPos: number;
  markerText: string;
  compact?: boolean;
}) {
  const hClass = compact ? 'h-[40px]' : 'h-[56px] md:h-[64px]';
  const chipClass = compact ? 'w-[22px] h-[30px]' : 'w-[28px] h-[38px]';

  const activeItems = items.filter(i => testedIds.has(i.id));

  return (
    <div className="w-full max-w-[460px] flex flex-col gap-1">
      {/* Caption Row */}
      <div className="flex w-full text-[10px] font-bold uppercase tracking-wider px-2 text-white/90">
        <div style={{ width: '38%' }} className="text-left">{labels.left}</div>
        <div style={{ width: `${markerPos - 38}%` }} className="text-center">{labels.mid}</div>
        <div style={{ width: `${100 - markerPos}%` }} className="text-right">{labels.right}</div>
      </div>

      {/* Track */}
      <div 
        className={`relative w-full rounded-xl overflow-hidden border border-white/20 shadow-inner ${hClass}`}
        style={{
          background: 'linear-gradient(to right, #F2B705 0%, #F2B705 58%, #E8590C 72%, #B3261E 92%, #B3261E 100%)'
        }}
      >
        <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-white/60" style={{ left: `${markerPos}%` }} />
        
        {activeItems.map((item, i) => (
          <div 
            key={item.id} 
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 ${chipClass} flex items-center justify-center rounded-md border border-white/30 text-base kl-popIn shadow-sm`} 
            style={{ 
              left: `${item.scale_pos}%`, 
              background: item.result_color, 
              animationDelay: `${i * 120}ms` 
            }}
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {/* Marker Text */}
      <div className="relative w-full h-[14px]">
        <div 
          className="text-[10px] text-white/70 whitespace-nowrap absolute top-0"
          style={{ left: `${markerPos}%`, transform: 'translateX(-50%)' }}
        >
          {markerText}
        </div>
      </div>
    </div>
  );
}

export default function KitchenLab({
  block,
  onAutoRead,
  onNext
}: {
  block: Extract<ContentBlock, { type: 'kitchen_lab' }>;
  onAutoRead: (text: string) => void;
  onNext?: () => void;
}) {
  const baseId = useId();
  const [testedIds, setTestedIds] = useState<Set<string>>(new Set());
  const [isBusy, setIsBusy] = useState(false);
  
  const [activeItem, setActiveItem] = useState<KitchenLabItem | null>(null);
  const [lastItem, setLastItem] = useState<KitchenLabItem | null>(null);
  const [animPhase, setAnimPhase] = useState<'idle' | 'tilt' | 'drop' | 'spread'>('idle');

  const [revealDone, setRevealDone] = useState(false);
  const [mysteryTested, setMysteryTested] = useState(false);
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false);
  const [showClosing, setShowClosing] = useState(false);
  const [nudgeMessage, setNudgeMessage] = useState<string | null>(null);

  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current.clear();
    };
  }, []);

  const addTimeout = (cb: () => void, ms: number) => {
    const id = setTimeout(() => {
      timeoutsRef.current.delete(id);
      cb();
    }, ms);
    timeoutsRef.current.add(id);
    return id;
  };

  const isFirstGuidedUntested = !testedIds.has(block.guided_ids[0]);
  const isSecondGuidedUntested = !isFirstGuidedUntested && !testedIds.has(block.guided_ids[1]);
  const allTested = testedIds.size === block.items.length;
  
  let stepNumber = 1;
  let instruction = block.prompts.first;
  let nextValidId: string | null = block.guided_ids[0];

  if (!isFirstGuidedUntested) {
    if (isSecondGuidedUntested) {
      stepNumber = 2;
      instruction = block.prompts.second;
      nextValidId = block.guided_ids[1];
    } else if (!allTested) {
      stepNumber = 3;
      instruction = block.prompts.others;
      nextValidId = null;
    } else {
      stepNumber = 4;
      instruction = block.prompts.done;
      nextValidId = null;
    }
  }

  let headerText: string | null = instruction;
  if (revealDone) {
    if (!mysteryTested) {
      headerText = MYSTERY_PROMPT;
    } else if (!answeredCorrectly) {
      headerText = block.mystery.question;
    } else {
      headerText = null;
    }
  }

  useEffect(() => {
    if (revealDone) {
      if (!mysteryTested) {
        onAutoRead(MYSTERY_PROMPT);
      }
    } else {
      if (instruction === block.prompts.done) {
        onAutoRead(block.prompts.done + ' ' + block.reveal.takeaway);
      } else {
        onAutoRead(instruction);
      }
    }
  }, [instruction, revealDone, mysteryTested, onAutoRead, block.prompts.done, block.reveal.takeaway]);

  const runTest = (item: KitchenLabItem) => {
    if (isBusy) return;
    if (nextValidId && item.id !== nextValidId && item.id !== 'mystery') return;

    setIsBusy(true);
    setActiveItem(item);
    setNudgeMessage(null);
    
    setAnimPhase('tilt');
    addTimeout(() => setAnimPhase('drop'), 250);
    addTimeout(() => setAnimPhase('spread'), 650);
    
    addTimeout(() => {
      setAnimPhase('idle');
      setLastItem(item);
      if (item.id === 'mystery') {
        setMysteryTested(true);
        if (item.audio) {
          onAutoRead(item.audio + ' ' + block.mystery.question);
        }
      } else {
        if (!testedIds.has(item.id)) {
          setTestedIds(prev => new Set(prev).add(item.id));
        }
        if (item.audio) {
          onAutoRead(item.audio);
        }
      }
      setIsBusy(false);
    }, 1350);
  };

  const handleBottleTap = (e: React.SyntheticEvent, item: KitchenLabItem) => {
    e.stopPropagation();
    e.nativeEvent?.stopImmediatePropagation?.();
    runTest(item);
  };

  const handleNext = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.nativeEvent?.stopImmediatePropagation?.();
    onNext?.();
  };

  return (
    <div className="w-full flex flex-col items-center gap-2 md:gap-3">
      <style>{`
        @keyframes kl-tilt {
          0% { transform: translateY(0) rotate(0deg); }
          20% { transform: translateY(-15px) rotate(-35deg); }
          80% { transform: translateY(-15px) rotate(-35deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        @keyframes kl-drop {
          0% { transform: translateY(0) scale(0); opacity: 0; }
          20% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(calc(clamp(48px,10dvh,84px) * 0.35 + 24px)) scale(1); opacity: 1; }
        }
        @keyframes kl-bloom {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }
        @keyframes kl-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes kl-ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes kl-popIn {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes kl-rise {
          0% { transform: translateY(12px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        .kl-tilt { animation: kl-tilt 0.65s ease-in-out forwards; }
        .kl-drop { animation: kl-drop 0.4s ease-in forwards; }
        .kl-bloom { animation: kl-bloom 0.7s ease-out forwards; }
        .kl-bob { animation: kl-bob 1.4s ease-in-out infinite; }
        .kl-ping { animation: kl-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .kl-popIn { animation: kl-popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .kl-rise { animation: kl-rise 0.4s ease-out forwards; }

        @media (prefers-reduced-motion: reduce) {
          .kl-tilt, .kl-drop, .kl-bloom, .kl-bob, .kl-ping, .kl-popIn, .kl-rise {
            animation: none !important;
          }
          .kl-bloom { transform: scale(1) !important; }
          .kl-rise { transform: translateY(0) !important; opacity: 1 !important; }
          .kl-popIn { transform: scale(1) !important; opacity: 1 !important; }
        }
      `}</style>

      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex flex-col gap-1.5">
          <div className="text-white/50 text-[10px] md:text-xs font-bold uppercase tracking-widest">
            Step {stepNumber} of 4
          </div>
          <div className="flex gap-1 w-[120px]">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full ${s <= stepNumber ? 'bg-amber-400' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>
        <button
          onPointerDown={handleNext}
          className="text-white/60 hover:text-white text-sm font-medium min-h-[44px] px-3 flex items-center justify-center transition-colors"
        >
          Skip ▸
        </button>
      </div>

      {/* Instruction */}
      {headerText && (
        <h2 className="text-base md:text-xl font-bold text-white text-center w-full leading-tight min-h-[48px] flex items-center justify-center px-2 kl-rise">
          {headerText}
        </h2>
      )}

      {/* Dynamic Content Area: Either Shelf or Reveal */}
      {(allTested && !revealDone && !isBusy) ? (
        <div className="w-full flex flex-col items-center gap-4 animate-in fade-in duration-500 mt-2">
          <SpectrumTrack 
            items={block.items} 
            testedIds={testedIds} 
            labels={block.reveal.bar_labels} 
            markerPos={block.reveal.marker_pos}
            markerText={block.reveal.marker_text} 
          />
          
          <div className="w-full max-w-[460px] bg-black/20 border border-white/10 rounded-2xl p-3 flex flex-col gap-1.5 kl-rise mt-2">
            {block.reveal.lines.map((line, i) => (
              <div key={i} className="flex gap-2 text-xs md:text-sm text-white/90 items-start kl-rise" style={{ animationFillMode: 'both', animationDelay: `${i * 500}ms` }}>
                <span>{line.emoji}</span>
                <span>{line.text}</span>
              </div>
            ))}
            <div className="font-bold text-[#FCD34D] mt-2 text-center text-base md:text-lg kl-popIn" style={{ animationFillMode: 'both', animationDelay: `${block.reveal.lines.length * 500}ms` }}>
              {block.reveal.takeaway}
            </div>
            <div className="text-[11px] text-white/50 text-center mt-1 kl-rise" style={{ animationFillMode: 'both', animationDelay: `${block.reveal.lines.length * 500 + 500}ms` }}>
              {block.reveal.teaser}
            </div>
          </div>
          
          <button
            onPointerDown={(e) => {
              e.stopPropagation(); e.nativeEvent?.stopImmediatePropagation?.();
              setRevealDone(true);
            }}
            className="w-full max-w-[460px] min-h-[48px] bg-white text-slate-900 font-bold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-transform hover:scale-105 text-lg flex items-center justify-center kl-popIn mt-2"
            style={{ animationFillMode: 'both', animationDelay: `${block.reveal.lines.length * 500 + 1000}ms` }}
          >
            {block.reveal.continue_label}
          </button>
        </div>
      ) : (
        <>
          {/* Shelf / Bench */}
          <div className="flex flex-nowrap justify-center items-start gap-1.5 sm:gap-3 w-full max-w-xl mx-auto px-1">
            {revealDone && !answeredCorrectly ? (
              <button
                onPointerDown={(e) => handleBottleTap(e, block.mystery.item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleBottleTap(e, block.mystery.item);
                  }
                }}
                className={`relative flex flex-col items-center flex-1 min-w-0 max-w-[90px] p-1 sm:p-2 rounded-xl transition-colors min-h-[44px] ${!isBusy ? 'hover:bg-white/5 cursor-pointer' : 'cursor-default'} kl-popIn`}
              >
                {!mysteryTested && !isBusy && (
                  <div className="absolute inset-0 rounded-xl border-2 border-amber-300 kl-ping opacity-40" />
                )}
                
                <div 
                  className={`relative z-10 w-full flex justify-center ${(!mysteryTested && !isBusy && (!activeItem || animPhase === 'idle')) ? 'kl-bob' : ''} ${activeItem?.id === 'mystery' && (animPhase === 'tilt' || animPhase === 'drop') ? 'kl-tilt' : ''}`}
                  style={{ transformOrigin: 'bottom right' }}
                >
                  <svg viewBox="0 0 40 60" className="h-[clamp(52px,9dvh,80px)] w-auto drop-shadow-md overflow-visible">
                    <path d="M 15 5 L 25 5 L 25 15 L 35 25 L 35 55 A 5 5 0 0 1 30 60 L 10 60 A 5 5 0 0 1 5 55 L 5 25 L 15 15 Z" fill={block.mystery.item.liquid_color} stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
                    <rect x="12" y="2" width="16" height="4" rx="2" fill="rgba(255,255,255,0.8)" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xl md:text-2xl mt-4 drop-shadow-sm pointer-events-none">
                    {block.mystery.item.emoji}
                  </div>
                  {mysteryTested && (
                    <div className="absolute top-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center text-[10px] sm:text-[12px] text-white font-bold border border-black/20 z-20 translate-x-1 -translate-y-1">
                      ✓
                    </div>
                  )}
                </div>

                <div className="relative mt-2 flex justify-center w-full">
                  <div style={{ height: 'clamp(56px,11dvh,90px)', width: 'auto', display: 'flex', justifyContent: 'center' }}>
                    <PaperStrip
                      baseColor={block.indicator_color}
                      resultColor={block.mystery.item.result_color}
                      state={(activeItem?.id === 'mystery' && animPhase === 'spread') ? 'animating' : (mysteryTested ? 'done' : 'blank')}
                      reactive={block.mystery.item.result_color !== block.indicator_color}
                      clipId={`${baseId.replace(/:/g, '')}-mystery`}
                    />
                  </div>
                  {activeItem?.id === 'mystery' && (animPhase === 'drop' || animPhase === 'spread') && (
                    <div 
                      className={`absolute left-1/2 -ml-1.5 w-3 h-3 rounded-full z-10 ${animPhase === 'drop' ? 'kl-drop' : ''}`}
                      style={{ 
                        background: block.mystery.item.liquid_color,
                        opacity: animPhase === 'spread' ? 0 : 1,
                        top: '-24px'
                      }} 
                    />
                  )}
                </div>
                
                <div className="text-xs sm:text-sm text-center text-white mt-2 flex items-center justify-center w-full break-words line-clamp-2 leading-tight">
                  {block.mystery.item.label}
                </div>
              </button>
            ) : (!revealDone ? (
              block.items.map((item: KitchenLabItem) => {
                const isNext = nextValidId === item.id;
                const isTapped = activeItem?.id === item.id;
                const isTested = testedIds.has(item.id);
                
                let stripState: 'blank' | 'animating' | 'done' = 'blank';
                if (isTapped && animPhase === 'spread') {
                  stripState = 'animating';
                } else if (isTested && (!isTapped || animPhase === 'idle')) {
                  stripState = 'done';
                }
                
                return (
                  <button
                    key={item.id}
                    onPointerDown={(e) => handleBottleTap(e, item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleBottleTap(e, item);
                      }
                    }}
                    className={`relative flex flex-col items-center flex-1 min-w-0 max-w-[76px] p-1 sm:p-2 rounded-xl transition-colors min-h-[44px] ${!isBusy ? 'hover:bg-white/5 cursor-pointer' : 'cursor-default'}`}
                  >
                    {isNext && !isBusy && (
                      <div className="absolute inset-0 rounded-xl border-2 border-amber-300 kl-ping opacity-40" />
                    )}
                    
                    <div 
                      className={`relative z-10 w-full flex justify-center ${(isNext && !isBusy && (!isTapped || animPhase === 'idle')) ? 'kl-bob' : ''} ${isTapped && (animPhase === 'tilt' || animPhase === 'drop') ? 'kl-tilt' : ''}`}
                      style={{ transformOrigin: 'bottom right' }}
                    >
                      <svg viewBox="0 0 40 60" className="h-[clamp(44px,8dvh,72px)] w-auto drop-shadow-md overflow-visible">
                        <path d="M 15 5 L 25 5 L 25 15 L 35 25 L 35 55 A 5 5 0 0 1 30 60 L 10 60 A 5 5 0 0 1 5 55 L 5 25 L 15 15 Z" fill={item.liquid_color} stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
                        <rect x="12" y="2" width="16" height="4" rx="2" fill="rgba(255,255,255,0.8)" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-lg md:text-xl mt-3 drop-shadow-sm pointer-events-none">
                        {item.emoji}
                      </div>
                      {isTested && (
                        <div className="absolute top-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-green-500 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] text-white font-bold border border-black/20 z-20 translate-x-1 -translate-y-1">
                          ✓
                        </div>
                      )}
                    </div>
                    
                    <div className="relative mt-2 flex justify-center w-full">
                      <PaperStrip
                        baseColor={block.indicator_color}
                        resultColor={item.result_color}
                        state={stripState}
                        reactive={item.result_color !== block.indicator_color}
                        clipId={`${baseId.replace(/:/g, '')}-${item.id}`}
                      />
                      {isTapped && (animPhase === 'drop' || animPhase === 'spread') && (
                        <div 
                          className={`absolute left-1/2 -ml-1.5 w-3 h-3 rounded-full z-10 ${animPhase === 'drop' ? 'kl-drop' : ''}`}
                          style={{ 
                            background: item.liquid_color,
                            opacity: animPhase === 'spread' ? 0 : 1,
                            top: '-24px'
                          }} 
                        />
                      )}
                    </div>

                    <div className="text-[10px] sm:text-xs text-center text-white/80 mt-2 flex items-center justify-center w-full break-words line-clamp-2 leading-tight">
                      {item.label}
                    </div>
                  </button>
                );
              })
            ) : null)}
          </div>

          {/* Result Chip & Label */}
          {!revealDone && (
            <div className="text-center h-[28px] mt-2 flex flex-col items-center justify-start">
              {!lastItem ? (
                <div className="text-white/50 text-[10px] uppercase tracking-widest">{block.indicator_label}</div>
              ) : (
                <div className="bg-black/40 px-3 py-1 rounded-full text-xs text-white border border-white/10 kl-rise">
                  {lastItem.emoji} {lastItem.label}: <span className="font-bold">{lastItem.result_text}</span>
                </div>
              )}
            </div>
          )}

          {/* Action Area */}
          <div className="flex flex-col items-center justify-center w-full min-h-[48px]">
            {revealDone && mysteryTested && !answeredCorrectly && !isBusy && (
              <div className="flex flex-col items-center gap-3 w-full kl-rise mt-2">
                <SpectrumTrack compact items={block.items} testedIds={testedIds} labels={block.reveal.bar_labels} markerPos={block.reveal.marker_pos} markerText={block.reveal.marker_text} />
                
                <div className="flex flex-col w-full max-w-[372px] gap-2 items-center">
                  <div className="min-h-[20px] flex items-center justify-center">
                    {nudgeMessage && <div className="text-red-300 text-sm font-medium kl-popIn">{nudgeMessage}</div>}
                  </div>
                  
                  <div className="flex gap-3 w-full justify-center">
                    <button
                      onPointerDown={(e) => {
                        e.stopPropagation(); e.nativeEvent?.stopImmediatePropagation?.();
                        setAnsweredCorrectly(true);
                        setShowClosing(true);
                        const combinedAudio = [block.mystery.audio_correct, block.closing.audio].filter(Boolean).join(' ');
                        if (combinedAudio) onAutoRead(combinedAudio);
                      }}
                      className="flex-1 max-w-[180px] min-h-[48px] bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 px-2 kl-popIn"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-[#991B1B] shrink-0" />
                      <span className="text-sm md:text-base leading-tight text-center">{block.mystery.yes_label}</span>
                    </button>
                    <button
                      onPointerDown={(e) => {
                        e.stopPropagation(); e.nativeEvent?.stopImmediatePropagation?.();
                        setNudgeMessage(block.mystery.nudge_text);
                        if (block.mystery.audio_nudge) onAutoRead(block.mystery.audio_nudge);
                      }}
                      className="flex-1 max-w-[180px] min-h-[48px] bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 px-2 kl-popIn"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-[#D97706] shrink-0" />
                      <span className="text-sm md:text-base leading-tight text-center">{block.mystery.no_label}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {answeredCorrectly && (
              <div className="flex flex-col items-center gap-4 w-full kl-rise mt-2">
                <SpectrumTrack 
                  items={[...block.items, block.mystery.item]} 
                  testedIds={new Set([...testedIds, 'mystery'])} 
                  labels={block.reveal.bar_labels} 
                  markerPos={block.reveal.marker_pos}
                  markerText={block.reveal.marker_text} 
                />

                <div className="w-full max-w-[460px] bg-emerald-500/15 border border-emerald-400/30 rounded-2xl p-3 text-center shadow-inner kl-popIn">
                  <p className="text-emerald-300 font-bold text-sm md:text-base mb-1">{block.mystery.correct_text.split('.')[0] + '.'}</p>
                  <p className="text-white/90 text-sm leading-relaxed">{block.mystery.correct_text.substring(block.mystery.correct_text.indexOf('.') + 1).trim()}</p>
                </div>
                
                {showClosing && (
                  <>
                    <div className="w-full max-w-[460px] bg-black/20 border border-white/10 rounded-2xl p-3 text-center kl-rise">
                      <p className="text-white text-sm leading-relaxed">{block.closing.text}</p>
                    </div>

                    <button
                      onPointerDown={handleNext}
                      className="w-full max-w-[460px] min-h-[48px] bg-white text-slate-900 font-bold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-transform hover:scale-105 text-lg flex items-center justify-center kl-popIn"
                    >
                      {block.closing.continue_label}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}
