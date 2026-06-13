import { Schema, model, models } from "mongoose";
import type { InvoiceStatus } from "@repo/types";

const invoiceSchema = new Schema(
  {
    invoiceNumber: { type: String, required: true },
    clientName: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "USD" },
    status: {
      type: String,
      required: true,
      enum: ["draft", "sent", "paid", "overdue"] satisfies InvoiceStatus[],
      default: "draft",
    },
    issuedAt: { type: String, required: true },
    dueAt: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        return ret;
      },
    },
  },
);

export const InvoiceModel =
  models.Invoice ?? model("Invoice", invoiceSchema);
