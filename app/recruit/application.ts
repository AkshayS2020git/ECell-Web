import {
  RECRUITMENT,
  RECRUITMENT_YEARS,
  getTeamById,
  type RecruitmentQuestion,
  type RecruitmentTeam,
} from "@/src/data/recruitment";

/**
 * Server-side validation for the recruitment form. The browser checks the same
 * rules through HTML attributes, but anyone can POST to the action directly, so
 * these are the checks that actually count.
 */

/** The fields every applicant answers, in form order. */
export const APPLICATION_FIELDS = [
  "name",
  "email",
  "phone",
  "year",
  "program",
  "firstChoice",
  "why",
  "experience",
  "link",
] as const;

export type ApplicationField = (typeof APPLICATION_FIELDS)[number];

/** Fields on step 1 of the form; the rest of the form is step 2. */
export const STEP_ONE_FIELDS: readonly ApplicationField[] = [
  "name",
  "email",
  "phone",
  "year",
  "program",
  "firstChoice",
];

export const LIMITS = {
  name: 80,
  email: 120,
  program: 80,
  whyMin: 50,
  why: 1500,
  experience: 1500,
  link: 300,
  shortAnswer: 200,
  longAnswer: 1500,
} as const;

export interface TeamAnswers {
  team: string;
  // Applicants pick one team now. The sheet's team tabs still have a Choice
  // column from when a second choice was allowed, so keep filling it.
  choice: "First";
  answers: { question: string; answer: string }[];
}

/** What the sheet receives. Teams are stored by name so the sheet reads well. */
export interface Application {
  name: string;
  email: string;
  phone: string;
  year: string;
  program: string;
  firstChoice: string;
  why: string;
  experience: string;
  link: string;
  teamAnswers: TeamAnswers[];
}

/** Keyed by form field name: an ApplicationField or a questionFieldName(). */
export type ApplicationErrors = Partial<Record<string, string>>;

export type ValidationResult =
  | { ok: true; data: Application }
  | { ok: false; errors: ApplicationErrors };

