"use client";

import type { EmployeePayrollBreakdown } from "@repo/types";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatInr } from "@/lib/format";

type SalaryCalculationStepProps = {
  breakdown: EmployeePayrollBreakdown[];
};

export function SalaryCalculationStep({
  breakdown,
}: SalaryCalculationStepProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Employee</TableHead>
            <TableHead className="text-right">Basic</TableHead>
            <TableHead className="text-right">Washing</TableHead>
            <TableHead className="text-right">Adjustment</TableHead>
            <TableHead className="text-right">Grade</TableHead>
            <TableHead className="text-right">OT</TableHead>
            <TableHead className="text-right">Total KR</TableHead>
            <TableHead className="text-right">PF</TableHead>
            <TableHead className="text-right">ESI</TableHead>
            <TableHead className="text-right">Payable</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {breakdown.map((row) => (
            <TableRow key={row.employeeId}>
              <TableCell className="font-medium">{row.employeeName}</TableCell>
              <TableCell className="text-right">
                {formatInr(row.basicAmount)}
              </TableCell>
              <TableCell className="text-right">
                {formatInr(row.washingAllowanceAmount)}
              </TableCell>
              <TableCell className="text-right">
                {formatInr(row.adjustmentAllowanceAmount)}
              </TableCell>
              <TableCell className="text-right">
                {formatInr(row.gradeAmount)}
              </TableCell>
              <TableCell className="text-right">
                {formatInr(row.otAmount)}
              </TableCell>
              <TableCell className="text-right">
                {formatInr(row.totalKr)}
              </TableCell>
              <TableCell className="text-right">{formatInr(row.pf)}</TableCell>
              <TableCell className="text-right">{formatInr(row.esi)}</TableCell>
              <TableCell className="text-right">
                {formatInr(row.payableAmount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
