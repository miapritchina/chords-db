import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChordDiagram } from "./ChordDiagram";
import { getChord } from "./db";

const meta: Meta<typeof ChordDiagram> = {
  title: "Chords/ChordDiagram",
  component: ChordDiagram,
  args: { showFingers: true },
  decorators: [(Story) => <div style={{ width: 180 }}>{Story()}</div>],
};

export default meta;
type Story = StoryObj<typeof ChordDiagram>;

const cGuitar = getChord("guitar", "C", "major")!;
const fGuitar = getChord("guitar", "F", "major")!;
const cUke = getChord("ukulele", "C", "major")!;
const gBari = getChord("baritone-ukulele", "G", "major")!;

export const OpenChord: Story = {
  args: {
    position: cGuitar.positions[0],
    strings: 6,
    tuning: ["E2", "A2", "D3", "G3", "B3", "E4"],
  },
};

export const BarreChord: Story = {
  args: {
    position: fGuitar.positions[0],
    strings: 6,
    tuning: ["E2", "A2", "D3", "G3", "B3", "E4"],
  },
};

export const HighPosition: Story = {
  args: {
    position: cGuitar.positions[3] ?? cGuitar.positions[cGuitar.positions.length - 1],
    strings: 6,
  },
};

export const Ukulele: Story = {
  args: {
    position: cUke.positions[0],
    strings: 4,
    tuning: ["G4", "C4", "E4", "A4"],
  },
};

export const BaritoneUkulele: Story = {
  args: {
    position: gBari.positions[0],
    strings: 4,
    tuning: ["D3", "G3", "B3", "E4"],
  },
};

export const WithoutFingers: Story = {
  args: {
    position: cGuitar.positions[0],
    strings: 6,
    showFingers: false,
  },
};
