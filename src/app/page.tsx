import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Cloud,
  DatabaseBackup,
  HardDrive,
  KeyRound,
  LockKeyhole,
  Sparkles,
  WifiOff,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { AmbientBackground } from "@/components/decorative/ambient-background";

const choices = [
  {
    icon: HardDrive,
    title: "Pakai tanpa login",
    text: "Semua data disimpan di perangkat. Cocok untuk mencoba, penggunaan pribadi, dan kondisi internet terbatas.",
    action: "Buka ruang kerja lokal",
    href: "/workspace",
    primary: true,
  },
  {
    icon: Cloud,
    title: "Login untuk sinkron",
    text: "Masuk memakai email dan kata sandi agar backup cloud dapat dibuka kembali di perangkat lain.",
    action: "Masuk atau daftar",
    href: "/login?next=/workspace",
    primary: false,
  },
];

const features = [
  { icon: WifiOff, title: "Tetap berjalan offline", text: "Kelas, murid, presensi, jurnal, nilai, dokumen, agenda, dan inventaris tersimpan lokal." },
  { icon: DatabaseBackup, title: "Backup manual", text: "Unduh satu file JSON dan pulihkan kapan saja tanpa akun." },
  { icon: LockKeyhole, title: "Akun bersifat pilihan", text: "Login tidak mengunci fitur. Akun hanya menambah sinkronisasi antarperangkat." },
  { icon: KeyRound, title: "Pemulihan dengan OTP", text: "Lupa sandi menggunakan kode sekali pakai yang dikirim ke email, bukan magic link." },
];

const trustItems = ["Tidak wajib membuat akun", "Email + kata sandi", "OTP untuk lupa sandi", "Backup JSON manual"];

const steps = [
  { step: "01", title: "Buka ruang kerja", text: "Langsung masuk ke /workspace, tanpa formulir dan tanpa akun." },
  { step: "02", title: "Catat kesehariannya", text: "Presensi, jurnal mengajar, nilai, dan dokumen tersimpan otomatis di perangkat." },
  { step: "03", title: "Backup bila perlu", text: "Ekspor JSON kapan saja, atau login untuk sinkron otomatis antarperangkat." },
];

