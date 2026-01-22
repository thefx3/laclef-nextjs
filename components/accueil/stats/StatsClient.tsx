"use client";

import { useMemo } from "react";
import type { Post } from "@/lib/posts/types";
import { computeAccueilStats } from "@/lib/posts/stats";
import {
  AuthorBreakdown,
  Highlights,
  MonthlyPosts,
  StatsGrid,
  TypeBreakdown,
  WeeklyPosts,
} from "./StatsBlocks";
import { CalendarCheck2, CalendarClock, Layers } from "lucide-react";

export default function StatsClient({ initialPosts }: { initialPosts: Post[] }) {
  const stats = useMemo(() => computeAccueilStats(initialPosts), [initialPosts]);

  const kpiItems = [
    { label: "Total publications", value: stats.total, tone: "sky", icon: <Layers className="h-4 w-4" /> },
    {
      label: "Actifs aujourd'hui",
      value: stats.activeToday,
      tone: "emerald",
      icon: <CalendarCheck2 className="h-4 w-4" />,
    },
    { label: "Planifiés", value: stats.upcoming, tone: "amber", icon: <CalendarClock className="h-4 w-4" /> },
  ] as const;

  return (
    <div className="space-y-4">
      <StatsGrid items={kpiItems} />

      <section className="grid gap-3 grid-cols-1 lg:grid-cols-3">
        <TypeBreakdown
          typeCounts={stats.typeCounts}
          total={stats.total}
          topTypeByWeek={stats.topTypeByWeek}
        />
        <div className="grid gap-3">
          <WeeklyPosts weeks={stats.weeklyCounts} />
          <MonthlyPosts months={stats.monthlyCounts} />
        </div>
        <Highlights nextUpcoming={stats.nextUpcoming} />
      </section>

      <section className="grid gap-3">
        <AuthorBreakdown authors={stats.authorBreakdown} />
      </section>
    </div>
  );
}
