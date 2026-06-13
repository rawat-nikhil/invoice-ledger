"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Footer } from "@/components/global/footer";
import { Header } from "@/components/global/header";
import { Sidebar } from "@/components/global/sidebar";
import {
  SidebarProvider,
  useSidebar,
} from "@/components/layout/sidebar-context";
import { isAuthenticated } from "@/lib/auth";
import { cn } from "@/lib/utils";

type AppLayoutProps = {
  children: React.ReactNode;
};

function AppLayoutContent({ children }: AppLayoutProps) {
  const router = useRouter();
  const { contentOffset, mobileOpen, closeMobileSidebar } = useSidebar();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <button
        type="button"
        aria-label="Close sidebar"
        aria-hidden={!mobileOpen}
        tabIndex={mobileOpen ? 0 : -1}
        className={cn(
          "fixed inset-0 z-30 hidden bg-black/50 transition-opacity duration-300 ease-in-out max-md:block",
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        onClick={closeMobileSidebar}
      />

      <Sidebar />
      <div
        className="flex min-h-screen flex-col transition-[padding-left] duration-200 ease-in-out"
        style={{ paddingLeft: contentOffset }}
      >
        <Header />
        <main className="flex-1 px-4 py-4 md:px-6 md:py-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}
