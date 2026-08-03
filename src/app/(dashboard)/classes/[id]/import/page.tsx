import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ImportCsvWizard } from "./client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Import Murid dari CSV" };

export default async function ImportCsvPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: classId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: classData } = await supabase
    .from("classes")
    .select("*, academic_years(name)")
    .eq("id", classId)
    .limit(1)
    .single();

  if (!classData) redirect("/classes");

  const { data: member } = await supabase
    .from("school_members")
    .select("school_id")
    .eq("user_id", user.id)
    .eq("school_id", classData.school_id)
    .eq("status", "active")
    .limit(1)
    .single();

  if (!member) redirect("/classes");

  return (
    <div>
      <Link href={`/classes/${classId}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition text-slate-500 hover:bg-slate-100 mb-4 -ml-4">
        <ArrowLeft size={16} className="mr-2" /> Kembali ke Kelas
      </Link>

      <PageHeader 
        title={`Import Murid ke ${classData.name}`} 
        description="Unggah file CSV yang berisi nama dan NIS murid untuk dimasukkan ke kelas ini sekaligus." 
      />
      
      <ImportCsvWizard classId={classId} />
    </div>
  );
}
