import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { FormMessage } from "@/components/dashboard/form-message";
import { PageHeader } from "@/components/dashboard/page-header";
import { SubmitButton } from "@/components/dashboard/submit-button";
import { firstParam } from "@/lib/action-result";
import { relationText } from "@/lib/relations";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";
import { createClass } from "./actions";

export const metadata = { title: "Kelas", robots: { index: false, follow: false } };

export default async function ClassesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const context = await requireActiveSchool();
  const supabase = await createClient();
  const [{ data: years, error: yearError }, { data: classes, error: classError }] = await Promise.all([
    supabase.from("academic_years").select("id,name,is_active").eq("school_id", context.active.schoolId).order("starts_on", { ascending: false }),
    supabase.from("classes").select("id,name,grade_level,academic_years(name),class_students(count)").eq("school_id", context.active.schoolId).is("archived_at", null).order("name"),
  ]);
  if (yearError || classError) throw yearError ?? classError;

  const rows = (classes ?? []) as Array<Record<string, unknown>>;
  const yearRows = (years ?? []) as Array<Record<string, unknown>>;
  const canManage = ["owner", "admin"].includes(context.active.role);

  return (
    <div>
      <PageHeader title="Kelas" description="Kelola kelas, murid, Focus Mode, dan pembagian kelompok." />
      <div className="mt-7 grid gap-6 xl:grid-cols-[.7fr_1.3fr]">
        {canManage ? (
          <section className="tg-card p-5">
            <h2 className="font-bold">Tambah kelas</h2>
            <form action={createClass} className="mt-5 space-y-4">
              <FormMessage error={firstParam(params.error)} success={firstParam(params.success)} />
              <label className="block text-sm font-bold">Tahun ajaran<select name="academic_year_id" required className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3"><option value="">Pilih tahun</option>{yearRows.map((year) => <option key={String(year.id)} value={String(year.id)}>{String(year.name)}{year.is_active ? " · aktif" : ""}</option>)}</select></label>
              <label className="block text-sm font-bold">Nama kelas<input name="name" required placeholder="VIII A" className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" /></label>
              <label className="block text-sm font-bold">Tingkat<input name="grade_level" placeholder="8" className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" /></label>
              <SubmitButton>Simpan</SubmitButton>
            </form>
          </section>
        ) : <div className="tg-card p-5 text-sm tg-muted">Guru dapat membuka kelas yang terkait dengan penugasannya.</div>}

        <section>
          {rows.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {rows.map((row) => {
                const counts = row.class_students as Array<{ count?: number }> | null;
                return (
                  <Link key={String(row.id)} href={`/classes/${String(row.id)}`} className="tg-card p-5 transition hover:-translate-y-0.5 hover:border-[var(--tg-primary)]">
                    <div className="flex items-center justify-between"><span className="grid size-11 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--tg-primary)_12%,transparent)] text-[var(--tg-primary)]"><GraduationCap size={21} /></span><span className="text-sm font-bold tg-muted">{counts?.[0]?.count ?? 0} murid</span></div>
                    <h2 className="mt-4 font-bold">{String(row.name)}</h2>
                    <p className="mt-1 text-sm tg-muted">Tahun {relationText(row.academic_years, "name", "—")}{row.grade_level ? ` · Tingkat ${String(row.grade_level)}` : ""}</p>
                  </Link>
                );
              })}
            </div>
          ) : <EmptyState icon={GraduationCap} title="Belum ada kelas" description="Buat tahun ajaran dan kelas pertama untuk melanjutkan." />}
        </section>
      </div>
    </div>
  );
}
