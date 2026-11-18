import { describe, expect, it } from "vitest";
import type { SkillGroup } from "@/lib/skills-schema";
import { skillGroupSchema } from "@/lib/skills-schema";

const validGroup = {
  id: "example-group-one",
  label: "Example Group One",
  tags: ["example-tag-one"],
  items: ["example-item-one", "example-item-two"],
} satisfies SkillGroup;

describe("skillGroupSchema", () => {
  it("parses a well-formed group with its values intact", () => {
    expect(skillGroupSchema.parse(validGroup)).toEqual(validGroup);
  });

  it("defaults omitted tags to an empty array", () => {
    const parsed = skillGroupSchema.parse({
      id: validGroup.id,
      label: validGroup.label,
      items: ["example-item-one"],
    });

    expect(parsed.tags).toEqual([]);
  });

  describe("required fields", () => {
    it("rejects a group missing id", () => {
      // Record<string, unknown> keeps the fixture type-checked while allowing a required key to be absent.
      const group: Record<string, unknown> = {
        label: validGroup.label,
        tags: validGroup.tags,
        items: validGroup.items,
      };

      expect(skillGroupSchema.safeParse(group).success).toBe(false);
    });

    it("rejects a group missing label", () => {
      const group: Record<string, unknown> = {
        id: validGroup.id,
        tags: validGroup.tags,
        items: validGroup.items,
      };

      expect(skillGroupSchema.safeParse(group).success).toBe(false);
    });

    it("rejects a group missing items", () => {
      const group: Record<string, unknown> = {
        id: validGroup.id,
        label: validGroup.label,
        tags: validGroup.tags,
      };

      expect(skillGroupSchema.safeParse(group).success).toBe(false);
    });
  });

  describe("identity strings", () => {
    it("rejects an empty id", () => {
      expect(
        skillGroupSchema.safeParse({
          id: "",
          label: validGroup.label,
          tags: validGroup.tags,
          items: validGroup.items,
        }).success,
      ).toBe(false);
    });

    it("rejects an empty label", () => {
      expect(
        skillGroupSchema.safeParse({
          id: validGroup.id,
          label: "",
          tags: validGroup.tags,
          items: validGroup.items,
        }).success,
      ).toBe(false);
    });

    it("rejects a whitespace-only id", () => {
      expect(
        skillGroupSchema.safeParse({
          id: "   ",
          label: validGroup.label,
          tags: validGroup.tags,
          items: validGroup.items,
        }).success,
      ).toBe(false);
    });

    it("rejects a whitespace-only label", () => {
      expect(
        skillGroupSchema.safeParse({
          id: validGroup.id,
          label: "  ",
          tags: validGroup.tags,
          items: validGroup.items,
        }).success,
      ).toBe(false);
    });
  });

  describe("items", () => {
    it("rejects an empty items array", () => {
      expect(
        skillGroupSchema.safeParse({
          id: validGroup.id,
          label: validGroup.label,
          tags: validGroup.tags,
          items: [],
        }).success,
      ).toBe(false);
    });

    it("rejects a non-string item", () => {
      expect(
        skillGroupSchema.safeParse({
          id: validGroup.id,
          label: validGroup.label,
          tags: validGroup.tags,
          items: ["example-item-one", 3],
        }).success,
      ).toBe(false);
    });

    it("rejects an empty string item", () => {
      expect(
        skillGroupSchema.safeParse({
          id: validGroup.id,
          label: validGroup.label,
          tags: validGroup.tags,
          items: [""],
        }).success,
      ).toBe(false);
    });

    it("rejects a whitespace-only item", () => {
      expect(
        skillGroupSchema.safeParse({
          id: validGroup.id,
          label: validGroup.label,
          tags: validGroup.tags,
          items: ["   "],
        }).success,
      ).toBe(false);
    });

    it("preserves whitespace inside a valid item", () => {
      const parsed = skillGroupSchema.parse({
        id: validGroup.id,
        label: validGroup.label,
        tags: validGroup.tags,
        items: [" C "],
      });

      expect(parsed.items).toEqual([" C "]);
    });
  });

  it("rejects unknown keys instead of silently dropping them", () => {
    expect(
      skillGroupSchema.safeParse({ ...validGroup, unexpected: true }).success,
    ).toBe(false);
  });
});
