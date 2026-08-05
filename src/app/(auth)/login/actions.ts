"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { resolveTrustedOrigin, sanitizeInternalPath } from "@/lib/auth/safe-redirect";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.string().trim().email("Masukkan alamat email yang valid.");

export async function requestMagicLink(formData: FormData) {
  if (String(formData.get("company") ?? "").trim()) {
    redirect("/login?sent=1");
  }

  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) redirect("/login?error=email-tidak-valid");

  const headerStore = await headers();
  const origin = resolveTrustedOrigin(headerStore.get("origin"));
  const next = sanitizeInternalPath(String(formData.get("next") ?? ""), "/onboarding");
  const callback = new URL("/auth/callback", origin);
  callback.searchParams.set("next", next);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: {
      emailRedirectTo: callback.toString(),
      shouldCreateUser: true,
    },
  });

  if (error) {
    console.error("Magic link request failed", { code: error.code });
  }

  redirect("/login?sent=1");
}
