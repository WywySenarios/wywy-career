import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";
import EntryList from "@/components/EntryList.astro";

const TITLE = "example-title";
const SUBTITLE = "example-subtitle";
const META = "example-meta";
const TAGS = ["example-tag-one", "example-tag-two"];
const BULLETS = [
  { text: "Example bullet one.", streams: ["stream-two"] },
  { text: "Example bullet two.", streams: ["stream-two"] },
];
const BULLET_TEXTS = BULLETS.map((bullet) => bullet.text);
const UNSAFE_BULLET = "<script>alert(1)</script>";
const ESCAPED_BULLET = "&lt;script&gt;alert(1)&lt;/script&gt;";
const SECOND_TITLE = "example-title-two";
const PARAGRAPHS_WITHOUT_TAGS = 2;

type Entry = {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  tags?: string[];
  streams: string[];
  bullets: { text: string; streams: string[] }[];
};

function entry(overrides: Partial<Entry> = {}): Entry {
  return {
    id: "example-entry-one",
    title: TITLE,
    subtitle: SUBTITLE,
    meta: META,
    tags: TAGS,
    streams: ["stream-two"],
    bullets: BULLETS,
    ...overrides,
  };
}

function escaped(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasAttribute(tag: string, name: string): boolean {
  return new RegExp(`(?:^|\\s)${name}(?:\\s|=|$)`).test(tag);
}

function sectionTag(html: string): string {
  return html.match(/<section\b[^>]*>/)?.[0] ?? "";
}

async function renderEntries(
  entries: Entry[],
  activeStream = "stream-two",
): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(EntryList, {
    props: { entries, activeStream },
  });
}

describe("EntryList", () => {
  it("renders the title in a heading", async () => {
    const html = await renderEntries([entry()]);

    expect(html).toMatch(new RegExp(`<h3[^>]*>\\s*${escaped(TITLE)}\\s*</h3>`));
  });

  it("renders the subtitle", async () => {
    const html = await renderEntries([entry()]);

    expect(html).toContain(SUBTITLE);
  });

  it("renders the meta line", async () => {
    const html = await renderEntries([entry()]);

    expect(html).toContain(META);
  });

  it("renders the tags comma-joined", async () => {
    const html = await renderEntries([entry()]);

    expect(html).toContain(TAGS.join(", "));
  });

  it("renders one list item per bullet", async () => {
    const html = await renderEntries([entry()]);

    expect(html.match(/<ul\b/g) ?? []).toHaveLength(1);
    expect(html.match(/<li\b/g) ?? []).toHaveLength(BULLETS.length);

    for (const bullet of BULLET_TEXTS) {
      expect(html).toContain(bullet);
    }
  });

  it("renders no tag line when tags are empty", async () => {
    const html = await renderEntries([entry({ tags: undefined })]);

    expect(html.match(/<p\b/g) ?? []).toHaveLength(PARAGRAPHS_WITHOUT_TAGS);
  });

  it("renders no bullet list when bullets are empty", async () => {
    const html = await renderEntries([entry({ bullets: [] })]);

    expect(html.match(/<ul\b/g) ?? []).toHaveLength(0);
    expect(html.match(/<li\b/g) ?? []).toHaveLength(0);
  });

  it("escapes bullet markup", async () => {
    const html = await renderEntries([
      entry({ bullets: [{ text: UNSAFE_BULLET, streams: ["stream-two"] }] }),
    ]);

    expect(html).toContain(ESCAPED_BULLET);
    expect(html).not.toContain(UNSAFE_BULLET);
  });

  it("renders entries in the order supplied", async () => {
    const html = await renderEntries([
      entry({ id: "first-entry" }),
      entry({ id: "second-entry", title: SECOND_TITLE }),
    ]);

    expect(html.indexOf(TITLE)).toBeLessThan(html.indexOf(SECOND_TITLE));
  });

  it("hides an entry outside the active stream", async () => {
    const html = await renderEntries(
      [entry({ streams: ["stream-one"] })],
      "stream-two",
    );
    const section = sectionTag(html);

    expect(hasAttribute(section, "hidden")).toBe(true);
    expect(hasAttribute(section, "data-stream-atom")).toBe(true);
    expect(section).toContain('data-streams="stream-one"');
  });

  it("hides only the bullets outside the active stream", async () => {
    const html = await renderEntries([
      entry({
        bullets: [
          { text: "Example bullet one.", streams: ["stream-two"] },
          { text: "Example bullet two.", streams: ["stream-one"] },
        ],
      }),
    ]);
    const items = html.match(/<li\b[^>]*>/g) ?? [];

    expect(items).toHaveLength(2);
    expect(hasAttribute(items[0] ?? "", "hidden")).toBe(false);
    expect(hasAttribute(items[0] ?? "", "data-stream-atom")).toBe(false);
    expect(items[0]).toContain('data-streams="stream-two"');
    expect(hasAttribute(items[1] ?? "", "hidden")).toBe(true);
    expect(hasAttribute(items[1] ?? "", "data-stream-atom")).toBe(false);
    expect(items[1]).toContain('data-streams="stream-one"');
    expect(html).toContain("Example bullet one.");
    expect(html).toContain("Example bullet two.");
  });

  it("matches every stream a multi-stream entry lists", async () => {
    const entries = [entry({ streams: ["stream-two", "stream-three"] })];

    const underStreamTwo = sectionTag(
      await renderEntries(entries, "stream-two"),
    );
    const underStreamThree = sectionTag(
      await renderEntries(entries, "stream-three"),
    );
    const underStreamOne = sectionTag(
      await renderEntries(entries, "stream-one"),
    );

    expect(hasAttribute(underStreamTwo, "hidden")).toBe(false);
    expect(hasAttribute(underStreamThree, "hidden")).toBe(false);
    expect(hasAttribute(underStreamOne, "hidden")).toBe(true);
    expect(underStreamTwo).toContain('data-streams="stream-two,stream-three"');
  });
});
