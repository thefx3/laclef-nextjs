"use client";

import { useState } from "react";
import { ROLE_OPTIONS, type AppRole, type UserProfileRow } from "@/lib/users/types";
import {
  createUserApi,
  deleteUserApi,
  updateUserApi,
} from "@/lib/users/adminUsersApi.client";

const rolePill = (role: AppRole) => {
  switch (role) {
    case "SUPER_ADMIN":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    case "ADMIN":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "ACCUEIL":
      return "bg-sky-50 text-sky-700 ring-sky-200";
    case "MUSIQUE":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "ACTIVITES":
      return "bg-indigo-50 text-indigo-700 ring-indigo-200";
    case "FLCE":
      return "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
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
const buttonDangerSolid =
  "rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-500 disabled:opacity-60 cursor-pointer";
const buttonDangerSmall =
  "rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-700 cursor-pointer";
const buttonConfirmDelete =
  "rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-slate-200 disabled:opacity-60 cursor-pointer";
const confirmRow =
  "rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700";

export default function UsersClient({
  initialUsers,
  currentRole,
  currentUserId,
}: {
  initialUsers: UserProfileRow[];
  currentRole: AppRole;
  currentUserId: string;
}) {
  const [users, setUsers] = useState<UserProfileRow[]>(initialUsers);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = currentRole === "ADMIN" || currentRole === "SUPER_ADMIN";
  const isSuperAdmin = currentRole === "SUPER_ADMIN";
  const canCreate = currentRole === "ACCUEIL" || isAdmin;

  // create
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newRole, setNewRole] = useState<AppRole>("USER");
  const [creating, setCreating] = useState(false);

  // edit modal
  const [editing, setEditing] = useState<UserProfileRow | null>(null);
  const [editRole, setEditRole] = useState<AppRole>("USER");
  const [editEmail, setEditEmail] = useState("");
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const canEditUser = (u: UserProfileRow) => {
    if (isAdmin) {
      if (u.role === "SUPER_ADMIN" && !isSuperAdmin) return false;
      return true;
    }
    return u.user_id === currentUserId;
  };

  const canDeleteUser = (u: UserProfileRow) => {
    if (!isAdmin) return false;
    if (u.role === "SUPER_ADMIN" && !isSuperAdmin) return false;
    if (u.user_id === currentUserId) return false;
    return true;
  };

  const canShowActions = isAdmin || users.some((u) => u.user_id === currentUserId);
  const canEditRole =
    !!editing && isAdmin && (isSuperAdmin || editing.role !== "SUPER_ADMIN");
  const canDeleteEditing = !!editing && canDeleteUser(editing);

  const openEditModal = (user: UserProfileRow) => {
    setEditing(user);
    setEditRole(user.role);
    setEditEmail(user.email ?? "");
    setEditFirstName(user.first_name ?? "");
    setEditLastName(user.last_name ?? "");
    setConfirmDelete(false);
  };

  const closeEditModal = () => {
    setEditing(null);
    setConfirmDelete(false);
  };

  const resetCreateForm = () => {
    setNewEmail("");
    setNewPassword("");
    setNewFirstName("");
    setNewLastName("");
    setNewRole("USER");
  };

  const handleCreateUser = async () => {
    setError(null);
    const nextEmail = newEmail.trim();
    const nextFirst = newFirstName.trim();
    const nextLast = newLastName.trim();
    if (!nextEmail || !newPassword || !nextFirst || !nextLast) {
      setError("Email, mot de passe, prénom et nom sont requis.");
      return;
    }

    setCreating(true);
    try {
      const result = await createUserApi({
        email: nextEmail,
        password: newPassword,
        role: newRole,
        firstName: nextFirst,
        lastName: nextLast,
      });

      const createdProfile = result.user_profile;
      if (createdProfile) {
        setUsers((prev) => [createdProfile, ...prev]);
      }

      resetCreateForm();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setError(null);
    const nextEmail = editEmail.trim();
    if (!nextEmail) {
      setError("Email requis.");
      return;
    }

    setSavingEdit(true);
    const prev = users;
    const nextFirst = editFirstName.trim();
    const nextLast = editLastName.trim();

    setUsers((cur) =>
      cur.map((u) =>
        u.user_id === editing.user_id
          ? {
              ...u,
              email: nextEmail,
              first_name: nextFirst || null,
              last_name: nextLast || null,
              role: canEditRole ? editRole : u.role,
            }
          : u
      )
    );

    try {
      const result = await updateUserApi({
        userId: editing.user_id,
        email: nextEmail,
        firstName: nextFirst || null,
        lastName: nextLast || null,
        role: canEditRole ? editRole : undefined,
      });

      if (result?.user_profile) {
        const updated = result.user_profile;
        setUsers((cur) =>
          cur.map((u) => (u.user_id === updated.user_id ? updated : u))
        );
      }

      closeEditModal();
    } catch (e) {
      setUsers(prev);
      setError((e as Error).message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteUser = async (user: UserProfileRow) => {
    if (!canDeleteUser(user)) {
      setError("Suppression interdite.");
      return;
    }
    setError(null);
    setDeletingUserId(user.user_id);
    const prev = users;
    setUsers((cur) => cur.filter((x) => x.user_id !== user.user_id));
    try {
      await deleteUserApi(user.user_id);
      if (editing?.user_id === user.user_id) {
        closeEditModal();
      }
    } catch (e) {
      setUsers(prev);
      setError((e as Error).message);
    } finally {
      setDeletingUserId(null);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">
          {error}
        </div>
      )}

      {/* CREATE */}
      {canCreate && (
        <section className={`${cardBase} p-5`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm uppercase tracking-widest font-semibold text-slate-900">Créer un compte</h2>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
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
                onChange={(e) => setNewRole(e.target.value as AppRole)}
              >
                {ROLE_OPTIONS.filter((r) => isSuperAdmin || r !== "SUPER_ADMIN").map((r) => (
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

        </section>
      )}

      {/* TABLE */}
      <section className={cardBase}>

        <div className="w-full overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <colgroup>
              <col className="w-[32%]" />
              <col className="w-[14%]" />
              <col className="w-[14%]" />
              <col className="w-[16%]" />
              <col className="w-[24%]" />
            </colgroup>
            <thead className="bg-slate-50 text-left text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left justify-items-start">Email</th>
                <th className="px-4 py-3 text-left">Prénom</th>
                <th className="px-4 py-3 text-left">Nom</th>
                <th className="px-4 py-3 text-left">Rôle</th>
                {canShowActions && <th className="px-4 py-3 text-left">Actions</th>}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const canEdit = canEditUser(u);

                return (
                  <tr key={u.user_id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900">{u.email ?? "—"}</span>
                        {u.user_id === currentUserId && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            Vous
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{u.first_name ?? "—"}</td>
                    <td className="px-4 py-4 text-slate-700">{u.last_name ?? "—"}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${rolePill(
                          u.role
                        )}`}
                      >
                        {u.role}
                      </span>
                    </td>

                    {canShowActions && (
                      <td className="px-4 py-4 text-left whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            className={buttonTiny}
                            disabled={!canEdit}
                            onClick={() => openEditModal(u)}
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
                    colSpan={canShowActions ? 5 : 4}
                  >
                    Aucun utilisateur.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* EDIT MODAL */}
      {editing && (
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
                onClick={closeEditModal}
              >
                Fermer
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className={labelBase}>
                  Email
                  <input
                    className={fieldBase}
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </label>
                {isAdmin ? (
                  <label className={labelBase}>
                    Rôle
                    <select
                      className={fieldBase}
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as AppRole)}
                      disabled={!canEditRole}
                    >
                      {ROLE_OPTIONS.filter((r) => isSuperAdmin || r !== "SUPER_ADMIN").map((r) => (
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

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className={labelBase}>
                  Prénom
                  <input
                    className={fieldBase}
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                  />
                </label>
                <label className={labelBase}>
                  Nom
                  <input
                    className={fieldBase}
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                {canDeleteEditing ? (
                  <button
                    className={buttonDanger}
                    disabled={deletingUserId === editing.user_id}
                    onClick={() => setConfirmDelete(true)}
                  >
                    {deletingUserId === editing.user_id ? "Suppression…" : "Supprimer"}
                  </button>
                ) : (
                  <span />
                )}
                <button
                  className={buttonSecondary}
                  onClick={closeEditModal}
                >
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
                        onClick={() => handleDeleteUser(editing)}
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
      )}
    </div>
  );
}
