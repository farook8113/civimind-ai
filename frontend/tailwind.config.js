/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        legal: {
          bg: "#0B0F19",       // Premium Deep Dark Navy
          card: "#161F30",     // Sleek Dark Slate Card
          border: "#243249",   // Refined Blue-Grey Border
          emerald: "#10B981",  // Emerald Accent (UAE identity)
          emeraldHover: "#059669",
          gold: "#D97706",     // Amber/Gold Accent (Official legal status)
          goldHover: "#B45309",
          textPrimary: "#F3F4F6",
          textSecondary: "#9CA3AF"
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "legal-gradient": "linear-gradient(135deg, #0B0F19 0%, #111827 50%, #064E3B 100%)",
      },
    },
  },
  plugins: [],
};
