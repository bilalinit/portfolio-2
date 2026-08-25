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
  "I propose an end-to-end design process that spans my skills in Digital Product Design for website and mobile application, with a high-stander UI/Visual and UX prudence.";

export const skillGroups: SkillGroup[] = [
  {
    title: "UI design",
    count: "(06)",
    skills: [
      {
        name: "Visual direction",
        detail:
          "Setting the visual north star for a product — mood, references and art direction that keep every screen coherent from the first sketch to the final build.",
      },
      {
        name: "Design concept",
        detail:
          "Translating strategy into a tangible concept: the big idea, core layouts and key interactions that make a product feel intentional rather than assembled.",
      },
      {
        name: "Typography",
        detail:
          "Choosing and pairing typefaces, building scales and rhythm so text is not only readable but carries the brand's voice at every size.",
      },
      {
        name: "Color",
        detail:
          "Building palettes and contrast systems that hold up across light and dark, states and accessibility thresholds — color with a job to do.",
      },
      {
        name: "Composition",
        detail:
          "Grid, hierarchy and spacing — arranging elements so the eye always knows where to go next, on any screen size.",
      },
      {
        name: "UI style guide",
        detail:
          "Documenting components, tokens and rules into a living style guide, so teams can ship consistent screens without guessing.",
      },
    ],
  },
  {
    title: "UX design",
    count: "(05)",
    skills: [
      {
        name: "UX research",
        detail:
          "Interviews, surveys and field studies to understand real user behavior before a single pixel is drawn.",
      },
      {
        name: "Usability testing",
        detail:
          "Watching real people use the product, spotting friction early and turning findings into concrete improvements.",
      },
      {
        name: "Quantitative research",
        detail:
          "Analytics, funnels and A/B tests that back design decisions with numbers instead of hunches.",
      },
      {
        name: "Wireframing",
        detail:
          "Fast, low-fidelity structures for exploring flows and layouts before committing to visual design.",
      },
      {
        name: "Prototyping",
        detail:
          "Clickable, high-fidelity prototypes that let stakeholders and users feel the product before a line of code is written.",
      },
    ],
  },
];
