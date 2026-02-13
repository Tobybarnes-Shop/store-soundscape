import * as Tone from 'tone';
import { Voice, Voices } from '../../audio/voices';

// Transport reference for ambient loop
let ambientLoop: Tone.Loop | null = null;
let humPlayers: Tone.Player[] = [];

// PLUCK - Page Views (Piano slot)
function createPluckVoice(): Voice {
  const reverb = new Tone.Reverb({ decay: 4, wet: 0.5 }).toDestination();
  const chorus = new Tone.Chorus(2, 2.5, 0.5).connect(reverb);

  // Create multiple players for polyphony
  const players: Tone.Player[] = [];
  const playerCount = 4;

  for (let i = 0; i < playerCount; i++) {
    const player = new Tone.Player({
      url: '/samples/pluck.wav',
      onload: () => console.log('Pluck sample loaded')
    }).connect(chorus);
    player.volume.value = -10;
    players.push(player);
  }

  let currentPlayer = 0;

  return {
    name: 'pluck',
    play: ({ velocity = 0.8 } = {}) => {
      const player = players[currentPlayer];
      currentPlayer = (currentPlayer + 1) % playerCount;

      // Only play if buffer is loaded
      if (!player.loaded) return;

      // Random pitch shifting (-2 to +3 semitones)
      const pitchShift = Math.random() * 5 - 2;
      player.playbackRate = Math.pow(2, pitchShift / 12);

      // Adjust volume for velocity (temporarily)
      const baseVolume = -10;
      const velocityOffset = (velocity - 0.8) * 10;
      player.volume.value = baseVolume + velocityOffset;

      player.start(Tone.now());
    },
    dispose: () => {
      players.forEach(p => p.dispose());
      chorus.dispose();
      reverb.dispose();
    },
    setVolume: (volume: number) => {
      players.forEach(player => {
        player.volume.value = volume === 0 ? -Infinity : volume * 40 - 40;
      });
    },
  };
}

// HUM PAD - Ambient Background (Pad slot)
function createHumPadVoice(): Voice {
  const reverb = new Tone.Reverb({ decay: 6, wet: 0.7 }).toDestination();
  const filter = new Tone.Filter(800, 'lowpass').connect(reverb);

  const samples = [
    '/samples/hum%20-%20major.wav',
    '/samples/hum%20-%20sus2.wav',
    '/samples/hum%20-%20fifths.wav',
  ];

  const players: Tone.Player[] = [];
  samples.forEach(sample => {
    const player = new Tone.Player(sample).connect(filter);
    player.volume.value = -15;
    players.push(player);
  });

  let currentIndex = 0;

  return {
    name: 'humPad',
    play: ({ velocity = 0.5 } = {}) => {
      const player = players[currentIndex];
      currentIndex = (currentIndex + 1) % players.length;

      // Only play if buffer is loaded
      if (!player.loaded) return;

      // Long fade in/out
      player.fadeIn = 1;
      player.fadeOut = 2;

      // Adjust volume for velocity
      const baseVolume = -15;
      const velocityOffset = (velocity - 0.5) * 10;
      player.volume.value = baseVolume + velocityOffset;

      player.start(Tone.now());
    },
    dispose: () => {
      players.forEach(p => p.dispose());
      filter.dispose();
      reverb.dispose();
    },
    setVolume: (volume: number) => {
      players.forEach(player => {
        player.volume.value = volume === 0 ? -Infinity : volume * 40 - 40;
      });
    },
  };
}

// DELAY HAT - Rhythmic Accents (Percussion slot)
function createDelayHatVoice(): Voice {
  const delay = new Tone.PingPongDelay('4n', 0.5).toDestination();

  // Multiple players for rapid fire capability
  const players: Tone.Player[] = [];
  const playerCount = 3;

  for (let i = 0; i < playerCount; i++) {
    const player = new Tone.Player('/samples/delay%20hat.wav').connect(delay);
    player.volume.value = -12;
    players.push(player);
  }

  let currentPlayer = 0;

  return {
    name: 'delayHat',
    play: ({ velocity = 0.7 } = {}) => {
      const player = players[currentPlayer];
      currentPlayer = (currentPlayer + 1) % playerCount;

      // Only play if buffer is loaded
      if (!player.loaded) return;

      // Adjust volume for velocity
      const baseVolume = -12;
      const velocityOffset = (velocity - 0.7) * 10;
      player.volume.value = baseVolume + velocityOffset;

      player.start(Tone.now());
    },
    dispose: () => {
      players.forEach(p => p.dispose());
      delay.dispose();
    },
    setVolume: (volume: number) => {
      players.forEach(player => {
        player.volume.value = volume === 0 ? -Infinity : volume * 40 - 40;
      });
    },
  };
}

// PLUCK CHORD - Melodic Events (Arp slot)
function createPluckChordVoice(): Voice {
  const reverb = new Tone.Reverb({ decay: 5, wet: 0.6 }).toDestination();
  const chorus = new Tone.Chorus(4, 2, 0.3).connect(reverb);

  const samples = [
    '/samples/pluck%20-%20chord.wav',
    '/samples/pluck%20-%20jingle.wav',
    '/samples/pluckier%20-%20major.wav',
  ];

  const players: Tone.Player[] = [];
  samples.forEach(sample => {
    const player = new Tone.Player(sample).connect(chorus);
    player.volume.value = -8;
    players.push(player);
  });

  return {
    name: 'pluckChord',
    play: ({ value = 0, velocity = 0.7 } = {}) => {
      // Select sample based on event value
      let index = 0;
      if (value > 100) index = 2;      // High value: major chord
      else if (value > 50) index = 1;  // Mid value: jingle
      else index = 0;                  // Low/no value: chord

      const player = players[index];

      // Only play if buffer is loaded
      if (!player.loaded) return;

      // Slight detuning for shimmer effect
      player.playbackRate = 1 + (Math.random() * 0.04 - 0.02);

      // Adjust volume for velocity
      const baseVolume = -8;
      const velocityOffset = (velocity - 0.7) * 10;
      player.volume.value = baseVolume + velocityOffset;

      player.start(Tone.now());
    },
    dispose: () => {
      players.forEach(p => p.dispose());
      chorus.dispose();
      reverb.dispose();
    },
    setVolume: (volume: number) => {
      players.forEach(player => {
        player.volume.value = volume === 0 ? -Infinity : volume * 40 - 40;
      });
    },
  };
}

