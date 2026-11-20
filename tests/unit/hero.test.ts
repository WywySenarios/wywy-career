import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { Window } from "happy-dom";
import { afterEach, describe, expect, it } from "vitest";
import Hero from "@/components/Hero.astro";
import heroImage from "./fixtures/hero.svg";

const SLOT_PROBE = `<p data-slot-probe>example content</p>`;

let openWindows: Window[] = [];

function parseHtml(html: string) {
  const window = new Window();
  window.document.documentElement.innerHTML = html;
  openWindows.push(window);

  return window.document;
}

async function renderHero(
  props: { alt?: string; class?: string } = {},
  slot?: string,
): Promise<string> {
  const container = await AstroContainer.create();

  return container.renderToString(Hero, {
    props: { image: heroImage, ...props },
    slots: slot === undefined ? undefined : { default: slot },
  });
}

afterEach(() => {
  for (const window of openWindows) {
    window.close();
  }
  openWindows = [];
});

describe("Hero", () => {
  it("renders one root section", async () => {
    const document = parseHtml(await renderHero());
    const roots = document.querySelectorAll("[data-hero]");

    expect(roots).toHaveLength(1);

    const root = roots[0]!;

    expect(root.tagName).toBe("SECTION");
  });

  it("renders one eager background image with responsive sources", async () => {
    const document = parseHtml(await renderHero());
    const images = document.querySelectorAll("[data-hero-image]");

    expect(images).toHaveLength(1);

    const image = images[0]!;

    expect(image.tagName).toBe("IMG");
    expect(image.getAttribute("loading")).toBe("eager");
    expect(image.getAttribute("fetchpriority")).toBe("high");
    expect(image.getAttribute("decoding")).toBe("async");
    expect(image.getAttribute("sizes")).toBe("100vw");
    expect(image.getAttribute("src")).toBeTruthy();
    expect(image.getAttribute("srcset")).toMatch(/\d+w/);
  });

  it("layers the decorative overlay between the image and the content", async () => {
    const document = parseHtml(await renderHero({}, SLOT_PROBE));
    const overlays = document.querySelectorAll("[data-hero-overlay]");

    expect(overlays).toHaveLength(1);

    const overlay = overlays[0]!;

    expect(overlay.tagName).toBe("DIV");
    expect(overlay.getAttribute("aria-hidden")).toBe("true");

    const layered = document.querySelectorAll(
      "[data-hero-image], [data-hero-overlay], [data-hero-content]",
    );

    expect(layered).toHaveLength(3);
    expect(layered[0]!.hasAttribute("data-hero-image")).toBe(true);
    expect(layered[1]!.hasAttribute("data-hero-overlay")).toBe(true);
    expect(layered[2]!.hasAttribute("data-hero-content")).toBe(true);
  });

  it("renders slotted copy inside the content wrapper", async () => {
    const document = parseHtml(await renderHero({}, SLOT_PROBE));
    const contents = document.querySelectorAll("[data-hero-content]");

    expect(contents).toHaveLength(1);

    const content = contents[0]!;

    expect(content.tagName).toBe("DIV");

    const probe = content.querySelector("[data-slot-probe]");

    expect(probe).not.toBeNull();
    expect(probe?.textContent).toBe("example content");
  });

  it("renders no copy of its own when no slot is supplied", async () => {
    const document = parseHtml(await renderHero());
    const root = document.querySelector("[data-hero]");

    expect(root).not.toBeNull();
    expect(root!.querySelectorAll("h1, h2, h3, h4, h5, h6")).toHaveLength(0);
    expect(root!.querySelectorAll("p")).toHaveLength(0);
  });

  it("defaults the image alt text to empty", async () => {
    const document = parseHtml(await renderHero());
    const image = document.querySelector("[data-hero-image]");

    expect(image).not.toBeNull();
    expect(image!.hasAttribute("alt")).toBe(true);
    expect(image!.getAttribute("alt")).toBe("");
  });

  it("keeps the supplied alt text and escapes it in markup", async () => {
    const html = await renderHero({ alt: "A & B" });
    const image = parseHtml(html).querySelector("[data-hero-image]");

    expect(image).not.toBeNull();
    expect(image!.getAttribute("alt")).toBe("A & B");
    expect(html).toContain("A &amp; B");
  });

  it("forwards an extra class to the root section", async () => {
    const document = parseHtml(await renderHero({ class: "extra" }));
    const root = document.querySelector("[data-hero]");

    expect(root).not.toBeNull();
    expect(root!.classList.contains("extra")).toBe(true);
  });
});
