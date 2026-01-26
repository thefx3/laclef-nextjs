import PageHeader from "@/components/layout/PageHeader";
import PageShell from "@/components/layout/PageShell";
import UsersClient from "@/components/accueil/users/UsersClient";
import { APPS, type AppKey } from "@/lib/apps";
import {
  APP_PERMISSION_LEVELS,
  type AppPermissionLevel,
  type AppPermissionMap,
  type UserProfileRow,
  type UserProfileWithPermissions,
  type UserRole,
} from "@/lib/users/types";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const APP_KEY: AppKey = "accueil";

const createEmptyPermissions = (): AppPermissionMap =>
  APPS.reduce((acc, app) => {
    acc[app.key] = "none";
    return acc;
  }, {} as AppPermissionMap);

export default async function UsersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabaseAdmin
    .from("user_profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  const rawRole = String(me?.role ?? "USER");
  const currentRole: UserRole =
    rawRole === "ADMIN" || rawRole === "SUPER_ADMIN" ? rawRole : "USER";
  const isAdmin = currentRole === "ADMIN" || currentRole === "SUPER_ADMIN";

  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .select("user_id,email,first_name,last_name,role,created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const { data: permissionRows, error: permissionsError } = await supabaseAdmin
    .from("user_app_permissions")
    .select("user_id, app_key, level");

  if (permissionsError) throw permissionsError;

  const emptyPermissions = createEmptyPermissions();
  const appKeys = new Set(APPS.map((app) => app.key));
  const permissionLevels = new Set(APP_PERMISSION_LEVELS);
  const permissionsByUser = new Map<string, AppPermissionMap>();

  for (const row of permissionRows ?? []) {
    const userId = String(row.user_id ?? "");
    const appKey = String(row.app_key ?? "");
    const level = String(row.level ?? "");
    if (!userId || !appKeys.has(appKey as AppKey) || !permissionLevels.has(level as AppPermissionLevel)) {
      continue;
    }

    const current = permissionsByUser.get(userId) ?? { ...emptyPermissions };
    current[appKey as AppKey] = level as AppPermissionLevel;
    permissionsByUser.set(userId, current);
  }

  const currentPermission =
    permissionsByUser.get(user.id)?.[APP_KEY] ?? "none";

  if (!isAdmin && currentPermission === "none") {
    redirect("/");
  }

  const usersWithPermissions: UserProfileWithPermissions[] = (data ?? []).map(
    (profile) => ({
      ...(profile as UserProfileRow),
      app_permissions: permissionsByUser.get(profile.user_id) ?? {
        ...emptyPermissions,
      },
    })
  );

  return (
    <PageShell>
      <PageHeader title="Utilisateurs" />
      <UsersClient
        initialUsers={usersWithPermissions}
        currentRole={currentRole}
        currentUserId={user.id}
        currentAppPermission={currentPermission}
        appKey={APP_KEY}
      />
    </PageShell>
  );
}
