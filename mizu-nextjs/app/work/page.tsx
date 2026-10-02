import type { Metadata } from "next";
import Cursor from "@/components/Cursor";
import AllWork from "@/components/AllWork";

export const metadata: Metadata = {
  title: "Work — MIZU",
  description:
    "All MIZU projects — websites, mobile apps, experiential and e-commerce work.",
};

/* AllWork includes the compact masthead, project archive and shared footer. */
export default function WorkPage() {
  return (
    <>
      <Cursor />
      <AllWork />
    </>
  );
}
