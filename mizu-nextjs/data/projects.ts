export type ThumbKind = "dime" | "sopfeu" | "halo";

export interface FeaturedProject {
  name: string;
  description: string;
  code: string;
  thumb: ThumbKind;
}

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
