import type { ComponentProps } from "react"

import { Button } from "@/components/atoms/button"

type PrimaryCTAProps = Pick<
  ComponentProps<typeof Button>,
  "children" | "onClick" | "disabled" | "type" | "className"
>

function PrimaryCTA({ children, ...props }: PrimaryCTAProps) {
  return (
    <Button variant="default" size="lg" {...props}>
      {children}
    </Button>
  )
}

export { PrimaryCTA, type PrimaryCTAProps }
