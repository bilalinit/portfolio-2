import type { Metadata } from "next";
import { Instrument_Sans, Inter, Inter_Tight } from "next/font/google";
import MenuLayer from "@/components/MenuLayer";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

// One variable family for site copy, controls, and editorial headings.
const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

// The Skill sets section retains its original two families until redesigned.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "MIZU — Beautiful. Useful. Autonomous.",
  description:
    "I build AI-enabled websites, apps, and agents that carry real weight in your business.",
  icons: { icon: "/mizu-icon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${instrument.variable} ${inter.variable} ${interTight.variable}`}
    >
      <body>
        <MenuLayer><SmoothScroll />{children}</MenuLayer>
      </body>
    </html>
  );
}
