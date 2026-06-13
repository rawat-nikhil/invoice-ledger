"use client"

import {
  Avatar as UiAvatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type AtomAvatarShape = "circle" | "square"
type AtomAvatarSize = "sm" | "md" | "lg"

const sizeMap: Record<AtomAvatarSize, "sm" | "default" | "lg"> = {
  sm: "sm",
  md: "default",
  lg: "lg",
}

function getInitials(text: string): string {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("")
}

type AvatarProps = {
  src: string
  alt: string
  fallback?: string
  shape?: AtomAvatarShape
  size?: AtomAvatarSize
  className?: string
}

function Avatar({
  src,
  alt,
  fallback,
  shape = "square",
  size = "md",
  className,
}: AvatarProps) {
  const shapeClass = shape === "square" ? "rounded-lg" : "rounded-full"
  const afterShapeClass =
    shape === "square" ? "after:rounded-lg" : "after:rounded-full"

  return (
    <UiAvatar
      size={sizeMap[size]}
      className={cn(shapeClass, afterShapeClass, className)}
    >
      {src ? <AvatarImage src={src} alt={alt} className={shapeClass} /> : null}
      <AvatarFallback className={shapeClass}>
        {fallback ?? getInitials(alt)}
      </AvatarFallback>
    </UiAvatar>
  )
}

export { Avatar, type AtomAvatarShape, type AtomAvatarSize, type AvatarProps }
