import { TYPE_OPTIONS, type Post, type PostType } from "@/lib/posts/types";
import {
  addDays,
  formatShortFR,
  startOfDay,
  startOfWeekMonday,
} from "@/lib/posts/calendarUtils";

function getRange(post: Post) {
  const start = startOfDay(post.startAt);
  const end = startOfDay(post.endAt ?? post.startAt);
  return { start, end };
}

function overlaps(start: Date, end: Date, winStart: Date, winEnd: Date) {
  return start <= winEnd && end >= winStart;
}

function getISOWeekNumber(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function computeAccueilStats(posts: Post[]) {
  const today = startOfDay(new Date());
  const weekStart = startOfWeekMonday(today);
  const weekEnd = addDays(weekStart, 6);
  const sevenDaysAgo = startOfDay(addDays(today, -7));
  const currentYear = today.getFullYear();
  const weeksToShow = 8;
  const weekStarts = Array.from({ length: weeksToShow }, (_, i) =>
    addDays(weekStart, -7 * (weeksToShow - 1 - i))
  );

  let activeToday = 0;
  let upcoming = 0;
  let past = 0;
  let thisWeek = 0;
  let last7Days = 0;

  const typeCounts = TYPE_OPTIONS.reduce((acc, t) => {
    acc[t] = 0;
    return acc;
  }, {} as Record<PostType, number>);

  const authorCounts = new Map<string, number>();
  const upcomingPosts: Post[] = [];

  const monthlyCounts = Array.from({ length: 12 }, (_, i) => ({
    monthIndex: i,
    label: new Date(currentYear, i, 1).toLocaleDateString("fr-FR", { month: "short" }),
    count: 0,
  }));

  const weeklyCounts = weekStarts.map((start) => ({
    weekStart: start,
    label: `S${String(getISOWeekNumber(start)).padStart(2, "0")}`,
    count: 0,
  }));
  const weeklyIndex = new Map(
    weeklyCounts.map((item, idx) => [item.weekStart.toISOString(), idx])
  );
  const weeklyTypeCounts = new Map(
    weekStarts.map((start) => [
      start.toISOString(),
      TYPE_OPTIONS.reduce((acc, type) => {
        acc[type] = 0;
        return acc;
      }, {} as Record<PostType, number>),
    ])
  );

  for (const post of posts) {
    const { start, end } = getRange(post);
    const created = startOfDay(post.created_at); // <= chez toi: created_at

    if (overlaps(start, end, today, today)) activeToday += 1;
    if (start > today) upcoming += 1;
    if (end < today) past += 1;
    if (overlaps(start, end, weekStart, weekEnd)) thisWeek += 1;
    if (created >= sevenDaysAgo) last7Days += 1;

    typeCounts[post.type] = (typeCounts[post.type] ?? 0) + 1;

    const author = post.authorName || "Inconnu";
    authorCounts.set(author, (authorCounts.get(author) ?? 0) + 1);

    if (created.getFullYear() === currentYear) {
      monthlyCounts[created.getMonth()].count += 1;
    }

    const createdWeekStart = startOfWeekMonday(created);
    const weekIdx = weeklyIndex.get(createdWeekStart.toISOString());
    if (weekIdx !== undefined) {
      weeklyCounts[weekIdx].count += 1;
      const weekTypes = weeklyTypeCounts.get(createdWeekStart.toISOString());
      if (weekTypes) {
        weekTypes[post.type] = (weekTypes[post.type] ?? 0) + 1;
      }
    }

    if (start >= today) upcomingPosts.push(post);
  }

  const nextUpcoming = upcomingPosts
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
    .slice(0, 3)
    .map((p) => ({
      title: (p.content ?? "").slice(0, 60) || "Sans contenu",
      date: formatShortFR(p.startAt),
      type: p.type,
    }));

  const authorBreakdown = Array.from(authorCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const topTypeByWeek = weekStarts.map((start, idx) => {
    const counts = weeklyTypeCounts.get(start.toISOString());
    let topType: PostType | null = null;
    let topCount = 0;
    for (const type of TYPE_OPTIONS) {
      const count = counts?.[type] ?? 0;
      if (count > topCount) {
        topCount = count;
        topType = type;
      }
    }
    return {
      label: weeklyCounts[idx].label,
      type: topType,
      count: topCount,
    };
  });

  return {
    total: posts.length,
    activeToday,
    upcoming,
    past,
    thisWeek,
    last7Days,
    typeCounts,
    monthlyCounts,
    weeklyCounts,
    topTypeByWeek,
    authorBreakdown,
    nextUpcoming,
  };
}
