import Link from "next/link";
import { BookOpenText, Plus } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusPill } from "@/components/dashboard/status-pill";
import { formatDate } from "@/lib/format";
import { relationObject, relationText } from "@/lib/relations";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Jurnal Mengajar" };

export default async function JournalPage() {
  const context = await requireActiveSchool();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teaching_journals")
    .select("id, journal_date, topic, activity_summary, reflection, obstacle, follow_up, state, teaching_assignments(classes(name), subjects(name))")
    .eq("school_id", context.active.schoolId)
    .order("journal_date", { ascending: false })
    .limit(120);
  if (error) throw error;
  const rows = (data ?? []) as Array<Record<string, unknown>>;

  return (
    <div>
      <PageHeader title="Jurnal Mengajar" description="Dokumentasi kegiatan, refleksi, kendala, dan tindak lanjut yang terhubung langsung dengan presensi." action={<Link href="/record" className="tg-primary-button"><Plus size={18} />Catat kelas</Link>} />
      <div className="mt-7">
        {rows.length ? (
          <div className="space-y-4">
            {rows.map((row) => {
              const assignment = relationObject(row.teaching_assignments);
              return (
                <article key={String(row.id)} className="tg-card p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--tg-primary)_12%,transparent)] text-[var(--tg-primary)]"><BookOpenText size={21} /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.035em]">{String(row.topic)}</h2><StatusPill value={String(row.state)} /></div>
                      <p className="mt-1 text-sm tg-muted">{relationText(assignment?.classes, "name", "Kelas")} · {relationText(assignment?.subjects, "name", "Mata pelajaran")} · {formatDate(String(row.journal_date))}</p>
                      {row.activity_summary ? <p className="mt-4 whitespace-pre-wrap text-sm leading-6">{String(row.activity_summary)}</p> : null}
                      <dl className="mt-4 grid gap-3 md:grid-cols-3">
                        {[['Refleksi', row.reflection], ['Kendala', row.obstacle], ['Tindak lanjut', row.follow_up]].map(([label, value]) => (
                          <div key={String(label)} className="rounded-2xl bg-[var(--tg-surface-muted)] p-4"><dt className="text-xs font-bold uppercase tracking-wide tg-muted">{String(label)}</dt><dd className="mt-2 whitespace-pre-wrap text-sm">{value ? String(value) : "—"}</dd></div>
                        ))}
                      </dl>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : <EmptyState icon={BookOpenText} title="Belum ada jurnal" description="Jurnal dibuat otomatis bersama presensi melalui Catat Kelas." />}
      </div>
    </div>
  );
}
