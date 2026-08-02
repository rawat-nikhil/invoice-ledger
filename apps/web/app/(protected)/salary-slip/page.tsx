"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SalarySlip } from "@repo/types";
import { formatMonthYear } from "@repo/payroll";

import { SalarySlipTable } from "@/components/salary-slips/salary-slip-table";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/lib/api";
import {
  downloadSalarySlip,
  getSalarySlips,
} from "@/lib/api/salary-slips";
import { toIsoDate } from "@/lib/format";

const MONTHS = Array.from({ length: 12 }, (_, index) => {
  const label = new Date(2024, index, 1).toLocaleDateString("en-IN", {
    month: "short",
  });
  return { value: String(index), label };
});

function buildYearOptions(): string[] {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];

  for (let year = currentYear - 5; year <= currentYear + 5; year += 1) {
    years.push(String(year));
  }

  return years;
}

const YEAR_OPTIONS = buildYearOptions();

export default function SalarySlipPage() {
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [slips, setSlips] = useState<SalarySlip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const monthYear = useMemo(() => {
    if (!month || !year) {
      return null;
    }

    const date = new Date(Number(year), Number(month), 1);
    return formatMonthYear(toIsoDate(date));
  }, [month, year]);

  const fetchSlips = useCallback(async () => {
    if (!monthYear) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getSalarySlips(monthYear);
      setSlips(data);
      setHasFetched(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load salary slips.",
      );
      setSlips([]);
      setHasFetched(true);
    } finally {
      setLoading(false);
    }
  }, [monthYear]);

  useEffect(() => {
    if (monthYear) {
      void fetchSlips();
    } else {
      setSlips([]);
      setHasFetched(false);
      setError(null);
    }
  }, [monthYear, fetchSlips]);

  async function handleDownload(slip: SalarySlip) {
    setDownloadingId(slip.id);
    setError(null);

    try {
      await downloadSalarySlip(slip.id);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to download salary slip.",
      );
    } finally {
      setDownloadingId(null);
    }
  }

  const showTable = Boolean(monthYear);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Salary Slip</h1>
        <p className="text-muted-foreground">
          View and download employee salary slips by month.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="salary-slip-month">Month</Label>
          <Select
            value={month}
            onValueChange={(value) => setMonth(value ?? "")}
          >
            <SelectTrigger id="salary-slip-month" className="w-full sm:w-40">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="salary-slip-year">Year</Label>
          <Select
            value={year}
            onValueChange={(value) => setYear(value ?? "")}
          >
            <SelectTrigger id="salary-slip-year" className="w-full sm:w-32">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {YEAR_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {!showTable ? (
        <p className="text-sm text-muted-foreground">
          Select a month and year to view salary slips.
        </p>
      ) : loading ? (
        <p className="text-sm text-muted-foreground">Loading salary slips...</p>
      ) : hasFetched && slips.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No salary slips found for {monthYear}.
        </p>
      ) : slips.length > 0 ? (
        <SalarySlipTable
          slips={slips}
          onDownload={handleDownload}
          downloadingId={downloadingId}
        />
      ) : null}
    </div>
  );
}
