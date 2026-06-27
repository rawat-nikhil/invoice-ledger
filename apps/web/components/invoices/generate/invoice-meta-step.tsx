"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type InvoiceMetaStepProps = {
  invoiceDate: Date | undefined;
  acknowledged: boolean;
  onInvoiceDateChange: (date: Date | undefined) => void;
  onAcknowledgedChange: (checked: boolean) => void;
};

export function InvoiceMetaStep({
  invoiceDate,
  acknowledged,
  onInvoiceDateChange,
  onAcknowledgedChange,
}: InvoiceMetaStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="invoice-date">Invoice date</Label>
        <Popover>
          <PopoverTrigger
            id="invoice-date"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full max-w-sm justify-start text-left font-normal",
              !invoiceDate && "text-muted-foreground",
            )}
          >
            <CalendarIcon />
            {invoiceDate ? format(invoiceDate, "PPP") : "Select invoice date"}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={invoiceDate}
              onSelect={onInvoiceDateChange}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-start gap-3 rounded-lg border p-4">
        <Checkbox
          id="acknowledgement"
          checked={acknowledged}
          onCheckedChange={(checked) => onAcknowledgedChange(checked === true)}
        />
        <div className="space-y-1">
          <Label htmlFor="acknowledgement" className="cursor-pointer">
            I confirm the invoice date and payroll period are correct
          </Label>
          <p className="text-sm text-muted-foreground">
            This acknowledgement is required before entering employee payroll
            data.
          </p>
        </div>
      </div>
    </div>
  );
}
