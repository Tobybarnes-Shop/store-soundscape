import { StoreEvent } from '../../events/types';
import { Voices } from '../../audio/voices';
import { EventSoundMapping } from '../../audio/mappings';

// Medieval pentatonic scale (modal)
const MEDIEVAL_SCALE = ['D', 'E', 'G', 'A', 'B'];

function randomMedievalNote(octave: number = 3): string {
  const note = MEDIEVAL_SCALE[Math.floor(Math.random() * MEDIEVAL_SCALE.length)];
  return `${note}${octave}`;
}

function valueToVelocity(value: number | undefined, min: number = 0.3, max: number = 0.9): number {
  if (!value) return (min + max) / 2;
  const normalized = Math.min(value / 500, 1);
  return min + normalized * (max - min);
}

export const MEDIEVAL_MAPPINGS: EventSoundMapping[] = [
  {
    type: 'page_view',
    handler: (event, voices) => {
      // Soft lute pluck for page views
      const note = randomMedievalNote(3);
      voices.piano.play({ note, duration: '8n', velocity: 0.25 });
    },
  },
  {
    type: 'search',
    handler: (event, voices) => {
      // Flute arpeggio for searches (ascending melody)
      voices.arp.play({ velocity: 0.5 });
    },
  },
  {
    type: 'add_to_cart',
    handler: (event, voices) => {
      // Harp chord + bodhrán strike for higher values
      const velocity = valueToVelocity(event.data.value, 0.4, 0.8);
      voices.pad.play({ velocity });

      // Add bodhrán hit for purchases over $30
      if (event.data.value && event.data.value > 30) {
        setTimeout(() => {
          voices.percussion.play({ velocity: velocity * 0.8 });
        }, 100);
      }
    },
  },
  {
    type: 'order_placed',
    handler: (event, voices) => {
      const value = event.data.value || 50;
      const velocity = valueToVelocity(value, 0.5, 0.9);

      // Choir harmony for orders
      voices.choir.play({ duration: '1n', velocity, value });

      // For high-value orders, add flute flourish
      if (value > 200) {
        setTimeout(() => {
          voices.arp.play({ velocity: velocity * 0.7 });
        }, 500);
      }
    },
  },
  {
    type: 'connection_error',
    handler: (event, voices) => {
      // Battle horn warning for errors
      voices.alert.play({ velocity: 0.8 });
    },
  },
];
