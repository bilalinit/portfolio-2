export type ThumbKind =
  | "dime"
  | "sopfeu"
  | "halo"
  | "noir"
  | "sunburst"
  | "eye"
  | "stairs"
  | "grid"
  | "arcs";

export type WorkCategoryLabel = "Website" | "Mobile App" | "Experiential" | "E-commerce";

export interface FeaturedProject {
  name: string;
  description: string;
  code: string;
  thumb: ThumbKind;
}

export interface WorkCategory {
  label: string;
  count: number;
  slug: string; /* for /work/category/[slug] */
}

/* one card on the /work grid — and one /work/[slug] case study */
export interface WorkItem {
  slug: string;
  name: string;
  category: WorkCategoryLabel;
  year: string;
  thumb: ThumbKind;
  overview: string;
}

/* work drop-down categories (counts render as superscripts) */
export const workCategories: WorkCategory[] = [
  { label: "Website", count: 7, slug: "website" },
  { label: "Mobile App", count: 4, slug: "mobile-app" },
  { label: "Experiential", count: 4, slug: "experiential" },
  { label: "E-commerce", count: 3, slug: "e-commerce" },
];

/* total shown in the "See all work [n]" button — derived from the categories */
export const totalWork = workCategories.reduce((sum, cat) => sum + cat.count, 0);

export const featuredProjects: FeaturedProject[] = [
  {
    name: "Dime",
    description: "Modernizing an iconic streetwear brand",
    code: "PDM-1025",
    thumb: "dime",
  },
  {
    name: "Sopfeu",
    description: "Harnessing real-time data to create the ultimate prevention tool",
    code: "PSF-0325",
    thumb: "sopfeu",
  },
  {
    name: "Halo Dental",
    description: "Building trust to propel a new player in dentistry",
    code: "PHD-0524",
    thumb: "halo",
  },
];

/* the /work grid — counts mirror workCategories (7 + 4 + 4 + 3) */
export const allWork: WorkItem[] = [
  /* websites (7) */
  {
    slug: "dime",
    name: "Dime",
    category: "Website",
    year: "2025",
    thumb: "dime",
    overview:
      "A full rebuild for Montreal's iconic streetwear label — a modular e-commerce experience with a lookbook engine, drop calendars and a checkout that turns hype into orders.",
  },
  {
    slug: "sopfeu",
    name: "Sopfeu",
    category: "Website",
    year: "2025",
    thumb: "sopfeu",
    overview:
      "A public prevention tool that turns real-time wildfire data into clear, actionable maps — built to stay fast and legible under load, when an entire province is watching.",
  },
  {
    slug: "halo-dental",
    name: "Halo Dental",
    category: "Website",
    year: "2024",
    thumb: "halo",
    overview:
      "Brand and website for a new player in dentistry — a warm, trust-first design system that makes booking a visit feel as considered as the care itself.",
  },
  {
    slug: "atelier-nord",
    name: "Atelier Nord",
    category: "Website",
    year: "2024",
    thumb: "noir",
    overview:
      "Portfolio and commission platform for a Scandinavian furniture atelier — quiet layouts, generous whitespace and typography that lets the craft speak.",
  },
  {
    slug: "field-notes",
    name: "Field Notes",
    category: "Website",
    year: "2024",
    thumb: "grid",
    overview:
      "An editorial platform for long-form reporting — a reading experience with typographic rigor, an archive that invites wandering and nothing that interrupts it.",
  },
  {
    slug: "mono-studio",
    name: "Mono Studio",
    category: "Website",
    year: "2023",
    thumb: "eye",
    overview:
      "Identity and site for a one-chair photography studio — a monochrome grid, film-strip transitions and a booking flow reduced to three taps.",
  },
  {
    slug: "cascade",
    name: "Cascade",
    category: "Website",
    year: "2023",
    thumb: "arcs",
    overview:
      "Product site for a workflow tool — interactive demos, a changelog run as content, and a pricing page that answers questions before they're asked.",
  },
  /* mobile apps (4) */
  {
    slug: "loop",
    name: "Loop",
    category: "Mobile App",
    year: "2025",
    thumb: "sunburst",
    overview:
      "A habit-tracking app designed around gentle repetition — one-thumb navigation, streaks that forgive a missed day, and data viz that motivates rather than shames.",
  },
  {
    slug: "trailhead",
    name: "Trailhead",
    category: "Mobile App",
    year: "2024",
    thumb: "stairs",
    overview:
      "Route planning for hikers — offline maps, elevation previews and a community layer, wrapped in an interface that stays readable in direct sunlight.",
  },
  {
    slug: "pulse",
    name: "Pulse",
    category: "Mobile App",
    year: "2024",
    thumb: "noir",
    overview:
      "A sleep and recovery companion — calm dark-mode visuals, haptic wind-downs and morning reports that translate sensor noise into one clear number.",
  },
  {
    slug: "kiosk",
    name: "Kiosk",
    category: "Mobile App",
    year: "2023",
    thumb: "grid",
    overview:
      "Order-ahead for independent cafés — a two-panel flow that gets a regular their usual in under ten seconds, with loyalty quietly built in.",
  },
  /* experiential (4) */
  {
    slug: "vantage",
    name: "Vantage",
    category: "Experiential",
    year: "2025",
    thumb: "eye",
    overview:
      "A projection-mapped installation for a fintech summit — real-time market data rendered as a slow, tidal wall of light.",
  },
  {
    slug: "afterimage",
    name: "Afterimage",
    category: "Experiential",
    year: "2024",
    thumb: "arcs",
    overview:
      "An interactive light corridor for a photography festival — visitors' silhouettes linger on the walls as phosphorescent trails.",
  },
  {
    slug: "null-point",
    name: "Null Point",
    category: "Experiential",
    year: "2024",
    thumb: "sopfeu",
    overview:
      "A sensory-deprivation brand experience — an anechoic pop-up where the design work is everything you can't see.",
  },
  {
    slug: "semaphore",
    name: "Semaphore",
    category: "Experiential",
    year: "2023",
    thumb: "sunburst",
    overview:
      "Wayfinding and interactive totems for a transit hub — a signage system that breathes with the flow of passengers through the day.",
  },
  /* e-commerce (3) */
  {
    slug: "standard-issue",
    name: "Standard Issue",
    category: "E-commerce",
    year: "2025",
    thumb: "noir",
    overview:
      "E-commerce for a workwear label that sells permanence — repair guides, provenance pages and a product grid built to outlast trends.",
  },
  {
    slug: "marche",
    name: "Marché",
    category: "E-commerce",
    year: "2024",
    thumb: "halo",
    overview:
      "A neighbourhood grocer online — seasonal crates, producer profiles and a weekly restock rhythm that turned delivery into ritual.",
  },
  {
    slug: "general-goods",
    name: "General Goods",
    category: "E-commerce",
    year: "2023",
    thumb: "stairs",
    overview:
      "A general store for design objects — a deliberately eclectic catalogue with an editorial voice and a checkout that stays out of the way.",
  },
];
