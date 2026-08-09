/**
 * Physical layout of a standard 17-key kalimba in C.
 * Tines hold the C-major diatonic notes C4…E6; the longest (lowest) tine
 * sits in the middle and notes ascend outward, alternating right and left.
 */
const DIATONIC_C = [0, 2, 4, 5, 7, 9, 11]; // C D E F G A B pitch classes

export interface KalimbaTine {
  midi: number;
  /** 0-based physical slot, left to right. */
  slot: number;
  /** 0 = centre (longest); higher = shorter tine. */
  distance: number;
}

export function kalimbaTines(count = 17, lowMidi = 60): KalimbaTine[] {
  // Ascending diatonic notes starting at lowMidi (must be a C for the
  // standard instrument, but the math works from any diatonic root).
  const notes: number[] = [];
  let octave = Math.floor(lowMidi / 12);
  let idx = DIATONIC_C.indexOf(((lowMidi % 12) + 12) % 12);
  if (idx === -1) idx = 0;
  while (notes.length < count) {
    notes.push(octave * 12 + DIATONIC_C[idx]);
    idx += 1;
    if (idx === DIATONIC_C.length) {
      idx = 0;
      octave += 1;
    }
  }

  const centre = Math.floor((count - 1) / 2);
  return notes.map((midi, i) => {
    // note 0 sits in the centre; odd indices go right, even go left
    const offset = Math.ceil(i / 2) * (i % 2 === 1 ? 1 : -1);
    return { midi, slot: centre + offset, distance: Math.ceil(i / 2) };
  });
}
