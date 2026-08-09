import { describe, expect, it } from "vitest";
import { degreeOf, scaleById, scaleNotesInRange, scalePitchClasses } from "./scales";

describe("scales", () => {
  it("builds C major pitch classes", () => {
    expect(scalePitchClasses(0, scaleById("major"))).toEqual([0, 2, 4, 5, 7, 9, 11]);
  });

  it("wraps pitch classes for non-C roots", () => {
    // A major: A B C# D E F# G#
    expect(scalePitchClasses(9, scaleById("major"))).toEqual([9, 11, 1, 2, 4, 6, 8]);
  });

  it("keeps the Chinese modes as rotations of the major pentatonic", () => {
    // C gong = C D E G A; its zhi rotation starting on G = G A C D E
    const gongOnC = new Set(scalePitchClasses(0, scaleById("gong")));
    const zhiOnG = new Set(scalePitchClasses(7, scaleById("zhi")));
    expect(zhiOnG).toEqual(gongOnC);
    const yuOnA = new Set(scalePitchClasses(9, scaleById("yu")));
    expect(yuOnA).toEqual(gongOnC);
  });

  it("lists scale notes inside an instrument range", () => {
    // C major pentatonic within one octave from C4
    expect(scaleNotesInRange(0, scaleById("major-pentatonic"), 60, 72)).toEqual([
      60, 62, 64, 67, 69, 72,
    ]);
  });

  it("computes scale degrees", () => {
    const major = scaleById("major");
    expect(degreeOf(60, 0, major)).toBe(1);
    expect(degreeOf(67, 0, major)).toBe(5);
    expect(degreeOf(61, 0, major)).toBeNull();
  });
});
