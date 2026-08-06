import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export type AttendanceValue = "present" | "sick" | "permission" | "absent" | "late";

export interface ClassRecordPayload {
  assignment_id: string;
  date: string;
  attendance: Array<{ student_id: string; status: AttendanceValue }>;
  topic: string;
  activity_summary: string;
  reflection: string;
  obstacle: string;
  follow_up: string;
}

export interface OutboxRecord {
  id?: number;
  payload: ClassRecordPayload;
  created_at: string;
  status: "pending" | "syncing" | "error";
  error_message?: string;
}

interface TemanGuruDB extends DBSchema {
  outbox: {
    key: number;
    value: OutboxRecord;
    indexes: { "by-status": OutboxRecord["status"] };
  };
}

let dbPromise: Promise<IDBPDatabase<TemanGuruDB>> | null = null;

export function getOfflineDB() {
  if (typeof window === "undefined") return null;
  if (!dbPromise) {
    dbPromise = openDB<TemanGuruDB>("temanguru-db", 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("outbox")) {
          const store = db.createObjectStore("outbox", { keyPath: "id", autoIncrement: true });
          store.createIndex("by-status", "status");
        }
      },
      terminated() { dbPromise = null; },
    });
  }
  return dbPromise;
}

export async function saveToOutbox(payload: ClassRecordPayload) {
  const db = await getOfflineDB();
  if (!db) return;
  return db.add("outbox", { payload, created_at: new Date().toISOString(), status: "pending" });
}

export async function getPendingRecords() {
  const db = await getOfflineDB();
  if (!db) return [];
  const pending = await db.getAllFromIndex("outbox", "by-status", "pending");
  const errors = await db.getAllFromIndex("outbox", "by-status", "error");
  return [...pending, ...errors];
}

export async function updateOutboxRecord(id: number, patch: Partial<OutboxRecord>) {
  const db = await getOfflineDB();
  if (!db) return;
  const record = await db.get("outbox", id);
  if (record) await db.put("outbox", { ...record, ...patch });
}

export async function removeOutboxRecord(id: number) {
  const db = await getOfflineDB();
  if (db) await db.delete("outbox", id);
}

export async function clearPrivateOfflineData() {
  const db = await getOfflineDB();
  if (db) await db.clear("outbox");
}
