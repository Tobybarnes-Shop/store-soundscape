'use client';

import { useState, useCallback } from 'react';
import { AudioEngine } from '@/lib/audio/engine';

interface MixerProps {
  engine: AudioEngine | null;
}

const VOICE_CONFIG = [
  { key: 'pad', name: 'VIEW', desc: 'Pad', symbol: '○', color: 'bg-emerald-500' },
  { key: 'piano', name: 'SEARCH', desc: 'Keys', symbol: '◇', color: 'bg-cyan-500' },
  { key: 'percussion', name: 'CART', desc: 'Perc', symbol: '□', color: 'bg-yellow-500' },
  { key: 'arp', name: 'ORDER', desc: 'Arp', symbol: '●', color: 'bg-orange-500' },
  { key: 'choir', name: 'HIGH $', desc: 'Choir', symbol: '◆', color: 'bg-purple-500' },
  { key: 'alert', name: 'ERROR', desc: 'Alert', symbol: '⚠', color: 'bg-red-500' },
];

export default function Mixer({ engine }: MixerProps) {
  const [volumes, setVolumes] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    VOICE_CONFIG.forEach((v) => {
      initial[v.key] = 0.7;
    });
    return initial;
  });

  const [muted, setMuted] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    VOICE_CONFIG.forEach((v) => {
      initial[v.key] = false;
    });
    return initial;
  });

  const applyVolume = useCallback((voiceKey: string, volume: number, isMuted: boolean) => {
    if (!engine) return;
    engine.setVoiceVolume(voiceKey, isMuted ? 0 : volume);
  }, [engine]);

  const handleVolumeChange = useCallback(
    (voiceKey: string, value: number) => {
      setVolumes((prev) => ({ ...prev, [voiceKey]: value }));
      applyVolume(voiceKey, value, muted[voiceKey]);
    },
    [applyVolume, muted]
  );

  const handleMute = useCallback((voiceKey: string) => {
    setMuted((prev) => {
      const newMuted = { ...prev, [voiceKey]: !prev[voiceKey] };
      applyVolume(voiceKey, volumes[voiceKey], newMuted[voiceKey]);
      return newMuted;
    });
  }, [applyVolume, volumes]);

  return (
    <div className="te-panel p-3 h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <span className="te-label">Mixer</span>
      </div>

      <div className="grid grid-cols-6 gap-1 flex-1 min-h-0">
        {VOICE_CONFIG.map(({ key, name, symbol, color }) => {
          const isMuted = muted[key];

          return (
            <div key={key} className="flex flex-col min-h-0">
              {/* Channel strip */}
              <div className="te-display p-1.5 w-full flex-1 flex flex-col items-center min-h-0">
                {/* Symbol */}
                <span className="text-sm flex-shrink-0">{symbol}</span>

                {/* Vertical slider */}
                <div className="flex-1 flex items-center justify-center py-1 min-h-0">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volumes[key]}
                    onChange={(e) => handleVolumeChange(key, parseFloat(e.target.value))}
                    className="mixer-slider"
                    style={{
                      writingMode: 'vertical-lr',
                      direction: 'rtl',
                      height: '80px',
                      width: '16px',
                    }}
                  />
                </div>

                {/* Level indicator */}
                <div className="w-full h-1 rounded-full bg-[var(--display-bg)] overflow-hidden flex-shrink-0">
                  <div
                    className={`h-full ${color} transition-all duration-100`}
                    style={{ width: `${isMuted ? 0 : volumes[key] * 100}%` }}
                  />
                </div>

                {/* Mute button */}
                <button
                  onClick={() => handleMute(key)}
                  className={`mt-1 px-2 py-0.5 text-[7px] font-bold rounded flex-shrink-0 ${
                    isMuted ? 'bg-red-500 text-white' : 'bg-[var(--surface-raised)] text-[var(--muted)]'
                  }`}
                >
                  M
                </button>
              </div>

              {/* Label */}
              <span className="te-label text-[7px] mt-0.5 text-center flex-shrink-0">{name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
