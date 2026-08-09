import { Play, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChordDiagram } from "@/modules/chords/ChordDiagram";
import { chordDbs, dbKeyIndex } from "@/modules/chords/db";
import { playMidiNotes } from "@/modules/audio/synth";
import type { Progression } from "@/modules/progressions/types";
import { useCollection } from "@/modules/storage";

export function ProgressionsPage() {
  const { items, loading, remove } = useCollection<Progression>("progressions");

  const play = (p: Progression) => {
    p.steps.forEach((step, i) => {
      const chord = chordDbs[p.instrument].chords[dbKeyIndex(step.key)]?.find(
        (c) => c.suffix === step.suffix,
      );
      const midi = chord?.positions[step.position]?.midi;
      if (midi) setTimeout(() => playMidiNotes(midi), i * 900);
    });
  };

  if (loading) return <p className="text-muted-foreground">loading…</p>;

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
        <p className="font-display text-xl">No progressions yet.</p>
        <p className="mt-2 text-sm">
          Build one on the Explore page — pick voicings and press{" "}
          <Badge variant="secondary">add</Badge>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {[...items]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((p) => {
          const db = chordDbs[p.instrument];
          return (
            <Card key={p.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                <div>
                  <CardTitle className="font-display text-xl">{p.name}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {p.instrument} · {p.steps.length} chords ·{" "}
                    {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => play(p)}>
                    <Play /> play
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(p.id)}>
                    <Trash2 className="text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                {p.steps.map((step, i) => {
                  const chord = db.chords[dbKeyIndex(step.key)]?.find(
                    (c) => c.suffix === step.suffix,
                  );
                  const pos = chord?.positions[step.position];
                  if (!pos) return null;
                  return (
                    <button
                      key={i}
                      className="w-28 rounded-lg border bg-background/60 p-2 text-left transition-colors hover:border-primary"
                      onClick={() => playMidiNotes(pos.midi)}
                      title="click to hear"
                    >
                      <span className="font-display text-sm font-semibold">
                        {step.key}
                        {step.suffix === "major" ? "" : step.suffix}
                      </span>
                      <ChordDiagram position={pos} strings={db.main.strings} showFingers={false} className="w-full" />
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}
