'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AudioControls from '@/components/AudioControls';
import IntensityMeter from '@/components/IntensityMeter';
import EventLog from '@/components/EventLog';
import StoreSelector from '@/components/StoreSelector';
import ThemeToggle from '@/components/ThemeToggle';
import { AudioEngine, AudioEngineState, getAudioEngine } from '@/lib/audio/engine';
import { EventGenerator } from '@/lib/events/generator';
import { StoreEvent } from '@/lib/events/types';

export default function Home() {
  const [audioState, setAudioState] = useState<AudioEngineState>('stopped');
  const [intensity, setIntensity] = useState(0);
  const [events, setEvents] = useState<StoreEvent[]>([]);
  const [intensityLevel, setIntensityLevel] = useState<'calm' | 'normal' | 'busy'>('normal');
  const [store, setStore] = useState('allbirds.myshopify.com');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  const engineRef = useRef<AudioEngine | null>(null);
  const generatorRef = useRef<EventGenerator | null>(null);

  useEffect(() => {
    setMounted(true);
    // Check for saved theme preference or system preference
    try {
      const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
      setTheme(initialTheme);
      document.documentElement.setAttribute('data-theme', initialTheme);
    } catch {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  useEffect(() => {
    engineRef.current = getAudioEngine({
      onStateChange: setAudioState,
      onIntensityChange: setIntensity,
    });
    generatorRef.current = new EventGenerator();

    return () => {
      engineRef.current?.stop();
      generatorRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (!generatorRef.current || !engineRef.current) return;

    const unsubscribe = generatorRef.current.subscribe((event) => {
      setEvents((prev) => [...prev, event]);
      engineRef.current?.playEvent(event);
    });

    return unsubscribe;
  }, []);

  const handleThemeToggle = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }, [theme]);

  const handleStart = useCallback(async () => {
    if (!engineRef.current || !generatorRef.current) return;
    try {
      await engineRef.current.start();
      generatorRef.current.start();
    } catch (error) {
      console.error('Failed to start:', error);
    }
  }, []);

  const handleStop = useCallback(() => {
    engineRef.current?.stop();
    generatorRef.current?.stop();
  }, []);

  const handleVolumeChange = useCallback((volume: number) => {
    engineRef.current?.setVolume(volume);
  }, []);

  const handleIntensityChange = useCallback((level: 'calm' | 'normal' | 'busy') => {
    setIntensityLevel(level);
    generatorRef.current?.setIntensity(level);
  }, []);

  const handleStoreChange = useCallback((newStore: string) => {
    setStore(newStore);
    setEvents([]);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-[var(--accent)]" />
              <h1 className="text-sm font-mono uppercase tracking-[0.2em] text-[var(--foreground)]">
                Store Soundscape
              </h1>
            </div>
            <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
          </div>
          <p className="text-xs font-mono text-[var(--muted)] ml-6 mt-2">
            Generative audio from commerce events
          </p>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column - Controls */}
          <div className="lg:col-span-3 space-y-4">
            <StoreSelector value={store} onChange={handleStoreChange} />

            {/* Mode Selector */}
            <div className="te-panel p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="te-label">Mode</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['calm', 'normal', 'busy'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => handleIntensityChange(level)}
                    className={`te-button py-3 ${
                      intensityLevel === level ? 'te-button-primary' : ''
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <AudioControls
              state={audioState}
              onStart={handleStart}
              onStop={handleStop}
              onVolumeChange={handleVolumeChange}
            />
          </div>

          {/* Center Column - Meters */}
          <div className="lg:col-span-4 space-y-4">
            <IntensityMeter intensity={intensity} />

            {/* Sound Guide */}
            <div className="te-panel p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="te-label">Voices</span>
              </div>
              <div className="space-y-3">
                {[
                  { symbol: '○', name: 'Pad', desc: 'Page views' },
                  { symbol: '◇', name: 'Arp', desc: 'Searches' },
                  { symbol: '□', name: 'Perc', desc: 'Add to cart' },
                  { symbol: '●', name: 'Choir', desc: 'Orders' },
                ].map(({ symbol, name, desc }) => (
                  <div key={name} className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-[var(--accent)] w-4">{symbol}</span>
                    <span className="text-[var(--foreground)] w-12">{name}</span>
                    <span className="text-[var(--muted)]">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Event Log */}
          <div className="lg:col-span-5">
            <EventLog events={events} maxEvents={12} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-4 border-t border-[var(--border)]">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)]">
            <span>Next.js + Tone.js</span>
            <span>v1.0.0</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
