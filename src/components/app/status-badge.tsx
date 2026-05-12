import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PromiseStatus } from "@/data";

const statusClassNames: Record<PromiseStatus, string> = {
  kept: "bg-emerald-50 text-emerald-800 border-emerald-200",
  in_progress: "bg-amber-50 text-amber-800 border-amber-200",
  missed: "bg-red-50 text-red-800 border-red-200",
  not_started: "bg-stone-50 text-stone-700 border-stone-200",
  at_risk: "bg-orange-50 text-orange-800 border-orange-200",
};

type StatusBadgeProps = {
  children: ReactNode;
  className?: string;
  tone: PromiseStatus;
};

export function StatusBadge({ children, className, tone }: StatusBadgeProps) {
  return (
    <Badge
      className={cn("border font-semibold uppercase", statusClassNames[tone], className)}
      variant="outline"
    >
      {children}
    </Badge>
  );
}
