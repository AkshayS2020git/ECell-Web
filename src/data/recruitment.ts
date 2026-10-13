// src/data/recruitment.ts
//
// Everything the /recruit page shows lives here. The teams, team questions,
// dates, steps and FAQ below are PLACEHOLDER copy: replace them with the real
// drive details before announcing recruitment. Flip `isOpen` to close
// applications without touching any page code.

export interface RecruitmentQuestion {
  /** Part of the form field name; keep it unique within its team. */
  id: string;
  /** Also the column header in the team's sheet tab. */
  label: string;
  type: "text" | "textarea" | "url" | "select";
  required: boolean;
  placeholder?: string;
  /** Only for "select". */
  options?: string[];
}

export interface RecruitmentTeam {
  /** Used in form field names; keep it stable once applications start arriving. */
  id: string;
  /** Also the name of the team's tab in the sheet. */
  name: string;
  /** One-liner from the recruitment announcement. */
  tagline: string;
  description: string;
  skills: string[];
  /** Asked on step 2 to applicants who pick this team. */
  questions: RecruitmentQuestion[];
}

export interface RecruitmentStep {
  title: string;
  description: string;
}

export interface RecruitmentFaq {
  question: string;
  answer: string;
}

export const RECRUITMENT = {
  isOpen: true,
  season: "Recruitment 2026",
  /** Shown as-is on the page. */
  deadline: "31 October 2026",
  contactEmail: "club_ecell@rvu.edu.in",
} as const;

export const RECRUITMENT_TEAMS: RecruitmentTeam[] = [
  {
    id: "pr",
    name: "PR",
    tagline: "Be the voice of ECell.",
    description:
      "Handle announcements, talk to other clubs and the press, and represent ECell at events and across campus.",
    skills: ["Communication", "Public speaking", "Networking"],
    questions: [
      {
        id: "announcement",
        label: "Write a two-line announcement for ECell's next event.",
        type: "textarea",
        required: true,
      },
      {
        id: "represented",
        label: "Have you represented a club, team or event before? Tell us about it.",
        type: "textarea",
        required: true,
      },
      {
        id: "languages",
        label: "Which languages do you speak comfortably?",
        type: "text",
        required: false,
        placeholder: "e.g. English, Hindi, Kannada",
      },
    ],
  },
  {
    id: "social",
    name: "Social Media & Content Creation",
    tagline: "Make ECell impossible to scroll past.",
    description:
      "Plan, shoot and edit reels, posts and stories, and run ECell's Instagram and LinkedIn.",
    skills: ["Reels", "Copywriting", "Trends"],
    questions: [
      {
        id: "idea",
        label: "Pitch a reel or post idea that would make ECell impossible to scroll past.",
        type: "textarea",
        required: true,
      },
      {
        id: "tools",
        label: "Which platforms and tools do you create with?",
        type: "text",
        required: true,
        placeholder: "e.g. Instagram, CapCut, Canva",
      },
      {
        id: "work",
        label: "Link to content you've made",
        type: "url",
        required: false,
        placeholder: "https://",
      },
    ],
  },
  {
    id: "design",
    name: "Design",
    tagline: "Turn ideas into visuals.",
    description:
      "Own how ECell looks: posters, decks, merch, social creatives and the visual identity of every event.",
    skills: ["Figma", "Branding", "Motion"],
    questions: [
      {
        id: "portfolio",
        label: "Portfolio link (Behance, Dribbble, Drive folder…)",
        type: "url",
        required: true,
        placeholder: "https://",
      },
      {
        id: "tool",
        label: "Which design tool do you use most?",
        type: "select",
        required: true,
        options: ["Figma", "Adobe Photoshop / Illustrator", "Canva", "Blender / 3D tools", "Other"],
      },
      {
        id: "admire",
        label: "Pick a poster, brand or website you love and tell us why.",
        type: "textarea",
        required: true,
      },
    ],
  },
  {
    id: "documentation",
    name: "Documentation",
    tagline: "Keep the story of ECell alive.",
    description:
      "Write event reports and recaps, keep minutes and records, and build the archive of everything ECell does.",
    skills: ["Writing", "Organisation", "Attention to detail"],
    questions: [
      {
        id: "recap",
        label: "Write a short recap (about 100 words) of any event you've attended.",
        type: "textarea",
        required: true,
      },
      {
        id: "organise",
        label: "How do you usually keep notes and organise information?",
        type: "select",
        required: true,
        options: ["Google Docs / Notion", "Spreadsheets", "Pen and paper", "Other"],
      },
      {
        id: "writing",
        label: "Link to something you've written",
        type: "url",
        required: false,
        placeholder: "https://",
      },
    ],
  },
  {
    id: "tech",
    name: "Tech",
    tagline: "Build the digital backbone.",
    description:
      "Build and maintain the website, event platforms and the small internal tools that keep the cell running.",
    skills: ["Web dev", "Automation", "Problem solving"],
    questions: [
      {
        id: "stack",
        label: "Which languages or frameworks are you comfortable with?",
        type: "text",
        required: true,
        placeholder: "e.g. JavaScript, React, Python",
      },
      {
        id: "problem",
        label: "Tell us about a bug or technical problem you solved, and how.",
        type: "textarea",
        required: true,
      },
      {
        id: "github",
        label: "GitHub or a project you've built",
        type: "url",
        required: false,
        placeholder: "https://github.com/…",
      },
    ],
  },
];

export const RECRUITMENT_YEARS = ["1st year", "2nd year", "3rd year", "4th year"] as const;

export const RECRUITMENT_STEPS: RecruitmentStep[] = [
  {
    title: "Apply",
    description: "Fill in the form below. It takes about five minutes.",
  },
  {
    title: "Shortlisting",
    description: "The team reads every application and shortlists candidates. You'll hear from us by email.",
  },
  {
    title: "Interview",
    description: "A relaxed conversation with the team leads. No trick questions.",
  },
  {
    title: "Onboarding",
    description: "Meet the cell, get your team and start working on the next event.",
  },
];

export const RECRUITMENT_FAQ: RecruitmentFaq[] = [
  {
    question: "Who can apply?",
    answer:
      "Any RV University student from any school or year. You don't need a startup or prior experience.",
  },
  {
    question: "Can I apply to more than one team?",
    answer:
      "No, each application is for one team, so pick the one you most want to join.",
  },
  {
    question: "How much time does it take?",
    answer:
      "Around 4 to 6 hours a week on average, more in the weeks before a big event.",
  },
  {
    question: "When will I hear back?",
    answer:
      "Within a week of the deadline. Everyone who applies gets a reply, whatever the result.",
  },
];

export function getTeamById(id: string): RecruitmentTeam | undefined {
  return RECRUITMENT_TEAMS.find((team) => team.id === id);
}
