/**
 * Fingering charts for wind instruments, as plain data so they're easy to
 * correct for your specific instrument (makers differ, especially for
 * pendant ocarinas). Hole values: 1 = covered, 0.5 = half-hole, 0 = open.
 * Hole arrays run from the hole nearest the mouthpiece downward.
 */
export type HoleState = 0 | 0.5 | 1;

export interface Fingering {
  midi: number;
  holes: HoleState[];
  /** Second-register note: same fingering, blown harder / overblown. */
  overblow?: boolean;
}

export interface WindChart {
  instrumentId: string;
  title: string;
  holeLabels: string[];
  /** Indices into holeLabels that are thumb holes (drawn offset). */
  thumbs: number[];
  fingerings: Fingering[];
  note?: string;
}

/** 6-hole English pendant ocarina in C (two thumbs, four fingers). */
export const OCARINA_6: WindChart = {
  instrumentId: "ocarina",
  title: "6-hole ocarina (C)",
  holeLabels: ["LT", "RT", "L1", "L2", "R1", "R2"],
  thumbs: [0, 1],
  note: "English fingering; pendant makers vary — edit fingerings.ts to match yours",
  fingerings: [
    { midi: 72, holes: [1, 1, 1, 1, 1, 1] }, // C5
    { midi: 74, holes: [1, 1, 1, 1, 1, 0] }, // D5
    { midi: 76, holes: [1, 1, 1, 1, 0, 0] }, // E5
    { midi: 77, holes: [1, 1, 1, 0, 0, 0] }, // F5
    { midi: 79, holes: [1, 1, 0, 0, 0, 0] }, // G5
    { midi: 81, holes: [1, 0, 0, 0, 0, 0] }, // A5 — right thumb opens
    { midi: 83, holes: [0, 1, 0, 0, 0, 0] }, // B5 — left thumb opens
    { midi: 84, holes: [0, 0, 0, 0, 0, 0] }, // C6
  ],
};

/** Soprano recorder, baroque (English) fingering. */
export const RECORDER_SOPRANO: WindChart = {
  instrumentId: "recorder",
  title: "Soprano recorder (baroque)",
  holeLabels: ["T", "1", "2", "3", "4", "5", "6", "7"],
  thumbs: [0],
  note: "half-filled thumb = pinched register",
  fingerings: [
    { midi: 72, holes: [1, 1, 1, 1, 1, 1, 1, 1] }, // C5
    { midi: 74, holes: [1, 1, 1, 1, 1, 1, 1, 0] }, // D5
    { midi: 76, holes: [1, 1, 1, 1, 1, 1, 0, 0] }, // E5
    { midi: 77, holes: [1, 1, 1, 1, 1, 0, 1, 1] }, // F5
    { midi: 78, holes: [1, 1, 1, 1, 0, 1, 1, 0] }, // F#5
    { midi: 79, holes: [1, 1, 1, 1, 0, 0, 0, 0] }, // G5
    { midi: 81, holes: [1, 1, 1, 0, 0, 0, 0, 0] }, // A5
    { midi: 82, holes: [1, 1, 1, 0, 1, 1, 0, 0] }, // Bb5
    { midi: 83, holes: [1, 1, 0, 0, 0, 0, 0, 0] }, // B5
    { midi: 84, holes: [1, 0, 1, 0, 0, 0, 0, 0] }, // C6
    { midi: 86, holes: [0, 0, 1, 0, 0, 0, 0, 0] }, // D6
    { midi: 88, holes: [0.5, 1, 1, 1, 1, 1, 0, 0] }, // E6
  ],
};

/**
 * D dizi, 筒音作5 (all closed sounds A4 = sol, do = D).
 * Second octave repeats the fingerings, overblown.
 */
const DIZI_FIRST_OCTAVE: [number, HoleState[]][] = [
  [69, [1, 1, 1, 1, 1, 1]], // A4
  [71, [1, 1, 1, 1, 1, 0]], // B4
  [73, [1, 1, 1, 1, 0, 0]], // C#5
  [74, [1, 1, 1, 0, 0, 0]], // D5
  [76, [1, 1, 0, 0, 0, 0]], // E5
  [78, [1, 0, 0, 0, 0, 0]], // F#5
  [79, [0, 0, 0, 0, 0, 0]], // G5
];

export const DIZI_D: WindChart = {
  instrumentId: "dizi",
  title: "D dizi · 筒音作5",
  holeLabels: ["6", "5", "4", "3", "2", "1"],
  thumbs: [],
  note: "second octave = same fingering, faster air",
  fingerings: [
    ...DIZI_FIRST_OCTAVE.map(([midi, holes]) => ({ midi, holes })),
    ...DIZI_FIRST_OCTAVE.map(([midi, holes]) => ({
      midi: midi + 12,
      holes,
      overblow: true,
    })),
  ],
};

/** G xiao (six holes), 筒音作5 (all closed sounds D4, do = G). */
const XIAO_FIRST_OCTAVE: [number, HoleState[]][] = [
  [62, [1, 1, 1, 1, 1, 1]], // D4
  [64, [1, 1, 1, 1, 1, 0]], // E4
  [66, [1, 1, 1, 1, 0, 0]], // F#4
  [67, [1, 1, 1, 0, 0, 0]], // G4
  [69, [1, 1, 0, 0, 0, 0]], // A4
  [71, [1, 0, 0, 0, 0, 0]], // B4
  [72, [0, 0, 0, 0, 0, 0]], // C5
];

export const XIAO_G: WindChart = {
  instrumentId: "xiao",
  title: "G xiao · 筒音作5",
  holeLabels: ["6", "5", "4", "3", "2", "1"],
  thumbs: [],
  note: "second octave = same fingering, gentler overblow",
  fingerings: [
    ...XIAO_FIRST_OCTAVE.map(([midi, holes]) => ({ midi, holes })),
    ...XIAO_FIRST_OCTAVE.map(([midi, holes]) => ({
      midi: midi + 12,
      holes,
      overblow: true,
    })),
  ],
};

export const WIND_CHARTS: Record<string, WindChart> = {
  ocarina: OCARINA_6,
  recorder: RECORDER_SOPRANO,
  dizi: DIZI_D,
  xiao: XIAO_G,
};
