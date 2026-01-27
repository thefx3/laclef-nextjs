import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/users/types";

export const getViewerServer = cache(async () => {
  const supabase = await createClient();

  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;

  const user = userRes.user;
  if (!user) return { user: null, role: "USER" };

  const { data: profile, error: profileErr } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profileErr) throw profileErr;

  const rawRole = String(profile?.role ?? "USER");
  const role: UserRole =
    rawRole === "ADMIN" || rawRole === "SUPER_ADMIN" ? rawRole : "USER";

  return { user, role };
});

export async function requireAdmin() {
  const { user, role } = await getViewerServer();
  if (!user) redirect("/login");
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") redirect("/"); // ou /accueil
  return { user, role };
}