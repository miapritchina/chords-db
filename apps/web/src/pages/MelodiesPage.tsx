import { useEffect, useMemo, useRef, useState } from "react";
import { Eraser, Play, Save, Sparkles, Square, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { midiToNote } from "@/modules/chords/notes";
import { playMelody, playNote } from "@/modules/audio/synth";
import { KalimbaTines } from "@/modules/instruments/KalimbaTines";
import { PianoKeys } from "@/modules/instruments/PianoKeys";
import { MELODIC_INSTRUMENTS, instrumentById } from "@/modules/instruments/registry";
import { WIND_CHARTS } from "@/modules/winds/fingerings";
import { WindFingeringChart } from "@/modules/winds/WindFingeringChart";
import { GuqinDiagram } from "@/modules/guqin/GuqinDiagram";
import {
  cellsToEvents,
  melodyDurationSec,
  sparkMelody,
  type MelodyCell,
  type SavedMelody,
} from "@/modules/melody/types";
import {
  SCALES,
  pitchClassName,
  scaleById,
  scaleNotesInRange,
  scalePitchClasses,
} from "@/modules/scales/scales";
import { newId, useCollection } from "@/modules/storage";
import { cn } from "@/lib/utils";

const STEPS = 16;
const MAX_ROWS = 15;

export function MelodiesPage() {
  const [instrumentId, setInstrumentId] = useState("kalimba");
  const [rootPc, setRootPc] = useState(0);
  const [scaleId, setScaleId] = useState("major-pentatonic");
  const [bpm, setBpm] = useState(100);
  const [cells, setCells] = useState<MelodyCell[]>([]);
  const [name, setName] = useState("");
  const [playhead, setPlayhead] = useState<number | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const melodies = useCollection<SavedMelody>("melodies");

  const instrument = instrumentById(instrumentId)!;
  const scale = scaleById(scaleId);
  const voice = instrument.voice ?? "pluck";
  const pcs = useMemo(() => new Set(scalePitchClasses(rootPc, scale)), [rootPc, scale]);

  const rows = useMemo(() => {
    const [low, high] = instrument.range ?? [60, 84];
    let notes = scaleNotesInRange(rootPc, scale, low, high);
    if (notes.length > MAX_ROWS) {
      const start = Math.floor((notes.length - MAX_ROWS) / 2);
      notes = notes.slice(start, start + MAX_ROWS);
    }
    return notes.reverse(); // high notes on top
  }, [instrument, rootPc, scale]);

  const stop = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPlayhead(null);
  };
  useEffect(() => stop, []);

  const play = () => {
    stop();
    if (cells.length === 0) return;
    playMelody(cellsToEvents(cells, bpm), voice);
    const stepMs = (60 / bpm / 2) * 1000;
    for (let s = 0; s <= STEPS; s++) {
      timers.current.push(
        setTimeout(() => setPlayhead(s < STEPS ? s : null), 50 + s * stepMs),
      );
    }
  };

  const playScale = () => {
    stop();
    const ascending = [...rows].reverse();
    playMelody(
      ascending.map((midi, i) => ({ midi, at: i * 0.28, duration: 0.5 })),
      voice,
    );
  };

  const toggle = (step: number, midi: number) => {
    setCells((prev) => {
      const hit = prev.find((c) => c.step === step && c.midi === midi);
      if (hit) return prev.filter((c) => c !== hit);
      playNote(midi, 0.4, voice);
      return [...prev, { step, midi }];
    });
  };

  const spark = () => {
    stop();
    const fresh = sparkMelody([...rows].reverse(), STEPS);
    setCells(fresh);
    playMelody(cellsToEvents(fresh, bpm), voice);
  };

  const save = () => {
    if (cells.length === 0) return;
    melodies.put({
      id: newId(),
      name: name.trim() || `${pitchClassName(rootPc)} ${scale.name} sketch`,
      instrumentId,
      scaleId,
      rootPc,
      bpm,
      steps: STEPS,
      cells,
      createdAt: new Date().toISOString(),
    });
    setName("");
  };

  const load = (m: SavedMelody) => {
    stop();
    setInstrumentId(m.instrumentId);
    setScaleId(m.scaleId);
    setRootPc(m.rootPc);
    setBpm(m.bpm);
    setCells(m.cells);
  };

  return (
    <div className="space-y-6">
      {/* pickers */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={instrumentId} onValueChange={(v) => { stop(); setInstrumentId(v); setCells([]); }}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MELODIC_INSTRUMENTS.map((i) => (
              <SelectItem key={i.id} value={i.id}>
                {i.emoji} {i.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 12 }, (_, pc) => (
            <Button
              key={pc}
              size="sm"
              variant={pc === rootPc ? "default" : "ghost"}
              className="w-9 px-0 font-display"
              onClick={() => setRootPc(pc)}
            >
              {pitchClassName(pc)}
            </Button>
          ))}
        </div>

        <Select value={scaleId} onValueChange={setScaleId}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["western", "pentatonic", "chinese"] as const).map((group) => (
              <SelectGroupItems key={group} group={group} />
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={playScale}>
          <Play /> hear scale
        </Button>
        {instrument.notes && (
          <span className="text-xs text-muted-foreground">{instrument.notes}</span>
        )}
      </div>

      {/* instrument visualizer */}
      <Card>
        <CardContent className="p-4">
          {instrument.layout === "piano" && (
            <PianoKeys
              low={60}
              high={84}
              highlight={pcs}
              rootPc={rootPc}
              onPlay={(m) => playNote(m, 0.8, voice)}
              className="mx-auto max-w-2xl"
            />
          )}
          {instrument.layout === "kalimba" && (
            <KalimbaTines
              highlight={pcs}
              rootPc={rootPc}
              onPlay={(m) => playNote(m, 0.9, voice)}
              className="mx-auto max-w-xl"
            />
          )}
          {instrument.layout === "wind" && WIND_CHARTS[instrument.id] && (
            <WindFingeringChart
              chart={WIND_CHARTS[instrument.id]}
              highlight={pcs}
              rootPc={rootPc}
              onPlay={(m) => playNote(m, 0.9, voice)}
            />
          )}
          {instrument.layout === "guqin" && (
            <GuqinDiagram
              highlight={pcs}
              rootPc={rootPc}
              onPlay={(m) => playNote(m, 1.4, voice)}
              className="mx-auto w-full max-w-3xl"
            />
          )}
          {instrument.layout === "ribbon" && (
            <div className="flex flex-wrap justify-center gap-1.5">
              {[...rows].reverse().map((midi) => {
                const root = ((midi % 12) + 12) % 12 === rootPc;
                return (
                  <button
                    key={midi}
                    onClick={() => playNote(midi, 0.8, voice)}
                    className={cn(
                      "rounded-md border px-2.5 py-2 font-display text-sm transition-colors",
                      root
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-card hover:bg-accent",
                    )}
                  >
                    {midiToNote(midi)}
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* sketcher */}
      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <CardTitle className="font-display text-xl">Melody sketcher</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              bpm
              <Input
                type="number"
                min={40}
                max={200}
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value) || 100)}
                className="w-20"
              />
            </label>
            <Button size="sm" variant="outline" onClick={play} disabled={cells.length === 0}>
              <Play /> play
            </Button>
            <Button size="sm" variant="ghost" onClick={stop} disabled={playhead === null}>
              <Square /> stop
            </Button>
            <Button size="sm" variant="secondary" onClick={spark}>
              <Sparkles /> spark
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setCells([])} disabled={cells.length === 0}>
              <Eraser /> clear
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="min-w-[560px]">
            {rows.map((midi) => (
              <div key={midi} className="flex items-center gap-0.5">
                <span
                  className={cn(
                    "w-12 shrink-0 pr-2 text-right font-display text-xs",
                    ((midi % 12) + 12) % 12 === rootPc
                      ? "font-semibold text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {midiToNote(midi)}
                </span>
                {Array.from({ length: STEPS }, (_, step) => {
                  const on = cells.some((c) => c.step === step && c.midi === midi);
                  return (
                    <button
                      key={step}
                      onClick={() => toggle(step, midi)}
                      aria-label={`${midiToNote(midi)} step ${step + 1}`}
                      className={cn(
                        "m-px h-6 flex-1 rounded-sm transition-colors",
                        on
                          ? "bg-primary"
                          : step % 4 === 0
                            ? "bg-muted hover:bg-accent"
                            : "bg-muted/50 hover:bg-accent",
                        playhead === step && "ring-2 ring-jade",
                      )}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="name this melody"
              className="w-52"
            />
            <Button size="sm" onClick={save} disabled={cells.length === 0}>
              <Save /> save
            </Button>
            <span className="ml-auto text-xs text-muted-foreground">
              {cells.length} notes · {melodyDurationSec(STEPS, bpm).toFixed(1)}s ·{" "}
              {pitchClassName(rootPc)} {scale.name} · {voice} voice
            </span>
          </div>
        </CardContent>
      </Card>

      {/* saved melodies */}
      {melodies.items.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg">Saved melodies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[...melodies.items]
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((m) => (
                <div
                  key={m.id}
                  className="flex flex-wrap items-center gap-2 rounded-lg border bg-background/50 px-3 py-2"
                >
                  <span className="font-medium">{m.name}</span>
                  <Badge variant="secondary" className="font-normal">
                    {instrumentById(m.instrumentId)?.emoji}{" "}
                    {instrumentById(m.instrumentId)?.name ?? m.instrumentId}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {pitchClassName(m.rootPc)} {scaleById(m.scaleId).name} · {m.bpm}bpm ·{" "}
                    {m.cells.length} notes
                  </span>
                  <div className="ml-auto flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        playMelody(
                          cellsToEvents(m.cells, m.bpm),
                          instrumentById(m.instrumentId)?.voice ?? "pluck",
                        )
                      }
                    >
                      <Play />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => load(m)}>
                      edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => melodies.remove(m.id)}>
                      <Trash2 className="text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SelectGroupItems({ group }: { group: "western" | "pentatonic" | "chinese" }) {
  const label = { western: "Western", pentatonic: "Pentatonic & blues", chinese: "Chinese modes" }[group];
  return (
    <>
      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{label}</div>
      {SCALES.filter((s) => s.group === group).map((s) => (
        <SelectItem key={s.id} value={s.id}>
          {s.name}
        </SelectItem>
      ))}
    </>
  );
}
