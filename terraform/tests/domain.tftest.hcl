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
}

variables {
  cloudflare_api_token = "test-token"
  assets_dir_override  = "tests/fixtures/assets"
}

run "custom_domain_targets_worker_at_configured_hostname" {
  command = plan

  assert {
    condition     = cloudflare_workers_custom_domain.site.hostname == "career.ericzhu.me"
    error_message = "custom domain must attach the configured hostname"
  }

  assert {
    condition     = cloudflare_workers_custom_domain.site.service == "wywy-career"
    error_message = "custom domain service must be the configured worker name"
  }

  assert {
    condition     = cloudflare_workers_custom_domain.site.zone_id == "zone-id"
    error_message = "custom domain must use the zone id from the zone lookup"
  }

  assert {
    condition     = cloudflare_workers_custom_domain.site.account_id == "account-id"
    error_message = "custom domain must use the account id from the zone lookup"
  }

  assert {
    condition     = cloudflare_workers_custom_domain.site.enabled == true
    error_message = "custom domain must be enabled"
  }
}

run "custom_domain_service_follows_worker_name" {
  command = plan

  variables {
    worker_name = "career-worker-test"
  }

  assert {
    condition     = cloudflare_workers_script.site.script_name == "career-worker-test"
    error_message = "worker script name must follow worker_name"
  }

  assert {
    condition     = cloudflare_workers_custom_domain.site.service == "career-worker-test"
    error_message = "custom domain service must follow worker_name"
  }
}
