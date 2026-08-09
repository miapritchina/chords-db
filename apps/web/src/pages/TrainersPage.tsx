import { Ear, Eye, Piano, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { midiToNote } from "@/modules/chords/notes";
import { playNote } from "@/modules/audio/synth";
import { useMidi } from "@/modules/midi/useMidi";

export function TrainersPage() {
  return (
    <div className="space-y-6">
      <MidiMonitor />

      <div className="grid gap-4 md:grid-cols-3">
        <TrainerStub
          icon={<Eye className="size-5" />}
          title="Sight reading"
          description="Notation flashcards for treble, bass and alto clef — answer on your MIDI keyboard or on screen."
        />
        <TrainerStub
          icon={<Ear className="size-5" />}
          title="Pitch"
          description="Interval and chord-quality recognition with the built-in synth; later, microphone pitch detection for winds and strings."
        />
        <TrainerStub
          icon={<Timer className="size-5" />}
          title="Rhythm"
          description="Metronome and tap-along rhythm reading with accuracy scoring via Web Audio timing."
        />
      </div>
    </div>
  );
}

/** Live Web MIDI monitor — plug in a keyboard and see/hear what you play. */
function MidiMonitor() {
  const { status, inputs, heldNotes, lastEvent, connect } = useMidi();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 font-display text-xl">
            <Piano className="size-5" /> MIDI monitor
          </CardTitle>
          <CardDescription>
            {status === "unsupported" &&
              "This browser has no Web MIDI support (Chromium-based browsers do)."}
            {status === "idle" && "Connect a MIDI keyboard to use it in the trainers."}
            {status === "requesting" && "Waiting for browser permission…"}
            {status === "denied" && "MIDI access was denied — check site permissions."}
            {status === "ready" &&
              (inputs.length > 0 ? `listening on: ${inputs.join(", ")}` : "no inputs detected — plug one in")}
          </CardDescription>
        </div>
        {status !== "ready" && status !== "unsupported" && (
          <Button onClick={connect} disabled={status === "requesting"}>
            connect
          </Button>
        )}
      </CardHeader>
      {status === "ready" && (
        <CardContent className="flex min-h-14 flex-wrap items-center gap-2">
          {heldNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">play something…</p>
          ) : (
            heldNotes.map((n) => (
              <Badge key={n} className="px-3 py-1 font-display text-base">
                {midiToNote(n)}
              </Badge>
            ))
          )}
          {lastEvent && (
            <span className="ml-auto text-xs text-muted-foreground">
              last: {midiToNote(lastEvent.note)} {lastEvent.on ? "on" : "off"} · vel{" "}
              {lastEvent.velocity}
              <Button
                size="sm"
                variant="ghost"
                className="ml-2"
                onClick={() => playNote(lastEvent.note)}
              >
                echo
              </Button>
            </span>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function TrainerStub({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          {icon} {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Badge variant="outline">coming next</Badge>
      </CardContent>
    </Card>
  );
}
