import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import type { Employee } from "@repo/types";
import { EmployeeModel } from "../models/employee";

const SORTABLE_FIELDS = [
  "employeeCode",
  "name",
  "category",
  "grade",
  "department",
  "gradeRate",
  "basicPay",
  "adjustmentAllowance",
  "washingAllowance",
  "createdAt",
] as const;

const createEmployeeSchema = z.object({
  employeeCode: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(["skilled", "semi-skilled"]),
  grade: z.enum(["A", "B", "C"]),
  department: z.string().min(1).optional(),
  gradeRate: z.number(),
  basicPay: z.number(),
  adjustmentAllowance: z.number(),
  washingAllowance: z.number(),
});

const updateEmployeeSchema = z.object({
  name: z.string().min(1),
  category: z.enum(["skilled", "semi-skilled"]),
  grade: z.enum(["A", "B", "C"]),
  department: z.string().min(1),
  gradeRate: z.number(),
  basicPay: z.number(),
  adjustmentAllowance: z.number(),
  washingAllowance: z.number(),
});

const updateStatusSchema = z.object({
  isActive: z.boolean(),
});

const STATUS_VALUES = ["active", "inactive", "all"] as const;
type StatusFilter = (typeof STATUS_VALUES)[number];

export const employeesRouter = Router();

employeesRouter.get("/", async (req, res) => {
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : "";
  const sortParam =
    typeof req.query.sort === "string" ? req.query.sort : "name";
  const orderParam =
    typeof req.query.order === "string" ? req.query.order : "asc";

  const sortField = SORTABLE_FIELDS.includes(
    sortParam as (typeof SORTABLE_FIELDS)[number],
  )
    ? sortParam
    : "name";
  const sortOrder = orderParam === "desc" ? -1 : 1;

  const statusParam =
    typeof req.query.status === "string" ? req.query.status : "active";
  const status: StatusFilter = STATUS_VALUES.includes(
    statusParam as StatusFilter,
  )
    ? (statusParam as StatusFilter)
    : "active";

  const statusFilter =
    status === "active"
      ? { isActive: { $ne: false } }
      : status === "inactive"
        ? { isActive: false }
        : {};

  const searchFilter =
    search.length > 0
      ? { name: { $regex: search, $options: "i" } }
      : {};

  const filter = { ...searchFilter, ...statusFilter };

  const employees = await EmployeeModel.find(filter).sort({
    [sortField]: sortOrder,
  });

  return res.json(employees.map((employee) => employee.toJSON() as Employee));
});

employeesRouter.post("/", async (req, res) => {
  const parsed = createEmployeeSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    const employee = await EmployeeModel.create({
      ...parsed.data,
      department: parsed.data.department ?? "maintenance",
    });

    return res.status(201).json(employee.toJSON() as Employee);
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return res.status(409).json({ error: "Employee code already exists" });
    }
    throw error;
  }
});

employeesRouter.put("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ error: "Employee not found" });
  }

  const parsed = updateEmployeeSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const employee = await EmployeeModel.findByIdAndUpdate(id, parsed.data, {
    new: true,
    runValidators: true,
  });

  if (!employee) {
    return res.status(404).json({ error: "Employee not found" });
  }

  return res.json(employee.toJSON() as Employee);
});

employeesRouter.patch("/:id/status", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ error: "Employee not found" });
  }

  const parsed = updateStatusSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const employee = await EmployeeModel.findByIdAndUpdate(
    id,
    { isActive: parsed.data.isActive },
    { new: true, runValidators: true },
  );

  if (!employee) {
    return res.status(404).json({ error: "Employee not found" });
  }

  return res.json(employee.toJSON() as Employee);
});
