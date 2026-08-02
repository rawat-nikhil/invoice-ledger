import { read, utils } from "xlsx";
import type { Employee } from "@repo/types";

import { createEmptyEmployeeInput, type EmployeeInputFormRow } from "./generate-validation";

const HEADER_ALIASES: Record<string, string[]> = {
  payCode: ["pay_code", "paycode", "employee_code", "employeecode", "code"],
  present: ["present"],
  gradeDays: ["grade_days", "gradedays"],
  otHours: ["ot_hours", "othours", "ot"],
  canteenBill: ["canteen", "canteen_bill", "canteenbill"],
};

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, "_");
}

function buildHeaderIndex(headerRow: unknown[]): Map<string, number> {
  const index = new Map<string, number>();

  headerRow.forEach((cell, columnIndex) => {
    if (typeof cell !== "string") {
      return;
    }

    const normalized = normalizeHeader(cell);

    for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
      if (aliases.includes(normalized) && !index.has(field)) {
        index.set(field, columnIndex);
      }
    }
  });

  return index;
}

function toNumber(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export type XlsxImportResult = {
  rows: EmployeeInputFormRow[];
  matchedCount: number;
  unmatchedCodes: string[];
};

export async function parseEmployeeXlsxFile(
  file: File,
  employees: Employee[],
): Promise<XlsxImportResult> {
  const buffer = await file.arrayBuffer();
  const workbook = read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error("The workbook has no sheets.");
  }

  const sheet = workbook.Sheets[sheetName];
  const grid = utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    blankrows: false,
  });

  if (grid.length === 0) {
    throw new Error("The sheet is empty.");
  }

  const [headerRow, ...dataRows] = grid;
  const headerIndex = buildHeaderIndex(headerRow);
  const payCodeColumn = headerIndex.get("payCode");

  if (payCodeColumn === undefined) {
    throw new Error(
      'Could not find a "pay_code" column. Expected headers: pay_code, present, grade_days, ot_hours, canteen.',
    );
  }

  const inputsByCode = new Map<
    string,
    { present: number; gradeDays: number; otHours: number; canteenBill: number }
  >();

  for (const row of dataRows) {
    const rawCode = row[payCodeColumn];

    if (rawCode === undefined || rawCode === null || String(rawCode).trim() === "") {
      continue;
    }

    const code = String(rawCode).trim().toUpperCase();

    inputsByCode.set(code, {
      present: toNumber(headerIndex.has("present") ? row[headerIndex.get("present")!] : 0),
      gradeDays: toNumber(headerIndex.has("gradeDays") ? row[headerIndex.get("gradeDays")!] : 0),
      otHours: toNumber(headerIndex.has("otHours") ? row[headerIndex.get("otHours")!] : 0),
      canteenBill: toNumber(
        headerIndex.has("canteenBill") ? row[headerIndex.get("canteenBill")!] : 0,
      ),
    });
  }

  const matchedCodes = new Set<string>();

  const rows = employees.map((employee) => {
    const code = employee.employeeCode.trim().toUpperCase();
    const sheetInput = inputsByCode.get(code);

    if (!sheetInput) {
      return createEmptyEmployeeInput(employee);
    }

    matchedCodes.add(code);

    return {
      employeeId: employee.id,
      employeeName: employee.name,
      present: sheetInput.present,
      gradeDays: sheetInput.gradeDays,
      otHours: sheetInput.otHours,
      canteenBill: sheetInput.canteenBill,
    };
  });

  const unmatchedCodes = [...inputsByCode.keys()].filter(
    (code) => !matchedCodes.has(code),
  );

  return { rows, matchedCount: matchedCodes.size, unmatchedCodes };
}
