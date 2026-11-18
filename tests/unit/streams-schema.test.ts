import { describe, expect, it } from "vitest";
import { streamCatalogEntrySchema } from "@/lib/streams-schema";

const ENTRY = {
  id: "stream-two",
  label: "Stream Two",
  aliases: ["alias-two"],
  order: 0,
};

function without(
  record: Record<string, unknown>,
  key: string,
): Record<string, unknown> {
  const copy = { ...record };
  delete copy[key];
  return copy;
}

describe("streamCatalogEntrySchema", () => {
  it("rejects an entry without an order", () => {
    const result = streamCatalogEntrySchema.safeParse(without(ENTRY, "order"));

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues.some((issue) => issue.path[0] === "order")).toBe(
      true,
    );
  });

  it("rejects an entry with a negative order", () => {
    const result = streamCatalogEntrySchema.safeParse({
      ...ENTRY,
      order: -1,
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues.some((issue) => issue.path[0] === "order")).toBe(
      true,
    );
  });
});
