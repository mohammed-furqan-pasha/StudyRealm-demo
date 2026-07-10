import { DemoChapter } from '../types';

export const demoChapter: DemoChapter = {
  title: 'The Water Cycle',
  subject: 'Science',
  classLevel: 'Class 3',
  blocks: [
    {
      type: 'story_panel',
      panels: [
        {
          asset: '/demo/water-cycle/droplet-rising.png',
          text: "Meet Droplet, a tiny water drop living in the ocean. One warm morning, the sun shone bright — and Droplet felt herself rising up, up, up into the sky!"
        }
      ]
    },
    {
      type: 'tap_reveal',
      asset: '/demo/water-cycle/cycle-diagram.png',
      instruction: 'Tap the glowing dots to explore the Water Cycle',
      spots: [
        {
          id: 'sun',
          x: 82, y: 12,
          label: '☀️ Evaporation',
          audio: 'The Sun heats the ocean and lakes, turning water into water vapour. This is called Evaporation. The water rises invisibly into the air!'
        },
        {
          id: 'cloud',
          x: 45, y: 18,
          label: '☁️ Condensation',
          audio: 'High up in the sky, water vapour cools down and turns back into tiny droplets. These droplets gather together to form clouds. This is called Condensation!'
        },
        {
          id: 'rain',
          x: 30, y: 52,
          label: '🌧️ Precipitation',
          audio: 'When clouds become heavy with water droplets, the water falls back to Earth as rain or snow. This is called Precipitation!'
        },
        {
          id: 'river',
          x: 60, y: 80,
          label: '🌊 Collection',
          audio: 'Rain water flows into rivers, lakes, and back into the ocean. This is called Collection, and then the whole cycle starts again!'
        }
      ]
    },
    {
      type: 'flip_card',
      front: 'What do we call water turning into water vapour when the sun heats it?',
      audio_front: 'What do we call water turning into water vapour when the sun heats it?',
      back: 'Evaporation ☀️',
      audio_back: 'Evaporation! The sun heats water in oceans and lakes, turning it into invisible water vapour that rises into the air.'
    },
    {
      type: 'sequence',
      instruction: 'Put the Water Cycle steps in the correct order',
      steps: ['☁️ Condensation', '🌊 Collection', '☀️ Evaporation', '🌧️ Precipitation'],
      correct_order: [2, 0, 3, 1]
    },
    {
      type: 'celebration',
      title: '🎉 You learned the Water Cycle!',
      subtitle: 'Class 3 · Science · 4 moments completed'
    }
  ]
};
