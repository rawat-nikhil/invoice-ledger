"use client";

import { useEffect, useState } from "react";
import type {
  CreateEmployeeInput,
  Employee,
  EmployeeCategory,
  EmployeeGrade,
  UpdateEmployeeInput,
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
import { ApiError } from "@/lib/api";
import { createEmployee, updateEmployee } from "@/lib/api/employees";

type EmployeeFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  employee?: Employee | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

type FormState = {
  employeeCode: string;
  name: string;
  category: EmployeeCategory;
  grade: EmployeeGrade;
  department: string;
  gradeRate: string;
  basicPay: string;
};

const DEFAULT_FORM: FormState = {
  employeeCode: "",
  name: "",
  category: "skilled",
  grade: "A",
  department: "maintenance",
  gradeRate: "",
  basicPay: "",
};

function toFormState(employee: Employee): FormState {
  return {
    employeeCode: employee.employeeCode,
    name: employee.name,
    category: employee.category,
    grade: employee.grade,
    department: employee.department,
    gradeRate: String(employee.gradeRate),
    basicPay: String(employee.basicPay),
  };
}

export function EmployeeFormDialog({
  open,
  mode,
  employee,
  onOpenChange,
  onSuccess,
}: EmployeeFormDialogProps) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);
    setForm(
      mode === "edit" && employee ? toFormState(employee) : DEFAULT_FORM,
    );
  }, [open, mode, employee]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const gradeRate = Number(form.gradeRate);
    const basicPay = Number(form.basicPay);

    if (
      !form.name.trim() ||
      !form.department.trim() ||
      Number.isNaN(gradeRate) ||
      Number.isNaN(basicPay)
    ) {
      setError("Please fill in all required fields with valid values.");
      setSubmitting(false);
      return;
    }

    if (mode === "create" && !form.employeeCode.trim()) {
      setError("Employee code is required.");
      setSubmitting(false);
      return;
    }

    try {
      if (mode === "create") {
        const payload: CreateEmployeeInput = {
          employeeCode: form.employeeCode.trim(),
          name: form.name.trim(),
          category: form.category,
          grade: form.grade,
          department: form.department.trim(),
          gradeRate,
          basicPay,
        };
        await createEmployee(payload);
      } else if (employee) {
        const payload: UpdateEmployeeInput = {
          name: form.name.trim(),
          category: form.category,
          grade: form.grade,
          department: form.department.trim(),
          gradeRate,
          basicPay,
        };
        await updateEmployee(employee.id, payload);
      }

      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to save employee.",
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
            {mode === "create" ? "Add Employee" : "Edit Employee"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employeeCode">Employee Code</Label>
            <Input
              id="employeeCode"
              value={form.employeeCode}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  employeeCode: event.target.value,
                }))
              }
              disabled={mode === "edit"}
              readOnly={mode === "edit"}
              placeholder="EMP001"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Employee name"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    category: value as EmployeeCategory,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="skilled">Skilled</SelectItem>
                  <SelectItem value="semi-skilled">Semi-skilled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Grade</Label>
              <Select
                value={form.grade}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    grade: value as EmployeeGrade,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={form.department}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  department: event.target.value,
                }))
              }
              placeholder="maintenance"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gradeRate">Grade Rate</Label>
              <Input
                id="gradeRate"
                type="number"
                step="any"
                value={form.gradeRate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    gradeRate: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="basicPay">Basic Pay</Label>
              <Input
                id="basicPay"
                type="number"
                step="any"
                value={form.basicPay}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    basicPay: event.target.value,
                  }))
                }
              />
            </div>
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
