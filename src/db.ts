import Dexie, { type Table } from "dexie";
import {
  candidates,
  contextNotes,
  evidence,
  manifestos,
  promises,
  statusHistory,
  syncQueue,
  type Candidate,
  type ContextNote,
  type Evidence,
  type Manifesto,
  type PromiseRecord,
  type StatusHistory,
  type SyncEnvelope,
} from "./data";

export class ManifestoDatabase extends Dexie {
  candidates!: Table<Candidate, string>;
  manifestos!: Table<Manifesto, string>;
  promises!: Table<PromiseRecord, string>;
  evidence!: Table<Evidence, string>;
  contextNotes!: Table<ContextNote, string>;
  statusHistory!: Table<StatusHistory, string>;
  syncQueue!: Table<SyncEnvelope, string>;

  constructor() {
    super("manifesto-civic-data");

    this.version(1).stores({
      candidates: "id,status,office,region",
      manifestos: "id,candidateId,publishedDate,originalLanguage",
      promises: "id,manifestoId,status,sector,deadline",
      evidence: "id,promiseId,type,createdAt,createdOffline",
      contextNotes: "id,promiseId,confidenceLabel,createdAt",
      statusHistory: "id,promiseId,status,createdAt",
      syncQueue: "id,entityType,entityId,operation,createdAt,syncedAt",
    });
  }
}

export const db = new ManifestoDatabase();

async function putSeedData() {
  await Promise.all([
    db.candidates.bulkPut(candidates),
    db.manifestos.bulkPut(manifestos),
    db.promises.bulkPut(promises),
    db.evidence.bulkPut(evidence),
    db.contextNotes.bulkPut(contextNotes),
    db.statusHistory.bulkPut(statusHistory),
    db.syncQueue.bulkPut(syncQueue),
  ]);
}

export async function seedManifestoDatabase() {
  await db.transaction(
    "rw",
    [
      db.candidates,
      db.manifestos,
      db.promises,
      db.evidence,
      db.contextNotes,
      db.statusHistory,
      db.syncQueue,
    ],
    async () => {
      const candidateCount = await db.candidates.count();
      if (candidateCount > 0) return;

      await putSeedData();
    },
  );
}

export async function resetManifestoDatabase() {
  await db.transaction(
    "rw",
    [
      db.candidates,
      db.manifestos,
      db.promises,
      db.evidence,
      db.contextNotes,
      db.statusHistory,
      db.syncQueue,
    ],
    async () => {
      await Promise.all([
        db.candidates.clear(),
        db.manifestos.clear(),
        db.promises.clear(),
        db.evidence.clear(),
        db.contextNotes.clear(),
        db.statusHistory.clear(),
        db.syncQueue.clear(),
      ]);
      await putSeedData();
    },
  );
}
