'use client';

import { useState, useEffect, useRef, useId } from 'react';
import Image from 'next/image';

const FOAM_CIRCLES = [
  { cx: 120, cy: 110, r: 8, delay: 0.4 },
  { cx: 155, cy: 100, r: 10, delay: 0.5 },
  { cx: 165, cy: 130, r: 9, delay: 0.6 },
  { cx: 135, cy: 145, r: 12, delay: 0.7 },
  { cx: 110, cy: 130, r: 7, delay: 0.8 },
  { cx: 145, cy: 120, r: 14, delay: 0.9 },
  { cx: 175, cy: 115, r: 6, delay: 1.0 },
  { cx: 125, cy: 135, r: 8, delay: 1.1 }
];
import { ContentBlock } from '../types';

export default function StainHook({ 
  block, 
  onAutoRead, 
  onNext 
}: { 
  block: Extract<ContentBlock, {type: 'stain_hook'}>, 
  onAutoRead: (text: string) => void,
  onNext?: () => void
}) {
  const [washed, setWashed] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [runId, setRunId] = useState(0);
  const clipId = useId() + '-bloom';
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    onAutoRead(block.audio_instruction || block.instruction);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [block, onAutoRead]);

  const handleWash = (e: React.SyntheticEvent) => {
    e.stopPropagation(); 
    e.nativeEvent?.stopImmediatePropagation?.();
    if (washed) return;
    setWashed(true);
    if (block.audio_result) {
      onAutoRead(block.audio_result);
    }
    timerRef.current = setTimeout(() => {
      setShowContinue(true);
    }, 800);
  };

  const handleReset = (e: React.PointerEvent) => {
    e.stopPropagation(); 
    e.nativeEvent?.stopImmediatePropagation?.();
    if (timerRef.current) clearTimeout(timerRef.current);
    setWashed(false);
    setShowContinue(false);
    setRunId(r => r + 1);
    onAutoRead(block.audio_instruction || block.instruction);
  };

  const handleNext = (e: React.PointerEvent) => {
    e.stopPropagation(); 
    e.nativeEvent?.stopImmediatePropagation?.();
    onNext?.();
  };

  return (
    <div className="flex flex-col items-center gap-3 md:gap-4 w-full mx-auto">
      
      {/* Instruction */}
      <h2 className="text-lg md:text-2xl font-bold text-white text-center w-full leading-tight">
        {block.instruction}
      </h2>

      {/* Visual Area */}
      <div className="relative w-full max-w-[560px] flex items-center justify-center rounded-2xl overflow-hidden shadow-inner bg-black/20 border border-white/10" style={{ height: 'clamp(150px, calc(100dvh - 560px), 300px)' }}>
        {block.image_before && block.image_after ? (
          <>
            <Image src={block.image_before} alt="Before" fill className={`object-cover transition-opacity duration-1200 ${washed ? 'opacity-0' : 'opacity-100'}`} />
            <Image src={block.image_after} alt="After" fill className={`object-cover transition-opacity duration-1200 ${washed ? 'opacity-100' : 'opacity-0'}`} />
          </>
        ) : (
          <div className="relative h-full aspect-[4/3] flex items-center justify-center max-w-full">
            {/* SVG placeholder for cloth/stain */}
            <svg viewBox="0 0 320 240" className="h-full w-auto max-w-full drop-shadow-xl" preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
              <defs>
                <clipPath id={clipId}>
                  <circle cx="140" cy="120" r="0" className={washed ? 'stain-bloom' : ''} />
                </clipPath>
              </defs>
              
              {/* Ground shadow */}
              <ellipse cx="150" cy="225" rx="75" ry="8" fill="rgba(0,0,0,0.25)" />
              
              {/* Shirt body */}
              <path d="M 125 28 Q 160 52 195 28 L 232 42 L 270 82 L 240 100 L 222 84 L 222 212 Q 160 218 98 212 L 98 84 L 80 100 L 50 82 L 88 42 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
              
              {/* Collar rib band */}
              <path d="M 125 28 Q 160 52 195 28" fill="none" stroke="#CBD5E1" strokeWidth="5" />
              
              {/* Soft shading folds */}
              <g fill="none" stroke="rgba(148,163,184,0.25)" strokeWidth="3" strokeLinecap="round">
                <path d="M 98 84 Q 105 110 100 130" />
                <path d="M 222 84 Q 215 110 220 130" />
                <path d="M 140 170 Q 145 190 142 214" strokeWidth="4" />
                <path d="M 180 160 Q 175 185 178 215" strokeWidth="2" />
                <path d="M 145 60 Q 150 75 145 85" strokeWidth="2" />
              </g>

              {/* Base Stain */}
              <g fill={block.stain_color}>
                <path className="stain-main" d="M 115 115 C 120 90, 150 95, 160 105 C 175 100, 180 120, 170 130 C 185 145, 150 155, 140 140 C 120 150, 100 135, 110 125 C 95 110, 110 95, 115 115 Z" />
                <circle className="stain-drop-1" cx="180" cy="108" r="4" />
                <circle className="stain-drop-2" cx="105" cy="142" r="3.5" />
                <circle className="stain-drop-3" cx="150" cy="158" r="2.5" />
              </g>

              {/* Bloom Layer */}
              <g fill={block.stain_color_after} clipPath={`url(#${clipId})`}>
                <path className="stain-main" d="M 115 115 C 120 90, 150 95, 160 105 C 175 100, 180 120, 170 130 C 185 145, 150 155, 140 140 C 120 150, 100 135, 110 125 C 95 110, 110 95, 115 115 Z" />
                <circle className="stain-drop-1" cx="180" cy="108" r="4" />
                <circle className="stain-drop-2" cx="105" cy="142" r="3.5" />
                <circle className="stain-drop-3" cx="150" cy="158" r="2.5" />
              </g>

              {/* Soap and Dish */}
              <g key={`soap-${runId}`}>
                <ellipse cx="266" cy="188" rx="35" ry="10" fill="#E2E8F0" />
                {!washed && (
                  <circle cx="266" cy="188" r="40" fill="none" stroke="#F9A8D4" strokeWidth="3" className="animate-ping opacity-50" style={{ animationDuration: '2s' }} />
                )}
                <g className={washed ? 'soap-wash' : ''} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
                  <rect x="238" y="154" width="56" height="34" rx="10" fill="#F9A8D4" />
                  <path d="M 238 164 Q 266 151 294 164 L 294 178 Q 266 191 238 178 Z" fill="#F472B6" opacity="0.5" />
                  <path d="M 242 158 Q 266 153 290 158" fill="none" stroke="#FCE7F3" strokeWidth="3" strokeLinecap="round" />
                </g>
              </g>

              {/* Foam Circles */}
              {washed && (
                <g key={`foam-${runId}`}>
                  {FOAM_CIRCLES.map((foam, i) => (
                    <circle 
                      key={`foam-${i}`}
                      cx={foam.cx} cy={foam.cy} r={foam.r} 
                      fill="#FFFFFF" 
                      className="foam-pop"
                      style={{ transformBox: 'fill-box', transformOrigin: 'center', animationDelay: `${foam.delay}s` }}
                    />
                  ))}
                </g>
              )}
            </svg>

            {!washed && (
              <button
                onPointerDown={handleWash}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleWash(e);
                  }
                }}
                aria-label={block.button_label || 'Add soap'}
                className="absolute bg-transparent rounded-full z-10 outline-none focus-visible:ring-4 focus-visible:ring-teal-400 cursor-pointer"
                style={{ left: '83%', top: '78%', transform: 'translate(-50%, -50%)', width: '64px', height: '64px' }}
              />
            )}

            <style>{`
              @keyframes soapRub {
                0% { transform: translate(0, 0); }
                15% { transform: translate(-126px, -68px); }
                30% { transform: translate(-114px, -68px); }
                45% { transform: translate(-138px, -68px); }
                60% { transform: translate(-114px, -68px); }
                75% { transform: translate(-138px, -68px); }
                90% { transform: translate(-126px, -68px); }
                100% { transform: translate(0, 0); }
              }
              .soap-wash {
                animation: soapRub 1.6s ease-in-out forwards;
              }
              @keyframes popFade {
                0% { transform: scale(0); opacity: 0; }
                30% { transform: scale(1.2); opacity: 0.8; }
                100% { transform: scale(1); opacity: 0; }
              }
              .foam-pop {
                animation: popFade 0.6s ease-out forwards;
                opacity: 0;
              }
              @keyframes bloomGrow {
                0% { r: 0; }
                100% { r: 100; }
              }
              .stain-bloom {
                animation: bloomGrow 1.2s ease-out 0.5s forwards;
              }
              @media (prefers-reduced-motion: reduce) {
                .soap-wash { animation: none !important; }
                .foam-pop { animation: none !important; opacity: 0 !important; }
                .stain-bloom { animation: none !important; r: 100 !important; }
              }
            `}</style>
          </div>
        )}
      </div>

      {/* Interaction & Continue Area */}
      <div className="w-full h-[96px] flex flex-col items-center justify-center relative">
        {/* Before washing */}
        <div className={`absolute transition-opacity duration-300 motion-reduce:transition-none w-full flex justify-center ${washed ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
          <div className="bg-white/10 px-5 py-2 rounded-full text-white/80 font-medium animate-[bounce_2s_infinite]">
            👆 Tap the soap
          </div>
        </div>

        {/* After washing */}
        <div className={`w-full flex flex-col items-center gap-2 transition-opacity duration-300 motion-reduce:transition-none ${washed ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <p className="text-lg md:text-xl font-bold text-white text-center">
            {block.result_text}
          </p>
          <div className={`flex items-center gap-3 w-full justify-center transition-opacity duration-300 motion-reduce:transition-none ${showContinue ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <button
              onPointerDown={handleNext}
              className="flex-1 max-w-[260px] min-h-[48px] bg-white text-slate-900 font-bold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-transform hover:scale-105 text-lg flex items-center justify-center"
            >
              {block.continue_label}
            </button>
            <button
              onPointerDown={handleReset}
              aria-label="Try again"
              title="Try again"
              className="w-[48px] h-[48px] flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xl transition-colors"
            >
              ↺
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
