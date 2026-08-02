import type { ComponentProps } from "react"

import { Button } from "@/components/atoms/button"

type SecondaryCTAProps = Pick<
  ComponentProps<typeof Button>,
  "children" | "onClick" | "disabled" | "type" | "className"
>

function SecondaryCTA({ children, ...props }: SecondaryCTAProps) {
  return (
    <Button variant="secondary" {...props}>
      {children}
    </Button>
  )
}

export { SecondaryCTA, type SecondaryCTAProps }
