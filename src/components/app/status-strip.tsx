import { StatusBadge } from "@/components/app/status-badge";
import { cn } from "@/lib/utils";
import type { PromiseStatus } from "@/data";
import { localize, statusLabels, type LanguageCode } from "@/i18n";

const statusOrder: PromiseStatus[] = ["kept", "in_progress", "missed", "not_started", "at_risk"];

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
      className={cn(
        "flex flex-wrap gap-2 rounded-lg border border-border bg-card p-2",
        className,
      )}
    >
      {statusOrder.map((status) => (
        <div className="inline-flex min-w-0 items-center gap-2 rounded-md bg-muted/60 px-2.5 py-2" key={status}>
          <StatusBadge className="max-w-full whitespace-normal" tone={status}>
            {localize(statusLabels[status], language)}
          </StatusBadge>
          <strong className="text-sm leading-none text-foreground">{counts[status]}</strong>
        </div>
      ))}
    </div>
  );
}
