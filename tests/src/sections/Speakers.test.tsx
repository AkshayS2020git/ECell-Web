import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import Speakers from "@/src/sections/Speakers/Speakers";

describe("Speakers Section", () => {
  beforeEach(() => {
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("renders the section heading and initial featured speaker", () => {
    render(<Speakers />);

    expect(screen.getByRole("heading", { name: "Previous Speakers" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Harpreet Sohan" })).toBeInTheDocument();
    expect(screen.getAllByText("Wand").length).toBeGreaterThan(0);
    expect(screen.getByText("Argonyx '25")).toBeInTheDocument();
  });

  it("navigates to next and previous speakers with arrow buttons", () => {
    render(<Speakers />);

    const nextBtn = screen.getByRole("button", { name: "Next speaker" });
    const prevBtn = screen.getByRole("button", { name: "Previous speaker" });

    fireEvent.click(nextBtn);
    expect(screen.getByRole("heading", { name: "Mustafa Shariff" })).toBeInTheDocument();
    expect(screen.getAllByText("Bengaluru Health Community").length).toBeGreaterThan(0);

    fireEvent.click(prevBtn);
    expect(screen.getByRole("heading", { name: "Harpreet Sohan" })).toBeInTheDocument();
  });

  it("filters speakers by category pill", () => {
    render(<Speakers />);

    const techPill = screen.getByRole("tab", { name: /Technology/i });
    fireEvent.click(techPill);

    expect(screen.getByRole("heading", { name: "Ambika J" })).toBeInTheDocument();
    expect(screen.getAllByText("Finastra").length).toBeGreaterThan(0);
  });

  it("copies speaker quote to clipboard on button click", async () => {
    render(<Speakers />);

    const copyBtn = screen.getByRole("button", { name: /Copy speaker quote/i });
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining("Building enduring tech products requires obsessing")
    );
    expect(screen.getByText("Quote Copied!")).toBeInTheDocument();
  });

  it("navigates using left and right keyboard arrows", () => {
    render(<Speakers />);

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByRole("heading", { name: "Mustafa Shariff" })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByRole("heading", { name: "Harpreet Sohan" })).toBeInTheDocument();
  });

  it("navigates using touch swipe on mobile showcase card", () => {
    const { container } = render(<Speakers />);
    const showcaseContainer = container.querySelector(".speakers-showcase-container");
    expect(showcaseContainer).toBeInTheDocument();

    // Swipe left (next)
    fireEvent.touchStart(showcaseContainer!, {
      touches: [{ clientX: 200, clientY: 100 }],
    });
    fireEvent.touchEnd(showcaseContainer!, {
      changedTouches: [{ clientX: 100, clientY: 105 }],
    });

    expect(screen.getByRole("heading", { name: "Mustafa Shariff" })).toBeInTheDocument();

    // Swipe right (prev)
    fireEvent.touchStart(showcaseContainer!, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    fireEvent.touchEnd(showcaseContainer!, {
      changedTouches: [{ clientX: 200, clientY: 105 }],
    });

    expect(screen.getByRole("heading", { name: "Harpreet Sohan" })).toBeInTheDocument();
  });
});
