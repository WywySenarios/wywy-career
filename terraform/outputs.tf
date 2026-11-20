output "zone_id" {
  description = "Cloudflare zone identifier resolved from the configured zone name."
  value       = data.cloudflare_zone.site.id
}

output "worker_name" {
  description = "Name of the deployed Worker script."
  value       = cloudflare_workers_script.site.script_name
}

output "site_url" {
  description = "Public URL of the deployed site."
  value       = "https://${var.hostname}"
}

output "custom_domain_id" {
  description = "Cloudflare identifier of the Worker custom domain."
  value       = cloudflare_workers_custom_domain.site.id
}
