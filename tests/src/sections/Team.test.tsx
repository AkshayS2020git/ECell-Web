import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TeamDirectory from "@/src/sections/Team/components/TeamDirectory";
import Team from "@/src/sections/Team/components/Team";
import teamMembers from "@/src/sections/Team/data/TeamData";

// Mock next/image
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={props.src as string} alt={props.alt || ""} className={props.className} />;
  },
}));

// Mock GSAP
vi.mock("../../src/utils/gsapSetup", () => ({
  gsap: {
    timeline: () => ({
      fromTo: vi.fn().mockReturnThis(),
      to: vi.fn().mockReturnThis(),
      kill: vi.fn(),
      scrollTrigger: null,
    }),
    set: vi.fn(),
    registerPlugin: vi.fn(),
  },
  ScrollTrigger: {
    getAll: () => [],
    getById: () => null,
  },
}));

describe("Team Data", () => {
  it("contains all 8 core team members with valid image positions", () => {
    expect(teamMembers.length).toBe(8);
    teamMembers.forEach((member) => {
      expect(member.name).toBeTruthy();
      expect(member.role).toBeTruthy();
      expect(member.image).toBeDefined();
      expect(member.imagePosition).toBeDefined();
    });
  });

  it("assigns accent colors to Akash and Aryav", () => {
    const akash = teamMembers.find((m) => m.name.toLowerCase().includes("akash"));
    const aryav = teamMembers.find((m) => m.name.toLowerCase().includes("aryav"));
    expect(akash?.accentColor).toBe("#3B82F6");
    expect(aryav?.accentColor).toBe("#FB923C");
  });
});

describe("TeamDirectory Component", () => {
  const onSelectMock = vi.fn();

  beforeEach(() => {
    onSelectMock.mockClear();
    // mock scrollTo and scrollBy
    Element.prototype.scrollIntoView = vi.fn();
    Element.prototype.scrollBy = vi.fn();
    Element.prototype.scrollTo = vi.fn();
  });

  it("renders the directory header and all team member tabs", () => {
    render(
      <TeamDirectory
        members={teamMembers}
        activeIndex={0}
        onSelect={onSelectMock}
      />
    );

    expect(screen.getByText("TEAM DIRECTORY")).toBeInTheDocument();
    expect(screen.getByText("8 Core Members")).toBeInTheDocument();

    teamMembers.forEach((member) => {
      expect(screen.getByText(member.name)).toBeInTheDocument();
    });
  });

  it("marks the active member with aria-selected", () => {
    render(
      <TeamDirectory
        members={teamMembers}
        activeIndex={2} // Dhruv Bhandari (President)
        onSelect={onSelectMock}
      />
    );

    const activeTab = screen.getByRole("tab", {
      name: new RegExp(teamMembers[2].name, "i"),
    });
    expect(activeTab).toHaveAttribute("aria-selected", "true");
  });

  it("calls onSelect when a team directory card is clicked", () => {
    render(
      <TeamDirectory
        members={teamMembers}
        activeIndex={0}
        onSelect={onSelectMock}
      />
    );

    const memberCard = screen.getByRole("tab", {
      name: new RegExp(teamMembers[3].name, "i"),
    });
    fireEvent.click(memberCard);
    expect(onSelectMock).toHaveBeenCalledWith(3);
  });

  it("supports keyboard arrow navigation across member tabs", () => {
    render(
      <TeamDirectory
        members={teamMembers}
        activeIndex={0}
        onSelect={onSelectMock}
      />
    );

    const firstCard = screen.getByRole("tab", {
      name: new RegExp(teamMembers[0].name, "i"),
    });

    fireEvent.keyDown(firstCard, { key: "ArrowRight" });
    expect(onSelectMock).toHaveBeenCalledWith(1);

    fireEvent.keyDown(firstCard, { key: "ArrowLeft" });
    expect(onSelectMock).toHaveBeenCalledWith(teamMembers.length - 1);
  });
});

describe("Team Section", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("renders main team section and navigation controls", () => {
    const { container } = render(<Team />);
    expect(container.querySelector(".team__section-title")).toHaveTextContent("Meet the team.");
    expect(container.querySelector(".team__slider-btn--next")).toBeInTheDocument();
    expect(container.querySelector(".team__slider-btn--prev")).toBeInTheDocument();
  });
});
