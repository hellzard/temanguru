import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { FormMessage } from "@/components/dashboard/form-message";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusPill } from "@/components/dashboard/status-pill";
import { SubmitButton } from "@/components/dashboard/submit-button";
import { firstParam } from "@/lib/action-result";
import { formatDateTime } from "@/lib/format";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";
import { createMeeting } from "./actions";

export const metadata = { title: "Rapat" };

export default async function MeetingsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const context = await requireActiveSchool();
  const supabase = await createClient();
  const { data, error } = await supabase.from("meetings").select("id,title,agenda,location,starts_at,ends_at,status").eq("school_id", context.active.schoolId).order("starts_at", { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as Array<Record<string, unknown>>;
  return <div><PageHeader title="Rapat Guru" description="Jadwalkan rapat, simpan notulen, dan jaga setiap keputusan memiliki PIC serta tenggat." /><div className="mt-7 grid gap-6 xl:grid-cols-[.75fr_1.25fr]"><section className="tg-card p-5"><h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.035em]">Jadwalkan rapat</h2><form action={createMeeting} className="mt-5 space-y-4"><FormMessage error={firstParam(params.error)} success={firstParam(params.success)} /><label className="block text-sm font-bold">Judul<input name="title" required className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" /></label><label className="block text-sm font-bold">Lokasi<input name="location" className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-bold">Mulai<input type="datetime-local" name="starts_at" required className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" /></label><label className="block text-sm font-bold">Selesai<input type="datetime-local" name="ends_at" className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" /></label></div><label className="block text-sm font-bold">Agenda<textarea name="agenda" rows={5} maxLength={5000} className="mt-2 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] p-3" /></label><SubmitButton>Simpan rapat</SubmitButton></form></section><section>{rows.length ? <div className="space-y-3">{rows.map((item) => <Link href={`/meetings/${String(item.id)}`} key={String(item.id)} className="tg-card block p-5 transition hover:border-[var(--tg-primary)]"><div className="flex items-start gap-4"><span className="grid size-11 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--tg-primary)_12%,transparent)] text-[var(--tg-primary)]"><CalendarClock size={21} /></span><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.035em]">{String(item.title)}</h2><StatusPill value={String(item.status)} /></div><p className="mt-1 text-sm tg-muted">{formatDateTime(String(item.starts_at))} · {String(item.location ?? "Lokasi belum ditentukan")}</p>{item.agenda ? <p className="mt-3 line-clamp-3 text-sm leading-6 tg-muted">{String(item.agenda)}</p> : null}</div></div></Link>)}</div> : <EmptyState icon={CalendarClock} title="Belum ada rapat" description="Jadwalkan rapat pertama agar agenda dan tindak lanjut tidak tercecer." />}</section></div></div>;
}
