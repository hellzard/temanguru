import { notFound } from "next/navigation";
import { BadgeDollarSign, CheckSquare2, ListTodo } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { FormMessage } from "@/components/dashboard/form-message";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusPill } from "@/components/dashboard/status-pill";
import { SubmitButton } from "@/components/dashboard/submit-button";
import { firstParam } from "@/lib/action-result";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { relationText } from "@/lib/relations";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";
import { createEventBudget, createEventTask, updateEventTaskStatus } from "../actions";

export const metadata = { title: "Detail Acara", robots: { index: false, follow: false } };

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { eventId } = await params;
  const query = await searchParams;
  const context = await requireActiveSchool();
  const supabase = await createClient();

  const [eventResult, taskResult, budgetResult, memberResult] = await Promise.all([
    supabase
      .from("events")
      .select("id,title,description,location,starts_at,ends_at,status,budget_limit")
      .eq("id", eventId)
      .eq("school_id", context.active.schoolId)
      .maybeSingle(),
    supabase
      .from("event_tasks")
      .select("id,title,description,assignee_id,due_at,status")
      .eq("event_id", eventId)
      .eq("school_id", context.active.schoolId)
      .order("created_at"),
    supabase
      .from("event_budgets")
      .select("id,category,description,planned_amount,actual_amount")
      .eq("event_id", eventId)
      .eq("school_id", context.active.schoolId)
      .order("created_at"),
    supabase
      .from("school_members")
      .select("id,profiles(display_name)")
      .eq("school_id", context.active.schoolId)
      .eq("status", "active"),
  ]);

  if (eventResult.error || !eventResult.data) notFound();
  const error = taskResult.error ?? budgetResult.error ?? memberResult.error;
  if (error) throw error;

  const event = eventResult.data as Record<string, unknown>;
  const tasks = (taskResult.data ?? []) as Array<Record<string, unknown>>;
  const budgets = (budgetResult.data ?? []) as Array<Record<string, unknown>>;
  const members = (memberResult.data ?? []) as Array<Record<string, unknown>>;
  const memberMap = new Map(
    members.map((member) => [
      String(member.id),
      relationText(member.profiles, "display_name", "Anggota"),
    ]),
  );
  const canManage = ["owner", "admin"].includes(context.active.role);
  const planned = budgets.reduce((sum, item) => sum + Number(item.planned_amount ?? 0), 0);
  const actual = budgets.reduce((sum, item) => sum + Number(item.actual_amount ?? 0), 0);

  return (
    <div>
      <PageHeader
        eyebrow={`${formatDateTime(String(event.starts_at))} · ${String(event.location ?? "Lokasi belum ditentukan")}`}
        title={String(event.title)}
        description={event.description ? String(event.description) : "Kelola tugas dan anggaran acara."}
        action={<StatusPill value={String(event.status)} />}
      />
      <div className="mt-6">
        <FormMessage error={firstParam(query.error)} success={firstParam(query.success)} />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <Summary label="Batas anggaran" value={event.budget_limit ? formatCurrency(String(event.budget_limit)) : "Belum ditetapkan"} />
        <Summary label="Rencana" value={formatCurrency(planned)} />
        <Summary label="Realisasi" value={formatCurrency(actual)} />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section>
          <div className="flex items-center gap-2">
            <ListTodo size={20} className="text-[var(--tg-primary)]" />
            <h2 className="text-lg font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.035em]">Tugas acara</h2>
          </div>

          {tasks.length ? (
            <div className="mt-4 space-y-3">
              {tasks.map((task) => {
                const canUpdate = canManage || String(task.assignee_id ?? "") === context.active.id;
                return (
                  <article key={String(task.id)} className="tg-card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-[family-name:var(--font-display)] font-extrabold tracking-[-0.03em]">{String(task.title)}</h3>
                          <StatusPill value={String(task.status)} />
                        </div>
                        <p className="mt-1 text-sm tg-muted">
                          {task.assignee_id ? memberMap.get(String(task.assignee_id)) ?? "Anggota" : "Belum ada PIC"}
                          {task.due_at ? ` · ${formatDateTime(String(task.due_at))}` : ""}
                        </p>
                        {task.description ? <p className="mt-3 text-sm leading-6">{String(task.description)}</p> : null}
                      </div>
                      {canUpdate ? (
                        <form action={updateEventTaskStatus} className="flex gap-2">
                          <input type="hidden" name="event_id" value={eventId} />
                          <input type="hidden" name="task_id" value={String(task.id)} />
                          <select name="status" defaultValue={String(task.status)} className="min-h-10 rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-2 text-sm">
                            {["todo", "doing", "blocked", "done"].map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
                          </select>
                          <button className="min-h-10 rounded-xl border border-[var(--tg-border)] px-3 text-sm font-bold">Simpan</button>
                        </form>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-4"><EmptyState icon={CheckSquare2} title="Belum ada tugas" description="Bagi pekerjaan acara menjadi tugas kecil dengan PIC dan tenggat." /></div>
          )}

          {canManage ? (
            <form action={createEventTask} className="tg-card mt-4 space-y-3 p-5">
              <input type="hidden" name="event_id" value={eventId} />
              <h3 className="font-[family-name:var(--font-display)] font-extrabold tracking-[-0.03em]">Tambah tugas</h3>
              <input name="title" required placeholder="Judul tugas" className="min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" />
              <select name="assignee_id" className="min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3">
                <option value="">Belum ada PIC</option>
                {members.map((member) => <option key={String(member.id)} value={String(member.id)}>{relationText(member.profiles, "display_name", "Anggota")}</option>)}
              </select>
              <input type="datetime-local" name="due_at" className="min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" />
              <textarea name="description" rows={3} placeholder="Deskripsi" className="w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] p-3" />
              <SubmitButton>Tambah tugas</SubmitButton>
            </form>
          ) : null}
        </section>

        <section>
          <div className="flex items-center gap-2">
            <BadgeDollarSign size={20} className="text-[var(--tg-primary)]" />
            <h2 className="text-lg font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.035em]">Anggaran</h2>
          </div>
          {budgets.length ? (
            <div className="mt-4 space-y-3">
              {budgets.map((budget) => (
                <article key={String(budget.id)} className="tg-card p-5">
                  <h3 className="font-[family-name:var(--font-display)] font-extrabold tracking-[-0.03em]">{String(budget.category)}</h3>
                  <p className="mt-1 text-sm tg-muted">Rencana {formatCurrency(String(budget.planned_amount))} · Realisasi {formatCurrency(String(budget.actual_amount))}</p>
                  {budget.description ? <p className="mt-3 text-sm">{String(budget.description)}</p> : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-4"><EmptyState icon={BadgeDollarSign} title="Belum ada rincian anggaran" description="Catat rencana dan realisasi per kategori." /></div>
          )}

          {canManage ? (
            <form action={createEventBudget} className="tg-card mt-4 space-y-3 p-5">
              <input type="hidden" name="event_id" value={eventId} />
              <h3 className="font-[family-name:var(--font-display)] font-extrabold tracking-[-0.03em]">Tambah anggaran</h3>
              <input name="category" required placeholder="Kategori" className="min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input type="number" min="0" name="planned_amount" placeholder="Rencana" className="min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" />
                <input type="number" min="0" name="actual_amount" placeholder="Realisasi" className="min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" />
              </div>
              <textarea name="description" rows={3} placeholder="Catatan" className="w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] p-3" />
              <SubmitButton>Tambah anggaran</SubmitButton>
            </form>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="tg-card p-5"><p className="text-sm tg-muted">{label}</p><p className="mt-2 text-xl font-black">{value}</p></div>;
}
