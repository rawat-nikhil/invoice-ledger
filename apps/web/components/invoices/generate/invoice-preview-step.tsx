"use client";

import type { InvoiceTotals } from "@repo/types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDisplayDate, formatInr } from "@/lib/format";

type InvoicePreviewStepProps = {
  invoiceDate: Date;
  billingMonthLabel: string;
  employeeCount: number;
  totals: InvoiceTotals;
  submitting: boolean;
  error: string | null;
};

const SUMMARY_ROWS: Array<{
  key: keyof InvoiceTotals;
  label: string;
  highlight?: boolean;
}> = [
  { key: "totalPf", label: "Total PF" },
  { key: "totalEsi", label: "Total ESI" },
  { key: "serviceCharge", label: "Service Charge" },
  { key: "total", label: "Total" },
  { key: "sgst", label: "SGST (9%)" },
  { key: "cgst", label: "CGST (9%)" },
  { key: "totalPayable", label: "Total Payable", highlight: true },
];

export function InvoicePreviewStep({
  invoiceDate,
  billingMonthLabel,
  employeeCount,
  totals,
  submitting,
  error,
}: InvoicePreviewStepProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Final invoice preview</CardTitle>
          <CardDescription>
            Review totals before saving. Invoice number will be assigned
            automatically on confirmation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Billing month</dt>
              <dd className="font-medium">{billingMonthLabel}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Invoice date</dt>
              <dd className="font-medium">{formatDisplayDate(invoiceDate)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Employees</dt>
              <dd className="font-medium">{employeeCount}</dd>
            </div>
          </dl>

          <div className="rounded-lg border">
            <dl>
              {SUMMARY_ROWS.map((row) => (
                <div
                  key={row.key}
                  className={`flex items-center justify-between border-b px-4 py-3 last:border-b-0 ${
                    row.highlight ? "bg-muted/50 font-semibold" : ""
                  }`}
                >
                  <dt>{row.label}</dt>
                  <dd>{formatInr(totals[row.key])}</dd>
                </div>
              ))}
            </dl>
          </div>

          {submitting ? (
            <p className="text-sm text-muted-foreground">
              Saving invoice, salary slips, and generating PDF...
            </p>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
