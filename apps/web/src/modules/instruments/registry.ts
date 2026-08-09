import type { ChordInstrumentId } from "@/modules/chords/types";

export type MelodicLayout = "piano" | "kalimba" | "ribbon" | "wind" | "guqin";
export type Voice = "pluck" | "breath" | "bow";

export interface Instrument {
  id: string;
  name: string;
  family: "strings" | "keys" | "winds" | "plucked idiophone";
  emoji: string;
  /** Set when the instrument has a fretted chord database in chords-db. */
  chordDb?: ChordInstrumentId;
  /** Practical melodic range as [low, high] midi (approximate for winds). */
  range?: [number, number];
  /** Which visualizer the Melodies page uses. */
  layout?: MelodicLayout;
  /** Synth voice used for playback. */
  voice?: Voice;
  notes?: string;
}

/** The player's instruments. Edit freely — everything else adapts. */
export const INSTRUMENTS: Instrument[] = [
  {
    id: "piano",
    name: "Piano",
    family: "keys",
    emoji: "🎹",
    range: [48, 84], // practical 3-octave window; the real thing goes A0–C8
    layout: "piano",
    voice: "pluck",
  },
  {
    id: "harp",
    name: "Harp",
    family: "strings",
    emoji: "🪕",
    range: [48, 84],
    layout: "ribbon",
    voice: "pluck",
  },
  {
    id: "violin",
    name: "Violin",
    family: "strings",
    emoji: "🎻",
    range: [55, 88], // G3 up; goes far higher in position work
    layout: "ribbon",
    voice: "bow",
  },
  {
    id: "baritone-ukulele",
    name: "Baritone Ukulele",
    family: "strings",
    emoji: "🎸",
    chordDb: "baritone-ukulele",
    range: [50, 76],
    layout: "ribbon",
    voice: "pluck",
    notes: "DGBE — voicings derived from the guitar database",
  },
  {
    id: "ocarina",
    name: "Ocarina",
    family: "winds",
    emoji: "🍠",
    range: [72, 84], // 6-hole pendant in C: C5–C6
    layout: "wind",
    voice: "breath",
    notes: "6-hole pendant in C",
  },
  {
    id: "recorder",
    name: "Recorder",
    family: "winds",
    emoji: "🪈",
    range: [72, 88], // soprano: C5–E6 charted; goes higher
    layout: "wind",
    voice: "breath",
    notes: "soprano, baroque fingering",
  },
  {
    id: "dizi",
    name: "Dizi",
    family: "winds",
    emoji: "🎋",
    range: [69, 90], // D dizi: A4–F#6 charted
    layout: "wind",
    voice: "breath",
    notes: "D dizi · 筒音作5",
  },
  {
    id: "xiao",
    name: "Xiao",
    family: "winds",
    emoji: "🎍",
    range: [62, 84], // G xiao: D4–C6 charted
    layout: "wind",
    voice: "breath",
    notes: "G xiao · 筒音作5",
  },
  {
    id: "kalimba",
    name: "Kalimba",
    family: "plucked idiophone",
    emoji: "🎼",
    range: [60, 88], // 17-key in C: C4–E6
    layout: "kalimba",
    voice: "pluck",
    notes: "17-key in C",
  },
  {
    id: "guqin",
    name: "Guqin",
    family: "strings",
    emoji: "🏮",
    range: [36, 76], // open C2, harmonics/stopped notes far above
    layout: "guqin",
    voice: "pluck",
    notes: "zheng diao 正调 · C2 D2 F2 G2 A2 C3 D3",
  },
  {
    id: "guitar",
    name: "Guitar",
    family: "strings",
    emoji: "🎸",
    chordDb: "guitar",
    range: [40, 76],
    layout: "ribbon",
    voice: "pluck",
    notes: "full chords-db voicing library",
  },
  {
    id: "ukulele",
    name: "Ukulele",
    family: "strings",
    emoji: "🌺",
    chordDb: "ukulele",
    range: [60, 81],
    layout: "ribbon",
    voice: "pluck",
    notes: "GCEA (re-entrant)",
  },
];

export const instrumentById = (id: string) =>
  INSTRUMENTS.find((i) => i.id === id);

export const CHORD_INSTRUMENTS = INSTRUMENTS.filter((i) => i.chordDb);
export const MELODIC_INSTRUMENTS = INSTRUMENTS.filter((i) => i.range);
