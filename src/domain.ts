import {
  candidates as seededCandidates,
  contextNotes as seededContextNotes,
  evidence as seededEvidence,
  manifestos as seededManifestos,
  promises as seededPromises,
  statusHistory as seededStatusHistory,
  type Candidate,
  type ContextNote,
  type Evidence as EvidenceRecord,
  type Manifesto,
  type OfficeCode,
  type PromiseRecord,
  type PromiseStatus,
  type RegionCode,
  type SectorCode,
  type StatusHistory as StatusHistoryRecord,
} from "./data";
import {
  localize,
  officeLabels,
  regionLabels,
  sectorLabels,
  type LanguageCode,
} from "./i18n";

export const followedCandidateIds = ["cand-amina", "cand-david", "cand-mary"];
export const followedSectors: SectorCode[] = ["health", "water", "education", "safety"];
export const followedRegions: RegionCode[] = ["lakeside_county", "kijani_east", "mto_ward"];

export type CivicData = {
  candidates: Candidate[];
  manifestos: Manifesto[];
  promises: PromiseRecord[];
  statusHistory: StatusHistoryRecord[];
};

export const seededCivicData: CivicData = {
  candidates: seededCandidates,
  manifestos: seededManifestos,
  promises: seededPromises,
  statusHistory: seededStatusHistory,
};

export const statusPriority: Record<PromiseStatus, number> = {
  missed: 0,
  at_risk: 1,
  in_progress: 2,
  not_started: 3,
  kept: 4,
};

export function getCandidateForPromise(
  promise: PromiseRecord,
  data: Pick<CivicData, "candidates" | "manifestos"> = seededCivicData,
) {
  const manifesto = data.manifestos.find((item) => item.id === promise.manifestoId);
  return data.candidates.find((candidate) => candidate.id === manifesto?.candidateId);
}

export function getManifestoForCandidate(
  candidateId: string,
  data: Pick<CivicData, "manifestos"> = seededCivicData,
) {
  return data.manifestos.find((manifesto) => manifesto.candidateId === candidateId);
}

export function getPromisesForCandidate(
  candidateId: string,
  data: Pick<CivicData, "manifestos" | "promises"> = seededCivicData,
) {
  const manifesto = getManifestoForCandidate(candidateId, data);
  return data.promises.filter((promise) => promise.manifestoId === manifesto?.id);
}

export function getStatusCounts(items: PromiseRecord[]) {
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

export function getEvidenceForPromise(promiseId: string, evidenceRecords: EvidenceRecord[] = seededEvidence) {
  return evidenceRecords
    .filter((item) => item.promiseId === promiseId)
    .sort((first, second) => {
      const firstIsLocal = first.id.startsWith("evidence-local-");
      const secondIsLocal = second.id.startsWith("evidence-local-");
      if (firstIsLocal !== secondIsLocal) return firstIsLocal ? -1 : 1;
      return second.createdAt.localeCompare(first.createdAt);
    });
}

export function getContextNotesForPromise(promiseId: string, contextNoteRecords: ContextNote[] = seededContextNotes) {
  return contextNoteRecords
    .filter((item) => item.promiseId === promiseId)
    .sort((first, second) => {
      const firstIsLocal = first.id.startsWith("context-local-");
      const secondIsLocal = second.id.startsWith("context-local-");
      if (firstIsLocal !== secondIsLocal) return firstIsLocal ? -1 : 1;
      return second.createdAt.localeCompare(first.createdAt);
    });
}

export function getStatusHistoryForPromise(
  promiseId: string,
  statusHistoryRecords: StatusHistoryRecord[] = seededStatusHistory,
) {
  return statusHistoryRecords
    .filter((item) => item.promiseId === promiseId)
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
}

export function isElectedCandidate(candidate: Candidate) {
  return candidate.status === "elected";
}

export function isCandidateInFollowedRegion(candidate: Candidate) {
  return isElectedCandidate(candidate) && followedRegions.includes(candidate.region);
}

export function getFollowedPromises(data: CivicData = seededCivicData) {
  return data.promises.filter((promise) => {
    const candidate = getCandidateForPromise(promise, data);
    const isExplicitlyFollowed = candidate ? followedCandidateIds.includes(candidate.id) : false;
    return (
      candidate &&
        (isExplicitlyFollowed ||
        followedSectors.includes(promise.sector) ||
        isCandidateInFollowedRegion(candidate))
    );
  });
}

export function getPriorityPromises(items: PromiseRecord[] = getFollowedPromises(), limit = 4) {
  return [...items]
    .sort((first, second) => {
      const statusDelta = statusPriority[first.status] - statusPriority[second.status];
      if (statusDelta !== 0) return statusDelta;
      return first.deadline.localeCompare(second.deadline);
    })
    .slice(0, limit);
}

export function filterCandidates({
  data = seededCivicData,
  language,
  officeFilter,
  query,
  sectorFilter,
}: {
  data?: CivicData;
  language: LanguageCode;
  officeFilter: "all" | OfficeCode;
  query: string;
  sectorFilter: "all" | SectorCode;
}) {
  const normalizedQuery = query.trim().toLowerCase();
  return data.candidates.filter((candidate) => {
    const candidatePromises = getPromisesForCandidate(candidate.id, data);
    const searchText = [
      candidate.name,
      localize(officeLabels[candidate.office], language),
      localize(regionLabels[candidate.region], language),
      localize(candidate.partyOrAffiliation, language),
      ...candidatePromises.map((promise) =>
        [
          localize(promise.title, language),
          localize(sectorLabels[promise.sector], language),
          localize(promise.location, language),
          localize(promise.summary, language),
        ].join(" "),
      ),
    ]
      .join(" ")
      .toLowerCase();
    const matchesQuery = !normalizedQuery || searchText.includes(normalizedQuery);
    const matchesOffice = officeFilter === "all" || candidate.office === officeFilter;
    const matchesSector =
      sectorFilter === "all" ||
      candidatePromises.some((promise) => promise.sector === sectorFilter);
    return matchesQuery && matchesOffice && matchesSector;
  });
}
