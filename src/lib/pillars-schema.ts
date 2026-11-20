import { z } from "astro/zod";
import { nonBlank } from "@/lib/schema-helpers";

export const pillarSchema = z.strictObject({
  id: nonBlank,
  label: nonBlank,
  sentence: nonBlank,
  order: z.number().int().nonnegative(),
  streams: z.array(nonBlank).min(1),
});

export type Pillar = z.infer<typeof pillarSchema>;
