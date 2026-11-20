import argocdIcon from "@/assets/skill-icons/argocd-original.svg?url&no-inline";
import astroIcon from "@/assets/skill-icons/astro-original.svg?url&no-inline";
import bashIcon from "@/assets/skill-icons/bash-original.svg?url&no-inline";
import cIcon from "@/assets/skill-icons/c-original.svg?url&no-inline";
import cloudflareWorkersIcon from "@/assets/skill-icons/cloudflareworkers-original.svg?url&no-inline";
import cppIcon from "@/assets/skill-icons/cplusplus-original.svg?url&no-inline";
import djangoIcon from "@/assets/skill-icons/django-plain.svg?url&no-inline";
import dockerIcon from "@/assets/skill-icons/docker-original.svg?url&no-inline";
import emptyIcon from "@/assets/skill-icons/empty.svg?url&no-inline";
import gitIcon from "@/assets/skill-icons/git-original.svg?url&no-inline";
import goIcon from "@/assets/skill-icons/go-original.svg?url&no-inline";
import grafanaIcon from "@/assets/skill-icons/grafana-original.svg?url&no-inline";
import javaIcon from "@/assets/skill-icons/java-original.svg?url&no-inline";
import javascriptIcon from "@/assets/skill-icons/javascript-original.svg?url&no-inline";
import kubernetesIcon from "@/assets/skill-icons/kubernetes-original.svg?url&no-inline";
import postgresqlIcon from "@/assets/skill-icons/postgresql-original.svg?url&no-inline";
import prometheusIcon from "@/assets/skill-icons/prometheus-original.svg?url&no-inline";
import proxmoxIcon from "@/assets/skill-icons/proxmox-original.svg?url&no-inline";
import pythonIcon from "@/assets/skill-icons/python-original.svg?url&no-inline";
import rIcon from "@/assets/skill-icons/r-original.svg?url&no-inline";
import reactIcon from "@/assets/skill-icons/react-original.svg?url&no-inline";
import sqliteIcon from "@/assets/skill-icons/sqlite-original.svg?url&no-inline";
import typescriptIcon from "@/assets/skill-icons/typescript-original.svg?url&no-inline";

export const SKILL_CARDS: Readonly<Record<string, { icon: string }>> = {
  C: { icon: cIcon },
  "C++": { icon: cppIcon },
  TypeScript: { icon: typescriptIcon },
  JavaScript: { icon: javascriptIcon },
  Python: { icon: pythonIcon },
  Go: { icon: goIcon },
  Java: { icon: javaIcon },
  Bash: { icon: bashIcon },
  R: { icon: rIcon },
  Git: { icon: gitIcon },
  React: { icon: reactIcon },
  Astro: { icon: astroIcon },
  Django: { icon: djangoIcon },
  Kubernetes: { icon: kubernetesIcon },
  "Argo CD": { icon: argocdIcon },
  Prometheus: { icon: prometheusIcon },
  Grafana: { icon: grafanaIcon },
  "Cloudflare Workers": { icon: cloudflareWorkersIcon },
  PostgreSQL: { icon: postgresqlIcon },
  SQLite: { icon: sqliteIcon },
  Docker: { icon: dockerIcon },
  "Proxmox VE": { icon: proxmoxIcon },
};

export const EMPTY_SKILL_ICON = emptyIcon;

export function skillCardIcon(name: string): string {
  return Object.hasOwn(SKILL_CARDS, name)
    ? SKILL_CARDS[name].icon
    : EMPTY_SKILL_ICON;
}

export const TEXT_ONLY_SKILLS: ReadonlySet<string> = new Set([
  "SQL",
  "GDB",
  "Valgrind",
  "pthreads",
  "make",
  "pre-commit",
  "Kustomize",
  "KEDA",
  "Linkerd",
  "Longhorn",
  "Loki",
  "SOPS",
  "PostGIS",
  "Docker Compose",
  "systemd",
  "Cloudflare Tunnel",
  "Ansible",
  "Terraform",
  "Jenkins",
]);

function isDeclaredSkill(name: string): boolean {
  return Object.hasOwn(SKILL_CARDS, name) || TEXT_ONLY_SKILLS.has(name);
}

export function assertSkillCardCoverage(items: readonly string[]): void {
  const undeclaredNames = [
    ...new Set(items.filter((name) => !isDeclaredSkill(name))),
  ];

  if (undeclaredNames.length === 0) {
    return;
  }

  throw new Error(
    `Skills without a card or text-only declaration: ${undeclaredNames.join(", ")}.`,
  );
}
