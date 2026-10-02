import type { Metadata } from "next";
import { Anton, Caveat, Inter, Inter_Tight } from "next/font/google";
import localFont from "next/font/local";
import MenuLayer from "@/components/MenuLayer";
import "./globals.css";

/* Helvetica Bold — hero wordmark ("Mizu"); a user-supplied file, so it
   loads locally rather than from Google Fonts */
const helvetica = localFont({
  src: "./fonts/Helvetica-Bold.ttf",
  variable: "--font-helvetica",
  display: "swap",
});

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/* hero wordmark ("Mizu") — the display cut of Inter, set very light and very
   large. Inter Tight keeps the same skeletons as the body face but tracks
   tighter, so a four-letter wordmark can fill a whole column edge to edge
   without wrapping. Variable (100–900), so the weight is a class away. */
const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

/* handwritten accent — bylines + "(Overview)" label on /work/[slug] */
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MIZU — Beautiful. Useful. Autonomous.",
  description:
    "MIZU builds AI-enabled websites, apps, and agents that carry real weight in your business.",
  icons: { icon: "/mizu-icon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${inter.variable} ${interTight.variable} ${caveat.variable} ${helvetica.variable}`}
    >
      <body>
        <MenuLayer>{children}</MenuLayer>
      </body>
    </html>
  );
}
