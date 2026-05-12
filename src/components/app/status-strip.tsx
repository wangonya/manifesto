import { StatusBadge } from "@/components/app/status-badge";
import { cn } from "@/lib/utils";
import type { PromiseStatus } from "@/data";
import { localize, statusLabels, type LanguageCode } from "@/i18n";

const statusOrder: PromiseStatus[] = ["kept", "in_progress", "at_risk", "missed", "not_started"];

type StatusStripProps = {
  counts: Record<PromiseStatus, number>;
  className?: string;
  label: string;
  language: LanguageCode;
};

export function StatusStrip({ className, counts, label, language }: StatusStripProps) {
  return (
    <div
      aria-label={label}
      className={cn("grid gap-2 rounded-lg border border-border bg-card p-3 sm:grid-cols-5", className)}
    >
      {statusOrder.map((status) => (
        <div className="grid gap-2 rounded-md bg-muted/60 p-3" key={status}>
          <StatusBadge tone={status}>{localize(statusLabels[status], language)}</StatusBadge>
          <strong className="text-xl leading-none text-foreground">{counts[status]}</strong>
        </div>
      ))}
    </div>
  );
}
