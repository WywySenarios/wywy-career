# Contributing

## Repository layout

| Path                    | Contents                                                         |
| ----------------------- | ---------------------------------------------------------------- |
| `src/pages/`            | File-based routes. `index.astro` serves `/`.                     |
| `src/layouts/`          | Page shells. `Layout.astro` renders the root document.           |
| `src/components/`       | Components. `ui/` holds shadcn/ui primitives.                    |
| `src/styles/global.css` | Tailwind CSS entrypoint and theme tokens.                        |
| `components.json`       | shadcn/ui configuration: new-york style, neutral base, CSS vars. |
| `astro.config.mts`      | Astro integrations, Vite plugins, and the `@/` alias.            |
| `terraform/`            | Cloudflare Worker and Custom Domain. See `terraform/README.md`.  |
| `secrets/`              | sops-encrypted secrets.                                          |

## Development setup

Install the locked dependency tree and start the dev server:

```sh
npm ci
npm run dev
```

## Testing

```sh
npm test               # `scripts/tests/unit.sh`
npm run test:terraform # `scripts/tests/terraform.sh`
```

Add a test under `tests/unit/` for each module you change, named after the module under test. For example, `src/lib/skills.ts` is covered by `tests/unit/skills.test.ts`.

Please do a final verification with `npm run build`.

## Deployment

```sh
npm run deploy
```

The cloudflare token needs `Workers Scripts: Edit` and `Zone: Read` permissions.

The sops key defaults to `$HOME/.config/sops/age/keys.txt`; this machine needs `SOPS_AGE_KEY_FILE` set explicitly. Export it before manual `sops`, `terraform plan`, or `terraform destroy` commands.

### pre-commit

Hooks are managed by [pre-commit](https://pre-commit.com). Install them once per clone:

```sh
pre-commit install
```

`.pre-commit-config.yaml` runs betterleaks over staged changes, the unit tests, and the build.

Do not commit with `--no-verify`.

## Conventions

- `strict` TypeScript.
- Do not use `any`. A type assertion must carry a `type assertion:` comment explaining why the source type cannot be fixed.
- Every page should contain `export const prerender = true`.
- shadcn/ui primitives live in `src/components/ui/` and follow the `components.json` configuration: new-york style, neutral base, CSS variables.
- React components are Astro islands. Hydrate them with `client:load` or `client:only="react"` only when the component needs interactivity.
- Style with Tailwind utility classes. Theme colors are CSS variables defined in `src/styles/global.css`.
- Import internal modules through the `@/` alias rather than relative parent paths.
- Commit messages are imperative and describe the change.
- Tests should reveal **absolutely no personal information**, regardless of whether or not the website is publically accessible.
- Example values inside tests should be `example-xxx`.
