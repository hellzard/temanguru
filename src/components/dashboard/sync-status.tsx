"use client";

import { CloudOff, Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { syncClassRecord } from "@/app/(dashboard)/record/actions";
import { getPendingRecords, removeOutboxRecord, updateOutboxRecord } from "@/lib/offline-db";

export function SyncStatus() {
  const [pending, setPending] = useState(0);
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(async () => setPending((await getPendingRecords()).length), []);
  const sync = useCallback(async () => {
    if (!window.navigator.onLine || syncing) return;
    setSyncing(true);
    try {
      const records = await getPendingRecords();
      for (const record of records) {
        if (!record.id) continue;
        await updateOutboxRecord(record.id, { status: "syncing", error_message: undefined });
        const result = await syncClassRecord(record.payload);
        if (result.error) await updateOutboxRecord(record.id, { status: "error", error_message: result.error });
        else await removeOutboxRecord(record.id);
      }
      await refresh();
    } finally {
      setSyncing(false);
    }
  }, [refresh, syncing]);

  useEffect(() => {
    const updateNetwork = () => { setOnline(window.navigator.onLine); if (window.navigator.onLine) void sync(); };
    void refresh();
    updateNetwork();
    const changed = () => void refresh();
    window.addEventListener("online", updateNetwork);
    window.addEventListener("offline", updateNetwork);
    window.addEventListener("temanguru-outbox-changed", changed);
    return () => {
      window.removeEventListener("online", updateNetwork);
      window.removeEventListener("offline", updateNetwork);
      window.removeEventListener("temanguru-outbox-changed", changed);
    };
  }, [refresh, sync]);

  if (!pending) return null;
  return <button type="button" onClick={() => void sync()} disabled={syncing || !online} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-900" aria-label={`${pending} catatan menunggu sinkronisasi`}>{syncing ? <Loader2 className="animate-spin" size={16} /> : !online ? <CloudOff size={16} /> : <RefreshCw size={16} />}{pending} tertunda</button>;
}
