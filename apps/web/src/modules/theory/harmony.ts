import { pitchClassName, type Scale } from "@/modules/scales/scales";

/**
 * Small, transparent music-theory engine for composition assistance:
 * diatonic chords of the current context, harmony suggestions scored
 * against melody notes, and next-note suggestions from voice-leading
 * heuristics. Every score has a human-readable reason — no black boxes.
 */

export interface DiatonicChord {
  degree: number; // 1..7 within the harmonic context
  rootPc: number;
  pcs: [number, number, number];
  quality: "maj" | "min" | "dim" | "aug";
  name: string; // "Am"
  numeral: string; // "vi", "vii°"
  /** chords-db suffix, so suggestions link back to real voicings. */
  dbSuffix: string;
}

const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII"];

/**
 * The 7-note context harmony is built in. Seven-tone scales are their own
 * context; anhemitonic pentatonics (gong/shang/jue/zhi/yu, major/minor
 * pentatonic) sit inside a unique parent major scale, which supplies the
 * chords. Returns null for scales with no diatonic parent (e.g. blues).
 */
export function harmonyContext(
  rootPc: number,
  scale: Scale,
): { pcs: number[]; label: string } | null {
  if (scale.intervals.length === 7) {
    return {
      pcs: scale.intervals.map((i) => (rootPc + i) % 12),
      label: `${pitchClassName(rootPc)} ${scale.name}`,
    };
  }
  const spcs = [...new Set(scale.intervals.map((i) => (rootPc + i) % 12))];
  for (let r = 0; r < 12; r++) {
    const parent = new Set(MAJOR.map((i) => (r + i) % 12));
    if (spcs.every((pc) => parent.has(pc))) {
      return {
        pcs: MAJOR.map((i) => (r + i) % 12),
        label: `parent major: ${pitchClassName(r)}`,
      };
    }
  }
  return null;
}

export function diatonicChords(rootPc: number, scale: Scale): DiatonicChord[] {
  const ctx = harmonyContext(rootPc, scale);
  if (!ctx) return [];
  const s = ctx.pcs;
  return s.map((pc, i) => {
    const third = s[(i + 2) % 7];
    const fifth = s[(i + 4) % 7];
    const t = (third - pc + 12) % 12;
    const f = (fifth - pc + 12) % 12;
    const quality: DiatonicChord["quality"] =
      t === 4 && f === 7 ? "maj" : t === 3 && f === 7 ? "min" : t === 3 && f === 6 ? "dim" : "aug";
    const base = quality === "maj" || quality === "aug" ? NUMERALS[i] : NUMERALS[i].toLowerCase();
    const mark = quality === "dim" ? "°" : quality === "aug" ? "+" : "";
    const suffix = quality === "min" ? "m" : quality === "dim" ? "dim" : quality === "aug" ? "aug" : "";
    return {
      degree: i + 1,
      rootPc: pc,
      pcs: [pc, third, fifth],
      quality,
      name: pitchClassName(pc) + suffix,
      numeral: base + mark,
      dbSuffix: quality === "maj" ? "major" : quality === "min" ? "minor" : quality,
    };
  });
}

export interface ChordSuggestion {
  chord: DiatonicChord;
  score: number;
  /** Melody pitch classes this chord contains. */
  covered: number[];
}

/**
 * Rank chords for one melody segment. Chord tones score, the segment's
 * first note counts double, non-chord melody tones cost a little, and
 * tonal function (I, V, IV) breaks ties; the final segment leans cadential.
 */
export function suggestHarmony(
  segmentPcs: number[][],
  rootPc: number,
  scale: Scale,
): ChordSuggestion[][] {
  const chords = diatonicChords(rootPc, scale);
  if (chords.length === 0) return segmentPcs.map(() => []);
  const tonicIdx = chords.findIndex((c) => c.rootPc === rootPc % 12);

  return segmentPcs.map((pcs, seg) => {
    const isLast = seg === segmentPcs.length - 1;
    const ranked = chords.map((chord) => {
      const set = new Set(chord.pcs);
      let score = 0;
      const covered: number[] = [];
      pcs.forEach((pc, i) => {
        if (set.has(pc)) {
          score += i === 0 ? 3 : 2;
          covered.push(pc);
        } else {
          score -= 0.5;
        }
      });
      // functional weight relative to the melody's tonic when it's diatonic
      if (tonicIdx >= 0) {
        const rel = (chord.degree - (tonicIdx + 1) + 7) % 7; // 0=I 4=V 3=IV
        if (rel === 0) score += isLast ? 1.4 : 0.6;
        if (rel === 4) score += isLast ? 1.0 : 0.5;
        if (rel === 3) score += 0.4;
      }
      if (chord.quality === "dim") score -= 0.3;
      return { chord, score, covered: [...new Set(covered)] };
    });
    return ranked.sort((a, b) => b.score - a.score);
  });
}

export interface NoteSuggestion {
  midi: number;
  score: number;
  reason: string;
}

/**
 * Rank candidate next notes for a melody. Plain counterpoint heuristics:
 * steps beat leaps, big leaps want to resolve by step the other way,
 * the leading tone pulls up to the tonic, stable degrees (1, 3, 5) are
 * safe landings, and note-repeating is discouraged past twice.
 */
export function suggestNextNotes(
  path: number[],
  candidates: number[],
  rootPc: number,
  scale: Scale,
  limit = 4,
): NoteSuggestion[] {
  const pcOf = (m: number) => ((m % 12) + 12) % 12;
  if (path.length === 0) {
    const stable = new Set(
      [0, 2, 4].map((i) => (rootPc + (scale.intervals[i] ?? 0)) % 12),
    );
    return candidates
      .filter((m) => stable.has(pcOf(m)))
      .map((m) => ({ midi: m, score: pcOf(m) === rootPc ? 2 : 1, reason: "stable opening tone" }))
      .sort((a, b) => b.score - a.score || Math.abs(66 - a.midi) - Math.abs(66 - b.midi))
      .slice(0, limit);
  }

  const last = path[path.length - 1];
  const prev = path.length > 1 ? path[path.length - 2] : null;
  const lastLeap = prev !== null ? last - prev : 0;
  const repeats = path.length > 1 && prev === last;

  const scored = candidates.map((m) => {
    const d = m - last;
    const ad = Math.abs(d);
    let score = 0;
    let reason = "";
    let best = 0;
    const add = (s: number, r: string) => {
      score += s;
      if (s > best) {
        best = s;
        reason = r;
      }
    };

    if (ad > 0 && ad <= 2) add(3, d > 0 ? "step up" : "step down");
    else if (ad >= 3 && ad <= 5) add(1, d > 0 ? "small leap up" : "small leap down");
    else if (ad === 0) add(repeats ? -3 : 0.5, "repeated note");
    if (ad > 7) score -= 2;

    if (Math.abs(lastLeap) > 4 && ad <= 2 && Math.sign(d) === -Math.sign(lastLeap) && ad > 0) {
      add(3.5, "resolves the leap by step");
    }
    if (pcOf(last) === (rootPc + 11) % 12 && pcOf(m) === rootPc && d > 0 && d <= 2) {
      add(4, "leading tone resolves to the tonic");
    }
    if (pcOf(m) === rootPc) add(1.2, "lands on the tonic");
    else {
      const deg = scale.intervals.findIndex((i) => (rootPc + i) % 12 === pcOf(m));
      if (deg === 2 || deg === 4) add(0.8, "stable chord tone");
    }
    return { midi: m, score, reason: reason || "in the scale" };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}
