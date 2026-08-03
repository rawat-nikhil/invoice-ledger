import { Router } from "express";
import archiver from "archiver";
import mongoose from "mongoose";
import { z } from "zod";
import type { BusinessProfile, SalarySlip } from "@repo/types";
import { BusinessProfileModel } from "../models/business-profile";
import { SalarySlipModel } from "../models/salary-slip";
import {
  generateSalarySlipPDF,
  generateSalarySlipPDFs,
} from "../utils/pdf-generator";

const listQuerySchema = z.object({
  monthYear: z.string().min(1),
});

async function getBusinessProfile(): Promise<BusinessProfile> {
  const business = await BusinessProfileModel.findOneAndUpdate(
    {},
    {},
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return business.toJSON() as BusinessProfile;
}

export const salarySlipsRouter = Router();

salarySlipsRouter.get("/", async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({ error: "monthYear query parameter is required" });
  }

  const { monthYear } = parsed.data;
  const slips = await SalarySlipModel.find({ monthYear }).sort({ employeeCode: 1 });

  return res.json(slips.map((slip) => slip.toJSON() as SalarySlip));
});

salarySlipsRouter.get("/download", async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({ error: "monthYear query parameter is required" });
    return;
  }

  const { monthYear } = parsed.data;
  const slips = await SalarySlipModel.find({ monthYear }).sort({ employeeCode: 1 });

  if (slips.length === 0) {
    res.status(404).json({ error: "No salary slips found for this month" });
    return;
  }

  try {
    const business = await getBusinessProfile();
    const slipData = slips.map((slip) => slip.toJSON() as SalarySlip);
    const pdfFiles = await generateSalarySlipPDFs(slipData, business);

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="salary-slips-${monthYear}.zip"`,
    );

    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("error", () => {
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to create zip archive" });
      }
    });

    archive.pipe(res);

    for (const file of pdfFiles) {
      archive.append(file.buffer, { name: file.filename });
    }

    await archive.finalize();
  } catch {
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to download salary slips" });
    }
  }
});

salarySlipsRouter.get("/:id/download", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ error: "Salary slip not found" });
  }

  const slip = await SalarySlipModel.findById(id);

  if (!slip) {
    return res.status(404).json({ error: "Salary slip not found" });
  }

  const slipData = slip.toJSON() as SalarySlip;
  const business = await getBusinessProfile();
  const pdfBuffer = await generateSalarySlipPDF(slipData, business);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="salary-slip-${slipData.employeeCode}-${slipData.monthYear}.pdf"`,
  );
  return res.send(pdfBuffer);
});
