import { StoreEvent } from '../../events/types';
import { Voices } from '../../audio/voices';
import { EventSoundMapping } from '../../audio/mappings';

// Musical scales for melodic variety
const SCALES = {
  major: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  minor: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'],
  pentatonic: ['C', 'D', 'E', 'G', 'A'],
};

function randomNote(scale: string[] = SCALES.pentatonic, octave: number = 4): string {
  const note = scale[Math.floor(Math.random() * scale.length)];
  return `${note}${octave}`;
}

function valueToVelocity(value: number | undefined, min: number = 0.3, max: number = 0.9): number {
  if (!value) return (min + max) / 2;
  const normalized = Math.min(value / 500, 1);
  return min + normalized * (max - min);
}

export const DEFAULT_MAPPINGS: EventSoundMapping[] = [
  {
    type: 'page_view',
    handler: (event, voices) => {
      const note = randomNote(SCALES.pentatonic, 3);
      voices.pad.play({ note, duration: '2n', velocity: 0.3 });
    },
  },
  {
    type: 'search',
    handler: (event, voices) => {
      voices.piano.play({ note: 'C4', duration: '2n', velocity: 0.5 });
      setTimeout(() => {
        voices.piano.play({ note: 'E4', duration: '2n', velocity: 0.45 });
      }, 50);
      setTimeout(() => {
        voices.piano.play({ note: 'G4', duration: '2n', velocity: 0.4 });
      }, 100);
    },
  },
  {
    type: 'add_to_cart',
    handler: (event, voices) => {
      const velocity = valueToVelocity(event.data.value, 0.4, 0.8);
      voices.percussion.play({ velocity });

      const note = randomNote(SCALES.major, 4);
      voices.piano.play({ note, duration: '8n', velocity: velocity * 0.7 });
    },
  },
  {
    type: 'order_placed',
    handler: (event, voices) => {
      const value = event.data.value || 50;
      const velocity = valueToVelocity(value, 0.5, 0.9);

      voices.arp.play({ velocity });

      if (value > 100) {
        setTimeout(() => {
          voices.choir.play({ duration: '1n', velocity: velocity * 0.7, value });
        }, 200);
      }
    },
  },
  {
    type: 'connection_error',
    handler: (event, voices) => {
      voices.alert.play({ velocity: 0.8 });
    },
  },
];
