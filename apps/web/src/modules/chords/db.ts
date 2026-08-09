import type { Chord, ChordInstrumentId, InstrumentChordDb } from "./types";
import guitarJson from "@db/guitar.json";
import ukuleleJson from "@db/ukulele.json";

export const guitar = guitarJson as unknown as InstrumentChordDb;
export const ukulele = ukuleleJson as unknown as InstrumentChordDb;

/**
 * A baritone ukulele is tuned D3 G3 B3 E4 — exactly the top four strings of
 * a guitar. Every guitar voicing that mutes the two low strings is directly
 * playable on baritone, so we derive a full baritone database from the
 * guitar one instead of maintaining a separate dataset.
 */
export function deriveBaritoneUkulele(source: InstrumentChordDb): InstrumentChordDb {
  const chords: Record<string, Chord[]> = {};
  let count = 0;

  for (const [key, list] of Object.entries(source.chords)) {
    const derived = list
      .map((chord) => ({
        ...chord,
        positions: chord.positions
          .filter((p) => p.frets[0] === -1 && p.frets[1] === -1)
          .map((p) => ({
            ...p,
            frets: p.frets.slice(2),
            fingers: p.fingers.slice(2),
          })),
      }))
      .filter((chord) => chord.positions.length > 0);
    if (derived.length > 0) {
      chords[key] = derived;
      count += derived.length;
    }
  }

  return {
    main: {
      strings: 4,
      fretsOnChord: source.main.fretsOnChord,
      name: "baritone-ukulele",
      numberOfChords: count,
    },
    tunings: { standard: ["D3", "G3", "B3", "E4"] },
    keys: source.keys,
    suffixes: source.suffixes,
    chords,
  };
}

export const baritoneUkulele = deriveBaritoneUkulele(guitar);

export const chordDbs: Record<ChordInstrumentId, InstrumentChordDb> = {
  guitar,
  ukulele,
  "baritone-ukulele": baritoneUkulele,
};

export function getChord(
  instrument: ChordInstrumentId,
  key: string,
  suffix: string,
): Chord | undefined {
  return chordDbs[instrument].chords[dbKeyIndex(key)]?.find(
    (c) => c.suffix === suffix,
  );
}

/** chords-db indexes "C#" under "Csharp" in the chords record. */
export function dbKeyIndex(key: string): string {
  return key.replace("#", "sharp");
}
