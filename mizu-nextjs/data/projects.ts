/* ============================================================================
   Work content — the single source of truth for every project surface.
   Add or edit an entry here and the /work grid, the navbar work menu
   (featured rows + category counts + "see all" total), the category
   filter pages and the /work/[slug] case studies all update together.
   ========================================================================== */

/* thumb art kinds — one per real asset in ProjectThumb.tsx */
export type ThumbKind = "dropsync" | "gamecam" | "warda" | "promptly" | "promptly-mobile";

export type WorkCategoryLabel = "Website" | "Desktop App" | "Mobile App" | "Experiential" | "E-commerce";

/* the work-menu filters. Slugs drive /work/category/[slug]; counts
   are derived from allWork below, never hand-maintained. */
const categoryDefs: { label: WorkCategoryLabel; slug: string }[] = [
  { label: "Website", slug: "website" },
  { label: "Desktop App", slug: "desktop-app" },
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
    /* Without this the chat's mention-preview pin rendered as an inert
       <span> — it looked like the DropSync arrow but went nowhere, because
       the arrow is a real link only when liveUrl is set. The deployed build
       is the trial download, so this is the URL it should open. */
    liveUrl: "https://game-cam-six.vercel.app/",
    overview: [
      "Game cam is an After Effects plugin we built that puts game-style camera control into motion design. Press WASD to fly through a 3D scene, drag the mouse to look around, and the flight is recorded as real keyframes on the timeline — ready to retime, offset and polish like any other animation. First-person camera moves become as intuitive as playing a game.",
      "Under the hood it's a genuine real-time system: a C++ plugin runs inside After Effects at the application's refresh rate and talks to a control panel over a shared-memory channel, so movement and mouse-look land with sub-microsecond latency instead of the lag of the scripting route. While you fly, the viewport drops to draft resolution to keep frame rates high, then restores the moment you stop.",
      "The output is deliberately clean. Camera moves are written to a parented chain of YAW and PITCH layers, so every motion stays independently editable — change speeds, retime keyframes, or chain a new move on top without breaking what came before. Whole flight segments undo in a single step, and auto-key mode records continuously while you steer.",
    ],
  },
  {
    slug: "warda",
    name: "Warda",
    category: "Website",
    year: "2026",
    thumb: "warda",
    blurb: "A welcoming home for Quran learning, with student stories and a bilingual AI assistant",
    tag: "Teaching studio",
    aliases: ["Wardah", "Ustadhah Wardah"],
    overview: [
      "Warda is the online home of Wardah, a professional Quran and Tajweed teacher. We created a calm, welcoming website that introduces her teaching approach, explains the learning tracks and helps prospective students book a class through WhatsApp. An emerald palette, considered typography and subtle motion give the studio a clear, personal identity in both light and dark themes.",
      "The experience brings lessons, common questions and student stories together. Students can sign in with Google to share a review, see it appear live on the Wall of Love, and manage their own stories from a protected profile page. Firebase Authentication and Firestore support the experience behind the scenes.",
      "A purpose-built AI assistant answers course and scheduling questions in English or Roman Urdu. It keeps the conversation focused on the studio, directs booking and pricing enquiries to Wardah, and leaves religious rulings to the teacher herself. The website and assistant were built with Next.js, React, Firebase and a Python API using the OpenAI Agents SDK.",
    ],
    media: { src: "/warda-site.jpg", alt: "Warda teaching studio website concept in an emerald and cream palette" },
  },
  {
    slug: "promptly",
    name: "Promptly",
    category: "Desktop App",
    year: "2026",
    thumb: "promptly",
    blurb: "Speak a thought. Turn it into clean text in the window you're already using",
    tag: "Windows",
    overview: [
      "Promptly is a Windows desktop app that turns your voice into text wherever you work. Press a global hotkey, speak, then press it again: your words are transcribed and pasted into the active terminal, editor, browser or chat app. It lives quietly in the system tray, with a compact, draggable overlay that shows when it is recording, transcribing or done.",
      "Optional AI polish removes filler words and cleans up grammar and punctuation while preserving your meaning and language. A personal word list helps it recognise names, brands and technical terms. You can choose between two overlay designs, change the hotkey, control automatic pasting and have the app start with Windows.",
      "Built with Python and PyQt6, Promptly records audio and transcribes it through Groq's Whisper API in a background thread so the interface stays responsive. Native Windows hotkeys and paste controls connect it to the apps you already use. The desktop release is packaged as a portable executable, with first-launch settings for your own API key.",
    ],
    media: { src: "/promptly-card.svg", alt: "Promptly voice recording concept with an audio waveform and compact desktop overlay" },
  },
  {
    slug: "promptly-mobile",
    name: "Promptly Mobile",
    category: "Mobile App",
    year: "2026",
    thumb: "promptly-mobile",
    blurb: "Voice-to-text from a floating button, ready to paste anywhere on Android",
    tag: "Android",
    github: "https://github.com/AhmedSaeed4/promptly-mobile",
    liveUrl: "https://github.com/AhmedSaeed4/promptly-mobile/releases",
    overview: [
      "Promptly Mobile brings the same speak-to-text workflow to Android. A small floating button stays within reach over the app you're using: tap to record, tap again to stop, then paste the finished text from your clipboard. Colour changes communicate recording, transcription and a saved recording waiting for a connection.",
      "The app includes optional AI text polish and a personal word list, plus quick settings buttons for recording and showing the floating control. Drag the bubble to dismiss it when you're finished. When the bubble is hidden, the app sleeps until you need it again.",
      "Built for Android 8.0 and later, it uses Groq's Whisper transcription with your own API key. Temporary connection failures trigger automatic retries, and an unfinished recording can be kept for another attempt. Unlike the desktop app, Android copies the result to the clipboard for you to paste yourself.",
    ],
    media: { src: "/promptly-mobile-card.svg", alt: "Promptly Mobile concept showing its floating recording button on an Android phone" },
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

export const workMenuCopy = {
  label: "[=] Explore",
  title: "Work",
  categories: "Browse by discipline",
  featured: "Selected projects",
  allWork: "View all work",
  close: "Close",
} as const;

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
