export const SKILL_GROUP_ORDER = [
  "languages",
  "tools",
  "frameworks",
  "cloud",
  "deployment",
  "values",
] as const;

const KNOWN_RANK = new Map<string, number>(
  SKILL_GROUP_ORDER.map((id, index): [string, number] => [id, index]),
);

function rankOf(id: string): number {
  return KNOWN_RANK.get(id) ?? SKILL_GROUP_ORDER.length;
}

export function sortSkillGroups<T extends { id: string }>(
  groups: readonly T[],
): T[] {
  return [...groups].sort((left, right) => {
    const byRank = rankOf(left.id) - rankOf(right.id);

    if (byRank !== 0) {
      return byRank;
    }

    return left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
  });
}

export function formatSkillItems(items: readonly string[]): string {
  return items.join(", ");
}
