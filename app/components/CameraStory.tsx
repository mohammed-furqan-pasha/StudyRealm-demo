'use client';
import React from 'react';

export default function CameraStory({
  worldImageUrl,
  scale,
  flipped = false,
  beat = 99,
  onFlipTap
}: {
  worldImageUrl: string;
  scale: number;
  flipped?: boolean;
  beat?: number;
  onFlipTap?: () => void;
}) {
  const LENS_X = 542.857;
  
  // Lighthouse is 280 tall (340 - 60).
  const picH = Math.max(40, Math.min(80, scale * 280));
  
  const oCamW = 160;
  const oCamH = 84;
  const cX = LENS_X + 80;
  const cY = 200 - oCamH / 2;

  // in beat 5 or 99, or when flipped is true, it is upright. But in story, flipped is driven by beat.
  const isUpright = beat === 5 || beat === 99 || flipped;
  // rotation transition is handled by CSS
  const rotAngle = isUpright ? 0 : 180;

  const dotOrangeY = 200 + (isUpright ? -picH / 2 : picH / 2);
  const dotBlueY = 200 + (isUpright ? picH / 2 : -picH / 2);

  // prefers reduced motion check (simplistic for styles)
  const isMotionSafe = typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <svg viewBox="0 0 1000 400" className="w-full h-full">
      <title>A camera takes a picture of a lighthouse</title>
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <clipPath id="sensorClip">
          {beat < 3 ? (
            <rect x={LENS_X + 130} y={240} width={40} height={0} /> // completely hidden
          ) : (
            // beat 3 bottom-up reveal
            <rect x={LENS_X + 130} y={160} width={40} height={80} 
                  style={{
                    transformOrigin: 'bottom',
                    animation: (beat === 3 && isMotionSafe) ? 'revealUp 1.2s ease-out forwards' : 'none',
                    transform: (beat === 3 && isMotionSafe) ? 'scaleY(0)' : 'scaleY(1)'
                  }} />
          )}
        </clipPath>
      </defs>
      <style>{`
        @keyframes drawRay {
          from { stroke-dashoffset: 1000; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes revealUp {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        @keyframes pulseGlow {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(251,146,60,0.4)); }
          50% { filter: drop-shadow(0 0 16px rgba(251,146,60,0.9)); }
        }
        @keyframes pulseLens {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(147,197,253,0.3)); }
          50% { filter: drop-shadow(0 0 15px rgba(147,197,253,0.9)); }
        }
        @keyframes bounceLeft {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-4px); }
        }
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.5); }
        }
      `}</style>
      
      {/* Background */}
      <rect width="1000" height="400" fill="url(#skyGrad)" />
      <line x1="0" y1="340" x2="1000" y2="340" stroke="#334155" strokeWidth="2" />

      {/* Lighthouse */}
      <g style={{ animation: (beat === 1 && isMotionSafe) ? 'pulseGlow 2s infinite' : 'none' }}>
        <image href={worldImageUrl} x="80" y="60" width="180" height="280" preserveAspectRatio="xMidYMid meet" />
      </g>
      <circle cx="170" cy="60" r="7" fill="#FB923C" />
      <circle cx="170" cy="340" r="7" fill="#38BDF8" />

      {/* Rays */}
      <g strokeWidth="2" opacity={beat === 99 ? 0.35 : 0.9} strokeLinecap="round" style={{ transition: 'opacity 0.5s' }}>
        {/* Orange rays */}
        <g stroke="#FB923C">
          {beat >= 1 && (
            <>
              <line x1="170" y1="60" x2={LENS_X} y2="150" strokeDasharray="1000" style={{ animation: (beat === 1 && isMotionSafe) ? 'drawRay 1.8s ease-out forwards' : 'none', strokeDashoffset: (beat === 1 && isMotionSafe) ? 1000 : 0 }} />
              <line x1="170" y1="60" x2={LENS_X} y2="250" strokeDasharray="1000" style={{ animation: (beat === 1 && isMotionSafe) ? 'drawRay 1.8s ease-out forwards' : 'none', strokeDashoffset: (beat === 1 && isMotionSafe) ? 1000 : 0 }} />
            </>
          )}
          {beat >= 3 && (
            <>
              <line x1={LENS_X} y1="150" x2={LENS_X + 150} y2={dotOrangeY} strokeDasharray="1000" style={{ animation: (beat === 3 && isMotionSafe) ? 'drawRay 1.6s ease-out forwards' : 'none', strokeDashoffset: (beat === 3 && isMotionSafe) ? 1000 : 0 }} />
              <line x1={LENS_X} y1="250" x2={LENS_X + 150} y2={dotOrangeY} strokeDasharray="1000" style={{ animation: (beat === 3 && isMotionSafe) ? 'drawRay 1.6s ease-out forwards' : 'none', strokeDashoffset: (beat === 3 && isMotionSafe) ? 1000 : 0 }} />
            </>
          )}
        </g>
        {/* Blue rays */}
        <g stroke="#38BDF8">
          {beat >= 1 && (
            <>
              <line x1="170" y1="340" x2={LENS_X} y2="150" strokeDasharray="1000" style={{ animation: (beat === 1 && isMotionSafe) ? 'drawRay 1.8s ease-out forwards' : 'none', strokeDashoffset: (beat === 1 && isMotionSafe) ? 1000 : 0 }} />
              <line x1="170" y1="340" x2={LENS_X} y2="250" strokeDasharray="1000" style={{ animation: (beat === 1 && isMotionSafe) ? 'drawRay 1.8s ease-out forwards' : 'none', strokeDashoffset: (beat === 1 && isMotionSafe) ? 1000 : 0 }} />
            </>
          )}
          {beat >= 3 && (
            <>
              <line x1={LENS_X} y1="150" x2={LENS_X + 150} y2={dotBlueY} strokeDasharray="1000" style={{ animation: (beat === 3 && isMotionSafe) ? 'drawRay 1.6s ease-out forwards' : 'none', strokeDashoffset: (beat === 3 && isMotionSafe) ? 1000 : 0 }} />
              <line x1={LENS_X} y1="250" x2={LENS_X + 150} y2={dotBlueY} strokeDasharray="1000" style={{ animation: (beat === 3 && isMotionSafe) ? 'drawRay 1.6s ease-out forwards' : 'none', strokeDashoffset: (beat === 3 && isMotionSafe) ? 1000 : 0 }} />
            </>
          )}
        </g>
      </g>

      {/* Camera Body */}
      <rect x={cX - oCamW / 2} y={cY} width={oCamW} height={oCamH} rx={14} fill="#111827" stroke="#93c5fd" strokeWidth={2} />
      <rect x={cX - oCamW / 2 + 10} y={cY + oCamH - 14} width={22} height={10} rx={3} fill="#1f2937" opacity={0.8} />
      <rect x={cX - 18} y={cY - 12} width={36} height={16} rx={3} fill="#111827" stroke="#93c5fd" strokeWidth={2} />

      {/* Lens */}
      <g style={{ animation: (beat === 2 && isMotionSafe) ? 'pulseLens 1s 2' : 'none' }}>
        <ellipse cx={LENS_X} cy="200" rx="15" ry="75" fill="rgba(147,197,253,0.25)" stroke="#93c5fd" strokeWidth="3" />
      </g>
      <text x={LENS_X} y="110" fill="white" fontSize="12" opacity={beat >= 2 ? 0.7 : 0} textAnchor="middle" style={{ transition: 'opacity 0.5s' }}>convex lens</text>

      {/* Sensor */}
      <rect x={LENS_X + 147} y="160" width="6" height="80" rx="3" fill="#4b5563" />

      {/* Sensor Picture */}
      <g clipPath="url(#sensorClip)">
        <g style={{ transform: `translate(${LENS_X + 150}px, 200px) rotate(${rotAngle}deg)`, transition: (beat === 5 || beat === 99) && isMotionSafe ? 'transform 700ms ease-in-out' : 'none' }}>
          <g transform={`translate(0, ${-picH / 2})`}>
            <image href={worldImageUrl} x="-40" y="0" width="80" height={picH} preserveAspectRatio="xMidYMid meet" />
          </g>
          <g>
            <circle cx="0" cy={-picH / 2} r="3" fill="#FB923C" style={{ transformOrigin: `0 ${-picH/2}px`, animation: (beat === 4 && isMotionSafe) ? 'pulseDot 1s infinite' : 'none' }} />
            <circle cx="0" cy={picH / 2} r="3" fill="#38BDF8" style={{ transformOrigin: `0 ${picH/2}px`, animation: (beat === 4 && isMotionSafe) ? 'pulseDot 1s infinite' : 'none' }} />
          </g>
        </g>
      </g>
      
      {/* Arrows for beat 4 */}
      {beat === 4 && (
        <g style={{ animation: isMotionSafe ? 'bounceLeft 1s infinite' : 'none' }}>
          <text x={LENS_X + 160} y={200 + picH / 2 + 4} fill="#FB923C" fontSize="14" fontWeight="bold">◀</text>
          <text x={LENS_X + 160} y={200 - picH / 2 + 4} fill="#38BDF8" fontSize="14" fontWeight="bold">◀</text>
        </g>
      )}

      {/* Flip Chip (beat 5, 99 or explore flip) */}
      {(beat >= 5 || flipped) && (
        <g transform={`translate(${LENS_X + 80}, 110)`} className="animate-[fadeIn_0.5s_ease-out]" style={{ cursor: onFlipTap && beat === 99 ? 'pointer' : 'default' }} onClick={onFlipTap && beat === 99 ? onFlipTap : undefined}>
          <rect x={-80} y={-12} width={160} height={24} rx={6} fill="#4ade80" opacity={0.9} />
          <text x={0} y={3} fill="#064e3b" fontSize={11} fontWeight="bold" textAnchor="middle">🧠 The camera flips it for you</text>
        </g>
      )}
      
      {/* Explore mode flip button (pulsing) */}
      {beat === 99 && !flipped && onFlipTap && (
        <g transform={`translate(${LENS_X + 80}, 110)`} className="animate-[fadeIn_0.5s_ease-out]" style={{ cursor: 'pointer' }} onClick={onFlipTap}>
          <rect x={-60} y={-14} width={120} height={28} rx={14} fill="#FBBF24" opacity={0.9} style={{ animation: isMotionSafe ? 'pulseGlow 2s infinite' : 'none' }} />
          <text x={0} y={4} fill="#78350F" fontSize={12} fontWeight="bold" textAnchor="middle">🔄 Flip it upright</text>
        </g>
      )}
    </svg>
  );
}
