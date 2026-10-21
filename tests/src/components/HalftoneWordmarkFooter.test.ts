import { describe, expect, it } from "vitest";
import { hwfFitSize, hwfHex, hwfRadius, hwfStep, hwfWarmth } from "@/src/components/HalftoneWordmarkFooter/HalftoneWordmarkFooter";

describe("HalftoneWordmarkFooter helpers", () => {
  it("parses #rgb and #rrggbb and rejects anything else", () => {
    expect(hwfHex("#8edcff")).toEqual([142, 220, 255]);
    expect(hwfHex("#fff")).toEqual([255, 255, 255]);
    expect(hwfHex("rgb(0,0,0)")).toBeNull();
  });

  it("sizes dots by area and clamps coverage", () => {
    expect(hwfRadius(0, 6)).toBe(0);
    expect(hwfRadius(2, 6)).toBe(hwfRadius(1, 6));
    expect(hwfRadius(0.25, 6)).toBeCloseTo(hwfRadius(1, 6) / 2);
  });

  it("springs a displaced dot back home when the pointer is away", () => {
    let s = [20, 0, 0, 0];
    for (let i = 0; i < 400; i++) s = hwfStep(s[0], s[1], s[2], s[3], 0, 0, -1e5, -1e5, 80);
    expect(Math.abs(s[0])).toBeLessThan(0.01);
  });

  it("pushes a dot away from a nearby pointer", () => {
    const [x] = hwfStep(10, 0, 0, 0, 10, 0, 0, 0, 80);
    expect(x).toBeGreaterThan(10);
  });

  it("warms with distance and fits text to width", () => {
    expect(hwfWarmth(0, 0, 0, 0, 28)).toBe(0);
    expect(hwfWarmth(100, 0, 0, 0, 28)).toBe(1);
    expect(hwfFitSize(50, 1000)).toBe(2000);
    expect(hwfFitSize(0, 1000)).toBe(0);
  });
});
