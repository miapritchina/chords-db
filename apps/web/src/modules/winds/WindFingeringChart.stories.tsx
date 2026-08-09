import type { Meta, StoryObj } from "@storybook/react-vite";
import { WindFingeringChart } from "./WindFingeringChart";
import { DIZI_D, OCARINA_6, RECORDER_SOPRANO, XIAO_G } from "./fingerings";
import { scaleById, scalePitchClasses } from "@/modules/scales/scales";

const dMajor = new Set(scalePitchClasses(2, scaleById("major")));
const cMajor = new Set(scalePitchClasses(0, scaleById("major")));
const dGong = new Set(scalePitchClasses(2, scaleById("gong")));
const gGong = new Set(scalePitchClasses(7, scaleById("gong")));

const meta: Meta = { title: "Winds/FingeringChart" };
export default meta;

export const OcarinaCMajor: StoryObj = {
  render: () => <WindFingeringChart chart={OCARINA_6} highlight={cMajor} rootPc={0} />,
};

export const RecorderCMajor: StoryObj = {
  render: () => <WindFingeringChart chart={RECORDER_SOPRANO} highlight={cMajor} rootPc={0} />,
};

export const DiziDGong: StoryObj = {
  render: () => <WindFingeringChart chart={DIZI_D} highlight={dGong} rootPc={2} />,
};

export const DiziDMajor: StoryObj = {
  render: () => <WindFingeringChart chart={DIZI_D} highlight={dMajor} rootPc={2} />,
};

export const XiaoGGong: StoryObj = {
  render: () => <WindFingeringChart chart={XIAO_G} highlight={gGong} rootPc={7} />,
};
