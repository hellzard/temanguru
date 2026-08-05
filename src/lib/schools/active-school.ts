import { createClient } from "@/lib/supabase/server";

export type ActiveSchoolRole = "owner" | "admin" | "teacher";

export type SchoolMembership = {
  id: string;
  schoolId: string;
  schoolName: string;
  role: ActiveSchoolRole;
};

export type ActiveSchoolResolution =
  | { status: "unauthenticated"; memberships: [] }
  | { status: "no-membership"; userId: string; memberships: [] }
  | { status: "selection-required"; userId: string; memberships: SchoolMembership[] }
  | { status: "ready"; userId: string; active: SchoolMembership; memberships: SchoolMembership[] };

function normalizeSchoolName(value: unknown): string {
  if (Array.isArray(value)) {
    const first = value[0] as { name?: unknown } | undefined;
    return typeof first?.name === "string" ? first.name : "Sekolah";
  }
  if (value && typeof value === "object" && "name" in value) {
    const name = (value as { name?: unknown }).name;
    return typeof name === "string" ? name : "Sekolah";
  }
  return "Sekolah";
}

export async function resolveActiveSchool(): Promise<ActiveSchoolResolution> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: "unauthenticated", memberships: [] };

  const [{ data: profile, error: profileError }, { data: rows, error: membershipError }] = await Promise.all([
    supabase.from("profiles").select("active_school_id").eq("id", user.id).maybeSingle(),
    supabase
      .from("school_members")
      .select("id, school_id, role, joined_at, schools(name)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("joined_at", { ascending: true }),
  ]);

  if (profileError) throw profileError;
  if (membershipError) throw membershipError;

  const memberships: SchoolMembership[] = (rows ?? []).map((row) => ({
    id: row.id as string,
    schoolId: row.school_id as string,
    schoolName: normalizeSchoolName(row.schools),
    role: row.role as ActiveSchoolRole,
  }));

  if (memberships.length === 0) {
    return { status: "no-membership", userId: user.id, memberships: [] };
  }

  const preferred = memberships.find((membership) => membership.schoolId === profile?.active_school_id);
  if (preferred) {
    return { status: "ready", userId: user.id, active: preferred, memberships };
  }

  if (memberships.length === 1) {
    const only = memberships[0];
    const { error } = await supabase.rpc("set_active_school", { target_school_id: only.schoolId });
    if (error) throw error;
    return { status: "ready", userId: user.id, active: only, memberships };
  }

  return { status: "selection-required", userId: user.id, memberships };
}

export async function requireActiveSchool() {
  const result = await resolveActiveSchool();
  if (result.status !== "ready") {
    throw new Error(`ACTIVE_SCHOOL_${result.status.toUpperCase().replace("-", "_")}`);
  }
  return result;
}
