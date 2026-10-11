import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import Sponsors from "@/src/sections/Sponsors/Sponsors";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));

class ObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("Sponsors backdrop sun", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", ObserverStub);
    vi.stubGlobal("ResizeObserver", ObserverStub);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("switches off on click and lights up again on the next click", () => {
    const { container } = render(<Sponsors />);
    const planets = container.querySelector(".bg-planets")!;
    // Click the painted core, as a user would, so the event bubbles to the body.
    const sunCore = container.querySelector(".bg-planet--sun .bg-planet__art > circle:last-of-type")!;

    expect(planets).not.toHaveClass("is-sun-off");

    fireEvent.click(sunCore);
    expect(planets).toHaveClass("is-sun-off");

    fireEvent.click(sunCore);
    expect(planets).not.toHaveClass("is-sun-off");

    fireEvent.click(sunCore);
    expect(planets).toHaveClass("is-sun-off");
  });

  it("gives every planet a light-travel delay that grows with distance", () => {
    const { container } = render(<Sponsors />);
    fireEvent.click(container.querySelector(".bg-planet--sun .bg-planet__art > circle:last-of-type")!);

    const delays = Array.from(
      container.querySelectorAll<HTMLElement>(".bg-planet:not(.bg-planet--sun) .bg-planet__parallax")
    ).map((layer) => layer.style.getPropertyValue("--light-delay"));
    expect(delays).toHaveLength(3);
    delays.forEach((delay) => expect(delay).toMatch(/^\d+(\.\d+)?s$/));
  });
});
