"use client";

import { memo } from "react";
import { cn } from "@/lib/posts/cn";
import type { SortKey, SortState, StudentRow, Tab } from "@/lib/students/types";
import { formatAge, formatDate, formatGender, formatYesNo } from "@/lib/students/utils";

function SortHeader({ label, indicator, onClick }: { label: string; indicator: string; onClick: () => void }) {
  return (
    <button className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900" type="button" onClick={onClick}>
      <span className="text-gray-400">⇅</span>
      {label} {indicator}
    </button>
  );
}

function StudentsTableBase({
  tab,
  rows,
  emptyColSpan,
  sortState,
  onSort,
  onRowClick,
  onDelete,
}: {
  tab: Tab;
  rows: StudentRow[];
  emptyColSpan: number;
  sortState: SortState;
  onSort: (key: SortKey) => void;
  onRowClick: (student: StudentRow) => void;
  onDelete: (student: StudentRow) => void;
}) {
  const sortLabel = (key: SortKey) => {
    if (!sortState || sortState.key !== key) return "";
    return sortState.direction === "asc" ? "↑" : "↓";
  };

  return (
    <div className="rounded-xl border bg-white overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            {tab !== "LEAD" && <th className="px-4 py-3 text-left">Dossier</th>}
            <th className="px-4 py-3 text-left">Civilité</th>
            <th className="px-4 py-3 text-left">
              <SortHeader label="Nom" indicator={sortLabel("last_name")} onClick={() => onSort("last_name")} />
            </th>
            <th className="px-4 py-3 text-left">
              <SortHeader label="Prénom" indicator={sortLabel("first_name")} onClick={() => onSort("first_name")} />
            </th>
            <th className="px-4 py-3 text-left">Classe S1</th>
            <th className="px-4 py-3 text-left">Classe S2</th>
            {tab !== "ENROLLED" && <th className="px-4 py-3 text-left">Note</th>}
            <th className="px-4 py-3 text-left">Arrivée</th>
            <th className="px-4 py-3 text-left">Départ</th>
            {tab !== "LEAD" && <th className="px-4 py-3 text-left">Âge</th>}
            {tab === "ENROLLED" && <th className="px-4 py-3 text-left">Lieu naissance</th>}
            {tab !== "LEAD" && <th className="px-4 py-3 text-left">Au pair</th>}
            <th className="px-4 py-3 text-left">Pré-inscription</th>
            <th className="px-4 py-3 text-left">150€</th>
            <th className="px-4 py-3 text-left">Paiement total</th>
            <th className="px-4 py-3 text-left">Statut</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center text-gray-500" colSpan={emptyColSpan}>
                Aucun résultat.
              </td>
            </tr>
          ) : (
            rows.map((student) => (
              <tr
                key={student.id}
                className="cursor-pointer transition hover:bg-gray-50"
                onClick={() => onRowClick(student)}
              >
                {tab !== "LEAD" && <td className="px-4 py-3">{student.dossier_number ?? "—"}</td>}
                <td className="px-4 py-3">{formatGender(student.gender)}</td>
                <td className="px-4 py-3">{student.last_name}</td>
                <td className="px-4 py-3">{student.first_name}</td>
                <td className="px-4 py-3">{student.class_s1_code ?? "—"}</td>
                <td className="px-4 py-3">{student.class_s2_code ?? "—"}</td>
                {tab !== "ENROLLED" && <td className="px-4 py-3">{student.note ?? "—"}</td>}
                <td className="px-4 py-3">{formatDate(student.arrival_date)}</td>
                <td className="px-4 py-3">{formatDate(student.departure_date)}</td>
                {tab !== "LEAD" && <td className="px-4 py-3">{formatAge(student.birth_date)}</td>}
                {tab === "ENROLLED" && <td className="px-4 py-3">{student.birth_place ?? "—"}</td>}
                {tab !== "LEAD" && <td className="px-4 py-3">{formatYesNo(student.is_au_pair)}</td>}
                <td className="px-4 py-3">{formatYesNo(student.pre_registration)}</td>
                <td className={cn("px-4 py-3", student.pre_registration ? "" : "text-gray-400")}>
                  {student.pre_registration ? formatYesNo(student.paid_150) : "—"}
                </td>
                <td className="px-4 py-3">{formatYesNo(student.paid_total)}</td>
                <td className="px-4 py-3">
                  {student.record_kind === "ENROLLED" ? (
                    <span className="badge badge--green">Inscrit</span>
                  ) : student.record_kind === "PRE_REGISTERED" ? (
                    "Pré-inscrit"
                  ) : student.record_kind === "LEFT" ? (
                    "Sorti"
                  ) : (
                    "Lead"
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    className={cn("btn-action", "btn-action--delete")}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(student);
                    }}
                    type="button"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export const StudentsTable = memo(StudentsTableBase);
StudentsTable.displayName = "StudentsTable";
