"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useMobile } from "@/hooks/use-mobile";

const SIDEBAR_WIDTH_EXPANDED = 260;
const SIDEBAR_WIDTH_COLLAPSED = 72;

type SidebarContextValue = {
  collapsed: boolean;
  mobileOpen: boolean;
  isMobile: boolean;
  sidebarWidth: number;
  contentOffset: number;
  toggleDesktopCollapsed: () => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const isMobile = useMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDesktopCollapsed = useCallback(() => {
    setCollapsed((current) => !current);
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setMobileOpen((current) => !current);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setMobileOpen(false);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setMobileOpen(false);
    }
  }, [isMobile]);

  const sidebarWidth = useMemo(() => {
    if (isMobile) {
      return mobileOpen ? SIDEBAR_WIDTH_EXPANDED : 0;
    }
    return collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;
  }, [collapsed, isMobile, mobileOpen]);

  const contentOffset = isMobile ? 0 : sidebarWidth;

  const value = useMemo(
    () => ({
      collapsed,
      mobileOpen,
      isMobile,
      sidebarWidth,
      contentOffset,
      toggleDesktopCollapsed,
      toggleMobileSidebar,
      closeMobileSidebar,
    }),
    [
      collapsed,
      mobileOpen,
      isMobile,
      sidebarWidth,
      contentOffset,
      toggleDesktopCollapsed,
      toggleMobileSidebar,
      closeMobileSidebar,
    ],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}

export { SIDEBAR_WIDTH_COLLAPSED, SIDEBAR_WIDTH_EXPANDED };
