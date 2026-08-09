import { describe, expect, it } from "vitest";
import { currentStreak, dailyMinutes, minutesByInstrument } from "./stats";
import type { PracticeSession } from "./types";
import { localDateString, weekdayOf } from "./types";

const session = (date: string, minutes = 20, instrumentId = "piano"): PracticeSession => ({
  id: `${date}-${instrumentId}-${minutes}`,
  date,
  instrumentId,
  minutes,
  focus: "repertoire",
});

describe("practice stats", () => {
  const today = new Date(2026, 7, 9); // 2026-08-09, a Sunday

  it("totals minutes per instrument", () => {
    const totals = minutesByInstrument([
      session("2026-08-01", 20, "piano"),
      session("2026-08-02", 15, "piano"),
      session("2026-08-02", 30, "guqin"),
    ]);
    expect(totals).toEqual({ piano: 35, guqin: 30 });
  });

  it("builds a daily series including empty days", () => {
    const series = dailyMinutes([session("2026-08-08", 25)], 3, today);
    expect(series).toEqual([
      { date: "2026-08-07", minutes: 0 },
      { date: "2026-08-08", minutes: 25 },
      { date: "2026-08-09", minutes: 0 },
    ]);
  });

  it("counts a streak ending today", () => {
    const s = [session("2026-08-07"), session("2026-08-08"), session("2026-08-09")];
    expect(currentStreak(s, today)).toBe(3);
  });

  it("does not break the streak before today's practice happens", () => {
    const s = [session("2026-08-07"), session("2026-08-08")];
    expect(currentStreak(s, today)).toBe(2);
  });

  it("resets the streak after a missed day", () => {
    const s = [session("2026-08-05"), session("2026-08-08")];
    expect(currentStreak(s, today)).toBe(1);
  });

  it("maps dates to Monday-first weekdays", () => {
    expect(weekdayOf("2026-08-09")).toBe(6); // Sunday
    expect(weekdayOf("2026-08-03")).toBe(0); // Monday
    expect(localDateString(today)).toBe("2026-08-09");
  });
});
