import Link from "next/link";
import { ArrowRight, BookOpenText, CalendarDays, ChartNoAxesColumnIncreasing, ClipboardCheck, Users } from "lucide-react";
import { Logo } from "@/components/logo";
import { MetricCard } from "@/components/dashboard/metric-card";

const classes = [
  { time: "07.00", name: "VIII A · Matematika", state: "Selesai" },
  { time: "09.00", name: "VIII B · Matematika", state: "Siap dicatat" },
  { time: "11.00", name: "VII C · Matematika", state: "Belum dimulai" },
];

export const metadata = { title: "Demo", robots: { index: false, follow: false } };

export default function DemoPage() {
  return (
    <main className="min-h-dvh px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between"><Logo /><Link href="/login" className="tg-primary-button">Masuk <ArrowRight size={17} /></Link></header>
        <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Ini adalah demo dengan data sintetis. Tidak ada data guru, murid, atau sekolah sungguhan.
        </div>
        <div className="mt-8"><p className="text-sm font-bold text-[var(--tg-primary)]">SENIN, 3 AGUSTUS 2026</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Selamat pagi, Bu Rina</h1><p className="mt-2 tg-muted">Lihat kelas berikutnya dan selesaikan pekerjaan paling mendesak.</p></div>
        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Kelas hari ini" value={3} icon={CalendarDays} />
          <MetricCard label="Murid aktif" value={96} icon={Users} />
          <MetricCard label="Presensi selesai" value="1/3" icon={ClipboardCheck} />
          <MetricCard label="Nilai tertunda" value={12} icon={ChartNoAxesColumnIncreasing} />
        </section>
        <section className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
          <div className="tg-card p-5 sm:p-6"><h2 className="text-lg font-bold">Jadwal hari ini</h2><div className="mt-5 space-y-3">{classes.map((item) => <article key={item.time} className="flex items-center gap-4 rounded-2xl border border-[var(--tg-border)] p-4"><span className="font-black text-[var(--tg-primary)]">{item.time}</span><div className="flex-1"><p className="font-semibold">{item.name}</p><p className="text-sm tg-muted">{item.state}</p></div></article>)}</div></div>
          <div className="tg-card p-5 sm:p-6"><BookOpenText className="text-[var(--tg-primary)]" /><h2 className="mt-4 text-lg font-bold">Satu catatan, banyak hasil</h2><p className="mt-2 text-sm leading-6 tg-muted">Catatan kelas menghasilkan presensi dan jurnal dalam satu transaksi. Data yang sama dapat dipakai untuk rekap dan laporan.</p></div>
        </section>
      </div>
    </main>
  );
}
