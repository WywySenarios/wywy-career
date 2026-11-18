import { z } from "astro/zod";

export const dateish = z.union([z.string(), z.number()]);

export type Dateish = z.infer<typeof dateish>;

// A record belongs to one or more career streams; the alias catalog is checked after parsing.
const streamList = z.array(z.string()).min(1);

export const bulletSchema = z.strictObject({
  id: z.string(),
  tags: z.array(z.string()).default([]),
  streams: streamList,
  text: z.string(),
});

export type Bullet = z.infer<typeof bulletSchema>;

export const contactSchema = z.strictObject({
  name: z.string(),
  phone: z.string(),
  email: z.string(),
  links: z.array(
    z.strictObject({
      label: z.string(),
      url: z.string(),
    }),
  ),
});

export type Contact = z.infer<typeof contactSchema>;

export const summaryVariantSchema = z.strictObject({
  id: z.string(),
  tags: z.array(z.string()).default([]),
  streams: streamList,
  text: z.string(),
});

export type SummaryVariant = z.infer<typeof summaryVariantSchema>;

export const experienceSchema = z.strictObject({
  id: z.string(),
  org: z.string(),
  title: z.string(),
  location: z.string(),
  start: dateish,
  end: dateish,
  tags: z.array(z.string()).default([]),
  streams: streamList,
  bullets: z.array(bulletSchema),
});

export type Experience = z.infer<typeof experienceSchema>;

export const projectSchema = z.strictObject({
  id: z.string(),
  name: z.string(),
  dates: dateish,
  tags: z.array(z.string()).default([]),
  streams: streamList,
  bullets: z.array(bulletSchema),
});

export type Project = z.infer<typeof projectSchema>;

export const educationSchema = z.strictObject({
  id: z.string(),
  school: z.string(),
  location: z.string(),
  credential: z.string(),
  start: dateish,
  end: dateish,
  tags: z.array(z.string()).default([]),
  streams: streamList,
  courses: z.array(bulletSchema),
});

export type Education = z.infer<typeof educationSchema>;
