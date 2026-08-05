const APP_PREFIX = "temanguru:";
const CACHE_PREFIX = "temanguru-";
const SENSITIVE_DATABASES = ["temanguru-db"];
const OPTIONAL_THEME_DATABASE = "temanguru-theme";

async function deleteDatabase(name: string): Promise<void> {
  if (typeof indexedDB === "undefined") return;

  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error(`Gagal menghapus ${name}.`));
    request.onblocked = () => reject(new Error(`${name} sedang digunakan tab lain.`));
  });
}

function removePrefixedKeys(storage: Storage): void {
  const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index))
    .filter((key): key is string => Boolean(key?.startsWith(APP_PREFIX)));

  for (const key of keys) storage.removeItem(key);
}

export async function clearTemanGuruDeviceData(options?: { includeTheme?: boolean }) {
  for (const database of SENSITIVE_DATABASES) {
    await deleteDatabase(database);
  }

  if (options?.includeTheme) {
    await deleteDatabase(OPTIONAL_THEME_DATABASE);
    removePrefixedKeys(localStorage);
  }

  removePrefixedKeys(sessionStorage);

  if ("caches" in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((name) => name.startsWith(CACHE_PREFIX))
        .map((name) => caches.delete(name)),
    );
  }
}
