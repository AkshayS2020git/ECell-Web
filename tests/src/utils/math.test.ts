import { describe, expect, it } from "vitest";
import { clamp, degToRad, lerp, mapRange, normalize, radToDeg, smoothstep } from "@/src/utils/math";

describe("math utilities", () => {
  it("clamps values below, within, and above the range", () => {
    expect(clamp(-1)).toBe(0);
    expect(clamp(0.5)).toBe(0.5);
    expect(clamp(2)).toBe(1);
    expect(clamp(12, 10, 20)).toBe(12);
  });

  it("interpolates and maps ranges", () => {
    expect(lerp(0, 100, 0.25)).toBe(25);
    expect(mapRange(5, 0, 10, 100, 200)).toBe(150);
    expect(normalize(25, 0, 100)).toBe(0.25);
    expect(smoothstep(0, 10, 0)).toBe(0);
    expect(smoothstep(0, 10, 5)).toBe(0.5);
    expect(smoothstep(0, 10, 10)).toBe(1);
  });

  it("converts between degrees and radians", () => {
    expect(degToRad(180)).toBeCloseTo(Math.PI);
    expect(radToDeg(Math.PI / 2)).toBeCloseTo(90);
  });

  it("preserves the documented edge behavior for invalid ranges", () => {
    expect(normalize(1, 1, 1)).toBeNaN();
    expect(mapRange(1, 1, 1, 0, 10)).toBeNaN();
  });
});
