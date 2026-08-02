"use client";

import type { Employee } from "@repo/types";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Pencil,
  UserCheck,
  UserX,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
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

export type EmployeeSortField =
  | "employeeCode"
  | "name"
  | "category"
  | "grade"
  | "department"
  | "gradeRate"
  | "basicPay"
  | "adjustmentAllowance"
  | "washingAllowance";

type EmployeeTableProps = {
  employees: Employee[];
  sort: EmployeeSortField;
  order: "asc" | "desc";
  onSort: (field: EmployeeSortField) => void;
  onEdit: (employee: Employee) => void;
  onToggleStatus: (employee: Employee) => void;
};

const COLUMNS: { key: EmployeeSortField; label: string }[] = [
  { key: "employeeCode", label: "Employee Code" },
  { key: "name", label: "Name" },
  { key: "category", label: "Category" },
  { key: "grade", label: "Grade" },
  { key: "department", label: "Department" },
  { key: "gradeRate", label: "Grade Rate" },
  { key: "basicPay", label: "Basic Pay" },
  { key: "adjustmentAllowance", label: "Adjustment Allowance" },
  { key: "washingAllowance", label: "Washing Allowance" },

];

function SortIcon({
  field,
  sort,
  order,
}: {
  field: EmployeeSortField;
  sort: EmployeeSortField;
  order: "asc" | "desc";
}) {
  if (sort !== field) {
    return <ArrowUpDown className="size-3.5 text-muted-foreground" />;
  }

  return order === "asc" ? (
    <ArrowUp className="size-3.5" />
  ) : (
    <ArrowDown className="size-3.5" />
  );
}

function formatCategory(category: Employee["category"]): string {
  return category === "semi-skilled" ? "Semi-skilled" : "Skilled";
}

export function EmployeeTable({
  employees,
  sort,
  order,
  onSort,
  onEdit,
  onToggleStatus,
}: EmployeeTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {COLUMNS.map((column) => (
              <TableHead key={column.key}>
                <button
                  type="button"
                  onClick={() => onSort(column.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 font-medium transition-colors hover:text-foreground",
                    sort === column.key
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {column.label}
                  <SortIcon field={column.key} sort={sort} order={order} />
                </button>
              </TableHead>
            ))}
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={COLUMNS.length + 2}
                className="h-24 text-center text-muted-foreground"
              >
                No employees found.
              </TableCell>
            </TableRow>
          ) : (
            employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">
                  {employee.employeeCode}
                </TableCell>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{formatCategory(employee.category)}</TableCell>
                <TableCell>{employee.grade}</TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>{employee.gradeRate}</TableCell>
                <TableCell>{employee.basicPay}</TableCell>
                <TableCell>{employee.adjustmentAllowance}</TableCell>
                <TableCell>{employee.washingAllowance}</TableCell>
                <TableCell>
                  <Badge variant={employee.isActive ? "success" : "outline"}>
                    {employee.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit ${employee.name}`}
                      onClick={() => onEdit(employee)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={
                        employee.isActive
                          ? `Deactivate ${employee.name}`
                          : `Reactivate ${employee.name}`
                      }
                      onClick={() => onToggleStatus(employee)}
                    >
                      {employee.isActive ? (
                        <UserX className="text-destructive" />
                      ) : (
                        <UserCheck className="text-success" />
                      )}
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
