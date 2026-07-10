import Link from "next/link";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface LogoProps {
  showText?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { icon: 18, text: "text-base" },
  md: { icon: 22, text: "text-lg" },
  lg: { icon: 28, text: "text-2xl" },
};

export function Logo({ showText = true, className, size = "md" }: LogoProps) {
  const { icon, text } = sizeMap[size];

  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 transition-opacity hover:opacity-80",
        className
      )}
    >
      <div className="relative flex items-center justify-center rounded-lg bg-primary p-1.5 shadow-md shadow-primary/25">
        <Sparkles className="text-primary-foreground" size={icon} />
        <div className="absolute inset-0 rounded-lg bg-primary/20 blur-md" />
      </div>
      {showText && (
        <span
          className={cn(
            "font-heading font-bold tracking-tight",
            text
          )}
        >
          Talent
          <span className="text-primary">Hub</span>
        </span>
      )}
    </Link>
  );
}
