import { StoreEvent, StoreEventType } from '../events/types';
import { Voices } from './voices';

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
  // Map $0-$500 to velocity range
  const normalized = Math.min(value / 500, 1);
  return min + normalized * (max - min);
}

export interface EventSoundMapping {
  type: StoreEventType;
  handler: (event: StoreEvent, voices: Voices) => void;
}

export const EVENT_MAPPINGS: EventSoundMapping[] = [
  {
    type: 'page_view',
    handler: (event, voices) => {
      // Soft pad sound for page views
      const note = randomNote(SCALES.pentatonic, 3);
      voices.pad.play({ note, duration: '2n', velocity: 0.3 });
    },
  },
  {
    type: 'search',
    handler: (event, voices) => {
      // Arpeggio for searches
      voices.arp.play({ velocity: 0.5 });
    },
  },
  {
    type: 'add_to_cart',
    handler: (event, voices) => {
      // Percussion hit + piano note
      const velocity = valueToVelocity(event.data.value, 0.4, 0.8);
      voices.percussion.play({ velocity });

      // Add a complementary piano note
      const note = randomNote(SCALES.major, 4);
      voices.piano.play({ note, duration: '8n', velocity: velocity * 0.7 });
    },
  },
  {
    type: 'order_placed',
    handler: (event, voices) => {
      const value = event.data.value || 50;
      const velocity = valueToVelocity(value, 0.5, 0.9);

      // Piano chord
      voices.piano.play({ note: 'C4', duration: '2n', velocity });
      setTimeout(() => {
        voices.piano.play({ note: 'E4', duration: '2n', velocity: velocity * 0.9 });
      }, 50);
      setTimeout(() => {
        voices.piano.play({ note: 'G4', duration: '2n', velocity: velocity * 0.8 });
      }, 100);

      // For high-value orders, add choir
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
      // Alert sound for errors
      voices.alert.play({ velocity: 0.8 });
    },
  },
];

export function playEventSound(event: StoreEvent, voices: Voices): void {
  const mapping = EVENT_MAPPINGS.find((m) => m.type === event.type);
  if (mapping) {
    mapping.handler(event, voices);
  }
}

export function getEventDescription(event: StoreEvent): string {
  switch (event.type) {
    case 'page_view':
      return `Page view: ${event.data.page || 'unknown'}`;
    case 'search':
      return `Search: "${event.data.query || 'unknown'}"`;
    case 'add_to_cart':
      return `Added to cart: $${event.data.value || 0}`;
    case 'order_placed':
      return `Order placed: $${event.data.value || 0}`;
    case 'connection_error':
      return `ERROR ${event.data.errorCode}: ${event.data.errorMessage}`;
    default:
      return `Unknown event: ${event.type}`;
  }
}
