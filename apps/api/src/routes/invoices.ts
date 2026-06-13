import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import type { Invoice } from "@repo/types";
import { InvoiceModel } from "../models/invoice";
import { generateInvoicePDF } from "../utils/pdf-generator";

const complianceSchema = z.object({
  amount: z.number(),
  status: z.enum(["pending", "paid", "not-generated"]),
});

const createInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1),
  monthYear: z.string().min(1),
  totalBill: z.number(),
  serviceCharge: z.number(),
  gst: complianceSchema,
  esic: complianceSchema,
  settled: z.boolean(),
});

const updateInvoiceSchema = z.object({
  monthYear: z.string().min(1),
  totalBill: z.number(),
  serviceCharge: z.number(),
  gst: complianceSchema,
  esic: complianceSchema,
  settled: z.boolean(),
});

export const invoicesRouter = Router();

invoicesRouter.get("/", async (_req, res) => {
  const invoices = await InvoiceModel.find().sort({ createdAt: -1 });
  return res.json(invoices.map((invoice) => invoice.toJSON() as Invoice));
});

invoicesRouter.post("/", async (req, res) => {
  const parsed = createInvoiceSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    const invoice = await InvoiceModel.create(parsed.data);
    return res.status(201).json(invoice.toJSON() as Invoice);
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return res.status(409).json({ error: "Invoice number already exists" });
    }
    throw error;
  }
});

invoicesRouter.get("/:id/download", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ error: "Invoice not found" });
  }

  const invoice = await InvoiceModel.findById(id);

  if (!invoice) {
    return res.status(404).json({ error: "Invoice not found" });
  }

  const invoiceData = invoice.toJSON() as Invoice;
  const pdfBuffer = await generateInvoicePDF(invoiceData);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="invoice-${invoiceData.invoiceNumber}.pdf"`,
  );
  return res.send(pdfBuffer);
});

invoicesRouter.put("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ error: "Invoice not found" });
  }

  const parsed = updateInvoiceSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const invoice = await InvoiceModel.findByIdAndUpdate(id, parsed.data, {
    new: true,
    runValidators: true,
  });

  if (!invoice) {
    return res.status(404).json({ error: "Invoice not found" });
  }

  return res.json(invoice.toJSON() as Invoice);
});

invoicesRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ error: "Invoice not found" });
  }

  const invoice = await InvoiceModel.findByIdAndDelete(id);

  if (!invoice) {
    return res.status(404).json({ error: "Invoice not found" });
  }

  return res.status(204).send();
});
