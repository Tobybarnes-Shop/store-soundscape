import { StoreEvent } from '../../events/types';
import { Voices } from '../../audio/voices';
import { EventSoundMapping } from '../../audio/mappings';

// Reggae scale (minor pentatonic with blue note)
const REGGAE_SCALE = ['A', 'C', 'D', 'E', 'G'];

function randomReggaeNote(octave: number = 3): string {
  const note = REGGAE_SCALE[Math.floor(Math.random() * REGGAE_SCALE.length)];
  return `${note}${octave}`;
}

function valueToVelocity(value: number | undefined, min: number = 0.3, max: number = 0.9): number {
  if (!value) return (min + max) / 2;
  const normalized = Math.min(value / 500, 1);
  return min + normalized * (max - min);
}

export const RIDDIM_MAPPINGS: EventSoundMapping[] = [
  {
    type: 'page_view',
    handler: (event, voices) => {
      // Organ bubble for page views
      const note = randomReggaeNote(3);
      voices.pad.play({ note, duration: '2n', velocity: 0.4 });
    },
  },
  {
    type: 'search',
    handler: (event, voices) => {
      // Melodica run for searches
      voices.arp.play({ velocity: 0.5 });
    },
  },
  {
    type: 'add_to_cart',
    handler: (event, voices) => {
      // Skank guitar chop + bass note
      const velocity = valueToVelocity(event.data.value, 0.4, 0.8);

      // Skank on offbeat
      setTimeout(() => {
        voices.percussion.play({ velocity });
      }, 50);

      // Deep bass
      const bassNote = randomReggaeNote(1);
      voices.piano.play({ note: bassNote, duration: '4n', velocity: velocity * 0.9 });
    },
  },
  {
    type: 'order_placed',
    handler: (event, voices) => {
      const value = event.data.value || 50;
      const velocity = valueToVelocity(value, 0.5, 0.9);

      // Bass drop
      voices.piano.play({ note: 'A1', duration: '4n', velocity: 0.8 });

      // Horn stabs
      setTimeout(() => {
        voices.choir.play({ duration: '4n', velocity, value });
      }, 200);

      // For high-value orders, add melodica flourish
      if (value > 200) {
        setTimeout(() => {
          voices.arp.play({ velocity: velocity * 0.7 });
        }, 400);
      }
    },
  },
  {
    type: 'connection_error',
    handler: (event, voices) => {
      // Dub siren warning
      voices.alert.play({ velocity: 0.8 });
    },
  },
];
