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
  optional?: boolean;
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

export interface StainHookBlockData { type: 'stain_hook'; instruction: string; audio_instruction?: string; button_label: string; result_text: string; audio_result?: string; continue_label: string; stain_color: string; stain_color_after: string; image_before?: string; image_after?: string; }

export interface KitchenLabItem { id: string; label: string; emoji: string; liquid_color: string; result_color: string; result_text: string; scale_pos: number; family: 'acid' | 'base' | 'neutral'; audio?: string; }
export interface KitchenLabBlockData { type: 'kitchen_lab'; indicator_label: string; indicator_color: string; guided_ids: [string, string]; prompts: { first: string; second: string; others: string; done: string; }; items: KitchenLabItem[]; reveal: { lines: { emoji: string; text: string }[]; takeaway: string; teaser: string; bar_labels: { left: string; mid: string; right: string }; marker_pos: number; marker_text: string; continue_label: string }; mystery: { item: KitchenLabItem; question: string; yes_label: string; no_label: string; correct_text: string; nudge_text: string; audio_correct?: string; audio_nudge?: string }; closing: { text: string; audio?: string; continue_label: string }; }

export type ContentBlock =
  | KitchenLabBlockData
  | StainHookBlockData
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
