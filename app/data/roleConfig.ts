import { RoleConfig, RoleKey } from '../types';

export const CALENDLY_URL = 'https://calendly.com/studyrealmtechnologies';

export const ROLE_CONFIGS: Record<RoleKey, RoleConfig> = {
  Principal: {
    key: 'Principal',
    hero: {
      tag: 'Built for school leaders',
      headlineLines: ['Built for more admissions,', 'better results,', 'fewer complaints.'],
      sub: 'See what your school sees, then try one real chapter.',
      primaryCta: { label: 'Book a 30-min demo', action: { type: 'calendly' } },
      secondaryCta: { label: 'See your school', action: { type: 'goTo', id: 'aha' } },
      showStats: true,
    },
    aha: {
      tag: 'A school like yours',
      headlineLines: ['See your school', 'at a glance.'],
      hint: "A sample view built with your school's name. Numbers are illustrative.",
    },
    features: {
      tag: 'What your school sees',
      headlineLines: ['Clear visibility,', 'without extra work.'],
      description: "These dashboards fill with live classroom data. Tell us about your school and we'll show them in a free demo.",
      ctaLabel: 'Take the Quick Survey →',
      cardIds: ['teacherDashboard', 'progressTrends', 'parentDashboard', 'pilot'],
    },
    contact: {
      tag: '✦ Innovation Partnership Program',
      headline: 'Join our School Pilot',
      description: 'An exclusive pilot for forward-thinking Karnataka schools. No commitment required. Start with a free demo.',
      primary: 'calendly',
    },
    pageOrder: ['hero', 'aha', 'demo', 'features', 'survey', 'contact'],
    share: {
      label: 'Forward to my management team',
      message: 'I came across StudyRealm, an interactive learning platform with class dashboards for schools. Worth a 30-minute look: https://demo.studyrealm.app/?utm_source=share&utm_medium=whatsapp&utm_campaign=principal',
    },
  },
  Teacher: {
    key: 'Teacher',
    hero: {
      tag: 'For teachers',
      headlineLines: ["Know who's stuck", 'before the exam does.'],
      sub: 'Auto-graded practice, a live class heatmap, and no extra paperwork.',
      primaryCta: { label: 'See a sample class', action: { type: 'goTo', id: 'aha' } },
      secondaryCta: { label: 'Try the chapter', action: { type: 'goTo', id: 'demo' } },
      showStats: true,
    },
    aha: {
      tag: 'A class like yours',
      headlineLines: ['Tap a red cell', "to see who's stuck."],
      hint: 'Tap any cell to see who is struggling, what they are stuck on, and a suggested next step.',
    },
    features: {
      tag: 'What you get',
      headlineLines: ['Less checking.', 'More teaching.'],
      description: 'See who needs help, grade automatically, and skip the extra paperwork. A free demo shows it with your class.',
      ctaLabel: 'Take the Quick Survey →',
      cardIds: ['quizzesNcf', 'teacherDashboard', 'progressTrends', 'leaderboard'],
    },
    contact: {
      tag: '✦ Innovation Partnership Program',
      headline: 'Take it to your principal',
      description: 'Schools join through their management. Share this with your principal, or book a free 30-minute session.',
      primary: 'share',
    },
    pageOrder: ['hero', 'aha', 'demo', 'features', 'survey', 'contact'],
    share: {
      label: 'Show this to my principal',
      message: 'I tried StudyRealm and I think our school should see it. It shows which students are stuck and maps to NCF 2023 automatically: https://demo.studyrealm.app/?utm_source=share&utm_medium=whatsapp&utm_campaign=teacher',
    },
  },
  Parent: {
    key: 'Parent',
    hero: {
      tag: 'For parents',
      headlineLines: ['See what your child', 'learned today.'],
      sub: 'Simple daily updates in plain language. It reads aloud, so even Class 1 can use it.',
      primaryCta: { label: "See tonight's update", action: { type: 'goTo', id: 'aha' } },
      secondaryCta: { label: 'Try the chapter', action: { type: 'goTo', id: 'demo' } },
      showStats: false,
    },
    aha: {
      tag: 'A daily view',
      headlineLines: ["See your child's", 'progress every day.'],
      hint: "Type your child's first name to see the kind of daily update you would get.",
    },
    features: {
      tag: 'For your family',
      headlineLines: ['Learning without', 'the pressure.'],
      description: 'Daily updates in plain language, and a child can retry as often as they like.',
      ctaLabel: 'Take the Quick Survey →',
      cardIds: ['parentDashboard', 'models3d', 'zeroToHero', 'readAloud'],
    },
    contact: {
      tag: '✦ Innovation Partnership Program',
      headline: "Bring it to your child's school",
      description: "StudyRealm works through schools. Send this to your child's school, or ask them to book a free demo.",
      primary: 'share',
    },
    pageOrder: ['hero', 'aha', 'demo', 'features', 'survey', 'contact'],
    share: {
      label: "Ask my child's school",
      message: "I tried StudyRealm and I'd love our school to bring it in. Children learn through interactive lessons and parents get daily updates: https://demo.studyrealm.app/?utm_source=share&utm_medium=whatsapp&utm_campaign=parent",
    },
  },
  Student: {
    key: 'Student',
    hero: {
      tag: "Let's play",
      headlineLines: ['Play. Learn.', 'Collect stars.'],
      sub: '',
      primaryCta: { label: 'Start playing →', action: { type: 'goTo', id: 'aha' } },
      secondaryCta: null,
      showStats: false,
    },
    aha: {
      tag: 'YOUR FIRST REWARD',
      headlineLines: ['Tap the stars.', 'Unlock a theme.'],
      hint: 'Collect 5 stars. It takes 10 seconds.',
      ctaLabel: 'Now play the chapter',
    },
    features: {
      tag: 'Your rewards',
      headlineLines: ['Stars, themes and', 'bragging rights.'],
      description: 'Play more to earn more.',
      ctaLabel: 'Quick tap survey →',
      cardIds: ['models3d', 'starsThemes', 'leaderboard', 'zeroToHero'],
    },
    contact: {
      tag: 'You did it!',
      headline: 'Show your parent or teacher',
      description: 'Tell them you learned Acids & Bases. They can see the full version with a free demo.',
      primary: 'share',
    },
    pageOrder: ['hero', 'aha', 'demo', 'features', 'survey', 'contact'],
    share: {
      label: 'Show your parent or teacher',
      message: 'I just learned Acids & Bases on StudyRealm. Try it: https://demo.studyrealm.app/?utm_source=share&utm_medium=native&utm_campaign=student',
    },
  },
  Other: {
    key: 'Other',
    hero: {
      tag: "LKG to Class 10 · CBSE · ICSE · State boards",
      headlineLines: ['Every student learns.', 'Every teacher sees it.'],
      sub: "Fun lessons kids love, simple progress updates for teachers and parents, and lessons that follow India's latest school guidelines. No app to download.",
      primaryCta: { label: 'See what each user sees →', action: { type: 'goTo', id: 'aha' } },
      secondaryCta: { label: 'See each view', action: { type: 'goTo', id: 'demo' } },
      showStats: true,
    },
    aha: {
      tag: 'ONE PLATFORM, THREE VIEWS',
      headlineLines: ['See it through', "each user's eyes."],
      hint: 'Tap a tab. Teachers, principals and parents each see something different.',
      ctaLabel: 'Now try the chapter',
    },
    features: {
      tag: 'Full Platform',
      headlineLines: ['Powerful tools for', 'teachers and management.'],
      description: "A quick look at what students, teachers and parents each see. Book a free demo to see it with your school's data.",
      ctaLabel: 'Take the Quick Survey →',
      cardIds: ['models3d', 'teacherDashboard', 'parentDashboard', 'leaderboard'],
    },
    contact: {
      tag: '✦ Innovation Partnership Program',
      headline: 'Join our School Pilot',
      description: 'An exclusive pilot for forward-thinking Karnataka schools. No commitment required. Start with a free demo.',
      primary: 'calendly',
    },
    pageOrder: ['hero', 'aha', 'demo', 'features', 'survey', 'contact'],
    share: {
      label: 'Share with a school',
      message: 'Take a look at StudyRealm: https://demo.studyrealm.app/?utm_source=share&utm_medium=whatsapp&utm_campaign=other',
    },
  },
};

export function getRoleConfig(role?: string): RoleConfig {
  if (!role) return ROLE_CONFIGS.Other;
  const normalized = role.trim().toLowerCase();
  if (normalized === 'teacher') return ROLE_CONFIGS.Teacher;
  if (normalized === 'principal' || normalized === 'principal / management' || normalized.startsWith('principal')) {
    return ROLE_CONFIGS.Principal;
  }
  if (normalized === 'parent') return ROLE_CONFIGS.Parent;
  if (normalized === 'student') return ROLE_CONFIGS.Student;
  if (normalized === 'other') return ROLE_CONFIGS.Other;
  return ROLE_CONFIGS.Other;
}
