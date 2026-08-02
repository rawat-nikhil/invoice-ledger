import type { Employee, EmployeeInvoiceInput } from "@repo/types";
import { formatMonthYear, getCalendarDaysInMonth } from "@repo/payroll";

import { toIsoDate } from "@/lib/format";

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
  invoiceDate: Date,
): string | null {
  if (inputs.length === 0) {
    return "At least one employee is required.";
  }

  const daysInMonth = getCalendarDaysInMonth(toIsoDate(invoiceDate));
  const monthYear = formatMonthYear(toIsoDate(invoiceDate));

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

    if (row.present > daysInMonth) {
      return `Present days cannot exceed ${daysInMonth} for ${monthYear} (${row.employeeName}).`;
    }

    if (row.gradeDays > daysInMonth) {
      return `Grade days cannot exceed ${daysInMonth} for ${monthYear} (${row.employeeName}).`;
    }
  }

  return null;
}
