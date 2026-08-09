import type { ChordInstrumentId } from "@/modules/chords/types";

export type MelodicLayout = "piano" | "kalimba" | "ribbon";
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
    range: [69, 89], // alto C: A4–F6
    layout: "ribbon",
    voice: "breath",
    notes: "alto C range",
  },
  {
    id: "dizi",
    name: "Dizi",
    family: "winds",
    emoji: "🎋",
    range: [69, 93], // D dizi: A4 up, approx
    layout: "ribbon",
    voice: "breath",
    notes: "D dizi, approximate range",
  },
  {
    id: "xiao",
    name: "Xiao",
    family: "winds",
    emoji: "🎍",
    range: [62, 86], // G xiao: D4 up, approx
    layout: "ribbon",
    voice: "breath",
    notes: "G xiao, approximate range",
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
    layout: "ribbon",
    voice: "pluck",
    notes: "open strings C2 D2 F2 G2 A2 C3 D3",
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
