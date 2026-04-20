import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./tests/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#fdf9ef",
          2: "#f8f1df",
          3: "#f0e6cd",
        },
        ink: {
          DEFAULT: "#2a1f17",
          2: "#2a2725",
          soft: "#5a4a3a",
          muted: "#8a7a66",
        },
        rule: "#c6b494",
        accent: {
          DEFAULT: "#b8563a",
          soft: "#d47a5c",
        },
        moss: {
          DEFAULT: "#6b7a3a",
          deep: "#4a5528",
        },
        ochre: "#c99443",
        clay: "#9a5a3e",
        sage: "#6b7a3a",
        rose: "#9a5a3e",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Iowan Old Style", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
