import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#181511",
        cream: "#f8f6f1",
        leaf: "#6b4736",
        walnut: "#6b4736",
        citron: "#d8ff3e",
        clay: "#c77452",
        clayInk: "#8f452f",
        sand: "#eee9df",
        linen: "#f3efe8",
        lavender: "#d8c8ef",
        mint: "#b6e6dc",
        peach: "#f1c6a8",
        gold: "#b39143",
        canvas: "#e9e4da",
        oat: "#ded7ca",
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "sans-serif"],
        display: ["var(--font-newsreader)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
