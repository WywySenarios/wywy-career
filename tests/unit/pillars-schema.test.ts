import { describe, expect, it } from "vitest";
import { pillarSchema } from "@/lib/pillars-schema";

const PILLAR = {
  id: "embedded-foundations",
  label: "Embedded Foundations",
  sentence: "Ship firmware that talks to real hardware.",
  order: 0,
  streams: ["embedded"],
};

function without(
  record: Record<string, unknown>,
  key: string,
): Record<string, unknown> {
  const copy = { ...record };
  delete copy[key];
  return copy;
}

describe("pillarSchema", () => {
  it("returns a well-formed pillar record unchanged", () => {
    expect(pillarSchema.parse(PILLAR)).toEqual(PILLAR);
  });

  it("rejects records with missing, malformed, or unknown fields", () => {
    const invalid: Array<{ case: string; record: Record<string, unknown> }> = [
      { case: "a missing label", record: without(PILLAR, "label") },
      { case: "a missing order", record: without(PILLAR, "order") },
      { case: "a negative order", record: { ...PILLAR, order: -1 } },
      { case: "a non-integer order", record: { ...PILLAR, order: 1.5 } },
      { case: "a blank sentence", record: { ...PILLAR, sentence: "   " } },
      { case: "an empty streams list", record: { ...PILLAR, streams: [] } },
      { case: "an unknown key", record: { ...PILLAR, extra: "nope" } },
    ];

    for (const { case: label, record } of invalid) {
      const result = pillarSchema.safeParse(record);

      expect(result.success, `${label} should be rejected`).toBe(false);
    }
  });
});
