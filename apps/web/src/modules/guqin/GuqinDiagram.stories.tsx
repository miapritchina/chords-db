import type { Meta, StoryObj } from "@storybook/react-vite";
import { GuqinDiagram } from "./GuqinDiagram";
import { scaleById, scalePitchClasses } from "@/modules/scales/scales";

const cGong = new Set(scalePitchClasses(0, scaleById("gong")));
const aYu = new Set(scalePitchClasses(9, scaleById("yu")));
const fMajor = new Set(scalePitchClasses(5, scaleById("major")));

const meta: Meta = { title: "Guqin/Diagram" };
export default meta;

export const CGong: StoryObj = {
  render: () => (
    <div style={{ width: 720 }}>
      <GuqinDiagram highlight={cGong} rootPc={0} />
    </div>
  ),
};

export const AYu: StoryObj = {
  render: () => (
    <div style={{ width: 720 }}>
      <GuqinDiagram highlight={aYu} rootPc={9} />
    </div>
  ),
};

export const FMajor: StoryObj = {
  render: () => (
    <div style={{ width: 720 }}>
      <GuqinDiagram highlight={fMajor} rootPc={5} />
    </div>
  ),
};
