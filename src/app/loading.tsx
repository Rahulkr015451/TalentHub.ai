import { LoadingSpinner } from "@/components/shared/loading-spinner";

export default function GlobalLoading() {
  return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Pulsing logo mark */}
        <div className="relative">
          <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center animate-pulse">
            <div className="size-6 rounded-lg bg-primary/30" />
          </div>
          <div className="absolute inset-0 rounded-xl bg-primary/5 blur-xl animate-pulse" />
        </div>
        <LoadingSpinner size="sm" text="Loading..." />
      </div>
    </div>
  );
}
