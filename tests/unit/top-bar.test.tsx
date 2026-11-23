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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TopBar from "@/components/TopBar";

const { ICON_LINK_URL, ICON_SRC } = vi.hoisted(() => ({
  ICON_LINK_URL: "https://example.com/icon",
  ICON_SRC: "/example-icon.svg",
}));

vi.mock("@/lib/link-icons", () => ({
  linkIcon: (url: string) => (url === ICON_LINK_URL ? ICON_SRC : undefined),
}));

const NAME = "example-name";

const ICON_LINK = { label: "example-icon", url: ICON_LINK_URL } as const;

const TEXT_LINKS = [
  { label: "example-site", url: "https://example.com/plain" },
  { label: "R&D", url: "https://example.com/rd?a=1&b=2" },
] as const;

const LINKS = [...TEXT_LINKS, ICON_LINK] as const;

function expectIconOnlyLink(anchor: HTMLElement) {
  expect(anchor.getAttribute("href")).toBe(ICON_LINK.url);
  expect(anchor.getAttribute("aria-label")).toBe(ICON_LINK.label);
  expect(anchor.getAttribute("title")).toBe(ICON_LINK.label);
  expect(anchor.textContent).toBe("");
  expect(anchor.getAttribute("data-variant")).toBe("outline");
  expect(anchor.getAttribute("data-size")).toBe("icon-sm");

  const images = anchor.querySelectorAll("img");

  expect(images).toHaveLength(1);

  const image = images[0]!;

  expect(image.getAttribute("src")).toBe(ICON_SRC);
  expect(image.getAttribute("alt")).toBe("");
  expect(image.getAttribute("aria-hidden")).toBe("true");
  expect(image.getAttribute("width")).toBe("16");
  expect(image.getAttribute("height")).toBe("16");
  expect(image.getAttribute("loading")).toBe("eager");
  expect(image.getAttribute("decoding")).toBe("async");
  expect(image.classList.contains("size-4")).toBe(true);
}

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

    const nameLink = within(headings[0] as HTMLElement).getByRole("link", {
      name: NAME,
    });

    expect(nameLink.getAttribute("href")).toBe("/");

    for (const link of LINKS) {
      const anchor = screen.getByRole("link", { name: link.label });

      expect(anchor.getAttribute("href")).toBe(link.url);
    }

    for (const link of TEXT_LINKS) {
      const anchor = screen.getByRole("link", { name: link.label });

      expect(anchor.textContent).toBe(link.label);
    }

    expect(screen.getByText("R&D")).toBeTruthy();
    expect(screen.getAllByRole("link")).toHaveLength(LINKS.length + 1);
  });

  it("renders a mapped-host profile link as an icon-only outline button", () => {
    renderTopBar();

    const anchor = screen.getByRole("link", { name: ICON_LINK.label });

    expectIconOnlyLink(anchor);
  });

  it("keeps an unmapped-host profile link as a text button without an image", () => {
    renderTopBar();

    const link = TEXT_LINKS.find((candidate) => candidate.label === "R&D")!;
    const anchor = screen.getByRole("link", { name: link.label });

    expect(anchor.getAttribute("href")).toBe(link.url);
    expect(anchor.textContent).toBe(link.label);
    expect(anchor.hasAttribute("aria-label")).toBe(false);
    expect(anchor.hasAttribute("title")).toBe(false);
    expect(anchor.querySelector("img")).toBeNull();
    expect(anchor.getAttribute("data-size")).toBe("sm");
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

  it("marks no stream as current when activeStream is omitted", async () => {
    render(<TopBar name={NAME} links={LINKS} streams={STREAMS} />);

    fireEvent.click(screen.getByRole("button", { name: "Resume" }));

    const links = await within(careerStreamNav()).findAllByRole("link");

    expect(links).toHaveLength(STREAMS.length);
    expect(
      links.filter((link) => link.getAttribute("aria-current") === "page"),
    ).toHaveLength(0);
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
    expect(html).toMatch(/<a[^>]*href="\/"[^>]*>example-name<\/a>/);
    expect(html).toContain('aria-label="Career stream"');
    expect(html).toContain("Resume");
    expect(html).toContain("example.com/plain");
    expect(html).toContain("example.com/rd?a=1&amp;b=2");
    expect(html).toContain("R&amp;D");
    expect(html).toContain('aria-label="example-icon"');
    expect(html).toContain('title="example-icon"');
    expect(html).toContain("example.com/icon");

    const iconImage = html.match(/<img\b[^>]*aria-hidden="true"[^>]*>/);

    expect(iconImage).not.toBeNull();
    expect(iconImage![0]).toContain('alt=""');
    expect(iconImage![0]).toContain("size-4");

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

    const nameLink = within(dialog).getByRole("link", { name: NAME });

    expect(nameLink.getAttribute("href")).toBe("/");
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

    for (const link of TEXT_LINKS) {
      const anchor = within(dialog).getByRole("link", { name: link.label });

      expect(anchor.getAttribute("href")).toBe(link.url);
      expect(anchor.textContent).toBe(link.label);
    }

    expect(within(dialog).getByText("R&D")).toBeTruthy();
  });

  it("renders the icon-only link and the text link on the desktop header and in the mobile sheet", async () => {
    renderTopBar();

    for (const link of LINKS) {
      const anchor = screen.getByRole("link", { name: link.label });

      expect(anchor.getAttribute("href")).toBe(link.url);
    }

    expect(screen.getAllByRole("link")).toHaveLength(LINKS.length + 1);

    expectIconOnlyLink(screen.getByRole("link", { name: ICON_LINK.label }));

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    const dialog = await screen.findByRole("dialog", { name: "Menu" });

    expectIconOnlyLink(
      within(dialog).getByRole("link", { name: ICON_LINK.label }),
    );

    const mobileTextLink = within(dialog).getByRole("link", { name: "R&D" });

    expect(mobileTextLink.textContent).toBe("R&D");
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
