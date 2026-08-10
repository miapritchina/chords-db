import { describe, expect, it } from "vitest";
import { scaleById } from "@/modules/scales/scales";
import { diatonicChords, harmonyContext, suggestHarmony, suggestNextNotes } from "./harmony";

const major = scaleById("major");

describe("diatonic chords", () => {
  it("builds the C major triads with correct qualities and numerals", () => {
    const chords = diatonicChords(0, major);
    expect(chords.map((c) => c.name)).toEqual(["C", "Dm", "Em", "F", "G", "Am", "Bdim"]);
    expect(chords.map((c) => c.numeral)).toEqual(["I", "ii", "iii", "IV", "V", "vi", "vii°"]);
    expect(chords.map((c) => c.dbSuffix)).toEqual([
      "major", "minor", "minor", "major", "major", "minor", "dim",
    ]);
  });

  it("finds the parent major for pentatonic modes", () => {
    // A yu (A C D E G) lives inside C major
    const ctx = harmonyContext(9, scaleById("yu"));
    expect(ctx).not.toBeNull();
    expect(new Set(ctx!.pcs)).toEqual(new Set([0, 2, 4, 5, 7, 9, 11]));
  });

  it("returns no context for blues (no diatonic parent)", () => {
    expect(harmonyContext(0, scaleById("blues"))).toBeNull();
    expect(diatonicChords(0, scaleById("blues"))).toEqual([]);
  });
});

describe("harmony suggestions", () => {
  it("prefers the chord containing the melody tones, downbeat weighted", () => {
    // segment C E G → C major should win over Am/Em
    const [ranked] = suggestHarmony([[0, 4, 7]], 0, major);
    expect(ranked[0].chord.name).toBe("C");
    expect(ranked[0].covered.sort((a, b) => a - b)).toEqual([0, 4, 7]);
  });

  it("leans cadential on the final segment", () => {
    // ambiguous final segment (just a G) → G (V) or C should outrank others
    const segments = suggestHarmony([[0], [7]], 0, major);
    const finalTop = segments[1][0].chord.name;
    expect(["G", "C"]).toContain(finalTop);
  });
});

describe("next-note suggestions", () => {
  const cMajorNotes = [60, 62, 64, 65, 67, 69, 71, 72];

  it("suggests stable tones to open with", () => {
    const s = suggestNextNotes([], cMajorNotes, 0, major);
    expect(s.length).toBeGreaterThan(0);
    for (const n of s) expect([0, 4, 7]).toContain(((n.midi % 12) + 12) % 12);
  });

  it("prefers stepwise motion after a note", () => {
    const s = suggestNextNotes([64], cMajorNotes, 0, major);
    expect(Math.abs(s[0].midi - 64)).toBeLessThanOrEqual(2);
  });

  it("resolves a big leap by step in the opposite direction", () => {
    // C4 up to A4 (leap of 9) → best answer steps back down to G
    const s = suggestNextNotes([60, 69], cMajorNotes, 0, major);
    expect(s[0].midi).toBe(67);
    expect(s[0].reason).toMatch(/resolves the leap/);
  });

  it("pulls the leading tone up to the tonic", () => {
    const s = suggestNextNotes([71], cMajorNotes, 0, major);
    expect(s[0].midi).toBe(72);
    expect(s[0].reason).toMatch(/leading tone/);
  });
});
