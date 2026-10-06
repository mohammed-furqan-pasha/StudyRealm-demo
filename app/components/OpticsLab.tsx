'use client';
import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { computeOptics, classifyForMission, OpticsDevice, OpticsResult } from '../lib/optics';
import type { OpticsLabBlockData, OpticsMission } from '../types';

// ─── layout constants (SVG viewBox is 0 0 700 360) ─────────────────────────
const VB_W = 700, VB_H = 360;
const AXIS_Y = 190;
const CX = 380; // device x position
const PPU = 6;  // pixels per distance-unit along the axis
const HPU = 9;  // pixels per distance-unit for heights (exaggerated so images read clearly)
const SCREEN_TOLERANCE = 6; // px window in which the screen image counts as "sharp"

function xForU(u: number) { return CX - u * PPU; } // object is always on the incoming (left) side, regardless of device
function xForV(device: OpticsDevice, v: number, isVirtual: boolean) {
  const mirror = device === 'concave_mirror' || device === 'convex_mirror';
  const mag = Math.abs(v) * PPU;
  if (mirror) return isVirtual ? CX + mag : CX - mag;
  return isVirtual ? CX - mag : CX + mag;
}

export default function OpticsLab({
  block,
  onAutoRead,
  onComplete,
  onResultChange,
  filmFlipped,
  setFilmFlipped,
  effectiveFlipped,
  halfCovered,
  setHalfCovered,
  catcherMoved,
  hasFocusedOnce,
  onCatcherMove,
  labMode = true,
  introState,
  setIntroState,
}: {
  block: OpticsLabBlockData;
  onAutoRead: (t: string) => void;
  onComplete?: () => void;
  onResultChange?: (result: OpticsResult, device: OpticsDevice, twistActive: boolean, screenDist: number) => void;
  filmFlipped?: boolean;
  setFilmFlipped?: (f: boolean) => void;
  effectiveFlipped?: boolean;
  halfCovered?: boolean;
  setHalfCovered?: React.Dispatch<React.SetStateAction<boolean>>;
  catcherMoved?: boolean;
  hasFocusedOnce?: boolean;
  onCatcherMove?: () => void;
  labMode?: boolean;
  introState?: 'idle' | 'playing' | 'handoff' | 'done';
  setIntroState?: (state: 'idle' | 'playing' | 'handoff' | 'done') => void;
}) {
  const [device, setDevice] = useState<OpticsDevice>(block.device);
  const [focalLength, setFocalLength] = useState(block.focal_length);
  const [u, setU] = useState(block.default_u);
  const [screenU, setScreenU] = useState(() => {
    const defaultV = computeOptics(block.device, block.focal_length, block.default_u, block.object_height).v;
    return Math.abs(defaultV) + 15;
  }); // screen's own distance from device, image side
  const [introStage, setIntroStage] = useState(0); // 0=lens, 1=obj, 2=rays, 3=full
  const [showTooltip, setShowTooltip] = useState(false);
  const [missionIdx, setMissionIdx] = useState(0);
  const [missionDone, setMissionDone] = useState<boolean[]>(() => block.missions.map(() => false));
  const [twistActive, setTwistActive] = useState(false);
  const [twistRevealed, setTwistRevealed] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const draggingRef = useRef<'object' | 'screen' | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const missionAdvancePendingRef = useRef(false);

  const [hasInteracted, setHasInteracted] = useState(false);
  const [hasTouchedCatcher, setHasTouchedCatcher] = useState(false);
  const [hasFocused, setHasFocused] = useState(false);
  const [virtualCatcherFeedback, setVirtualCatcherFeedback] = useState(false);
  const [showVirtualMessage, setShowVirtualMessage] = useState(false);
  const virtualFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const virtualMsgTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mirror = device === 'concave_mirror' || device === 'convex_mirror';
  const result: OpticsResult = useMemo(
    () => computeOptics(device, focalLength, u, block.object_height),
    [device, focalLength, u, block.object_height]
  );

  const imgReal = !result.isVirtual && !result.atInfinity;
  const effectiveScreenU = (!labMode && imgReal)
    ? Math.min(block.max_u * 1.4, Math.max(1, Math.abs(result.v)))
    : screenU;

  const currentMission: OpticsMission | undefined = block.missions[missionIdx];
  const isBigReal = classifyForMission(result) === 'big_real';
  const objectOpacity = halfCovered ? (isBigReal ? 0.5 : 0.6) : 1;
  const imageOpacity = halfCovered ? (isBigReal ? 0.5 : 0.6) : 1;

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (halfCovered && isBigReal) {
      setTimeout(() => setShowTooltip(true), 0);
      t = setTimeout(() => setShowTooltip(false), 4000);
    } else {
      setTimeout(() => setShowTooltip(false), 0);
    }
    return () => clearTimeout(t);
  }, [halfCovered, isBigReal]);

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>, t2: ReturnType<typeof setTimeout>, t3: ReturnType<typeof setTimeout>, t4: ReturnType<typeof setTimeout>;
    if (introStage === 0) {
      t1 = setTimeout(() => setIntroStage(1), 1000);
      t2 = setTimeout(() => setIntroStage(2), 2000);
      t3 = setTimeout(() => {
        setIntroStage(3);
        onAutoRead("This is a convex lens. Let's see what happens when light passes through it.");
        t4 = setTimeout(() => currentMission && onAutoRead(currentMission.audio), 4000);
      }, 3000);
    }
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prevU = useRef(u);
  const [bump2F, setBump2F] = useState(false);
  useEffect(() => {
    if (u !== prevU.current) {
      const crossed = (prevU.current > focalLength * 2 && u <= focalLength * 2) || (prevU.current < focalLength * 2 && u >= focalLength * 2);
      if (crossed) {
        setBump2F(true);
        setTimeout(() => setBump2F(false), 400);
      }
      prevU.current = u;
    }
  }, [u, focalLength]);

  // check mission completion whenever the object moves
  useEffect(() => {
    if (introState === 'playing' || introState === 'handoff') return;
    if (twistActive || allDone || !currentMission) return;
    const goal = classifyForMission(result);
    if (goal !== currentMission.goal) return;
    // for real-image goals, also require the screen to be roughly at the sharp spot
    if (!result.isVirtual && !result.atInfinity) {
      const dist = Math.abs(effectiveScreenU - Math.abs(result.v));
      if (dist * PPU > SCREEN_TOLERANCE) return;
    }
    if (missionDone[missionIdx]) return;
    if (missionAdvancePendingRef.current) return;
    
    missionAdvancePendingRef.current = true;
    setMissionDone(d => { const n = [...d]; n[missionIdx] = true; return n; });
    onAutoRead(currentMission.success_audio);
    setTimeout(() => {
      missionAdvancePendingRef.current = false;
      if (missionIdx + 1 < block.missions.length) {
        setMissionIdx(i => i + 1);
        onAutoRead(block.missions[missionIdx + 1].audio);
      } else if (block.concave_twist) {
        setTwistActive(true);
        setDevice(block.concave_twist.device);
        setFocalLength(block.concave_twist.focal_length);
        onAutoRead(block.concave_twist.prompt + ' ' + block.concave_twist.audio);
      } else {
        setAllDone(true);
        onComplete?.();
      }
    }, 1600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, effectiveScreenU, missionIdx]);

  // twist: reveal the "it can only shrink" line once the student has dragged around a bit
  const twistDragCount = useRef(0);
  useEffect(() => {
    if (!twistActive || twistRevealed) return;
    twistDragCount.current += 1;
    if (twistDragCount.current > 3) {
      setTwistRevealed(true);
      onAutoRead(block.concave_twist!.reveal_audio);
      setTimeout(() => { setAllDone(true); onComplete?.(); }, 4000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [u]);

  const clientXToU = useCallback((clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return u;
    const rect = svg.getBoundingClientRect();
    const scaleX = VB_W / rect.width;
    const localX = (clientX - rect.left) * scaleX;
    const newU = (CX - localX) / PPU;
    return Math.min(block.max_u, Math.max(block.min_u, newU));
  }, [u, block.max_u, block.min_u]);

  const clientXToScreenU = useCallback((clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return screenU;
    const rect = svg.getBoundingClientRect();
    const scaleX = VB_W / rect.width;
    const localX = (clientX - rect.left) * scaleX;
    const raw = Math.abs(localX - CX) / PPU;
    return Math.min(block.max_u * 1.4, Math.max(1, raw));
  }, [screenU, block.max_u]);

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    if (draggingRef.current === 'object') setU(clientXToU(e.clientX));
    else {
      setScreenU(clientXToScreenU(e.clientX));
      onCatcherMove?.();
      if (result.isVirtual) {
        setVirtualCatcherFeedback(true);
        setShowVirtualMessage(true);
        if (virtualFeedbackTimeoutRef.current) clearTimeout(virtualFeedbackTimeoutRef.current);
        if (virtualMsgTimeoutRef.current) clearTimeout(virtualMsgTimeoutRef.current);
        virtualFeedbackTimeoutRef.current = setTimeout(() => setVirtualCatcherFeedback(false), 800);
        virtualMsgTimeoutRef.current = setTimeout(() => setShowVirtualMessage(false), 3000);
      }
    }
  };
  const stopDrag = () => { draggingRef.current = null; };

  // ─── geometry for drawing ─────────────────────────────────────────────
  const objX = xForU(u);
  const objTipY = AXIS_Y - block.object_height * HPU;
  const imgX = result.atInfinity ? null : xForV(device, result.v, result.isVirtual);
  const imgTipY = result.atInfinity ? null : AXIS_Y - result.imageHeight * HPU;
  const effectiveCatcherX = mirror ? CX - effectiveScreenU * PPU : CX + effectiveScreenU * PPU;
  const sharp = imgReal && imgX !== null && Math.abs(effectiveCatcherX - imgX) * 1 <= SCREEN_TOLERANCE;

  useEffect(() => {
    if (sharp && !hasFocused) {
      setTimeout(() => setHasFocused(true), 0);
    }
  }, [sharp, hasFocused]);

  const screenDistForExport = imgX !== null ? Math.abs(effectiveCatcherX - imgX) : Infinity;

  useEffect(() => {
    onResultChange?.(result, device, twistActive, screenDistForExport);
  }, [result, device, twistActive, screenDistForExport, onResultChange]);

  const f1x = CX - focalLength * PPU, f2x = CX + focalLength * PPU;
  const twof1x = CX - 2 * focalLength * PPU, twof2x = CX + 2 * focalLength * PPU;

  let objYOffset = 0;
  let imgYOffset = 0;
  let isOverlap = false;

  const actualM = imgX !== null ? Math.abs(result.m) : 0;
  const cappedM = Math.min(actualM, 2.5);
  const objW = block.object_height * HPU;
  const objH = block.object_height * HPU;
  const imgW = objW * cappedM;
  const imgH = objH * cappedM;

  if (block.object_image_url && imgX !== null) {
    const horizOverlap = Math.abs(objX - imgX) < (objW + imgW) / 2 + 10;
    if (horizOverlap && result.erect) {
      isOverlap = true;
      const shift = (imgH + 16) / 2;
      objYOffset = -shift;
      imgYOffset = shift; 
    }
  } else if (imgX !== null) {
    isOverlap = Math.abs(objX - imgX) <= 15;
    if (isOverlap) {
      objYOffset = -10;
      imgYOffset = 10;
    }
  }
  const dropShadow = isOverlap ? 'drop-shadow(0px 4px 6px rgba(0,0,0,0.7))' : 'none';

  const screenDist = imgX !== null ? Math.abs(effectiveCatcherX - imgX) : Infinity;
  const glowIntensity = Math.max(0, 1 - screenDist / 50);

  const isTargetMode = isBigReal || classifyForMission(result) === 'small_real';
  const showCatcherNudgeRaw = isTargetMode && screenDist > 6 && !catcherMoved && !hasFocusedOnce;
  const [showCatcherNudge, setShowCatcherNudge] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (showCatcherNudgeRaw) {
      t = setTimeout(() => setShowCatcherNudge(true), 4000);
    } else {
      t = setTimeout(() => setShowCatcherNudge(false), 0);
    }
    return () => clearTimeout(t);
  }, [showCatcherNudgeRaw]);

  // Intro Animation
  const cancelIntroRef = useRef(false);
  const prevIntroState = useRef(introState);

  useEffect(() => {
    const f = focalLength;
    const posFar = Math.min(block.max_u, f * 2 + (block.max_u - f * 2) * 0.85);

    if ((prevIntroState.current === 'playing' || prevIntroState.current === 'handoff') && introState === 'done') {
      if (!hasInteracted) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setU(posFar);
      }
    }
    prevIntroState.current = introState;

    if (introState !== 'playing' && introState !== 'handoff') {
      cancelIntroRef.current = true;
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      if (introState === 'playing') setIntroState?.('handoff');
      if (introState === 'handoff') {
        const t = setTimeout(() => setIntroState?.('done'), 4000);
        return () => clearTimeout(t);
      }
      return;
    }

    cancelIntroRef.current = false;
    const posCloser = f + (f * 2 - f) * 0.5;
    const posVeryClose = f * 0.5;

    const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const animateU = (fromU: number, toU: number, duration: number) => {
      return new Promise<void>((resolve) => {
        const start = performance.now();
        const tick = (now: number) => {
          if (cancelIntroRef.current) return resolve();
          const elapsed = now - start;
          const t = Math.min(1, elapsed / duration);
          setU(fromU + (toU - fromU) * easeInOutCubic(t));
          if (t < 1) requestAnimationFrame(tick);
          else resolve();
        };
        requestAnimationFrame(tick);
      });
    };

    const wait = (ms: number) => new Promise<void>(resolve => {
      const start = performance.now();
      const tick = (now: number) => {
        if (cancelIntroRef.current) return resolve();
        if (now - start >= ms) resolve();
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

    if (introState === 'playing') {
      (async () => {
        setU(posFar);
        await wait(1500);
        if (cancelIntroRef.current) return;
        await animateU(posFar, posCloser, 1200);
        if (cancelIntroRef.current) return;
        await wait(2000);
        if (cancelIntroRef.current) return;
        await animateU(posCloser, posVeryClose, 1200);
        if (cancelIntroRef.current) return;
        await wait(2000);
        if (cancelIntroRef.current) return;
        await animateU(posVeryClose, posFar, 1200);
        if (cancelIntroRef.current) return;
        setIntroState?.('handoff');
      })();
    }

    if (introState === 'handoff') {
      (async () => {
        const offset = (block.max_u - block.min_u) * 0.25;
        const targetU = Math.max(block.min_u, u - offset);
        const startU = u;
        await animateU(startU, targetU, 1200);
        if (cancelIntroRef.current) return;
        await animateU(targetU, startU, 1200);
        if (cancelIntroRef.current) return;
        await wait(600);
        if (cancelIntroRef.current) return;
        setIntroState?.('done');
      })();
    }

    return () => { cancelIntroRef.current = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [introState, focalLength, block.max_u, block.min_u, setIntroState, hasInteracted]);

  const label = effectiveFlipped
    ? 'Real projectors load the film upside down so the picture on the screen comes out right-side up!'
    : twistActive
    ? 'Now try to make it BIG'
    : currentMission
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? (!labMode && (currentMission as any).simpleText ? (currentMission as any).simpleText : currentMission.prompt)
    : 'Explore freely';
  const imageSvgGroup = introStage >= 2 && imgX !== null ? (
    <g 
      style={{ 
        opacity: result.isVirtual ? 0.4 : 1, 
        filter: result.isVirtual ? 'drop-shadow(0px 0px 10px rgba(244,114,182,0.4))' : dropShadow, 
        transition: 'all 0.15s ease-out, opacity 200ms ease-out', 
        transform: `translate(${imgX}px, ${imgYOffset}px)`,
        pointerEvents: result.isVirtual ? 'none' : 'auto'
      }}
    >
      <g style={result.isVirtual ? { animation: 'popInVirtual 300ms ease-out forwards', transformOrigin: 'center', transformBox: 'fill-box' } : undefined}>
        {imgYOffset !== 0 && (
          <line 
            x1={0} y1={-imgYOffset} 
            x2={0} y2={block.object_image_url ? (result.erect ? -imgH/2 : imgH/2) : (imgTipY! - AXIS_Y)/2} 
            stroke="rgba(255,255,255,0.4)" strokeDasharray="4 4" strokeWidth={1.5} 
          />
        )}
        {block.object_image_url ? (
          <>
            <g style={{ transition: 'transform 0.4s ease-out, opacity 300ms ease-out', opacity: imageOpacity }} transform={`translate(0, ${AXIS_Y}) scale(1, ${result.erect ? 1 : (effectiveFlipped ? 1 : -1)}) translate(0, ${-AXIS_Y})`}>
              <image
                href={block.object_image_url}
                x={-imgW / 2}
                y={AXIS_Y - imgH}
                width={imgW}
                height={imgH}
                preserveAspectRatio="xMidYMid slice"
              />
              <rect
                x={-imgW / 2}
                y={AXIS_Y - imgH}
                width={imgW}
                height={imgH}
                fill="none"
                stroke={result.isVirtual ? "#f472b6" : "#4ade80"}
                strokeWidth={result.isVirtual ? 1.5 : 2}
                strokeDasharray={result.isVirtual ? "5 4" : undefined}
              />
              <polygon points={`-6,${AXIS_Y - imgH} 6,${AXIS_Y - imgH} 0,${AXIS_Y - imgH - 8}`} fill={result.isVirtual ? "#f472b6" : "#4ade80"} />
            </g>
            {actualM > 2.5 && (
              <text 
                x={imgW / 2 + 8} 
                y={result.erect ? AXIS_Y - imgH / 2 : AXIS_Y + imgH / 2} 
                fill="#FBBF24" fontSize={14} fontWeight="bold" dominantBaseline="middle"
              >
                ×{actualM.toFixed(1)}
              </text>
            )}
          </>
        ) : (
          <g>
            <line x1={0} y1={AXIS_Y} x2={0} y2={imgTipY!} stroke="#f472b6" strokeWidth={3} strokeDasharray={result.isVirtual ? '5 4' : undefined} />
            <polygon points={`-5,${imgTipY! + (imgTipY! < AXIS_Y ? 8 : -8)} 5,${imgTipY! + (imgTipY! < AXIS_Y ? 8 : -8)} 0,${imgTipY! + (imgTipY! < AXIS_Y ? -2 : 2)}`} fill="#f472b6" />
          </g>
        )}
      </g>
    </g>
  ) : null;

  return (
    <div className={labMode ? "flex flex-col items-center gap-2 md:gap-3 w-full" : "flex flex-col items-center gap-2 md:gap-3 w-full max-md:contents"}>
      <style>{`
        @keyframes wiggleX {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
      `}</style>
      <p className="hidden md:block text-white text-sm text-center font-medium">{block.title}</p>

      {/* mission / twist chip */}
      {introStage >= 3 && (
        <div className={labMode 
          ? "px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[11px] md:text-xs font-bold transition-colors duration-150 max-w-full text-center line-clamp-2 md:line-clamp-none"
          : "px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[11px] md:text-xs font-bold transition-colors duration-150 max-w-full text-center line-clamp-2 md:line-clamp-none max-md:order-1 max-md:mt-2 max-md:w-[90%]"} style={{
          background: twistActive ? 'rgba(248,113,113,0.18)' : 'rgba(45,212,191,0.18)',
          border: `1px solid ${twistActive ? 'rgba(248,113,113,0.4)' : 'rgba(45,212,191,0.4)'}`,
          color: twistActive ? '#f87171' : '#2dd4bf',
        }}>
          <div key={label} className="animate-[fadeIn_0.15s_ease-out] flex items-center justify-center gap-2">
            <span>{label}</span>
            {effectiveFlipped && (
              <button onClick={() => setFilmFlipped?.(false)} className="underline opacity-80 hover:opacity-100 text-[#2dd4bf]">
                Flip back
              </button>
            )}
          </div>
        </div>
      )}

      {showLegend && introStage >= 3 && labMode && (
        <div className="hidden md:flex items-center gap-3 bg-black/40 px-4 py-2 rounded-full border border-white/10 text-xs font-medium text-white/80 mt-1 animate-[fadeIn_0.5s_ease-out]">
          <span>🟢 Object</span>
          <span>·</span>
          <span>🩷 Image</span>
          <span>·</span>
          <span>⬜ Catcher</span>
          <button onClick={() => setShowLegend(false)} className="ml-2 text-white/40 hover:text-white transition">✕</button>
        </div>
      )}

      {showTooltip && labMode && (
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-bold px-4 py-2 rounded-lg shadow-xl animate-[fadeIn_0.3s_ease-out] z-10 text-center max-w-[90%]">
          The whole image is still there, just dimmer! Every part of the lens sees the whole object.
        </div>
      )}
      <div
        className={labMode ? "relative w-[calc(100%+1.5rem)] md:w-full rounded-2xl overflow-hidden select-none touch-none h-[140px] md:h-auto" : "relative w-[calc(100%+1.5rem)] md:w-full rounded-2xl overflow-hidden select-none touch-none h-[120px] md:h-auto max-md:order-3"}
        style={{ background: 'rgba(0,0,0,0.35)', maxWidth: 640 }}
        onPointerMove={onPointerMove}
        onPointerUp={stopDrag}
        onPointerLeave={stopDrag}
      >
        <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 md:static md:translate-y-0">
          <svg ref={svgRef} viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-auto">
          {/* principal axis */}
          {labMode && <line x1={20} y1={AXIS_Y} x2={VB_W - 20} y2={AXIS_Y} stroke="rgba(255,255,255,0.25)" strokeDasharray="4 4" />}

          {/* simple mode zones (convex lens only) */}
          {!labMode && device === 'convex_lens' && (
            <g className="transition-all duration-150">
              {/* Far away */}
              <rect x={xForU(block.max_u)} y={AXIS_Y - 4} width={twof1x - xForU(block.max_u)} height={8} rx={4}
                    fill="#38BDF8" opacity={u > 2 * focalLength ? 0.35 : 0.15} style={{ transition: 'opacity 150ms ease-out' }} />
              {/* Closer */}
              <rect x={twof1x} y={AXIS_Y - 4} width={f1x - twof1x} height={8} rx={4}
                    fill="#FBBF24" opacity={u > focalLength && u <= 2 * focalLength ? 0.35 : 0.15} style={{ transition: 'opacity 150ms ease-out' }} />
              {/* Very close */}
              <rect x={f1x} y={AXIS_Y - 4} width={CX - f1x} height={8} rx={4}
                    fill="#C084FC" opacity={u <= focalLength ? 0.35 : 0.15} style={{ transition: 'opacity 150ms ease-out' }} />

              {/* Chips under the track */}
              <g transform={`translate(${xForU(block.max_u) + (twof1x - xForU(block.max_u)) / 2}, ${AXIS_Y + 28})`} style={{ transition: 'opacity 150ms ease-out', opacity: u > 2 * focalLength ? 1 : 0.5 }}>
                <text textAnchor="middle" fontSize={20} y={0}>📷</text>
                <text textAnchor="middle" fontSize={12} fill="#38BDF8" fontWeight="bold" y={16}>Far away</text>
              </g>

              <g transform={`translate(${twof1x + (f1x - twof1x) / 2}, ${AXIS_Y + 28})`} style={{ transition: 'opacity 150ms ease-out', opacity: u > focalLength && u <= 2 * focalLength ? 1 : 0.5 }}>
                <text textAnchor="middle" fontSize={20} y={0}>🎬</text>
                <text textAnchor="middle" fontSize={12} fill="#FBBF24" fontWeight="bold" y={16}>Closer</text>
              </g>

              <g transform={`translate(${f1x + (CX - f1x) / 2}, ${AXIS_Y + 28})`} style={{ transition: 'opacity 150ms ease-out', opacity: u <= focalLength ? 1 : 0.5 }}>
                <text textAnchor="middle" fontSize={20} y={0}>🔍</text>
                <text textAnchor="middle" fontSize={12} fill="#C084FC" fontWeight="bold" y={16}>Very close</text>
              </g>
            </g>
          )}

          {/* F / 2F ticks */}
          {labMode && [f1x, f2x].map((x, i) => (
            <g key={`f${i}`}>
              <line x1={x} y1={AXIS_Y - 6} x2={x} y2={AXIS_Y + 6} stroke="#FBBF24" strokeWidth={2} />
              <text x={x} y={AXIS_Y + 24} fill="#FBBF24" fontSize={16} fontWeight="bold" textAnchor="middle">F</text>
            </g>
          ))}
          {labMode && !mirror && [twof1x, twof2x].map((x, i) => (
            <g key={`2f${i}`}>
              <line x1={x} y1={AXIS_Y - 4} x2={x} y2={AXIS_Y + 4} stroke={bump2F ? "#4ade80" : "rgba(251,191,36,0.5)"} strokeWidth={bump2F ? 4 : 2} style={{ transition: 'all 0.1s ease-out' }} />
              <text x={x} y={AXIS_Y + 22} fill={bump2F ? "#4ade80" : "rgba(251,191,36,0.7)"} fontSize={bump2F ? 16 : 14} fontWeight="bold" textAnchor="middle" style={{ transition: 'all 0.1s ease-out' }}>2F</text>
            </g>
          ))}

          {/* device glyph */}
          {mirror ? (
            <path
              d={device === 'concave_mirror'
                ? `M ${CX} 40 Q ${CX - 26} ${AXIS_Y} ${CX} ${VB_H - 40}`
                : `M ${CX} 40 Q ${CX + 26} ${AXIS_Y} ${CX} ${VB_H - 40}`}
              fill="none" stroke="#93c5fd" strokeWidth={4}
            />
          ) : (
            <g>
              <path
                d={device === 'convex_lens'
                  ? `M ${CX - 10} 40 Q ${CX + 14} ${AXIS_Y} ${CX - 10} ${VB_H - 40} Q ${CX - 34} ${AXIS_Y} ${CX - 10} 40`
                  : `M ${CX - 6} 40 L ${CX + 6} 40 Q ${CX - 10} ${AXIS_Y} ${CX + 6} ${VB_H - 40} L ${CX - 6} ${VB_H - 40} Q ${CX + 22} ${AXIS_Y} ${CX - 6} 40`}
                fill="rgba(147,197,253,0.25)" stroke="#93c5fd" strokeWidth={3}
              />
              {halfCovered && !isBigReal && (
                <rect x={CX - 30} y={40} width={30} height={VB_H - 80} fill="rgba(0,0,0,0.55)" />
              )}
              {isBigReal && (
                <rect 
                  x={CX - 30} 
                  y={40} 
                  width={30} 
                  height={(VB_H - 80) / 2} 
                  fill="#111827" 
                  style={{
                    transition: 'transform 300ms ease-out, opacity 300ms',
                    transform: halfCovered ? 'translateY(0)' : 'translateY(-200px)',
                    opacity: halfCovered ? 1 : 0
                  }}
                />
              )}
            </g>
          )}

          {/* virtual image rendered underneath object */}
          {result.isVirtual && imageSvgGroup}

          {/* rays */}
          {labMode && introStage >= 2 && imgX !== null && (
            <>
              <style>{`
                @keyframes revealRay {
                  from { stroke-dashoffset: 2000; }
                  to { stroke-dashoffset: 0; }
                }
                @keyframes popInVirtual {
                  0% { transform: scale(0.85); opacity: 0; }
                  100% { transform: scale(1); opacity: 1; }
                }
              `}</style>
              {result.isVirtual ? (
                <>
                  <mask id="rayMask">
                    <line x1={CX} y1={objTipY} x2={imgX} y2={imgTipY!} stroke="white" strokeWidth={5} style={{ strokeDasharray: 2000, animation: 'revealRay 0.5s ease-out forwards' }} />
                    <line x1={CX} y1={AXIS_Y} x2={imgX} y2={imgTipY!} stroke="white" strokeWidth={5} style={{ strokeDasharray: 2000, animation: 'revealRay 0.5s ease-out forwards' }} />
                  </mask>
                  <g style={{ pointerEvents: 'none' }} mask="url(#rayMask)">
                    <line x1={CX} y1={objTipY} x2={imgX} y2={imgTipY!} stroke="#FBBF24" strokeWidth={1.5} strokeDasharray="5 4" opacity={0.6} />
                    <line x1={CX} y1={AXIS_Y} x2={imgX} y2={imgTipY!} stroke="#2dd4bf" strokeWidth={1.5} strokeDasharray="5 4" opacity={0.6} />
                  </g>
                  <g stroke="#FBBF24" strokeWidth={1.5} opacity={0.85}>
                    <line x1={objX} y1={objTipY} x2={CX} y2={objTipY} />
                    <line x1={CX} y1={objTipY} x2={VB_W} y2={objTipY + ((objTipY - imgTipY!) / (CX - imgX)) * (VB_W - CX)} />
                  </g>
                  <g stroke="#2dd4bf" strokeWidth={1.5} opacity={0.85}>
                    <line x1={objX} y1={objTipY} x2={CX} y2={AXIS_Y} />
                    <line x1={CX} y1={AXIS_Y} x2={VB_W} y2={AXIS_Y + ((AXIS_Y - imgTipY!) / (CX - imgX)) * (VB_W - CX)} />
                  </g>
                </>
              ) : (
                <>
                  <g stroke="#FBBF24" strokeWidth={1.5} opacity={0.85}>
                    <line x1={objX} y1={objTipY} x2={CX} y2={objTipY} />
                    <line x1={CX} y1={objTipY} x2={imgX} y2={imgTipY!} />
                  </g>
                  <g stroke="#2dd4bf" strokeWidth={1.5} opacity={0.85}>
                    <line x1={objX} y1={objTipY} x2={imgX} y2={imgTipY!} />
                  </g>
                </>
              )}
            </>
          )}

          {/* object arrow / image */}
          {introStage >= 1 && (
            <g style={{ filter: dropShadow, transition: 'all 0.15s ease-out', transform: `translate(${objX}px, ${objYOffset}px)` }}>
            {objYOffset !== 0 && (
              <line 
                x1={0} y1={-objYOffset} 
                x2={0} y2={block.object_image_url ? -objH/2 : (objTipY - AXIS_Y)/2} 
                stroke="rgba(255,255,255,0.4)" strokeDasharray="4 4" strokeWidth={1.5} 
              />
            )}
            {block.object_image_url ? (
              <g style={{ opacity: objectOpacity, transition: 'opacity 300ms ease-out' }}>
                <image
                  href={block.object_image_url}
                  x={-objW / 2}
                  y={AXIS_Y - objH}
                  width={objW}
                  height={objH}
                  preserveAspectRatio="xMidYMid slice"
                  style={{ transform: effectiveFlipped ? 'scaleY(-1)' : 'none', transformOrigin: 'center', transition: 'transform 0.4s ease-out' }}
                />
                <polygon points={`-6,${AXIS_Y - objH} 6,${AXIS_Y - objH} 0,${AXIS_Y - objH - 8}`} fill="#4ade80" />
              </g>
            ) : (
              <g>
                <line x1={0} y1={AXIS_Y} x2={0} y2={objTipY} stroke="#4ade80" strokeWidth={3} />
                <polygon points={`-5,${objTipY + 8} 5,${objTipY + 8} 0,${objTipY - 2}`} fill="#4ade80" />
              </g>
            )}
          </g>
          )}

          {/* real image rendered above object */}
          {!result.isVirtual && imageSvgGroup}

          {/* screen (only meaningful for real-image side) */}
          {labMode && !twistActive && introStage >= 3 && (
            <g
              style={{ cursor: 'ew-resize' }}
              onPointerDown={() => {
                draggingRef.current = 'screen';
                setHasTouchedCatcher(true);
                onCatcherMove?.();
              }}
            >
              {!hasFocused && !hasTouchedCatcher && (
                <rect x={effectiveCatcherX - 14} y={35} width={28} height={VB_H - 70} fill="none" stroke="#fde047" strokeWidth={2} className="animate-[pulse_1.5s_infinite_ease-in-out]" style={{ pointerEvents: 'none' }} rx={4} />
              )}
              <rect x={effectiveCatcherX - 22} y={30} width={44} height={VB_H - 60} fill="transparent" />
              {imgReal && imgX !== null && glowIntensity > 0 && (
                <rect x={effectiveCatcherX - 15} y={40} width={30} height={VB_H - 80} fill="rgba(251, 191, 36, 0.4)" opacity={glowIntensity} style={{ filter: `blur(${glowIntensity * 12}px)` }} />
              )}
              <rect x={effectiveCatcherX - 10} y={34} width={20} height={VB_H - 68} rx={4}
                fill="none" stroke="#F87171" strokeWidth={3} 
                opacity={virtualCatcherFeedback ? 0.8 : 0}
                style={{ filter: 'blur(3px)', transition: 'opacity 800ms ease-out' }}
                pointerEvents="none"
              />
              <rect x={effectiveCatcherX - 4} y={40} width={8} height={VB_H - 80} rx={2}
                fill={sharp ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)'} />
              <text x={effectiveCatcherX} y={26} fill="white" fontSize={14} fontWeight="bold" textAnchor="middle" opacity={0.7}>Catcher</text>
              {showCatcherNudge && (
                <text x={effectiveCatcherX + 35} y={26} fill="white" fontSize={14} fontWeight="bold" className="motion-safe:animate-[wiggleX_1.2s_infinite]">◀ ▶</text>
              )}
            </g>
          )}

          {/* draggable object handle */}
          {introStage >= 1 && (
            <g
              style={{ cursor: result.isVirtual ? 'grab' : 'ew-resize' }}
              onPointerDown={() => {
                draggingRef.current = 'object';
                setHasInteracted(true);
              }}
            >
            {((!hasFocused && !hasInteracted) || result.isVirtual) && (
              <circle cx={objX} cy={AXIS_Y} r={18} fill="none" stroke="#4ade80" strokeWidth={2} className="animate-[pulse_1.5s_infinite_ease-in-out]" style={{ pointerEvents: 'none' }} />
            )}
            
            {introState === 'handoff' && !labMode && (
              <g transform={`translate(${objX}, ${AXIS_Y + 30})`} pointerEvents="none" className="animate-[fadeIn_0.3s_ease-out]">
                <text x={0} y={0} fontSize={40} textAnchor="middle" opacity={0.6}>👆</text>
                <rect x={-90} y={15} width={180} height={30} rx={15} fill="#4ade80" />
                <text x={0} y={35} fontSize={12} fill="black" fontWeight="bold" textAnchor="middle">Your turn! Drag the lighthouse</text>
              </g>
            )}
            <circle cx={objX} cy={AXIS_Y} r={result.isVirtual ? 30 : 22} fill="transparent" />
            <circle cx={objX} cy={AXIS_Y} r={10} fill="rgba(74,222,128,0.25)" stroke="#4ade80" strokeWidth={2} />
          </g>
          )}
        </svg>
        </div>
      </div>

      {/* Remote drag strip (mobile only) */}
      <div className={labMode ? "md:hidden relative w-[calc(100%+1.5rem)] -mx-3 h-[56px] mt-1 select-none" : "md:hidden relative w-[calc(100%+1.5rem)] -mx-3 h-[56px] mt-1 select-none max-md:order-4 max-md:-mt-2"} style={{ touchAction: 'none' }}>
        {/* Mobile zones (simple mode) */}
        {!labMode && device === 'convex_lens' && (
          <>
            <div className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full transition-opacity duration-150 bg-[#38BDF8]" style={{ left: `${(xForU(block.max_u) / VB_W) * 100}%`, width: `${((twof1x - xForU(block.max_u)) / VB_W) * 100}%`, opacity: u > 2 * focalLength ? 0.8 : 0.3 }} />
            <div className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full transition-opacity duration-150 bg-[#FBBF24]" style={{ left: `${(twof1x / VB_W) * 100}%`, width: `${((f1x - twof1x) / VB_W) * 100}%`, opacity: u > focalLength && u <= 2 * focalLength ? 0.8 : 0.3 }} />
            <div className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full transition-opacity duration-150 bg-[#C084FC]" style={{ left: `${(f1x / VB_W) * 100}%`, width: `${((CX - f1x) / VB_W) * 100}%`, opacity: u <= focalLength ? 0.8 : 0.3 }} />
          </>
        )}

        {/* Object knob */}
        {introStage >= 1 && (
          <div 
            className="absolute top-1/2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing w-[48px] h-[56px]"
            style={{ 
              left: `clamp(24px, ${(objX / VB_W) * 100}%, calc(100% - 24px))`,
              transform: 'translate(-50%, -50%)',
              touchAction: 'none'
            }}
            role="slider"
            aria-label="Move object"
            aria-valuenow={Math.round(u)}
            onPointerDown={(e) => {
              e.stopPropagation();
              draggingRef.current = 'object';
              setHasInteracted(true);
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              e.stopPropagation();
              if (draggingRef.current === 'object') {
                 setU(clientXToU(e.clientX));
              }
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              draggingRef.current = null;
              e.currentTarget.releasePointerCapture(e.pointerId);
            }}
            onPointerCancel={(e) => {
              e.stopPropagation();
              draggingRef.current = null;
            }}
          >
            <div className="relative flex items-center justify-center w-[32px] h-[32px] mb-0.5">
              {(!hasFocused && !hasInteracted) && (
                <div className="absolute inset-0 rounded-full border border-[#4ade80] animate-[pulse_1.5s_infinite_ease-in-out]"></div>
              )}
              <div className="w-[24px] h-[24px] rounded-full bg-[rgba(74,222,128,0.25)] border-2 border-[#4ade80] flex items-center justify-center shadow-md">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80]"></div>
              </div>
            </div>
            <span className="text-[9px] font-bold text-[#4ade80] uppercase tracking-wider leading-none">Object</span>
          </div>
        )}

        {/* Catcher knob */}
        {labMode && !twistActive && introStage >= 3 && (
          <div 
            className="absolute top-1/2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing w-[48px] h-[56px]"
            style={{ 
              left: `clamp(24px, ${(effectiveCatcherX / VB_W) * 100}%, calc(100% - 24px))`,
              transform: 'translate(-50%, -50%)',
              touchAction: 'none'
            }}
            role="slider"
            aria-label="Move catcher"
            aria-valuenow={Math.round(effectiveScreenU)}
            onPointerDown={(e) => {
              e.stopPropagation();
              draggingRef.current = 'screen';
              setHasTouchedCatcher(true);
              onCatcherMove?.();
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              e.stopPropagation();
              if (draggingRef.current === 'screen') {
                 setScreenU(clientXToScreenU(e.clientX));
                 onCatcherMove?.();
                 if (result.isVirtual) {
                   setVirtualCatcherFeedback(true);
                   setShowVirtualMessage(true);
                   if (virtualFeedbackTimeoutRef.current) clearTimeout(virtualFeedbackTimeoutRef.current);
                   if (virtualMsgTimeoutRef.current) clearTimeout(virtualMsgTimeoutRef.current);
                   virtualFeedbackTimeoutRef.current = setTimeout(() => setVirtualCatcherFeedback(false), 800);
                   virtualMsgTimeoutRef.current = setTimeout(() => setShowVirtualMessage(false), 3000);
                 }
              }
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              draggingRef.current = null;
              e.currentTarget.releasePointerCapture(e.pointerId);
            }}
            onPointerCancel={(e) => {
              e.stopPropagation();
              draggingRef.current = null;
            }}
          >
            <div className={`relative flex flex-col items-center justify-center w-full h-full ${showCatcherNudge ? 'motion-safe:animate-[wiggleX_1.2s_infinite]' : ''}`}>
              {showCatcherNudge && (
                <span className="absolute -top-4 text-white text-sm">↔</span>
              )}
              <div className="relative flex items-center justify-center w-[32px] h-[32px] mb-0.5">
                {(!hasFocused && !hasTouchedCatcher) && (
                  <div className="absolute inset-0 rounded-full border border-white animate-[pulse_1.5s_infinite_ease-in-out]"></div>
                )}
                <div className="w-[24px] h-[24px] rounded-full bg-white/20 border-2 border-white flex items-center justify-center shadow-md">
                   <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>
              </div>
              <span className="text-[9px] font-bold text-white uppercase tracking-wider opacity-80 leading-none">Catcher</span>
            </div>
          </div>
        )}
      </div>

      {/* virtual catcher message */}
      <div className={labMode ? "h-[20px] md:h-[24px] flex items-center justify-center transition-opacity duration-300 -mt-1 md:mt-0" : "hidden"} style={{ opacity: showVirtualMessage ? 1 : 0, pointerEvents: showVirtualMessage ? 'auto' : 'none' }}>
        <div className="text-sm text-[#F87171] font-medium max-w-lg text-center px-4">
          Virtual images can&apos;t be caught on a screen — they only exist for your eye.
        </div>
      </div>

      <div className={labMode ? "flex flex-col items-center gap-1 md:gap-2" : "flex flex-col items-center gap-1 md:gap-2 max-md:order-5 max-md:my-2"}>
        {!labMode && device === 'convex_lens' ? (
          <div className="text-sm text-white/90 font-medium text-center px-4 max-w-lg leading-tight md:leading-normal">
            {result.atInfinity 
              ? "😮 Right on the edge: the picture is gone! Move the lighthouse a tiny bit."
              : classifyForMission(result) === 'small_real' 
              ? "📷 Far away: the picture is tiny and upside-down, just like a camera."
              : classifyForMission(result) === 'big_real'
              ? "🎬 Closer: the picture is HUGE, just like a projector."
              : "🔍 Very close: it looks big and the right way up, just like a magnifying glass."}
          </div>
        ) : result.atInfinity ? (
          <div className="text-sm text-red-400 font-medium">→ Image gone to infinity</div>
        ) : (
          <div className="text-xs md:text-sm text-white/90 text-center px-2 md:px-4 max-w-lg leading-tight md:leading-normal">
            This image is <strong style={{color: result.isVirtual ? '#f472b6' : '#4ade80'}}>{result.isVirtual ? 'virtual' : 'real'}</strong>,{' '}
            <strong className="text-blue-300">{result.erect ? 'upright' : 'inverted'}</strong>, and{' '}
            <strong className="text-yellow-400">{Math.abs(result.m) >= 1.02 ? 'bigger' : Math.abs(result.m) <= 0.98 ? 'smaller' : 'the same size'}</strong>{' '}
            — like a <em>{classifyForMission(result) === 'big_real' ? 'projector' : classifyForMission(result) === 'small_real' ? 'camera' : classifyForMission(result) === 'virtual_big' ? 'magnifying glass' : 'lens or mirror'}</em>.
          </div>
        )}
        {!result.atInfinity && labMode && (
          <div className="flex flex-col items-center md:mt-1">
            <button onClick={() => setShowDetails(!showDetails)} className="text-[10px] text-white/50 hover:text-white/80 transition uppercase tracking-wider mb-1 md:mb-2 mt-1 md:mt-0">
              {showDetails ? 'Hide Details ▲' : 'Show Details ▼'}
            </button>
            {showDetails && (
              <div className="flex gap-2 flex-wrap justify-center animate-[fadeIn_0.3s_ease-out]">
                <Tag text={result.isVirtual ? 'VIRTUAL' : 'REAL'} color={result.isVirtual ? '#f472b6' : '#4ade80'} />
                <Tag text={result.erect ? 'UPRIGHT' : 'INVERTED'} color="#93c5fd" />
                <Tag text={Math.abs(result.m) >= 1.02 ? 'BIGGER' : Math.abs(result.m) <= 0.98 ? 'SMALLER' : 'SAME SIZE'} color="#FBBF24" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* half-cover surprise, offered once first mission is done */}
      {block.allow_half_cover && !mirror && missionDone[0] && !twistActive && labMode && (
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => setHalfCovered?.(h => !h)}
            className="min-h-[44px] px-4 py-2 text-white/80 text-xs rounded-full border border-white/20 hover:text-white transition flex items-center justify-center"
          >
            {halfCovered ? '✋ Uncover the lens' : '✋ Cover half the lens'}
          </button>
          {halfCovered && (
            <div className="text-xs text-yellow-300 font-medium animate-[fadeIn_0.3s_ease-out]">
              Notice: still the WHOLE image — just dimmer.
            </div>
          )}
        </div>
      )}

      {/* Flip the film button */}
      {classifyForMission(result) === 'big_real' && screenDist <= 6 && filmFlipped === false && labMode && (
        <div className="flex flex-col items-center gap-2 mt-2">
          <p className="text-white/90 text-sm font-medium">Wait, movies aren&apos;t upside down. How do we fix this?</p>
          <button
            onClick={() => setFilmFlipped?.(true)}
            className="h-[44px] px-6 rounded-full bg-[#111827] border border-[#2dd4bf] text-[#2dd4bf] font-bold shadow-lg flex items-center justify-center hover:bg-[#1f2937] transition"
          >
            🔄 Flip the film
          </button>
        </div>
      )}

      {labMode && (
        <>
          <p className="hidden md:block text-white/50 text-[11px] text-center max-w-md">Drag the green arrow along the line. Drag the white bar to catch the image.</p>
          <p className="block md:hidden text-white/50 text-[11px] text-center max-w-md">Slide the knobs below the diagram to move the object and the catcher.</p>
        </>
      )}
    </div>
  );
}

function Tag({ text, color }: { text: string; color: string }) {
  return (
    <span className="px-3 py-1 rounded-full text-[11px] font-bold" style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}>
      {text}
    </span>
  );
}


