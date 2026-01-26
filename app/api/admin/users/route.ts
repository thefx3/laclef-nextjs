import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { APPS } from "@/lib/apps";
import type { AppKey } from "@/lib/apps";
import {
  APP_PERMISSION_LEVELS,
  type AppPermissionLevel,
  type AppPermissionMap,
} from "@/lib/users/types";

const ROLE_OPTIONS = ["USER", "ADMIN", "SUPER_ADMIN"] as const;

type UserRole = (typeof ROLE_OPTIONS)[number];

const ADMIN_ROLES = new Set<UserRole>(["ADMIN", "SUPER_ADMIN"]);
const APP_KEYS = new Set(APPS.map((app) => app.key));
const PERMISSION_LEVELS = new Set(APP_PERMISSION_LEVELS);
const LEVEL_RANK: Record<AppPermissionLevel, number> = {
  none: 0,
  viewer: 1,
  editor: 2,
};

const isUserRole = (value: string): value is UserRole =>
  ROLE_OPTIONS.includes(value as UserRole);
const isAppKey = (value: string): value is AppKey => APP_KEYS.has(value as AppKey);
const isPermissionLevel = (value: string): value is AppPermissionLevel =>
  PERMISSION_LEVELS.has(value as AppPermissionLevel);

const createEmptyPermissions = (): AppPermissionMap =>
  APPS.reduce((acc, app) => {
    acc[app.key] = "none";
    return acc;
  }, {} as AppPermissionMap);

const normalizePermissions = (input: unknown): AppPermissionMap => {
  const base = createEmptyPermissions();
  if (!input || typeof input !== "object" || Array.isArray(input)) return base;

  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (!isAppKey(key)) continue;
    const next = String(value ?? "");
    if (isPermissionLevel(next)) {
      base[key] = next;
    }
  }

  return base;
};

const permissionsFromRows = (
  rows: { app_key?: string | null; level?: string | null }[]
): AppPermissionMap => {
  const base = createEmptyPermissions();
  for (const row of rows) {
    const appKey = String(row.app_key ?? "");
    const level = String(row.level ?? "");
    if (!isAppKey(appKey) || !isPermissionLevel(level)) continue;
    base[appKey] = level;
  }
  return base;
};

const toPermissionRows = (userId: string, permissions: AppPermissionMap) =>
  Object.entries(permissions)
    .filter(([, level]) => level !== "none")
    .map(([appKey, level]) => ({ user_id: userId, app_key: appKey, level }));

const resolveAppKey = (value: unknown): AppKey | null => {
  const raw = String(value ?? "accueil").trim();
  return isAppKey(raw) ? raw : null;
};

async function readBody(req: Request) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

async function requireAccess(
  req: Request,
  appKey: AppKey,
  minLevel: AppPermissionLevel
) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return { error: "Token manquant", status: 401 } as const;
  }
  const token = auth.replace("Bearer ", "");
  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !userData.user) {
    return { error: "Token invalide", status: 401 } as const;
  }

  const { data: profile, error: profileErr } = await supabaseAdmin
    .from("user_profiles")
    .select("role")
    .eq("user_id", userData.user.id)
    .single();

  if (profileErr) {
    return { error: profileErr.message, status: 403 } as const;
  }
  if (!profile) {
    return { error: "Profil introuvable", status: 403 } as const;
  }

  const rawRole = String(profile.role ?? "USER");
  const role = isUserRole(rawRole) ? rawRole : "USER";

  const isAdmin = ADMIN_ROLES.has(role);
  if (isAdmin) {
    return {
      user: userData.user,
      role,
      isAdmin: true,
      appLevel: "editor" as AppPermissionLevel,
    } as const;
  }

  const { data: permission, error: permissionErr } = await supabaseAdmin
    .from("user_app_permissions")
    .select("level")
    .eq("user_id", userData.user.id)
    .eq("app_key", appKey)
    .maybeSingle();

  if (permissionErr) {
    return { error: permissionErr.message, status: 403 } as const;
  }

  const level = isPermissionLevel(String(permission?.level ?? ""))
    ? (permission!.level as AppPermissionLevel)
    : "none";

  if (LEVEL_RANK[level] < LEVEL_RANK[minLevel]) {
    return { error: "Acces interdit", status: 403 } as const;
  }

  return {
    user: userData.user,
    role,
    isAdmin: false,
    appLevel: level,
  } as const;
}

