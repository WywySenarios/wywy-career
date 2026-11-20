import { readFileSync } from "node:fs";
import path from "node:path";
import { z } from "astro/zod";
import { load } from "js-yaml";
import { describe, expect, it } from "vitest";
import { CV_SOURCES } from "@/lib/constants";
import { assertSkillCatalogCoverage } from "@/lib/skill-coverage";
import {
  EMPTY_SKILL_ICON,
  SKILL_CARDS,
  TEXT_ONLY_SKILLS,
  skillCardIcon,
} from "@/lib/skill-cards";
import { CARD_SKILL_GROUP_IDS, technicalSkillItems } from "@/lib/skills";
import type { SkillGroup } from "@/lib/skills-schema";
import { skillGroupSchema } from "@/lib/skills-schema";

const SKILLS_PATH = path.resolve(
  import.meta.dirname,
  "../../",
  CV_SOURCES.skills,
);
const SKILL_GROUPS = z
  .array(skillGroupSchema)
  .parse(load(readFileSync(SKILLS_PATH, "utf8")));
const UNDECLARED_ITEM = "Coverage Probe Skill";

function skillGroup(id: string, items: string[]): SkillGroup {
  return { id, label: id, tags: [], items };
}

function thrownMessage(run: () => void): string {
  try {
    run();
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }

  return "";
}

describe("technical skill card icons", () => {
  it("resolves every technical item to a declared icon or the placeholder", () => {
    const items = technicalSkillItems(SKILL_GROUPS);

    expect(items.length).toBeGreaterThan(0);

    for (const item of items) {
      const icon = skillCardIcon(item);

      expect(typeof icon).toBe("string");
      expect(icon.length).toBeGreaterThan(0);
      expect(icon).toContain(".svg");

      if (Object.hasOwn(SKILL_CARDS, item)) {
        expect(icon).toBe(SKILL_CARDS[item]!.icon);
        expect(icon).not.toBe(EMPTY_SKILL_ICON);
      } else {
        expect(icon).toBe(EMPTY_SKILL_ICON);
      }
    }
  });
});

describe("assertSkillCatalogCoverage", () => {
  it("accepts the repository skill catalog", () => {
    expect(() => assertSkillCatalogCoverage(SKILL_GROUPS)).not.toThrow();
  });

  it("rejects an unknown group id and names it", () => {
    const groups = [
      ...SKILL_GROUPS,
      skillGroup("example-unknown-group", ["C"]),
    ];
    const message = thrownMessage(() => assertSkillCatalogCoverage(groups));

    expect(message).toContain("example-unknown-group");
  });

  it("rejects an undeclared technical item and names it", () => {
    expect(Object.hasOwn(SKILL_CARDS, UNDECLARED_ITEM)).toBe(false);
    expect(TEXT_ONLY_SKILLS.has(UNDECLARED_ITEM)).toBe(false);

    const groups = [
      ...SKILL_GROUPS,
      skillGroup(CARD_SKILL_GROUP_IDS[0]!, [UNDECLARED_ITEM]),
    ];
    const message = thrownMessage(() => assertSkillCatalogCoverage(groups));

    expect(message).toContain(UNDECLARED_ITEM);
  });
});
