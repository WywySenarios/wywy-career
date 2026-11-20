import { describe, expect, it } from "vitest";
import {
  educationToEntries,
  experienceToEntries,
  projectsToEntries,
  summariesToVariants,
} from "@/lib/cv-entries";
import type {
  Bullet,
  Education,
  Experience,
  Project,
  SummaryVariant,
} from "@/lib/cv-schemas";

const LOOKUP = new Map<string, string>([
  ["stream-one", "stream-one"],
  ["stream-two", "stream-two"],
  ["stream-three", "stream-three"],
]);

const BULLETS: Bullet[] = [
  {
    id: "example-bullet-one",
    tags: [],
    streams: ["stream-two"],
    text: "Example bullet one.",
  },
  {
    id: "example-bullet-two",
    tags: [],
    streams: ["stream-two"],
    text: "Example bullet two.",
  },
];
const BULLET_ITEMS = BULLETS.map((bullet) => ({
  text: bullet.text,
  streams: bullet.streams,
}));
const MIXED_BULLETS: Bullet[] = [
  {
    id: "example-bullet-one",
    tags: [],
    streams: ["stream-three"],
    text: "Example bullet one.",
  },
  {
    id: "example-bullet-two",
    tags: [],
    streams: ["stream-two"],
    text: "Example bullet two.",
  },
];
const MIXED_BULLET_ITEMS = [
  { text: "Example bullet one.", streams: ["stream-three"] },
  { text: "Example bullet two.", streams: ["stream-two"] },
];
const TAGS = ["example-tag-one", "example-tag-two"];

const EXPERIENCE: Experience = {
  id: "example-entry-one",
  org: "example-org",
  title: "example-title",
  location: "example-city",
  start: "2020-01",
  end: "2024-06",
  tags: TAGS,
  streams: ["stream-two"],
  bullets: BULLETS,
};

const PROJECT: Project = {
  id: "example-project-one",
  name: "example-project",
  dates: "2024-10..2026-03",
  tags: TAGS,
  streams: ["stream-two"],
  bullets: BULLETS,
};

const EDUCATION: Education = {
  id: "example-entry-two",
  school: "example-school",
  location: "example-city",
  credential: "example-credential",
  start: 2021,
  end: 2025,
  tags: TAGS,
  streams: ["stream-two"],
  courses: BULLETS,
};

const SUMMARY: SummaryVariant = {
  id: "example-summary-one",
  tags: [],
  streams: ["stream-two"],
  text: "Example summary one.",
};

const SUMMARIES: SummaryVariant[] = [
  SUMMARY,
  {
    id: "example-summary-two",
    tags: [],
    streams: ["stream-one"],
    text: "Example summary two.",
  },
  {
    id: "example-summary-three",
    tags: [],
    streams: ["stream-two"],
    text: "Example summary three.",
  },
];

describe("experienceToEntries", () => {
  it("uses the title as the entry title", () => {
    const [entry] = experienceToEntries([EXPERIENCE], LOOKUP);

    expect(entry?.title).toBe(EXPERIENCE.title);
  });

  it("uses the org as the entry subtitle", () => {
    const [entry] = experienceToEntries([EXPERIENCE], LOOKUP);

    expect(entry?.subtitle).toBe(EXPERIENCE.org);
  });

  it("puts the start and end dates in the meta", () => {
    const [entry] = experienceToEntries([EXPERIENCE], LOOKUP);

    expect(entry?.meta).toContain(String(EXPERIENCE.start));
    expect(entry?.meta).toContain(String(EXPERIENCE.end));
  });

  it("puts the location in the meta", () => {
    const [entry] = experienceToEntries([EXPERIENCE], LOOKUP);

    expect(entry?.meta).toContain(EXPERIENCE.location);
  });

  it("maps bullets to their text and streams", () => {
    const [entry] = experienceToEntries([EXPERIENCE], LOOKUP);

    expect(entry?.bullets).toEqual(BULLET_ITEMS);
  });

  it("keeps experience entry and bullet streams in source order", () => {
    const [entry] = experienceToEntries(
      [{ ...EXPERIENCE, streams: ["stream-two"], bullets: MIXED_BULLETS }],
      LOOKUP,
    );

    expect(entry?.streams).toEqual(["stream-two"]);
    expect(entry?.bullets).toEqual(MIXED_BULLET_ITEMS);
  });
});

