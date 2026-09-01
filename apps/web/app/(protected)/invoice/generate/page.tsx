"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Employee } from "@repo/types";
import {
  billingMonthToIso,
  calculateEmployeeRow,
  calculateInvoiceTotals,
  formatMonthYear,
} from "@repo/payroll";

import { EmployeeInputStep } from "@/components/invoices/generate/employee-input-step";
import { GenerateStepIndicator } from "@/components/invoices/generate/generate-step-indicator";
import { InvoiceMetaStep } from "@/components/invoices/generate/invoice-meta-step";
import { InvoicePreviewStep } from "@/components/invoices/generate/invoice-preview-step";
import { SalaryCalculationStep } from "@/components/invoices/generate/salary-calculation-step";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { getEmployees } from "@/lib/api/employees";
import { downloadInvoice, generateInvoice } from "@/lib/api/invoices";
import { getBusinessProfile, getClient } from "@/lib/api/profile";
import { toIsoDate } from "@/lib/format";
import { isBusinessProfileComplete, isClientComplete } from "@/lib/profile";
import {
  clearGenerateDraft,
  loadGenerateDraft,
  mergeEmployeeInputs,
  saveGenerateDraft,
  toGenerateDraft,
  type GenerateStep,
} from "@/lib/invoices/generate-draft";
import {
  createEmptyEmployeeInput,
  type EmployeeInputFormRow,
  validateEmployeeInputs,
} from "@/lib/invoices/generate-validation";
import { parseEmployeeXlsxFile } from "@/lib/invoices/parse-employee-xlsx";

type GenerateFormData = {
  invoiceNumber: string;
  invoiceDate: Date | undefined;
  billingMonth: string;
  acknowledged: boolean;
  employeeInputs: EmployeeInputFormRow[];
};

function createInitialFormData(): GenerateFormData {
  const draft = loadGenerateDraft();

  return {
    invoiceNumber: draft?.invoiceNumber ?? "",
    invoiceDate: draft?.invoiceDate ? new Date(draft.invoiceDate) : undefined,
    billingMonth: draft?.billingMonth ?? "",
    acknowledged: draft?.acknowledged ?? false,
    employeeInputs: [],
  };
}

function createInitialStep(): GenerateStep {
  return loadGenerateDraft()?.currentStep ?? 1;
}

