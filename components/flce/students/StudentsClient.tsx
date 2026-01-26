"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/browser";
import type { EditFormState, SortKey, SortState, StudentRow, Tab } from "@/lib/students/types";
import type { SeasonRow } from "@/lib/seasons/types";
import {
  buildEditForm,
  deriveRecordKind,
  EMPTY_FORM,
  getAge,
  hasDepartureBeforeArrival,
  validateEditForm,
} from "@/lib/students/utils";

import { StudentsTable } from "./ui/StudentsTable";
import { StudentFilters } from "./ui/StudentFilters";
import { StudentEditModal, StudentCreateModal, ConfirmDeleteModal } from "./ui/StudentModals";
import { TabButton } from "./ui/TabButton";

type FiltersState = {
  gender: "" | "M" | "F" | "X";
  classCode: string;
  birthPlace: string;
  isAuPair: "" | "true" | "false";
  preRegistration: "" | "true" | "false";
  ageMin: string;
  ageMax: string;
};

const DEFAULT_FILTERS: FiltersState = {
  gender: "",
  classCode: "",
  birthPlace: "",
  isAuPair: "",
  preRegistration: "",
  ageMin: "",
  ageMax: "",
};

export default function StudentsClient({
  initialStudents,
  selectedSeasonId,
  seasons,
}: {
  initialStudents: StudentRow[];
  selectedSeasonId: string | null;
  seasons: SeasonRow[];
}) {
  const [students, setStudents] = useState<StudentRow[]>(initialStudents);
  const [tab, setTab] = useState<Tab>("ENROLLED");
  const [sortState, setSortState] = useState<SortState>(null);
  const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS);

  const [error, setError] = useState<string | null>(null);

  // Modals
  const [editingStudent, setEditingStudent] = useState<StudentRow | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({ ...EMPTY_FORM });
  const [editErrors, setEditErrors] = useState<string[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<EditFormState>({
    ...EMPTY_FORM,
    season_id: selectedSeasonId ?? "",
  });
  const [createErrors, setCreateErrors] = useState<string[]>([]);

  const [deleteCandidate, setDeleteCandidate] = useState<StudentRow | null>(null);

  useEffect(() => {
    setStudents(initialStudents);
    setTab("ENROLLED");
    setSortState(null);
    setFilters(DEFAULT_FILTERS);
    setError(null);
    setEditingStudent(null);
    setCreateOpen(false);
    setDeleteCandidate(null);
  }, [initialStudents, selectedSeasonId]);

  // Tabs counts
  const counts = useMemo(() => {
    const byKind = { ENROLLED: 0, PRE_REGISTERED: 0, LEAD: 0, LEFT: 0 } as Record<Tab, number>;
    for (const s of students) byKind[s.record_kind as Tab] += 1;
    return byKind;
  }, [students]);

  // Active list for current tab
  const active = useMemo(() => {
    return students.filter((s) => s.record_kind === tab);
  }, [students, tab]);

  const filteredActive = useMemo(() => {
    return active.filter((student) => {
      if (filters.gender && student.gender !== filters.gender) return false;

      if (filters.classCode) {
        const needle = filters.classCode.trim().toLowerCase();
        if (!student.class_code?.toLowerCase().includes(needle)) return false;
      }

      if (filters.birthPlace) {
        const needle = filters.birthPlace.trim().toLowerCase();
        if (!student.birth_place?.toLowerCase().includes(needle)) return false;
      }

      if (filters.isAuPair) {
        const required = filters.isAuPair === "true";
        if (student.is_au_pair !== required) return false;
      }

      if (filters.preRegistration) {
        const required = filters.preRegistration === "true";
        if (student.pre_registration !== required) return false;
      }

      if (filters.ageMin || filters.ageMax) {
        const age = getAge(student.birth_date);
        if (age === null) return false;

        if (filters.ageMin) {
          const min = Number(filters.ageMin);
          if (!Number.isNaN(min) && age < min) return false;
        }
        if (filters.ageMax) {
          const max = Number(filters.ageMax);
          if (!Number.isNaN(max) && age > max) return false;
        }
      }

      return true;
    });
  }, [active, filters]);

  const sortedActive = useMemo(() => {
    if (!sortState) return filteredActive;
    const next = [...filteredActive];
    next.sort((a, b) => {
      const left = (a[sortState.key] ?? "").toString();
      const right = (b[sortState.key] ?? "").toString();
      const result = left.localeCompare(right, "fr", { sensitivity: "base" });
      return sortState.direction === "asc" ? result : -result;
    });
    return next;
  }, [filteredActive, sortState]);

  const toggleSort = useCallback((key: SortKey) => {
    setSortState((prev) => {
      if (!prev || prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return null;
    });
  }, []);

  const startEditing = useCallback(
    (student: StudentRow) => {
      setError(null);
      setEditingStudent(student);
      const base = buildEditForm(student);
      setEditForm({ ...base, season_id: student.season_id ?? selectedSeasonId ?? "" });
      setEditErrors([]);
    },
    [selectedSeasonId]
  );

  const startCreate = useCallback(() => {
    setError(null);
    setCreateErrors([]);
    setCreateForm({ ...EMPTY_FORM, season_id: selectedSeasonId ?? "" });
    setCreateOpen(true);
  }, [selectedSeasonId]);

  const isDossierNumberTaken = useCallback(
    async (dossierNumber: string, excludeId?: string) => {
      if (!dossierNumber.trim()) return false;
      let q = supabase.from("students").select("id").eq("dossier_number", dossierNumber.trim());
      if (excludeId) q = q.neq("id", excludeId);
      const { data, error } = await q;
      if (error) throw error;
      return (data?.length ?? 0) > 0;
    },
    []
  );

  // --- CREATE ---
  const createStudent = useCallback(async () => {
    setCreateErrors([]);
    setError(null);

    const nextErrors = validateEditForm(createForm);

    if (hasDepartureBeforeArrival(createForm.arrival_date, createForm.departure_date)) {
      nextErrors.push("La date de départ ne peut pas être antérieure à la date d'arrivée.");
    }

    if (createForm.dossier_number.trim()) {
      const taken = await isDossierNumberTaken(createForm.dossier_number);
      if (taken) nextErrors.push("Le numéro de dossier est déjà utilisé.");
    }

    if (nextErrors.length > 0) {
      setCreateErrors(nextErrors);
      return;
    }

    const recordKind = deriveRecordKind(createForm.pre_registration, createForm.paid_total);
    const dossierNumber = createForm.dossier_number.trim();

    const payload = {
      first_name: createForm.first_name.trim(),
      last_name: createForm.last_name.trim(),
      class_code: createForm.class_code.trim() || null,
      note: createForm.note.trim() || null,
      gender: createForm.gender || null,
      arrival_date: createForm.arrival_date || null,
      departure_date: createForm.departure_date || null,
      birth_date: createForm.birth_date || null,
      birth_place: createForm.birth_place.trim() || null,
      is_au_pair: createForm.is_au_pair,
      left_early: createForm.left_early,
      season_id: createForm.season_id || null,
      pre_registration: createForm.pre_registration,
      paid_150: createForm.paid_150 ? true : null,
      paid_total: createForm.paid_total,
      dossier_number: dossierNumber || null,
      record_kind: recordKind,
    };

    const { data: created, error: insertError } = await supabase
      .from("students")
      .insert(payload)
      .select("*, au_pair_details(*)")
      .single();

    if (insertError) {
      setError(insertError.message);
      return;
    }

    // au_pair_details
    if (createForm.is_au_pair && created?.id) {
      const { error: auPairError } = await supabase
        .from("au_pair_details")
        .upsert(
          {
            student_id: created.id,
            family_name1: createForm.family_name1.trim() || null,
            family_name2: createForm.family_name2.trim() || null,
            family_email: createForm.family_email.trim() || null,
          },
          { onConflict: "student_id" }
        );
      if (auPairError) {
        setError(auPairError.message);
        return;
      }
    }

    setStudents((prev) => [created as StudentRow, ...prev]);
    setCreateOpen(false);
  }, [createForm, isDossierNumberTaken]);

  // --- UPDATE ---
  const saveEditingStudent = useCallback(async () => {
    if (!editingStudent) return;

    setEditErrors([]);
    setError(null);

    const nextErrors = validateEditForm(editForm);

    if (hasDepartureBeforeArrival(editForm.arrival_date, editForm.departure_date)) {
      nextErrors.push("La date de départ ne peut pas être antérieure à la date d'arrivée.");
    }

    if (editForm.dossier_number.trim()) {
      const taken = await isDossierNumberTaken(editForm.dossier_number, editingStudent.id);
      if (taken) nextErrors.push("Le numéro de dossier est déjà utilisé.");
    }

    if (nextErrors.length > 0) {
      setEditErrors(nextErrors);
      return;
    }

    const recordKind = deriveRecordKind(editForm.pre_registration, editForm.paid_total);
    const dossierNumber = editForm.dossier_number.trim();

    const payload = {
      first_name: editForm.first_name.trim(),
      last_name: editForm.last_name.trim(),
      class_code: editForm.class_code.trim() || null,
      note: editForm.note.trim() || null,
      gender: editForm.gender || null,
      arrival_date: editForm.arrival_date || null,
      departure_date: editForm.departure_date || null,
      birth_date: editForm.birth_date || null,
      birth_place: editForm.birth_place.trim() || null,
      is_au_pair: editForm.is_au_pair,
      left_early: editForm.left_early,
      season_id: editForm.season_id || null,
      pre_registration: editForm.pre_registration,
      paid_150: editForm.paid_150 ? true : null,
      paid_total: editForm.paid_total,
      dossier_number: dossierNumber || null,
      record_kind: recordKind,
    };

    const { error: updateError } = await supabase
      .from("students")
      .update(payload)
      .eq("id", editingStudent.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    if (editForm.is_au_pair) {
      const { error: auPairError } = await supabase
        .from("au_pair_details")
        .upsert(
          {
            student_id: editingStudent.id,
            family_name1: editForm.family_name1.trim() || null,
            family_name2: editForm.family_name2.trim() || null,
            family_email: editForm.family_email.trim() || null,
          },
          { onConflict: "student_id" }
        );
      if (auPairError) {
        setError(auPairError.message);
        return;
      }
    } else {
      const { error: deleteAuPairError } = await supabase
        .from("au_pair_details")
        .delete()
        .eq("student_id", editingStudent.id);
      if (deleteAuPairError) {
        setError(deleteAuPairError.message);
        return;
      }
    }

    // update local list
    setStudents((prev) =>
      prev.map((s) =>
        s.id === editingStudent.id
          ? ({
              ...s,
              ...payload,
              record_kind: recordKind,
            } as StudentRow)
          : s
      )
    );

    setEditingStudent(null);
  }, [editForm, editingStudent, isDossierNumberTaken]);

  // --- DELETE ---
  const confirmDeleteStudent = useCallback(async () => {
    if (!deleteCandidate) return;

    setError(null);

    const { error: deleteError } = await supabase.from("students").delete().eq("id", deleteCandidate.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setStudents((prev) => prev.filter((s) => s.id !== deleteCandidate.id));
    if (editingStudent?.id === deleteCandidate.id) setEditingStudent(null);
    setDeleteCandidate(null);
  }, [deleteCandidate, editingStudent]);

  const emptyColSpan = useMemo(() => {
    if (tab === "ENROLLED") return 16;
    if (tab === "PRE_REGISTERED" || tab === "LEFT") return 15;
    return 12;
  }, [tab]);

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <TabButton label={`Inscrits (${counts.ENROLLED})`} active={tab === "ENROLLED"} onClick={() => setTab("ENROLLED")} />
          <TabButton label={`Pré-inscrits (${counts.PRE_REGISTERED})`} active={tab === "PRE_REGISTERED"} onClick={() => setTab("PRE_REGISTERED")} />
          <TabButton label={`Non inscrits (${counts.LEAD})`} active={tab === "LEAD"} onClick={() => setTab("LEAD")} />
          <TabButton label={`Sortis (${counts.LEFT})`} active={tab === "LEFT"} onClick={() => setTab("LEFT")} />
        </div>

        <button className="btn-primary" onClick={startCreate} type="button">
          Ajouter un élève
        </button>
      </div>

      <StudentFilters
        filters={filters}
        total={active.length}
        visible={sortedActive.length}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      <StudentsTable
        tab={tab}
        rows={sortedActive}
        emptyColSpan={emptyColSpan}
        sortState={sortState}
        onSort={toggleSort}
        onRowClick={startEditing}
        onDelete={(s) => setDeleteCandidate(s)}
      />

      {editingStudent && (
        <StudentEditModal
          student={editingStudent}
          form={editForm}
          errors={editErrors}
          seasons={seasons}
          onChange={(patch) => setEditForm((prev) => ({ ...prev, ...patch }))}
          onClose={() => setEditingStudent(null)}
          onSave={saveEditingStudent}
          onDelete={() => setDeleteCandidate(editingStudent)}
        />
      )}

      {createOpen && (
        <StudentCreateModal
          form={createForm}
          errors={createErrors}
          seasons={seasons}
          onChange={(patch) => setCreateForm((prev) => ({ ...prev, ...patch }))}
          onClose={() => setCreateOpen(false)}
          onSave={createStudent}
        />
      )}

      {deleteCandidate && (
        <ConfirmDeleteModal
          student={deleteCandidate}
          onClose={() => setDeleteCandidate(null)}
          onConfirm={confirmDeleteStudent}
        />
      )}
    </div>
  );
}
