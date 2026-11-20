# wywy-career

This repo is part of the Wywy repo line and is subject to Wywy conventions.

## Requirements

- Node.js 22.12.0 or newer. `.nvmrc` pins major version 24.
- npm 9.6.5 or newer.
- Terraform 1.11 or newer for deployment.
- [sops](https://github.com/getsops/sops) and an age key for deployment.

## Deployment

```sh
npm run deploy
```

Deploy via Cloudflare worker & worker DNS records.

See `terraform/README.md` for the more details on deployment.
