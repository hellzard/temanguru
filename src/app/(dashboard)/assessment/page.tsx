import Link from "next/link";
import { ChartNoAxesColumnIncreasing, Plus } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { FormMessage } from "@/components/dashboard/form-message";
import { PageHeader } from "@/components/dashboard/page-header";
import { SubmitButton } from "@/components/dashboard/submit-button";
import { firstParam } from "@/lib/action-result";
import { formatDate } from "@/lib/format";
import { relationText } from "@/lib/relations";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";
import { createAssessment } from "./actions";

export const metadata = { title: "Penilaian" };

export default async function AssessmentPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const context = await requireActiveSchool();
  const supabase = await createClient();
  let assignmentQuery = supabase.from("teaching_assignments").select("id,teacher_id,classes(name),subjects(name)").eq("school_id", context.active.schoolId).order("created_at");
  if (context.active.role === "teacher") assignmentQuery = assignmentQuery.eq("teacher_id", context.userId);
  const { data: assignments, error: assignmentError } = await assignmentQuery;
  if (assignmentError) throw assignmentError;
  const assignmentRows = (assignments ?? []) as Array<Record<string, unknown>>;
  const requested = firstParam(params.assignment);
  const activeId = requested && assignmentRows.some((row) => row.id === requested) ? requested : assignmentRows[0]?.id ? String(assignmentRows[0].id) : null;
  let assessments: Array<Record<string, unknown>> = [];
  if (activeId) {
    const { data, error } = await supabase.from("assessments").select("id,title,category,assessment_date,max_score,weight").eq("school_id", context.active.schoolId).eq("teaching_assignment_id", activeId).order("assessment_date", { ascending: false });
    if (error) throw error;
    assessments = (data ?? []) as Array<Record<string, unknown>>;
  }

  return <div><PageHeader title="Penilaian" description="Buat komponen nilai, isi skor, lalu lihat rekap berbobot yang transparan." action={activeId ? <Link href={`/assessment/report/${activeId}`} className="inline-flex min-h-11 items-center rounded-xl border border-[var(--tg-border)] px-4 text-sm font-bold">Lihat rekap</Link> : undefined} />{assignmentRows.length ? <><section className="tg-card mt-7 p-5"><form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end"><label className="flex-1 text-sm font-bold">Penugasan<select name="assignment" defaultValue={activeId ?? ""} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3">{assignmentRows.map((row) => <option key={String(row.id)} value={String(row.id)}>{relationText(row.classes)} · {relationText(row.subjects)}</option>)}</select></label><button className="min-h-11 rounded-xl border border-[var(--tg-border)] px-4 font-bold">Tampilkan</button></form></section><div className="mt-6 grid gap-6 xl:grid-cols-[.75fr_1.25fr]"><section className="tg-card p-5"><div className="flex items-center gap-3"><Plus size={20} className="text-[var(--tg-primary)]" /><h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.035em]">Tambah penilaian</h2></div><form action={createAssessment} className="mt-5 space-y-4"><input type="hidden" name="teaching_assignment_id" value={activeId ?? ""} /><FormMessage error={firstParam(params.error)} success={firstParam(params.success)} /><label className="block text-sm font-bold">Judul<input name="title" required className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" /></label><label className="block text-sm font-bold">Kategori<select name="category" className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3">{["tugas", "kuis", "ulangan", "uts", "uas", "praktik", "proyek"].map((value) => <option key={value} value={value}>{value.toUpperCase()}</option>)}</select></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-bold">Skor maksimum<input type="number" name="max_score" min="1" step="0.01" defaultValue="100" className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" /></label><label className="block text-sm font-bold">Bobot<input type="number" name="weight" min="0" step="0.1" defaultValue="1" className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" /></label></div><label className="block text-sm font-bold">Tanggal<input type="date" name="assessment_date" className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" /></label><SubmitButton>Simpan</SubmitButton></form></section><section>{assessments.length ? <div className="space-y-3">{assessments.map((item) => <Link key={String(item.id)} href={`/assessment/${String(item.id)}`} className="tg-card block p-5 transition hover:border-[var(--tg-primary)]"><div className="flex items-start justify-between gap-4"><div><h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.035em]">{String(item.title)}</h2><p className="mt-1 text-sm tg-muted">{String(item.category).toUpperCase()} · Maks. {String(item.max_score)} · Bobot {String(item.weight)}</p></div><span className="text-sm tg-muted">{formatDate(item.assessment_date ? String(item.assessment_date) : null)}</span></div></Link>)}</div> : <EmptyState icon={ChartNoAxesColumnIncreasing} title="Belum ada penilaian" description="Tambahkan tugas, kuis, ujian, praktik, atau proyek untuk kelas ini." />}</section></div></> : <div className="mt-7"><EmptyState icon={ChartNoAxesColumnIncreasing} title="Belum ada penugasan" description="Buat penugasan mengajar sebelum menambahkan penilaian." action={<Link href="/settings/assignments" className="tg-primary-button">Buka pengaturan</Link>} /></div>}</div>;
}
