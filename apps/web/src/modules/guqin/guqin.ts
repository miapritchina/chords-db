/**
 * Guqin geometry and pitch math.
 *
 * Standard tuning (zheng diao 正调): C2 D2 F2 G2 A2 C3 D3, string 1 lowest.
 * The 13 hui 徽 are inlaid at the harmonic nodes of the string; pressing at
 * hui n leaves HUI_FRACTIONS[n-1] of the string vibrating (plucking side is
 * at the yueshan 岳山, the right end), so the stopped pitch is the open
 * string raised by 1/fraction — just intonation, which we map to the nearest
 * equal-tempered midi note with its cents deviation.
 */
export const GUQIN_TUNING = [36, 38, 41, 43, 45, 48, 50]; // C2 D2 F2 G2 A2 C3 D3

/** Remaining vibrating length when pressed at hui 1..13. */
export const HUI_FRACTIONS = [
  1 / 8, 1 / 6, 1 / 5, 1 / 4, 1 / 3, 2 / 5, 1 / 2,
  3 / 5, 2 / 3, 3 / 4, 4 / 5, 5 / 6, 7 / 8,
];

export interface GuqinPosition {
  string: number; // 1..7 (1 = lowest/thickest)
  hui: number | null; // null = open string
  midi: number; // nearest equal-tempered note
  cents: number; // deviation of the just pitch from that note
}

export function stoppedPitch(openMidi: number, hui: number): { midi: number; cents: number } {
  const ratio = 1 / HUI_FRACTIONS[hui - 1];
  const semis = 12 * Math.log2(ratio);
  const midi = Math.round(openMidi + semis);
  const cents = Math.round((openMidi + semis - midi) * 100);
  return { midi, cents };
}

/** X position of hui n along the string, 0 = left (dragon gums), 1 = right (yueshan). */
export function huiX(hui: number): number {
  return 1 - HUI_FRACTIONS[hui - 1];
}

/**
 * All open and stopped positions. Stopped notes whose just pitch strays
 * more than `maxCents` from equal temperament are dropped — they exist,
 * but marking them as "the" note would be dishonest.
 */
export function allPositions(maxCents = 20): GuqinPosition[] {
  const out: GuqinPosition[] = [];
  GUQIN_TUNING.forEach((open, i) => {
    out.push({ string: i + 1, hui: null, midi: open, cents: 0 });
    for (let hui = 1; hui <= 13; hui++) {
      const { midi, cents } = stoppedPitch(open, hui);
      if (Math.abs(cents) <= maxCents) {
        out.push({ string: i + 1, hui, midi, cents });
      }
    }
  });
  return out;
}
