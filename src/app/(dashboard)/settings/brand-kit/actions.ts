"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateBrandKit(formData: FormData) {
  const supabase = await createClient();
  
  // Get active school
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthenticated" };

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();
  if (!profile) return { error: "Profile not found" };

  // For this MVP, we assume the user is only in one school, so we fetch their first school
  const { data: members } = await supabase.from("school_members").select("school_id").eq("user_id", profile.id).limit(1);
  if (!members || members.length === 0) return { error: "Tidak memiliki akses ke sekolah." };
  
  const schoolId = members[0].school_id;

  const primaryColor = formData.get("primary_color") as string;
  const schoolName = formData.get("school_name") as string;
  const address = formData.get("address") as string;
  const contact = formData.get("contact") as string;
  
  const file = formData.get("logo") as File | null;
  let logoUrl = formData.get("current_logo_url") as string;

  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop();
    const filePath = `${schoolId}/logo-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from("teman-guru-assets")
      .upload(filePath, file, { upsert: true });
      
    if (uploadError) {
      return { error: `Gagal mengunggah logo: ${uploadError.message}` };
    }
    
    // Actually the bucket is private, but for MVP we might just store the path and use signed URLs or just rely on supabase.storage later.
    // Wait, if it's private, we should save the filePath and then generate signed URLs later.
    logoUrl = filePath;
  }

  const letterheadConfig = {
    schoolName,
    address,
    contact
  };

  const { error: upsertError } = await supabase
    .from("brand_kits")
    .upsert({
      school_id: schoolId,
      logo_url: logoUrl,
      primary_color: primaryColor,
      letterhead_config: letterheadConfig
    }, { onConflict: "school_id" });

  if (upsertError) {
    return { error: `Gagal menyimpan brand kit: ${upsertError.message}` };
  }

  revalidatePath("/settings/brand-kit");
  return { success: true };
}
