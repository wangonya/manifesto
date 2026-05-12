import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PromiseStatus } from "@/data";

const statusClassNames: Record<PromiseStatus, string> = {
  kept: "bg-emerald-100 text-emerald-800 border-emerald-200",
  in_progress: "bg-amber-100 text-amber-800 border-amber-200",
  missed: "bg-red-100 text-red-800 border-red-200",
  not_started: "bg-stone-100 text-stone-700 border-stone-200",
  at_risk: "bg-orange-100 text-orange-800 border-orange-200",
};

type StatusBadgeProps = {
  children: ReactNode;
  className?: string;
  tone: PromiseStatus;
};

export function StatusBadge({ children, className, tone }: StatusBadgeProps) {
  return (
    <Badge
      className={cn("border px-2 py-1 text-[0.68rem] font-extrabold uppercase tracking-wider", statusClassNames[tone], className)}
      variant="outline"
    >
      {children}
    </Badge>
  );
}
