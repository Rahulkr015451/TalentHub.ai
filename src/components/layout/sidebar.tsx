"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "@/hooks/use-sidebar";
import {
  SIDEBAR_NAV_ITEMS,
  SIDEBAR_BOTTOM_ITEMS,
  SIDEBAR_SECTIONS,
  SIDEBAR_WIDTH,
} from "@/lib/constants";
import type { SidebarItem } from "@/types";
import { getAllApplications } from "@/lib/supabase/data-access";
import type { ApplicationRow, JobRow } from "@/lib/supabase/types";

export function Sidebar() {
  const { isCollapsed, toggle, width } = useSidebar();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [candidatesCount, setCandidatesCount] = useState<number | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true);
    });
    const rawSession = localStorage.getItem("talenthub-session");
    let email = "";
    let userRole = "candidate";
    if (rawSession) {
      const session = JSON.parse(rawSession);
      userRole = session.role || "candidate";
      email = session.email || "";
      requestAnimationFrame(() => {
        setRole(userRole);
      });
    } else {
      requestAnimationFrame(() => {
        setRole("candidate");
      });
    }

    async function fetchCandidatesCount() {
      try {
        const { data, error } = await getAllApplications();
        if (!error && data) {
          const filtered = email
            ? (data as (ApplicationRow & { job?: (JobRow & { publisher_email?: string }) | null })[]).filter((app) => app.job?.publisher_email === email)
            : data;
          setCandidatesCount(filtered.length);
        }
      } catch (err) {
        console.error("Failed to load candidates count in sidebar", err);
      }
    }

    if (userRole === "recruiter") {
      fetchCandidatesCount();
    }
  }, []);

  const collapsed = mounted ? isCollapsed : false;
  const sidebarWidth = mounted ? width : SIDEBAR_WIDTH;

  const filteredNavItems = SIDEBAR_NAV_ITEMS.filter((item) => {
    if (item.roles) {
      return role ? item.roles.includes(role) : item.roles.includes("candidate");
    }
    return true;
  });

  // Group items by section
  const sections = filteredNavItems.reduce(
    (acc, item) => {
      const section = item.section || "main";
      if (!acc[section]) acc[section] = [];
      acc[section].push(item);
      return acc;
    },
    {} as Record<string, SidebarItem[]>
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarWidth }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="hidden lg:flex flex-col h-dvh sticky top-0 border-r bg-sidebar z-30"
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center h-16 border-b px-4",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        {collapsed ? (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 rounded-md text-muted-foreground hover:text-foreground"
            onClick={toggle}
          >
            <ChevronRight className="size-4" />
            <span className="sr-only">Expand sidebar</span>
          </Button>
        ) : (
          <>
            <Logo showText={true} size="sm" />
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-md text-muted-foreground hover:text-foreground"
              onClick={toggle}
            >
              <ChevronLeft className="size-4" />
              <span className="sr-only">Collapse sidebar</span>
            </Button>
          </>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 min-h-0 py-3">
        <nav className="space-y-1 px-3">
          {Object.entries(sections).map(([sectionKey, items], idx) => (
            <div key={sectionKey}>
              {idx > 0 && <Separator className="my-3" />}
              {!collapsed && (
                <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                  {SIDEBAR_SECTIONS[sectionKey] || sectionKey}
                </p>
              )}
              <div className="space-y-0.5">
                {items.map((item) => (
                  <SidebarLink
                    key={item.href}
                    item={item}
                    isActive={pathname === item.href}
                    isCollapsed={collapsed}
                    badge={item.title === "Candidates" && candidatesCount !== null ? candidatesCount : item.badge}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Bottom */}
      <div className="border-t p-3 space-y-1 shrink-0">
        {SIDEBAR_BOTTOM_ITEMS.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            isActive={pathname === item.href}
            isCollapsed={collapsed}
          />
        ))}
      </div>
    </motion.aside>
  );
}

// ─── Sidebar Link ─────────────────────────────────────────────
interface SidebarLinkProps {
  item: SidebarItem;
  isActive: boolean;
  isCollapsed: boolean;
  badge?: string | number;
}

function SidebarLink({ item, isActive, isCollapsed, badge }: SidebarLinkProps) {
  const Icon = item.icon;
  const displayBadge = badge !== undefined ? badge : item.badge;

  const content = (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
        isCollapsed && "justify-center px-0"
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-sidebar-primary"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}

      {Icon && (
        <Icon
          className={cn(
            "shrink-0 size-[18px]",
            isActive ? "text-sidebar-primary" : "text-muted-foreground group-hover:text-sidebar-foreground"
          )}
        />
      )}

      {!isCollapsed && (
        <>
          <span className="truncate">{item.title}</span>
          {displayBadge ? (
            <Badge
              variant="secondary"
              className="ml-auto text-[10px] h-5 px-1.5 font-semibold"
            >
              {displayBadge}
            </Badge>
          ) : (
            (() => {
              const shortcutsMap: Record<string, string> = {
                "/dashboard": "⌥1",
                "/dashboard/jobs": "⌥2",
                "/dashboard/candidates": "⌥3",
                "/dashboard/analytics": "⌥4",
                "/dashboard/organization": "⌥5",
                "/dashboard/ai": "⌥6",
              };
              const shortcut = shortcutsMap[item.href];
              return shortcut ? (
                <span className="ml-auto text-[9px] font-bold font-mono text-muted-foreground/45 select-none tracking-tight">
                  {shortcut}
                </span>
              ) : null;
            })()
          )}
        </>
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={content} />
        <TooltipContent side="right" sideOffset={12}>
          <p>{item.title}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
