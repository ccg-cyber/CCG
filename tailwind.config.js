/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ci: {
          bg: "#0b0d10",
          panel: "#12151a",
          panel2: "#181c22",
          border: "#242933",
          accent: "#4f7cff",
          accent2: "#7c5cff",
          text: "#e6e9ef",
          muted: "#8b93a1",
        },
      },
    },
  },
  plugins: [],
};
