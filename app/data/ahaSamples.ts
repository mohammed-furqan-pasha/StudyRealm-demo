export type Competency =
  | 'Conceptual Understanding'
  | 'Problem Solving'
  | 'Critical Thinking'
  | 'Observation & Exploration'
  | 'Foundational Numeracy';

export interface CoralDetail {
  stuck: string;
  competency: Competency;
  action: string;
}

export interface PrincipalStat {
  label: string;
  value: string;
}

export interface PrincipalChapter {
  name: string;
  pct: number;
  trendPct: number;
}

export interface PrincipalSample {
  activeThisWeekPct: number;
  stats: PrincipalStat[];
  chapters: PrincipalChapter[];
}

export interface TeacherCell {
  student: string;
  concept: string;
  pct: number;
  detail?: CoralDetail;
}

export interface TeacherSample {
  students: string[];
  concepts: string[];
  grid: Record<string, Record<string, TeacherCell>>;
}

export const TEACHER_CRITICAL_BELOW = 50;
export const TEACHER_STRONG_FROM = 75;

export const TEACHER_SAMPLE: TeacherSample = {
  students: ['01', '02', '03', '04', '05', '06', '07', '08'],
  concepts: [
    'Indicators',
    'Acids',
    'Bases',
    'Neutralisation',
    'Natural dyes',
  ],
  grid: {
    '01': {
      Indicators: { student: '01', concept: 'Indicators', pct: 86 },
      Acids: { student: '01', concept: 'Acids', pct: 82 },
      Bases: { student: '01', concept: 'Bases', pct: 78 },
      Neutralisation: { student: '01', concept: 'Neutralisation', pct: 70 },
      'Natural dyes': { student: '01', concept: 'Natural dyes', pct: 80 },
    },
    '02': {
      Indicators: { student: '02', concept: 'Indicators', pct: 62 },
      Acids: { student: '02', concept: 'Acids', pct: 66 },
      Bases: { student: '02', concept: 'Bases', pct: 70 },
      Neutralisation: { student: '02', concept: 'Neutralisation', pct: 58 },
      'Natural dyes': { student: '02', concept: 'Natural dyes', pct: 64 },
    },
    '03': {
      Indicators: { student: '03', concept: 'Indicators', pct: 90 },
      Acids: { student: '03', concept: 'Acids', pct: 85 },
      Bases: { student: '03', concept: 'Bases', pct: 88 },
      Neutralisation: { student: '03', concept: 'Neutralisation', pct: 78 },
      'Natural dyes': { student: '03', concept: 'Natural dyes', pct: 82 },
    },
    '04': {
      Indicators: {
        student: '04',
        concept: 'Indicators',
        pct: 38,
        detail: {
          stuck: 'Thinks turmeric turns red with acids, but it turns red with bases such as soap.',
          competency: 'Conceptual Understanding',
          action: 'Show the haldi and soap test, then ask the class to predict what lemon juice will do.',
        },
      },
      Acids: { student: '04', concept: 'Acids', pct: 55 },
      Bases: {
        student: '04',
        concept: 'Bases',
        pct: 47,
        detail: {
          stuck: 'Thinks only strong, harmful liquids can be bases, not soap or baking soda.',
          competency: 'Conceptual Understanding',
          action: 'List the bases found at home and test two of them on turmeric paper.',
        },
      },
      Neutralisation: { student: '04', concept: 'Neutralisation', pct: 52 },
      'Natural dyes': { student: '04', concept: 'Natural dyes', pct: 60 },
    },
    '05': {
      Indicators: { student: '05', concept: 'Indicators', pct: 52 },
      Acids: { student: '05', concept: 'Acids', pct: 80 },
      Bases: { student: '05', concept: 'Bases', pct: 72 },
      Neutralisation: { student: '05', concept: 'Neutralisation', pct: 68 },
      'Natural dyes': {
        student: '05',
        concept: 'Natural dyes',
        pct: 45,
        detail: {
          stuck: 'Struggles to predict colour changes with natural indicators.',
          competency: 'Observation & Exploration',
          action: 'Ask students to predict, then test, beetroot or red cabbage juice with lemon and soap water.',
        },
      },
    },
    '06': {
      Indicators: { student: '06', concept: 'Indicators', pct: 84 },
      Acids: { student: '06', concept: 'Acids', pct: 78 },
      Bases: { student: '06', concept: 'Bases', pct: 82 },
      Neutralisation: { student: '06', concept: 'Neutralisation', pct: 74 },
      'Natural dyes': { student: '06', concept: 'Natural dyes', pct: 70 },
    },
    '07': {
      Indicators: {
        student: '07',
        concept: 'Indicators',
        pct: 44,
        detail: {
          stuck: 'Sees the colour change but does not link it to acid or base.',
          competency: 'Observation & Exploration',
          action: 'Have pairs test three kitchen liquids on turmeric paper and record the colours.',
        },
      },
      Acids: {
        student: '07',
        concept: 'Acids',
        pct: 35,
        detail: {
          stuck: 'Thinks tasting is a safe way to test an unknown liquid.',
          competency: 'Critical Thinking',
          action: 'Stress lab safety: never taste unknown liquids; use an indicator instead.',
        },
      },
      Bases: { student: '07', concept: 'Bases', pct: 65 },
      Neutralisation: { student: '07', concept: 'Neutralisation', pct: 62 },
      'Natural dyes': { student: '07', concept: 'Natural dyes', pct: 58 },
    },
    '08': {
      Indicators: { student: '08', concept: 'Indicators', pct: 58 },
      Acids: { student: '08', concept: 'Acids', pct: 66 },
      Bases: { student: '08', concept: 'Bases', pct: 74 },
      Neutralisation: { student: '08', concept: 'Neutralisation', pct: 60 },
      'Natural dyes': { student: '08', concept: 'Natural dyes', pct: 65 },
    },
  },
};

