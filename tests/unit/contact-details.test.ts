import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";
import ContactDetails from "@/components/ContactDetails.astro";

const NAME = "example-name";
const PHONE = "example-phone";
const EMAIL = "example-email";
const LINKS = [
  { label: "example-link-one", url: "https://example-link-one.example" },
  { label: "example-link-two", url: "https://example-link-two.example" },
];
const EMAIL_ANCHOR_COUNT = 1;

type Contact = {
  name: string;
  phone: string;
  email: string;
  links: typeof LINKS;
};

function contact(overrides: Partial<Contact> = {}): Contact {
  return { name: NAME, phone: PHONE, email: EMAIL, links: LINKS, ...overrides };
}

function escaped(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function renderContact(value: Contact): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(ContactDetails, { props: value });
}

describe("ContactDetails", () => {
  it("renders the name as a heading", async () => {
    const html = await renderContact(contact());

    expect(html).toMatch(
      new RegExp(`<h[1-6][^>]*>\\s*${escaped(NAME)}\\s*</h[1-6]>`),
    );
  });

  it("renders the phone as text", async () => {
    const html = await renderContact(contact());

    expect(html).toContain(PHONE);
  });

  it("renders the email as a mailto anchor", async () => {
    const html = await renderContact(contact());

    expect(html).toMatch(new RegExp(`<a[^>]*href="mailto:${escaped(EMAIL)}"`));
  });

  it("renders each profile link as an anchor carrying its url and label", async () => {
    const html = await renderContact(contact());

    for (const { label, url } of LINKS) {
      expect(html).toMatch(
        new RegExp(
          `<a[^>]*href="${escaped(url)}"[^>]*>\\s*${escaped(label)}\\s*</a>`,
        ),
      );
    }
  });

  it("renders exactly one anchor per contact channel", async () => {
    const html = await renderContact(contact());

    expect(html.match(/<a\b/g) ?? []).toHaveLength(
      EMAIL_ANCHOR_COUNT + LINKS.length,
    );
  });

  it("escapes interpolated contact text as HTML", async () => {
    const raw = "A & B";
    const html = await renderContact(contact({ name: raw }));

    expect(html).toContain("A &amp; B");
    expect(html).not.toContain(raw);
  });
});
