import type { Employee } from "@repo/types";

import {
  createEmptyEmployeeInput,
  type EmployeeInputFormRow,
} from "./generate-validation";

const STORAGE_KEY = "invoice-generate-draft";

export type GenerateStep = 1 | 2 | 3 | 4;

export type SavedEmployeeInput = {
  employeeId: string;
  present: number;
  otHours: number;
  gradeDays: number;
  canteenBill: number;
};

export type GenerateDraft = {
  currentStep: GenerateStep;
  invoiceNumber: string;
  invoiceDate: string | null;
  billingMonth: string | null;
  acknowledged: boolean;
  employeeInputs: SavedEmployeeInput[];
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isValidStep(step: unknown): step is GenerateStep {
  return step === 1 || step === 2 || step === 3 || step === 4;
}

function isValidSavedRow(row: unknown): row is SavedEmployeeInput {
  if (!row || typeof row !== "object") {
    return false;
  }

  const candidate = row as Record<string, unknown>;

  return (
    typeof candidate.employeeId === "string" &&
    typeof candidate.present === "number" &&
    typeof candidate.otHours === "number" &&
    typeof candidate.gradeDays === "number" &&
    typeof candidate.canteenBill === "number"
  );
}

export function loadGenerateDraft(): GenerateDraft | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<GenerateDraft>;

    if (!isValidStep(parsed.currentStep)) {
      return null;
    }

    if (typeof parsed.acknowledged !== "boolean") {
      return null;
    }

    if (
      parsed.invoiceNumber !== undefined &&
      typeof parsed.invoiceNumber !== "string"
    ) {
      return null;
    }

    if (
      parsed.invoiceDate !== null &&
      parsed.invoiceDate !== undefined &&
      typeof parsed.invoiceDate !== "string"
    ) {
      return null;
    }

    if (
      parsed.billingMonth !== null &&
      parsed.billingMonth !== undefined &&
      typeof parsed.billingMonth !== "string"
    ) {
      return null;
    }

    if (!Array.isArray(parsed.employeeInputs)) {
      return null;
    }

    if (!parsed.employeeInputs.every(isValidSavedRow)) {
      return null;
    }

    return {
      currentStep: parsed.currentStep,
      invoiceNumber: parsed.invoiceNumber ?? "",
      invoiceDate: parsed.invoiceDate ?? null,
      billingMonth: parsed.billingMonth ?? null,
      acknowledged: parsed.acknowledged,
      employeeInputs: parsed.employeeInputs,
    };
  } catch {
    return null;
  }
}

export function saveGenerateDraft(draft: GenerateDraft): void {
  if (!isBrowser()) {
    return;
  }

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function clearGenerateDraft(): void {
  if (!isBrowser()) {
    return;
  }

  sessionStorage.removeItem(STORAGE_KEY);
}

export function mergeEmployeeInputs(
  employees: Employee[],
  saved?: SavedEmployeeInput[],
): EmployeeInputFormRow[] {
  const savedMap = new Map(saved?.map((row) => [row.employeeId, row]) ?? []);

  return employees.map((employee) => {
    const savedRow = savedMap.get(employee.id);

    if (savedRow) {
      return {
        employeeId: employee.id,
        employeeName: employee.name,
        present: savedRow.present,
        otHours: savedRow.otHours,
        gradeDays: savedRow.gradeDays,
        canteenBill: savedRow.canteenBill,
      };
    }

    return createEmptyEmployeeInput(employee);
  });
}

export function toGenerateDraft(
  currentStep: GenerateStep,
  formData: {
    invoiceNumber: string;
    invoiceDate: Date | undefined;
    billingMonth: string;
    acknowledged: boolean;
    employeeInputs: EmployeeInputFormRow[];
  },
  isoDate: (date: Date) => string,
): GenerateDraft {
  return {
    currentStep,
    invoiceNumber: formData.invoiceNumber,
    invoiceDate: formData.invoiceDate ? isoDate(formData.invoiceDate) : null,
    billingMonth: formData.billingMonth || null,
    acknowledged: formData.acknowledged,
    employeeInputs: formData.employeeInputs.map(
      ({ employeeId, present, otHours, gradeDays, canteenBill }) => ({
        employeeId,
        present,
        otHours,
        gradeDays,
        canteenBill,
      }),
    ),
  };
}
