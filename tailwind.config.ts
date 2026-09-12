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
