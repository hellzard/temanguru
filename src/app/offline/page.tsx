import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata = { title: "Offline", robots: { index: false, follow: false } };

export default function OfflinePage() {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="tg-card max-w-md p-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-50 text-amber-700"><WifiOff /></span>
        <h1 className="mt-5 text-2xl font-bold">Kamu sedang offline</h1>
        <p className="mt-3 leading-6 tg-muted">Ruang kerja lokal tetap dapat digunakan setelah shell aplikasi pernah tersimpan. Login dan sinkronisasi cloud menunggu koneksi kembali.</p>
        <Link href="/workspace" className="tg-primary-button mt-6">Buka ruang kerja lokal</Link>
      </div>
    </main>
  );
}
