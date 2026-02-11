'use client';

import { useState, useCallback } from 'react';
import { AudioEngine } from '@/lib/audio/engine';

interface MixerProps {
  engine: AudioEngine | null;
}

const VOICE_CONFIG = [
  { key: 'pad', name: 'PAD', desc: 'Views', symbol: '○', color: 'bg-emerald-500' },
  { key: 'arp', name: 'ARP', desc: 'Search', symbol: '◇', color: 'bg-cyan-500' },
  { key: 'percussion', name: 'PERC', desc: 'Cart', symbol: '□', color: 'bg-yellow-500' },
  { key: 'piano', name: 'KEYS', desc: 'Order', symbol: '●', color: 'bg-orange-500' },
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

  const handleVolumeChange = useCallback(
    (voiceKey: string, value: number) => {
      setVolumes((prev) => ({ ...prev, [voiceKey]: value }));
      engine?.setVoiceVolume(voiceKey, value);
    },
    [engine]
  );

  return (
    <div className="te-panel p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <span className="te-label">Mixer</span>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {VOICE_CONFIG.map(({ key, name, desc, symbol, color }) => (
          <div key={key} className="flex flex-col items-center">
            {/* Channel strip */}
            <div className="te-display p-2 w-full flex flex-col items-center gap-2">
              {/* Symbol */}
              <span className="text-lg">{symbol}</span>

              {/* Vertical slider container */}
              <div className="h-20 flex items-center justify-center">
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
                    height: '72px',
                    width: '20px',
                  }}
                />
              </div>

              {/* Level indicator */}
              <div className="w-full h-1 rounded-full bg-[var(--display-bg)] overflow-hidden">
                <div
                  className={`h-full ${color} transition-all duration-100`}
                  style={{ width: `${volumes[key] * 100}%` }}
                />
              </div>

              {/* Value */}
              <span className="te-display-text text-[9px] font-bold tabular-nums">
                {Math.round(volumes[key] * 100)}
              </span>
            </div>

            {/* Label */}
            <span className="te-label text-[8px] mt-1">{name}</span>
            <span className="text-[7px] text-[var(--muted)]">{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
