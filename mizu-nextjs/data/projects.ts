/* ============================================================================
   Work content — the single source of truth for every project surface.
   Add or edit an entry here and the /work grid, the navbar work menu
   (featured rows + category counts + "see all" total), the category
   filter pages and the /work/[slug] case studies all update together.
   ========================================================================== */

/* thumb art kinds — one per real asset in ProjectThumb.tsx */
export type ThumbKind = "dropsync" | "gamecam";

export type WorkCategoryLabel = "Website" | "Mobile App" | "Experiential" | "E-commerce";

/* the four work-menu filters. Slugs drive /work/category/[slug]; counts
   are derived from allWork below, never hand-maintained. */
const categoryDefs: { label: WorkCategoryLabel; slug: string }[] = [
  { label: "Website", slug: "website" },
  { label: "Mobile App", slug: "mobile-app" },
  { label: "Experiential", slug: "experiential" },
  { label: "E-commerce", slug: "e-commerce" },
];

/* one card on the /work grid — and one /work/[slug] case study */
export interface WorkItem {
  slug: string;
  name: string;
  category: WorkCategoryLabel;
  year: string;
  thumb: ThumbKind;
  /** one-liner for the navbar menu's featured rows */
  blurb: string;
  /** short uppercase tag shown where the menu used to show project codes */
  tag: string;
  /** other names for this project that should link to it — e.g. the title
      used in the Nami agent's knowledge base when it differs from `name` */
  aliases?: string[];
  /** case-study overview, one paragraph per entry */
  overview: string[];
  /* real case-study media; falls back to the shared showreel */
  media?: { src: string; alt: string };
  /** public repo — when set, the chat's mention preview gains a GitHub
      button linking here; projects without one simply don't show it */
  github?: string;
  /** deployed site (or wherever the project can be tried) — makes the
      mention preview's bracket-arrow pin clickable, linking here */
  liveUrl?: string;
}

export interface WorkCategory {
  label: WorkCategoryLabel;
  slug: string; /* for /work/category/[slug] */
  count: number; /* derived — do not edit by hand */
}

/* featured projects, in navbar-menu order — slugs point into allWork */
export const featuredSlugs = ["dropsync", "game-cam"];

/* ============================================================================
   The projects. Real work only — no placeholders.
   ========================================================================== */

export const allWork: WorkItem[] = [
  {
    slug: "dropsync",
    name: "DropSync",
    category: "Website",
    year: "2026",
    thumb: "dropsync",
    blurb: "Encrypted, ephemeral file sharing with workspaces and live calls",
    tag: "Live app",
    github: "https://github.com/AhmedSaeed4/dropsync",
    liveUrl: "https://drag-drop-app.vercel.app/",
    overview: [
      "DropSync is a secure, temporary file-sharing and collaboration app we designed and built end to end. Drop files, text notes, voice memos and drawings into an encrypted space, then pick them up on any other device — or work together in shared workspaces. Everything in it is ephemeral by design: every drop carries an expiry you choose, from an hour to a full day, and when it's gone, it's gone.",
      "Privacy is the product, not a feature. Text, files and drawings are encrypted in your browser with AES-256 before they ever leave your device, and they're only decrypted on the devices meant to see them — the server passes along ciphertext it can't read. Workspaces share a single encryption key that travels by six-character invite code, so bringing someone into a team's space is as simple as typing it in.",
      "Collaboration runs deep: an encrypted group chat with quote-replies, @mentions and read receipts; live calls for up to four people with screen sharing; reminders, locked and pinned drops; drag-and-drop organization with categories, bulk moves and a 30-second undo on every delete. Two layouts and three themes keep it feeling like yours, and everything syncs across devices in real time.",
      "We built the AI inside it too. DropSync's assistant can search your drops, create and organize them on request, and answer questions about how the app works — with password-protected drops walled off behind a three-layer defense, and every request verified server-side so the model only ever acts as you.",
    ],
    media: {
      src: "/dropsync-interface-screenshot.png",
      alt: "DropSync — the drops workspace with the AI assistant open",
    },
  },
  {
    slug: "game-cam",
    name: "Game cam",
    category: "Experiential",
    year: "2026",
    thumb: "gamecam",
    blurb: "Game-style camera control recorded as clean, editable keyframes",
    tag: "Desktop",
    aliases: ["Camera Navigator CHAIN"],
    overview: [
      "Game cam is an After Effects plugin we built that puts game-style camera control into motion design. Press WASD to fly through a 3D scene, drag the mouse to look around, and the flight is recorded as real keyframes on the timeline — ready to retime, offset and polish like any other animation. First-person camera moves become as intuitive as playing a game.",
      "Under the hood it's a genuine real-time system: a C++ plugin runs inside After Effects at the application's refresh rate and talks to a control panel over a shared-memory channel, so movement and mouse-look land with sub-microsecond latency instead of the lag of the scripting route. While you fly, the viewport drops to draft resolution to keep frame rates high, then restores the moment you stop.",
      "The output is deliberately clean. Camera moves are written to a parented chain of YAW and PITCH layers, so every motion stays independently editable — change speeds, retime keyframes, or chain a new move on top without breaking what came before. Whole flight segments undo in a single step, and auto-key mode records continuously while you steer.",
    ],
  },
];

/* ============================================================================
   Everything below is derived — categories, totals and featured rows all
   read from allWork above, so counts can never drift out of sync.
   ========================================================================== */

export const workCategories: WorkCategory[] = categoryDefs.map((def) => ({
  ...def,
  count: allWork.filter((work) => work.category === def.label).length,
}));

/* total shown in the "See all work [n]" button */
export const totalWork = allWork.length;

export interface FeaturedProject {
  slug: string;
  name: string;
  blurb: string;
  tag: string;
  thumb: ThumbKind;
}

export const featuredProjects: FeaturedProject[] = featuredSlugs
  .map((slug) => allWork.find((work) => work.slug === slug))
  .filter((work): work is WorkItem => work !== undefined)
  .map((work) => ({
    slug: work.slug,
    name: work.name,
    blurb: work.blurb,
    tag: work.tag,
    thumb: work.thumb,
  }));
