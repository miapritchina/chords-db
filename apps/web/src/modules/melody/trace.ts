import type { MelodyCell } from "./types";

/**
 * The "finger path" of a melody: each distinct note mapped to the order of
 * its first appearance. Visualizers draw these as numbered markers whose
 * opacity fades along the sequence, so you can read how the hand travels
 * across the instrument.
 */
export interface MelodyTrace {
  order: Map<number, number>; // midi -> first-appearance index (0-based)
  size: number;
}

export function melodyTrace(cells: MelodyCell[]): MelodyTrace {
  const sorted = [...cells].sort((a, b) => a.step - b.step || a.midi - b.midi);
  const order = new Map<number, number>();
  for (const c of sorted) {
    if (!order.has(c.midi)) order.set(c.midi, order.size);
  }
  return { order, size: order.size };
}

/** 1.0 for the first note, fading linearly to 0.3 for the last. */
export function traceOpacity(index: number, size: number): number {
  if (size <= 1) return 1;
  return 1 - 0.7 * (index / (size - 1));
}
