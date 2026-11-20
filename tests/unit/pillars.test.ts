import { describe, expect, it } from "vitest";
import type { Pillar } from "@/lib/pillars-schema";
import { pillarsToSlides, visiblePillars } from "@/lib/pillars";
import type { PillarSlide } from "@/lib/pillars";
import { buildLookup } from "@/lib/streams";

const CATALOG = [
  { id: "embedded", label: "Embedded", aliases: ["firmware"] },
  { id: "operations", label: "Operations", aliases: ["ops"] },
  { id: "full-stack", label: "Full Stack", aliases: ["web"] },
  { id: "misc", label: "Misc", aliases: [] },
];

function pillar(overrides: Partial<Pillar> & Pick<Pillar, "id">): Pillar {
  return {
    label: overrides.id,
    sentence: `${overrides.id} sentence.`,
    order: 0,
    streams: ["embedded"],
    ...overrides,
  };
}

describe("pillarsToSlides", () => {
  it("maps a pillar record to a slide with its identity and text intact", () => {
    const record = pillar({
      id: "embedded-foundations",
      label: "Embedded Foundations",
      sentence: "Ship firmware that talks to real hardware.",
      order: 3,
      streams: ["embedded", "operations"],
    });

    const slides = pillarsToSlides([record], buildLookup(CATALOG));

    expect(slides).toHaveLength(1);
    expect(slides[0]).toMatchObject({
      id: "embedded-foundations",
      label: "Embedded Foundations",
      sentence: "Ship firmware that talks to real hardware.",
      order: 3,
      streams: ["embedded", "operations"],
    });
  });

  it("orders slides by order ascending rather than by input or id", () => {
    const records = [
      pillar({ id: "alpha", order: 2 }),
      pillar({ id: "mike", order: 1 }),
      pillar({ id: "zulu", order: 0 }),
    ];

    const slides = pillarsToSlides(records, buildLookup(CATALOG));

    expect(slides.map((slide) => slide.id)).toEqual(["zulu", "mike", "alpha"]);
  });

  it("breaks ties on shared order values by id ascending", () => {
    const records = [
      pillar({ id: "zulu", order: 1 }),
      pillar({ id: "alpha", order: 1 }),
    ];

    const slides = pillarsToSlides(records, buildLookup(CATALOG));

    expect(slides.map((slide) => slide.id)).toEqual(["alpha", "zulu"]);
  });

  it("keeps canonical stream ids unchanged", () => {
    const record = pillar({ id: "canonical-record", streams: ["full-stack"] });

    const slides = pillarsToSlides([record], buildLookup(CATALOG));

    expect(slides[0]?.streams).toEqual(["full-stack"]);
  });

  it("rejects an alias stream naming both the value and the record", () => {
    const record = pillar({ id: "alias-record", streams: ["firmware"] });

    expect(() => pillarsToSlides([record], buildLookup(CATALOG))).toThrow(
      /Unknown stream "firmware"\. on record "alias-record"\./,
    );
  });

  it("rejects an unknown stream naming both the value and the record", () => {
    const record = pillar({ id: "unknown-record", streams: ["nope"] });

    expect(() => pillarsToSlides([record], buildLookup(CATALOG))).toThrow(
      /Unknown stream "nope"\. on record "unknown-record"\./,
    );
  });
});

function slide(
  overrides: Partial<PillarSlide> & Pick<PillarSlide, "id">,
): PillarSlide {
  return {
    label: overrides.id,
    sentence: `${overrides.id} sentence.`,
    order: 0,
    streams: ["embedded"],
    ...overrides,
  };
}

describe("visiblePillars", () => {
  it("returns the slides listing the active stream in sorted order", () => {
    const slides = [
      slide({ id: "zulu", order: 0, streams: ["embedded"] }),
      slide({ id: "mike", order: 1, streams: ["operations", "embedded"] }),
      slide({ id: "alpha", order: 2, streams: ["embedded"] }),
      slide({ id: "hotel", order: 3, streams: ["full-stack"] }),
    ];

    const visible = visiblePillars(slides, "embedded");

    expect(visible.map((entry) => entry.id)).toEqual(["zulu", "mike", "alpha"]);
  });

  it("returns an empty list when no slide lists the active stream", () => {
    const slides = [slide({ id: "zulu", order: 0, streams: ["embedded"] })];

    expect(visiblePillars(slides, "misc")).toEqual([]);
  });
});
