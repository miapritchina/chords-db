import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatTile } from "./StatTile";

const meta: Meta<typeof StatTile> = {
  title: "Practice/StatTile",
  component: StatTile,
  decorators: [(Story) => <div style={{ width: 220 }}>{Story()}</div>],
};

export default meta;
type Story = StoryObj<typeof StatTile>;

export const Streak: Story = {
  args: { label: "streak", value: "12d", hint: "consecutive practice days" },
};

export const Minutes: Story = {
  args: { label: "this week", value: "240m", hint: "minutes, last 7 days" },
};
