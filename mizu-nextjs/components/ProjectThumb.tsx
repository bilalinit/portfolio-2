import type { ThumbKind } from "@/data/projects";

/* Card artwork for the featured-project rows, the /work grid and the
   chat's mention preview — one real asset per ThumbKind. Logo cards are
   pre-composed 3:4 SVGs (vector wordmark centered on the logo's own
   background color) so they fill a card with a seamless object-cover
   fit and stay crisp at every render size. To add a project: drop a
   composed card SVG in public/, add the ThumbKind here + in
   projects.ts. */
export const THUMB_SRC: Record<ThumbKind, string> = {
  dropsync: "/dropsync-card.svg",
  gamecam: "/gamecam-card.svg",
  warda: "/warda-site.jpg",
  promptly: "/promptly-card.svg",
  "promptly-mobile": "/promptly-mobile-card.svg",
};

const THUMB_ALT: Record<ThumbKind, string> = {
  dropsync: "DropSync logo",
  gamecam: "Game cam logo",
  warda: "Warda teaching studio website",
  promptly: "Promptly voice recording artwork",
  "promptly-mobile": "Promptly Mobile floating recording button artwork",
};

export default function ProjectThumb({ kind }: { kind: ThumbKind }) {
  return <img src={THUMB_SRC[kind]} alt={THUMB_ALT[kind]} />;
}
