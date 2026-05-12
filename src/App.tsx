import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import "./App.css";
import { PromiseRow } from "@/components/app/promise-row";
import { StatusBadge } from "@/components/app/status-badge";
import { StatusStrip } from "@/components/app/status-strip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  candidates,
  contextNotes as seededContextNotes,
  evidence as seededEvidence,
  promises,
  statusHistory,
  syncQueue as seededSyncQueue,
  type Candidate,
  type ContextNote as ContextNoteRecord,
  type Evidence as EvidenceRecord,
  type OfficeCode,
  type PromiseRecord,
  type PromiseStatus,
  type SectorCode,
  type StatusHistory as StatusHistoryRecord,
  type SyncEnvelope,
} from "./data";
import {
  filterCandidates,
  getCandidateForPromise,
  getContextNotesForPromise,
  getEvidenceForPromise,
  getFollowedPromises,
  getManifestoForCandidate,
  getPriorityPromises,
  getPromisesForCandidate,
  getStatusCounts,
  getStatusHistoryForPromise,
  isElectedCandidate,
} from "./domain";
import {
  allOfficeFilterLabel,
  allSectorFilterLabel,
  authoredUserText,
  confidenceLabels,
  evidenceTypeLabels,
  languageLabel,
  languageOptions,
  localize,
  localizeUserText,
  localeForLanguage,
  officeLabels,
  regionLabels,
  sectorLabels,
  statusLabels,
  text,
  uiCopy,
  type LanguageCode,
  type LocalizedText,
} from "./i18n";

type View = "dashboard" | "manifestos";
type IconName =
  | "archive"
  | "book"
  | "calendar"
  | "check"
  | "chevron"
  | "clock"
  | "file"
  | "filter"
  | "map"
  | "pin"
  | "search"
  | "shield"
  | "signal"
  | "user";

const confidenceLabelKeys: ContextNoteRecord["confidenceLabel"][] = [
  "community report",
  "needs verification",
  "public record",
];

const pageWidthClass =
  "mx-auto w-[calc(100%_-_3rem)] max-w-[1320px] max-[820px]:w-[calc(100%_-_2rem)] max-[520px]:w-[calc(100%_-_1.5rem)]";
const panelClass = "rounded-lg border border-border bg-card p-6 text-card-foreground max-[820px]:p-5 max-[520px]:p-4";
const inlineDetailPanelClass = "border-[#b7d2c2] bg-[#fbfefb] shadow-[inset_4px_0_0_#9bc5aa]";
const eyebrowClass = "mb-2.5 text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground";
const sectionHeadingClass = "mb-4";
const sectionTitleClass = "m-0 text-[1.15rem] leading-tight tracking-normal text-[#17241d]";
const iconBoxClass = "grid shrink-0 place-items-center rounded-lg border border-[#c9d8ce] bg-[#edf5ee] text-primary";
const factGridClass = "grid grid-cols-1 gap-3 min-[821px]:grid-cols-4";
const manifestoFactGridClass = "mt-4 grid grid-cols-1 gap-3 min-[821px]:grid-cols-3";
const factItemClass = "border-t border-[#e4dfd3] pt-3";
const factTermClass =
  "flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.08em] text-muted-foreground";
const factDefinitionClass = "mt-1 text-sm font-semibold text-foreground";
const detailBlockClass = "grid gap-3 border-t border-[#e6e1d5] pt-4 first:border-t-0 first:pt-0";
const detailBlockHeadingClass =
  "flex items-start justify-between gap-3 max-[520px]:grid max-[520px]:justify-stretch";
const detailCountClass =
  "rounded-full border border-input bg-[#faf8f0] px-2.5 py-1 text-xs font-extrabold uppercase text-muted-foreground";
const detailListClass = "grid list-none gap-2.5 p-0";
const detailRowClass =
  "grid grid-cols-[auto_minmax(0,1fr)] gap-3 border-t border-[#e6e1d5] pt-3 first:border-t-0 first:pt-0 max-[520px]:grid-cols-1";
const detailIconClass = "grid size-8 place-items-center rounded-lg border border-[#d3ddce] bg-card text-muted-foreground";
const detailToplineClass =
  "flex items-start justify-between gap-3 max-[520px]:grid max-[520px]:justify-stretch";
const tagListClass = "mt-2 flex flex-wrap gap-1.5";
const tagClass = "rounded-full border border-[#e0dbce] bg-card px-2 py-1 text-xs font-bold text-muted-foreground";
const emptyCopyClass = "m-0 border-t border-[#e6e1d5] pt-3.5 text-sm text-muted-foreground";
const evidenceFormClass = "grid gap-3 rounded-lg border border-border bg-[#faf8f0] p-3.5";
const evidenceFormToplineClass =
  "flex items-center justify-between gap-3 max-[520px]:grid max-[520px]:justify-stretch";
const evidenceFormGridClass = "grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-3 max-[520px]:grid-cols-1";
const formFieldClass = "grid gap-1.5 text-sm font-bold text-muted-foreground";
const nativeFieldClass = "w-full rounded-lg border border-input bg-card px-3 py-2.5 text-foreground";

type SourceLabelOption = {
  id: string;
  label: LocalizedText;
};

const defaultSourceLabels: SourceLabelOption[] = [
  {
    id: "anonymous-resident-report",
    label: text("Anonymous resident report", "Ripoti ya mkazi bila jina", "Rapport anonyme d'un habitant"),
  },
  {
    id: "community-meeting-notes",
    label: text("Community meeting notes", "Madokezo ya mkutano wa jamii", "Notes de réunion communautaire"),
  },
  {
    id: "public-notice-board",
    label: text("Public notice board", "Ubao wa matangazo ya umma", "Tableau d'affichage public"),
  },
  {
    id: "local-committee-minutes",
    label: text("Local committee minutes", "Muhtasari wa kamati ya eneo", "Procès-verbal du comité local"),
  },
];

