'use client';
import { useState, useEffect, useId, useRef } from 'react';
import { OpticsDevice, OpticsResult, classifyForMission } from '../lib/optics';

export interface ThroughTheLensProps {
  worldImageUrl: string;
  result: OpticsResult;
  device: OpticsDevice;
  active: boolean; // false while the concave-lens twist is running
  screenDist?: number;
  effectiveFlipped?: boolean;
  halfCovered?: boolean;
  hasFocusedOnce?: boolean;
  labMode?: boolean;
}

const MODE_INFO: Record<string, { label: string; icon: string; fact: string }> = {
  small_real: { label: 'Camera', icon: '📷', fact: 'Camera sensors receive an inverted image — just like your retina.' },
  big_real: { label: 'Projector', icon: '🎞️', fact: 'A projector uses a converging lens to turn a small image into a huge one.' },
  virtual_big: { label: 'Magnifying Glass', icon: '🔍', fact: "A magnifying glass doesn't make a real image — drag it around to explore. Your eyes see a magnified virtual one." },
  vanish: { label: 'Infinity', icon: '♾️', fact: 'At F, the rays leave parallel — there is no image to catch anywhere.' },
  concave_peephole: { label: 'Peephole', icon: '🚪', fact: 'This lens only ever shrinks what you see — exactly like the peephole in a door.' }
};

const ZONE_COLORS: Record<string, string> = {
  small_real: '#38BDF8',
  big_real: '#FBBF24',
  virtual_big: '#C084FC',
  vanish: '#9ca3af',
  concave_peephole: '#9ca3af'
};

const VB_W = 400, VB_H = 320;
const SCENE_H = 280;

export default function ThroughTheLens({ worldImageUrl, result, device, active, screenDist = 0, effectiveFlipped = false, halfCovered = false, hasFocusedOnce = false, labMode = false }: ThroughTheLensProps) {
  let mode: string = result.atInfinity ? 'vanish' : classifyForMission(result);
  if (device === 'concave_lens') {
    mode = 'concave_peephole';
  }
  
  const info = MODE_INFO[mode] ?? MODE_INFO.small_real;
  const cappedScale = result.atInfinity ? 1 : Math.min(Math.abs(result.m), 2.8);
  const flip = !result.atInfinity && !result.erect;
  const scaleY = cappedScale * (flip ? -1 : 1);
  
  const visualMode = mode === 'concave_peephole' ? 'virtual_big' : mode;
  const isTargetMode = visualMode === 'small_real' || visualMode === 'big_real';
  const showHint = labMode && isTargetMode && screenDist > 6 && !hasFocusedOnce;

  const [showSuccess, setShowSuccess] = useState(false);
  const successShownRef = useRef(false);

  useEffect(() => {
    if (isTargetMode && screenDist <= 6 && !successShownRef.current) {
      successShownRef.current = true;
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
    }
  }, [screenDist, isTargetMode]);

  return (
    <div
      className={`relative rounded-2xl overflow-hidden ${labMode ? 'w-full mb-20 md:mb-0' : 'w-full h-full flex flex-col'} ${active ? 'ring-2 ring-yellow-400' : ''}`}
      style={{ 
        background: labMode ? 'rgba(0,0,0,0.35)' : 'transparent', 
        border: labMode ? '2px solid rgba(255,255,255,0.18)' : 'none', 
        overflow: 'hidden',
        transition: 'border-color 150ms ease-out'
      }}
    >
      <div className="px-3 pt-2 md:px-4 md:pt-3 flex items-center gap-2">
        <span className="text-base md:text-lg">{info.icon}</span>
        <p className="text-sm font-bold transition-colors duration-150" style={{ color: !labMode && device === 'convex_lens' ? ZONE_COLORS[mode] : 'white' }}>{info.label} Mode</p>
      </div>

      <div className={labMode ? "w-full h-[180px] md:h-auto flex justify-center items-center" : "w-full flex-1 min-h-0 flex justify-center items-center"}>
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className={labMode ? "max-w-full h-full md:w-full md:h-auto" : "max-w-full max-h-full"} style={{ touchAction: visualMode === 'virtual_big' ? 'none' : undefined }}>
          {visualMode === 'small_real' ? (
            <CameraScene worldImageUrl={worldImageUrl} scaleY={scaleY} screenDist={screenDist} />
          ) : visualMode === 'big_real' ? (
            <ProjectorScene worldImageUrl={worldImageUrl} cappedScale={cappedScale} scaleY={scaleY} screenDist={screenDist} effectiveFlipped={effectiveFlipped} halfCovered={halfCovered} />
          ) : visualMode === 'virtual_big' ? (
            <MagnifierScene worldImageUrl={worldImageUrl} cappedScale={cappedScale} />
          ) : (
            <InfinityScene worldImageUrl={worldImageUrl} />
          )}
        </svg>
        {showHint && (
          <div 
            role="status" aria-live="polite"
            className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm px-4 py-2 rounded-full border border-white/20 max-w-[85%] text-center pointer-events-none motion-safe:animate-[fadeIn_200ms_ease-out] z-10"
          >
             <span className="hidden md:inline">
               {visualMode === 'small_real' 
                 ? "🔍 Blurry? Drag the white bar (the Catcher) onto the picture to make it sharp!" 
                 : "🎬 Blurry? Drag the white bar (the Catcher) until the big picture is sharp!"}
             </span>
             <span className="inline md:hidden">
               {visualMode === 'small_real' 
                 ? "🔍 Blurry? Slide the white knob (the Catcher) until the picture is sharp!" 
                 : "🎬 Blurry? Slide the white knob (the Catcher) until the big picture is sharp!"}
             </span>
          </div>
        )}
        {showSuccess && (
          <div 
            role="status" aria-live="polite"
            className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm px-4 py-2 rounded-full border border-white/20 max-w-[85%] text-center pointer-events-none motion-safe:animate-[fadeIn_200ms_ease-out] z-10"
          >
             ✨ Sharp! The Catcher is right where the image forms.
          </div>
        )}
      </div>

      <div className="px-3 pb-2 pt-1 md:px-4 md:pb-3 md:pt-0">
        <p className="text-white/70 text-xs leading-snug">💡 {info.fact}</p>
      </div>
    </div>
  );
}

