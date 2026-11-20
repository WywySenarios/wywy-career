import { z } from "astro/zod";

export const nonBlank = z.string().trim().min(1);
