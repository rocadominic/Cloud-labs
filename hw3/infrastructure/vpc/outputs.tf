output "vpc_name" {
    value = google_compute_network.vpc.name
}

output "public_subnet_name" {
  value = google_compute_subnetwork.public.name
}

output "private_subnet_name" {
  value = google_compute_subnetwork.private.name
}