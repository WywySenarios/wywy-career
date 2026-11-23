import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveHost } from "@/lib/link-icons";

const LINK_ICON_DIR = path.resolve(
  import.meta.dirname,
  "../../src/assets/link-icons",
);

const EXAMPLE_HOSTS = { "example.com": "example-icon" } as const;

describe("resolveHost", () => {
  it("resolves a mapped host", () => {
    expect(resolveHost(EXAMPLE_HOSTS, "https://example.com/profile")).toBe(
      "example-icon",
    );
  });

  it.each([
    "https://www.example.com/profile",
    "https://Example.COM/profile?x=1#y",
    "https://example.com:443/profile",
    "https://example.com./profile",
  ])("normalizes the host in %s", (url) => {
    expect(resolveHost(EXAMPLE_HOSTS, url)).toBe("example-icon");
  });

  it.each([
    "https://example.org/profile",
    "https://example.com.example.org/profile",
    "https://example.com.evil.example/profile",
    "https://notexample.com/profile",
    "not a url",
    "",
    "javascript:alert(1)",
    "https://toString/",
    "https://__proto__/",
  ])("returns undefined for unmapped input %s", (url) => {
    expect(resolveHost(EXAMPLE_HOSTS, url)).toBeUndefined();
  });
});

describe("vendored link icons", () => {
  it("contains only safe SVG assets", () => {
    const files = readdirSync(LINK_ICON_DIR).filter((file) =>
      file.endsWith(".svg"),
    );

    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const svg = readFileSync(path.join(LINK_ICON_DIR, file), "utf8");

      expect(svg.startsWith("<svg") && !svg.includes("<script")).toBe(true);
    }
  });
});
