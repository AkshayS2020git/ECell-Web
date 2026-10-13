import {
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
  "secondChoice",
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
  "secondChoice",
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
  choice: "First" | "Second";
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
  secondChoice: string;
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

function isHttpUrl(value: string): boolean {
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
  choice: TeamAnswers["choice"],
  errors: ApplicationErrors,
): TeamAnswers {
  const answers = team.questions.map((question) => {
    const field = questionFieldName(team.id, question.id);
    const answer = text(formData, field);

    if (!answer) {
      if (question.required) errors[field] = "Please answer this one.";
    } else if (question.type === "url" && !isHttpUrl(answer)) {
      errors[field] = "Enter a full link starting with https://";
    } else if (question.type === "select" && !question.options?.includes(answer)) {
      errors[field] = "Choose one of the options.";
    } else if (answer.length > questionLimit(question)) {
      errors[field] = `Keep it under ${questionLimit(question)} characters.`;
    }

    return { question: question.label, answer };
  });

  return { team: team.name, choice, answers };
}

export function validateApplication(formData: FormData): ValidationResult {
  const errors: ApplicationErrors = {};

  const name = text(formData, "name");
  if (name.length < 2) errors.name = "Enter your full name.";
  else if (name.length > LIMITS.name) errors.name = `Keep it under ${LIMITS.name} characters.`;

  const email = text(formData, "email").toLowerCase();
  if (!EMAIL_PATTERN.test(email) || email.length > LIMITS.email) {
    errors.email = "Enter a valid email address.";
  }

  const phone = normalizePhone(text(formData, "phone"));
  if (!phone) errors.phone = "Enter a 10-digit mobile number.";

  const year = text(formData, "year");
  if (!(RECRUITMENT_YEARS as readonly string[]).includes(year)) {
    errors.year = "Choose your year.";
  }

  const program = text(formData, "program");
  if (program.length < 2) errors.program = "Enter your programme, e.g. B.Tech CSE.";
  else if (program.length > LIMITS.program) {
    errors.program = `Keep it under ${LIMITS.program} characters.`;
  }

  const firstChoice = getTeamById(text(formData, "firstChoice"));
  if (!firstChoice) errors.firstChoice = "Choose the team you want to join.";

  const secondChoiceId = text(formData, "secondChoice");
  let secondChoice = secondChoiceId ? getTeamById(secondChoiceId) : undefined;
  if (secondChoiceId && !secondChoice) {
    errors.secondChoice = "Choose a team from the list.";
  } else if (secondChoice && secondChoice.id === firstChoice?.id) {
    errors.secondChoice = "Pick a different team from your first choice.";
    secondChoice = undefined;
  }

  // Only the chosen teams' questions count; answers to any others are ignored.
  const teamAnswers: TeamAnswers[] = [];
  if (firstChoice) teamAnswers.push(validateTeamAnswers(formData, firstChoice, "First", errors));
  if (secondChoice) teamAnswers.push(validateTeamAnswers(formData, secondChoice, "Second", errors));

  const why = text(formData, "why");
  if (why.length < LIMITS.whyMin) {
    errors.why = `Tell us a little more (at least ${LIMITS.whyMin} characters).`;
  } else if (why.length > LIMITS.why) {
    errors.why = `Keep it under ${LIMITS.why} characters.`;
  }

  const experience = text(formData, "experience");
  if (experience.length > LIMITS.experience) {
    errors.experience = `Keep it under ${LIMITS.experience} characters.`;
  }

  const link = text(formData, "link");
  if (link && (link.length > LIMITS.link || !isHttpUrl(link))) {
    errors.link = "Enter a full link starting with https://";
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
      secondChoice: secondChoice?.name ?? "",
      why,
      experience,
      link,
      teamAnswers,
    },
  };
}
