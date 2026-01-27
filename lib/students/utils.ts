import type { EditFormState, StudentRow } from "./types";

export const EMPTY_FORM: EditFormState = {
  first_name: "",
  last_name: "",
  note: "",
  gender: "",
  arrival_date: "",
  departure_date: "",
  birth_date: "",
  birth_place: "",
  is_au_pair: false,
  left_early: false,
  season_id: "",
  class_offering_s1_id: "",
  class_offering_s2_id: "",
  pre_registration: false,
  paid_150: false,
  paid_total: false,
  dossier_number: "",
  family_name1: "",
  family_name2: "",
  family_email: "",
};

export function toInputDate(value: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

export function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR");
}

export function formatYesNo(value: boolean | null) {
  if (value === null) return "—";
  return value ? "Oui" : "Non";
}

export function formatGender(value: "M" | "F" | "X" | null) {
  if (!value) return "—";
  if (value === "M") return "Mr.";
  if (value === "F") return "Mrs.";
  return "X";
}

export function getAge(value: string | null) {
  if (!value) return null;
  const birth = new Date(value);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

export function formatAge(value: string | null) {
  const age = getAge(value);
  return age === null ? "—" : String(age);
}

export function deriveRecordKind(preRegistration: boolean, paidTotal: boolean) {
  if (paidTotal) return "ENROLLED";
  if (preRegistration) return "PRE_REGISTERED";
  return "LEAD";
}

export function buildEditForm(student: StudentRow | null): EditFormState {
  if (!student) return { ...EMPTY_FORM };
  const auPairDetails = student.au_pair_details;
  const auPair = Array.isArray(auPairDetails) ? auPairDetails[0] : auPairDetails ?? null;

  return {
    first_name: student.first_name ?? "",
    last_name: student.last_name ?? "",
    note: student.note ?? "",
    gender: student.gender ?? "",
    arrival_date: toInputDate(student.arrival_date),
    departure_date: toInputDate(student.departure_date),
    birth_date: toInputDate(student.birth_date),
    birth_place: student.birth_place ?? "",
    is_au_pair: Boolean(student.is_au_pair),
    left_early: Boolean(student.left_early),
    season_id: student.season_id ?? "",
    class_offering_s1_id: student.class_s1_id ?? "",
    class_offering_s2_id: student.class_s2_id ?? "",
    pre_registration: Boolean(student.pre_registration),
    paid_150: student.paid_150 === true,
    paid_total: Boolean(student.paid_total),
    dossier_number: student.dossier_number ?? "",
    family_name1: auPair?.family_name1 ?? "",
    family_name2: auPair?.family_name2 ?? "",
    family_email: auPair?.family_email ?? "",
  };
}

export function validateEditForm(form: EditFormState) {
  const errors: string[] = [];
  const recordKind = deriveRecordKind(form.pre_registration, form.paid_total);

  if (recordKind !== "LEAD" && form.dossier_number.trim().length === 0) {
    errors.push("Le numéro de dossier est requis pour les pré-inscrits et inscrits.");
  }
  if (!form.pre_registration && form.paid_150) {
    errors.push("150€ ne peut être Oui si la pré-inscription est Non.");
  }
  if (form.pre_registration && form.paid_total && !form.paid_150) {
    errors.push("Si paiement total + pré-inscription, alors 150€ doit être Oui.");
  }
  if (form.pre_registration && !form.paid_150 && !form.paid_total) {
    errors.push("Si pré-inscription = Oui, alors 150€ doit être Oui (sauf si paiement total).");
  }
  return errors;
}

export function hasDepartureBeforeArrival(arrival: string, departure: string) {
  if (!arrival || !departure) return false;
  return new Date(departure).getTime() < new Date(arrival).getTime();
}