const sourceLabelsBySector: Record<SectorCode, SourceLabelOption[]> = {
  education: [
    {
      id: "constituency-bursary-notice-board",
      label: text(
        "Constituency bursary notice board",
        "Ubao wa matangazo ya bursary ya eneo bunge",
        "Tableau d'affichage des bourses de la circonscription",
      ),
    },
    {
      id: "school-heads-circular",
      label: text("School heads circular", "Waraka wa wakuu wa shule", "Circulaire des chefs d'établissement"),
    },
    {
      id: "parent-association-report",
      label: text("Parent association report", "Ripoti ya chama cha wazazi", "Rapport de l'association des parents"),
    },
    {
      id: "public-awards-list",
      label: text("Public awards list", "Orodha ya umma ya waliopata", "Liste publique des bénéficiaires"),
    },
  ],
  health: [
    {
      id: "anonymous-patient-report",
      label: text("Anonymous patient report", "Ripoti ya mgonjwa bila jina", "Rapport anonyme d'un patient"),
    },
    {
      id: "clinic-watch-group",
      label: text("Clinic watch group", "Kikundi cha uangalizi wa kliniki", "Groupe de veille de la clinique"),
    },
    {
      id: "county-health-notice-board",
      label: text("County health notice board", "Ubao wa matangazo ya afya ya kaunti", "Tableau d'affichage sanitaire du comté"),
    },
    {
      id: "facility-staffing-roster",
      label: text("Facility staffing roster", "Ratiba ya wafanyakazi wa kituo", "Liste du personnel de l'établissement"),
    },
  ],
  housing: [
    {
      id: "tenant-safety-volunteer-report",
      label: text(
        "Tenant safety volunteer report",
        "Ripoti ya wajitolea wa usalama wa wapangaji",
        "Rapport des bénévoles sur la sécurité des locataires",
      ),
    },
    {
      id: "factory-area-residents-report",
      label: text("Factory-area residents report", "Ripoti ya wakazi karibu na viwanda", "Rapport des habitants près des usines"),
    },
    {
      id: "public-inspection-notice",
      label: text("Public inspection notice", "Tangazo la ukaguzi wa umma", "Avis d'inspection publique"),
    },
    {
      id: "anonymous-rental-risk-map",
      label: text("Anonymous rental risk map", "Ramani ya hatari za nyumba bila majina", "Carte anonyme des risques locatifs"),
    },
  ],
  infrastructure: [
    {
      id: "farmer-transport-group-report",
      label: text(
        "Farmer transport group report",
        "Ripoti ya kikundi cha usafiri wa wakulima",
        "Rapport du groupe de transport des agriculteurs",
      ),
    },
    {
      id: "road-works-notice-board",
      label: text("Road works notice board", "Ubao wa matangazo ya kazi za barabara", "Tableau d'affichage des travaux routiers"),
    },
    {
      id: "ward-administrator-update",
      label: text("Ward administrator update", "Taarifa ya msimamizi wa wadi", "Point du responsable de quartier"),
    },
    {
      id: "site-inspection-photo-log",
      label: text("Site inspection photo log", "Rekodi ya picha za ukaguzi wa eneo", "Journal photo d'inspection du site"),
    },
  ],
  jobs: [
    {
      id: "market-traders-meeting",
      label: text("Market traders meeting", "Mkutano wa wafanyabiashara wa soko", "Réunion des commerçants du marché"),
    },
    {
      id: "public-works-notice-board",
      label: text("Public works notice board", "Ubao wa matangazo ya kazi za umma", "Tableau d'affichage des travaux publics"),
    },
    {
      id: "youth-group-report",
      label: text("Youth group report", "Ripoti ya kikundi cha vijana", "Rapport du groupe de jeunes"),
    },
    {
      id: "county-enterprise-office-memo",
      label: text("County enterprise office memo", "Memo ya afisi ya biashara ya kaunti", "Note du bureau des entreprises du comté"),
    },
  ],
  safety: [
    {
      id: "resident-safety-walk-report",
      label: text("Resident safety walk report", "Ripoti ya matembezi ya usalama ya wakazi", "Rapport de marche de sécurité des habitants"),
    },
    {
      id: "bus-stage-traders-report",
      label: text("Bus stage traders report", "Ripoti ya wafanyabiashara wa stage", "Rapport des commerçants de l'arrêt de bus"),
    },
    {
      id: "streetlight-maintenance-notice",
      label: text("Streetlight maintenance notice", "Tangazo la matengenezo ya taa", "Avis d'entretien des lampadaires"),
    },
    {
      id: "community-policing-forum-notes",
      label: text("Community policing forum notes", "Madokezo ya jukwaa la polisi jamii", "Notes du forum de police communautaire"),
    },
  ],
  water: [
    {
      id: "water-users-committee-minutes",
      label: text("Water users committee minutes", "Muhtasari wa kamati ya watumiaji maji", "Procès-verbal du comité des usagers de l'eau"),
    },
    {
      id: "borehole-caretaker-report",
      label: text("Borehole caretaker report", "Ripoti ya msimamizi wa kisima", "Rapport du gardien du forage"),
    },
    {
      id: "ward-water-office-notice",
      label: text("Ward water office notice", "Tangazo la afisi ya maji ya wadi", "Avis du bureau de l'eau du quartier"),
    },
    {
      id: "community-water-point-log",
      label: text("Community water point log", "Rekodi ya eneo la maji la jamii", "Registre du point d'eau communautaire"),
    },
  ],
};

