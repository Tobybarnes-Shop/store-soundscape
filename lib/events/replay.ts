import { StoreEvent } from './types';

export interface ReplayConfig {
  events: StoreEvent[];
  loop: boolean;
  speedMultiplier: number;
}

export class EventReplayer {
  private config: ReplayConfig;
  private currentIndex: number = 0;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private listeners: Set<(event: StoreEvent) => void> = new Set();
  private startTime: number = 0;

  constructor(config: ReplayConfig) {
    this.config = config;
  }

  subscribe(callback: (event: StoreEvent) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private emit(event: StoreEvent): void {
    this.listeners.forEach((callback) => callback(event));
  }

  private scheduleNext(): void {
    if (this.currentIndex >= this.config.events.length) {
      if (this.config.loop) {
        this.currentIndex = 0;
        this.startTime = Date.now();
      } else {
        return;
      }
    }

    const currentEvent = this.config.events[this.currentIndex];
    const nextEvent = this.config.events[this.currentIndex + 1];

    // Emit current event
    this.emit({
      ...currentEvent,
      timestamp: Date.now(),
    });

    this.currentIndex++;

    if (nextEvent) {
      // Calculate delay to next event based on original timestamps
      const originalDelay = nextEvent.timestamp - currentEvent.timestamp;
      const adjustedDelay = originalDelay / this.config.speedMultiplier;

      this.timeoutId = setTimeout(() => {
        this.scheduleNext();
      }, Math.max(adjustedDelay, 100)); // Minimum 100ms between events
    } else if (this.config.loop) {
      this.timeoutId = setTimeout(() => {
        this.scheduleNext();
      }, 1000); // 1 second pause before loop
    }
  }

  start(): void {
    if (this.timeoutId) return;
    this.startTime = Date.now();
    this.scheduleNext();
  }

  stop(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  reset(): void {
    this.stop();
    this.currentIndex = 0;
  }

  setSpeed(multiplier: number): void {
    this.config.speedMultiplier = Math.max(0.1, Math.min(10, multiplier));
  }
}

// Sample event sequence for testing
export const SAMPLE_EVENTS: StoreEvent[] = [
  { id: '1', type: 'page_view', timestamp: 0, data: { page: '/' } },
  { id: '2', type: 'page_view', timestamp: 1000, data: { page: '/collections/sale' } },
  { id: '3', type: 'search', timestamp: 2500, data: { query: 'summer dress' } },
  { id: '4', type: 'page_view', timestamp: 4000, data: { page: '/products/floral-dress' } },
  { id: '5', type: 'add_to_cart', timestamp: 6000, data: { productId: 'prod_001', value: 79 } },
  { id: '6', type: 'page_view', timestamp: 7500, data: { page: '/products/sandals' } },
  { id: '7', type: 'add_to_cart', timestamp: 9000, data: { productId: 'prod_002', value: 45 } },
  { id: '8', type: 'order_placed', timestamp: 12000, data: { value: 124, productId: 'prod_001' } },
  { id: '9', type: 'page_view', timestamp: 14000, data: { page: '/' } },
  { id: '10', type: 'search', timestamp: 15500, data: { query: 'wireless headphones' } },
];
