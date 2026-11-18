import { describe, expect, it } from "vitest";
import {
  bulletSchema,
  contactSchema,
  educationSchema,
  experienceSchema,
  projectSchema,
  summaryVariantSchema,
} from "@/lib/cv-schemas";

const BULLET = {
  id: "example-bullet-one",
  tags: [],
  streams: ["stream-two"],
  text: "Example bullet one.",
};

const CONTACT = {
  name: "example-name",
  phone: "example-phone",
  email: "example-email",
  links: [{ label: "example-link", url: "https://example-link.example" }],
};

const SUMMARY_VARIANT = {
  id: "example-summary-one",
  tags: [],
  streams: ["stream-two"],
  text: "Example summary one.",
};

const EXPERIENCE = {
  id: "example-entry-one",
  org: "example-org",
  title: "example-title",
  location: "example-city",
  start: "2020-01",
  end: "2024-06",
  tags: [],
  streams: ["stream-two"],
  bullets: [BULLET],
};

const PROJECT = {
  id: "example-project-one",
  name: "example-project",
  dates: "2024-10..2026-03",
  tags: [],
  streams: ["stream-two"],
  bullets: [BULLET],
};

const EDUCATION = {
  id: "example-entry-two",
  school: "example-school",
  location: "example-city",
  credential: "example-credential",
  start: 2021,
  end: 2025,
  tags: [],
  streams: ["stream-two"],
  courses: [BULLET],
};

function without(
  record: Record<string, unknown>,
  key: string,
): Record<string, unknown> {
  const copy = { ...record };
  delete copy[key];
  return copy;
}

describe("contactSchema", () => {
  it("rejects a contact missing name", () => {
    expect(contactSchema.safeParse(without(CONTACT, "name")).success).toBe(
      false,
    );
  });

  it("rejects an unknown key", () => {
    expect(
      contactSchema.safeParse({ ...CONTACT, unexpected: true }).success,
    ).toBe(false);
  });
});

describe("summaryVariantSchema", () => {
  it("rejects a summary variant missing text", () => {
    expect(
      summaryVariantSchema.safeParse(without(SUMMARY_VARIANT, "text")).success,
    ).toBe(false);
  });

  it("rejects an unknown key", () => {
    expect(
      summaryVariantSchema.safeParse({ ...SUMMARY_VARIANT, unexpected: true })
        .success,
    ).toBe(false);
  });
});

describe("experienceSchema", () => {
  it("rejects an experience entry missing org", () => {
    expect(experienceSchema.safeParse(without(EXPERIENCE, "org")).success).toBe(
      false,
    );
  });

  it("accepts a string start", () => {
    expect(
      experienceSchema.safeParse({ ...EXPERIENCE, start: "2026-05" }).success,
    ).toBe(true);
  });

  it("rejects a boolean start", () => {
    expect(
      experienceSchema.safeParse({ ...EXPERIENCE, start: true }).success,
    ).toBe(false);
  });

  it("rejects an unknown key", () => {
    expect(
      experienceSchema.safeParse({ ...EXPERIENCE, unexpected: true }).success,
    ).toBe(false);
  });

  it("rejects a record without streams", () => {
    expect(
      experienceSchema.safeParse(without(EXPERIENCE, "streams")).success,
    ).toBe(false);
  });

  it("rejects an empty streams list", () => {
    expect(
      experienceSchema.safeParse({ ...EXPERIENCE, streams: [] }).success,
    ).toBe(false);
  });
});

describe("projectSchema", () => {
  it("rejects a project missing name", () => {
    expect(projectSchema.safeParse(without(PROJECT, "name")).success).toBe(
      false,
    );
  });

  it("rejects an unknown key", () => {
    expect(
      projectSchema.safeParse({ ...PROJECT, unexpected: true }).success,
    ).toBe(false);
  });
});

describe("educationSchema", () => {
  it("rejects an education entry missing school", () => {
    expect(
      educationSchema.safeParse(without(EDUCATION, "school")).success,
    ).toBe(false);
  });

  it("accepts a numeric start", () => {
    expect(
      educationSchema.safeParse({ ...EDUCATION, start: 2021 }).success,
    ).toBe(true);
  });

  it("rejects a boolean start", () => {
    expect(
      educationSchema.safeParse({ ...EDUCATION, start: true }).success,
    ).toBe(false);
  });

  it("rejects an unknown key", () => {
    expect(
      educationSchema.safeParse({ ...EDUCATION, unexpected: true }).success,
    ).toBe(false);
  });
});

describe("bulletSchema", () => {
  it("parses a bullet with its values intact", () => {
    expect(bulletSchema.safeParse(BULLET).success).toBe(true);
  });

  it("defaults omitted tags to an empty array", () => {
    const parsed = bulletSchema.parse(without(BULLET, "tags"));

    expect((parsed as { tags?: string[] }).tags).toEqual([]);
  });
});
