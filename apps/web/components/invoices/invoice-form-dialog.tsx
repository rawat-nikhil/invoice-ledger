"use client";

import { useEffect, useState } from "react";
import type {
  ComplianceStatus,
  CreateInvoiceInput,
  Invoice,
  UpdateInvoiceInput,
} from "@repo/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api";
import { createInvoice, updateInvoice } from "@/lib/api/invoices";

type InvoiceFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  invoice?: Invoice | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

type FormState = {
  invoiceNumber: string;
  monthYear: string;
  totalBill: string;
  serviceCharge: string;
  gstAmount: string;
  gstStatus: ComplianceStatus;
  esicAmount: string;
  esicStatus: ComplianceStatus;
  settled: boolean;
};

const DEFAULT_FORM: FormState = {
  invoiceNumber: "",
  monthYear: "",
  totalBill: "",
  serviceCharge: "",
  gstAmount: "0",
  gstStatus: "not-generated",
  esicAmount: "0",
  esicStatus: "not-generated",
  settled: false,
};

function toFormState(invoice: Invoice): FormState {
  return {
    invoiceNumber: invoice.invoiceNumber,
    monthYear: invoice.monthYear,
    totalBill: String(invoice.totalBill),
    serviceCharge: String(invoice.serviceCharge),
    gstAmount: String(invoice.gst.amount),
    gstStatus: invoice.gst.status,
    esicAmount: String(invoice.esic.amount),
    esicStatus: invoice.esic.status,
    settled: invoice.settled,
  };
}

export function InvoiceFormDialog({
  open,
  mode,
  invoice,
  onOpenChange,
  onSuccess,
}: InvoiceFormDialogProps) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);
    setForm(
      mode === "edit" && invoice ? toFormState(invoice) : DEFAULT_FORM,
    );
  }, [open, mode, invoice]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const totalBill = Number(form.totalBill);
    const serviceCharge = Number(form.serviceCharge);
    const gstAmount = Number(form.gstAmount);
    const esicAmount = Number(form.esicAmount);

    if (
      !form.monthYear.trim() ||
      Number.isNaN(totalBill) ||
      Number.isNaN(serviceCharge) ||
      Number.isNaN(gstAmount) ||
      Number.isNaN(esicAmount)
    ) {
      setError("Please fill in all required fields with valid values.");
      setSubmitting(false);
      return;
    }

    if (mode === "create" && !form.invoiceNumber.trim()) {
      setError("Invoice number is required.");
      setSubmitting(false);
      return;
    }

    const sharedPayload: UpdateInvoiceInput = {
      monthYear: form.monthYear.trim(),
      totalBill,
      serviceCharge,
      gst: { amount: gstAmount, status: form.gstStatus },
      esic: { amount: esicAmount, status: form.esicStatus },
      settled: form.settled,
    };

    try {
      if (mode === "create") {
        const payload: CreateInvoiceInput = {
          invoiceNumber: form.invoiceNumber.trim(),
          ...sharedPayload,
        };
        await createInvoice(payload);
      } else if (invoice) {
        await updateInvoice(invoice.id, sharedPayload);
      }

      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to save invoice.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Invoice" : "Edit Invoice"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              value={form.invoiceNumber}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  invoiceNumber: event.target.value,
                }))
              }
              disabled={mode === "edit"}
              readOnly={mode === "edit"}
              placeholder="INV-001"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthYear">Month-Year</Label>
            <Input
              id="monthYear"
              value={form.monthYear}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  monthYear: event.target.value,
                }))
              }
              placeholder="Jan-2026"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="totalBill">Total Bill</Label>
              <Input
                id="totalBill"
                type="number"
                step="any"
                value={form.totalBill}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    totalBill: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceCharge">Service Charge</Label>
              <Input
                id="serviceCharge"
                type="number"
                step="any"
                value={form.serviceCharge}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    serviceCharge: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-3 rounded-lg border p-4">
            <p className="text-sm font-medium">GST</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gstAmount">Amount</Label>
                <Input
                  id="gstAmount"
                  type="number"
                  step="any"
                  value={form.gstAmount}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      gstAmount: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.gstStatus}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      gstStatus: value as ComplianceStatus,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="not-generated">Not Generated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border p-4">
            <p className="text-sm font-medium">ESIC</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="esicAmount">Amount</Label>
                <Input
                  id="esicAmount"
                  type="number"
                  step="any"
                  value={form.esicAmount}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      esicAmount: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.esicStatus}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      esicStatus: value as ComplianceStatus,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="not-generated">Not Generated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <Label htmlFor="settled">Settled</Label>
            <Switch
              id="settled"
              checked={form.settled}
              onCheckedChange={(checked) =>
                setForm((current) => ({ ...current, settled: checked }))
              }
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Saving..."
                : mode === "create"
                  ? "Create"
                  : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
