import type { Employee, EmployeeInvoiceInput } from "@repo/types";

export type EmployeeInputFormRow = EmployeeInvoiceInput & {
  employeeName: string;
};

export function createEmptyEmployeeInput(employee: Employee): EmployeeInputFormRow {
  return {
    employeeId: employee.id,
    employeeName: employee.name,
    present: 0,
    otHours: 0,
    gradeDays: 0,
    canteenBill: 0,
  };
}

export function validateEmployeeInputs(
  inputs: EmployeeInputFormRow[],
): string | null {
  if (inputs.length === 0) {
    return "At least one employee is required.";
  }

  for (const row of inputs) {
    const fields: Array<[string, number]> = [
      ["present", row.present],
      ["OT hours", row.otHours],
      ["grade days", row.gradeDays],
      ["canteen bill", row.canteenBill],
    ];

    for (const [label, value] of fields) {
      if (!Number.isFinite(value) || value < 0) {
        return `Invalid ${label} for ${row.employeeName}.`;
      }
    }

    if (row.present > 26) {
      return `Present days cannot exceed 26 for ${row.employeeName}.`;
    }

    if (row.gradeDays > 26) {
      return `Grade days cannot exceed 26 for ${row.employeeName}.`;
    }
  }

  return null;
}
