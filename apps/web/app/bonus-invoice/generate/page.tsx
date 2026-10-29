"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { calculateBonusInvoiceTotals } from "@repo/payroll";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, Upload } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError } from "@/lib/api";
import { createBonusInvoice } from "@/lib/api/bonus-invoices";
import { parseBonusXlsxFile } from "@/lib/bonus-invoices/parse-bonus-xlsx";
import { toIsoDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type BonusFormRow = {
  payCode: string;
  name: string;
  totalDays: string;
  bonus: string;
};

function emptyRow(): BonusFormRow {
  return { payCode: "", name: "", totalDays: "0", bonus: "" };
}

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function parseAmount(value: string): number {
  if (value.trim() === "") {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function GenerateBonusInvoicePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [rows, setRows] = useState<BonusFormRow[]>([emptyRow()]);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const totals = useMemo(
    () =>
      calculateBonusInvoiceTotals(
        rows.map((row) => ({ bonus: parseAmount(row.bonus) })),
      ),
    [rows],
  );

  function updateRow(index: number, patch: Partial<BonusFormRow>) {
    setRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    );
  }

  async function handleImport(file: File) {
    setImporting(true);
    setError(null);
    setImportMessage(null);

    try {
      const { rows: imported, skippedZeroBonus } = await parseBonusXlsxFile(file);
      setRows(
        imported.map((row) => ({
          payCode: row.payCode,
          name: row.name,
          totalDays: String(row.totalDays),
          bonus: String(row.bonus),
        })),
      );
      const skippedLabel =
        skippedZeroBonus === 1
          ? "Skipped 1 row with no bonus."
          : `Skipped ${skippedZeroBonus} rows with no bonus.`;
      setImportMessage(
        `Imported ${imported.length} ${imported.length === 1 ? "employee" : "employees"}. ${skippedLabel}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import spreadsheet.");
    } finally {
      setImporting(false);
    }
  }

  async function handleSubmit() {
    setError(null);

    if (invoiceNumber.trim() === "") {
      setError("Invoice number is required.");
      return;
    }

    if (!invoiceDate) {
      setError("Invoice date is required.");
      return;
    }

    if (title.trim() === "") {
      setError("Bonus title is required.");
      return;
    }

    const employees = rows.map((row) => ({
      payCode: row.payCode.trim(),
      name: row.name.trim(),
      totalDays: parseAmount(row.totalDays),
      bonus: parseAmount(row.bonus),
    }));

    if (employees.length === 0) {
      setError("Add at least one employee.");
      return;
    }

    const invalid = employees.find(
      (row) =>
        row.payCode === "" ||
        row.name === "" ||
        row.bonus <= 0 ||
        row.totalDays < 0,
    );

    if (invalid) {
      setError("Each row needs a pay code, name, total days, and a bonus greater than 0.");
      return;
    }

    setSubmitting(true);

    try {
      await createBonusInvoice({
        invoiceNumber: invoiceNumber.trim(),
        invoiceDate: toIsoDate(invoiceDate),
        title: title.trim(),
        employees,
      });
      router.push("/bonus-invoice");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to create bonus invoice.",
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Generate Bonus Invoice
        </h1>
        <p className="text-muted-foreground">
          Import pay code, name, total days, and total bonus. The bill is the
          bonus total plus 6% service charge, then 9% CGST and 9% SGST.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="invoice-number">Invoice number</Label>
          <Input
            id="invoice-number"
            value={invoiceNumber}
            onChange={(event) => setInvoiceNumber(event.target.value)}
            placeholder="e.g. BON-001"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoice-date">Invoice date</Label>
          <Popover>
            <PopoverTrigger
              id="invoice-date"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full justify-start text-left font-normal",
                !invoiceDate && "text-muted-foreground",
              )}
            >
              <CalendarIcon />
              {invoiceDate ? format(invoiceDate, "PPP") : "Select invoice date"}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={invoiceDate}
                onSelect={setInvoiceDate}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bonus-title">Title on bonus</Label>
        <Input
          id="bonus-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Diwali Bonus (Primitive maintenance service)"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void handleImport(file);
            }
            event.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={importing}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="size-4" />
          {importing ? "Importing..." : "Import from Excel"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setRows((current) => [...current, emptyRow()])}
        >
          <Plus className="size-4" />
          Add row
        </Button>
        {importMessage ? (
          <p className="text-sm text-muted-foreground">{importMessage}</p>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Pay code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Total days</TableHead>
              <TableHead>Bonus</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={`${row.payCode}-${index}`}>
                <TableCell>
                  <Input
                    value={row.payCode}
                    aria-label={`Pay code for row ${index + 1}`}
                    onChange={(event) =>
                      updateRow(index, { payCode: event.target.value })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.name}
                    aria-label={`Name for row ${index + 1}`}
                    onChange={(event) =>
                      updateRow(index, { name: event.target.value })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    step="0.5"
                    value={row.totalDays}
                    aria-label={`Total days for row ${index + 1}`}
                    onChange={(event) =>
                      updateRow(index, { totalDays: event.target.value })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={row.bonus}
                    aria-label={`Bonus for row ${index + 1}`}
                    onChange={(event) =>
                      updateRow(index, { bonus: event.target.value })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove row ${index + 1}`}
                    onClick={() =>
                      setRows((current) =>
                        current.filter((_, rowIndex) => rowIndex !== index),
                      )
                    }
                  >
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Bonus total</TableCell>
              <TableCell>{formatInr(totals.bonusTotal)}</TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <div className="ml-auto max-w-sm space-y-2 rounded-lg border p-4 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatInr(totals.bonusTotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Service charge (6%)</span>
          <span>{formatInr(totals.serviceCharge)}</span>
        </div>
        <div className="flex justify-between">
          <span>CGST (9%)</span>
          <span>{formatInr(totals.cgst)}</span>
        </div>
        <div className="flex justify-between">
          <span>SGST (9%)</span>
          <span>{formatInr(totals.sgst)}</span>
        </div>
        <div className="flex justify-between border-t pt-2 font-semibold">
          <span>Balance due</span>
          <span>{formatInr(totals.totalPayable)}</span>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex gap-3">
        <Button type="button" disabled={submitting} onClick={() => void handleSubmit()}>
          {submitting ? "Saving..." : "Save bonus invoice"}
        </Button>
        <Link
          href="/bonus-invoice"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}
