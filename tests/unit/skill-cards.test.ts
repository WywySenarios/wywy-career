import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  EMPTY_SKILL_ICON,
  SKILL_CARDS,
  TEXT_ONLY_SKILLS,
  assertSkillCardCoverage,
  skillCardIcon,
} from "@/lib/skill-cards";

const EMPTY_ICON_PATH = path.resolve(
  import.meta.dirname,
  "../../src/assets/skill-icons/empty.svg",
);
const DECLARED_ITEMS = [...Object.keys(SKILL_CARDS), ...TEXT_ONLY_SKILLS];
const UNKNOWN_NAME = "Card Catalog Probe";
const PROTOTYPE_NAMES = ["toString", "constructor", "__proto__"];
const REPEATED_NAME = "Repeated Card Catalog Probe";

function thrownMessage(run: () => void): string {
  try {
    run();
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }

  return "";
}

describe("skill card catalog", () => {
  it("declares a non-empty icon URL for every card", () => {
    const entries = Object.entries(SKILL_CARDS);

    expect(entries.length).toBeGreaterThan(0);

    for (const [, { icon }] of entries) {
      expect(icon).not.toBe("");
      expect(icon).toContain(".svg");
    }
  });

  it("declares a non-empty display name for every card", () => {
    const names = Object.keys(SKILL_CARDS);

    expect(names.length).toBeGreaterThan(0);

    for (const name of names) {
      expect(name.trim().length).toBeGreaterThan(0);
    }
  });

  it("maps each card to a distinct icon URL", () => {
    const iconUrls = Object.values(SKILL_CARDS).map(({ icon }) => icon);

    expect(iconUrls.length).toBeGreaterThan(0);
    expect(new Set(iconUrls).size).toBe(Object.keys(SKILL_CARDS).length);
  });

  it("declares a non-empty text-only catalog disjoint from icon cards", () => {
    const textOnlyNames = [...TEXT_ONLY_SKILLS];

    expect(TEXT_ONLY_SKILLS.size).toBeGreaterThan(0);

    for (const name of textOnlyNames) {
      expect(name.trim().length).toBeGreaterThan(0);
    }

    const overlap = textOnlyNames.filter((name) =>
      Object.hasOwn(SKILL_CARDS, name),
    );

    expect(overlap).toEqual([]);
  });
});

describe("skillCardIcon", () => {
  it("declares the transparent placeholder icon whose asset matches its contents", () => {
    expect(readFileSync(EMPTY_ICON_PATH, "utf8").trim()).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"/>',
    );

    expect(typeof EMPTY_SKILL_ICON).toBe("string");
    expect(EMPTY_SKILL_ICON.length).toBeGreaterThan(0);
    expect(EMPTY_SKILL_ICON).toContain(".svg");

    const cardIcons = Object.values(SKILL_CARDS).map(({ icon }) => icon);

    expect(cardIcons).not.toContain(EMPTY_SKILL_ICON);
  });

  it("resolves every declared card name to its declared icon", () => {
    const names = Object.keys(SKILL_CARDS);

    expect(names.length).toBeGreaterThan(0);

    for (const name of names) {
      expect(skillCardIcon(name)).toBe(SKILL_CARDS[name]!.icon);
    }
  });

  it("resolves text-only, undeclared, and prototype names to the placeholder", () => {
    for (const name of TEXT_ONLY_SKILLS) {
      expect(skillCardIcon(name)).toBe(EMPTY_SKILL_ICON);
    }

    expect(skillCardIcon("example-undeclared-icon")).toBe(EMPTY_SKILL_ICON);

    for (const name of [
      "toString",
      "constructor",
      "__proto__",
      "hasOwnProperty",
    ]) {
      expect(skillCardIcon(name)).toBe(EMPTY_SKILL_ICON);
    }
  });
});

describe("assertSkillCardCoverage", () => {
  it("accepts every declared card and text-only skill", () => {
    expect(() => assertSkillCardCoverage(DECLARED_ITEMS)).not.toThrow();
  });

  it("rejects an unknown card name and names it", () => {
    expect(() => assertSkillCardCoverage([UNKNOWN_NAME])).toThrow(UNKNOWN_NAME);
  });

  it("rejects prototype-property card names", () => {
    for (const name of PROTOTYPE_NAMES) {
      const message = thrownMessage(() => assertSkillCardCoverage([name]));

      expect(message).toContain(name);
    }
  });

  it("reports every unknown card name in one message", () => {
    const unknownNames = ["Unknown Card One", "Unknown Card Two"];
    const message = thrownMessage(() => assertSkillCardCoverage(unknownNames));

    for (const name of unknownNames) {
      expect(message).toContain(name);
    }
  });

  it("reports a repeated unknown card name once", () => {
    const message = thrownMessage(() =>
      assertSkillCardCoverage([REPEATED_NAME, REPEATED_NAME]),
    );

    expect(message.match(/Repeated Card Catalog Probe/g)).toHaveLength(1);
  });
});
