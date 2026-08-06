import { Paintbrush } from "lucide-react";
import { FormMessage } from "@/components/dashboard/form-message";
import { PageHeader } from "@/components/dashboard/page-header";
import { SubmitButton } from "@/components/dashboard/submit-button";
import { firstParam } from "@/lib/action-result";
import { requireActiveSchool } from "@/lib/schools/active-school";
import { createClient } from "@/lib/supabase/server";
import { saveBrandKit } from "./actions";

export const metadata = { title: "Brand Kit Sekolah" };

export default async function BrandKitPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const context = await requireActiveSchool();
  const supabase = await createClient();
  const { data, error } = await supabase.from("brand_kits").select("school_name,address,phone,email,website,primary_color,secondary_color").eq("school_id", context.active.schoolId).maybeSingle();
  if (error) throw error;
  const canManage = ["owner", "admin"].includes(context.active.role);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Brand Kit Sekolah" description="Identitas ini digunakan sebagai sumber data dokumen sekolah. Logo, tanda tangan, dan stempel tetap disimpan di bucket privat." />
      <section className="tg-card mt-7 p-5 sm:p-7">
        <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--tg-primary)_12%,transparent)] text-[var(--tg-primary)]"><Paintbrush size={21} /></span><div><h2 className="font-bold">Identitas dokumen</h2><p className="text-sm tg-muted">Tidak mengubah nama sekolah pada keanggotaan.</p></div></div>
        <form action={saveBrandKit} className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2"><FormMessage error={firstParam(params.error)} success={firstParam(params.success)} /></div>
          <label className="block text-sm font-bold">Nama pada dokumen<input name="school_name" defaultValue={data?.school_name ?? context.active.schoolName} disabled={!canManage} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3 disabled:opacity-70" /></label>
          <label className="block text-sm font-bold">Email<input type="email" name="email" defaultValue={data?.email ?? ""} disabled={!canManage} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3 disabled:opacity-70" /></label>
          <label className="block text-sm font-bold">Telepon<input name="phone" defaultValue={data?.phone ?? ""} disabled={!canManage} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3 disabled:opacity-70" /></label>
          <label className="block text-sm font-bold">Website<input type="url" name="website" defaultValue={data?.website ?? ""} placeholder="https://sekolah.sch.id" disabled={!canManage} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3 disabled:opacity-70" /></label>
          <label className="block text-sm font-bold sm:col-span-2">Alamat<textarea name="address" rows={4} defaultValue={data?.address ?? ""} disabled={!canManage} className="mt-2 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] p-3 disabled:opacity-70" /></label>
          <label className="block text-sm font-bold">Warna utama<input type="color" name="primary_color" defaultValue={data?.primary_color ?? "#4f46e5"} disabled={!canManage} className="mt-2 h-12 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] p-1 disabled:opacity-70" /></label>
          <label className="block text-sm font-bold">Warna sekunder<input type="color" name="secondary_color" defaultValue={data?.secondary_color ?? "#0ea5e9"} disabled={!canManage} className="mt-2 h-12 w-full rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] p-1 disabled:opacity-70" /></label>
          {canManage ? <div className="sm:col-span-2"><SubmitButton>Simpan brand kit</SubmitButton></div> : <p className="sm:col-span-2 text-sm tg-muted">Anda memiliki akses baca. Owner atau admin dapat mengubah data ini.</p>}
        </form>
      </section>
    </div>
  );
}
