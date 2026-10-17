"use client";

import React, {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import {
  RECRUITMENT,
  RECRUITMENT_FINAL_SECTIONS,
  RECRUITMENT_LOADING_LINES,
  RECRUITMENT_STEPS,
  RECRUITMENT_TEAMS,
  RECRUITMENT_YEARS,
  getTeamById,
  type RecruitmentQuestion,
  type RecruitmentTeam,
} from "@/src/data/recruitment";
import { scrollToElement } from "@/src/utils/lenis";
import { padNumber as pad } from "@/src/utils/math";
import { lockPageScroll } from "@/src/utils/scrollLock";
import { submitApplication } from "./actions";
import EventsLink from "./EventsLink";
import {
  COLLEGE_EMAIL_DOMAIN,
  ERRORS,
  LIMITS,
  isCollegeEmail,
  isHttpUrl,
  normalizePhone,
  questionFieldName,
  questionLimit,
  tooLongError,
  type ApplicationErrors,
  type ApplicationState,
} from "./application";

type Step = 1 | 2 | 3;
const STEPS: readonly Step[] = [1, 2, 3];
const STEP_LABELS = ["About you & select your team", "Your answers", "Final details"];
const STEP_COUNT = STEPS.length;
const LINE_INTERVAL_MS = 5000;

type FormField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

interface Submitted {
  name: string;
  email: string;
  team: string;
}

const INITIAL_STATE: ApplicationState = { status: "idle" };

// A thrown action (network drop, or a stale tab calling an action ID from an
// older deploy) would otherwise surface as a page crash. Turn it into a retry.
async function submitSafely(
  previous: ApplicationState,
  formData: FormData,
): Promise<ApplicationState> {
  try {
    return await submitApplication(previous, formData);
  } catch {
    return {
      status: "error",
      message: "We couldn't reach the server. Check your connection, refresh the page and try again.",
    };
  }
}

const fieldId = (name: string) => `rc-${name.replace(/\./g, "-")}`;

const APPLIED_KEY = "ecell-recruit-applied";
// Fired after this tab writes APPLIED_KEY; the "storage" event only covers
// writes from other tabs.
const APPLIED_EVENT = "ecell-recruit-applied";

// Applications sent from this browser, oldest first. After a reload the form
// shows the latest one as already submitted, and a second attempt with the
// same email is stopped on step 1 instead of after the slow trip to the sheet.
// The sheet's own check is what enforces one application per email.
function readApplied(): string {
  try {
    return window.localStorage.getItem(APPLIED_KEY) ?? "";
  } catch {
    return "";
  }
}

function parseApplied(raw: string): Submitted[] {
  try {
    const stored: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(stored)) return [];
    return stored.flatMap((entry: unknown): Submitted[] => {
      // Earlier visits stored bare email strings.
      if (typeof entry === "string") return [{ name: "", email: entry, team: "" }];
      if (entry && typeof entry === "object" && "email" in entry && typeof entry.email === "string") {
        return [
          {
            name: "name" in entry ? String(entry.name ?? "") : "",
            email: entry.email,
            team: "team" in entry ? String(entry.team ?? "") : "",
          },
        ];
      }
      return [];
    });
  } catch {
    return [];
  }
}

function appliedEmails(): string[] {
  return parseApplied(readApplied()).map((entry) => entry.email);
}

function rememberApplied(applied: Submitted) {
  try {
    const entries = parseApplied(readApplied());
    const known = entries.find((entry) => entry.email === applied.email);
    // A duplicate reply doesn't say which team they applied to; keep what we had.
    if (known && !applied.team) return;
    const rest = entries.filter((entry) => entry.email !== applied.email);
    window.localStorage.setItem(APPLIED_KEY, JSON.stringify([...rest, applied]));
    window.dispatchEvent(new Event(APPLIED_EVENT));
  } catch {
    // Storage blocked: the sheet's check still catches a second application.
  }
}

function subscribeApplied(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(APPLIED_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(APPLIED_EVENT, onChange);
  };
}

