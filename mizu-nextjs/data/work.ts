export const workPageCopy = {
  title: "All projects",
  introduction: "A collection of things we’ve brought to life. Designed with care, built with purpose, and made to be used.",
  projectsLabel: "Project archive",
  filterLabel: "Filter projects by discipline",
  all: "All projects",
  indexLabel: "projects",
  view: "View project",
  empty: "New work in this discipline is still taking shape.",
  showAll: "Explore all projects",
  nextLabel: "[+] The next project",
  nextTitle: "Something in mind?",
  contact: "Let’s make it happen",
} as const;

export const workPresentations: Record<string, { label: string; image: string; alt: string; caption: string; services: string[] }> = {
  dropsync: {
    label: "A space to share. A moment to keep.",
    image: "/dropsync-interface-screenshot.png",
    alt: "DropSync’s encrypted file-sharing workspace and AI assistant",
    caption: "Private by design / Connected by default",
    services: ["Product design", "Development", "AI"],
  },
  "game-cam": {
    label: "Motion, at your fingertips.",
    image: "/gamecam-screenshot.png",
    alt: "Game cam’s After Effects camera controls and keyframe panel",
    caption: "From movement to keyframes",
    services: ["Interface design", "Plugin development"],
  },
};
