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
        cozy: {
          bg: "#F8F5F0",
          card: "#FFFFFF",
          border: "#E8E4DC",
          primary: "#1D5A5D",
          action: "#B0C423",
          text: "#333333",
          muted: "#666666",
          pill: "#E8F5E9",
          wall: "#FDF6E3",
          floor: "#F5ECD7",
        },
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