// What to say when a field is left empty. Fields not listed get ERRORS.required.
const MISSING_MESSAGES: Record<string, string> = {
  name: ERRORS.name,
  email: ERRORS.emailMissing,
  phone: ERRORS.phoneMissing,
  year: ERRORS.year,
  program: ERRORS.program,
  firstChoice: ERRORS.firstChoice,
  why: ERRORS.why,
};

function isFormField(target: EventTarget | null): target is FormField {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  );
}

/** Checks HTML attributes can't express. Whitespace counts as empty, as on the server. */
function customError(field: FormField): string {
  const value = field.value.trim();
  if (field instanceof HTMLInputElement && field.type === "checkbox" && field.name.startsWith("q.")) {
    const checked = field.form?.querySelector<HTMLInputElement>(
      `input[type="checkbox"][name="${field.name}"]:checked`,
    );
    return checked ? "" : ERRORS.required;
  }
  if (!value) {
    return field.required && field.value ? (MISSING_MESSAGES[field.name] ?? ERRORS.required) : "";
  }
  if (field.name === "email" && !isCollegeEmail(value)) return ERRORS.collegeEmail;
  if (field.name === "email" && appliedEmails().includes(value.toLowerCase())) return ERRORS.alreadyApplied;
  if (field.name === "phone" && !normalizePhone(value)) return ERRORS.phone;
  if (field.name === "name" && value.length < 2) return ERRORS.name;
  if (field.name === "why" && value.length < LIMITS.whyMin) return ERRORS.why;
  if (field.type === "url" && !isHttpUrl(value)) return ERRORS.link;
  return "";
}

/** The message to show under a field, or "" when its answer is fine. */
function fieldError(field: FormField): string {
  field.setCustomValidity(customError(field));
  const { validity } = field;
  if (validity.valid) return "";
  if (validity.valueMissing) return MISSING_MESSAGES[field.name] ?? ERRORS.required;
  if (validity.typeMismatch) return field.type === "email" ? ERRORS.email : ERRORS.link;
  if (validity.customError) return field.validationMessage;
  // Only inputs and textareas have length limits, so read the attributes.
  if (validity.tooShort) {
    return MISSING_MESSAGES[field.name] ?? `Use at least ${field.getAttribute("minlength")} characters.`;
  }
  if (validity.tooLong) return tooLongError(field.getAttribute("maxlength") ?? "");
  return field.validationMessage;
}

/** Shared accessibility wiring for an input and its error line. */
function fieldProps(name: string, errors: ApplicationErrors | undefined) {
  return {
    id: fieldId(name),
    name,
    "aria-invalid": errors?.[name] ? true : undefined,
    "aria-describedby": errors?.[name] ? `${fieldId(name)}-error` : undefined,
  };
}

function ErrorLine({ name, errors }: { name: string; errors?: ApplicationErrors }) {
  if (!errors?.[name]) return null;
  return (
    <p className="rc-field__error" id={`${fieldId(name)}-error`}>
      {errors[name]}
    </p>
  );
}

