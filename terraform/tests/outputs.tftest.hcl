mock_provider "cloudflare" {
  mock_data "cloudflare_zone" {
    defaults = {
      id   = "zone-id"
      name = "ericzhu.me"
      account = {
        id = "account-id"
      }
    }
  }

  mock_resource "cloudflare_workers_custom_domain" {
    defaults = {
      id = "domain-id"
    }
  }
}

variables {
  cloudflare_api_token = "test-token"
  assets_dir_override  = "tests/fixtures/assets"
}

run "outputs_expose_deployed_site_and_cloudflare_identifiers" {
  command = apply

  assert {
    condition     = output.site_url == "https://career.ericzhu.me"
    error_message = "site_url must expose the deployed custom domain URL"
  }

  assert {
    condition     = output.worker_name == "wywy-career"
    error_message = "worker_name must expose the deployed Worker name"
  }

  assert {
    condition     = output.zone_id == "zone-id"
    error_message = "zone_id must expose the resolved Cloudflare zone id"
  }

  assert {
    condition     = output.custom_domain_id == "domain-id"
    error_message = "custom_domain_id must expose the Cloudflare custom domain id"
  }
}
