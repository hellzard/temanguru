import { notFound } from "next/navigation";
import { CheckCircle2, FileText } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { FormMessage } from "@/components/dashboard/form-message";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusPill } from "@/components/dashboard/status-pill";
import { SubmitButton } from "@/components/dashboard/submit-button";
import { firstParam } from "@/lib/action-result";
import { formatDate, formatDateTime } from "@/lib/format";
import { relationText } from "@/lib/relations";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";
import { createMeetingDecision, saveMeetingMinutes, updateMeetingDecisionStatus } from "../actions";

export const metadata = { title: "Detail Rapat" };

export default async function MeetingDetailPage({ params, searchParams }: { params: Promise<{ meetingId: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { meetingId } = await params;
  const query = await searchParams;
  const context = await requireActiveSchool();
  const supabase = await createClient();
  const [meetingResult, decisionResult, memberResult] = await Promise.all([
    supabase.from("meetings").select("id,title,agenda,location,starts_at,ends_at,status,minutes,created_by").eq("id", meetingId).eq("school_id", context.active.schoolId).maybeSingle(),
    supabase.from("meeting_decisions").select("id,decision,pic_id,due_on,status").eq("meeting_id", meetingId).eq("school_id", context.active.schoolId).order("created_at"),
    supabase.from("school_members").select("id,profiles(display_name)").eq("school_id", context.active.schoolId).eq("status", "active"),
  ]);
  if (meetingResult.error || !meetingResult.data) notFound();
  if (decisionResult.error || memberResult.error) throw decisionResult.error ?? memberResult.error;
  const meeting = meetingResult.data as Record<string, unknown>;
  const decisions = (decisionResult.data ?? []) as Array<Record<string, unknown>>;
  const members = (memberResult.data ?? []) as Array<Record<string, unknown>>;
  const memberMap = new Map(members.map((member) => [String(member.id), relationText(member.profiles, "display_name", "Anggota")]));
  const canManage = ["owner", "admin"].includes(context.active.role) || meeting.created_by === context.userId;

  return <div><PageHeader eyebrow={`${formatDateTime(String(meeting.starts_at))} · ${String(meeting.location ?? "Lokasi belum ditentukan")}`} title={String(meeting.title)} description={meeting.agenda ? String(meeting.agenda) : "Simpan notulen dan tindak lanjut rapat."} action={<StatusPill value={String(meeting.status)} />} /><div className="mt-6"><FormMessage error={firstParam(query.error)} success={firstParam(query.success)} /></div><div className="mt-6 grid gap-6 xl:grid-cols-[.9fr_1.1fr]"><section className="tg-card p-5"><div className="flex items-center gap-2"><FileText size={20} className="text-[var(--tg-primary)]" /><h2 className="font-bold">Notulen</h2></div><form action={saveMeetingMinutes} className="mt-4 space-y-4"><input type="hidden" name="meeting_id" value={meetingId} /><label className="block text-sm font-bold">Status<select name="status" defaultValue={String(meeting.status)} disabled={!canManage} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3 disabled:opacity-70">{["scheduled", "ongoing", "completed", "cancelled"].map((status) => <option key={status} value={status}>{status}</option>)}</select></label><label className="block text-sm font-bold">Isi notulen<textarea name="minutes" rows={14} maxLength={20000} defaultValue={meeting.minutes ? String(meeting.minutes) : ""} disabled={!canManage} className="mt-2 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] p-3 disabled:opacity-70" /></label>{canManage ? <SubmitButton>Simpan notulen</SubmitButton> : <p className="text-sm tg-muted">Anda memiliki akses baca.</p>}</form></section><section><div className="flex items-center gap-2"><CheckCircle2 size={20} className="text-[var(--tg-primary)]" /><h2 className="font-bold">Keputusan & tindak lanjut</h2></div>{decisions.length ? <div className="mt-4 space-y-3">{decisions.map((decision) => <article key={String(decision.id)} className="tg-card p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start"><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{String(decision.decision)}</h3><StatusPill value={String(decision.status)} /></div><p className="mt-2 text-sm tg-muted">PIC: {decision.pic_id ? memberMap.get(String(decision.pic_id)) ?? "Anggota" : "Belum ditentukan"}{decision.due_on ? ` · Tenggat ${formatDate(String(decision.due_on))}` : ""}</p></div>{canManage || String(decision.pic_id ?? "") === context.active.id ? <form action={updateMeetingDecisionStatus} className="flex gap-2"><input type="hidden" name="meeting_id" value={meetingId} /><input type="hidden" name="decision_id" value={String(decision.id)} /><select name="status" defaultValue={String(decision.status)} className="min-h-10 rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-2 text-sm">{["open", "in_progress", "done", "cancelled"].map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select><button className="min-h-10 rounded-xl border border-[var(--tg-border)] px-3 text-sm font-bold">Simpan</button></form> : null}</div></article>)}</div> : <div className="mt-4"><EmptyState icon={CheckCircle2} title="Belum ada keputusan" description="Catat keputusan yang membutuhkan PIC dan tenggat." /></div>}{["owner", "admin"].includes(context.active.role) ? <form action={createMeetingDecision} className="tg-card mt-4 space-y-3 p-5"><input type="hidden" name="meeting_id" value={meetingId} /><h3 className="font-bold">Tambah keputusan</h3><textarea name="decision" required rows={4} maxLength={2000} placeholder="Isi keputusan" className="w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] p-3" /><select name="pic_id" className="min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3"><option value="">Belum ada PIC</option>{members.map((member) => <option key={String(member.id)} value={String(member.id)}>{relationText(member.profiles, "display_name", "Anggota")}</option>)}</select><input type="date" name="due_on" className="min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" /><SubmitButton>Tambah keputusan</SubmitButton></form> : null}</section></div></div>;
}
