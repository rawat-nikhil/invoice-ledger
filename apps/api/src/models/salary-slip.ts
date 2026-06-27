import { Schema, model, models } from "mongoose";

const salarySlipSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", required: true },
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
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        ret.employeeId = String(ret.employeeId);
        ret.invoiceId = String(ret.invoiceId);
        return ret;
      },
    },
  },
);

salarySlipSchema.index({ invoiceId: 1, employeeId: 1 });

export const SalarySlipModel =
  models.SalarySlip ?? model("SalarySlip", salarySlipSchema, "salary_slips");
