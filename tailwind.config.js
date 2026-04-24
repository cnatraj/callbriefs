/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "nav-bg": "var(--nav-bg)",
        "nav-hover": "var(--nav-hover)",
        "nav-active": "var(--nav-active)",
        "ink-900": "var(--ink-900)",
        "ink-700": "var(--ink-700)",
        "ink-500": "var(--ink-500)",
        "ink-400": "var(--ink-400)",
        "ink-300": "var(--ink-300)",
        "ink-200": "var(--ink-200)",
        "ink-150": "var(--ink-150)",
        "ink-100": "var(--ink-100)",
        accent: "var(--accent)",
        "accent-strong": "var(--accent-strong)",
        "accent-ink": "var(--accent-ink)",
        ok: "var(--ok)",
        warn: "var(--warn)",
        info: "var(--info)",
        danger: "var(--danger)",
      },
      borderColor: {
        DEFAULT: "var(--ink-150)",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        sm: "var(--radius-sm)",
        xs: "var(--radius-xs)",
      },
      fontFamily: {
        sans: [
          "Geist",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
        mono: ['"Geist Mono"', "ui-monospace", "Menlo", "monospace"],
      },
      fontSize: {
        eyebrow: ["11px", { letterSpacing: "0.06em", fontWeight: "500" }],
      },
      letterSpacing: {
        body: "-0.005em",
        tight1: "-0.01em",
        tight2: "-0.015em",
        tight3: "-0.02em",
        tight4: "-0.025em",
        eyebrow: "0.06em",
      },
      boxShadow: {
        "cta-inset": "inset 0 1px 0 rgba(255,255,255,0.6)",
        cta: "0 1px 0 rgba(255,255,255,0.6) inset, 0 1px 2px rgba(40,40,20,0.08)",
        tab: "0 1px 2px rgba(0,0,0,0.04)",
        panel:
          "0 12px 40px -12px rgba(20,20,20,0.25), 0 2px 6px rgba(20,20,20,0.06)",
      },
    },
  },
  plugins: [],
};