// HUM CHOIR - Orders (Choir slot)
function createHumChoirVoice(): Voice {
  const reverb = new Tone.Reverb({ decay: 8, wet: 0.8 }).toDestination();
  const chorus = new Tone.Chorus(3, 4, 0.4).connect(reverb);
  const vibrato = new Tone.Vibrato(4, 0.2).connect(chorus);

  // Two samples layered for richness
  const player1 = new Tone.Player('/samples/hum%20-%20maj7.wav').connect(vibrato);
  const player2 = new Tone.Player('/samples/hum%20-%20fourths.wav').connect(vibrato);

  player1.volume.value = -11;
  player2.volume.value = -11;

  return {
    name: 'humChoir',
    play: ({ velocity = 0.6 } = {}) => {
      // Only play if buffers are loaded
      if (!player1.loaded || !player2.loaded) return;

      const now = Tone.now();

      // Adjust volume for velocity
      const baseVolume = -11;
      const velocityOffset = (velocity - 0.6) * 10;
      player1.volume.value = baseVolume + velocityOffset;
      player2.volume.value = baseVolume + velocityOffset;

      // Trigger both samples with slight offset for thickness
      player1.start(now);
      player2.start(now + 0.02);
    },
    dispose: () => {
      player1.dispose();
      player2.dispose();
      vibrato.dispose();
      chorus.dispose();
      reverb.dispose();
    },
    setVolume: (volume: number) => {
      const volumeDb = volume === 0 ? -Infinity : volume * 40 - 40;
      player1.volume.value = volumeDb;
      player2.volume.value = volumeDb;
    },
  };
}

// ERROR GLITCH - Error Alerts (Alert slot)
function createErrorGlitchVoice(): Voice {
  const distortion = new Tone.Distortion(0.4).toDestination();
  const bitcrusher = new Tone.BitCrusher(4).connect(distortion);

  // Two players for forward and reverse
  const playerForward = new Tone.Player('/samples/error.wav').connect(bitcrusher);
  const playerReverse = new Tone.Player('/samples/error.wav').connect(bitcrusher);

  playerForward.volume.value = -6;
  playerReverse.volume.value = -6;
  playerReverse.reverse = true;

  return {
    name: 'errorGlitch',
    play: ({ velocity = 0.9 } = {}) => {
      // 50% chance to reverse
      const useReverse = Math.random() > 0.5;
      const player = useReverse ? playerReverse : playerForward;

      // Only play if buffer is loaded
      if (!player.loaded) return;

      // Adjust volume for velocity
      const baseVolume = -6;
      const velocityOffset = (velocity - 0.9) * 10;
      player.volume.value = baseVolume + velocityOffset;

      player.start(Tone.now());
    },
    dispose: () => {
      playerForward.dispose();
      playerReverse.dispose();
      bitcrusher.dispose();
      distortion.dispose();
    },
    setVolume: (volume: number) => {
      const volumeDb = volume === 0 ? -Infinity : volume * 40 - 40;
      playerForward.volume.value = volumeDb;
      playerReverse.volume.value = volumeDb;
    },
  };
}

// Create all vaporwave voices
export function createVaporwaveVoices(): Voices {
  return {
    piano: createPluckVoice(),
    pad: createHumPadVoice(),
    percussion: createDelayHatVoice(),
    arp: createPluckChordVoice(),
    choir: createHumChoirVoice(),
    alert: createErrorGlitchVoice(),
  };
}

// Sparse ambient loop - occasional hum swells
export function startVaporwaveAmbient(): void {
  // Set slow, dreamy tempo
  Tone.getTransport().bpm.value = 65;

  // Load hum samples for ambient swells
  const ambientSamples = [
    '/samples/hum.wav',
    '/samples/hum%20-%20V.wav',
    '/samples/hum%20-%20IV.wav',
  ];

  humPlayers = ambientSamples.map(sample => {
    const reverb = new Tone.Reverb({ decay: 10, wet: 0.9 }).toDestination();
    const filter = new Tone.Filter(600, 'lowpass').connect(reverb);
    const player = new Tone.Player(sample).connect(filter);
    player.volume.value = -20; // Very quiet, atmospheric
    player.fadeIn = 3;
    player.fadeOut = 4;
    return player;
  });

  // Random ambient swells every 20-40 seconds
  ambientLoop = new Tone.Loop((time) => {
    if (humPlayers.length === 0) return;

    // Randomly select a hum sample
    const randomIndex = Math.floor(Math.random() * humPlayers.length);
    const player = humPlayers[randomIndex];

    // Only play if buffer is loaded
    if (player.loaded) {
      player.start(time);
    }
  }, '16m'); // Very long interval (16 measures ≈ 60 seconds at 65 BPM)

  ambientLoop.start(0);
  Tone.getTransport().start();
}

// Stop ambient loop
export function stopVaporwaveAmbient(): void {
  if (ambientLoop) {
    ambientLoop.stop();
    ambientLoop.dispose();
    ambientLoop = null;
  }

  humPlayers.forEach(player => player.dispose());
  humPlayers = [];

  Tone.getTransport().stop();
}
