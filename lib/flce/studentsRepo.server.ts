import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { StudentRow } from "@/lib/students/types";

export async function fetchStudentsServer(params?: { seasonId?: string | null }) {
  const supabase = await createClient();
  const seasonId = params?.seasonId ?? null;

  let query = supabase
    .from("students_with_classes")
    .select("*")
    .order("created_at", { ascending: false });

  if (seasonId) query = query.eq("season_id", seasonId);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []) as StudentRow[];
}

export async function fetchRecentEnrolledStudentsServer(params?: {
  seasonId?: string | null;
  limit?: number;
}) {
  const supabase = await createClient();
  const seasonId = params?.seasonId ?? null;
  const limit = params?.limit ?? 6;

  let query = supabase
    .from("students_with_classes")
    .select("id,first_name,last_name,created_at,class_s1_code,class_s2_code,record_kind")
    .eq("record_kind", "ENROLLED")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (seasonId) query = query.eq("season_id", seasonId);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []) as Pick<
    StudentRow,
    "id" | "first_name" | "last_name" | "created_at" | "class_s1_code" | "class_s2_code" | "record_kind"
  >[];
}
