import type { Metadata } from "next";
import Cursor from "@/components/Cursor";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import About from "@/components/About";

export const metadata: Metadata = {
  title: "About — MIZU",
  description: "A designer’s eye. A builder’s mind. The story behind MIZU, from graphic and motion design to development and agent-assisted workflows.",
};

export default function AboutPage() {
  return <><Cursor /><Hero compact /><About /><Footer /></>;
}
