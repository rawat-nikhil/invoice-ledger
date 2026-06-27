"use client";

import type { EmployeePayrollBreakdown } from "@repo/types";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EmployeeInputFormRow } from "@/lib/invoices/generate-validation";

type NumericField = Exclude<
  keyof EmployeeInputFormRow,
  "employeeId" | "employeeName"
>;

const NUMERIC_FIELDS: { key: NumericField; label: string }[] = [
  { key: "present", label: "Present" },
  { key: "otHours", label: "OT Hours" },
  { key: "gradeDays", label: "Grade Days" },
  { key: "canteenBill", label: "Canteen Bill" },
];

type EmployeeInputStepProps = {
  rows: EmployeeInputFormRow[];
  loading: boolean;
  error: string | null;
  onRowChange: (
    employeeId: string,
    field: NumericField,
    value: string,
  ) => void;
};

export function EmployeeInputStep({
  rows,
  loading,
  error,
  onRowChange,
}: EmployeeInputStepProps) {
  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Loading employees...</p>
    );
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[140px]">Employee</TableHead>
              {NUMERIC_FIELDS.map((field) => (
                <TableHead key={field.key} className="min-w-[120px]">
                  {field.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={NUMERIC_FIELDS.length + 1}
                  className="h-24 text-center text-muted-foreground"
                >
                  No employees found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.employeeId}>
                  <TableCell className="font-medium">
                    {row.employeeName}
                  </TableCell>
                  {NUMERIC_FIELDS.map((field) => (
                    <TableCell key={field.key}>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={row[field.key]}
                        onChange={(event) =>
                          onRowChange(
                            row.employeeId,
                            field.key,
                            event.target.value,
                          )
                        }
                        aria-label={`${field.label} for ${row.employeeName}`}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export type { EmployeePayrollBreakdown };
