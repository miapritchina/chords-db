/** Shapes of the compiled chords-db JSON (lib/*.json at the repo root). */

export interface ChordPosition {
  frets: number[]; // -1 = muted, 0 = open, n = fret relative to baseFret
  fingers: number[];
  baseFret: number;
  barres: number[];
  capo?: boolean;
  midi: number[];
}

export interface Chord {
  key: string; // "C", "C#", "Eb"...
  suffix: string; // "major", "m7", "sus4"...
  positions: ChordPosition[];
}

export interface InstrumentChordDb {
  main: {
    strings: number;
    fretsOnChord: number;
    name: string;
    numberOfChords: number;
  };
  tunings: Record<string, string[]>;
  keys: string[];
  suffixes: string[];
  chords: Record<string, Chord[]>;
}

export type ChordInstrumentId = "guitar" | "ukulele" | "baritone-ukulele";
