import { useEffect, useMemo, useState } from "react";
import { ListMusic, Play, Plus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { midiToNote } from "@/modules/chords/notes";
import { playMelody, playMidiNotes, type Voice } from "@/modules/audio/synth";
import { cellsToEvents, type MelodyCell } from "@/modules/melody/types";
import { pitchClassName, type Scale } from "@/modules/scales/scales";
import {
  suggestHarmony,
  suggestNextNotes,
  type ChordSuggestion,
  type DiatonicChord,
} from "@/modules/theory/harmony";
import { newId, useCollection } from "@/modules/storage";
import type { Progression } from "@/modules/progressions/types";
import { pickProgressionInstrument } from "@/modules/progressions/pick";
import { cn } from "@/lib/utils";

interface ComposerPanelProps {
  cells: MelodyCell[];
  /** Ascending scale notes available in the sketcher. */
  scaleNotes: number[];
  rootPc: number;
  scale: Scale;
  bpm: number;
  steps: number;
  voice: Voice;
  /** Harmony option index per segment — owned by the caller so it persists. */
  chosen: number[];
  onChosenChange: (next: number[]) => void;
  onAppend: (midi: number, step: number) => void;
}

const SEGMENTS = 4;

/** A simple low-mid voicing for hearing a suggested chord. */
function chordMidi(chord: DiatonicChord): number[] {
  const root = 48 + ((chord.rootPc + 12) % 12);
  const third = root + ((chord.pcs[1] - chord.pcs[0] + 12) % 12);
  const fifth = root + ((chord.pcs[2] - chord.pcs[0] + 12) % 12);
  return [root - 12, root, third, fifth];
}

/**
 * Composition assistant: reads the sketch, proposes the next note
 * (voice-leading heuristics) and a chord per segment (diatonic harmony
 * scored against the melody). Melody and chords stay united — suggested
 * harmony plays under the sketch and saves into the progression library.
 */
export function ComposerPanel({
  cells,
  scaleNotes,
  rootPc,
  scale,
  bpm,
  steps,
  voice,
  chosen,
  onChosenChange,
  onAppend,
}: ComposerPanelProps) {
  const progressions = useCollection<Progression>("progressions");
  const [saved, setSaved] = useState(false);

  const path = useMemo(
    () => [...cells].sort((a, b) => a.step - b.step || a.midi - b.midi).map((c) => c.midi),
    [cells],
  );
  const nextStep = cells.length > 0 ? Math.max(...cells.map((c) => c.step)) + 1 : 0;

  const nextNotes = useMemo(
    () => (nextStep < steps ? suggestNextNotes(path, scaleNotes, rootPc, scale) : []),
    [path, scaleNotes, rootPc, scale, nextStep, steps],
  );

  const segments = useMemo(() => {
    const segLen = steps / SEGMENTS;
    return Array.from({ length: SEGMENTS }, (_, s) =>
      [...cells]
        .filter((c) => c.step >= s * segLen && c.step < (s + 1) * segLen)
        .sort((a, b) => a.step - b.step)
        .map((c) => ((c.midi % 12) + 12) % 12),
    );
  }, [cells, steps]);

  const harmony = useMemo(
    () => suggestHarmony(segments, rootPc, scale).map((r) => r.slice(0, 3)),
    [segments, rootPc, scale],
  );

  useEffect(() => {
    setSaved(false);
  }, [cells, chosen, rootPc, scale.id]);

  const chosenChords = harmony.map((options, s) =>
    options[Math.min(chosen[s] ?? 0, options.length - 1)],
  );
  const hasHarmony = harmony.some((h) => h.length > 0);

  const playWithHarmony = () => {
    playMelody(cellsToEvents(cells, bpm), voice);
    const segSec = (steps / SEGMENTS) * (60 / bpm / 2);
    playMelody(
      chosenChords.flatMap((c, s) =>
        c
          ? chordMidi(c.chord).map((midi, i) => ({
              midi,
              at: s * segSec + i * 0.03,
              duration: segSec * 0.95,
            }))
          : [],
      ),
      "pluck",
    );
  };

  const saveProgression = () => {
    const chords = chosenChords.filter(Boolean) as ChordSuggestion[];
    if (chords.length === 0) return;
    const steps = chords.map((c) => ({
      key: pitchClassName(c.chord.rootPc),
      suffix: c.chord.dbSuffix,
      position: 0,
    }));
    const { instrument } = pickProgressionInstrument(steps);
    progressions.put({
      id: newId(),
      name: `${pitchClassName(rootPc)} ${scale.name} harmony`,
      instrument,
      steps,
      createdAt: new Date().toISOString(),
    });
    setSaved(true);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-xl">Composer</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* next note */}
        <div>
          <p className="mb-2 text-sm font-medium">
            Next note{cells.length === 0 ? " — start somewhere stable" : ` (step ${Math.min(nextStep + 1, steps)})`}
          </p>
          {nextStep >= steps ? (
            <p className="text-sm text-muted-foreground">The grid is full — clear a step or start a new sketch.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {nextNotes.map((n) => (
                <button
                  key={n.midi}
                  onClick={() => onAppend(n.midi, nextStep)}
                  className="group flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-left transition-colors hover:border-primary hover:bg-accent"
                >
                  <Plus className="size-3.5 text-muted-foreground group-hover:text-primary" />
                  <span className="font-display text-sm font-semibold">{midiToNote(n.midi)}</span>
                  <span className="text-xs text-muted-foreground">{n.reason}</span>
                </button>
              ))}
            </div>
          )}
          {cells.length > 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              melody so far: {path.slice(-8).map(midiToNote).join(" → ")}
              {path.length > 8 ? " (…)" : ""}
            </p>
          )}
        </div>

        {/* harmony */}
        <div>
          <p className="mb-2 text-sm font-medium">Harmony — one chord per {steps / SEGMENTS} steps</p>
          {!hasHarmony ? (
            <p className="text-sm text-muted-foreground">
              No diatonic context for this scale (blues has no parent major) — try a mode or pentatonic.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {harmony.map((options, s) => (
                  <div key={s} className="space-y-1.5">
                    <p className="text-center text-[10px] uppercase tracking-wider text-muted-foreground">
                      steps {s * (steps / SEGMENTS) + 1}–{(s + 1) * (steps / SEGMENTS)}
                    </p>
                    {options.map((opt, i) => {
                      const active = (chosen[s] ?? 0) === i;
                      return (
                        <button
                          key={opt.chord.name + i}
                          onClick={() => {
                            onChosenChange(chosen.map((v, j) => (j === s ? i : v)));
                            playMidiNotes(chordMidi(opt.chord), { duration: 1.2, gain: 0.14 });
                          }}
                          className={cn(
                            "w-full rounded-md border px-2 py-1.5 text-center transition-colors",
                            active ? "border-primary bg-primary/10" : "bg-card hover:bg-accent",
                          )}
                        >
                          <span className="font-display text-sm font-semibold">{opt.chord.name}</span>{" "}
                          <span className="text-xs text-muted-foreground">{opt.chord.numeral}</span>
                          {opt.covered.length > 0 && (
                            <span className="mt-0.5 block text-[10px] text-jade">
                              carries {opt.covered.map(pitchClassName).join(" ")}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" onClick={playWithHarmony} disabled={cells.length === 0}>
                  <Play /> melody + harmony
                </Button>
                <Button size="sm" variant="secondary" onClick={saveProgression} disabled={saved}>
                  <ListMusic /> {saved ? "saved to progressions" : "save as progression"}
                </Button>
                <Badge variant="outline" className="ml-auto font-normal text-muted-foreground">
                  <Sparkles className="mr-1 size-3" />
                  {chosenChords
                    .filter(Boolean)
                    .map((c) => c!.chord.numeral)
                    .join(" – ")}
                </Badge>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
