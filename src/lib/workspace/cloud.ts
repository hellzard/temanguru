"use client";

import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getDeviceId } from "./db";
import type { CloudWorkspaceRow, LocalWorkspace } from "./types";

export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

export async function fetchCloudWorkspace(userId: string): Promise<CloudWorkspaceRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_workspace_snapshots")
    .select("user_id,payload,device_id,updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error("Data cloud belum dapat dibaca. Pastikan migration terbaru sudah dipasang.");
  return data as CloudWorkspaceRow | null;
}

export async function uploadCloudWorkspace(userId: string, workspace: LocalWorkspace): Promise<CloudWorkspaceRow> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_workspace_snapshots")
    .upsert({
      user_id: userId,
      payload: workspace,
      device_id: getDeviceId(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" })
    .select("user_id,payload,device_id,updated_at")
    .single();

  if (error) throw new Error("Sinkronisasi cloud gagal. Periksa koneksi dan konfigurasi Supabase.");
  return data as CloudWorkspaceRow;
}
