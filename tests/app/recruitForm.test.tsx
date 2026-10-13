import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RecruitForm from "@/app/recruit/RecruitForm";
import { submitApplication } from "@/app/recruit/actions";

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
