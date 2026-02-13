import { StoreEvent } from '../../events/types';
import { Voices } from '../../audio/voices';
import { EventSoundMapping } from '../../audio/mappings';

function valueToVelocity(value: number | undefined, min: number = 0.3, max: number = 0.9): number {
  if (!value) return (min + max) / 2;
  const normalized = Math.min(value / 500, 1);
  return min + normalized * (max - min);
}

export const VAPORWAVE_MAPPINGS: EventSoundMapping[] = [
  {
    type: 'page_view',
    handler: (event, voices) => {
      // Pluck sample with random pitch shifting
      voices.piano.play({ velocity: 0.7 });
    },
  },
  {
    type: 'search',
    handler: (event, voices) => {
      // Delay hat for rhythmic accent
      voices.percussion.play({ velocity: 0.6 });

      // For rapid searches, add more hats
      const searchCount = event.data.value || 0;
      if (searchCount % 3 === 0) {
        setTimeout(() => {
          voices.percussion.play({ velocity: 0.4 });
        }, 150);
      }
    },
  },
  {
    type: 'add_to_cart',
    handler: (event, voices) => {
      const value = event.data.value || 0;
      const velocity = valueToVelocity(value, 0.5, 0.8);

      // Hum pad for ambient background
      voices.pad.play({ velocity: velocity * 0.7 });

      // Pluck chord - sample selection based on value
      setTimeout(() => {
        voices.arp.play({ value, velocity });
      }, 100);
    },
  },
  {
    type: 'order_placed',
    handler: (event, voices) => {
      const value = event.data.value || 50;
      const velocity = valueToVelocity(value, 0.6, 0.9);

      // Layered hum choir for orders
      voices.choir.play({ velocity });

      // Add pluck chord for celebration
      setTimeout(() => {
        voices.arp.play({ value: 100, velocity: velocity * 0.8 });
      }, 300);

      // For high-value orders, add extra pluck
      if (value > 200) {
        setTimeout(() => {
          voices.piano.play({ velocity: 0.8 });
        }, 600);
      }
    },
  },
  {
    type: 'connection_error',
    handler: (event, voices) => {
      // Error glitch - jarring alert
      voices.alert.play({ velocity: 0.85 });
    },
  },
];
