import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        "otto-bg":        "#f0f4f8",
        "otto-surface":   "#ffffff",
        "otto-primary":   "#0d6d6d",
        "otto-primary-dk":"#0a4c4f",
        "otto-text":      "#1a2b2c",
        "otto-muted":     "#56717a",
        "otto-border":    "#d0dde0",
        "otto-success":   "#1c7a52",
        "otto-warn":      "#b15624",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
