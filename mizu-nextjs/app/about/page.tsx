import type { Metadata } from "next";
import Cursor from "@/components/Cursor";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import About from "@/components/About";

export const metadata: Metadata = {
  title: "About — MIZU",
  description: "Meet the person behind Mizu: a background in visual design and motion, now building websites, desktop and mobile apps, and AI agents.",
};

export default function AboutPage() {
  return <><Cursor /><Hero compact /><About /><Footer /></>;
}
