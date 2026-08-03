import { redirect } from "next/navigation";
import { Building2, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createSchool } from "./actions";

export const metadata = { title: "Siapkan sekolah" };

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  if (!hasSupabaseEnv) {
    return (
      <main className="grid min-h-dvh place-items-center px-4 py-10">
        <section className="w-full max-w-xl rounded-3xl border border-amber-200 bg-white p-6 shadow-xl sm:p-8">
          <Logo />
          <h1 className="mt-8 text-2xl font-bold text-slate-950">Supabase belum dikonfigurasi</h1>
          <p className="mt-3 leading-7 text-slate-600">
            Salin <code>.env.example</code> menjadi <code>.env.local</code>, isi URL dan publishable key,
            lalu jalankan migrasi di folder <code>supabase/migrations</code>.
          </p>
        </section>
      </main>
    );
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/login");

  const { data: membership } = await supabase
    .from("school_members")
    .select("school_id")
    .eq("user_id", claimsData.claims.sub)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (membership?.school_id) redirect("/dashboard");

  return (
    <main className="grid min-h-dvh place-items-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
        <Logo />
        <div className="mt-8 flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-indigo-700">
            <Building2 aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold text-indigo-700">Langkah awal</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">Buat ruang kerja sekolah</h1>
            <p className="mt-2 leading-7 text-slate-600">
              Data ini menjadi tenant utama untuk kelas, guru, murid, dokumen, dan hak akses.
            </p>
          </div>
        </div>

        {params.error && (
          <p role="alert" className="mt-6 rounded-xl bg-red-50 p-3 text-sm text-red-800">
            Sekolah belum berhasil dibuat. Periksa data dan migrasi Supabase.
          </p>
        )}

        <form action={createSchool} className="mt-7 space-y-5">
          <div>
            <label htmlFor="schoolName" className="text-sm font-semibold text-slate-800">
              Nama sekolah
            </label>
            <input
              id="schoolName"
              name="schoolName"
              required
              minLength={2}
              maxLength={180}
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              placeholder="Contoh: SMP Negeri 1"
            />
          </div>

          <div>
            <label htmlFor="timezone" className="text-sm font-semibold text-slate-800">
              Zona waktu
            </label>
            <select
              id="timezone"
              name="timezone"
              defaultValue="Asia/Jakarta"
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            >
              <option value="Asia/Jakarta">WIB — Asia/Jakarta</option>
              <option value="Asia/Makassar">WITA — Asia/Makassar</option>
              <option value="Asia/Jayapura">WIT — Asia/Jayapura</option>
            </select>
          </div>

          <ul className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
            {[
              "Akunmu otomatis menjadi pemilik ruang kerja.",
              "Kamu dapat menambah anggota setelah fondasi peran selesai.",
              "Data murid minimum dan RLS tetap wajib.",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-emerald-600" size={17} />
                {item}
              </li>
            ))}
          </ul>

          <button className="min-h-12 w-full rounded-xl bg-indigo-600 px-4 font-semibold text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            Buat ruang kerja
          </button>
        </form>
      </section>
    </main>
  );
}
