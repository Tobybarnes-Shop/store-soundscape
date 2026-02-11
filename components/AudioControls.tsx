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
    <div className="te-panel p-4">
      <div className="flex items-center gap-6">
        {/* Play/Stop Button - Left side */}
        <button
          onClick={isRunning ? onStop : onStart}
          disabled={isStarting}
          className={`te-button-play w-12 h-12 flex items-center justify-center flex-shrink-0 ${
            isStarting ? 'opacity-50 cursor-not-allowed' : ''
          } ${isRunning ? 'bg-[var(--accent-green)]' : ''}`}
          style={{
            boxShadow: isRunning
              ? '0 4px 0 #145238, 0 6px 12px rgba(0,0,0,0.25), inset 0 -2px 4px rgba(0,0,0,0.2)'
              : undefined,
          }}
        >
          {isStarting ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isRunning ? (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        {/* Status */}
        <div className="flex items-center gap-2">
          <div className={`te-led ${isRunning ? 'active' : ''}`} />
          <span className="te-label">{isRunning ? 'Running' : 'Stopped'}</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Volume Control */}
        <div className="flex items-center gap-3">
          <span className="te-label">Vol</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24"
          />
          <div className="te-display px-2 py-1 rounded">
            <span className="te-display-text text-[10px] font-bold">
              {Math.round(volume * 100).toString().padStart(3, '0')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