export default function HomePage() {
  return (
    <main className="relative min-h-dvh overflow-x-clip">
      <header className="tg-glass-nav sticky top-0 z-40 border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Logo />
          <div className="flex items-center gap-2">
            <Link
              href="/workspace"
              className="hidden min-h-11 items-center rounded-xl px-4 text-sm font-semibold tg-muted transition hover:bg-[var(--tg-primary-soft)] hover:text-[var(--tg-primary)] sm:inline-flex"
            >
              Tanpa login
            </Link>
            <Link href="/login?next=/workspace" className="tg-primary-button px-4 text-sm">
              Masuk
            </Link>
          </div>
        </div>
      </header>

      <section className="relative">
        <AmbientBackground variant="hero" />
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:pb-24">
          <div className="mx-auto max-w-4xl text-center">
            <p className="tg-animate-fade-up inline-flex items-center gap-2 rounded-full border border-[var(--tg-border)] bg-[var(--tg-surface-alpha)] px-3.5 py-1.5 text-sm font-bold text-[var(--tg-primary)] shadow-[var(--tg-shadow-sm)] backdrop-blur">
              <span className="relative flex size-2">
                <span className="tg-pulse-dot absolute inline-flex size-2 rounded-full bg-[var(--tg-primary)]" />
                <span className="relative inline-flex size-2 rounded-full bg-[var(--tg-primary)]" />
              </span>
              Login opsional · local-first
              <Sparkles size={14} aria-hidden="true" />
            </p>

            <h1 className="tg-animate-fade-up tg-delay-1 mt-6 text-4xl font-black tracking-tight sm:text-6xl">
              Pakai langsung. <span className="tg-gradient-text">Login hanya saat kamu butuh sinkronisasi.</span>
            </h1>

            <p className="tg-animate-fade-up tg-delay-2 mx-auto mt-6 max-w-3xl text-lg leading-8 tg-muted">
              Teman Guru dapat dibuka tanpa akun. Data tersimpan otomatis di perangkat, dapat dibackup manual, dan bisa
              dipindahkan antarperangkat setelah login dengan email dan kata sandi.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
            {choices.map(({ icon: Icon, title, text, action, href, primary }, index) => (
              <article
                key={title}
                className={`tg-card tg-card-interactive tg-card-accent tg-animate-fade-up group flex flex-col p-6 text-left ${
                  index === 0 ? "tg-delay-3" : "tg-delay-4"
                } ${primary ? "ring-1 ring-[var(--tg-primary)]/25" : ""}`}
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-[var(--tg-primary-soft)] text-[var(--tg-primary)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Icon size={24} aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-xl font-black">{title}</h2>
                <p className="mt-2 flex-1 text-sm leading-6 tg-muted">{text}</p>
                <Link
                  href={href}
                  className={`mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 font-bold transition-all duration-200 ${
                    primary
                      ? "bg-[linear-gradient(135deg,var(--tg-primary),var(--tg-primary-strong))] text-white shadow-[var(--tg-shadow-glow)] hover:shadow-[var(--tg-shadow-glow-lg)]"
                      : "border border-[var(--tg-border)] bg-[var(--tg-surface)] hover:border-[color-mix(in_srgb,var(--tg-primary)_35%,var(--tg-border))]"
                  }`}
                >
                  {action}
                  <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </article>
            ))}
          </div>

          <ul className="tg-animate-fade-up tg-delay-5 mx-auto mt-8 grid max-w-4xl gap-3 text-sm sm:grid-cols-2">
            {trustItems.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface-alpha)] px-3 py-2 backdrop-blur"
              >
                <CheckCircle2 size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="tg-card grid gap-0 overflow-hidden p-0 sm:grid-cols-3">
          {steps.map(({ step, title, text }, index) => (
            <div
              key={step}
              className={`p-6 sm:p-7 ${index !== steps.length - 1 ? "border-b border-[var(--tg-border)] sm:border-b-0 sm:border-r" : ""}`}
            >
              <span className="tg-gradient-text text-3xl font-black">{step}</span>
              <h3 className="mt-3 font-black">{title}</h3>
              <p className="mt-1.5 text-sm leading-6 tg-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold text-[var(--tg-primary)]">Dibangun untuk keseharian guru</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Ringan, offline-first, dan tidak memaksa login</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }, index) => (
            <article
              key={title}
              className="tg-card tg-card-interactive tg-card-accent tg-animate-fade-up group p-5"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <span className="grid size-11 place-items-center rounded-2xl bg-[var(--tg-primary-soft)] text-[var(--tg-primary)] transition-transform duration-300 group-hover:scale-110">
                <Icon size={22} aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 tg-muted">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="tg-card relative overflow-hidden p-8 text-center sm:p-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 80% at 50% 0%, var(--tg-primary-soft), transparent)",
            }}
          />
          <h2 className="relative text-2xl font-black tracking-tight sm:text-3xl">Siap dicoba tanpa risiko?</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sm leading-6 tg-muted sm:text-base">
            Tidak ada formulir panjang. Buka ruang kerja lokal sekarang, dan tambahkan akun kapan pun kamu siap.
          </p>
          <div className="relative mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/workspace" className="tg-primary-button px-6 text-sm">
              Buka ruang kerja lokal
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/login?next=/workspace"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-6 text-sm font-bold transition hover:border-[color-mix(in_srgb,var(--tg-primary)_35%,var(--tg-border))]"
            >
              Masuk atau daftar
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--tg-border)] px-4 py-8 text-sm tg-muted">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Teman Guru.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="transition hover:text-[var(--tg-primary)]">Privasi</Link>
            <Link href="/terms" className="transition hover:text-[var(--tg-primary)]">Ketentuan</Link>
            <Link href="/workspace" className="transition hover:text-[var(--tg-primary)]">Mulai</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
