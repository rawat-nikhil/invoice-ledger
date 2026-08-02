import type { ComponentProps, ReactNode } from "react"

import { Button } from "@/components/atoms/button"

type DeleteInvoiceButtonProps = Pick<
  ComponentProps<typeof Button>,
  "onClick" | "disabled" | "type" | "className"
> & {
  children?: ReactNode
}

function DeleteInvoiceButton({
  children = "Delete",
  ...props
}: DeleteInvoiceButtonProps) {
  return (
    <Button variant="destructive" {...props}>
      {children}
    </Button>
  )
}

export { DeleteInvoiceButton, type DeleteInvoiceButtonProps }
