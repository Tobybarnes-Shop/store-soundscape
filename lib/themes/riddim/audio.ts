import * as Tone from 'tone';
import { Voice, Voices } from '../../audio/voices';

// SUB-BASS - Deep bass for foundation
function createSubBassVoice(): Voice {
  const filter = new Tone.Filter(150, 'lowpass').toDestination();
  const synth = new Tone.MonoSynth({
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.02,
      decay: 0.3,
      sustain: 0.7,
      release: 0.8,
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.5,
      release: 0.5,
      baseFrequency: 100,
      octaves: 2,
    },
  }).connect(filter);

  synth.volume.value = -6;

  return {
    name: 'bass',
    play: ({ note = 'A1', duration = '4n', velocity = 0.8 } = {}) => {
      synth.triggerAttackRelease(note, duration, Tone.now(), velocity);
    },
    dispose: () => {
      synth.dispose();
      filter.dispose();
    },
    setVolume: (volume: number) => {
      synth.volume.value = volume === 0 ? -Infinity : volume * 40 - 40;
    },
  };
}

// SKANK GUITAR - Rhythm guitar on offbeat
function createSkankVoice(): Voice {
  const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.2 }).toDestination();
  const filter = new Tone.Filter(1200, 'highpass').connect(reverb);
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: {
      attack: 0.001,
      decay: 0.08,
      sustain: 0.05,
      release: 0.1,
    },
  }).connect(filter);

  synth.volume.value = -10;

  return {
    name: 'skank',
    play: ({ velocity = 0.6 } = {}) => {
      const now = Tone.now();
      const chord = ['A3', 'C#4', 'E4'];
      synth.triggerAttackRelease(chord, '16n', now, velocity);
    },
    dispose: () => {
      synth.dispose();
      filter.dispose();
      reverb.dispose();
    },
    setVolume: (volume: number) => {
      synth.volume.value = volume === 0 ? -Infinity : volume * 40 - 40;
    },
  };
}

// HAMMOND ORGAN - Classic reggae organ
function createOrganVoice(): Voice {
  const reverb = new Tone.Reverb({ decay: 3, wet: 0.4 }).toDestination();
  const vibrato = new Tone.Vibrato(6, 0.1).connect(reverb);
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.02,
      decay: 0.2,
      sustain: 0.7,
      release: 0.5,
    },
  }).connect(vibrato);

  synth.volume.value = -12;

  return {
    name: 'organ',
    play: ({ note = 'A3', duration = '2n', velocity = 0.5 } = {}) => {
      synth.triggerAttackRelease(note, duration, Tone.now(), velocity);
    },
    dispose: () => {
      synth.dispose();
      vibrato.dispose();
      reverb.dispose();
    },
    setVolume: (volume: number) => {
      synth.volume.value = volume === 0 ? -Infinity : volume * 40 - 40;
    },
  };
}

// MELODICA - Lead melody instrument
function createMelodicaVoice(): Voice {
  const delay = new Tone.FeedbackDelay('8n', 0.4).toDestination();
  const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.5 }).connect(delay);
  const synth = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: {
      attack: 0.02,
      decay: 0.2,
      sustain: 0.5,
      release: 0.4,
    },
  }).connect(reverb);

  synth.volume.value = -14;

  const melodicaNotes = ['A4', 'C5', 'D5', 'E5', 'G5'];

  return {
    name: 'melodica',
    play: ({ velocity = 0.5 } = {}) => {
      const now = Tone.now();
      melodicaNotes.forEach((note, i) => {
        synth.triggerAttackRelease(note, '16n', now + i * 0.1, velocity);
      });
    },
    dispose: () => {
      synth.dispose();
      reverb.dispose();
      delay.dispose();
    },
    setVolume: (volume: number) => {
      synth.volume.value = volume === 0 ? -Infinity : volume * 40 - 40;
    },
  };
}

// HORNS - Brass section stabs
function createHornsVoice(): Voice {
  const reverb = new Tone.Reverb({ decay: 2, wet: 0.3 }).toDestination();
  const filter = new Tone.Filter(1500, 'lowpass').connect(reverb);
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: {
      attack: 0.05,
      decay: 0.3,
      sustain: 0.6,
      release: 0.4,
    },
  }).connect(filter);

  synth.volume.value = -8;

  return {
    name: 'horns',
    play: ({ duration = '4n', velocity = 0.7, value = 0 } = {}) => {
      const notes = value && value > 200
        ? ['A3', 'C#4', 'E4', 'A4']
        : ['A3', 'C#4', 'E4'];
      synth.triggerAttackRelease(notes, duration, Tone.now(), velocity);
    },
    dispose: () => {
      synth.dispose();
      filter.dispose();
      reverb.dispose();
    },
    setVolume: (volume: number) => {
      synth.volume.value = volume === 0 ? -Infinity : volume * 40 - 40;
    },
  };
}

