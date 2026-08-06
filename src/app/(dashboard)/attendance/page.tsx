import Link from "next/link";
import { ClipboardCheck, Plus } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusPill } from "@/components/dashboard/status-pill";
import { formatDate } from "@/lib/format";
import { relationObject, relationText } from "@/lib/relations";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Presensi" };

export default async function AttendancePage() {
  const context = await requireActiveSchool();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("attendance_sessions")
    .select("id, session_date, state, notes, created_at, teaching_assignments(classes(name), subjects(name))")
    .eq("school_id", context.active.schoolId)
    .order("session_date", { ascending: false })
    .limit(120);

  if (error) throw error;
  const rows = (data ?? []) as Array<Record<string, unknown>>;

  return (
    <div>
      <PageHeader
        title="Presensi"
        description="Riwayat sesi presensi yang dibuat bersama jurnal mengajar. Data baru dibuat melalui Catat Kelas agar penyimpanannya tetap atomik."
        action={<Link href="/record" className="tg-primary-button"><Plus size={18} />Catat kelas</Link>}
      />
      <div className="mt-7">
        {rows.length ? (
          <div className="space-y-3">
            {rows.map((row) => {
              const assignment = relationObject(row.teaching_assignments);
              return (
                <article key={String(row.id)} className="tg-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--tg-primary)_12%,transparent)] text-[var(--tg-primary)]"><ClipboardCheck size={21} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold">{relationText(assignment?.classes, "name", "Kelas")} · {relationText(assignment?.subjects, "name", "Mata pelajaran")}</h2>
                      <StatusPill value={String(row.state)} />
                    </div>
                    <p className="mt-1 text-sm tg-muted">{formatDate(String(row.session_date), { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                    {row.notes ? <p className="mt-2 text-sm">{String(row.notes)}</p> : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={ClipboardCheck} title="Belum ada presensi" description="Buat catatan kelas pertama. Presensi dan jurnal akan tersimpan dalam satu transaksi." action={<Link href="/record" className="tg-primary-button">Mulai Catat Kelas</Link>} />
        )}
      </div>
    </div>
  );
}
