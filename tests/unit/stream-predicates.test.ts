import { describe, expect, it } from "vitest";
import { hasVisibleAtom, isVisible } from "@/lib/stream-predicates";

describe("isVisible", () => {
  it("returns true when the active stream is listed", () => {
    expect(isVisible(["stream-two"], "stream-two")).toBe(true);
  });

  it("returns false when a different stream is listed", () => {
    expect(isVisible(["stream-two"], "stream-one")).toBe(false);
  });

  it("returns false when the list is empty", () => {
    expect(isVisible([], "stream-two")).toBe(false);
  });
});

describe("hasVisibleAtom", () => {
  it("returns false when there are no atoms", () => {
    expect(hasVisibleAtom([], "stream-two")).toBe(false);
  });

  it("returns true when any atom lists the active stream", () => {
    expect(hasVisibleAtom([["stream-one"], ["stream-two"]], "stream-two")).toBe(
      true,
    );
  });
});
