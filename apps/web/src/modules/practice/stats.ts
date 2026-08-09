import type { PracticeSession } from "./types";
import { localDateString } from "./types";

export function minutesByInstrument(sessions: PracticeSession[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const s of sessions) {
    totals[s.instrumentId] = (totals[s.instrumentId] ?? 0) + s.minutes;
  }
  return totals;
}

export function minutesByFocus(sessions: PracticeSession[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const s of sessions) {
    totals[s.focus] = (totals[s.focus] ?? 0) + s.minutes;
  }
  return totals;
}

/** Last `days` calendar days (oldest first) with practiced minutes. */
export function dailyMinutes(
  sessions: PracticeSession[],
  days: number,
  today: Date = new Date(),
): { date: string; minutes: number }[] {
  const byDate = new Map<string, number>();
  for (const s of sessions) {
    byDate.set(s.date, (byDate.get(s.date) ?? 0) + s.minutes);
  }
  const out: { date: string; minutes: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const date = localDateString(d);
    out.push({ date, minutes: byDate.get(date) ?? 0 });
  }
  return out;
}

/** Consecutive practiced days ending today (or yesterday, so an unfinished today doesn't break it). */
export function currentStreak(
  sessions: PracticeSession[],
  today: Date = new Date(),
): number {
  const practiced = new Set(sessions.map((s) => s.date));
  let streak = 0;
  const cursor = new Date(today);
  if (!practiced.has(localDateString(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (practiced.has(localDateString(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
