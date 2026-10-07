import { DemoChapter } from '../types';

export const demoChapter: DemoChapter = {
  title: 'Why does haldi turn red with soap?',
  subject: 'Science',
  classLevel: 'Class 7',
  blocks: [
    { type: 'stain_hook', instruction: 'Oh no! A haldi stain on a clean shirt. Tap the soap to wash it', audio_instruction: 'Oh no! A yellow haldi stain on a clean white shirt. Tap the soap to wash it.', button_label: '🧼 Add soap', result_text: 'It turned RED! 😮 Why?', audio_result: "Wait... it did not wash away. It turned bright red! Why does yellow haldi turn red with soap? Let's find out!", continue_label: "Let's find out ▸", stain_color: '#F2B705', stain_color_after: '#B3261E' },
    {
      type: 'kitchen_lab', indicator_label: 'Turmeric paper', indicator_color: '#F2B705', guided_ids: ['lemon', 'soap'], prompts: { first: 'Tap the lemon 🍋 to test it on its strip', second: 'Now tap the soap 🧼', others: 'Try the other three bottles', done: 'Look at the five strips. Which ones turned red?' }, items: [
        { id: 'lemon', label: 'Lemon juice', emoji: '🍋', liquid_color: '#FDE68A', result_color: '#F2B705', result_text: 'Still yellow', scale_pos: 6, family: 'acid', audio: 'Lemon juice. The strip stays yellow.' },
        { id: 'vinegar', label: 'Vinegar', emoji: '🍶', liquid_color: '#EBD9B4', result_color: '#F2B705', result_text: 'Still yellow', scale_pos: 16, family: 'acid', audio: 'Vinegar. Still yellow.' },
        { id: 'water', label: 'Plain water', emoji: '💧', liquid_color: '#BFE3FF', result_color: '#F2B705', result_text: 'Still yellow', scale_pos: 50, family: 'neutral', audio: 'Plain water. Still yellow.' },
        { id: 'baking_soda', label: 'Baking soda water', emoji: '🥄', liquid_color: '#F1F5F9', result_color: '#E8590C', result_text: 'Turned orange-red', scale_pos: 72, family: 'base', audio: 'Baking soda water. The strip turns orange.' },
        { id: 'soap', label: 'Soap water', emoji: '🧼', liquid_color: '#D9F3F8', result_color: '#B3261E', result_text: 'Turned deep red!', scale_pos: 92, family: 'base', audio: 'Soap water. The strip turns deep red!' }],
      reveal: { lines: [{ emoji: '🧼', text: 'Soap and baking soda are BASES. Turmeric turns red with bases.' }, { emoji: '🍋', text: 'Lemon and vinegar are ACIDS. Turmeric stays yellow with acids.' }, { emoji: '💧', text: 'Plain water is NEUTRAL. Turmeric stays yellow here too.' }], takeaway: 'Turmeric is a base detector!', teaser: "To tell acids from plain water, chemists use other indicators. You'll meet them in the full chapter.", bar_labels: { left: 'Acid', mid: 'Neutral', right: 'Base' }, marker_pos: 62, marker_text: 'Turmeric turns red from here', continue_label: 'Try a mystery bottle ▸' },
      mystery: { item: { id: 'mystery', label: 'Mystery bottle', emoji: '❓', liquid_color: '#E0F2FE', result_color: '#B3261E', result_text: 'Turned deep red!', scale_pos: 95, family: 'base', audio: 'The strip turns deep red!' }, question: 'Is the mystery bottle a base?', yes_label: 'Yes, a base', no_label: 'No, not a base', correct_text: 'Yes! Red means base. It was washing-powder water, the same kind of thing that turned your shirt stain red.', nudge_text: 'Look at the strip again. Red means base. Yellow means not a base.', audio_correct: 'Yes! Red means base. It was washing powder water, the same kind of thing that turned your shirt stain red.', audio_nudge: 'Look at the strip again. Red means base. Yellow means not a base.' },
      closing: { text: 'Your stomach makes acid. Antacid medicine is a base that calms it down. Your kitchen is a chemistry lab!', audio: 'Your stomach makes acid. Antacid medicine is a base that calms it down. Your kitchen is a chemistry lab!', continue_label: 'Keep going ▸' }
    },
    {
      type: 'tap_reveal',
      asset: '/demo/acid-base-tap-reveal.png',
      instruction: 'Tap the glowing dots to find acids and bases in your kitchen',
      spots: [
        { id: 'lemon', x: 24, y: 34, label: '🍋 Lemon: an acid', definition: 'Sour things like lemon are acids. Turmeric stays yellow with them.', audio: 'Lemon is an acid. Sour things are usually acids. Turmeric stays yellow with them.' },
        { id: 'curd', x: 74, y: 34, label: '🥛 Curd: an acid', definition: 'Curd tastes a little sour because it has a mild acid. Turmeric stays yellow with it.', audio: 'Curd has a mild acid in it, which is why it tastes a little sour.' },
        { id: 'soap', x: 26, y: 72, label: '🧼 Soap: a base', definition: 'Soap feels slippery and is a base. It turns turmeric red, just like on your shirt.', audio: 'Soap is a base. It feels slippery, and it turns turmeric red, just like on your shirt.' },
        { id: 'antacid', x: 74, y: 72, label: '💊 Antacid: a base', definition: 'Antacid medicine is a base. It calms the acid in your stomach when you have acidity.', audio: 'Antacid medicine is a base. It calms the acid in your stomach.' }
      ]
    },
    {
      type: 'flip_card',
      front: 'A turmeric stain stays yellow when you add lemon juice. Is lemon juice a base?',
      audio_front: 'A turmeric stain stays yellow when you add lemon juice. Is lemon juice a base?',
      back: 'No, it is an acid 🍋',
      audio_back: 'No. Lemon juice is an acid. Turmeric only turns red with bases, so it stays yellow with acids, and with plain water.'
    },
    {
      type: 'celebration',
      title: '🎉 You just learned Acids & Bases!',
      subtitle: 'Sounds like a hard chapter. You just learned it in minutes.'
    }
  ]
};
