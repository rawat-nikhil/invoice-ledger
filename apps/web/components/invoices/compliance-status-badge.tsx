import type { ComplianceStatus } from "@repo/types";

import { Badge } from "@/components/ui/badge";

const statusConfig: Record<
  ComplianceStatus,
  { variant: "warning" | "success" | "secondary"; label: string }
> = {
  pending: { variant: "warning", label: "Pending" },
  paid: { variant: "success", label: "Paid" },
  "not-generated": { variant: "secondary", label: "Not Generated" },
};

type ComplianceStatusBadgeProps = {
  status: ComplianceStatus;
};

export function ComplianceStatusBadge({ status }: ComplianceStatusBadgeProps) {
  const { variant, label } = statusConfig[status];

  return <Badge variant={variant}>{label}</Badge>;
}
