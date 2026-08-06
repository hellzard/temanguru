import { CalendarRange } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { FormMessage } from "@/components/dashboard/form-message";
import { PageHeader } from "@/components/dashboard/page-header";
import { SubmitButton } from "@/components/dashboard/submit-button";
import { firstParam } from "@/lib/action-result";
import { formatDate } from "@/lib/format";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";
import { activateAcademicYear, createAcademicYear } from "./actions";

export const metadata = { title: "Tahun Ajaran" };
export default async function AcademicYearsPage({ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }) {
 const params=await searchParams; const context=await requireActiveSchool(); const supabase=await createClient();
 const {data,error}=await supabase.from("academic_years").select("id,name,starts_on,ends_on,is_active").eq("school_id",context.active.schoolId).order("starts_on",{ascending:false}); if(error) throw error;
 const rows=(data??[]) as Array<Record<string,unknown>>; const canManage=['owner','admin'].includes(context.active.role);
 return <div><PageHeader title="Tahun Ajaran" description="Satu tahun ajaran aktif menjadi konteks kelas, jadwal, dan penugasan." />
 <div className="mt-7 grid gap-6 xl:grid-cols-[.7fr_1.3fr]">{canManage?<section className="tg-card p-5"><h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.035em]">Tambah tahun ajaran</h2><form action={createAcademicYear} className="mt-5 space-y-4"><FormMessage error={firstParam(params.error)} success={firstParam(params.success)} /><label className="block text-sm font-bold">Nama<input name="name" placeholder="2026/2027" required className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-bold">Mulai<input type="date" name="starts_on" required className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" /></label><label className="block text-sm font-bold">Selesai<input type="date" name="ends_on" required className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" /></label></div><SubmitButton>Simpan</SubmitButton></form></section>:<div className="tg-card p-5 text-sm tg-muted">Anda memiliki akses baca sebagai guru.</div>}
 <section>{rows.length?<div className="tg-card divide-y divide-[var(--tg-border)]">{rows.map(row=><article key={String(row.id)} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center"><div className="flex-1"><div className="flex items-center gap-2"><h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.035em]">{String(row.name)}</h2>{row.is_active?<span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">Aktif</span>:null}</div><p className="mt-1 text-sm tg-muted">{formatDate(String(row.starts_on))} – {formatDate(String(row.ends_on))}</p></div>{canManage&&!row.is_active?<form action={activateAcademicYear}><input type="hidden" name="id" value={String(row.id)} /><button className="min-h-10 rounded-xl border border-[var(--tg-border)] px-3 text-sm font-bold">Jadikan aktif</button></form>:null}</article>)}</div>:<EmptyState icon={CalendarRange} title="Belum ada tahun ajaran" description="Buat tahun ajaran sebelum menambahkan kelas dan penugasan." />}</section></div></div>;
}
