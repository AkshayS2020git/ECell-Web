import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Nav from "@/src/sections/Nav/Nav";

describe("Nav", () => {
  it("opens and closes the chapters menu with accessible state", () => {
    render(<Nav />);
    const toggle = screen.getByRole("button", { name: "Chapters" });

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "ABOUT ECELL" })).toBeVisible();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("scrolls to an existing section and closes the menu", () => {
    const section = document.createElement("section");
    section.id = "eventsSection";
    section.scrollIntoView = vi.fn();
    document.body.appendChild(section);

    render(<Nav />);
    fireEvent.click(screen.getByRole("button", { name: "Chapters" }));
    fireEvent.click(screen.getByRole("link", { name: "EVENTS" }));

    expect(section.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
    expect(screen.getByRole("button", { name: "Chapters" })).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on outside click and scroll", () => {
    render(<Nav />);
    const toggle = screen.getByRole("button", { name: "Chapters" });
    fireEvent.click(toggle);
    fireEvent.click(document.body);
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);
    fireEvent.scroll(window);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});
