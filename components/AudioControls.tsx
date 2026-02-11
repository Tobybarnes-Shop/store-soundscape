'use client';

import { AudioEngineState } from '@/lib/audio/engine';

interface AudioControlsProps {
  state: AudioEngineState;
  onStart: () => void;
  onStop: () => void;
  onVolumeChange: (volume: number) => void;
}

export default function AudioControls({
  state,
  onStart,
  onStop,
}: AudioControlsProps) {
  const isRunning = state === 'running';
  const isStarting = state === 'starting';

  return (
    <div className="te-panel p-4">
      <div className="flex items-center gap-4">

        {/* Play/Stop Button */}
        <button
          onClick={isRunning ? onStop : onStart}
          disabled={isStarting}
          className={`te-button-play w-14 h-14 flex items-center justify-center flex-shrink-0 ${
            isStarting ? 'opacity-50 cursor-not-allowed' : ''
          } ${isRunning ? 'bg-[var(--accent-green)]' : ''}`}
          style={{
            boxShadow: isRunning
              ? '0 4px 0 #145238, 0 6px 12px rgba(0,0,0,0.25), inset 0 -2px 4px rgba(0,0,0,0.2)'
              : undefined,
          }}
        >
          {isStarting ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isRunning ? (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        {/* Status - simple LED and text */}
        <div className="flex items-center gap-2">
          <div className={`te-led ${isRunning ? 'active' : ''}`} />
          <span className="te-label text-xs tracking-wider">
            {isRunning ? 'RUNNING' : 'STOPPED'}
          </span>
        </div>

        {/* Speaker grille - fills remaining space */}
        <div className="flex-1 te-grille h-10 rounded opacity-60" />

      </div>
    </div>
  );
}
