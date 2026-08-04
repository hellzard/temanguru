"use client";

import { useEffect, useState, useCallback } from "react";
import { CloudOff, CloudUpload, Check, XCircle, Loader2 } from "lucide-react";
import { getPendingRecords, removeRecord, markRecordError, markRecordSyncing } from "@/lib/offline-db";
import { syncClassRecord } from "@/app/(dashboard)/record/actions";

export function SyncStatus() {
  const [online, setOnline] = useState(() => {
    if (typeof window !== "undefined") {
      return navigator.onLine;
    }
    return true;
  });
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showPopover, setShowPopover] = useState(false);

  const checkPending = useCallback(() => {
    getPendingRecords()
      .then((records) => setPendingCount(records.length))
      .catch((e) => console.error("Failed to check pending records", e));
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
          attendance: record.payload.attendance,
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

  if (pendingCount === 0 && online) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowPopover(!showPopover)}
        className="flex items-center justify-center rounded-full bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
        title={pendingCount > 0 ? `${pendingCount} draf menunggu sinkronisasi` : "Offline"}
      >
        {!online ? (
          <CloudOff size={20} className="text-amber-600" />
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
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-lg z-50">
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
            <div className="mb-3 text-xs text-amber-600">
              Koneksi terputus. Pekerjaan Anda disimpan sebagai draf lokal.
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
          ) : (
            <div className="flex items-center gap-2 text-xs text-emerald-600">
              <Check size={14} />
              Semua data tersinkronisasi.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
