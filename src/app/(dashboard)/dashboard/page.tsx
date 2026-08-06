import Link from "next/link";
import { BookOpenText, CalendarDays, ChartNoAxesColumnIncreasing, ClipboardCheck, Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusPill } from "@/components/dashboard/status-pill";
import { formatDate } from "@/lib/format";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Beranda" };

function relationName(value: unknown, fallback: string) {
  if (Array.isArray(value)) return relationName(value[0], fallback);
  if (value && typeof value === "object" && "name" in value) {
    const name = (value as { name?: unknown }).name;
    return typeof name === "string" ? name : fallback;
  }
  return fallback;
}

export default async function DashboardPage() {
  const context = await requireActiveSchool();
  const supabase = await createClient();
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();

  const [studentsResult, classesResult, pendingScoresResult, sessionsResult, schedulesResult, journalsResult] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }).eq("school_id", context.active.schoolId).eq("status", "active"),
    supabase.from("classes").select("id", { count: "exact", head: true }).eq("school_id", context.active.schoolId).is("archived_at", null),
    supabase.from("assessment_scores").select("assessment_id,assessments!inner(school_id)", { count: "exact", head: true }).eq("assessments.school_id", context.active.schoolId).is("original_score", null),
    supabase.from("attendance_sessions").select("id", { count: "exact", head: true }).eq("school_id", context.active.schoolId).eq("session_date", todayIso).eq("state", "final"),
    supabase
      .from("schedules")
      .select("id, starts_at, ends_at, room, teaching_assignments!inner(school_id, teacher_id, classes(name), subjects(name))")
      .eq("school_id", context.active.schoolId)
      .eq("day_of_week", dayOfWeek)
      .order("starts_at")
      .limit(6),
    supabase.from("teaching_journals").select("id, topic, journal_date, state").eq("school_id", context.active.schoolId).order("journal_date", { ascending: false }).limit(4),
  ]);

  const counts = [studentsResult, classesResult, pendingScoresResult, sessionsResult];
  const firstError = counts.find((result) => result.error)?.error ?? schedulesResult.error ?? journalsResult.error;
  if (firstError) throw firstError;

  const schedules = (schedulesResult.data ?? []) as Array<Record<string, unknown>>;
  const journals = (journalsResult.data ?? []) as Array<Record<string, unknown>>;

  return (
    <div>
      <PageHeader
        eyebrow={formatDate(today, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        title={`Ruang kerja ${context.active.schoolName}`}
        description="Lihat kegiatan berikutnya dan selesaikan pekerjaan yang paling mendesak."
        action={<Link href="/record" className="tg-primary-button"><Plus size={18} />Catat kelas</Link>}
      />

      <section aria-label="Ringkasan" className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Kelas aktif" value={classesResult.count ?? 0} icon={CalendarDays} />
        <MetricCard label="Murid aktif" value={studentsResult.count ?? 0} icon={Users} />
        <MetricCard label="Presensi hari ini" value={sessionsResult.count ?? 0} icon={ClipboardCheck} />
        <MetricCard label="Nilai kosong" value={pendingScoresResult.count ?? 0} icon={ChartNoAxesColumnIncreasing} />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <section className="tg-card p-5 sm:p-6">
          <div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">Jadwal hari ini</h2><p className="mt-1 text-sm tg-muted">Urut berdasarkan jam mulai.</p></div><Link href="/schedule" className="text-sm font-bold text-[var(--tg-primary)]">Lihat semua</Link></div>
          {schedules.length ? <div className="mt-5 space-y-3">{schedules.map((item) => {
            const assignment = item.teaching_assignments as Record<string, unknown> | null;
            return <article key={String(item.id)} className="flex flex-col gap-3 rounded-2xl border border-[var(--tg-border)] p-4 sm:flex-row sm:items-center">
              <div className="shrink-0 text-sm font-black text-[var(--tg-primary)] sm:w-32">{String(item.starts_at).slice(0,5)}–{String(item.ends_at).slice(0,5)}</div>
              <div className="min-w-0 flex-1"><h3 className="font-semibold">{relationName(assignment?.classes, "Kelas")} · {relationName(assignment?.subjects, "Mapel")}</h3><p className="text-sm tg-muted">{String(item.room ?? "Ruang belum ditentukan")}</p></div>
              <Link href="/record" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--tg-border)] px-4 text-sm font-bold">Catat</Link>
            </article>;
          })}</div> : <div className="mt-5"><EmptyState icon={CalendarDays} title="Tidak ada jadwal hari ini" description="Jadwal dapat ditambahkan dari menu Jadwal oleh owner atau admin." /></div>}
        </section>

        <section className="tg-card p-5 sm:p-6">
          <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Jurnal terbaru</h2><Link href="/journal" className="text-sm font-bold text-[var(--tg-primary)]">Buka jurnal</Link></div>
          {journals.length ? <div className="mt-5 space-y-3">{journals.map((journal) => <article key={String(journal.id)} className="rounded-2xl bg-[var(--tg-surface-muted)] p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{String(journal.topic)}</p><p className="mt-1 text-sm tg-muted">{formatDate(String(journal.journal_date))}</p></div><StatusPill value={String(journal.state)} /></div></article>)}</div> : <div className="mt-5"><EmptyState icon={BookOpenText} title="Belum ada jurnal" description="Gunakan Catat Kelas untuk membuat presensi dan jurnal sekaligus." /></div>}
        </section>
      </div>
    </div>
  );
}
