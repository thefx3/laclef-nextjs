import "server-only";

import { cookies } from "next/headers";
import { fetchSeasonsServer } from "./seasonsRepo.server";
import type { SeasonRow } from "./types";

const COOKIE_NAME = "flce_season_id";

export type SeasonState = {
  seasons: SeasonRow[];
  selected: SeasonRow | null;
  selectedId: string | null;
};

export async function getSeasonStateServer(params?: {
  searchSeasonId?: string | null;
}): Promise<SeasonState> {
  const seasons = await fetchSeasonsServer();

  const cookieStore = await cookies();
  const cookieSeasonId = cookieStore.get(COOKIE_NAME)?.value ?? null;
  const urlSeasonId = params?.searchSeasonId ?? null;

  const selectedId = urlSeasonId || cookieSeasonId;

  let selected =
    (selectedId && seasons.find((s) => s.id === selectedId)) ||
    seasons.find((s) => s.is_current) ||
    seasons[0] ||
    null;

  return {
    seasons,
    selected,
    selectedId: selected?.id ?? null,
  };
}

export { COOKIE_NAME };
