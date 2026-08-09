import type { Preview } from "@storybook/react-vite";
import "../src/index.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      options: {
        paper: { name: "paper", value: "#f7f2e9" },
        ink: { name: "ink", value: "#1d1a16" },
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: "paper" },
  },
};

export default preview;
