// @vitest-environment happy-dom

import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useActiveStream } from "@/lib/use-active-stream";

const STREAM_IDS = ["stream-one", "stream-two"];
const DEFAULT_ID = "stream-one";

function Probe({
  streamIds,
  defaultId,
}: {
  streamIds: readonly string[];
  defaultId: string;
}) {
  const active = useActiveStream(streamIds, defaultId);

  return <output data-testid="active-stream">{active}</output>;
}

function renderProbe() {
  return render(<Probe streamIds={STREAM_IDS} defaultId={DEFAULT_ID} />);
}

function activeStream(): string | null {
  const probe = document.querySelector<HTMLElement>(
    '[data-testid="active-stream"]',
  );

  if (probe === null) {
    throw new Error('Missing probe element [data-testid="active-stream"].');
  }

  return probe.textContent;
}

function dispatchHashChange(): void {
  window.dispatchEvent(new Event("hashchange"));
}

// Browsers normalise away a bare "#" fragment, so location.hash can never
// report it. Override the getter to hand the hook the exact string it must
// reject.
function stubHash(hash: string): void {
  Object.defineProperty(window.location, "hash", {
    configurable: true,
    get: () => hash,
    set: () => {},
  });
}

async function expectFallbackToDefault(applyHash: () => void): Promise<void> {
  location.hash = "#stream-two";
  renderProbe();

  await waitFor(() => {
    expect(activeStream()).toBe("stream-two");
  });

  applyHash();
  dispatchHashChange();

  await waitFor(() => {
    expect(activeStream()).toBe(DEFAULT_ID);
  });
}

beforeEach(() => {
  location.hash = "";
  document.body.innerHTML = "";
});

afterEach(() => {
  cleanup();
  delete (window.location as { hash?: string }).hash;
});

describe("useActiveStream", () => {
  it("returns the default stream from the hook when there is no hash", () => {
    renderProbe();

    expect(activeStream()).toBe(DEFAULT_ID);
  });

  it("reads a known hash present at mount and returns that stream", async () => {
    location.hash = "#stream-two";
    renderProbe();

    await waitFor(() => {
      expect(activeStream()).toBe("stream-two");
    });
  });

  it("updates the hook stream on hashchange", async () => {
    renderProbe();

    await waitFor(() => {
      expect(activeStream()).toBe(DEFAULT_ID);
    });

    location.hash = "#stream-two";
    dispatchHashChange();

    await waitFor(() => {
      expect(activeStream()).toBe("stream-two");
    });
  });

  it("falls back to the default stream for an unknown hash", async () => {
    await expectFallbackToDefault(() => {
      location.hash = "#nope";
    });
  });

  it("falls back to the default stream for an empty hash", async () => {
    await expectFallbackToDefault(() => {
      location.hash = "";
    });
  });

  it("falls back to the default stream for a bare-prefix hash", async () => {
    await expectFallbackToDefault(() => {
      stubHash("#");
    });
  });
});
