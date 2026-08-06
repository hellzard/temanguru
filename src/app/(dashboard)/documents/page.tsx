import Link from "next/link";
import { FilePlus2, FileText } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { FormMessage } from "@/components/dashboard/form-message";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusPill } from "@/components/dashboard/status-pill";
import { SubmitButton } from "@/components/dashboard/submit-button";
import { firstParam } from "@/lib/action-result";
import { formatDate } from "@/lib/format";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";
import { createDocument, finalizeDocument } from "./actions";

export const metadata = { title: "Dokumen" };

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const context = await requireActiveSchool();
  const supabase = await createClient();
  const [{ data: documents, error: documentError }, { data: templates, error: templateError }] = await Promise.all([
    supabase.from("school_documents").select("id,title,document_number,status,created_at,finalized_at,created_by").eq("school_id", context.active.schoolId).order("created_at", { ascending: false }),
    supabase.from("document_templates").select("id,name").eq("school_id", context.active.schoolId).eq("is_active", true).order("name"),
  ]);
  if (documentError || templateError) throw documentError ?? templateError;
  const rows = (documents ?? []) as Array<Record<string, unknown>>;

  return <div><PageHeader title="Dokumen Studio" description="Buat draf surat dan arsip sekolah. Tanda tangan dan stempel disimpan terpisah di storage privat." /><div className="mt-7 grid gap-6 xl:grid-cols-[.75fr_1.25fr]"><section className="tg-card p-5"><div className="flex items-center gap-3"><FilePlus2 size={21} className="text-[var(--tg-primary)]" /><h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.035em]">Dokumen baru</h2></div><form action={createDocument} className="mt-5 space-y-4"><FormMessage error={firstParam(params.error)} success={firstParam(params.success)} /><label className="block text-sm font-bold">Judul<input name="title" required className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" /></label><label className="block text-sm font-bold">Nomor dokumen<input name="document_number" className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3" /></label><label className="block text-sm font-bold">Templat<select name="template_id" className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3"><option value="">Tanpa templat</option>{((templates ?? []) as Array<Record<string, unknown>>).map((item) => <option key={String(item.id)} value={String(item.id)}>{String(item.name)}</option>)}</select></label><label className="block text-sm font-bold">Isi awal<textarea name="body" rows={7} maxLength={20000} className="mt-2 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] p-3" /></label><SubmitButton>Buat draf</SubmitButton></form></section><section>{rows.length ? <div className="space-y-3">{rows.map((item) => <article key={String(item.id)} className="tg-card p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-start"><span className="grid size-11 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--tg-primary)_12%,transparent)] text-[var(--tg-primary)]"><FileText size={21} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.035em]">{String(item.title)}</h2><StatusPill value={String(item.status)} /></div><p className="mt-1 text-sm tg-muted">{item.document_number ? String(item.document_number) : "Tanpa nomor"} · {formatDate(String(item.created_at))}</p><div className="mt-4 flex flex-wrap gap-2"><Link href={`/documents/${String(item.id)}`} className="inline-flex min-h-10 items-center rounded-xl border border-[var(--tg-border)] px-3 text-sm font-bold">Buka & cetak</Link>{item.status !== "finalized" ? <form action={finalizeDocument}><input type="hidden" name="id" value={String(item.id)} /><button className="min-h-10 rounded-xl bg-emerald-600 px-3 text-sm font-bold text-white">Finalkan</button></form> : null}</div></div></div></article>)}</div> : <EmptyState icon={FileText} title="Belum ada dokumen" description="Buat draf surat atau dokumen sekolah pertama." />}</section></div></div>;
}
