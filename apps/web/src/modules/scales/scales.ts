import { NOTE_NAMES } from "@/modules/chords/notes";

export interface Scale {
  id: string;
  name: string;
  /** Semitone offsets from the root within one octave. */
  intervals: number[];
  group: "western" | "pentatonic" | "chinese";
}

/**
 * The five Chinese modes are rotations of the major pentatonic —
 * gong 宫, shang 商, jue 角, zhi 徵, yu 羽 — the home territory of
 * guqin, dizi and xiao repertoire.
 */
export const SCALES: Scale[] = [
  { id: "major", name: "Major (Ionian)", intervals: [0, 2, 4, 5, 7, 9, 11], group: "western" },
  { id: "minor", name: "Natural minor", intervals: [0, 2, 3, 5, 7, 8, 10], group: "western" },
  { id: "harmonic-minor", name: "Harmonic minor", intervals: [0, 2, 3, 5, 7, 8, 11], group: "western" },
  { id: "dorian", name: "Dorian", intervals: [0, 2, 3, 5, 7, 9, 10], group: "western" },
  { id: "mixolydian", name: "Mixolydian", intervals: [0, 2, 4, 5, 7, 9, 10], group: "western" },
  { id: "major-pentatonic", name: "Major pentatonic", intervals: [0, 2, 4, 7, 9], group: "pentatonic" },
  { id: "minor-pentatonic", name: "Minor pentatonic", intervals: [0, 3, 5, 7, 10], group: "pentatonic" },
  { id: "blues", name: "Blues", intervals: [0, 3, 5, 6, 7, 10], group: "pentatonic" },
  { id: "gong", name: "Gong 宫 (do)", intervals: [0, 2, 4, 7, 9], group: "chinese" },
  { id: "shang", name: "Shang 商 (re)", intervals: [0, 2, 5, 7, 10], group: "chinese" },
  { id: "jue", name: "Jue 角 (mi)", intervals: [0, 3, 5, 8, 10], group: "chinese" },
  { id: "zhi", name: "Zhi 徵 (sol)", intervals: [0, 2, 5, 7, 9], group: "chinese" },
  { id: "yu", name: "Yu 羽 (la)", intervals: [0, 3, 5, 7, 10], group: "chinese" },
];

export const scaleById = (id: string): Scale =>
  SCALES.find((s) => s.id === id) ?? SCALES[0];

/** Pitch classes (0–11) of a scale built on the given root pitch class. */
export function scalePitchClasses(rootPc: number, scale: Scale): number[] {
  return scale.intervals.map((i) => (rootPc + i) % 12);
}

/** All midi notes of the scale inside [low, high], ascending. */
export function scaleNotesInRange(
  rootPc: number,
  scale: Scale,
  low: number,
  high: number,
): number[] {
  const pcs = new Set(scalePitchClasses(rootPc, scale));
  const out: number[] = [];
  for (let m = low; m <= high; m++) {
    if (pcs.has(((m % 12) + 12) % 12)) out.push(m);
  }
  return out;
}

/** Degree label of a midi note within the scale, or null if outside. */
export function degreeOf(midi: number, rootPc: number, scale: Scale): number | null {
  const pc = ((midi % 12) + 12) % 12;
  const idx = scale.intervals.findIndex((i) => (rootPc + i) % 12 === pc);
  return idx === -1 ? null : idx + 1;
}

export const pitchClassName = (pc: number): string => NOTE_NAMES[((pc % 12) + 12) % 12];
