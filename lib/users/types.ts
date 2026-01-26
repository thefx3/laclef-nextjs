import type { AppKey } from "@/lib/apps";

export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

export const ROLE_OPTIONS: UserRole[] = ["USER", "ADMIN", "SUPER_ADMIN"];

export type AppPermissionLevel = "none" | "viewer" | "editor";

export const APP_PERMISSION_LEVELS: AppPermissionLevel[] = [
  "none",
  "viewer",
  "editor",
];

export type UserProfileRow = {
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  created_at: string;
};

export type UserAppPermissionRow = {
  user_id: string;
  app_key: AppKey;
  level: AppPermissionLevel;
};

export type AppPermissionMap = Record<AppKey, AppPermissionLevel>;

export type UserProfileWithPermissions = UserProfileRow & {
  app_permissions: AppPermissionMap;
};