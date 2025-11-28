import { Font } from "@react-pdf/renderer";
import { Inter, Changa_One } from "next/font/google";

export const inter = Inter({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const anton_sc = Changa_One({
  weight: ["400"],
  subsets: ["latin"],
});

// Titan_One
// Coda
// Changa_One
// Righteous
// Passion_One

// GEIST
Font.register({
  family: "Geist",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/geist-sans@5.0.3/files/geist-sans-latin-400-normal.woff",
      fontWeight: 400,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/geist-sans@5.0.3/files/geist-sans-latin-700-normal.woff",
      fontWeight: 700,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/geist-sans@5.0.3/files/geist-sans-latin-900-normal.woff",
      fontWeight: 900,
    },
  ],
});

