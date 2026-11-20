# Agent Rules

## Testing

Run `npm run build` before finishing any change. It runs `astro check` and then a static build; both stages must pass.

Never commit with `--no-verify`.

Never include personal informations in tests.

Always use `example-xxx` values as example values in tests.

## Conventions

- The site is static.
- Add shadcn/ui components with `npx shadcn@latest add <component>` from the repository root. Do not copy component source from the registry website, another repository, or memory.
- Keep shadcn/ui primitives in `src/components/ui/` and other components in `src/components/`.
- Import repository modules through the `@/` alias, which resolves to `src/`.
- Never commit plaintext secrets. Secrets belong in sops-encrypted files under `secrets/` or in environment variables.
- Do not log tokens, credentials, or personal data.
- Treat input added later, such as form fields, query parameters, and API responses, as untrusted: validate it, bound it, and fail closed.
