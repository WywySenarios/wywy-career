data "cloudflare_zone" "site" {
  filter = {
    name = var.zone_name
  }
}

locals {
  account_id          = data.cloudflare_zone.site.account.id
  assets_dir_relative = var.assets_dir_override == null ? var.assets_dir_default : var.assets_dir_override
  assets_dir          = abspath("${path.module}/${local.assets_dir_relative}")
}

resource "cloudflare_workers_script" "site" {
  account_id         = local.account_id
  script_name        = var.worker_name
  compatibility_date = var.compatibility_date

  assets = {
    directory = local.assets_dir
  }

  lifecycle {
    precondition {
      condition     = fileexists("${local.assets_dir}/index.html")
      error_message = "The configured asset directory must contain index.html."
    }
  }
}

resource "cloudflare_workers_custom_domain" "site" {
  zone_id    = data.cloudflare_zone.site.id
  account_id = local.account_id
  hostname   = var.hostname
  service    = cloudflare_workers_script.site.script_name
  enabled    = true
}
