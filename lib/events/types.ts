export type StoreEventType =
  | 'order_placed'
  | 'add_to_cart'
  | 'page_view'
  | 'search';

export interface StoreEvent {
  id: string;
  type: StoreEventType;
  timestamp: number;
  data: {
    value?: number;      // Order value in dollars
    query?: string;      // Search query
    page?: string;       // Page URL
    productId?: string;  // Product ID
  };
}

export interface EventConfig {
  minInterval: number;  // Minimum ms between events
  maxInterval: number;  // Maximum ms between events
  weights: Record<StoreEventType, number>;  // Probability weights
}

export const DEFAULT_EVENT_CONFIG: EventConfig = {
  minInterval: 500,
  maxInterval: 3000,
  weights: {
    page_view: 50,
    search: 20,
    add_to_cart: 20,
    order_placed: 10,
  },
};
