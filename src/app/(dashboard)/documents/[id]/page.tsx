import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DocumentEditorClient } from "./client";

export const metadata = { title: "Editor Dokumen" };

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();
  if (!profile) redirect("/login");

  const { data: doc } = await supabase
    .from("school_documents")
    .select(`
      *,
      document_templates (
        name,
        content_schema
      )
    `)
    .eq("id", id)
    .single();

  if (!doc) return <div>Dokumen tidak ditemukan.</div>;

  const { data: brandKit } = await supabase
    .from("brand_kits")
    .select("*")
    .eq("school_id", doc.school_id)
    .single();

  const brandKitWithLogo = { ...brandKit };
  if (brandKit?.logo_url) {
    const { data } = await supabase.storage.from("teman-guru-assets").createSignedUrl(brandKit.logo_url, 60 * 60);
    brandKitWithLogo.logo_url = data?.signedUrl || null;
  }

  return (
    <div>
      <PageHeader 
        title={doc.title} 
        description={`Menggunakan templat: ${doc.document_templates?.name}`} 
      />
      <DocumentEditorClient doc={doc} brandKit={brandKitWithLogo} />
    </div>
  );
}
