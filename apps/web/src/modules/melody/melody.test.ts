import { describe, expect, it } from "vitest";
import { cellsToEvents, melodyDurationSec, sparkMelody } from "./types";

describe("melody", () => {
  it("converts cells to timed events at eighth-note steps", () => {
    const events = cellsToEvents([{ step: 0, midi: 60 }, { step: 4, midi: 64 }], 120);
    expect(events[0].at).toBe(0);
    expect(events[1].at).toBeCloseTo(1.0); // 4 eighths at 120bpm = 1s
    expect(melodyDurationSec(16, 120)).toBeCloseTo(4.0);
  });

  it("sparks melodies that stay inside the scale", () => {
    const scale = [60, 62, 64, 67, 69, 72];
    let seed = 1;
    const rng = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const cells = sparkMelody(scale, 16, rng);
    expect(cells.length).toBeGreaterThan(4);
    for (const c of cells) {
      expect(scale).toContain(c.midi);
      expect(c.step).toBeGreaterThanOrEqual(0);
      expect(c.step).toBeLessThan(16);
    }
    // starts and ends with a note, not a rest
    expect(cells[0].step).toBe(0);
    expect(cells[cells.length - 1].step).toBe(15);
  });

  it("handles an empty scale", () => {
    expect(sparkMelody([], 16)).toEqual([]);
  });
});
