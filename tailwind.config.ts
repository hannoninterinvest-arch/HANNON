import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#060f1e",
          800: "#0a1a30",
          700: "#0f2440",
          600: "#16304f",
        },
        gold: {
          300: "#ecd7a8",
          400: "#dcb977",
          500: "#c9a35c",
        },
        ivory: "#f6f4ef",
        muted: "#9fb0c4",
        "muted-dark": "#6d7c92",
      },
    fontFamily: {
      sans: ["var(--font-jost)"],
      serif: ["var(--font-cormorant)"],
    },
      maxWidth: {
        wrap: "1240px",
      },
    },
  },
  plugins: [],
};
export default config;
