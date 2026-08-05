"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ school_id: z.string().uuid() });

export async function selectActiveSchool(formData: FormData) {
  const parsed = schema.safeParse({ school_id: formData.get("school_id") });
  if (!parsed.success) redirect("/school/select?error=invalid");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/school/select");

  const { error } = await supabase.rpc("set_active_school", {
    target_school_id: parsed.data.school_id,
  });

  if (error) redirect("/school/select?error=forbidden");
  redirect("/dashboard");
}
