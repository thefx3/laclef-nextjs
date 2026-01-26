"use client";
import { supabase } from "@/lib/supabase/browser";
import { useId, useState } from "react";
import { APPS, type AppItem, type AppKey } from "@/lib/apps";
import {
  ROLE_OPTIONS,
  type AppPermissionLevel,
  type AppPermissionMap,
  type UserProfileWithPermissions,
  type UserRole,
} from "@/lib/users/types";
import {
  createUserApi,
  deleteUserApi,
  updateUserApi,
} from "@/lib/users/adminUsersApi.client";

const PERMISSION_COLUMNS: { value: AppPermissionLevel; label: string }[] = [
  { value: "none", label: "Aucune" },
  { value: "viewer", label: "Lecteur" },
  { value: "editor", label: "Editeur" },
];

const rolePill = (role: UserRole) => {
  switch (role) {
    case "SUPER_ADMIN":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    case "ADMIN":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
};

const permissionPill = (level: AppPermissionLevel) => {
  switch (level) {
    case "editor":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "viewer":
      return "bg-sky-50 text-sky-700 ring-sky-200";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-200";
  }
};

const createEmptyPermissions = (): AppPermissionMap =>
  APPS.reduce((acc, app) => {
    acc[app.key] = "none";
    return acc;
  }, {} as AppPermissionMap);

const createRoleDefaultPermissions = (role: UserRole): AppPermissionMap => {
  const level: AppPermissionLevel =
    role === "ADMIN" || role === "SUPER_ADMIN" ? "editor" : "viewer";

  return APPS.reduce((acc, app) => {
    acc[app.key] = level;
    return acc;
  }, {} as AppPermissionMap);
};

const normalizePermissions = (
  input?: Partial<AppPermissionMap> | null
): AppPermissionMap => {
  const base = createEmptyPermissions();
  if (!input) return base;

  for (const [key, value] of Object.entries(input)) {
    if (!Object.prototype.hasOwnProperty.call(base, key)) continue;
    if (!value) continue;
    base[key as AppKey] = value as AppPermissionLevel;
  }

  return base;
};

const fieldBase =
  "mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none";
const cardBase = "rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm";
const labelBase = "text-xs font-semibold text-slate-600";
const buttonPrimary =
  "rounded-lg bg-slate-900 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60 cursor-pointer";
const buttonSecondary =
  "rounded-lg border border-slate-200 px-3 py-2 text-sm cursor-pointer";
const buttonTiny =
  "rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-50 cursor-pointer";
const buttonDanger =
  "rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:text-rose-800 disabled:opacity-50 cursor-pointer";
const buttonDangerSmall =
  "rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-700 cursor-pointer";
const buttonConfirmDelete =
  "rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-slate-200 disabled:opacity-60 cursor-pointer";
const confirmRow =
  "rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700";

function PermissionSummary({ permissions }: { permissions: AppPermissionMap }) {
  const enabled = APPS.filter((app) => permissions[app.key] !== "none");
  if (enabled.length === 0) {
    return <span className="text-slate-400">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {enabled.map((app) => {
        const level = permissions[app.key];
        return (
          <span
            key={app.key}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${permissionPill(
              level
            )}`}
          >
            {app.label}
            <span className="text-[10px] uppercase">{level}</span>
          </span>
        );
      })}
    </div>
  );
}

function PermissionsTable({
  apps,
  permissions,
  onChange,
  disabled,
}: {
  apps: ReadonlyArray<AppItem>;
  permissions: AppPermissionMap;
  onChange?: (appKey: AppKey, level: AppPermissionLevel) => void;
  disabled?: boolean;
}) {
  const groupId = useId();
  const isDisabled = disabled || !onChange;

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-3 py-2 text-left">Permissions</th>
            {PERMISSION_COLUMNS.map((column) => (
              <th key={column.value} className="px-3 py-2 text-center">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {apps.map((app) => (
            <tr key={app.key} className="hover:bg-slate-50/60">
              <td className="px-3 py-2 font-medium text-slate-700">
                {app.label}
              </td>
              {PERMISSION_COLUMNS.map((column) => {
                const checked = permissions[app.key] === column.value;
                return (
                  <td key={column.value} className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      name={`${groupId}-${app.key}`}
                      value={column.value}
                      checked={checked}
                      onChange={(event) => {
                        if (!onChange) return;
                        const nextLevel = event.target.checked
                          ? column.value
                          : "none";
                        onChange(app.key, nextLevel);
                      }}
                      disabled={isDisabled}
                      aria-label={`${app.label} ${column.label}`}
                      className="h-4 w-4 accent-slate-900 disabled:opacity-50"
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CreateUserForm({
  appKey,
  canAssignRoles,
  isSuperAdmin,
  permissionApps,
  onCreated,
  onError,
}: {
  appKey: AppKey;
  canAssignRoles: boolean;
  isSuperAdmin: boolean;
  permissionApps: ReadonlyArray<AppItem>;
  onCreated: (user: UserProfileWithPermissions) => void;
  onError: (message: string | null) => void;
}) {
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("USER");
  const [newPermissions, setNewPermissions] = useState<AppPermissionMap>(
    createRoleDefaultPermissions("USER")
  );
  const [creating, setCreating] = useState(false);

  const resetCreateForm = () => {
    setNewEmail("");
    setNewPassword("");
    setNewFirstName("");
    setNewLastName("");
    setNewRole("USER");
    setNewPermissions(createRoleDefaultPermissions("USER"));
  };

  const handleCreateUser = async () => {
    onError(null);
    const nextEmail = newEmail.trim();
    const nextFirst = newFirstName.trim();
    const nextLast = newLastName.trim();
    if (!nextEmail || !newPassword || !nextFirst || !nextLast) {
      onError("Email, mot de passe, prénom et nom sont requis.");
      return;
    }

    setCreating(true);
    try {
      const result = await createUserApi({
        appKey,
        email: nextEmail,
        password: newPassword,
        role: canAssignRoles ? newRole : "USER",
        firstName: nextFirst,
        lastName: nextLast,
        appPermissions: newPermissions,
      });

      const createdProfile = result.user_profile;
      if (createdProfile) {
        onCreated(createdProfile);
      }

      resetCreateForm();
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className={`${cardBase} p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm uppercase tracking-widest font-semibold text-slate-900">
          Créer un compte
        </h2>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
        <label className={labelBase}>
          Prénom
          <input
            className={fieldBase}
            placeholder="Prénom"
            value={newFirstName}
            onChange={(e) => setNewFirstName(e.target.value)}
          />
        </label>
        <label className={labelBase}>
          Nom
          <input
            className={fieldBase}
            placeholder="Nom"
            value={newLastName}
            onChange={(e) => setNewLastName(e.target.value)}
          />
        </label>
        <label className={labelBase}>
          Email
          <input
            className={fieldBase}
            placeholder="Email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
        </label>
        <label className={labelBase}>
          Mot de passe
          <input
            className={fieldBase}
            placeholder="Mot de passe"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </label>
        <label className={labelBase}>
          Rôle
          <select
            className={fieldBase}
            value={newRole}
            onChange={(e) => {
              const nextRole = e.target.value as UserRole;
              setNewRole(nextRole);
              setNewPermissions(createRoleDefaultPermissions(nextRole));
            }}
            disabled={!canAssignRoles}
          >
            {(canAssignRoles
              ? ROLE_OPTIONS.filter((r) => isSuperAdmin || r !== "SUPER_ADMIN")
              : ["USER"]
            ).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <button
          className={`${buttonPrimary} mt-4 px-4 py-1`}
          disabled={creating}
          onClick={handleCreateUser}
        >
          {creating ? "Création…" : "Créer"}
        </button>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Accès apps
        </p>
        <PermissionsTable
          apps={permissionApps}
          permissions={newPermissions}
          onChange={(appKeyValue, level) =>
            setNewPermissions((prev) => ({
              ...prev,
              [appKeyValue]: level,
            }))
          }
        />
      </div>
    </section>
  );
}

function UsersTable({
  users,
  currentUserId,
  canShowActions,
  canManageUser,
  onManage,
}: {
  users: UserProfileWithPermissions[];
  currentUserId: string;
  canShowActions: boolean;
  canManageUser: (user: UserProfileWithPermissions) => boolean;
  onManage: (user: UserProfileWithPermissions) => void;
}) {
  return (
    <section className={cardBase}>
      <div className="w-full">
        <table className="w-full text-sm">
          <colgroup>
            <col className="w-[26%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[24%]" />
            <col className="w-[14%]" />
          </colgroup>
          <thead className="bg-slate-50 text-left text-slate-700">
            <tr>
              <th className="px-4 py-3 text-left justify-items-start">
                Email
              </th>
              <th className="px-4 py-3 text-left hidden sm:table-cell">
                Prénom
              </th>
              <th className="px-4 py-3 text-left hidden sm:table-cell">
                Nom
              </th>
              <th className="px-4 py-3 text-left">Rôle</th>
              <th className="px-4 py-3 text-left">Apps</th>
              {canShowActions && (
                <th className="px-4 py-3 text-left">Actions</th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {users.map((u) => {
              const canManage = canManageUser(u);

              return (
                <tr key={u.user_id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900 break-words">
                        {u.email ?? "—"}
                      </span>
                      {u.user_id === currentUserId && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          Vous
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700 hidden md:table-cell">
                    {u.first_name ?? "—"}
                  </td>
                  <td className="px-4 py-4 text-slate-700 hidden md:table-cell">
                    {u.last_name ?? "—"}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${rolePill(
                        u.role
                      )}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <PermissionSummary permissions={u.app_permissions} />
                  </td>

                  {canShowActions && (
                    <td className="px-4 py-4 text-left whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          className={buttonTiny}
                          disabled={!canManage}
                          onClick={() => onManage(u)}
                        >
                          Gérer
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}

            {users.length === 0 && (
              <tr>
                <td
                  className="px-4 py-6 text-center text-slate-500"
                  colSpan={canShowActions ? 6 : 5}
                >
                  Aucun utilisateur.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function EditUserModal({
  editing,
  currentUserId,
  appKey,
  permissionApps,
  canEditProfile,
  canResetPassword,
  canEditRole,
  canEditAppPermissions,
  canDelete,
  isAdmin,
  isSuperAdmin,
  onClose,
  onUpdated,
  onDeleted,
  onError,
  error,
}: {
  editing: UserProfileWithPermissions;
  currentUserId: string;
  appKey: AppKey;
  permissionApps: ReadonlyArray<AppItem>;
  canEditProfile: boolean;
  canResetPassword: boolean;
  canEditRole: boolean;
  canEditAppPermissions: boolean;
  canDelete: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  onClose: () => void;
  onUpdated: (user: UserProfileWithPermissions) => void;
  onDeleted: (userId: string) => void;
  onError: (message: string | null) => void;
  error: string | null;
}) {
  const [editRole, setEditRole] = useState<UserRole>(editing.role);
  const [editEmail, setEditEmail] = useState(editing.email ?? "");
  const [editFirstName, setEditFirstName] = useState(editing.first_name ?? "");
  const [editLastName, setEditLastName] = useState(editing.last_name ?? "");
  const [editPassword, setEditPassword] = useState("");
  const [editPermissions, setEditPermissions] = useState<AppPermissionMap>(
    normalizePermissions(editing.app_permissions)
  );
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isSelf = editing.user_id === currentUserId;
  const canEditPassword = canResetPassword;

const handleSaveEdit = async () => {
  onError(null);

  const nextEmail = editEmail.trim();
  if (canEditProfile && !nextEmail) {
    onError("Email requis.");
    return;
  }

  setSavingEdit(true);

  const nextFirst = editFirstName.trim();
  const nextLast = editLastName.trim();
  const nextPassword = editPassword.trim();
  const shouldUpdatePassword = canEditPassword && nextPassword.length > 0;

  try {
    // 1) Mot de passe du compte courant -> Supabase Auth (self uniquement)
    if (shouldUpdatePassword && isSelf) {
      const { error: pwdError } = await supabase.auth.updateUser({
        password: nextPassword,
      });
      if (pwdError) throw new Error(pwdError.message);
    }

    // 2) SELF (non-admin) : pas d'API /api/admin/users
    if (isSelf && !isAdmin) {
      // email (Auth) - optionnel (souvent confirmation email)
      if (nextEmail !== (editing.email ?? "")) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: nextEmail,
        });
        if (emailError) throw new Error(emailError.message);
      }

      if (canEditProfile) {
        const { error: profileError } = await supabase
          .from("user_profiles")
          .update({
            email: nextEmail,
            first_name: nextFirst || null,
            last_name: nextLast || null,
            // surtout PAS role ici
          })
          .eq("user_id", editing.user_id);

        if (profileError) throw new Error(profileError.message);

        onUpdated({
          ...editing,
          email: nextEmail,
          first_name: nextFirst || null,
          last_name: nextLast || null,
        });
      }

      setEditPassword("");
      onClose();
      return;
    }

    if (
      !canEditProfile &&
      !shouldUpdatePassword &&
      !canEditRole &&
      !canEditAppPermissions
    ) {
      onError("Mot de passe requis.");
      return;
    }

    // 3) ADMIN : endpoint /api/admin/users
    const result = await updateUserApi({
      appKey,
      userId: editing.user_id,
      email: canEditProfile ? nextEmail : undefined,
      firstName: canEditProfile ? nextFirst || null : undefined,
      lastName: canEditProfile ? nextLast || null : undefined,
      role: canEditRole ? editRole : undefined,
      password:
        !isSelf && shouldUpdatePassword && isAdmin ? nextPassword : undefined,
      appPermissions: canEditAppPermissions ? editPermissions : undefined,
    });

    if (result?.user_profile) onUpdated(result.user_profile);

    setEditPassword("");
    onClose();
  } catch (e) {
    onError((e as Error).message);
  } finally {
    setSavingEdit(false);
  }
};


  const handleDeleteUser = async () => {
    if (!canDelete) {
      onError("Suppression interdite.");
      return;
    }
    onError(null);
    setDeletingUserId(editing.user_id);
    try {
      await deleteUserApi(editing.user_id, appKey);
      onDeleted(editing.user_id);
      onClose();
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setDeletingUserId(null);
      setConfirmDelete(false);
    }
  };

  const permissionTableApps = canEditAppPermissions ? permissionApps : APPS;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center backdrop-blur bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-slate-800">
              Modifier
            </h2>
          </div>
          <button
            className="text-sm font-semibold text-slate-600 hover:underline cursor-pointer"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className={labelBase}>
              Email
              <input
                className={fieldBase}
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                disabled={!canEditProfile}
              />
            </label>
            {isAdmin && canEditRole ? (
              <label className={labelBase}>
                Rôle
                <select
                  className={fieldBase}
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  disabled={!canEditRole}
                >
                  {ROLE_OPTIONS.filter(
                    (r) => isSuperAdmin || r !== "SUPER_ADMIN"
                  ).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <div className={labelBase}>
                Rôle
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${rolePill(
                      editing.role
                    )}`}
                  >
                    {editing.role}
                  </span>
                </div>
              </div>
            )}
          </div>

          {canEditPassword && (
            <label className={labelBase}>
              Nouveau mot de passe
              <input
                className={fieldBase}
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Laisser vide pour ne pas changer"
              />
            </label>
          )}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className={labelBase}>
              Prénom
              <input
                className={fieldBase}
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                disabled={!canEditProfile}
              />
            </label>
            <label className={labelBase}>
              Nom
              <input
                className={fieldBase}
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
                disabled={!canEditProfile}
              />
            </label>
          </div>

          <div className="space-y-2">
            <p className={labelBase}>Accès apps</p>
            <PermissionsTable
              apps={permissionTableApps}
              permissions={editPermissions}
              onChange={
                canEditAppPermissions
                  ? (appKeyValue, level) =>
                      setEditPermissions((prev) => ({
                        ...prev,
                        [appKeyValue]: level,
                      }))
                  : undefined
              }
              disabled={!canEditAppPermissions}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            {canDelete ? (
              <button
                className={buttonDanger}
                disabled={deletingUserId === editing.user_id}
                onClick={() => setConfirmDelete(true)}
              >
                {deletingUserId === editing.user_id
                  ? "Suppression…"
                  : "Supprimer"}
              </button>
            ) : (
              <span />
            )}
            <button className={buttonSecondary} onClick={onClose}>
              Annuler
            </button>

            <button
              className={`${buttonPrimary} px-4 py-2`}
              disabled={savingEdit || deletingUserId === editing.user_id}
              onClick={handleSaveEdit}
            >
              {savingEdit ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
          {confirmDelete && (
            <div className={confirmRow}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  Confirmer la suppression de{" "}
                  <span className="font-semibold text-rose-800">
                    {editing.email ?? "cet utilisateur"}
                  </span>
                  .
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    className={buttonDangerSmall}
                    onClick={() => setConfirmDelete(false)}
                    disabled={deletingUserId === editing.user_id}
                  >
                    Annuler
                  </button>
                  <button
                    className={buttonConfirmDelete}
                    onClick={handleDeleteUser}
                    disabled={deletingUserId === editing.user_id}
                  >
                    {deletingUserId === editing.user_id
                      ? "Suppression…"
                      : "Confirmer"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UsersClient({
  initialUsers,
  currentRole,
  currentUserId,
  currentAppPermission,
  appKey,
}: {
  initialUsers: UserProfileWithPermissions[];
  currentRole: UserRole;
  currentUserId: string;
  currentAppPermission: AppPermissionLevel;
  appKey: AppKey;
}) {
  const [users, setUsers] = useState<UserProfileWithPermissions[]>(initialUsers);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<UserProfileWithPermissions | null>(null);

  const isAdmin = currentRole === "ADMIN" || currentRole === "SUPER_ADMIN";
  const isSuperAdmin = currentRole === "SUPER_ADMIN";
  const canAssignRoles = isAdmin;
  const canManageUsers = isAdmin || currentAppPermission === "editor";
  const canCreate = canManageUsers;
  const permissionApps = isAdmin
    ? APPS
    : APPS.filter((app) => app.key === appKey);

  const canEditProfile = (u: UserProfileWithPermissions) => {
    if (isSuperAdmin) return true;
    if (isAdmin) {
      if (u.role === "SUPER_ADMIN") return false;
      if (u.role === "ADMIN" && u.user_id !== currentUserId) return false;
      return true;
    }
    return u.user_id === currentUserId;
  };

  const canDeleteUser = (u: UserProfileWithPermissions) => {
    if (isSuperAdmin) return u.user_id !== currentUserId;
    if (isAdmin) {
      if (u.user_id === currentUserId) return false;
      if (u.role === "SUPER_ADMIN") return false;
      if (u.role === "ADMIN") return false;
      return true;
    }
    return false;
  };

  const canResetPassword = (u: UserProfileWithPermissions) => {
    if (isAdmin) return true;
    return u.user_id === currentUserId;
  };

  const canManageUser = (u: UserProfileWithPermissions) =>
    canEditProfile(u) || canResetPassword(u);

  const canShowActions = isAdmin || users.some((u) => u.user_id === currentUserId);
  const canEditProfileEditing = !!editing && canEditProfile(editing);
  const canResetPasswordEditing = !!editing && canResetPassword(editing);
  const canEditRole =
    !!editing &&
    canEditProfileEditing &&
    isAdmin &&
    (isSuperAdmin || editing.role !== "SUPER_ADMIN");
  const canEditAppPermissions = isAdmin && canEditProfileEditing;
  const canDeleteEditing = !!editing && canDeleteUser(editing);

  const handleCreatedUser = (user: UserProfileWithPermissions) => {
    setUsers((prev) => [user, ...prev]);
  };

  const handleUpdatedUser = (user: UserProfileWithPermissions) => {
    setUsers((prev) =>
      prev.map((existing) =>
        existing.user_id === user.user_id ? user : existing
      )
    );
  };

  const handleDeletedUser = (userId: string) => {
    setUsers((prev) => prev.filter((user) => user.user_id !== userId));
  };

  return (
    <div className="space-y-6">
      {!editing && error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">
          {error}
        </div>
      )}

      {canCreate && (
        <CreateUserForm
          appKey={appKey}
          canAssignRoles={canAssignRoles}
          isSuperAdmin={isSuperAdmin}
          permissionApps={permissionApps}
          onCreated={handleCreatedUser}
          onError={setError}
        />
      )}

      <UsersTable
        users={users}
        currentUserId={currentUserId}
        canShowActions={canShowActions}
        canManageUser={canManageUser}
        onManage={(user) => {
          setError(null);
          setEditing(user);
        }}
      />

      {editing && (
        <EditUserModal
          key={editing.user_id}
          editing={editing}
          currentUserId={currentUserId}
          appKey={appKey}
          permissionApps={permissionApps}
          canEditProfile={canEditProfileEditing}
          canResetPassword={canResetPasswordEditing}
          canEditRole={canEditRole}
          canEditAppPermissions={canEditAppPermissions}
          canDelete={canDeleteEditing}
          isAdmin={isAdmin}
          isSuperAdmin={isSuperAdmin}
          onClose={() => {
            setError(null);
            setEditing(null);
          }}
          onUpdated={handleUpdatedUser}
          onDeleted={handleDeletedUser}
          onError={setError}
          error={error}
        />
      )}
    </div>
  );
}
