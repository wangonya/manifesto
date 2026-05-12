import { ChevronRight, CheckCircle2, CalendarDays, UserRound } from "lucide-react";

import { StatusBadge } from "@/components/app/status-badge";
import { cn } from "@/lib/utils";
import type { PromiseRecord } from "@/data";
import { getCandidateForPromise } from "@/domain";
import { localize, statusLabels, uiCopy, type LanguageCode } from "@/i18n";

function formatDate(value: string, language: LanguageCode) {
  return new Intl.DateTimeFormat(language === "en" ? "en-GB" : language, {
    dateStyle: "medium",
  }).format(new Date(value));
}

type PromiseRowProps = {
  active?: boolean;
  language: LanguageCode;
  onSelect: (promiseId: string) => void;
  promise: PromiseRecord;
};

export function PromiseRow({ active = false, language, onSelect, promise }: PromiseRowProps) {
  const candidate = getCandidateForPromise(promise);
  const completed = promise.checkpoints.filter((checkpoint) => checkpoint.complete).length;
  const promiseTitle = localize(promise.title, language);

  return (
    <button
      aria-label={`${localize(uiCopy.viewDetailsFor, language)} ${promiseTitle}`}
      aria-pressed={active}
      className={cn(
        "grid w-full gap-3 rounded-lg border border-border bg-card p-4 text-left text-card-foreground transition hover:border-primary/40 hover:bg-accent/50",
        active && "border-primary/50 bg-accent shadow-[inset_4px_0_0_var(--primary)]",
      )}
      onClick={() => onSelect(promise.id)}
      type="button"
    >
      <span className="flex items-start justify-between gap-3">
        <StatusBadge tone={promise.status}>{localize(statusLabels[promise.status], language)}</StatusBadge>
        <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </span>
      <span className="grid gap-2">
        <span className="font-semibold leading-snug text-foreground">{promiseTitle}</span>
        <span className="text-sm leading-relaxed text-muted-foreground">
          {localize(promise.summary, language)}
        </span>
      </span>
      <span className="grid gap-2 text-xs font-semibold text-muted-foreground sm:grid-cols-3">
        <span className="inline-flex items-center gap-1.5">
          <UserRound className="size-3.5" aria-hidden="true" />
          {candidate?.name ?? "-"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-3.5" aria-hidden="true" />
          {formatDate(promise.deadline, language)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="size-3.5" aria-hidden="true" />
          {completed} / {promise.checkpoints.length}
        </span>
      </span>
    </button>
  );
}
