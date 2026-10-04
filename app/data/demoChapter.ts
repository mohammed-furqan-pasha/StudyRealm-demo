import { DemoChapter } from '../types';

export const demoChapter: DemoChapter = {
  title: 'Light: Real & Virtual Images',
  subject: 'Physics',
  classLevel: 'Class 10',
  blocks: [
    {
      type: 'story_panel',
      panels: [
        {
          asset: '/demo/pencil-in-water.png',
          text: "Dip a straight pencil halfway into a glass of water and look from the side. It looks bent — snapped clean in two. But the pencil never moved. Your eyes aren't lying to you. Light is."
        }
      ]
    },
    {
      type: 'optics_lab',
      title: 'The Light Lab',
      instruction: 'Drag the object. Catch its image on the Catcher.',
      audio: "Meet the Light Lab. Drag the green arrow closer or further from the lens, and watch what happens on the other side. Try to catch a sharp image on the Catcher. Keep an eye on the panel beside it too — it'll show you what you're actually building.",
      device: 'convex_lens',
      focal_length: 10,
      object_height: 4,
      min_u: 3,
      max_u: 35,
      default_u: 30,
      object_image_url: '/img/optics-bench.png',
      allow_half_cover: true,
      missions: [
        {
          id: 'camera',
          goal: 'small_real',
          prompt: 'Mission 1: Be a camera — make a SMALL, sharp image',
          audio: "First mission. A camera shrinks a big scene onto a tiny sensor. Move the object around, keeping it past the second F mark, to catch a sharp image on the Catcher.",
          success_audio: "Perfect. That's a camera lens at work — the whole world, shrunk onto a small sensor."
        },
        {
          id: 'projector',
          goal: 'big_real',
          prompt: 'Mission 2: Be a projector — make a BIG, sharp image',
          audio: "Second mission. Movie projectors make tiny film frames look huge on a screen. Drag the object inward, between the two F marks, and catch a big sharp image on the Catcher.",
          success_audio: "Yes! That's exactly how a projector throws a huge picture onto a screen from a tiny slide."
        },
        {
          id: 'magnifier',
          goal: 'virtual_big',
          prompt: 'Mission 3: Be a magnifying glass — read tiny writing',
          audio: "Last mission. Bring the object very close to the lens, closer than the first F mark, and look at what the Catcher does.",
          success_audio: "The Catcher went blank — because this image can't be caught, only seen through the lens. That's a magnifying glass."
        }
      ],
      concave_twist: {
        device: 'concave_lens',
        focal_length: 10,
        prompt: 'Now try to make the image BIG',
        audio: "One more lens for you to try. Move the object around and see if you can ever make a big image with this one.",
        reveal_audio: "No matter where you put it, this lens only ever shrinks things and shows them the right way up. That's why this exact kind of lens sits inside a door peephole — it's built to shrink, not enlarge."
      }
    },
    {
      type: 'tap_reveal',
      asset: '/demo/lens-diagram.png',
      instruction: 'Tap the glowing dots to name what you just built',
      spots: [
        {
          id: 'focal_point',
          x: 15, y: 40,
          label: '🎯 Focal Point (F)',
          definition: 'The exact spot where all parallel light rays meet after bending through the lens.',
          audio: 'This is the Focal Point. Parallel light rays hitting the lens all bend and meet exactly here.'
        },
        {
          id: 'axis',
          x: 90, y: 50,
          label: '📏 Principal Axis',
          definition: 'The invisible center line we use to measure distances for the lens and object.',
          audio: 'This straight line running through the centre of the lens is the Principal Axis — everything is measured from here.'
        },
        {
          id: 'image',
          x: 73, y: 50,
          label: '🖼️ The Image',
          definition: 'The picture formed where all the light rays bouncing off the object finally meet again.',
          audio: 'This is the image you built — the exact spot where the light rays from the object meet again.'
        }
      ]
    },
    {
      type: 'flip_card',
      front: 'A projector throws a picture onto a screen. Real image, or virtual image?',
      audio_front: 'A projector throws a picture onto a screen. Is that a real image, or a virtual image?',
      back: 'Real Image ✨',
      audio_back: 'Real! A real image can always be caught on a screen, because the actual light rays meet there. A virtual image can never be caught — you can only see it by looking through the lens or mirror.'
    },
    {
      type: 'celebration',
      title: '🎉 You just did real optics!',
      subtitle: 'Class 10 · Physics · Light — Real & Virtual Images'
    }
  ]
};
