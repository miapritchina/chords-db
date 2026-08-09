import { useCallback, useEffect, useRef, useState } from "react";

export interface MidiNoteEvent {
  note: number;
  velocity: number;
  on: boolean;
}

export type MidiStatus = "unsupported" | "idle" | "requesting" | "ready" | "denied";

/**
 * Web MIDI input as a hook. Connection is user-initiated (browsers show a
 * permission prompt). Subscribers get note on/off events from every
 * connected input; `heldNotes` tracks currently sounding notes for
 * chord-matching exercises.
 */
export function useMidi() {
  const [status, setStatus] = useState<MidiStatus>(
    typeof navigator !== "undefined" && "requestMIDIAccess" in navigator
      ? "idle"
      : "unsupported",
  );
  const [inputs, setInputs] = useState<string[]>([]);
  const [heldNotes, setHeldNotes] = useState<number[]>([]);
  const [lastEvent, setLastEvent] = useState<MidiNoteEvent | null>(null);
  const accessRef = useRef<MIDIAccess | null>(null);

  const connect = useCallback(async () => {
    if (!("requestMIDIAccess" in navigator)) return;
    setStatus("requesting");
    try {
      const access = await navigator.requestMIDIAccess();
      accessRef.current = access;
      const wire = () => {
        const names: string[] = [];
        access.inputs.forEach((input) => {
          names.push(input.name ?? "unnamed input");
          input.onmidimessage = (e: MIDIMessageEvent) => {
            const data = e.data;
            if (!data || data.length < 3) return;
            const cmd = data[0] & 0xf0;
            const note = data[1];
            const velocity = data[2];
            if (cmd === 0x90 && velocity > 0) {
              setHeldNotes((held) => (held.includes(note) ? held : [...held, note].sort((a, b) => a - b)));
              setLastEvent({ note, velocity, on: true });
            } else if (cmd === 0x80 || (cmd === 0x90 && velocity === 0)) {
              setHeldNotes((held) => held.filter((n) => n !== note));
              setLastEvent({ note, velocity, on: false });
            }
          };
        });
        setInputs(names);
      };
      wire();
      access.onstatechange = wire;
      setStatus("ready");
    } catch {
      setStatus("denied");
    }
  }, []);

  useEffect(
    () => () => {
      accessRef.current?.inputs.forEach((input) => {
        input.onmidimessage = null;
      });
    },
    [],
  );

  return { status, inputs, heldNotes, lastEvent, connect };
}
