"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Compass, Shield, CornerDownLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CommandItem {
  label: string;
  href: string;
  description: string;
  category: string;
}

const COMMANDS: CommandItem[] = [
  { label: "Go to Candidate Hub Overview", href: "/dashboard", description: "Navigate to dashboard overview", category: "Navigation" },
  { label: "Search Vacancies (Job Board)", href: "/dashboard/jobs", description: "Search tech roles & verify match", category: "Navigation" },
  { label: "Post a Job Requisition", href: "/dashboard/jobs/create", description: "Create job listing with AI notes", category: "Recruiter" },
  { label: "Review Candidate Directory", href: "/dashboard/candidates", description: "Verify applicants & export CSV", category: "Recruiter" },
  { label: "Hiring Funnel Analytics", href: "/dashboard/analytics", description: "Check pipeline metrics & Time-to-Hire", category: "Recruiter" },
  { label: "AI Career Copilot Settings", href: "/dashboard/ai", description: "Check ATS fit scoring & resume edits", category: "AI Copilot" },
  { label: "System Admin Dashboard", href: "/admin", description: "Manage users, verify orgs, audit logs", category: "Admin" },
];

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle Command Palette with ⌘K / Ctrl+K & handle quick-nav Alt+1 to Alt+6
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((open) => !open);
      }

      // Escape close
      if (e.key === "Escape") {
        setIsOpen(false);
      }

      // Quick Nav Shortcuts: Alt + 1-6
      if (e.altKey && ["1", "2", "3", "4", "5", "6"].includes(e.key)) {
        e.preventDefault();
        const routesMap: Record<string, string> = {
          "1": "/dashboard",
          "2": "/dashboard/jobs",
          "3": "/dashboard/candidates",
          "4": "/dashboard/analytics",
          "5": "/dashboard/organization",
          "6": "/dashboard/ai",
        };
        const targetRoute = routesMap[e.key];
        if (targetRoute) {
          router.push(targetRoute);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      requestAnimationFrame(() => {
        setSearch("");
        setSelectedIndex(0);
      });
    }
  }, [isOpen]);

  // Filter commands
  const filteredCommands = useMemo(() => {
    if (!search.trim()) return COMMANDS;
    const query = search.toLowerCase();
    return COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query)
    );
  }, [search]);

  // Handle arrows navigation & enter key
  useEffect(() => {
    if (!isOpen) return;

    const handleNav = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          router.push(filteredCommands[selectedIndex].href);
          setIsOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleNav);
    return () => window.removeEventListener("keydown", handleNav);
  }, [isOpen, selectedIndex, filteredCommands, router]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Central command window */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-card/95 border rounded-2xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-md"
          >
            {/* Input search */}
            <div className="relative border-b flex items-center px-4 py-3.5">
              <Search className="size-4.5 text-muted-foreground mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search command actions or navigate routes..."
                className="w-full bg-transparent border-0 text-sm focus:outline-none placeholder:text-muted-foreground"
              />
              <Badge variant="outline" className="text-[9px] font-bold py-0 h-4.5 shrink-0 select-none">ESC</Badge>
            </div>

            {/* List options */}
            <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((c, idx) => {
                  const isActive = idx === selectedIndex;
                  return (
                    <div
                      key={c.label}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={() => {
                        router.push(c.href);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors text-xs font-semibold select-none",
                        isActive ? "bg-primary text-primary-foreground font-bold" : "text-foreground hover:bg-muted/40"
                      )}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="truncate flex items-center gap-1.5">
                          {c.category === "Admin" ? <Shield className="size-3.5" /> : <Compass className="size-3.5" />}
                          {c.label}
                        </div>
                        <p className={cn("text-[10px] truncate leading-normal", isActive ? "text-primary-foreground/75" : "text-muted-foreground")}>
                          {c.description}
                        </p>
                      </div>

                      {isActive && (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold bg-primary-foreground/15 px-1.5 py-0.5 rounded-sm select-none shrink-0 font-mono">
                          Enter <CornerDownLeft className="size-2.5" />
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-xs text-muted-foreground font-semibold">
                  No matching commands found.
                </div>
              )}
            </div>

            {/* Hint Footer bar */}
            <div className="border-t bg-muted/30 px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground select-none">
              <span className="flex items-center gap-1">
                ↑↓ to navigate • ↵ to select
              </span>
              <span className="font-semibold font-mono">
                Ctrl+K to toggle palette
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
