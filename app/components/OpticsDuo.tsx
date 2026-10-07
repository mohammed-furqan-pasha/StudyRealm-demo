'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import OpticsLab from './OpticsLab';
import ThroughTheLens from './ThroughTheLens';
import CameraStory from './CameraStory';
import { cameraBeats } from '../data/opticsStory';
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

  const [cameraStory, setCameraStory] = useState<'idle' | 'playing' | 'done'>('idle');
  const [beat, setBeat] = useState(0);
  const beatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentBeatDef = cameraBeats.find(b => b.id === beat);
  const [exploreFlipped, setExploreFlipped] = useState(false);
  const [storyFinishedNaturally, setStoryFinishedNaturally] = useState(false);

  const handleResultChange = useCallback(
    (result: OpticsResult, device: OpticsDevice, twist: boolean, screenDist?: number) => {
      setLiveResult(result);
      setLiveDevice(device);
      setTwistActive(twist);
      if (screenDist !== undefined) {
        setLiveScreenDist(screenDist);
        const nextMode = result.atInfinity ? 'vanish' : classifyForMission(result);
        if ((nextMode === 'small_real' || nextMode === 'big_real') && screenDist <= 6) {
          setHasFocusedOnce(true);
        }
      }
    },
    []
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopVoice = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const [voiceOn, setVoiceOn] = useState(() => {
    if (typeof window !== 'undefined') return !!(window as unknown as Record<string, unknown>)._cameraVoiceOn;
    return false;
  });

  const toggleVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVoiceOn(v => {
      const next = !v;
      if (typeof window !== 'undefined') (window as unknown as Record<string, unknown>)._cameraVoiceOn = next;
      if (!next) stopVoice();
      return next;
    });
  };

  const [filmFlipped, setFilmFlipped] = useState(false);
  const [halfCovered, setHalfCovered] = useState(false);
  const mode = liveResult ? (liveResult.atInfinity ? 'vanish' : classifyForMission(liveResult)) : '';
  const effectiveFlipped = filmFlipped && mode === 'big_real';

  const isMotionSafe = typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const advanceBeat = useCallback(() => {
    setBeat(b => {
      const next = b + 1;
      if (next > cameraBeats.length) {
        setCameraStory('done');
        setStoryFinishedNaturally(true);
        return 99;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (cameraStory === 'playing' && beat >= 1 && beat <= cameraBeats.length) {
      const bDef = cameraBeats.find(b => b.id === beat);
      if (!bDef) return;

      let finishedSpeaking = !voiceOn;
      let minTimeReached = false;

      const maybeAdvance = () => {
        if (isMotionSafe && finishedSpeaking && minTimeReached) {
          advanceBeat();
        }
      };

      const handleSpeechEnd = () => {
        finishedSpeaking = true;
        maybeAdvance();
      };

      if (voiceOn) {
        if ((bDef as { audio?: string }).audio) {
          const a = new Audio((bDef as { audio?: string }).audio);
          audioRef.current = a;
          a.onended = handleSpeechEnd;
          a.onerror = handleSpeechEnd;
          a.play().catch(handleSpeechEnd);
        } else {
          const text = ((bDef as { voice?: string, caption: string }).voice || bDef.caption).replace(/[\u{1F300}-\u{1F9FF}\u{2700}-\u{27BF}]/gu, '').trim();
          if (typeof window !== 'undefined' && window.speechSynthesis) {
            const u = new SpeechSynthesisUtterance(text);
            u.rate = 0.95;
            const voices = window.speechSynthesis.getVoices();
            const inVoice = voices.find(v => v.lang === 'en-IN' || v.lang === 'en-in');
            if (inVoice) {
              u.voice = inVoice;
            } else {
              const enVoice = voices.find(v => v.lang.startsWith('en'));
              if (enVoice) u.voice = enVoice;
            }
            u.onend = handleSpeechEnd;
            u.onerror = handleSpeechEnd;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(u);
          } else {
            handleSpeechEnd();
          }
        }
      }

      beatTimerRef.current = setTimeout(() => {
        minTimeReached = true;
        maybeAdvance();
      }, bDef.durationMs);

      const fallbackTimer = setTimeout(() => {
        finishedSpeaking = true;
        minTimeReached = true;
        maybeAdvance();
      }, bDef.durationMs + 2500);

      return () => {
        if (beatTimerRef.current) clearTimeout(beatTimerRef.current);
        clearTimeout(fallbackTimer);
        stopVoice();
      };
    }
  }, [beat, cameraStory, isMotionSafe, voiceOn, advanceBeat, stopVoice]);

  useEffect(() => {
    // Only run once per page load via a static flag
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any)._hasPlayedOpticsIntro) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.6 && mode) {
        if (!labMode) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any)._hasPlayedOpticsIntro = true;
          if (mode === 'small_real') {
            if (cameraStory === 'idle') {
              setCameraStory('playing');
              setBeat(1);
            }
          } else {
            if (introState === 'idle') {
              setIntroState('playing');
            }
          }
        }
      }
    }, { threshold: 0.6 });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [labMode, introState, cameraStory, mode]);

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
    if (cameraStory === 'playing') {
      setCameraStory('done');
      setBeat(99);
      stopVoice();
    }
  };

  useEffect(() => {
    if (mode !== 'small_real') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExploreFlipped(false);
      if (cameraStory === 'playing') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCameraStory('done');
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setBeat(99);
      }
      stopVoice();
    }
  }, [mode, cameraStory, stopVoice]);

  const handleReplayStory = () => {
    setCameraStory('playing');
    setExploreFlipped(false);
    setBeat(1);
  };

  return (
    <div ref={containerRef} onPointerDown={handlePointerDown} className={labMode ? "flex flex-col md:flex-row gap-3 md:gap-6 w-full h-full pb-2 md:pb-8 relative" : "flex flex-col gap-2 w-full max-w-4xl mx-auto h-full pb-2 md:pb-8 relative"}>
      {(introState === 'playing' || (cameraStory === 'playing' && isMotionSafe)) && !labMode && (
        <div className="absolute top-2 right-2 md:top-4 md:right-4 z-40 flex items-center gap-2 pointer-events-auto">
          {cameraStory === 'playing' && (
            <button 
              className="bg-black/50 hover:bg-black/70 text-white text-sm px-4 py-2 min-h-[44px] rounded-full font-medium border border-white/20 transition backdrop-blur flex items-center gap-2"
              onClick={toggleVoice}
            >
              {voiceOn ? '🔊 Voice On' : '🔈 Voice Off'}
            </button>
          )}
          <button 
            className="text-white/50 hover:text-white text-sm p-3 min-h-[44px] font-medium"
            onClick={(e) => {
              e.stopPropagation();
              if (introState === 'playing') setIntroState('done');
              if (cameraStory === 'playing') { setCameraStory('done'); setBeat(99); stopVoice(); }
            }}
          >
            Skip ▸
          </button>
        </div>
      )}
      <div className={labMode ? "w-full md:w-1/2 relative" : "contents"}>
        <OpticsLab
          labMode={labMode}
          toggleLabMode={() => setLabMode(m => !m)}
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
          cameraStoryState={cameraStory}
          exploreFlipped={exploreFlipped}
          storyFinishedNaturally={storyFinishedNaturally}
        />
      </div>
      <div className={labMode ? "w-full md:w-1/2" : "contents"}>
        {block.object_image_url && liveResult && (
          <div className={labMode ? "w-full" : "w-full order-2 aspect-[16/7] sm:aspect-[5/2] rounded-2xl overflow-hidden shrink-0 relative"} style={!labMode ? { background: 'rgba(0,0,0,0.35)', '--lens-x': '54.2857%' } as React.CSSProperties : undefined} data-zone={mode}>
            <div className="absolute inset-0 transition-opacity duration-200" style={{ opacity: !labMode && mode === 'small_real' ? 1 : 0, pointerEvents: !labMode && mode === 'small_real' ? 'auto' : 'none', zIndex: 10 }}>
              {!labMode && (
                <CameraStory 
                  worldImageUrl={block.object_image_url} 
                  scale={Math.abs(liveResult.m)} 
                  flipped={exploreFlipped}
                  beat={beat}
                  onFlipTap={() => setExploreFlipped(true)}
                />
              )}
            </div>
            <div className="w-full h-full transition-opacity duration-200" style={{ opacity: !labMode && mode === 'small_real' ? 0 : 1, pointerEvents: !labMode && mode === 'small_real' ? 'none' : 'auto' }}>
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
            </div>
            {introState === 'playing' && !labMode && mode && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-6 py-2 rounded-full bg-black/60 border-2 backdrop-blur-md shadow-2xl transition-colors duration-150 pointer-events-none" style={{ borderColor: mode === 'big_real' ? '#FBBF24' : '#C084FC' }}>
                <span className="text-xl font-bold transition-colors duration-150" style={{ color: mode === 'big_real' ? '#FBBF24' : '#C084FC' }}>
                  {mode === 'big_real' ? '🎬 Projector' : '🔍 Magnifier'}
                </span>
              </div>
            )}
            {cameraStory === 'playing' && !labMode && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 px-6 py-3 min-h-[3rem] w-[90%] md:w-[80%] rounded-2xl bg-black/80 border border-white/20 backdrop-blur-md shadow-2xl flex items-center justify-center">
                <span key={beat} className="text-base md:text-lg font-bold text-white text-center animate-[fadeIn_0.3s_ease-out]">
                  {currentBeatDef?.caption}
                </span>
                {!isMotionSafe && beat < cameraBeats.length && (
                  <button onClick={(e) => { e.stopPropagation(); advanceBeat(); }} className="absolute right-4 text-[#38BDF8] font-bold p-2 text-sm">Next ▸</button>
                )}
                {!isMotionSafe && beat === cameraBeats.length && (
                  <button onClick={(e) => { e.stopPropagation(); setCameraStory('done'); setStoryFinishedNaturally(true); setBeat(99); stopVoice(); }} className="absolute right-4 text-[#4ade80] font-bold p-2 text-sm">Done</button>
                )}
              </div>
            )}
            {cameraStory === 'done' && beat === 99 && !labMode && mode === 'small_real' && (
              <button 
                className="absolute top-3 right-3 z-30 bg-black/50 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded-full border border-white/20 transition backdrop-blur flex items-center gap-1 pointer-events-auto"
                onClick={(e) => { e.stopPropagation(); handleReplayStory(); }}
              >
                ▶ Explain this
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
