'use client';
import { useState, useCallback } from 'react';
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

  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-6 w-full h-full pb-2 md:pb-8 relative">
      <div className="w-full md:w-1/2">
        <OpticsLab
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
        />
      </div>
      <div className="w-full md:w-1/2">
        {block.object_image_url && liveResult && (
          <div className="w-full">
            <ThroughTheLens
              worldImageUrl={block.object_image_url}
              result={liveResult}
              device={liveDevice}
              active={!twistActive}
              screenDist={liveScreenDist}
              effectiveFlipped={effectiveFlipped}
              halfCovered={halfCovered}
              hasFocusedOnce={hasFocusedOnce}
            />
          </div>
        )}
      </div>
    </div>
  );
}
