import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { Window } from "happy-dom";
import { describe, expect, it } from "vitest";
import EntryList from "@/components/EntryList.astro";
import StreamSection from "@/components/StreamSection.astro";

const ACTIVE_STREAM = "stream-two";
const HEADING = "Experience";

type Entry = {
  id: string;
  title: string;
  streams: string[];
  bullets: { text: string; streams: string[] }[];
};

function parseHtml(html: string) {
  const window = new Window();
  window.document.body.innerHTML = html;

  return window.document;
}

async function renderEntries(entries: Entry[]): Promise<string> {
  const container = await AstroContainer.create();

  return container.renderToString(EntryList, {
    props: { entries, activeStream: ACTIVE_STREAM },
  });
}

async function renderSection(atoms: { streams: string[] }[]): Promise<string> {
  const container = await AstroContainer.create();

  return container.renderToString(StreamSection, {
    props: { heading: HEADING, atoms, activeStream: ACTIVE_STREAM },
  });
}

describe("server-rendered stream composition", () => {
  it("hides stream-one entry atoms under stream-two", async () => {
    const html = await renderEntries([
      {
        id: "entry-one",
        title: "Entry One",
        streams: ["stream-one"],
        bullets: [],
      },
      {
        id: "entry-two",
        title: "Entry Two",
        streams: ["stream-two"],
        bullets: [],
      },
    ]);
    const sections = parseHtml(html).querySelectorAll("section");

    expect(sections).toHaveLength(2);
    const [streamOne, streamTwo] = sections;

    expect(streamOne).toBeTruthy();
    expect(streamTwo).toBeTruthy();
    expect(streamOne?.hasAttribute("hidden")).toBe(true);
    expect(streamTwo?.hasAttribute("hidden")).toBe(false);
  });

  it("hides stream-one bullets under stream-two", async () => {
    const html = await renderEntries([
      {
        id: "entry-one",
        title: "Entry One",
        streams: ["stream-two"],
        bullets: [
          { text: "Bullet One", streams: ["stream-one"] },
          { text: "Bullet Two", streams: ["stream-two"] },
        ],
      },
    ]);
    const items = parseHtml(html).querySelectorAll("li");

    expect(items).toHaveLength(2);
    const [streamOne, streamTwo] = items;

    expect(streamOne).toBeTruthy();
    expect(streamTwo).toBeTruthy();
    expect(streamOne?.hasAttribute("hidden")).toBe(true);
    expect(streamTwo?.hasAttribute("hidden")).toBe(false);
  });

  it("hides a section whose atoms all belong to stream-one", async () => {
    const html = await renderSection([
      { streams: ["stream-one"] },
      { streams: ["stream-one"] },
    ]);
    const wrapper = parseHtml(html).querySelector("[data-stream-section]");

    expect(wrapper).toBeTruthy();
    expect(wrapper?.hasAttribute("hidden")).toBe(true);
  });
});
