import { DEFAULT_THEME_SETTINGS, type ThemeSettings } from "./types";

const SETTINGS_KEY = "temanguru:theme:v1";
const DB_NAME = "temanguru-theme";
const STORE_NAME = "wallpapers";
const WALLPAPER_KEY = "active";

const isHex = (value: unknown): value is string =>
  typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);

const clamp = (value: unknown, min: number, max: number, fallback: number) => {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
};

const POSITIONS = new Set([
  "center", "top", "bottom", "left", "right",
  "left top", "right top", "left bottom", "right bottom",
]);

export function normalizeThemeSettings(input: unknown): ThemeSettings {
  if (!input || typeof input !== "object") return structuredClone(DEFAULT_THEME_SETTINGS);
  const value = input as Partial<ThemeSettings>;
  return {
    version: 1,
    mode: ["light", "dark", "system"].includes(String(value.mode))
      ? value.mode as ThemeSettings["mode"]
      : "system",
    kind: ["solid", "gradient", "wallpaper"].includes(String(value.kind))
      ? value.kind as ThemeSettings["kind"]
      : "solid",
    presetId: typeof value.presetId === "string" ? value.presetId : "indigo-guru",
    customAccent: isHex(value.customAccent) ? value.customAccent : null,
    customGradient: {
      from: isHex(value.customGradient?.from) ? value.customGradient.from : "#4f46e5",
      to: isHex(value.customGradient?.to) ? value.customGradient.to : "#06b6d4",
      angle: clamp(value.customGradient?.angle, 0, 360, 135),
    },
    wallpaper: {
      enabled: Boolean(value.wallpaper?.enabled),
      fit: value.wallpaper?.fit === "contain" ? "contain" : "cover",
      position: POSITIONS.has(String(value.wallpaper?.position))
        ? value.wallpaper?.position as ThemeSettings["wallpaper"]["position"]
        : "center",
      repeat: Boolean(value.wallpaper?.repeat),
      overlay: clamp(value.wallpaper?.overlay, 0, 90, 68),
      blur: clamp(value.wallpaper?.blur, 0, 24, 0),
      brightness: clamp(value.wallpaper?.brightness, 40, 140, 92),
    },
    glass: clamp(value.glass, 0, 20, 6),
  };
}

export function loadThemeSettings(): ThemeSettings {
  if (typeof window === "undefined") return structuredClone(DEFAULT_THEME_SETTINGS);
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    return raw ? normalizeThemeSettings(JSON.parse(raw)) : structuredClone(DEFAULT_THEME_SETTINGS);
  } catch {
    return structuredClone(DEFAULT_THEME_SETTINGS);
  }
}

export function saveThemeSettings(value: ThemeSettings): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalizeThemeSettings(value)));
    return true;
  } catch {
    return false;
  }
}

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("Penyimpanan wallpaper tidak didukung browser ini."));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error ?? new Error("Gagal membuka penyimpanan tema."));
    request.onblocked = () => reject(new Error("Penyimpanan tema sedang digunakan tab lain."));
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function withDb<T>(operation: (db: IDBDatabase) => Promise<T>): Promise<T> {
  const db = await openDb();
  try {
    return await operation(db);
  } finally {
    db.close();
  }
}

export async function saveWallpaperBlob(blob: Blob): Promise<void> {
  await withDb((db) => new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(blob, WALLPAPER_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Gagal menyimpan wallpaper."));
    tx.onabort = () => reject(tx.error ?? new Error("Penyimpanan wallpaper dibatalkan."));
  }));
}

export async function loadWallpaperBlob(): Promise<Blob | null> {
  if (typeof indexedDB === "undefined") return null;
  return withDb((db) => new Promise<Blob | null>((resolve, reject) => {
    const request = db.transaction(STORE_NAME).objectStore(STORE_NAME).get(WALLPAPER_KEY);
    request.onsuccess = () => resolve(request.result instanceof Blob ? request.result : null);
    request.onerror = () => reject(request.error ?? new Error("Gagal membaca wallpaper."));
  }));
}

export async function deleteWallpaperBlob(): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  await withDb((db) => new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(WALLPAPER_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Gagal menghapus wallpaper."));
    tx.onabort = () => reject(tx.error ?? new Error("Penghapusan wallpaper dibatalkan."));
  }));
}

export const THEME_STORAGE = { SETTINGS_KEY, DB_NAME } as const;
