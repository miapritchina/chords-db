import { midiToFrequency } from "@/modules/chords/notes";

/**
 * Tiny Web Audio synth — enough to hear chords, notes and melodies without
 * any dependencies. Three voices approximate the instrument families:
 *   pluck  — strings, keys, kalimba
 *   breath — ocarina, dizi, xiao
 *   bow    — violin
 * Swap this module for a sampler later without touching callers.
 */
export type Voice = "pluck" | "breath" | "bow";

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
  voice?: Voice;
}

export function playMidiNotes(midi: number[], opts: PlayOptions = {}): void {
  const { strum = 0.045, duration = 1.6, gain = 0.16, voice = "pluck" } = opts;
  const ac = audioContext();
  const now = ac.currentTime + 0.02;
  midi.forEach((note, i) => playVoice(ac, voice, note, now + i * strum, duration, gain));
}

export function playNote(midi: number, duration = 1.0, voice: Voice = "pluck"): void {
  const ac = audioContext();
  playVoice(ac, voice, midi, ac.currentTime + 0.02, duration, 0.2);
}

export interface MelodyEvent {
  midi: number;
  /** Seconds from the start of the melody. */
  at: number;
  duration: number;
}

/** Schedule a melody with sample-accurate Web Audio timing. */
export function playMelody(events: MelodyEvent[], voice: Voice = "pluck"): void {
  const ac = audioContext();
  const start = ac.currentTime + 0.05;
  for (const e of events) {
    playVoice(ac, voice, e.midi, start + e.at, e.duration, 0.18);
  }
}

/* ------------------------------------------------------------------ */

function playVoice(
  ac: AudioContext,
  voice: Voice,
  midi: number,
  at: number,
  duration: number,
  gain: number,
): void {
  if (voice === "breath") breath(ac, midi, at, duration, gain);
  else if (voice === "bow") bow(ac, midi, at, duration, gain);
  else pluck(ac, midi, at, duration, gain);
}

/** A plucked-string-ish voice: triangle + one octave partial, fast decay. */
function pluck(ac: AudioContext, midi: number, at: number, duration: number, gain: number): void {
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

/** Flute-ish voice: soft attack, sustained sine with gentle vibrato. */
function breath(ac: AudioContext, midi: number, at: number, duration: number, gain: number): void {
  const freq = midiToFrequency(midi);
  const env = ac.createGain();
  env.gain.setValueAtTime(0, at);
  env.gain.linearRampToValueAtTime(gain, at + 0.06);
  env.gain.setValueAtTime(gain, at + Math.max(0.06, duration - 0.12));
  env.gain.linearRampToValueAtTime(0, at + duration);

  const osc = ac.createOscillator();
  osc.type = "sine";
  osc.frequency.value = freq;

  const vibrato = ac.createOscillator();
  vibrato.frequency.value = 5.2;
  const vibratoDepth = ac.createGain();
  vibratoDepth.gain.value = freq * 0.006;
  vibrato.connect(vibratoDepth).connect(osc.frequency);

  const overtone = ac.createOscillator();
  overtone.type = "sine";
  overtone.frequency.value = freq * 2;
  const overtoneGain = ac.createGain();
  overtoneGain.gain.value = 0.12;

  osc.connect(env);
  overtone.connect(overtoneGain).connect(env);
  env.connect(ac.destination);
  for (const o of [osc, vibrato, overtone]) {
    o.start(at);
    o.stop(at + duration + 0.05);
  }
}

/** Bowed-string-ish voice: filtered sawtooth, slow attack, vibrato. */
function bow(ac: AudioContext, midi: number, at: number, duration: number, gain: number): void {
  const freq = midiToFrequency(midi);
  const env = ac.createGain();
  env.gain.setValueAtTime(0, at);
  env.gain.linearRampToValueAtTime(gain * 0.8, at + 0.09);
  env.gain.setValueAtTime(gain * 0.8, at + Math.max(0.09, duration - 0.15));
  env.gain.linearRampToValueAtTime(0, at + duration);

  const osc = ac.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.value = freq;

  const vibrato = ac.createOscillator();
  vibrato.frequency.value = 5.8;
  const vibratoDepth = ac.createGain();
  vibratoDepth.gain.value = freq * 0.008;
  vibrato.connect(vibratoDepth).connect(osc.frequency);

  const lowpass = ac.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = freq * 4;
  lowpass.Q.value = 1.2;

  osc.connect(lowpass).connect(env).connect(ac.destination);
  for (const o of [osc, vibrato]) {
    o.start(at);
    o.stop(at + duration + 0.05);
  }
}
