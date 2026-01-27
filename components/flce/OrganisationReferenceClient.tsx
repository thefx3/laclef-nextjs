"use client";

import { useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";
import { supabase } from "@/lib/supabase/browser";
import type { SeasonRow } from "@/lib/seasons/types";
import type {
  ClassOfferingRow,
  LevelRow,
  TeacherRow,
  TimeSlotRow,
} from "@/lib/flce/referenceTypes";

type Props = {
  seasons: SeasonRow[];
  teachers: TeacherRow[];
  levels: LevelRow[];
  timeSlots: TimeSlotRow[];
  classOfferings: ClassOfferingRow[];
  isAdmin: boolean;
};

const cardBase = "rounded-xl border border-slate-200/80 bg-white/90 p-4 shadow-sm";
const labelBase = "text-xs font-semibold text-slate-600";
const fieldBase =
  "mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900";
const buttonPrimary =
  "rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800";
const buttonSecondary =
  "rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:text-slate-900";
const buttonDanger =
  "rounded-md border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:text-rose-800";

const DAY_LABELS: Record<number, string> = {
  1: "Lun",
  2: "Mar",
  3: "Mer",
  4: "Jeu",
  5: "Ven",
};

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="text-md tracking-widest uppercase font-semibold text-slate-900">{title}</h3>
      {action}
    </div>
  );
}

