// @vitest-environment happy-dom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PillarSlide } from "@/lib/pillars";
import PillarsCarousel from "@/components/PillarsCarousel";

const STREAM_IDS = ["stream-one", "stream-two"];
const DEFAULT_ID = "stream-one";

const PILLARS: PillarSlide[] = [
  {
    id: "first",
    label: "First pillar",
    sentence: "First sentence.",
    order: 0,
    streams: ["stream-one"],
  },
  {
    id: "second",
    label: "Second pillar",
    sentence: "Second sentence.",
    order: 1,
    streams: ["stream-one"],
  },
];

const THREE_PILLARS: PillarSlide[] = [
  ...PILLARS,
  {
    id: "third",
    label: "Third pillar",
    sentence: "Third sentence.",
    order: 2,
    streams: ["stream-one"],
  },
];

const STREAM_SPLIT_PILLARS: PillarSlide[] = [
  ...PILLARS,
  {
    id: "third",
    label: "Third pillar",
    sentence: "Third sentence.",
    order: 2,
    streams: ["stream-two"],
  },
  {
    id: "fourth",
    label: "Fourth pillar",
    sentence: "Fourth sentence.",
    order: 3,
    streams: ["stream-two"],
  },
];

const TWO_SECOND_STREAM: PillarSlide[] = [
  {
    id: "stream-two-third",
    label: "Third pillar",
    sentence: "Third sentence.",
    order: 3,
    streams: ["stream-two"],
  },
  {
    id: "stream-two-fourth",
    label: "Fourth pillar",
    sentence: "Fourth sentence.",
    order: 4,
    streams: ["stream-two"],
  },
];

const EMBEDDED_PILLARS: PillarSlide[] = [
  {
    id: "embedded-one",
    label: "Embedded one",
    sentence: "Embedded first sentence.",
    order: 0,
    streams: ["embedded"],
  },
  {
    id: "embedded-two",
    label: "Embedded two",
    sentence: "Embedded second sentence.",
    order: 1,
    streams: ["embedded"],
  },
];

type MockApi = {
  selectedScrollSnap: () => number;
  canScrollPrev: () => boolean;
  canScrollNext: () => boolean;
  scrollTo: (index: number) => void;
  scrollPrev: () => void;
  scrollNext: () => void;
  on: (event: string, handler: (api: MockApi) => void) => void;
  off: (event: string, handler: (api: MockApi) => void) => void;
};

vi.mock("embla-carousel-react", async () => {
  const React = await import("react");

  function createMockApi(): MockApi {
    let selected = 0;
    const handlers = new Map<string, Set<(api: MockApi) => void>>();

    const emit = (event: string) => {
      handlers.get(event)?.forEach((handler) => handler(api));
    };

    const api: MockApi = {
      selectedScrollSnap: () => selected,
      canScrollPrev: () => selected > 0,
      canScrollNext: () => true,
      scrollTo: (index) => {
        selected = index;
        emit("select");
      },
      scrollPrev: () => {
        if (selected > 0) {
          api.scrollTo(selected - 1);
        }
      },
      scrollNext: () => {
        api.scrollTo(selected + 1);
      },
      on: (event, handler) => {
        const registered = handlers.get(event) ?? new Set();
        registered.add(handler);
        handlers.set(event, registered);
      },
      off: (event, handler) => {
        handlers.get(event)?.delete(handler);
      },
    };

    return api;
  }

  function useEmblaCarousel() {
    const [api] = React.useState(createMockApi);
    const ref = React.useCallback(() => {}, []);

    return [ref, api];
  }

  return { default: useEmblaCarousel };
});

function renderCarousel(pillars: readonly PillarSlide[]) {
  return render(
    <PillarsCarousel
      pillars={pillars}
      streamIds={STREAM_IDS}
      defaultId={DEFAULT_ID}
    />,
  );
}

function carouselItems(container: HTMLElement): HTMLElement[] {
  return [
    ...container.querySelectorAll<HTMLElement>('[data-slot="carousel-item"]'),
  ];
}

function indicators(container: HTMLElement): HTMLElement[] {
  return [
    ...container.querySelectorAll<HTMLElement>('[aria-label^="Go to pillar"]'),
  ];
}

function currentIndicators(container: HTMLElement): HTMLElement[] {
  return [
    ...container.querySelectorAll<HTMLElement>(
      '[aria-label^="Go to pillar"][aria-current="true"]',
    ),
  ];
}

beforeEach(() => {
  location.hash = "";
  document.body.innerHTML = "";
});

afterEach(cleanup);

function switchHash(hash: string) {
  location.hash = hash;
  fireEvent(window, new Event("hashchange"));
}

