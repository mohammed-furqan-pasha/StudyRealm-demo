'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import OpticsLab from './OpticsLab';
import ThroughTheLens from './ThroughTheLens';
import type { OpticsLabBlockData } from '../types';
import { classifyForMission, OpticsDevice, OpticsResult } from '../lib/optics';

export default function OpticsDuo({
  block,
  onAutoRead,
  onComplete,
}: {
  block: OpticsLabBlockData;
  onAutoRead: (t: string) => void;
  onComplete?: () => void;
}) {
  const [labMode, setLabMode] = useState(false);
  const [introState, setIntroState] = useState<'idle' | 'playing' | 'handoff' | 'done'>('idle');
  const containerRef = useRef<HTMLDivElement>(null);
  const [liveResult, setLiveResult] = useState<OpticsResult | null>(null);
  const [liveDevice, setLiveDevice] = useState<OpticsDevice>(block.device);
  const [twistActive, setTwistActive] = useState(false);
  const [liveScreenDist, setLiveScreenDist] = useState(0);
  const [catcherMoved, setCatcherMoved] = useState(false);
  const [hasFocusedOnce, setHasFocusedOnce] = useState(false);

  const handleResultChange = useCallback(
    (result: OpticsResult, device: OpticsDevice, twist: boolean, screenDist?: number) => {
      setLiveResult(result);
      setLiveDevice(device);
      setTwistActive(twist);
      if (screenDist !== undefined) {
        setLiveScreenDist(screenDist);
        const mode = result.atInfinity ? 'vanish' : classifyForMission(result);
        if ((mode === 'small_real' || mode === 'big_real') && screenDist <= 6) {
          setHasFocusedOnce(true);
        }
      }
    },
    []
  );

  const [filmFlipped, setFilmFlipped] = useState(false);
  const [halfCovered, setHalfCovered] = useState(false);
  const mode = liveResult ? (liveResult.atInfinity ? 'vanish' : classifyForMission(liveResult)) : '';
  const effectiveFlipped = filmFlipped && mode === 'big_real';

  useEffect(() => {
    // Only run once per page load via a static flag
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any)._hasPlayedOpticsIntro) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
        if (!labMode && introState === 'idle') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any)._hasPlayedOpticsIntro = true;
          setIntroState('playing');
        }
      }
    }, { threshold: 0.6 });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [labMode, introState]);

  useEffect(() => {
    if (labMode && introState !== 'idle' && introState !== 'done') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIntroState('done');
    }
  }, [labMode, introState]);

  const handlePointerDown = () => {
    if (introState === 'playing' || introState === 'handoff') {
      setIntroState('done');
    }
  };

  return (
    <div ref={containerRef} onPointerDown={handlePointerDown} className="flex flex-col md:flex-row gap-3 md:gap-6 w-full h-full pb-2 md:pb-8 relative">
      {introState === 'playing' && !labMode && (
        <button 
          className="absolute top-2 right-2 md:top-4 md:right-4 z-40 text-white/50 hover:text-white text-sm p-3 font-medium pointer-events-auto"
          onClick={() => setIntroState('done')}
        >
          Skip ▸
        </button>
      )}
      <div className={labMode ? "w-full md:w-1/2 relative" : "w-full md:w-2/5 relative max-md:contents"}>
        <button
          role="switch"
          aria-checked={labMode}
          onClick={() => setLabMode(m => !m)}
          className={labMode 
            ? "absolute right-1 top-10 md:-top-1 md:right-0 z-20 min-h-[44px] px-4 rounded-full bg-black/40 border border-white/20 text-white/90 text-xs md:text-sm font-medium backdrop-blur-md hover:bg-black/60 transition"
            : "max-md:order-6 max-md:relative max-md:mt-2 max-md:self-center absolute right-1 top-10 md:-top-1 md:right-0 z-20 min-h-[44px] px-4 rounded-full bg-black/40 border border-white/20 text-white/90 text-xs md:text-sm font-medium backdrop-blur-md hover:bg-black/60 transition"
          }
        >
          {labMode ? 'Hide the physics' : '🔬 Show the physics'}
        </button>
        <OpticsLab
          labMode={labMode}
          block={block}
          onAutoRead={onAutoRead}
          onComplete={onComplete}
          onResultChange={handleResultChange}
          filmFlipped={filmFlipped}
          setFilmFlipped={setFilmFlipped}
          effectiveFlipped={effectiveFlipped}
          halfCovered={halfCovered}
          setHalfCovered={setHalfCovered}
          catcherMoved={catcherMoved}
          hasFocusedOnce={hasFocusedOnce}
          onCatcherMove={() => setCatcherMoved(true)}
          introState={introState}
          setIntroState={setIntroState}
        />
      </div>
      <div className={labMode ? "w-full md:w-1/2" : "w-full md:w-3/5 max-md:contents"}>
        {block.object_image_url && liveResult && (
          <div className={labMode ? "w-full" : "w-full max-md:order-2"}>
            <ThroughTheLens
              worldImageUrl={block.object_image_url}
              result={liveResult}
              device={liveDevice}
              active={!twistActive}
              screenDist={liveScreenDist}
              effectiveFlipped={effectiveFlipped}
              halfCovered={halfCovered}
              hasFocusedOnce={hasFocusedOnce}
              labMode={labMode}
            />
            {introState === 'playing' && !labMode && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-6 py-2 rounded-full bg-black/60 border-2 backdrop-blur-md shadow-2xl transition-colors duration-150 pointer-events-none" style={{ borderColor: mode === 'small_real' ? '#38BDF8' : mode === 'big_real' ? '#FBBF24' : '#C084FC' }}>
                <span className="text-xl font-bold transition-colors duration-150" style={{ color: mode === 'small_real' ? '#38BDF8' : mode === 'big_real' ? '#FBBF24' : '#C084FC' }}>
                  {mode === 'small_real' ? '📷 Camera' : mode === 'big_real' ? '🎬 Projector' : '🔍 Magnifier'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
