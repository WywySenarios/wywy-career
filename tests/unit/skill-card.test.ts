import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";
import SkillCard from "@/components/SkillCard.astro";

const ICON_LABEL = "example-one";
const ICON_URL = "/example/example-one.svg";
const TEXT_ONLY_LABEL = "example-text-only";
const UNSAFE_LABEL = "<script>alert(1)</script>";
const ESCAPED_UNSAFE_LABEL = "&lt;script&gt;alert(1)&lt;/script&gt;";

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

async function renderSkillCard(props: {
  label: string;
  icon?: string;
}): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(SkillCard, { props });
}

describe("SkillCard", () => {
  it("renders an icon card as one list item with a decorative image and label", async () => {
    const html = await renderSkillCard({
      label: ICON_LABEL,
      icon: ICON_URL,
    });
    const items = tagsNamed(html, "li");
    const images = tagsNamed(html, "img");

    expect(items).toHaveLength(1);
    expect(images).toHaveLength(1);

    const image = images[0]!;

    expect(attributeValue(image, "src")).toBe(ICON_URL);
    expect(attributeValue(image, "alt")).toBe("");
    expect(attributeValue(image, "aria-hidden")).toBe("true");
    expect(attributeValue(image, "width")).toBe("24");
    expect(attributeValue(image, "height")).toBe("24");
    expect(attributeValue(image, "loading")).toBe("lazy");
    expect(attributeValue(image, "decoding")).toBe("async");
    expect(spanLabels(html)).toEqual([ICON_LABEL]);
    expect(tagsNamed(html, "ul")).toHaveLength(0);
  });

  it("renders a text-only card as one list item with no image", async () => {
    const html = await renderSkillCard({ label: TEXT_ONLY_LABEL });

    expect(tagsNamed(html, "li")).toHaveLength(1);
    expect(tagsNamed(html, "img")).toHaveLength(0);
    expect(spanLabels(html)).toEqual([TEXT_ONLY_LABEL]);
  });

  it("escapes markup in the label", async () => {
    const html = await renderSkillCard({ label: UNSAFE_LABEL });

    expect(html).toContain(ESCAPED_UNSAFE_LABEL);
    expect(html).not.toContain("<script");
    expect(html).not.toContain(UNSAFE_LABEL);
    expect(spanLabels(html)).toEqual([ESCAPED_UNSAFE_LABEL]);
  });

  it("renders exactly one list item and no list wrapper for both prop shapes", async () => {
    const iconHtml = await renderSkillCard({
      label: ICON_LABEL,
      icon: ICON_URL,
    });
    const textOnlyHtml = await renderSkillCard({ label: TEXT_ONLY_LABEL });

    for (const html of [iconHtml, textOnlyHtml]) {
      expect(tagsNamed(html, "li")).toHaveLength(1);
      expect(tagsNamed(html, "ul")).toHaveLength(0);
    }
  });
});
