"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateDocument(id: string, variables: Record<string, string>, status: 'draft' | 'submitted' = 'draft') {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthenticated" };

  const { error } = await supabase
    .from("school_documents")
    .update({
      variables,
      status
    })
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/documents/${id}`);
  revalidatePath(`/documents`);
  return { success: true };
}
