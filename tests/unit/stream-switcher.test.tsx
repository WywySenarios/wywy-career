// @vitest-environment happy-dom

import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import StreamSwitcher from "@/components/StreamSwitcher";

const STREAMS = [
  { id: "stream-one", label: "Stream One" },
  { id: "stream-two", label: "Stream Two" },
];

const DEFAULT_ID = "stream-one";

const SECTION = `
  <div data-stream-section>
    <p data-streams="stream-one" data-stream-atom>Example item one.</p>
    <p data-streams="stream-two" data-stream-atom hidden>Example item two.</p>
  </div>
`;

function navIn(container: HTMLElement): HTMLElement {
  const nav = container.querySelector<HTMLElement>(
    'nav[aria-label="Career stream"]',
  );

  if (nav === null) {
    throw new Error('Missing nav[aria-label="Career stream"].');
  }

  return nav;
}

function tabsIn(container: HTMLElement): HTMLElement[] {
  return [
    ...navIn(container).querySelectorAll<HTMLElement>("a[data-stream-id]"),
  ];
}

function currentIn(container: HTMLElement): HTMLElement[] {
  return tabsIn(container).filter(
    (tab) => tab.getAttribute("aria-current") === "true",
  );
}

function atom(streams: string): HTMLElement {
  const found = document.querySelector<HTMLElement>(
    `[data-stream-atom][data-streams="${streams}"]`,
  );

  if (found === null) {
    throw new Error(`Missing atom for streams "${streams}".`);
  }

  return found;
}

beforeEach(() => {
  location.hash = "";
  document.body.innerHTML = "";
});

afterEach(cleanup);

describe("StreamSwitcher", () => {
  it("renders one anchor per stream in the supplied order with hash hrefs and label text", () => {
    const { container } = render(
      <StreamSwitcher streams={STREAMS} defaultId={DEFAULT_ID} />,
    );
    const tabs = tabsIn(container);

    expect(tabs).toHaveLength(STREAMS.length);
    expect(tabs.map((tab) => tab.getAttribute("href"))).toEqual([
      "#stream-one",
      "#stream-two",
    ]);
    expect(tabs.map((tab) => tab.textContent)).toEqual([
      "Stream One",
      "Stream Two",
    ]);
  });

  it("renders an ampersand in a label as literal text", () => {
    const label = "Stream One & Mobile";
    const { container } = render(
      <StreamSwitcher
        streams={[{ id: "stream-one", label }]}
        defaultId={DEFAULT_ID}
      />,
    );

    expect(tabsIn(container)[0]?.textContent).toBe(label);
  });

  it("marks the default stream as the only current tab", () => {
    const { container } = render(
      <StreamSwitcher streams={STREAMS} defaultId={DEFAULT_ID} />,
    );

    expect(currentIn(container)).toHaveLength(1);
    expect(currentIn(container)[0]?.getAttribute("data-stream-id")).toBe(
      DEFAULT_ID,
    );
  });

  it("honours a hash present at load and filters the atoms", async () => {
    document.body.innerHTML = SECTION;
    location.hash = "#stream-two";

    const { container } = render(
      <StreamSwitcher streams={STREAMS} defaultId={DEFAULT_ID} />,
    );

    await waitFor(() => {
      expect(currentIn(container)).toHaveLength(1);
      expect(currentIn(container)[0]?.getAttribute("data-stream-id")).toBe(
        "stream-two",
      );
      expect(atom("stream-one").hasAttribute("hidden")).toBe(true);
      expect(atom("stream-two").hasAttribute("hidden")).toBe(false);
    });
  });

  it("keeps the default current when the hash present at load names an unknown stream", async () => {
    location.hash = "#nope";

    const { container } = render(
      <StreamSwitcher streams={STREAMS} defaultId={DEFAULT_ID} />,
    );

    await waitFor(() => {
      expect(currentIn(container)).toHaveLength(1);
      expect(currentIn(container)[0]?.getAttribute("data-stream-id")).toBe(
        DEFAULT_ID,
      );
    });
  });

  it("moves the current tab and the atoms when a tab is clicked", async () => {
    document.body.innerHTML = SECTION;

    const { container } = render(
      <StreamSwitcher streams={STREAMS} defaultId={DEFAULT_ID} />,
    );

    fireEvent.click(tabsIn(container)[1] as HTMLElement);

    await waitFor(() => {
      expect(currentIn(container)).toHaveLength(1);
      expect(currentIn(container)[0]?.getAttribute("data-stream-id")).toBe(
        "stream-two",
      );
      expect(atom("stream-one").hasAttribute("hidden")).toBe(true);
      expect(atom("stream-two").hasAttribute("hidden")).toBe(false);
    });
  });

  it("filters the atoms with the default stream when there is no hash", async () => {
    document.body.innerHTML = SECTION;

    render(<StreamSwitcher streams={STREAMS} defaultId={DEFAULT_ID} />);

    await waitFor(() => {
      expect(atom("stream-one").hasAttribute("hidden")).toBe(false);
      expect(atom("stream-two").hasAttribute("hidden")).toBe(true);
    });
  });
});
