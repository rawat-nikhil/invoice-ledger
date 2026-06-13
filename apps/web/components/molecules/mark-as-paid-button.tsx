import type { ComponentProps, ReactNode } from "react"

import { Button } from "@/components/atoms/button"

type MarkAsPaidButtonProps = Pick<
  ComponentProps<typeof Button>,
  "onClick" | "disabled" | "type" | "className"
> & {
  children?: ReactNode
}

function MarkAsPaidButton({
  children = "Mark as paid",
  ...props
}: MarkAsPaidButtonProps) {
  return (
    <Button variant="success" {...props}>
      {children}
    </Button>
  )
}

export { MarkAsPaidButton, type MarkAsPaidButtonProps }
