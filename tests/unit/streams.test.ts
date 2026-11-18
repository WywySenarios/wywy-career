import { describe, expect, it } from "vitest";
import {
  assertKnownStreams,
  buildLookup,
  canonicalizeStreams,
  defaultStreamId,
  parseStreamCatalog,
  sortCatalogByOrder,
} from "@/lib/streams";

const CATALOG = [
  { id: "stream-one", label: "Stream One", aliases: ["alias-one"] },
  { id: "stream-two", label: "Stream Two", aliases: ["alias-two"] },
];

describe("assertKnownStreams", () => {
  it("accepts canonical ids", () => {
    expect(() =>
      assertKnownStreams(
        [{ id: "example-record-one", streams: ["stream-two", "stream-one"] }],
        CATALOG,
      ),
    ).not.toThrow();
  });

  it("rejects an alias", () => {
    expect(() =>
      assertKnownStreams(
        [{ id: "example-record-one", streams: ["alias-two"] }],
        CATALOG,
      ),
    ).toThrow(/Unknown stream "alias-two"/);
  });

  it("rejects an unknown stream", () => {
    expect(() =>
      assertKnownStreams(
        [{ id: "example-record-one", streams: ["nope"] }],
        CATALOG,
      ),
    ).toThrow(/Unknown stream "nope"/);
  });

  it("names the record holding the unknown stream", () => {
    expect(() =>
      assertKnownStreams(
        [{ id: "example-record-one", streams: ["nope"] }],
        CATALOG,
      ),
    ).toThrow(/example-record-one/);
  });

  it("checks bullet and course streams", () => {
    const container = {
      id: "example-record-one",
      streams: ["stream-two"],
      bullets: [{ id: "example-bullet-one", streams: ["nope"] }],
      courses: [{ id: "example-course-one", streams: ["nope"] }],
    };

    expect(() => assertKnownStreams([container], CATALOG)).toThrow(
      /example-bullet-one/,
    );
  });

});

describe("canonicalizeStreams", () => {
  it("returns a canonical id unchanged", () => {
    const lookup = buildLookup(CATALOG);

    expect(canonicalizeStreams(["stream-one"], lookup)).toEqual(["stream-one"]);
  });

  it("preserves order and duplicates", () => {
    const lookup = buildLookup(CATALOG);

    expect(
      canonicalizeStreams(["stream-two", "stream-one", "stream-two"], lookup),
    ).toEqual(["stream-two", "stream-one", "stream-two"]);
  });

  it("rejects an unknown value naming it", () => {
    const lookup = buildLookup(CATALOG);

    expect(() => canonicalizeStreams(["nope"], lookup)).toThrow(
      /Unknown stream "nope"/,
    );
  });
});

const FILE_ORDER_YAML = `
- id: stream-two
  label: Stream Two
  aliases: [alias-two]
- id: stream-one
  label: Stream One
  aliases: [alias-one]
`;

describe("parseStreamCatalog", () => {
  it("stamps file order rather than id order", () => {
    const parsed = parseStreamCatalog(FILE_ORDER_YAML);
    const ordersById = Object.fromEntries(
      parsed.map((entry) => [entry.id, entry.order]),
    );

    expect(ordersById).toEqual({ "stream-two": 0, "stream-one": 1 });
  });

  it("preserves each entry's label and aliases", () => {
    const parsed = parseStreamCatalog(FILE_ORDER_YAML);
    const streamTwo = parsed.find((entry) => entry.id === "stream-two");

    expect(streamTwo?.label).toBe("Stream Two");
    expect(streamTwo?.aliases).toEqual(["alias-two"]);
  });
});

describe("defaultStreamId", () => {
  it("returns the stream with the lowest ordinal", () => {
    const catalog = [
      {
        id: "stream-one",
        label: "Stream One",
        aliases: ["alias-one"],
        order: 1,
      },
      {
        id: "stream-two",
        label: "Stream Two",
        aliases: ["alias-two"],
        order: 0,
      },
    ];

    expect(defaultStreamId(catalog)).toBe("stream-two");
  });

  it("throws when the catalog is empty", () => {
    expect(() => defaultStreamId([])).toThrow(/catalog is empty/);
  });
});

describe("sortCatalogByOrder", () => {
  it("orders entries by ordinal without mutating the input", () => {
    const catalog = [
      {
        id: "stream-two",
        label: "Stream Two",
        aliases: ["alias-two"],
        order: 2,
      },
      {
        id: "stream-one",
        label: "Stream One",
        aliases: ["alias-one"],
        order: 0,
      },
      {
        id: "stream-three",
        label: "Stream Three",
        aliases: ["alias-three"],
        order: 1,
      },
    ];

    const sorted = sortCatalogByOrder(catalog);

    expect(sorted.map((entry) => entry.order)).toEqual([0, 1, 2]);
    expect(catalog.map((entry) => entry.order)).toEqual([2, 0, 1]);
  });
});
