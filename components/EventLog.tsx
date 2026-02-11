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

export default function EventLog({ events, maxEvents = 10 }: EventLogProps) {
  const displayEvents = events.slice(-maxEvents).reverse();

  return (
    <div className="te-panel p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="te-label">Event Log</span>
        <div className="te-display px-2 py-1 rounded">
          <span className="te-display-text text-xs font-bold">
            {events.length.toString().padStart(4, '0')}
          </span>
        </div>
      </div>

      {/* Event display - LED style */}
      <div className="te-display flex-1 p-3 min-h-[200px]">
        {displayEvents.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <span className="te-display-text text-xs opacity-50">
              WAITING FOR EVENTS...
            </span>
          </div>
        ) : (
          <div className="space-y-1 overflow-y-auto h-full font-mono text-[11px]">
            {displayEvents.map((event, index) => (
              <div
                key={event.id}
                className={`flex items-center gap-2 py-1.5 px-2 rounded transition-all duration-200 ${
                  index === 0 ? 'bg-[var(--accent-green)]/20 animate-pulse-once' : ''
                }`}
                style={{ opacity: 1 - index * 0.07 }}
              >
                <span className="te-display-text w-4 text-center">
                  {getEventSymbol(event.type)}
                </span>
                <span className="te-display-text opacity-60 w-14 flex-shrink-0 text-[10px]">
                  {formatTime(event.timestamp)}
                </span>
                <span className="te-display-text truncate flex-1 text-[10px]">
                  {getEventDescription(event)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        {[
          { type: 'page_view', symbol: '○', label: 'VIEW' },
          { type: 'search', symbol: '◇', label: 'SRCH' },
          { type: 'add_to_cart', symbol: '□', label: 'CART' },
          { type: 'order_placed', symbol: '●', label: 'ORDR' },
        ].map(({ type, symbol, label }) => {
          const count = events.filter((e) => e.type === type).length;
          return (
            <div key={type} className="text-center">
              <div className="te-button py-2 px-1 mb-1">
                <span className="text-[var(--accent)] text-sm">{symbol}</span>
              </div>
              <div className="te-label text-[7px]">{label}</div>
              <div className="text-[10px] font-bold text-[var(--foreground)]">
                {count.toString().padStart(3, '0')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
