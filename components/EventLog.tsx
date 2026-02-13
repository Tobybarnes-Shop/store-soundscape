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
    case 'connection_error':
      return '⚠';
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
    <div className="te-panel p-4 h-full flex flex-col">
      <div className="flex gap-4 flex-1">
        {/* Stats column */}
        <div className="flex gap-2 flex-shrink-0">
          {[
            { type: 'page_view', symbol: '○', label: 'VIEW', color: 'text-[var(--accent)]' },
            { type: 'search', symbol: '◇', label: 'SRCH', color: 'text-[var(--accent)]' },
            { type: 'add_to_cart', symbol: '□', label: 'CART', color: 'text-[var(--accent)]' },
            { type: 'order_placed', symbol: '●', label: 'ORDR', color: 'text-[var(--accent)]' },
            { type: 'connection_error', symbol: '⚠', label: 'ERR', color: 'text-red-500' },
          ].map(({ type, symbol, label, color }) => {
            const count = events.filter((e) => e.type === type).length;
            return (
              <div key={type} className="text-center">
                <div className="te-button py-2 px-2 mb-1">
                  <span className={`${color} text-sm`}>{symbol}</span>
                </div>
                <div className="te-label text-[7px]">{label}</div>
                <div className="text-[10px] font-bold text-[var(--foreground)]">
                  {count.toString().padStart(3, '0')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Event display - LED style */}
        <div className="te-display flex-1 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="te-label text-[8px]">Event Log</span>
            <span className="te-label text-[8px]">
              {events.length.toString().padStart(4, '0')}
            </span>
          </div>
          {displayEvents.length === 0 ? (
            <div className="h-20 flex items-center justify-center">
              <span className="te-display-text text-xs opacity-50">
                WAITING FOR EVENTS...
              </span>
            </div>
          ) : (
            <div className="overflow-y-auto font-mono text-[11px]" style={{ maxHeight: '240px' }}>
              {displayEvents.map((event, index) => (
                <div
                  key={event.id}
                  className={`flex items-center gap-2 h-6 px-2 rounded ${
                    index === 0 ? 'bg-[var(--accent)]/10' : ''
                  }`}
                  style={{
                    opacity: 1 - index * 0.08,
                    boxShadow: index === 0 ? '0 0 8px var(--accent)' : 'none'
                  }}
                >
                  <span className="te-display-text w-4 text-center flex-shrink-0">
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
      </div>
    </div>
  );
}
