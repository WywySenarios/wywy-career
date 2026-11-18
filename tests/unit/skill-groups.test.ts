import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";
import SkillGroups from "@/components/SkillGroups.astro";
import type { SkillGroup } from "@/lib/skills-schema";

const GROUP_LABELS = ["Example Group One", "Example Group Two"];
const GROUP_ITEMS = [
  ["example-item-one", "example-item-two"],
  ["example-item-three", "example-item-four"],
];
const AMPERSAND_LABEL = "Example & Group";

type RenderableSkillGroup = Pick<SkillGroup, "id" | "label" | "items">;

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

  it("renders each group's items comma-joined", async () => {
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

  it("escapes interpolated text as HTML", async () => {
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
});
