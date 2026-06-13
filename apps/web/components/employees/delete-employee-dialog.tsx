"use client";

import { useState } from "react";
import type { Employee } from "@repo/types";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiError } from "@/lib/api";
import { deleteEmployee } from "@/lib/api/employees";

type DeleteEmployeeDialogProps = {
  open: boolean;
  employee: Employee | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function DeleteEmployeeDialog({
  open,
  employee,
  onOpenChange,
  onSuccess,
}: DeleteEmployeeDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleDelete() {
    if (!employee) {
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await deleteEmployee(employee.id);
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to delete employee.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setError(null);
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="size-5 text-destructive" />
            </div>
            <div className="space-y-1.5">
              <DialogTitle>Delete Employee</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this employee?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {employee ? (
          <p className="text-sm text-muted-foreground">
            {employee.name} ({employee.employeeCode})
          </p>
        ) : null}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={submitting || !employee}
          >
            {submitting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
