import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";
import { BrandKitClient } from "./client";
import { redirect } from "next/navigation";

export const metadata = { title: "Brand Kit Sekolah" };

export default async function BrandKitPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();
  if (!profile) redirect("/login");

  const { data: members } = await supabase.from("school_members").select("school_id").eq("user_id", profile.id).limit(1);
  if (!members || members.length === 0) return <div>Anda tidak memiliki sekolah aktif.</div>;
  
  const schoolId = members[0].school_id;

  const { data: brandKit } = await supabase
    .from("brand_kits")
    .select("*")
    .eq("school_id", schoolId)
    .single();

  let signedLogoUrl = null;
  if (brandKit?.logo_url) {
    const { data } = await supabase.storage.from("teman-guru-assets").createSignedUrl(brandKit.logo_url, 60 * 60);
    signedLogoUrl = data?.signedUrl || null;
  }

  return (
    <div>
      <PageHeader 
        title="Brand Kit Sekolah" 
        description="Atur identitas visual sekolah Anda yang akan digunakan dalam ekspor dokumen resmi." 
      />
      <BrandKitClient initialData={brandKit} signedLogoUrl={signedLogoUrl} />
    </div>
  );
}
