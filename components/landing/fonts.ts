import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";

/** The landing typefaces, shared by every page that wears the Leadloom scene (home, auth, legal). */
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-ll-serif", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-ll-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400"], variable: "--font-ll-mono", display: "swap" });

export const llFonts = `${serif.variable} ${sans.variable} ${mono.variable}`;
