import type { Pillar } from "@/lib/pillars-schema";
import { canonicalizeRecordStreams } from "@/lib/streams";

export type PillarSlide = {
  id: string;
  label: string;
  sentence: string;
  order: number;
  streams: string[];
};

function byOrderThenId(a: PillarSlide, b: PillarSlide): number {
  if (a.order !== b.order) {
    return a.order - b.order;
  }

  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

function toSlide(
  record: Pillar,
  lookup: ReadonlyMap<string, string>,
): PillarSlide {
  const { id, label, sentence, order } = record;
  const streams = canonicalizeRecordStreams(record, lookup);

  return { id, label, sentence, order, streams };
}

export function pillarsToSlides(
  records: readonly Pillar[],
  lookup: ReadonlyMap<string, string>,
): PillarSlide[] {
  return records.map((record) => toSlide(record, lookup)).sort(byOrderThenId);
}
