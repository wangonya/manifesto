import { useMemo, useState, type ReactNode } from "react";
import "./App.css";
import {
  candidates,
  contextNotes,
  evidence,
  manifestos,
  promises,
  statusHistory,
  syncQueue,
  type Candidate,
  type PromiseRecord,
  type PromiseStatus,
} from "./data";

type View = "dashboard" | "manifestos";
type IconName =
  | "archive"
  | "book"
  | "calendar"
  | "check"
  | "chevron"
  | "filter"
  | "map"
  | "pin"
  | "search"
  | "shield"
  | "signal"
  | "user";

const followedCandidateIds = ["cand-amina", "cand-david", "cand-mary"];
const followedSectors = ["Health", "Water", "Education", "Safety"];
const followedRegions = ["Lakeside County", "Kijani East", "Mto Ward"];

const statusLabels: Record<PromiseStatus, string> = {
  kept: "Kept",
  in_progress: "In progress",
  missed: "Missed",
  not_started: "Not started",
  at_risk: "At risk",
};

const statusPriority: Record<PromiseStatus, number> = {
  missed: 0,
  at_risk: 1,
  in_progress: 2,
  not_started: 3,
  kept: 4,
};

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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function getCandidateForPromise(promise: PromiseRecord) {
  const manifesto = manifestos.find((item) => item.id === promise.manifestoId);
  return candidates.find((candidate) => candidate.id === manifesto?.candidateId);
}

function getManifestoForCandidate(candidateId: string) {
  return manifestos.find((manifesto) => manifesto.candidateId === candidateId);
}

function getPromisesForCandidate(candidateId: string) {
  const manifesto = getManifestoForCandidate(candidateId);
  return promises.filter((promise) => promise.manifestoId === manifesto?.id);
}

function getStatusCounts(items: PromiseRecord[]) {
  return items.reduce(
    (counts, promise) => {
      counts[promise.status] += 1;
      return counts;
    },
    {
      kept: 0,
      in_progress: 0,
      missed: 0,
      not_started: 0,
      at_risk: 0,
    } satisfies Record<PromiseStatus, number>,
  );
}

function isElectedCandidate(candidate: Candidate) {
  return candidate.status === "elected";
}

function CandidateCard({
  candidate,
  active,
  compact = false,
  onSelect,
}: {
  candidate: Candidate;
  active?: boolean;
  compact?: boolean;
  onSelect: (candidateId: string) => void;
}) {
  const candidatePromises = getPromisesForCandidate(candidate.id);
  const counts = getStatusCounts(candidatePromises);

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
          {candidate.office} | {candidate.region}
        </span>
        <span className="candidate-card__tags">
          <StatusPill tone={isElectedCandidate(candidate) ? "kept" : "not_started"}>
            {isElectedCandidate(candidate) ? "Elected" : "Archived"}
          </StatusPill>
          {counts.missed > 0 ? <StatusPill tone="missed">{counts.missed} missed</StatusPill> : null}
          {counts.at_risk > 0 ? <StatusPill tone="at_risk">{counts.at_risk} at risk</StatusPill> : null}
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
  return <span className={`status-pill status-pill--${tone}`}>{children}</span>;
}

function PromiseCard({ promise }: { promise: PromiseRecord }) {
  const candidate = getCandidateForPromise(promise);
  const completed = promise.checkpoints.filter((checkpoint) => checkpoint.complete).length;

  return (
    <article className="promise-card">
      <div className="promise-card__topline">
        <StatusPill tone={promise.status}>{statusLabels[promise.status]}</StatusPill>
        <span className="promise-card__sector">{promise.sector}</span>
      </div>
      <h3>{promise.title}</h3>
      <p>{promise.summariesByLanguage.en}</p>
      <dl className="promise-meta">
        <div>
          <dt>
            <Icon name="user" />
            Candidate
          </dt>
          <dd>{candidate?.name ?? "Unknown"}</dd>
        </div>
        <div>
          <dt>
            <Icon name="calendar" />
            Deadline
          </dt>
          <dd>{formatDate(promise.deadline)}</dd>
        </div>
        <div>
          <dt>
            <Icon name="check" />
            Checkpoints
          </dt>
          <dd>
            {completed} of {promise.checkpoints.length}
          </dd>
        </div>
      </dl>
    </article>
  );
}

