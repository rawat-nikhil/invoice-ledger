import type { ComplianceStatus } from "@repo/types";

import { ComplianceStatusBadge } from "@/components/invoices/compliance-status-badge";

type InvoiceStatusBadgeProps = {
  status: ComplianceStatus;
};

function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  return <ComplianceStatusBadge status={status} />;
}

export { InvoiceStatusBadge, type InvoiceStatusBadgeProps };
