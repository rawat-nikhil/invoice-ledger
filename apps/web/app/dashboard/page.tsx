"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Employee, Invoice } from "@repo/types";
import { FileText, IndianRupee, TimerReset, Users } from "lucide-react";

import { ComplianceStatusBadge } from "@/components/invoices/compliance-status-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { getEmployees } from "@/lib/api/employees";
import { getInvoices } from "@/lib/api/invoices";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [invoiceData, employeeData] = await Promise.all([
          getInvoices(),
          getEmployees({ status: "active" }),
        ]);
        if (!cancelled) {
          setInvoices(invoiceData);
          setEmployees(employeeData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Failed to load dashboard.",
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

  const stats = useMemo(() => {
    const settled = invoices.filter((inv) => inv.settled);
    const unsettled = invoices.filter((inv) => !inv.settled);
    const outstanding = unsettled.reduce((sum, inv) => sum + inv.totalBill, 0);
    const pendingCompliance = invoices.filter(
      (inv) => inv.gst.status === "pending" || inv.esic.status === "pending",
    ).length;

    const now = new Date();
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const revenueThisMonth = invoices
      .filter((inv) => inv.monthYear?.startsWith(thisMonthKey))
      .reduce((sum, inv) => sum + inv.totalBill, 0);

    const avgSettlementDays = (() => {
      const settledWithDates = settled.filter(
        (inv) => inv.invoiceDate && inv.updatedAt,
      );
      if (settledWithDates.length === 0) return null;
      const totalDays = settledWithDates.reduce((sum, inv) => {
        const issued = new Date(inv.invoiceDate as string).getTime();
        const paid = new Date(inv.updatedAt).getTime();
        return sum + Math.max(0, (paid - issued) / (1000 * 60 * 60 * 24));
      }, 0);
      return Math.round(totalDays / settledWithDates.length);
    })();

    return {
      outstanding,
      unsettledCount: unsettled.length,
      settledCount: settled.length,
      pendingCompliance,
      revenueThisMonth,
      avgSettlementDays,
    };
  }, [invoices]);

  const recentInvoices = useMemo(
    () =>
      [...invoices]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 6),
    [invoices],
  );

  const totalCount = invoices.length || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Cash flow overview for R.S Engineering.
          </p>
        </div>
        <Link
          href="/invoice/generate"
          className={cn(buttonVariants(), "inline-flex")}
        >
          Generate Invoice
        </Link>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <IndianRupee className="size-3.5" />
              Outstanding
            </CardDescription>
            <CardTitle className="text-2xl">
              {loading ? "—" : formatInr(stats.outstanding)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {loading
              ? "Loading…"
              : `${stats.unsettledCount} invoices unsettled`}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <FileText className="size-3.5" />
              Revenue this month
            </CardDescription>
            <CardTitle className="text-2xl">
              {loading ? "—" : formatInr(stats.revenueThisMonth)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Across {loading ? "—" : invoices.length} invoices to date
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <TimerReset className="size-3.5" />
              Avg. settlement time
            </CardDescription>
            <CardTitle className="text-2xl">
              {loading || stats.avgSettlementDays === null
                ? "—"
                : `${stats.avgSettlementDays}d`}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {loading
              ? "Loading…"
              : `${stats.pendingCompliance} pending GST/ESIC`}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <Users className="size-3.5" />
              Active employees
            </CardDescription>
            <CardTitle className="text-2xl">
              {loading ? "—" : employees.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            On active payroll
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Invoice status</CardTitle>
            <CardDescription>Settled vs. unsettled invoices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Settled</span>
                <span>{loading ? "—" : stats.settledCount}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-success"
                  style={{
                    width: loading
                      ? "0%"
                      : `${(stats.settledCount / totalCount) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Unsettled</span>
                <span>{loading ? "—" : stats.unsettledCount}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-warning"
                  style={{
                    width: loading
                      ? "0%"
                      : `${(stats.unsettledCount / totalCount) * 100}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent invoices</CardTitle>
            <CardDescription>Latest activity across the ledger</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent [&>th]:font-semibold">
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Month-Year</TableHead>
                    <TableHead>Total Bill</TableHead>
                    <TableHead>GST</TableHead>
                    <TableHead>Settled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Loading invoices...
                      </TableCell>
                    </TableRow>
                  ) : recentInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No invoices found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell>{invoice.monthYear}</TableCell>
                        <TableCell>{formatInr(invoice.totalBill)}</TableCell>
                        <TableCell>
                          <ComplianceStatusBadge status={invoice.gst.status} />
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={invoice.settled ? "success" : "warning"}
                          >
                            {invoice.settled ? "Settled" : "Unsettled"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
