import { describe, expect, it } from "vitest";
import { kalimbaTines } from "./kalimba";
import { midiToNote } from "@/modules/chords/notes";

describe("kalimba layout", () => {
  const tines = kalimbaTines();

  it("covers C4..E6 diatonically", () => {
    const sorted = [...tines].sort((a, b) => a.midi - b.midi);
    expect(midiToNote(sorted[0].midi)).toBe("C4");
    expect(midiToNote(sorted[16].midi)).toBe("E6");
    expect(tines).toHaveLength(17);
  });

  it("puts C4 in the centre and alternates outward", () => {
    const bySlot = [...tines].sort((a, b) => a.slot - b.slot);
    expect(midiToNote(bySlot[8].midi)).toBe("C4"); // centre of 17
    expect(midiToNote(bySlot[9].midi)).toBe("D4"); // first right
    expect(midiToNote(bySlot[7].midi)).toBe("E4"); // first left
    expect(midiToNote(bySlot[16].midi)).toBe("D6"); // outermost right
    expect(midiToNote(bySlot[0].midi)).toBe("E6"); // outermost left
  });

  it("uses each slot exactly once", () => {
    expect(new Set(tines.map((t) => t.slot)).size).toBe(17);
  });
});
