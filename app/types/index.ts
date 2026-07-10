export interface LeadFormData {
  name: string;
  role: 'Teacher' | 'Principal' | 'Parent' | 'Other';
  schoolName: string;
  mobile: string;
}

export interface TapRevealSpot {
  id: string;
  x: number;
  y: number;
  label: string;
  audio: string;
}

export interface StoryPanel {
  asset: string;
  text: string;
}

export type ContentBlock =
  | { type: 'story_panel'; panels: StoryPanel[] }
  | { type: 'tap_reveal'; asset: string; spots: TapRevealSpot[]; instruction?: string }
  | { type: 'flip_card'; front: string; back: string; audio_front: string; audio_back: string }
  | { type: 'sequence'; instruction: string; steps: string[]; correct_order: number[] }
  | { type: 'celebration'; title: string; subtitle: string };

export interface DemoChapter {
  title: string;
  subject: string;
  classLevel: string;
  blocks: ContentBlock[];
}
