import SettingsShell from "@/components/settings/SettingsShell";
import SeasonManagerTable from "@/components/flce/SeasonManagerTable";
import { fetchSeasonsServer } from "@/lib/seasons/seasonsRepo.server";
import {
  createSeasonSettingsAction,
  deleteSeasonSettingsAction,
  updateSeasonSettingsAction,
} from "@/lib/seasons/seasonActions.server";

export default async function SettingsSeasonsPage() {
  const seasons = await fetchSeasonsServer();

  return (
    <SettingsShell title="Saisons">
      <SeasonManagerTable
        seasons={seasons}
        isAdmin
        createAction={createSeasonSettingsAction}
        updateAction={updateSeasonSettingsAction}
        deleteAction={deleteSeasonSettingsAction}
      />
    </SettingsShell>
  );
}
