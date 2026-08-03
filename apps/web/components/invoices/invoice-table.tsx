"use client";

import type { Invoice } from "@repo/types";
import { Download, Pencil } from "lucide-react";

import { ComplianceStatusBadge } from "@/components/invoices/compliance-status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type InvoiceTableProps = {
  invoices: Invoice[];
  downloadingId: string | null;
  downloadDisabled?: boolean;
  onEdit: (invoice: Invoice) => void;
  onDownload: (invoice: Invoice) => void;
};

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

function ComplianceCell({
  amount,
  status,
}: {
  amount: number;
  status: Invoice["gst"]["status"];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span>{formatInr(amount)}</span>
      <ComplianceStatusBadge status={status} />
    </div>
  );
}

function SettledIndicator({ settled }: { settled: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "size-2.5 shrink-0 rounded-full",
          settled ? "bg-success" : "bg-destructive",
        )}
        aria-hidden
      />
      <span className="sr-only">{settled ? "Settled" : "Not settled"}</span>
    </div>
  );
}

export function InvoiceTable({
  invoices,
  downloadingId,
  downloadDisabled = false,
  onEdit,
  onDownload,
}: InvoiceTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent [&>th]:font-semibold">
            <TableHead>Invoice #</TableHead>
            <TableHead>Month-Year</TableHead>
            <TableHead>Total Bill</TableHead>
            <TableHead>Service Charge</TableHead>
            <TableHead>GST</TableHead>
            <TableHead>ESIC</TableHead>
            <TableHead>Settled</TableHead>
            <TableHead className="w-25 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="h-24 text-center text-muted-foreground"
              >
                No invoices found.
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">
                  {invoice.invoiceNumber}
                </TableCell>
                <TableCell>{invoice.monthYear}</TableCell>
                <TableCell>{formatInr(invoice.totalBill)}</TableCell>
                <TableCell>{formatInr(invoice.serviceCharge)}</TableCell>
                <TableCell>
                  <ComplianceCell
                    amount={invoice.gst.amount}
                    status={invoice.gst.status}
                  />
                </TableCell>
                <TableCell>
                  <ComplianceCell
                    amount={invoice.esic.amount}
                    status={invoice.esic.status}
                  />
                </TableCell>
                <TableCell>
                  <SettledIndicator settled={invoice.settled} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit invoice ${invoice.invoiceNumber}`}
                      onClick={() => onEdit(invoice)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Download invoice ${invoice.invoiceNumber}`}
                      title={
                        downloadDisabled
                          ? "Complete business and client addresses in Profile to download invoices"
                          : undefined
                      }
                      disabled={downloadDisabled || downloadingId === invoice.id}
                      onClick={() => onDownload(invoice)}
                    >
                      <Download />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
