"use client";

import { useCallback, useEffect, useState } from "react";
import type { Employee } from "@repo/types";
import { Plus, Search } from "lucide-react";

import { EmployeeFormDialog } from "@/components/employees/employee-form-dialog";
import { EmployeeStatusDialog } from "@/components/employees/employee-status-dialog";
import {
  EmployeeTable,
  type EmployeeSortField,
} from "@/components/employees/employee-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/lib/api";
import { getEmployees, type GetEmployeesParams } from "@/lib/api/employees";

type DialogMode = "create" | "edit" | "status" | null;
type StatusFilter = NonNullable<GetEmployeesParams["status"]>;

const STATUS_FILTER_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "all", label: "All" },
] as const satisfies readonly { value: StatusFilter; label: string }[];

export default function EmployeePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<EmployeeSortField>("employeeCode");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getEmployees({
        search: debouncedSearch || undefined,
        sort,
        order,
        status: statusFilter,
      });
      setEmployees(data);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load employees.",
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, sort, order, statusFilter]);

  useEffect(() => {
    void fetchEmployees();
  }, [fetchEmployees]);

  function handleSort(field: EmployeeSortField) {
    if (sort === field) {
      setOrder((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSort(field);
    setOrder("asc");
  }

  function openCreateDialog() {
    setSelectedEmployee(null);
    setDialogMode("create");
  }

  function openEditDialog(employee: Employee) {
    setSelectedEmployee(employee);
    setDialogMode("edit");
  }

  function openStatusDialog(employee: Employee) {
    setSelectedEmployee(employee);
    setDialogMode("status");
  }

  function closeDialog() {
    setDialogMode(null);
    setSelectedEmployee(null);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Employee</h1>
        <p className="text-muted-foreground">
          Manage employee records, grades, and pay details.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name..."
              className="pl-8"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            items={STATUS_FILTER_OPTIONS}
          >
            <SelectTrigger className="w-35">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="button" onClick={openCreateDialog}>
          <Plus />
          Add Employee
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading employees...</p>
      ) : (
        <EmployeeTable
          employees={employees}
          sort={sort}
          order={order}
          onSort={handleSort}
          onEdit={openEditDialog}
          onToggleStatus={openStatusDialog}
        />
      )}

      <EmployeeFormDialog
        open={dialogMode === "create" || dialogMode === "edit"}
        mode={dialogMode === "edit" ? "edit" : "create"}
        employee={selectedEmployee}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
        onSuccess={() => void fetchEmployees()}
      />

      <EmployeeStatusDialog
        open={dialogMode === "status"}
        employee={selectedEmployee}
        action={selectedEmployee?.isActive ? "deactivate" : "reactivate"}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
        onSuccess={() => void fetchEmployees()}
      />
    </div>
  );
}
