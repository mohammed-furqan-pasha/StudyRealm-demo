'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { demoChapter } from '../data/demoChapter';
import { ContentBlock, TapRevealSpot } from '../types';

import { playAudio } from '../lib/tts';

// ─── GUIDEBOT ──────────────────────────────────────────────────────────────
function GuideBot({ isReading, onTap }: { isReading: boolean; onTap: () => void }) {
  const [isAwake, setIsAwake] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  const [prevIsReading, setPrevIsReading] = useState(isReading);
  if (isReading !== prevIsReading) {
    setPrevIsReading(isReading);
    if (isReading) setIsAwake(true);
  }

  useEffect(() => {
    if (!isAwake) return;
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, Math.random() * 4000 + 2000);
    return () => clearInterval(interval);
  }, [isAwake]);

  let eyeJSX;
  if (!isAwake || isBlinking) {
    eyeJSX = (
      <>
        <line x1="20" y1="29" x2="26" y2="29" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
        <line x1="34" y1="29" x2="40" y2="29" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
      </>
    );
  } else if (isReading) {
    eyeJSX = (
      <>
        <path d="M20 30 Q23 26 26 30" stroke="#FFD700" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M34 30 Q37 26 40 30" stroke="#FFD700" strokeWidth="2" fill="none" strokeLinecap="round" />
      </>
    );
  } else {
    eyeJSX = (
      <>
        <circle cx="23" cy="29" r="3" fill="#FFD700" />
        <circle cx="37" cy="29" r="3" fill="#FFD700" />
      </>
    );
  }

  const handleTap = () => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsAwake(false);
      // The onEnd callback from playAudio will set isReading to false
    } else {
      setIsAwake(true);
      onTap();
    }
  };

  return (
    <div 
      onClick={handleTap}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 30,
        cursor: 'pointer',
        animation: 'float 3s ease-in-out infinite',
        filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))'
      }}
      title="Tap to replay audio"
    >
      <svg width="60" height="70" viewBox="0 0 60 70" fill="none">
        {/* Antenna */}
        <path d="M30 15L30 5" stroke="gold" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="30" cy="5" r="3" fill="gold" opacity={isReading ? 1 : 0.5}/>
        
        {/* Body */}
        <rect x="10" y="15" width="40" height="35" rx="12" 
          fill="rgba(255,255,255,0.10)" 
          stroke="rgba(255,255,255,0.18)" strokeWidth="2"/>
        
        {/* Screen/face */}
        <rect x="15" y="22" width="30" height="15" rx="6" fill="rgba(0,0,0,0.6)"/>
        
        {/* Eyes — render based on state */}
        {eyeJSX}
        
        {/* Legs */}
        <path d="M20 50L25 60L35 60L40 50" fill="rgba(255,255,255,0.1)"/>
        
        {/* Base glow */}
        <circle cx="30" cy="62" r="6" fill="#FFD700" 
          opacity={isAwake ? 1 : 0.4}
          style={{ animation: isReading ? 'pulse 0.5s infinite alternate' : 'pulse 1.5s infinite alternate' }}/>
      </svg>
    </div>
  );
}

