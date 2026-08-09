import { midiToFrequency } from "@/modules/chords/notes";

/**
 * Tiny Web Audio synth — enough to hear a chord or a note without any
 * dependencies. Deliberately stateless per note so it can be swapped for a
 * sampler later without touching callers.
 */
let ctx: AudioContext | null = null;

function audioContext(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export interface PlayOptions {
  /** Seconds between successive notes; 0 = block chord. */
  strum?: number;
  duration?: number;
  gain?: number;
}

export function playMidiNotes(midi: number[], opts: PlayOptions = {}): void {
  const { strum = 0.045, duration = 1.6, gain = 0.16 } = opts;
  const ac = audioContext();
  const now = ac.currentTime + 0.02;
  midi.forEach((note, i) => pluck(ac, note, now + i * strum, duration, gain));
}

export function playNote(midi: number, duration = 1.0): void {
  const ac = audioContext();
  pluck(ac, midi, ac.currentTime + 0.02, duration, 0.2);
}

/** A plucked-string-ish voice: triangle + one octave partial, fast decay. */
function pluck(
  ac: AudioContext,
  midi: number,
  at: number,
  duration: number,
  gain: number,
): void {
  const freq = midiToFrequency(midi);
  const env = ac.createGain();
  env.gain.setValueAtTime(0, at);
  env.gain.linearRampToValueAtTime(gain, at + 0.008);
  env.gain.exponentialRampToValueAtTime(0.0001, at + duration);

  const lowpass = ac.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.setValueAtTime(freq * 6, at);
  lowpass.frequency.exponentialRampToValueAtTime(freq * 1.5, at + duration);

  for (const [mult, level, type] of [
    [1, 1, "triangle"],
    [2, 0.35, "sine"],
  ] as const) {
    const osc = ac.createOscillator();
    osc.type = type;
    osc.frequency.value = freq * mult;
    const partial = ac.createGain();
    partial.gain.value = level;
    osc.connect(partial).connect(lowpass);
    osc.start(at);
    osc.stop(at + duration + 0.1);
  }
  lowpass.connect(env).connect(ac.destination);
}
