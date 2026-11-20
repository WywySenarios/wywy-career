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

run "plan_succeeds_with_valid_configuration" {
  command = plan
}

run "rejects_empty_cloudflare_api_token" {
  command = plan

  variables {
    cloudflare_api_token = ""
  }

  expect_failures = [var.cloudflare_api_token]
}

run "defaults_are_expected" {
  command = plan

  assert {
    condition     = var.zone_name == "ericzhu.me"
    error_message = "zone_name must default to ericzhu.me"
  }

  assert {
    condition     = var.hostname == "career.ericzhu.me"
    error_message = "hostname must default to career.ericzhu.me"
  }

  assert {
    condition     = var.worker_name == "wywy-career"
    error_message = "worker_name must default to wywy-career"
  }

  assert {
    condition     = var.compatibility_date == "2026-11-19"
    error_message = "compatibility_date must default to 2026-11-19"
  }

  assert {
    condition     = var.assets_dir_default == "../dist"
    error_message = "assets_dir_default must default to ../dist"
  }
}

run "rejects_hostname_outside_configured_zone" {
  command = plan

  variables {
    hostname = "career.example.com"
  }

  expect_failures = [var.hostname]
}

run "rejects_apex_hostname" {
  command = plan

  variables {
    hostname = "ericzhu.me"
  }

  expect_failures = [var.hostname]
}

run "rejects_invalid_worker_name" {
  command = plan

  variables {
    worker_name = "Wywy Career"
  }

  expect_failures = [var.worker_name]
}

run "rejects_empty_zone_name" {
  command = plan

  variables {
    zone_name = ""
  }

  expect_failures = [var.zone_name]
}

run "rejects_non_iso_compatibility_date" {
  command = plan

  variables {
    compatibility_date = "19-11-2026"
  }

  expect_failures = [var.compatibility_date]
}
