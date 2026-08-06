import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardCheck,
  Cloud,
  FileText,
  GraduationCap,
  Layers3,
  LockKeyhole,
  NotebookTabs,
  ShieldCheck,
  Sparkles,
  WifiOff,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { WorkflowShowcase } from "@/components/marketing/workflow-showcase";

const featureCards = [
  {
    icon: ClipboardCheck,
    eyebrow: "Presensi & sesi kelas",
    title: "Catat satu kali, lanjutkan pekerjaan tanpa mengulang.",
    text: "Presensi, topik, dan catatan kelas berada dalam alur yang saling terhubung.",
    className: "lg:col-span-2",
  },
  {
    icon: NotebookTabs,
    eyebrow: "Jurnal mengajar",
    title: "Jurnal tidak lagi menunggu sampai lupa.",
    text: "Lanjutkan draf, finalkan catatan, dan temukan riwayatnya dengan cepat.",
    className: "",
  },
  {
    icon: GraduationCap,
    eyebrow: "Kelas & murid",
    title: "Konteks kelas selalu dekat.",
    text: "Daftar kelas, murid, jadwal, dan aktivitas tidak tercecer di banyak tempat.",
    className: "",
  },
  {
    icon: FileText,
    eyebrow: "Nilai & dokumen",
    title: "Lihat pekerjaan yang belum selesai.",
    text: "Temukan nilai kosong dan dokumen yang perlu dilengkapi sebagai tindakan nyata.",
    className: "",
  },
  {
    icon: CalendarDays,
    eyebrow: "Agenda & operasional",
    title: "Kebutuhan sekolah tetap rapi.",
    text: "Agenda, rapat, inventaris, dan catatan operasional tinggal di ruang kerja yang sama.",
    className: "lg:col-span-2",
  },
];

const trustItems = [
  { icon: WifiOff, title: "Tetap berguna saat internet terbatas", text: "Ruang kerja lokal dapat dipakai tanpa menunggu koneksi stabil." },
  { icon: LockKeyhole, title: "Tidak dipaksa membuat akun", text: "Mulai di perangkatmu; akun hanya diperlukan saat kamu memilih sinkronisasi." },
  { icon: Cloud, title: "Backup sesuai kebutuhan", text: "Simpan cadangan manual atau gunakan akun untuk membuka data di perangkat lain." },
];

