import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { resolveActiveSchool } from "@/lib/schools/active-school";
import { selectActiveSchool } from "./actions";

export const metadata = {
  title: "Pilih Sekolah",
  robots: { index: false, follow: false },
};

export default async function SelectSchoolPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const context = await resolveActiveSchool();

  if (context.status === "unauthenticated") redirect("/login?next=/school/select");
  if (context.status === "no-membership") redirect("/onboarding");
  if (context.status === "ready") redirect("/dashboard");

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <section className="tg-card w-full max-w-2xl p-6 sm:p-8">
        <Logo />
        <h1 className="mt-8 text-2xl font-bold">Pilih ruang kerja sekolah</h1>
        <p className="mt-2 text-sm leading-6 tg-muted">
          Akun Anda terhubung ke lebih dari satu sekolah. Pilihan ini dapat diganti kembali nanti.
        </p>

        {params.error && (
          <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            Sekolah belum dapat dipilih. Pastikan keanggotaan Anda masih aktif.
          </p>
        )}

        <div className="mt-6 grid gap-3">
          {context.memberships.map((membership) => (
            <form key={membership.id} action={selectActiveSchool}>
              <input type="hidden" name="school_id" value={membership.schoolId} />
              <button
                type="submit"
                className="flex min-h-20 w-full items-center gap-4 rounded-2xl border border-[var(--tg-border)] bg-[var(--tg-surface)] p-5 text-left hover:border-[var(--tg-primary)]"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--tg-primary)_12%,transparent)] text-[var(--tg-primary)]">
                  <Building2 size={23} aria-hidden="true" />
                </span>
                <span>
                  <strong className="block text-base">{membership.schoolName}</strong>
                  <span className="mt-1 block text-sm tg-muted">Peran: {membership.role}</span>
                </span>
              </button>
            </form>
          ))}
        </div>
      </section>
    </main>
  );
}
