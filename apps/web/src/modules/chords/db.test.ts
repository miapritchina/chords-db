import { describe, expect, it } from "vitest";
import { baritoneUkulele, dbKeyIndex, deriveBaritoneUkulele, getChord, guitar } from "./db";
import { midiToNote, midiToPitchClass, noteToMidi, transposeKey } from "./notes";

describe("notes", () => {
  it("parses and formats midi round-trip", () => {
    expect(noteToMidi("C4")).toBe(60);
    expect(noteToMidi("E2")).toBe(40);
    expect(midiToNote(60)).toBe("C4");
    expect(midiToNote(68)).toBe("Ab4");
    expect(midiToPitchClass(61)).toBe("C#");
  });

  it("transposes keys within the chords-db spelling set", () => {
    expect(transposeKey("C", 2)).toBe("D");
    expect(transposeKey("B", 1)).toBe("C");
    expect(transposeKey("C", -1)).toBe("B");
    expect(transposeKey("G", 8)).toBe("Eb");
  });
});

describe("chord db", () => {
  it("indexes sharp keys the chords-db way", () => {
    expect(dbKeyIndex("C#")).toBe("Csharp");
    expect(getChord("guitar", "C#", "major")?.key).toBe("C#");
  });

  it("finds C major on every instrument", () => {
    for (const instrument of ["guitar", "ukulele", "baritone-ukulele"] as const) {
      const chord = getChord(instrument, "C", "major");
      expect(chord, instrument).toBeDefined();
      expect(chord!.positions.length).toBeGreaterThan(0);
    }
  });
});

describe("baritone ukulele derivation", () => {
  it("keeps only guitar voicings with both low strings muted", () => {
    for (const list of Object.values(baritoneUkulele.chords)) {
      for (const chord of list) {
        for (const p of chord.positions) {
          expect(p.frets).toHaveLength(4);
          expect(p.fingers).toHaveLength(4);
        }
      }
    }
  });

  it("reports a consistent chord count", () => {
    const derived = deriveBaritoneUkulele(guitar);
    const total = Object.values(derived.chords).flat().length;
    expect(derived.main.numberOfChords).toBe(total);
    expect(total).toBeGreaterThan(100);
  });
});
