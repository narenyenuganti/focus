export type SoundId =
  | "secret-discovered"
  | "item-get"
  | "chest-open"
  | "fairy-fountain"
  | "heart-container";

export const SOUND_LIBRARY: { id: SoundId; label: string }[] = [
  { id: "secret-discovered", label: "Secret Discovered" },
  { id: "item-get", label: "Item Get" },
  { id: "chest-open", label: "Chest Open" },
  { id: "fairy-fountain", label: "Fairy Fountain" },
  { id: "heart-container", label: "Heart Container" },
];

type Note = { freq: number; start: number; dur: number };

function playNotes(notes: Note[], wave: OscillatorType = "triangle", volume = 0.25) {
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.connect(ctx.destination);
  master.gain.setValueAtTime(volume, ctx.currentTime);

  for (const note of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = wave;
    osc.frequency.value = note.freq;
    gain.gain.setValueAtTime(0.3, ctx.currentTime + note.start);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + note.start + note.dur + 0.1);
    osc.connect(gain);
    gain.connect(master);
    osc.start(ctx.currentTime + note.start);
    osc.stop(ctx.currentTime + note.start + note.dur + 0.15);
  }

  const lastNote = notes[notes.length - 1];
  const totalDuration = lastNote.start + lastNote.dur + 0.5;
  setTimeout(() => void ctx.close(), totalDuration * 1000);
}

function playSecretDiscovered() {
  // Confirmed: G5 F#5 D#5 A4 | E5 G#5 C6
  // First 4 from D# diminished, last 3 are E augmented triad
  playNotes([
    { freq: 784, start: 0, dur: 0.12 },     // G5
    { freq: 740, start: 0.12, dur: 0.12 },  // F#5
    { freq: 622, start: 0.24, dur: 0.12 },  // D#5
    { freq: 440, start: 0.36, dur: 0.12 },  // A4
    { freq: 659, start: 0.48, dur: 0.12 },  // E5
    { freq: 831, start: 0.6, dur: 0.12 },   // G#5
    { freq: 1047, start: 0.72, dur: 0.45 }, // C6 (held)
  ]);
}

function playItemGet() {
  // Da da da DAAA — quick ascending G major arpeggio
  playNotes([
    { freq: 392, start: 0, dur: 0.08 },    // G4
    { freq: 494, start: 0.08, dur: 0.08 },  // B4
    { freq: 587, start: 0.16, dur: 0.08 },  // D5
    { freq: 784, start: 0.24, dur: 0.55 },  // G5 (held)
  ]);
}

function playChestOpen() {
  // Chromatic ascending pairs (Gb-E pattern) building tension
  playNotes(
    [
      { freq: 370, start: 0, dur: 0.1 },     // F#4
      { freq: 330, start: 0.1, dur: 0.1 },    // E4
      { freq: 392, start: 0.22, dur: 0.1 },   // G4
      { freq: 349, start: 0.32, dur: 0.1 },   // F4
      { freq: 415, start: 0.44, dur: 0.1 },   // G#4
      { freq: 370, start: 0.54, dur: 0.1 },   // F#4
      { freq: 440, start: 0.66, dur: 0.1 },   // A4
      { freq: 392, start: 0.76, dur: 0.1 },   // G4
      { freq: 466, start: 0.88, dur: 0.1 },   // Bb4
      { freq: 415, start: 0.98, dur: 0.1 },   // G#4
      { freq: 494, start: 1.1, dur: 0.1 },    // B4
      { freq: 440, start: 1.2, dur: 0.1 },    // A4
      { freq: 523, start: 1.32, dur: 0.5 },   // C5 (resolve)
    ],
    "square",
    0.15,
  );
}

function playFairyFountain() {
  // D minor arpeggio — A D G pattern, ethereal staccato
  playNotes(
    [
      { freq: 880, start: 0, dur: 0.15 },     // A5
      { freq: 587, start: 0.13, dur: 0.15 },  // D5
      { freq: 784, start: 0.26, dur: 0.15 },  // G5
      { freq: 587, start: 0.39, dur: 0.15 },  // D5
      { freq: 698, start: 0.52, dur: 0.15 },  // F5
      { freq: 587, start: 0.65, dur: 0.15 },  // D5
      { freq: 784, start: 0.78, dur: 0.15 },  // G5
      { freq: 587, start: 0.91, dur: 0.15 },  // D5
      { freq: 880, start: 1.04, dur: 0.15 },  // A5
      { freq: 587, start: 1.17, dur: 0.15 },  // D5
      { freq: 784, start: 1.3, dur: 0.15 },   // G5
      { freq: 587, start: 1.43, dur: 0.15 },  // D5
      { freq: 880, start: 1.56, dur: 0.35 },  // A5 (held)
    ],
    "sine",
    0.2,
  );
}

function playHeartContainer() {
  // Triumphant Bb major ascending resolution
  playNotes([
    { freq: 466, start: 0, dur: 0.15 },     // Bb4
    { freq: 587, start: 0.15, dur: 0.15 },  // D5
    { freq: 698, start: 0.3, dur: 0.15 },   // F5
    { freq: 932, start: 0.45, dur: 0.15 },  // Bb5
    { freq: 1175, start: 0.6, dur: 0.15 },  // D6
    { freq: 1397, start: 0.75, dur: 0.55 }, // F6 (held)
  ]);
}

const SOUND_MAP: Record<SoundId, () => void> = {
  "secret-discovered": playSecretDiscovered,
  "item-get": playItemGet,
  "chest-open": playChestOpen,
  "fairy-fountain": playFairyFountain,
  "heart-container": playHeartContainer,
};

export function playSound(id: SoundId) {
  const play = SOUND_MAP[id];
  if (play) play();
}
