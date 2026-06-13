import type { InvoiceStatus } from "@repo/types"

import { Badge, type AtomBadgeVariant } from "@/components/atoms/badge"

const statusConfig: Record<
  InvoiceStatus,
  { variant: AtomBadgeVariant; label: string }
> = {
  draft: { variant: "default", label: "Draft" },
  sent: { variant: "warning", label: "Sent" },
  paid: { variant: "success", label: "Paid" },
  overdue: { variant: "destructive", label: "Overdue" },
}

type InvoiceStatusBadgeProps = {
  status: InvoiceStatus
}

function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const { variant, label } = statusConfig[status]

  return <Badge variant={variant}>{label}</Badge>
}

export { InvoiceStatusBadge, type InvoiceStatusBadgeProps }
