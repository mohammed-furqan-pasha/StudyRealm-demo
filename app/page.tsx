'use client';
import { useState, useEffect, useRef } from 'react';
import { preloadVoices } from './lib/tts';
import LeadGate from './components/LeadGate';
import HeroSection from './components/HeroSection';
import DemoPlayer from './components/DemoPlayer';
import LockedFeatures from './components/LockedFeatures';
import ContactSection from './components/ContactSection';
import SurveySection from './components/SurveySection';
import { LeadFormData } from './types';
import { scrollToSection } from './lib/scrollTo';

export default function Home() {
  const [gateOpen, setGateOpen] = useState(true);
  const [leadData, setLeadData] = useState<LeadFormData | null>(null);

  useEffect(() => {
    preloadVoices();
  }, []);
  const featuresRef = useRef<HTMLDivElement>(null);

  const handleDemoComplete = () => {
    setTimeout(() => {
      scrollToSection(featuresRef.current);
    }, 400);
  };

  return (
    <>
      {gateOpen && <LeadGate onSubmit={(data) => {
        setLeadData(data);
        setGateOpen(false);
      }} />}
      <main className={`h-[100dvh] overflow-y-auto overflow-x-hidden page-scroller ${gateOpen ? 'pointer-events-none select-none blur-sm overflow-hidden' : ''}`}>
        <HeroSection ready={!gateOpen} />
        <div className="snap-start shrink-0">
          <DemoPlayer onComplete={handleDemoComplete} isActive={!gateOpen} />
        </div>
        <div ref={featuresRef} className="snap-start shrink-0 min-h-[100dvh]">
          <LockedFeatures />
        </div>
        {leadData && (
          <div className="snap-start shrink-0 min-h-[100dvh]">
            <SurveySection role={leadData.role} name={leadData.name} mobile={leadData.mobile} />
          </div>
        )}
        <div className="snap-start shrink-0 min-h-[100dvh]">
          <ContactSection />
        </div>
      </main>
    </>
  );
}
