import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GameLauncher from "@/src/components/GameLauncher/GameLauncher";

describe("GameLauncher", () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.spyOn(Math, "random").mockReturnValue(0.5);
  });

  it("opens the dialog and moves focus to its close control", () => {
    render(<GameLauncher />);

    const launcher = screen.getByRole("button", { name: "Open arcade" });
    fireEvent.click(launcher);

    expect(screen.getByRole("dialog", { name: "Arcade Select" })).toBeVisible();
    expect(within(screen.getByRole("dialog")).getByRole("button", { name: "Close arcade" })).toHaveFocus();
    expect(launcher).toHaveAttribute("aria-expanded", "true");
  });

  it("starts a round, scores collected sparks, and ends after 15 seconds", () => {
    vi.useFakeTimers();
    render(<GameLauncher />);
    fireEvent.click(screen.getByRole("button", { name: "Open arcade" }));
    fireEvent.click(screen.getByRole("button", { name: /Founder Sprint/ }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Start sprint" }));

    const target = screen.getByRole("button", { name: "Collect spark" });
    fireEvent.click(target);
    expect(screen.getByText("01")).toBeInTheDocument();

    for (let tick = 0; tick < 15; tick += 1) {
      act(() => {
        vi.advanceTimersByTime(1_000);
      });
    }
    expect(screen.getByText("Round complete — 1 sparks")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play again" })).toBeInTheDocument();
  });

  it("closes from Escape, backdrop, and close control", () => {
    vi.useFakeTimers();
    render(<GameLauncher />);
    fireEvent.click(screen.getByRole("button", { name: "Open arcade" }));
    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
      vi.advanceTimersByTime(400);
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open arcade" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Close arcade" }));
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open arcade" })).toHaveFocus();
  });
});
