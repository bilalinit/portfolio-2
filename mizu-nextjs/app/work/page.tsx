import type { Metadata } from "next";
import Cursor from "@/components/Cursor";
import AllWork from "@/components/AllWork";

export const metadata: Metadata = {
  title: "Work — MIZU",
  description:
    "All MIZU projects — websites, mobile apps, experiential and e-commerce work.",
};

/* /work — the "See all work" target from the work drop-down.
   Deliberately shell-less: no hero wordmark and no footer — the back
   link lives at the top of the dark grid section itself. The cursor
   stays, since the site-wide cursor:none rule depends on it on desktop. */
export default function WorkPage() {
  return (
    <>
      <Cursor />
      <AllWork />
    </>
  );
}
