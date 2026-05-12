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
      className="icon"
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
      className={`candidate-card ${active ? "is-active" : ""} ${compact ? "candidate-card--compact" : ""}`}
      onClick={() => onSelect(candidate.id)}
      type="button"
    >
      <span className="candidate-card__icon">
        <Icon name={isElectedCandidate(candidate) ? "pin" : "archive"} />
      </span>
      <span className="candidate-card__body">
        <span className="candidate-card__name">{candidate.name}</span>
        <span className="candidate-card__meta">
          {localize(officeLabels[candidate.office], language)} |{" "}
          {localize(regionLabels[candidate.region], language)}
        </span>
        <span className="candidate-card__tags">
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
      <span className="candidate-card__arrow">
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
    <StatusBadge className="status-pill" tone={tone}>
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
      className={`paper-panel promise-detail ${compact ? "promise-detail--inline" : ""}`}
      aria-labelledby={`detail-${promise.id}`}
    >
      <div className="promise-detail__header">
        <div>
          <p className="eyebrow">{localize(uiCopy.promiseDetail, language)}</p>
          <h2 id={`detail-${promise.id}`}>{promiseTitle}</h2>
          <p>{localize(promise.summary, language)}</p>
        </div>
        <StatusPill tone={promise.status}>{localize(statusLabels[promise.status], language)}</StatusPill>
      </div>

      <Tabs className="promise-detail__tabs" defaultValue="overview">
        <TabsList className="promise-detail__tab-list" aria-label={localize(uiCopy.promiseDetail, language)}>
          <TabsTrigger value="overview">{localize(uiCopy.overview, language)}</TabsTrigger>
          <TabsTrigger value="evidence">{localize(uiCopy.evidence, language)}</TabsTrigger>
          <TabsTrigger value="context">{localize(uiCopy.context, language)}</TabsTrigger>
          <TabsTrigger value="history">{localize(uiCopy.history, language)}</TabsTrigger>
        </TabsList>

        <TabsContent className="promise-detail__tab-content" value="overview">
          <dl className="detail-facts" aria-label={localize(uiCopy.promiseFacts, language)}>
            <div>
              <dt>
                <Icon name="user" />
                {localize(uiCopy.candidate, language)}
              </dt>
              <dd>{candidate?.name ?? "-"}</dd>
            </div>
            <div>
              <dt>
                <Icon name="map" />
                {localize(uiCopy.place, language)}
              </dt>
              <dd>{localize(promise.location, language)}</dd>
            </div>
            <div>
              <dt>
                <Icon name="calendar" />
                {localize(uiCopy.deadline, language)}
              </dt>
              <dd>{formatDate(promise.deadline, language)}</dd>
            </div>
            <div>
              <dt>
                <Icon name="book" />
                {localize(uiCopy.source, language)}
              </dt>
              <dd>{manifesto ? localize(manifesto.sourceLabel, language) : "-"}</dd>
            </div>
          </dl>

          <div className="detail-block">
        <div className="detail-block__heading">
          <div>
            <p className="eyebrow">{localize(uiCopy.checkPoints, language)}</p>
            <h3>
              {completed} / {promise.checkpoints.length} {localize(uiCopy.complete, language)}
            </h3>
          </div>
          <span className="detail-count">{localize(sectorLabels[promise.sector], language)}</span>
        </div>
        <ol className="checkpoint-list">
          {promise.checkpoints.map((checkpoint) => (
            <li
              className={`checkpoint-item ${checkpoint.complete ? "is-complete" : ""}`}
              key={`${promise.id}-${localize(checkpoint.label, "en")}`}
            >
              <span className="checkpoint-item__marker">
                <Icon name={checkpoint.complete ? "check" : "clock"} />
              </span>
              <div>
                <strong>{localize(checkpoint.label, language)}</strong>
                <span>
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

        <TabsContent className="promise-detail__tab-content" value="evidence">
          <div className="detail-block">
        <div className="detail-block__heading">
          <div>
            <p className="eyebrow">{localize(uiCopy.evidence, language)}</p>
            <h3>{localize(uiCopy.anonymousCommunityRecord, language)}</h3>
          </div>
          <span className="detail-count">{promiseEvidence.length}</span>
        </div>
        <form
          aria-label={`${localize(uiCopy.addAnonymousEvidence, language)} ${promiseTitle}`}
          className="evidence-form"
          onSubmit={handleSubmitEvidence}
        >
          <div className="evidence-form__topline">
            <p className="eyebrow">{localize(uiCopy.addEvidence, language)}</p>
            <span className="evidence-form__privacy">
              <Icon name="shield" />
              {localize(uiCopy.identityHidden, language)}
            </span>
          </div>
          <div className="evidence-form__grid">
            <label className="form-field">
              <span>{localize(uiCopy.evidenceType, language)}</span>
              <select
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
            <label className="form-field">
              <span>{localize(uiCopy.sourceLabel, language)}</span>
              <select
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
            <label className="form-field form-field--wide">
              <span>{localize(uiCopy.evidenceNote, language)}</span>
              <Textarea
                onChange={(event) => setEvidenceNote(event.target.value)}
                placeholder={localize(uiCopy.evidencePlaceholder, language)}
                value={evidenceNote}
              />
            </label>
          </div>
          <div className="evidence-form__actions">
            <Button disabled={!canSubmitEvidence} type="submit">
              {localize(uiCopy.addAnonymousEvidence, language)}
            </Button>
          </div>
        </form>
        {promiseEvidence.length > 0 ? (
          <ul className="detail-list">
            {promiseEvidence.map((item) => {
              const note = localizeUserText(item.note, language);
              return (
                <li className="detail-row" key={item.id}>
                  <span className="detail-row__icon">
                    <Icon name={item.createdOffline ? "signal" : "file"} />
                  </span>
                  <div>
                    <div className="detail-row__topline">
                      <strong>{localize(evidenceTypeLabels[item.type], language)}</strong>
                      <span>{formatDateTime(item.createdAt, language)}</span>
                    </div>
                    <p>{note.text}</p>
                    <div className="detail-tags">
                      <span>{localize(item.sourceLabel, language)}</span>
                      {note.isFallback ? (
                        <span>
                          {localize(uiCopy.original, language)}: {languageLabel(note.originalLanguage)}
                        </span>
                      ) : null}
                      {note.isFallback && note.translationStatus === "pending" ? (
                        <span>{localize(uiCopy.translationPending, language)}</span>
                      ) : null}
                      {item.anonymous ? <span>{localize(uiCopy.anonymous, language)}</span> : null}
                      {item.createdOffline ? <span>{localize(uiCopy.createdOffline, language)}</span> : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="empty-copy">{localize(uiCopy.noEvidence, language)}</p>
        )}
          </div>
        </TabsContent>

        <TabsContent className="promise-detail__tab-content" value="context">
          <div className="detail-block">
        <div className="detail-block__heading">
          <div>
            <p className="eyebrow">{localize(uiCopy.communityContext, language)}</p>
            <h3>
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
          <span className="detail-count">{promiseContextNotes.length}</span>
        </div>
        <form
          aria-label={`${localize(uiCopy.addAnonymousContextNote, language)} ${promiseTitle}`}
          className="evidence-form"
          onSubmit={handleSubmitContextNote}
        >
          <div className="evidence-form__topline">
            <p className="eyebrow">{localize(uiCopy.addContext, language)}</p>
            <span className="evidence-form__privacy">
              <Icon name="shield" />
              {localize(uiCopy.noIdentityCollected, language)}
            </span>
          </div>
          <div className="evidence-form__grid">
            <label className="form-field">
              <span>{localize(uiCopy.confidenceLabel, language)}</span>
              <select
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
            <label className="form-field form-field--wide">
              <span>{localize(uiCopy.contextNote, language)}</span>
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
          <div className="evidence-form__actions">
            <Button disabled={!canSubmitContextNote} type="submit">
              {localize(uiCopy.addAnonymousContextNote, language)}
            </Button>
          </div>
        </form>
        {promiseContextNotes.length > 0 ? (
          <ul className="detail-list">
            {promiseContextNotes.map((item) => {
              const note = localizeUserText(item.note, language);
              return (
                <li className="detail-row" key={item.id}>
                  <span className="detail-row__icon">
                    <Icon name={item.id.startsWith("context-local-") ? "signal" : "map"} />
                  </span>
                  <div>
                    <div className="detail-row__topline">
                      <strong>{localize(confidenceLabels[item.confidenceLabel], language)}</strong>
                      <span>{formatDateTime(item.createdAt, language)}</span>
                    </div>
                    <p>{note.text}</p>
                    <div className="detail-tags">
                      {note.isFallback ? (
                        <span>
                          {localize(uiCopy.original, language)}: {languageLabel(note.originalLanguage)}
                        </span>
                      ) : null}
                      {note.isFallback && note.translationStatus === "pending" ? (
                        <span>{localize(uiCopy.translationPending, language)}</span>
                      ) : null}
                      <span>{localize(uiCopy.anonymous, language)}</span>
                      {item.id.startsWith("context-local-") ? (
                        <span>{localize(uiCopy.queuedForSync, language)}</span>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="empty-copy">{localize(uiCopy.noCommunityContext, language)}</p>
        )}
          </div>
        </TabsContent>

        <TabsContent className="promise-detail__tab-content" value="history">
          <div className="detail-block">
        <div className="detail-block__heading">
          <div>
            <p className="eyebrow">{localize(uiCopy.statusHistory, language)}</p>
            <h3>{localize(uiCopy.statusReason, language)}</h3>
          </div>
          <span className="detail-count">{promiseHistory.length}</span>
        </div>
        {promiseHistory.length > 0 ? (
          <ul className="detail-list">
            {promiseHistory.map((item) => {
              const evidenceLabels = linkedEvidenceLabels(item, evidenceRecords, language);
              return (
                <li className="detail-row" key={item.id}>
                  <span className="detail-row__icon">
                    <Icon name="check" />
                  </span>
                  <div>
                    <div className="detail-row__topline">
                      <StatusPill tone={item.status}>
                        {localize(statusLabels[item.status], language)}
                      </StatusPill>
                      <span>{formatDateTime(item.createdAt, language)}</span>
                    </div>
                    <p>{localize(item.reason, language)}</p>
                    <div className="detail-tags">
                      <span>
                        {item.evidenceIds.length}{" "}
                        {item.evidenceIds.length === 1
                          ? localize(uiCopy.linkedEvidenceSingular, language)
                          : localize(uiCopy.linkedEvidencePlural, language)}
                      </span>
                      {evidenceLabels ? <span>{evidenceLabels}</span> : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="empty-copy">{localize(uiCopy.noStatusChanges, language)}</p>
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
        className={`paper-panel promise-detail ${compact ? "promise-detail--inline" : ""}`}
        aria-label={localize(uiCopy.promiseDetail, language)}
      >
        <div className="section-heading">
          <p className="eyebrow">{localize(uiCopy.promiseDetail, language)}</p>
          <h2>{localize(uiCopy.selectPromise, language)}</h2>
        </div>
        <p className="empty-copy">
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
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <div className="brand" aria-label="Manifesto">
            <div className="brand__mark" aria-hidden="true">
              <Icon name="book" />
            </div>
            <div>
              <h1 className="brand__name">Manifesto</h1>
              <p className="brand__tagline">{localize(uiCopy.brandTagline, language)}</p>
            </div>
          </div>
          <div className="header-status">
            <label className="language-select">
              <span>{localize(uiCopy.language, language)}</span>
              <select
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
            <Badge className="header-badge" variant="outline">
              <Icon name="shield" />
              {localize(uiCopy.anonymousByDefault, language)}
            </Badge>
            <Badge className="header-badge" variant="outline">
              <Icon name="signal" />
              {syncQueueRecords.length} {localize(uiCopy.queued, language)}
            </Badge>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="view-header">
          <div>
            <p className="eyebrow">{localize(uiCopy.voiceAndAccountability, language)}</p>
            <h2 id="page-title">
              {view === "dashboard"
                ? localize(uiCopy.followingDashboard, language)
                : localize(uiCopy.manifestoBrowser, language)}
            </h2>
            <p>
              {view === "dashboard"
                ? localize(uiCopy.dashboardHeaderBody, language)
                : localize(uiCopy.manifestoHeaderBody, language)}
            </p>
          </div>
        </div>

        <nav className="view-tabs" aria-label={localize(uiCopy.primaryViews, language)}>
          <Button
            className={view === "dashboard" ? "is-active" : ""}
            onClick={() => handleSelectView("dashboard")}
            type="button"
            variant="outline"
          >
            <Icon name="pin" />
            {localize(uiCopy.followingDashboard, language)}
          </Button>
          <Button
            className={view === "manifestos" ? "is-active" : ""}
            onClick={() => handleSelectView("manifestos")}
            type="button"
            variant="outline"
          >
            <Icon name="book" />
            {localize(uiCopy.manifestoBrowser, language)}
          </Button>
        </nav>

        {view === "dashboard" ? (
          <section className="dashboard-layout" aria-label={localize(uiCopy.followingDashboard, language)}>
            <section className="dashboard-list-panel" aria-label={localize(uiCopy.priorityPromises, language)}>
              <div className="paper-panel summary-panel">
                <div className="section-heading">
                  <p className="eyebrow">{localize(uiCopy.dashboard, language)}</p>
                  <h2>{localize(uiCopy.priorityPromises, language)}</h2>
                </div>
                <StatusStrip
                  counts={followedStatusCounts}
                  label={localize(uiCopy.promiseStatusCounts, language)}
                  language={language}
                />
              </div>

              <div className="promise-row-list">
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
                    <Button className="dashboard-mobile-detail-trigger" type="button" variant="outline">
                      <span>{localize(uiCopy.promiseDetail, language)}</span>
                      <strong>{localize(selectedDashboardPromise.title, language)}</strong>
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="promise-detail-sheet" side="right">
                    <SheetHeader>
                      <SheetTitle>{localize(uiCopy.promiseDetail, language)}</SheetTitle>
                      <SheetDescription>{localize(selectedDashboardPromise.title, language)}</SheetDescription>
                    </SheetHeader>
                    <div className="promise-detail-sheet__body">
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

            <aside className="dashboard-detail" aria-label={localize(uiCopy.promiseDetail, language)}>
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
          <section className="browser-layout" aria-label={localize(uiCopy.manifestoBrowser, language)}>
            <aside className="paper-panel browser-filters">
              <div className="section-heading">
                <p className="eyebrow">{localize(uiCopy.browse, language)}</p>
                <h2>{localize(uiCopy.candidates, language)}</h2>
              </div>
              <label className="search-field">
                <Icon name="search" />
                <span className="sr-only">{localize(uiCopy.searchCandidatesAndPromises, language)}</span>
                <Input
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={localize(uiCopy.searchPlaceholder, language)}
                  type="search"
                  value={query}
                />
              </label>
              <label className="filter-field">
                <span>
                  <Icon name="filter" />
                  {localize(uiCopy.office, language)}
                </span>
                <select
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
              <label className="filter-field">
                <span>
                  <Icon name="filter" />
                  {localize(uiCopy.sector, language)}
                </span>
                <select
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
              <div className="candidate-list">
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

            <section className="content-stack manifesto-detail">
              <article className="paper-panel candidate-profile">
                <div className="candidate-profile__icon">
                  <Icon name={isElectedCandidate(selectedCandidate) ? "pin" : "archive"} />
                </div>
                <div>
                  <div className="candidate-profile__topline">
                    <StatusPill tone={isElectedCandidate(selectedCandidate) ? "kept" : "not_started"}>
                      {isElectedCandidate(selectedCandidate)
                        ? localize(uiCopy.elected, language)
                        : localize(uiCopy.archived, language)}
                    </StatusPill>
                    <span className="candidate-profile__year">{selectedCandidate.electionYear}</span>
                  </div>
                  <h2>{selectedCandidate.name}</h2>
                  <p>
                    {localize(officeLabels[selectedCandidate.office], language)} |{" "}
                    {localize(regionLabels[selectedCandidate.region], language)} |{" "}
                    {localize(selectedCandidate.partyOrAffiliation, language)}
                  </p>
                </div>
              </article>

              <section className="paper-panel manifesto-summary">
                <div className="section-heading">
                  <p className="eyebrow">{localize(uiCopy.manifesto, language)}</p>
                  <h2>
                    {selectedManifesto
                      ? localize(selectedManifesto.title, language)
                      : localize(uiCopy.noManifesto, language)}
                  </h2>
                </div>
                <dl className="manifesto-facts">
                  <div>
                    <dt>{localize(uiCopy.source, language)}</dt>
                    <dd>{selectedManifesto ? localize(selectedManifesto.sourceLabel, language) : "-"}</dd>
                  </div>
                  <div>
                    <dt>{localize(uiCopy.published, language)}</dt>
                    <dd>
                      {selectedManifesto
                        ? formatDate(selectedManifesto.publishedDate, language)
                        : "-"}
                    </dd>
                  </div>
                  <div>
                    <dt>{localize(uiCopy.availableLanguages, language)}</dt>
                    <dd>{languageOptions.map((option) => option.label).join(", ")}</dd>
                  </div>
                </dl>
                <StatusStrip
                  counts={selectedStatusCounts}
                  label={localize(uiCopy.selectedManifestoStatusCounts, language)}
                  language={language}
                />
              </section>

              <section className="manifesto-workspace" aria-label={localize(uiCopy.manifesto, language)}>
                <section className="manifesto-promise-list" aria-label={localize(uiCopy.selectPromise, language)}>
                  {Array.from(new Set(selectedPromises.map((promise) => promise.sector))).map((sector) => (
                    <div className="sector-group" key={sector}>
                      <div className="section-heading">
                        <p className="eyebrow">{localize(uiCopy.sector, language)}</p>
                        <h2>{localize(sectorLabels[sector], language)}</h2>
                      </div>
                      <div className="promise-row-list">
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
                    <SheetContent className="promise-detail-sheet" side="right">
                      <SheetHeader>
                        <SheetTitle>{localize(uiCopy.promiseDetail, language)}</SheetTitle>
                        <SheetDescription>{localize(selectedPromise.title, language)}</SheetDescription>
                      </SheetHeader>
                      <div className="promise-detail-sheet__body">
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

                <aside className="manifesto-promise-detail" aria-label={localize(uiCopy.promiseDetail, language)}>
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
