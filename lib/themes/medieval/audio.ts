import * as Tone from 'tone';
import { Voice, Voices } from '../../audio/voices';

// LUTE - Plucked string instrument for page views
function createLuteVoice(): Voice {
  const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.35 }).toDestination();
  const filter = new Tone.Filter(2800, 'lowpass').connect(reverb);
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: {
      attack: 0.005,
      decay: 0.4,
      sustain: 0.1,
      release: 0.8,
    },
  }).connect(filter);

  synth.volume.value = -10;

  return {
    name: 'lute',
    play: ({ note = 'D3', duration = '8n', velocity = 0.25 } = {}) => {
      synth.triggerAttackRelease(note, duration, Tone.now(), velocity);
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

// FLUTE - Woodwind for searches
function createFluteVoice(): Voice {
  const reverb = new Tone.Reverb({ decay: 3.5, wet: 0.5 }).toDestination();
  const tremolo = new Tone.Tremolo(4, 0.15).connect(reverb);
  const filter = new Tone.Filter(400, 'highpass').connect(tremolo);
  const synth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.08,
      decay: 0.2,
      sustain: 0.6,
      release: 0.4,
    },
  }).connect(filter);

  synth.volume.value = -12;
  tremolo.start();

  const fluteNotes = ['G4', 'A4', 'B4', 'D5', 'E5'];

  return {
    name: 'flute',
    play: ({ velocity = 0.5 } = {}) => {
      const now = Tone.now();
      fluteNotes.forEach((note, i) => {
        synth.triggerAttackRelease(note, '16n', now + i * 0.08, velocity);
      });
    },
    dispose: () => {
      synth.dispose();
      filter.dispose();
      tremolo.dispose();
      reverb.dispose();
    },
    setVolume: (volume: number) => {
      synth.volume.value = volume === 0 ? -Infinity : volume * 40 - 40;
    },
  };
}

// HARP - Plucked strings for add-to-cart
function createHarpVoice(): Voice {
  const reverb = new Tone.Reverb({ decay: 5, wet: 0.65 }).toDestination();
  const chorus = new Tone.Chorus(3, 0.4, 0.4).connect(reverb);
  const filter = new Tone.Filter(300, 'highpass').connect(chorus);
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: {
      attack: 0.01,
      decay: 0.6,
      sustain: 0.4,
      release: 2.0,
    },
  }).connect(filter);

  synth.volume.value = -8;
  chorus.start();

  return {
    name: 'harp',
    play: ({ velocity = 0.5 } = {}) => {
      const now = Tone.now();
      const notes = ['C4', 'E4', 'G4'];
      notes.forEach((note, i) => {
        synth.triggerAttackRelease(note, '2n', now + i * 0.1, velocity);
      });
    },
    dispose: () => {
      synth.dispose();
      filter.dispose();
      chorus.dispose();
      reverb.dispose();
    },
    setVolume: (volume: number) => {
      synth.volume.value = volume === 0 ? -Infinity : volume * 40 - 40;
    },
  };
}

// BODHRÁN - Frame drum for rhythm accents
function createBodhranVoice(): Voice {
  const reverb = new Tone.Reverb({ decay: 1.8, wet: 0.25 }).toDestination();
  const filter = new Tone.Filter(600, 'lowpass').connect(reverb);
  const drum = new Tone.MembraneSynth({
    pitchDecay: 0.08,
    octaves: 6,
    envelope: {
      attack: 0.001,
      decay: 0.6,
      sustain: 0.02,
      release: 0.4,
    },
  }).connect(filter);

  drum.volume.value = -14;

  return {
    name: 'bodhran',
    play: ({ velocity = 0.6 } = {}) => {
      drum.triggerAttackRelease('D2', '8n', Tone.now(), velocity);
    },
    dispose: () => {
      drum.dispose();
      filter.dispose();
      reverb.dispose();
    },
    setVolume: (volume: number) => {
      drum.volume.value = volume === 0 ? -Infinity : volume * 40 - 40;
    },
  };
}

// CHOIR - Vocal harmony for orders
function createMedievalChoirVoice(): Voice {
  const reverb = new Tone.Reverb({ decay: 7, wet: 0.75 }).toDestination();
  const vibrato = new Tone.Vibrato(5, 0.08).connect(reverb);
  const chorus = new Tone.Chorus(2, 0.6, 0.6).connect(vibrato);
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.8,
      decay: 0.6,
      sustain: 0.85,
      release: 2.5,
    },
  }).connect(chorus);

  synth.volume.value = -9;
  chorus.start();

  return {
    name: 'choir',
    play: ({ duration = '1n', velocity = 0.6, value = 0 } = {}) => {
      const notes = value && value > 100
        ? ['C4', 'E4', 'G4', 'C5']
        : ['C4', 'E4', 'G4'];
      synth.triggerAttackRelease(notes, duration, Tone.now(), velocity);
    },
    dispose: () => {
      synth.dispose();
      chorus.dispose();
      vibrato.dispose();
      reverb.dispose();
    },
    setVolume: (volume: number) => {
      synth.volume.value = volume === 0 ? -Infinity : volume * 40 - 40;
    },
  };
}

// BATTLE HORN - Brass warning for errors
function createBattleHornVoice(): Voice {
  const reverb = new Tone.Reverb({ decay: 2, wet: 0.3 }).toDestination();
  const distortion = new Tone.Distortion(0.3).connect(reverb);
  const filter = new Tone.Filter(1800, 'lowpass').connect(distortion);
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: {
      attack: 0.02,
      decay: 0.3,
      sustain: 0.6,
      release: 0.4,
    },
  }).connect(filter);

  synth.volume.value = -6;

  return {
    name: 'horn',
    play: ({ velocity = 0.8 } = {}) => {
      const now = Tone.now();
      synth.triggerAttackRelease('D3', '8n', now, velocity);
      synth.triggerAttackRelease('Eb3', '8n', now, velocity * 0.9);
      setTimeout(() => {
        synth.triggerAttackRelease('D3', '8n', Tone.now(), velocity * 0.9);
        synth.triggerAttackRelease('Eb3', '8n', Tone.now(), velocity * 0.8);
      }, 250);
    },
    dispose: () => {
      synth.dispose();
      filter.dispose();
      distortion.dispose();
      reverb.dispose();
    },
    setVolume: (volume: number) => {
      synth.volume.value = volume === 0 ? -Infinity : volume * 40 - 40;
    },
  };
}

export function createMedievalVoices(): Voices {
  return {
    piano: createLuteVoice(),      // Maps to piano slot
    pad: createHarpVoice(),         // Maps to pad slot
    percussion: createBodhranVoice(), // Maps to percussion slot
    arp: createFluteVoice(),        // Maps to arp slot
    choir: createMedievalChoirVoice(), // Maps to choir slot
    alert: createBattleHornVoice(), // Maps to alert slot
  };
}
