'use client';

import { useState, useCallback } from 'react';
import { AudioEngine } from '@/lib/audio/engine';

interface MixerProps {
  engine: AudioEngine | null;
}

const VOICE_CONFIG = [
  { key: 'pad', name: 'PAD', desc: 'Views', symbol: '○', color: 'bg-emerald-500' },
  { key: 'piano', name: 'KEYS', desc: 'Search', symbol: '◇', color: 'bg-cyan-500' },
  { key: 'percussion', name: 'PERC', desc: 'Cart', symbol: '□', color: 'bg-yellow-500' },
  { key: 'arp', name: 'ARP', desc: 'Order', symbol: '●', color: 'bg-orange-500' },
  { key: 'choir', name: 'CHOIR', desc: 'High $', symbol: '◆', color: 'bg-purple-500' },
  { key: 'alert', name: 'ALERT', desc: 'Error', symbol: '⚠', color: 'bg-red-500' },
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

  const [soloed, setSoloed] = useState<string | null>(null);

  const applyVolume = useCallback((voiceKey: string, volume: number, isMuted: boolean, soloKey: string | null) => {
    if (!engine) return;

    // If something is soloed and this isn't it, mute it
    if (soloKey && soloKey !== voiceKey) {
      engine.setVoiceVolume(voiceKey, 0);
    } else if (isMuted) {
      engine.setVoiceVolume(voiceKey, 0);
    } else {
      engine.setVoiceVolume(voiceKey, volume);
    }
  }, [engine]);

  const handleVolumeChange = useCallback(
    (voiceKey: string, value: number) => {
      setVolumes((prev) => ({ ...prev, [voiceKey]: value }));
      applyVolume(voiceKey, value, muted[voiceKey], soloed);
    },
    [applyVolume, muted, soloed]
  );

  const handleMute = useCallback((voiceKey: string) => {
    setMuted((prev) => {
      const newMuted = { ...prev, [voiceKey]: !prev[voiceKey] };
      applyVolume(voiceKey, volumes[voiceKey], newMuted[voiceKey], soloed);
      return newMuted;
    });
  }, [applyVolume, volumes, soloed]);

  const handleSolo = useCallback((voiceKey: string) => {
    setSoloed((prev) => {
      const newSolo = prev === voiceKey ? null : voiceKey;
      // Apply to all voices
      VOICE_CONFIG.forEach((v) => {
        applyVolume(v.key, volumes[v.key], muted[v.key], newSolo);
      });
      return newSolo;
    });
  }, [applyVolume, volumes, muted]);

  return (
    <div className="te-panel p-3 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="te-label">Mixer</span>
      </div>

      <div className="grid grid-cols-6 gap-1 flex-1">
        {VOICE_CONFIG.map(({ key, name, desc, symbol, color }) => {
          const isMuted = muted[key];
          const isSoloed = soloed === key;
          const isOtherSoloed = soloed && soloed !== key;

          return (
            <div key={key} className="flex flex-col">
              {/* Channel strip */}
              <div className={`te-display p-1.5 w-full flex-1 flex flex-col items-center justify-between ${isOtherSoloed ? 'opacity-40' : ''}`}>
                {/* Symbol */}
                <span className="text-sm">{symbol}</span>

                {/* Vertical slider - fills available space */}
                <div className="flex-1 flex items-center justify-center py-1">
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
                      height: '100%',
                      minHeight: '60px',
                      width: '16px',
                    }}
                  />
                </div>

                {/* Level indicator */}
                <div className="w-full h-1 rounded-full bg-[var(--display-bg)] overflow-hidden">
                  <div
                    className={`h-full ${color} transition-all duration-100`}
                    style={{ width: `${(isMuted || isOtherSoloed) ? 0 : volumes[key] * 100}%` }}
                  />
                </div>

                {/* Mute/Solo buttons */}
                <div className="flex gap-0.5 mt-1">
                  <button
                    onClick={() => handleMute(key)}
                    className={`px-1.5 py-0.5 text-[7px] font-bold rounded ${
                      isMuted ? 'bg-red-500 text-white' : 'bg-[var(--surface-raised)] text-[var(--muted)]'
                    }`}
                  >
                    M
                  </button>
                  <button
                    onClick={() => handleSolo(key)}
                    className={`px-1.5 py-0.5 text-[7px] font-bold rounded ${
                      isSoloed ? 'bg-yellow-500 text-black' : 'bg-[var(--surface-raised)] text-[var(--muted)]'
                    }`}
                  >
                    S
                  </button>
                </div>
              </div>

              {/* Label */}
              <span className="te-label text-[7px] mt-0.5 text-center">{name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
