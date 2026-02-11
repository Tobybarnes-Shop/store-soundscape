'use client';

import { useState, useCallback } from 'react';
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
  onVolumeChange,
}: AudioControlsProps) {
  const [volume, setVolume] = useState(0.7);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
      onVolumeChange(newVolume);
    },
    [onVolumeChange]
  );

  const isRunning = state === 'running';
  const isStarting = state === 'starting';

  return (
    <div className="te-panel p-5">
      {/* Header row with label and LED */}
      <div className="flex items-center justify-between mb-5">
        <span className="te-label">System</span>
        <div className="flex items-center gap-2">
          <div className={`te-led ${isRunning ? 'active' : ''}`} />
          <span className="text-[9px] font-bold uppercase text-[var(--muted)]">
            {isRunning ? 'On' : 'Off'}
          </span>
        </div>
      </div>

      {/* Play/Stop Button - Large circular */}
      <div className="flex justify-center mb-5">
        <button
          onClick={isRunning ? onStop : onStart}
          disabled={isStarting}
          className={`te-button-play flex items-center justify-center ${
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
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>
      </div>

      {/* Volume Control */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="te-label">Volume</span>
          <div className="te-display px-2 py-1 rounded">
            <span className="te-display-text text-xs font-bold">
              {Math.round(volume * 100).toString().padStart(3, '0')}
            </span>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-full"
        />
      </div>
    </div>
  );
}
