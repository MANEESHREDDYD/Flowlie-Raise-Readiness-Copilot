import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111826",
        panel: "#111b2e",
        mint: "#5ee6b0",
        violet: "#8b7cf6"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(94,230,176,.12), 0 18px 50px rgba(0,0,0,.22)"
      }
    }
  },
  plugins: []
};
export default config;
