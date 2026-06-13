import { Schema, model, models } from "mongoose";
import type { LedgerEntryType } from "@repo/types";

const ledgerEntrySchema = new Schema(
  {
    invoiceId: { type: String },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "USD" },
    type: {
      type: String,
      required: true,
      enum: ["debit", "credit"] satisfies LedgerEntryType[],
    },
    occurredAt: { type: String, required: true },
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

export const LedgerEntryModel =
  models.LedgerEntry ?? model("LedgerEntry", ledgerEntrySchema);
