import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Nav from "@/src/sections/Nav/Nav";
import SubNav from "@/src/sections/Nav/SubNav";

describe("SubNav (events)", () => {
  it("renders a plain Home link to '/' with no logo button, hint, or modal", () => {
    const { container } = render(<SubNav />);

    const homeLink = screen.getByRole("link", { name: /home/i });
    expect(homeLink).toHaveAttribute("href", "/");
    expect(container.querySelector(".nav__logo-button")).toBeNull();
    expect(container.querySelector(".nav__logo-hint")).toBeNull();
    expect(screen.queryByText(/click to explore/i)).toBeNull();

    fireEvent.click(homeLink);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("Nav (home)", () => {
  it("shows the logo hint only once the logo settles in the nav, and opens the logo modal", () => {
    render(<Nav />);

    // Hidden (and unreachable) while the logo is still in the hero.
    expect(screen.queryByRole("button", { name: "Click to explore our logo story" })).toBeNull();
    // The empty logo slot isn't clickable before the logo lands in it either.
    expect(screen.queryByRole("button", { name: "View our logo symbolism" })).toBeNull();

    act(() => {
      window.dispatchEvent(new CustomEvent("ecell:logo-in-nav", { detail: { inNav: true } }));
    });
    expect(screen.getByRole("button", { name: "Click to explore our logo story" })).toHaveClass("is-visible");

    fireEvent.click(screen.getByRole("button", { name: "View our logo symbolism" }));
    expect(within(screen.getByRole("dialog")).getByText("OUR LOGO")).toBeInTheDocument();
  });
});