describe("projectsToEntries", () => {
  it("uses the project name as the entry title", () => {
    const [entry] = projectsToEntries([PROJECT], LOOKUP);

    expect(entry?.title).toBe(PROJECT.name);
  });

  it("keeps the date range in the meta unchanged", () => {
    const [entry] = projectsToEntries([PROJECT], LOOKUP);

    expect(entry?.meta).toContain(PROJECT.dates);
  });

  it("keeps project entry and bullet streams in source order", () => {
    const [entry] = projectsToEntries(
      [{ ...PROJECT, streams: ["stream-two"], bullets: MIXED_BULLETS }],
      LOOKUP,
    );

    expect(entry?.streams).toEqual(["stream-two"]);
    expect(entry?.bullets).toEqual(MIXED_BULLET_ITEMS);
  });
});

describe("educationToEntries", () => {
  it("uses the credential as the entry title", () => {
    const [entry] = educationToEntries([EDUCATION], LOOKUP);

    expect(entry?.title).toBe(EDUCATION.credential);
  });

  it("uses the school as the entry subtitle", () => {
    const [entry] = educationToEntries([EDUCATION], LOOKUP);

    expect(entry?.subtitle).toBe(EDUCATION.school);
  });

  it("stringifies numeric years into the meta", () => {
    const [entry] = educationToEntries([EDUCATION], LOOKUP);

    expect(typeof entry?.meta).toBe("string");
    expect(entry?.meta).toContain(String(EDUCATION.start));
    expect(entry?.meta).toContain(String(EDUCATION.end));
  });

  it("puts the location in the meta", () => {
    const [entry] = educationToEntries([EDUCATION], LOOKUP);

    expect(entry?.meta).toContain(EDUCATION.location);
  });

  it("maps course texts to bullets", () => {
    const [entry] = educationToEntries([EDUCATION], LOOKUP);

    expect(entry?.bullets).toEqual(BULLET_ITEMS);
  });

  it("keeps education entry and course streams in source order", () => {
    const [entry] = educationToEntries(
      [{ ...EDUCATION, streams: ["stream-one"], courses: MIXED_BULLETS }],
      LOOKUP,
    );

    expect(entry?.streams).toEqual(["stream-one"]);
    expect(entry?.bullets).toEqual(MIXED_BULLET_ITEMS);
  });
});

describe("stream mapping", () => {
  it("keeps streams in their supplied order", () => {
    const [entry] = experienceToEntries(
      [{ ...EXPERIENCE, streams: ["stream-two", "stream-three"] }],
      LOOKUP,
    );

    expect(entry?.streams).toEqual(["stream-two", "stream-three"]);
  });

  it("throws when a stream value is unknown", () => {
    expect(() =>
      experienceToEntries([{ ...EXPERIENCE, streams: ["nope"] }], LOOKUP),
    ).toThrow(/Unknown stream "nope"/);
  });
});

describe("summariesToVariants", () => {
  it("preserves each record's id, text, and canonical streams", () => {
    expect(summariesToVariants([SUMMARY], LOOKUP)).toEqual([
      {
        id: "example-summary-one",
        text: "Example summary one.",
        streams: ["stream-two"],
      },
    ]);
  });

  it("preserves summary ids in source order across multiple records", () => {
    const variants = summariesToVariants(SUMMARIES, LOOKUP);

    expect(variants.map((variant) => variant.id)).toEqual(
      SUMMARIES.map((record) => record.id),
    );
    expect(variants).toHaveLength(SUMMARIES.length);
  });

  it("names the stream and record id when a summary stream is unknown", () => {
    expect(() =>
      summariesToVariants([{ ...SUMMARY, streams: ["nope"] }], LOOKUP),
    ).toThrow(/Unknown stream "nope"\. on record "example-summary-one"\./);
  });
});

describe("entry pass-through", () => {
  it("preserves the supplied entry order", () => {
    const records: Experience[] = [
      { ...EXPERIENCE, id: "zzz", title: "Zeta Title" },
      { ...EXPERIENCE, id: "aaa", title: "Alpha Title" },
    ];

    const entries = experienceToEntries(records, LOOKUP);

    expect(entries.map((entry) => entry.id)).toEqual(
      records.map((record) => record.id),
    );
  });

  it("passes tags through unchanged", () => {
    const [entry] = experienceToEntries([EXPERIENCE], LOOKUP);

    expect(entry?.tags).toEqual(TAGS);
  });
});
