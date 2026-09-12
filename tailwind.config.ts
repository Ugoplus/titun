import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17251e",
        cream: "#f4f0e7",
        leaf: "#214f3d",
        citron: "#d8ff3e",
        clay: "#c77452",
        clayInk: "#8f452f",
        sand: "#e8e2d7",
        linen: "#efe9df",
        lavender: "#d8c8ef",
        mint: "#b6e6dc",
        peach: "#f1c6a8",
        gold: "#d7b85c",
        canvas: "#e7e2d7",
        oat: "#ddd6c8",
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
