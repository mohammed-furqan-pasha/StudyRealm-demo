'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { usePager } from './PageFlow';
import SceneShell, { SplitHeadline, StageReveal, SceneObject } from './SceneShell';
import TopBar from './TopBar';
import { OBJECTS } from '../data/sceneAssets';
import {
  PRINCIPAL_SAMPLE,
  getChapterStatus,
  TEACHER_SAMPLE,
  getTeacherTone,
  TeacherCell,
  PARENT_SAMPLE,
  TEACHER_CRITICAL_BELOW,
  TEACHER_STRONG_FROM,
  getConceptStats,
  getWeakestConcept,
} from '../data/ahaSamples';
import { RoleConfig, RoleKey } from '../types';
import StarCatcher from './StarCatcher';

const AHA_OBJECT_PLANET: SceneObject = {
  src: OBJECTS.planetSpace,
  depth: 'mid',
  className: 'absolute left-[32.6%] top-[19%] w-[40.1%] h-auto',
  layer: 'behind',
  cover: true,
};

const AHA_OBJECT_GROUND: SceneObject = {
  src: OBJECTS.groundSpace,
  depth: 'near',
  className: 'absolute left-0 bottom-0 w-full h-auto',
  layer: 'behind',
  cover: true,
};

const AHA_SCENE_OBJECTS: SceneObject[] = [AHA_OBJECT_PLANET, AHA_OBJECT_GROUND];

const CONCEPT_SHORT_LABELS: Record<string, string> = {
  Indicators: 'Indic.',
  Acids: 'Acids',
  Bases: 'Bases',
  Neutralisation: 'Neutr.',
  'Natural dyes': 'Dyes',
};

function getConceptShortLabel(concept: string): string {
  return CONCEPT_SHORT_LABELS[concept] ?? concept.slice(0, 6);
}

const DESKTOP_GLASS_CARD_STYLE: React.CSSProperties = {
  borderRadius: '28px',
  background: 'linear-gradient(180deg, rgba(10,40,58,0.90), rgba(6,22,38,0.93))',
  border: '1px solid rgba(94,234,212,0.35)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 -6px 24px -8px rgba(45,212,191,0.35)',
  padding: '20px 22px',
  maxHeight: 'calc(100dvh - 184px)',
  fontFamily: 'var(--font-outfit), sans-serif',
};

const MOBILE_GLASS_CARD_STYLE: React.CSSProperties = {
  borderRadius: '24px',
  background: 'linear-gradient(180deg, rgba(14,48,66,0.78), rgba(8,26,44,0.82))',
  border: '1px solid rgba(94,234,212,0.35)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
  fontFamily: 'var(--font-outfit), sans-serif',
};

