// @vitest-environment happy-dom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import StreamCarousel, {
  type CarouselSlide,
} from "@/components/StreamCarousel";

const HEADING = "Career streams";
const SLIDE_LABEL = "widget";

vi.mock("embla-carousel-react", async () => {
  const React = await import("react");

  function useEmblaCarousel() {
    const ref = React.useCallback(() => {}, []);

    return [ref, undefined];
  }

  return { default: useEmblaCarousel };
});

function renderCarousel(
  slides: readonly CarouselSlide[],
  activeStream = "stream-one",
) {
  return render(
    <StreamCarousel
      heading={HEADING}
      slideLabel={SLIDE_LABEL}
      slides={slides}
      activeStream={activeStream}
    />,
  );
}

function indicators(): HTMLElement[] {
  return screen.getAllByRole("button", { name: /^Go to widget \d+$/ });
}

beforeEach(() => {
  document.body.innerHTML = "";
});

afterEach(cleanup);

describe("StreamCarousel", () => {
  it("renders the heading and only the active stream's slides in order", () => {
    const { container } = renderCarousel(
      [
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
      ],
      "stream-one",
    );

    expect(container.querySelector("h2")?.textContent).toBe(HEADING);
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
    const headings = container.querySelectorAll("h3");

    expect(headings).toHaveLength(1);
    expect(headings[0]?.textContent).toBe("Titled slide");
    expect(
      screen.getByText("Titled body.").parentElement?.textContent,
    ).toContain("Titled slide");
    expect(
      screen.getByText("Untitled body.").parentElement?.querySelector("h3"),
    ).toBeNull();
  });

  it("renders nothing, including no heading, when the active stream matches no slide", () => {
    const { container } = renderCarousel(
      [
        {
          id: "embedded",
          title: "Embedded",
          body: "Embedded body.",
          streams: ["embedded"],
        },
      ],
      "misc",
    );

    expect(container.childNodes).toHaveLength(0);
    expect(screen.queryByRole("heading", { name: HEADING })).toBeNull();
  });

  it("labels one dot per slide visible for the active stream", () => {
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

    expect(indicators()).toHaveLength(3);
    expect(screen.getByRole("button", { name: "Go to widget 1" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Go to widget 4" })).toBeNull();
  });
});
