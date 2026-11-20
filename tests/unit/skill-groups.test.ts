import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it, vi } from "vitest";
import SkillGroups from "@/components/SkillGroups.astro";
import { CARD_SKILL_GROUP_IDS, PROSE_SKILL_GROUP_IDS } from "@/lib/skills";
import type { SkillGroup } from "@/lib/skills-schema";

const {
  MAPPED_ITEM,
  SECOND_MAPPED_ITEM,
  TEXT_ONLY_ITEM,
  MAPPED_ICON_URL,
  SECOND_MAPPED_ICON_URL,
  EMPTY_ICON_URL,
} = vi.hoisted(() => ({
  MAPPED_ITEM: "example-one",
  SECOND_MAPPED_ITEM: "example-2",
  TEXT_ONLY_ITEM: "example-text-only",
  MAPPED_ICON_URL: "/example/example-one.svg",
  SECOND_MAPPED_ICON_URL: "/example/example-2.svg",
  EMPTY_ICON_URL: "/example/empty.svg",
}));

vi.mock("@/lib/skill-cards", () => ({
  skillCardIcon: (name: string) => {
    if (name === MAPPED_ITEM) {
      return MAPPED_ICON_URL;
    }

    if (name === SECOND_MAPPED_ITEM) {
      return SECOND_MAPPED_ICON_URL;
    }

    return EMPTY_ICON_URL;
  },
  EMPTY_SKILL_ICON: EMPTY_ICON_URL,
}));

const GROUP_LABELS = ["Example Group One", "Example Group Two"];
const GROUP_ITEMS = [
  ["example-item-one", "example-item-two"],
  ["example-item-three", "example-item-four"],
];
const AMPERSAND_LABEL = "Example & Group";
const CARD_GROUP_ID = CARD_SKILL_GROUP_IDS[0]!;
const CARD_GROUP_LABEL = "Example Card Group";
const ALL_CARD_ITEMS = [MAPPED_ITEM, SECOND_MAPPED_ITEM, TEXT_ONLY_ITEM];
const MIXED_CARD_ITEMS = [MAPPED_ITEM, TEXT_ONLY_ITEM];
const PROSE_GROUP_ID = PROSE_SKILL_GROUP_IDS[0]!;
const PROSE_GROUP_LABEL = "Example Prose Group";
const PROSE_ITEMS = ["example-prose-one", "example-prose-two"];
const UNKNOWN_GROUP_ID = "example-unknown-group";
const UNKNOWN_GROUP_LABEL = "Example Unknown Group";
const UNDECLARED_ITEM = "example-undeclared";
const UNSAFE_CARD_LABEL = "example-unsafe-label<script>alert(1)</script>";
const SECOND_CARD_LABEL = "example-second-label";
const ESCAPED_UNSAFE_CARD_LABEL =
  "example-unsafe-label&lt;script&gt;alert(1)&lt;/script&gt;";
const CARD_LIST_CLASS = "grid grid-cols-1 gap-2 sm:grid-cols-2";

type RenderableSkillGroup = Pick<SkillGroup, "id" | "label" | "items">;

function tagsNamed(html: string, name: string): string[] {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, "g")) ?? [];
}

function attributeValue(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1];
}

function spanLabels(html: string): string[] {
  return [...html.matchAll(/<span\b[^>]*>([\s\S]*?)<\/span>/g)].map((match) =>
    match[1]!.trim(),
  );
}

function skillGroup(
  id: string,
  label: string,
  items: string[],
): RenderableSkillGroup {
  return { id, label, items };
}

function exampleGroups(): RenderableSkillGroup[] {
  return GROUP_LABELS.map((label, index) =>
    skillGroup(`example-group-${index + 1}`, label, GROUP_ITEMS[index]!),
  );
}

async function renderSkillGroups(
  groups: RenderableSkillGroup[],
): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(SkillGroups, { props: { groups } });
}

