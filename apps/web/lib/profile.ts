import type { BusinessProfile, Client } from "@repo/types";

const BUSINESS_FIELDS: (keyof BusinessProfile)[] = [
  "name",
  "gstin",
  "line1",
  "line2",
  "city",
  "state",
  "pincode",
  "country",
  "email",
  "phone",
  "hsnCode",
  "panNumber",
];

const CLIENT_FIELDS: (keyof Client)[] = [
  "name",
  "line1",
  "line2",
  "city",
  "state",
  "pincode",
  "gstin",
];

export function isBusinessProfileComplete(profile: BusinessProfile): boolean {
  return BUSINESS_FIELDS.every((field) => profile[field].trim() !== "");
}

export function isClientComplete(client: Client): boolean {
  return CLIENT_FIELDS.every((field) => client[field].trim() !== "");
}
