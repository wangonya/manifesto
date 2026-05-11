import { describe, expect, it } from "vitest";
import {
  filterCandidates,
  getEvidenceForPromise,
  getFollowedPromises,
  getPriorityPromises,
  getPromisesForCandidate,
  getStatusCounts,
} from "./domain";

describe("seeded civic data rules", () => {
  it("counts promise statuses for a candidate manifesto", () => {
    const counts = getStatusCounts(getPromisesForCandidate("cand-amina"));

    expect(counts).toEqual({
      kept: 0,
      in_progress: 1,
      missed: 0,
      not_started: 1,
      at_risk: 1,
    });
  });

  it("prioritizes followed promises by civic risk and deadline", () => {
    const priorityIds = getPriorityPromises(getFollowedPromises()).map((promise) => promise.id);

    expect(priorityIds).toEqual([
      "promise-road",
      "promise-water",
      "promise-streetlights",
      "promise-clinic",
    ]);
  });

  it("keeps archived candidates discoverable through manifesto search", () => {
    const matches = filterCandidates({
      officeFilter: "All offices",
      query: "unsafe rental housing",
      sectorFilter: "All sectors",
    });

    expect(matches.map((candidate) => candidate.id)).toEqual(["cand-nadia"]);
  });

  it("filters candidates by office and promise sector", () => {
    const matches = filterCandidates({
      officeFilter: "Member of Parliament",
      query: "",
      sectorFilter: "Housing",
    });

    expect(matches.map((candidate) => candidate.id)).toEqual(["cand-nadia"]);
  });

  it("returns evidence newest first for a promise", () => {
    const roadEvidence = getEvidenceForPromise("promise-road");

    expect(roadEvidence[0]).toMatchObject({
      id: "evidence-road-photos",
      anonymous: true,
      createdOffline: true,
    });
  });
});
