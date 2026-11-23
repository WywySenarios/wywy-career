import githubIcon from "@/assets/link-icons/github-original.svg?url&no-inline";

export const LINK_ICON_IDS = ["github"] as const;

export type LinkIconId = (typeof LINK_ICON_IDS)[number];

export const LINK_ICONS: Readonly<Record<LinkIconId, string>> = {
  github: githubIcon,
};

const LINK_ICON_HOSTS: Readonly<Record<string, LinkIconId>> = {
  "github.com": "github",
};

function lookup<T>(
  map: Readonly<Record<string, T>>,
  key: string,
): T | undefined {
  return Object.hasOwn(map, key) ? map[key] : undefined;
}

function normalizeHostname(hostname: string): string {
  let normalized = hostname.toLowerCase();

  if (normalized.startsWith("www.")) {
    normalized = normalized.slice(4);
  }

  if (normalized.endsWith(".")) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

function hostnameOf(url: string): string | undefined {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }

  if (parsed.hostname === "") {
    return undefined;
  }

  return normalizeHostname(parsed.hostname);
}

export function resolveHost<T>(
  hosts: Readonly<Record<string, T>>,
  url: string,
): T | undefined {
  const hostname = hostnameOf(url);

  return hostname === undefined ? undefined : lookup(hosts, hostname);
}

export function linkIconId(url: string): LinkIconId | undefined {
  return resolveHost(LINK_ICON_HOSTS, url);
}

export function linkIcon(url: string): string | undefined {
  const id = linkIconId(url);

  return id === undefined ? undefined : lookup(LINK_ICONS, id);
}
