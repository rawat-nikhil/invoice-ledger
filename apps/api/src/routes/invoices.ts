import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import {
  calculateEmployeeRow,
  calculateInvoiceTotals,
  formatMonthYear,
  getCalendarDaysInMonth,
} from "@repo/payroll";
import type { Employee, Invoice } from "@repo/types";
import { EmployeeModel } from "../models/employee";
import { InvoiceModel } from "../models/invoice";
import { SalarySlipModel } from "../models/salary-slip";
import { getNextInvoiceNumber } from "../utils/invoice-number";
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

const employeeInvoiceInputSchema = z.object({
  employeeId: z.string().min(1),
  present: z.number().min(0),
  otHours: z.number().min(0),
  gradeDays: z.number().min(0),
  canteenBill: z.number().min(0),
});

const generateInvoiceSchema = z.object({
  invoiceDate: z.string().min(1),
  employeeInputs: z.array(employeeInvoiceInputSchema).min(1),
});

export const invoicesRouter = Router();

invoicesRouter.get("/", async (_req, res) => {
  const invoices = await InvoiceModel.find().sort({ createdAt: -1 });
  return res.json(invoices.map((invoice) => invoice.toJSON() as Invoice));
});

invoicesRouter.post("/generate", async (req, res) => {
  const parsed = generateInvoiceSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const { invoiceDate, employeeInputs } = parsed.data;
  const daysInMonth = getCalendarDaysInMonth(invoiceDate);
  const monthYear = formatMonthYear(invoiceDate);

  for (const input of employeeInputs) {
    if (input.present > daysInMonth || input.gradeDays > daysInMonth) {
      return res.status(400).json({
        error: `Present and grade days cannot exceed ${daysInMonth} for ${monthYear}.`,
      });
    }
  }

  const employeeIds = employeeInputs.map((input) => input.employeeId);

  if (new Set(employeeIds).size !== employeeIds.length) {
    return res.status(400).json({ error: "Duplicate employee entries" });
  }

  const invalidIds = employeeIds.filter((id) => !mongoose.isValidObjectId(id));

  if (invalidIds.length > 0) {
    return res.status(400).json({ error: "Invalid employee ID" });
  }

  const employees = await EmployeeModel.find({ _id: { $in: employeeIds } });

  if (employees.length !== employeeIds.length) {
    return res.status(400).json({ error: "One or more employees not found" });
  }

  const inactiveEmployees = employees.filter(
    (employee) => employee.isActive === false,
  );

  if (inactiveEmployees.length > 0) {
    return res.status(400).json({
      error: "One or more employees are inactive and cannot be added to a new invoice",
    });
  }

  const employeeMap = new Map(
    employees.map((employee) => [String(employee._id), employee.toJSON() as Employee]),
  );

  const employeeBreakdown = employeeInputs
    .map((input) => {
      const employee = employeeMap.get(input.employeeId);

      if (!employee) {
        throw new Error("Employee not found");
      }

      return calculateEmployeeRow(employee, input, invoiceDate);
    })
    .sort((a, b) => a.employeeCode.localeCompare(b.employeeCode));

  const totals = calculateInvoiceTotals(employeeBreakdown);

  const session = await mongoose.startSession();

  try {
    let createdInvoice: Invoice | null = null;

    await session.withTransaction(async () => {
      const invoiceNumber = await getNextInvoiceNumber(session);

      const [invoice] = await InvoiceModel.create(
        [
          {
            invoiceNumber,
            monthYear,
            invoiceDate: new Date(invoiceDate),
            totals,
            employeeBreakdown,
            totalBill: totals.totalPayable,
            serviceCharge: totals.serviceCharge,
            gst: {
              amount: totals.sgst + totals.cgst,
              status: "not-generated",
            },
            esic: {
              amount: totals.totalEsi,
              status: "not-generated",
            },
            settled: false,
          },
        ],
        { session },
      );

      await SalarySlipModel.insertMany(
        employeeBreakdown.map((row) => ({
          employeeId: row.employeeId,
          invoiceId: invoice._id,
          monthYear,
          present: row.present,
          otHours: row.otHours,
          gradeDays: row.gradeDays,
          adjustmentAllowance: row.adjustmentAllowance,
          washingAllowance: row.washingAllowance,
          canteenBill: row.canteenBill,
          employeeName: row.employeeName,
          employeeCode: row.employeeCode,
          basicPay: row.basicPay,
          gradeRate: row.gradeRate,
          basicAmount: row.basicAmount,
          washingAllowanceAmount: row.washingAllowanceAmount,
          adjustmentAllowanceAmount: row.adjustmentAllowanceAmount,
          gradeAmount: row.gradeAmount,
          otAmount: row.otAmount,
          totalKr: row.totalKr,
          pf: row.pf,
          esi: row.esi,
          payableAmount: row.payableAmount,
        })),
        { session },
      );

      createdInvoice = invoice.toJSON() as Invoice;
    });

    if (!createdInvoice) {
      return res.status(500).json({ error: "Failed to create invoice" });
    }

    return res.status(201).json(createdInvoice);
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return res.status(409).json({ error: "Invoice number already exists" });
    }

    throw error;
  } finally {
    await session.endSession();
  }
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

  await SalarySlipModel.deleteMany({ invoiceId: id });

  return res.status(204).send();
});
