import type { Meta, StoryObj } from "@storybook/react-vite";
import { KalimbaTines } from "./KalimbaTines";
import { PianoKeys } from "./PianoKeys";
import { scaleById, scalePitchClasses } from "@/modules/scales/scales";

const cMajorPentatonic = new Set(scalePitchClasses(0, scaleById("major-pentatonic")));
const aYu = new Set(scalePitchClasses(9, scaleById("yu")));
const dMajor = new Set(scalePitchClasses(2, scaleById("major")));

const meta: Meta = { title: "Instruments/Visualizers" };
export default meta;

export const PianoCMajorPentatonic: StoryObj = {
  render: () => (
    <div style={{ width: 640 }}>
      <PianoKeys low={60} high={84} highlight={cMajorPentatonic} rootPc={0} />
    </div>
  ),
};

export const PianoDMajor: StoryObj = {
  render: () => (
    <div style={{ width: 640 }}>
      <PianoKeys low={60} high={84} highlight={dMajor} rootPc={2} />
    </div>
  ),
};

export const KalimbaCMajorPentatonic: StoryObj = {
  render: () => (
    <div style={{ width: 520 }}>
      <KalimbaTines highlight={cMajorPentatonic} rootPc={0} />
    </div>
  ),
};

export const KalimbaAYu: StoryObj = {
  render: () => (
    <div style={{ width: 520 }}>
      <KalimbaTines highlight={aYu} rootPc={9} />
    </div>
  ),
};
