"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schoolSchema = z.object({
  schoolName: z.string().trim().min(2, "Nama sekolah terlalu pendek.").max(180),
  timezone: z.enum(["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"]),
});

export async function createSchool(formData: FormData) {
  const parsed = schoolSchema.safeParse({
    schoolName: formData.get("schoolName"),
    timezone: formData.get("timezone"),
  });

  if (!parsed.success) {
    redirect("/onboarding?error=data-tidak-valid");
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) {
    redirect("/login?error=sesi-tidak-valid");
  }

  const { error } = await supabase.rpc("create_school_with_owner", {
    school_name: parsed.data.schoolName,
    school_timezone: parsed.data.timezone,
  });

  if (error) {
    console.error("create_school_with_owner failed", {
      code: error.code,
      message: error.message,
    });
    redirect("/onboarding?error=gagal-membuat-sekolah");
  }

  redirect("/dashboard?welcome=1");
}
