'use client';

import { useState, useEffect, useId } from 'react';
import { ContentBlock, KitchenLabItem } from '../types';

function PaperStrip({ 
  baseColor, 
  resultColor, 
  animatingSpread, 
  clipId 
}: { 
  baseColor: string, 
  resultColor?: string, 
  animatingSpread?: boolean, 
  clipId: string 
}) {
  const isSameColor = resultColor === baseColor;
  const spreadFill = isSameColor ? 'rgba(0,0,0,0.1)' : resultColor;
  
  return (
    <svg viewBox="0 0 90 150" className="w-[90px] h-[150px] drop-shadow-md overflow-visible">
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width="90" height="150" rx="8" />
        </clipPath>
      </defs>
      <rect x="0" y="0" width="90" height="150" rx="8" fill={baseColor} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
      <rect x="0" y="0" width="90" height="150" rx="8" fill="rgba(255,255,255,0.1)" />
      
      {resultColor && (
        <circle 
          cx="45" cy="75" 
          r={animatingSpread ? 0 : 120} 
          fill={spreadFill} 
          clipPath={`url(#${clipId})`} 
          style={animatingSpread ? { animation: 'circleGrow 0.7s ease-out forwards' } : {}}
        />
      )}
    </svg>
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
  const [animPhase, setAnimPhase] = useState<'idle' | 'swap' | 'drop' | 'spread'>('idle');

  const [revealDone, setRevealDone] = useState(false);
  const [mysteryTested, setMysteryTested] = useState(false);
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false);
  const [showClosing, setShowClosing] = useState(false);
  const [nudgeMessage, setNudgeMessage] = useState<string | null>(null);

  // Derive state
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

  useEffect(() => {
    onAutoRead(instruction);
  }, [instruction, onAutoRead]);

  useEffect(() => {
    if (allTested && !revealDone) {
      const t = setTimeout(() => {
        onAutoRead(block.reveal.takeaway);
      }, block.reveal.lines.length * 500 + 200);
      return () => clearTimeout(t);
    }
  }, [allTested, revealDone, block.reveal.takeaway, block.reveal.lines.length, onAutoRead]);

  const handleBottleTap = (e: React.PointerEvent, item: KitchenLabItem) => {
    e.stopPropagation();
    e.nativeEvent?.stopImmediatePropagation?.();
    if (isBusy) return;
    
    // Enforce order for guided items
    if (nextValidId && item.id !== nextValidId && item.id !== 'mystery') return;

    setIsBusy(true);
    setActiveItem(item);
    setNudgeMessage(null); // Clear nudge on re-test
    
    // Animation sequence
    setAnimPhase('swap');
    setTimeout(() => setAnimPhase('drop'), 250);
    setTimeout(() => setAnimPhase('spread'), 650);
    
    setTimeout(() => {
      setAnimPhase('idle');
      setLastItem(item);
      if (item.id === 'mystery') {
        setMysteryTested(true);
      } else {
        if (!testedIds.has(item.id)) {
          setTestedIds(prev => new Set(prev).add(item.id));
        }
      }
      if (item.audio) {
        onAutoRead(item.audio);
      }
      setIsBusy(false);
    }, 1350);
  };

  const handleNext = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.nativeEvent?.stopImmediatePropagation?.();
    onNext?.();
  };

  return (
    <div className="w-full flex flex-col items-center">
      <style>{`
        @keyframes stripOut {
          0% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(-40px); opacity: 0; }
        }
        @keyframes stripIn {
          0% { transform: translateX(40px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes bottleTilt {
          0% { transform: translateY(0) rotate(0deg); }
          20% { transform: translateY(-15px) rotate(-35deg); }
          80% { transform: translateY(-15px) rotate(-35deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        @keyframes dropFall {
          0% { transform: translateY(-40px) scale(0); opacity: 0; }
          20% { transform: translateY(-40px) scale(1); opacity: 1; }
          100% { transform: translateY(50px) scale(1); opacity: 1; }
        }
        @keyframes circleGrow {
          0% { r: 0; }
          100% { r: 120; }
        }
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex flex-col gap-1.5">
          <div className="text-white/50 text-[10px] md:text-xs font-bold uppercase tracking-widest">
            Step {stepNumber} of 4
          </div>
          <div className="flex gap-1 w-[120px]">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full ${s <= stepNumber ? 'bg-teal-400' : 'bg-white/20'}`} />
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
      <h2 className="text-lg md:text-2xl font-bold text-white text-center w-full leading-tight min-h-[60px] flex items-center justify-center px-2">
        {instruction}
      </h2>

      {/* Strip Stage */}
      <div className="relative h-[160px] md:h-[180px] w-full flex items-center justify-center mt-2">
        {animPhase === 'swap' ? (
          <>
            <div className="absolute" style={{ animation: 'stripOut 0.25s forwards' }}>
              <PaperStrip baseColor={block.indicator_color} resultColor={lastItem?.result_color} clipId={`${baseId.replace(/:/g, '')}-out`} />
            </div>
            <div className="absolute" style={{ animation: 'stripIn 0.25s forwards' }}>
              <PaperStrip baseColor={block.indicator_color} clipId={`${baseId.replace(/:/g, '')}-in`} />
            </div>
          </>
        ) : (
          <div className="absolute">
            <PaperStrip 
              baseColor={block.indicator_color} 
              resultColor={animPhase === 'idle' ? lastItem?.result_color : activeItem?.result_color} 
              animatingSpread={animPhase === 'spread'}
              clipId={`${baseId.replace(/:/g, '')}-main`} 
            />
            {/* Drop animation */}
            {(animPhase === 'drop' || animPhase === 'spread') && (
              <div 
                className="absolute left-1/2 -ml-2 w-4 h-4 rounded-full z-10" 
                style={{ 
                  background: activeItem?.liquid_color, 
                  animation: animPhase === 'drop' ? 'dropFall 0.4s ease-in forwards' : 'none',
                  opacity: animPhase === 'spread' ? 0 : 1
                }} 
              />
            )}
          </div>
        )}
      </div>

      {/* Result Chip & Label */}
      <div className="text-center mt-1 h-12 flex flex-col items-center justify-start">
        <div className="text-white/50 text-[10px] md:text-xs uppercase tracking-widest">{block.indicator_label}</div>
        <div className="mt-1 h-[28px] flex items-center">
          {(animPhase === 'idle' && lastItem) ? (
            <div className="bg-black/40 px-3 py-1 rounded-full text-xs text-white border border-white/10 animate-in fade-in zoom-in duration-300">
              {lastItem.emoji} {lastItem.label}: <span className="font-bold">{lastItem.result_text}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Shelf */}
      <div className="flex flex-nowrap justify-center items-start gap-1.5 sm:gap-3 w-full max-w-xl mx-auto px-1 mt-4">
        {revealDone ? (
          <div className="relative flex flex-col items-center">
            <button
              onPointerDown={(e) => handleBottleTap(e, block.mystery.item)}
              className={`relative flex flex-col items-center p-2 rounded-xl transition-colors ${!isBusy ? 'hover:bg-white/5 cursor-pointer' : 'cursor-default'}`}
              style={{ minWidth: '84px', minHeight: '66px' }}
            >
              {!mysteryTested && !isBusy && (
                <div className="absolute inset-0 rounded-xl border-2 border-teal-400 animate-ping opacity-40" style={{ animationDuration: '2s' }} />
              )}
              
              <div 
                className="relative z-10"
                style={{ 
                  animation: (activeItem?.id === 'mystery' && (animPhase === 'swap' || animPhase === 'drop')) ? 'bottleTilt 0.65s ease-in-out forwards' : 'none',
                  transformOrigin: 'bottom right',
                  transform: 'scale(1.5)',
                  marginBottom: '16px'
                }}
              >
                <svg viewBox="0 0 40 60" className="w-[32px] h-[48px] md:w-[36px] md:h-[54px] drop-shadow-md overflow-visible">
                  <path d="M 15 5 L 25 5 L 25 15 L 35 25 L 35 55 A 5 5 0 0 1 30 60 L 10 60 A 5 5 0 0 1 5 55 L 5 25 L 15 15 Z" fill={block.mystery.item.liquid_color} stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
                  <rect x="12" y="2" width="16" height="4" rx="2" fill="rgba(255,255,255,0.8)" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-lg md:text-xl mt-3 drop-shadow-sm pointer-events-none">
                  {block.mystery.item.emoji}
                </div>
                {mysteryTested && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border border-black/20 z-20" style={{ transform: 'scale(0.66)' }}>
                    ✓
                  </div>
                )}
              </div>
              
              <div className="text-xs text-center text-white/80 leading-tight mt-1 flex items-center justify-center w-[78px]">
                {block.mystery.item.label}
              </div>
            </button>

            {!mysteryTested && !isBusy && (
              <div className="absolute -bottom-6 animate-bounce text-2xl pointer-events-none drop-shadow-md z-20">👆</div>
            )}
          </div>
        ) : (
          block.items.map((item: KitchenLabItem) => {
            const isNext = nextValidId === item.id;
            const isTapped = activeItem?.id === item.id;
            const isTested = testedIds.has(item.id);
            
            return (
              <div key={item.id} className="relative flex flex-col items-center flex-1 min-w-0 max-w-[76px]">
                <button
                  onPointerDown={(e) => handleBottleTap(e, item)}
                  className={`relative flex flex-col items-center p-1 sm:p-2 rounded-xl transition-colors w-full ${!isBusy ? 'hover:bg-white/5 cursor-pointer' : 'cursor-default'}`}
                  style={{ minHeight: '44px' }}
                >
                  {isNext && !isBusy && (
                    <div className="absolute inset-0 rounded-xl border-2 border-teal-400 animate-ping opacity-40" style={{ animationDuration: '2s' }} />
                  )}
                  
                  <div 
                    className="relative z-10 w-full flex justify-center"
                    style={{ 
                      animation: (isTapped && (animPhase === 'swap' || animPhase === 'drop')) ? 'bottleTilt 0.65s ease-in-out forwards' : 'none',
                      transformOrigin: 'bottom right'
                    }}
                  >
                    <svg viewBox="0 0 40 60" className="w-full h-auto drop-shadow-md overflow-visible">
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
                  
                  <div className="text-[10px] leading-tight sm:text-xs text-center text-white/80 mt-1 flex items-center justify-center w-full break-words line-clamp-3">
                    {item.label}
                  </div>
                </button>

                {isNext && !isBusy && (
                  <div className="absolute -bottom-6 animate-bounce text-xl pointer-events-none drop-shadow-md z-20">👆</div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Color Bar */}
      <div className="w-full mt-10 md:mt-12 px-4 max-w-[400px]">
        {allTested && (
          <div className="flex justify-between w-full text-[10px] text-white/50 mb-1 px-1 font-bold uppercase tracking-wider">
            <span>{block.reveal.bar_labels.left}</span>
            <span>{block.reveal.bar_labels.mid}</span>
            <span>{block.reveal.bar_labels.right}</span>
          </div>
        )}
        <div className="relative w-full h-[14px] rounded-full bg-gradient-to-r from-white/10 via-white/20 to-white/10 border border-white/10 shadow-inner mt-2">
          {allTested && (
            <div 
              className="absolute top-0 -translate-y-[120%] flex flex-col items-center animate-in fade-in duration-500 pointer-events-none"
              style={{ left: `${block.reveal.marker_pos}%`, transform: `translateX(-50%) translateY(-120%)` }}
            >
              <div className="text-[10px] text-yellow-400 font-bold whitespace-nowrap mb-0.5">{block.reveal.marker_text}</div>
              <div className="text-yellow-400 text-[10px]">▼</div>
            </div>
          )}

          {[...block.items, ...(mysteryTested ? [block.mystery.item] : [])].map((item: KitchenLabItem) => {
            if (testedIds.has(item.id) || item.id === 'mystery') {
              return (
                <div 
                  key={item.id} 
                  className="absolute top-1/2 -translate-y-1/2 -ml-3 w-6 h-6 flex items-center justify-center bg-[#1E293B] border border-white/20 rounded-full text-xs z-10 drop-shadow-lg"
                  style={{ 
                    left: `${item.scale_pos}%`,
                    animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                  }}
                >
                  {item.emoji}
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>

      {/* Action Area */}
      <div className="mt-8 flex flex-col items-center justify-center w-full min-h-[48px]">
        {allTested && !revealDone && !isBusy && (
          <div className="flex flex-col items-center gap-4 w-full animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
              {block.reveal.lines.map((line, i) => (
                <div key={i} className="flex gap-2 text-sm text-white/90 items-start animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationFillMode: 'both', animationDelay: `${i * 500}ms` }}>
                  <span>{line.emoji}</span>
                  <span>{line.text}</span>
                </div>
              ))}
              <div className="font-bold text-teal-400 mt-2 text-center text-lg animate-in fade-in zoom-in duration-500" style={{ animationFillMode: 'both', animationDelay: `${block.reveal.lines.length * 500}ms` }}>
                {block.reveal.takeaway}
              </div>
              <div className="text-[11px] text-white/50 text-center mt-1 animate-in fade-in duration-500" style={{ animationFillMode: 'both', animationDelay: `${block.reveal.lines.length * 500 + 500}ms` }}>
                {block.reveal.teaser}
              </div>
            </div>
            
            <button
              onPointerDown={(e) => {
                e.stopPropagation(); e.nativeEvent?.stopImmediatePropagation?.();
                setRevealDone(true);
              }}
              className="w-full max-w-[320px] min-h-[48px] bg-white text-slate-900 font-bold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-transform hover:scale-105 text-lg flex items-center justify-center animate-in fade-in zoom-in duration-500 mt-2"
              style={{ animationFillMode: 'both', animationDelay: `${block.reveal.lines.length * 500 + 1000}ms` }}
            >
              {block.reveal.continue_label}
            </button>
          </div>
        )}

        {revealDone && mysteryTested && !answeredCorrectly && !isBusy && (
          <div className="flex flex-col items-center gap-4 w-full animate-in slide-in-from-bottom-4 fade-in duration-500">
            <h3 className="text-white text-lg font-bold text-center leading-tight">{block.mystery.question}</h3>
            
            {nudgeMessage && (
              <div className="text-red-300 text-sm font-medium animate-in fade-in zoom-in duration-200">
                {nudgeMessage}
              </div>
            )}
            
            <div className="flex gap-3 w-full justify-center">
              <button
                onPointerDown={(e) => {
                  e.stopPropagation(); e.nativeEvent?.stopImmediatePropagation?.();
                  setAnsweredCorrectly(true);
                  if (block.mystery.audio_correct) onAutoRead(block.mystery.audio_correct);
                  setTimeout(() => {
                    setShowClosing(true);
                    if (block.closing.audio) onAutoRead(block.closing.audio);
                  }, 4500);
                }}
                className="flex-1 max-w-[160px] min-h-[48px] bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center px-2"
              >
                <span className="text-sm md:text-base leading-tight text-center">{block.mystery.yes_label}</span>
              </button>
              <button
                onPointerDown={(e) => {
                  e.stopPropagation(); e.nativeEvent?.stopImmediatePropagation?.();
                  setNudgeMessage(block.mystery.nudge_text);
                  if (block.mystery.audio_nudge) onAutoRead(block.mystery.audio_nudge);
                }}
                className="flex-1 max-w-[160px] min-h-[48px] bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-xl transition-colors flex items-center justify-center px-2"
              >
                <span className="text-sm md:text-base leading-tight text-center">{block.mystery.no_label}</span>
              </button>
            </div>
          </div>
        )}

        {answeredCorrectly && (
          <div className="flex flex-col items-center gap-4 w-full animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="w-full bg-teal-500/20 border border-teal-500/30 rounded-2xl p-4 text-center shadow-inner">
              <p className="text-teal-300 font-bold text-lg mb-2">{block.mystery.correct_text.split('.')[0] + '.'}</p>
              <p className="text-white/90 text-sm leading-relaxed">{block.mystery.correct_text.substring(block.mystery.correct_text.indexOf('.') + 1).trim()}</p>
            </div>
            
            {showClosing && (
              <>
                <div className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-center mt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <p className="text-white text-sm leading-relaxed">{block.closing.text}</p>
                </div>

                <button
                  onPointerDown={handleNext}
                  className="w-full max-w-[320px] min-h-[48px] bg-white text-slate-900 font-bold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-transform hover:scale-105 text-lg flex items-center justify-center animate-in fade-in zoom-in duration-500 mt-2"
                >
                  {block.closing.continue_label}
                </button>
              </>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
