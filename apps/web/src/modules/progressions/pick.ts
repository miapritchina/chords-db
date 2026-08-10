import { getChord } from "@/modules/chords/db";
import type { ChordInstrumentId } from "@/modules/chords/types";
import { CHORD_INSTRUMENTS } from "@/modules/instruments/registry";

/**
 * Pick the chord instrument for a suggested progression: instruments the
 * player actually plays come first, and among those the one whose database
 * has voicings for the most of the requested chords wins. (The derived
 * baritone db lacks some voicings, so a fallback matters.)
 */
export function pickProgressionInstrument(
  chords: { key: string; suffix: string }[],
): { instrument: ChordInstrumentId; covered: number } {
  const candidates = [...CHORD_INSTRUMENTS].sort(
    (a, b) => Number(b.played !== false) - Number(a.played !== false),
  );
  let best: { instrument: ChordInstrumentId; covered: number; played: boolean } | null = null;
  for (const inst of candidates) {
    const covered = chords.filter((c) => getChord(inst.chordDb!, c.key, c.suffix)).length;
    const played = inst.played !== false;
    if (
      !best ||
      covered > best.covered ||
      (covered === best.covered && played && !best.played)
    ) {
      // strict '>' keeps the earlier (played-first) candidate on ties
      if (!best || covered > best.covered) {
        best = { instrument: inst.chordDb!, covered, played };
      }
    }
  }
  return { instrument: best!.instrument, covered: best!.covered };
}
