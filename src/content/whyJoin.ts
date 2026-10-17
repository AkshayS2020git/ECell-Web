// Cards in the homepage "Why join ECell" stack, in display order.

export interface JoinReason {
  number: string;
  title: string;
  description: string;
  background: string;
  text: string;
  iconBackground: string;
  iconColor: string;
  icon: string;
  cta?: string;
  middleLabel: string;
}

export const WHY_JOIN_REASONS: JoinReason[] = [
  {
    number: "01",
    title: "Build what matters",
    description:
      "Take an idea beyond the whiteboard. Build, test and ship it with people who actually want to make things happen.",
    background: "#edf0f5",
    text: "#2d91e5",
    iconBackground: "#2d91e5",
    iconColor: "#ffffff",
    icon: "✦",
    middleLabel: "Make it real",
  },
  {
    number: "02",
    title: "Find your people",
    description:
      "Meet builders, designers, founders and problem-solvers who are just as crazy about creating something of their own.",
    background: "#8bce5d",
    text: "#ffffff",
    iconBackground: "#ffffff",
    iconColor: "#78bd4e",
    icon: "◎",
    middleLabel: "Build together",
  },
  {
    number: "03",
    title: "Learn by doing",
    description:
      "Run events. Lead teams. Pitch ideas. Make mistakes. Learn the things no classroom can teach.",
    background: "#fa6959",
    text: "#ffffff",
    iconBackground: "#ffffff",
    iconColor: "#fa6959",
    icon: "↗",
    middleLabel: "Try. Learn. Repeat.",
  },
  {
    number: "04",
    title: "Create real impact",
    description:
      "Shape the entrepreneurial culture on campus and turn your ideas into experiences other students remember.",
    background: "#238894",
    text: "#ffffff",
    iconBackground: "#ffffff",
    iconColor: "#238894",
    icon: "⚡",
    middleLabel: "Leave a mark",
  },
  {
    number: "05",
    title: "Start something",
    description:
      "You don't need a perfect idea. You just need the willingness to take the first step.",
    background: "#252525",
    text: "#ffffff",
    iconBackground: "#ffffff",
    iconColor: "#252525",
    icon: "→",
    cta: "Join now",
    middleLabel: "Your seat is waiting",
  },
];
