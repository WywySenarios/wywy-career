# Terraform

This module deploys the built site to Cloudflare as a Worker and binds it to a Custom Domain.

## Prerequisites

- Terraform 1.11 or newer.
- [sops](https://github.com/getsops/sops) and an age key.
- A Cloudflare API token stored in `secrets/cloudflare-api-token.sops`.

The token needs these permissions:

| Scope           | Permission |
| --------------- | ---------- |
| Workers Scripts | Edit       |
| Zone            | Read       |

## SOPS key path

The scripts default `SOPS_AGE_KEY_FILE` to `$HOME/.config/sops/age/keys.txt`.

## Deploy

```sh
npm run deploy
```

`npm run deploy` runs `scripts/deploy.sh`.

## Test

```sh
npm run test:terraform
```

## State

`terraform/terraform.tfstate` is gitignored and is not backed up. Losing it requires importing the existing resources by hand.
