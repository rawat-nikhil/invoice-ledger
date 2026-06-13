import type { ComponentProps } from "react"

import { Button as UiButton } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AtomButtonVariant =
  | "default"
  | "secondary"
  | "ghost"
  | "outline"
  | "destructive"
  | "success"

type AtomButtonSize = "sm" | "md" | "lg"

const sizeMap: Record<AtomButtonSize, "sm" | "default" | "lg"> = {
  sm: "sm",
  md: "default",
  lg: "lg",
}

type ButtonProps = Omit<ComponentProps<typeof UiButton>, "variant" | "size"> & {
  variant?: AtomButtonVariant
  size?: AtomButtonSize
}

function Button({
  variant = "default",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <UiButton
      variant={variant}
      size={sizeMap[size]}
      className={cn(className)}
      {...props}
    />
  )
}

export { Button, type AtomButtonSize, type AtomButtonVariant, type ButtonProps }
