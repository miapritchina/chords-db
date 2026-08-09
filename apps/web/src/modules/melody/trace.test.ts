import { describe, expect, it } from "vitest";
import { melodyTrace, traceLabel, traceOpacity } from "./trace";

describe("melody trace", () => {
  it("keeps the full step-by-step path, repeats included", () => {
    const trace = melodyTrace([
      { step: 4, midi: 64 },
      { step: 0, midi: 60 },
      { step: 2, midi: 67 },
      { step: 6, midi: 60 },
    ]);
    expect(trace.path).toEqual([60, 67, 64, 60]);
    expect(trace.size).toBe(4);
    expect(trace.order.get(60)).toEqual([0, 3]);
    expect(trace.order.get(67)).toEqual([1]);
  });

  it("fades opacity from 1.0 to 0.3", () => {
    expect(traceOpacity(0, 5)).toBe(1);
    expect(traceOpacity(4, 5)).toBeCloseTo(0.3);
    expect(traceOpacity(0, 1)).toBe(1);
  });

  it("labels repeated notes with all their step numbers", () => {
    expect(traceLabel([0])).toBe("1");
    expect(traceLabel([0, 3])).toBe("1·4");
    expect(traceLabel([0, 3, 8, 11])).toBe("1·4·9…");
  });
});
