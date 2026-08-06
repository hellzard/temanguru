import Link from "next/link";
import { notFound } from "next/navigation";
import { FileUp, Focus, Shuffle, UserRound } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { FormMessage } from "@/components/dashboard/form-message";
import { PageHeader } from "@/components/dashboard/page-header";
import { SubmitButton } from "@/components/dashboard/submit-button";
import { firstParam } from "@/lib/action-result";
import { relationObject, relationText } from "@/lib/relations";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";
import { addStudentToClass } from "./actions";

export const metadata = { title: "Detail Kelas", robots: { index: false, follow: false } };

export default async function ClassDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ classId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { classId } = await params;
  const query = await searchParams;
  const context = await requireActiveSchool();
  const supabase = await createClient();
  const [{ data: classData, error: classError }, { data: memberData, error: memberError }] = await Promise.all([
    supabase.from("classes").select("id,name,grade_level,academic_years(name)").eq("id", classId).eq("school_id", context.active.schoolId).maybeSingle(),
    supabase.from("class_students").select("students(id,display_name,local_code,status)").eq("class_id", classId),
  ]);
  if (classError || !classData) notFound();
  if (memberError) throw memberError;

  const students = ((memberData ?? []) as Array<Record<string, unknown>>)
    .map((row) => relationObject(row.students))
    .filter((row) => row && row.status === "active")
    .sort((left, right) => String(left?.display_name).localeCompare(String(right?.display_name), "id"));

  return (
    <div>
      <PageHeader
        eyebrow={`Tahun ${relationText(classData.academic_years, "name", "ajaran belum diisi")}`}
        title={String(classData.name)}
        description={`${students.length} murid aktif${classData.grade_level ? ` · tingkat ${classData.grade_level}` : ""}`}
        action={students.length ? <div className="flex flex-wrap gap-2"><Link href={`/classes/${classId}/focus`} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--tg-border)] px-4 font-bold"><Focus size={17} />Mode Fokus</Link><Link href={`/classes/${classId}/group-builder`} className="tg-primary-button"><Shuffle size={17} />Buat kelompok</Link></div> : null}
      />
      <div className="mt-6"><FormMessage error={firstParam(query.error)} success={firstParam(query.success)} /></div>
      <section className="mt-6 grid gap-6 xl:grid-cols-[.72fr_1.28fr]">
        <div className="tg-card p-5">
          <h2 className="font-bold">Tambah murid</h2>
          <p className="mt-1 text-sm tg-muted">Kode lokal membantu mencegah duplikat saat impor.</p>
          <form action={addStudentToClass} className="mt-5 space-y-4">
            <input type="hidden" name="class_id" value={classId} />
            <label className="block text-sm font-bold">Nama lengkap<input name="display_name" required maxLength={150} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" /></label>
            <label className="block text-sm font-bold">Kode/NIS <span className="font-normal tg-muted">(opsional)</span><input name="local_code" maxLength={50} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" /></label>
            <SubmitButton>Tambah murid</SubmitButton>
          </form>
          <Link href={`/classes/${classId}/import`} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--tg-border)] px-4 font-bold"><FileUp size={17} />Impor CSV</Link>
        </div>
        <div>{students.length ? <div className="grid gap-3 sm:grid-cols-2">{students.map((student) => student ? <article key={String(student.id)} className="tg-card flex items-center gap-3 p-4"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--tg-primary)_12%,transparent)] text-[var(--tg-primary)]"><UserRound size={20} /></span><div className="min-w-0"><h2 className="truncate font-bold">{String(student.display_name)}</h2><p className="truncate text-sm tg-muted">{student.local_code ? `Kode ${student.local_code}` : "Tanpa kode lokal"}</p></div></article> : null)}</div> : <EmptyState icon={UserRound} title="Kelas belum memiliki murid" description="Tambah manual atau impor file CSV dengan kolom nama dan kode." />}</div>
      </section>
    </div>
  );
}
