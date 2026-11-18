import { describe, expect, it } from "vitest";
import {
  activeStreamFromHash,
  hasVisibleAtom,
  isVisible,
  parseStreamValues,
} from "@/lib/stream-predicates";

const KNOWN_IDS = ["stream-one", "stream-two", "stream-three"];
const DEFAULT_ID = "stream-one";

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

describe("parseStreamValues", () => {
  it("splits a comma-separated wire value into both streams", () => {
    expect(parseStreamValues("stream-two,stream-three")).toEqual([
      "stream-two",
      "stream-three",
    ]);
  });

  it("returns an empty list for an empty wire value", () => {
    expect(parseStreamValues("")).toEqual([]);
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

describe("activeStreamFromHash", () => {
  it("returns a known stream from a hash with the prefix", () => {
    expect(activeStreamFromHash("#stream-two", KNOWN_IDS, DEFAULT_ID)).toBe(
      "stream-two",
    );
  });

  it("returns a known stream from a hash without the prefix", () => {
    expect(activeStreamFromHash("stream-two", KNOWN_IDS, DEFAULT_ID)).toBe(
      "stream-two",
    );
  });

  it("falls back to the default for an unknown hash", () => {
    expect(activeStreamFromHash("#nope", KNOWN_IDS, DEFAULT_ID)).toBe(
      DEFAULT_ID,
    );
  });

  it("falls back to the default for an empty hash", () => {
    expect(activeStreamFromHash("", KNOWN_IDS, DEFAULT_ID)).toBe(DEFAULT_ID);
  });

  it("falls back to the default for a bare prefix", () => {
    expect(activeStreamFromHash("#", KNOWN_IDS, DEFAULT_ID)).toBe(DEFAULT_ID);
  });

  it("falls back to the default for an alias", () => {
    expect(activeStreamFromHash("#alias-two", KNOWN_IDS, DEFAULT_ID)).toBe(
      DEFAULT_ID,
    );
  });
});
