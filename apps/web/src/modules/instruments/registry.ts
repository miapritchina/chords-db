import type { ChordInstrumentId } from "@/modules/chords/types";

export interface Instrument {
  id: string;
  name: string;
  family: "strings" | "keys" | "winds" | "plucked idiophone";
  emoji: string;
  /** Set when the instrument has a fretted chord database in chords-db. */
  chordDb?: ChordInstrumentId;
  notes?: string;
}

/** The player's instruments. Edit freely — everything else adapts. */
export const INSTRUMENTS: Instrument[] = [
  { id: "piano", name: "Piano", family: "keys", emoji: "🎹" },
  { id: "harp", name: "Harp", family: "strings", emoji: "🪕" },
  { id: "violin", name: "Violin", family: "strings", emoji: "🎻" },
  {
    id: "baritone-ukulele",
    name: "Baritone Ukulele",
    family: "strings",
    emoji: "🎸",
    chordDb: "baritone-ukulele",
    notes: "DGBE — voicings derived from the guitar database",
  },
  { id: "ocarina", name: "Ocarina", family: "winds", emoji: "🍠" },
  { id: "dizi", name: "Dizi", family: "winds", emoji: "🎋" },
  { id: "xiao", name: "Xiao", family: "winds", emoji: "🎍" },
  { id: "kalimba", name: "Kalimba", family: "plucked idiophone", emoji: "🎼" },
  { id: "guqin", name: "Guqin", family: "strings", emoji: "🏮" },
  {
    id: "guitar",
    name: "Guitar",
    family: "strings",
    emoji: "🎸",
    chordDb: "guitar",
    notes: "full chords-db voicing library",
  },
  {
    id: "ukulele",
    name: "Ukulele",
    family: "strings",
    emoji: "🌺",
    chordDb: "ukulele",
    notes: "GCEA (re-entrant)",
  },
];

export const instrumentById = (id: string) =>
  INSTRUMENTS.find((i) => i.id === id);

export const CHORD_INSTRUMENTS = INSTRUMENTS.filter((i) => i.chordDb);
