import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        md: "2rem",
        lg: "3rem",
      },
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // Brand palette — kept tight on purpose.
        // Navy = the only primary; teal = the only accent.
        navy: {
          DEFAULT: "#1a365d",
          50: "#f1f5fa",
          100: "#dde7f3",
          200: "#b6cbe2",
          300: "#88a9ce",
          400: "#5380b3",
          500: "#2f5e96",
          600: "#1a365d",
          700: "#162d4d",
          800: "#11233c",
          900: "#0c1a2c",
        },
        teal: {
          DEFAULT: "#14b8a6",
          50: "#effdfa",
          100: "#cdf9f0",
          200: "#9af1e1",
          300: "#5fe1cd",
          400: "#2fc7b3",
          500: "#14b8a6",
          600: "#0c8b80",
          700: "#0d6f68",
          800: "#0e5852",
          900: "#0f4944",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
