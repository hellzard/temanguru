import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TemplateEditorClient } from "./client";

export const metadata = { title: "Edit Templat" };

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();
  if (!profile) redirect("/login");

  const { data: template } = await supabase
    .from("document_templates")
    .select("*")
    .eq("id", id)
    .single();

  if (!template) return <div>Templat tidak ditemukan.</div>;

  return (
    <div>
      <PageHeader 
        title="Edit Templat" 
        description="Rancang tata letak dan struktur dokumen standar." 
      />
      <TemplateEditorClient initialData={template} />
    </div>
  );
}
