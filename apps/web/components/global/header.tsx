"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu, User, X } from "lucide-react";

import { BrandLogo, BrandHeader } from "@/components/atoms";
import { useSidebar } from "@/components/layout/sidebar-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearToken } from "@/lib/auth";

export function Header() {
  const router = useRouter();
  const { mobileOpen, toggleMobileSidebar } = useSidebar();

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  return (
    <header className="sticky pb-13 pt-12 top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-4 md:relative md:justify-end md:px-6">
      <button
        type="button"
        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted md:hidden"
        onClick={toggleMobileSidebar}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      <div className="flex flex-1 items-center justify-center md:absolute md:left-1/2 md:flex-none md:-translate-x-1/2">
        <BrandHeader />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex size-10 shrink-0 items-center justify-center rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <BrandLogo shape="circle" size="md" className="cursor-pointer" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 flex flex-col gap-2">
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            <User />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" className="bg-sidebar-accent/50" onClick={handleLogout}>
            <LogOut />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
