"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  FileText,
  LayoutDashboard,
  Receipt,
  Users,
  type LucideIcon,
} from "lucide-react";

import { BrandLogo } from "@/components/atoms";
import {
  SIDEBAR_WIDTH_EXPANDED,
  useSidebar,
} from "@/components/layout/sidebar-context";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Invoice", href: "/invoice", icon: FileText },
  { label: "Salary Slip", href: "/salary-slip", icon: Receipt },
  { label: "Employee", href: "/employee", icon: Users },
  { label: "Third-party", href: "/third-party", icon: Building2 },
];

function isActiveRoute(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const {
    collapsed,
    isMobile,
    mobileOpen,
    sidebarWidth,
    toggleDesktopCollapsed,
    closeMobileSidebar,
  } = useSidebar();

  const isCollapsedDesktop = !isMobile && collapsed;
  const isExpanded = isMobile ? mobileOpen : !collapsed;

  function handleSidebarShellClick() {
    if (!isMobile) {
      toggleDesktopCollapsed();
    }
  }

  function handleNavClick(event: React.MouseEvent) {
    event.stopPropagation();
    if (isMobile) {
      closeMobileSidebar();
    }
  }

  return (
    <aside
      data-mobile-open={mobileOpen}
      onClick={handleSidebarShellClick}
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        "transition-[transform,width] duration-300 ease-in-out",
        "max-md:-translate-x-full max-md:data-[mobile-open=true]:translate-x-0",
        "md:translate-x-0",
      )}
      style={{ width: isMobile ? SIDEBAR_WIDTH_EXPANDED : sidebarWidth }}
    >
      <div
        className={cn(
          "flex shrink-0 flex-col border-b border-sidebar-border px-4 py-4",
          isCollapsedDesktop ? "items-center px-2" : "gap-1",
        )}
      >
        <div
          className={cn(
            "flex items-center",
            isCollapsedDesktop ? "justify-center" : "gap-3",
          )}
        >
          <BrandLogo
            size={isCollapsedDesktop ? "md" : "lg"}
            className={isCollapsedDesktop ? undefined : "mr-0"}
          />
          {isExpanded ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">
                Invoice Ledger
              </p>
              <p className="truncate text-xs text-muted-foreground">
                R.S Engineering
              </p>
            </div>
          ) : null}
        </div>
        {isExpanded ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Internal dashboard
          </p>
        ) : null}
      </div>

      <nav
        className={cn(
          "flex flex-1 flex-col gap-1 overflow-y-auto p-3",
          isCollapsedDesktop && "items-center px-2",
        )}
      >
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isActiveRoute(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              title={isCollapsedDesktop ? label : undefined}
              onClick={handleNavClick}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-colors",
                isCollapsedDesktop
                  ? "size-10 justify-center"
                  : "gap-3 px-3 py-2",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {isExpanded ? label : null}
            </Link>
          );
        })}
      </nav>

      <div
        className={cn(
          "flex shrink-0 flex-col border-t border-sidebar-border p-3",
          isCollapsedDesktop && "items-center",
        )}
      >
        {isExpanded ? (
          <p className="px-3 text-xs text-muted-foreground">
            v1.0 · Internal use
          </p>
        ) : null}
      </div>
    </aside>
  );
}
