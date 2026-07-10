"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider } from "@/components/shared/toast";
import { CommandPalette } from "@/components/shared/command-palette";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ToastProvider>
        <TooltipProvider delay={300}>
          {children}
          <CommandPalette />
        </TooltipProvider>
      </ToastProvider>
    </NextThemesProvider>
  );
}
