"use client";

import { useSidebarStore } from "@/stores/sidebar-store";
import { useIsMobile } from "@/hooks/use-media-query";
import { useEffect } from "react";
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "@/lib/constants";

/**
 * Convenience hook that combines sidebar store with responsive behavior.
 */
export function useSidebar() {
  const store = useSidebarStore();
  const isMobile = useIsMobile();

  // Auto-close mobile nav on desktop
  useEffect(() => {
    if (!isMobile) {
      store.closeMobile();
    }
  }, [isMobile]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...store,
    isMobile,
    width: store.isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
  };
}
