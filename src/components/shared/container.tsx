import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeClasses = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  xl: "max-w-screen-2xl",
  full: "max-w-full",
};

export function Container({
  children,
  className,
  as: Comp = "div",
  size = "lg",
}: ContainerProps) {
  return (
    <Comp
      className={cn(
        "mx-auto w-full container-padding",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </Comp>
  );
}
