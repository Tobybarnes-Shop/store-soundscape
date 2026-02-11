'use client';

import { StoreEvent } from '@/lib/events/types';
import { getEventDescription } from '@/lib/audio/mappings';

interface EventLogProps {
  events: StoreEvent[];
  maxEvents?: number;
}

function getEventSymbol(type: string): string {
  switch (type) {
    case 'page_view':
      return '○';
    case 'search':
      return '◇';
    case 'add_to_cart':
      return '□';
    case 'order_placed':
      return '●';
    default:
      return '·';
  }
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export default function EventLog({ events, maxEvents = 12 }: EventLogProps) {
  const displayEvents = events.slice(-maxEvents).reverse();

  return (
    <div className="te-panel p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="te-label">Event Log</span>
        <span className="text-xs font-mono text-[var(--muted)]">
          {events.length.toString().padStart(4, '0')}
        </span>
      </div>

      {displayEvents.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-[var(--muted)] text-xs">
          Waiting for events...
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs">
          {displayEvents.map((event, index) => (
            <div
              key={event.id}
              className={`flex items-center gap-3 py-2 px-2 transition-all duration-200 ${
                index === 0 ? 'bg-[var(--accent)]/10 animate-pulse-once' : ''
              }`}
              style={{ opacity: 1 - index * 0.06 }}
            >
              <span className="text-[var(--accent)] w-4 text-center">
                {getEventSymbol(event.type)}
              </span>
              <span className="text-[var(--muted)] w-16 flex-shrink-0">
                {formatTime(event.timestamp)}
              </span>
              <span className="text-[var(--foreground)] truncate flex-1">
                {getEventDescription(event)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-[var(--border)]">
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { type: 'page_view', symbol: '○', label: 'View' },
            { type: 'search', symbol: '◇', label: 'Search' },
            { type: 'add_to_cart', symbol: '□', label: 'Cart' },
            { type: 'order_placed', symbol: '●', label: 'Order' },
          ].map(({ type, symbol, label }) => {
            const count = events.filter((e) => e.type === type).length;
            return (
              <div key={type} className="text-center">
                <div className="text-[var(--accent)] text-sm mb-1">{symbol}</div>
                <div className="te-label">{label}</div>
                <div className="text-xs font-mono text-[var(--muted)]">
                  {count.toString().padStart(3, '0')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