export interface ConceptStats {
  avg: number;
  belowSixty: number;
  total: number;
}

export function getConceptStats(concept: string): ConceptStats {
  const scores: number[] = TEACHER_SAMPLE.students.map(
    (student) => TEACHER_SAMPLE.grid[student]?.[concept]?.pct ?? 0
  );
  const total = scores.length;
  const avg = total > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / total) : 0;
  const belowSixty = scores.filter((s) => s < 60).length;
  return { avg, belowSixty, total };
}

export function getWeakestConcept(): string {
  let weakest = TEACHER_SAMPLE.concepts[0] || '';
  let minAvg = Infinity;

  for (const c of TEACHER_SAMPLE.concepts) {
    const stats = getConceptStats(c);
    if (stats.avg < minAvg) {
      minAvg = stats.avg;
      weakest = c;
    }
  }

  return weakest;
}

export function derivePrincipalSample(): PrincipalSample {
  const allCells: TeacherCell[] = Object.values(TEACHER_SAMPLE.grid).flatMap((row) =>
    Object.values(row)
  );
  const cellSum = allCells.reduce((acc, c) => acc + c.pct, 0);
  const firstChapterPct = Math.round(cellSum / allCells.length);

  const chapters: PrincipalChapter[] = [
    { name: 'Acids, Bases and Salts', pct: firstChapterPct, trendPct: 5 },
    { name: 'Heat', pct: 71, trendPct: 2 },
    { name: 'Motion and Time', pct: 65, trendPct: -3 },
    { name: 'Light', pct: 57, trendPct: -4 },
  ];

  const avgMastery = Math.round(
    chapters.reduce((acc, ch) => acc + ch.pct, 0) / chapters.length
  );

  const studentsNeedingHelp = TEACHER_SAMPLE.students.filter((student) => {
    const row = TEACHER_SAMPLE.grid[student];
    return Object.values(row).some((cell) => cell.pct < TEACHER_CRITICAL_BELOW);
  }).length;

  const chaptersNeedingHelp = chapters.filter((ch) => ch.pct < 60).length;
  const activeThisWeekPct = 78;

  return {
    activeThisWeekPct,
    stats: [
      { label: 'Avg mastery', value: `${avgMastery}%` },
      { label: 'Active this week', value: `${activeThisWeekPct}%` },
      { label: 'Students needing help', value: String(studentsNeedingHelp) },
      { label: 'Chapters needing help', value: String(chaptersNeedingHelp) },
    ],
    chapters,
  };
}

export const PRINCIPAL_SAMPLE: PrincipalSample = derivePrincipalSample();

export function getChapterStatus(pct: number): { label: string; tone: 'teal' | 'amber' | 'coral' } {
  if (pct >= 75) return { label: 'On track', tone: 'teal' };
  if (pct >= 60) return { label: 'In progress', tone: 'amber' };
  return { label: 'Needs attention', tone: 'coral' };
}

export function getTeacherTone(pct: number): 'teal' | 'amber' | 'coral' {
  if (pct >= TEACHER_STRONG_FROM) return 'teal';
  if (pct >= TEACHER_CRITICAL_BELOW) return 'amber';
  return 'coral';
}

export interface ParentSample {
  defaultName: string;
  chapter: string;
  scorePct: number;
  stars: number;
  revise: string;
  minutes: number;
  weekDays: boolean[];
  askTonight: string;
}

export const PARENT_SAMPLE: ParentSample = {
  defaultName: 'Aarav',
  chapter: 'Acids & Bases',
  scorePct: 80,
  stars: 3,
  revise: 'how indicators change colour',
  minutes: 14,
  weekDays: [true, true, false, true, true, false, true],
  askTonight: 'Why did the haldi stain turn red when soap touched it?',
};
