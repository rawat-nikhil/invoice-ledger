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
import { updateEmployeeStatus } from "@/lib/api/employees";

type StatusAction = "deactivate" | "reactivate";

type EmployeeStatusDialogProps = {
  open: boolean;
  employee: Employee | null;
  action: StatusAction;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

const COPY: Record<
  StatusAction,
  { title: string; description: string; confirmLabel: string; pendingLabel: string }
> = {
  deactivate: {
    title: "Deactivate Employee",
    description:
      "This employee will be marked inactive. All historical salary slips and invoices are preserved and remain visible; they just won't be selectable for new invoices.",
    confirmLabel: "Deactivate",
    pendingLabel: "Deactivating...",
  },
  reactivate: {
    title: "Reactivate Employee",
    description:
      "This employee will be marked active again and become selectable for new invoices.",
    confirmLabel: "Reactivate",
    pendingLabel: "Reactivating...",
  },
};

export function EmployeeStatusDialog({
  open,
  employee,
  action,
  onOpenChange,
  onSuccess,
}: EmployeeStatusDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const copy = COPY[action];

  async function handleConfirm() {
    if (!employee) {
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await updateEmployeeStatus(employee.id, action === "reactivate");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to update employee status.",
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
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <AlertTriangle className="size-5 text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              <DialogTitle>{copy.title}</DialogTitle>
              <DialogDescription>{copy.description}</DialogDescription>
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
            variant={action === "deactivate" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={submitting || !employee}
          >
            {submitting ? copy.pendingLabel : copy.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
