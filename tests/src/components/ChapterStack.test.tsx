import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ChapterStack from "@/src/components/ChapterStack/ChapterStack";

function mockMotion(allowed: boolean) {
  vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
    // Desktop with motion allowed matches only the desktop query.
    matches: allowed && query.includes("min-width: 769px"),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function renderPage() {
  return render(
    <main>
      <section id="aboutSection" />
      <section id="speakers" />
      <ChapterStack />
    </main>,
  );
}

describe("ChapterStack", () => {
  it("never touches the page under reduced motion", () => {
    mockMotion(false);
    renderPage();

    expect(document.documentElement).not.toHaveClass("has-chapter-stack");
    expect(document.getElementById("speakers")?.getAttribute("style")).toBeNull();
  });

  it("sets the stage while active and removes it on unmount", () => {
    mockMotion(true);
    const { unmount } = renderPage();
    expect(document.documentElement).toHaveClass("has-chapter-stack");

    unmount();
    expect(document.documentElement).not.toHaveClass("has-chapter-stack");
  });
});
