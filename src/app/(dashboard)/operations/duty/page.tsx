import { CalendarCheck2 } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { FormMessage } from "@/components/dashboard/form-message";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusPill } from "@/components/dashboard/status-pill";
import { SubmitButton } from "@/components/dashboard/submit-button";
import { firstParam } from "@/lib/action-result";
import { formatDate } from "@/lib/format";
import { relationText } from "@/lib/relations";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";
import { completeDuty, createDutySchedule } from "./actions";

export const metadata = { title: "Jadwal Piket" };

export default async function DutyPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const context = await requireActiveSchool();
  const supabase = await createClient();
  const [{ data: members, error: memberError }, { data: rows, error: rowError }] = await Promise.all([
    supabase.from("school_members").select("id,user_id,role,profiles(display_name)").eq("school_id", context.active.schoolId).eq("status", "active").order("joined_at"),
    supabase.from("duty_schedules").select("id,member_id,duty_date,shift_name,location,status").eq("school_id", context.active.schoolId).order("duty_date", { ascending: false }).limit(60),
  ]);
  if (memberError || rowError) throw memberError ?? rowError;
  const memberRows = (members ?? []) as Array<Record<string, unknown>>;
  const memberMap = new Map(memberRows.map((member) => [String(member.id), relationText(member.profiles, "display_name", "Anggota sekolah")]));
  const canManage = ["owner", "admin"].includes(context.active.role);

  return <div><PageHeader title="Jadwal Piket" description="Atur giliran dan catat pelaksanaan tugas harian sekolah." /><div className="mt-7 grid gap-6 xl:grid-cols-[.75fr_1.25fr]">{canManage ? <section className="tg-card p-5"><h2 className="font-bold">Tambah jadwal</h2><form action={createDutySchedule} className="mt-5 space-y-4"><FormMessage error={firstParam(params.error)} success={firstParam(params.success)} /><label className="block text-sm font-bold">Anggota<select name="member_id" required className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3"><option value="">Pilih</option>{memberRows.map((member) => <option key={String(member.id)} value={String(member.id)}>{relationText(member.profiles, "display_name", "Anggota")} · {String(member.role)}</option>)}</select></label><label className="block text-sm font-bold">Tanggal<input type="date" name="duty_date" required className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" /></label><label className="block text-sm font-bold">Jenis tugas<input name="shift_name" required placeholder="Piket gerbang pagi" className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" /></label><label className="block text-sm font-bold">Lokasi<input name="location" className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" /></label><SubmitButton>Simpan</SubmitButton></form></section> : <div className="tg-card p-5 text-sm tg-muted">Guru dapat menandai jadwal piket miliknya selesai.</div>}<section>{rows?.length ? <div className="space-y-3">{((rows ?? []) as Array<Record<string, unknown>>).map((row) => { const own = row.member_id === context.active.id; return <article key={String(row.id)} className="tg-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center"><span className="grid size-11 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--tg-primary)_12%,transparent)] text-[var(--tg-primary)]"><CalendarCheck2 size={21} /></span><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold">{String(row.shift_name)}</h2><StatusPill value={String(row.status)} /></div><p className="mt-1 text-sm tg-muted">{memberMap.get(String(row.member_id)) ?? "Anggota sekolah"} · {formatDate(String(row.duty_date))} · {String(row.location ?? "Lokasi belum diisi")}</p></div>{(own || canManage) && row.status !== "completed" ? <form action={completeDuty}><input type="hidden" name="id" value={String(row.id)} /><button className="min-h-10 rounded-xl border border-[var(--tg-border)] px-3 text-sm font-bold">Selesai</button></form> : null}</article>; })}</div> : <EmptyState icon={CalendarCheck2} title="Belum ada jadwal piket" description="Jadwal yang dibuat admin akan tampil di sini." />}</section></div></div>;
}