export async function POST(req: Request) {
  const body = await readBody(req);
  if (!body) {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const appKey = resolveAppKey(body.app_key);
  if (!appKey) {
    return NextResponse.json({ error: "App invalide" }, { status: 400 });
  }

  const auth = await requireAccess(req, appKey, "none");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (
    Object.prototype.hasOwnProperty.call(body, "app_permissions") &&
    (typeof body.app_permissions !== "object" ||
      body.app_permissions === null ||
      Array.isArray(body.app_permissions))
  ) {
    return NextResponse.json({ error: "Permissions invalides" }, { status: 400 });
  }

  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");
  const firstName = String(body.first_name ?? "").trim();
  const lastName = String(body.last_name ?? "").trim();
  const roleInput = String(body.role ?? "USER").trim();

  if (!email || !password) {
    return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
  }
  if (!isUserRole(roleInput)) {
    return NextResponse.json({ error: "Role invalide" }, { status: 400 });
  }
  if (!auth.isAdmin && roleInput !== "USER") {
    return NextResponse.json(
      { error: "Permission insuffisante pour ce role" },
      { status: 403 }
    );
  }
  if (roleInput === "SUPER_ADMIN" && auth.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Permission insuffisante pour ce role" },
      { status: 403 }
    );
  }

  const permissions = normalizePermissions(body.app_permissions);
  const scopedPermissions = auth.isAdmin
    ? permissions
    : (() => {
        const limited = createEmptyPermissions();
        limited[appKey] = permissions[appKey];
        return limited;
      })();

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message ?? "Creation du compte impossible" },
      { status: 400 }
    );
  }

  const { data: profile, error: profileErr } = await supabaseAdmin
    .from("user_profiles")
    .upsert(
      {
        user_id: data.user.id,
        email,
        role: roleInput,
        first_name: firstName || null,
        last_name: lastName || null,
      },
      { onConflict: "user_id" }
    )
    .select("user_id, email, first_name, last_name, role, created_at")
    .single();

  if (profileErr || !profile) {
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    return NextResponse.json(
      { error: profileErr?.message ?? "Creation du profil impossible" },
      { status: 400 }
    );
  }

  const permissionRows = toPermissionRows(data.user.id, scopedPermissions);
  if (permissionRows.length > 0) {
    const { error: permissionsErr } = await supabaseAdmin
      .from("user_app_permissions")
      .upsert(permissionRows, { onConflict: "user_id,app_key" });

    if (permissionsErr) {
      await supabaseAdmin.auth.admin.deleteUser(data.user.id);
      await supabaseAdmin.from("user_profiles").delete().eq("user_id", data.user.id);
      return NextResponse.json(
        { error: permissionsErr.message },
        { status: 400 }
      );
    }
  }

  return NextResponse.json(
    { user_profile: { ...profile, app_permissions: scopedPermissions } },
    { status: 201 }
  );
}

