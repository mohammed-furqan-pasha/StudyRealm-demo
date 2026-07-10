'use client';
import { useState, useEffect, useRef } from 'react';
import { preloadVoices } from './lib/tts';
import LeadGate from './components/LeadGate';
import HeroSection from './components/HeroSection';
import DemoPlayer from './components/DemoPlayer';
import LockedFeatures from './components/LockedFeatures';
import ContactSection from './components/ContactSection';

export default function Home() {
  const [gateOpen, setGateOpen] = useState(true);

  useEffect(() => {
    preloadVoices();
  }, []);
  const featuresRef = useRef<HTMLDivElement>(null);

  const handleDemoComplete = () => {
    setTimeout(() => {
      featuresRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 400);
  };

  return (
    <>
      {gateOpen && <LeadGate onSubmit={() => setGateOpen(false)} />}
      <main className={gateOpen ? 'pointer-events-none select-none blur-sm' : ''}>
        <HeroSection />
        <DemoPlayer onComplete={handleDemoComplete} isActive={!gateOpen} />
        <div ref={featuresRef}>
          <LockedFeatures />
        </div>
        <ContactSection />
      </main>
    </>
  );
}