export default function OrganisationReferenceClient({
  seasons,
  teachers: initialTeachers,
  levels: initialLevels,
  timeSlots: initialTimeSlots,
  classOfferings: initialClassOfferings,
  isAdmin,
}: Props) {
  const [teachers, setTeachers] = useState(initialTeachers);
  const [levels, setLevels] = useState(initialLevels);
  const [timeSlots, setTimeSlots] = useState(initialTimeSlots);
  const [classOfferings, setClassOfferings] = useState(initialClassOfferings);
  const [error, setError] = useState<string | null>(null);

  const teacherById = useMemo(
    () => new Map(teachers.map((teacher) => [teacher.id, teacher])),
    [teachers]
  );
  const levelById = useMemo(() => new Map(levels.map((level) => [level.id, level])), [levels]);
  const slotById = useMemo(() => new Map(timeSlots.map((slot) => [slot.id, slot])), [timeSlots]);
  const seasonById = useMemo(
    () => new Map(seasons.map((season) => [season.id, season])),
    [seasons]
  );

  async function handleInsert<T>(table: string, payload: T) {
    const { data, error: insertError } = await supabase
      .from(table)
      .insert(payload)
      .select()
      .single();
    if (insertError) throw insertError;
    return data;
  }

  async function handleUpdate<T>(table: string, id: string, payload: T) {
    const { data, error: updateError } = await supabase
      .from(table)
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (updateError) throw updateError;
    return data;
  }

  async function handleDelete(table: string, id: string) {
    const { error: deleteError } = await supabase.from(table).delete().eq("id", id);
    if (deleteError) throw deleteError;
  }

  function setErrorSafe(message: string | null) {
    setError(message);
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        {/* TEACHERS */}
      <div className={`${cardBase} order-1`}>
        <SectionHeader
          title="Professeurs"
          action={
            isAdmin ? (
              <TeacherModal
                onSave={async (payload, editing) => {
                  try {
                    setErrorSafe(null);
                    const saved = editing
                      ? await handleUpdate("teachers", editing.id, payload)
                      : await handleInsert("teachers", payload);
                    setTeachers((prev) =>
                      editing
                        ? prev.map((t) => (t.id === editing.id ? (saved as TeacherRow) : t))
                        : [saved as TeacherRow, ...prev]
                    );
                  } catch (e) {
                    setErrorSafe((e as Error).message);
                  }
                }}
              />
            ) : null
          }
        />

        {teachers.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Aucun professeur.</p>
        ) : (
          <table className="mt-3 w-full text-sm">
            <thead className="text-left text-xs text-slate-500">
              <tr>
                <th className="py-2">Code</th>
                <th className="py-2">Nom</th>
                <th className="py-2">Email</th>
                {isAdmin ? <th className="py-2 text-right">Actions</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y">
              {teachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td className="py-2 font-semibold text-slate-700">{teacher.code}</td>
                  <td className="py-2">{teacher.full_name}</td>
                  <td className="py-2">{teacher.email ?? "—"}</td>
                  {isAdmin ? (
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <TeacherModal
                          teacher={teacher}
                          onSave={async (payload, editing) => {
                            try {
                              setErrorSafe(null);
                              const saved = await handleUpdate(
                                "teachers",
                                editing!.id,
                                payload
                              );
                              setTeachers((prev) =>
                                prev.map((t) => (t.id === editing!.id ? (saved as TeacherRow) : t))
                              );
                            } catch (e) {
                              setErrorSafe((e as Error).message);
                            }
                          }}
                        />
                        <button
                          className={buttonDanger}
                          onClick={async () => {
                            try {
                              setErrorSafe(null);
                              await handleDelete("teachers", teacher.id);
                              setTeachers((prev) => prev.filter((t) => t.id !== teacher.id));
                            } catch (e) {
                              setErrorSafe((e as Error).message);
                            }
                          }}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* LEVELS */}
      <div className={`${cardBase} order-3`}>
        <SectionHeader
          title="Niveaux"
          action={
            isAdmin ? (
              <LevelModal
                onSave={async (payload, editing) => {
                  try {
                    setErrorSafe(null);
                    const saved = editing
                      ? await handleUpdate("levels", editing.id, payload)
                      : await handleInsert("levels", payload);
                    setLevels((prev) =>
                      editing
                        ? prev.map((level) =>
                            level.id === editing.id ? (saved as LevelRow) : level
                          )
                        : [saved as LevelRow, ...prev]
                    );
                  } catch (e) {
                    setErrorSafe((e as Error).message);
                  }
                }}
              />
            ) : null
          }
        />

        {levels.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Aucun niveau.</p>
        ) : (
          <table className="mt-3 w-full text-sm">
            <thead className="text-left text-xs text-slate-500">
              <tr>
                <th className="py-2">Code</th>
                <th className="py-2">Label</th>
                <th className="py-2">Actif</th>
                {isAdmin ? <th className="py-2 text-right">Actions</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y">
              {levels.map((level) => (
                <tr key={level.id}>
                  <td className="py-2 font-semibold text-slate-700">{level.code}</td>
                  <td className="py-2">{level.label ?? "—"}</td>
                  <td className="py-2">{level.is_active ? "Oui" : "Non"}</td>
                  {isAdmin ? (
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <LevelModal
                          level={level}
                          onSave={async (payload, editing) => {
                            try {
                              setErrorSafe(null);
                              const saved = await handleUpdate(
                                "levels",
                                editing!.id,
                                payload
                              );
                              setLevels((prev) =>
                                prev.map((l) => (l.id === editing!.id ? (saved as LevelRow) : l))
                              );
                            } catch (e) {
                              setErrorSafe((e as Error).message);
                            }
                          }}
                        />
                        <button
                          className={buttonDanger}
                          onClick={async () => {
                            try {
                              setErrorSafe(null);
                              await handleDelete("levels", level.id);
                              setLevels((prev) => prev.filter((l) => l.id !== level.id));
                            } catch (e) {
                              setErrorSafe((e as Error).message);
                            }
                          }}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* TIMESLOTS */}
      <div className={`${cardBase} order-2`}>
        <SectionHeader
          title="Horaires"
          action={
            isAdmin ? (
              <TimeSlotModal
                onSave={async (payload, editing) => {
                  try {
                    setErrorSafe(null);
                    const saved = editing
                      ? await handleUpdate("time_slots", editing.id, payload)
                      : await handleInsert("time_slots", payload);
                    setTimeSlots((prev) =>
                      editing
                        ? prev.map((slot) =>
                            slot.id === editing.id ? (saved as TimeSlotRow) : slot
                          )
                        : [saved as TimeSlotRow, ...prev]
                    );
                  } catch (e) {
                    setErrorSafe((e as Error).message);
                  }
                }}
              />
            ) : null
          }
        />

        {timeSlots.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Aucun horaire.</p>
        ) : (
          <table className="mt-3 w-full text-sm">
            <thead className="text-left text-xs text-slate-500">
              <tr>
                <th className="py-2">Label</th>
                <th className="py-2">Début</th>
                <th className="py-2">Fin</th>
                {isAdmin ? <th className="py-2 text-right">Actions</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y">
              {timeSlots.map((slot) => (
                <tr key={slot.id}>
                  <td className="py-2 font-semibold text-slate-700">{slot.label}</td>
                  <td className="py-2">{slot.start_time ?? "—"}</td>
                  <td className="py-2">{slot.end_time ?? "—"}</td>
                  {isAdmin ? (
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <TimeSlotModal
                          slot={slot}
                          onSave={async (payload, editing) => {
                            try {
                              setErrorSafe(null);
                              const saved = await handleUpdate(
                                "time_slots",
                                editing!.id,
                                payload
                              );
                              setTimeSlots((prev) =>
                                prev.map((t) => (t.id === editing!.id ? (saved as TimeSlotRow) : t))
                              );
                            } catch (e) {
                              setErrorSafe((e as Error).message);
                            }
                          }}
                        />
                        <button
                          className={buttonDanger}
                          onClick={async () => {
                            try {
                              setErrorSafe(null);
                              await handleDelete("time_slots", slot.id);
                              setTimeSlots((prev) => prev.filter((t) => t.id !== slot.id));
                            } catch (e) {
                              setErrorSafe((e as Error).message);
                            }
                          }}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CLASSES */}
      <div className={`${cardBase} order-4`}>
        <SectionHeader
          title="Classes (offres)"
          action={
            isAdmin ? (
              <ClassOfferingModal
                seasons={seasons}
                teachers={teachers}
                levels={levels}
                timeSlots={timeSlots}
                onSave={async (payload, editing) => {
                  try {
                    setErrorSafe(null);
                    const saved = editing
                      ? await handleUpdate("class_offerings", editing.id, payload)
                      : await handleInsert("class_offerings", payload);
                    setClassOfferings((prev) =>
                      editing
                        ? prev.map((item) =>
                            item.id === editing.id ? (saved as ClassOfferingRow) : item
                          )
                        : [saved as ClassOfferingRow, ...prev]
                    );
                  } catch (e) {
                    setErrorSafe((e as Error).message);
                  }
                }}
              />
            ) : null
          }
        />

        {classOfferings.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Aucune classe.</p>
        ) : (
          <table className="mt-3 w-full text-sm">
            <thead className="text-left text-xs text-slate-500">
              <tr>
                <th className="py-2">Code</th>
                <th className="py-2">Saison</th>
                <th className="py-2">Sem</th>
                <th className="py-2">Niveau</th>
                <th className="py-2">Prof</th>
                <th className="py-2">Horaire</th>
                <th className="py-2">Actif</th>
                {isAdmin ? <th className="py-2 text-right">Actions</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y">
              {classOfferings.map((offering) => (
                <tr key={offering.id}>
                  <td className="py-2 font-semibold text-slate-700">{offering.code ?? "—"}</td>
                  <td className="py-2">{seasonById.get(offering.season_id)?.code ?? "—"}</td>
                  <td className="py-2">{offering.semester}</td>
                  <td className="py-2">
                    {offering.level_id ? levelById.get(offering.level_id)?.code ?? "—" : "—"}
                  </td>
                  <td className="py-2">
                    {offering.teacher_id
                      ? teacherById.get(offering.teacher_id)?.code ?? "—"
                      : "—"}
                  </td>
                  <td className="py-2">
                    {offering.time_slot_id
                      ? slotById.get(offering.time_slot_id)?.label ?? "—"
                      : "—"}
                  </td>
                  <td className="py-2">{offering.is_active ? "Oui" : "Non"}</td>
                  {isAdmin ? (
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <ClassOfferingModal
                          offering={offering}
                          seasons={seasons}
                          teachers={teachers}
                          levels={levels}
                          timeSlots={timeSlots}
                          onSave={async (payload, editing) => {
                            try {
                              setErrorSafe(null);
                              const saved = await handleUpdate(
                                "class_offerings",
                                editing!.id,
                                payload
                              );
                              setClassOfferings((prev) =>
                                prev.map((item) =>
                                  item.id === editing!.id ? (saved as ClassOfferingRow) : item
                                )
                              );
                            } catch (e) {
                              setErrorSafe((e as Error).message);
                            }
                          }}
                        />
                        <button
                          className={buttonDanger}
                          onClick={async () => {
                            try {
                              setErrorSafe(null);
                              await handleDelete("class_offerings", offering.id);
                              setClassOfferings((prev) =>
                                prev.filter((item) => item.id !== offering.id)
                              );
                            } catch (e) {
                              setErrorSafe((e as Error).message);
                            }
                          }}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      </div>
    </div>
  );
}

function TeacherModal({
  teacher,
  onSave,
}: {
  teacher?: TeacherRow;
  onSave: (
    payload: { code: string; full_name: string; email: string | null },
    editing?: TeacherRow
  ) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const actionClass = teacher ? buttonSecondary : buttonPrimary;
  const [form, setForm] = useState({
    code: teacher?.code ?? "",
    full_name: teacher?.full_name ?? "",
    email: teacher?.email ?? "",
  });

  function close() {
    setOpen(false);
  }

  return (
    <>
      <button
        className={actionClass}
        onClick={() => {
          setForm({
            code: teacher?.code ?? "",
            full_name: teacher?.full_name ?? "",
            email: teacher?.email ?? "",
          });
          setOpen(true);
        }}
      >
        {teacher ? "Modifier" : "Ajouter"}
      </button>

      {open ? (
        <Modal onClose={close}>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">
              {teacher ? "Modifier professeur" : "Ajouter un professeur"}
            </h3>
            <div className="grid gap-3">
              <label className={labelBase}>
                Code
                <input
                  className={fieldBase}
                  value={form.code}
                  onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
                />
              </label>
              <label className={labelBase}>
                Nom
                <input
                  className={fieldBase}
                  value={form.full_name}
                  onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
                />
              </label>
              <label className={labelBase}>
                Email
                <input
                  className={fieldBase}
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button className="btn-action btn-action--delete" onClick={close}>
                Annuler
              </button>
              <button
                className="btn-primary"
                onClick={async () => {
                  await onSave(
                    {
                      code: form.code.trim(),
                      full_name: form.full_name.trim(),
                      email: form.email.trim() || null,
                    },
                    teacher
                  );
                  close();
                }}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

function LevelModal({
  level,
  onSave,
}: {
  level?: LevelRow;
  onSave: (
    payload: { code: string; label: string | null; is_active: boolean },
    editing?: LevelRow
  ) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const actionClass = level ? buttonSecondary : buttonPrimary;
  const [form, setForm] = useState({
    code: level?.code ?? "",
    label: level?.label ?? "",
    is_active: level?.is_active ?? true,
  });

  function close() {
    setOpen(false);
  }

  return (
    <>
      <button
        className={actionClass}
        onClick={() => {
          setForm({
            code: level?.code ?? "",
            label: level?.label ?? "",
            is_active: level?.is_active ?? true,
          });
          setOpen(true);
        }}
      >
        {level ? "Modifier" : "Ajouter"}
      </button>

      {open ? (
        <Modal onClose={close}>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">
              {level ? "Modifier niveau" : "Ajouter un niveau"}
            </h3>
            <div className="grid gap-3">
              <label className={labelBase}>
                Code
                <input
                  className={fieldBase}
                  value={form.code}
                  onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
                />
              </label>
              <label className={labelBase}>
                Label
                <input
                  className={fieldBase}
                  value={form.label}
                  onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                />
                Actif
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button className="btn-action btn-action--delete" onClick={close}>
                Annuler
              </button>
              <button
                className="btn-primary"
                onClick={async () => {
                  await onSave(
                    {
                      code: form.code.trim(),
                      label: form.label.trim() || null,
                      is_active: form.is_active,
                    },
                    level
                  );
                  close();
                }}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

function TimeSlotModal({
  slot,
  onSave,
}: {
  slot?: TimeSlotRow;
  onSave: (
    payload: { label: string; start_time: string | null; end_time: string | null },
    editing?: TimeSlotRow
  ) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const actionClass = slot ? buttonSecondary : buttonPrimary;
  const [form, setForm] = useState({
    label: slot?.label ?? "",
    start_time: slot?.start_time ?? "",
    end_time: slot?.end_time ?? "",
  });

  function close() {
    setOpen(false);
  }

  return (
    <>
      <button
        className={actionClass}
        onClick={() => {
          setForm({
            label: slot?.label ?? "",
            start_time: slot?.start_time ?? "",
            end_time: slot?.end_time ?? "",
          });
          setOpen(true);
        }}
      >
        {slot ? "Modifier" : "Ajouter"}
      </button>

      {open ? (
        <Modal onClose={close}>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">
              {slot ? "Modifier horaire" : "Ajouter un horaire"}
            </h3>
            <div className="grid gap-3">
              <label className={labelBase}>
                Label
                <input
                  className={fieldBase}
                  value={form.label}
                  onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
                />
              </label>
              <label className={labelBase}>
                Début
                <input
                  className={fieldBase}
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm((prev) => ({ ...prev, start_time: e.target.value }))}
                />
              </label>
              <label className={labelBase}>
                Fin
                <input
                  className={fieldBase}
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm((prev) => ({ ...prev, end_time: e.target.value }))}
                />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button className="btn-action btn-action--delete" onClick={close}>
                Annuler
              </button>
              <button
                className="btn-primary"
                onClick={async () => {
                  await onSave(
                    {
                      label: form.label.trim(),
                      start_time: form.start_time || null,
                      end_time: form.end_time || null,
                    },
                    slot
                  );
                  close();
                }}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

function ClassOfferingModal({
  offering,
  seasons,
  teachers,
  levels,
  timeSlots,
  onSave,
}: {
  offering?: ClassOfferingRow;
  seasons: SeasonRow[];
  teachers: TeacherRow[];
  levels: LevelRow[];
  timeSlots: TimeSlotRow[];
  onSave: (
    payload: {
      season_id: string;
      semester: number;
      day_of_week: number | null;
      teacher_id: string | null;
      level_id: string | null;
      time_slot_id: string | null;
      code: string | null;
      is_active: boolean;
    },
    editing?: ClassOfferingRow
  ) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const actionClass = offering ? buttonSecondary : buttonPrimary;
  const defaultSeasonId =
    seasons.find((season) => season.is_current)?.id ?? seasons[0]?.id ?? "";
  const [form, setForm] = useState({
    season_id: offering?.season_id ?? defaultSeasonId,
    semester: offering?.semester ?? 1,
    day_of_week: offering?.day_of_week ?? null,
    teacher_id: offering?.teacher_id ?? "",
    level_id: offering?.level_id ?? "",
    time_slot_id: offering?.time_slot_id ?? "",
    is_active: offering?.is_active ?? true,
  });

  const computedCode = useMemo(() => {
    const level = levels.find((item) => item.id === form.level_id);
    const teacher = teachers.find((item) => item.id === form.teacher_id);
    const slot = timeSlots.find((item) => item.id === form.time_slot_id);

    const levelPart = level?.code ?? "";
    const slotPart = slot?.label ?? "";
    const teacherPart = teacher?.code ?? "";

    if (!levelPart && !slotPart && !teacherPart) return "";

    let base = levelPart || slotPart || teacherPart;
    if (levelPart && slotPart) base = `${levelPart} - ${slotPart}`;
    if (!levelPart && slotPart) base = slotPart;
    if (teacherPart) base = `${base} ${teacherPart}`.trim();
    return base.trim();
  }, [form.level_id, form.teacher_id, form.time_slot_id, levels, teachers, timeSlots]);

  function close() {
    setOpen(false);
  }

  return (
    <>
      <button
        className={actionClass}
        onClick={() => {
          setForm({
            season_id: offering?.season_id ?? defaultSeasonId,
            semester: offering?.semester ?? 1,
            day_of_week: offering?.day_of_week ?? null,
            teacher_id: offering?.teacher_id ?? "",
            level_id: offering?.level_id ?? "",
            time_slot_id: offering?.time_slot_id ?? "",
            is_active: offering?.is_active ?? true,
          });
          setOpen(true);
        }}
      >
        {offering ? "Modifier" : "Ajouter"}
      </button>

      {open ? (
        <Modal onClose={close}>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">
              {offering ? "Modifier la classe" : "Ajouter une classe"}
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <label className={labelBase}>
                Saison
                <select
                  className={fieldBase}
                  value={form.season_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, season_id: e.target.value }))}
                >
                  {seasons.map((season) => (
                    <option key={season.id} value={season.id}>
                      {season.code}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelBase}>
                Semestre
                <select
                  className={fieldBase}
                  value={String(form.semester)}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, semester: Number(e.target.value) }))
                  }
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                </select>
              </label>
              <label className={labelBase}>
                Niveau
                <select
                  className={fieldBase}
                  value={form.level_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, level_id: e.target.value }))}
                >
                  <option value="">—</option>
                  {levels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.code}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelBase}>
                Professeur
                <select
                  className={fieldBase}
                  value={form.teacher_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, teacher_id: e.target.value }))}
                >
                  <option value="">—</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.code} {teacher.full_name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelBase}>
                Horaire
                <select
                  className={fieldBase}
                  value={form.time_slot_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, time_slot_id: e.target.value }))}
                >
                  <option value="">—</option>
                  {timeSlots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelBase}>
                Code
                <input
                  className={fieldBase}
                  value={computedCode}
                  readOnly
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                />
                Actif
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button className="btn-action btn-action--delete" onClick={close}>
                Annuler
              </button>
              <button
                className="btn-primary"
                onClick={async () => {
                  await onSave(
                    {
                      season_id: form.season_id,
                      semester: form.semester,
                      day_of_week: form.day_of_week,
                      teacher_id: form.teacher_id || null,
                      level_id: form.level_id || null,
                      time_slot_id: form.time_slot_id || null,
                      code: computedCode || null,
                      is_active: form.is_active,
                    },
                    offering
                  );
                  close();
                }}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
