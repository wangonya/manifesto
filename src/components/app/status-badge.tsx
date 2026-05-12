import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PromiseStatus } from "@/data";

const statusDotClassNames: Record<PromiseStatus, string> = {
  kept: "bg-emerald-500",
  in_progress: "bg-amber-500",
  missed: "bg-red-500",
  not_started: "bg-zinc-400",
  at_risk: "bg-orange-500",
};

type StatusBadgeProps = {
  children: ReactNode;
  className?: string;
  tone: PromiseStatus;
};

export function StatusBadge({ children, className, tone }: StatusBadgeProps) {
  return (
    <Badge
      className={cn(
        "gap-1.5 border-border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground",
        className,
      )}
      variant="outline"
    >
      <span className={cn("size-1.5 rounded-full", statusDotClassNames[tone])} aria-hidden="true" />
      {children}
    </Badge>
  );
}
