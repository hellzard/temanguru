import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { firstParam } from "@/lib/action-result";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";
import { RecordClient, type RecordStudent } from "./client";

export const metadata = { title: "Catat Kelas" };
function relationName(value: unknown, key = "name") { if (Array.isArray(value)) return relationName(value[0], key); if (value && typeof value === "object" && key in value) { const result = (value as Record<string, unknown>)[key]; return typeof result === "string" ? result : "—"; } return "—"; }

export default async function RecordPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const selected = firstParam(params.assignment);
  const date = firstParam(params.date) ?? new Date().toISOString().slice(0, 10);
  const context = await requireActiveSchool();
  const supabase = await createClient();
  let assignmentQuery = supabase
    .from("teaching_assignments")
    .select("id, class_id, teacher_id, classes(name), subjects(name)")
    .eq("school_id", context.active.schoolId)
    .order("created_at");
  if (context.active.role === "teacher") {
    assignmentQuery = assignmentQuery.eq("teacher_id", context.userId);
  }
  const { data: assignments, error } = await assignmentQuery;
  if (error) throw error;
  const assignmentRows = (assignments ?? []) as Array<Record<string, unknown>>;
  const activeId = selected && assignmentRows.some((item) => item.id === selected) ? selected : assignmentRows[0]?.id ? String(assignmentRows[0].id) : null;
  let students: RecordStudent[] = [];
  if (activeId) {
    const assignment = assignmentRows.find((item) => item.id === activeId);
    const classId = assignment?.class_id ? String(assignment.class_id) : null;
    if (classId) {
      const { data: members, error: studentError } = await supabase.from("class_students").select("students(id,display_name,local_code,status)").eq("class_id", classId);
      if (studentError) throw studentError;
      students = ((members ?? []) as Array<Record<string, unknown>>).flatMap((member) => {
        const raw = Array.isArray(member.students) ? member.students[0] : member.students;
        if (!raw || typeof raw !== "object") return [];
        const row = raw as Record<string, unknown>;
        if (row.status !== "active") return [];
        return [{ id: String(row.id), name: String(row.display_name), code: row.local_code ? String(row.local_code) : null }];
      }).sort((left, right) => left.name.localeCompare(right.name, "id"));
    }
  }

  return <div><PageHeader title="Catat Kelas" description="Simpan presensi dan jurnal dalam satu alur yang dapat dipakai ulang untuk rekap." />
    {assignmentRows.length ? <><section className="tg-card mt-7 p-5"><form method="get" className="grid gap-4 sm:grid-cols-[1fr_190px_auto] sm:items-end"><label className="block text-sm font-bold">Penugasan<select name="assignment" defaultValue={activeId ?? ""} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3">{assignmentRows.map((item) => <option key={String(item.id)} value={String(item.id)}>{relationName(item.classes)} · {relationName(item.subjects)}</option>)}</select></label><label className="block text-sm font-bold">Tanggal<input type="date" name="date" defaultValue={date} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" /></label><button className="min-h-11 rounded-xl border border-[var(--tg-border)] px-4 font-bold">Tampilkan</button></form></section><div className="mt-6">{students.length && activeId ? <RecordClient assignmentId={activeId} date={date} students={students} /> : <EmptyState icon={ClipboardCheck} title="Kelas belum memiliki murid" description="Tambahkan murid ke kelas sebelum membuat catatan." action={<Link href="/students" className="tg-primary-button">Kelola murid</Link>} />}</div></> : <div className="mt-7"><EmptyState icon={ClipboardCheck} title="Belum ada penugasan mengajar" description="Owner atau admin perlu membuat tahun ajaran, kelas, mapel, lalu penugasan." action={<Link href="/settings/assignments" className="tg-primary-button">Buka pengaturan</Link>} /></div>}
  </div>;
}
