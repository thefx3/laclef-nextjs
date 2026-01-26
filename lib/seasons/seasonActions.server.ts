import "server-only";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getViewerServer } from "@/lib/auth/viewer.server";

type SeasonInput = {
  id?: string;
  code: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
};

const requireSeasonAdmin = async () => {
  const { user, role } = await getViewerServer();
  if (!user) redirect("/login");
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  if (!isAdmin) redirect("/unauthorized");
  return { user, role };
};

const readSeasonForm = (formData: FormData): SeasonInput => {
  const id = String(formData.get("id") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  const startDate = String(formData.get("start_date") ?? "").trim();
  const endDate = String(formData.get("end_date") ?? "").trim();
  const isCurrent = formData.get("is_current") === "on";

  if (!code || !startDate || !endDate) {
    throw new Error("Champs requis manquants.");
  }

  return {
    id: id || undefined,
    code,
    startDate,
    endDate,
    isCurrent,
  };
};

export async function createSeasonAction(formData: FormData) {
  "use server";
  await requireSeasonAdmin();
  const { code, startDate, endDate, isCurrent } = readSeasonForm(formData);

  if (isCurrent) {
    const { error } = await supabaseAdmin
      .from("seasons")
      .update({ is_current: false })
      .neq("is_current", false);
    if (error) throw new Error(error.message);
  }

  const { error } = await supabaseAdmin.from("seasons").insert({
    code,
    start_date: startDate,
    end_date: endDate,
    is_current: isCurrent,
  });

  if (error) throw new Error(error.message);

  redirect("/flce/organisation");
}

export async function updateSeasonAction(formData: FormData) {
  "use server";
  await requireSeasonAdmin();
  const { id, code, startDate, endDate, isCurrent } = readSeasonForm(formData);
  if (!id) throw new Error("Identifiant manquant.");

  if (isCurrent) {
    const { error } = await supabaseAdmin
      .from("seasons")
      .update({ is_current: false })
      .neq("id", id);
    if (error) throw new Error(error.message);
  }

  const { error } = await supabaseAdmin
    .from("seasons")
    .update({
      code,
      start_date: startDate,
      end_date: endDate,
      is_current: isCurrent,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  redirect("/flce/organisation");
}

export async function deleteSeasonAction(formData: FormData) {
  "use server";
  await requireSeasonAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Identifiant manquant.");

  const { error } = await supabaseAdmin.from("seasons").delete().eq("id", id);
  if (error) throw new Error(error.message);

  redirect("/flce/organisation");
}
