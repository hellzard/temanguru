"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.string().trim().email("Masukkan alamat email yang valid.");

export async function requestMagicLink(formData: FormData) {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) redirect("/login?error=email-tidak-valid");

  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) redirect("/login?error=gagal-mengirim-tautan");
  redirect("/login?sent=1");
}
