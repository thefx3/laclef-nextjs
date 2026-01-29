import PageHeader from "@/components/layout/PageHeader";
import PageShell from "@/components/layout/PageShell";
import UsersClient from "@/components/accueil/users/UsersClient";
import type { UserProfileRow } from "@/lib/users/types";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getViewerServer } from "@/lib/auth/viewer.server";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const { user, role: currentRole } = await getViewerServer();
  if (!user) redirect("/login");

  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .select("user_id,email,first_name,last_name,role,created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const users = (data ?? []) as UserProfileRow[];

  return (
    <PageShell>
      <PageHeader title="Utilisateurs" />
      <UsersClient
        initialUsers={users}
        currentRole={currentRole}
        currentUserId={user.id}
      />
    </PageShell>
  );
}
