"use client";

import { HardDrive, Trash2 } from "lucide-react";
import { useState } from "react";
import { clearTemanGuruDeviceData } from "@/lib/device-data";

export function DeviceDataClient() {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function clear(includeTheme: boolean) {
    const confirmed = window.confirm(includeTheme ? "Hapus seluruh data lokal Teman Guru termasuk tema dan wallpaper?" : "Hapus draft offline dan cache Teman Guru pada perangkat ini?");
    if (!confirmed) return;
    setBusy(true);
    try {
      await clearTemanGuruDeviceData({ includeTheme });
      setMessage(includeTheme ? "Data aplikasi, tema, dan wallpaper lokal sudah dihapus." : "Draft offline dan cache aplikasi sudah dihapus. Tema tetap tersimpan.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Data lokal belum berhasil dihapus.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {message ? <p role="status" className="rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface-muted)] p-3 text-sm">{message}</p> : null}
      <button type="button" disabled={busy} onClick={() => void clear(false)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[var(--tg-border)] px-4 font-bold"><HardDrive size={18} />Hapus draft & cache</button>
      <button type="button" disabled={busy} onClick={() => void clear(true)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 font-bold text-rose-700"><Trash2 size={18} />Hapus seluruh data perangkat</button>
    </div>
  );
}
