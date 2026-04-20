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
          DEFAULT: "#F2EEE6",
          2: "#EAE4D8",
          3: "#E0D9C9",
        },
        ink: {
          DEFAULT: "#141414",
          2: "#2A2725",
          soft: "#6E665C",
        },
        rule: "#D7CFBE",
        accent: "#E8612C",
        sage: "#5F6F52",
        rose: "#B34D4D",
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
