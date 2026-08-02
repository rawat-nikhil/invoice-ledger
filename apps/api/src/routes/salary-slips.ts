import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import type { SalarySlip } from "@repo/types";
import { SalarySlipModel } from "../models/salary-slip";
import { generateSalarySlipPDF } from "../utils/pdf-generator";

const listQuerySchema = z.object({
  monthYear: z.string().min(1),
});

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
  const pdfBuffer = await generateSalarySlipPDF(slipData);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="salary-slip-${slipData.employeeCode}-${slipData.monthYear}.pdf"`,
  );
  return res.send(pdfBuffer);
});