// ─── CAMERA MODE ────────────────────────────────────────────────────────────
function CameraScene({ worldImageUrl, scaleY, screenDist = 0 }: { worldImageUrl: string; scaleY: number, screenDist?: number }) {
  const uid = useId().replace(/:/g, '_');
  const [captureState, setCaptureState] = useState<'idle' | 'flashing' | 'animating' | 'captured' | 'scanning' | 'flipped'>('idle');
  const [isSharp, setIsSharp] = useState(false);
  const prevIsSharp = useRef(false);

  const rawBlur = Math.max(0, (screenDist - 6) * 0.4);
  const isSharpRaw = rawBlur < 1;

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (isSharpRaw) {
      t = setTimeout(() => setIsSharp(true), 150);
    } else {
      t = setTimeout(() => setIsSharp(false), 0);
    }
    return () => clearTimeout(t);
  }, [isSharpRaw]);

  // Trigger sequence on rising edge, and reset with hysteresis
  useEffect(() => {
    if (captureState === 'idle') {
      if (isSharp && !prevIsSharp.current) {
        setTimeout(() => setCaptureState('flashing'), 0);
      }
    } else if (captureState === 'flipped') {
      if (rawBlur > 4) {
        setTimeout(() => setCaptureState('idle'), 0);
      }
    }
    prevIsSharp.current = isSharp;
  }, [isSharp, rawBlur, captureState]);

  // Run sequence unconditionally once started
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (captureState === 'flashing') {
      t = setTimeout(() => setCaptureState('animating'), 100);
    } else if (captureState === 'animating') {
      t = setTimeout(() => setCaptureState('captured'), 500);
    } else if (captureState === 'captured') {
      t = setTimeout(() => setCaptureState('scanning'), 2000);
    } else if (captureState === 'scanning') {
      t = setTimeout(() => setCaptureState('flipped'), 800);
    }
    return () => clearTimeout(t);
  }, [captureState]);

  const camCx = 200, camTop = 224, camW = 160, camH = 84;
  const CAM_SCREEN_MARGIN = 20; // equal gap on all four sides, in SVG units
  const screenW = camW - CAM_SCREEN_MARGIN * 2;
  const screenH = camH - CAM_SCREEN_MARGIN * 2;
  const screenX = camCx - screenW / 2;
  const screenY = camTop + CAM_SCREEN_MARGIN;

  const thumbSmall = captureState !== 'idle' && captureState !== 'flashing';
  const isFlipped = captureState === 'flipped';
  
  const sX = thumbSmall ? (screenW / VB_W) : 1;
  const sY_magnitude = thumbSmall ? (screenH / 200) : 1;
  let sY = sY_magnitude;
  
  const invertedRaw = scaleY < 0;
  if (invertedRaw && !isFlipped) {
    sY = -sY;
  }

  const tX = thumbSmall ? (screenX + screenW / 2 - VB_W / 2) : 0;
  const tY = thumbSmall ? (screenY + screenH / 2 - 100) : 0;

  return (
    <>
      <defs>
        <clipPath id={`camScreen-${uid}`}><rect x={screenX} y={screenY} width={screenW} height={screenH} rx={3} /></clipPath>
      </defs>

      {/* Big background - always full size, blurred based on rawBlur, always upright */}
      <g style={{ filter: `blur(${rawBlur}px)`, transition: 'filter 100ms ease-out' }}>
        <image href={worldImageUrl} x={0} y={0} width={VB_W} height={200} preserveAspectRatio="xMidYMid slice" opacity={0.85} />
      </g>
      
      <rect x={0} y={0} width={VB_W} height={200} fill="rgba(0,0,0,0.25)" />

      {/* Flash effect */}
      {captureState === 'flashing' && (
        <rect x={0} y={0} width={VB_W} height={200} fill="white" className="animate-[pulse_0.1s_ease-out]" />
      )}

      {/* Camera body */}
      <rect x={camCx - camW / 2} y={camTop} width={camW} height={camH} rx={14} fill="#111827" stroke="#93c5fd" strokeWidth={2} />
      <rect x={camCx - camW / 2 + 10} y={camTop + camH - 14} width={22} height={10} rx={3} fill="#1f2937" opacity={0.8} />
      <rect x={camCx - 18} y={camTop - 12} width={36} height={16} rx={3} fill="#111827" stroke="#93c5fd" strokeWidth={2} />

      {/* Camera screen box */}
      <rect x={screenX} y={screenY} width={screenW} height={screenH} rx={3} fill="#000" stroke={isSharp ? "#4ade80" : "#ef4444"} strokeWidth={1.5} className="transition-colors duration-300" />
      
      {/* Empty state placeholder when idle */}
      {captureState === 'idle' && (
        <text x={screenX + screenW/2} y={screenY + screenH/2 + 4} fill="#4b5563" fontSize={12} textAnchor="middle">📷</text>
      )}

      {/* Shrinking / Captured Thumbnail */}
      {captureState !== 'idle' && (
        <g clipPath={`url(#camScreen-${uid})`}>
          <g style={{ transition: 'transform 500ms ease-in-out', transformOrigin: '200px 100px', transform: `translate(${tX}px, ${tY}px) scale(${sX}, ${sY})` }}>
            <image href={worldImageUrl} x={0} y={0} width={VB_W} height={200} preserveAspectRatio="xMidYMid slice" />
          </g>
        </g>
      )}

      {/* Camera UI Overlays */}
      <g>
        <rect x={screenX + 6} y={screenY + 6} width={18} height={14} rx={4} fill="rgba(0,0,0,0.4)" />
        <rect x={screenX + 8} y={screenY + 8} width={14} height={10} rx={2} fill={captureState !== 'idle' ? "#4ade80" : "#fde68a"} opacity={0.9} className="transition-colors" />
        <circle cx={screenX + screenW - 13} cy={screenY + 13} r={8} fill="rgba(0,0,0,0.4)" />
        <circle cx={screenX + screenW - 13} cy={screenY + 13} r={5} fill={captureState === 'idle' ? "#f87171" : "#ef4444"} />
      </g>
      
      {/* Scan pulse over small screen only */}
      {captureState === 'scanning' && (
        <rect x={screenX} y={screenY} width={screenW} height={screenH} fill="rgba(74,222,128,0.3)" className="animate-[pulse_0.2s_infinite]" style={{ pointerEvents: 'none' }} rx={3} />
      )}

      {/* Software Flipped label */}
      {isFlipped && (
        <g transform={`translate(${camCx}, ${camTop - 25})`} className="animate-[fadeIn_0.3s_ease-out]">
          <rect x={-65} y={-12} width={130} height={20} rx={4} fill="#4ade80" opacity={0.9} />
          <text x={0} y={2} fill="#064e3b" fontSize={10} fontWeight="bold" textAnchor="middle">Software Flipped</text>
        </g>
      )}
    </>
  );
}

