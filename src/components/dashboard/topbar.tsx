import { Bell, Menu } from "lucide-react";
import { Logo } from "@/components/logo";
import { SyncStatus } from "./sync-status";

export function Topbar() {
  return (
    <header className="flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      <div className="lg:hidden"><Logo compact /><span className="sr-only">Teman Guru</span></div>
      <div className="hidden lg:block"><p className="text-sm text-slate-500">Tahun Ajaran 2026/2027</p></div>
      <div className="flex items-center gap-2">
        <SyncStatus />
        <button aria-label="Buka notifikasi" className="grid size-11 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"><Bell size={20} /></button>
        <button aria-label="Buka menu akun" className="grid size-11 place-items-center rounded-full bg-indigo-100 font-semibold text-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600">A</button>
        <button aria-label="Buka menu" className="grid size-11 place-items-center rounded-xl text-slate-600 lg:hidden"><Menu size={20} /></button>
      </div>
    </header>
  );
}
