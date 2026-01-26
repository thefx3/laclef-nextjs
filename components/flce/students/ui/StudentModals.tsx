"use client";

import Modal from "@/components/ui/Modal";
import type { EditFormState, StudentRow } from "@/lib/students/types";
import type { SeasonRow } from "@/lib/seasons/seasonsRepo.server";
import { deriveRecordKind } from "@/lib/students/utils";

const fieldBase =
  "mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none";
const labelBase = "block text-xs font-semibold text-slate-600";
const sectionTitle =
  "text-xs uppercase tracking-[0.25em] font-semibold text-slate-800";
const buttonSecondary =
  "rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:text-slate-900";

type FormPatch = Partial<EditFormState>;

function StudentFormFields({
  form,
  onChange,
  seasons,
}: {
  form: EditFormState;
  onChange: (patch: FormPatch) => void;
  seasons: SeasonRow[];
}) {
  const updatePaymentState = (patch: FormPatch) => {
    const next: EditFormState = { ...form, ...patch };

    if (patch.paid_total === true) {
      next.pre_registration = true;
      next.paid_150 = true;
    }

    if (patch.paid_150 === true) {
      next.pre_registration = true;
    }

    if (patch.pre_registration === false) {
      next.paid_150 = false;
      next.paid_total = false;
    }

    if (patch.paid_150 === false) {
      next.paid_total = false;
    }

    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className={labelBase}>
          Civilité
          <select
            className={fieldBase}
            value={form.gender}
            onChange={(e) =>
              onChange({ gender: e.target.value as EditFormState["gender"] })
            }
          >
            <option value="">—</option>
            <option value="M">Mr</option>
            <option value="F">Mrs</option>
            <option value="X">X</option>
          </select>
        </label>
        <label className={labelBase}>
          Prénom
          <input
            className={fieldBase}
            value={form.first_name}
            onChange={(e) => onChange({ first_name: e.target.value })}
          />
        </label>
        <label className={labelBase}>
          Nom
          <input
            className={fieldBase}
            value={form.last_name}
            onChange={(e) => onChange({ last_name: e.target.value })}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className={labelBase}>
          Classe
          <input
            className={fieldBase}
            value={form.class_code}
            onChange={(e) => onChange({ class_code: e.target.value })}
          />
        </label>
        <label className={labelBase}>
          Saison
          <select
            className={fieldBase}
            value={form.season_id}
            onChange={(e) => onChange({ season_id: e.target.value })}
          >
            <option value="">—</option>
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.code}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className={labelBase}>
          Arrivée
          <input
            className={fieldBase}
            type="date"
            value={form.arrival_date}
            onChange={(e) => onChange({ arrival_date: e.target.value })}
          />
        </label>
        
          <label className={labelBase}>
            Départ
            <input
              className={fieldBase}
              type="date"
              value={form.departure_date}
              onChange={(e) => onChange({ departure_date: e.target.value })}
            />
          </label>
        </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          className="h-4 w-4 rounded accent-slate-900"
          type="checkbox"
          checked={form.left_early}
          onChange={(e) => onChange({ left_early: e.target.checked })}
        />
        Départ anticipé
      </label>
        
      <label className={labelBase}>
        Note
        <textarea
          className={fieldBase}
          rows={3}
          value={form.note}
          onChange={(e) => onChange({ note: e.target.value })}
        />
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className={labelBase}>
          Dossier
          <input
            className={fieldBase}
            value={form.dossier_number}
            onChange={(e) => onChange({ dossier_number: e.target.value })}
          />
        </label>
        <label className={labelBase}>
          Au pair
          <select
            className={fieldBase}
            value={form.is_au_pair ? "true" : "false"}
            onChange={(e) => {
              const next = e.target.value === "true";
              onChange({
                is_au_pair: next,
                family_name1: next ? form.family_name1 : "",
                family_name2: next ? form.family_name2 : "",
                family_email: next ? form.family_email : "",
              });
            }}
          >
            <option value="false">Non</option>
            <option value="true">Oui</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className={labelBase}>
          Date de naissance
          <input
            className={fieldBase}
            type="date"
            value={form.birth_date}
            onChange={(e) => onChange({ birth_date: e.target.value })}
          />
        </label>
        <label className={labelBase}>
          Lieu de naissance
          <input
            className={fieldBase}
            value={form.birth_place}
            onChange={(e) => onChange({ birth_place: e.target.value })}
          />
        </label>
      </div>

      <p className={labelBase}>Statut & paiement</p>
      <div className="flex flex-row place-items-center justify-between">
        <label className="flex content-center items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 accent-slate-900"
            checked={form.pre_registration}
            onChange={(e) => updatePaymentState({ pre_registration: e.target.checked })}
          />
          Pré-inscription
        </label>
        <label className="flex content-center items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 accent-slate-900"
            checked={form.paid_150}
            onChange={(e) => updatePaymentState({ paid_150: e.target.checked })}
          />
          150€
        </label>
        <label className="flex content-center items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 accent-slate-900"
            checked={form.paid_total}
            onChange={(e) => updatePaymentState({ paid_total: e.target.checked })}
          />
          Paiement total
        </label>
      </div>

      {form.is_au_pair ? (
        <div className="grid gap-3 md:grid-cols-3">
          <label className={labelBase}>
            Famille 1
            <input
              className={fieldBase}
              value={form.family_name1}
              onChange={(e) => onChange({ family_name1: e.target.value })}
            />
          </label>
          <label className={labelBase}>
            Famille 2
            <input
              className={fieldBase}
              value={form.family_name2}
              onChange={(e) => onChange({ family_name2: e.target.value })}
            />
          </label>
          <label className={labelBase}>
            Email famille
            <input
              className={fieldBase}
              type="email"
              value={form.family_email}
              onChange={(e) => onChange({ family_email: e.target.value })}
            />
          </label>
        </div>
      ) : null}

      <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
        Statut calculé:{" "}
        <span className="font-semibold">
          {deriveRecordKind(form.pre_registration, form.paid_total) === "ENROLLED"
            ? "Inscrit"
            : deriveRecordKind(form.pre_registration, form.paid_total) === "PRE_REGISTERED"
            ? "En cours"
            : "Lead"}
        </span>
      </div>
    </div>
  );
}

