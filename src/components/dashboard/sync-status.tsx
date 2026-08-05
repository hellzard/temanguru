"use client";

import { useEffect, useState, useCallback } from "react";
import { CloudOff, CloudUpload, Check, XCircle, Loader2, AlertCircle, RefreshCw, Trash2 } from "lucide-react";
import { getPendingRecords, removeRecord, markRecordError, markRecordSyncing, getRecordsByStatus, OutboxRecord, getDB } from "@/lib/offline-db";
import { syncClassRecord } from "@/app/(dashboard)/record/actions";

export function SyncStatus() {
  const [online, setOnline] = useState(() => {
    if (typeof window !== "undefined") {
      return navigator.onLine;
    }
    return true;
  });
  const [pendingCount, setPendingCount] = useState(0);
  const [errorRecords, setErrorRecords] = useState<OutboxRecord[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showPopover, setShowPopover] = useState(false);

  const checkPending = useCallback(() => {
    getPendingRecords()
      .then((records) => setPendingCount(records.length))
      .catch((e) => console.error("Failed to check pending records", e));
      
    getRecordsByStatus('error')
      .then((records) => setErrorRecords(records))
      .catch((e) => console.error("Failed to check error records", e));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Run once on mount asynchronously
      setTimeout(checkPending, 0);

      const handleOnline = () => {
        setOnline(true);
        checkPending();
      };
      const handleOffline = () => setOnline(false);
      const handleSyncStatusChanged = () => checkPending();

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      window.addEventListener("sync-status-changed", handleSyncStatusChanged);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        window.removeEventListener("sync-status-changed", handleSyncStatusChanged);
      };
    }
  }, [checkPending]);

  const handleSync = async () => {
    if (!online || isSyncing) return;
    setIsSyncing(true);
    setShowPopover(true);

    try {
      const records = await getPendingRecords();
      for (const record of records) {
        if (!record.id) continue;
        
        await markRecordSyncing(record.id);
        
        const result = await syncClassRecord({
          assignment_id: record.payload.assignment_id,
          date: record.payload.date,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          attendance: record.payload.attendance as any,
          topic: record.payload.topic,
          activity_summary: record.payload.activity_summary,
          reflection: record.payload.reflection,
          obstacle: record.payload.obstacle,
          follow_up: record.payload.follow_up,
        });

        if (result && result.error) {
          await markRecordError(record.id, result.error);
        } else {
          await removeRecord(record.id);
        }
      }
    } catch (e) {
      console.error("Sync failed", e);
    } finally {
      setIsSyncing(false);
      await checkPending();
    }
  };

  const handleRetryError = async (id: number) => {
    try {
      const db = await getDB();
      if (!db) return;
      const record = await db.get('outbox', id);
      if (record) {
        record.status = 'pending';
        record.error_message = undefined;
        await db.put('outbox', record);
      }
      checkPending();
    } catch (e) {
      console.error("Failed to retry record", e);
    }
  };

  const handleDeleteError = async (id: number) => {
    try {
      await removeRecord(id);
      checkPending();
    } catch (e) {
      console.error("Failed to delete record", e);
    }
  };

  const hasErrors = errorRecords.length > 0;
  if (pendingCount === 0 && !hasErrors && online) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowPopover(!showPopover)}
        className={`flex items-center justify-center rounded-full p-2 transition-colors ${
          hasErrors ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
        }`}
        title={hasErrors ? `${errorRecords.length} draf gagal sinkronisasi` : pendingCount > 0 ? `${pendingCount} draf menunggu sinkronisasi` : "Offline"}
      >
        {!online ? (
          <CloudOff size={20} className={hasErrors ? "text-red-700" : "text-amber-600"} />
        ) : hasErrors ? (
          <div className="relative">
            <AlertCircle size={20} className="text-red-700" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
              {errorRecords.length}
            </span>
          </div>
        ) : (
          <div className="relative">
            <CloudUpload size={20} className="text-indigo-600" />
            {pendingCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {pendingCount}
              </span>
            )}
          </div>
        )}
      </button>

      {showPopover && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-lg z-50">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">Status Sinkronisasi</h4>
            <button 
              onClick={() => setShowPopover(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <XCircle size={16} />
            </button>
          </div>

          {!online && (
            <div className="mb-3 text-xs text-amber-600 border border-amber-200 bg-amber-50 rounded-lg p-2">
              Koneksi terputus. Pekerjaan Anda disimpan sebagai draf lokal.
            </div>
          )}

          {hasErrors && (
            <div className="mb-4 space-y-3">
              <h5 className="text-xs font-bold text-red-700 flex items-center gap-1">
                <AlertCircle size={12} /> Sinkronisasi Gagal
              </h5>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                {errorRecords.map((record) => (
                  <div key={record.id} className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs">
                    <div className="font-semibold text-slate-800 mb-1">{record.payload.topic || "Tanpa Topik"}</div>
                    <div className="text-red-600 mb-2">{record.error_message || "Terjadi kesalahan tidak diketahui."}</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => record.id && handleRetryError(record.id)}
                        className="flex items-center gap-1 rounded bg-white px-2 py-1 text-indigo-600 border border-slate-200 hover:bg-indigo-50 font-medium"
                      >
                        <RefreshCw size={12} /> Coba Lagi
                      </button>
                      <button
                        onClick={() => record.id && handleDeleteError(record.id)}
                        className="flex items-center gap-1 rounded bg-white px-2 py-1 text-red-600 border border-slate-200 hover:bg-red-50 font-medium"
                      >
                        <Trash2 size={12} /> Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pendingCount > 0 ? (
            <div className="space-y-3">
              <div className="text-xs text-slate-600">
                Ada <strong>{pendingCount}</strong> catatan kelas yang belum tersimpan di server.
              </div>
              <button
                onClick={handleSync}
                disabled={!online || isSyncing}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSyncing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Menyinkronkan...
                  </>
                ) : (
                  <>
                    <CloudUpload size={14} />
                    Sinkronkan Sekarang
                  </>
                )}
              </button>
            </div>
          ) : !hasErrors ? (
            <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
              <Check size={14} />
              Semua data tersinkronisasi.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
