import { StoreEvent, StoreEventType, EventConfig, DEFAULT_EVENT_CONFIG } from './types';

const SAMPLE_PAGES = [
  '/products/vintage-leather-bag',
  '/products/wireless-headphones',
  '/collections/summer-sale',
  '/collections/new-arrivals',
  '/cart',
  '/',
];

const SAMPLE_SEARCHES = [
  'blue dress',
  'running shoes',
  'gift ideas',
  'sale',
  'wireless earbuds',
  'winter jacket',
];

const SAMPLE_PRODUCTS = [
  'prod_001',
  'prod_002',
  'prod_003',
  'prod_004',
  'prod_005',
];

const SAMPLE_ERRORS = [
  { code: 404, message: 'Product not found' },
  { code: 500, message: 'Server timeout' },
  { code: 503, message: 'Service unavailable' },
  { code: 408, message: 'Request timeout' },
  { code: 429, message: 'Rate limit exceeded' },
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function weightedRandom(weights: Record<StoreEventType, number>): StoreEventType {
  const entries = Object.entries(weights) as [StoreEventType, number][];
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let random = Math.random() * total;

  for (const [type, weight] of entries) {
    random -= weight;
    if (random <= 0) return type;
  }

  return entries[0][0];
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateEvent(config: EventConfig = DEFAULT_EVENT_CONFIG): StoreEvent {
  const type = weightedRandom(config.weights);
  const baseEvent = {
    id: generateId(),
    type,
    timestamp: Date.now(),
    data: {},
  };

  switch (type) {
    case 'order_placed':
      return {
        ...baseEvent,
        data: {
          value: Math.floor(Math.random() * 500) + 20, // $20 - $520
          productId: randomElement(SAMPLE_PRODUCTS),
        },
      };
    case 'add_to_cart':
      return {
        ...baseEvent,
        data: {
          productId: randomElement(SAMPLE_PRODUCTS),
          value: Math.floor(Math.random() * 200) + 10, // $10 - $210
        },
      };
    case 'page_view':
      return {
        ...baseEvent,
        data: {
          page: randomElement(SAMPLE_PAGES),
        },
      };
    case 'search':
      return {
        ...baseEvent,
        data: {
          query: randomElement(SAMPLE_SEARCHES),
        },
      };
    case 'connection_error':
      const error = randomElement(SAMPLE_ERRORS);
      return {
        ...baseEvent,
        data: {
          errorCode: error.code,
          errorMessage: error.message,
        },
      };
    default:
      return baseEvent;
  }
}

export class EventGenerator {
  private config: EventConfig;
  private intervalId: ReturnType<typeof setTimeout> | null = null;
  private errorIntervalId: ReturnType<typeof setTimeout> | null = null;
  private listeners: Set<(event: StoreEvent) => void> = new Set();

  constructor(config: EventConfig = DEFAULT_EVENT_CONFIG) {
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
    const delay =
      Math.random() * (this.config.maxInterval - this.config.minInterval) +
      this.config.minInterval;

    this.intervalId = setTimeout(() => {
      const event = generateEvent(this.config);
      this.emit(event);
      this.scheduleNext();
    }, delay);
  }

  private scheduleNextError(): void {
    // Random interval between 4-6 minutes (240000-360000ms)
    const delay = 240000 + Math.random() * 120000;

    this.errorIntervalId = setTimeout(() => {
      const errorEvent = generateEvent({
        ...this.config,
        weights: { ...this.config.weights, connection_error: 1, page_view: 0, search: 0, add_to_cart: 0, order_placed: 0 },
      });
      errorEvent.type = 'connection_error';
      const error = SAMPLE_ERRORS[Math.floor(Math.random() * SAMPLE_ERRORS.length)];
      errorEvent.data = { errorCode: error.code, errorMessage: error.message };
      this.emit(errorEvent);
      this.scheduleNextError();
    }, delay);
  }

  start(): void {
    if (this.intervalId) return;
    this.scheduleNext();
    this.scheduleNextError();
  }

  stop(): void {
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    if (this.errorIntervalId) {
      clearTimeout(this.errorIntervalId);
      this.errorIntervalId = null;
    }
  }

  setIntensity(level: 'calm' | 'normal' | 'busy'): void {
    switch (level) {
      case 'calm':
        this.config = { ...this.config, minInterval: 2000, maxInterval: 5000 };
        break;
      case 'normal':
        this.config = { ...this.config, minInterval: 500, maxInterval: 3000 };
        break;
      case 'busy':
        this.config = { ...this.config, minInterval: 100, maxInterval: 800 };
        break;
    }
  }
}
