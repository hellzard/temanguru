import { UserPlus, Users } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { FormMessage } from "@/components/dashboard/form-message";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusPill } from "@/components/dashboard/status-pill";
import { SubmitButton } from "@/components/dashboard/submit-button";
import { firstParam } from "@/lib/action-result";
import { relationObject, relationText } from "@/lib/relations";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";
import { assignStudentToClass, createStudent, setStudentInactive } from "./actions";

export const metadata = { title: "Murid" };

export default async function StudentsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const context = await requireActiveSchool();
  const supabase = await createClient();
  const [{ data: studentData, error: studentError }, { data: classData, error: classError }] = await Promise.all([
    supabase.from("students").select("id,display_name,local_code,status,created_at,class_students(class_id,left_on,classes(name))").eq("school_id", context.active.schoolId).order("display_name"),
    supabase.from("classes").select("id,name,academic_years(is_active,name)").eq("school_id", context.active.schoolId).is("archived_at", null).order("name"),
  ]);
  if (studentError || classError) throw studentError ?? classError;
  const students = (studentData ?? []) as Array<Record<string, unknown>>;
  const classes = (classData ?? []) as Array<Record<string, unknown>>;
  const canDeactivate = ["owner", "admin"].includes(context.active.role);

  return <div><PageHeader title="Murid" description="Simpan hanya data minimum yang diperlukan, lalu hubungkan murid dengan kelas yang relevan." /><div className="mt-7 grid gap-6 xl:grid-cols-[.7fr_1.3fr]"><section className="tg-card p-5"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--tg-primary)_12%,transparent)] text-[var(--tg-primary)]"><UserPlus size={21} /></span><div><h2 className="font-bold">Tambah murid</h2><p className="text-sm tg-muted">Nama dan kode lokal saja.</p></div></div><form action={createStudent} className="mt-5 space-y-4"><FormMessage error={firstParam(params.error)} success={firstParam(params.success)} /><label className="block text-sm font-bold">Nama tampilan<input name="display_name" required minLength={2} maxLength={150} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" /></label><label className="block text-sm font-bold">Kode lokal <span className="font-normal tg-muted">(opsional)</span><input name="local_code" maxLength={80} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" /></label><SubmitButton>Tambah murid</SubmitButton></form></section><section>{students.length ? <div className="tg-card overflow-hidden"><div className="border-b border-[var(--tg-border)] p-5"><h2 className="font-bold">Daftar murid</h2><p className="text-sm tg-muted">{students.length} murid tersimpan.</p></div><div className="divide-y divide-[var(--tg-border)]">{students.map((student) => { const memberships = Array.isArray(student.class_students) ? student.class_students as Array<Record<string, unknown>> : []; const current = memberships.filter((membership) => !membership.left_on).map((membership) => relationText(relationObject(membership.classes), "name", "Kelas")); return <article key={String(student.id)} className="p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><div className="grid size-10 place-items-center rounded-xl bg-[var(--tg-surface-muted)] font-black text-[var(--tg-primary)]">{String(student.display_name).slice(0, 1).toUpperCase()}</div><div className="min-w-0 flex-1"><p className="font-semibold">{String(student.display_name)}</p><p className="text-sm tg-muted">{student.local_code ? `Kode: ${String(student.local_code)}` : "Tanpa kode lokal"} · {current.length ? current.join(", ") : "Belum masuk kelas"}</p></div><StatusPill value={String(student.status)} />{canDeactivate ? <form action={setStudentInactive}><input type="hidden" name="id" value={String(student.id)} /><button className="min-h-10 rounded-xl border border-[var(--tg-border)] px-3 text-sm font-bold" disabled={student.status !== "active"}>Nonaktifkan</button></form> : null}</div>{student.status === "active" && classes.length ? <form action={assignStudentToClass} className="mt-3 flex flex-col gap-2 rounded-xl bg-[var(--tg-surface-muted)] p-3 sm:flex-row"><input type="hidden" name="student_id" value={String(student.id)} /><select name="class_id" required className="min-h-10 min-w-0 flex-1 rounded-lg border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3 text-sm"><option value="">Tambahkan ke kelas…</option>{classes.map((item) => <option key={String(item.id)} value={String(item.id)}>{String(item.name)} · {relationText(item.academic_years, "name", "Tahun")}</option>)}</select><button className="min-h-10 rounded-lg border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3 text-sm font-bold">Simpan kelas</button></form> : null}</article>; })}</div></div> : <EmptyState icon={Users} title="Belum ada murid" description="Tambahkan murid pertama menggunakan formulir di samping." />}</section></div></div>;
}
