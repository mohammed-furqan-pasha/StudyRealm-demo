export type SurveyRole = 'Teacher' | 'Principal' | 'Parent' | 'Student' | 'Other';

export interface LeadFormData {
  name: string;
  role: SurveyRole;
  schoolName: string;
  mobile: string;
}

export interface SurveyMCQQuestion {
  type: 'mcq';
  id: string;
  prompt: string;
  audio: string;        // what TTS reads aloud
  options: string[];
}

export interface SurveyTextQuestion {
  type: 'text';
  id: string;
  prompt: string;
  audio: string;
  placeholder?: string;
}

export type SurveyQuestion = SurveyMCQQuestion | SurveyTextQuestion;

export interface SurveySet {
  role: SurveyRole;
  intro: string;
  intro_audio: string;
  questions: SurveyQuestion[];
}

export interface SurveyAnswer {
  questionId: string;
  questionText: string;
  value: string;
}

export interface SurveySubmission {
  role: SurveyRole;
  name: string;      // correlates this response back to the LeadGate entry
  mobile: string;
  answers: SurveyAnswer[];
  submittedAt: string;
}

export interface TapRevealSpot {
  id: string;
  x: number;
  y: number;
  label: string;
  definition?: string;
  audio: string;
}

export interface StoryPanel {
  asset: string;
  text: string;
}

export interface OpticsMission {
  id: string;
  goal: 'big_real' | 'small_real' | 'virtual_big' | 'vanish';
  prompt: string;         // shown as a card, e.g. "Be a projector — get a big, sharp image"
  audio: string;          // read aloud when the mission starts
  success_audio: string;  // read aloud when the student hits the goal
}

export interface OpticsLabBlockData {
  type: 'optics_lab';
  title: string;
  instruction: string;
  device: 'convex_lens' | 'concave_lens' | 'concave_mirror' | 'convex_mirror';
  focal_length: number;     // positive magnitude
  object_height: number;    // positive magnitude
  min_u: number;
  max_u: number;
  default_u: number;
  object_image_url?: string;
  audio?: string;
  missions: OpticsMission[];              // played in order; demo uses 3
  allow_half_cover?: boolean;             // the "hand over half the lens" surprise
  concave_twist?: {                       // the closing "try to make it big" fail-on-purpose beat
    device: 'concave_lens';
    focal_length: number;
    prompt: string;
    audio: string;
    reveal_audio: string;
  };
}

export type ContentBlock =
  | OpticsLabBlockData
  | { type: 'story_panel'; panels: StoryPanel[] }
  | { type: 'tap_reveal'; asset: string; spots: TapRevealSpot[]; instruction?: string; style?: 'inline_labels' }
  | { type: 'flip_card'; front: string; back: string; audio_front: string; audio_back: string }
  | { type: 'sequence'; instruction: string; steps: string[]; correct_order: number[] }
  | { type: 'celebration'; title: string; subtitle: string };

export interface DemoChapter {
  title: string;
  subject: string;
  classLevel: string;
  blocks: ContentBlock[];
}
