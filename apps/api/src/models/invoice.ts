import { Schema, model, models } from "mongoose";
import type { ComplianceStatus } from "@repo/types";

import {
  employeePayrollBreakdownSchema,
  invoiceTotalsSchema,
} from "./payroll-schemas";

const complianceStatusEnum = [
  "pending",
  "paid",
  "not-generated",
] satisfies ComplianceStatus[];

const complianceSchema = new Schema(
  {
    amount: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      required: true,
      enum: complianceStatusEnum,
      default: "not-generated",
    },
  },
  { _id: false },
);

const invoiceSchema = new Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    monthYear: { type: String, required: true },
    totalBill: { type: Number, required: true },
    serviceCharge: { type: Number, required: true },
    gst: { type: complianceSchema, required: true },
    esic: { type: complianceSchema, required: true },
    settled: { type: Boolean, required: true, default: false },
    invoiceDate: { type: Date },
    totals: { type: invoiceTotalsSchema },
    employeeBreakdown: { type: [employeePayrollBreakdownSchema], default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;

        if (ret.invoiceDate instanceof Date) {
          ret.invoiceDate = ret.invoiceDate.toISOString().slice(0, 10);
        }

        return ret;
      },
    },
  },
);

export const InvoiceModel =
  models.Invoice ?? model("Invoice", invoiceSchema);
