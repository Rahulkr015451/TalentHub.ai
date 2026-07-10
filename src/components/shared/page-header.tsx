import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
  actionHref?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
  actionHref,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground max-w-2xl">
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {children}
        {actionLabel && (
          actionHref ? (
            <Button
              size="sm"
              className="gap-2"
              render={<a href={actionHref} />}
            >
              {ActionIcon && <ActionIcon className="size-4" />}
              {actionLabel}
            </Button>
          ) : (
            <Button size="sm" className="gap-2" onClick={onAction}>
              {ActionIcon && <ActionIcon className="size-4" />}
              {actionLabel}
            </Button>
          )
        )}
      </div>
    </div>
  );
}
