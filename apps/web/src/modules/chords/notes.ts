/** Small, dependency-free note math shared by chords, audio and MIDI modules. */

export const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "Eb",
  "E",
  "F",
  "F#",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
] as const;

const NAME_TO_PC: Record<string, number> = {
  C: 0, "B#": 0,
  "C#": 1, Db: 1,
  D: 2,
  "D#": 3, Eb: 3,
  E: 4, Fb: 4,
  F: 5, "E#": 5,
  "F#": 6, Gb: 6,
  G: 7,
  "G#": 8, Ab: 8,
  A: 9,
  "A#": 10, Bb: 10,
  B: 11, Cb: 11,
};

/** "E2" -> 40, "G#4" -> 68. MIDI convention: C4 = 60. */
export function noteToMidi(note: string): number {
  const m = note.match(/^([A-G][b#]?)(-?\d+)$/);
  if (!m) throw new Error(`Cannot parse note: ${note}`);
  const pc = NAME_TO_PC[m[1]];
  if (pc === undefined) throw new Error(`Unknown pitch class: ${m[1]}`);
  return pc + (Number(m[2]) + 1) * 12;
}

/** 60 -> "C4" (uses the chords-db spelling set, flats for Eb/Ab/Bb). */
export function midiToNote(midi: number): string {
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[pc]}${octave}`;
}

export function midiToPitchClass(midi: number): string {
  return NOTE_NAMES[((midi % 12) + 12) % 12];
}

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Transpose a key name by semitones, staying inside the chords-db key set. */
export function transposeKey(key: string, semitones: number): string {
  const pc = NAME_TO_PC[key];
  if (pc === undefined) throw new Error(`Unknown key: ${key}`);
  return NOTE_NAMES[(((pc + semitones) % 12) + 12) % 12];
}
