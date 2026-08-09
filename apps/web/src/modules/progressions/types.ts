import type { ChordInstrumentId } from "@/modules/chords/types";
import type { Persisted } from "@/modules/storage";

export interface ProgressionStep {
  key: string;
  suffix: string;
  /** Index into the chord's positions array — remembers the chosen voicing. */
  position: number;
}

export interface Progression extends Persisted {
  name: string;
  instrument: ChordInstrumentId;
  steps: ProgressionStep[];
  createdAt: string;
}
