/* Pricing section content — copy lives here, not in the JSX (AGENTS.md).
   The Single-project tab is a short service-and-scope brief: the picks are assembled
   into a pre-filled email draft, so "pricing" ends in a real conversation
   (we read it and answer with a real number) instead of a dead form or a
   fake instant price. */

/* THE contact address for the whole site. Every surface that shows or sends
   mail reads this — the pricing brief's Gmail draft, the footer link, and
   the chat widget's contact view + error copy. Change it here and nowhere
   else; the components import it precisely so a new address can never be
   missed in one of them. (The backend's Nami prompt has its own copy of the
   address — see backend/main.py, update both together.) */
export const CONTACT_EMAIL = "mizuedit3@gmail.com";

export type BriefStep = {
  label: string;
  placeholder: string;
  options: string[];
  hint?: string;
};

export const serviceChoices = {
  other: "Something else",
  unsure: "I'm not sure yet",
} as const;

export type ProjectPicks = [service: string, scope: string];

/* Only service and scope are required; visitors can explicitly be unsure. */
export const briefSteps: BriefStep[] = [
  {
    label: "Service",
    placeholder: "What do you need?*",
    options: ["Web Development", "Web Design", "Branding", "E-commerce", serviceChoices.other, serviceChoices.unsure],
  },
  {
    label: "Project scope",
    placeholder: "Choose the scope*",
    options: [
      "Landing page (1–3 sections)",
      "Small site (4–8 pages)",
      "Full site (9–20 pages)",
      "Web app / custom build",
      "Not sure yet",
    ],
  },
];

/** Service-specific scope choices; website design and development use the page sizes above. */
export const serviceScopeOptions: Record<string, string[]> = {
  Branding: ["Logo & visual identity", "Brand guidelines", "Full brand identity", "Not sure yet"],
  "E-commerce": ["New online store", "Store redesign", "Store features / integrations", "Not sure yet"],
  [serviceChoices.other]: ["Small project", "Larger project", "Not sure yet"],
  [serviceChoices.unsure]: ["Small project", "Larger project", "Not sure yet"],
};

export const quoteCopy = {
  cta: "Let's discuss your project",
  description: "Tell us what you need. We’ll review your brief and reply with an estimate and next steps.",
  otherServiceLabel: "What would you like help with?",
  otherServicePlaceholder: "An app, an AI assistant, or something else...",
  notesLabel: "Project details — optional",
  notesPlaceholder: "Your goal, existing website, or anything else we should know",
  draftHint: "Opens a draft in Gmail. Review the details, add any context, then send it to us.",
  missingService: "Choose a service above. If you're unsure, select I'm not sure yet.",
  missingCustomService: "Tell us briefly what you'd like help with above.",
  missingScope: "Choose a project scope above. You can select Not sure yet.",
  emailSuffix: "Sent from the project enquiry form on mizu.studio.",
} as const;

export function buildQuoteDraft(picks: ProjectPicks, notes: string, customService = "") {
  const [choice, scope] = picks;
  const service = choice === serviceChoices.other ? customService.trim() || serviceChoices.other : choice;
  const lines = [
    "Hi MIZU,",
    "",
    "I'd like to discuss a project with your studio. Here is the brief I put together on your website:",
    "",
    "PROJECT BRIEF",
    `Service: ${service || "To be discussed"}`,
    `Scope: ${scope || "To be discussed"}`,
  ];
  if (notes.trim()) lines.push("", "PROJECT DETAILS", notes.trim());
  lines.push(
    "",
    "Could you share an estimated cost, a likely timeline and your availability based on this brief? Please let me know what other information you need and the best next step.",
    "",
    "Thanks,",
    "[Your name]",
    "",
    quoteCopy.emailSuffix,
  );
  return {
    subject: `Project enquiry — ${service || "New project"} / ${scope || "Scope to discuss"}`,
    body: lines.join("\n"),
  };
}

export type RecurringPlan = {
  name: string;
  price: string;
  desc: string;
  features: string[];
  cta: string;
  /* email draft the CTA opens */
  subject: string;
  bodyIntro: string;
};

export const recurringPlans: RecurringPlan[] = [
  {
    name: "Standard",
    price: "€4,999",
    desc: "Great for small agencies with a lighter flow of projects.",
    features: [
      "Shared capacity",
      "One project at a time",
      "One expert-level developer",
      "Unlimited requests",
      "Dedicated communication channel",
    ],
    cta: "Start a conversation",
    subject: "Recurring plan — Standard (€4,999/month)",
    bodyIntro:
      "I'm interested in the Standard recurring plan (€4,999/month). A few lines about our situation:",
  },
  {
    name: "Extended",
    price: "€9,999",
    desc: "Great for agencies handling multiple projects at once.",
    features: [
      "Dedicated capacity",
      "Up to two concurrent projects",
      "Two expert-level developers",
      "Unlimited requests",
      "Dedicated communication channel",
    ],
    cta: "Start a conversation",
    subject: "Recurring plan — Extended (€9,999/month)",
    bodyIntro:
      "I'm interested in the Extended recurring plan (€9,999/month). A few lines about our situation:",
  },
];

/* third card — catches everyone the two fixed plans don't fit */
export const customPlan = {
  name: "Custom flow",
  desc: "Need something shaped differently — lighter, heavier, project-based retainer? Tell us your workload and we'll build the engagement around it.",
  cta: "Tell us your flow",
  subject: "Recurring — custom engagement",
  bodyIntro:
    "I'm looking for a recurring setup that doesn't fit the fixed plans. A few lines about our needs:",
};
