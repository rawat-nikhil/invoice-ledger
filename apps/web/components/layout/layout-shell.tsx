"use client";

import { usePathname } from "next/navigation";

import { AppLayout } from "@/components/layout/app-layout";

type LayoutShellProps = {
  children: React.ReactNode;
};

export function LayoutShell({ children }: LayoutShellProps) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return children;
  }

  return <AppLayout>{children}</AppLayout>;
}
