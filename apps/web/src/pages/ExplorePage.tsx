import { useMemo, useState } from "react";
import { Play, Plus, Save, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChordDiagram } from "@/modules/chords/ChordDiagram";
import { chordDbs, dbKeyIndex } from "@/modules/chords/db";
import type { ChordInstrumentId } from "@/modules/chords/types";
import { playMidiNotes } from "@/modules/audio/synth";
import { CHORD_INSTRUMENTS } from "@/modules/instruments/registry";
import { useCollection, newId } from "@/modules/storage";
import type { Progression, ProgressionStep } from "@/modules/progressions/types";

export function ExplorePage() {
  const [instrument, setInstrument] = useState<ChordInstrumentId>("guitar");
  const [key, setKey] = useState("C");
  const [suffix, setSuffix] = useState("major");
  const [draft, setDraft] = useState<ProgressionStep[]>([]);
  const [draftName, setDraftName] = useState("");
  const progressions = useCollection<Progression>("progressions");

  const db = chordDbs[instrument];
  const chord = useMemo(
    () => db.chords[dbKeyIndex(key)]?.find((c) => c.suffix === suffix),
    [db, key, suffix],
  );
  const suffixesForKey = useMemo(
    () => (db.chords[dbKeyIndex(key)] ?? []).map((c) => c.suffix),
    [db, key],
  );
  const tuning = db.tunings.standard;

  const changeInstrument = (id: ChordInstrumentId) => {
    setInstrument(id);
    const next = chordDbs[id];
    if (!next.chords[dbKeyIndex(key)]?.some((c) => c.suffix === suffix)) {
      setSuffix("major");
    }
    setDraft([]);
  };

  const playDraft = () => {
    draft.forEach((step, i) => {
      const c = chordDbs[instrument].chords[dbKeyIndex(step.key)]?.find(
        (x) => x.suffix === step.suffix,
      );
      const midi = c?.positions[step.position]?.midi;
      if (midi) setTimeout(() => playMidiNotes(midi), i * 900);
    });
  };

  const saveDraft = () => {
    if (draft.length === 0) return;
    progressions.put({
      id: newId(),
      name: draftName.trim() || `${key} ${suffix} sketch`,
      instrument,
      steps: draft,
      createdAt: new Date().toISOString(),
    });
    setDraft([]);
    setDraftName("");
  };

  return (
    <div className="space-y-6">
      {/* selectors */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={instrument} onValueChange={(v) => changeInstrument(v as ChordInstrumentId)}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CHORD_INSTRUMENTS.map((i) => (
              <SelectItem key={i.id} value={i.chordDb!}>
                {i.emoji} {i.name}
                {i.played === false ? " (reference)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-wrap gap-1">
          {db.keys.map((k) => (
            <Button
              key={k}
              size="sm"
              variant={k === key ? "default" : "ghost"}
              className="w-9 px-0 font-display"
              onClick={() => setKey(k)}
            >
              {k}
            </Button>
          ))}
        </div>

        <Select value={suffix} onValueChange={setSuffix}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {suffixesForKey.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground">
          {tuning.map((t) => t.replace(/\d+$/, "")).join(" ")} ·{" "}
          {db.main.numberOfChords.toLocaleString()} chords
        </span>
      </div>

      {/* voicings */}
      {!chord ? (
        <p className="text-muted-foreground">
          No {key}
          {suffix === "major" ? "" : suffix} voicings on this instrument — try
          another suffix or instrument.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {chord.positions.map((pos, i) => (
            <Card key={i} className="group transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-display text-lg font-semibold">
                    {chord.key}
                    <span className="text-sm text-muted-foreground">
                      {chord.suffix === "major" ? "" : chord.suffix}
                    </span>
                  </span>
                  <Badge variant="secondary" className="font-normal">
                    v{i + 1}
                    {pos.capo ? " · capo" : ""}
                  </Badge>
                </div>
                <ChordDiagram position={pos} strings={db.main.strings} tuning={tuning} className="w-full" />
                <div className="mt-3 flex gap-2 opacity-70 transition-opacity group-hover:opacity-100">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => playMidiNotes(pos.midi)}>
                    <Play /> hear
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onClick={() =>
                      setDraft((d) => [...d, { key: chord.key, suffix: chord.suffix, position: i }])
                    }
                  >
                    <Plus /> add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* progression tray */}
      {draft.length > 0 && (
        <Card className="sticky bottom-4 border-primary/40 bg-card/95 shadow-lg backdrop-blur">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {draft.map((step, i) => (
                <Badge key={i} variant="outline" className="gap-1 py-1 font-display text-sm">
                  {step.key}
                  {step.suffix === "major" ? "" : step.suffix}
                  <button
                    className="ml-1 text-muted-foreground hover:text-destructive"
                    onClick={() => setDraft((d) => d.filter((_, j) => j !== i))}
                    aria-label="remove chord"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={playDraft}>
                <Play /> play
              </Button>
              <Input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="name this progression"
                className="w-44"
              />
              <Button size="sm" onClick={saveDraft}>
                <Save /> save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDraft([])}>
                <Trash2 />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
