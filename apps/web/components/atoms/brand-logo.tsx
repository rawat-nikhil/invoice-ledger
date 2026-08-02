"use client";

import { Avatar, type AtomAvatarShape, type AtomAvatarSize } from "./avatar";
import { cn } from "@/lib/utils";

export const BRAND_LOGO_SRC = "/vercel.svg";
export const BRAND_NAME = "R.S Engineering";

const paddingBySize: Record<AtomAvatarSize, string> = {
  sm: "p-1",
  md: "p-1.5",
  lg: "p-2",
};

type BrandLogoProps = {
  size?: AtomAvatarSize;
  shape?: AtomAvatarShape;
  className?: string;
};

function BrandLogo({
  size = "md",
  shape = "square",
  className,
}: BrandLogoProps) {
  return (
    <Avatar
      src={BRAND_LOGO_SRC}
      alt={BRAND_NAME}
      shape={shape}
      size={size}
      className={cn("bg-black", paddingBySize[size], className)}
    />
  );
}

export { BrandLogo, type BrandLogoProps };
