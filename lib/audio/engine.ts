import * as Tone from 'tone';
import { StoreEvent } from '../events/types';
import { Voices, disposeAllVoices } from './voices';
import { EventSoundMapping } from './mappings';
import { ThemeVariant, getTheme } from '../themes';

export type AudioEngineState = 'stopped' | 'starting' | 'running';

export interface AudioEngineCallbacks {
  onStateChange?: (state: AudioEngineState) => void;
  onIntensityChange?: (intensity: number) => void;
}

export class AudioEngine {
  private voices: Voices | null = null;
  private state: AudioEngineState = 'stopped';
  private callbacks: AudioEngineCallbacks;
  private recentEvents: number[] = [];
  private intensityInterval: ReturnType<typeof setInterval> | null = null;
  private currentTheme: ThemeVariant = 'default';
  private mappings: EventSoundMapping[] = [];

  constructor(callbacks: AudioEngineCallbacks = {}) {
    this.callbacks = callbacks;
  }

  getState(): AudioEngineState {
    return this.state;
  }

  private setState(state: AudioEngineState): void {
    this.state = state;
    this.callbacks.onStateChange?.(state);
  }

  async start(): Promise<void> {
    if (this.state !== 'stopped') return;

    this.setState('starting');

    try {
      // Start Tone.js audio context (requires user gesture)
      await Tone.start();

      // Create voice instruments for current theme
      const theme = getTheme(this.currentTheme);
      this.voices = theme.audio.createVoices();
      this.mappings = theme.audio.mappings;

      // Start ambient loops if theme has them
      if (theme.audio.startAmbient) {
        theme.audio.startAmbient();
      }

      // Start intensity monitoring
      this.startIntensityMonitoring();

      this.setState('running');
    } catch (error) {
      console.error('Failed to start audio engine:', error);
      this.setState('stopped');
      throw error;
    }
  }

  stop(): void {
    if (this.state === 'stopped') return;

    // Stop ambient loops
    const theme = getTheme(this.currentTheme);
    if (theme.audio.stopAmbient) {
      theme.audio.stopAmbient();
    }

    // Stop intensity monitoring
    if (this.intensityInterval) {
      clearInterval(this.intensityInterval);
      this.intensityInterval = null;
    }

    // Dispose all voices
    if (this.voices) {
      disposeAllVoices(this.voices);
      this.voices = null;
    }

    this.recentEvents = [];
    this.setState('stopped');
  }

  playEvent(event: StoreEvent): void {
    if (this.state !== 'running' || !this.voices) return;

    // Track event for intensity calculation
    this.recentEvents.push(Date.now());

    // Play the appropriate sound using current theme's mappings
    const mapping = this.mappings.find((m) => m.type === event.type);
    if (mapping) {
      mapping.handler(event, this.voices);
    }
  }

  private startIntensityMonitoring(): void {
    this.intensityInterval = setInterval(() => {
      const intensity = this.calculateIntensity();
      this.callbacks.onIntensityChange?.(intensity);
    }, 100);
  }

  private calculateIntensity(): number {
    const now = Date.now();
    const windowMs = 5000; // 5 second window

    // Remove old events
    this.recentEvents = this.recentEvents.filter((t) => now - t < windowMs);

    // Calculate intensity based on events per second
    // 0 events = 0, 10+ events in 5 seconds = 1
    const eventsPerSecond = this.recentEvents.length / (windowMs / 1000);
    return Math.min(eventsPerSecond / 2, 1);
  }

  setVolume(volume: number): void {
    // Volume in dB, -60 to 0
    const db = volume * 60 - 60;
    Tone.getDestination().volume.value = db;
  }

  setVoiceVolume(voiceName: string, volume: number): void {
    if (!this.voices) return;
    const voice = this.voices[voiceName as keyof Voices];
    if (voice && 'setVolume' in voice) {
      (voice as { setVolume: (v: number) => void }).setVolume(volume);
    }
  }

  getVoices(): Voices | null {
    return this.voices;
  }

  switchTheme(themeVariant: ThemeVariant): void {
    const wasRunning = this.state === 'running';

    // Stop old theme's ambient
    if (wasRunning) {
      const oldTheme = getTheme(this.currentTheme);
      if (oldTheme.audio.stopAmbient) {
        oldTheme.audio.stopAmbient();
      }
    }

    this.currentTheme = themeVariant;

    // If engine is running, hot-swap the voices
    if (wasRunning && this.voices) {
      // Dispose old voices
      disposeAllVoices(this.voices);

      // Create new voices for the theme
      const theme = getTheme(themeVariant);
      this.voices = theme.audio.createVoices();
      this.mappings = theme.audio.mappings;

      // Start new theme's ambient
      if (theme.audio.startAmbient) {
        theme.audio.startAmbient();
      }
    }
  }

  getCurrentTheme(): ThemeVariant {
    return this.currentTheme;
  }
}

// Singleton instance for use across the app
let engineInstance: AudioEngine | null = null;

export function getAudioEngine(callbacks?: AudioEngineCallbacks): AudioEngine {
  if (!engineInstance) {
    engineInstance = new AudioEngine(callbacks);
  } else if (callbacks) {
    // Update callbacks if provided
    Object.assign(engineInstance['callbacks'], callbacks);
  }
  return engineInstance;
}
