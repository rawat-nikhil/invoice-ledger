import type {
  Employee,
  EmployeeInvoiceInput,
  EmployeePayrollBreakdown,
  InvoiceTotals,
} from "@repo/types";

import {
  EMPLOYER_ESI_RATE,
  EMPLOYER_PF_RATE,
  ESI_RATE,
  GST_RATE,
  HOURS_PER_DAY,
  PF_RATE,
  SERVICE_CHARGE_RATE,
  WORKING_DAYS,
} from "./constants";
import { round2 } from "./round";

export function getCalendarDaysInMonth(isoDate: string): number {
  const date = new Date(isoDate);
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/** Converts a billing month (`YYYY-MM`) to the first day of that month as ISO date. */
export function billingMonthToIso(billingMonth: string): string {
  return `${billingMonth}-01`;
}

export function calculateEmployeeRow(
  employee: Employee,
  input: EmployeeInvoiceInput,
  invoiceDate: string,
): EmployeePayrollBreakdown {
  const daysInMonth = getCalendarDaysInMonth(invoiceDate);

  const basicAmount = round2(
    (employee.basicPay / daysInMonth) * input.present,
  );
  const washingAllowance = round2(
    (employee.washingAllowance / daysInMonth) * input.present,
  );
  const adjustmentAllowance = round2(
    (employee.adjustmentAllowance / daysInMonth) * input.present,
  );
  const washingAllowanceAmount = washingAllowance;
  const adjustmentAllowanceAmount = adjustmentAllowance;
  const gradeAmount = round2(employee.gradeRate * input.gradeDays);
  const otBaseMonthly =
    employee.basicPay + employee.washingAllowance + employee.adjustmentAllowance;
  const otAmount = round2(
    (otBaseMonthly / WORKING_DAYS / HOURS_PER_DAY) * input.otHours,
  );
  const totalKr = round2(
    basicAmount +
      washingAllowanceAmount +
      adjustmentAllowanceAmount +
      gradeAmount +
      otAmount
  );
  const pf = round2(basicAmount * PF_RATE);
  const esi = round2((totalKr/100) * ESI_RATE);
  const payableAmount = round2(totalKr - pf - esi - input.canteenBill);

  return {
    ...input,
    adjustmentAllowance,
    washingAllowance,
    employeeName: employee.name,
    employeeCode: employee.employeeCode,
    basicPay: employee.basicPay,
    gradeRate: employee.gradeRate,
    basicAmount,
    washingAllowanceAmount,
    adjustmentAllowanceAmount,
    gradeAmount,
    otAmount,
    totalKr,
    pf,
    esi,
    payableAmount,
  };
}

export function calculateInvoiceTotals(
  breakdown: EmployeePayrollBreakdown[],
): InvoiceTotals {
  const totalPf = round2(breakdown.reduce((sum, row) => sum + row.basicAmount, 0) * EMPLOYER_PF_RATE);
  const totalEsi = round2(breakdown.reduce((sum, row) => sum + row.totalKr, 0) * EMPLOYER_ESI_RATE);
  const sumTotalKr = round2(
    breakdown.reduce((sum, row) => sum + row.totalKr, 0),
  );
  const serviceCharge = round2(sumTotalKr * SERVICE_CHARGE_RATE);
  const total = round2(sumTotalKr + totalPf + totalEsi + serviceCharge);
  const sgst = round2(total * GST_RATE);
  const cgst = round2(total * GST_RATE);
  const totalPayable = round2(total + sgst + cgst);

  return {
    totalPf,
    totalEsi,
    serviceCharge,
    total,
    sgst,
    cgst,
    totalPayable,
  };
}

export function formatMonthYear(isoDate: string): string {
  const date = new Date(isoDate);
  const month = date.toLocaleDateString("en-IN", { month: "short" });
  const year = date.getFullYear();
  return `${month}-${year}`;
}