const steps = [
  { number: "01", title: "Mulai dari pekerjaan hari ini", text: "Buka ruang kerja tanpa formulir panjang dan pilih hal yang perlu diselesaikan." },
  { number: "02", title: "Catat dalam alur yang sama", text: "Presensi, jurnal, nilai, dokumen, dan agenda tetap terhubung dengan konteksnya." },
  { number: "03", title: "Simpan dengan caramu", text: "Gunakan perangkat secara lokal, buat backup, atau aktifkan sinkronisasi ketika perlu." },
];

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[620px]">
      <div
        aria-hidden="true"
        className="absolute -inset-8 -z-10 rounded-[44px] bg-[radial-gradient(circle_at_50%_20%,rgba(129,140,248,.32),transparent_48%),radial-gradient(circle_at_80%_80%,rgba(20,184,166,.22),transparent_42%)] blur-2xl"
      />

      <div className="overflow-hidden rounded-[32px] border border-white/15 bg-[#11162a] p-3 shadow-[0_42px_100px_-40px_rgba(15,23,42,.95)] sm:p-4">
        <div className="flex items-center justify-between px-2 pb-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-rose-400/80" />
            <span className="size-2.5 rounded-full bg-amber-300/80" />
            <span className="size-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <span className="rounded-full border border-white/10 bg-white/[.06] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Preview ruang kerja
          </span>
        </div>

        <div className="grid gap-3 rounded-[24px] bg-[#f6f7fb] p-3 text-slate-950 sm:grid-cols-[.34fr_.66fr] sm:p-4">
          <aside className="hidden rounded-[19px] border border-slate-200 bg-white p-3 sm:block">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-xl bg-indigo-600 text-white">
                <BookOpenText size={16} aria-hidden="true" />
              </span>
              <div>
                <div className="h-2 w-16 rounded bg-slate-900" />
                <div className="mt-1.5 h-1.5 w-12 rounded bg-slate-200" />
              </div>
            </div>
            <div className="mt-6 space-y-2">
              {["Hari ini", "Kelas", "Presensi", "Jurnal", "Nilai", "Dokumen"].map((item, index) => (
                <div
                  key={item}
                  className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-[10px] font-bold ${
                    index === 0 ? "bg-indigo-50 text-indigo-700" : "text-slate-500"
                  }`}
                >
                  <span className={`size-1.5 rounded-full ${index === 0 ? "bg-indigo-600" : "bg-slate-300"}`} />
                  {item}
                </div>
              ))}
            </div>
          </aside>

          <div className="min-w-0">
            <div className="rounded-[19px] bg-[linear-gradient(135deg,#4f46e5,#6d5dfc_52%,#0f766e_150%)] p-4 text-white">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-indigo-100">
                Rabu, 7 Agustus
              </p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-lg font-extrabold leading-tight tracking-[-0.04em]">
                Selamat pagi. Ada tiga hal penting hari ini.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["2 kelas", "1 jurnal draf", "6 nilai kosong"].map((item) => (
                  <span key={item} className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[9px] font-bold">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[18px] border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-extrabold text-slate-900">Jadwal berikutnya</p>
                  <CalendarDays size={14} className="text-indigo-600" />
                </div>
                <p className="mt-3 text-[18px] font-black tracking-[-0.04em]">07.00</p>
                <p className="mt-1 text-[10px] font-bold text-slate-700">Matematika · VIII B</p>
                <p className="mt-1 text-[9px] text-slate-400">Ruang 12</p>
              </div>

              <div className="rounded-[18px] border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-extrabold text-slate-900">Fokus hari ini</p>
                  <Sparkles size={14} className="text-amber-500" />
                </div>
                <div className="mt-3 space-y-2">
                  {["Finalkan jurnal", "Lengkapi nilai"].map((item, index) => (
                    <div key={item} className="flex items-center gap-2 text-[9px] font-bold text-slate-600">
                      <span className={`grid size-4 place-items-center rounded-full ${index === 0 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {index === 0 ? <Check size={10} /> : index + 1}
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-[18px] border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-extrabold">Catat kelas dalam satu alur</p>
                  <p className="mt-1 text-[9px] text-slate-400">Presensi · topik · catatan · tindak lanjut</p>
                </div>
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                  <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 -left-2 hidden items-center gap-2 rounded-2xl border border-white/70 bg-white/90 px-3 py-2 text-xs font-bold text-slate-700 shadow-xl backdrop-blur sm:flex">
        <ShieldCheck size={16} className="text-emerald-600" />
        Data tetap dalam kendalimu
      </div>
      <div className="absolute -right-3 top-[22%] hidden items-center gap-2 rounded-2xl border border-white/70 bg-white/90 px-3 py-2 text-xs font-bold text-slate-700 shadow-xl backdrop-blur md:flex">
        <Layers3 size={16} className="text-indigo-600" />
        Satu ruang kerja
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="tg-marketing-page min-h-dvh overflow-x-clip">
      <header className="sticky top-0 z-50 border-b border-white/50 bg-[color-mix(in_srgb,var(--tg-background)_76%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Logo />
          <nav aria-label="Navigasi landing page" className="hidden items-center gap-1 lg:flex">
            {[
              ["Manfaat", "#manfaat"],
              ["Cara kerja", "#cara-kerja"],
              ["Privasi data", "#privasi"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-bold text-[var(--tg-text-muted)] transition hover:bg-[var(--tg-primary-soft)] hover:text-[var(--tg-primary)]"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login?next=/dashboard"
              className="hidden min-h-11 items-center rounded-xl px-4 text-sm font-bold text-[var(--tg-text-muted)] transition hover:text-[var(--tg-primary)] sm:inline-flex"
            >
              Masuk
            </Link>
            <Link href="/workspace" className="tg-primary-button px-4 text-sm">
              Mulai sekarang
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative">
        <div aria-hidden="true" className="tg-hero-grid absolute inset-0 -z-20" />
        <div aria-hidden="true" className="absolute left-[-10%] top-[-16%] -z-10 size-[520px] rounded-full bg-indigo-400/20 blur-[110px]" />
        <div aria-hidden="true" className="absolute right-[-8%] top-[16%] -z-10 size-[480px] rounded-full bg-teal-300/18 blur-[110px]" />

        <div className="mx-auto grid max-w-[1400px] gap-14 px-4 pb-20 pt-16 sm:px-6 sm:pt-20 lg:grid-cols-[.94fr_1.06fr] lg:items-center lg:px-8 lg:pb-28 lg:pt-24">
          <div className="max-w-2xl">
            <div className="tg-animate-fade-up inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/75 px-3.5 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-700 shadow-sm backdrop-blur dark:border-indigo-400/20 dark:bg-white/5 dark:text-indigo-200">
              <Sparkles size={14} aria-hidden="true" />
              Satu ruang kerja untuk hari-hari mengajar
            </div>

            <h1 className="tg-animate-fade-up tg-delay-1 mt-7 font-[family-name:var(--font-display)] text-[clamp(2.85rem,6vw,5.7rem)] font-extrabold leading-[.96] tracking-[-0.065em] text-[var(--tg-text)]">
              Lebih sedikit urusan admin.
              <span className="mt-2 block bg-[linear-gradient(100deg,#4f46e5_0%,#7c3aed_45%,#0f766e_110%)] bg-clip-text text-transparent">
                Lebih banyak waktu untuk mengajar.
              </span>
            </h1>

            <p className="tg-animate-fade-up tg-delay-2 mt-7 max-w-xl text-base leading-8 text-[var(--tg-text-muted)] sm:text-lg">
              Presensi, jurnal, nilai, dokumen, agenda, dan kebutuhan kelas dalam satu tempat yang ringan—langsung bisa dipakai, bahkan tanpa akun.
            </p>

            <div className="tg-animate-fade-up tg-delay-3 mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/workspace" className="tg-primary-button min-h-13 px-6 text-base">
                Mulai tanpa login
                <ArrowRight size={19} aria-hidden="true" />
              </Link>
              <Link
                href="#cara-kerja"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-[14px] border border-[var(--tg-border)] bg-[var(--tg-surface-alpha)] px-6 text-base font-extrabold text-[var(--tg-text)] shadow-[var(--tg-shadow-sm)] transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-[var(--tg-shadow-md)]"
              >
                Lihat cara kerjanya
                <ChevronRight size={19} aria-hidden="true" />
              </Link>
            </div>

            <div className="tg-animate-fade-up tg-delay-4 mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-[var(--tg-text-muted)] sm:text-sm">
              {["Data tetap di perangkat", "Backup kapan saja", "Sinkronisasi opsional"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <span className="grid size-5 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                    <Check size={12} aria-hidden="true" />
                  </span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="tg-animate-fade-up tg-delay-3">
            <ProductPreview />
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--tg-border)] bg-[color-mix(in_srgb,var(--tg-surface)_72%,transparent)]">
        <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:px-8">
          <p className="font-[family-name:var(--font-display)] text-xl font-extrabold tracking-[-0.035em] sm:text-2xl">
            Bukan aplikasi administrasi yang menambah administrasi.
          </p>
          <p className="leading-7 text-[var(--tg-text-muted)]">
            Teman Guru dirancang agar pekerjaan harian terasa seperti satu alur: lihat yang penting, catat seperlunya, lalu lanjut mengajar.
          </p>
        </div>
      </section>

      <section id="manfaat" className="scroll-mt-24">
        <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid gap-7 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--tg-primary)]">
                Dibangun mengikuti ritme guru
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-[-0.05em] sm:text-5xl">
                Semua yang penting, tanpa terasa sesak.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-8 text-[var(--tg-text-muted)] lg:justify-self-end">
              Setiap bagian menampilkan tindakan yang masuk akal untuk konteksnya—bukan dashboard penuh angka yang tidak membantu mengambil keputusan.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {featureCards.map(({ icon: Icon, eyebrow, title, text, className }, index) => (
              <article
                key={title}
                className={`tg-bento-card group min-h-[250px] p-6 ${className}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-11 place-items-center rounded-2xl bg-[var(--tg-primary-soft)] text-[var(--tg-primary)] transition duration-300 group-hover:-rotate-3 group-hover:scale-110">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <span className="text-xs font-black text-[var(--tg-text-muted)]/50">
                    0{index + 1}
                  </span>
                </div>
                <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--tg-primary)]">
                  {eyebrow}
                </p>
                <h3 className="mt-3 max-w-lg font-[family-name:var(--font-display)] text-xl font-extrabold tracking-[-0.035em] sm:text-2xl">
                  {title}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--tg-text-muted)]">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="cara-kerja" className="scroll-mt-24 bg-[color-mix(in_srgb,var(--tg-surface-muted)_70%,transparent)]">
        <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--tg-primary)]">
              Dari pagi sampai administrasi selesai
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-[-0.05em] sm:text-5xl">
              Ruang kerja yang mengikuti alur, bukan memecahnya.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--tg-text-muted)]">
              Pilih waktu dalam hari kerja untuk melihat bagaimana Teman Guru menampilkan hal yang relevan.
            </p>
          </div>

          <div className="mt-12">
            <WorkflowShowcase />
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {steps.map((item) => (
              <article key={item.number} className="rounded-[26px] border border-[var(--tg-border)] bg-[var(--tg-surface-alpha)] p-6">
                <span className="font-[family-name:var(--font-display)] text-3xl font-extrabold text-[var(--tg-primary)]">
                  {item.number}
                </span>
                <h3 className="mt-5 text-lg font-extrabold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--tg-text-muted)]">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="privasi" className="scroll-mt-24">
        <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="overflow-hidden rounded-[36px] border border-white/10 bg-[#11162a] p-6 text-white shadow-[0_36px_90px_-45px_rgba(15,23,42,.9)] sm:p-10 lg:p-12">
            <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.07] px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-200">
                  <ShieldCheck size={15} />
                  Kendali data yang jelas
                </span>
                <h2 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-[-0.05em] sm:text-5xl">
                  Mulai sederhana. Sinkronkan hanya saat dibutuhkan.
                </h2>
                <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
                  Pilihan teknis tetap penting, tetapi tidak perlu menghalangi guru untuk mencoba dan memahami manfaat produk.
                </p>
              </div>

              <div className="grid gap-3">
                {trustItems.map(({ icon: Icon, title, text }) => (
                  <article key={title} className="flex gap-4 rounded-[22px] border border-white/10 bg-white/[.06] p-4 backdrop-blur">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-indigo-400/15 text-indigo-200">
                      <Icon size={21} aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-extrabold">{title}</h3>
                      <p className="mt-1.5 text-sm leading-6 text-slate-400">{text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
        <div className="mx-auto max-w-[1400px] overflow-hidden rounded-[36px] border border-indigo-200/60 bg-[linear-gradient(135deg,rgba(238,242,255,.96),rgba(255,255,255,.94)_48%,rgba(236,253,245,.9))] p-7 text-center shadow-[0_28px_80px_-45px_rgba(79,70,229,.45)] dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(79,70,229,.16),rgba(17,24,39,.96),rgba(15,118,110,.13))] sm:p-12">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--tg-primary)]">
            Teman untuk pekerjaan yang sering tidak terlihat
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-[-0.05em] sm:text-5xl">
            Hari mengajar lebih rapi. Pikiran juga.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-[var(--tg-text-muted)]">
            Masuk ke ruang kerja lokal sekarang. Tidak perlu membuat akun untuk memulai.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/workspace" className="tg-primary-button min-h-13 px-7 text-base">
              Mulai tanpa login
              <ArrowRight size={19} />
            </Link>
            <Link
              href="/login?next=/dashboard"
              className="inline-flex min-h-13 items-center justify-center rounded-[14px] border border-[var(--tg-border)] bg-[var(--tg-surface)] px-7 text-base font-extrabold transition hover:-translate-y-0.5 hover:shadow-[var(--tg-shadow-md)]"
            >
              Masuk ke akun
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--tg-border)] bg-[color-mix(in_srgb,var(--tg-surface)_72%,transparent)]">
        <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] md:items-end lg:px-8">
          <div>
            <Logo />
            <p className="mt-4 max-w-md text-sm leading-6 text-[var(--tg-text-muted)]">
              Ruang kerja harian untuk membantu guru merapikan pekerjaan administrasi tanpa menambah kerumitan.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-bold text-[var(--tg-text-muted)]">
            <Link href="/privacy" className="transition hover:text-[var(--tg-primary)]">Privasi</Link>
            <Link href="/terms" className="transition hover:text-[var(--tg-primary)]">Ketentuan</Link>
            <Link href="/workspace" className="transition hover:text-[var(--tg-primary)]">Mulai</Link>
          </div>
          <p className="text-xs text-[var(--tg-text-muted)] md:col-span-2">
            © {new Date().getFullYear()} Teman Guru. Dibuat untuk ritme kerja guru Indonesia.
          </p>
        </div>
      </footer>
    </main>
  );
}
