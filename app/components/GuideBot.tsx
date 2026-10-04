'use client';
import { useState, useEffect } from 'react';

export default function GuideBot({ isReading, onTap }: { isReading: boolean; onTap: () => void }) {
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
      className="pointer-events-auto"
      style={{
        position: 'fixed',
        bottom: '32px',
        right: '32px',
        zIndex: 50,
        cursor: 'pointer',
      }}
      title="Tap to replay audio"
    >
      {/* Realistic grounded shadow */}
      <div 
        style={{
          position: 'absolute',
          bottom: '-4px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '36px',
          height: '8px',
          background: 'rgba(0,0,0,0.5)',
          borderRadius: '50%',
          filter: 'blur(5px)',
          animation: 'pulse 3s ease-in-out infinite alternate'
        }}
      />
      {/* Bot body that floats */}
      <div style={{ animation: 'float 3s ease-in-out infinite', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))' }}>
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
    </div>
  );
}
