import type { Persisted } from "@/modules/storage";

export const FOCUS_AREAS = [
  "repertoire",
  "technique",
  "sight reading",
  "ear training",
  "rhythm",
  "exploration",
] as const;

export type FocusArea = (typeof FOCUS_AREAS)[number];

export interface PracticeSession extends Persisted {
  date: string; // YYYY-MM-DD, local
  instrumentId: string;
  minutes: number;
  focus: FocusArea;
  notes?: string;
}

export interface PlanBlock extends Persisted {
  weekday: number; // 0 = Monday … 6 = Sunday
  instrumentId: string;
  focus: FocusArea;
  minutes: number;
}

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export function localDateString(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Monday-first weekday index for a YYYY-MM-DD date. */
export function weekdayOf(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return (new Date(y, m - 1, d).getDay() + 6) % 7;
}