function sanitizeSchoolName(input?: string): string {
  if (!input) return 'Your School';
  let cleaned = input.replace(/[\u0000-\u001F\u007F-\u009F<>]/g, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  if (cleaned.length < 3 || !/[a-zA-Z]/.test(cleaned)) {
    return 'Your School';
  }
  if (cleaned.length > 40) {
    const truncated = cleaned.slice(0, 40);
    const lastSpace = truncated.lastIndexOf(' ');
    const cut = lastSpace > 0 ? truncated.slice(0, lastSpace).trim() : truncated;
    return cut + '…';
  }
  return cleaned;
}

export interface AhaSceneProps {
  role: RoleKey;
  schoolName: string;
  config: RoleConfig['aha'];
}

export default function AhaScene({ role, schoolName, config }: AhaSceneProps) {
  const { goTo } = usePager();

  // Teacher interactive state
  const defaultCoralCell: TeacherCell =
    TEACHER_SAMPLE.grid['04']['Indicators'];
  const [selectedCell, setSelectedCell] = useState<TeacherCell>(defaultCoralCell);

  // Parent interactive state (stored ONLY in React state)
  const [childName, setChildName] = useState('');

  if (!config) return null;

  // Principal school name formatting
  const schoolDisplayName = sanitizeSchoolName(schoolName);

  // Parent child name formatting
  const effectiveChildName = childName.trim() || PARENT_SAMPLE.defaultName;

  return (
    <SceneShell scene="aha" objects={AHA_SCENE_OBJECTS}>
      {/* Static Scrim for Text Legibility */}
      <div
        className="aha-scrim absolute inset-0 pointer-events-none z-0"
        aria-hidden="true"
      />
      <style>{`
        .aha-scrim {
          background: linear-gradient(180deg, transparent 20%, rgba(3,8,18,0.55) 100%);
        }
        @media (min-width: 768px) {
          .aha-scrim {
            background: linear-gradient(90deg, rgba(3,8,18,0.5), transparent 60%);
          }
        }
        .aha-headline {
          text-shadow: 0 2px 28px rgba(3,8,18,0.65);
        }
        .aha-hint {
          text-shadow: 0 2px 24px rgba(5, 20, 40, 0.45);
        }
      `}</style>

      {/* Nav / Top Bar */}
      <TopBar />

      {/* Desktop Left Column (>= 768px): left edge 7%, vertically centered at ~45%, max-width 46vw */}
      <div
        className="hidden md:flex md:flex-col md:items-start md:text-left md:absolute md:left-[7%] md:top-[45%] md:-translate-y-1/2 md:max-w-[46vw] md:w-full z-10"
        style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
      >
        {/* Tag: plain uppercase text, 12 to 13px, letter-spacing 0.2em, white at 80% */}
        <StageReveal order={0} className="w-full">
          <div className="uppercase text-[12px] sm:text-[13px] md:text-[length:calc(13*var(--u))] tracking-[0.2em] text-white/80 font-medium mb-[20px]">
            {config.tag}
          </div>
        </StageReveal>

        {/* Headline: <SplitHeadline lines={config.headlineLines} /> in Outfit, weight 600, font-size clamp(2.6rem, 4.9vw, 5.5rem), line-height 1.08, letter-spacing -0.02em, white */}
        <SplitHeadline
          lines={config.headlineLines}
          className="aha-headline text-white font-semibold text-[max(clamp(2.6rem,4.9vw,5.5rem),4.583vw)] leading-[1.08] tracking-[-0.02em] max-w-full text-left [text-shadow:0_2px_28px_rgba(3,8,18,0.65)]"
        />

        {/* Hint: white at 90%, font-size clamp(1rem, 1.25vw, 1.25rem), max-width 560px, 24px below headline */}
        <StageReveal order={2} className="w-full">
          <p
            className="aha-hint mt-[24px] text-white/90 text-[max(clamp(1rem,1.25vw,1.25rem),1.0417vw)] max-w-[max(560px,29.2vw)] font-normal leading-relaxed [text-shadow:0_2px_24px_rgba(5,20,40,0.45)]"
            style={{ fontFamily: 'var(--font-outfit), sans-serif', textShadow: '0 2px 24px rgba(5,20,40,0.45)' }}
          >
            {config.hint}
          </p>
        </StageReveal>

        {/* Button: 28px below hint, 52px tall, fully rounded, solid #14B8A6, white semibold 16px with ArrowRight */}
        {role !== 'Student' && (
          <StageReveal order={3} className="w-full md:w-auto">
            <div className="mt-[28px] flex items-center">
              <button
                type="button"
                onClick={() => goTo('demo')}
                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                className="h-[52px] md:h-[52px] px-8 md:px-8 rounded-full font-semibold text-[16px] text-white bg-[#14B8A6] hover:bg-[#0D9488] active:scale-95 transition-all text-center flex items-center justify-center gap-2 select-none cursor-pointer"
              >
                <span>{config.ctaLabel ?? 'Now try the chapter'}</span>
                <ArrowRight className="w-5 h-5 ml-1 shrink-0" />
              </button>
            </div>
          </StageReveal>
        )}
      </div>

      {/* Desktop Right Side Band (>= 768px): right 5%, top 96px, bottom 88px, display flex, align-items center */}
      <div
        className="hidden md:flex md:items-center md:absolute md:right-[5%] md:top-[96px] md:bottom-[88px] md:w-[max(clamp(400px,32vw,620px),32.3vw)] z-20 pointer-events-none"
        style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
      >
        <StageReveal order={3} rise="14vh" className="w-full max-h-full pointer-events-auto">
          {role === 'Student' ? (
            <div className="w-full max-h-full overflow-y-auto pageflow-scroll">
              <StarCatcher onContinue={() => goTo('demo')} />
            </div>
          ) : role === 'Parent' ? (
            <div className="w-full max-h-full overflow-y-auto pageflow-scroll">
              <ParentPhonePreview
                childName={childName}
                setChildName={setChildName}
                effectiveName={effectiveChildName}
                layout="d"
              />
            </div>
          ) : role === 'Other' ? (
            <div className="w-full max-h-full overflow-y-auto pageflow-scroll">
              <OtherViews
                selectedCell={selectedCell}
                onSelectCell={setSelectedCell}
                childName={childName}
                setChildName={setChildName}
                effectiveChildName={effectiveChildName}
              />
            </div>
          ) : (
            <div
              className="w-full text-left max-h-full overflow-y-auto pageflow-scroll block"
              style={DESKTOP_GLASS_CARD_STYLE}
            >
              {role === 'Principal' && (
                <PrincipalDashboard
                  title={`${schoolDisplayName}: Class 7 Science`}
                  schoolName={schoolDisplayName}
                />
              )}
              {role === 'Teacher' && (
                <TeacherHeatmap
                  selectedCell={selectedCell}
                  onSelectCell={setSelectedCell}
                />
              )}
            </div>
          )}
        </StageReveal>
      </div>

      {/* Mobile Layout (< 768px): Stacked (header, scrollable container, CTA pinned above bottom 88px) */}
      <div
        className="flex md:hidden flex-col flex-1 min-h-0 justify-between px-4 sm:px-6 pt-1 pb-2 z-10"
        style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
      >
        {/* Mobile Header: Tag, Headline, Hint */}
        <div className="text-center shrink-0 mb-2 flex flex-col items-center">
          <StageReveal order={0}>
            <div className="uppercase text-[12px] tracking-[0.2em] text-white/80 font-medium mb-1.5">
              {config.tag}
            </div>
          </StageReveal>

          <SplitHeadline
            lines={config.headlineLines}
            className="aha-headline text-xl sm:text-2xl font-semibold text-white leading-tight tracking-tight mb-2 text-center [text-shadow:0_2px_28px_rgba(3,8,18,0.65)]"
          />

          <StageReveal order={2}>
            <p
              className="aha-hint hidden text-white/90 text-xs sm:text-sm leading-relaxed max-w-sm [text-shadow:0_2px_24px_rgba(5,20,40,0.45)]"
              style={{ fontFamily: 'var(--font-outfit), sans-serif', textShadow: '0 2px 24px rgba(5,20,40,0.45)' }}
            >
              {config.hint}
            </p>
          </StageReveal>
        </div>

        {/* Mobile Scrollable Interactive Container */}
        <div className="flex-1 min-h-0 overflow-y-auto pageflow-scroll overscroll-contain pt-1 pb-2 pr-0.5">
          <StageReveal order={3} rise={30} className="w-full">
            {role === 'Student' ? (
              <StarCatcher onContinue={() => goTo('demo')} />
            ) : role === 'Parent' ? (
              <ParentPhonePreview
                childName={childName}
                setChildName={setChildName}
                effectiveName={effectiveChildName}
                layout="m"
              />
            ) : role === 'Other' ? (
              <OtherViews
                selectedCell={selectedCell}
                onSelectCell={setSelectedCell}
                childName={childName}
                setChildName={setChildName}
                effectiveChildName={effectiveChildName}
                isMobile
              />
            ) : (
              <div
                className="w-full p-4 sm:p-5 text-left"
                style={MOBILE_GLASS_CARD_STYLE}
              >
                {role === 'Principal' && (
                  <PrincipalDashboard
                    title={`${schoolDisplayName}: Class 7 Science`}
                    schoolName={schoolDisplayName}
                  />
                )}
                {role === 'Teacher' && (
                  <TeacherHeatmap
                    selectedCell={selectedCell}
                    onSelectCell={setSelectedCell}
                  />
                )}
              </div>
            )}
          </StageReveal>
        </div>

        {/* Mobile Bottom CTA Button */}
        {role !== 'Student' && (
          <StageReveal order={4} className="shrink-0 flex justify-center pt-3">
            <button
              type="button"
              onClick={() => goTo('demo')}
              style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
              className="h-[48px] sm:h-[52px] px-8 rounded-full font-semibold text-[15px] sm:text-[16px] text-white bg-[#14B8A6] hover:bg-[#0D9488] active:scale-95 transition-all text-center flex items-center justify-center gap-2 select-none cursor-pointer"
            >
              <span>{config.ctaLabel ?? 'Now try the chapter'}</span>
              <ArrowRight className="w-5 h-5 ml-1 shrink-0" />
            </button>
          </StageReveal>
        )}
      </div>
    </SceneShell>
  );
}

function SampleDataChip() {
  return (
    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white text-slate-900 select-none shadow-md shrink-0 pointer-events-none">
      Sample data
    </span>
  );
}

function PrincipalDashboard({ title, schoolName }: { title: string; schoolName: string }) {
  const sortedChapters = [...PRINCIPAL_SAMPLE.chapters].sort((a, b) => a.pct - b.pct);

  return (
    <div className="w-full block" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
      {/* Header Row: School name, subtitle, disclaimer on left, Sample data chip on right */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0 pr-2 text-left">
          <h3
            className="font-semibold text-white leading-tight break-words"
            style={{ fontSize: 'clamp(16px, 1.15vw, 22px)' }}
          >
            {schoolName}
          </h3>
          <p className="text-[12px] text-slate-300 leading-normal mt-0.5">
            Class 7 Science · sample view
          </p>
          <p className="text-[12px] text-white/70 leading-normal mt-1 break-words">
            Sample numbers, not real data for {schoolName}.
          </p>
        </div>
        <SampleDataChip />
      </div>

      {/* 4 Stat Tiles: always grid-cols-2 */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {PRINCIPAL_SAMPLE.stats.map((st) => {
          const isStudentsAtRisk = st.label === 'Students needing help';
          return (
            <div
              key={st.label}
              title={isStudentsAtRisk ? `Below ${TEACHER_CRITICAL_BELOW}% in any concept` : undefined}
              className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex flex-col text-left"
            >
              <span className="text-base sm:text-lg font-semibold text-white leading-tight">
                {st.value}
              </span>
              <span className="text-[11px] text-slate-300 font-medium mt-0.5 leading-snug">
                {st.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Chapters Header Caption */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 px-0.5 text-left">
        <span>Lowest first · change vs last month</span>
      </div>

      {/* 4 Chapter Rows: Sorted ascending by pct */}
      <div className="space-y-2.5 w-full">
        {sortedChapters.map((ch) => {
          const status = getChapterStatus(ch.pct);
          const tone = status.tone;

          const badgeClass =
            tone === 'teal'
              ? 'bg-[#0F5B6C] border-[#1B8798] text-[#E6FBFF]'
              : tone === 'amber'
              ? 'bg-[#7A5C25] border-[#B78F43] text-[#FFF3D6]'
              : 'bg-[#C4485A] border-[#E26A7B] text-white';

          const barColor =
            tone === 'teal'
              ? 'bg-[#14B8A6]'
              : tone === 'amber'
              ? 'bg-[#B78F43]'
              : 'bg-[#E26A7B]';

          const isPositive = ch.trendPct > 0;
          const trendText = isPositive ? `▲ ${ch.trendPct}` : `▼ ${Math.abs(ch.trendPct)}`;
          const trendAria = isPositive
            ? `up ${ch.trendPct} points since last month`
            : `down ${Math.abs(ch.trendPct)} points since last month`;

          return (
            <div key={ch.name} className="flex flex-col gap-1 text-left">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-medium text-slate-200 truncate pr-2">
                  {ch.name}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {ch.trendPct !== 0 && (
                    <span
                      className={`text-[11px] font-semibold flex items-center ${
                        isPositive ? 'text-teal-300' : 'text-[#E26A7B]'
                      }`}
                      aria-label={trendAria}
                    >
                      {trendText}
                    </span>
                  )}
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shrink-0 ${badgeClass}`}
                  >
                    {ch.pct}% · {status.label}
                  </span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full w-full rounded-full ${barColor}`}
                  style={{
                    transform: `scaleX(${ch.pct / 100})`,
                    transformOrigin: 'left',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TeacherHeatmap({
  selectedCell,
  onSelectCell,
}: {
  selectedCell: TeacherCell;
  onSelectCell: (cell: TeacherCell) => void;
}) {
  const [hasUserSelected, setHasUserSelected] = useState(false);

  const handleSelect = (cell: TeacherCell) => {
    setHasUserSelected(true);
    onSelectCell(cell);
  };

  const getCellId = (r: number, c: number) => `teacher-cell-${r}-${c}`;

  const handleCellKeyDown = (
    e: React.KeyboardEvent,
    r: number,
    c: number,
    cell: TeacherCell
  ) => {
    let targetR = r;
    let targetC = c;
    let handled = false;

    switch (e.key) {
      case 'ArrowLeft':
        targetC = Math.max(0, c - 1);
        handled = true;
        break;
      case 'ArrowRight':
        targetC = Math.min(TEACHER_SAMPLE.concepts.length - 1, c + 1);
        handled = true;
        break;
      case 'ArrowUp':
        targetR = Math.max(0, r - 1);
        handled = true;
        break;
      case 'ArrowDown':
        targetR = Math.min(TEACHER_SAMPLE.students.length - 1, r + 1);
        handled = true;
        break;
      case 'Home':
        targetC = 0;
        handled = true;
        break;
      case 'End':
        targetC = TEACHER_SAMPLE.concepts.length - 1;
        handled = true;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        e.stopPropagation();
        handleSelect(cell);
        return;
    }

    if (handled) {
      e.stopPropagation();
      e.preventDefault();
      const nextBtn = document.getElementById(getCellId(targetR, targetC));
      if (nextBtn) {
        nextBtn.focus();
      }
    }
  };

  const weakestConcept = getWeakestConcept();
  const selectedConceptStats = getConceptStats(selectedCell.concept);

  return (
    <div className="w-full block" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
      <style>{`
        @keyframes critical-pulse {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.9;
          }
        }
        .critical-pulse-ring {
          animation: critical-pulse 1.8s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .critical-pulse-ring {
            animation: none !important;
          }
        }
      `}</style>

      {/* Header row: title and subtitle on left, Sample data chip on right */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="text-left">
          <h3
            className="font-semibold text-white whitespace-nowrap leading-tight"
            style={{ fontSize: 'clamp(16px, 1.15vw, 22px)' }}
          >
            Class Mastery Matrix
          </h3>
          <p className="text-[12px] text-slate-400 leading-normal mt-0.5">
            Sample class · roll numbers only
          </p>
        </div>
        <SampleDataChip />
      </div>

      {/* Legend row: Strong 75+, Needs revision 50–74, Critical below 50 */}
      <div className="flex items-center gap-3.5 mb-2.5 text-[11px] md:text-[12px] text-slate-300 select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#14B8A6] shrink-0" />
          <span>Strong {TEACHER_STRONG_FROM}+</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B] shrink-0" />
          <span>Needs revision {TEACHER_CRITICAL_BELOW}–{TEACHER_STRONG_FROM - 1}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#E26A7B] shrink-0" />
          <span>Critical below {TEACHER_CRITICAL_BELOW}</span>
        </div>
      </div>

      {/* Grid: 22px repeat(5, 1fr), gap 5px */}
      <div role="grid" aria-label="Class Mastery Matrix" className="w-full pb-3 md:pb-0">
        {/* Header Row: Column Labels */}
        <div
          role="row"
          className="grid gap-[4px] md:gap-[5px] mb-[4px] md:mb-[5px] text-[11px] font-medium text-slate-300 text-center items-center select-none"
          style={{ gridTemplateColumns: '22px repeat(5, 1fr)' }}
        >
          <div role="columnheader" aria-label="Roll number" />
          {TEACHER_SAMPLE.concepts.map((c) => (
            <div
              key={c}
              role="columnheader"
              title={c}
              aria-label={c}
              className="whitespace-nowrap text-center"
            >
              {getConceptShortLabel(c)}
            </div>
          ))}
        </div>

        {/* Student Rows */}
        <div className="space-y-[4px] md:space-y-[5px]" role="presentation">
          {TEACHER_SAMPLE.students.map((st, rIdx) => (
            <div
              key={st}
              role="row"
              className="grid gap-[4px] md:gap-[5px] items-center"
              style={{ gridTemplateColumns: '22px repeat(5, 1fr)' }}
            >
              <div
                role="rowheader"
                className="text-[11px] font-medium text-slate-400 text-center flex items-center justify-center select-none"
              >
                {st}
              </div>
              {TEACHER_SAMPLE.concepts.map((concept, cIdx) => {
                const cell = TEACHER_SAMPLE.grid[st][concept];
                const tone = getTeacherTone(cell.pct);
                const isSelected =
                  selectedCell.student === cell.student &&
                  selectedCell.concept === cell.concept;
                const isCritical = cell.pct < TEACHER_CRITICAL_BELOW;

                const toneClass =
                  tone === 'teal'
                    ? 'bg-[#0F5B6C] border-[#1B8798] text-[#E6FBFF]'
                    : tone === 'amber'
                    ? 'bg-[#7A5C25] border-[#B78F43] text-[#FFF3D6]'
                    : 'bg-[#C4485A] border-[#E26A7B] text-[#FFFFFF]';

                const outlineClass = isSelected
                  ? 'outline outline-2 outline-white z-10'
                  : '';

                return (
                  <button
                    key={`${st}-${concept}`}
                    id={getCellId(rIdx, cIdx)}
                    role="gridcell"
                    type="button"
                    tabIndex={isSelected ? 0 : -1}
                    aria-selected={isSelected}
                    aria-label={`Roll ${cell.student}, ${cell.concept}, ${cell.pct} percent`}
                    onClick={() => handleSelect(cell)}
                    onKeyDown={(e) => handleCellKeyDown(e, rIdx, cIdx, cell)}
                    style={{
                      fontFamily: 'var(--font-outfit), sans-serif',
                      fontSize: 'clamp(13px, 0.95vw, 17px)',
                    }}
                    className={`relative h-10 md:h-[clamp(30px,3.6dvh,40px)] rounded-[10px] border font-medium flex items-center justify-center select-none cursor-pointer transition-none ${toneClass} ${outlineClass} focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none`}
                  >
                    {/* Critical pulsing ring (until visitor selects any cell) */}
                    {!hasUserSelected && isCritical && !isSelected && (
                      <span
                        className="critical-pulse-ring absolute -inset-[3px] rounded-[13px] border-2 border-[#E26A7B] pointer-events-none"
                        aria-hidden="true"
                      />
                    )}

                    {/* Critical white corner dot */}
                    {isCritical && (
                      <span
                        className="absolute top-1 right-1 w-[5px] h-[5px] rounded-full bg-white pointer-events-none"
                        aria-hidden="true"
                      />
                    )}

                    {cell.pct}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer row: Concept averages */}
        <div
          role="row"
          className="teacher-matrix-footer hidden md:grid gap-[5px] mt-[5px] text-[11px] text-slate-400 text-center items-center select-none"
          style={{ gridTemplateColumns: '22px repeat(5, 1fr)' }}
        >
          <div role="rowheader" className="font-medium text-center flex items-center justify-center">
            Avg
          </div>
          {TEACHER_SAMPLE.concepts.map((c) => {
            const stats = getConceptStats(c);
            const isWeakest = c === weakestConcept;
            return (
              <div
                key={`footer-${c}`}
                role="gridcell"
                className={`text-center ${
                  isWeakest ? 'text-amber-300 font-semibold' : 'text-slate-300 font-medium'
                }`}
              >
                {stats.avg}%
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail area below the grid */}
      <div
        className="mt-[14px] px-4 py-3.5 rounded-[16px] text-left min-h-0 md:min-h-[128px] max-h-[38dvh] md:max-h-none overflow-y-auto md:overflow-visible sticky bottom-3 z-20 md:static bg-[rgb(6,22,38)] md:bg-transparent [--detail-bg:rgb(6,22,38)] md:[--detail-bg:rgba(4,14,28,0.72)] shadow-[0_-12px_16px_-8px_rgba(0,0,0,0.5)] md:shadow-none flex flex-col justify-between"
        style={{ background: 'var(--detail-bg, rgba(4, 14, 28, 0.72))' }}
      >
        {selectedCell.detail ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-[15px] font-bold text-white leading-tight">
                Roll {selectedCell.student} · {selectedCell.concept} ({selectedCell.pct}%)
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-teal-200 border border-teal-400/20 select-none">
                  Sample insight
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-teal-400 text-slate-900 select-none shrink-0">
                  {selectedCell.detail.competency}
                </span>
              </div>
            </div>
            <p className="text-[13px] text-white/90 leading-snug">
              <span className="font-semibold text-white">Stuck on:</span>{' '}
              {selectedCell.detail.stuck}
            </p>
            <p className="text-[13px] text-white/90 leading-snug">
              <span className="font-semibold text-teal-300">Action:</span>{' '}
              {selectedCell.detail.action}
            </p>
          </div>
        ) : selectedCell.pct >= 75 ? (
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-[15px] font-bold text-white leading-tight">
              Roll {selectedCell.student} · {selectedCell.concept} ({selectedCell.pct}%)
            </span>
            <span className="text-[13px] text-teal-300 font-medium">
              On track. No action needed.
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-[15px] font-bold text-white leading-tight">
              Roll {selectedCell.student} · {selectedCell.concept} ({selectedCell.pct}%)
            </span>
            <span className="text-[13px] text-amber-300 font-medium">
              In progress. Keep an eye on it.
            </span>
          </div>
        )}

        {/* Concept reteaching context line */}
        <div className="hidden md:block text-[12px] text-slate-300 leading-normal pt-2 border-t border-white/10 mt-2">
          <span>
            {selectedConceptStats.belowSixty} of {selectedConceptStats.total} students are below 60% in {selectedCell.concept}.
          </span>
          {selectedConceptStats.belowSixty >= 3 && (
            <span className="text-amber-300 font-medium">
              {' '}Worth reteaching to the whole class.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function ParentPhonePreview({
  childName,
  setChildName,
  effectiveName,
  layout = 'd',
}: {
  childName: string;
  setChildName: (name: string) => void;
  effectiveName: string;
  layout?: 'd' | 'm';
}) {
  const activeDaysCount = PARENT_SAMPLE.weekDays.filter(Boolean).length;
  const inputId = `child-name-${layout}`;

  return (
    <div
      className="w-full max-w-[340px] mx-auto text-left p-4 md:p-[20px_22px] flex flex-col gap-3 rounded-[24px] md:rounded-[28px] border border-[rgba(94,234,212,0.35)]"
      style={{
        background: DESKTOP_GLASS_CARD_STYLE.background,
        boxShadow: DESKTOP_GLASS_CARD_STYLE.boxShadow,
        fontFamily: DESKTOP_GLASS_CARD_STYLE.fontFamily,
      }}
    >
      {/* Input for Child Name */}
      <div className="w-full text-left">
        <label
          htmlFor={inputId}
          className="block text-[13px] font-semibold text-slate-200 mb-1"
        >
          Child&apos;s first name:
        </label>
        <input
          id={inputId}
          name="childName"
          type="text"
          maxLength={20}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="done"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          placeholder={PARENT_SAMPLE.defaultName}
          className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-[rgba(94,234,212,0.35)] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
        />
        <p className="text-[12px] text-slate-300 mt-1.5 leading-tight">
          Sample update. Your child&apos;s name stays on this device and is never saved or sent.
        </p>
      </div>

      {/* CSS-Drawn Phone Frame */}
      <div
        className="w-full rounded-[24px] border border-[rgba(94,234,212,0.35)] shadow-2xl p-3.5 sm:p-4 flex flex-col relative"
        style={{
          background: 'linear-gradient(180deg, rgba(14,48,66,0.85), rgba(8,26,44,0.90))',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
        }}
      >
        {/* Notch bar */}
        <div className="w-20 h-2.5 bg-white/20 rounded-full mx-auto mb-2" />

        {/* Header with Daily progress · Today and Sample data chip */}
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <span className="text-xs sm:text-[13px] text-teal-300 font-semibold tracking-wide">
            Daily progress · Today
          </span>
          <SampleDataChip />
        </div>

        {/* Daily progress card */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5 sm:p-4 text-left text-xs sm:text-sm text-slate-200 space-y-2.5">
          <h4 className="font-bold text-white text-[15px] pb-1 border-b border-white/10">
            {effectiveName}&apos;s progress today
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Chapter</span>
              <span className="font-semibold text-white">{PARENT_SAMPLE.chapter}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Score</span>
              <span className="font-bold text-teal-300">{PARENT_SAMPLE.scorePct}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Stars</span>
              <span className="font-bold text-amber-300">
                {'★'.repeat(PARENT_SAMPLE.stars)}{' '}
                <span className="text-slate-400 font-normal">({PARENT_SAMPLE.stars})</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Time on chapter:</span>
              <span className="font-bold text-teal-300">{PARENT_SAMPLE.minutes} min</span>
            </div>
            <div
              className="flex flex-col gap-1.5 pt-1 border-t border-white/10"
              aria-label={`${activeDaysCount} of 7 days active this week`}
            >
              <div className="flex items-center justify-between text-[12px] text-slate-300">
                <span>This week</span>
                <span>{activeDaysCount} of 7 days</span>
              </div>
              <div className="flex items-center justify-between px-1">
                {DAY_LETTERS.map((letter, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span
                      className={`h-3 w-3 rounded-full ${
                        PARENT_SAMPLE.weekDays[i] ? 'bg-[#14B8A6]' : 'bg-white/15'
                      }`}
                    />
                    <span className="text-[10px] text-slate-400 font-medium">
                      {letter}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-start justify-between gap-3 pt-1 border-t border-white/10">
              <span className="text-slate-400 shrink-0">Needs revision</span>
              <span className="font-medium text-[#E26A7B] text-right">
                {PARENT_SAMPLE.revise}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ask Tonight Box */}
      <div className="w-full rounded-2xl bg-teal-400/10 border border-teal-300/30 p-3 text-left">
        <p className="text-[12px] font-semibold text-teal-300 mb-0.5">
          Try asking {effectiveName} tonight:
        </p>
        <p className="text-[13px] text-white/90 italic leading-snug">
          &ldquo;{PARENT_SAMPLE.askTonight}&rdquo;
        </p>
      </div>
    </div>
  );
}

const OTHER_TABS = ['Teacher', 'Principal', 'Parent'] as const;
type OtherTabKey = (typeof OTHER_TABS)[number];

const OTHER_TAB_CAPTIONS: Record<OtherTabKey, string> = {
  Teacher: 'Teacher: who is stuck, in seconds.',
  Principal: 'Principal: the school at a glance.',
  Parent: 'Parent: what learning looks like at home.',
};

interface OtherViewsProps {
  selectedCell: TeacherCell;
  onSelectCell: (cell: TeacherCell) => void;
  childName: string;
  setChildName: (name: string) => void;
  effectiveChildName: string;
  isMobile?: boolean;
}

function OtherViews({
  selectedCell,
  onSelectCell,
  childName,
  setChildName,
  effectiveChildName,
  isMobile = false,
}: OtherViewsProps) {
  const [activeTab, setActiveTab] = useState<OtherTabKey>('Teacher');

  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowLeft') {
      e.stopPropagation();
      e.preventDefault();
      const prevIdx = (index - 1 + OTHER_TABS.length) % OTHER_TABS.length;
      const targetTab = OTHER_TABS[prevIdx];
      setActiveTab(targetTab);
      document.getElementById(`other-tab-${targetTab}`)?.focus();
    } else if (e.key === 'ArrowRight') {
      e.stopPropagation();
      e.preventDefault();
      const nextIdx = (index + 1) % OTHER_TABS.length;
      const targetTab = OTHER_TABS[nextIdx];
      setActiveTab(targetTab);
      document.getElementById(`other-tab-${targetTab}`)?.focus();
    }
  };

  const cardStyle = isMobile ? MOBILE_GLASS_CARD_STYLE : DESKTOP_GLASS_CARD_STYLE;

  return (
    <div className="w-full flex flex-col gap-2" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
      {/* 1. Tabs */}
      <div
        role="tablist"
        aria-label="Perspective tabs"
        className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-950/60 border border-[rgba(94,234,212,0.25)] select-none shrink-0"
      >
        {OTHER_TABS.map((tab, idx) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              id={`other-tab-${tab}`}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`other-panel-${tab}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab)}
              onKeyDown={(e) => handleTabKeyDown(e, idx)}
              className={`h-[44px] rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                isActive
                  ? 'bg-[#14B8A6] text-white font-semibold shadow-md'
                  : 'text-slate-300 hover:text-white bg-white/5 hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* 2. Caption under tabs */}
      <p className="text-[12px] text-slate-300 text-left px-1 font-medium leading-normal shrink-0">
        {OTHER_TAB_CAPTIONS[activeTab]}
      </p>

      {/* 3. Stacked Panels in one CSS grid cell */}
      <div className="grid grid-cols-1 grid-rows-1 w-full">
        {/* Teacher Panel */}
        <div
          role="tabpanel"
          id="other-panel-Teacher"
          aria-labelledby="other-tab-Teacher"
          className={`col-start-1 row-start-1 w-full transition-opacity duration-300 ${
            activeTab === 'Teacher'
              ? 'opacity-100 relative z-10'
              : 'opacity-0 invisible pointer-events-none'
          }`}
        >
          <div className={isMobile ? "w-full p-4 sm:p-5 text-left" : "w-full text-left"} style={cardStyle}>
            <TeacherHeatmap selectedCell={selectedCell} onSelectCell={onSelectCell} />
          </div>
        </div>

        {/* Principal Panel */}
        <div
          role="tabpanel"
          id="other-panel-Principal"
          aria-labelledby="other-tab-Principal"
          className={`col-start-1 row-start-1 w-full transition-opacity duration-300 ${
            activeTab === 'Principal'
              ? 'opacity-100 relative z-10'
              : 'opacity-0 invisible pointer-events-none'
          }`}
        >
          <div className={isMobile ? "w-full p-4 sm:p-5 text-left" : "w-full text-left"} style={cardStyle}>
            <PrincipalDashboard title="Your School: Class 7 Science" schoolName="Your School" />
          </div>
        </div>

        {/* Parent Panel */}
        <div
          role="tabpanel"
          id="other-panel-Parent"
          aria-labelledby="other-tab-Parent"
          className={`col-start-1 row-start-1 w-full transition-opacity duration-300 ${
            activeTab === 'Parent'
              ? 'opacity-100 relative z-10'
              : 'opacity-0 invisible pointer-events-none'
          }`}
        >
          <div className="w-full flex justify-center">
            <ParentPhonePreview
              childName={childName}
              setChildName={setChildName}
              effectiveName={effectiveChildName}
              layout={isMobile ? 'm' : 'd'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
