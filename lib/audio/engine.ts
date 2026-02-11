import * as Tone from 'tone';
import { StoreEvent } from '../events/types';
import { Voices, createAllVoices, disposeAllVoices } from './voices';
import { playEventSound } from './mappings';

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

      // Create all voice instruments
      this.voices = createAllVoices();

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

    // Play the appropriate sound
    playEventSound(event, this.voices);
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