function App() {
  const [view, setView] = useState<View>("dashboard");
  const [selectedCandidateId, setSelectedCandidateId] = useState("cand-amina");
  const [query, setQuery] = useState("");
  const [officeFilter, setOfficeFilter] = useState("All offices");
  const [sectorFilter, setSectorFilter] = useState("All sectors");

  const followedPromises = useMemo(
    () =>
      promises.filter((promise) => {
        const candidate = getCandidateForPromise(promise);
        const isExplicitlyFollowed = candidate ? followedCandidateIds.includes(candidate.id) : false;
        return (
          candidate &&
          (isExplicitlyFollowed ||
            followedSectors.includes(promise.sector) ||
            (isElectedCandidate(candidate) && followedRegions.includes(candidate.region)))
        );
      }),
    [],
  );

  const priorityPromises = useMemo(
    () =>
      [...followedPromises]
        .sort((first, second) => {
          const statusDelta = statusPriority[first.status] - statusPriority[second.status];
          if (statusDelta !== 0) return statusDelta;
          return first.deadline.localeCompare(second.deadline);
        })
        .slice(0, 4),
    [followedPromises],
  );

  const filteredCandidates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return candidates.filter((candidate) => {
      const candidatePromises = getPromisesForCandidate(candidate.id);
      const searchText = [
        candidate.name,
        candidate.office,
        candidate.region,
        candidate.partyOrAffiliation,
        ...candidatePromises.map((promise) => `${promise.title} ${promise.sector} ${promise.location}`),
      ]
        .join(" ")
        .toLowerCase();
      const matchesQuery = !normalizedQuery || searchText.includes(normalizedQuery);
      const matchesOffice = officeFilter === "All offices" || candidate.office === officeFilter;
      const matchesSector =
        sectorFilter === "All sectors" ||
        candidatePromises.some((promise) => promise.sector === sectorFilter);
      return matchesQuery && matchesOffice && matchesSector;
    });
  }, [officeFilter, query, sectorFilter]);

  const selectedCandidate =
    candidates.find((candidate) => candidate.id === selectedCandidateId) ?? candidates[0];
  const selectedManifesto = getManifestoForCandidate(selectedCandidate.id);
  const selectedPromises = getPromisesForCandidate(selectedCandidate.id);
  const selectedPromiseIds = new Set(selectedPromises.map((promise) => promise.id));
  const selectedContextNotes = contextNotes.filter((note) => selectedPromiseIds.has(note.promiseId));
  const selectedStatusHistory = statusHistory.filter((item) => selectedPromiseIds.has(item.promiseId));
  const selectedStatusCounts = getStatusCounts(selectedPromises);
  const offices = ["All offices", ...Array.from(new Set(candidates.map((candidate) => candidate.office)))];
  const sectors = ["All sectors", ...Array.from(new Set(promises.map((promise) => promise.sector)))];
  const recentEvidence = [...evidence].sort((first, second) => second.createdAt.localeCompare(first.createdAt));

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
              <p className="brand__tagline">Promise tracking for civic memory</p>
            </div>
          </div>
          <div className="header-status">
            <span>
              <Icon name="shield" />
              Anonymous by default
            </span>
            <span>
              <Icon name="signal" />
              {syncQueue.length} queued
            </span>
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="intro-panel" aria-labelledby="page-title">
          <p className="eyebrow">Voice & accountability</p>
          <h2 id="page-title">Follow the promises that matter, without losing the wider record.</h2>
          <p>
            Seeded fictional candidates, manifestos, promises, evidence, context notes, and status history
            are now visible for the demo. Persistence and simulated sync stay queued for later milestones.
          </p>
        </section>

        <nav className="view-tabs" aria-label="Primary views">
          <button
            className={view === "dashboard" ? "is-active" : ""}
            onClick={() => setView("dashboard")}
            type="button"
          >
            <Icon name="pin" />
            Following dashboard
          </button>
          <button
            className={view === "manifestos" ? "is-active" : ""}
            onClick={() => setView("manifestos")}
            type="button"
          >
            <Icon name="book" />
            Manifesto browser
          </button>
        </nav>

        {view === "dashboard" ? (
          <section className="desktop-grid" aria-label="Following dashboard">
            <aside className="paper-panel side-rail">
              <div className="section-heading">
                <p className="eyebrow">Following</p>
                <h2>Interests</h2>
              </div>
              <div className="interest-list" aria-label="Followed interests">
                {[...followedRegions, ...followedSectors].map((interest) => (
                  <span className="interest-chip" key={interest}>
                    {interest}
                  </span>
                ))}
                <button className="interest-chip interest-chip--add" type="button">
                  + Add
                </button>
              </div>
              <div className="quiet-note">
                <Icon name="shield" />
                Evidence and context notes are displayed without identity.
              </div>
            </aside>

            <section className="content-stack" aria-label="Priority promises">
              <div className="paper-panel summary-panel">
                <div className="section-heading">
                  <p className="eyebrow">Dashboard</p>
                  <h2>Priority promises</h2>
                </div>
                <div className="status-grid" aria-label="Promise status counts">
                  {(Object.keys(selectedStatusCounts) as PromiseStatus[]).map((status) => (
                    <div className="status-count" key={status}>
                      <StatusPill tone={status}>{statusLabels[status]}</StatusPill>
                      <strong>{getStatusCounts(followedPromises)[status]}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-stack">
                {priorityPromises.map((promise) => (
                  <PromiseCard key={promise.id} promise={promise} />
                ))}
              </div>
            </section>

            <aside className="content-stack context-rail">
              <section className="paper-panel">
                <div className="section-heading">
                  <p className="eyebrow">Watched</p>
                  <h2>Candidates</h2>
                </div>
                <div className="candidate-list">
                  {candidates
                    .filter((candidate) => followedCandidateIds.includes(candidate.id))
                    .map((candidate) => (
                      <CandidateCard
                        compact
                        key={candidate.id}
                        candidate={candidate}
                        onSelect={(candidateId) => {
                          setSelectedCandidateId(candidateId);
                          setView("manifestos");
                        }}
                      />
                    ))}
                </div>
              </section>

              <section className="paper-panel">
                <div className="section-heading">
                  <p className="eyebrow">Recent</p>
                  <h2>Evidence</h2>
                </div>
                <div className="activity-list">
                  {recentEvidence.slice(0, 3).map((item) => {
                    const promise = promises.find((promiseItem) => promiseItem.id === item.promiseId);
                    return (
                      <article className="activity-item" key={item.id}>
                        <span className="activity-item__icon">
                          <Icon name={item.createdOffline ? "signal" : "shield"} />
                        </span>
                        <div>
                          <strong>{promise?.sector ?? "Promise"} evidence</strong>
                          <p>{item.note}</p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            </aside>
          </section>
        ) : (
          <section className="browser-layout" aria-label="Manifesto browser">
            <aside className="paper-panel browser-filters">
              <div className="section-heading">
                <p className="eyebrow">Browse</p>
                <h2>Candidates</h2>
              </div>
              <label className="search-field">
                <Icon name="search" />
                <span className="sr-only">Search candidates and promises</span>
                <input
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search place, office, sector"
                  type="search"
                  value={query}
                />
              </label>
              <label className="filter-field">
                <span>
                  <Icon name="filter" />
                  Office
                </span>
                <select onChange={(event) => setOfficeFilter(event.target.value)} value={officeFilter}>
                  {offices.map((office) => (
                    <option key={office}>{office}</option>
                  ))}
                </select>
              </label>
              <label className="filter-field">
                <span>
                  <Icon name="filter" />
                  Sector
                </span>
                <select onChange={(event) => setSectorFilter(event.target.value)} value={sectorFilter}>
                  {sectors.map((sector) => (
                    <option key={sector}>{sector}</option>
                  ))}
                </select>
              </label>
              <div className="candidate-list">
                {filteredCandidates.map((candidate) => (
                  <CandidateCard
                    active={selectedCandidate.id === candidate.id}
                    candidate={candidate}
                    key={candidate.id}
                    onSelect={setSelectedCandidateId}
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
                  <div className="promise-card__topline">
                    <StatusPill tone={isElectedCandidate(selectedCandidate) ? "kept" : "not_started"}>
                      {isElectedCandidate(selectedCandidate) ? "Elected" : "Archived"}
                    </StatusPill>
                    <span className="promise-card__sector">{selectedCandidate.electionYear}</span>
                  </div>
                  <h2>{selectedCandidate.name}</h2>
                  <p>
                    {selectedCandidate.office} | {selectedCandidate.region} |{" "}
                    {selectedCandidate.partyOrAffiliation}
                  </p>
                </div>
              </article>

              <section className="paper-panel manifesto-summary">
                <div className="section-heading">
                  <p className="eyebrow">Manifesto</p>
                  <h2>{selectedManifesto?.title ?? "No manifesto found"}</h2>
                </div>
                <dl className="manifesto-facts">
                  <div>
                    <dt>Source</dt>
                    <dd>{selectedManifesto?.sourceLabel ?? "Unknown source"}</dd>
                  </div>
                  <div>
                    <dt>Published</dt>
                    <dd>{selectedManifesto ? formatDate(selectedManifesto.publishedDate) : "Unknown"}</dd>
                  </div>
                  <div>
                    <dt>Language</dt>
                    <dd>{selectedManifesto?.language.toUpperCase() ?? "EN"}</dd>
                  </div>
                </dl>
                <div className="status-grid" aria-label="Selected manifesto status counts">
                  {(Object.keys(selectedStatusCounts) as PromiseStatus[]).map((status) => (
                    <div className="status-count" key={status}>
                      <StatusPill tone={status}>{statusLabels[status]}</StatusPill>
                      <strong>{selectedStatusCounts[status]}</strong>
                    </div>
                  ))}
                </div>
              </section>

              <section className="promise-sections" aria-label="Manifesto promises">
                {Array.from(new Set(selectedPromises.map((promise) => promise.sector))).map((sector) => (
                  <div className="sector-group" key={sector}>
                    <div className="section-heading">
                      <p className="eyebrow">Sector</p>
                      <h2>{sector}</h2>
                    </div>
                    <div className="card-stack">
                      {selectedPromises
                        .filter((promise) => promise.sector === sector)
                        .map((promise) => (
                          <PromiseCard key={promise.id} promise={promise} />
                        ))}
                    </div>
                  </div>
                ))}
              </section>
            </section>

            <aside className="content-stack context-rail">
              <section className="paper-panel">
                <div className="section-heading">
                  <p className="eyebrow">Context</p>
                  <h2>Notes</h2>
                </div>
                <div className="activity-list">
                  {selectedContextNotes.length > 0 ? (
                    selectedContextNotes.slice(0, 3).map((note) => (
                      <article className="activity-item" key={note.id}>
                        <span className="activity-item__icon">
                          <Icon name="map" />
                        </span>
                        <div>
                          <strong>{note.confidenceLabel}</strong>
                          <p>{note.note}</p>
                        </div>
                      </article>
                    ))
                  ) : (
                    <p className="empty-copy">No context notes for this candidate yet.</p>
                  )}
                </div>
              </section>

              <section className="paper-panel">
                <div className="section-heading">
                  <p className="eyebrow">History</p>
                  <h2>Status changes</h2>
                </div>
                <div className="activity-list">
                  {selectedStatusHistory.length > 0 ? (
                    selectedStatusHistory.slice(0, 3).map((item) => (
                      <article className="activity-item" key={item.id}>
                        <span className="activity-item__icon">
                          <Icon name="check" />
                        </span>
                        <div>
                          <StatusPill tone={item.status}>{statusLabels[item.status]}</StatusPill>
                          <p>{item.reason}</p>
                        </div>
                      </article>
                    ))
                  ) : (
                    <p className="empty-copy">No status changes recorded for this candidate yet.</p>
                  )}
                </div>
              </section>
            </aside>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
