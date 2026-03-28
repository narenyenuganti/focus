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
  // G5 F#5 D#5 A4 G#4 E5 G#5 C6
  playNotes([
    { freq: 784, start: 0, dur: 0.12 },
    { freq: 740, start: 0.12, dur: 0.12 },
    { freq: 622, start: 0.24, dur: 0.12 },
    { freq: 440, start: 0.36, dur: 0.12 },
    { freq: 415, start: 0.48, dur: 0.12 },
    { freq: 659, start: 0.6, dur: 0.12 },
    { freq: 831, start: 0.72, dur: 0.12 },
    { freq: 1047, start: 0.84, dur: 0.4 },
  ]);
}

function playItemGet() {
  // Quick ascending fanfare: D5 A5 D6
  playNotes([
    { freq: 587, start: 0, dur: 0.1 },
    { freq: 880, start: 0.1, dur: 0.1 },
    { freq: 1175, start: 0.2, dur: 0.5 },
  ]);
}

function playChestOpen() {
  // Slow dramatic build: G4 G#4 A4 A#4 B4 C5 ... up to E5
  playNotes(
    [
      { freq: 392, start: 0, dur: 0.15 },
      { freq: 415, start: 0.15, dur: 0.15 },
      { freq: 440, start: 0.3, dur: 0.15 },
      { freq: 466, start: 0.45, dur: 0.15 },
      { freq: 494, start: 0.6, dur: 0.15 },
      { freq: 523, start: 0.75, dur: 0.15 },
      { freq: 554, start: 0.9, dur: 0.15 },
      { freq: 587, start: 1.05, dur: 0.15 },
      { freq: 622, start: 1.2, dur: 0.15 },
      { freq: 659, start: 1.35, dur: 0.6 },
    ],
    "square",
    0.15,
  );
}

function playFairyFountain() {
  // Gentle arpeggio: A4 C#5 E5 A5 E5 C#5 A4 (cycled)
  playNotes(
    [
      { freq: 440, start: 0, dur: 0.18 },
      { freq: 554, start: 0.15, dur: 0.18 },
      { freq: 659, start: 0.3, dur: 0.18 },
      { freq: 880, start: 0.45, dur: 0.22 },
      { freq: 659, start: 0.65, dur: 0.18 },
      { freq: 554, start: 0.8, dur: 0.18 },
      { freq: 440, start: 0.95, dur: 0.18 },
      { freq: 554, start: 1.1, dur: 0.18 },
      { freq: 659, start: 1.25, dur: 0.18 },
      { freq: 880, start: 1.4, dur: 0.4 },
    ],
    "sine",
    0.2,
  );
}

function playHeartContainer() {
  // Triumphant: C5 E5 G5 C6 (hold)
  playNotes([
    { freq: 523, start: 0, dur: 0.2 },
    { freq: 659, start: 0.2, dur: 0.2 },
    { freq: 784, start: 0.4, dur: 0.2 },
    { freq: 1047, start: 0.6, dur: 0.6 },
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
