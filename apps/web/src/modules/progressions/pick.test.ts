import { describe, expect, it } from "vitest";
import { pickProgressionInstrument } from "./pick";

describe("pickProgressionInstrument", () => {
  it("prefers a played instrument when it covers the chords", () => {
    // C, F, G major all exist in the derived baritone db
    const { instrument, covered } = pickProgressionInstrument([
      { key: "C", suffix: "major" },
      { key: "F", suffix: "major" },
      { key: "G", suffix: "major" },
    ]);
    expect(instrument).toBe("baritone-ukulele");
    expect(covered).toBe(3);
  });

  it("never returns a reference instrument unless coverage is strictly better", () => {
    const { instrument } = pickProgressionInstrument([{ key: "C", suffix: "major" }]);
    expect(instrument).toBe("baritone-ukulele");
  });
});
