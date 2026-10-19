import { describe, expect, it } from "vitest";
import { pairLetters } from "@/src/sections/Team/animations/TeamTitleFlight";

describe("pairLetters", () => {
  it("pairs same letters case-insensitively, then the rest in order", () => {
    // "THE DIF" -> "Meet": e<-E, e<-(no 2nd E, falls back), t<-T, M<-first unused.
    const sources = ["T", "H", "E", "D", "I", "F"];
    expect(pairLetters(["M", "e", "e", "t"], sources)).toEqual([1, 2, 3, 0]);
  });

  it("returns -1 once sources run out", () => {
    expect(pairLetters(["a", "b", "c"], ["B"])).toEqual([-1, 0, -1]);
  });
});
