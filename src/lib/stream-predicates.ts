export function isVisible(
  streams: readonly string[],
  activeStream: string,
): boolean {
  return streams.includes(activeStream);
}

export function parseStreamValues(wire: string): string[] {
  if (wire === "") {
    return [];
  }

  return wire.split(",").map((value) => value.trim());
}

export function hasVisibleAtom(
  atomStreamLists: readonly (readonly string[])[],
  activeStream: string,
): boolean {
  return atomStreamLists.some((streams) => isVisible(streams, activeStream));
}

export function activeStreamFromHash(
  hash: string,
  knownIds: readonly string[],
  defaultId: string,
): string {
  const candidate = hash.startsWith("#") ? hash.slice(1) : hash;

  return knownIds.includes(candidate) ? candidate : defaultId;
}
