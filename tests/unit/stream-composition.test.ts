import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { Window } from "happy-dom";
import { describe, expect, it } from "vitest";
import EntryList from "@/components/EntryList.astro";
import SummaryVariants from "@/components/SummaryVariants.astro";
import { applyStreamFilter } from "@/lib/stream-filter-dom";

type Entry = {
  id: string;
  title: string;
  streams: string[];
  bullets: { text: string; streams: string[] }[];
};

type Summary = {
  text: string;
  streams: string[];
};

function wrapperFor(html: string): ParentNode {
  const browser = new Window();
  const wrapper = browser.document.createElement("div");
  wrapper.setAttribute("data-stream-section", "");
  wrapper.innerHTML = html;

  return wrapper as unknown as ParentNode;
}

function isHidden(root: ParentNode, selector: string): boolean {
  const found = root.querySelector(selector);

  if (found === null) {
    throw new Error(`Missing element: ${selector}`);
  }

  return found.hasAttribute("hidden");
}

async function renderSummaries(variants: Summary[]): Promise<string> {
  const container = await AstroContainer.create();

  return container.renderToString(SummaryVariants, {
    props: { variants, activeStream: "stream-one" },
  });
}

async function renderEntries(entries: Entry[]): Promise<string> {
  const container = await AstroContainer.create();

  return container.renderToString(EntryList, {
    props: { entries, activeStream: "stream-one" },
  });
}

describe("applying the stream filter to rendered Astro markup", () => {
  it("updates rendered summary variant atoms from their data-streams values", async () => {
    const html = await renderSummaries([
      { text: "Example summary one.", streams: ["stream-two"] },
      { text: "Example summary two.", streams: ["stream-one"] },
    ]);
    const root = wrapperFor(html);

    applyStreamFilter(root, "stream-two");

    expect(
      isHidden(root, '[data-stream-atom][data-streams="stream-two"]'),
    ).toBe(false);
    expect(
      isHidden(root, '[data-stream-atom][data-streams="stream-one"]'),
    ).toBe(true);
    expect(
      root
        .querySelector('[data-stream-atom][data-streams="stream-two"]')
        ?.getAttribute("data-streams"),
    ).toBe("stream-two");
    expect(
      root
        .querySelector('[data-stream-atom][data-streams="stream-one"]')
        ?.getAttribute("data-streams"),
    ).toBe("stream-one");
  });

  it("updates rendered entry atoms and bullets from their data-streams values", async () => {
    const html = await renderEntries([
      {
        id: "example-entry-one",
        title: "example-title",
        streams: ["stream-two"],
        bullets: [
          { text: "Example bullet one.", streams: ["stream-two"] },
          { text: "Example bullet two.", streams: ["stream-one"] },
        ],
      },
    ]);
    const root = wrapperFor(html);

    applyStreamFilter(root, "stream-two");

    expect(
      isHidden(root, '[data-stream-atom][data-streams="stream-two"]'),
    ).toBe(false);
    expect(isHidden(root, 'li[data-streams="stream-two"]')).toBe(false);
    expect(isHidden(root, 'li[data-streams="stream-one"]')).toBe(true);
    expect(
      root
        .querySelector('[data-stream-atom][data-streams="stream-two"]')
        ?.getAttribute("data-streams"),
    ).toBe("stream-two");
  });
});
