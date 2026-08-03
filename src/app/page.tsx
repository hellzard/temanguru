import Link from "next/link";
import { ArrowRight, BookOpenCheck, CheckCircle2, ClipboardCheck, FileSpreadsheet, WifiOff } from "lucide-react";
import { Logo } from "@/components/logo";

const features = [
  { icon: ClipboardCheck, title: "Presensi cepat", text: "Semua hadir secara default, ubah hanya pengecualian." },
  { icon: BookOpenCheck, title: "Jurnal terhubung", text: "Jadwal, kelas, mata pelajaran, dan presensi dapat mengisi konteks otomatis." },
  { icon: FileSpreadsheet, title: "Ekspor terbuka", text: "Unduh CSV dan laporan tanpa mengunci data di satu platform." },
  { icon: WifiOff, title: "Tahan koneksi lemah", text: "PWA dan draf lokal dirancang untuk kondisi internet tidak stabil." },
];

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_left,#e0e7ff,transparent_35%),linear-gradient(#ffffff,#f7f8fc)]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Logo />
        <Link href="/login" className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600">Masuk</Link>
      </header>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8 lg:pb-24">
        <div>
          <p className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">Starter terbuka untuk prototipe dan pilot</p>
          <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">Catat sekali. Jurnal, nilai, dan laporan ikut rapi.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Teman Guru mendampingi guru mengelola pekerjaan harian tanpa mengisi data yang sama berkali-kali. Bukan pengganti sistem resmi—melainkan ruang kerja yang lebih ringan dan rapi.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600">Lihat demo dashboard <ArrowRight size={18} /></Link>
            <a href="#fitur" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 font-semibold text-slate-800 hover:bg-slate-50">Jelajahi fitur</a>
          </div>
          <ul className="mt-8 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            {["Mobile-first", "Data murid minimum", "Ekspor CSV", "Tanpa AI pada fase awal"].map((item) => <li key={item} className="flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-600" />{item}</li>)}
          </ul>
        </div>
        <div className="rounded-[2rem] border border-white/80 bg-white/80 p-3 shadow-2xl shadow-indigo-200/40 backdrop-blur">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 sm:p-6">
            <div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">Selamat malam, Bu Rina</p><p className="mt-1 text-xl font-bold text-slate-950">Kegiatan hari ini</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">3 kelas</span></div>
            <div className="mt-5 space-y-3">
              {[['07.00','VIII A','Presensi selesai'],['09.00','VIII B','Isi presensi'],['11.00','VII C','Belum dimulai']].map(([time, cls, state], index) => <div key={cls} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4"><span className="text-sm font-bold text-indigo-700">{time}</span><div className="min-w-0 flex-1"><p className="font-semibold text-slate-950">{cls} · Matematika</p><p className="text-sm text-slate-500">{state}</p></div><span className={`size-3 rounded-full ${index === 0 ? 'bg-emerald-500' : index === 1 ? 'bg-amber-500' : 'bg-slate-300'}`} /></div>)}
            </div>
          </div>
        </div>
      </section>
      <section id="fitur" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl"><p className="text-sm font-bold text-indigo-700">Dibangun dari alur kerja guru</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Bukan dashboard yang hanya penuh grafik.</h2><p className="mt-3 text-slate-600">Setiap bagian harus membantu guru mengambil tindakan berikutnya.</p></div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{features.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><span className="grid size-11 place-items-center rounded-2xl bg-indigo-50 text-indigo-700"><Icon size={22} /></span><h3 className="mt-5 font-bold text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>)}</div>
      </section>
    </main>
  );
}
