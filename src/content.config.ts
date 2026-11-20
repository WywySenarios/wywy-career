import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import yaml from "js-yaml";
import { CV_SOURCES } from "./lib/constants";
import {
  contactSchema,
  educationSchema,
  experienceSchema,
  projectSchema,
  summaryVariantSchema,
} from "./lib/cv-schemas";
import { pillarSchema } from "./lib/pillars-schema";
import { skillGroupSchema } from "./lib/skills-schema";
import { streamCatalogEntrySchema } from "./lib/streams-schema";
import { parseStreamCatalog } from "./lib/streams";

// file() treats every top-level key of a mapping as a separate entry.
// Compress those top-level keys into a single record.
function parseContact(text: string): Record<string, Record<string, unknown>> {
  const parsed = yaml.load(text, { filename: CV_SOURCES.contact });

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error(`${CV_SOURCES.contact} must contain a YAML mapping.`);
  }

  return { contact: parsed as Record<string, unknown> };
}

export const collections = {
  skills: defineCollection({
    loader: file(CV_SOURCES.skills),
    schema: skillGroupSchema,
  }),
  contact: defineCollection({
    loader: file(CV_SOURCES.contact, { parser: parseContact }),
    schema: contactSchema,
  }),
  summaryVariants: defineCollection({
    loader: file(CV_SOURCES.summaryVariants),
    schema: summaryVariantSchema,
  }),
  experience: defineCollection({
    loader: file(CV_SOURCES.experience),
    schema: experienceSchema,
  }),
  projects: defineCollection({
    loader: file(CV_SOURCES.projects),
    schema: projectSchema,
  }),
  education: defineCollection({
    loader: file(CV_SOURCES.education),
    schema: educationSchema,
  }),
  streams: defineCollection({
    loader: file(CV_SOURCES.streams, { parser: parseStreamCatalog }),
    schema: streamCatalogEntrySchema,
  }),
  pillars: defineCollection({
    loader: file(CV_SOURCES.pillars),
    schema: pillarSchema,
  }),
};
