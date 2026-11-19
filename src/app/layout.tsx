import type { Metadata, Viewport } from "next";
import { Inter_Tight, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";

const display = Inter_Tight({ variable: "--font-display", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const serif = Instrument_Serif({ variable: "--font-serif", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "Hi, I am Bano — Designer, Developer & Marketer",
  description:
    "Portfolio of Bano — creative designer, web developer (React, Next.js) and digital marketing specialist (Meta & Google Ads).",
  openGraph: {
    title: "Hi, I am Bano — Designer, Developer & Marketer",
    description: "Social campaigns, emails, company profiles and websites.",
    images: ["/case-studies/oralease/thumb.webp"],
  },
};

export const viewport: Viewport = { themeColor: "#0b0b0b" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${serif.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
