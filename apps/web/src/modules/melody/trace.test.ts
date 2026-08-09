import { describe, expect, it } from "vitest";
import { melodyTrace, traceOpacity } from "./trace";

describe("melody trace", () => {
  it("orders distinct notes by first appearance", () => {
    const trace = melodyTrace([
      { step: 4, midi: 64 },
      { step: 0, midi: 60 },
      { step: 2, midi: 67 },
      { step: 6, midi: 60 }, // repeat keeps first index
    ]);
    expect(trace.size).toBe(3);
    expect(trace.order.get(60)).toBe(0);
    expect(trace.order.get(67)).toBe(1);
    expect(trace.order.get(64)).toBe(2);
  });

  it("fades opacity from 1.0 to 0.3", () => {
    expect(traceOpacity(0, 5)).toBe(1);
    expect(traceOpacity(4, 5)).toBeCloseTo(0.3);
    expect(traceOpacity(0, 1)).toBe(1);
    expect(traceOpacity(2, 5)).toBeCloseTo(0.65);
  });
});
