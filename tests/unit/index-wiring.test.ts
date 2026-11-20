import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const PAGE_PATH = new URL("../../src/pages/index.astro", import.meta.url);
const pageSource = readFileSync(PAGE_PATH, "utf8");

// Extracts a balanced call from its name through the matching close paren.
function callSpan(source: string, name: string): string {
  const start = source.indexOf(`${name}(`);

  expect(start, `expected the page to call ${name}()`).toBeGreaterThanOrEqual(
    0,
  );

  let depth = 0;

  for (let index = start + name.length; index < source.length; index += 1) {
    const char = source[index];

    if (char === "(") {
      depth += 1;
    } else if (char === ")") {
      depth -= 1;

      if (depth === 0) {
        return source.slice(start, index + 1);
      }
    }
  }

  throw new Error(`Unbalanced call to ${name}() in ${PAGE_PATH.pathname}`);
}

// Extracts a JSX opening tag, ignoring `>` characters inside string literals
// and `{...}` expressions so `=>` and comparisons do not truncate the tag.
function openingTag(source: string, component: string): string {
  const start = source.indexOf(`<${component}`);

  expect(
    start,
    `expected the page to render <${component}>`,
  ).toBeGreaterThanOrEqual(0);

  let braceDepth = 0;
  let quote: string | null = null;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];

    if (quote !== null) {
      if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
    } else if (char === "{") {
      braceDepth += 1;
    } else if (char === "}") {
      braceDepth -= 1;
    } else if (char === ">" && braceDepth === 0) {
      return source.slice(start, index + 1);
    }
  }

  throw new Error(`Unterminated <${component}> tag in ${PAGE_PATH.pathname}`);
}

describe("index page pillar wiring", () => {
  it("fetches the pillars collection from astro:content", () => {
    expect(pageSource).toContain('getCollection("pillars")');
  });

  it("converts fetched pillar records with pillarsToSlides", () => {
    const conversion = pageSource.match(
      /pillarsToSlides\(\s*([A-Za-z_$][\w$]*)/,
    );

    expect(
      conversion,
      "expected pillarsToSlides(...) to receive a pillar record variable",
    ).not.toBeNull();
    expect(conversion?.[1]).toMatch(/[Pp]illar/);
  });

  it("includes the pillar records in assertKnownStreams", () => {
    const assertion = callSpan(pageSource, "assertKnownStreams");

    expect(
      assertion,
      "expected assertKnownStreams(...) to spread the pillar records",
    ).toMatch(/\.\.\.\s*[A-Za-z_$][\w$]*[Pp]illar[\w$]*/);
  });

  it("passes pillars, ordered stream ids, and the initial stream to PillarsCarousel", () => {
    const tag = openingTag(pageSource, "PillarsCarousel");

    expect(tag, "expected PillarsCarousel to receive streamIds").toMatch(
      /streamIds=\{\s*orderedCatalog\.map\(\(\{\s*id\s*\}\)\s*=>\s*id\)\s*\}/,
    );
    expect(tag, "expected PillarsCarousel to receive defaultId").toMatch(
      /defaultId=\{\s*initialStreamId\s*\}/,
    );

    if (/pillars=\{\s*pillarsToSlides\(/.test(tag)) {
      return;
    }

    const reference = tag.match(/pillars=\{\s*([A-Za-z_$][\w$]*)\s*\}/);

    expect(
      reference,
      "expected PillarsCarousel pillars prop to come from pillarsToSlides(...)",
    ).not.toBeNull();

    const variable = reference?.[1];

    expect(pageSource).toMatch(
      new RegExp(`const\\s+${variable}\\s*=\\s*pillarsToSlides\\(`),
    );
  });

  it("mounts PillarsCarousel with client:load directly after StreamSwitcher", () => {
    const tag = openingTag(pageSource, "PillarsCarousel");

    expect(tag).toMatch(/client:load/);
  });

  it("places the carousel between the switcher and the Summary section", () => {
    const switchIndex = pageSource.indexOf("<StreamSwitcher");
    const carouselIndex = pageSource.indexOf("<PillarsCarousel");
    const summaryIndex = pageSource.indexOf('heading="Summary"');

    expect(switchIndex).toBeGreaterThanOrEqual(0);
    expect(carouselIndex).toBeGreaterThanOrEqual(0);
    expect(summaryIndex).toBeGreaterThanOrEqual(0);

    expect(switchIndex).toBeLessThan(carouselIndex);
    expect(carouselIndex).toBeLessThan(summaryIndex);
  });
});
