import { z } from "astro/zod";

const nonBlank = z.string().trim().min(1);

export const streamCatalogEntrySchema = z.strictObject({
  id: nonBlank,
  label: nonBlank,
  aliases: z.array(nonBlank),
  order: z.number().int().nonnegative(),
});

export type StreamCatalogEntry = z.infer<typeof streamCatalogEntrySchema>;
