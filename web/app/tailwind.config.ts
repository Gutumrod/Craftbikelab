import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        headline: ["var(--font-space-grotesk)", "var(--font-noto-sans-thai)", "sans-serif"],
        body: ["var(--font-manrope)", "var(--font-noto-sans-thai)", "sans-serif"],
        label: ["var(--font-space-grotesk)", "var(--font-noto-sans-thai)", "sans-serif"],
        kanit: ["var(--font-space-grotesk)", "var(--font-noto-sans-thai)", "sans-serif"],
        space: ["var(--font-manrope)", "var(--font-noto-sans-thai)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
