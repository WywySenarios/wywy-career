import { describe, expect, it } from "vitest";
import type { SkillGroup } from "@/lib/skills-schema";
import {
  CARD_SKILL_GROUP_IDS,
  PROSE_SKILL_GROUP_IDS,
  SKILL_GROUP_ORDER,
  assertKnownSkillGroups,
  formatSkillItems,
  isCardSkillGroup,
  isProseSkillGroup,
  sortSkillGroups,
  technicalSkillItems,
} from "@/lib/skills";

const KNOWN_IDS = [...SKILL_GROUP_ORDER];
const UNKNOWN_ID_LATER = "example-unknown-later";
const UNKNOWN_ID_EARLIER = "example-unknown-earlier";
const CARD_GROUP_ID = CARD_SKILL_GROUP_IDS[0]!;
const PROSE_GROUP_ID = PROSE_SKILL_GROUP_IDS[0]!;
const NON_GROUP_IDS = ["example-unknown-group", "example-other-group", ""];

function skillGroupWithItems(id: string, items: string[]): SkillGroup {
  return { id, label: id, tags: [], items };
}

function skillGroup(id: string): SkillGroup {
  return skillGroupWithItems(id, [id]);
}

function thrownMessage(run: () => void): string {
  try {
    run();
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }

  return "";
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

describe("skill group classification", () => {
  it("declares non-empty, disjoint card and prose id lists", () => {
    expect(CARD_SKILL_GROUP_IDS.length).toBeGreaterThan(0);
    expect(PROSE_SKILL_GROUP_IDS.length).toBeGreaterThan(0);

    const proseIds = new Set<string>([...PROSE_SKILL_GROUP_IDS]);
    const overlap = CARD_SKILL_GROUP_IDS.filter((id) => proseIds.has(id));

    expect(overlap).toEqual([]);
  });

  it("isCardSkillGroup accepts every card id and rejects every prose id", () => {
    expect(CARD_SKILL_GROUP_IDS.length).toBeGreaterThan(0);

    for (const id of CARD_SKILL_GROUP_IDS) {
      expect(isCardSkillGroup(id)).toBe(true);
    }
    for (const id of PROSE_SKILL_GROUP_IDS) {
      expect(isCardSkillGroup(id)).toBe(false);
    }
  });

  it("isProseSkillGroup accepts every prose id and rejects every card id", () => {
    expect(PROSE_SKILL_GROUP_IDS.length).toBeGreaterThan(0);

    for (const id of PROSE_SKILL_GROUP_IDS) {
      expect(isProseSkillGroup(id)).toBe(true);
    }
    for (const id of CARD_SKILL_GROUP_IDS) {
      expect(isProseSkillGroup(id)).toBe(false);
    }
  });

  it("rejects ids that are neither card nor prose groups", () => {
    for (const id of NON_GROUP_IDS) {
      expect(isCardSkillGroup(id)).toBe(false);
      expect(isProseSkillGroup(id)).toBe(false);
    }
  });
});

describe("technicalSkillItems", () => {
  it("returns only card-group items in group then item order", () => {
    const cardGroup = skillGroupWithItems(CARD_GROUP_ID, [
      "card-item-one",
      "card-item-two",
    ]);
    const proseGroup = skillGroupWithItems(PROSE_GROUP_ID, ["prose-item-one"]);

    expect(technicalSkillItems([proseGroup, cardGroup])).toEqual([
      "card-item-one",
      "card-item-two",
    ]);
    expect(technicalSkillItems([cardGroup, proseGroup])).toEqual([
      "card-item-one",
      "card-item-two",
    ]);
  });

  it("preserves the input order of card groups and their items", () => {
    const cardGroups = CARD_SKILL_GROUP_IDS.map((id) =>
      skillGroupWithItems(id, [`${id}-item-one`, `${id}-item-two`]),
    );
    const reversedCardGroups = [...cardGroups].reverse();
    const proseGroup = skillGroupWithItems(PROSE_GROUP_ID, ["prose-item-one"]);
    const expected = reversedCardGroups.flatMap((group) => group.items);

    expect(technicalSkillItems([proseGroup, ...reversedCardGroups])).toEqual(
      expected,
    );
  });

  it("returns an empty array when every group is prose", () => {
    const proseGroup = skillGroupWithItems(PROSE_GROUP_ID, ["prose-item-one"]);

    expect(technicalSkillItems([proseGroup])).toEqual([]);
  });

  it("returns an empty array for empty input", () => {
    expect(technicalSkillItems([])).toEqual([]);
  });
});

describe("assertKnownSkillGroups", () => {
  it("accepts every card and prose group id", () => {
    const groups = [...CARD_SKILL_GROUP_IDS, ...PROSE_SKILL_GROUP_IDS].map(
      (id) => skillGroup(id),
    );

    expect(() => assertKnownSkillGroups(groups)).not.toThrow();
  });

  it("rejects an unknown id and names it", () => {
    const unknownId = "example-unknown-group";
    expect(() => assertKnownSkillGroups([skillGroup(unknownId)])).toThrow(
      /example-unknown-group/,
    );
  });

  it("reports every unknown id in one message", () => {
    const unknownIds = ["example-unknown-one", "example-unknown-two"];
    const message = thrownMessage(() =>
      assertKnownSkillGroups(unknownIds.map((id) => skillGroup(id))),
    );

    for (const id of unknownIds) {
      expect(message).toContain(id);
    }
  });

  it("reports a repeated unknown id once", () => {
    const repeatedId = "example-repeated-group";
    const message = thrownMessage(() =>
      assertKnownSkillGroups([skillGroup(repeatedId), skillGroup(repeatedId)]),
    );

    expect(message.match(/example-repeated-group/g)).toHaveLength(1);
  });
});
