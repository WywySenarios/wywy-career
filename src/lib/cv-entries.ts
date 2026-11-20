import type {
  Dateish,
  Education,
  Experience,
  Project,
  SummaryVariant,
} from "@/lib/cv-schemas";
import { canonicalizeRecordStreams, canonicalizeStreams } from "@/lib/streams";

export type CvBullet = {
  text: string;
  streams: string[];
};

export type CvEntry = {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  tags?: string[];
  streams: string[];
  bullets: CvBullet[];
};

type SummaryEntry = {
  id: string;
  text: string;
  streams: string[];
};

type StreamLookup = ReadonlyMap<string, string>;

function dateRangeMeta(start: Dateish, end: Dateish, location: string): string {
  return [String(start), String(end), location].join(" - ");
}

function mapTextStreams(
  records: readonly { text: string; streams: readonly string[] }[],
  lookup: StreamLookup,
): CvBullet[] {
  return records.map((record) => ({
    text: record.text,
    streams: canonicalizeStreams(record.streams, lookup),
  }));
}

export function experienceToEntries(
  entries: Experience[],
  lookup: StreamLookup,
): CvEntry[] {
  return entries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    subtitle: entry.org,
    meta: dateRangeMeta(entry.start, entry.end, entry.location),
    tags: entry.tags,
    streams: canonicalizeStreams(entry.streams, lookup),
    bullets: mapTextStreams(entry.bullets, lookup),
  }));
}

export function projectsToEntries(
  entries: Project[],
  lookup: StreamLookup,
): CvEntry[] {
  return entries.map((entry) => ({
    id: entry.id,
    title: entry.name,
    meta: String(entry.dates),
    tags: entry.tags,
    streams: canonicalizeStreams(entry.streams, lookup),
    bullets: mapTextStreams(entry.bullets, lookup),
  }));
}

export function educationToEntries(
  entries: Education[],
  lookup: StreamLookup,
): CvEntry[] {
  return entries.map((entry) => ({
    id: entry.id,
    title: entry.credential,
    subtitle: entry.school,
    meta: dateRangeMeta(entry.start, entry.end, entry.location),
    tags: entry.tags,
    streams: canonicalizeStreams(entry.streams, lookup),
    bullets: mapTextStreams(entry.courses, lookup),
  }));
}

export function summariesToVariants(
  records: readonly SummaryVariant[],
  lookup: StreamLookup,
): SummaryEntry[] {
  return records.map((record) => ({
    id: record.id,
    text: record.text,
    streams: canonicalizeRecordStreams(record, lookup),
  }));
}
