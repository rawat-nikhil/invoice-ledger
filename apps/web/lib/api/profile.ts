import type {
  BusinessProfile,
  Client,
  UpdateBusinessProfileInput,
  UpdateClientInput,
} from "@repo/types";

import { apiFetch } from "../api";

export async function getBusinessProfile(): Promise<BusinessProfile> {
  return apiFetch<BusinessProfile>("/profile/business");
}

export async function updateBusinessProfile(
  data: UpdateBusinessProfileInput,
): Promise<BusinessProfile> {
  return apiFetch<BusinessProfile>("/profile/business", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getClient(): Promise<Client> {
  return apiFetch<Client>("/profile/client");
}

export async function updateClient(data: UpdateClientInput): Promise<Client> {
  return apiFetch<Client>("/profile/client", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
