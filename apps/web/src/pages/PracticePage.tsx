import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { INSTRUMENTS, instrumentById } from "@/modules/instruments/registry";
import { StatTile } from "@/modules/practice/StatTile";
import { currentStreak, dailyMinutes, minutesByInstrument } from "@/modules/practice/stats";
import type { FocusArea, PlanBlock, PracticeSession } from "@/modules/practice/types";
import { FOCUS_AREAS, WEEKDAYS, localDateString, weekdayOf } from "@/modules/practice/types";
import { newId, useCollection } from "@/modules/storage";

export function PracticePage() {
  return (
    <Tabs defaultValue="log">
      <TabsList>
        <TabsTrigger value="log">Tracker</TabsTrigger>
        <TabsTrigger value="plan">Planner</TabsTrigger>
      </TabsList>
      <TabsContent value="log">
        <TrackerTab />
      </TabsContent>
      <TabsContent value="plan">
        <PlannerTab />
      </TabsContent>
    </Tabs>
  );
}

/* ------------------------------------------------------------------ */

function TrackerTab() {
  const { items: sessions, put, remove } = useCollection<PracticeSession>("sessions");

  const [date, setDate] = useState(localDateString());
  const [instrumentId, setInstrumentId] = useState("piano");
  const [minutes, setMinutes] = useState("20");
  const [focus, setFocus] = useState<FocusArea>("repertoire");
  const [notes, setNotes] = useState("");

  const streak = useMemo(() => currentStreak(sessions), [sessions]);
  const series = useMemo(() => dailyMinutes(sessions, 14), [sessions]);
  const weekMinutes = series.slice(-7).reduce((sum, d) => sum + d.minutes, 0);
  const totals = useMemo(() => minutesByInstrument(sessions), [sessions]);
  const maxDay = Math.max(30, ...series.map((d) => d.minutes));

  const log = () => {
    const m = Number(minutes);
    if (!m || m <= 0) return;
    put({
      id: newId(),
      date,
      instrumentId,
      minutes: m,
      focus,
      notes: notes.trim() || undefined,
    });
    setNotes("");
  };

  return (
    <div className="mt-4 space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile label="streak" value={`${streak}d`} hint="consecutive practice days" />
        <StatTile label="this week" value={`${weekMinutes}m`} hint="minutes, last 7 days" />
        <StatTile label="sessions" value={String(sessions.length)} hint="all time" />
        <StatTile
          label="instruments"
          value={String(Object.keys(totals).length)}
          hint="played so far"
        />
      </div>

      {/* 14-day bars */}
      <Card>
        <CardContent className="p-4">
          <div className="flex h-24 items-end gap-1.5">
            {series.map((d) => (
              <div key={d.date} className="group relative flex-1">
                <div
                  className="rounded-t-sm bg-primary/80 transition-colors group-hover:bg-primary"
                  style={{ height: `${(d.minutes / maxDay) * 88 + 2}px` }}
                />
                <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background opacity-0 transition-opacity group-hover:opacity-100">
                  {d.date.slice(5)} · {d.minutes}m
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">last 14 days</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* log form */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Log a session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="minutes">Minutes</Label>
                <Input
                  id="minutes"
                  type="number"
                  min={1}
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Instrument</Label>
              <Select value={instrumentId} onValueChange={setInstrumentId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INSTRUMENTS.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.emoji} {i.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Focus</Label>
              <Select value={focus} onValueChange={(v) => setFocus(v as FocusArea)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOCUS_AREAS.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="what did you work on?"
              />
            </div>
            <Button className="w-full" onClick={log}>
              <Plus /> log session
            </Button>
          </CardContent>
        </Card>

        {/* recent sessions + per-instrument totals */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg">Minutes per instrument</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {Object.entries(totals)
                .sort(([, a], [, b]) => b - a)
                .map(([id, mins]) => (
                  <Badge key={id} variant="secondary" className="py-1 text-sm font-normal">
                    {instrumentById(id)?.emoji} {instrumentById(id)?.name ?? id} · {mins}m
                  </Badge>
                ))}
              {sessions.length === 0 && (
                <p className="text-sm text-muted-foreground">nothing logged yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg">Recent sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[...sessions]
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 12)
                .map((s) => (
                  <div
                    key={s.id}
                    className="flex items-start justify-between gap-3 rounded-lg border bg-background/50 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {instrumentById(s.instrumentId)?.emoji}{" "}
                        {instrumentById(s.instrumentId)?.name ?? s.instrumentId}{" "}
                        <span className="text-muted-foreground">
                          · {s.minutes}m · {s.focus} · {s.date}
                        </span>
                      </p>
                      {s.notes && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{s.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => remove(s.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="delete session"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function PlannerTab() {
  const { items: blocks, put, remove } = useCollection<PlanBlock>("plan");
  const { items: sessions } = useCollection<PracticeSession>("sessions");

  const [weekday, setWeekday] = useState(String(weekdayOf(localDateString())));
  const [instrumentId, setInstrumentId] = useState("piano");
  const [focus, setFocus] = useState<FocusArea>("repertoire");
  const [minutes, setMinutes] = useState("20");

  const todayIdx = weekdayOf(localDateString());
  const todayLogged = sessions
    .filter((s) => s.date === localDateString())
    .reduce((sum, s) => sum + s.minutes, 0);
  const todayPlanned = blocks
    .filter((b) => b.weekday === todayIdx)
    .reduce((sum, b) => sum + b.minutes, 0);

  const add = () => {
    const m = Number(minutes);
    if (!m || m <= 0) return;
    put({ id: newId(), weekday: Number(weekday), instrumentId, focus, minutes: m });
  };

  return (
    <div className="mt-4 space-y-6">
      {todayPlanned > 0 && (
        <p className="text-sm">
          Today:{" "}
          <span className="font-semibold">
            {todayLogged}m of {todayPlanned}m planned
          </span>{" "}
          {todayLogged >= todayPlanned ? "— plan complete 🎉" : ""}
        </p>
      )}

      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div className="space-y-1.5">
            <Label>Day</Label>
            <Select value={weekday} onValueChange={setWeekday}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEEKDAYS.map((d, i) => (
                  <SelectItem key={d} value={String(i)}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Instrument</Label>
            <Select value={instrumentId} onValueChange={setInstrumentId}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INSTRUMENTS.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.emoji} {i.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Focus</Label>
            <Select value={focus} onValueChange={(v) => setFocus(v as FocusArea)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FOCUS_AREAS.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Minutes</Label>
            <Input
              type="number"
              min={5}
              step={5}
              className="w-24"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </div>
          <Button onClick={add}>
            <Plus /> add block
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {WEEKDAYS.map((day, i) => {
          const dayBlocks = blocks.filter((b) => b.weekday === i);
          const total = dayBlocks.reduce((sum, b) => sum + b.minutes, 0);
          return (
            <Card key={day} className={i === todayIdx ? "border-primary/60" : ""}>
              <CardHeader className="p-3 pb-1">
                <CardTitle className="flex items-baseline justify-between text-sm">
                  <span className="font-display">{day}</span>
                  {total > 0 && (
                    <span className="text-xs font-normal text-muted-foreground">{total}m</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 p-3 pt-1">
                {dayBlocks.map((b) => (
                  <div
                    key={b.id}
                    className="group flex items-center justify-between rounded-md bg-muted px-2 py-1.5 text-xs"
                  >
                    <span>
                      {instrumentById(b.instrumentId)?.emoji}{" "}
                      <span className="font-medium">{b.minutes}m</span>{" "}
                      <span className="text-muted-foreground">{b.focus}</span>
                    </span>
                    <button
                      onClick={() => remove(b.id)}
                      className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                      aria-label="remove block"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {dayBlocks.length === 0 && (
                  <p className="py-2 text-center text-xs text-muted-foreground/60">rest</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
