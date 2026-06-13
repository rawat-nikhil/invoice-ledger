import type { ComponentProps } from "react"

import { Badge as UiBadge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type AtomBadgeVariant = "default" | "success" | "warning" | "destructive"

type BadgeProps = Omit<ComponentProps<typeof UiBadge>, "variant"> & {
  variant?: AtomBadgeVariant
}

function Badge({ variant = "default", className, ...props }: BadgeProps) {
  return (
    <UiBadge variant={variant} className={cn(className)} {...props} />
  )
}

export { Badge, type AtomBadgeVariant, type BadgeProps }
