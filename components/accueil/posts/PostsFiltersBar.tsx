"use client";

import type { PostType } from "@/lib/posts/types";
import { TYPE_OPTIONS, POST_TYPE_LABELS } from "@/lib/posts/types";
import type { FilterState, SecondaryFilter, PrimaryScope } from "@/lib/posts/postsFilters";
type Props = {
  state: FilterState;
  authors: string[];
  onChange: (next: FilterState) => void;
  mineDisabledAuthor?: boolean;
};

const SECONDARY: { key: SecondaryFilter; label: string }[] = [
  { key: "ALL", label: "Tous" },
  { key: "TODAY", label: "Aujourd’hui" },
  { key: "YESTERDAY", label: "Hier" },
  { key: "SINCE_WEEK", label: "Depuis 7 jours" },
  { key: "PAST", label: "Passés" },
  { key: "FUTURE", label: "À venir" },
  { key: "ON_DATE", label: "À une date" },
];

export default function PostsFiltersBar({ state, authors, onChange }: Props) {
  const scopeBtn = (label: string, value: PrimaryScope) => (
    <button
      type="button"
      onClick={() => onChange({ ...state, scope: value })}
      className={`btn-filter ${state.scope === value ? "btn-filter--active" : "btn-filter--inactive"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-3">
      {/* Scope */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-slate-700">Affichage :</span>
        {scopeBtn("Tous les postes", "ALL")}
        {scopeBtn("Mes postes", "MINE")}
      </div>

      {/* Secondary */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-slate-700">Période :</span>
        {SECONDARY.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => onChange({ ...state, secondary: f.key })}
            className={`btn-filter ${state.secondary === f.key ? "btn-filter--active" : "btn-filter--inactive"}`}
          >
            {f.label}
          </button>
        ))}

        {state.secondary === "ON_DATE" && (
          <input
            type="date"
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
            onChange={(e) => {
              const v = e.target.value;
              onChange({
                ...state,
                date: v ? new Date(v + "T00:00:00") : undefined,
              });
            }}
          />
        )}
      </div>

      {/* Advanced */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Type */}
        <div>
          <label className="text-xs font-semibold text-slate-600">Type</label>
          <select
            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            value={state.type ?? "ALL"}
            onChange={(e) => onChange({ ...state, type: e.target.value as PostType | "ALL" })}
          >
            <option value="ALL">Tous</option>
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {POST_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        {/* Author */}
        <div>
          <label className="text-xs font-semibold text-slate-600">Auteur</label>
          <select
            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm disabled:opacity-60"
            value={state.author ?? "ALL"}
            disabled={state.scope === "MINE"}
            onChange={(e) => onChange({ ...state, author: e.target.value })}
          >
            <option value="ALL">Tous</option>
            {authors.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          {state.scope === "MINE" && (
            <p className="mt-1 text-xs text-slate-500">Désactivé en mode “Mes postes”.</p>
          )}
        </div>

        {/* Search */}
        <div>
          <label className="text-xs font-semibold text-slate-600">Recherche</label>
          <input
            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Contenu, auteur, type…"
            value={state.search ?? ""}
            onChange={(e) => onChange({ ...state, search: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
