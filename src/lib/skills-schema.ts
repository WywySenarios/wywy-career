import { z } from "astro/zod";

const trimmedIdentity = z.string().trim().min(1);
const nonBlankText = z.string().regex(/\S/);

export const skillGroupSchema = z.strictObject({
  id: trimmedIdentity,
  label: trimmedIdentity,
  tags: z.array(z.string()).default([]),
  items: z.array(nonBlankText).nonempty(),
});

export type SkillGroup = z.infer<typeof skillGroupSchema>;
