"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { BonusInvoice } from "@repo/types";
import { Download, Plus, Trash2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError } from "@/lib/api";
import {
  deleteBonusInvoice,
  downloadBonusInvoice,
  getBonusInvoices,
} from "@/lib/api/bonus-invoices";
import { getBusinessProfile, getClient } from "@/lib/api/profile";
import { isBusinessProfileComplete, isClientComplete } from "@/lib/profile";
import { cn } from "@/lib/utils";

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BonusInvoicePage() {
  const [invoices, setInvoices] = useState<BonusInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [addressesComplete, setAddressesComplete] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [data, business, client] = await Promise.all([
          getBonusInvoices(),
          getBusinessProfile(),
          getClient(),
        ]);

        if (cancelled) {
          return;
        }

        setInvoices(data);
        setAddressesComplete(
          isBusinessProfileComplete(business) && isClientComplete(client),
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Failed to load bonus invoices.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDownload(invoice: BonusInvoice) {
    setDownloadError(null);
    setDownloadingId(invoice.id);

    try {
      await downloadBonusInvoice(invoice.id);
    } catch (err) {
      setDownloadError(
        err instanceof ApiError
          ? err.message
          : "Failed to download bonus invoice.",
      );
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleDelete(invoice: BonusInvoice) {
    const confirmed = window.confirm(
      `Delete bonus invoice ${invoice.invoiceNumber}?`,
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setDeletingId(invoice.id);

    try {
      await deleteBonusInvoice(invoice.id);
      setInvoices((current) => current.filter((item) => item.id !== invoice.id));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to delete bonus invoice.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Bonus Invoice</h1>
        <p className="text-muted-foreground">
          Generate a single-page invoice for employee bonuses, with service
          charge and GST.
        </p>
      </div>

      <div className="flex justify-end">
        <Link
          href="/bonus-invoice/generate"
          className={cn(buttonVariants(), "inline-flex")}
        >
          <Plus />
          Generate Bonus Invoice
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
        <p className="text-sm text-muted-foreground">Loading bonus invoices...</p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent [&>th]:font-semibold">
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Payable</TableHead>
                <TableHead className="w-25 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No bonus invoices found.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                    <TableCell>{invoice.title}</TableCell>
                    <TableCell>{formatInr(invoice.totalPayable)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Download bonus invoice ${invoice.invoiceNumber}`}
                          title={
                            addressesComplete
                              ? undefined
                              : "Complete business and client addresses in Profile to download invoices"
                          }
                          disabled={
                            !addressesComplete || downloadingId === invoice.id
                          }
                          onClick={() => void handleDownload(invoice)}
                        >
                          <Download />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete bonus invoice ${invoice.invoiceNumber}`}
                          disabled={deletingId === invoice.id}
                          onClick={() => void handleDelete(invoice)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
