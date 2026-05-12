import { describe, expect, it } from "vitest";
import {
  filterCandidates,
  getContextNotesForPromise,
  getEvidenceForPromise,
  getFollowedPromises,
  isCandidateInFollowedRegion,
  getPriorityPromises,
  getPromisesForCandidate,
  getStatusCounts,
} from "./domain";
import type { Candidate, ContextNote } from "./data";
import { completeUserText, text } from "./i18n";

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
      language: "en",
      officeFilter: "all",
      query: "unsafe rental housing",
      sectorFilter: "all",
    });

    expect(matches.map((candidate) => candidate.id)).toEqual(["cand-nadia"]);
  });

  it("filters candidates by office and promise sector", () => {
    const matches = filterCandidates({
      language: "en",
      officeFilter: "member_of_parliament",
      query: "",
      sectorFilter: "housing",
    });

    expect(matches.map((candidate) => candidate.id)).toEqual(["cand-nadia"]);
  });

  it("matches followed regions by region code instead of candidate id", () => {
    const newElectedCandidate: Candidate = {
      id: "cand-new-lakeside",
      name: "New Lakeside Candidate",
      office: "governor",
      region: "lakeside_county",
      electionYear: 2027,
      partyOrAffiliation: text("Independent", "Huru", "Indépendant"),
      status: "elected",
    };

    expect(isCandidateInFollowedRegion(newElectedCandidate)).toBe(true);
  });

  it("returns evidence newest first for a promise", () => {
    const roadEvidence = getEvidenceForPromise("promise-road");

    expect(roadEvidence[0]).toMatchObject({
      id: "evidence-road-photos",
      anonymous: true,
      createdOffline: true,
    });
  });

  it("returns context notes newest first with local notes prioritized", () => {
    const contextNoteRecords: ContextNote[] = [
      {
        id: "context-seeded-newer",
        promiseId: "promise-clinic",
        note: completeUserText(text("Seeded newer note", "Dokezo jipya la mfano", "Note de test plus récente")),
        confidenceLabel: "public record",
        createdAt: "2028-05-01T10:00:00.000Z",
      },
      {
        id: "context-local-older",
        promiseId: "promise-clinic",
        note: completeUserText(text("Local older note", "Dokezo la zamani la eneo", "Note locale plus ancienne")),
        confidenceLabel: "community report",
        createdAt: "2028-04-01T10:00:00.000Z",
      },
      {
        id: "context-seeded-older",
        promiseId: "promise-clinic",
        note: completeUserText(text("Seeded older note", "Dokezo la zamani la mfano", "Note de test plus ancienne")),
        confidenceLabel: "needs verification",
        createdAt: "2028-03-01T10:00:00.000Z",
      },
    ];

    expect(getContextNotesForPromise("promise-clinic", contextNoteRecords).map((note) => note.id)).toEqual([
      "context-local-older",
      "context-seeded-newer",
      "context-seeded-older",
    ]);
  });
});
