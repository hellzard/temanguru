import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, LayoutTemplate } from "lucide-react";

export const metadata = { title: "Templat Dokumen" };

export default async function TemplatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();
  if (!profile) redirect("/login");

  const { data: members } = await supabase.from("school_members").select("school_id, role").eq("user_id", profile.id).limit(1);
  if (!members || members.length === 0) return <div>Anda tidak memiliki sekolah aktif.</div>;
  
  const schoolId = members[0].school_id;
  const isAdmin = members[0].role === 'admin' || members[0].role === 'owner';

  if (!isAdmin) redirect("/documents");

  const { data: templates } = await supabase
    .from("document_templates")
    .select("id, name, category, is_active, updated_at")
    .eq("school_id", schoolId)
    .order("updated_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader 
          title="Templat Dokumen" 
          description="Kelola standar templat dokumen untuk digunakan oleh guru." 
        />
        <div className="flex items-center gap-3">
          <form action={async () => {
            "use server";
            const supabase = await createClient();
            const { data } = await supabase.from("document_templates").insert({
              school_id: schoolId,
              name: "Templat Baru",
              created_by: profile.id
            }).select("id").single();
            if (data?.id) redirect(`/documents/templates/${data.id}`);
          }}>
            <button 
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              <Plus size={20} />
              Buat Templat
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {templates && templates.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {templates.map((tpl: Record<string, unknown>) => (
              <li key={tpl.id as string}>
                <Link href={`/documents/templates/${tpl.id as string}`} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                      <LayoutTemplate size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{tpl.name as string}</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {(tpl.category as string) || "Tanpa Kategori"} • Diperbarui {new Date(tpl.updated_at as string).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      tpl.is_active ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-slate-50 text-slate-700 ring-slate-600/20'
                    }`}>
                      {tpl.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-16 text-center">
            <LayoutTemplate className="mx-auto size-12 text-slate-300" />
            <h3 className="mt-4 text-sm font-bold text-slate-900">Belum ada templat</h3>
            <p className="mt-1 text-sm text-slate-500">Buat templat pertama Anda untuk menstandarkan dokumen sekolah.</p>
          </div>
        )}
      </div>
    </div>
  );
}