function ErrorList({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
      <ul className="list-disc pl-4">
        {errors.map((err) => (
          <li key={err}>{err}</li>
        ))}
      </ul>
    </div>
  );
}

export function StudentEditModal({
  student,
  form,
  errors,
  seasons,
  onChange,
  onClose,
  onSave,
  onDelete,
}: {
  student: StudentRow;
  form: EditFormState;
  errors: string[];
  seasons: SeasonRow[];
  onChange: (patch: FormPatch) => void;
  onClose: () => void;
  onSave: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
}) {
  return (
    <Modal onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className={sectionTitle}>Modifier</h2>
          <p className="text-lg text-slate-600">
            {student.first_name} {student.last_name}
          </p>
          <div />
        </div>

        <ErrorList errors={errors} />

        <StudentFormFields form={form} onChange={onChange} seasons={seasons} />

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <button
            className="btn-action btn-action--delete px-4 py-2"
            type="button"
            onClick={onDelete}
          >
            Supprimer
          </button>
          <button className="btn-primary" type="button" onClick={onSave}>
            Enregistrer
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function StudentCreateModal({
  form,
  errors,
  seasons,
  onChange,
  onClose,
  onSave,
}: {
  form: EditFormState;
  errors: string[];
  seasons: SeasonRow[];
  onChange: (patch: FormPatch) => void;
  onClose: () => void;
  onSave: () => void | Promise<void>;
}) {
  return (
    <Modal onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className={sectionTitle}>Créer un élève</h2>
            <p className="text-sm text-slate-600">Renseigne les informations.</p>
          </div>
          <button className={buttonSecondary} type="button" onClick={onClose}>
            Annuler
          </button>
        </div>

        <ErrorList errors={errors} />

        <StudentFormFields form={form} onChange={onChange} seasons={seasons} />

        <div className="flex justify-end pt-2">
          <button className="btn-primary" type="button" onClick={onSave}>
            Créer
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function ConfirmDeleteModal({
  student,
  onClose,
  onConfirm,
}: {
  student: StudentRow;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <Modal onClose={onClose}>
      <div className="space-y-4">
        <h2 className={sectionTitle}>Supprimer l&apos;élève</h2>
        <p className="text-sm text-slate-700">
          Confirmer la suppression de{" "}
          <span className="font-semibold">
            {student.first_name} {student.last_name}
          </span>
          .
        </p>
        <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
          <button className={buttonSecondary} type="button" onClick={onClose}>
            Annuler
          </button>
          <button className="btn-action btn-action--delete" type="button" onClick={onConfirm}>
            Supprimer
          </button>
        </div>
      </div>
    </Modal>
  );
}
