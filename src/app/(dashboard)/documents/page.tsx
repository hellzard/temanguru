import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, FileText, LayoutTemplate } from "lucide-react";

export const metadata = { title: "Dokumen & Surat" };

export default async function DocumentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();
  if (!profile) redirect("/login");

  const { data: members } = await supabase.from("school_members").select("school_id, role").eq("user_id", profile.id).limit(1);
  if (!members || members.length === 0) return <div>Anda tidak memiliki sekolah aktif.</div>;
  
  const schoolId = members[0].school_id;
  const isAdmin = members[0].role === 'admin' || members[0].role === 'owner';

  const { data: documents } = await supabase
    .from("school_documents")
    .select("id, title, status, created_at, document_number")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader 
          title="Dokumen & Surat" 
          description="Buat dan kelola surat resmi, SK, dan dokumen sekolah lainnya." 
        />
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link 
              href="/documents/templates"
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
            >
              <LayoutTemplate size={20} />
              Templat
            </Link>
          )}
          <Link 
            href="/documents/new"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <Plus size={20} />
            Buat Dokumen
          </Link>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {documents && documents.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {documents.map((doc: Record<string, unknown>) => (
              <li key={doc.id as string}>
                <Link href={`/documents/${doc.id as string}`} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{doc.title as string}</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {(doc.document_number as string) || "Belum ada nomor"} • {new Date(doc.created_at as string).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      doc.status === 'finalized' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                      doc.status === 'draft' ? 'bg-slate-50 text-slate-700 ring-slate-600/20' :
                      'bg-amber-50 text-amber-700 ring-amber-600/20'
                    }`}>
                      {(doc.status as string).toUpperCase()}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-16 text-center">
            <FileText className="mx-auto size-12 text-slate-300" />
            <h3 className="mt-4 text-sm font-bold text-slate-900">Belum ada dokumen</h3>
            <p className="mt-1 text-sm text-slate-500">Buat dokumen pertama Anda menggunakan templat yang tersedia.</p>
          </div>
        )}
      </div>
    </div>
  );
}
