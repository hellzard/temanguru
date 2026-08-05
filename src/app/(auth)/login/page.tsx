import Link from "next/link";
import { Mail } from "lucide-react";
import { Logo } from "@/components/logo";
import { hasSupabaseEnv } from "@/lib/env";
import { sanitizeInternalPath } from "@/lib/auth/safe-redirect";
import { requestMagicLink } from "./actions";

export const metadata = {
  title: "Masuk",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawNext = typeof params.next === "string" ? params.next : null;
  const safeNext = sanitizeInternalPath(rawNext, "/onboarding");

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="tg-card w-full max-w-md p-6 sm:p-8">
        <Logo />
        <h1 className="mt-8 text-2xl font-bold">Masuk ke ruang kerja guru</h1>
        <p className="mt-2 text-sm leading-6 tg-muted">
          Kami mengirim tautan masuk ke email. Tidak perlu mengingat kata sandi baru.
        </p>

        {params.sent === "1" && (
          <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            Bila alamat dapat menerima email, tautan masuk akan segera tiba. Periksa kotak masuk dan spam.
          </p>
        )}

        {params.error && (
          <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            Permintaan belum berhasil. Coba kembali beberapa saat lagi.
          </p>
        )}

        {!hasSupabaseEnv ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Supabase lokal belum dikonfigurasi. Jalankan setup Docker lokal sebelum menguji autentikasi.
            <Link href="/" className="mt-3 flex min-h-11 items-center justify-center rounded-xl bg-amber-900 px-4 font-semibold text-white">
              Kembali ke beranda
            </Link>
          </div>
        ) : (
          <form action={requestMagicLink} className="mt-6 space-y-4">
            <input type="hidden" name="next" value={safeNext} />
            <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
              <label htmlFor="company">Perusahaan</label>
              <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-semibold">Email</label>
              <div className="relative mt-2">
                <Mail aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 text-slate-400" size={18} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="min-h-12 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] pl-10 pr-3 text-[var(--tg-text)] outline-none focus:border-[var(--tg-primary)]"
                  placeholder="guru@sekolah.id"
                />
              </div>
            </div>

            <button className="tg-primary-button w-full">Kirim tautan masuk</button>
          </form>
        )}

        <Link href="/" className="mt-6 block text-center text-sm font-semibold text-[var(--tg-primary)]">
          Kembali ke beranda
        </Link>
      </div>
    </main>
  );
}
