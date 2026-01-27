import PageHeader from "@/components/layout/PageHeader";
import PageShell from "@/components/layout/PageShell";
import { redirect } from "next/navigation";
import { getViewerServer } from "@/lib/auth/viewer.server";
import { getSeasonStateServer } from "@/lib/seasons/getSeasonState.server";
import { fetchStudentStatsRows, buildStudentStats } from "@/lib/students/stats.server";
import {
  fetchClassOfferingsServer,
  fetchLevelsServer,
  fetchTeachersServer,
  fetchTimeSlotsServer,
} from "@/lib/flce/referenceRepo.server";
import { fetchRecentEnrolledStudentsServer } from "@/lib/flce/studentsRepo.server";
import FlceHomeOverview from "@/components/flce/home/FlceHomeOverview";

export default async function Flce() {
  const { user } = await getViewerServer();
  if (!user) redirect("/login");

  const seasonState = await getSeasonStateServer();
  const seasonId = seasonState.selectedId ?? null;

  const [rows, teachers, levels, timeSlots, classOfferings, recentEnrolled] = await Promise.all([
    fetchStudentStatsRows(seasonId),
    fetchTeachersServer(),
    fetchLevelsServer(),
    fetchTimeSlotsServer(),
    fetchClassOfferingsServer({ seasonId }),
    fetchRecentEnrolledStudentsServer({ seasonId, limit: 6 }),
  ]);

  const seasonStart = seasonState.selected?.start_date ?? null;
  const seasonEnd = seasonState.selected?.end_date ?? null;
  const seasonDurationDays =
    seasonStart && seasonEnd
      ? Math.max(
          0,
          Math.ceil(
            (new Date(seasonEnd).getTime() - new Date(seasonStart).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : null;

  const stats = buildStudentStats(rows, seasonDurationDays);

  return (
    <PageShell>
      <PageHeader title="FLCE" />
      <FlceHomeOverview
        stats={stats}
        teachers={teachers}
        levels={levels}
        timeSlots={timeSlots}
        classOfferings={classOfferings}
        recentEnrolled={recentEnrolled}
      />
    </PageShell>
  );
}
