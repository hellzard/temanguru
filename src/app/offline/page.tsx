import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return <main className="grid min-h-dvh place-items-center px-4"><div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-50 text-amber-700"><WifiOff /></span><h1 className="mt-5 text-2xl font-bold text-slate-950">Kamu sedang offline</h1><p className="mt-3 text-slate-600">Halaman privat tidak disimpan di cache demi keamanan. Kembali setelah koneksi tersedia; draf lokal akan ditampilkan oleh fitur yang mendukungnya.</p><Link href="/dashboard" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-indigo-600 px-4 font-semibold text-white">Coba kembali</Link></div></main>;
}
