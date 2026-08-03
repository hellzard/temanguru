import Link from "next/link";
import { Mail } from "lucide-react";
import { Logo } from "@/components/logo";
import { hasSupabaseEnv } from "@/lib/env";
import { requestMagicLink } from "./actions";

export const metadata = { title: "Masuk" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
        <Logo />
        <h1 className="mt-8 text-2xl font-bold text-slate-950">Masuk ke ruang kerja guru</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Kami mengirim tautan masuk ke email. Tidak perlu mengingat kata sandi baru.</p>
        {params.sent === "1" && <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">Tautan masuk sudah dikirim. Periksa kotak masuk dan spam.</p>}
        {params.error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-800">Permintaan gagal. Periksa email dan konfigurasi Supabase.</p>}
        {!hasSupabaseEnv ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Supabase belum dikonfigurasi. Gunakan demo dashboard atau isi `.env.local`.
            <Link href="/dashboard" className="mt-3 flex min-h-11 items-center justify-center rounded-xl bg-amber-900 px-4 font-semibold text-white">Buka demo dashboard</Link>
          </div>
        ) : (
          <form action={requestMagicLink} className="mt-6 space-y-4">
            <div><label htmlFor="email" className="text-sm font-semibold text-slate-800">Email</label><div className="relative mt-2"><Mail aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 text-slate-400" size={18} /><input id="email" name="email" type="email" autoComplete="email" required className="min-h-12 w-full rounded-xl border border-slate-300 pl-10 pr-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" placeholder="guru@sekolah.id" /></div></div>
            <button className="min-h-12 w-full rounded-xl bg-indigo-600 px-4 font-semibold text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600">Kirim tautan masuk</button>
          </form>
        )}
        <Link href="/" className="mt-6 block text-center text-sm font-semibold text-indigo-700">Kembali ke beranda</Link>
      </div>
    </main>
  );
}
