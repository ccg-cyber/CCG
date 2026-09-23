/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // A professional, light business-software palette — the default
        // "dark hacker tool" look reads as a dev toy, not something you'd
        // deploy company-wide. Every module reads these tokens rather than
        // literal colors, so this one file re-skins the entire product.
        ci: {
          bg: "#f4f5f8",
          panel: "#ffffff",
          panel2: "#f1f2f6",
          border: "#e1e4ea",
          accent: "#3457d5",
          accent2: "#6d4fd1",
          text: "#1a1f27",
          muted: "#5b6472",
        },
      },
    },
  },
  plugins: [],
};
