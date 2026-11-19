export const CARD_SKILL_GROUP_IDS = [
  "languages",
  "systems-tools",
  "ops-tools",
  "frameworks",
  "cloud",
  "observability",
  "cicd",
  "deployment",
  "databases",
] as const;

export const PROSE_SKILL_GROUP_IDS = ["values"] as const;

export const SKILL_GROUP_ORDER = [
  ...CARD_SKILL_GROUP_IDS,
  ...PROSE_SKILL_GROUP_IDS,
] as const;

const CARD_GROUP_ID_SET: ReadonlySet<string> = new Set<string>(
  CARD_SKILL_GROUP_IDS,
);
const PROSE_GROUP_ID_SET: ReadonlySet<string> = new Set<string>(
  PROSE_SKILL_GROUP_IDS,
);

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

export function isCardSkillGroup(id: string): boolean {
  return CARD_GROUP_ID_SET.has(id);
}

export function isProseSkillGroup(id: string): boolean {
  return PROSE_GROUP_ID_SET.has(id);
}

export function technicalSkillItems(
  groups: readonly { id: string; items: readonly string[] }[],
): string[] {
  return groups
    .filter((group) => isCardSkillGroup(group.id))
    .flatMap((group) => group.items);
}

export function assertKnownSkillGroups(
  groups: readonly { id: string }[],
): void {
  const unknownIds = [
    ...new Set(
      groups.map((group) => group.id).filter((id) => !isKnownSkillGroup(id)),
    ),
  ];

  if (unknownIds.length > 0) {
    throw new Error(
      `Unknown skill group ${unknownIds.length === 1 ? "id" : "ids"}: ${unknownIds.join(", ")}.`,
    );
  }
}

function isKnownSkillGroup(id: string): boolean {
  return isCardSkillGroup(id) || isProseSkillGroup(id);
}
