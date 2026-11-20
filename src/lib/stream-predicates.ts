export function isVisible(
  streams: readonly string[],
  activeStream: string,
): boolean {
  return streams.includes(activeStream);
}

export function hasVisibleAtom(
  atomStreamLists: readonly (readonly string[])[],
  activeStream: string,
): boolean {
  return atomStreamLists.some((streams) => isVisible(streams, activeStream));
}
