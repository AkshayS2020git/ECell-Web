"use server";

import { RECRUITMENT } from "@/src/data/recruitment";
import { validateApplication, type ApplicationState } from "./application";

// Apps Script cold starts can take a few seconds; past this we give up and let
// the applicant retry rather than leave the button spinning.
const SCRIPT_TIMEOUT_MS = 15_000;

const GENERIC_ERROR = `Something went wrong on our side and your application wasn't saved. Please try again in a minute, or email ${RECRUITMENT.contactEmail}.`;

interface ScriptResponse {
  ok?: boolean;
  error?: string;
}

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

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, application: result.data }),
      signal: AbortSignal.timeout(SCRIPT_TIMEOUT_MS),
    });
    // Apps Script answers 200 even for its own errors, so trust the body.
    const body = (await response.json().catch(() => null)) as ScriptResponse | null;

    if (body?.ok) {
      return { status: "success" };
    }

    if (body?.error === "duplicate") {
      return {
        status: "error",
        message: "We already have an application from this email.",
        errors: {
          email: `Already applied. To change your answers, email ${RECRUITMENT.contactEmail}.`,
        },
      };
    }

    console.error("[recruit] Apps Script rejected the application:", response.status, body);
  } catch (error) {
    console.error("[recruit] Could not reach Apps Script:", error);
  }

  return { status: "error", message: GENERIC_ERROR };
}