// ─── STORY PANEL BLOCK ─────────────────────────────────────────────────────
function StoryBlock({ block, onAutoRead }: { block: Extract<ContentBlock, {type:'story_panel'}>, onAutoRead: (t:string)=>void }) {
  const [idx, setIdx] = useState(0);
  const panels = block.panels;
  const cur = panels[idx];

  useEffect(() => {
    onAutoRead(panels[0].text);
  }, [onAutoRead, panels]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div
        className="relative w-full rounded-2xl overflow-hidden cursor-pointer bg-black/20 h-[250px] md:h-[300px]"
        onClick={() => { if (idx < panels.length - 1) setIdx(i => i + 1); }}
      >
        <Image src={cur.asset} alt="Story" width={800} height={800} className="w-full h-full object-contain" />
        {idx < panels.length - 1 && (
          <div className="absolute bottom-3 right-3 bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium">
            Tap for next →
          </div>
        )}
      </div>
      <div className="w-full rounded-2xl p-3 md:p-4 shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.10)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
        <p className="text-white text-xs md:text-base leading-relaxed text-center font-medium">{cur.text}</p>
      </div>
      <div className="flex gap-2">
        {panels.map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === idx ? 'bg-yellow-400 w-6' : 'bg-white/40'}`} />
        ))}
      </div>
    </div>
  );
}

// ─── TAP REVEAL BLOCK ──────────────────────────────────────────────────────
function TapReveal({ block, onAutoRead }: { block: Extract<ContentBlock, {type:'tap_reveal'}>, onAutoRead:(t:string)=>void }) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  useEffect(() => {
    onAutoRead(block.instruction || 'Tap the glowing dots to explore the Water Cycle diagram.');
  }, [block.instruction, onAutoRead]);

  const tap = (spot: TapRevealSpot) => {
    setRevealed(p => new Set(p).add(spot.id));
    setActiveLabel(spot.label);
    playAudio(spot.audio, true, 'en-IN');
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <p className="text-white/80 text-sm text-center">{block.instruction || 'Tap the glowing dots to reveal the parts'}</p>
      <div className="relative inline-block w-full rounded-2xl overflow-hidden" style={{ maxWidth: 420 }}>
        <Image src={block.asset} alt="Water Cycle Diagram" width={800} height={800} className="w-full h-auto rounded-2xl" />
        {block.spots.map(spot => (
          <button
            key={spot.id}
            onClick={() => tap(spot)}
            className="absolute"
            style={{
              left: `${spot.x}%`,
              top: `${spot.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                revealed.has(spot.id)
                  ? 'border-[3px] border-white bg-transparent text-transparent shadow-lg scale-125 ring-2 ring-teal-400 ring-offset-2 ring-offset-black/20'
                  : 'border-2 border-white bg-teal-400 text-white shadow-lg spot-pulse'
              }`}
            >
              {revealed.has(spot.id) ? '' : '?'}
            </div>
          </button>
        ))}
      </div>

      <div className="min-h-[48px] flex items-center justify-center">
        {activeLabel ? (
          <div className="text-white px-5 py-2 rounded-full font-bold text-sm animate-[slideUp_0.3s_ease-out]" style={{ background: 'rgba(255, 255, 255, 0.10)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
            {activeLabel}
          </div>
        ) : (
          <p className="text-white/80 text-sm">Tap the dots to discover each part</p>
        )}
      </div>

      <div className="flex gap-2">
        {block.spots.map(s => (
          <div key={s.id} className={`w-2 h-2 rounded-full transition-all ${revealed.has(s.id) ? 'bg-yellow-400' : 'bg-white/40'}`} />
        ))}
      </div>

      <button
        onClick={() => { setRevealed(new Set()); setActiveLabel(null); }}
        className="text-white/80 text-xs hover:text-white transition flex items-center gap-1"
      >
        🔄 Reset Diagram
      </button>
    </div>
  );
}

// ─── FLIP CARD BLOCK ───────────────────────────────────────────────────────
function FlipCard({ block, onAutoRead }: { block: Extract<ContentBlock, {type:'flip_card'}>, onAutoRead:(t:string)=>void }) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => { onAutoRead(block.audio_front); }, [block.audio_front, onAutoRead]);

  const handleFlip = () => {
    const next = !flipped;
    setFlipped(next);
    playAudio(next ? block.audio_back : block.audio_front, true, 'en-IN');
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <p className="text-white/80 text-sm text-center">Tap the card to reveal the answer</p>
      <div className="flip-container w-full max-w-[380px] h-[180px] md:h-[200px]">
        <div className={`flip-inner w-full h-full ${flipped ? 'flipped' : ''}`}>
          {/* Front */}
          <div className="flip-face w-full h-full flex flex-col items-center justify-center p-4 md:p-6 cursor-pointer" style={{ background: 'rgba(255, 255, 255, 0.10)', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)', border: '1px solid rgba(255, 255, 255, 0.18)', boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.20)', borderRadius: '16px' }} onClick={handleFlip}>
            <div className="text-3xl md:text-4xl mb-3">🤔</div>
            <p className="text-white text-center text-xs md:text-base font-medium leading-relaxed">{block.front}</p>
            <p className="text-xs mt-4 absolute bottom-4" style={{ color: 'rgba(255, 255, 255, 0.50)' }}>Tap to flip ↓</p>
          </div>
          {/* Back */}
          <div className="flip-face flip-back w-full h-full flex flex-col items-center justify-center p-4 md:p-6 cursor-pointer" onClick={handleFlip}
            style={{ background: 'linear-gradient(135deg, rgba(45,212,191,0.6), rgba(59,130,246,0.6))', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)', border: '1px solid rgba(255, 255, 255, 0.18)', boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.20)', borderRadius: '16px' }}>
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

// ─── SEQUENCE BLOCK ────────────────────────────────────────────────────────
function SequenceBlock({ block, onAutoRead }: { block: Extract<ContentBlock, {type:'sequence'}>, onAutoRead: (text: string) => void }) {
  const [pool, setPool] = useState<string[]>([...block.steps]);
  const [placed, setPlaced] = useState<(string | null)[]>(Array(block.steps.length).fill(null));
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    onAutoRead(block.instruction);
    return () => {
      setPool([...block.steps]);
      setPlaced(Array(block.steps.length).fill(null));
      setStatus('idle');
      setShaking(false);
    };
  }, [block, onAutoRead]);

  const handleTapPool = (step: string) => {
    if (status !== 'idle') return;
    const nextEmpty = placed.indexOf(null);
    if (nextEmpty === -1) return;
    setPlaced(p => { const n = [...p]; n[nextEmpty] = step; return n; });
    setPool(p => p.filter(s => s !== step));
  };

  const handleTapSlot = (slotIndex: number) => {
    if (status !== 'idle') return;
    const step = placed[slotIndex];
    if (!step) return;
    setPlaced(p => { const n = [...p]; n[slotIndex] = null; return n; });
    setPool(p => [...p, step]);
  };

  const handleCheck = () => {
    const userOrder = placed.map(step => block.steps.indexOf(step!));
    const isCorrect = userOrder.every((v, i) => v === block.correct_order[i]);

    if (isCorrect) {
      setStatus('correct');
      playAudio("Amazing! You got the correct order. First, evaporation happens when the sun heats the water. Then condensation forms clouds. Next, precipitation brings rain. Finally, collection fills our rivers and oceans — and the cycle begins again!", true, 'en-IN');
    } else {
      setStatus('wrong');
      setShaking(true);
      playAudio("Oops! That's not quite right. Think about what happens first when the sun shines on the water. Try again!", true, 'en-IN');
      setTimeout(() => {
        setShaking(false);
        setStatus('idle');
        setPool([...block.steps]);
        setPlaced(Array(block.steps.length).fill(null));
      }, 800);
    }
  };

  const isFull = placed.every(s => s !== null);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <p className="text-white text-sm text-center font-medium mb-3">{block.instruction}</p>
      
      <div className="w-full">
        <p className="text-white/50 text-xs mb-2">Steps to arrange:</p>
        <div className="flex flex-wrap gap-2">
          {pool.map((step, i) => (
            <button
              key={i}
              onClick={() => handleTapPool(step)}
              className="rounded-full text-white cursor-pointer transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(45,212,191,0.5)',
                padding: '8px 14px',
                fontSize: '0.85rem'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.20)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'none'; }}
            >
              {step}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center my-2" style={{ color: 'rgba(255,255,255,0.3)' }}>↓</div>

      <div className="w-full" style={{ animation: shaking ? 'shake 0.5s ease-in-out' : 'none' }}>
        <p className="text-white/50 text-xs mb-2">Your order:</p>
        <div className="flex flex-col gap-2">
          {placed.map((step, i) => {
            const isEmpty = !step;
            let borderStyle = '1px dashed rgba(255,255,255,0.25)';
            let boxShadow = 'none';
            if (status === 'correct') {
              borderStyle = '2px solid #4ade80';
              boxShadow = '0 0 12px rgba(74, 222, 128, 0.4)';
            } else if (status === 'wrong') {
              borderStyle = '2px solid #f87171';
              boxShadow = '0 0 12px rgba(248, 113, 113, 0.4)';
            } else if (!isEmpty) {
              borderStyle = '1px solid rgba(255,255,255,0.25)';
            }
            
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center text-white font-bold text-sm relative"
                  style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.20)' }}>
                  {i + 1}
                  {status === 'correct' && <span className="absolute -top-1 -right-1 text-xs bg-green-500 rounded-full w-4 h-4 flex items-center justify-center">✓</span>}
                </div>
                <div
                  onClick={() => handleTapSlot(i)}
                  className={`flex-1 min-h-[40px] flex items-center justify-between rounded-xl px-3 py-2 transition-all duration-300 ${!isEmpty && status === 'idle' ? 'cursor-pointer' : ''}`}
                  style={{ border: borderStyle, boxShadow }}
                >
                  {isEmpty ? (
                    <span className="italic text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Tap a step above to place here</span>
                  ) : (
                    <>
                      <span className="text-white text-sm">{step}</span>
                      {status === 'idle' && <span style={{ color: 'rgba(255,255,255,0.5)' }}>✕</span>}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isFull && (
          <button
            onClick={status === 'idle' ? handleCheck : undefined}
            className="w-full mt-3 rounded-full py-3 text-white font-bold text-sm transition-all duration-200"
            style={{
              background: status === 'correct' ? '#4ade80' : 'linear-gradient(135deg, #14B8A6, #3B82F6)',
              cursor: status === 'correct' ? 'default' : 'pointer'
            }}
          >
            {status === 'correct' ? '✓ Correct!' : 'Check Order ✓'}
          </button>
        )}
      </div>

      {status === 'correct' && (
        <div className="w-full animate-[slideUp_0.3s_ease-out] text-center mt-4" style={{ background: 'rgba(74, 222, 128, 0.15)', border: '1px solid rgba(74, 222, 128, 0.3)', borderRadius: '12px', padding: '12px 16px' }}>
          <p style={{ color: '#4ade80' }} className="text-sm font-medium">🎉 Perfect order! The Water Cycle flows correctly.</p>
        </div>
      )}
    </div>
  );
}

// ─── CELEBRATION BLOCK ─────────────────────────────────────────────────────
function CelebrationBlock({ block, onContinue }: { block: Extract<ContentBlock,{type:'celebration'}>, onContinue:()=>void }) {
  useEffect(() => {
    playAudio('Amazing! You just completed the Water Cycle chapter. You are a star learner!', true, 'en-IN');
  }, []);

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
export default function DemoPlayer({ onComplete, isActive = true }: { onComplete: () => void, isActive?: boolean }) {
  const [current, setCurrent] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [direction, setDirection] = useState<'right'|'left'>('right');
  const [isIntersecting, setIsIntersecting] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  
  const blocks = demoChapter.blocks;
  const total = blocks.length;
  const block = blocks[current];
  const lastAudioRef = useRef('');

  const canPlay = isActive && isIntersecting;

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (!entry.isIntersecting) {
        window.speechSynthesis?.cancel();
        setSpeaking(false);
      }
    }, { threshold: 0.5 });
    
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // When canPlay becomes true, automatically read the last queued audio
  useEffect(() => {
    if (canPlay && lastAudioRef.current) {
      playAudio(lastAudioRef.current, true, 'en-IN', () => setSpeaking(true), () => setSpeaking(false));
    }
  }, [canPlay]);

  const [prevCanPlay, setPrevCanPlay] = useState(canPlay);
  if (canPlay !== prevCanPlay) {
    setPrevCanPlay(canPlay);
    if (!canPlay) {
      window.speechSynthesis?.cancel();
      setSpeaking(false);
    }
  }

  const autoRead = useCallback((text: string) => {
    lastAudioRef.current = text;
    if (isActive && isIntersecting) {
      playAudio(text, true, 'en-IN', () => setSpeaking(true), () => setSpeaking(false));
    }
  }, [isActive, isIntersecting]);

  const go = (dir: 1|-1) => {
    const next = current + dir;
    if (next < 0 || next >= total) return;
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setTimeout(() => {
      setDirection(dir === 1 ? 'right' : 'left');
      setCurrent(next);
    }, 100);
  };

  const progress = ((current + 1) / total) * 100;

  return (
    <section id="demo" ref={containerRef} className="relative w-full h-screen overflow-hidden flex flex-col" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {/* Dark overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.45)', zIndex: 1 }} />

      {/* Top Progress Bar */}
      <div className="relative z-20 w-full px-6 pt-6 pb-6 flex items-center gap-6">
        <span className="text-white/80 text-xs font-bold tracking-widest whitespace-nowrap uppercase">
          PART {current + 1} OF {total}
        </span>
        <div className="flex-1 bg-white/20 rounded-full h-1 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: '#FBBF24' }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-20 flex-1 flex items-center justify-center px-4 w-full h-full">
        {/* Prev arrow */}
        <button
          onClick={() => go(-1)}
          disabled={current === 0}
          className="absolute left-4 md:left-8 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 flex items-center justify-center hover:bg-black/60 transition disabled:opacity-0 z-30"
        >
          ‹
        </button>

        {/* Glass content panel */}
        <div
          key={current}
          className={`w-full max-w-2xl mx-auto z-20 ${direction === 'right' ? 'slide-in-right' : 'slide-in-left'}`}
        >
          <div className="relative p-5 md:p-10" style={{ background: 'rgba(255, 255, 255, 0.10)', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)', border: '1px solid rgba(255, 255, 255, 0.18)', boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.20)', borderRadius: '16px' }}>
            {block.type === 'story_panel' && <StoryBlock block={block} onAutoRead={autoRead} />}
            {block.type === 'tap_reveal' && <TapReveal block={block} onAutoRead={autoRead} />}
            {block.type === 'flip_card' && <FlipCard block={block} onAutoRead={autoRead} />}
            {block.type === 'sequence' && <SequenceBlock block={block} onAutoRead={autoRead} />}
            {block.type === 'celebration' && <CelebrationBlock block={block} onContinue={onComplete} />}
          </div>
          
          {/* Slide type label */}
          <div className="text-center mt-6">
            <span className="text-white/60 text-xs font-bold uppercase tracking-widest drop-shadow-md">
              {{story_panel:'Story',tap_reveal:'Tap to Reveal',flip_card:'Flip Card',sequence:'Sequence',celebration:'Complete'}[block.type]}
            </span>
          </div>
        </div>

        {/* Next arrow */}
        <button
          onClick={() => go(1)}
          disabled={current === total - 1}
          className="absolute right-4 md:right-8 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 flex items-center justify-center hover:bg-black/60 transition disabled:opacity-0 z-30"
        >
          ›
        </button>
      </div>

      {/* Bottom Area: Dots and TTS Bot */}
      <div className="relative z-20 w-full pb-8 px-6 flex justify-center items-end pointer-events-none">
        {/* Slide dots */}
        <div className="pointer-events-auto flex items-center gap-3 bg-black/30 backdrop-blur-md px-5 py-3 rounded-full border border-white/10">
          {blocks.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                window.speechSynthesis?.cancel();
                setSpeaking(false);
                setTimeout(() => {
                  setDirection(i > current ? 'right' : 'left');
                  setCurrent(i);
                }, 100);
              }}
              className={`rounded-full transition-all duration-300 ${i === current ? 'w-10 h-2 bg-yellow-400' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`}
            />
          ))}
        </div>

        {/* TTS Bot */}
        <GuideBot isReading={speaking} onTap={() => playAudio(lastAudioRef.current, true, 'en-IN', () => setSpeaking(true), () => setSpeaking(false))} />
      </div>
      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          15%     { transform: translateX(-8px); }
          30%     { transform: translateX(8px); }
          45%     { transform: translateX(-6px); }
          60%     { transform: translateX(6px); }
          75%     { transform: translateX(-3px); }
          90%     { transform: translateX(3px); }
        }
      `}</style>
    </section>
  );
}
