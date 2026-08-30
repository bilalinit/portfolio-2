import type { ThumbKind } from "@/data/projects";

/* Card artwork for the featured-project rows and the /work grid — one
   real asset per ThumbKind. Logo cards are pre-composed 3:4 PNGs
   (wordmark centered on the logo's own background color) so they fill
   the card with a seamless object-cover fit. To add a project: drop a
   composed card PNG in public/, add the ThumbKind here + in projects.ts. */
export default function ProjectThumb({ kind }: { kind: ThumbKind }) {
  switch (kind) {
    case "dropsync":
      return <img src="/dropsync-card.png" alt="DropSync logo" />;
    case "gamecam":
      return <img src="/gamecam-card.png" alt="Game cam logo" />;
  }
}
