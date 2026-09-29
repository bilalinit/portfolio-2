/* Pricing section content — copy lives here, not in the JSX (AGENTS.md).
   The Single-project tab is a four-question brief: the picks are assembled
   into a pre-filled email draft, so "pricing" ends in a real conversation
   (we read it and answer with a real number) instead of a dead form or a
   fake instant price. */

/* THE contact address for the whole site. Every surface that shows or sends
   mail reads this — the pricing brief's mailto draft, the footer link, and
   the chat widget's contact view + error copy. Change it here and nowhere
   else; the components import it precisely so a new address can never be
   missed in one of them. (The backend's Nami prompt has its own copy of the
   address — see backend/main.py, update both together.) */
export const CONTACT_EMAIL = "mizuedit3@gmail.com";

export type BriefStep = {
  label: string;
  placeholder: string;
  options: string[];
};

/* The four required questions, in the brief's narrative order:
   what it is → how big → how good → how soon. Scope (deliverables, not
   duration) is the real size signal; start-and-urgency carries the rush
   factor. Both replaced the old overlapping Size/Timeline duration pairs. */
export const briefSteps: BriefStep[] = [
  {
    label: "Project Type",
    placeholder: "Select project type*",
    options: ["Web Development", "Web Design", "Branding", "E-commerce"],
  },
  {
    label: "Project Scope",
    placeholder: "Select scope*",
    options: [
      "Landing page (1–3 sections)",
      "Small site (4–8 pages)",
      "Full site (9–20 pages)",
      "Web app / custom build",
    ],
  },
  {
    label: "Project Creativity",
    placeholder: "Select project creativity*",
    options: ["Standard", "High-end", "Award-winning"],
  },
  {
    label: "Start & Urgency",
    placeholder: "Select start*",
    options: [
      "ASAP (rush)",
      "In 1–2 months",
      "This quarter",
      "Flexible — best availability",
    ],
  },
];

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
