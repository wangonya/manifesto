import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type PanelProps = ComponentProps<"section">;

export function Panel({ className, ...props }: PanelProps) {
  return (
    <section
      className={cn("rounded-lg border border-border bg-card p-5 text-card-foreground", className)}
      {...props}
    />
  );
}
