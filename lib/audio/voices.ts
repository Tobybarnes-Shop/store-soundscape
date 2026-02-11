import * as Tone from 'tone';

export interface Voice {
  name: string;
  play: (options?: { note?: string; duration?: string; velocity?: number; value?: number }) => void;
  dispose: () => void;
  setVolume: (volume: number) => void;
}

// Piano voice for ambient baseline and orders
export function createPianoVoice(): Voice {
  const reverb = new Tone.Reverb({ decay: 4, wet: 0.5 }).toDestination();
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: {
      attack: 0.02,
      decay: 0.3,
      sustain: 0.2,
      release: 1.5,
    },
  }).connect(reverb);

  synth.volume.value = -8;

  return {
    name: 'piano',
    play: ({ note = 'C4', duration = '4n', velocity = 0.7 } = {}) => {
      synth.triggerAttackRelease(note, duration, Tone.now(), velocity);
    },
    dispose: () => {
      synth.dispose();
      reverb.dispose();
    },
    setVolume: (volume: number) => {
      synth.volume.value = volume === 0 ? -Infinity : volume * 40 - 40; // mute at 0, otherwise -40 to 0 dB
    },
  };
}

// Pad voice for page views and texture
export function createPadVoice(): Voice {
  const reverb = new Tone.Reverb({ decay: 6, wet: 0.7 }).toDestination();
  const filter = new Tone.Filter(800, 'lowpass').connect(reverb);
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.5,
      decay: 0.5,
      sustain: 0.8,
      release: 2,
    },
  }).connect(filter);

  synth.volume.value = -12;

  return {
    name: 'pad',
    play: ({ note = 'C3', duration = '2n', velocity = 0.4 } = {}) => {
      synth.triggerAttackRelease(note, duration, Tone.now(), velocity);
    },
    dispose: () => {
      synth.dispose();
      filter.dispose();
      reverb.dispose();
    },
    setVolume: (volume: number) => {
      synth.volume.value = volume * 30 - 30;
    },
  };
}

// Percussion voice for add-to-cart
export function createPercussionVoice(): Voice {
  const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.3 }).toDestination();
  const metalSynth = new Tone.MetalSynth({
    envelope: {
      attack: 0.001,
      decay: 0.4,
      release: 0.2,
    },
    harmonicity: 5.1,
    modulationIndex: 16,
    resonance: 4000,
    octaves: 1.5,
  }).connect(reverb);

  metalSynth.volume.value = -18;

  return {
    name: 'percussion',
    play: ({ velocity = 0.6 } = {}) => {
      metalSynth.triggerAttackRelease('16n', Tone.now(), velocity);
    },
    dispose: () => {
      metalSynth.dispose();
      reverb.dispose();
    },
    setVolume: (volume: number) => {
      metalSynth.volume.value = volume * 30 - 30;
    },
  };
}

// Arp voice for searches
export function createArpVoice(): Voice {
  const delay = new Tone.FeedbackDelay('8n', 0.3).toDestination();
  const reverb = new Tone.Reverb({ decay: 2, wet: 0.4 }).connect(delay);
  const synth = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.1,
      release: 0.3,
    },
  }).connect(reverb);

  synth.volume.value = -14;

  const arpNotes = ['C5', 'E5', 'G5', 'B5', 'C6'];

  return {
    name: 'arp',
    play: ({ velocity = 0.5 } = {}) => {
      const now = Tone.now();
      arpNotes.forEach((note, i) => {
        synth.triggerAttackRelease(note, '16n', now + i * 0.08, velocity);
      });
    },
    dispose: () => {
      synth.dispose();
      delay.dispose();
      reverb.dispose();
    },
    setVolume: (volume: number) => {
      synth.volume.value = volume * 30 - 30;
    },
  };
}

// Choir voice for high-value moments (using synth pad as placeholder)
export function createChoirVoice(): Voice {
  const reverb = new Tone.Reverb({ decay: 8, wet: 0.8 }).toDestination();
  const chorus = new Tone.Chorus(4, 2.5, 0.5).connect(reverb);
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: {
      attack: 1,
      decay: 1,
      sustain: 0.9,
      release: 3,
    },
  }).connect(chorus);

  synth.volume.value = -10;
  chorus.start();

  return {
    name: 'choir',
    play: ({ note = 'C4', duration = '1n', velocity = 0.6, value = 0 } = {}) => {
      // For high-value orders, play a chord
      const notes = value && value > 200
        ? ['C4', 'E4', 'G4', 'C5']
        : ['C4', 'E4', 'G4'];
      synth.triggerAttackRelease(notes, duration, Tone.now(), velocity);
    },
    dispose: () => {
      synth.dispose();
      chorus.dispose();
      reverb.dispose();
    },
    setVolume: (volume: number) => {
      synth.volume.value = volume * 30 - 30;
    },
  };
}

// Alert voice for errors - attention-grabbing dissonant sound
export function createAlertVoice(): Voice {
  const reverb = new Tone.Reverb({ decay: 1, wet: 0.2 }).toDestination();
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.3,
      release: 0.5,
    },
  }).connect(reverb);

  synth.volume.value = -6;

  return {
    name: 'alert',
    play: ({ velocity = 0.7 } = {}) => {
      const now = Tone.now();
      // Dissonant interval - minor second
      synth.triggerAttackRelease('E4', '8n', now, velocity);
      synth.triggerAttackRelease('F4', '8n', now, velocity * 0.9);
      // Second hit
      setTimeout(() => {
        synth.triggerAttackRelease('E4', '8n', Tone.now(), velocity * 0.8);
        synth.triggerAttackRelease('F4', '8n', Tone.now(), velocity * 0.7);
      }, 200);
    },
    dispose: () => {
      synth.dispose();
      reverb.dispose();
    },
    setVolume: (volume: number) => {
      synth.volume.value = volume * 30 - 30;
    },
  };
}

export interface Voices {
  piano: Voice;
  pad: Voice;
  percussion: Voice;
  arp: Voice;
  choir: Voice;
  alert: Voice;
}

export function createAllVoices(): Voices {
  return {
    piano: createPianoVoice(),
    pad: createPadVoice(),
    percussion: createPercussionVoice(),
    arp: createArpVoice(),
    choir: createChoirVoice(),
    alert: createAlertVoice(),
  };
}

export function disposeAllVoices(voices: Voices): void {
  Object.values(voices).forEach((voice) => voice.dispose());
}
