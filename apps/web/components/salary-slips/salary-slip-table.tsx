"use client";

import type { SalarySlip } from "@repo/types";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatInr } from "@/lib/format";

type SalarySlipTableProps = {
  slips: SalarySlip[];
  onDownload: (slip: SalarySlip) => void;
  downloadingId: string | null;
};

export function SalarySlipTable({
  slips,
  onDownload,
  downloadingId,
}: SalarySlipTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead colSpan={2} className="text-center font-semibold">
              Employee
            </TableHead>
            <TableHead colSpan={5} className="text-center font-semibold">
              Credit
            </TableHead>
            <TableHead colSpan={2} className="text-center font-semibold">
              Deductions
            </TableHead>
            <TableHead colSpan={1} className="text-center font-semibold">
              Final
            </TableHead>
            <TableHead rowSpan={2} className="w-12 align-bottom" />
          </TableRow>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Basic Pay</TableHead>
            <TableHead className="text-right">Adjustment</TableHead>
            <TableHead className="text-right">Washing</TableHead>
            <TableHead className="text-right">OT</TableHead>
            <TableHead className="text-right">Grade</TableHead>
            <TableHead className="text-right">PF</TableHead>
            <TableHead className="text-right">ESI</TableHead>
            <TableHead className="text-right">Payable</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {slips.map((slip) => (
            <TableRow key={slip.id}>
              <TableCell>{slip.employeeCode}</TableCell>
              <TableCell>{slip.employeeName}</TableCell>
              <TableCell className="text-right">
                {formatInr(slip.basicAmount)}
              </TableCell>
              <TableCell className="text-right">
                {formatInr(slip.adjustmentAllowanceAmount)}
              </TableCell>
              <TableCell className="text-right">
                {formatInr(slip.washingAllowanceAmount)}
              </TableCell>
              <TableCell className="text-right">
                {formatInr(slip.otAmount)}
              </TableCell>
              <TableCell className="text-right">
                {formatInr(slip.gradeAmount)}
              </TableCell>
              <TableCell className="text-right text-destructive">
                {formatInr(slip.pf)}
              </TableCell>
              <TableCell className="text-right text-destructive">
                {formatInr(slip.esi)}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatInr(slip.payableAmount)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="Download salary slip"
                  disabled={downloadingId === slip.id}
                  onClick={() => onDownload(slip)}
                >
                  <Download className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
