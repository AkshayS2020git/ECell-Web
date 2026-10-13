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
    id: "tech",
    name: "Tech",
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
  {
    id: "design",
    name: "Design",
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
    id: "marketing",
    name: "Marketing & Social",
    description:
      "Plan campaigns, run our socials and get the word out so every event fills up.",
    skills: ["Content", "Analytics", "Storytelling"],
    questions: [
      {
        id: "campaign",
        label: "Pitch a campaign to get 200 students to an ECell event.",
        type: "textarea",
        required: true,
      },
      {
        id: "platforms",
        label: "Which platforms do you know best?",
        type: "text",
        required: true,
        placeholder: "e.g. Instagram, LinkedIn, YouTube",
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
    id: "events",
    name: "Events & Operations",
    description:
      "Turn ideas into events that run on time: venues, logistics, volunteers and everything on the day.",
    skills: ["Planning", "Coordination", "Calm under pressure"],
    questions: [
      {
        id: "experience",
        label: "Have you organised or volunteered at an event? Tell us about it.",
        type: "textarea",
        required: true,
      },
      {
        id: "hours",
        label: "How many hours a week can you give in the weeks before an event?",
        type: "select",
        required: true,
        options: ["Under 4", "4 to 8", "More than 8"],
      },
    ],
  },
  {
    id: "outreach",
    name: "Sponsorship & Outreach",
    description:
      "Bring in sponsors, speakers and partners, and look after those relationships after the event.",
    skills: ["Communication", "Negotiation", "Networking"],
    questions: [
      {
        id: "dream-guest",
        label: "Which company or founder would you bring to campus, and why?",
        type: "textarea",
        required: true,
      },
      {
        id: "pitch",
        label: "Tell us about a time you convinced someone to say yes.",
        type: "textarea",
        required: true,
      },
    ],
  },
  {
    id: "content",
    name: "Content & Research",
    description:
      "Write the copy, newsletters and founder stories, and research the startup ecosystem for our sessions.",
    skills: ["Writing", "Research", "Editing"],
    questions: [
      {
        id: "startup",
        label: "In about 150 words, tell us about a startup you find interesting.",
        type: "textarea",
        required: true,
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
];

export const RECRUITMENT_YEARS = ["1st year", "2nd year", "3rd year", "4th year"] as const;

export const RECRUITMENT_STEPS: RecruitmentStep[] = [
  {
    title: "Apply",
    description: "Fill in the form below. It takes about five minutes.",
  },
  {
    title: "Task round",
    description: "A short team-specific task, shared over email after the deadline.",
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
      "Pick a first choice and, optionally, a second. If your first choice is full we'll consider you for the second.",
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
