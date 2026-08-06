import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FileText, ArrowRight } from "lucide-react";

export const metadata = { title: "Buat Dokumen Baru" };

export default async function NewDocumentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();
  if (!profile) redirect("/login");

  const { data: members } = await supabase.from("school_members").select("school_id").eq("user_id", profile.id).limit(1);
  if (!members || members.length === 0) return <div>Anda tidak memiliki sekolah aktif.</div>;
  
  const schoolId = members[0].school_id;

  const { data: templates } = await supabase
    .from("document_templates")
    .select("id, name, category")
    .eq("school_id", schoolId)
    .eq("is_active", true)
    .order("name");

  return (
    <div>
      <PageHeader 
        title="Pilih Templat Dokumen" 
        description="Mulai membuat surat atau dokumen dari templat yang tersedia." 
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates && templates.map(tpl => (
          <form key={tpl.id} action={async () => {
            "use server";
            const supabase = await createClient();
            const { data } = await supabase.from("school_documents").insert({
              school_id: schoolId,
              template_id: tpl.id,
              title: `Draf ${tpl.name}`,
              created_by: profile.id
            }).select("id").single();
            if (data?.id) redirect(`/documents/${data.id}`);
          }}>
            <button
              type="submit"
              className="group w-full flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md text-left"
            >
              <div className="flex items-center justify-between w-full">
                <span className="grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-700 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                  <FileText size={24} />
                </span>
                <ArrowRight size={20} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
              </div>
              <div>
                <h2 className="text-lg font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.035em] text-slate-950">{tpl.name}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {tpl.category || "Dokumen Umum"}
                </p>
              </div>
            </button>
          </form>
        ))}

        {(!templates || templates.length === 0) && (
          <div className="col-span-full py-12 text-center rounded-3xl border border-slate-200 bg-white shadow-sm">
            <FileText className="mx-auto size-12 text-slate-300" />
            <h3 className="mt-4 text-sm font-[family-name:var(--font-display)] font-extrabold tracking-[-0.03em] text-slate-900">Belum ada templat aktif</h3>
            <p className="mt-1 text-sm text-slate-500">Admin sekolah belum mengaktifkan templat dokumen apa pun.</p>
          </div>
        )}
      </div>
    </div>
  );
}
