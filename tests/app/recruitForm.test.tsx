import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RecruitForm from "@/app/recruit/RecruitForm";
import { submitApplication } from "@/app/recruit/actions";
import { RECRUITMENT_FUN_FACTS } from "@/src/data/recruitment";

vi.mock("@/app/recruit/actions", () => ({ submitApplication: vi.fn() }));

const submitMock = vi.mocked(submitApplication);

function type(label: RegExp | string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function fillStepOne(email = "asha.rao@rvu.edu.in") {
  type("Full name", "Asha Rao");
  type("College email", email);
  type("Phone (WhatsApp)", "98765 43210");
  type("Year", "2nd year");
  type("Programme", "B.Tech CSE");
  type("Team", "tech");
}

function next() {
  fireEvent.click(screen.getByRole("button", { name: /next: your answers/i }));
}

describe("RecruitForm", () => {
  beforeEach(() => {
    submitMock.mockReset();
    window.localStorage.clear();
  });

  it("shows inline messages instead of moving on when step 1 is incomplete", () => {
    render(<RecruitForm />);
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();

    next();

    expect(screen.getByText("Enter your full name.")).toBeInTheDocument();
    expect(screen.getByText("Choose the team you want to join.")).toBeInTheDocument();
    expect(screen.getByLabelText("Full name")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Full name")).toHaveFocus();
    expect(screen.getByText(/6 answers need fixing/i)).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
  });

  it("checks an answer on blur and clears the message once it's fixed", () => {
    render(<RecruitForm />);
    const email = screen.getByLabelText("College email");

    type("College email", "asha@gmail.com");
    fireEvent.blur(email);
    expect(screen.getByText(/use your college email/i)).toBeInTheDocument();

    type("College email", "asha@rvu.edu.in");
    expect(screen.queryByText(/use your college email/i)).toBeNull();
    expect(email).not.toHaveAttribute("aria-invalid");
  });

  it("doesn't flag an empty field just for being tabbed past", () => {
    render(<RecruitForm />);
    fireEvent.blur(screen.getByLabelText("Full name"));
    expect(screen.queryByText("Enter your full name.")).toBeNull();
  });

  it("shows the chosen team as a chip and only that team's questions on step 2", () => {
    render(<RecruitForm />);
    fillStepOne();
    next();

    expect(screen.getByText("Step 2 of 2")).toBeInTheDocument();
    expect(screen.getByText("Tech", { selector: ".rc-chip" })).toBeInTheDocument();
    expect(screen.getByLabelText(/languages or frameworks/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/recap/i)).toBeNull();
  });

  it("reveals the Other outreach tool field only after Other is selected", () => {
    render(<RecruitForm />);
    fillStepOne();
    type("Team", "pr");
    next();

    const otherDetail = /what tools or platforms have you used for communication and outreach.*other/i;
    expect(screen.queryByLabelText(otherDetail)).toBeNull();
    fireEvent.click(screen.getByLabelText("Other"));
    expect(screen.getByLabelText(otherDetail)).toBeRequired();
  });


  it("keeps answers when going back and forth between steps", () => {
    render(<RecruitForm />);
    fillStepOne();
    next();
    type(/languages or frameworks/i, "TypeScript");

    fireEvent.click(screen.getByRole("button", { name: /change team/i }));
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Full name")).toHaveValue("Asha Rao");

    next();
    expect(screen.getByLabelText(/languages or frameworks/i)).toHaveValue("TypeScript");
  });

  it("shows a confirmation with next steps after a successful submission", async () => {
    submitMock.mockResolvedValue({ status: "success" });
    render(<RecruitForm />);
    fillStepOne("Asha.Rao@RVU.edu.in");
    next();
    type(/languages or frameworks/i, "TypeScript");
    type(/bug or technical problem/i, "Fixed a race in the attendance bot.");
    type("Why do you want to join ECell?", "I want to help run events and build tools for the startup community.");

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /submit application/i }));
    });

    expect(submitMock).toHaveBeenCalledOnce();
    const panel = screen.getByRole("status");
    expect(within(panel).getByText(/thanks, asha/i)).toBeInTheDocument();
    expect(within(panel).getByText("asha.rao@rvu.edu.in")).toBeInTheDocument();
    expect(within(panel).getByText("What happens next")).toBeInTheDocument();
    expect(within(panel).getByText("Shortlisting")).toBeInTheDocument();
    expect(panel).toHaveFocus();
    expect(screen.queryByText(/saving your data/i)).toBeNull();
    expect(document.body.style.overflow).toBe("");
  });

  it("stops a second application from the same email on step 1", async () => {
    submitMock.mockResolvedValue({ status: "success" });
    const { unmount } = render(<RecruitForm />);
    fillStepOne();
    next();
    type(/languages or frameworks/i, "TypeScript");
    type(/bug or technical problem/i, "Fixed a race in the attendance bot.");
    type("Why do you want to join ECell?", "I want to help run events and build tools for the startup community.");
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /submit application/i }));
    });
    unmount();

    // Reload: the form starts on "already submitted".
    render(<RecruitForm />);
    const panel = screen.getByRole("status");
    expect(within(panel).getByRole("heading", { name: /already submitted/i })).toBeInTheDocument();
    expect(within(panel).getByText(/hi asha/i)).toBeInTheDocument();
    expect(within(panel).getByText("Tech")).toBeInTheDocument();
    expect(within(panel).getByText("asha.rao@rvu.edu.in")).toBeInTheDocument();
    expect(screen.queryByLabelText("Full name")).toBeNull();

    // Someone else on the same browser can still apply, but not with that email.
    fireEvent.click(screen.getByRole("button", { name: /apply with a different email/i }));
    fillStepOne("Asha.Rao@rvu.edu.in");
    next();

    expect(screen.getByText(/already applied/i)).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
    expect(submitMock).toHaveBeenCalledOnce();
  });

  it("shows the form as usual when nothing was sent from this browser", () => {
    render(<RecruitForm />);
    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    expect(screen.queryByText(/already/i)).toBeNull();
  });

  it("still recognises emails saved by the older storage format", () => {
    window.localStorage.setItem("ecell-recruit-applied", JSON.stringify(["asha.rao@rvu.edu.in"]));
    render(<RecruitForm />);

    const panel = screen.getByRole("status");
    expect(within(panel).getByText("asha.rao@rvu.edu.in")).toBeInTheDocument();
    expect(within(panel).queryByText("Team")).toBeNull();
  });

  it("shows a spinner with rotating fun facts while the application is saving", async () => {
    submitMock.mockReturnValue(new Promise(() => {}));
    render(<RecruitForm />);
    fillStepOne();
    next();
    type(/languages or frameworks/i, "TypeScript");
    type(/bug or technical problem/i, "Fixed a race in the attendance bot.");
    type("Why do you want to join ECell?", "I want to help run events and build tools for the startup community.");
    expect(screen.queryByText(/saving your data/i)).toBeNull();

    vi.useFakeTimers();
    try {
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /submit application/i }));
      });

      expect(screen.getByText(/saving your data/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /sending/i })).toBeDisabled();
      const fact = () => document.querySelector(".rc-pending__fact")?.textContent;
      const first = fact();
      expect(RECRUITMENT_FUN_FACTS).toContain(first);

      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(RECRUITMENT_FUN_FACTS).toContain(fact());
      expect(fact()).not.toBe(first);
    } finally {
      vi.useRealTimers();
    }
  });

  it("doesn't submit step 2 with a missing answer", () => {
    render(<RecruitForm />);
    fillStepOne();
    next();

    fireEvent.click(screen.getByRole("button", { name: /submit application/i }));

    expect(submitMock).not.toHaveBeenCalled();
    expect(screen.getAllByText("Please answer this one.")).toHaveLength(2);
    expect(screen.getByText(/at least 50 characters/i)).toBeInTheDocument();
  });
});
