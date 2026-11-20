// @vitest-environment happy-dom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import StreamCarousel, {
  type CarouselSlide,
} from "@/components/StreamCarousel";

const HEADING = "Career streams";
const SLIDE_LABEL = "widget";
const STREAM_IDS = ["stream-one", "stream-two"];
const DEFAULT_ID = "stream-one";

// StreamCarousel only needs Embla's ref. The api stays undefined because these
// tests cover filtering, labeling, and empty state, not carousel scrolling.
vi.mock("embla-carousel-react", async () => {
  const React = await import("react");

  function useEmblaCarousel() {
    const ref = React.useCallback(() => {}, []);

    return [ref, undefined];
  }

  return { default: useEmblaCarousel };
});

function renderCarousel(slides: readonly CarouselSlide[]) {
  return render(
    <StreamCarousel
      heading={HEADING}
      slideLabel={SLIDE_LABEL}
      slides={slides}
      streamIds={STREAM_IDS}
      defaultId={DEFAULT_ID}
    />,
  );
}

function renderedSlides(container: HTMLElement): HTMLElement[] {
  return [
    ...container.querySelectorAll<HTMLElement>(
      '[aria-roledescription="slide"]',
    ),
  ];
}

beforeEach(() => {
  location.hash = "";
  document.body.innerHTML = "";
});

afterEach(cleanup);

describe("StreamCarousel", () => {
  it("renders the heading, accessible name, and only matching slides in order", () => {
    const { container } = renderCarousel([
      {
        id: "first",
        title: "First title",
        body: "First body.",
        streams: ["stream-one"],
      },
      {
        id: "hidden",
        title: "Hidden title",
        body: "Hidden body.",
        streams: ["stream-two"],
      },
      {
        id: "second",
        title: "Second title",
        body: "Second body.",
        streams: ["stream-one"],
      },
    ]);

    expect(container.querySelector("h2")?.textContent).toBe(HEADING);
    expect(screen.getByRole("region", { name: HEADING })).toBeTruthy();
    expect(renderedSlides(container)).toHaveLength(2);
    expect(container.textContent).not.toContain("Hidden body.");

    const text = container.textContent ?? "";
    const positions = ["First body.", "Second body."].map((body) =>
      text.indexOf(body),
    );

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("renders a title only when supplied", () => {
    const { container } = renderCarousel([
      {
        id: "titled",
        title: "Titled slide",
        body: "Titled body.",
        streams: ["stream-one"],
      },
      {
        id: "untitled",
        body: "Untitled body.",
        streams: ["stream-one"],
      },
    ]);
    const [titled, untitled] = renderedSlides(container);

    expect(titled?.textContent).toContain("Titled slide");
    expect(titled?.textContent).toContain("Titled body.");
    expect(untitled?.textContent).toBe("Untitled body.");
    expect(untitled?.querySelector("h3")).toBeNull();
  });

  it("renders nothing when no slide matches the active stream", () => {
    const { container } = render(
      <StreamCarousel
        heading={HEADING}
        slideLabel={SLIDE_LABEL}
        slides={[
          {
            id: "embedded",
            title: "Embedded",
            body: "Embedded body.",
            streams: ["embedded"],
          },
        ]}
        streamIds={["embedded", "misc"]}
        defaultId="misc"
      />,
    );

    expect(container.childNodes).toHaveLength(0);
    expect(screen.queryByRole("heading", { name: HEADING })).toBeNull();
  });

  it("labels one dot per filtered slide from the slide label", () => {
    renderCarousel([
      {
        id: "one",
        title: "One",
        body: "One body.",
        streams: ["stream-one"],
      },
      {
        id: "two",
        title: "Two",
        body: "Two body.",
        streams: ["stream-one"],
      },
      {
        id: "three",
        title: "Three",
        body: "Three body.",
        streams: ["stream-one"],
      },
      {
        id: "hidden",
        title: "Hidden",
        body: "Hidden body.",
        streams: ["stream-two"],
      },
    ]);

    expect(
      screen.getAllByRole("button", { name: /^Go to widget \d+$/ }),
    ).toHaveLength(3);
    expect(screen.getByRole("button", { name: "Go to widget 1" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Go to widget 4" })).toBeNull();
  });
});
