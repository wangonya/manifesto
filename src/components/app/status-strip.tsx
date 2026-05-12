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
        "flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground",
        className,
      )}
    >
      {statusOrder.map((status) => (
        <div className="inline-flex min-w-0 items-center gap-1.5" key={status}>
          <StatusBadge className="border-0 bg-transparent p-0 shadow-none" tone={status}>
            {localize(statusLabels[status], language)}
          </StatusBadge>
          <strong className="text-sm font-medium leading-none text-foreground">{counts[status]}</strong>
        </div>
      ))}
    </div>
  );
}
