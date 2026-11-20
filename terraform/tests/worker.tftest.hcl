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

run "zone_lookup_uses_configured_name" {
  command = plan

  assert {
    condition     = data.cloudflare_zone.site.filter.name == "ericzhu.me"
    error_message = "zone lookup must filter by the configured zone name"
  }

  assert {
    condition     = data.cloudflare_zone.site.id == "zone-id"
    error_message = "zone data source must expose the mocked zone id"
  }

  assert {
    condition     = data.cloudflare_zone.site.account.id == "account-id"
    error_message = "zone data source must expose the mocked account id"
  }
}

run "worker_uploads_override_assets_dir" {
  command = plan

  assert {
    condition     = cloudflare_workers_script.site.script_name == "wywy-career"
    error_message = "worker script name must be derived from worker_name"
  }

  assert {
    condition     = cloudflare_workers_script.site.compatibility_date == "2026-11-19"
    error_message = "worker compatibility date must match the configured value"
  }

  assert {
    condition     = cloudflare_workers_script.site.account_id == "account-id"
    error_message = "worker must be created in the zone's account"
  }

  assert {
    condition = endswith(
      cloudflare_workers_script.site.assets.directory,
      "/tests/fixtures/assets"
    )
    error_message = "override assets directory must resolve relative to the module root"
  }
}

run "missing_build_fails_closed" {
  command = plan

  variables {
    assets_dir_override = "tests/fixtures/missing"
  }

  expect_failures = [cloudflare_workers_script.site]
}

run "production_assets_dir_branch_uses_module_root" {
  command = plan

  variables {
    assets_dir_override = null
    assets_dir_default  = "tests/fixtures/assets"
  }

  assert {
    condition = endswith(
      cloudflare_workers_script.site.assets.directory,
      "/tests/fixtures/assets"
    )
    error_message = "production assets directory must resolve relative to the module root"
  }
}

run "assets_dir_default_is_relative_dist" {
  command = plan

  assert {
    condition     = var.assets_dir_default == "../dist"
    error_message = "assets_dir_default must remain the production-relative path"
  }
}
