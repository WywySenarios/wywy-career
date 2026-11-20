import { z } from "astro/zod";
import { nonBlank } from "@/lib/schema-helpers";

export const streamCatalogEntrySchema = z.strictObject({
  id: nonBlank,
  label: nonBlank,
  aliases: z.array(nonBlank),
  order: z.number().int().nonnegative(),
});

export type StreamCatalogEntry = z.infer<typeof streamCatalogEntrySchema>;
