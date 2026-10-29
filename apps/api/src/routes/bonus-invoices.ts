import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { calculateBonusInvoiceTotals } from "@repo/payroll";
import type { BonusInvoice, BusinessProfile, Client } from "@repo/types";

import { BonusInvoiceModel } from "../models/bonus-invoice";
import { BusinessProfileModel } from "../models/business-profile";
import { ClientModel } from "../models/client";
import { InvoiceModel } from "../models/invoice";
import { generateBonusInvoicePDF } from "../utils/pdf-generator";
import {
  isBusinessProfileComplete,
  isClientComplete,
} from "../utils/profile-completeness";

const employeeSchema = z.object({
  payCode: z.string().trim().min(1),
  name: z.string().trim().min(1),
  totalDays: z.number().min(0),
  bonus: z.number().positive(),
});

const createBonusInvoiceSchema = z.object({
  invoiceNumber: z.string().trim().min(1),
  invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().trim().min(1),
  employees: z.array(employeeSchema).min(1),
});

function isDuplicateKey(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as { code: number }).code === 11000
  );
}

export const bonusInvoicesRouter = Router();

bonusInvoicesRouter.get("/", async (_req, res) => {
  const invoices = await BonusInvoiceModel.find().sort({ createdAt: -1 });
  return res.json(invoices.map((invoice) => invoice.toJSON() as BonusInvoice));
});

bonusInvoicesRouter.post("/", async (req, res) => {
  const parsed = createBonusInvoiceSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const { invoiceNumber, invoiceDate, title, employees } = parsed.data;
  const totals = calculateBonusInvoiceTotals(employees);

  const [bonusExists, payrollExists] = await Promise.all([
    BonusInvoiceModel.exists({ invoiceNumber }),
    InvoiceModel.exists({ invoiceNumber }),
  ]);

  if (bonusExists || payrollExists) {
    return res.status(409).json({ error: "Invoice number already exists" });
  }

  try {
    const invoice = await BonusInvoiceModel.create({
      invoiceNumber,
      invoiceDate: new Date(invoiceDate),
      title,
      employees,
      bonusTotal: totals.bonusTotal,
      serviceCharge: totals.serviceCharge,
      cgst: totals.cgst,
      sgst: totals.sgst,
      totalPayable: totals.totalPayable,
    });

    return res.status(201).json(invoice.toJSON() as BonusInvoice);
  } catch (error: unknown) {
    if (isDuplicateKey(error)) {
      return res.status(409).json({ error: "Invoice number already exists" });
    }

    throw error;
  }
});

bonusInvoicesRouter.get("/:id/download", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ error: "Bonus invoice not found" });
  }

  const invoice = await BonusInvoiceModel.findById(id);

  if (!invoice) {
    return res.status(404).json({ error: "Bonus invoice not found" });
  }

  const [business, client] = await Promise.all([
    BusinessProfileModel.findOneAndUpdate(
      {},
      {},
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ),
    ClientModel.findOneAndUpdate(
      {},
      {},
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ),
  ]);
  const businessData = business.toJSON() as BusinessProfile;
  const clientData = client.toJSON() as Client;

  if (
    !isBusinessProfileComplete(businessData) ||
    !isClientComplete(clientData)
  ) {
    return res.status(400).json({
      error:
        "Business and client address must be set in Profile before downloading invoices.",
    });
  }

  const invoiceData = invoice.toJSON() as BonusInvoice;
  const pdfBuffer = await generateBonusInvoicePDF(
    invoiceData,
    businessData,
    clientData,
  );

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="bonus-invoice-${invoiceData.invoiceNumber}.pdf"`,
  );
  return res.send(pdfBuffer);
});

bonusInvoicesRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ error: "Bonus invoice not found" });
  }

  const invoice = await BonusInvoiceModel.findByIdAndDelete(id);

  if (!invoice) {
    return res.status(404).json({ error: "Bonus invoice not found" });
  }

  return res.status(204).send();
});
