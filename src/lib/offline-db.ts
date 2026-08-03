import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface ClassRecordPayload {
  assignment_id: string;
  date: string;
  attendance: {
    student_id: string;
    status: string;
  }[];
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
  status: 'pending' | 'syncing' | 'error';
  error_message?: string;
}

interface TemanGuruDB extends DBSchema {
  outbox: {
    key: number;
    value: OutboxRecord;
    indexes: { 'by-status': string };
  };
}

let dbPromise: Promise<IDBPDatabase<TemanGuruDB>> | null = null;

function getDB() {
  if (typeof window === 'undefined') return null; // No IDB on server
  if (!dbPromise) {
    dbPromise = openDB<TemanGuruDB>('temanguru-db', 1, {
      upgrade(db: IDBPDatabase<TemanGuruDB>) {
        const outboxStore = db.createObjectStore('outbox', {
          keyPath: 'id',
          autoIncrement: true,
        });
        outboxStore.createIndex('by-status', 'status');
      },
    });
  }
  return dbPromise;
}

export async function saveToOutbox(payload: ClassRecordPayload) {
  const db = await getDB();
  if (!db) return;
  return db.add('outbox', {
    payload,
    created_at: new Date().toISOString(),
    status: 'pending',
  });
}

export async function getPendingRecords() {
  const db = await getDB();
  if (!db) return [];
  return db.getAllFromIndex('outbox', 'by-status', 'pending');
}

export async function getRecordsByStatus(status: 'pending' | 'syncing' | 'error') {
  const db = await getDB();
  if (!db) return [];
  return db.getAllFromIndex('outbox', 'by-status', status);
}

export async function markRecordSyncing(id: number) {
  const db = await getDB();
  if (!db) return;
  const record = await db.get('outbox', id);
  if (record) {
    record.status = 'syncing';
    await db.put('outbox', record);
  }
}

export async function markRecordError(id: number, error: string) {
  const db = await getDB();
  if (!db) return;
  const record = await db.get('outbox', id);
  if (record) {
    record.status = 'error';
    record.error_message = error;
    await db.put('outbox', record);
  }
}

export async function removeRecord(id: number) {
  const db = await getDB();
  if (!db) return;
  return db.delete('outbox', id);
}

export async function clearAllRecords() {
  const db = await getDB();
  if (!db) return;
  return db.clear('outbox');
}
