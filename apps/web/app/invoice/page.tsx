"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Invoice } from "@repo/types";
import { Plus } from "lucide-react";

import { InvoiceFormDialog } from "@/components/invoices/invoice-form-dialog";
import { InvoiceTable } from "@/components/invoices/invoice-table";
import { buttonVariants } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { downloadInvoice, getInvoices } from "@/lib/api/invoices";
import { getBusinessProfile, getClient } from "@/lib/api/profile";
import { isBusinessProfileComplete, isClientComplete } from "@/lib/profile";
import { cn } from "@/lib/utils";

type DialogMode = "edit" | null;

export default function InvoicePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [addressesComplete, setAddressesComplete] = useState(true);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [data, business, client] = await Promise.all([
        getInvoices(),
        getBusinessProfile(),
        getClient(),
      ]);
      setInvoices(data);
      setAddressesComplete(
        isBusinessProfileComplete(business) && isClientComplete(client),
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load invoices.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchInvoices();
  }, [fetchInvoices]);

  function openEditDialog(invoice: Invoice) {
    setSelectedInvoice(invoice);
    setDialogMode("edit");
  }

  function closeDialog() {
    setDialogMode(null);
    setSelectedInvoice(null);
  }

  async function handleDownload(invoice: Invoice) {
    setDownloadError(null);
    setDownloadingId(invoice.id);

    try {
      await downloadInvoice(invoice.id);
    } catch (err) {
      setDownloadError(
        err instanceof ApiError ? err.message : "Failed to download invoice.",
      );
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Invoice</h1>
          <p className="text-muted-foreground">
            Manage monthly invoices, compliance status, and PDF exports.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Link
          href="/invoice/generate"
          className={cn(buttonVariants(), "inline-flex")}
        >
          <Plus />
          Generate Invoice
        </Link>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {downloadError ? (
        <p className="text-sm text-destructive">{downloadError}</p>
      ) : null}
      {!loading && !addressesComplete ? (
        <p className="text-sm text-warning">
          Business and client addresses are incomplete.{" "}
          <Link href="/profile" className="underline">
            Complete your profile
          </Link>{" "}
          to enable invoice downloads.
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading invoices...</p>
      ) : (
        <InvoiceTable
          invoices={invoices}
          downloadingId={downloadingId}
          downloadDisabled={!addressesComplete}
          onEdit={openEditDialog}
          onDownload={(invoice) => void handleDownload(invoice)}
        />
      )}

      <InvoiceFormDialog
        open={dialogMode === "edit"}
        mode="edit"
        invoice={selectedInvoice}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
        onSuccess={() => void fetchInvoices()}
      />
    </div>
  );
}
