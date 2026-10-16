'use client';
import { useState, useEffect, useRef } from 'react';
import { preloadVoices } from './lib/tts';
import { collectVoiceDiagnostics } from './lib/voiceDiagnostics';
import LeadGate from './components/LeadGate';
import { HeroSlide } from './components/HeroSection';
import AhaScene from './components/AhaScene';
import DemoPlayer from './components/DemoPlayer';
import LockedFeatures from './components/LockedFeatures';
import ContactSection from './components/ContactSection';
import SurveySection from './components/SurveySection';
import { LeadFormData, PageId } from './types';
import PageFlow, { PageFlowHandle } from './components/PageFlow';
import { getRoleConfig } from './data/roleConfig';

export default function Home() {
  const [gateOpen, setGateOpen] = useState(true);
  const [leadData, setLeadData] = useState<LeadFormData | null>(null);
  const flowRef = useRef<PageFlowHandle>(null);

  useEffect(() => {
    preloadVoices();
  }, []);

  useEffect(() => {
    if (!gateOpen) {
      const timer = setTimeout(() => {
        collectVoiceDiagnostics(leadData?.role || 'Other');
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [gateOpen, leadData?.role]);

  const handleDemoComplete = () => {
    setTimeout(() => {
      flowRef.current?.goTo('features');
    }, 400);
  };

  const config = getRoleConfig(leadData?.role);

  const pageLabels: Record<PageId, string> = {
    hero: 'Home',
    aha: 'Your view',
    demo: 'Try the demo',
    features: 'What you get',
    survey: 'Survey',
    contact: 'Contact',
  };

  const demoIdx = config.pageOrder.indexOf('demo');
  const prevPageId = demoIdx > 0 ? config.pageOrder[demoIdx - 1] : null;
  const nextPageId =
    demoIdx !== -1 && demoIdx < config.pageOrder.length - 1
      ? config.pageOrder[demoIdx + 1]
      : null;

  const pageDefinitions: Record<PageId, { id: string; label: string; node: React.ReactNode; hideNext?: boolean; gestures?: boolean }> = {
    hero: { id: 'hero', label: 'Home', node: <HeroSlide config={{ ...config.hero, key: config.key }} /> },
    aha: {
      id: 'aha',
      label: 'Your view',
      node: (
        <AhaScene
          role={config.key}
          schoolName={leadData?.schoolName ?? ''}
          config={config.aha}
        />
      ),
    },
    demo: {
      id: 'demo',
      label: 'Try the demo',
      node: (
        <DemoPlayer
          onComplete={handleDemoComplete}
          isActive={!gateOpen}
          onPrevPage={() => {
            if (prevPageId) flowRef.current?.goTo(prevPageId);
          }}
          onNextPage={() => {
            if (nextPageId) flowRef.current?.goTo(nextPageId);
          }}
          prevPageLabel={prevPageId ? pageLabels[prevPageId] : 'Home'}
          nextPageLabel={nextPageId ? pageLabels[nextPageId] : 'What you get'}
        />
      ),
      hideNext: true,
      gestures: false
    },
    features: { id: 'features', label: 'What you get', node: <LockedFeatures config={config.features} /> },
    survey: { id: 'survey', label: 'Survey', node: <SurveySection role={leadData?.role || 'Other'} name={leadData?.name || ''} mobile={leadData?.mobile || ''} onContinue={() => flowRef.current?.goTo('contact')} />, hideNext: true, gestures: false },
    contact: {
      id: 'contact',
      label: 'Contact',
      node: (
        <ContactSection
          config={config.contact}
          role={config.key}
          share={config.share}
        />
      ),
    }
  };

  const pages = config.pageOrder.map(pageId => pageDefinitions[pageId]);

  return (
    <>
      {gateOpen && <LeadGate onSubmit={(data) => {
        setLeadData(data);
        setGateOpen(false);
      }} />}
      <div className={gateOpen ? 'pointer-events-none select-none overflow-hidden' : ''}>
        <PageFlow ref={flowRef} locked={gateOpen} pages={pages} />
      </div>
    </>
  );
}
