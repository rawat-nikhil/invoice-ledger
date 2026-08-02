import { Schema, model, models } from "mongoose";
import type { EmployeeCategory, EmployeeGrade } from "@repo/types";

const employeeSchema = new Schema(
  {
    employeeCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["skilled", "semi-skilled"] satisfies EmployeeCategory[],
    },
    grade: {
      type: String,
      required: true,
      enum: ["A", "B", "C"] satisfies EmployeeGrade[],
    },
    department: { type: String, required: true, default: "maintenance" },
    gradeRate: { type: Number, required: true },
    basicPay: { type: Number, required: true },
    adjustmentAllowance: { type: Number, required: true },
    washingAllowance: { type: Number, required: true },
    isActive: { type: Boolean, required: true, default: true },
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

export const EmployeeModel =
  models.Employee ?? model("Employee", employeeSchema);
