import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/users/types";

export async function requireAdmin() {
  const supabase = await createClient();

  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  const user = userRes.user;

  if (userErr || !user) {
    return { ok: false as const, status: 401, error: "Not authenticated" };
  }

  const { data: profile, error: profileErr } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profileErr || !profile) {
    return { ok: false as const, status: 403, error: "Profile not found" };
  }

  const role = (profile.role ?? "USER") as UserRole;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  if (!isAdmin) {
    return { ok: false as const, status: 403, error: "Forbidden" };
  }

  return { ok: true as const, user, role };
}