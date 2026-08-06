"use client";

import { useEffect, useState } from "react";
import { CloudOff, RefreshCw } from "lucide-react";
import { getPendingRecords, updateOutboxRecord, removeOutboxRecord } from "@/lib/offline-db";
import { saveClassRecord } from "@/app/(dashboard)/record/actions";

export default function SyncStatus() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  );

  const checkPending = async () => {
    try {
      const records = await getPendingRecords();
      setPendingCount(records.length);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    // Custom event to refresh when new drafts are added
    window.addEventListener("sync-status-changed", checkPending);
     
    checkPending();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("sync-status-changed", checkPending);
    };
  }, []);

  const handleSync = async () => {
    if (!isOnline) return;
    setIsSyncing(true);
    try {
      const records = await getPendingRecords();
      for (const record of records) {
        if (!record.id) continue;
        
        await updateOutboxRecord(record.id, { status: "syncing" });
        
        const fd = new FormData();
        fd.append("assignment_id", record.payload.assignment_id);
        fd.append("date", record.payload.date);
        fd.append("attendance", JSON.stringify(record.payload.attendance));
        fd.append("topic", record.payload.topic);
        fd.append("activity_summary", record.payload.activity_summary);
        fd.append("reflection", record.payload.reflection);
        fd.append("obstacle", record.payload.obstacle);
        fd.append("follow_up", record.payload.follow_up);

        const result = await saveClassRecord(null, fd);
        
        if (result.error) {
          await updateOutboxRecord(record.id, { status: "error", error_message: result.error });
        } else {
          await removeOutboxRecord(record.id);
        }
      }
    } finally {
      setIsSyncing(false);
      checkPending();
    }
  };

  if (pendingCount === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl bg-amber-50 p-3 pr-4 shadow-lg border border-amber-200 text-amber-900">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
        <CloudOff size={18} className="text-amber-700" />
      </div>
      <div>
        <p className="text-sm font-semibold">{pendingCount} Catatan Tertunda</p>
        <p className="text-xs text-amber-700/80">
          {isOnline ? "Koneksi tersedia." : "Koneksi terputus."}
        </p>
      </div>
      {isOnline && (
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="ml-2 flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-700 disabled:opacity-60"
        >
          <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
          {isSyncing ? "Sinkron..." : "Sinkronisasi"}
        </button>
      )}
    </div>
  );
}
