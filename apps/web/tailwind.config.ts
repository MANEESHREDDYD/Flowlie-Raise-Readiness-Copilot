import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#050505",
        panel: "#0a0a0a",
        borderDark: "rgba(255,255,255,0.08)",
        borderHover: "rgba(255,255,255,0.15)"
      },
      boxShadow: {
        glow: "none",
        subtle: "0 4px 20px rgba(0,0,0,0.5)"
      }
    }
  },
  plugins: []
};
export default config;
