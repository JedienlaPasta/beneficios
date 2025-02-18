import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      gridTemplateColumns: {
        '18': 'repeat(18, minmax(0, 1fr))',
      },
      gridColumn: {
        'span-18': 'span 18 / span 18',
      },
      
    },
  },
  plugins: [],
} satisfies Config;
