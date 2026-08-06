"use client";

import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { createEmptyWorkspace } from "./defaults";
import type { LocalWorkspace } from "./types";

const DATABASE_NAME = "temanguru-local-workspace";
const DATABASE_VERSION = 1;
const WORKSPACE_KEY = "current";
const FALLBACK_KEY = "temanguru:local-workspace";

interface TemanGuruWorkspaceDB extends DBSchema {
  workspace: {
    key: string;
    value: LocalWorkspace;
  };
}

let databasePromise: Promise<IDBPDatabase<TemanGuruWorkspaceDB>> | null = null;

function getDatabase() {
  if (!databasePromise) {
    databasePromise = openDB<TemanGuruWorkspaceDB>(DATABASE_NAME, DATABASE_VERSION, {
      upgrade(database) {
        if (!database.objectStoreNames.contains("workspace")) {
          database.createObjectStore("workspace");
        }
      },
    });
  }
  return databasePromise;
}

function readFallback(): LocalWorkspace | null {
  try {
    const raw = localStorage.getItem(FALLBACK_KEY);
    return raw ? JSON.parse(raw) as LocalWorkspace : null;
  } catch {
    return null;
  }
}

export async function loadLocalWorkspace(): Promise<LocalWorkspace> {
  try {
    const database = await getDatabase();
    const stored = await database.get("workspace", WORKSPACE_KEY);
    if (stored) return stored;
  } catch (error) {
    console.warn("IndexedDB tidak tersedia, memakai penyimpanan cadangan.", error);
  }

  return readFallback() ?? createEmptyWorkspace();
}

export async function saveLocalWorkspace(workspace: LocalWorkspace): Promise<void> {
  try {
    const database = await getDatabase();
    await database.put("workspace", workspace, WORKSPACE_KEY);
    localStorage.removeItem(FALLBACK_KEY);
    return;
  } catch (error) {
    console.warn("Gagal menyimpan ke IndexedDB, memakai localStorage.", error);
  }

  localStorage.setItem(FALLBACK_KEY, JSON.stringify(workspace));
}

export async function clearLocalWorkspace(): Promise<void> {
  try {
    const database = await getDatabase();
    await database.delete("workspace", WORKSPACE_KEY);
  } catch (error) {
    console.warn("Gagal menghapus IndexedDB lokal.", error);
  }
  localStorage.removeItem(FALLBACK_KEY);
}

export function getDeviceId(): string {
  const key = "temanguru:device-id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const next = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(key, next);
  return next;
}
