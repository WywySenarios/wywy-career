import { isVisible, parseStreamValues } from "@/lib/stream-predicates";

export function applyStreamFilter(
  root: ParentNode,
  activeStream: string,
): void {
  for (const element of root.querySelectorAll<HTMLElement>("[data-streams]")) {
    const streams = parseStreamValues(element.dataset.streams ?? "");

    element.hidden = !isVisible(streams, activeStream);
  }

  // Sections derive their state from atom.hidden, so this pass must follow the atom pass.
  for (const section of root.querySelectorAll<HTMLElement>(
    "[data-stream-section]",
  )) {
    const atoms = section.querySelectorAll<HTMLElement>("[data-stream-atom]");

    if (atoms.length === 0) {
      continue;
    }

    section.hidden = [...atoms].every((atom) => atom.hidden);
  }
}
