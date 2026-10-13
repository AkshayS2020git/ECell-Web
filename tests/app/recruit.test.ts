import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { validateApplication, type ApplicationState } from "@/app/recruit/application";
import { submitApplication } from "@/app/recruit/actions";

const IDLE: ApplicationState = { status: "idle" };

function formData(overrides: Record<string, string> = {}): FormData {
  const data = new FormData();
  const values: Record<string, string> = {
    name: "  Asha Rao ",
    email: "Asha.Rao@RVU.edu.in",
    phone: "+91 98765-43210",
    year: "2nd year",
    program: "B.Tech CSE",
    firstChoice: "tech",
    secondChoice: "design",
    why: "I want to help run events and build tools that make the startup community on campus stronger.",
    experience: "",
    link: "https://github.com/asha",
    "q.tech.stack": "TypeScript, React",
    "q.tech.problem": "Fixed a race in our club's attendance bot.",
    "q.tech.github": "",
    "q.design.portfolio": "https://behance.net/asha",
    "q.design.tool": "Figma",
    "q.design.admire": "The Stripe Press covers: calm, confident type.",
    ...overrides,
  };
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe("validateApplication", () => {
  it("normalises a valid application for the sheet", () => {
    const result = validateApplication(formData());
    expect(result).toEqual({
      ok: true,
      data: {
        name: "Asha Rao",
        email: "asha.rao@rvu.edu.in",
        phone: "9876543210",
        year: "2nd year",
        program: "B.Tech CSE",
        firstChoice: "Tech",
        secondChoice: "Design",
        why: expect.stringContaining("startup community"),
        experience: "",
        link: "https://github.com/asha",
        teamAnswers: [
          {
            team: "Tech",
            choice: "First",
            answers: [
              { question: expect.stringContaining("languages"), answer: "TypeScript, React" },
              { question: expect.stringContaining("bug"), answer: expect.stringContaining("race") },
              { question: expect.stringContaining("GitHub"), answer: "" },
            ],
          },
          {
            team: "Design",
            choice: "Second",
            answers: [
              { question: expect.stringContaining("Portfolio"), answer: "https://behance.net/asha" },
              { question: expect.stringContaining("design tool"), answer: "Figma" },
              { question: expect.stringContaining("love"), answer: expect.any(String) },
            ],
          },
        ],
      },
    });
  });

  it("checks the chosen teams' questions by their field names", () => {
    const result = validateApplication(
      formData({
        "q.tech.stack": "",
        "q.tech.github": "not a link",
        "q.design.tool": "MS Paint",
      }),
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(Object.keys(result.errors).sort()).toEqual(
      ["q.design.tool", "q.tech.github", "q.tech.stack"],
    );
  });

  it("ignores questions for teams the applicant didn't pick", () => {
    const result = validateApplication(
      formData({ secondChoice: "", "q.design.portfolio": "", "q.design.tool": "" }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.teamAnswers.map((entry) => entry.team)).toEqual(["Tech"]);
  });

  it("allows the optional fields to be empty", () => {
    const result = validateApplication(formData({ secondChoice: "", link: "" }));
    expect(result.ok).toBe(true);
  });

  it("reports every invalid field", () => {
    const result = validateApplication(
      formData({
        name: "A",
        email: "not-an-email",
        phone: "12345",
        year: "5th year",
        program: "",
        firstChoice: "made-up",
        why: "Too short",
        link: "javascript:alert(1)",
      }),
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(Object.keys(result.errors).sort()).toEqual(
      ["email", "firstChoice", "link", "name", "phone", "program", "why", "year"].sort(),
    );
  });

  it("rejects the same team as both choices", () => {
    const result = validateApplication(formData({ secondChoice: "tech" }));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.secondChoice).toBeDefined();
  });
});

describe("submitApplication", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("RECRUITMENT_SCRIPT_URL", "https://script.google.com/macros/s/test/exec");
    vi.stubEnv("RECRUITMENT_SCRIPT_SECRET", "s3cret");
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  const scriptReplies = (body: unknown) =>
    fetchMock.mockResolvedValue(new Response(JSON.stringify(body)));

  it("sends the validated application and the secret to Apps Script", async () => {
    scriptReplies({ ok: true });

    const state = await submitApplication(IDLE, formData());

    expect(state).toEqual({ status: "success" });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://script.google.com/macros/s/test/exec");
    const body = JSON.parse(init.body);
    expect(body.secret).toBe("s3cret");
    expect(body.application).toMatchObject({ email: "asha.rao@rvu.edu.in", firstChoice: "Tech" });
    expect(body.application.teamAnswers).toHaveLength(2);
  });

  it("returns field errors without calling Apps Script", async () => {
    const state = await submitApplication(IDLE, formData({ email: "nope" }));

    expect(state.status).toBe("error");
    expect(state.errors?.email).toBeDefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("quietly accepts honeypot submissions without saving them", async () => {
    const data = formData();
    data.set("company", "Spam Inc");

    expect(await submitApplication(IDLE, data)).toEqual({ status: "success" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("flags a duplicate email on the email field", async () => {
    scriptReplies({ ok: false, error: "duplicate" });

    const state = await submitApplication(IDLE, formData());

    expect(state.status).toBe("error");
    expect(state.errors?.email).toMatch(/already applied/i);
  });

  it("reports a retryable error when Apps Script fails or is unreachable", async () => {
    scriptReplies({ ok: false, error: "unauthorized" });
    expect((await submitApplication(IDLE, formData())).status).toBe("error");

    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    const state = await submitApplication(IDLE, formData());
    expect(state.status).toBe("error");
    expect(state.message).toMatch(/try again/i);
  });

  it("refuses to drop applications in production when unconfigured", async () => {
    vi.stubEnv("RECRUITMENT_SCRIPT_URL", "");
    vi.stubEnv("NODE_ENV", "production");

    expect((await submitApplication(IDLE, formData())).status).toBe("error");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("logs and succeeds in development when unconfigured", async () => {
    vi.stubEnv("RECRUITMENT_SCRIPT_URL", "");
    vi.stubEnv("NODE_ENV", "development");

    expect(await submitApplication(IDLE, formData())).toEqual({ status: "success" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
