import PageHeader from "@/components/layout/PageHeader";
import PageShell from "@/components/layout/PageShell";
import UsersClient from "@/components/accueil/users/UsersClient";
import type { AppRole, UserProfileRow } from "@/lib/users/types";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  const currentRole = (me?.role ?? "USER") as AppRole;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("user_id,email,first_name,last_name,role,created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (
    <PageShell>
      <PageHeader title="Utilisateurs"/>
      <UsersClient
        initialUsers={(data ?? []) as UserProfileRow[]}
        currentRole={currentRole}
        currentUserId={user.id}
      />
    </PageShell>
  );
}
