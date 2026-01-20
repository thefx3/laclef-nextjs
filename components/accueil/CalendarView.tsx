"use client";

import { useMemo, useState } from "react";
import type { Post } from "@/lib/posts/types";
import { getPostsForDay } from "@/lib/posts/getPostsForDay";

import {
  addDays,
  addMonths,
  endOfMonth,
  formatDayLabelFR,
  formatShortFR,
  isSameDay,
  sortByCreatedDesc,
  startOfDay,
  startOfMonth,
  startOfWeekMonday,
} from "@/lib/posts/calendarUtils";

import PostModal from "./PostModal";
import DayModal from "./DayModal";
import PostList from "./PostList";

type Mode = "day" | "3days" | "week" | "month";

const MODES = [
  { key: "day", label: "Aujourd'hui" },
  { key: "3days", label: "3 jours" },
  { key: "week", label: "1 semaine" },
  { key: "month", label: "1 mois" },
] as const;

export default function CalendarView({ posts }: { posts: Post[] }) {
  const [mode, setMode] = useState<Mode>("day");
  const [cursor, setCursor] = useState<Date>(() => startOfDay(new Date()));
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [expandedDay, setExpandedDay] = useState<Date | null>(null);

  const today = startOfDay(new Date());

  // on enlève A_LA_UNE du calendrier
  const calendarPosts = useMemo(
    () => (posts ?? []).filter((p) => p.type !== "A_LA_UNE"),
    [posts]
  );

  const { periodStart, periodEnd } = useMemo(() => {
    if (mode === "day") {
      const start = startOfDay(cursor);
      return { periodStart: start, periodEnd: start };
    }
    if (mode === "3days") {
      const start = startOfDay(cursor);
      return { periodStart: start, periodEnd: addDays(start, 2) };
    }
    if (mode === "week") {
      const start = startOfWeekMonday(cursor);
      return { periodStart: start, periodEnd: addDays(start, 6) };
    }
    const start = startOfMonth(cursor);
    return { periodStart: start, periodEnd: endOfMonth(cursor) };
  }, [mode, cursor]);

  const days = useMemo(() => {
    const result: Date[] = [];
    for (let d = periodStart; d <= periodEnd; d = addDays(d, 1)) {
      result.push(d);
    }
    return result;
  }, [periodStart, periodEnd]);

  function goPrev() {
    if (mode === "day") setCursor((c) => addDays(c, -1));
    else if (mode === "3days") setCursor((c) => addDays(c, -3));
    else if (mode === "week") setCursor((c) => addDays(c, -7));
    else setCursor((c) => addMonths(c, -1));
  }

  function goNext() {
    if (mode === "day") setCursor((c) => addDays(c, 1));
    else if (mode === "3days") setCursor((c) => addDays(c, 3));
    else if (mode === "week") setCursor((c) => addDays(c, 7));
    else setCursor((c) => addMonths(c, 1));
  }

  function setModeAndReset(newMode: Mode) {
    setMode(newMode);
    setCursor(startOfDay(new Date()));
    setExpandedDay(null);
  }

  const gridCols =
    mode === "day"
      ? "grid-cols-1"
      : mode === "3days"
      ? "grid-cols-1 sm:grid-cols-3"
      : mode === "week"
      ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-7"
      : "grid-cols-2 sm:grid-cols-4 lg:grid-cols-6";

  function formatLabelByMode(day: Date) {
    if (mode === "day" || mode === "3days") {
      const label = formatDayLabelFR(day);
      return label.charAt(0).toUpperCase() + label.slice(1);
    }
    if (mode === "week") {
      const label = day.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric" });
      return label.charAt(0).toUpperCase() + label.slice(1);
    }
    return day.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
  }

  function formatPeriodRecap() {
    if (mode === "month") {
      const label = periodStart.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
      return label.charAt(0).toUpperCase() + label.slice(1);
    }
    return `du ${formatShortFR(periodStart)} au ${formatShortFR(periodEnd)}`;
  }

  const modeLabel = MODES.find((m) => m.key === mode)?.label ?? mode;
  const isDayMode = mode === "day";

  const arrowBase =
    "h-10 w-10 pb-2 flex items-center justify-center shrink-0 rounded-lg text-4xl leading-none hover:scale-95 transition-colors cursor-pointer";

  return (
    <section className="w-full" suppressHydrationWarning>
      {/* Choix du mode */}
      <div className="flex flex-wrap gap-2 mb-4">
        {MODES.map((m) => (
          <button
            key={m.key}
            className={`btn-filter ${
              mode === m.key ? "btn-filter--active" : "btn-filter--inactive"
            }`}
            onClick={() => setModeAndReset(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Récap + flèches */}
      <div className="flex items-center justify-between gap-3 w-full">
        <button onClick={goPrev} className={arrowBase} aria-label="Période précédente">
          ←
        </button>

        <div className="text-sm font-semibold text-[var(--foreground)]">
          {modeLabel} : {formatPeriodRecap()}
        </div>

        <button onClick={goNext} className={arrowBase} aria-label="Période suivante">
          →
        </button>
      </div>

      {/* Grille */}
      <div className={`mt-4 grid ${gridCols}`}>
        {days.map((day) => {
          const dayPosts = sortByCreatedDesc(getPostsForDay(calendarPosts, day));
          const postsToShow = isDayMode ? dayPosts : dayPosts.slice(0, 3);
          const remaining = Math.max(0, dayPosts.length - postsToShow.length);

          return (
            <div
              key={day.toISOString()}
              className="border bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md"
            >
              <div
                className={`px-3 py-2 font-semibold cursor-pointer ${
                  isSameDay(day, today)
                    ? "bg-[var(--accent)] text-[var(--surface)]"
                    : "bg-[var(--primary)] text-[var(--surface)]"
                }`}
                onClick={() => {
                  setMode("day");
                  setCursor(startOfDay(day));
                  setExpandedDay(null);
                }}
              >
                {formatLabelByMode(day)}
              </div>

              <div className="p-2 text-sm text-gray-600">
                {dayPosts.length === 0 ? (
                  <div className="text-gray-400">Aucune publication</div>
                ) : (
                  <PostList
                    posts={postsToShow}
                    remaining={isDayMode ? 0 : remaining}
                    onSelectPost={setSelectedPost}
                    onShowMore={() => setExpandedDay(day)}
                    showMeta={isSameDay(day, today)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal : tous les posts d'un jour */}
      {expandedDay && (
        <DayModal
          day={expandedDay}
          posts={sortByCreatedDesc(getPostsForDay(calendarPosts, expandedDay))}
          onSelectPost={setSelectedPost}
          onClose={() => setExpandedDay(null)}
        />
      )}

      {/* Modal : détail post */}
      {selectedPost && (
        <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </section>
  );
}
