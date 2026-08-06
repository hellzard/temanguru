"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateTemplate(id: string, name: string, category: string, blocks: Record<string, unknown>[]) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthenticated" };

  const { error } = await supabase
    .from("document_templates")
    .update({
      name,
      category,
      content_schema: { blocks }
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/documents/templates/${id}`);
  revalidatePath(`/documents/templates`);
  return { success: true };
}
