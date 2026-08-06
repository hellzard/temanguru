import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusPill } from "@/components/dashboard/status-pill";
import { formatDate } from "@/lib/format";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Hari Ini" };

function relationName(value: unknown, fallback: string) {
  if (Array.isArray(value)) return relationName(value[0], fallback);
  if (value && typeof value === "object" && "name" in value) {
    const name = (value as { name?: unknown }).name;
    return typeof name === "string" ? name : fallback;
  }
  return fallback;
}

function formatClock(value: unknown) {
  return typeof value === "string" ? value.slice(0, 5) : "--.--";
}

export default async function DashboardPage() {
  const context = await requireActiveSchool();
  const supabase = await createClient();
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();

  const [
    studentsResult,
    classesResult,
    pendingScoresResult,
    sessionsResult,
    schedulesResult,
    journalsResult,
  ] = await Promise.all([
    supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("school_id", context.active.schoolId)
      .eq("status", "active"),
    supabase
      .from("classes")
      .select("id", { count: "exact", head: true })
      .eq("school_id", context.active.schoolId)
      .is("archived_at", null),
    supabase
      .from("assessment_scores")
      .select("assessment_id,assessments!inner(school_id)", {
        count: "exact",
        head: true,
      })
      .eq("assessments.school_id", context.active.schoolId)
      .is("original_score", null),
    supabase
      .from("attendance_sessions")
      .select("id", { count: "exact", head: true })
      .eq("school_id", context.active.schoolId)
      .eq("session_date", todayIso)
      .eq("state", "final"),
    supabase
      .from("schedules")
      .select(
        "id, starts_at, ends_at, room, teaching_assignments!inner(school_id, teacher_id, classes(name), subjects(name))",
      )
      .eq("school_id", context.active.schoolId)
      .eq("day_of_week", dayOfWeek)
      .order("starts_at")
      .limit(6),
    supabase
      .from("teaching_journals")
      .select("id, topic, journal_date, state")
      .eq("school_id", context.active.schoolId)
      .order("journal_date", { ascending: false })
      .limit(4),
  ]);

  const countResults = [
    studentsResult,
    classesResult,
    pendingScoresResult,
    sessionsResult,
  ];
  const firstError =
    countResults.find((result) => result.error)?.error ??
    schedulesResult.error ??
    journalsResult.error;

  if (firstError) throw firstError;

  const schedules = (schedulesResult.data ?? []) as Array<Record<string, unknown>>;
  const journals = (journalsResult.data ?? []) as Array<Record<string, unknown>>;
  const pendingScores = pendingScoresResult.count ?? 0;
  const unfinishedJournals = journals.filter(
    (journal) => String(journal.state).toLowerCase() !== "final",
  ).length;

  const focusItems = [
    {
      label: "Jadwal hari ini",
      value: schedules.length,
      detail: schedules.length ? "kelas terjadwal" : "tidak ada kelas",
      href: "/schedule",
      icon: CalendarDays,
      tone: "indigo",
    },
    {
      label: "Jurnal perlu perhatian",
      value: unfinishedJournals,
      detail: unfinishedJournals ? "draf terbaru" : "semua sudah rapi",
      href: "/journal",
      icon: BookOpenText,
      tone: "emerald",
    },
    {
      label: "Nilai belum diisi",
      value: pendingScores,
      detail: pendingScores ? "perlu dilengkapi" : "tidak ada antrean",
      href: "/assessment",
      icon: ChartNoAxesColumnIncreasing,
      tone: "amber",
    },
  ] as const;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#11162a] p-6 text-white shadow-[0_32px_80px_-44px_rgba(15,23,42,.9)] sm:p-8">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-28 size-72 rounded-full bg-indigo-500/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-28 left-[18%] size-64 rounded-full bg-teal-500/20 blur-3xl"
        />

        <div className="relative grid gap-8 xl:grid-cols-[1fr_auto] xl:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.07] px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-200">
              <Sparkles size={14} aria-hidden="true" />
              Fokus hari ini
            </div>
            <p className="mt-6 text-sm font-bold text-slate-400">
              {formatDate(today, {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <h1 className="mt-2 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-[-0.05em] sm:text-5xl">
              Selamat datang di ruang kerja {context.active.schoolName}.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Mulai dari kelas berikutnya, lalu selesaikan pekerjaan yang paling membutuhkan perhatian.
            </p>
          </div>

          <Link
            href="/record"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-white px-5 text-sm font-extrabold text-slate-950 shadow-xl shadow-black/10 transition hover:-translate-y-0.5 hover:bg-indigo-50"
          >
            <Plus size={18} aria-hidden="true" />
            Catat kelas
          </Link>
        </div>
      </section>

      <section aria-labelledby="fokus-heading">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--tg-primary)]">
              Prioritas
            </p>
            <h2
              id="fokus-heading"
              className="mt-1 font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-[-0.04em]"
            >
              Yang perlu dilihat lebih dulu
            </h2>
          </div>
          <p className="hidden text-sm text-[var(--tg-text-muted)] sm:block">
            Berdasarkan data ruang kerja aktif
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {focusItems.map(({ label, value, detail, href, icon: Icon, tone }) => {
            const toneClass =
              tone === "emerald"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"
                : tone === "amber"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300"
                  : "bg-indigo-100 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300";

            return (
              <Link
                key={label}
                href={href}
                className="group rounded-[24px] border border-[var(--tg-border)] bg-[var(--tg-surface-alpha)] p-5 shadow-[var(--tg-shadow-sm)] transition hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--tg-primary)_28%,var(--tg-border))] hover:shadow-[var(--tg-shadow-md)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className={`grid size-11 place-items-center rounded-2xl ${toneClass}`}>
                    <Icon size={21} aria-hidden="true" />
                  </span>
                  <ArrowRight
                    size={18}
                    className="text-[var(--tg-text-muted)] transition group-hover:translate-x-1 group-hover:text-[var(--tg-primary)]"
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-6 text-sm font-bold text-[var(--tg-text-muted)]">{label}</p>
                <div className="mt-1 flex items-end gap-2">
                  <strong className="font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-[-0.05em]">
                    {value}
                  </strong>
                  <span className="pb-1 text-xs font-bold text-[var(--tg-text-muted)]">{detail}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.18fr_.82fr]">
        <section className="rounded-[26px] border border-[var(--tg-border)] bg-[var(--tg-surface-alpha)] p-5 shadow-[var(--tg-shadow-sm)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--tg-primary)]">
                Alur hari ini
              </p>
              <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl font-extrabold tracking-[-0.035em]">
                Jadwal mengajar
              </h2>
            </div>
            <Link href="/schedule" className="text-sm font-extrabold text-[var(--tg-primary)]">
              Lihat semua
            </Link>
          </div>

          {schedules.length ? (
            <div className="mt-6 space-y-2">
              {schedules.map((item) => {
                const assignment = item.teaching_assignments as Record<string, unknown> | null;

                return (
                  <article
                    key={String(item.id)}
                    className="group grid gap-3 rounded-[20px] border border-transparent bg-[var(--tg-surface-muted)] p-4 transition hover:border-[var(--tg-border)] hover:bg-[var(--tg-surface)] sm:grid-cols-[7rem_1fr_auto] sm:items-center"
                  >
                    <div className="flex items-center gap-2 font-extrabold text-[var(--tg-primary)]">
                      <Clock3 size={16} aria-hidden="true" />
                      {formatClock(item.starts_at)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-extrabold">
                        {relationName(assignment?.classes, "Kelas")} ·{" "}
                        {relationName(assignment?.subjects, "Mata pelajaran")}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--tg-text-muted)]">
                        {String(item.room ?? "Ruang belum ditentukan")} · sampai{" "}
                        {formatClock(item.ends_at)}
                      </p>
                    </div>
                    <Link
                      href="/record"
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-4 text-sm font-extrabold transition hover:border-indigo-300 hover:text-[var(--tg-primary)]"
                    >
                      Catat
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState
                icon={CalendarDays}
                title="Tidak ada jadwal hari ini"
                description="Gunakan waktu ini untuk merapikan jurnal, nilai, atau dokumen yang tertunda."
              />
            </div>
          )}
        </section>

        <section className="rounded-[26px] border border-[var(--tg-border)] bg-[var(--tg-surface-alpha)] p-5 shadow-[var(--tg-shadow-sm)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--tg-primary)]">
                Catatan terbaru
              </p>
              <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl font-extrabold tracking-[-0.035em]">
                Jurnal mengajar
              </h2>
            </div>
            <Link href="/journal" className="text-sm font-extrabold text-[var(--tg-primary)]">
              Buka jurnal
            </Link>
          </div>

          {journals.length ? (
            <div className="mt-6 space-y-3">
              {journals.map((journal) => (
                <article
                  key={String(journal.id)}
                  className="rounded-[20px] border border-[var(--tg-border)] bg-[var(--tg-surface)] p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--tg-primary-soft)] text-[var(--tg-primary)]">
                      <BookOpenText size={18} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="line-clamp-2 font-extrabold">{String(journal.topic)}</p>
                        <StatusPill value={String(journal.state)} />
                      </div>
                      <p className="mt-2 text-sm text-[var(--tg-text-muted)]">
                        {formatDate(String(journal.journal_date))}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState
                icon={BookOpenText}
                title="Belum ada jurnal"
                description="Catat kelas untuk membuat presensi dan jurnal dalam satu alur."
              />
            </div>
          )}
        </section>
      </div>

      <section aria-label="Ringkasan ruang kerja" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Kelas aktif", value: classesResult.count ?? 0, icon: CalendarDays },
          { label: "Murid aktif", value: studentsResult.count ?? 0, icon: Users },
          { label: "Presensi selesai hari ini", value: sessionsResult.count ?? 0, icon: ClipboardCheck },
          { label: "Status ruang kerja", value: "Aktif", icon: CheckCircle2 },
        ].map(({ label, value, icon: Icon }) => (
          <article
            key={label}
            className="flex items-center gap-3 rounded-[20px] border border-[var(--tg-border)] bg-[var(--tg-surface-alpha)] p-4"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--tg-surface-muted)] text-[var(--tg-primary)]">
              <Icon size={19} aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold text-[var(--tg-text-muted)]">{label}</p>
              <p className="mt-0.5 text-lg font-extrabold">{value}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
