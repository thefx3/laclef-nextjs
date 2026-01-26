import { redirect } from "next/navigation";
import { fetchSeasonsServer } from "@/lib/seasons/seasonsRepo.server";
import {
  createSeasonAction,
  deleteSeasonAction,
  updateSeasonAction,
} from "@/lib/seasons/seasonActions.server";
import { getViewerServer } from "@/lib/auth/viewer.server";
import SeasonManagerTable from "@/components/flce/SeasonManagerTable";

export default async function SeasonManager() {
  const { user, role } = await getViewerServer();
  if (!user) redirect("/login");

  const seasons = await fetchSeasonsServer();
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  return (
    <SeasonManagerTable
      seasons={seasons}
      isAdmin={isAdmin}
      createAction={createSeasonAction}
      updateAction={updateSeasonAction}
      deleteAction={deleteSeasonAction}
    />
  );
}
