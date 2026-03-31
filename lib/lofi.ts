// Lo-fi ambient music synthesizer using Web Audio API.
// Plays a gentle 4-chord pad loop at ~70 BPM with filtered warmth.

type LofiPlayer = {
  start: () => void;
  stop: () => void;
  isPlaying: boolean;
};

// Chord progression: Cmaj7 -> Am7 -> Fmaj7 -> G7
const CHORDS = [
  [261.63, 329.63, 392.0, 493.88], // Cmaj7
  [220.0, 261.63, 329.63, 392.0], // Am7
  [174.61, 220.0, 261.63, 329.63], // Fmaj7
  [196.0, 246.94, 293.66, 349.23], // G7
];

const CHORD_DURATION = 7.5; // seconds per chord (~70 BPM, 4 beats)
const LOOP_DURATION = CHORD_DURATION * CHORDS.length; // 30 seconds total
const VOLUME = 0.08;

// Call from a click handler to ensure AudioContext is allowed by the browser.
export function warmUpAudio(): void {
  if (typeof AudioContext === "undefined") return;
  try {
    const ctx = new AudioContext();
    const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
    void ctx.close();
  } catch {
    // Audio not available
  }
}

export function createLofiPlayer(): LofiPlayer {
  let ctx: AudioContext | null = null;
  let playing = false;
  let loopTimer: ReturnType<typeof setInterval> | null = null;
  let oscillators: OscillatorNode[] = [];

  function scheduleLoop() {
    if (!ctx || !playing) return;

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(VOLUME, now);
    master.connect(ctx.destination);

    // Low-pass filter for warmth
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(1, now);
    filter.connect(master);

    const newOscillators: OscillatorNode[] = [];

    for (let ci = 0; ci < CHORDS.length; ci++) {
      const chordStart = now + ci * CHORD_DURATION;
      const chord = CHORDS[ci];

      for (const freq of chord) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, chordStart);

        const noteGain = ctx.createGain();
        noteGain.gain.setValueAtTime(0, chordStart);
        noteGain.gain.linearRampToValueAtTime(0.3, chordStart + 0.8);
        noteGain.gain.linearRampToValueAtTime(0.25, chordStart + CHORD_DURATION - 0.5);
        noteGain.gain.linearRampToValueAtTime(0, chordStart + CHORD_DURATION);

        osc.connect(noteGain);
        noteGain.connect(filter);
        osc.start(chordStart);
        osc.stop(chordStart + CHORD_DURATION + 0.1);
        newOscillators.push(osc);
      }
    }

    oscillators = newOscillators;
  }

  const player: LofiPlayer = {
    get isPlaying() {
      return playing;
    },

    start() {
      if (playing) return;
      ctx = new AudioContext();
      playing = true;
      scheduleLoop();
      loopTimer = setInterval(() => scheduleLoop(), LOOP_DURATION * 1000);
    },

    stop() {
      playing = false;
      if (loopTimer) {
        clearInterval(loopTimer);
        loopTimer = null;
      }
      for (const osc of oscillators) {
        try {
          osc.stop();
        } catch {
          /* already stopped */
        }
      }
      oscillators = [];
      if (ctx) {
        void ctx.close();
        ctx = null;
      }
    },
  };

  return player;
}
