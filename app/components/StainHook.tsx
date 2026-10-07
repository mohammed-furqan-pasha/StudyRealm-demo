'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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

  useEffect(() => {
    onAutoRead(block.audio_instruction || block.instruction);
  }, [block, onAutoRead]);

  const handleWash = (e: React.PointerEvent) => {
    e.stopPropagation(); 
    e.nativeEvent?.stopImmediatePropagation?.();
    setWashed(true);
    if (block.audio_result) {
      onAutoRead(block.audio_result);
    }
    setTimeout(() => {
      setShowContinue(true);
    }, 800);
  };

  const handleReset = (e: React.PointerEvent) => {
    e.stopPropagation(); 
    e.nativeEvent?.stopImmediatePropagation?.();
    setWashed(false);
    setShowContinue(false);
    onAutoRead(block.audio_instruction || block.instruction);
  };

  const handleNext = (e: React.PointerEvent) => {
    e.stopPropagation(); 
    e.nativeEvent?.stopImmediatePropagation?.();
    onNext?.();
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full mx-auto">
      
      {/* Instruction */}
      <h2 className="text-xl md:text-3xl font-bold text-white text-center w-full leading-tight">
        {block.instruction}
      </h2>

      {/* Visual Area */}
      <div className="relative w-full aspect-video md:h-[240px] max-w-[400px] flex items-center justify-center rounded-2xl overflow-hidden shadow-inner bg-black/20 border border-white/10">
        {block.image_before && block.image_after ? (
          <>
            <Image src={block.image_before} alt="Before" fill className={`object-cover transition-opacity duration-1200 ${washed ? 'opacity-0' : 'opacity-100'}`} />
            <Image src={block.image_after} alt="After" fill className={`object-cover transition-opacity duration-1200 ${washed ? 'opacity-100' : 'opacity-0'}`} />
          </>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* SVG placeholder for cloth/stain */}
            <svg viewBox="0 0 200 200" className="w-[160px] h-[160px] drop-shadow-xl" style={{ overflow: 'visible' }}>
              <path d="M 40 20 Q 100 40 160 20 L 180 80 Q 160 180 100 190 Q 40 180 20 80 Z" fill="#ffffff" />
              <path d="M 70 70 Q 120 50 140 90 Q 150 140 100 150 Q 50 130 60 90 Z" fill={washed ? block.stain_color_after : block.stain_color} style={{ transition: 'fill 1.2s ease-in-out' }} />
            </svg>
          </div>
        )}
        
        {/* Soap bubbles animation */}
        {washed && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <style>{`
              @keyframes bubbleFloat {
                0% { transform: translateY(100px) scale(0.5); opacity: 0; }
                20% { opacity: 0.4; }
                100% { transform: translateY(-50px) scale(1.5); opacity: 0; }
              }
              @media (prefers-reduced-motion: reduce) {
                .bubble { animation: none !important; opacity: 0 !important; }
                svg path { transition: none !important; }
              }
            `}</style>
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="bubble absolute bg-white rounded-full shadow-[inset_0_0_8px_rgba(255,255,255,1)]"
                style={{
                  left: `${20 + i * 15}%`,
                  bottom: '-20%',
                  width: `${16 + Math.random() * 24}px`,
                  height: `${16 + Math.random() * 24}px`,
                  animation: `bubbleFloat 1.6s ease-out forwards`,
                  animationDelay: `${i * 0.1}s`,
                  opacity: 0
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Interaction Area */}
      <div className="w-full h-[60px] md:h-[80px] flex items-center justify-center relative">
        {!washed ? (
          <button
            onPointerDown={handleWash}
            className="w-full max-w-[320px] min-h-[48px] bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-full shadow-lg relative group transition-colors flex items-center justify-center"
          >
            <div className="absolute inset-0 rounded-full border-2 border-teal-400 animate-ping opacity-50" style={{ animationDuration: '2s' }} />
            <span className="relative z-10 text-lg">{block.button_label}</span>
          </button>
        ) : (
          <div className="flex flex-col items-center gap-2 w-full animate-in zoom-in duration-300">
            <p className="text-xl md:text-2xl font-bold text-white text-center">{block.result_text}</p>
          </div>
        )}
      </div>

      {/* Continue Section */}
      <div className="h-[100px] flex items-center justify-center w-full">
        {showContinue && (
          <div className="flex flex-col items-center gap-3 w-full animate-in slide-in-from-bottom-4 fade-in duration-500">
            <button
              onPointerDown={handleNext}
              className="w-full max-w-[320px] min-h-[48px] bg-white text-slate-900 font-bold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-transform hover:scale-105 text-lg flex items-center justify-center"
            >
              {block.continue_label}
            </button>
            <button
              onPointerDown={handleReset}
              className="text-white/60 hover:text-white text-sm font-medium min-h-[44px] px-4 flex items-center justify-center transition-colors"
            >
              ↺ Again
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
