"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/shared/error-state";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-dvh flex items-center justify-center">
      <ErrorState
        title="Something went wrong"
        message={
          process.env.NODE_ENV === "development"
            ? error.message
            : "An unexpected error occurred. Our team has been notified."
        }
        onRetry={reset}
        fullPage
      />
    </div>
  );
}
