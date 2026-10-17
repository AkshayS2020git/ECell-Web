"use server";

import { RECRUITMENT } from "@/src/data/recruitment";
import { ERRORS, validateApplication, type ApplicationState } from "./application";

// Apps Script is slow: even a trivial request takes 2–6s, and a write (lock,
// duplicate check, sheet rows) adds more, especially on its first run. Under
// load a request can also wait up to 30s for the script's lock.
// Past this we give up and let the applicant retry. Keep it under the page's
// maxDuration in app/recruit/page.tsx.
const SCRIPT_TIMEOUT_MS = 50_000;

// When Apps Script is overloaded we try again, as long as there's enough time
// left for another attempt to finish.
const MAX_ATTEMPTS = 3;
const MIN_ATTEMPT_MS = 8_000;
// Random so applicants rejected together don't all retry at the same moment.
const RETRY_DELAY_MS = { min: 1_000, max: 3_000 };

const GENERIC_ERROR = `Something went wrong on our side and your application wasn't saved. Please try again in a minute, or email ${RECRUITMENT.contactEmail}.`;

const BUSY_ERROR =
  "Lots of people are applying right now, so we couldn't save your application. Please try again in a minute.";

interface ScriptResponse {
  ok?: boolean;
  error?: string;
}

type Attempt =
  | { kind: "reply"; body: ScriptResponse; status: number }
  // No usable reply: Google's own error page when it's overloaded, or the
  // request never got through. The row may or may not have been written.
  | { kind: "failed"; status?: number }
  | { kind: "timeout" };

async function postToScript(url: string, payload: string, timeoutMs: number): Promise<Attempt> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      signal: AbortSignal.timeout(timeoutMs),
    });
    // Apps Script answers 200 even for its own errors, so trust the body.
    const body = (await response.json().catch(() => null)) as ScriptResponse | null;
    return body ? { kind: "reply", body, status: response.status } : { kind: "failed", status: response.status };
  } catch (error) {
    if ((error as Error | null)?.name === "TimeoutError") return { kind: "timeout" };
    console.error("[recruit] Could not reach Apps Script:", error);
    return { kind: "failed" };
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Validates an application and appends it to the recruitment Google Sheet via
 * the Apps Script web app in scripts/recruitment-apps-script.gs.
 *
 * Needs RECRUITMENT_SCRIPT_URL and RECRUITMENT_SCRIPT_SECRET. Without them,
 * development logs the application and reports success so the page can be
 * tried locally; production refuses rather than silently dropping applications.
 */
export async function submitApplication(
  _previous: ApplicationState,
  formData: FormData,
): Promise<ApplicationState> {
  if (!RECRUITMENT.isOpen) {
    return { status: "error", message: "Applications are closed for this round." };
  }

  // Honeypot: the field is hidden from people, so only bots fill it. Report
  // success so they have no reason to retry.
  if (formData.get("company")) {
    return { status: "success" };
  }

  const result = validateApplication(formData);
  if (!result.ok) {
    return {
      status: "error",
      message: "Some answers need a second look.",
      errors: result.errors,
    };
  }

  const url = process.env.RECRUITMENT_SCRIPT_URL;
  const secret = process.env.RECRUITMENT_SCRIPT_SECRET;

  if (!url || !secret) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[recruit] Apps Script not configured; application not saved:", result.data);
      return { status: "success" };
    }
    console.error("[recruit] RECRUITMENT_SCRIPT_URL or RECRUITMENT_SCRIPT_SECRET is not set");
    return { status: "error", message: GENERIC_ERROR };
  }

  const payload = JSON.stringify({ secret, application: result.data });
  const deadline = Date.now() + SCRIPT_TIMEOUT_MS;
  // Set once an attempt fails without a clear answer, since it may still have
  // saved the row. A later "duplicate" then most likely means it did.
  let maybeSaved = false;
  let busy = false;

  for (let attempt = 1; ; attempt++) {
    const outcome = await postToScript(url, payload, deadline - Date.now());

    if (outcome.kind === "timeout") {
      // A slow Apps Script may still save the row after we stop waiting, so
      // don't claim it wasn't saved. A retry then reports "already applied".
      return {
        status: "error",
        message:
          "This is taking longer than usual, so we couldn't confirm your application was saved. Please submit again: if it says you've already applied, it went through.",
      };
    }

    if (outcome.kind === "reply") {
      const { body } = outcome;
      if (body.ok) return { status: "success" };

      if (body.error === "duplicate") {
        if (maybeSaved) return { status: "success" };
        return {
          status: "error",
          message: "We already have an application from this email.",
          errors: { email: ERRORS.alreadyApplied },
        };
      }

      // Anything but "busy" (a bad secret, a malformed request) won't fix
      // itself on a retry.
      if (body.error !== "busy") {
        console.error("[recruit] Apps Script rejected the application:", outcome.status, body);
        return { status: "error", message: GENERIC_ERROR };
      }
      busy = true;
    } else {
      console.error("[recruit] Apps Script gave no usable reply:", outcome.status);
      maybeSaved = true;
    }

    const delay = RETRY_DELAY_MS.min + Math.random() * (RETRY_DELAY_MS.max - RETRY_DELAY_MS.min);
    if (attempt >= MAX_ATTEMPTS || deadline - Date.now() - delay < MIN_ATTEMPT_MS) break;
    await wait(delay);
  }

  return { status: "error", message: busy ? BUSY_ERROR : GENERIC_ERROR };
}
