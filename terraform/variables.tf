variable "cloudflare_api_token" {
  description = "Cloudflare API token used to manage the zone and Worker."
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.cloudflare_api_token) > 0
    error_message = "cloudflare_api_token must not be empty."
  }
}

variable "zone_name" {
  description = "Apex domain of the Cloudflare zone that hosts the site."
  type        = string
  default     = "ericzhu.me"

  validation {
    condition     = length(trimspace(var.zone_name)) > 0
    error_message = "zone_name must not be empty."
  }
}

variable "hostname" {
  description = "Public hostname served by the Worker; must be a subdomain of zone_name."
  type        = string
  default     = "career.ericzhu.me"

  validation {
    condition = (
      var.hostname != var.zone_name &&
      endswith(var.hostname, ".${var.zone_name}")
    )
    error_message = "hostname must be a subdomain of zone_name and must not be the apex."
  }
}

variable "worker_name" {
  description = "Name of the Cloudflare Worker script."
  type        = string
  default     = "wywy-career"

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.worker_name))
    error_message = "worker_name may contain only lowercase letters, digits, and hyphens."
  }
}

variable "compatibility_date" {
  description = "Workers runtime compatibility date in ISO YYYY-MM-DD form."
  type        = string
  default     = "2026-11-19"

  validation {
    condition     = can(regex("^\\d{4}-\\d{2}-\\d{2}$", var.compatibility_date))
    error_message = "compatibility_date must use the ISO YYYY-MM-DD format."
  }
}

variable "assets_dir_default" {
  description = "Production build output directory, relative to the module root."
  type        = string
  default     = "../dist"
}

variable "assets_dir_override" {
  description = "Test-only asset directory override, relative to the module root."
  type        = string
  default     = null
}
