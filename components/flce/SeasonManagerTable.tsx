"use client";

import { useState } from "react";
import type { SeasonRow } from "@/lib/seasons/seasonsRepo.server";

type SeasonAction = (formData: FormData) => void | Promise<void>;

type SeasonManagerTableProps = {
  seasons: SeasonRow[];
  isAdmin: boolean;
  createAction: SeasonAction;
  updateAction: SeasonAction;
  deleteAction: SeasonAction;
};

type SeasonFormValues = {
  id?: string;
  code: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
};

const fieldBase =
  "mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none";
const labelBase = "text-[11px] font-semibold uppercase tracking-wider text-slate-600";
const buttonPrimary =
  "rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60";
const buttonSecondary =
  "rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:text-slate-900";
const buttonDanger =
  "rounded-md border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:text-rose-800";

const formatDateInput = (value: string) => value?.slice(0, 10) ?? "";
const formatDateDisplay = (value: string) => value?.slice(0, 10) ?? "—";

function SeasonFormModal({
  open,
  title,
  submitLabel,
  onClose,
  action,
  values,
}: {
  open: boolean;
  title: string;
  submitLabel: string;
  onClose: () => void;
  action: SeasonAction;
  values: SeasonFormValues;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-[0.25em] font-semibold text-slate-800">
            {title}
          </h2>
          <button className={buttonSecondary} type="button" onClick={onClose}>
            Fermer
          </button>
        </div>

        <form
          action={action}
          className="mt-4 grid gap-2 md:grid-cols-2"
        >
          {values.id ? (
            <input type="hidden" name="id" value={values.id} />
          ) : null}
          <label className={labelBase}>
            Code
            <input
              className={fieldBase}
              name="code"
              defaultValue={values.code}
              placeholder="2024-2025"
            />
          </label>
          <label className={labelBase}>
            Début
            <input
              className={fieldBase}
              type="date"
              name="start_date"
              defaultValue={formatDateInput(values.start_date)}
            />
          </label>
          <label className={labelBase}>
            Fin
            <input
              className={fieldBase}
              type="date"
              name="end_date"
              defaultValue={formatDateInput(values.end_date)}
            />
          </label>
          <label className={`${labelBase} flex items-center gap-2`}>
            <input
              className="h-4 w-4 accent-slate-900"
              type="checkbox"
              name="is_current"
              defaultChecked={values.is_current}
            />
            Saison actuelle
          </label>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button className={buttonPrimary} type="submit">
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SeasonManagerTable({
  seasons,
  isAdmin,
  createAction,
  updateAction,
  deleteAction,
}: SeasonManagerTableProps) {
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<SeasonRow | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs uppercase tracking-[0.25em] font-semibold text-slate-800">
          Saisons
        </h2>
        {isAdmin ? (
          <button className={buttonPrimary} onClick={() => setCreateOpen(true)}>
            Ajouter une saison
          </button>
        ) : null}
      </div>

      {!isAdmin ? (
        <p className="text-sm text-slate-600">
          Lecture seule. Contacte un admin pour modifier les saisons.
        </p>
      ) : null}

      {seasons.length === 0 ? (
        <p className="text-sm text-slate-600">Aucune saison.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200/70 bg-white/80">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-700">
              <tr>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Début</th>
                <th className="px-3 py-2">Fin</th>
                <th className="px-3 py-2">Actuelle</th>
                {isAdmin ? <th className="px-3 py-2">Actions</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {seasons.map((season) => (
                <tr key={season.id}>
                  <td className="px-3 py-2 font-medium text-slate-800">
                    {season.code}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {formatDateDisplay(season.start_date)}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {formatDateDisplay(season.end_date)}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {season.is_current ? "Oui" : "Non"}
                  </td>
                  {isAdmin ? (
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          className={buttonSecondary}
                          onClick={() => setEditing(season)}
                        >
                          Modifier
                        </button>
                        <form action={deleteAction}>
                          <input type="hidden" name="id" value={season.id} />
                          <button className={buttonDanger} type="submit">
                            Supprimer
                          </button>
                        </form>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SeasonFormModal
        open={isCreateOpen}
        title="Ajouter une saison"
        submitLabel="Créer"
        onClose={() => setCreateOpen(false)}
        action={createAction}
        values={{
          code: "",
          start_date: "",
          end_date: "",
          is_current: false,
        }}
      />

      <SeasonFormModal
        open={!!editing}
        title="Modifier la saison"
        submitLabel="Enregistrer"
        onClose={() => setEditing(null)}
        action={updateAction}
        values={{
          id: editing?.id,
          code: editing?.code ?? "",
          start_date: editing?.start_date ?? "",
          end_date: editing?.end_date ?? "",
          is_current: editing?.is_current ?? false,
        }}
      />
    </div>
  );
}
