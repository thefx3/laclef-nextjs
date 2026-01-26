import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { SeasonRow } from "@/lib/seasons/types";

export type { SeasonRow } from "@/lib/seasons/types";

export const fetchSeasonsServer = cache(async (): Promise<SeasonRow[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("seasons")
    .select("id,code,start_date,end_date,is_current,created_at")
    .order("start_date", { ascending: false });

  if (error) throw error;

  return (data ?? []) as SeasonRow[];
});
