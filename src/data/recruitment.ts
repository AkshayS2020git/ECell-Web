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
  type: "text" | "textarea" | "url" | "select" | "checkboxes" | "rating";
  required: boolean;
  placeholder?: string;
  /** Choices for select, checkboxes, and rating fields. */
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
  /** Shown as a bullet list on the team's card. */
  responsibilities: string[];
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
  /** Who can apply, shown in the hero's details panel. */
  openTo: "All RVU students",
} as const;

export const RECRUITMENT_TEAMS: RecruitmentTeam[] = [
  {
    id: "pr",
    name: "PR",
    tagline: "Be the voice of ECell.",
    description: "The voice of ECell to the outside world.",
    responsibilities: [
      "Reach out to startups, founders, companies and alumni for talks and workshops",
      "Handle sponsorships and partnerships (proposals, emails, follow-ups)",
      "Coordinate with other clubs and colleges for collaborations",
      "Represent ECell at events and networking sessions",
    ],
    skills: ["Communication", "Public speaking", "Networking"],
    questions: [
      {
        id: "experience",
        label: "Do you have prior experience in communications, outreach or collaborations? (Clubs, events, sponsorship outreach, etc.)",
        type: "textarea",
        required: true,
      },
      {
        id: "networkingComfort",
        label: "How comfortable are you with networking and communicating with external organizations?",
        type: "select",
        required: true,
        options: ["Very Comfortable", "Comfortable", "Somewhat Comfortable", "Not Comfortable"],
      },
      {
        id: "visibilityStrategies",
        label: "What strategies would you use to increase the visibility of ECell?",
        type: "textarea",
        required: true,
      },
      {
        id: "sponsorshipExperience",
        label: "Have you ever worked on sponsorship or partnership outreach before?",
        type: "select",
        required: true,
        options: ["Yes", "No"],
      },
      {
        id: "sponsorCommunication",
        label: "If yes, how would you handle professional communication with sponsors or partners?\n(If not, fill \"Nil.\")",
        type: "textarea",
        required: true,
      },
      {
        id: "outreachTools",
        label: "What tools or platforms have you used for communication and outreach?",
        type: "checkboxes",
        required: true,
        options: ["Email", "LinkedIn", "WhatsApp", "Instagram", "Other"],
      },
      {
        id: "confidence",
        label: "Rate your communication & networking confidence",
        type: "rating",
        required: true,
        options: ["1", "2", "3", "4", "5"],
      },
    ],
  },
  {
    id: "social",
    name: "Social Media & Content Creation",
    tagline: "Make ECell impossible to scroll past.",
    description: "Runs ECell's online presence — from posting to the ideas behind every post.",
    responsibilities: [
      "Manage Instagram, LinkedIn and other pages",
      "Write captions, scripts and plan reels/content",
      "Track engagement and grow the audience",
      "Work with the Design Team to bring ideas to life",
    ],
    skills: ["Reels", "Copywriting", "Trends"],
    questions: [
      {
        id: "motivation",
        label: "Why do you want to join the Social Media and Content Creation Team of ECell?",
        type: "textarea",
        required: true,
      },
      {
        id: "platforms",
        label: "Which social media platforms do you use frequently?",
        type: "checkboxes",
        required: true,
        options: ["Instagram", "LinkedIn", "Twitter/X", "YouTube", "Other"],
      },
      {
        id: "contentPreference",
        label: "What type of content do you enjoy creating the most?",
        type: "select",
        required: true,
        options: ["Social Media Captions", "Blogs / Articles", "Event Promotions", "Video Scripts", "Reels / Short Content"],
      },
      {
        id: "managementExperience",
        label: "Do you have experience managing social media pages for clubs, businesses, or personal brands?",
        type: "select",
        required: true,
        options: ["Yes", "No"],
      },
      {
        id: "contentLinks",
        label: "Share links to any pages, posts, or content you have created. (If none, write \"Nil.\")",
        type: "textarea",
        required: false,
      },
      {
        id: "studentEngagement",
        label: "How would you make ECell content more engaging for students?",
        type: "textarea",
        required: true,
      },
      {
        id: "engagementStrategies",
        label: "What strategies would you use to increase engagement on our social media pages?",
        type: "textarea",
        required: true,
      },
      {
        id: "studentContent",
        label: "What type of content do you think performs best for student communities?",
        type: "textarea",
        required: true,
      },
      {
        id: "metricsComfort",
        label: "How comfortable are you with analyzing engagement metrics (reach, impressions, analytics)?",
        type: "select",
        required: true,
        options: ["Beginner", "Intermediate", "Advanced"],
      },
      {
        id: "brainstormingComfort",
        label: "How comfortable are you with brainstorming new content ideas?",
        type: "select",
        required: true,
        options: ["Very Comfortable", "Comfortable", "Somewhat Comfortable", "Not Comfortable"],
      },
      {
        id: "creativeIdeation",
        label: "Rate your creative ideation & brainstorming ability",
        type: "rating",
        required: true,
        options: ["1", "2", "3", "4", "5"],
      },
    ],
  },
  {
    id: "design",
    name: "Design",
    tagline: "Turn ideas into visuals.",
    description: "Gives ECell its look and feel.",
    responsibilities: [
      "Create posters, banners, social media creatives and event branding",
      "Keep colours, fonts and style consistent across everything ECell puts out",
      "Deliver designs on time before events and campaigns",
      "Work closely with the Social Media and Content teams",
    ],
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
    description: "Keeps the official record of everything ECell does.",
    responsibilities: [
      "Take notes and capture details during events and meetings",
      "Write post-event reports (attendance, highlights, outcomes, learnings)",
      "Maintain minutes of meetings, records and shared files",
      "Support the team with letters, proposals and paperwork when needed",
    ],
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
    description: "Builds and maintains ECell's digital side.",
    responsibilities: [
      "Develop and update the ECell website",
      "Build tools for event registrations, forms and automation",
      "Manage data and digital platforms",
      "Handle tech support at events",
    ],
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

/** The steps after applying; the page counts these as rounds. */
export const RECRUITMENT_ROUNDS = RECRUITMENT_STEPS.slice(1);

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

/** Shown one at a time, in random order, while an application is saving. */
export const RECRUITMENT_FUN_FACTS: string[] = [
  "Pigs are physically unable to look up at the sky.",
  "Scotland's official national animal is the unicorn.",
  "A shrimp's heart is located inside its head.",
  "Mosquitoes are reportedly attracted more often to people who have recently eaten bananas.",
  "A single day on Venus is longer than a full year on Venus.",
  "Lobsters have blue blood.",
  "You cannot hum while holding your nose. Don't try it right now.",
];

export function getTeamById(id: string): RecruitmentTeam | undefined {
  return RECRUITMENT_TEAMS.find((team) => team.id === id);
}