describe("SkillGroups", () => {
  it("renders each group's label as a heading", async () => {
    const html = await renderSkillGroups(exampleGroups());

    for (const label of GROUP_LABELS) {
      expect(html).toContain(`>${label}</h2>`);
    }
  });

  it("renders groups outside the card set as comma-joined prose", async () => {
    const html = await renderSkillGroups(exampleGroups());

    for (const items of GROUP_ITEMS) {
      expect(html).toContain(items.join(", "));
    }
  });

  it("renders one heading per group", async () => {
    const html = await renderSkillGroups(exampleGroups());

    expect(html.match(/<h2/g) ?? []).toHaveLength(GROUP_LABELS.length);
  });

  it("renders groups in the order supplied", async () => {
    const html = await renderSkillGroups(exampleGroups());

    expect(html.indexOf(GROUP_LABELS[0]!)).toBeLessThan(
      html.indexOf(GROUP_LABELS[1]!),
    );
  });

  it("escapes interpolated heading text as HTML", async () => {
    const html = await renderSkillGroups([
      skillGroup("example-group-one", AMPERSAND_LABEL, GROUP_ITEMS[0]!),
    ]);

    expect(html).toContain("Example &amp; Group");
    expect(html).not.toContain(AMPERSAND_LABEL);
  });

  it("renders no headings for an empty group list", async () => {
    const html = await renderSkillGroups([]);

    expect(html.match(/<h2/g) ?? []).toHaveLength(0);
  });

  it("renders one ordered card per item in a technical group", async () => {
    const html = await renderSkillGroups([
      skillGroup(CARD_GROUP_ID, CARD_GROUP_LABEL, ALL_CARD_ITEMS),
    ]);
    const lists = tagsNamed(html, "ul");

    expect(html).toContain(`>${CARD_GROUP_LABEL}</h2>`);
    expect(lists).toHaveLength(1);
    expect(attributeValue(lists[0]!, "role")).toBe("list");
    expect(attributeValue(lists[0]!, "class")).toBe(CARD_LIST_CLASS);
    expect(tagsNamed(html, "li")).toHaveLength(ALL_CARD_ITEMS.length);
    expect(spanLabels(html)).toEqual(ALL_CARD_ITEMS);
    expect(html).not.toContain(ALL_CARD_ITEMS.join(", "));
    expect(tagsNamed(html, "p")).toHaveLength(0);
  });

  it("renders a mapped item with the icon from the skill card record", async () => {
    const html = await renderSkillGroups([
      skillGroup(CARD_GROUP_ID, CARD_GROUP_LABEL, [MAPPED_ITEM]),
    ]);
    const images = tagsNamed(html, "img");

    expect(tagsNamed(html, "li")).toHaveLength(1);
    expect(images).toHaveLength(1);
    expect(attributeValue(images[0]!, "src")).toBe(MAPPED_ICON_URL);
    expect(attributeValue(images[0]!, "alt")).toBe("");
    expect(attributeValue(images[0]!, "aria-hidden")).toBe("true");
    expect(spanLabels(html)).toEqual([MAPPED_ITEM]);
  });

  it("renders a declared text-only item with the placeholder icon", async () => {
    const html = await renderSkillGroups([
      skillGroup(CARD_GROUP_ID, CARD_GROUP_LABEL, [TEXT_ONLY_ITEM]),
    ]);
    const images = tagsNamed(html, "img");

    expect(tagsNamed(html, "li")).toHaveLength(1);
    expect(images).toHaveLength(1);
    expect(attributeValue(images[0]!, "src")).toBe(EMPTY_ICON_URL);
    expect(spanLabels(html)).toEqual([TEXT_ONLY_ITEM]);
  });

  it("renders mapped and text-only cards together in one list", async () => {
    const html = await renderSkillGroups([
      skillGroup(CARD_GROUP_ID, CARD_GROUP_LABEL, MIXED_CARD_ITEMS),
    ]);
    const images = tagsNamed(html, "img");

    expect(tagsNamed(html, "ul")).toHaveLength(1);
    expect(tagsNamed(html, "li")).toHaveLength(MIXED_CARD_ITEMS.length);
    expect(images).toHaveLength(2);
    expect(images.map((image) => attributeValue(image, "src"))).toEqual([
      MAPPED_ICON_URL,
      EMPTY_ICON_URL,
    ]);
    expect(spanLabels(html)).toEqual(MIXED_CARD_ITEMS);
  });

  it("keeps comma-separated prose for a prose group", async () => {
    const html = await renderSkillGroups([
      skillGroup(PROSE_GROUP_ID, PROSE_GROUP_LABEL, PROSE_ITEMS),
    ]);
    const joinedItems = PROSE_ITEMS.join(", ");

    expect(tagsNamed(html, "ul")).toHaveLength(0);
    expect(tagsNamed(html, "li")).toHaveLength(0);
    expect(tagsNamed(html, "img")).toHaveLength(0);
    expect(tagsNamed(html, "p")).toHaveLength(1);
    expect(html).toMatch(new RegExp(`<p\\b[^>]*>[^<]*${joinedItems}[^<]*</p>`));
  });

  it("keeps comma-separated prose for an unknown group id", async () => {
    const html = await renderSkillGroups([
      skillGroup(UNKNOWN_GROUP_ID, UNKNOWN_GROUP_LABEL, PROSE_ITEMS),
    ]);
    const joinedItems = PROSE_ITEMS.join(", ");

    expect(tagsNamed(html, "ul")).toHaveLength(0);
    expect(tagsNamed(html, "li")).toHaveLength(0);
    expect(tagsNamed(html, "img")).toHaveLength(0);
    expect(tagsNamed(html, "p")).toHaveLength(1);
    expect(html).toContain(joinedItems);
  });

  it("renders cards for every card id and prose for the prose id", async () => {
    for (const id of CARD_SKILL_GROUP_IDS) {
      const html = await renderSkillGroups([
        skillGroup(id, CARD_GROUP_LABEL, [MAPPED_ITEM]),
      ]);
      const lists = tagsNamed(html, "ul");

      expect(lists).toHaveLength(1);
      expect(attributeValue(lists[0]!, "role")).toBe("list");
      expect(tagsNamed(html, "li")).toHaveLength(1);
    }

    const proseHtml = await renderSkillGroups([
      skillGroup(PROSE_GROUP_ID, PROSE_GROUP_LABEL, PROSE_ITEMS),
    ]);

    expect(tagsNamed(proseHtml, "ul")).toHaveLength(0);
    expect(tagsNamed(proseHtml, "p")).toHaveLength(1);
  });

  it("escapes markup in card labels and preserves their order", async () => {
    const html = await renderSkillGroups([
      skillGroup(CARD_GROUP_ID, CARD_GROUP_LABEL, [
        UNSAFE_CARD_LABEL,
        SECOND_CARD_LABEL,
      ]),
    ]);

    expect(tagsNamed(html, "li")).toHaveLength(2);
    expect(spanLabels(html)).toEqual([
      ESCAPED_UNSAFE_CARD_LABEL,
      SECOND_CARD_LABEL,
    ]);
    expect(html).toContain(ESCAPED_UNSAFE_CARD_LABEL);
    expect(html).not.toContain(UNSAFE_CARD_LABEL);
    expect(html).not.toContain("<script");
    expect(html.indexOf(ESCAPED_UNSAFE_CARD_LABEL)).toBeLessThan(
      html.indexOf(SECOND_CARD_LABEL),
    );
  });

  it("reserves an icon slot for every card item and none for prose groups", async () => {
    const cardHtml = await renderSkillGroups([
      skillGroup(CARD_GROUP_ID, CARD_GROUP_LABEL, ALL_CARD_ITEMS),
    ]);
    const cardImages = tagsNamed(cardHtml, "img");

    expect(tagsNamed(cardHtml, "li")).toHaveLength(ALL_CARD_ITEMS.length);
    expect(cardImages).toHaveLength(ALL_CARD_ITEMS.length);
    expect(cardImages.map((image) => attributeValue(image, "src"))).toEqual([
      MAPPED_ICON_URL,
      SECOND_MAPPED_ICON_URL,
      EMPTY_ICON_URL,
    ]);

    const mixedHtml = await renderSkillGroups([
      skillGroup(CARD_GROUP_ID, CARD_GROUP_LABEL, MIXED_CARD_ITEMS),
    ]);

    expect(tagsNamed(mixedHtml, "img")).toHaveLength(MIXED_CARD_ITEMS.length);

    const undeclaredHtml = await renderSkillGroups([
      skillGroup(CARD_GROUP_ID, CARD_GROUP_LABEL, [UNDECLARED_ITEM]),
    ]);
    const undeclaredImages = tagsNamed(undeclaredHtml, "img");

    expect(undeclaredImages).toHaveLength(1);
    expect(attributeValue(undeclaredImages[0]!, "src")).toBe(EMPTY_ICON_URL);

    const proseHtml = await renderSkillGroups([
      skillGroup(PROSE_GROUP_ID, PROSE_GROUP_LABEL, PROSE_ITEMS),
    ]);
    const unknownHtml = await renderSkillGroups([
      skillGroup(UNKNOWN_GROUP_ID, UNKNOWN_GROUP_LABEL, PROSE_ITEMS),
    ]);

    expect(tagsNamed(proseHtml, "img")).toHaveLength(0);
    expect(tagsNamed(unknownHtml, "img")).toHaveLength(0);
  });

  it("renders the text-only fallback for an undeclared item", async () => {
    const html = await renderSkillGroups([
      skillGroup(CARD_GROUP_ID, CARD_GROUP_LABEL, [UNDECLARED_ITEM]),
    ]);
    const images = tagsNamed(html, "img");

    expect(tagsNamed(html, "ul")).toHaveLength(1);
    expect(tagsNamed(html, "li")).toHaveLength(1);
    expect(images).toHaveLength(1);
    expect(attributeValue(images[0]!, "src")).toBe(EMPTY_ICON_URL);
    expect(spanLabels(html)).toEqual([UNDECLARED_ITEM]);
    expect(tagsNamed(html, "p")).toHaveLength(0);
  });
});
