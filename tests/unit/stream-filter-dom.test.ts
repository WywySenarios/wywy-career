// @vitest-environment happy-dom

import { beforeEach, describe, expect, it } from "vitest";
import { applyStreamFilter } from "@/lib/stream-filter-dom";

function isHidden(selector: string): boolean {
  const found = document.querySelector(selector);

  if (found === null) {
    throw new Error(`Missing element: ${selector}`);
  }

  return found.hasAttribute("hidden");
}

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("applyStreamFilter", () => {
  it("hides atoms outside the active stream and reveals atoms inside the active stream", () => {
    document.body.innerHTML = `
      <p data-streams="stream-two" data-stream-atom hidden>Example summary two.</p>
      <p data-streams="stream-one" data-stream-atom>Example summary one.</p>
    `;

    applyStreamFilter(document, "stream-two");

    expect(isHidden('[data-streams="stream-two"]')).toBe(false);
    expect(isHidden('[data-streams="stream-one"]')).toBe(true);
  });

  it("hides atoms outside the other stream and reveals atoms inside the other stream", () => {
    document.body.innerHTML = `
      <p data-streams="stream-two" data-stream-atom hidden>Example summary two.</p>
      <p data-streams="stream-one" data-stream-atom>Example summary one.</p>
    `;

    applyStreamFilter(document, "stream-one");

    expect(isHidden('[data-streams="stream-one"]')).toBe(false);
    expect(isHidden('[data-streams="stream-two"]')).toBe(true);
  });

  it("keeps a multi-stream atom visible under every stream it lists", () => {
    document.body.innerHTML = `
      <p data-streams="stream-two,stream-three" data-stream-atom hidden>Example summary.</p>
    `;

    applyStreamFilter(document, "stream-two");
    expect(isHidden('[data-streams="stream-two,stream-three"]')).toBe(false);

    applyStreamFilter(document, "stream-three");
    expect(isHidden('[data-streams="stream-two,stream-three"]')).toBe(false);
  });

  it("keeps a section hidden when only a nested bullet matches the active stream", () => {
    document.body.innerHTML = `
      <div data-stream-section>
        <section data-streams="stream-one" data-stream-atom hidden>
          <ul>
            <li data-streams="stream-two">Example bullet two.</li>
          </ul>
        </section>
      </div>
    `;

    applyStreamFilter(document, "stream-two");

    expect(isHidden('[data-stream-atom][data-streams="stream-one"]')).toBe(
      true,
    );
    expect(isHidden('li[data-streams="stream-two"]')).toBe(false);
    expect(isHidden("[data-stream-section]")).toBe(true);
  });

  it("reveals a section again when a later stream matches one of its atoms", () => {
    document.body.innerHTML = `
      <div data-stream-section>
        <p data-streams="stream-two" data-stream-atom>Example summary two.</p>
        <p data-streams="stream-one" data-stream-atom hidden>Example summary one.</p>
      </div>
    `;

    applyStreamFilter(document, "stream-three");
    expect(isHidden("[data-stream-section]")).toBe(true);

    applyStreamFilter(document, "stream-two");
    expect(isHidden("[data-stream-section]")).toBe(false);
  });

  it("leaves a hidden section without atoms hidden", () => {
    document.body.innerHTML = `
      <div data-stream-section hidden>
        <p>Example note.</p>
      </div>
    `;

    applyStreamFilter(document, "stream-two");

    expect(isHidden("[data-stream-section]")).toBe(true);
  });

  it("leaves a visible section without atoms visible", () => {
    document.body.innerHTML = `
      <div data-stream-section>
        <p>Example note.</p>
      </div>
    `;

    applyStreamFilter(document, "stream-two");

    expect(isHidden("[data-stream-section]")).toBe(false);
  });
});
