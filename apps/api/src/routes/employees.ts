import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import {
  EmployeeCategoryEnum,
  EmployeeGradeEnum,
  type BusinessProfile,
  type Employee,
} from "@repo/types";
import { BusinessProfileModel } from "../models/business-profile";
import { EmployeeModel } from "../models/employee";
import { buildEmployeeListHtml } from "../utils/pdf-generator";

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
  category: z.enum(Object.values(EmployeeCategoryEnum)),
  grade: z.enum(Object.values(EmployeeGradeEnum)),
  department: z.string().min(1).optional(),
  gradeRate: z.number(),
  basicPay: z.number(),
  adjustmentAllowance: z.number(),
  washingAllowance: z.number(),
});

const updateEmployeeSchema = z.object({
  name: z.string().min(1),
  category: z.enum(Object.values(EmployeeCategoryEnum)),
  grade: z.enum(Object.values(EmployeeGradeEnum)),
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

const STATUS_LABELS: Record<StatusFilter, string> = {
  active: "Active",
  inactive: "Inactive",
  all: "All",
};

type EmployeeListQuery = {
  search: string;
  sortField: (typeof SORTABLE_FIELDS)[number];
  sortOrder: 1 | -1;
  status: StatusFilter;
};

function parseEmployeeListQuery(
  query: Record<string, unknown>,
): EmployeeListQuery {
  const search = typeof query.search === "string" ? query.search.trim() : "";
  const sortParam = typeof query.sort === "string" ? query.sort : "name";
  const orderParam = typeof query.order === "string" ? query.order : "asc";
  const statusParam = typeof query.status === "string" ? query.status : "active";

  const sortField = SORTABLE_FIELDS.includes(
    sortParam as (typeof SORTABLE_FIELDS)[number],
  )
    ? (sortParam as (typeof SORTABLE_FIELDS)[number])
    : "name";

  const status: StatusFilter = STATUS_VALUES.includes(statusParam as StatusFilter)
    ? (statusParam as StatusFilter)
    : "active";

  return {
    search,
    sortField,
    sortOrder: orderParam === "desc" ? -1 : 1,
    status,
  };
}

async function findEmployees(listQuery: EmployeeListQuery): Promise<Employee[]> {
  const statusFilter =
    listQuery.status === "active"
      ? { isActive: { $ne: false } }
      : listQuery.status === "inactive"
        ? { isActive: false }
        : {};

  const searchFilter =
    listQuery.search.length > 0
      ? { name: { $regex: listQuery.search, $options: "i" } }
      : {};

  const employees = await EmployeeModel.find({
    ...searchFilter,
    ...statusFilter,
  }).sort({
    [listQuery.sortField]: listQuery.sortOrder,
  });

  return employees.map((employee) => employee.toJSON() as Employee);
}

async function getBusinessProfile(): Promise<BusinessProfile> {
  const business = await BusinessProfileModel.findOneAndUpdate(
    {},
    {},
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return business.toJSON() as BusinessProfile;
}

export const employeesRouter = Router();

employeesRouter.get("/export", async (req, res) => {
  const listQuery = parseEmployeeListQuery(req.query);
  const employees = await findEmployees(listQuery);
  const business = await getBusinessProfile();
  const html = buildEmployeeListHtml(employees, business, {
    statusLabel: STATUS_LABELS[listQuery.status],
    search: listQuery.search,
  });

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.send(html);
});

employeesRouter.get("/", async (req, res) => {
  const employees = await findEmployees(parseEmployeeListQuery(req.query));
  return res.json(employees);
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
