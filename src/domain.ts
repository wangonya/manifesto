import {
  candidates,
  evidence,
  manifestos,
  promises,
  statusHistory,
  type Candidate,
  type PromiseRecord,
  type PromiseStatus,
} from "./data";

export const followedCandidateIds = ["cand-amina", "cand-david", "cand-mary"];
export const followedSectors = ["Health", "Water", "Education", "Safety"];
export const followedRegions = ["Lakeside County", "Kijani East", "Mto Ward"];

export const statusPriority: Record<PromiseStatus, number> = {
  missed: 0,
  at_risk: 1,
  in_progress: 2,
  not_started: 3,
  kept: 4,
};

export function getCandidateForPromise(promise: PromiseRecord) {
  const manifesto = manifestos.find((item) => item.id === promise.manifestoId);
  return candidates.find((candidate) => candidate.id === manifesto?.candidateId);
}

export function getManifestoForCandidate(candidateId: string) {
  return manifestos.find((manifesto) => manifesto.candidateId === candidateId);
}

export function getPromisesForCandidate(candidateId: string) {
  const manifesto = getManifestoForCandidate(candidateId);
  return promises.filter((promise) => promise.manifestoId === manifesto?.id);
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

export function getEvidenceForPromise(promiseId: string) {
  return evidence
    .filter((item) => item.promiseId === promiseId)
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
}

export function getStatusHistoryForPromise(promiseId: string) {
  return statusHistory
    .filter((item) => item.promiseId === promiseId)
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
}

export function isElectedCandidate(candidate: Candidate) {
  return candidate.status === "elected";
}

export function getFollowedPromises() {
  return promises.filter((promise) => {
    const candidate = getCandidateForPromise(promise);
    const isExplicitlyFollowed = candidate ? followedCandidateIds.includes(candidate.id) : false;
    return (
      candidate &&
      (isExplicitlyFollowed ||
        followedSectors.includes(promise.sector) ||
        (isElectedCandidate(candidate) && followedRegions.includes(candidate.region)))
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
  officeFilter,
  query,
  sectorFilter,
}: {
  officeFilter: string;
  query: string;
  sectorFilter: string;
}) {
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
}
