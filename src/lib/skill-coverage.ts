import { assertSkillCardCoverage } from "@/lib/skill-cards";
import type { SkillGroup } from "@/lib/skills-schema";
import { assertKnownSkillGroups, technicalSkillItems } from "@/lib/skills";

export function assertSkillCatalogCoverage(
  groups: readonly SkillGroup[],
): void {
  assertKnownSkillGroups(groups);
  assertSkillCardCoverage(technicalSkillItems(groups));
}
