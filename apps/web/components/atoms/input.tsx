import type { ComponentProps } from "react"

import { Input as UiInput } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type InputProps = ComponentProps<typeof UiInput> & {
  error?: boolean
}

function Input({ className, error, ...props }: InputProps) {
  return (
    <UiInput
      aria-invalid={error || props["aria-invalid"]}
      className={cn(
        "h-10 rounded-lg focus-visible:border-ring focus-visible:ring-ring/50 disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input, type InputProps }
