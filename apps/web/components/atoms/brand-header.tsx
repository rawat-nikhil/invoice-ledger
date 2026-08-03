"use client";

import { cn } from "@/lib/utils";

export const BRAND_HEADER_SRC = "/header.png";
export const BRAND_NAME = "R.S Engineering";

type BrandHeaderProps = {
  className?: string;
};

function BrandHeader({ className }: BrandHeaderProps) {
  return (
    <div
      className={cn(
        "flex max-w-[calc(100vw-7rem)] items-center sm:max-w-none",
        className,
      )}
    >
      <img
        src={BRAND_HEADER_SRC}
        alt={BRAND_NAME}
        className="h-6 w-auto max-w-full object-contain lg:h-8"
      />
    </div>
  );
}

export { BrandHeader, type BrandHeaderProps };
