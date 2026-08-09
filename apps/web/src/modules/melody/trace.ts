import type { MelodyCell } from "./types";

/**
 * The "finger path" of a melody, step by step. `path` is the full ordered
 * sequence of sounded notes (repeats included); `order` maps each midi note
 * to every position it occupies in that sequence. Visualizers show numbered
 * markers (a note hit at steps 1 and 4 reads "1·4"), fade opacity along the
 * sequence, and can draw the connecting path so hand travel is visible.
 */
export interface MelodyTrace {
  path: number[]; // midi per sounded step, in playing order
  order: Map<number, number[]>; // midi -> indices into path
  size: number; // path.length
}

export function melodyTrace(cells: MelodyCell[]): MelodyTrace {
  const sorted = [...cells].sort((a, b) => a.step - b.step || a.midi - b.midi);
  const path = sorted.map((c) => c.midi);
  const order = new Map<number, number[]>();
  path.forEach((m, i) => {
    order.set(m, [...(order.get(m) ?? []), i]);
  });
  return { path, order, size: path.length };
}

/** 1.0 for the first step, fading linearly to 0.3 for the last. */
export function traceOpacity(index: number, size: number): number {
  if (size <= 1) return 1;
  return 1 - 0.7 * (index / (size - 1));
}

/** "1" / "1·4" / "1·4·9…" — step numbers a note is played at. */
export function traceLabel(indices: number[]): string {
  const shown = indices.slice(0, 3).map((i) => i + 1);
  return shown.join("·") + (indices.length > 3 ? "…" : "");
}
