"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "@/components/layout/logo";
import { MARKETING_NAV_ITEMS, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [session, setSession] = useState<{ loggedIn: boolean; role?: string } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("talenthub-session");
    if (raw) {
      const parsedSession = JSON.parse(raw);
      requestAnimationFrame(() => {
        setSession(parsedSession);
      });
    }
  }, []);

  const navItems = [...MARKETING_NAV_ITEMS];
  if (!session || !session.loggedIn || session.role !== "recruiter") {
    navItems.push({ title: "For Employers", href: "/employer" });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="md:hidden inline-flex items-center justify-center size-9 rounded-lg hover:bg-muted transition-colors">
        <Menu className="size-5" />
        <span className="sr-only">Open menu</span>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Logo size="sm" />
          </div>

          {/* Nav Links */}
          <nav className="flex-1 p-4 space-y-1">
            <AnimatePresence>
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      "hover:bg-accent/50",
                      pathname === item.href
                        ? "bg-accent/50 text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.title}
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t space-y-2">
            <Button
              variant="outline"
              className="w-full"
              render={<Link href={ROUTES.LOGIN} onClick={() => setOpen(false)} />}
            >
              Log in
            </Button>
            <Button
              className="w-full"
              render={<Link href={ROUTES.REGISTER} onClick={() => setOpen(false)} />}
            >
              Get Started
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
