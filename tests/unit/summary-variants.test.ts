import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";
import SummaryVariants from "@/components/SummaryVariants.astro";

const VARIANTS = [
  { text: "Example summary one.", streams: ["stream-two"] },
  { text: "Example summary two.", streams: ["stream-one"] },
  { text: "Example summary three.", streams: ["stream-two"] },
];

function hasAttribute(tag: string, name: string): boolean {
  return new RegExp(`(?:^|\\s)${name}(?:\\s|=|$)`).test(tag);
}

async function renderVariants(
  variants: { text: string; streams: string[] }[],
  activeStream = "stream-two",
): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(SummaryVariants, {
    props: { variants, activeStream },
  });
}

describe("SummaryVariants", () => {
  it("renders one paragraph per summary text", async () => {
    const html = await renderVariants(VARIANTS);

    expect(html.match(/<p\b/g) ?? []).toHaveLength(VARIANTS.length);
    expect(html.match(/<\/p>/g) ?? []).toHaveLength(VARIANTS.length);

    for (const variant of VARIANTS) {
      expect(html).toContain(variant.text);
    }
  });

  it("renders the summaries in the order supplied", async () => {
    const html = await renderVariants(VARIANTS);

    for (let index = 1; index < VARIANTS.length; index += 1) {
      expect(html.indexOf(VARIANTS[index - 1]!.text)).toBeLessThan(
        html.indexOf(VARIANTS[index]!.text),
      );
    }
  });

  it("renders no paragraphs for an empty list", async () => {
    const html = await renderVariants([]);

    expect(html.match(/<p\b/g) ?? []).toHaveLength(0);
  });

  it("hides the summaries outside the active stream", async () => {
    const html = await renderVariants([
      { text: "Example summary one.", streams: ["stream-two"] },
      { text: "Example summary two.", streams: ["stream-one"] },
    ]);
    const paragraphs = html.match(/<p\b[^>]*>/g) ?? [];

    expect(paragraphs).toHaveLength(2);

    expect(hasAttribute(paragraphs[0] ?? "", "hidden")).toBe(false);
    expect(paragraphs[0]).toContain('data-streams="stream-two"');
    expect(hasAttribute(paragraphs[0] ?? "", "data-stream-atom")).toBe(true);

    expect(hasAttribute(paragraphs[1] ?? "", "hidden")).toBe(true);
    expect(paragraphs[1]).toContain('data-streams="stream-one"');
    expect(hasAttribute(paragraphs[1] ?? "", "data-stream-atom")).toBe(true);
  });
});
