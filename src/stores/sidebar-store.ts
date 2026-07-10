import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleMobile: () => void;
  openMobile: () => void;
  closeMobile: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      isMobileOpen: false,
      toggle: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
      open: () => set({ isCollapsed: false }),
      close: () => set({ isCollapsed: true }),
      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
      toggleMobile: () => set((s) => ({ isMobileOpen: !s.isMobileOpen })),
      openMobile: () => set({ isMobileOpen: true }),
      closeMobile: () => set({ isMobileOpen: false }),
    }),
    {
      name: "talenthub-sidebar",
      partialize: (state) => ({ isCollapsed: state.isCollapsed }),
    }
  )
);