// DUB SIREN - Warning/alert effect with heavy delay
function createDubSirenVoice(): Voice {
  const delay = new Tone.FeedbackDelay('8n', 0.6).toDestination();
  const reverb = new Tone.Reverb({ decay: 3, wet: 0.5 }).connect(delay);
  const filter = new Tone.Filter(2000, 'lowpass').connect(reverb);
  const synth = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: {
      attack: 0.01,
      decay: 0.4,
      sustain: 0.3,
      release: 0.6,
    },
  }).connect(filter);

  synth.volume.value = -8;

  return {
    name: 'siren',
    play: ({ velocity = 0.8 } = {}) => {
      const now = Tone.now();
      // Siren sweep effect
      synth.triggerAttackRelease('G3', '8n', now, velocity);
      setTimeout(() => {
        synth.triggerAttackRelease('E3', '8n', Tone.now(), velocity * 0.9);
      }, 150);
      setTimeout(() => {
        synth.triggerAttackRelease('C3', '8n', Tone.now(), velocity * 0.8);
      }, 300);
    },
    dispose: () => {
      synth.dispose();
      filter.dispose();
      reverb.dispose();
      delay.dispose();
    },
    setVolume: (volume: number) => {
      synth.volume.value = volume === 0 ? -Infinity : volume * 40 - 40;
    },
  };
}

// Ambient bassline and drum machine
let basslineLoop: Tone.Loop | null = null;
let drumLoop: Tone.Loop | null = null;
let basslineSynth: Tone.MonoSynth | null = null;
let kickDrum: Tone.MembraneSynth | null = null;
let snareDrum: Tone.NoiseSynth | null = null;
let hiHat: Tone.MetalSynth | null = null;

export function startRiddimAmbient(): void {
  if (basslineLoop) return; // Already running

  // Set reggae tempo
  Tone.getTransport().bpm.value = 85; // Reggae tempo

  // Create bassline synth
  const bassFilter = new Tone.Filter(150, 'lowpass').toDestination();
  basslineSynth = new Tone.MonoSynth({
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.02,
      decay: 0.3,
      sustain: 0.7,
      release: 0.8,
    },
  }).connect(bassFilter);
  basslineSynth.volume.value = -12; // Louder bass

  // Create drum synths
  kickDrum = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 6,
    envelope: {
      attack: 0.001,
      decay: 0.4,
      sustain: 0.01,
      release: 0.3,
    },
  }).toDestination();
  kickDrum.volume.value = -14; // Louder kick

  const snareFilter = new Tone.Filter(3000, 'highpass').toDestination();
  snareDrum = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: {
      attack: 0.001,
      decay: 0.15,
      sustain: 0,
    },
  }).connect(snareFilter);
  snareDrum.volume.value = -18; // Louder snare

  const hiHatFilter = new Tone.Filter(8000, 'highpass').toDestination();
  hiHat = new Tone.MetalSynth({
    envelope: {
      attack: 0.001,
      decay: 0.05,
      release: 0.02,
    },
    harmonicity: 10,
    modulationIndex: 40,
    resonance: 3000,
    octaves: 0.5,
  }).connect(hiHatFilter);
  hiHat.volume.value = -22; // Louder hi-hat

  // Reggae bassline pattern (one-drop rhythm)
  const bassPattern = ['A1', 'A1', 'C2', 'A1', 'G1', 'A1', 'F1', 'A1'];
  let bassIndex = 0;

  basslineLoop = new Tone.Loop((time) => {
    if (basslineSynth) {
      basslineSynth.triggerAttackRelease(bassPattern[bassIndex % bassPattern.length], '8n', time, 0.8);
      bassIndex++;
    }
  }, '8n');

  // One-drop drum pattern (kick on 3, snare on 2 and 4)
  let drumStep = 0;
  drumLoop = new Tone.Loop((time) => {
    if (drumStep % 4 === 2) {
      // Kick on beat 3
      kickDrum?.triggerAttackRelease('C1', '8n', time, 0.9);
    }
    if (drumStep % 4 === 1 || drumStep % 4 === 3) {
      // Snare on beats 2 and 4
      snareDrum?.triggerAttack(time, 0.6);
    }
    // Hi-hat on offbeats
    if (drumStep % 2 === 1) {
      hiHat?.triggerAttackRelease('16n', time, 0.3);
    }
    drumStep++;
  }, '8n');

  // Start loops and transport
  basslineLoop.start(0);
  drumLoop.start(0);

  // Ensure transport is running
  if (Tone.getTransport().state !== 'started') {
    Tone.getTransport().start();
  }
}

export function stopRiddimAmbient(): void {
  // Stop and dispose loops
  if (basslineLoop) {
    basslineLoop.stop();
    basslineLoop.dispose();
    basslineLoop = null;
  }
  if (drumLoop) {
    drumLoop.stop();
    drumLoop.dispose();
    drumLoop = null;
  }

  // Dispose synths
  if (basslineSynth) {
    basslineSynth.dispose();
    basslineSynth = null;
  }
  if (kickDrum) {
    kickDrum.dispose();
    kickDrum = null;
  }
  if (snareDrum) {
    snareDrum.dispose();
    snareDrum = null;
  }
  if (hiHat) {
    hiHat.dispose();
    hiHat = null;
  }

  // Don't stop the transport - just stop our loops
  // Other themes or sounds might be using it
}

export function createRiddimVoices(): Voices {
  return {
    piano: createSubBassVoice(),    // Maps to piano slot
    pad: createOrganVoice(),        // Maps to pad slot
    percussion: createSkankVoice(), // Maps to percussion slot
    arp: createMelodicaVoice(),     // Maps to arp slot
    choir: createHornsVoice(),      // Maps to choir slot
    alert: createDubSirenVoice(),   // Maps to alert slot
  };
}
