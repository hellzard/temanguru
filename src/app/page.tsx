import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Cloud,
  DatabaseBackup,
  HardDrive,
  KeyRound,
  LockKeyhole,
  WifiOff,
} from "lucide-react";
import { Logo } from "@/components/logo";

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

export default function HomePage() {
  return (
    <main className="min-h-dvh">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          <Link href="/workspace" className="hidden min-h-11 items-center rounded-xl px-4 text-sm font-semibold tg-muted hover:bg-[var(--tg-surface-muted)] sm:inline-flex">Tanpa login</Link>
          <Link href="/login?next=/workspace" className="tg-primary-button px-4 text-sm">Masuk</Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:px-8 lg:pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="inline-flex rounded-full border border-[var(--tg-border)] bg-[var(--tg-surface-alpha)] px-3 py-1 text-sm font-bold text-[var(--tg-primary)]">Login opsional · local-first</p>
          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">Pakai langsung. Login hanya saat kamu butuh sinkronisasi.</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 tg-muted">Teman Guru dapat dibuka tanpa akun. Data tersimpan otomatis di perangkat, dapat dibackup manual, dan bisa dipindahkan antarperangkat setelah login dengan email dan kata sandi.</p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
          {choices.map(({ icon: Icon, title, text, action, href, primary }) => (
            <article key={title} className="tg-card flex flex-col p-6 text-left">
              <span className="grid size-12 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--tg-primary)_12%,transparent)] text-[var(--tg-primary)]"><Icon size={24} /></span>
              <h2 className="mt-5 text-xl font-black">{title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 tg-muted">{text}</p>
              <Link href={href} className={`mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 font-bold ${primary ? "bg-[var(--tg-primary)] text-white" : "border border-[var(--tg-border)] bg-[var(--tg-surface)]"}`}>{action}<ArrowRight size={18} /></Link>
            </article>
          ))}
        </div>

        <ul className="mx-auto mt-8 grid max-w-4xl gap-3 text-sm sm:grid-cols-2">
          {["Tidak wajib membuat akun", "Email + kata sandi", "OTP untuk lupa sandi", "Backup JSON manual"].map((item) => <li key={item} className="flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-600" />{item}</li>)}
        </ul>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{features.map(({ icon: Icon, title, text }) => <article key={title} className="tg-card p-5"><Icon size={22} className="text-[var(--tg-primary)]" /><h3 className="mt-4 font-black">{title}</h3><p className="mt-2 text-sm leading-6 tg-muted">{text}</p></article>)}</div>
      </section>

      <footer className="border-t border-[var(--tg-border)] px-4 py-8 text-sm tg-muted"><div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} Teman Guru.</p><div className="flex gap-4"><Link href="/privacy">Privasi</Link><Link href="/terms">Ketentuan</Link><Link href="/workspace">Mulai</Link></div></div></footer>
    </main>
  );
}