export default function GenerateInvoicePage() {
  const router = useRouter();
  const draftRef = useRef(loadGenerateDraft());
  const [currentStep, setCurrentStep] = useState<GenerateStep>(createInitialStep);
  const [formData, setFormData] = useState<GenerateFormData>(createInitialFormData);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [employeesReady, setEmployeesReady] = useState(false);
  const [employeeError, setEmployeeError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [addressesComplete, setAddressesComplete] = useState(true);
  const [checkingAddresses, setCheckingAddresses] = useState(true);

  const fetchEmployees = useCallback(async () => {
    setLoadingEmployees(true);
    setEmployeeError(null);

    try {
      const data = await getEmployees({ sort: "employeeCode", order: "asc" });
      setEmployees(data);
      setFormData((prev) => ({
        ...prev,
        employeeInputs: mergeEmployeeInputs(
          data,
          draftRef.current?.employeeInputs,
        ),
      }));
      setEmployeesReady(true);
    } catch (err) {
      setEmployeeError(
        err instanceof ApiError ? err.message : "Failed to load employees.",
      );
    } finally {
      setLoadingEmployees(false);
    }
  }, []);

  useEffect(() => {
    void fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    let cancelled = false;

    async function checkAddresses() {
      setCheckingAddresses(true);

      try {
        const [business, client] = await Promise.all([
          getBusinessProfile(),
          getClient(),
        ]);

        if (!cancelled) {
          setAddressesComplete(
            isBusinessProfileComplete(business) && isClientComplete(client),
          );
        }
      } catch {
        if (!cancelled) {
          setAddressesComplete(false);
        }
      } finally {
        if (!cancelled) {
          setCheckingAddresses(false);
        }
      }
    }

    void checkAddresses();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!employeesReady) {
      return;
    }

    saveGenerateDraft(toGenerateDraft(currentStep, formData, toIsoDate));
  }, [currentStep, formData, employeesReady]);

  const employeeMap = useMemo(
    () => new Map(employees.map((employee) => [employee.id, employee])),
    [employees],
  );

  const breakdown = useMemo(
    () => {
      if (!formData.billingMonth) {
        return [];
      }

      const billingMonthIso = billingMonthToIso(formData.billingMonth);

      return formData.employeeInputs.flatMap((input) => {
        const employee = employeeMap.get(input.employeeId);

        if (!employee) {
          return [];
        }

        return [calculateEmployeeRow(employee, input, billingMonthIso)];
      });
    },
    [formData.employeeInputs, formData.billingMonth, employeeMap],
  );

  const totals = useMemo(
    () => calculateInvoiceTotals(breakdown),
    [breakdown],
  );

  const billingMonthLabel = useMemo(
    () =>
      formData.billingMonth
        ? formatMonthYear(billingMonthToIso(formData.billingMonth))
        : "",
    [formData.billingMonth],
  );

  const step1Valid =
    formData.invoiceNumber.trim() !== "" &&
    formData.invoiceDate !== undefined &&
    formData.billingMonth !== "" &&
    formData.acknowledged;

  function handleEmployeeFieldChange(
    employeeId: string,
    field: keyof Omit<EmployeeInputFormRow, "employeeId" | "employeeName">,
    value: string,
  ) {
    const parsed = value === "" ? 0 : Number.parseFloat(value);

    setFormData((prev) => ({
      ...prev,
      employeeInputs: prev.employeeInputs.map((row) =>
        row.employeeId === employeeId
          ? {
              ...row,
              [field]: Number.isNaN(parsed) ? 0 : parsed,
            }
          : row,
      ),
    }));
  }

  async function handleImportXlsx(file: File) {
    setImporting(true);
    setImportMessage(null);
    setValidationError(null);

    try {
      const { rows, matchedCount, unmatchedCodes } = await parseEmployeeXlsxFile(
        file,
        employees,
      );

      setFormData((prev) => ({ ...prev, employeeInputs: rows }));

      const messages = [`Imported ${matchedCount} of ${employees.length} employees.`];

      if (unmatchedCodes.length > 0) {
        messages.push(
          `${unmatchedCodes.length} code(s) in the sheet did not match any employee: ${unmatchedCodes.join(", ")}.`,
        );
      }

      setImportMessage(messages.join(" "));
    } catch (err) {
      setImportMessage(
        err instanceof Error ? err.message : "Failed to import the sheet.",
      );
    } finally {
      setImporting(false);
    }
  }

  function handleReset() {
    clearGenerateDraft();
    draftRef.current = null;
    setCurrentStep(1);
    setFormData({
      invoiceNumber: "",
      invoiceDate: undefined,
      billingMonth: "",
      acknowledged: false,
      employeeInputs: employees.map(createEmptyEmployeeInput),
    });
    setValidationError(null);
    setSubmitError(null);
    setImportMessage(null);
  }

  function handleNext() {
    setValidationError(null);

    if (currentStep === 1) {
      if (!step1Valid) {
        return;
      }
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!formData.billingMonth) {
        return;
      }

      const error = validateEmployeeInputs(
        formData.employeeInputs,
        formData.billingMonth,
      );

      if (error) {
        setValidationError(error);
        return;
      }

      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      setCurrentStep(4);
    }
  }

  function handleBack() {
    setValidationError(null);
    setSubmitError(null);

    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as GenerateStep);
    }
  }

  async function handleConfirm() {
    if (!formData.invoiceDate || !formData.billingMonth) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const invoice = await generateInvoice({
        invoiceNumber: formData.invoiceNumber.trim(),
        invoiceDate: toIsoDate(formData.invoiceDate),
        billingMonth: formData.billingMonth,
        employeeInputs: formData.employeeInputs.map(
          ({ employeeId, present, otHours, gradeDays, canteenBill }) => ({
            employeeId,
            present,
            otHours,
            gradeDays,
            canteenBill,
          }),
        ),
      });

      await downloadInvoice(invoice.id);
      clearGenerateDraft();
      draftRef.current = null;
      router.push("/invoice");
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : "Failed to generate invoice.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Generate Invoice
          </h1>
          <p className="text-muted-foreground">
            Complete all steps to calculate payroll, save records, and export the
            invoice PDF. Your progress is saved for this browser tab.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={submitting}
        >
          Reset form
        </Button>
      </div>

      <GenerateStepIndicator currentStep={currentStep} />

      {validationError ? (
        <p className="text-sm text-destructive">{validationError}</p>
      ) : null}

      {currentStep === 1 ? (
        <InvoiceMetaStep
          invoiceNumber={formData.invoiceNumber}
          invoiceDate={formData.invoiceDate}
          billingMonth={formData.billingMonth}
          acknowledged={formData.acknowledged}
          onInvoiceNumberChange={(invoiceNumber) =>
            setFormData((prev) => ({ ...prev, invoiceNumber }))
          }
          onInvoiceDateChange={(date) =>
            setFormData((prev) => ({ ...prev, invoiceDate: date }))
          }
          onBillingMonthChange={(billingMonth) =>
            setFormData((prev) => ({ ...prev, billingMonth }))
          }
          onAcknowledgedChange={(acknowledged) =>
            setFormData((prev) => ({ ...prev, acknowledged }))
          }
        />
      ) : null}

      {currentStep === 2 ? (
        <EmployeeInputStep
          rows={formData.employeeInputs}
          loading={loadingEmployees}
          error={employeeError}
          onRowChange={handleEmployeeFieldChange}
          onImportFile={(file) => void handleImportXlsx(file)}
          importing={importing}
          importMessage={importMessage}
        />
      ) : null}

      {currentStep === 3 ? (
        <SalaryCalculationStep breakdown={breakdown} />
      ) : null}

      {currentStep === 4 && formData.invoiceDate && formData.billingMonth ? (
        <InvoicePreviewStep
          invoiceDate={formData.invoiceDate}
          billingMonthLabel={billingMonthLabel}
          employeeCount={breakdown.length}
          totals={totals}
          submitting={submitting}
          error={submitError}
        />
      ) : null}

      {currentStep === 4 && !checkingAddresses && !addressesComplete ? (
        <p className="text-sm text-warning">
          Business and client addresses are incomplete. Complete your{" "}
          <Link href="/profile" className="underline">
            profile
          </Link>{" "}
          before generating an invoice.
        </p>
      ) : null}

      <div className="flex items-center justify-between border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1 || submitting}
        >
          Back
        </Button>

        {currentStep < 4 ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={
              (currentStep === 1 && !step1Valid) ||
              (currentStep === 2 && (loadingEmployees || !!employeeError))
            }
          >
            Next
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={submitting || checkingAddresses || !addressesComplete}
          >
            Confirm & Generate
          </Button>
        )}
      </div>
    </div>
  );
}
