import { Schema, model, models } from "mongoose";
import { EmployeeCategoryEnum, EmployeeGradeEnum, type EmployeeCategory, type EmployeeGrade } from "@repo/types";

const employeeSchema = new Schema(
  {
    employeeCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: Object.values(EmployeeCategoryEnum),
    },
    grade: {
      type: String,
      required: true,
      enum: Object.values(EmployeeGradeEnum),
    },
    department: { type: String, required: true, default: "maintenance" },
    gradeRate: { type: Number, required: true },
    basicPay: { type: Number, required: true },
    adjustmentAllowance: { type: Number, required: true },
    washingAllowance: { type: Number, required: true },
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
