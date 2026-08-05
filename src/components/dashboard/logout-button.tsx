"use client";

import { LogOut, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { clearTemanGuruDeviceData } from "@/lib/device-data";
import { getPendingRecords } from "@/lib/offline-db";

async function confirmUnsyncedDrafts(): Promise<boolean> {
  const records = await getPendingRecords();
  if (records.length === 0) return true;

  return window.confirm(
    `Ada ${records.length} draft yang belum tersinkron. Keluar sekarang akan menghapus draft lokal tersebut. Lanjutkan?`,
  );
}

async function signOut(includeTheme: boolean) {
  if (!(await confirmUnsyncedDrafts())) return;

  try {
    await clearTemanGuruDeviceData({ includeTheme });
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Logout cleanup failed", error);
  } finally {
    window.location.assign("/login");
  }
}

export function LogoutButton() {
  return (
    <div>
      <button
        onClick={() => void signOut(false)}
        className="flex w-full items-center px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
      >
        <LogOut size={16} className="mr-2" />
        Keluar
      </button>
      <button
        onClick={() => void signOut(true)}
        className="flex w-full items-center px-4 py-2 text-xs text-[var(--tg-text-muted)] hover:bg-[var(--tg-surface-muted)]"
      >
        <Trash2 size={15} className="mr-2" />
        Keluar & hapus tema perangkat
      </button>
    </div>
  );
}
