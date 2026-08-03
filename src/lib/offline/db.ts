"use client";

import Dexie, { type EntityTable } from "dexie";

export type OfflineDraft = {
  id: string;
  userId: string;
  schoolId: string;
  kind: "attendance" | "journal";
  payload: Record<string, unknown>;
  updatedAt: string;
  syncState: "draft" | "pending" | "failed";
};

const database = new Dexie("temanguru-private-drafts") as Dexie & {
  drafts: EntityTable<OfflineDraft, "id">;
};

database.version(1).stores({ drafts: "id, userId, schoolId, kind, updatedAt, syncState" });

export const offlineDb = database;

export async function clearPrivateOfflineData() {
  await offlineDb.drafts.clear();
}
