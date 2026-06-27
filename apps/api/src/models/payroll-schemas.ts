import { Schema } from "mongoose";

export const employeeInvoiceInputSchema = new Schema(
  {
    employeeId: { type: String, required: true },
    present: { type: Number, required: true },
    otHours: { type: Number, required: true },
    gradeDays: { type: Number, required: true },
    canteenBill: { type: Number, required: true },
  },
  { _id: false },
);

export const employeePayrollBreakdownSchema = new Schema(
  {
    employeeId: { type: String, required: true },
    present: { type: Number, required: true },
    otHours: { type: Number, required: true },
    gradeDays: { type: Number, required: true },
    adjustmentAllowance: { type: Number, required: true },
    washingAllowance: { type: Number, required: true },
    canteenBill: { type: Number, required: true },
    employeeName: { type: String, required: true },
    employeeCode: { type: String, required: true },
    basicPay: { type: Number, required: true },
    gradeRate: { type: Number, required: true },
    basicAmount: { type: Number, required: true },
    washingAllowanceAmount: { type: Number, required: true },
    adjustmentAllowanceAmount: { type: Number, required: true },
    gradeAmount: { type: Number, required: true },
    otAmount: { type: Number, required: true },
    totalKr: { type: Number, required: true },
    pf: { type: Number, required: true },
    esi: { type: Number, required: true },
    payableAmount: { type: Number, required: true },
  },
  { _id: false },
);

export const invoiceTotalsSchema = new Schema(
  {
    totalPf: { type: Number, required: true },
    totalEsi: { type: Number, required: true },
    serviceCharge: { type: Number, required: true },
    total: { type: Number, required: true },
    sgst: { type: Number, required: true },
    cgst: { type: Number, required: true },
    totalPayable: { type: Number, required: true },
  },
  { _id: false },
);
