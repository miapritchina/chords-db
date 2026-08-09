import type { Persisted } from "@/modules/storage";

/** One lit cell in the sketcher grid. Midi is stored directly so a saved
 *  melody survives later scale/root changes. */
export interface MelodyCell {
  step: number;
  midi: number;
}

export interface SavedMelody extends Persisted {
  name: string;
  instrumentId: string;
  scaleId: string;
  rootPc: number;
  bpm: number;
  steps: number;
  cells: MelodyCell[];
  createdAt: string;
}

/** Convert grid cells to synth events; each step is an eighth note. */
export function cellsToEvents(cells: MelodyCell[], bpm: number) {
  const stepSec = 60 / bpm / 2;
  return cells.map((c) => ({
    midi: c.midi,
    at: c.step * stepSec,
    duration: stepSec * 1.8,
  }));
}

export function melodyDurationSec(steps: number, bpm: number): number {
  return steps * (60 / bpm / 2);
}

/** A wandering little melody within the given scale notes — a practice spark. */
export function sparkMelody(
  scaleNotes: number[],
  steps: number,
  random: () => number = Math.random,
): MelodyCell[] {
  if (scaleNotes.length === 0) return [];
  const cells: MelodyCell[] = [];
  let idx = Math.floor(scaleNotes.length / 2);
  for (let step = 0; step < steps; step++) {
    if (random() < 0.28 && step !== 0 && step !== steps - 1) continue; // rests
    const drift = Math.floor(random() * 5) - 2; // -2..+2 scale degrees
    idx = Math.min(scaleNotes.length - 1, Math.max(0, idx + drift));
    cells.push({ step, midi: scaleNotes[idx] });
  }
  return cells;
}
