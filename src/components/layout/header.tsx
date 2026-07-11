"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MARKETING_NAV_ITEMS, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { MobileNav } from "@/components/layout/mobile-nav";

interface HeaderProps {
  variant?: "marketing" | "dashboard";
}

export function Header({ variant = "marketing" }: HeaderProps) {
  const pathname = usePathname();
  const [session, setSession] = useState<{ loggedIn: boolean; role?: string } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("talenthub-session");
    if (raw) {
      const parsedSession = JSON.parse(raw);
      requestAnimationFrame(() => {
        setSession(parsedSession);
      });
    } else {
      requestAnimationFrame(() => {
        setSession({ loggedIn: false });
      });
    }
  }, []);

  if (variant === "dashboard") {
    return <DashboardHeader />;
  }

  // Build navigation items list
  const navItems = [...MARKETING_NAV_ITEMS];
  // If not logged in or logged in as a candidate, show the "For Employers" option
  if (!session || !session.loggedIn || session.role !== "recruiter") {
    navItems.push({ title: "For Employers", href: "/employer" });
  }

  return (
    <header className="sticky top-0 z-50 w-full glass">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  "hover:bg-accent/50 hover:text-accent-foreground",
                  pathname === item.href
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Search bar */}
          <div className="relative hidden md:block max-w-[190px] w-full mx-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search vacancies..."
              onClick={() => {
                const event = new KeyboardEvent("keydown", {
                  key: "k",
                  metaKey: true,
                  bubbles: true
                });
                window.dispatchEvent(event);
              }}
              readOnly
              className="h-8.5 w-full rounded-lg border bg-muted/40 pl-9 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none cursor-pointer transition-all hover:bg-muted/70 hover:border-primary/20 select-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-2">
              {session?.loggedIn ? (
                <Button size="sm" render={<Link href={ROUTES.DASHBOARD} />}>
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" render={<Link href={ROUTES.LOGIN} />}>
                    Log in
                  </Button>
                  <Button size="sm" render={<Link href={ROUTES.REGISTER} />}>
                    Get Started
                  </Button>
                </>
              )}
            </div>
            <MobileNav />
          </div>
        </div>
      </Container>
    </header>
  );
}

function DashboardHeader() {
  const router = useRouter();
  const [userName, setUserName] = useState("Jane Doe");
  const [userEmail, setUserEmail] = useState("jane@talenthub.com");

  useEffect(() => {
    const syncSession = () => {
      const raw = localStorage.getItem("talenthub-session");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.name) setUserName(parsed.name);
        if (parsed.email) setUserEmail(parsed.email);
      }
    };

    syncSession();
    window.addEventListener("storage", syncSession);
    return () => {
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("talenthub-session");
    router.push("/");
  };

  const userInitials = userName
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full glass border-b">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        {/* Left: Search */}
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search anything..."
              className="h-9 w-64 rounded-lg border bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background transition-all"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="relative size-9">
            <Bell className="size-4" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary animate-pulse" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <Avatar className="size-8">
                <AvatarImage src="/avatars/user.png" alt="User" />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={ROUTES.PROFILE} className="w-full">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href={ROUTES.SETTINGS} className="w-full">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