export async function PATCH(req: Request) {
  const body = await readBody(req);
  if (!body) {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const appKey = resolveAppKey(body.app_key);
  if (!appKey) {
    return NextResponse.json({ error: "App invalide" }, { status: 400 });
  }

  const auth = await requireAccess(req, appKey, "editor");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const userId = String(body.user_id ?? "").trim();
  const hasRole = Object.prototype.hasOwnProperty.call(body, "role");
  const hasEmail = Object.prototype.hasOwnProperty.call(body, "email");
  const hasFirstName = Object.prototype.hasOwnProperty.call(body, "first_name");
  const hasLastName = Object.prototype.hasOwnProperty.call(body, "last_name");
  const hasPassword = Object.prototype.hasOwnProperty.call(body, "password");
  const hasAppPermissions = Object.prototype.hasOwnProperty.call(body, "app_permissions");

  const roleInput = hasRole ? String(body.role ?? "").trim() : "";
  const email = hasEmail ? String(body.email ?? "").trim() : "";
  const firstName = hasFirstName ? String(body.first_name ?? "").trim() : "";
  const lastName = hasLastName ? String(body.last_name ?? "").trim() : "";
  const password = hasPassword ? String(body.password ?? "") : "";

  if (!userId) {
    return NextResponse.json({ error: "user_id requis" }, { status: 400 });
  }
  if (!hasRole && !hasEmail && !hasFirstName && !hasLastName && !hasPassword && !hasAppPermissions) {
    return NextResponse.json(
      { error: "Aucune modification demandee" },
      { status: 400 }
    );
  }
  if (hasRole && !roleInput) {
    return NextResponse.json({ error: "Role requis" }, { status: 400 });
  }
  if (hasRole && !isUserRole(roleInput)) {
    return NextResponse.json({ error: "Role invalide" }, { status: 400 });
  }
  if (hasRole && roleInput === "SUPER_ADMIN" && auth.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Permission insuffisante pour ce role" },
      { status: 403 }
    );
  }
  if (hasEmail && !email) {
    return NextResponse.json({ error: "Email requis" }, { status: 400 });
  }
  if (hasPassword && !password) {
    return NextResponse.json({ error: "Mot de passe requis" }, { status: 400 });
  }
  if (!auth.isAdmin && userId !== auth.user.id) {
    return NextResponse.json({ error: "Acces interdit" }, { status: 403 });
  }
  if (!auth.isAdmin && hasRole) {
    return NextResponse.json({ error: "Acces interdit" }, { status: 403 });
  }
  if (!auth.isAdmin && hasAppPermissions) {
    return NextResponse.json({ error: "Acces interdit" }, { status: 403 });
  }
  if (
    hasAppPermissions &&
    (typeof body.app_permissions !== "object" ||
      body.app_permissions === null ||
      Array.isArray(body.app_permissions))
  ) {
    return NextResponse.json({ error: "Permissions invalides" }, { status: 400 });
  }

  if (email) {
    const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { email }
    );
    if (emailError) {
      return NextResponse.json({ error: emailError.message }, { status: 400 });
    }
  }
  if (password) {
    const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password }
    );
    if (passwordError) {
      return NextResponse.json({ error: passwordError.message }, { status: 400 });
    }
  }

  const profileUpdates: Record<string, string | null> = {};
  if (hasRole && roleInput) profileUpdates.role = roleInput;
  if (hasEmail) profileUpdates.email = email || null;
  if (hasFirstName) profileUpdates.first_name = firstName || null;
  if (hasLastName) profileUpdates.last_name = lastName || null;

  let updatedProfile = null;
  if (Object.keys(profileUpdates).length > 0) {
    const { data: profile, error } = await supabaseAdmin
      .from("user_profiles")
      .update(profileUpdates)
      .eq("user_id", userId)
      .select("user_id, email, first_name, last_name, role, created_at")
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { error: error?.message ?? "Mise a jour impossible" },
        { status: 400 }
      );
    }

    updatedProfile = profile;
  } else {
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("user_id, email, first_name, last_name, role, created_at")
      .eq("user_id", userId)
      .single();

    updatedProfile = profile ?? null;
  }

  if (!updatedProfile) {
    return NextResponse.json(
      { error: "Profil introuvable" },
      { status: 404 }
    );
  }

  let responsePermissions: AppPermissionMap | null = null;
  if (hasAppPermissions) {
    const permissions = normalizePermissions(body.app_permissions);
    responsePermissions = auth.isAdmin
      ? permissions
      : (() => {
          const limited = createEmptyPermissions();
          limited[appKey] = permissions[appKey];
          return limited;
        })();

    const permissionRows = toPermissionRows(userId, responsePermissions);
    if (permissionRows.length > 0) {
      const { error: permissionsErr } = await supabaseAdmin
        .from("user_app_permissions")
        .upsert(permissionRows, { onConflict: "user_id,app_key" });

      if (permissionsErr) {
        return NextResponse.json(
          { error: permissionsErr.message },
          { status: 400 }
        );
      }
    }

    const toClear = Object.entries(responsePermissions)
      .filter(([, level]) => level === "none")
      .map(([key]) => key);

    if (toClear.length > 0) {
      const { error: clearErr } = await supabaseAdmin
        .from("user_app_permissions")
        .delete()
        .eq("user_id", userId)
        .in("app_key", toClear);

      if (clearErr) {
        return NextResponse.json(
          { error: clearErr.message },
          { status: 400 }
        );
      }
    }
  }

  if (!responsePermissions) {
    const { data: rows, error } = await supabaseAdmin
      .from("user_app_permissions")
      .select("app_key, level")
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    responsePermissions = permissionsFromRows(rows ?? []);
  }

  return NextResponse.json({
    user_profile: { ...updatedProfile, app_permissions: responsePermissions },
  });
}

export async function DELETE(req: Request) {
  const body = await readBody(req);
  if (!body) {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const appKey = resolveAppKey(body.app_key);
  if (!appKey) {
    return NextResponse.json({ error: "App invalide" }, { status: 400 });
  }

  const auth = await requireAccess(req, appKey, "editor");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!auth.isAdmin) {
    return NextResponse.json({ error: "Acces interdit" }, { status: 403 });
  }

  const userId = String(body.user_id ?? "").trim();
  if (!userId) {
    return NextResponse.json({ error: "user_id requis" }, { status: 400 });
  }
  if (userId === auth.user.id) {
    return NextResponse.json({ error: "Suppression interdite" }, { status: 403 });
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabaseAdmin.from("user_app_permissions").delete().eq("user_id", userId);
  await supabaseAdmin.from("user_profiles").delete().eq("user_id", userId);

  return NextResponse.json({ ok: true });
}
