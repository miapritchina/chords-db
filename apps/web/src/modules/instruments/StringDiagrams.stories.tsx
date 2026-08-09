import type { Meta, StoryObj } from "@storybook/react-vite";
import { FretboardDiagram } from "./FretboardDiagram";
import { HarpStrings } from "./HarpStrings";
import { melodyTrace } from "@/modules/melody/trace";
import { scaleById, scalePitchClasses } from "@/modules/scales/scales";

const cMajorPentatonic = new Set(scalePitchClasses(0, scaleById("major-pentatonic")));
const aMinor = new Set(scalePitchClasses(9, scaleById("minor")));
const dMajor = new Set(scalePitchClasses(2, scaleById("major")));

const demoTrace = melodyTrace([
  { step: 0, midi: 60 },
  { step: 2, midi: 64 },
  { step: 4, midi: 67 },
  { step: 6, midi: 72 },
  { step: 8, midi: 69 },
]);

const meta: Meta = { title: "Instruments/StringDiagrams" };
export default meta;

export const GuitarCMajorPentatonic: StoryObj = {
  render: () => (
    <div style={{ width: 640 }}>
      <FretboardDiagram
        tuning={["E2", "A2", "D3", "G3", "B3", "E4"]}
        highlight={cMajorPentatonic}
        rootPc={0}
      />
    </div>
  ),
};

export const GuitarWithMelodyTrace: StoryObj = {
  render: () => (
    <div style={{ width: 640 }}>
      <FretboardDiagram
        tuning={["E2", "A2", "D3", "G3", "B3", "E4"]}
        highlight={cMajorPentatonic}
        rootPc={0}
        trace={demoTrace}
      />
    </div>
  ),
};

export const ViolinDMajorFretless: StoryObj = {
  render: () => (
    <div style={{ width: 640 }}>
      <FretboardDiagram
        tuning={["G3", "D4", "A4", "E5"]}
        fretless
        highlight={dMajor}
        rootPc={2}
      />
    </div>
  ),
};

export const HarpsicleAMinor: StoryObj = {
  render: () => (
    <div style={{ width: 640 }}>
      <HarpStrings highlight={aMinor} rootPc={9} />
    </div>
  ),
};

export const HarpsicleWithTrace: StoryObj = {
  render: () => (
    <div style={{ width: 640 }}>
      <HarpStrings highlight={cMajorPentatonic} rootPc={0} trace={demoTrace} />
    </div>
  ),
};
