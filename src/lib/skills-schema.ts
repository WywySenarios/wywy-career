import { z } from "astro/zod";
import { nonBlank } from "@/lib/schema-helpers";

const nonBlankText = z.string().regex(/\S/);

export const skillGroupSchema = z.strictObject({
  id: nonBlank,
  label: nonBlank,
  tags: z.array(z.string()).default([]),
  items: z.array(nonBlankText).nonempty(),
});

export type SkillGroup = z.infer<typeof skillGroupSchema>;
