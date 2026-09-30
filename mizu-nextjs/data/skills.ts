export interface Skill {
  name: string;
  detail: string;
}

export interface SkillGroup {
  title: string;
  count: string;
  skills: Skill[];
}

/* shared intro copy */
export const skillsIntro =
  "A product needs three things to work: design that makes sense, code that holds up, and more and more often AI that does part of the job. We cover all three.";

export const skillsContent = {
  label: "[03] Our capabilities",
  title: "Skill sets",
  note: "Three disciplines. One considered product.",
  chapters: [
    { statement: "Give it character.", summary: "A clear visual direction, from the first idea to the smallest detail.", visualLabel: "Composition / Type / Rhythm", symbol: "Aa" },
    { statement: "Make it work.", summary: "Thoughtful interfaces backed by systems built for everyday use.", visualLabel: "Interface / Logic / Connection", symbol: "</>" },
    { statement: "Let it do more.", summary: "Purposeful intelligence that turns a digital product into a useful collaborator.", visualLabel: "Understand / Decide / Act", symbol: "[=]" },
  ],
} as const;

export const skillGroups: SkillGroup[] = [
  {
    title: "Design",
    count: "(06)",
    skills: [
      {
        name: "Visual direction",
        detail:
          "We set the overall look before anything gets built: references, mood, and art direction that keep the whole product consistent.",
      },
      {
        name: "Design concept",
        detail:
          "The big idea behind the product. Layouts, structure, and the main interactions, decided before detailed design starts.",
      },
      {
        name: "Typography",
        detail:
          "Typeface choices, sizes, and spacing so the text is easy to read and feels like the brand.",
      },
      {
        name: "Color",
        detail:
          "Palettes that work in light and dark, with enough contrast to stay accessible.",
      },
      {
        name: "Composition",
        detail:
          "Grid, hierarchy, and spacing. Where things sit on the screen and why.",
      },
      {
        name: "UI style guide",
        detail:
          "A written record of the design: components, colors, and rules the whole team can follow.",
      },
    ],
  },
  {
    title: "Engineering",
    count: "(04)",
    skills: [
      {
        name: "Full-stack web",
        detail:
          "Websites and web apps built end to end, frontend and backend. Mostly Next.js and React.",
      },
      {
        name: "Mobile apps",
        detail:
          "Apps for iOS and Android that feel native and share most of their code.",
      },
      {
        name: "APIs & integrations",
        detail:
          "Building the APIs your product needs, and connecting it to services like payments, email, or your CRM.",
      },
      {
        name: "Real-time systems",
        detail:
          "Features that update live: chat, notifications, and state shared between users.",
      },
    ],
  },
  {
    title: "AI & Agents",
    count: "(04)",
    skills: [
      {
        name: "AI agents",
        detail:
          "Agents trained on your business that answer questions, handle requests, and know when to bring in a human.",
      },
      {
        name: "Digital FTEs",
        detail:
          "An agent with a job description. Support, intake, operations — it does the same tasks a full-time employee would, every day.",
      },
      {
        name: "AI-enabled websites",
        detail:
          "Websites that use AI where it actually helps: smarter search, content that adapts, forms that understand what people typed.",
      },
      {
        name: "Agentic apps",
        detail:
          "Apps where the agent does most of the work and the person stays in control of the decisions.",
      },
    ],
  },
];
