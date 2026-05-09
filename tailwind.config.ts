import type { Config } from "tailwindcss";

// All semantic colors are CSS variables so the active theme can swap them.
// Variables are defined per-theme in src/app/globals.css.
const cssColor = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: cssColor("--ink-950"),
          900: cssColor("--ink-900"),
          850: cssColor("--ink-850"),
          800: cssColor("--ink-800"),
          700: cssColor("--ink-700"),
          600: cssColor("--ink-600"),
          500: cssColor("--ink-500"),
          400: cssColor("--ink-400"),
        },
        parchment: {
          50: cssColor("--parchment-50"),
          100: cssColor("--parchment-100"),
          200: cssColor("--parchment-200"),
        },
        ember: {
          400: cssColor("--ember-400"),
          500: cssColor("--ember-500"),
          600: cssColor("--ember-600"),
        },
        rune: {
          300: cssColor("--rune-300"),
          400: cssColor("--rune-400"),
          500: cssColor("--rune-500"),
          600: cssColor("--rune-600"),
        },
        moss: {
          400: cssColor("--moss-400"),
          500: cssColor("--moss-500"),
        },
        blood: {
          500: cssColor("--blood-500"),
          600: cssColor("--blood-600"),
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "rune-gradient":
          "radial-gradient(circle at 20% 0%, rgb(var(--rune-400) / 0.12), transparent 45%), radial-gradient(circle at 80% 100%, rgb(var(--ember-500) / 0.10), transparent 50%)",
        "card-gradient":
          "linear-gradient(135deg, rgb(var(--ink-700) / 0.85) 0%, rgb(var(--ink-900) / 0.85) 100%)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgb(var(--rune-400) / 0.25), 0 12px 40px -12px rgb(var(--rune-400) / 0.35)",
        ember:
          "0 0 0 1px rgb(var(--ember-500) / 0.25), 0 12px 40px -12px rgb(var(--ember-500) / 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
