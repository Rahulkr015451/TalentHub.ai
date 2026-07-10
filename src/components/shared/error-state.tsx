"use client";

import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  fullPage?: boolean;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  fullPage = false,
  className,
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col items-center justify-center text-center px-6",
        fullPage ? "min-h-[60dvh]" : "py-16",
        className
      )}
    >
      <div className="flex items-center justify-center size-16 rounded-2xl bg-destructive/10 mb-4">
        <AlertTriangle className="size-7 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground max-w-sm">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          className="mt-6 gap-2"
          onClick={onRetry}
        >
          <RefreshCw className="size-3.5" />
          Try again
        </Button>
      )}
    </motion.div>
  );
}