// ─── PROJECTOR MODE ─────────────────────────────────────────────────────────
function ProjectorScene({ worldImageUrl, cappedScale, scaleY, screenDist = 0, effectiveFlipped = false, halfCovered = false }: { worldImageUrl: string; cappedScale: number; scaleY: number; screenDist?: number; effectiveFlipped?: boolean; halfCovered?: boolean }) {
  const uid = useId().replace(/:/g, '_');
  const rawBlur = Math.max(0, (screenDist - 6) * 0.4);
  const opacity = rawBlur < 1 ? 1 : 0.75;
  const finalOpacity = halfCovered ? opacity * 0.5 : opacity;
  const screenX = 100, screenY = 20, screenW = 200, screenH = 130;
  const screenCx = screenX + screenW / 2, screenCy = screenY + screenH / 2;
  const lensCx = 200, lensCy = 185, lensRx = 38, lensRy = 50;
  const projCx = 200, projTop = 238, projW = 140, projH = 66;
  const slideX = projCx - 18, slideY = projTop + 14, slideW = 36, slideH = 26;

  return (
    <>
      <defs>
        <clipPath id={`projScreen-${uid}`}><rect x={screenX} y={screenY} width={screenW} height={screenH} /></clipPath>
        <clipPath id={`projSlide-${uid}`}><rect x={slideX} y={slideY} width={slideW} height={slideH} rx={2} /></clipPath>
        <linearGradient id={`projBodyGrad-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2b3140" />
          <stop offset="100%" stopColor="#1c212d" />
        </linearGradient>
      </defs>

      {/* screen on a stand */}
      <rect x={screenX - 6} y={screenY - 6} width={screenW + 12} height={screenH + 12} rx={4} fill="#e5e7eb" />
      <rect x={screenCx - 3} y={screenY + screenH + 6} width={6} height={14} fill="#9ca3af" />
      <rect x={screenX} y={screenY} width={screenW} height={screenH} fill="#fff" />
      <g clipPath={`url(#projScreen-${uid})`}>
        <g style={{ transition: 'transform 400ms ease-out, filter 150ms ease-out, opacity 300ms ease-out', filter: `blur(${rawBlur}px)`, opacity: finalOpacity }} transform={`translate(${screenCx} ${screenCy}) scale(${cappedScale} ${effectiveFlipped ? -scaleY : scaleY}) translate(${-screenCx} ${-screenCy})`}>
          <image href={worldImageUrl} x={screenX} y={screenY} width={screenW} height={screenH} preserveAspectRatio="xMidYMid slice" />
        </g>
      </g>

      <g stroke="#FBBF24" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.55} display="none">
        <line x1={projCx - 8} y1={projTop} x2={lensCx} y2={lensCy} />
        <line x1={projCx + 8} y1={projTop} x2={lensCx} y2={lensCy} />
        <line x1={lensCx} y1={lensCy - lensRy + 5} x2={screenX} y2={screenY + screenH} />
        <line x1={lensCx} y1={lensCy - lensRy + 5} x2={screenX + screenW} y2={screenY + screenH} />
      </g>

      {/* lens barrel, protruding toward the screen */}
      <ellipse cx={lensCx} cy={lensCy} rx={lensRx + 8} ry={lensRy + 8} fill="#bfdbfe" opacity={0.15} style={{ filter: 'blur(10px)' }} />
      <ellipse cx={lensCx} cy={lensCy} rx={lensRx} ry={lensRy} fill="rgba(147,197,253,0.14)" stroke="#93c5fd" strokeWidth={3} />
      <ellipse cx={lensCx} cy={lensCy} rx={lensRx * 0.5} ry={lensRy * 0.5} fill="none" stroke="#60a5fa" strokeWidth={1.5} opacity={0.6} />

      {/* classic projector body with reels + vents */}
      <path d={`M ${projCx - projW / 2} ${projTop + projH} L ${projCx - projW / 2 + 12} ${projTop} L ${projCx + projW / 2 - 12} ${projTop} L ${projCx + projW / 2} ${projTop + projH} Z`} fill={`url(#projBodyGrad-${uid})`} stroke="#6b7280" strokeWidth={1} />
      <circle cx={projCx - 36} cy={projTop - 10} r={13} fill="none" stroke="#9ca3af" strokeWidth={4} />
      <circle cx={projCx + 36} cy={projTop - 10} r={13} fill="none" stroke="#9ca3af" strokeWidth={4} />
      <circle cx={projCx - 36} cy={projTop - 10} r={4} fill="#9ca3af" />
      <circle cx={projCx + 36} cy={projTop - 10} r={4} fill="#9ca3af" />
      {[0, 1, 2].map(i => (
        <line key={i} x1={projCx - projW / 2 + 14} y1={projTop + 20 + i * 10} x2={projCx - projW / 2 + 30} y2={projTop + 20 + i * 10} stroke="#4b5563" strokeWidth={2} />
      ))}

      <rect x={slideX} y={slideY} width={slideW} height={slideH} rx={2} fill="#000" stroke="#4ade80" strokeWidth={1.5} />
      <g clipPath={`url(#projSlide-${uid})`}>
        <image href={worldImageUrl} x={slideX} y={slideY} width={slideW} height={slideH} preserveAspectRatio="xMidYMid slice" style={{ transform: effectiveFlipped ? 'scaleY(-1)' : 'none', transformOrigin: 'center', transition: 'transform 400ms ease-out' }} />
      </g>
    </>
  );
}

// ─── MAGNIFYING GLASS MODE — draggable ──────────────────────────────────────
function MagnifierScene({ worldImageUrl, cappedScale }: { worldImageUrl: string; cappedScale: number }) {
  const uid = useId().replace(/:/g, '_');
  const [pos, setPos] = useState({ x: 200, y: 140 });
  const [isDragging, setIsDragging] = useState(false);
  const r = 55;

  const toViewBox = (e: React.PointerEvent) => {
    const svg = (e.currentTarget as SVGElement).ownerSVGElement;
    const fallback = pos;
    if (!svg) return fallback;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * VB_W;
    const y = ((e.clientY - rect.top) / rect.height) * SCENE_H;
    return {
      x: Math.min(VB_W - (r + 10), Math.max(r + 10, x)),
      y: Math.min(SCENE_H - (r + 10), Math.max(r + 10, y)),
    };
  };

  const onDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPos(toViewBox(e));
  };
  const onUp = () => { setIsDragging(false); };

  const handleDx = Math.cos(Math.PI / 4), handleDy = Math.sin(Math.PI / 4);
  const hx1 = pos.x + handleDx * (r + 6), hy1 = pos.y + handleDy * (r + 6);
  const hx2 = pos.x + handleDx * (r + 56), hy2 = pos.y + handleDy * (r + 56);

  return (
    <>
      <defs>
        <clipPath id={`magView-${uid}`}><circle cx={pos.x} cy={pos.y} r={r} /></clipPath>
      </defs>

      <image href={worldImageUrl} x={0} y={0} width={VB_W} height={SCENE_H} preserveAspectRatio="xMidYMid slice" />
      <rect x={0} y={0} width={VB_W} height={SCENE_H} fill="rgba(0,0,0,0.15)" />

      {/* handle, behind the rim */}
      <line x1={hx1} y1={hy1} x2={hx2} y2={hy2} stroke="#78350f" strokeWidth={11} strokeLinecap="round" />
      <line x1={hx1} y1={hy1} x2={hx2} y2={hy2} stroke="#92400e" strokeWidth={7} strokeLinecap="round" />

      {/* zoomed view under the glass, follows pos */}
      <g clipPath={`url(#magView-${uid})`}>
        <g style={{ transition: isDragging ? 'none' : 'transform 150ms ease-out' }} transform={`translate(${pos.x} ${pos.y}) scale(${cappedScale}) translate(${-pos.x} ${-pos.y})`}>
          <image href={worldImageUrl} x={0} y={0} width={VB_W} height={SCENE_H} preserveAspectRatio="xMidYMid slice" />
        </g>
      </g>

      {/* glass rim + glare */}
      <circle cx={pos.x} cy={pos.y} r={r} fill="none" stroke="#d4af37" strokeWidth={6} />
      <circle cx={pos.x} cy={pos.y} r={r - 3} fill="none" stroke="#fff" strokeOpacity={0.3} strokeWidth={2} />
      <ellipse cx={pos.x - r * 0.3} cy={pos.y - r * 0.3} rx={r * 0.22} ry={r * 0.1} fill="#fff" opacity={0.35} transform={`rotate(-30 ${pos.x - r * 0.3} ${pos.y - r * 0.3})`} />

      {/* larger invisible hit area for a comfortable, finger-friendly drag target */}
      <circle
        cx={pos.x} cy={pos.y} r={r + 15}
        fill="transparent"
        style={{ cursor: 'grab', touchAction: 'none' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
      />
    </>
  );
}

// ─── INFINITY MODE (placeholder, unchanged logic) ──────────────────────────
function InfinityScene({ worldImageUrl }: { worldImageUrl: string }) {
  const cx = 200, cy = 140;
  return (
    <>
      <image href={worldImageUrl} x={0} y={0} width={VB_W} height={SCENE_H} preserveAspectRatio="xMidYMid slice" opacity={0.5} />
      <rect x={0} y={0} width={VB_W} height={SCENE_H} fill="rgba(0,0,0,0.45)" />
      <circle cx={cx} cy={cy} r={55} fill="rgba(0,0,0,0.5)" stroke="#f87171" strokeWidth={2} />
      <text x={cx} y={cy + 4} fill="#f87171" fontSize={11} textAnchor="middle">No image here</text>
    </>
  );
}