function QuestionField({
  team,
  question,
  errors,
}: {
  team: RecruitmentTeam;
  question: RecruitmentQuestion;
  errors?: ApplicationErrors;
}) {
  const name = questionFieldName(team.id, question.id);
  const [otherSelected, setOtherSelected] = useState(false);
  const hintId = `${fieldId(name)}-hint`;
  const describedBy =
    [question.description && hintId, errors?.[name] && `${fieldId(name)}-error`].filter(Boolean).join(" ") ||
    undefined;
  const props = {
    ...fieldProps(name, errors),
    "aria-describedby": describedBy,
    required: question.required,
    maxLength: questionLimit(question),
    placeholder: question.placeholder,
  };

  return (
    <div className="rc-field">
      <label htmlFor={fieldId(name)}>
        {question.label} {!question.required && <span>Optional</span>}
      </label>
      {question.description && (
        <p className="rc-field__hint" id={hintId}>
          {question.description}
        </p>
      )}
      {question.type === "textarea" && <textarea {...props} rows={4} />}
      {question.type === "text" && <input {...props} type="text" />}
      {question.type === "url" && (
        <input {...props} type="url" inputMode="url" autoCapitalize="none" spellCheck={false} />
      )}
      {question.type === "select" && (
        <select {...fieldProps(name, errors)} aria-describedby={describedBy} required={question.required} defaultValue="">
          <option value="" disabled={question.required}>
            {question.required ? "Choose one" : "No answer"}
          </option>
          {question.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}
      {question.type === "checkboxes" && (
        <div className="rc-choice-list" role="group" aria-describedby={describedBy}>
          {question.options?.map((option, index) => (
            <React.Fragment key={option}>
              <label className="rc-choice">
                <input
                  id={index === 0 ? fieldId(name) : undefined}
                  name={name}
                  type="checkbox"
                  value={option}
                  aria-invalid={errors?.[name] ? true : undefined}
                  onChange={(event) => {
                    if (option === "Other") setOtherSelected(event.currentTarget.checked);
                  }}
                />
                <span>{option}</span>
              </label>
              {option === "Other" && otherSelected && (
                <input
                  name={`${name}.other`}
                  type="text"
                  maxLength={LIMITS.shortAnswer}
                  placeholder="Please specify"
                  aria-label={`${question.label} — Other`}
                  required
                />
              )}
            </React.Fragment>
          ))}
        </div>
      )}
      {question.type === "rating" && (
        <div className="rc-rating" role="radiogroup" aria-label={question.label} aria-describedby={describedBy}>
          {question.options?.map((option) => (
            <label className="rc-rating__option" key={option}>
              <input
                name={name}
                type="radio"
                value={option}
                required={question.required}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )}
      <ErrorLine name={name} errors={errors} />
    </div>
  );
}

/**
 * Full-screen spinner while the application is saved. Portalled to <body> so
 * no transformed ancestor can pull it off the centre of the screen, and holds
 * the page still underneath until the save finishes.
 */
function SavingOverlay() {
  // Only ever rendered in the browser after a submit, so picking at random
  // here can't cause a hydration mismatch.
  const [lineIndex, setLineIndex] = useState(() =>
    Math.floor(Math.random() * RECRUITMENT_LOADING_LINES.length),
  );

  useEffect(() => lockPageScroll(), []);

  // A slow save shouldn't leave them staring at one line: move to a different
  // line every few seconds.
  useEffect(() => {
    if (RECRUITMENT_LOADING_LINES.length < 2) return;
    const timer = window.setInterval(() => {
      setLineIndex((current) => {
        const offset = 1 + Math.floor(Math.random() * (RECRUITMENT_LOADING_LINES.length - 1));
        return (current + offset) % RECRUITMENT_LOADING_LINES.length;
      });
    }, LINE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  return createPortal(
    <div className="rc-pending">
      <span className="rc-spinner" aria-hidden="true" />
      <p className="rc-pending__line" key={lineIndex}>
        {RECRUITMENT_LOADING_LINES[lineIndex]}
      </p>
      {/* Only this line is announced; the rotating lines would be noise. */}
      <p className="rc-pending__status" role="status">
        Saving your data…
      </p>
    </div>,
    document.body,
  );
}

/**
 * The result of an application: straight after submitting, or, with
 * `onApplyAgain`, on a later visit from a browser that has already applied.
 */
function SuccessPanel({
  submitted,
  onApplyAgain,
}: {
  submitted: Submitted | null;
  onApplyAgain?: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const firstName = submitted?.name.split(/\s+/)[0];
  const returning = onApplyAgain !== undefined;

  useEffect(() => {
    // A returning visitor didn't just do anything, so leave their scroll alone.
    if (returning) return;
    // The thank-you panel replaces a long form; bring its top into view and
    // move focus to it so screen readers and keyboards land on the result.
    scrollToElement("#apply", { offset: -90 });
    panelRef.current?.focus({ preventScroll: true });
  }, [returning]);

  return (
    <div className="rc-success" ref={panelRef} tabIndex={-1} role="status">
      <span className="rc-success__mark" aria-hidden="true">✓</span>
      {returning ? (
        <>
          <h3>
            Already <em>submitted.</em>
          </h3>
          <p>
            {firstName ? `Hi ${firstName}. ` : ""}
            We already have your application, and the team will read it after applications close on{" "}
            {RECRUITMENT.deadline}.
          </p>
        </>
      ) : (
        <>
          <h3>
            Application <em>received.</em>
          </h3>
          <p>
            {firstName ? `Thanks, ${firstName}. ` : "Thanks. "}
            Your application is in and the team will read it after applications close on{" "}
            {RECRUITMENT.deadline}.
          </p>
        </>
      )}

      {submitted && (
        <dl className="rc-success__summary">
          {submitted.team && (
            <div>
              <dt>Team</dt>
              <dd>{submitted.team}</dd>
            </div>
          )}
          <div>
            <dt>We&apos;ll write to</dt>
            <dd>{submitted.email}</dd>
          </div>
        </dl>
      )}

      <h4 className="rc-success__next">What happens next</h4>
      <ol className="rc-success__steps">
        {RECRUITMENT_STEPS.map((item, index) => (
          <li key={item.title} className={index === 0 ? "is-done" : undefined}>
            <span aria-hidden="true">{index === 0 ? "✓" : pad(index + 1)}</span>
            <div>
              <strong>
                {item.title}
                {index === 0 && <em> Done</em>}
              </strong>
              {index > 0 && <p>{item.description}</p>}
            </div>
          </li>
        ))}
      </ol>

      <div className="rc-success__explore">
        <p>While you wait, see what ECell has been up to.</p>
        <EventsLink className="rc-button rc-button--solid">
          Explore events <span aria-hidden="true">→</span>
        </EventsLink>
      </div>

      <p className="rc-success__help">
        Need to change something? Write to{" "}
        <a href={`mailto:${RECRUITMENT.contactEmail}`}>{RECRUITMENT.contactEmail}</a>.
      </p>

      {/* Shared computers: someone else may want to apply from here too. */}
      {onApplyAgain && (
        <button className="rc-chosen__change rc-success__again" type="button" onClick={onApplyAgain}>
          <span className="rc-success__again-q">Not you?</span>
          <span className="rc-success__again-cta">
            Apply with a different email <i aria-hidden="true">→</i>
          </span>
        </button>
      )}
    </div>
  );
}

export default function RecruitForm(): React.ReactElement {
  const [step, setStep] = useState<Step>(1);
  const [firstChoiceId, setFirstChoiceId] = useState("");
  const [whyLength, setWhyLength] = useState(0);
  // Errors found in the browser. An empty string hides a stale server error
  // for a field the applicant has since fixed.
  const [clientErrors, setClientErrors] = useState<ApplicationErrors>({});
  const [stepMessage, setStepMessage] = useState("");
  const [submitted, setSubmitted] = useState<Submitted | null>(null);
  // Read after hydration (the server always renders the form), then kept in
  // sync with writes from this tab and others.
  const appliedRaw = useSyncExternalStore(subscribeApplied, readApplied, () => "");
  const lastApplied = useMemo(() => parseApplied(appliedRaw).at(-1) ?? null, [appliedRaw]);
  const [applyingAgain, setApplyingAgain] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const stepOneRef = useRef<HTMLDivElement>(null);
  const stepTwoRef = useRef<HTMLDivElement>(null);
  const stepThreeRef = useRef<HTMLDivElement>(null);

  const panelFor = (target: Step) => [stepOneRef, stepTwoRef, stepThreeRef][target - 1].current;
  const fieldsIn = (target: Step) =>
    Array.from(panelFor(target)?.querySelectorAll<FormField>("input, select, textarea") ?? []);

  const [state, formAction, pending] = useActionState(
    async (previous: ApplicationState, formData: FormData) => {
      const next = await submitSafely(previous, formData);
      if (next.status === "success" || next.errors?.email === ERRORS.alreadyApplied) {
        rememberApplied({
          name: String(formData.get("name") ?? "").trim(),
          email: String(formData.get("email") ?? "").trim().toLowerCase(),
          // Only a success confirms the team; a duplicate may have been for another.
          team: next.status === "success" ? (getTeamById(String(formData.get("firstChoice") ?? ""))?.name ?? "") : "",
        });
      }
      // The server's verdict replaces whatever the browser last showed.
      setClientErrors({});
      // A rejected answer (e.g. an email that already applied) sends the
      // applicant back to the step where they can fix it.
      const errorStep = STEPS.find((target) => fieldsIn(target).some((field) => next.errors?.[field.name]));
      if (errorStep) setStep(errorStep);
      return next;
    },
    INITIAL_STATE,
  );

  const chosenTeam = getTeamById(firstChoiceId);
  const errors: ApplicationErrors = { ...state.errors, ...clientErrors };

  useEffect(() => {
    // Send focus to the first answer the server rejected, in form order.
    const serverErrors = state.errors;
    if (!serverErrors || !formRef.current) return;
    const firstInvalid = Array.from(formRef.current.elements).find(
      (element) => isFormField(element) && serverErrors[element.name],
    );
    if (firstInvalid instanceof HTMLElement) firstInvalid.focus();
  }, [state]);

  const showStep = (next: Step, focusSelector = "input, select, textarea") => {
    setStep(next);
    setStepMessage("");
    scrollToElement("#rc-form", { offset: -100 });
    // Wait for the step to render before moving focus into it.
    window.requestAnimationFrame(() => {
      panelFor(next)?.querySelector<HTMLElement>(focusSelector)?.focus({ preventScroll: true });
    });
  };

  // The form is noValidate so nothing pops up a browser bubble; each step
  // checks its own fields and shows the messages inline instead.
  const checkStep = (target: Step) => {
    const fields = fieldsIn(target);
    const found: ApplicationErrors = {};
    for (const field of fields) found[field.name] = fieldError(field);
    setClientErrors((previous) => ({ ...previous, ...found }));

    const invalid = fields.filter((field) => found[field.name]);
    if (invalid.length === 0) {
      setStepMessage("");
      return true;
    }
    setStepMessage(
      invalid.length === 1
        ? "One answer needs fixing before you can continue."
        : `${invalid.length} answers need fixing before you can continue.`,
    );
    invalid[0].focus({ preventScroll: true });
    scrollToElement(invalid[0], { offset: -160 });
    return false;
  };

  const goToNextStep = () => {
    if (checkStep(step)) showStep((step + 1) as Step);
  };

  // Check an answer when the applicant leaves it. An empty field isn't
  // flagged just for being tabbed past; Next and Submit catch those.
  const handleBlur = (event: React.FocusEvent<HTMLFormElement>) => {
    const field = event.target;
    if (!isFormField(field) || !field.name || field.name === "company") return;
    if (!field.value && !errors[field.name]) return;
    const message = fieldError(field);
    setClientErrors((previous) => ({ ...previous, [field.name]: message }));
  };

  // Once a field shows an error, re-check it as they type so the message
  // goes away the moment the answer is fixed.
  const handleChange = (event: React.FormEvent<HTMLFormElement>) => {
    const field = event.target;
    if (!isFormField(field) || !errors[field.name]) return;
    const message = fieldError(field);
    setClientErrors((previous) => ({ ...previous, [field.name]: message }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // Submitting through onSubmit instead of the `action` prop stops React from
    // resetting the form afterwards, so a rejected application keeps its answers.
    event.preventDefault();
    // Enter before the last step means "next", not "submit".
    if (step < STEP_COUNT) {
      goToNextStep();
      return;
    }
    if (!checkStep(step)) return;
    const formData = new FormData(event.currentTarget);
    setSubmitted({
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim().toLowerCase(),
      team: chosenTeam?.name ?? "",
    });
    startTransition(() => formAction(formData));
  };

  if (state.status === "success") return <SuccessPanel submitted={submitted} />;
  if (lastApplied && !applyingAgain) {
    return <SuccessPanel submitted={lastApplied} onApplyAgain={() => setApplyingAgain(true)} />;
  }

  const status = stepMessage || (state.status === "error" ? (state.message ?? "") : "");

  return (
    <form
      ref={formRef}
      id="rc-form"
      className="rc-form"
      onSubmit={handleSubmit}
      onBlur={handleBlur}
      onChange={handleChange}
      noValidate
    >
      <div className="rc-progress-wrap">
        <p className="rc-progress__count" aria-live="polite">
          Step {step} of {STEP_COUNT}
        </p>
        <ol className="rc-progress" aria-label="Application steps">
          {STEP_LABELS.map((label, index) => (
            <li
              key={label}
              className={step === index + 1 ? "is-current" : step > index + 1 ? "is-done" : ""}
              aria-current={step === index + 1 ? "step" : undefined}
            >
              <span>{pad(index + 1)}</span> {label}
            </li>
          ))}
        </ol>
      </div>

      {/* Honeypot for bots. Hidden from people and assistive tech. */}
      <div className="rc-honeypot" aria-hidden="true">
        <label htmlFor="rc-company">Company</label>
        <input id="rc-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {/* Step 1 stays mounted while hidden so its answers are still submitted
          and survive going back and forth. */}
      <div ref={stepOneRef} className="rc-step-panel" hidden={step !== 1}>
        <fieldset className="rc-fieldset" disabled={pending}>
          <legend>01 · About you</legend>

          <div className="rc-row">
            <div className="rc-field">
              <label htmlFor="rc-name">Full name</label>
              <input
                {...fieldProps("name", errors)}
                type="text"
                autoComplete="name"
                autoCapitalize="words"
                enterKeyHint="next"
                required
                minLength={2}
                maxLength={LIMITS.name}
              />
              <ErrorLine name="name" errors={errors} />
            </div>

            <div className="rc-field">
              <label htmlFor="rc-email">College email</label>
              <input
                {...fieldProps("email", errors)}
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                enterKeyHint="next"
                required
                maxLength={LIMITS.email}
                placeholder={`you@${COLLEGE_EMAIL_DOMAIN}`}
              />
              <ErrorLine name="email" errors={errors} />
            </div>
          </div>

          <div className="rc-row">
            <div className="rc-field">
              <label htmlFor="rc-phone">Phone (WhatsApp)</label>
              <input
                {...fieldProps("phone", errors)}
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                enterKeyHint="next"
                required
                placeholder="98765 43210"
              />
              <ErrorLine name="phone" errors={errors} />
            </div>

            <div className="rc-field">
              <label htmlFor="rc-year">Year</label>
              <select {...fieldProps("year", errors)} required defaultValue="">
                <option value="" disabled>
                  Select your year
                </option>
                {RECRUITMENT_YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <ErrorLine name="year" errors={errors} />
            </div>
          </div>

          <div className="rc-field">
            <label htmlFor="rc-program">Programme</label>
            <input
              {...fieldProps("program", errors)}
              type="text"
              enterKeyHint="next"
              required
              minLength={2}
              maxLength={LIMITS.program}
              placeholder="B.Tech CSE, BBA, B.Des…"
            />
            <ErrorLine name="program" errors={errors} />
          </div>
        </fieldset>

        <fieldset className="rc-fieldset" disabled={pending}>
          <legend>02 · Select your team</legend>

          <div className="rc-field">
            <label htmlFor="rc-firstChoice">Team</label>
            <select
              {...fieldProps("firstChoice", errors)}
              required
              value={firstChoiceId}
              onChange={(event) => setFirstChoiceId(event.currentTarget.value)}
            >
              <option value="" disabled>
                Select a team
              </option>
              {RECRUITMENT_TEAMS.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            <ErrorLine name="firstChoice" errors={errors} />
          </div>
          <p className="rc-fieldset__note">
            {chosenTeam
              ? `${chosenTeam.tagline} Next, ${chosenTeam.questions.length} ${chosenTeam.questions.length === 1 ? "question" : "questions"} from the ${chosenTeam.name} team.`
              : "Each team has its own questions. You'll answer your team's on the next step."}
          </p>
        </fieldset>

        <div className="rc-submit">
          <button className="rc-button rc-button--solid" type="button" onClick={goToNextStep}>
            Next: your answers <span aria-hidden="true">→</span>
          </button>
          <p className="rc-submit__status" role="status" aria-live="polite">
            {step === 1 ? status : ""}
          </p>
        </div>
      </div>

      {/* Step 2 renders only the chosen team's questions; switching teams on
          step 1 swaps them out. */}
      <div ref={stepTwoRef} className="rc-step-panel" hidden={step !== 2}>
        {chosenTeam && (
          <div className="rc-chosen">
            <span className="rc-chosen__label">Applying to</span>
            <span className="rc-chip">{chosenTeam.name}</span>
            <button
              className="rc-chosen__change"
              type="button"
              onClick={() => showStep(1, "#rc-firstChoice")}
              disabled={pending}
            >
              Change team
            </button>
          </div>
        )}

        {chosenTeam && (
          <fieldset className="rc-fieldset" disabled={pending} key={chosenTeam.id}>
            <legend>03 · {chosenTeam.name} questions</legend>
            {chosenTeam.questions.map((question) => (
              <QuestionField key={question.id} team={chosenTeam} question={question} errors={errors} />
            ))}
          </fieldset>
        )}

        <div className="rc-submit">
          <button className="rc-button rc-button--back" type="button" onClick={() => showStep(1)} disabled={pending}>
            <span aria-hidden="true">←</span> Back
          </button>
          <button className="rc-button rc-button--solid" type="button" onClick={goToNextStep} disabled={pending}>
            Next: {STEP_LABELS[2].toLowerCase()} <span aria-hidden="true">→</span>
          </button>
          <p className="rc-submit__status" role="status" aria-live="polite">
            {step === 2 ? status : ""}
          </p>
        </div>
      </div>

      <div ref={stepThreeRef} className="rc-step-panel" hidden={step !== 3}>
        <fieldset className="rc-fieldset" disabled={pending}>
          <legend>04 · In your words</legend>

          <div className="rc-field">
            <label htmlFor="rc-why">Why do you want to join ECell?</label>
            <textarea
              {...fieldProps("why", errors)}
              rows={5}
              required
              minLength={LIMITS.whyMin}
              maxLength={LIMITS.why}
              onChange={(event) => setWhyLength(event.currentTarget.value.trim().length)}
            />
            <p className="rc-field__count" aria-live="polite">
              {whyLength < LIMITS.whyMin
                ? `${LIMITS.whyMin - whyLength} more characters to go`
                : `${whyLength} / ${LIMITS.why}`}
            </p>
            <ErrorLine name="why" errors={errors} />
          </div>

          <div className="rc-field">
            <label htmlFor="rc-experience">
              Something you&apos;ve built, run or led <span>Optional</span>
            </label>
            <textarea {...fieldProps("experience", errors)} rows={4} maxLength={LIMITS.experience} />
            <ErrorLine name="experience" errors={errors} />
          </div>

          {chosenTeam?.id !== "design" && (
            <div className="rc-field">
              <label htmlFor="rc-link">LinkedIn</label>
              <input
                {...fieldProps("link", errors)}
                type="url"
                inputMode="url"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={LIMITS.link}
                placeholder="https://"
                required
              />
              <ErrorLine name="link" errors={errors} />
            </div>
          )}
        </fieldset>

        {chosenTeam &&
          RECRUITMENT_FINAL_SECTIONS.map((section, index) => (
            <fieldset className="rc-fieldset" disabled={pending} key={`${chosenTeam.id}-${section.title}`}>
              <legend>
                {pad(index + 5)} · {section.title}
              </legend>
              {section.questions.map((question) => (
                <QuestionField key={question.id} team={chosenTeam} question={question} errors={errors} />
              ))}
            </fieldset>
          ))}

        <div className="rc-submit">
          <button className="rc-button rc-button--back" type="button" onClick={() => showStep((step - 1) as Step)} disabled={pending}>
            <span aria-hidden="true">←</span> Back
          </button>
          <button className="rc-button rc-button--solid" type="submit" disabled={pending}>
            {pending ? "Sending…" : "Submit application"} <span aria-hidden="true">→</span>
          </button>
          <p className="rc-submit__status" role="status" aria-live="polite">
            {step === 3 && !pending ? status : ""}
          </p>
          {pending && <SavingOverlay />}
        </div>
      </div>
    </form>
  );
}
