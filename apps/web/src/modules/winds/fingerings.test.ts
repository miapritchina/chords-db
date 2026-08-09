import { describe, expect, it } from "vitest";
import { WIND_CHARTS } from "./fingerings";

describe("wind fingering charts", () => {
  it("keeps every fingering consistent with its chart's holes", () => {
    for (const chart of Object.values(WIND_CHARTS)) {
      for (const f of chart.fingerings) {
        expect(f.holes, `${chart.instrumentId} midi ${f.midi}`).toHaveLength(
          chart.holeLabels.length,
        );
        for (const h of f.holes) expect([0, 0.5, 1]).toContain(h);
      }
      for (const t of chart.thumbs) {
        expect(t).toBeGreaterThanOrEqual(0);
        expect(t).toBeLessThan(chart.holeLabels.length);
      }
    }
  });

  it("lists notes in ascending order within each register", () => {
    for (const chart of Object.values(WIND_CHARTS)) {
      const first = chart.fingerings.filter((f) => !f.overblow);
      const second = chart.fingerings.filter((f) => f.overblow);
      for (const list of [first, second]) {
        for (let i = 1; i < list.length; i++) {
          expect(list[i].midi).toBeGreaterThan(list[i - 1].midi);
        }
      }
    }
  });

  it("overblown notes repeat the fundamental fingering an octave up", () => {
    for (const id of ["dizi", "xiao"]) {
      const chart = WIND_CHARTS[id];
      for (const f of chart.fingerings.filter((x) => x.overblow)) {
        const fundamental = chart.fingerings.find(
          (x) => !x.overblow && x.midi === f.midi - 12,
        );
        expect(fundamental, `${id} ${f.midi}`).toBeDefined();
        expect(fundamental!.holes).toEqual(f.holes);
      }
    }
  });

  it("opens holes monotonically down the six-hole flutes' first octave", () => {
    for (const id of ["dizi", "xiao"]) {
      const first = WIND_CHARTS[id].fingerings.filter((f) => !f.overblow);
      for (let i = 1; i < first.length; i++) {
        const closed = (h: { holes: readonly number[] }) =>
          h.holes.reduce<number>((a, b) => a + b, 0);
        expect(closed(first[i])).toBeLessThan(closed(first[i - 1]));
      }
    }
  });
});
