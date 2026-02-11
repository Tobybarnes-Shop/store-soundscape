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
    <div className="te-panel p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <span className="te-label">System</span>
        <div className={`te-led ${isRunning ? 'active' : ''}`} />
      </div>

      {/* Main Power Button */}
      <button
        onClick={isRunning ? onStop : onStart}
        disabled={isStarting}
        className={`w-full h-14 te-button ${
          isRunning ? '' : 'te-button-primary'
        } flex items-center justify-center gap-3 mb-6 ${
          isStarting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isStarting ? (
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
            Initializing
          </span>
        ) : isRunning ? (
          <>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
            Stop
          </>
        ) : (
          <>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
            Play
          </>
        )}
      </button>

      {/* Volume Control */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="te-label">Volume</span>
          <span className="text-xs font-mono text-[var(--muted)]">
            {Math.round(volume * 100).toString().padStart(3, '0')}
          </span>
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
