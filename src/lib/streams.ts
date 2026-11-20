import yaml from "js-yaml";
import type { StreamCatalogEntry } from "@/lib/streams-schema";

export function parseStreamCatalog(text: string): StreamCatalogEntry[] {
  const parsed = yaml.load(text);

  if (!Array.isArray(parsed)) {
    throw new Error("Stream catalog must contain a YAML sequence.");
  }

  // type assertion: js-yaml returns unknown; streamCatalogEntrySchema validates each entry.
  const entries = parsed as Omit<StreamCatalogEntry, "order">[];

  return entries.map((entry, order) => ({ ...entry, order }));
}

export type StreamBearers = {
  id: string;
  streams: readonly string[];
};

export type StreamContainer = StreamBearers & {
  bullets?: readonly StreamBearers[];
  courses?: readonly StreamBearers[];
};

type StreamCatalog = readonly {
  id: string;
}[];

export function buildLookup(catalog: StreamCatalog): Map<string, string> {
  return new Map(catalog.map((stream) => [stream.id, stream.id]));
}

export function canonicalizeStreams(
  values: readonly string[],
  lookup: ReadonlyMap<string, string>,
): string[] {
  return values.map((value) => {
    const canonical = lookup.get(value);

    if (canonical === undefined) {
      throw new Error(`Unknown stream "${value}".`);
    }

    return canonical;
  });
}

export function canonicalizeRecordStreams(
  record: StreamBearers,
  lookup: ReadonlyMap<string, string>,
): string[] {
  try {
    return canonicalizeStreams(record.streams, lookup);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${message} on record "${record.id}".`);
  }
}

type OrderedEntry = {
  id: string;
  order: number;
};

export function defaultStreamId(catalog: readonly OrderedEntry[]): string {
  let lowest: OrderedEntry | undefined;

  for (const entry of catalog) {
    if (lowest === undefined || entry.order < lowest.order) {
      lowest = entry;
    }
  }

  if (lowest === undefined) {
    throw new Error("The stream catalog is empty.");
  }

  return lowest.id;
}

export function sortCatalogByOrder<T extends OrderedEntry>(
  catalog: readonly T[],
): T[] {
  return [...catalog].sort((a, b) => a.order - b.order);
}

export type StreamRouteParam = {
  params: { stream: string };
};

export function streamRouteParams(
  catalog: readonly OrderedEntry[],
): StreamRouteParam[] {
  return sortCatalogByOrder(catalog).map(({ id }) => ({
    params: { stream: id },
  }));
}

export function resolveActiveStream(
  requested: string | undefined,
  catalog: readonly OrderedEntry[],
): string {
  if (requested === undefined) {
    return defaultStreamId(catalog);
  }

  const canonical = catalog.find((entry) => entry.id === requested)?.id;

  if (canonical === undefined) {
    throw new Error(`Unknown stream "${requested}".`);
  }

  return canonical;
}

export function streamPageTitle(name: string, label: string): string {
  return `${name} — ${label}`;
}

function recordsOf(container: StreamContainer): StreamBearers[] {
  return [
    container,
    ...(container.bullets ?? []),
    ...(container.courses ?? []),
  ];
}

export function assertKnownStreams(
  containers: readonly StreamContainer[],
  catalog: StreamCatalog,
  lookup: ReadonlyMap<string, string> = buildLookup(catalog),
): void {
  for (const container of containers) {
    for (const record of recordsOf(container)) {
      canonicalizeRecordStreams(record, lookup);
    }
  }
}