export interface ApplicationState {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: ApplicationErrors;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Only RV University students can apply, so only their college email counts. */
export const COLLEGE_EMAIL_DOMAIN = "rvu.edu.in";

/**
 * Every message an applicant can see under a field. The form checks answers in
 * the browser before this file checks them again on the server, so both use
 * these and an answer gets the same advice whichever side catches it.
 */
export const ERRORS = {
  required: "Please answer this one.",
  name: "Enter your full name.",
  emailMissing: "Enter your college email.",
  email: "Enter a valid college email address.",
  collegeEmail: `Use your college email, ending in @${COLLEGE_EMAIL_DOMAIN}.`,
  alreadyApplied: `Already applied. To change your answers, email ${RECRUITMENT.contactEmail}.`,
  phoneMissing: "Enter your WhatsApp number.",
  phone: "Enter a 10-digit mobile number.",
  year: "Choose your year.",
  program: "Enter your programme, e.g. B.Tech CSE.",
  firstChoice: "Choose the team you want to join.",
  why: `Tell us a little more (at least ${LIMITS.whyMin} characters).`,
  link: "Enter a full link starting with https://",
  option: "Choose one of the options.",
} as const;

export const tooLongError = (limit: number | string) => `Keep it under ${limit} characters.`;

export function isCollegeEmail(value: string): boolean {
  const email = value.trim().toLowerCase();
  return EMAIL_PATTERN.test(email) && email.endsWith(`@${COLLEGE_EMAIL_DOMAIN}`);
}
// Indian mobile numbers: 10 digits starting 6–9, with an optional +91 / 0 prefix.
const PHONE_PATTERN = /^(?:\+?91|0)?([6-9]\d{9})$/;

/** The 10-digit number, or null if the input isn't an Indian mobile number. */
export function normalizePhone(value: string): string | null {
  return value.replace(/[\s()-]/g, "").match(PHONE_PATTERN)?.[1] ?? null;
}

/** Form field name for a team question, e.g. "q.tech.stack". */
export function questionFieldName(teamId: string, questionId: string): string {
  return `q.${teamId}.${questionId}`;
}

export function questionLimit(question: RecruitmentQuestion): number {
  if (question.type === "textarea") return LIMITS.longAnswer;
  if (question.type === "url") return LIMITS.link;
  return LIMITS.shortAnswer;
}

function text(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function validateTeamAnswers(
  formData: FormData,
  team: RecruitmentTeam,
  errors: ApplicationErrors,
): TeamAnswers {
  const answers = team.questions.map((question) => {
    const field = questionFieldName(team.id, question.id);
    const selected = formData
      .getAll(field)
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean);
    const other = text(formData, `${field}.other`);
    const answer = question.type === "checkboxes"
      ? selected.map((value) => value === "Other" && other ? `Other: ${other}` : value).join(", ")
      : text(formData, field);

    if (!answer) {
      if (question.required) errors[field] = ERRORS.required;
    } else if (question.type === "url" && !isHttpUrl(answer)) {
      errors[field] = ERRORS.link;
    } else if (
      (question.type === "select" || question.type === "rating") &&
      !question.options?.includes(answer)
    ) {
      errors[field] = ERRORS.option;
    } else if (question.type === "checkboxes") {
      if (!selected.every((value) => question.options?.includes(value))) {
        errors[field] = ERRORS.option;
      } else if (selected.includes("Other") && !other) {
        errors[field] = ERRORS.required;
      } else if (other.length > LIMITS.shortAnswer) {
        errors[field] = tooLongError(LIMITS.shortAnswer);
      }
    } else if (answer.length > questionLimit(question)) {
      errors[field] = tooLongError(questionLimit(question));
    }

    return { question: question.label, answer };
  });

  return { team: team.name, choice: "First", answers };
}

export function validateApplication(formData: FormData): ValidationResult {
  const errors: ApplicationErrors = {};

  const name = text(formData, "name");
  if (name.length < 2) errors.name = ERRORS.name;
  else if (name.length > LIMITS.name) errors.name = tooLongError(LIMITS.name);

  const email = text(formData, "email").toLowerCase();
  if (!EMAIL_PATTERN.test(email) || email.length > LIMITS.email) {
    errors.email = ERRORS.email;
  } else if (!isCollegeEmail(email)) {
    errors.email = ERRORS.collegeEmail;
  }

  const phone = normalizePhone(text(formData, "phone"));
  if (!phone) errors.phone = ERRORS.phone;

  const year = text(formData, "year");
  if (!(RECRUITMENT_YEARS as readonly string[]).includes(year)) {
    errors.year = ERRORS.year;
  }

  const program = text(formData, "program");
  if (program.length < 2) errors.program = ERRORS.program;
  else if (program.length > LIMITS.program) {
    errors.program = tooLongError(LIMITS.program);
  }

  const firstChoice = getTeamById(text(formData, "firstChoice"));
  if (!firstChoice) errors.firstChoice = ERRORS.firstChoice;

  // Only the chosen team's questions count; answers to any others are ignored.
  const teamAnswers: TeamAnswers[] = [];
  if (firstChoice) teamAnswers.push(validateTeamAnswers(formData, firstChoice, errors));

  const why = text(formData, "why");
  if (why.length < LIMITS.whyMin) {
    errors.why = ERRORS.why;
  } else if (why.length > LIMITS.why) {
    errors.why = tooLongError(LIMITS.why);
  }

  const experience = text(formData, "experience");
  if (experience.length > LIMITS.experience) {
    errors.experience = tooLongError(LIMITS.experience);
  }

  const link = text(formData, "link");
  if (link && (link.length > LIMITS.link || !isHttpUrl(link))) {
    errors.link = ERRORS.link;
  }

  if (Object.keys(errors).length > 0 || !phone || !firstChoice) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      name,
      email,
      phone,
      year,
      program,
      firstChoice: firstChoice.name,
      why,
      experience,
      link,
      teamAnswers,
    },
  };
}
