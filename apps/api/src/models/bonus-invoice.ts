import { Schema, model, models } from "mongoose";

const bonusEmployeeSchema = new Schema(
  {
    payCode: { type: String, required: true },
    name: { type: String, required: true },
    totalDays: { type: Number, required: true, min: 0 },
    bonus: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const bonusInvoiceSchema = new Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    invoiceDate: { type: Date, required: true },
    title: { type: String, required: true },
    employees: { type: [bonusEmployeeSchema], required: true },
    bonusTotal: { type: Number, required: true },
    serviceCharge: { type: Number, required: true },
    cgst: { type: Number, required: true },
    sgst: { type: Number, required: true },
    totalPayable: { type: Number, required: true },
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

export const BonusInvoiceModel =
  models.BonusInvoice ?? model("BonusInvoice", bonusInvoiceSchema);
