import { Router } from "express";
import { z } from "zod";
import type { BusinessProfile, Client } from "@repo/types";
import { BusinessProfileModel } from "../models/business-profile";
import { ClientModel } from "../models/client";

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

const businessProfileSchema = z.object({
  name: z.string().min(1),
  gstin: z.string().regex(GSTIN_REGEX, "Invalid GSTIN format"),
  line1: z.string().min(1),
  line2: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(1),
  country: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  hsnCode: z.string().min(1),
  panNumber: z.string().regex(PAN_REGEX, "Invalid PAN format"),
});

const clientSchema = z.object({
  name: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(1),
  gstin: z.string().regex(GSTIN_REGEX, "Invalid GSTIN format"),
});

export const profileRouter = Router();

profileRouter.get("/business", async (_req, res) => {
  const profile = await BusinessProfileModel.findOneAndUpdate(
    {},
    {},
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return res.json(profile.toJSON() as BusinessProfile);
});

profileRouter.put("/business", async (req, res) => {
  const parsed = businessProfileSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const profile = await BusinessProfileModel.findOneAndUpdate(
    {},
    parsed.data,
    { upsert: true, new: true, runValidators: true },
  );

  return res.json(profile.toJSON() as BusinessProfile);
});

profileRouter.get("/client", async (_req, res) => {
  const client = await ClientModel.findOneAndUpdate(
    {},
    {},
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return res.json(client.toJSON() as Client);
});

profileRouter.put("/client", async (req, res) => {
  const parsed = clientSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const client = await ClientModel.findOneAndUpdate({}, parsed.data, {
    upsert: true,
    new: true,
    runValidators: true,
  });

  return res.json(client.toJSON() as Client);
});
