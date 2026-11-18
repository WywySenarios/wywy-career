import { describe, expect, it } from "vitest";
import type { SkillGroup } from "@/lib/skills-schema";
import {
  SKILL_GROUP_ORDER,
  formatSkillItems,
  sortSkillGroups,
} from "@/lib/skills";

const KNOWN_IDS = [...SKILL_GROUP_ORDER];
const UNKNOWN_ID_LATER = "zulu";
const UNKNOWN_ID_EARLIER = "alpha";

function skillGroup(id: string): SkillGroup {
  return { id, label: id, tags: [], items: [id] };
}

describe("sortSkillGroups", () => {
  it("orders known groups canonically regardless of input order", () => {
    const input = [...KNOWN_IDS].reverse().map((id) => skillGroup(id));

    const sorted = sortSkillGroups(input);

    expect(sorted.map((group) => group.id)).toEqual(KNOWN_IDS);
  });

  it("places unknown ids after every known id in ascending id order", () => {
    const input: { id: string }[] = [
      { id: UNKNOWN_ID_LATER },
      { id: KNOWN_IDS[0]! },
      { id: UNKNOWN_ID_EARLIER },
    ];

    const sorted = sortSkillGroups(input);

    expect(sorted.map((group) => group.id)).toEqual([
      KNOWN_IDS[0],
      UNKNOWN_ID_EARLIER,
      UNKNOWN_ID_LATER,
    ]);
  });

  it("does not mutate the input", () => {
    const input = [...KNOWN_IDS].reverse().map((id) => skillGroup(id));
    const inputBeforeCall = [...input];

    sortSkillGroups(input);

    expect(input).toEqual(inputBeforeCall);
  });

  it("returns a new array holding the same group objects", () => {
    const input = [...KNOWN_IDS].reverse().map((id) => skillGroup(id));
    const inputById = new Map(
      input.map((group): [string, SkillGroup] => [group.id, group]),
    );

    const sorted = sortSkillGroups(input);

    expect(sorted).not.toBe(input);
    expect(sorted.map((group) => group.id)).toEqual(KNOWN_IDS);
    for (const group of sorted) {
      expect(group).toBe(inputById.get(group.id));
    }
  });

  it("returns an empty array for an empty input", () => {
    const empty: { id: string }[] = [];

    expect(sortSkillGroups(empty)).toEqual([]);
  });
});

describe("formatSkillItems", () => {
  it("joins items with a comma and a space", () => {
    expect(
      formatSkillItems([
        "example-item-one",
        "example-item-two",
        "example-item-three",
      ]),
    ).toBe("example-item-one, example-item-two, example-item-three");
  });

  it("renders a single item with no separator", () => {
    expect(formatSkillItems(["example-item-one"])).toBe("example-item-one");
  });

  it("renders no items as an empty string", () => {
    expect(formatSkillItems([])).toBe("");
  });
});