describe("PillarsCarousel", () => {
  it("renders the Pillars heading and one slide per pillar", () => {
    const { container } = renderCarousel(PILLARS);

    expect(container.querySelector("h2")?.textContent).toBe("Pillars");
    expect(carouselItems(container)).toHaveLength(PILLARS.length);
  });

  it("renders each pillar label as an h3 and sentence as a p", () => {
    const { container } = renderCarousel(PILLARS);
    const items = carouselItems(container);

    expect(items).toHaveLength(PILLARS.length);

    PILLARS.forEach((pillar, index) => {
      const item = items[index];

      expect(item?.querySelectorAll("h3")).toHaveLength(1);
      expect(item?.querySelectorAll("p")).toHaveLength(1);
      expect(item?.querySelector("h3")?.textContent).toBe(pillar.label);
      expect(item?.querySelector("p")?.textContent).toBe(pillar.sentence);
    });
  });

  it("renders previous and next controls and one first-active indicator per slide", () => {
    const { container } = renderCarousel(PILLARS);

    expect(
      screen.getByRole("button", { name: /previous slide/i }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: /next slide/i })).toBeTruthy();
    expect(indicators(container)).toHaveLength(PILLARS.length);
    expect(
      screen
        .getByRole("button", { name: "Go to pillar 1" })
        .getAttribute("aria-current"),
    ).toBe("true");
  });

  it("selects a slide when its indicator is clicked", () => {
    const { container } = renderCarousel(THREE_PILLARS);

    fireEvent.click(screen.getByRole("button", { name: "Go to pillar 3" }));

    const current = currentIndicators(container);

    expect(current).toHaveLength(1);
    expect(current[0]?.getAttribute("aria-label")).toBe("Go to pillar 3");
    expect(
      screen
        .getByRole("button", { name: "Go to pillar 1" })
        .getAttribute("aria-current"),
    ).toBeNull();
  });

  it("renders pillar text as text and never as markup", () => {
    const sentence = "Beware <script>alert(1)</script> attempts.";
    const { container } = renderCarousel([{ ...PILLARS[0], sentence }]);

    expect(container.querySelector("script")).toBeNull();
    expect(
      container.querySelector('[data-slot="carousel-item"] p')?.textContent,
    ).toContain(sentence);
  });

  it("renders nothing when there are no pillars", () => {
    const { container } = renderCarousel([]);

    expect(container.childNodes).toHaveLength(0);
  });

  it("renders only the slides that match the default stream", () => {
    const { container } = renderCarousel(STREAM_SPLIT_PILLARS);

    expect(container.textContent).toContain("First sentence.");
    expect(container.textContent).toContain("Second sentence.");
    expect(container.textContent).not.toContain("Third sentence.");
    expect(container.textContent).not.toContain("Fourth sentence.");
  });

  it("swaps the rendered slides when the hash names another stream", async () => {
    const { container } = renderCarousel(STREAM_SPLIT_PILLARS);

    switchHash("#stream-two");

    await waitFor(() => {
      expect(container.textContent).toContain("Third sentence.");
      expect(container.textContent).toContain("Fourth sentence.");
    });
    expect(container.textContent).not.toContain("First sentence.");
    expect(container.textContent).not.toContain("Second sentence.");
  });

  it("keeps the default slides when the hash names an unknown stream", () => {
    const { container } = renderCarousel(STREAM_SPLIT_PILLARS);

    switchHash("#nope");

    expect(container.textContent).toContain("First sentence.");
    expect(container.textContent).toContain("Second sentence.");
    expect(container.textContent).not.toContain("Third sentence.");
    expect(container.textContent).not.toContain("Fourth sentence.");
  });

  it("hides the carousel and heading on an empty stream and restores them after returning", async () => {
    const { container } = render(
      <PillarsCarousel
        pillars={EMBEDDED_PILLARS}
        streamIds={["embedded", "misc"]}
        defaultId="embedded"
      />,
    );

    expect(carouselItems(container)).toHaveLength(EMBEDDED_PILLARS.length);
    expect(container.querySelector("h2")?.textContent).toBe("Pillars");

    switchHash("#misc");

    await waitFor(() => {
      expect(container.childNodes).toHaveLength(0);
    });
    expect(container.querySelector("h2")).toBeNull();
    expect(screen.queryByRole("heading", { name: "Pillars" })).toBeNull();

    switchHash("#embedded");

    await waitFor(() => {
      expect(carouselItems(container)).toHaveLength(EMBEDDED_PILLARS.length);
      expect(container.querySelector("h2")?.textContent).toBe("Pillars");
    });
  });

  it("resets the active dot when the stream changes", async () => {
    const { container } = renderCarousel([
      ...THREE_PILLARS,
      ...TWO_SECOND_STREAM,
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Go to pillar 3" }));

    expect(
      currentIndicators(container).map((dot) => dot.getAttribute("aria-label")),
    ).toEqual(["Go to pillar 3"]);

    switchHash("#stream-two");

    await waitFor(() => {
      expect(carouselItems(container)).toHaveLength(2);
    });

    const current = currentIndicators(container);

    expect(current).toHaveLength(1);
    expect(current[0]?.getAttribute("aria-label")).toBe("Go to pillar 1");
    expect(screen.queryByRole("button", { name: "Go to pillar 3" })).toBeNull();
  });
});
