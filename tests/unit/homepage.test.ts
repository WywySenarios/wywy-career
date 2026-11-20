import reactRenderer from "@astrojs/react/server.js";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { Window } from "happy-dom";
import { afterEach, describe, expect, it } from "vitest";
import IndexPage from "@/pages/index.astro";

const openWindows: Window[] = [];

function parseHtml(html: string): Document {
  const window = new Window();
  window.document.documentElement.innerHTML = html;
  openWindows.push(window);

  return window.document as unknown as Document;
}

async function renderHomepage(): Promise<Document> {
  const container = await AstroContainer.create();
  container.addServerRenderer({ renderer: reactRenderer });
  const html = await container.renderToString(IndexPage, {
    request: new Request("http://localhost/"),
  });

  return parseHtml(html);
}

afterEach(() => {
  for (const window of openWindows) {
    window.close();
  }
  openWindows.length = 0;
});

describe("homepage", () => {
  it("renders exactly one hero with a real image", async () => {
    const document = await renderHomepage();
    const heroes = document.querySelectorAll("[data-hero]");
    const images = document.querySelectorAll("[data-hero-image]");

    expect(heroes).toHaveLength(1);
    expect(images).toHaveLength(1);

    const src = images[0]!.getAttribute("src");

    expect(src?.trim()).toBeTruthy();
  });

  it("renders the full-bleed hero inside an unconstrained main", async () => {
    const document = await renderHomepage();
    const mains = document.querySelectorAll("main");

    expect(mains).toHaveLength(1);

    const main = mains[0]!;

    expect(main.querySelector(":scope > [data-hero]")).not.toBeNull();
    expect(main.hasAttribute("class")).toBe(false);
  });

  it("renders a non-empty document title", async () => {
    const document = await renderHomepage();
    const title = document.querySelector("title");

    expect(title).not.toBeNull();
    expect(title!.textContent?.trim()).toBeTruthy();
  });

  it("renders the topbar frame with the name as the only h1", async () => {
    const document = await renderHomepage();
    const headers = document.querySelectorAll("header");
    const headings = document.querySelectorAll("h1");

    expect(headers).toHaveLength(1);
    expect(headings).toHaveLength(1);
    expect(headers[0]!.contains(headings[0]!)).toBe(true);

    const nameLink = headings[0]!.querySelector("a");

    expect(nameLink).not.toBeNull();
    expect(nameLink!.getAttribute("href")).toBe("/");
    expect(nameLink!.textContent?.trim()).toBeTruthy();

    expect(
      document.querySelector('nav[aria-label="Career stream"]'),
    ).not.toBeNull();
    expect(
      document.querySelector('button[aria-label="Open menu"]'),
    ).not.toBeNull();
  });
});
