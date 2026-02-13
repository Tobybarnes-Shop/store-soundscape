'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AudioControls from '@/components/AudioControls';
import IntensityMeter from '@/components/IntensityMeter';
import EventLog from '@/components/EventLog';
import StoreSelector from '@/components/StoreSelector';
import ColorModeSwitch from '@/components/ColorModeSwitch';
import Mixer from '@/components/Mixer';
import VideoPlayer from '@/components/VideoPlayer';
import { AudioEngine, AudioEngineState, getAudioEngine } from '@/lib/audio/engine';
import { EventGenerator } from '@/lib/events/generator';
import { StoreEvent } from '@/lib/events/types';
import { ThemeVariant, ColorMode, applyThemeStyles } from '@/lib/themes';

const THEMES: ThemeVariant[] = ['default', 'medieval', 'riddim', 'vaporwave'];

export default function Home() {
  const [audioState, setAudioState] = useState<AudioEngineState>('stopped');
  const [intensity, setIntensity] = useState(0);
  const [events, setEvents] = useState<StoreEvent[]>([]);
  const [intensityLevel, setIntensityLevel] = useState<'calm' | 'normal' | 'busy'>('normal');
  const [store, setStore] = useState('allbirds.myshopify.com');
  const [themeVariant, setThemeVariant] = useState<ThemeVariant>('default');
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  const [mounted, setMounted] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.7);

  const engineRef = useRef<AudioEngine | null>(null);
  const generatorRef = useRef<EventGenerator | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const savedVariant = (localStorage.getItem('themeVariant') as ThemeVariant) || 'default';
      const savedMode = (localStorage.getItem('colorMode') as ColorMode) || 'light';
      setThemeVariant(savedVariant);
      setColorMode(savedMode);
      applyThemeStyles(savedVariant, savedMode);
    } catch {
      applyThemeStyles('default', 'light');
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

  const handleThemeVariantChange = useCallback((variant: ThemeVariant) => {
    setThemeVariant(variant);
    applyThemeStyles(variant, colorMode);
    localStorage.setItem('themeVariant', variant);

    // Switch audio theme if engine is running
    engineRef.current?.switchTheme(variant);
  }, [colorMode]);

  const handleColorModeToggle = useCallback(() => {
    const newMode = colorMode === 'dark' ? 'light' : 'dark';
    setColorMode(newMode);
    applyThemeStyles(themeVariant, newMode);
    localStorage.setItem('colorMode', newMode);
  }, [colorMode, themeVariant]);

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

  const handleMasterVolumeChange = useCallback((volume: number) => {
    setMasterVolume(volume);
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
            <div className="flex items-start gap-6">
              {/* Theme Buttons - Skeuomorphic hardware buttons */}
              <div className="flex flex-col gap-2">
                <span className="te-label text-[8px]">Theme</span>
                <div className="flex gap-2">
                  {(['default', 'medieval', 'riddim', 'vaporwave'] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => handleThemeVariantChange(theme)}
                      className={`te-button ${themeVariant === theme ? 'te-button-primary' : ''} px-3 py-2`}
                    >
                      {theme === 'default' ? 'DEF' : theme === 'medieval' ? 'MED' : theme === 'riddim' ? 'RID' : 'VAP'}
                    </button>
                  ))}
                </div>
              </div>
              {/* Skeuomorphic Mode Switch - aligned with buttons */}
              <div className="flex flex-col gap-2">
                <span className="te-label text-[8px]">Mode</span>
                <ColorModeSwitch mode={colorMode} onToggle={handleColorModeToggle} />
              </div>
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
          <div className="lg:col-span-3 flex flex-col gap-4">
            <StoreSelector value={store} onChange={handleStoreChange} />
            <div className="te-panel p-3">
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
          <div className="lg:col-span-4">
            <IntensityMeter intensity={intensity} />
          </div>

          {/* Right: Mixer */}
          <div className="lg:col-span-5">
            <Mixer engine={engineRef.current} />
          </div>
        </div>

        {/* Event Log and Video Section */}
        <div className="mt-4 flex flex-col lg:flex-row gap-4">
          {/* Event Log - Animates width between 66.67% and 100% */}
          <div
            style={{
              minHeight: '300px',
              width: '100%',
              maxWidth: themeVariant === 'default' ? '66.67%' : '100%',
              transition: 'max-width 1000ms cubic-bezier(0.4, 0.0, 0.2, 1)',
            }}
          >
            <EventLog events={events} maxEvents={8} />
          </div>

          {/* Video Section - Only for Default theme */}
          {themeVariant === 'default' && (
            <div
              className="slide-in-right"
              style={{
                width: '100%',
                maxWidth: '33.33%',
              }}
            >
              <VideoPlayer
                src="/videos/mac-demarco-garbage-funk.mp4"
                title="Mac DeMarco - Garbage Funk"
              />
            </div>
          )}
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
              <span className="te-label text-[8px]">v4.5</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
