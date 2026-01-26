import { supabase } from "@/lib/supabase/browser";
import type { AppKey } from "@/lib/apps";
import type {
  AppPermissionMap,
  UserProfileWithPermissions,
  UserRole,
} from "@/lib/users/types";

type AdminUsersResponse = {
  user_profile?: UserProfileWithPermissions;
};

async function adminFetch<T>(
  method: "POST" | "PATCH" | "DELETE",
  body: Record<string, unknown>
): Promise<T> {
  const { data, error } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (error || !token) throw new Error("Not authenticated");

  const res = await fetch("/api/admin/users", {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson
    ? await res.json().catch(() => null)
    : await res.text().catch(() => "");

  if (!res.ok) {
    const message =
      typeof payload === "string" && payload
        ? payload
        : (payload as { error?: string } | null)?.error;
    throw new Error(message || `Erreur serveur (${res.status})`);
  }

  if (!payload || typeof payload !== "object") {
    return {} as T;
  }

  return payload as T;
}

type CreateUserInput = {
  appKey: AppKey;
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  appPermissions: AppPermissionMap;
};

export async function createUserApi(input: CreateUserInput) {
  return adminFetch<AdminUsersResponse>("POST", {
    app_key: input.appKey,
    email: input.email,
    password: input.password,
    role: input.role,
    first_name: input.firstName,
    last_name: input.lastName,
    app_permissions: input.appPermissions,
  });
}

type UpdateUserInput = {
  appKey: AppKey;
  userId: string;
  email?: string;
  role?: UserRole;
  firstName?: string | null;
  lastName?: string | null;
  password?: string;
  appPermissions?: AppPermissionMap;
};

export async function updateUserApi(input: UpdateUserInput) {
  const payload: Record<string, unknown> = {
    app_key: input.appKey,
    user_id: input.userId,
  };
  if (input.email !== undefined) payload.email = input.email;
  if (input.role !== undefined) payload.role = input.role;
  if (input.firstName !== undefined) payload.first_name = input.firstName;
  if (input.lastName !== undefined) payload.last_name = input.lastName;
  if (input.password !== undefined) payload.password = input.password;
  if (input.appPermissions !== undefined) {
    payload.app_permissions = input.appPermissions;
  }

  return adminFetch<AdminUsersResponse>("PATCH", payload);
}

export async function deleteUserApi(userId: string, appKey: AppKey) {
  await adminFetch<{ ok: true }>("DELETE", { user_id: userId, app_key: appKey });
}