import { Schema, model, models } from "mongoose";

const businessProfileSchema = new Schema(
  {
    name: { type: String, required: true, default: "" },
    gstin: { type: String, required: true, default: "" },
    line1: { type: String, required: true, default: "" },
    line2: { type: String, required: true, default: "" },
    city: { type: String, required: true, default: "" },
    state: { type: String, required: true, default: "" },
    pincode: { type: String, required: true, default: "" },
    country: { type: String, required: true, default: "" },
    email: { type: String, required: true, default: "" },
    phone: { type: String, required: true, default: "" },
    hsnCode: { type: String, required: true, default: "" },
    panNumber: { type: String, required: true, default: "" },
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

export const BusinessProfileModel =
  models.BusinessProfile ?? model("BusinessProfile", businessProfileSchema);
