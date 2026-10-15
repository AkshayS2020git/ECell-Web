// src/data/recruitment.ts
//
// Everything the /recruit page shows lives here. The teams, team questions,
// dates, steps and FAQ below are PLACEHOLDER copy: replace them with the real
// drive details before announcing recruitment. Flip `isOpen` to close
// applications without touching any page code.

import type { StaticImageData } from "next/image";

export interface RecruitmentQuestion {
  /** Part of the form field name; keep it unique within its team. */
  id: string;
  /** Also the column header in the team's sheet tab. */
  label: string;
  type: "text" | "textarea" | "url" | "select" | "checkboxes" | "rating";
  required: boolean;
  placeholder?: string;
  /** Shown under the label, for guidance the label is too short to give. */
  description?: string;
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

export interface RecruitmentSection {
  title: string;
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
  /** Hero poster, imported from src/assets (square works best). Until one is
   *  set, the hero shows an empty placeholder frame in its place. */
  poster: null as StaticImageData | null,
} as const;

/**
 * Asked of every applicant on the last step, after their team's questions.
 * Answers are saved with the team's other answers, so question ids here must
 * not clash with any team's own question ids.
 */
export const RECRUITMENT_FINAL_SECTIONS: RecruitmentSection[] = [
  {
    title: "Commitment & availability",
    questions: [
      {
        id: "weekly_hours",
        label: "How many hours per week can you commit to ECell?",
        type: "select",
        required: true,
        options: ["1–2 hours", "3–5 hours", "6+ hours"],
      },
      {
        id: "availability",
        label: "Are you available for regular team meetings and on-ground events?",
        type: "select",
        required: true,
        options: ["Yes", "No", "Sometimes"],
      },
      {
        id: "clashes",
        label: "Do you have any known clashes coming up (exams, other commitments)? (If none, write \"Nil\")",
        type: "text",
        required: true,
      },
      {
        id: "anything_else",
        label: "Anything else you would like us to know?",
        type: "textarea",
        required: false,
      },
    ],
  },
  {
    title: "Acknowledgement",
    questions: [
      {
        id: "confirm_accurate",
        label: "I confirm that the above information is true to the best of my knowledge, and I have carefully read and filled out this form.",
        type: "checkboxes",
        required: true,
        options: ["Yes, I agree"],
      },
      {
        id: "confirm_mismatch",
        label: "I understand that any mismatch in the information provided will result in strict action.",
        type: "checkboxes",
        required: true,
        options: ["Yes, I agree"],
      },
    ],
  },
];

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
        id: "motivation",
        label: "Why do you want to join the Design Team of ECell?",
        type: "textarea",
        required: true,
        placeholder: "Tell us why you want to join the ECell Design Team.",
      },
      {
        id: "tools",
        label: "Which design tools are you familiar with?",
        type: "checkboxes",
        required: true,
        options: [
          "Canva",
          "Figma",
          "Adobe Photoshop",
          "Adobe Illustrator",
          "Other",
        ],
      },
      {
        id: "experience",
        label: "Have you designed materials for events or organizations before?",
        type: "select",
        required: true,
        options: ["Yes", "No"],
      },
      {
        id: "deadline_comfort",
        label:
          "How comfortable are you with creating posters or promotional material under deadlines?",
        type: "select",
        required: true,
        options: [
          "Very Comfortable",
          "Comfortable",
          "Somewhat Comfortable",
          "Not Comfortable",
        ],
      },
      {
        id: "design_principles",
        label:
          "What design principles do you think are important for social media creatives?",
        type: "textarea",
        required: true,
        placeholder:
          "Consider readability, visual hierarchy, colors, typography, and audience engagement.",
      },
      {
        id: "brand_consistency",
        label:
          "How would you maintain consistency in design and branding across posts?",
        type: "textarea",
        required: true,
        placeholder:
          "Explain how you would maintain consistent colors, fonts, layouts, and branding.",
      },
      {
        id: "collaboration",
        label:
          "Are you comfortable collaborating with the Content Creation and Social Media teams for creative outputs?",
        type: "select",
        required: true,
        options: ["Yes", "No"],
      },
      {
        id: "deadline_rating",
        label: "Rate your ability to work under deadlines",
        type: "rating",
        required: true,
        options: ["1", "2", "3", "4", "5"],
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
        id: "motivation",
        label: "Why do you want to join the Documentation Team of ECell?",
        type: "textarea",
        required: true,
        placeholder:
          "Tell us why you are interested in documentation and how you can contribute to ECell.",
      },
      {
        id: "experience",
        label:
          "Do you have experience in writing reports or maintaining documentation?",
        type: "select",
        required: true,
        options: ["Yes", "No"],
      },
      {
        id: "writingComfort",
        label:
          "How comfortable are you with writing structured reports and summaries?",
        type: "select",
        required: true,
        options: [
          "Very Comfortable",
          "Comfortable",
          "Somewhat Comfortable",
          "Not Comfortable",
        ],
      },
      {
        id: "tools",
        label: "Which tools have you used for documentation?",
        type: "checkboxes",
        required: true,
        options: [
          "Notion",
          "Microsoft Word",
          "Google Docs",
          "Other",
        ],
      },
      {
        id: "accuracy",
        label:
          "How would you ensure accurate documentation of events and activities?",
        type: "textarea",
        required: true,
        placeholder:
          "Explain how you would record important details, verify information, and avoid missing key points.",
      },
      {
        id: "reportStructure",
        label: "How would you structure a post-event report?",
        type: "textarea",
        required: true,
        placeholder:
          "Describe the sections you would include, such as event details, attendance, highlights, outcomes, and feedback.",
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
        id: "motivation",
        label: "Why do you want to join the ECell Tech team?",
        type: "textarea",
        required: true,
      },
      {
        id: "built",
        label: "Tell us about something you've built or worked on: code, design, a club project, anything.",
        description:
          "Haven't built anything yet? Tell us about something technical you tried to learn, or what you want to build.",
        type: "textarea",
        required: true,
      },
      {
        id: "github",
        label: "GitHub profile or a link to your project",
        type: "url",
        required: true,
        placeholder: "https://github.com/…",
      },
      {
        id: "stack",
        label: "Which languages or frameworks are you comfortable with?",
        type: "checkboxes",
        required: true,
        options: [
          "HTML & CSS",
          "JavaScript / TypeScript",
          "React",
          "Next.js",
          "Node.js",
          "Python",
          "SQL / databases",
          "None yet",
          "Other",
        ],
      },
      {
        id: "git",
        label: "How comfortable are you with Git and GitHub?",
        type: "select",
        required: true,
        options: [
          "Never used them",
          "Basic: clone, commit, push",
          "Comfortable: branches and pull requests",
          "Advanced: rebasing, resolving conflicts, reviewing code",
        ],
      },
      {
        id: "websiteStack",
        label: "If you were building the ECell website from scratch, what tech would you use, and why?",
        description: "There's no right answer. We want to see how you think about the choices.",
        type: "textarea",
        required: true,
      },
      {
        id: "websiteImprovement",
        label: "What's one thing you would improve on the current ECell website?",
        type: "textarea",
        required: true,
      },
      {
        id: "problem",
        label: "Tell us about a bug or technical problem you solved, and how.",
        type: "textarea",
        required: true,
      },
      {
        id: "webRating",
        label: "Rate your web development skills",
        type: "rating",
        required: true,
        options: ["1", "2", "3", "4", "5"],
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

/** Every question a team asks, in form order, final sections included. */
export function teamQuestions(team: RecruitmentTeam): RecruitmentQuestion[] {
  return [...team.questions, ...RECRUITMENT_FINAL_SECTIONS.flatMap((section) => section.questions)];
}
