'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AudioControls from '@/components/AudioControls';
import IntensityMeter from '@/components/IntensityMeter';
import EventLog from '@/components/EventLog';
import StoreSelector from '@/components/StoreSelector';
import ThemeToggle from '@/components/ThemeToggle';
import Mixer from '@/components/Mixer';
import { AudioEngine, AudioEngineState, getAudioEngine } from '@/lib/audio/engine';
import { EventGenerator } from '@/lib/events/generator';
import { StoreEvent } from '@/lib/events/types';

export default function Home() {
  const [audioState, setAudioState] = useState<AudioEngineState>('stopped');
  const [intensity, setIntensity] = useState(0);
  const [events, setEvents] = useState<StoreEvent[]>([]);
  const [intensityLevel, setIntensityLevel] = useState<'calm' | 'normal' | 'busy'>('normal');
  const [store, setStore] = useState('allbirds.myshopify.com');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [mounted, setMounted] = useState(false);

  const engineRef = useRef<AudioEngine | null>(null);
  const generatorRef = useRef<EventGenerator | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
      const initialTheme = savedTheme || 'light';
      setTheme(initialTheme);
      document.documentElement.setAttribute('data-theme', initialTheme);
    } catch {
      document.documentElement.setAttribute('data-theme', 'light');
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
    <div className="min-h-screen bg-[var(--background)] p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header - Hardware style top panel */}
        <header className="te-panel p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Decorative ports */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="te-port" />
                <div className="te-port" />
              </div>
              <div>
                <h1 className="te-title text-[var(--foreground)]">
                  Store Soundscape
                </h1>
                <p className="text-[9px] font-medium uppercase tracking-wider text-[var(--muted)]">
                  Generative Audio Machine
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
            </div>
          </div>
        </header>

        {/* System Bar - Full width */}
        <div className="mb-4">
          <AudioControls
            state={audioState}
            onStart={handleStart}
            onStop={handleStop}
            onVolumeChange={handleVolumeChange}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Store + Store Traffic stacked */}
          <div className="lg:col-span-3 flex flex-col gap-4 lg:h-[280px]">
            <StoreSelector value={store} onChange={handleStoreChange} />
            <div className="te-panel p-3 flex-1">
              <span className="te-label text-[8px] block mb-2">Store Traffic</span>
              <div className="flex gap-1">
                {(['calm', 'normal', 'busy'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => handleIntensityChange(level)}
                    className={`flex-1 py-1.5 text-[7px] uppercase font-bold rounded transition-colors ${
                      intensityLevel === level
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-[var(--surface-raised)] text-[var(--foreground)] hover:bg-[var(--border)]'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Middle: Activity */}
          <div className="lg:col-span-4 lg:h-[280px]">
            <IntensityMeter intensity={intensity} />
          </div>

          {/* Right: Mixer */}
          <div className="lg:col-span-5 lg:h-[280px]">
            <Mixer engine={engineRef.current} />
          </div>
        </div>

        {/* Event Log - Full width */}
        <div className="mt-4">
          <EventLog events={events} maxEvents={8} />
        </div>

        {/* Footer - Bottom panel with ports */}
        <footer className="te-panel p-3 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="te-port" />
                <span className="te-label text-[8px]">Output</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="te-port" />
                <span className="te-label text-[8px]">Sync</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="te-label text-[8px]">Next.js + Tone.js</span>
              <span className="te-label text-[8px]">v1.0.17</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