function getSourceLabelOptions(sector: SectorCode) {
  return sourceLabelsBySector[sector] ?? defaultSourceLabels;
}

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    archive: (
      <>
        <path d="M4 7h16" />
        <path d="M6 7v11h12V7" />
        <path d="M9 11h6" />
        <path d="M5 4h14l1 3H4z" />
      </>
    ),
    book: (
      <>
        <path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 0-4-4z" />
        <path d="M5 4v12" />
        <path d="M9 8h6" />
        <path d="M9 12h5" />
      </>
    ),
    calendar: (
      <>
        <path d="M7 3v4" />
        <path d="M17 3v4" />
        <path d="M4 8h16" />
        <path d="M5 5h14v15H5z" />
      </>
    ),
    check: (
      <>
        <path d="M20 6 9 17l-5-5" />
      </>
    ),
    chevron: (
      <>
        <path d="m9 18 6-6-6-6" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v5l3 2" />
      </>
    ),
    file: (
      <>
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v5h4" />
        <path d="M9 13h6" />
        <path d="M9 17h4" />
      </>
    ),
    filter: (
      <>
        <path d="M4 5h16" />
        <path d="M7 12h10" />
        <path d="M10 19h4" />
      </>
    ),
    map: (
      <>
        <path d="m9 18-5 2V6l5-2 6 2 5-2v14l-5 2z" />
        <path d="M9 4v14" />
        <path d="M15 6v14" />
      </>
    ),
    pin: (
      <>
        <path d="M12 21s6-5.3 6-11a6 6 0 0 0-12 0c0 5.7 6 11 6 11z" />
        <path d="M12 10.5h.01" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10z" />
        <path d="M9 12l2 2 4-5" />
      </>
    ),
    signal: (
      <>
        <path d="M4 18h.01" />
        <path d="M8 18a8 8 0 0 1 8-8" />
        <path d="M4 10a16 16 0 0 1 16-4" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className="size-[1.05em]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}

function formatDate(value: string, language: LanguageCode) {
  return new Intl.DateTimeFormat(localeForLanguage(language), {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value: string, language: LanguageCode) {
  return new Intl.DateTimeFormat(localeForLanguage(language), {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function CandidateCard({
  candidate,
  active,
  compact = false,
  language,
  onSelect,
}: {
  candidate: Candidate;
  active?: boolean;
  compact?: boolean;
  language: LanguageCode;
  onSelect: (candidateId: string) => void;
}) {
  const candidatePromises = getPromisesForCandidate(candidate.id);
  const counts = getStatusCounts(candidatePromises);
  const candidateStatusLabel = isElectedCandidate(candidate)
    ? localize(uiCopy.elected, language)
    : localize(uiCopy.archived, language);

  return (
    <button
      className={cn(
        "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] gap-3 rounded-lg border border-border bg-card p-3.5 text-left text-card-foreground transition hover:border-[#b7d2c2] hover:bg-[#f6fbf6]",
        active && "border-[#b7d2c2] bg-[#f6fbf6]",
      )}
      onClick={() => onSelect(candidate.id)}
      type="button"
    >
      <span className={cn(iconBoxClass, "size-8")}>
        <Icon name={isElectedCandidate(candidate) ? "pin" : "archive"} />
      </span>
      <span>
        <span className="block font-bold text-[#1f2d25]">{candidate.name}</span>
        <span className="mt-0.5 block text-sm text-muted-foreground">
          {localize(officeLabels[candidate.office], language)} |{" "}
          {localize(regionLabels[candidate.region], language)}
        </span>
        <span className="mt-2.5 flex flex-wrap gap-1.5">
          <StatusPill tone={isElectedCandidate(candidate) ? "kept" : "not_started"}>
            {candidateStatusLabel}
          </StatusPill>
          {counts.missed > 0 ? (
            <StatusPill tone="missed">
              {counts.missed} {localize(statusLabels.missed, language)}
            </StatusPill>
          ) : null}
          {counts.at_risk > 0 ? (
            <StatusPill tone="at_risk">
              {counts.at_risk} {localize(statusLabels.at_risk, language)}
            </StatusPill>
          ) : null}
        </span>
      </span>
      <span className={cn("text-muted-foreground", compact && "hidden")}>
        <Icon name="chevron" />
      </span>
    </button>
  );
}

function StatusPill({
  children,
  tone,
}: {
  children: ReactNode;
  tone: PromiseStatus;
}) {
  return (
    <StatusBadge className="w-fit px-2 py-1 text-[0.68rem] font-extrabold leading-none tracking-[0.08em]" tone={tone}>
      {children}
    </StatusBadge>
  );
}

type EvidenceSubmission = {
  note: string;
  sourceLabel: LocalizedText;
  type: EvidenceRecord["type"];
};
type ContextNoteSubmission = Pick<ContextNoteRecord, "confidenceLabel"> & {
  note: string;
};

function linkedEvidenceLabels(
  historyItem: StatusHistoryRecord,
  evidenceRecords: EvidenceRecord[],
  language: LanguageCode,
) {
  return historyItem.evidenceIds
    .map((evidenceId) => {
      const evidenceItem = evidenceRecords.find((item) => item.id === evidenceId);
      return evidenceItem ? localize(evidenceItem.sourceLabel, language) : undefined;
    })
    .filter(Boolean)
    .join(", ");
}

function PromiseDetailTabs({
  compact = false,
  contextNoteRecords,
  evidenceRecords,
  language,
  onAddContextNote,
  onAddEvidence,
  promise,
}: {
  compact?: boolean;
  contextNoteRecords: ContextNoteRecord[];
  evidenceRecords: EvidenceRecord[];
  language: LanguageCode;
  onAddContextNote: (promiseId: string, submission: ContextNoteSubmission) => void;
  onAddEvidence: (promiseId: string, submission: EvidenceSubmission) => void;
  promise: PromiseRecord;
}) {
  const [evidenceType, setEvidenceType] = useState<EvidenceRecord["type"]>("community_report");
  const [sourceLabelId, setSourceLabelId] = useState("");
  const [evidenceNote, setEvidenceNote] = useState("");
  const [confidenceLabel, setConfidenceLabel] =
    useState<ContextNoteRecord["confidenceLabel"]>("community report");
  const [contextNote, setContextNote] = useState("");
  const canSubmitEvidence = sourceLabelId.trim() !== "" && evidenceNote.trim() !== "";
  const canSubmitContextNote = contextNote.trim() !== "";

  function handleSubmitEvidence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!promise || !canSubmitEvidence) return;
    const selectedSourceLabel = getSourceLabelOptions(promise.sector).find(
      (option) => option.id === sourceLabelId,
    );
    if (!selectedSourceLabel) return;

    onAddEvidence(promise.id, {
      type: evidenceType,
      sourceLabel: selectedSourceLabel.label,
      note: evidenceNote.trim(),
    });
    setSourceLabelId("");
    setEvidenceNote("");
    setEvidenceType("community_report");
  }

  function handleSubmitContextNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!promise || !canSubmitContextNote) return;

    onAddContextNote(promise.id, {
      note: contextNote.trim(),
      confidenceLabel,
    });
    setContextNote("");
    setConfidenceLabel("community report");
  }

  const candidate = getCandidateForPromise(promise);
  const manifesto = candidate ? getManifestoForCandidate(candidate.id) : undefined;
  const completed = promise.checkpoints.filter((checkpoint) => checkpoint.complete).length;
  const promiseContextNotes = getContextNotesForPromise(promise.id, contextNoteRecords);
  const promiseEvidence = getEvidenceForPromise(promise.id, evidenceRecords);
  const promiseHistory = getStatusHistoryForPromise(promise.id);
  const sourceLabelOptions = getSourceLabelOptions(promise.sector);
  const promiseTitle = localize(promise.title, language);

  return (
    <section
      className={cn("grid gap-5", panelClass, compact && inlineDetailPanelClass)}
      aria-labelledby={`detail-${promise.id}`}
    >
      <div className="flex items-start justify-between gap-4 max-[520px]:grid max-[520px]:justify-stretch">
        <div>
          <p className={eyebrowClass}>{localize(uiCopy.promiseDetail, language)}</p>
          <h2 className="m-0 text-[clamp(1.35rem,2vw,2rem)] leading-tight tracking-normal text-[#17241d]" id={`detail-${promise.id}`}>
            {promiseTitle}
          </h2>
          <p className="mt-2.5 text-muted-foreground">{localize(promise.summary, language)}</p>
        </div>
        <StatusPill tone={promise.status}>{localize(statusLabels[promise.status], language)}</StatusPill>
      </div>

      <Tabs className="grid gap-4" defaultValue="overview">
        <TabsList
          className="grid !h-auto min-h-10 w-full max-w-full grid-cols-2 gap-1 overflow-visible p-1 min-[521px]:grid-cols-4"
          aria-label={localize(uiCopy.promiseDetail, language)}
        >
          <TabsTrigger className="min-h-8 min-w-0 !whitespace-normal px-2 text-center leading-tight" value="overview">
            {localize(uiCopy.overview, language)}
          </TabsTrigger>
          <TabsTrigger className="min-h-8 min-w-0 !whitespace-normal px-2 text-center leading-tight" value="evidence">
            {localize(uiCopy.evidence, language)}
          </TabsTrigger>
          <TabsTrigger className="min-h-8 min-w-0 !whitespace-normal px-2 text-center leading-tight" value="context">
            {localize(uiCopy.context, language)}
          </TabsTrigger>
          <TabsTrigger className="min-h-8 min-w-0 !whitespace-normal px-2 text-center leading-tight" value="history">
            {localize(uiCopy.history, language)}
          </TabsTrigger>
        </TabsList>

        <TabsContent className="grid gap-4" value="overview">
          <dl className={factGridClass} aria-label={localize(uiCopy.promiseFacts, language)}>
            <div className={factItemClass}>
              <dt className={factTermClass}>
                <Icon name="user" />
                {localize(uiCopy.candidate, language)}
              </dt>
              <dd className={factDefinitionClass}>{candidate?.name ?? "-"}</dd>
            </div>
            <div className={factItemClass}>
              <dt className={factTermClass}>
                <Icon name="map" />
                {localize(uiCopy.place, language)}
              </dt>
              <dd className={factDefinitionClass}>{localize(promise.location, language)}</dd>
            </div>
            <div className={factItemClass}>
              <dt className={factTermClass}>
                <Icon name="calendar" />
                {localize(uiCopy.deadline, language)}
              </dt>
              <dd className={factDefinitionClass}>{formatDate(promise.deadline, language)}</dd>
            </div>
            <div className={factItemClass}>
              <dt className={factTermClass}>
                <Icon name="book" />
                {localize(uiCopy.source, language)}
              </dt>
              <dd className={factDefinitionClass}>{manifesto ? localize(manifesto.sourceLabel, language) : "-"}</dd>
            </div>
          </dl>

          <div className={detailBlockClass}>
        <div className={detailBlockHeadingClass}>
          <div>
            <p className={eyebrowClass}>{localize(uiCopy.checkPoints, language)}</p>
            <h3 className="m-0 text-base leading-tight tracking-normal text-[#17241d]">
              {completed} / {promise.checkpoints.length} {localize(uiCopy.complete, language)}
            </h3>
          </div>
          <span className={detailCountClass}>{localize(sectorLabels[promise.sector], language)}</span>
        </div>
        <ol className="grid list-none gap-2.5 p-0">
          {promise.checkpoints.map((checkpoint) => (
            <li
              className={cn(
                "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-[#e4dfd3] bg-[#faf8f0] p-3 max-[520px]:grid-cols-1",
                checkpoint.complete && "border-[#c8dacd] bg-[#f0f8f2]",
              )}
              key={`${promise.id}-${localize(checkpoint.label, "en")}`}
            >
              <span className={cn("grid size-8 place-items-center rounded-lg border border-[#d3ddce] bg-card text-muted-foreground", checkpoint.complete && "border-[#b8d4c0] bg-[#e5f2e8] text-primary")}>
                <Icon name={checkpoint.complete ? "check" : "clock"} />
              </span>
              <div>
                <strong className="block text-sm font-bold text-foreground">{localize(checkpoint.label, language)}</strong>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  {localize(uiCopy.due, language)} {formatDate(checkpoint.dueDate, language)}
                </span>
              </div>
              <StatusPill tone={checkpoint.complete ? "kept" : "not_started"}>
                {checkpoint.complete
                  ? localize(uiCopy.complete, language)
                  : localize(uiCopy.pending, language)}
              </StatusPill>
            </li>
          ))}
        </ol>
          </div>
        </TabsContent>

        <TabsContent className="grid gap-4" value="evidence">
          <div className={detailBlockClass}>
        <div className={detailBlockHeadingClass}>
          <div>
            <p className={eyebrowClass}>{localize(uiCopy.evidence, language)}</p>
            <h3 className="m-0 text-base leading-tight tracking-normal text-[#17241d]">{localize(uiCopy.anonymousCommunityRecord, language)}</h3>
          </div>
          <span className={detailCountClass}>{promiseEvidence.length}</span>
        </div>
        <form
          aria-label={`${localize(uiCopy.addAnonymousEvidence, language)} ${promiseTitle}`}
          className={evidenceFormClass}
          onSubmit={handleSubmitEvidence}
        >
          <div className={evidenceFormToplineClass}>
            <p className={cn(eyebrowClass, "m-0")}>{localize(uiCopy.addEvidence, language)}</p>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
              <Icon name="shield" />
              {localize(uiCopy.identityHidden, language)}
            </span>
          </div>
          <div className={evidenceFormGridClass}>
            <label className={formFieldClass}>
              <span className="block">{localize(uiCopy.evidenceType, language)}</span>
              <select
                className={nativeFieldClass}
                onChange={(event) => setEvidenceType(event.target.value as EvidenceRecord["type"])}
                value={evidenceType}
              >
                {(Object.keys(evidenceTypeLabels) as EvidenceRecord["type"][]).map((type) => (
                  <option key={type} value={type}>
                    {localize(evidenceTypeLabels[type], language)}
                  </option>
                ))}
              </select>
            </label>
            <label className={formFieldClass}>
              <span className="block">{localize(uiCopy.sourceLabel, language)}</span>
              <select
                className={nativeFieldClass}
                onChange={(event) => setSourceLabelId(event.target.value)}
                value={sourceLabelId}
              >
                <option value="">{localize(uiCopy.chooseSourceLabel, language)}</option>
                {sourceLabelOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {localize(option.label, language)}
                  </option>
                ))}
              </select>
            </label>
            <label className={cn(formFieldClass, "col-span-full")}>
              <span className="block">{localize(uiCopy.evidenceNote, language)}</span>
              <Textarea
                onChange={(event) => setEvidenceNote(event.target.value)}
                placeholder={localize(uiCopy.evidencePlaceholder, language)}
                value={evidenceNote}
              />
            </label>
          </div>
          <div className="flex justify-end">
            <Button disabled={!canSubmitEvidence} type="submit">
              {localize(uiCopy.addAnonymousEvidence, language)}
            </Button>
          </div>
        </form>
        {promiseEvidence.length > 0 ? (
          <ul className={detailListClass}>
            {promiseEvidence.map((item) => {
              const note = localizeUserText(item.note, language);
              return (
                <li className={detailRowClass} key={item.id}>
                  <span className={detailIconClass}>
                    <Icon name={item.createdOffline ? "signal" : "file"} />
                  </span>
                  <div>
                    <div className={detailToplineClass}>
                      <strong className="block text-sm font-bold text-foreground">{localize(evidenceTypeLabels[item.type], language)}</strong>
                      <span className="shrink-0 text-xs font-bold text-muted-foreground">{formatDateTime(item.createdAt, language)}</span>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">{note.text}</p>
                    <div className={tagListClass}>
                      <span className={tagClass}>{localize(item.sourceLabel, language)}</span>
                      {note.isFallback ? (
                        <span className={tagClass}>
                          {localize(uiCopy.original, language)}: {languageLabel(note.originalLanguage)}
                        </span>
                      ) : null}
                      {note.isFallback && note.translationStatus === "pending" ? (
                        <span className={tagClass}>{localize(uiCopy.translationPending, language)}</span>
                      ) : null}
                      {item.anonymous ? <span className={tagClass}>{localize(uiCopy.anonymous, language)}</span> : null}
                      {item.createdOffline ? <span className={tagClass}>{localize(uiCopy.createdOffline, language)}</span> : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={emptyCopyClass}>{localize(uiCopy.noEvidence, language)}</p>
        )}
          </div>
        </TabsContent>

        <TabsContent className="grid gap-4" value="context">
          <div className={detailBlockClass}>
        <div className={detailBlockHeadingClass}>
          <div>
            <p className={eyebrowClass}>{localize(uiCopy.communityContext, language)}</p>
            <h3 className="m-0 text-base leading-tight tracking-normal text-[#17241d]">
              {localize(
                text(
                  "Anonymous notes and fact checks",
                  "Madokezo bila majina na ukaguzi wa ukweli",
                  "Notes anonymes et vérifications des faits",
                ),
                language,
              )}
            </h3>
          </div>
          <span className={detailCountClass}>{promiseContextNotes.length}</span>
        </div>
        <form
          aria-label={`${localize(uiCopy.addAnonymousContextNote, language)} ${promiseTitle}`}
          className={evidenceFormClass}
          onSubmit={handleSubmitContextNote}
        >
          <div className={evidenceFormToplineClass}>
            <p className={cn(eyebrowClass, "m-0")}>{localize(uiCopy.addContext, language)}</p>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
              <Icon name="shield" />
              {localize(uiCopy.noIdentityCollected, language)}
            </span>
          </div>
          <div className={evidenceFormGridClass}>
            <label className={formFieldClass}>
              <span className="block">{localize(uiCopy.confidenceLabel, language)}</span>
              <select
                className={nativeFieldClass}
                onChange={(event) =>
                  setConfidenceLabel(event.target.value as ContextNoteRecord["confidenceLabel"])
                }
                value={confidenceLabel}
              >
                {confidenceLabelKeys.map((label) => (
                  <option key={label} value={label}>
                    {localize(confidenceLabels[label], language)}
                  </option>
                ))}
              </select>
            </label>
            <label className={cn(formFieldClass, "col-span-full")}>
              <span className="block">{localize(uiCopy.contextNote, language)}</span>
              <Textarea
                onChange={(event) => setContextNote(event.target.value)}
                placeholder={localize(
                  text(
                    "Add local background, timing, or verification needs.",
                    "Ongeza historia ya eneo, muda, au mahitaji ya uthibitisho.",
                    "Ajoutez le contexte local, le calendrier ou les besoins de vérification.",
                  ),
                  language,
                )}
                value={contextNote}
              />
            </label>
          </div>
          <div className="flex justify-end">
            <Button disabled={!canSubmitContextNote} type="submit">
              {localize(uiCopy.addAnonymousContextNote, language)}
            </Button>
          </div>
        </form>
        {promiseContextNotes.length > 0 ? (
          <ul className={detailListClass}>
            {promiseContextNotes.map((item) => {
              const note = localizeUserText(item.note, language);
              return (
                <li className={detailRowClass} key={item.id}>
                  <span className={detailIconClass}>
                    <Icon name={item.id.startsWith("context-local-") ? "signal" : "map"} />
                  </span>
                  <div>
                    <div className={detailToplineClass}>
                      <strong className="block text-sm font-bold text-foreground">{localize(confidenceLabels[item.confidenceLabel], language)}</strong>
                      <span className="shrink-0 text-xs font-bold text-muted-foreground">{formatDateTime(item.createdAt, language)}</span>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">{note.text}</p>
                    <div className={tagListClass}>
                      {note.isFallback ? (
                        <span className={tagClass}>
                          {localize(uiCopy.original, language)}: {languageLabel(note.originalLanguage)}
                        </span>
                      ) : null}
                      {note.isFallback && note.translationStatus === "pending" ? (
                        <span className={tagClass}>{localize(uiCopy.translationPending, language)}</span>
                      ) : null}
                      <span className={tagClass}>{localize(uiCopy.anonymous, language)}</span>
                      {item.id.startsWith("context-local-") ? (
                        <span className={tagClass}>{localize(uiCopy.queuedForSync, language)}</span>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={emptyCopyClass}>{localize(uiCopy.noCommunityContext, language)}</p>
        )}
          </div>
        </TabsContent>

        <TabsContent className="grid gap-4" value="history">
          <div className={detailBlockClass}>
        <div className={detailBlockHeadingClass}>
          <div>
            <p className={eyebrowClass}>{localize(uiCopy.statusHistory, language)}</p>
            <h3 className="m-0 text-base leading-tight tracking-normal text-[#17241d]">{localize(uiCopy.statusReason, language)}</h3>
          </div>
          <span className={detailCountClass}>{promiseHistory.length}</span>
        </div>
        {promiseHistory.length > 0 ? (
          <ul className={detailListClass}>
            {promiseHistory.map((item) => {
              const evidenceLabels = linkedEvidenceLabels(item, evidenceRecords, language);
              return (
                <li className={detailRowClass} key={item.id}>
                  <span className={detailIconClass}>
                    <Icon name="check" />
                  </span>
                  <div>
                    <div className={detailToplineClass}>
                      <StatusPill tone={item.status}>
                        {localize(statusLabels[item.status], language)}
                      </StatusPill>
                      <span className="shrink-0 text-xs font-bold text-muted-foreground">{formatDateTime(item.createdAt, language)}</span>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">{localize(item.reason, language)}</p>
                    <div className={tagListClass}>
                      <span className={tagClass}>
                        {item.evidenceIds.length}{" "}
                        {item.evidenceIds.length === 1
                          ? localize(uiCopy.linkedEvidenceSingular, language)
                          : localize(uiCopy.linkedEvidencePlural, language)}
                      </span>
                      {evidenceLabels ? <span className={tagClass}>{evidenceLabels}</span> : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={emptyCopyClass}>{localize(uiCopy.noStatusChanges, language)}</p>
        )}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

function PromiseDetail({
  compact = false,
  contextNoteRecords,
  evidenceRecords,
  language,
  onAddContextNote,
  onAddEvidence,
  promise,
}: {
  compact?: boolean;
  contextNoteRecords: ContextNoteRecord[];
  evidenceRecords: EvidenceRecord[];
  language: LanguageCode;
  onAddContextNote: (promiseId: string, submission: ContextNoteSubmission) => void;
  onAddEvidence: (promiseId: string, submission: EvidenceSubmission) => void;
  promise?: PromiseRecord;
}) {
  if (!promise) {
    return (
      <section
        className={cn("grid gap-5", panelClass, compact && inlineDetailPanelClass)}
        aria-label={localize(uiCopy.promiseDetail, language)}
      >
        <div className={sectionHeadingClass}>
          <p className={eyebrowClass}>{localize(uiCopy.promiseDetail, language)}</p>
          <h2 className={sectionTitleClass}>{localize(uiCopy.selectPromise, language)}</h2>
        </div>
        <p className={emptyCopyClass}>
          {localize(
            text(
              "Choose a promise to review checkpoints, evidence, and status history.",
              "Chagua ahadi ili kuona hatua, ushahidi, na historia ya hali.",
              "Choisissez une promesse pour examiner les jalons, les preuves et l'historique du statut.",
            ),
            language,
          )}
        </p>
      </section>
    );
  }

  return (
    <PromiseDetailTabs
      compact={compact}
      contextNoteRecords={contextNoteRecords}
      evidenceRecords={evidenceRecords}
      language={language}
      onAddContextNote={onAddContextNote}
      onAddEvidence={onAddEvidence}
      promise={promise}
    />
  );
}

function App() {
  const [view, setView] = useState<View>("dashboard");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [selectedCandidateId, setSelectedCandidateId] = useState("cand-amina");
  const [selectedPromiseId, setSelectedPromiseId] = useState(promises[0]?.id ?? "");
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [browserDetailOpen, setBrowserDetailOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [officeFilter, setOfficeFilter] = useState<"all" | OfficeCode>("all");
  const [sectorFilter, setSectorFilter] = useState<"all" | SectorCode>("all");
  const [contextNoteRecords, setContextNoteRecords] = useState<ContextNoteRecord[]>(seededContextNotes);
  const [evidenceRecords, setEvidenceRecords] = useState<EvidenceRecord[]>(seededEvidence);
  const [syncQueueRecords, setSyncQueueRecords] = useState<SyncEnvelope[]>(seededSyncQueue);

  useEffect(() => {
    document.documentElement.lang = localeForLanguage(language);
  }, [language]);

  const followedPromises = useMemo(
    () => getFollowedPromises(),
    [],
  );

  const priorityPromises = useMemo(
    () => getPriorityPromises(followedPromises),
    [followedPromises],
  );

  const filteredCandidates = useMemo(() => {
    return filterCandidates({ language, officeFilter, query, sectorFilter });
  }, [language, officeFilter, query, sectorFilter]);

  const selectedCandidate =
    candidates.find((candidate) => candidate.id === selectedCandidateId) ?? candidates[0];
  const selectedManifesto = getManifestoForCandidate(selectedCandidate.id);
  const selectedPromises = getPromisesForCandidate(selectedCandidate.id);
  const selectedPromise =
    promises.find((promise) => promise.id === selectedPromiseId) ?? selectedPromises[0] ?? priorityPromises[0];
  const selectedStatusCounts = getStatusCounts(selectedPromises);
  const followedStatusCounts = useMemo(
    () => getStatusCounts(followedPromises),
    [followedPromises],
  );
  const selectedDashboardPromise =
    priorityPromises.find((promise) => promise.id === selectedPromiseId) ?? priorityPromises[0];
  const offices = Array.from(new Set(candidates.map((candidate) => candidate.office)));
  const sectors = Array.from(new Set(promises.map((promise) => promise.sector)));
  function handleAddEvidence(promiseId: string, submission: EvidenceSubmission) {
    const createdAt = new Date().toISOString();
    const evidenceId = `evidence-local-${Date.now()}`;
    const nextEvidence: EvidenceRecord = {
      id: evidenceId,
      promiseId,
      type: submission.type,
      note: authoredUserText(submission.note, language),
      sourceLabel: submission.sourceLabel,
      anonymous: true,
      createdAt,
      createdOffline: true,
    };
    const syncEnvelope: SyncEnvelope = {
      id: `sync-${evidenceId}`,
      entityType: "evidence",
      entityId: evidenceId,
      operation: "create",
      payload: {
        promiseId,
        type: nextEvidence.type,
        sourceLabel: nextEvidence.sourceLabel,
        note: nextEvidence.note,
        anonymous: nextEvidence.anonymous,
        createdOffline: nextEvidence.createdOffline,
        createdAt,
      },
      createdAt,
    };

    setEvidenceRecords((currentEvidence) => [nextEvidence, ...currentEvidence]);
    setSyncQueueRecords((currentQueue) => [...currentQueue, syncEnvelope]);
  }

  function handleAddContextNote(promiseId: string, submission: ContextNoteSubmission) {
    const createdAt = new Date().toISOString();
    const contextNoteId = `context-local-${Date.now()}`;
    const nextContextNote: ContextNoteRecord = {
      id: contextNoteId,
      promiseId,
      note: authoredUserText(submission.note, language),
      confidenceLabel: submission.confidenceLabel,
      createdAt,
    };
    const syncEnvelope: SyncEnvelope = {
      id: `sync-${contextNoteId}`,
      entityType: "context_note",
      entityId: contextNoteId,
      operation: "create",
      payload: {
        promiseId,
        note: nextContextNote.note,
        confidenceLabel: nextContextNote.confidenceLabel,
        createdAt,
      },
      createdAt,
    };

    setContextNoteRecords((currentContextNotes) => [nextContextNote, ...currentContextNotes]);
    setSyncQueueRecords((currentQueue) => [...currentQueue, syncEnvelope]);
  }

  function handleSelectCandidate(candidateId: string) {
    setSelectedCandidateId(candidateId);
    setBrowserDetailOpen(false);
    const firstPromise = getPromisesForCandidate(candidateId)[0];
    if (firstPromise) {
      setSelectedPromiseId(firstPromise.id);
    }
  }

  function handleSelectPromise(promiseId: string) {
    setSelectedPromiseId(promiseId);
    const promise = promises.find((item) => item.id === promiseId);
    const candidate = promise ? getCandidateForPromise(promise) : undefined;
    if (candidate) {
      setSelectedCandidateId(candidate.id);
    }
  }

  function handleSelectDashboardPromise(promiseId: string) {
    handleSelectPromise(promiseId);
    if (window.matchMedia?.("(max-width: 820px)").matches) {
      setMobileDetailOpen(true);
    }
  }

  function handleSelectManifestoPromise(promiseId: string) {
    handleSelectPromise(promiseId);
    if (window.matchMedia?.("(max-width: 1120px)").matches) {
      setBrowserDetailOpen(true);
    }
  }

  function handleSelectView(nextView: View) {
    if (nextView === "dashboard") {
      setBrowserDetailOpen(false);
      const dashboardPromise =
        priorityPromises.find((promise) => promise.id === selectedPromiseId) ?? priorityPromises[0];
      if (dashboardPromise && dashboardPromise.id !== selectedPromiseId) {
        setSelectedPromiseId(dashboardPromise.id);
      }
    } else {
      setMobileDetailOpen(false);
    }

    setView(nextView);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-[#e3dfd2] bg-background/95">
        <div className={cn(pageWidthClass, "flex items-center justify-between gap-6 py-6 max-[820px]:grid max-[820px]:items-start max-[820px]:justify-start")}>
          <div className="flex gap-3.5" aria-label="Manifesto">
            <div className={cn(iconBoxClass, "size-11")} aria-hidden="true">
              <Icon name="book" />
            </div>
            <div>
              <h1 className="m-0 text-xl font-bold tracking-normal text-[#17241d]">Manifesto</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">{localize(uiCopy.brandTagline, language)}</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2.5 max-[820px]:items-start max-[820px]:justify-start">
            <label className="inline-grid grid-cols-[auto_auto] items-center gap-2 rounded-full border border-input bg-card py-1.5 pr-2 pl-3 text-sm font-bold text-muted-foreground">
              <span>{localize(uiCopy.language, language)}</span>
              <select
                className="min-w-28 rounded-full border border-[#e0dbce] bg-[#faf8f0] px-2 py-1 text-foreground"
                aria-label={localize(uiCopy.language, language)}
                onChange={(event) => setLanguage(event.target.value as LanguageCode)}
                value={language}
              >
                {languageOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <Badge className="flex items-center gap-1.5 rounded-full border-input bg-card px-3 py-2 text-sm font-bold text-muted-foreground" variant="outline">
              <Icon name="shield" />
              {localize(uiCopy.anonymousByDefault, language)}
            </Badge>
            <Badge className="flex items-center gap-1.5 rounded-full border-input bg-card px-3 py-2 text-sm font-bold text-muted-foreground" variant="outline">
              <Icon name="signal" />
              {syncQueueRecords.length} {localize(uiCopy.queued, language)}
            </Badge>
          </div>
        </div>
      </header>

      <main className={cn(pageWidthClass, "py-8 pb-16 max-[520px]:py-6 max-[520px]:pb-12")}>
        <div className="border-b border-[#e3dfd2] pb-5">
          <div>
            <p className={eyebrowClass}>{localize(uiCopy.voiceAndAccountability, language)}</p>
            <h2 className="m-0 text-[clamp(1.55rem,3vw,2.5rem)] leading-none tracking-normal text-[#17241d] max-[520px]:text-[1.75rem]" id="page-title">
              {view === "dashboard"
                ? localize(uiCopy.followingDashboard, language)
                : localize(uiCopy.manifestoBrowser, language)}
            </h2>
            <p className="mt-2.5 max-w-2xl text-base text-muted-foreground">
              {view === "dashboard"
                ? localize(uiCopy.dashboardHeaderBody, language)
                : localize(uiCopy.manifestoHeaderBody, language)}
            </p>
          </div>
        </div>

        <nav className="my-6 flex flex-wrap gap-2" aria-label={localize(uiCopy.primaryViews, language)}>
          <Button
            className={cn(
              "gap-2 rounded-full border-input bg-card px-3.5 py-2.5 text-sm font-bold text-muted-foreground",
              view === "dashboard" && "border-[#b5d1bf] bg-accent text-primary",
            )}
            onClick={() => handleSelectView("dashboard")}
            type="button"
            variant="outline"
          >
            <Icon name="pin" />
            {localize(uiCopy.followingDashboard, language)}
          </Button>
          <Button
            className={cn(
              "gap-2 rounded-full border-input bg-card px-3.5 py-2.5 text-sm font-bold text-muted-foreground",
              view === "manifestos" && "border-[#b5d1bf] bg-accent text-primary",
            )}
            onClick={() => handleSelectView("manifestos")}
            type="button"
            variant="outline"
          >
            <Icon name="book" />
            {localize(uiCopy.manifestoBrowser, language)}
          </Button>
        </nav>

        {view === "dashboard" ? (
          <section className="grid grid-cols-[minmax(320px,0.85fr)_minmax(0,1.25fr)] items-start gap-6 max-[820px]:grid-cols-1" aria-label={localize(uiCopy.followingDashboard, language)}>
            <section className="grid min-w-0 gap-4" aria-label={localize(uiCopy.priorityPromises, language)}>
              <div className={cn(panelClass, "grid gap-4")}>
                <div className={sectionHeadingClass}>
                  <p className={eyebrowClass}>{localize(uiCopy.dashboard, language)}</p>
                  <h2 className={sectionTitleClass}>{localize(uiCopy.priorityPromises, language)}</h2>
                </div>
                <StatusStrip
                  counts={followedStatusCounts}
                  label={localize(uiCopy.promiseStatusCounts, language)}
                  language={language}
                />
              </div>

              <div className="grid gap-2.5">
                {priorityPromises.map((promise) => (
                  <PromiseRow
                    active={selectedDashboardPromise?.id === promise.id}
                    key={promise.id}
                    language={language}
                    onSelect={handleSelectDashboardPromise}
                    promise={promise}
                  />
                ))}
              </div>

              {selectedDashboardPromise ? (
                <Sheet open={mobileDetailOpen} onOpenChange={setMobileDetailOpen}>
                  <SheetTrigger asChild>
                    <Button className="hidden h-auto min-h-0 w-full flex-col items-start justify-center gap-1 rounded-lg p-3.5 text-left whitespace-normal max-[820px]:flex" type="button" variant="outline">
                      <span className="block max-w-full text-xs font-extrabold uppercase tracking-[0.08em] text-muted-foreground [overflow-wrap:anywhere]">{localize(uiCopy.promiseDetail, language)}</span>
                      <strong className="block max-w-full text-sm leading-snug text-[#17241d]">{localize(selectedDashboardPromise.title, language)}</strong>
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="h-[100dvh] max-h-[100dvh] w-[min(100%,420px)] max-w-none overflow-hidden px-4 pb-4" side="right">
                    <SheetHeader>
                      <SheetTitle>{localize(uiCopy.promiseDetail, language)}</SheetTitle>
                      <SheetDescription>{localize(selectedDashboardPromise.title, language)}</SheetDescription>
                    </SheetHeader>
                    <div className="min-h-0 flex-1 overflow-auto px-1 pb-1">
                      <PromiseDetail
                        compact
                        contextNoteRecords={contextNoteRecords}
                        evidenceRecords={evidenceRecords}
                        language={language}
                        onAddContextNote={handleAddContextNote}
                        onAddEvidence={handleAddEvidence}
                        promise={selectedDashboardPromise}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              ) : null}
            </section>

            <aside className="sticky top-6 min-w-0 max-[820px]:hidden" aria-label={localize(uiCopy.promiseDetail, language)}>
              <PromiseDetail
                compact
                contextNoteRecords={contextNoteRecords}
                evidenceRecords={evidenceRecords}
                language={language}
                onAddContextNote={handleAddContextNote}
                onAddEvidence={handleAddEvidence}
                promise={selectedDashboardPromise}
              />
            </aside>
          </section>
        ) : (
          <section className="grid grid-cols-[minmax(280px,0.45fr)_minmax(0,1.55fr)] items-start gap-6 max-[820px]:grid-cols-1" aria-label={localize(uiCopy.manifestoBrowser, language)}>
            <aside className={cn(panelClass, "sticky top-6 max-[820px]:static")}>
              <div className={sectionHeadingClass}>
                <p className={eyebrowClass}>{localize(uiCopy.browse, language)}</p>
                <h2 className={sectionTitleClass}>{localize(uiCopy.candidates, language)}</h2>
              </div>
              <label className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2.5 rounded-lg border border-input bg-background px-3 py-2.5 text-muted-foreground">
                <Icon name="search" />
                <span className="sr-only">{localize(uiCopy.searchCandidatesAndPromises, language)}</span>
                <Input
                  className="border-0 bg-transparent shadow-none outline-none focus-visible:ring-0"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={localize(uiCopy.searchPlaceholder, language)}
                  type="search"
                  value={query}
                />
              </label>
              <label className="mt-3.5 grid gap-2 text-sm font-bold text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Icon name="filter" />
                  {localize(uiCopy.office, language)}
                </span>
                <select
                  className={nativeFieldClass}
                  onChange={(event) => setOfficeFilter(event.target.value as "all" | OfficeCode)}
                  value={officeFilter}
                >
                  <option value="all">{localize(allOfficeFilterLabel, language)}</option>
                  {offices.map((office) => (
                    <option key={office} value={office}>
                      {localize(officeLabels[office], language)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mt-3.5 grid gap-2 text-sm font-bold text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Icon name="filter" />
                  {localize(uiCopy.sector, language)}
                </span>
                <select
                  className={nativeFieldClass}
                  onChange={(event) => setSectorFilter(event.target.value as "all" | SectorCode)}
                  value={sectorFilter}
                >
                  <option value="all">{localize(allSectorFilterLabel, language)}</option>
                  {sectors.map((sector) => (
                    <option key={sector} value={sector}>
                      {localize(sectorLabels[sector], language)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="mt-5 grid gap-3.5">
                {filteredCandidates.map((candidate) => (
                  <CandidateCard
                    active={selectedCandidate.id === candidate.id}
                    candidate={candidate}
                    key={candidate.id}
                    language={language}
                    onSelect={handleSelectCandidate}
                  />
                ))}
              </div>
            </aside>

            <section className="grid gap-6">
              <article className={cn(panelClass, "grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 max-[520px]:grid-cols-1")}>
                <div className={cn(iconBoxClass, "size-14 text-xl")}>
                  <Icon name={isElectedCandidate(selectedCandidate) ? "pin" : "archive"} />
                </div>
                <div>
                  <div className="mb-3.5 flex justify-between gap-3.5">
                    <StatusPill tone={isElectedCandidate(selectedCandidate) ? "kept" : "not_started"}>
                      {isElectedCandidate(selectedCandidate)
                        ? localize(uiCopy.elected, language)
                        : localize(uiCopy.archived, language)}
                    </StatusPill>
                    <span className="text-sm font-bold text-muted-foreground">{selectedCandidate.electionYear}</span>
                  </div>
                  <h2 className="m-0 text-[clamp(1.75rem,3vw,2.6rem)] leading-none tracking-normal text-[#17241d]">{selectedCandidate.name}</h2>
                  <p className="mt-2 text-muted-foreground">
                    {localize(officeLabels[selectedCandidate.office], language)} |{" "}
                    {localize(regionLabels[selectedCandidate.region], language)} |{" "}
                    {localize(selectedCandidate.partyOrAffiliation, language)}
                  </p>
                </div>
              </article>

              <section className={cn(panelClass, "grid gap-4")}>
                <div className={sectionHeadingClass}>
                  <p className={eyebrowClass}>{localize(uiCopy.manifesto, language)}</p>
                  <h2 className={sectionTitleClass}>
                    {selectedManifesto
                      ? localize(selectedManifesto.title, language)
                      : localize(uiCopy.noManifesto, language)}
                  </h2>
                </div>
                <dl className={manifestoFactGridClass}>
                  <div className={factItemClass}>
                    <dt className={factTermClass}>{localize(uiCopy.source, language)}</dt>
                    <dd className={factDefinitionClass}>{selectedManifesto ? localize(selectedManifesto.sourceLabel, language) : "-"}</dd>
                  </div>
                  <div className={factItemClass}>
                    <dt className={factTermClass}>{localize(uiCopy.published, language)}</dt>
                    <dd className={factDefinitionClass}>
                      {selectedManifesto
                        ? formatDate(selectedManifesto.publishedDate, language)
                        : "-"}
                    </dd>
                  </div>
                  <div className={factItemClass}>
                    <dt className={factTermClass}>{localize(uiCopy.availableLanguages, language)}</dt>
                    <dd className={factDefinitionClass}>{languageOptions.map((option) => option.label).join(", ")}</dd>
                  </div>
                </dl>
                <StatusStrip
                  counts={selectedStatusCounts}
                  label={localize(uiCopy.selectedManifestoStatusCounts, language)}
                  language={language}
                />
              </section>

              <section className="grid grid-cols-[minmax(280px,0.78fr)_minmax(0,1.22fr)] items-start gap-6 max-[1120px]:grid-cols-1" aria-label={localize(uiCopy.manifesto, language)}>
                <section className="grid min-w-0 gap-4" aria-label={localize(uiCopy.selectPromise, language)}>
                  {Array.from(new Set(selectedPromises.map((promise) => promise.sector))).map((sector) => (
                    <div className="grid gap-3.5" key={sector}>
                      <div className={cn(sectionHeadingClass, "mb-0 pl-1")}>
                        <p className={eyebrowClass}>{localize(uiCopy.sector, language)}</p>
                        <h2 className={sectionTitleClass}>{localize(sectorLabels[sector], language)}</h2>
                      </div>
                      <div className="grid gap-2.5">
                        {selectedPromises
                          .filter((promise) => promise.sector === sector)
                          .map((promise) => (
                            <PromiseRow
                              active={selectedPromise?.id === promise.id}
                              key={promise.id}
                              language={language}
                              onSelect={handleSelectManifestoPromise}
                              promise={promise}
                            />
                          ))}
                      </div>
                    </div>
                  ))}
                </section>

                {selectedPromise ? (
                  <Sheet open={browserDetailOpen} onOpenChange={setBrowserDetailOpen}>
                    <SheetContent className="h-[100dvh] max-h-[100dvh] w-[min(100%,420px)] max-w-none overflow-hidden px-4 pb-4" side="right">
                      <SheetHeader>
                        <SheetTitle>{localize(uiCopy.promiseDetail, language)}</SheetTitle>
                        <SheetDescription>{localize(selectedPromise.title, language)}</SheetDescription>
                      </SheetHeader>
                      <div className="min-h-0 flex-1 overflow-auto px-1 pb-1">
                        <PromiseDetail
                          compact
                          contextNoteRecords={contextNoteRecords}
                          evidenceRecords={evidenceRecords}
                          language={language}
                          onAddContextNote={handleAddContextNote}
                          onAddEvidence={handleAddEvidence}
                          promise={selectedPromise}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                ) : null}

                <aside className="sticky top-6 min-w-0 max-[1120px]:hidden" aria-label={localize(uiCopy.promiseDetail, language)}>
                  <PromiseDetail
                    compact
                    contextNoteRecords={contextNoteRecords}
                    evidenceRecords={evidenceRecords}
                    language={language}
                    onAddContextNote={handleAddContextNote}
                    onAddEvidence={handleAddEvidence}
                    promise={selectedPromise}
                  />
                </aside>
              </section>
            </section>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
