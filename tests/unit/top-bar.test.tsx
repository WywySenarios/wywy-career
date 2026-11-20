// @vitest-environment happy-dom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import TopBar from "@/components/TopBar";

const NAME = "example-name";

const LINKS = [
  { label: "GitHub", url: "https://example.com/github" },
  { label: "R&D", url: "https://example.com/rd?a=1&b=2" },
] as const;

const STREAMS = [
  { id: "example-one", label: "Example One" },
  { id: "example-two", label: "Example Two" },
  { id: "example-three", label: "Example Three" },
  { id: "example-four", label: "Example Four" },
  { id: "example-five", label: "Example Five" },
  { id: "example-six", label: "Example Six" },
] as const;

function renderTopBar(activeStream: string = "example-three") {
  return render(
    <TopBar
      name={NAME}
      links={LINKS}
      streams={STREAMS}
      activeStream={activeStream}
    />,
  );
}

function careerStreamNav(): HTMLElement {
  const nav = document.querySelector<HTMLElement>(
    'nav[aria-label="Career stream"]',
  );

  if (!nav) {
    throw new Error('Missing nav landmark: nav[aria-label="Career stream"]');
  }

  return nav;
}

function expectedRoutes(): string[] {
  return STREAMS.map((stream) => `/streams/${stream.id}`);
}

function expectedLabels(): string[] {
  return STREAMS.map((stream) => stream.label);
}

beforeEach(() => {
  document.body.innerHTML = "";
});

afterEach(cleanup);

describe("TopBar", () => {
  it("renders the name as the only h1 and one anchor per profile link", () => {
    renderTopBar();

    const headings = screen.getAllByRole("heading", { level: 1 });

    expect(headings).toHaveLength(1);
    expect(headings[0]?.textContent).toBe(NAME);

    for (const link of LINKS) {
      const anchor = screen.getByRole("link", { name: link.label });

      expect(anchor.getAttribute("href")).toBe(link.url);
      expect(anchor.textContent).toBe(link.label);
    }

    expect(screen.getByText("R&D")).toBeTruthy();
    expect(screen.getAllByRole("link")).toHaveLength(LINKS.length);
  });

  it("lists every stream route in order when Resume is clicked", async () => {
    renderTopBar();

    fireEvent.click(screen.getByRole("button", { name: "Resume" }));

    const links = await within(careerStreamNav()).findAllByRole("link");

    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      expectedRoutes(),
    );
    expect(links.map((link) => link.textContent)).toEqual(expectedLabels());
  });

  it("lists every stream route in order when Resume receives a mouse pointer move", async () => {
    renderTopBar();

    const trigger = screen.getByRole("button", { name: "Resume" });

    fireEvent.pointerMove(trigger, { pointerType: "mouse" });

    await waitFor(
      () => {
        expect(within(careerStreamNav()).getAllByRole("link")).toHaveLength(
          STREAMS.length,
        );
      },
      { timeout: 2000 },
    );

    const links = within(careerStreamNav()).getAllByRole("link");

    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      expectedRoutes(),
    );
    expect(links.map((link) => link.textContent)).toEqual(expectedLabels());
  });

  it("marks only the example-three link as the current page when it is the active stream", async () => {
    renderTopBar("example-three");

    fireEvent.click(screen.getByRole("button", { name: "Resume" }));

    const links = await within(careerStreamNav()).findAllByRole("link");
    const current = links.filter(
      (link) => link.getAttribute("aria-current") === "page",
    );

    expect(current).toHaveLength(1);
    expect(current[0]?.getAttribute("href")).toBe("/streams/example-three");
  });

  it("server-renders the header, nav landmark, Resume trigger, and profile anchors without closed stream links", () => {
    const html = renderToStaticMarkup(
      <TopBar
        name={NAME}
        links={LINKS}
        streams={STREAMS}
        activeStream="example-three"
      />,
    );

    expect(html).toContain(NAME);
    expect(html).toContain('aria-label="Career stream"');
    expect(html).toContain("Resume");
    expect(html).toContain("example.com/github");
    expect(html).toContain("example.com/rd?a=1&amp;b=2");
    expect(html).toContain("R&amp;D");

    for (const stream of STREAMS) {
      expect(html).not.toContain(`/streams/${stream.id}`);
      expect(html).not.toContain(stream.label);
    }
  });

  it("opens a menu dialog labelled Menu when the mobile Open menu button is clicked", async () => {
    renderTopBar();

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    const dialog = await screen.findByRole("dialog", { name: "Menu" });

    expect(dialog).toBeTruthy();
    expect(within(dialog).getByText(NAME)).toBeTruthy();
  });

  it("lists every stream and profile route inside the mobile menu in order", async () => {
    renderTopBar("example-three");

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    const dialog = await screen.findByRole("dialog", { name: "Menu" });
    const mobileNav = within(dialog).getByRole("navigation", {
      name: "Career stream menu",
    });

    expect(within(dialog).getByText(NAME)).toBeTruthy();

    const streamLinks = await within(mobileNav).findAllByRole("link");

    expect(streamLinks.map((link) => link.getAttribute("href"))).toEqual(
      expectedRoutes(),
    );
    expect(streamLinks.map((link) => link.textContent)).toEqual(
      expectedLabels(),
    );

    const current = streamLinks.filter(
      (link) => link.getAttribute("aria-current") === "page",
    );

    expect(current).toHaveLength(1);
    expect(current[0]?.getAttribute("href")).toBe("/streams/example-three");

    for (const link of LINKS) {
      const anchor = within(dialog).getByRole("link", { name: link.label });

      expect(anchor.getAttribute("href")).toBe(link.url);
      expect(anchor.textContent).toBe(link.label);
    }

    expect(within(dialog).getByText("R&D")).toBeTruthy();
  });

  it("closes the mobile menu on Escape and on the close control", async () => {
    renderTopBar();

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    expect(await screen.findByRole("dialog", { name: "Menu" })).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Menu" })).toBeNull();
    });

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    const dialog = await screen.findByRole("dialog", { name: "Menu" });

    fireEvent.click(within(dialog).getByRole("button", { name: /close/i }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Menu" })).toBeNull();
    });
  });
});
