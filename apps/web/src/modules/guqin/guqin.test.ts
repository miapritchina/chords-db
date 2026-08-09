import { describe, expect, it } from "vitest";
import { GUQIN_TUNING, allPositions, huiX, stoppedPitch } from "./guqin";

describe("guqin math", () => {
  it("tunes to C2 D2 F2 G2 A2 C3 D3", () => {
    expect(GUQIN_TUNING).toEqual([36, 38, 41, 43, 45, 48, 50]);
  });

  it("computes exact harmonic-node pitches", () => {
    // hui 7 = half the string = octave, exactly
    expect(stoppedPitch(36, 7)).toEqual({ midi: 48, cents: 0 });
    // hui 4 = quarter = double octave
    expect(stoppedPitch(36, 4)).toEqual({ midi: 60, cents: 0 });
    // hui 9 = 2/3 = just fifth, +2 cents
    expect(stoppedPitch(36, 9)).toEqual({ midi: 43, cents: 2 });
    // hui 10 = 3/4 = just fourth, -2 cents
    expect(stoppedPitch(36, 10)).toEqual({ midi: 41, cents: -2 });
    // hui 11 = 4/5 = just major third, -14 cents
    expect(stoppedPitch(36, 11).midi).toBe(40);
    expect(stoppedPitch(36, 11).cents).toBe(-14);
  });

  it("orders hui 1 nearest the yueshan (right end)", () => {
    expect(huiX(1)).toBeCloseTo(0.875);
    expect(huiX(7)).toBeCloseTo(0.5);
    expect(huiX(13)).toBeCloseTo(0.125);
    for (let h = 2; h <= 13; h++) {
      expect(huiX(h)).toBeLessThan(huiX(h - 1));
    }
  });

  it("keeps only near-tempered positions and all open strings", () => {
    const positions = allPositions(20);
    expect(positions.filter((p) => p.hui === null)).toHaveLength(7);
    for (const p of positions) {
      expect(Math.abs(p.cents)).toBeLessThanOrEqual(20);
    }
    // hui 11 (-14c major third) survives, but nothing worse than 20c
    expect(positions.some((p) => p.hui === 11)).toBe(true);
  });
});
