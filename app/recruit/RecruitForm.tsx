"use client";

import React, { startTransition, useActionState, useEffect, useRef, useState } from "react";
import {
  RECRUITMENT,
  RECRUITMENT_TEAMS,
  RECRUITMENT_YEARS,
  getTeamById,
  type RecruitmentQuestion,
  type RecruitmentTeam,
} from "@/src/data/recruitment";
import { scrollToElement } from "@/src/utils/lenis";
import { submitApplication } from "./actions";
import {
  LIMITS,
  STEP_ONE_FIELDS,
  normalizePhone,
  questionFieldName,
  questionLimit,
  type ApplicationErrors,
  type ApplicationState,
} from "./application";

type Step = 1 | 2;

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

const pad = (value: number) => value.toString().padStart(2, "0");
const fieldId = (name: string) => `rc-${name.replace(/\./g, "-")}`;

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
  const props = {
    ...fieldProps(name, errors),
    required: question.required,
    maxLength: questionLimit(question),
    placeholder: question.placeholder,
  };

  return (
    <div className="rc-field">
      <label htmlFor={fieldId(name)}>
        {question.label} {!question.required && <span>Optional</span>}
      </label>
      {question.type === "textarea" && <textarea {...props} rows={4} data-lenis-prevent />}
      {question.type === "text" && <input {...props} type="text" />}
      {question.type === "url" && <input {...props} type="url" inputMode="url" />}
      {question.type === "select" && (
        <select {...fieldProps(name, errors)} required={question.required} defaultValue="">
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
      <ErrorLine name={name} errors={errors} />
    </div>
  );
}

export default function RecruitForm(): React.ReactElement {
  const [step, setStep] = useState<Step>(1);
  const [firstChoiceId, setFirstChoiceId] = useState("");
  const [secondChoiceId, setSecondChoiceId] = useState("");
  const [whyLength, setWhyLength] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const stepOneRef = useRef<HTMLDivElement>(null);
  const stepTwoRef = useRef<HTMLDivElement>(null);

  const [state, formAction, pending] = useActionState(
    async (previous: ApplicationState, formData: FormData) => {
      const next = await submitSafely(previous, formData);
      // A rejected step-1 answer (e.g. an email that already applied) sends
      // the applicant back to where they can fix it.
      if (STEP_ONE_FIELDS.some((field) => next.errors?.[field])) setStep(1);
      return next;
    },
    INITIAL_STATE,
  );

  const firstTeam = getTeamById(firstChoiceId);
  const secondTeam = secondChoiceId !== firstChoiceId ? getTeamById(secondChoiceId) : undefined;
  const chosenTeams = [
    firstTeam && { team: firstTeam, label: "First choice" },
    secondTeam && { team: secondTeam, label: "Second choice" },
  ].filter((entry) => entry !== undefined);

  useEffect(() => {
    if (state.status === "success") {
      // The thank-you panel replaces a long form; bring its top into view.
      scrollToElement("#apply", { offset: -90 });
      return;
    }
    // Send focus to the first answer the server rejected, in form order.
    const errors = state.errors;
    if (!errors || !formRef.current) return;
    const firstInvalid = Array.from(formRef.current.elements).find(
      (element) => "name" in element && errors[(element as HTMLInputElement).name],
    );
    if (firstInvalid instanceof HTMLElement) firstInvalid.focus();
  }, [state]);

  const showStep = (next: Step) => {
    setStep(next);
    scrollToElement("#apply", { offset: -90 });
    // Wait for the step to render before moving focus into it.
    window.requestAnimationFrame(() => {
      const panel = next === 1 ? stepOneRef.current : stepTwoRef.current;
      panel?.querySelector<HTMLElement>("input, select, textarea")?.focus({ preventScroll: true });
    });
  };

  // The form is noValidate, because the browser would otherwise check the
  // hidden step's required fields too. Each step checks its own fields here.
  const stepIsValid = (panel: HTMLElement | null) => {
    const invalid = Array.from(
      panel?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        "input, select, textarea",
      ) ?? [],
    ).find((field) => !field.checkValidity());
    invalid?.reportValidity();
    return !invalid;
  };

  const goToStepTwo = () => {
    const form = formRef.current;
    if (!form) return;

    // Checks the browser can't express as HTML attributes.
    const phone = form.elements.namedItem("phone") as HTMLInputElement;
    phone.setCustomValidity(
      phone.value && !normalizePhone(phone.value) ? "Enter a 10-digit mobile number." : "",
    );
    const second = form.elements.namedItem("secondChoice") as HTMLSelectElement;
    second.setCustomValidity(
      second.value && second.value === firstChoiceId ? "Pick a different team from your first choice." : "",
    );

    if (stepIsValid(stepOneRef.current)) showStep(2);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // Submitting through onSubmit instead of the `action` prop stops React from
    // resetting the form afterwards, so a rejected application keeps its answers.
    event.preventDefault();
    // Enter on step 1 means "next", not "submit".
    if (step === 1) {
      goToStepTwo();
      return;
    }
    if (!stepIsValid(stepTwoRef.current)) return;
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  };

  if (state.status === "success") {
    return (
      <div className="rc-success" role="status">
        <span className="rc-success__mark" aria-hidden="true">✓</span>
        <h3>
          Application <em>received.</em>
        </h3>
        <p>
          Thanks for applying. We&apos;ll email you about the next round after the
          deadline on {RECRUITMENT.deadline}. Questions? Write to{" "}
          <a href={`mailto:${RECRUITMENT.contactEmail}`}>{RECRUITMENT.contactEmail}</a>.
        </p>
      </div>
    );
  }

  const errors = state.errors;
  const status = state.status === "error" ? state.message : "";

  return (
    <form ref={formRef} className="rc-form" onSubmit={handleSubmit} noValidate>
      <ol className="rc-progress" aria-label="Application steps">
        <li className={step === 1 ? "is-current" : "is-done"} aria-current={step === 1 ? "step" : undefined}>
          <span>01</span> You &amp; your team
        </li>
        <li className={step === 2 ? "is-current" : ""} aria-current={step === 2 ? "step" : undefined}>
          <span>02</span> Your answers
        </li>
      </ol>

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
              <input {...fieldProps("name", errors)} type="text" autoComplete="name" required minLength={2} maxLength={LIMITS.name} />
              <ErrorLine name="name" errors={errors} />
            </div>

            <div className="rc-field">
              <label htmlFor="rc-email">Email</label>
              <input {...fieldProps("email", errors)} type="email" autoComplete="email" required maxLength={LIMITS.email} placeholder="you@rvu.edu.in" />
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
                required
                placeholder="98765 43210"
                onChange={(event) => event.currentTarget.setCustomValidity("")}
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
            <input {...fieldProps("program", errors)} type="text" required minLength={2} maxLength={LIMITS.program} placeholder="B.Tech CSE, BBA, B.Des…" />
            <ErrorLine name="program" errors={errors} />
          </div>
        </fieldset>

        <fieldset className="rc-fieldset" disabled={pending}>
          <legend>02 · Your team</legend>

          <div className="rc-row">
            <div className="rc-field">
              <label htmlFor="rc-firstChoice">First choice</label>
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

            <div className="rc-field">
              <label htmlFor="rc-secondChoice">
                Second choice <span>Optional</span>
              </label>
              <select
                {...fieldProps("secondChoice", errors)}
                value={secondChoiceId}
                onChange={(event) => {
                  event.currentTarget.setCustomValidity("");
                  setSecondChoiceId(event.currentTarget.value);
                }}
              >
                <option value="">No second choice</option>
                {RECRUITMENT_TEAMS.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <ErrorLine name="secondChoice" errors={errors} />
            </div>
          </div>
          <p className="rc-fieldset__note">
            Each team has its own questions. You&apos;ll answer them on the next step.
          </p>
        </fieldset>

        <div className="rc-submit">
          <button className="rc-button rc-button--solid" type="button" onClick={goToStepTwo}>
            Next: your answers <span aria-hidden="true">→</span>
          </button>
          <p className="rc-submit__status" role="status" aria-live="polite">
            {step === 1 ? status : ""}
          </p>
        </div>
      </div>

      {/* Step 2 renders the chosen teams' questions; switching teams on step 1
          swaps them out. */}
      <div ref={stepTwoRef} className="rc-step-panel" hidden={step !== 2}>
        {chosenTeams.map(({ team, label }, index) => (
          <fieldset className="rc-fieldset" disabled={pending} key={team.id}>
            <legend>
              {pad(index + 3)} · {team.name} <span>{label}</span>
            </legend>
            {team.questions.map((question) => (
              <QuestionField key={question.id} team={team} question={question} errors={errors} />
            ))}
          </fieldset>
        ))}

        <fieldset className="rc-fieldset" disabled={pending}>
          <legend>{pad(chosenTeams.length + 3)} · In your words</legend>

          <div className="rc-field">
            <label htmlFor="rc-why">Why do you want to join ECell?</label>
            <textarea
              {...fieldProps("why", errors)}
              rows={5}
              required
              minLength={LIMITS.whyMin}
              maxLength={LIMITS.why}
              onChange={(event) => setWhyLength(event.currentTarget.value.trim().length)}
              data-lenis-prevent
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
            <textarea {...fieldProps("experience", errors)} rows={4} maxLength={LIMITS.experience} data-lenis-prevent />
            <ErrorLine name="experience" errors={errors} />
          </div>

          <div className="rc-field">
            <label htmlFor="rc-link">
              Portfolio, GitHub or LinkedIn <span>Optional</span>
            </label>
            <input {...fieldProps("link", errors)} type="url" inputMode="url" maxLength={LIMITS.link} placeholder="https://" />
            <ErrorLine name="link" errors={errors} />
          </div>
        </fieldset>

        <div className="rc-submit">
          <button className="rc-button rc-button--back" type="button" onClick={() => showStep(1)} disabled={pending}>
            <span aria-hidden="true">←</span> Back
          </button>
          <button className="rc-button rc-button--solid" type="submit" disabled={pending}>
            {pending ? "Sending…" : "Submit application"} <span aria-hidden="true">→</span>
          </button>
          <p className="rc-submit__status" role="status" aria-live="polite">
            {step === 2 ? status : ""}
          </p>
        </div>
      </div>
    </form>
  );
}
