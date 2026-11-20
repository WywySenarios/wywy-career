#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

SOPS_AGE_KEY_FILE="${SOPS_AGE_KEY_FILE:-$HOME/.config/sops/age/keys.txt}"
export SOPS_AGE_KEY_FILE

npm run build

TF_VAR_cloudflare_api_token="$(sops -d --extract '["data"]' secrets/cloudflare-api-token.sops)"
export TF_VAR_cloudflare_api_token

terraform -chdir=terraform init -input=false
terraform -chdir=terraform apply -input=false
